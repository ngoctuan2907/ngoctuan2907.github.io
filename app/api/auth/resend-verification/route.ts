import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabaseClient"  // 🟢 Use the new SSR client

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }
    
    // Create supabase client for this request
    const supabase = createClient()
    
    await supabase.auth.resend({
      type: 'signup',
      email,
    })
    
    return NextResponse.json({ 
      message: "Verification email sent successfully" 
    })
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to resend verification email" },
      { status: 500 }
    )
  }
}
