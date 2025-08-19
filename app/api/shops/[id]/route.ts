import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { z } from "zod"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const updateShopSchema = z.object({
  business_name: z.string().min(1).optional(),
  description: z.string().min(10).optional(),
  specialty: z.string().optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  price_range: z.enum(['$', '$$', '$$$', '$$$$']).optional(),
  instagram_handle: z.string().optional(),
  facebook_url: z.string().url().optional().or(z.literal('')),
  whatsapp_number: z.string().optional(),
  cover_image_url: z.string().url().optional().or(z.literal(''))
}).strict()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientForApi()
    const { id } = params

    const { data: business, error } = await supabase
      .from('businesses')
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
          user_profiles(first_name, last_name)
        ),
        business_images(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ 
      success: true,
      business
    })
  } catch (error: any) {
    console.error("Error fetching shop:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch shop" 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientForApi()
    const { id } = params
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the business first to check permissions
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('stakeholder_id')
      .eq('id', id)
      .single()

    if (businessError) {
      if (businessError.code === 'PGRST116') {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 })
      }
      throw businessError
    }

    // Check if user has permission to update this shop
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .or(`stakeholder_id.eq.${business.stakeholder_id},shop_id.eq.${id}`)
      .in('role', ['stakeholder_owner', 'staff', 'clerk'])
      .single()

    if (!membership) {
      return NextResponse.json({ 
        error: "Insufficient permissions to update this shop" 
      }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateShopSchema.parse(body)

    // Clerks can only update limited fields (you can customize this)
    if (membership.role === 'clerk') {
      const allowedFields = ['specialty', 'phone'] // Very limited for clerks
      const attemptedFields = Object.keys(validatedData)
      const unauthorizedFields = attemptedFields.filter(field => !allowedFields.includes(field))
      
      if (unauthorizedFields.length > 0) {
        return NextResponse.json({ 
          error: `Clerks cannot update: ${unauthorizedFields.join(', ')}` 
        }, { status: 403 })
      }
    }

    // Update the business
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true,
      business: updatedBusiness,
      message: "Shop updated successfully"
    })

  } catch (error: any) {
    console.error("Error updating shop:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to update shop" 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientForApi()
    const { id } = params
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the business first to check permissions
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('stakeholder_id, business_name')
      .eq('id', id)
      .single()

    if (businessError) {
      if (businessError.code === 'PGRST116') {
        return NextResponse.json({ error: "Shop not found" }, { status: 404 })
      }
      throw businessError
    }

    // Only stakeholder owners and staff can delete shops (not clerks)
    const { data: membership } = await supabase
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('stakeholder_id', business.stakeholder_id)
      .in('role', ['stakeholder_owner', 'staff'])
      .single()

    if (!membership) {
      return NextResponse.json({ 
        error: "Only stakeholder owners and staff can delete shops" 
      }, { status: 403 })
    }

    // Soft delete by setting status to closed instead of hard delete
    // This preserves data integrity for orders, reviews, etc.
    const { error: deleteError } = await supabase
      .from('businesses')
      .update({ 
        status: 'closed',
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ 
      success: true,
      message: `Shop "${business.business_name}" has been closed`
    })

  } catch (error: any) {
    console.error("Error deleting shop:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to delete shop" 
    }, { status: 500 })
  }
}