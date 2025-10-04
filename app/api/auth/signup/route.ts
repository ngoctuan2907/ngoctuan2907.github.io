import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { createSupabaseAdmin } from "@/lib/supabase-server"
import { checkEmailExists } from "@/lib/database"
import { signUpSchema } from "@/lib/auth-schemas"

export async function POST(request: NextRequest) {
  console.log("🚀 [VERCEL LOG] Signup API called at:", new Date().toISOString())
  
  try {
    const supabase = createServerClientForApi()
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
    
    // Check if email already exists
    const existingUser = await checkEmailExists(supabase, validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { 
          error: "An account with this email already exists",
          userType: existingUser.user_type 
        }, 
        { status: 409 }
      )
    }

    console.log("🔄 [VERCEL LOG] Calling signUp function...")
    
    // 🚨 DEBUG: Log which keys are being used
    console.log("🔍 [VERCEL LOG] Environment check:", {
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      effectiveRedirectUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    })
    
    // � Use production URL for email verification redirects
    const emailRedirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    
    console.log("📧 [VERCEL LOG] Email redirect URL:", emailRedirectTo)
    
    try {
      const health = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, { 
        cache: 'no-store',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        }
      });
      console.log('[AUTH HEALTH]', health.status, await health.text().catch(() => 'no body'));
    } catch (e) {
      console.error('[AUTH HEALTH] failed', e);
    }
    
    // Create user account with server client - now creating profile server-side
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        emailRedirectTo,
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          user_type: validatedData.userType,
          phone: validatedData.phone,
          intended_business_name: validatedData.intendedBusinessName,
        }
      }
    })
    
    // Log full response for debugging
    console.log("🔍 [VERCEL LOG] Full Supabase response:", {
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      hasError: !!error,
      userData: data?.user ? {
        id: data.user.id,
        email: data.user.email,
        confirmed: data.user.email_confirmed_at,
        created: data.user.created_at
      } : null,
      errorData: error ? {
        message: error.message,
        status: error.status,
        code: error.code
      } : null
    })

    if (error) {
      console.error("❌ [VERCEL LOG] Supabase signup error:", {
        message: error.message,
        status: error.status,
        name: error.name,
        code: error.code
      })
      
      if (error.code === 'over_email_send_rate_limit' || error.status === 429) {
        return NextResponse.json(
          { error: 'Please wait ~60 seconds before requesting another verification email.' },
          { status: 429 }
        );
      }
      
      // Return proper 400 status codes for Supabase Auth 400 errors
      if (error.status === 400) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      // Handle specific auth errors with user-friendly messages
      if (error.message?.includes('invalid') && error.message?.includes('email')) {
        return NextResponse.json(
          { 
            error: "Please check your email address format. Some email providers may not be supported.",
            details: error.message 
          },
          { status: 400 }
        )
      }
      
      if (error.message?.includes('already registered')) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in instead." },
          { status: 409 }
        )
      }

      if (error.message?.includes('password')) {
        return NextResponse.json(
          { 
            error: "Password does not meet requirements. Please use at least 8 characters with uppercase, lowercase, and numbers.",
            details: error.message 
          },
          { status: 400 }
        )
      }
      
      throw error
    }

    console.log("✅ [VERCEL LOG] Supabase auth signup successful:", {
      userId: data.user?.id,
      userEmail: data.user?.email,
      emailConfirmed: data.user?.email_confirmed_at,
      sessionExists: !!data.session
    })

    // Profile creation is now handled by database trigger (handle_new_user)
    // No need for manual profile creation since the trigger uses user metadata
    // This eliminates race conditions and duplicate key violations
    console.log("👤 [VERCEL LOG] Profile will be created automatically by database trigger")

    const result = data

    console.log("✅ [VERCEL LOG] SignUp function completed:", {
      userId: result.user?.id,
      email: result.user?.email,
      emailConfirmed: result.user?.email_confirmed_at,
      needsVerification: !result.user?.email_confirmed_at
    })

    // Give the trigger a moment to create the profile, then verify it was created
    // This helps catch any trigger failures early
    if (result.user) {
      console.log("🔍 [VERCEL LOG] Verifying profile creation by trigger...")
      
      // Wait a brief moment for the trigger to complete
      await new Promise(resolve => setTimeout(resolve, 500))
      
      try {
        // Use admin client to bypass RLS and accurately check if profile was created
        const admin = createSupabaseAdmin()
        const { data: profile, error: profileCheckError } = await admin
          .from("user_profiles")
          .select("id, user_id, first_name, last_name, user_type")
          .eq("user_id", result.user.id)
          .maybeSingle()

        if (profileCheckError || !profile) {
          console.error("⚠️  [VERCEL LOG] Profile was not created by trigger:", profileCheckError)
          
          // Profile creation failed - this is a real issue that needs to be reported
          return NextResponse.json({
            error: "Account created but profile setup incomplete. Please contact support or try signing in after email verification.",
            partialSuccess: true,
            user: result.user,
            needsVerification: !result.user.email_confirmed_at
          }, { status: 202 }) // 202 Accepted indicates partial success
        } else {
          console.log("✅ [VERCEL LOG] Profile successfully created by trigger:", {
            profileId: profile.id,
            userType: profile.user_type,
            fullName: `${profile.first_name} ${profile.last_name}`
          })
        }
      } catch (error) {
        console.error("❌ [VERCEL LOG] Error checking profile creation:", error)
        // Don't fail the signup for a check error, but log it
      }
    }

    // Check if user needs email verification
    if (result.user && !result.user.email_confirmed_at) {
      console.log("📧 [VERCEL LOG] Email verification required - sending response")
      return NextResponse.json({ 
        message: "Account created successfully! Please check your email and click the verification link before signing in.",
        user: result.user,
        needsVerification: true
      }, { status: 201 }) // 201 Created for successful account creation
    }

    console.log("✅ [VERCEL LOG] Account created and verified - sending success response")
    return NextResponse.json({ 
      message: "Account created successfully. You can now sign in.",
      user: result.user,
      needsVerification: false
    }, { status: 201 }) // 201 Created for successful account creation
  } catch (error: any) {
    // 🟢 Enhanced error logging as requested
    console.error("❌ [VERCEL LOG] Sign up error:", JSON.stringify({
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500), // Truncate stack for readability
      timestamp: new Date().toISOString()
    }, null, 2))
    
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
