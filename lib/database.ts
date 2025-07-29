import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are not set. Please check your .env.local file.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  user_type: "customer" | "business_owner" | "admin"
  email_verified: boolean
  intended_business_name?: string
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  owner_id: string
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
export async function getBusinesses(filters?: {
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

export async function getBusinessBySlug(slug: string) {
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
        users(first_name, last_name)
      ),
      business_images(*)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (error) throw error
  return data
}

export async function createBusinessView(businessId: string, viewerIp?: string, userAgent?: string) {
  const { error } = await supabase.from("business_views").insert({
    business_id: businessId,
    viewer_ip: viewerIp,
    user_agent: userAgent,
  })

  if (error) throw error
}

export async function getBusinessAnalytics(businessId: string) {
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
    ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
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
export async function signUp(email: string, password: string, userData: {
  firstName: string
  lastName: string
  userType: "customer" | "business_owner"
  phone?: string
  intendedBusinessName?: string
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_type: userData.userType,
        phone: userData.phone,
        intended_business_name: userData.intendedBusinessName,
      }
    }
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}

export async function checkEmailExists(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("email, user_type")
    .eq("email", email)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function resendEmailConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })
  if (error) throw error
}
