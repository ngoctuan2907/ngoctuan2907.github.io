import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"  // 🟢 Use the explicit anon client
import { resetPasswordSchema } from "@/lib/auth-schemas"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body)
    
    // Send reset password email
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email)
    
    if (error) {
      throw error
    }

    return NextResponse.json({ 
      message: "Password reset email sent. Please check your inbox." 
    })
  } catch (error: any) {
    console.error("Reset password error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email address", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to send reset email" },
      { status: 500 }
    )
  }
}
