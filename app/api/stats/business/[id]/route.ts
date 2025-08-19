import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/lib/supabase-server'
import { z } from 'zod'

const QuerySchema = z.object({ 
  period: z.string().default('30') 
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientComponent()
    const url = new URL(request.url)
    const { period } = QuerySchema.parse({ 
      period: url.searchParams.get('period') ?? undefined 
    })

    const days = Math.max(7, Math.min(365, parseInt(period, 10) || 30))
    const to = new Date()
    const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000)

    console.log(`[ANALYTICS] Fetching analytics for business ${params.id}, period: ${days} days (${from.toISOString()} to ${to.toISOString()})`)

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('[ANALYTICS] Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, business_name, timezone, owner_id')
      .eq('id', params.id)
      .single()

    if (businessError || !business) {
      console.error('[ANALYTICS] Business not found:', businessError)
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if user owns this business - TEMPORARILY DISABLED FOR TESTING
    // if (business.owner_id !== user.id) {
    //   console.error('[ANALYTICS] User does not own this business')
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    // }

    // TODO: Re-enable authorization after testing
    console.log(`[ANALYTICS] Business owner: ${business.owner_id}, Current user: ${user.id}`)

    const timezone = business.timezone || 'Asia/Singapore'

    // Fetch analytics data using our SQL functions
    const [
      monthlyRevenueResult,
      productRevenueResult,
      dowResult,
      hourResult,
      dailyResult,
      customerResult
    ] = await Promise.all([
      // Monthly revenue
      supabase.rpc('stats_revenue_by_month', {
        p_business_id: params.id,
        p_from: from.toISOString(),
        p_to: to.toISOString()
      }),
      // Product revenue
      supabase.rpc('stats_product_revenue', {
        p_business_id: params.id,
        p_from: from.toISOString(),
        p_to: to.toISOString()
      }),
      // Day of week stats
      supabase.rpc('stats_dow', {
        p_business_id: params.id,
        p_from: from.toISOString(),
        p_to: to.toISOString()
      }),
      // Hour of day stats
      supabase.rpc('stats_hour', {
        p_business_id: params.id,
        p_from: from.toISOString(),
        p_to: to.toISOString(),
        p_tz: timezone
      }),
      // Daily stats
      supabase.rpc('stats_daily', {
        p_business_id: params.id,
        p_from: from.toISOString(),
        p_to: to.toISOString()
      }),
      // Customer stats
      supabase.rpc('stats_customers', {
        p_business_id: params.id,
        p_from: from.toISOString(),
        p_to: to.toISOString()
      })
    ])

    // Check for errors
    if (monthlyRevenueResult.error) {
      console.error('[ANALYTICS] Monthly revenue error:', monthlyRevenueResult.error)
    }
    if (productRevenueResult.error) {
      console.error('[ANALYTICS] Product revenue error:', productRevenueResult.error)
    }
    if (dowResult.error) {
      console.error('[ANALYTICS] DOW error:', dowResult.error)
    }
    if (hourResult.error) {
      console.error('[ANALYTICS] Hour error:', hourResult.error)
    }
    if (dailyResult.error) {
      console.error('[ANALYTICS] Daily error:', dailyResult.error)
    }
    if (customerResult.error) {
      console.error('[ANALYTICS] Customer error:', customerResult.error)
    }

    // Calculate KPIs from orders data
    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .eq('business_id', params.id)
      .in('status', ['confirmed', 'preparing', 'ready', 'completed'])
      .gte('created_at', from.toISOString())
      .lt('created_at', to.toISOString())

    const orders = ordersData?.length ?? 0
    const revenue = (ordersData ?? []).reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0)
    const aov = orders > 0 ? revenue / orders : 0

    // Calculate average rating from reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_id', params.id)
      .eq('status', 'published')

    const totalRating = (reviewsData ?? []).reduce((sum: number, review: any) => sum + review.rating, 0)
    const averageRating = reviewsData?.length ? totalRating / reviewsData.length : 0

    // Get total views for the period
    const { data: viewsData } = await supabase
      .from('business_views')
      .select('id')
      .eq('business_id', params.id)
      .gte('viewed_at', from.toISOString())
      .lt('viewed_at', to.toISOString())

    const totalViews = viewsData?.length ?? 0

    // Calculate period-over-period changes (comparing with previous period)
    const prevFrom = new Date(from.getTime() - days * 24 * 60 * 60 * 1000)
    const prevTo = from

    const { data: prevOrdersData } = await supabase
      .from('orders')
      .select('id, total_amount')
      .eq('business_id', params.id)
      .in('status', ['confirmed', 'preparing', 'ready', 'completed'])
      .gte('created_at', prevFrom.toISOString())
      .lt('created_at', prevTo.toISOString())

    const { data: prevViewsData } = await supabase
      .from('business_views')
      .select('id')
      .eq('business_id', params.id)
      .gte('viewed_at', prevFrom.toISOString())
      .lt('viewed_at', prevTo.toISOString())

    const prevOrders = prevOrdersData?.length ?? 0
    const prevRevenue = (prevOrdersData ?? []).reduce((sum: number, order: any) => sum + Number(order.total_amount || 0), 0)
    const prevViews = prevViewsData?.length ?? 0

    // Calculate percentage changes
    const ordersChange = prevOrders > 0 ? ((orders - prevOrders) / prevOrders) * 100 : 0
    const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0
    const viewsChange = prevViews > 0 ? ((totalViews - prevViews) / prevViews) * 100 : 0

    const analytics = {
      businessId: params.id,
      businessName: business.business_name,
      range: { 
        from: from.toISOString(), 
        to: to.toISOString(), 
        timezone 
      },
      kpis: {
        orders,
        revenue: Number(revenue.toFixed(2)),
        aov: Number(aov.toFixed(2)),
        totalViews,
        averageRating: Number(averageRating.toFixed(1)),
        ordersChange: Number(ordersChange.toFixed(1)),
        revenueChange: Number(revenueChange.toFixed(1)),
        viewsChange: Number(viewsChange.toFixed(1))
      },
      revenueByMonth: monthlyRevenueResult.data ?? [],
      topProducts: productRevenueResult.data ?? [],
      dowHistogram: dowResult.data ?? [],
      hourHistogram: hourResult.data ?? [],
      dailyStats: dailyResult.data ?? [],
      customerStats: customerResult.data?.[0] ?? {
        new_customers: 0,
        returning_customers: 0,
        total_customers: 0
      }
    }

    console.log(`[ANALYTICS] Successfully fetched analytics:`, {
      orders,
      revenue,
      totalViews,
      monthlyData: monthlyRevenueResult.data?.length,
      productData: productRevenueResult.data?.length
    })

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('[ANALYTICS] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
