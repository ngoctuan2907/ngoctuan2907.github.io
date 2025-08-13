import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }
    
    // Resend verification email with server client
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
