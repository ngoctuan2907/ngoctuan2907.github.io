import { type NextRequest, NextResponse } from "next/server"
import { checkEmailExists } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }
    
    const existingUser = await checkEmailExists(email)
    
    return NextResponse.json({ 
      exists: !!existingUser,
      userType: existingUser?.user_type || null
    })
  } catch (error: any) {
    console.error("Check email error:", error)
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    )
  }
}
