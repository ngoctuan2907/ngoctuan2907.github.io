import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { z } from "zod"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const createMembershipSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  role: z.enum(['stakeholder_owner', 'staff', 'clerk']),
  stakeholder_id: z.string().uuid().optional(),
  shop_id: z.string().uuid().optional()
}).refine(
  (data) => {
    // stakeholder_owner and staff require stakeholder_id
    if (['stakeholder_owner', 'staff'].includes(data.role)) {
      return !!data.stakeholder_id && !data.shop_id
    }
    // clerk requires shop_id
    if (data.role === 'clerk') {
      return !!data.shop_id && !data.stakeholder_id
    }
    return false
  },
  {
    message: "Role assignments require proper scope: stakeholder_owner/staff need stakeholder_id, clerk needs shop_id"
  }
)

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createMembershipSchema.parse(body)

    // Check if current user has permission to create this membership
    let hasPermission = false

    // Platform admins can create any membership
    const { data: adminCheck } = await supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (adminCheck) {
      hasPermission = true
    } else {
      // Check if user is stakeholder_owner or staff for the relevant stakeholder
      if (validatedData.stakeholder_id) {
        const { data: membershipCheck } = await supabase
          .from('memberships')
          .select('role')
          .eq('user_id', user.id)
          .eq('stakeholder_id', validatedData.stakeholder_id)
          .in('role', ['stakeholder_owner', 'staff'])
          .single()

        hasPermission = !!membershipCheck
      } else if (validatedData.shop_id) {
        // For clerk role, check if user has permission over the shop's stakeholder
        const { data: shopCheck } = await supabase
          .from('businesses')
          .select('stakeholder_id')
          .eq('id', validatedData.shop_id)
          .single()

        if (shopCheck?.stakeholder_id) {
          const { data: membershipCheck } = await supabase
            .from('memberships')
            .select('role')
            .eq('user_id', user.id)
            .eq('stakeholder_id', shopCheck.stakeholder_id)
            .in('role', ['stakeholder_owner', 'staff'])
            .single()

          hasPermission = !!membershipCheck
        }
      }
    }

    if (!hasPermission) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Create the membership
    const { data: membership, error } = await supabase
      .from('memberships')
      .insert({
        user_id: validatedData.user_id,
        role: validatedData.role,
        stakeholder_id: validatedData.stakeholder_id || null,
        shop_id: validatedData.shop_id || null
      })
      .select(`
        *,
        stakeholders(name),
        businesses(business_name)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      membership 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating membership:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to create membership" 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const stakeholderId = searchParams.get("stakeholder_id")
    const shopId = searchParams.get("shop_id")

    let query = supabase
      .from('memberships')
      .select(`
        *,
        user_profiles!inner(first_name, last_name),
        stakeholders(name),
        businesses(business_name)
      `)

    if (stakeholderId) {
      query = query.eq('stakeholder_id', stakeholderId)
    }
    if (shopId) {
      query = query.eq('shop_id', shopId)
    }

    const { data: memberships, error } = await query
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      memberships 
    })
  } catch (error: any) {
    console.error("Error fetching memberships:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch memberships" 
    }, { status: 500 })
  }
}
