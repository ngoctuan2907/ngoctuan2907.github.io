import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createServerClientComponent() {
  const store = cookies()
  return createServerClient(url, anon, {
    cookies: {
      get: (name: string) => store.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        store.set(name, value, options)
      },
      remove: (name: string, options: CookieOptions) => {
        store.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}

export function createServerClientMiddleware(req: NextRequest, res: NextResponse) {
  return createServerClient(url, anon, {
    cookies: {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        res.cookies.set(name, value, options)
      },
      remove: (name: string, options: CookieOptions) => {
        res.cookies.set(name, '', { ...options, maxAge: 0 })
      },
    },
  })
}

export function createSupabaseAdmin() {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRole) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
  }
  return createServerClient(url, serviceRole, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  })
}
