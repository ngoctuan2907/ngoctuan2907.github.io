import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { z } from "zod"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const createShopSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  full_address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  price_range: z.enum(['$', '$$', '$$$', '$$$$']),
  stakeholder_id: z.string().uuid("Invalid stakeholder ID"),
  cuisine_types: z.array(z.string()).min(1, "At least one cuisine type is required"),
  specialty: z.string().optional(),
  instagram_handle: z.string().optional(),
  facebook_url: z.string().url().optional().or(z.literal('')),
  whatsapp_number: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  business_hours: z.array(z.object({
    day_of_week: z.number().min(0).max(6),
    is_open: z.boolean(),
    open_time: z.string().optional(),
    close_time: z.string().optional()
  })).length(7, "Must specify hours for all 7 days"),
  menu_items: z.array(z.object({
    name: z.string().min(1, "Menu item name is required"),
    price: z.number().positive("Price must be positive"),
    description: z.string().optional()
  })).min(1, "At least one menu item is required")
})

// For updates, we don't allow changing stakeholder_id
const updateShopSchema = createShopSchema.partial()

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createShopSchema.parse(body)

    // Check if user can create shop for this stakeholder
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('stakeholder_id', validatedData.stakeholder_id)
      .in('role', ['stakeholder_owner', 'staff'])
      .single()

    if (!membership) {
      return NextResponse.json({ 
        error: "Only stakeholder owners and staff can create shops" 
      }, { status: 403 })
    }

    // Generate unique slug from business name
    const baseSlug = validatedData.business_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1
    
    // Ensure slug is unique
    while (true) {
      const { data: existing } = await supabase
        .from('businesses')
        .select('slug')
        .eq('slug', slug)
        .single()
      
      if (!existing) break
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create the business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        stakeholder_id: validatedData.stakeholder_id,
        business_name: validatedData.business_name,
        slug,
        description: validatedData.description,
        specialty: validatedData.specialty || null,
        full_address: validatedData.full_address,
        district: validatedData.district,
        postal_code: validatedData.postal_code,
        phone: validatedData.phone,
        email: validatedData.email,
        price_range: validatedData.price_range,
        instagram_handle: validatedData.instagram_handle || null,
        facebook_url: validatedData.facebook_url || null,
        whatsapp_number: validatedData.whatsapp_number || null,
        cover_image_url: validatedData.cover_image_url || null,
        status: 'pending', // Requires review
        is_active: false
      })
      .select()
      .single()

    if (businessError) {
      console.error('Error creating business:', businessError)
      throw businessError
    }

    // Create business hours
    const hoursToInsert = validatedData.business_hours.map(hour => ({
      business_id: business.id,
      day_of_week: hour.day_of_week,
      is_open: hour.is_open,
      open_time: hour.is_open ? hour.open_time : null,
      close_time: hour.is_open ? hour.close_time : null
    }))

    const { error: hoursError } = await supabase
      .from('business_hours')
      .insert(hoursToInsert)

    if (hoursError) {
      console.error('Error creating business hours:', hoursError)
      // Don't fail the whole operation for hours
    }

    // Create cuisine associations
    if (validatedData.cuisine_types.length > 0) {
      // First get or create cuisine types
      const { data: existingCuisines } = await supabase
        .from('cuisine_types')
        .select('id, name')
        .in('name', validatedData.cuisine_types)

      const existingNames = existingCuisines?.map(c => c.name) || []
      const newCuisines = validatedData.cuisine_types.filter(name => !existingNames.includes(name))

      // Create new cuisine types if needed
      if (newCuisines.length > 0) {
        await supabase
          .from('cuisine_types')
          .insert(newCuisines.map(name => ({ name })))
      }

      // Get all cuisine type IDs
      const { data: allCuisines } = await supabase
        .from('cuisine_types')
        .select('id, name')
        .in('name', validatedData.cuisine_types)

      if (allCuisines) {
        const cuisineAssociations = allCuisines.map(cuisine => ({
          business_id: business.id,
          cuisine_id: cuisine.id
        }))

        await supabase
          .from('business_cuisines')
          .insert(cuisineAssociations)
      }
    }

    // Create menu items
    if (validatedData.menu_items.length > 0) {
      const menuToInsert = validatedData.menu_items.map((item, index) => ({
        business_id: business.id,
        name: item.name,
        description: item.description || null,
        price: item.price,
        is_available: true,
        display_order: index
      }))

      const { error: menuError } = await supabase
        .from('menu_items')
        .insert(menuToInsert)

      if (menuError) {
        console.error('Error creating menu items:', menuError)
        // Don't fail the whole operation for menu items
      }
    }

    return NextResponse.json({ 
      success: true,
      business,
      message: "Business registered successfully and is pending review"
    }, { status: 201 })

  } catch (error: any) {
    console.error("Error creating shop:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 })
    }

    if (error.message?.includes('quota exceeded')) {
      return NextResponse.json({ 
        error: "Shop creation limit reached for your subscription plan" 
      }, { status: 402 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to create shop" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    const { searchParams } = request.nextUrl
    const stakeholderId = searchParams.get("stakeholder_id")
    const status = searchParams.get("status") || "active"

    let query = supabase
      .from('businesses')
      .select(`
        *,
        business_cuisines(cuisine_types(name)),
        business_hours(*),
        menu_items(id, name, price, is_available),
        reviews(rating)
      `)

    if (stakeholderId) {
      query = query.eq('stakeholder_id', stakeholderId)
    } else {
      // Public listing - only show active businesses
      query = query.eq('status', 'active')
    }

    if (status && stakeholderId) {
      query = query.eq('status', status)
    }

    const { data: businesses, error } = await query
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      businesses: businesses || []
    })
  } catch (error: any) {
    console.error("Error fetching shops:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch shops" 
    }, { status: 500 })
  }
}