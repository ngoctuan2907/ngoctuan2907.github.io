import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { z } from "zod"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const createVoucherSchema = z.object({
  shop_id: z.string().uuid("Invalid shop ID"),
  code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code too long"),
  discount_type: z.enum(['percent', 'amount']),
  discount_value: z.number().positive("Discount value must be positive"),
  valid_from: z.string().datetime().optional(),
  valid_to: z.string().datetime().optional(),
  active: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createVoucherSchema.parse(body)

    // Check if user has permission to create vouchers for this shop
    let hasPermission = false

    // Platform admins can create vouchers for any shop
    const { data: adminCheck } = await supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (adminCheck) {
      hasPermission = true
    } else {
      // Check if user has stakeholder_owner, staff, or clerk role for this shop
      const { data: shopData } = await supabase
        .from('businesses')
        .select('stakeholder_id')
        .eq('id', validatedData.shop_id)
        .single()

      if (shopData?.stakeholder_id) {
        const { data: membershipCheck } = await supabase
          .from('memberships')
          .select('role')
          .eq('user_id', user.id)
          .or(`stakeholder_id.eq.${shopData.stakeholder_id},shop_id.eq.${validatedData.shop_id}`)
          .single()

        hasPermission = !!membershipCheck
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions to create vouchers for this shop" }, { status: 403 })
    }

    // Create the voucher
    const { data: voucher, error } = await supabase
      .from('vouchers')
      .insert({
        shop_id: validatedData.shop_id,
        code: validatedData.code.toUpperCase(),
        discount_type: validatedData.discount_type,
        discount_value: validatedData.discount_value,
        valid_from: validatedData.valid_from || null,
        valid_to: validatedData.valid_to || null,
        active: validatedData.active,
        created_by: user.id
      })
      .select(`
        *,
        businesses(business_name, slug)
      `)
      .single()

    if (error) {
      if (error.code === '23505') { // unique constraint violation
        return NextResponse.json({ error: "Voucher code already exists" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ 
      success: true,
      voucher 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating voucher:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to create voucher" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    const { searchParams } = request.nextUrl
    const shopId = searchParams.get("shop_id")
    const activeOnly = searchParams.get("active") === "true"

    let query = supabase
      .from('vouchers')
      .select(`
        *,
        businesses(business_name, slug, is_active)
      `)

    if (shopId) {
      query = query.eq('shop_id', shopId)
    }

    if (activeOnly) {
      query = query.eq('active', true)
      // Also filter by valid dates if they exist
      query = query.or('valid_from.is.null,valid_from.lte.' + new Date().toISOString())
      query = query.or('valid_to.is.null,valid_to.gte.' + new Date().toISOString())
    }

    const { data: vouchers, error } = await query
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      vouchers 
    })
  } catch (error: any) {
    console.error("Error fetching vouchers:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch vouchers" 
    }, { status: 500 })
  }
}
