import { type NextRequest, NextResponse } from "next/server"
import { signUp, checkEmailExists } from "@/lib/database"
import { signUpSchema } from "@/lib/auth-schemas"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signUpSchema.parse(body)
    
    // Check if email already exists
    const existingUser = await checkEmailExists(validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { 
          error: "An account with this email already exists",
          userType: existingUser.user_type 
        }, 
        { status: 409 }
      )
    }

    // Create user account
    const result = await signUp(validatedData.email, validatedData.password, {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      userType: validatedData.userType,
      phone: validatedData.phone,
      intendedBusinessName: validatedData.intendedBusinessName,
    })

    return NextResponse.json({ 
      message: "Account created successfully. Please check your email to verify your account.",
      user: result.user 
    })
  } catch (error: any) {
    console.error("Sign up error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    )
  }
}
