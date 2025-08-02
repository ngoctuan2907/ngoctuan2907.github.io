import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  console.log("🔄 [VERCEL LOG] Auth callback called at:", new Date().toISOString())
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  console.log("📥 [VERCEL LOG] Callback params:", {
    hasCode: !!code,
    hasTokenHash: !!token_hash,
    type,
    next,
    origin,
    searchParams: Object.fromEntries(searchParams.entries())
  })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Handle OTP verification (email confirmation, password reset, etc.)
  if (token_hash && type) {
    console.log("🔄 [VERCEL LOG] Verifying OTP:", { type, token_hash: token_hash.substring(0, 10) + '...' })
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      console.log("✅ [VERCEL LOG] OTP verification successful")
      return redirectUser(request, origin, next)
    } else {
      console.error("❌ [VERCEL LOG] OTP verification failed:", error)
    }
  }
  // Handle OAuth code exchange (for OAuth providers like Google, GitHub, etc.)
  else if (code) {
    console.log("🔄 [VERCEL LOG] Exchanging OAuth code for session...")
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log("✅ [VERCEL LOG] OAuth code exchange successful")
      return redirectUser(request, origin, next)
    } else {
      console.error("❌ [VERCEL LOG] OAuth code exchange failed:", error)
    }
  } else {
    console.warn("⚠️  [VERCEL LOG] No valid auth parameters provided")
  }

  // return the user to an error page with instructions
  console.log("🚫 [VERCEL LOG] Redirecting to error page")
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

function redirectUser(request: NextRequest, origin: string, next: string) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  
  console.log("🔄 [VERCEL LOG] Redirecting user:", {
    isLocalEnv,
    forwardedHost,
    redirectTo: next
  })
  
  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${next}`)
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${next}`)
  } else {
    return NextResponse.redirect(`${origin}${next}`)
  }
}
