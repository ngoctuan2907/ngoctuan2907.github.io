import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Please check your .env.local file.")
}

// 🟢 Public client - SAFE for client-side use
// This ensures email verification is required and sent properly
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// � Admin client - SERVER-ONLY! 
// Only create this in server-side contexts where SUPABASE_SERVICE_ROLE_KEY is available
export function createSupabaseAdmin() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseServiceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
  }
  
  return createClient(
    supabaseUrl, 
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
