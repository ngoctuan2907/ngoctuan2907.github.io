import { NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { createSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const { confirmPhrase, password, deleteProfileData } = await request.json()

    // Validate required fields
    if (confirmPhrase !== "DELETE MY ACCOUNT") {
      return NextResponse.json(
        { error: "Invalid confirmation phrase" },
        { status: 400 }
      )
    }

    const supabase = createServerClientForApi()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // For password-based accounts, verify the password
    if (password) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || "",
        password,
      })

      if (signInError) {
        return NextResponse.json(
          { error: "Password is incorrect" },
          { status: 400 }
        )
      }
    }

    // If requested, delete profile and business data using admin client
    if (deleteProfileData) {
      const adminClient = createSupabaseAdmin()
      
      try {
        // Delete user's profile data (this would cascade to related data with proper FK constraints)
        await adminClient
          .from('profiles')
          .delete()
          .eq('id', user.id)
        
        // Delete user's businesses if they own any
        await adminClient
          .from('businesses')
          .delete()
          .eq('owner_id', user.id)
        
        console.log(`Deleted profile and business data for user: ${user.id}`)
      } catch (dbError) {
        console.error('Database cleanup error:', dbError)
        // Continue with account deletion even if profile cleanup fails
      }
    }

    // Delete the user account using admin client
    const adminClient = createSupabaseAdmin()
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Account deletion error:', deleteError)
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 }
      )
    }

    // Clear the session cookie
    const response = NextResponse.json({ success: true })
    
    // Clear all possible Supabase auth cookies
    const cookieOptions = {
      path: '/',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    }

    response.cookies.set('sb-access-token', '', cookieOptions)
    response.cookies.set('sb-refresh-token', '', cookieOptions)
    response.cookies.set(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('://')[1]?.split('.')[0]}-auth-token`, '', cookieOptions)

    return response
  } catch (error) {
    console.error("Account deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}