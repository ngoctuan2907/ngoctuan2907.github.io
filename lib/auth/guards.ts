import { createServerClientComponent } from "@/lib/supabase-server"
import { User } from "@supabase/supabase-js"

export interface AuthGuardResult {
  user: User | null
  isAuthenticated: boolean
  requiresAuth?: boolean
}

/**
 * Server-side auth guard for protected routes
 * Returns user if authenticated, or indication that auth is required
 */
export async function requireUser(): Promise<AuthGuardResult> {
  try {
    const supabase = createServerClientComponent()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return {
        user: null,
        isAuthenticated: false,
        requiresAuth: true
      }
    }

    return {
      user,
      isAuthenticated: true,
      requiresAuth: false
    }
  } catch (error) {
    console.error("Auth guard error:", error)
    return {
      user: null,
      isAuthenticated: false,
      requiresAuth: true
    }
  }
}

/**
 * Server-side auth guard for public routes that should redirect authenticated users
 * Returns user if authenticated (for redirect), null if not authenticated (continue)
 */
export async function redirectIfAuthenticated(): Promise<AuthGuardResult> {
  try {
    const supabase = createServerClientComponent()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return {
      user,
      isAuthenticated: !!user && !error,
      requiresAuth: false
    }
  } catch (error) {
    console.error("Auth guard error:", error)
    return {
      user: null,
      isAuthenticated: false,
      requiresAuth: false
    }
  }
}