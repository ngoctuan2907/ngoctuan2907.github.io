import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClientForApi } from '@/lib/supabase-api'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  console.log("🔄 [VERCEL LOG] Auth confirmation called at:", new Date().toISOString())
  
  const supabase = createServerClientForApi()
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  console.log("📥 [VERCEL LOG] Confirmation params:", {
    hasTokenHash: !!token_hash,
    type,
    next,
    searchParams: Object.fromEntries(searchParams.entries())
  })

  if (token_hash && type) {
    console.log("🔄 [VERCEL LOG] Verifying OTP for confirmation:", { 
      type, 
      token_hash: token_hash.substring(0, 10) + '...' 
    })
    
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log("✅ [VERCEL LOG] Email confirmation successful")
      // redirect user to specified redirect URL or root of app
      redirect(next)
    } else {
      console.error("❌ [VERCEL LOG] Email confirmation failed:", error)
    }
  } else {
    console.warn("⚠️  [VERCEL LOG] Missing token_hash or type parameters")
  }

  // redirect the user to an error page with instructions
  console.log("🚫 [VERCEL LOG] Redirecting to error page")
  redirect('/auth/auth-code-error')
}
