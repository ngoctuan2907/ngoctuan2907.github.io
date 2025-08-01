import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Please check your .env.local file.")
}

if (!supabaseServiceKey) {
  console.warn("Supabase environment variable SUPABASE_SERVICE_ROLE_KEY is not set. Please check your .env.local file.")
}

// 🟢 Public client - ALWAYS use for auth operations (signUp, signIn)
// This ensures email verification is required and sent properly
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 🟢 Admin client - ONLY use for privileged operations that bypass RLS
// Never use for user auth flows as it auto-confirms emails
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
