import { type NextRequest, NextResponse } from "next/server"
import { getBusinesses } from "@/lib/database"
import { createServerClientForApi } from "@/lib/supabase-api"
import { z } from "zod"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Schema for quick business creation (Vietnamese requirements)
const QuickCreateBusinessSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  district: z.string().min(1, "District is required"),
  cuisine_types: z.array(z.string()).min(1, "At least one cuisine type is required")
})

// Schema for full business creation (existing multi-step form)
const FullCreateBusinessSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  full_address: z.string().min(1, "Address is required"),
  district: z.string().min(1, "District is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  price_range: z.enum(['$', '$$', '$$$', '$$$$']),
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
  })).optional(),
  menu_items: z.array(z.object({
    name: z.string().min(1, "Menu item name is required"),
    price: z.number().positive("Price must be positive"),
    description: z.string().optional()
  })).optional()
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function GET(request: NextRequest) {
  try {
    console.log('[ENV] SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[ENV] ANON key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const supabase = createServerClientForApi()
    const { searchParams } = request.nextUrl
    const district = searchParams.get("district") || undefined
    const cuisine = searchParams.get("cuisine") || undefined
    const search = searchParams.get("search") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const businesses = await getBusinesses(supabase, {
      district,
      cuisine,
      search,
      limit,
    }).catch((e) => {
      console.error('getBusinesses failed:', JSON.stringify(e, null, 2))
      throw e
    })

    return NextResponse.json({ 
      success: true,
      businesses 
    })
  } catch (error) {
    console.error("Error fetching businesses:", JSON.stringify(error, null, 2))
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Determine if this is a quick create (Vietnamese requirements) or full create
    const isQuickCreate = !body.description || !body.full_address
    
    let validatedData: any
    try {
      if (isQuickCreate) {
        validatedData = QuickCreateBusinessSchema.parse(body)
      } else {
        validatedData = FullCreateBusinessSchema.parse(body)
      }
    } catch (validationError) {
      console.error("Validation error:", validationError)
      return NextResponse.json({
        error: "Invalid input data",
        details: validationError instanceof z.ZodError ? validationError.errors : []
      }, { status: 400 })
    }

    // Generate unique slug from business name
    const baseSlug = generateSlug(validatedData.business_name)
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

    // Prepare business data based on create type
    const businessData: any = {
      owner_id: user.id,
      business_name: validatedData.business_name,
      slug,
      district: validatedData.district,
      status: isQuickCreate ? 'active' : 'pending', // Quick create is active, full create needs review
      is_active: isQuickCreate
    }

    if (isQuickCreate) {
      // Minimal data for quick Vietnamese requirements
      businessData.description = `Welcome to ${validatedData.business_name}, a wonderful home-based cafe in ${validatedData.district}.`
      businessData.full_address = `${validatedData.district}, Singapore`
      businessData.postal_code = '000000'
      businessData.phone = user.phone || '+65 0000 0000'
      businessData.email = user.email
      businessData.price_range = '$$'
    } else {
      // Full data from multi-step form
      businessData.description = validatedData.description
      businessData.full_address = validatedData.full_address
      businessData.postal_code = validatedData.postal_code
      businessData.phone = validatedData.phone
      businessData.email = validatedData.email
      businessData.price_range = validatedData.price_range
      businessData.specialty = validatedData.specialty || null
      businessData.instagram_handle = validatedData.instagram_handle || null
      businessData.facebook_url = validatedData.facebook_url || null
      businessData.whatsapp_number = validatedData.whatsapp_number || null
      businessData.cover_image_url = validatedData.cover_image_url || null
      businessData.status = 'pending' // Full businesses need review
      businessData.is_active = false
    }

    // Create the business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single()

    if (businessError) {
      console.error('Error creating business:', businessError)
      return NextResponse.json({ 
        error: `Failed to create business: ${businessError.message}` 
      }, { status: 500 })
    }

    // Create cuisine associations
    if (validatedData.cuisine_types && validatedData.cuisine_types.length > 0) {
      // First get or create cuisine types
      const { data: existingCuisines } = await supabase
        .from('cuisine_types')
        .select('id, name')
        .in('name', validatedData.cuisine_types)

      const existingNames = existingCuisines?.map(c => c.name) || []
      const newCuisines = validatedData.cuisine_types.filter((name: string) => !existingNames.includes(name))

      // Create new cuisine types if needed
      if (newCuisines.length > 0) {
        await supabase
          .from('cuisine_types')
          .insert(newCuisines.map((name: string) => ({ name })))
      }

      // Get all cuisine type IDs
      const { data: allCuisines } = await supabase
        .from('cuisine_types')
        .select('id, name')
        .in('name', validatedData.cuisine_types)

      if (allCuisines && allCuisines.length > 0) {
        const cuisineAssociations = allCuisines.map(cuisine => ({
          business_id: business.id,
          cuisine_id: cuisine.id
        }))

        await supabase
          .from('business_cuisines')
          .insert(cuisineAssociations)
      }
    }

    // For full creates, create business hours and menu items
    if (!isQuickCreate) {
      // Create business hours
      if (validatedData.business_hours && validatedData.business_hours.length > 0) {
        const hoursToInsert = validatedData.business_hours.map((hour: any) => ({
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
      }

      // Create menu items
      if (validatedData.menu_items && validatedData.menu_items.length > 0) {
        const menuToInsert = validatedData.menu_items.map((item: any, index: number) => ({
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
    }

    return NextResponse.json({ 
      success: true,
      business,
      message: isQuickCreate 
        ? "Business created successfully and is now live!"
        : "Business registered successfully and is pending review"
    }, { status: 201 })

  } catch (error: any) {
    console.error("Error creating business:", error)
    
    if (error.message?.includes('quota exceeded')) {
      return NextResponse.json({ 
        error: "Business creation limit reached for your account" 
      }, { status: 402 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to create business" 
    }, { status: 500 })
  }
}
