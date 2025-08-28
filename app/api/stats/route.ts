import { NextResponse } from 'next/server'
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering to avoid 404 caching
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log("📊 [STATS API] Called at:", new Date().toISOString())

    const supabase = createServerClientForApi()
    
    // Initialize with zero values - real data only
    let cafesCount = 0
    let customersCount = 0
    let ordersCount = 0

    try {
      // Get real business count
      const { count: businessCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (businessCount !== null) {
        cafesCount = businessCount
      }

      // Get real customer count (distinct users who have placed orders)
      const { data: customerData, error: customerError } = await supabase
        .from('orders')
        .select('customer_id')
        .not('customer_id', 'is', null)

      if (!customerError && customerData) {
        const uniqueCustomers = new Set(customerData.map(o => o.customer_id))
        customersCount = uniqueCustomers.size
      }
      
      // Get real order count  
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['confirmed', 'completed', 'delivered'])

      if (orderCount !== null) {
        ordersCount = orderCount
      }

    } catch (dbError) {
      console.log("📊 [STATS API] DB query failed:", dbError)
      // Return zeros if DB fails - no fake data
      cafesCount = 0
      customersCount = 0
      ordersCount = 0
    }

    // Format numbers with + suffix if over threshold
    const formatStat = (num: number) => {
      if (num >= 1000) {
        return `${Math.floor(num / 1000)}K+`
      } else if (num >= 100) {
        return `${Math.floor(num / 100) * 100}+`
      }
      return num.toString()
    }

    const stats = {
      cafes: formatStat(cafesCount),
      customers: formatStat(customersCount), 
      orders: formatStat(ordersCount)
    }

    console.log("✅ [STATS API] Stats computed:", stats)

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600' // Cache for 5 min
      }
    })

  } catch (error) {
    console.error("❌ [STATS API] Error:", error)
    
    // Return zero data on error - no fake data
    return NextResponse.json({
      cafes: "0",
      customers: "0", 
      orders: "0"
    })
  }
}
