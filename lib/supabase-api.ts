import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createServerClientForApi() {
  const store = cookies()
  return createServerClient(url, key, {
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
