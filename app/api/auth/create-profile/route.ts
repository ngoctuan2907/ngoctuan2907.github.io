import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

export async function POST(request: NextRequest) {
  console.log("🔄 [VERCEL LOG] Create profile API called")
  
  try {
    const supabase = createServerClientForApi()
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error("❌ [VERCEL LOG] Not authenticated:", authError)
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    console.log("✅ [VERCEL LOG] User authenticated:", user.id)

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (existingProfile) {
      console.log("ℹ️  [VERCEL LOG] Profile already exists")
      return NextResponse.json({ 
        message: "Profile already exists",
        profile: existingProfile 
      })
    }

    // Create profile from user metadata
    const userMetadata = user.user_metadata || {}
    const appMetadata = user.app_metadata || {}

    const profileData = {
      user_id: user.id,
      first_name: userMetadata.first_name || appMetadata.first_name || 'Unknown',
      last_name: userMetadata.last_name || appMetadata.last_name || 'User',
      user_type: userMetadata.user_type || appMetadata.user_type || 'customer',
      phone: userMetadata.phone || appMetadata.phone || null,
      intended_business_name: userMetadata.intended_business_name || appMetadata.intended_business_name || null
    }

    console.log("📝 [VERCEL LOG] Creating profile with data:", profileData)

    const { data: newProfile, error: createError } = await supabase
      .from("user_profiles")
      .insert(profileData)
      .select()
      .single()

    if (createError) {
      console.error("❌ [VERCEL LOG] Profile creation failed:", {
        message: createError.message || 'No message',
        code: createError.code || 'No code',
        details: createError.details || 'No details',
        hint: createError.hint || 'No hint'
      })
      
      return NextResponse.json(
        { 
          error: "Failed to create profile",
          details: createError.message || 'Unknown error'
        },
        { status: 500 }
      )
    }

    console.log("✅ [VERCEL LOG] Profile created successfully:", newProfile)
    
    return NextResponse.json({ 
      message: "Profile created successfully",
      profile: newProfile 
    })

  } catch (error: any) {
    console.error("💥 [VERCEL LOG] Create profile error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
