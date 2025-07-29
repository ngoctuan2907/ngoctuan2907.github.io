import { type NextRequest, NextResponse } from "next/server"
import { resendEmailConfirmation } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }
    
    await resendEmailConfirmation(email)
    
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
