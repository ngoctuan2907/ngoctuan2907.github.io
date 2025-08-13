import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { checkEmailExists } from "@/lib/database"
import { signUpSchema } from "@/lib/auth-schemas"

export async function POST(request: NextRequest) {
  console.log("🚀 [VERCEL LOG] Signup API called at:", new Date().toISOString())
  
  try {
    const supabase = createServerClientForApi()
    const body = await request.json()
    console.log("📥 [VERCEL LOG] Request body received:", {
      email: body.email,
      userType: body.userType,
      firstName: body.firstName,
      lastName: body.lastName,
      hasPassword: !!body.password
    })
    
    // Validate input
    const validatedData = signUpSchema.parse(body)
    console.log("✅ [VERCEL LOG] Data validation successful")
    
    // Check if email already exists (temporarily disabled to avoid conflicts)
    // const existingUser = await checkEmailExists(supabase, validatedData.email)
    // if (existingUser) {
    //   return NextResponse.json(
    //     { 
    //       error: "An account with this email already exists",
    //       userType: existingUser.user_type 
    //     }, 
    //     { status: 409 }
    //   )
    // }

    console.log("🔄 [VERCEL LOG] Calling signUp function...")
    
    // 🚨 DEBUG: Log which keys are being used
    console.log("🔍 [VERCEL LOG] Environment check:", {
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      effectiveRedirectUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    })
    
    // � Use production URL for email verification redirects
    const emailRedirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    
    console.log("📧 [VERCEL LOG] Email redirect URL:", emailRedirectTo)
    
    // Create user account with server client - now creating profile server-side
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo,
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          user_type: validatedData.userType,
          phone: validatedData.phone,
          intended_business_name: validatedData.intendedBusinessName,
        }
      }
    })

    if (error) {
      console.error("❌ [VERCEL LOG] Supabase signup error:", {
        message: error.message,
        status: error.status,
        name: error.name
      })
      throw error
    }

    console.log("✅ [VERCEL LOG] Supabase auth signup successful:", {
      userId: data.user?.id,
      userEmail: data.user?.email,
      emailConfirmed: data.user?.email_confirmed_at,
      sessionExists: !!data.session
    })

    // Create user profile server-side after successful signup
    if (data.user) {
      console.log("👤 [VERCEL LOG] Creating user profile for user:", data.user.id)
      
      const profileData = {
        user_id: data.user.id,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        user_type: validatedData.userType,
        phone: validatedData.phone ?? null,
        intended_business_name: validatedData.intendedBusinessName || null,
      }
      
      console.log("📝 [VERCEL LOG] Profile data to insert:", profileData)
      
      const { data: insertedProfile, error: profileError } = await supabase
        .from("user_profiles")
        .insert(profileData)
        .select()

      if (profileError) {
        console.error("❌ [VERCEL LOG] Error creating user profile:", {
          message: profileError.message || 'No message',
          code: profileError.code || 'No code',
          details: profileError.details || 'No details',
          hint: profileError.hint || 'No hint',
          originalError: JSON.stringify(profileError, null, 2)
        })
        // Don't throw here - user is created, profile creation can be retried
      } else {
        console.log("✅ [VERCEL LOG] User profile created successfully:", insertedProfile)
      }
    }

    const result = data

    console.log("✅ [VERCEL LOG] SignUp function completed:", {
      userId: result.user?.id,
      email: result.user?.email,
      emailConfirmed: result.user?.email_confirmed_at,
      needsVerification: !result.user?.email_confirmed_at
    })

    // Check if user needs email verification
    if (result.user && !result.user.email_confirmed_at) {
      console.log("📧 [VERCEL LOG] Email verification required - sending response")
      return NextResponse.json({ 
        message: "Account created successfully! Please check your email and click the verification link before signing in.",
        user: result.user,
        needsVerification: true
      })
    }

    console.log("✅ [VERCEL LOG] Account created and verified - sending success response")
    return NextResponse.json({ 
      message: "Account created successfully. You can now sign in.",
      user: result.user,
      needsVerification: false
    })
  } catch (error: any) {
    // 🟢 Enhanced error logging as requested
    console.error("❌ [VERCEL LOG] Sign up error:", JSON.stringify({
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500), // Truncate stack for readability
      timestamp: new Date().toISOString()
    }, null, 2))
    
    if (error.name === "ZodError") {
      console.error("📝 [VERCEL LOG] Validation error details:", error.errors)
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }

    // Handle Supabase auth errors
    if (error.message?.includes("already registered")) {
      console.log("⚠️  [VERCEL LOG] User already registered")
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      )
    }
    
    console.error("💥 [VERCEL LOG] Unhandled signup error - returning 500")
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    )
  }
}
