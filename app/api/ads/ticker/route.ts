import { NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClientForApi()
    const now = new Date().toISOString()

    // First, try to get ads without join to see if we can fetch them at all
    const { data: adsData, error: adsError } = await supabase
      .from('advertisements')
      .select('*')
      .lte('start_at', now)
      .gte('end_at', now)
      .order('tier', { ascending: false })
      .order('priority', { ascending: false })
      .order('end_at', { ascending: true })
      .limit(10)

    // Handle the case where the advertisements table doesn't exist yet
    if (adsError && adsError.code === '42P01') {
      console.log('Advertisements table does not exist yet, returning empty result')
      return NextResponse.json({ success: true, ads: [], count: 0 })
    }

    if (adsError) {
      console.error('Error fetching ads:', adsError)
      return NextResponse.json({ success: false, error: 'Failed to fetch ads', ads: [], count: 0 }, { status: 500 })
    }

    // If no ads, return empty result
    if (!adsData || adsData.length === 0) {
      return NextResponse.json({ success: true, ads: [], count: 0 })
    }

    // Get business IDs from ads
    const shopIds = adsData.map(ad => ad.shop_id)

    // Fetch businesses separately
    const { data: businessData, error: businessError } = await supabase
      .from('businesses')
      .select('id, business_name, slug, is_active')
      .in('id', shopIds)
      .eq('is_active', true)

    if (businessError) {
      console.error('Error fetching businesses:', businessError)
      return NextResponse.json({ success: false, error: 'Failed to fetch businesses', ads: [], count: 0 }, { status: 500 })
    }

    // Create business lookup map
    const businessMap: Record<string, any> = (businessData || []).reduce((acc: Record<string, any>, business) => {
      acc[business.id] = business
      return acc
    }, {})

    // Combine ads with business data
    const payload = adsData
      .filter(ad => businessMap[ad.shop_id]) // Only include ads for active businesses
      .map(ad => ({
        id: ad.id,
        shop_id: ad.shop_id,
        shop_name: businessMap[ad.shop_id].business_name,
        shop_slug: businessMap[ad.shop_id].slug,
        tier: ad.tier,
        end_at: ad.end_at
      }))

    return NextResponse.json({ success: true, ads: payload, count: payload.length })
  } catch (error) {
    console.error('Error fetching ticker ads:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch ticker ads', ads: [], count: 0 }, { status: 500 })
  }
}
