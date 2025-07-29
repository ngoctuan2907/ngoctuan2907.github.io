import { type NextRequest, NextResponse } from "next/server"
import { signIn } from "@/lib/database"
import { signInSchema } from "@/lib/auth-schemas"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signInSchema.parse(body)
    
    // Sign in user
    const result = await signIn(validatedData.email, validatedData.password)

    return NextResponse.json({ 
      message: "Signed in successfully",
      user: result.user 
    })
  } catch (error: any) {
    console.error("Sign in error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }
    
    if (error.message === "Invalid login credentials") {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to sign in" },
      { status: 500 }
    )
  }
}
