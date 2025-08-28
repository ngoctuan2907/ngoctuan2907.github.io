import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"
import { reconcilePayments } from "@/lib/stripe-reconciliation"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Check if user is authenticated and is a platform admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: isAdmin } = await supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (!isAdmin) {
      return NextResponse.json({ 
        error: "Only platform admins can run reconciliation" 
      }, { status: 403 })
    }

    const { searchParams } = request.nextUrl
    const dateFromParam = searchParams.get('from')
    const dateToParam = searchParams.get('to')

    // Default to today if no dates provided
    const dateTo = dateToParam ? new Date(dateToParam) : new Date()
    const dateFrom = dateFromParam ? new Date(dateFromParam) : new Date(dateTo.getTime() - 24 * 60 * 60 * 1000)

    // Validate dates
    if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
      return NextResponse.json({ 
        error: "Invalid date format. Use YYYY-MM-DD format." 
      }, { status: 400 })
    }

    if (dateFrom > dateTo) {
      return NextResponse.json({ 
        error: "From date must be before to date" 
      }, { status: 400 })
    }

    console.log(`Running reconciliation from ${dateFrom.toISOString()} to ${dateTo.toISOString()}`)

    const report = await reconcilePayments(dateFrom, dateTo)

    return NextResponse.json({
      success: true,
      report
    })

  } catch (error: any) {
    console.error("Error running reconciliation:", error)
    return NextResponse.json({ 
      error: error.message || "Failed to run reconciliation" 
    }, { status: 500 })
  }
}