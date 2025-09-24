import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }
    
    // Use the safe database function to check user existence
    const supabase = createServerClientForApi()
    const { data, error } = await supabase.rpc('check_user_exists', {
      email_to_check: email
    })
    
    if (error) {
      console.error("Error checking email:", error)
      // If there's an error, allow signup to proceed
      return NextResponse.json({ 
        exists: false,
        userType: null
      })
    }
    
    return NextResponse.json({ 
      exists: data?.exists || false,
      userType: data?.user_type || null
    })
  } catch (error: any) {
    console.error("Check email error:", error)
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    )
  }
}
