import { type SupabaseClient } from "@supabase/supabase-js"

// Remove global supabase client export - functions now accept client parameter
// export const supabase = createClient() // 🔴 REMOVED

// Database types
export interface UserProfile {
  id: string
  user_id: string  // References auth.users.id
  first_name: string
  last_name: string
  phone?: string
  user_type: "customer" | "business_owner" | "admin"
  intended_business_name?: string
  created_at: string
  updated_at: string
}

// Multi-tenant types
export interface Stakeholder {
  id: string
  name: string
  created_by: string
  stripe_customer_id?: string
  status: "inactive" | "active"
  created_at: string
}

export interface Membership {
  id: string
  user_id: string
  stakeholder_id?: string
  shop_id?: string
  role: "stakeholder_owner" | "staff" | "clerk"
  created_at: string
}

export interface Subscription {
  id: string
  stakeholder_id: string
  plan: string
  status: "active" | "past_due" | "canceled"
  current_period_end?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface PlanFeatures {
  plan: string
  max_shops: number
  ad_tier: "none" | "standard" | "top"
}

export interface Voucher {
  id: string
  shop_id: string
  code: string
  discount_type: "percent" | "amount"
  discount_value: number
  valid_from?: string
  valid_to?: string
  active: boolean
  created_by: string
  created_at: string
}

export interface Advertisement {
  id: string
  shop_id: string
  tier: "standard" | "top"
  start_at: string
  end_at: string
  priority: number
  created_by: string
  created_at: string
}

export interface Business {
  id: string
  owner_id: string  // References auth.users.id
  stakeholder_id?: string  // References stakeholders.id
  business_name: string
  slug: string
  description: string
  specialty?: string
  full_address: string
  district: string
  postal_code: string
  phone: string
  email: string
  price_range: "$" | "$$" | "$$$" | "$$$$"
  status: "pending" | "active" | "suspended" | "closed"
  is_active?: boolean
  instagram_handle?: string
  facebook_url?: string
  whatsapp_number?: string
  cover_image_url?: string
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  business_id: string
  category_id?: string
  name: string
  description?: string
  price: number
  is_available: boolean
  image_url?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  business_id: string
  customer_id: string
  rating: number
  comment?: string
  status: "published" | "hidden" | "flagged"
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  business_id: string
  customer_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  total_amount: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"
  notes?: string
  pickup_time?: string
  created_at: string
  updated_at: string
}

// Database helper functions
export async function getBusinesses(supabase: SupabaseClient, filters?: {
  district?: string
  cuisine?: string
  search?: string
  limit?: number
}) {
  let query = supabase
    .from("businesses")
    .select(`
      *,
      business_cuisines(cuisine_types(name)),
      reviews(rating),
      menu_items(id)
    `)
    .eq("status", "active")

  if (filters?.district) {
    query = query.eq("district", filters.district)
  }

  if (filters?.search) {
    query = query.or(`business_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw error
  return data
}

export async function getBusinessBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      *,
      business_cuisines(cuisine_types(name)),
      business_hours(*),
      menu_categories(
        *,
        menu_items(*)
      ),
      reviews(
        *,
        user_profiles!reviews_customer_id_fkey(first_name, last_name)
      ),
      business_images(*)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (error) throw error
  return data
}

export async function createBusinessView(supabase: SupabaseClient, businessId: string, viewerIp?: string, userAgent?: string) {
  const { error } = await supabase.from("business_views").insert({
    business_id: businessId,
    viewer_ip: viewerIp,
    user_agent: userAgent,
  })

  if (error) throw error
}

export async function getBusinessAnalytics(supabase: SupabaseClient, businessId: string) {
  // Get total views
  const { count: totalViews } = await supabase
    .from("business_views")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId)

  // Get reviews stats
  const { data: reviewsData } = await supabase
    .from("reviews")
    .select("rating")
    .eq("business_id", businessId)
    .eq("status", "published")

  const averageRating = reviewsData?.length
    ? reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewsData.length
    : 0

  // Get orders count
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("business_id", businessId)

  return {
    totalViews: totalViews || 0,
    averageRating: Math.round(averageRating * 10) / 10,
    totalReviews: reviewsData?.length || 0,
    totalOrders: totalOrders || 0,
  }
}

// Authentication helper functions
export async function signUp(supabase: SupabaseClient, email: string, password: string, userData: {
  firstName: string
  lastName: string
  userType: "customer" | "business_owner"
  phone?: string
  intendedBusinessName?: string
}) {
  if (process.env.NODE_ENV !== 'production') {
    console.log("🔄 [VERCEL LOG] signUp function called for:", email)
  
    // 🚨 DEBUG: Log which keys are being used
    console.log("🔍 [VERCEL LOG] Environment check:", {
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      anonKeyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL
    })
  }
  
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log("📞 [VERCEL LOG] Calling supabase.auth.signUp...")
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 🟢 Use production URL for email verification redirects
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          user_type: userData.userType,
          phone: userData.phone,
          intended_business_name: userData.intendedBusinessName,
        }
      }
    })

    if (error) {
      console.error("❌ [VERCEL LOG] Supabase signup error:", {
        message: error.message,
        status: error.status,
        name: error.name
      })
      throw error
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log("✅ [VERCEL LOG] Supabase auth signup successful:", {
        userId: data.user?.id,
        userEmail: data.user?.email,
        emailConfirmed: data.user?.email_confirmed_at,
        sessionExists: !!data.session
      })
    }

    // Create user profile after successful signup
    if (data.user) {
      if (process.env.NODE_ENV !== 'production') {
        console.log("👤 [VERCEL LOG] Creating user profile for user:", data.user.id)
      }
      
      const profileData = {
        user_id: data.user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_type: userData.userType,
        phone: userData.phone ?? null,
        intended_business_name: userData.intendedBusinessName || null,
      }
      
      if (process.env.NODE_ENV !== 'production') {
        console.log("📝 [VERCEL LOG] Profile data to insert:", profileData)
      }
      
      const { data: insertedProfile, error: profileError } = await supabase
        .from("user_profiles")
        .insert(profileData)
        .select()

      if (profileError) {
        console.error("❌ [VERCEL LOG] Error creating user profile:", {
          message: profileError.message || 'No message',
          code: profileError.code || 'No code',
          details: profileError.details || 'No details',
          hint: profileError.hint || 'No hint',
          originalError: JSON.stringify(profileError, null, 2)
        })
        // Don't throw here - user is created, profile creation can be retried
      } else {
        if (process.env.NODE_ENV !== 'production') {
          console.log("✅ [VERCEL LOG] User profile created successfully:", insertedProfile)
        }
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        console.warn("⚠️  [VERCEL LOG] No user returned from Supabase signup")
      }
    }

    return data
  } catch (error) {
    console.error("💥 [VERCEL LOG] SignUp function error:", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      email: email // Include email for debugging
    })
    throw error
  }
}

export async function signIn(supabase: SupabaseClient, email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase signin error:", error)
      
      // Handle specific error cases
      if (error.message === "Invalid login credentials") {
        // Check if it's an unverified email issue
        throw new Error("Invalid email or password. If you just signed up, please check your email and verify your account first.")
      }
      
      if (error.message === "Email not confirmed") {
        throw new Error("Please check your email and click the verification link before signing in.")
      }
      
      throw error
    }

    return data
  } catch (error) {
    console.error("SignIn function error:", error)
    throw error
  }
}

export async function signOut(supabase: SupabaseClient) {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(supabase: SupabaseClient, email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function getCurrentUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) throw error
  return data
}

export async function checkEmailExists(supabase: SupabaseClient, email: string): Promise<UserProfile | null> {
  try {
    // Use Supabase Admin API to check if user exists by email
    // For now, we'll check the user_profiles table directly
    // This requires RLS to be properly configured
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error("Error checking email existence:", error)
      return null
    }
    
    // For production, we should implement a proper email check
    // For now, return null to allow signup process
    return null
  } catch (error) {
    console.error("Error in checkEmailExists:", error)
    return null
  }
}

export async function resendEmailConfirmation(supabase: SupabaseClient, email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })
  if (error) throw error
}
