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
  
  // Initialize supabase client for this component
  const supabase = createClient()

  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        try {
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle()

          if (error) {
            console.error("Error fetching user profile:", error)
            
            // If profile doesn't exist, try to create it from user metadata
            if (error.code === 'PGRST116' || error.message?.includes('no rows') || !profile) {
              console.log("🔄 [AUTH CONTEXT] Profile not found, attempting to create from metadata...")
              
              const userMetadata = user.user_metadata || {}
              const profileData = {
                user_id: user.id,
                first_name: userMetadata.first_name || '',
                last_name: userMetadata.last_name || '',
                user_type: userMetadata.user_type || 'customer',
                phone: userMetadata.phone || null,
                intended_business_name: userMetadata.intended_business_name || null,
              }
              
              const { data: newProfile, error: createError } = await supabase
                .from("user_profiles")
                .insert(profileData)
                .select()
                .single()
                
              if (createError) {
                console.error("❌ [AUTH CONTEXT] Failed to create profile:", createError)
                setUserProfile(null)
              } else {
                console.log("✅ [AUTH CONTEXT] Profile created successfully:", newProfile)
                setUserProfile(newProfile)
              }
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
      setLoading(false)
    }
  }

useEffect(() => {
  refreshUser()

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event: any, session: any) => {
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

      setLoading(false)
    }
  )

  return () => subscription.unsubscribe()
}, [supabase])

  const signOut = async () => {
    try {
      console.log("🔄 [AUTH] Signing out...")
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("❌ [AUTH] Sign out error:", error)
        throw error
      }

      // Clear local state
      setUser(null)
      setUserProfile(null)
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token')
      sessionStorage.clear()
      
      console.log("✅ [AUTH] Signed out successfully")
      
      // Force redirect to home page
      window.location.href = "/"
    } catch (error) {
      console.error("❌ [AUTH] Sign out failed:", error)
      // Even if there's an error, clear local state and redirect
      setUser(null)
      setUserProfile(null)
      window.location.href = "/"
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
