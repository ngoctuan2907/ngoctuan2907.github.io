"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "./supabaseClient"  // 🟢 Use the new SSR client
import { type UserProfile } from "./database"

interface AuthContextType {
  user: SupabaseUser | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Initialize supabase client for this component - create once
  const supabase = createClient()

  const refreshUser = async () => {
    console.log('DEBUG: AuthContext - refreshUser called')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('DEBUG: AuthContext - got user:', user)
      setUser(user)
      
      if (user) {
        try {
          console.log('DEBUG: AuthContext - fetching profile for user:', user.id)
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle()

          console.log('DEBUG: AuthContext - profile result:', { profile, error })
          if (error) {
            console.error("Error fetching user profile:", error)
            
            // If profile doesn't exist, just set to null - profile creation should be server-side
            if (error.code === 'PGRST116' || error.message?.includes('no rows') || !profile) {
              if (process.env.NODE_ENV !== 'production') {
                console.log("🔄 [AUTH CONTEXT] Profile not found - profile creation should happen server-side")
              }
              setUserProfile(null)
            } else {
              setUserProfile(null)
            }
          } else {
            setUserProfile(profile)
          }
        } catch (profileError) {
          console.error("❌ [AUTH CONTEXT] Profile fetch error:", profileError)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
    } catch (error) {
      console.error("Error refreshing user:", error)
    } finally {
      console.log('DEBUG: AuthContext - setting loading to false')
      setLoading(false)
    }
  }

useEffect(() => {
  console.log('DEBUG: AuthContext useEffect called')
  refreshUser()

  // Add a safety timeout to prevent infinite loading
  const timeout = setTimeout(() => {
    console.log('DEBUG: AuthContext timeout - forcing loading to false')
    setLoading(false)
  }, 5000)

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event: any, session: any) => {
      console.log('DEBUG: AuthContext onAuthStateChange:', event, session?.user?.email)
      setLoading(true)
      setUser(session?.user ?? null)

      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .maybeSingle()

          if (error) {
            console.error("❌ [AUTH STATE] Profile fetch error:", error)
            setUserProfile(null)
          } else {
            setUserProfile(profile)
          }
        } catch (profileError) {
          console.error("❌ [AUTH STATE] Profile query error:", profileError)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }

      console.log('DEBUG: AuthContext onAuthStateChange setting loading to false')
      setLoading(false)
    }
  )

  return () => {
    clearTimeout(timeout)
    subscription.unsubscribe()
  }
}, []) // Empty dependency array - supabase client is created once

  const signOut = async () => {
    try {
      if (process.env.NODE_ENV !== 'production') {
        console.log("🔄 [AUTH] Signing out...")
      }
      
      // Call server-side signout endpoint to ensure cookies are cleared
      await fetch('/api/auth/signout', { method: 'POST' })
      
      // Clear local state
      setUser(null)
      setUserProfile(null)
      
      if (process.env.NODE_ENV !== 'production') {
        console.log("✅ [AUTH] Signed out successfully")
      }
      
      // Use Next.js router to navigate and refresh
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("❌ [AUTH] Sign out failed:", error)
      // Even if there's an error, clear local state and redirect
      setUser(null)
      setUserProfile(null)
      router.push("/")
      router.refresh()
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
