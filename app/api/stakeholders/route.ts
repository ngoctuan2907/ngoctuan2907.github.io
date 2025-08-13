import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { z } from "zod"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

const createStakeholderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  stripe_customer_id: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is platform admin
    const { data: adminCheck } = await supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (!adminCheck) {
      return NextResponse.json({ error: "Only platform admins can create stakeholders" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createStakeholderSchema.parse(body)

    const { data: stakeholder, error } = await supabase
      .from('stakeholders')
      .insert({
        name: validatedData.name,
        created_by: user.id,
        stripe_customer_id: validatedData.stripe_customer_id,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      stakeholder 
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating stakeholder:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json({
        error: "Invalid input data",
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: error.message || "Failed to create stakeholder" 
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

    const { data: stakeholders, error } = await supabase
      .from('stakeholders')
      .select(`
        *,
        subscriptions(plan, status, current_period_end),
        businesses(id, business_name, is_active)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      stakeholders 
    })
  } catch (error: any) {
    console.error("Error fetching stakeholders:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to fetch stakeholders" 
    }, { status: 500 })
  }
}
