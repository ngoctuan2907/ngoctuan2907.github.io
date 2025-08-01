import { type NextRequest, NextResponse } from "next/server"
import { signUp, checkEmailExists } from "@/lib/database"
import { signUpSchema } from "@/lib/auth-schemas"

export async function POST(request: NextRequest) {
  console.log("🚀 [VERCEL LOG] Signup API called at:", new Date().toISOString())
  
  try {
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
    // const existingUser = await checkEmailExists(validatedData.email)
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
    
    // Create user account
    const result = await signUp(validatedData.email, validatedData.password, {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      userType: validatedData.userType,
      phone: validatedData.phone,
      intendedBusinessName: validatedData.intendedBusinessName,
    })

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
    console.error("❌ [VERCEL LOG] Sign up error:", {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500), // Truncate stack for readability
      timestamp: new Date().toISOString()
    })
    
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
