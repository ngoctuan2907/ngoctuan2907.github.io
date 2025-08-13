import { NextResponse } from 'next/server'
import { createServerClientForApi } from '@/lib/supabase-api'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createServerClientForApi()
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Server signout error:', error)
  }

  // Hard-expire possible Supabase auth cookies (various naming patterns)
  const jar = cookies()
  const expire = { path: '/', maxAge: 0 }
  ;[
    'sb-access-token',
    'sb-refresh-token',
    'sb:token',
    'sb:refresh_token',
    'sb-auth-token',
    'sb-refresh-token.0',
    'sb-refresh-token.1'
  ].forEach(name => {
    try { jar.set(name, '', expire) } catch {}
  })

  return NextResponse.json({ success: true })
}
