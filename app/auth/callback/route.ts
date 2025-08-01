import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  console.log("🔄 [VERCEL LOG] Auth callback called at:", new Date().toISOString())
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log("📥 [VERCEL LOG] Callback params:", {
    hasCode: !!code,
    next,
    origin,
    searchParams: Object.fromEntries(searchParams.entries())
  })

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log("🔄 [VERCEL LOG] Exchanging code for session...")
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log("✅ [VERCEL LOG] Code exchange successful")
      
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      console.log("🔄 [VERCEL LOG] Redirecting user:", {
        isLocalEnv,
        forwardedHost,
        redirectTo: next
      })
      
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error("❌ [VERCEL LOG] Code exchange failed:", error)
    }
  } else {
    console.warn("⚠️  [VERCEL LOG] No code provided in callback")
  }

  // return the user to an error page with instructions
  console.log("🚫 [VERCEL LOG] Redirecting to error page")
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
