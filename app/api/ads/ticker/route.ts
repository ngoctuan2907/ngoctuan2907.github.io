import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    
    // Fetch active ads in rotation order
    const { data: ads, error } = await supabase
      .from('advertisements')
      .select(`
        id,
        shop_id,
        tier,
        end_at,
        priority,
        businesses!inner(
          id,
          business_name,
          slug,
          is_active
        )
      `)
      .lte('start_at', new Date().toISOString())
      .gte('end_at', new Date().toISOString())
      .eq('businesses.is_active', true)
      .order('tier', { ascending: true }) // 'standard' before 'top' alphabetically, but we want 'top' first
      .order('priority', { ascending: false })
      .order('end_at', { ascending: true })

    if (error) throw error

    // Sort manually to ensure 'top' tier comes first
    const sortedAds = (ads || []).sort((a, b) => {
      // First by tier (top tier first)
      if (a.tier === 'top' && b.tier !== 'top') return -1
      if (a.tier !== 'top' && b.tier === 'top') return 1
      
      // Then by priority (descending)
      if (a.priority !== b.priority) return b.priority - a.priority
      
      // Finally by end_at (ascending - soonest ending first)
      return new Date(a.end_at).getTime() - new Date(b.end_at).getTime()
    })

    // Transform the data for the ticker
    const tickerItems = sortedAds.map(ad => ({
      id: ad.id,
      shop_id: ad.shop_id,
      shop_name: (ad.businesses as any).business_name,
      shop_slug: (ad.businesses as any).slug,
      tier: ad.tier,
      end_at: ad.end_at
    }))

    return NextResponse.json({ 
      success: true,
      ads: tickerItems,
      count: tickerItems.length
    })
  } catch (error) {
    console.error("Error fetching ticker ads:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch ticker ads",
      ads: [],
      count: 0
    }, { status: 500 })
  }
}
