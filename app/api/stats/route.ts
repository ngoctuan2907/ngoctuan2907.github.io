import { NextResponse } from 'next/server'
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering to avoid 404 caching
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log("📊 [VERCEL LOG] Stats API called at:", new Date().toISOString())

    const supabase = createServerClientForApi()
    let cafesCount = 4 // Default to our mock cafes
    let customersCount = 1247 // Mock data
    let ordersCount = 5692 // Mock data

    try {
      // Try to get real data from database
      const { count: businessCount } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      if (businessCount !== null && businessCount > 0) {
        cafesCount = businessCount
      }

      // TODO: Add real customer and order queries when data is available
      // const { count: customerCount } = await supabase
      //   .from('orders')
      //   .select('user_id', { count: 'exact', head: true })
      //   .eq('status', 'completed')
      //   .group('user_id')
      
      // const { count: orderCount } = await supabase
      //   .from('orders')
      //   .select('id', { count: 'exact', head: true })
      //   .eq('status', 'completed')

    } catch (dbError) {
      console.log("📊 [VERCEL LOG] Using fallback data, DB query failed:", dbError)
      // Keep mock data if DB query fails
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

    console.log("✅ [VERCEL LOG] Stats computed:", stats)

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600' // Cache for 5 min
      }
    })

  } catch (error) {
    console.error("❌ [VERCEL LOG] Stats API error:", error)
    
    // Return fallback data on error
    return NextResponse.json({
      cafes: "4+",
      customers: "1K+", 
      orders: "5K+"
    })
  }
}
