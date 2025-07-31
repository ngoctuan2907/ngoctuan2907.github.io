import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }
    
    // For now, we'll return that email doesn't exist to allow signup
    // In a production app, you might want to implement a more sophisticated check
    return NextResponse.json({ 
      exists: false,
      userType: null
    })
  } catch (error: any) {
    console.error("Check email error:", error)
    return NextResponse.json(
      { error: "Failed to check email" },
      { status: 500 }
    )
  }
}
