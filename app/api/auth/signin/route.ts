import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { signInSchema } from "@/lib/auth-schemas"

export async function POST(request: NextRequest) {
  console.log("🔐 [VERCEL LOG] Signin API called at:", new Date().toISOString())
  
  try {
    const supabase = createServerClientForApi()
    const body = await request.json()
    console.log("📥 [VERCEL LOG] Signin request for email:", body.email)
    
    // Validate input
    const validatedData = signInSchema.parse(body)
    console.log("✅ [VERCEL LOG] Signin data validation successful")
    
    // Sign in user with server client
    console.log("🔄 [VERCEL LOG] Calling supabase.auth.signInWithPassword...")
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      console.error("❌ [VERCEL LOG] Supabase signin error:", error)
      
      // Handle specific error cases
      if (error.message === "Invalid login credentials") {
        // Check if it's an unverified email issue
        throw new Error("Invalid email or password. If you just signed up, please check your email and verify your account first.")
      }
      
      if (error.message === "Email not confirmed") {
        throw new Error("Please check your email and click the verification link before signing in.")
      }
      
      throw error
    }

    const result = data

    console.log("✅ [VERCEL LOG] SignIn successful:", {
      userId: result.user?.id,
      email: result.user?.email,
      emailConfirmed: result.user?.email_confirmed_at
    })

    return NextResponse.json({ 
      message: "Signed in successfully",
      user: result.user 
    })
  } catch (error: any) {
    // 🟢 Enhanced error logging as requested  
    console.error("❌ [VERCEL LOG] Sign in error:", JSON.stringify({
      message: error.message,
      name: error.name,
      timestamp: new Date().toISOString()
    }, null, 2))
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      )
    }
    
    // Handle specific auth errors
    if (error.message?.includes("Invalid login credentials")) {
      console.log("⚠️  [VERCEL LOG] Invalid credentials - possible unverified email")
      return NextResponse.json(
        { error: "Invalid email or password. If you just signed up, please verify your email first." },
        { status: 401 }
      )
    }

    if (error.message?.includes("Email not confirmed")) {
      console.log("📧 [VERCEL LOG] Email not confirmed")
      return NextResponse.json(
        { error: "Please check your email and click the verification link before signing in." },
        { status: 401 }
      )
    }

    if (error.message?.includes("verify your email")) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    console.error("💥 [VERCEL LOG] Unhandled signin error - returning 500")
    return NextResponse.json(
      { error: error.message || "Failed to sign in" },
      { status: 500 }
    )
  }
}
