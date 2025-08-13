import { NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClientForApi()
    const now = new Date().toISOString()

    // Explicit FK join with alias `business`
    const { data, error } = await supabase
      .from('advertisements')
      .select(`
        id, shop_id, tier, start_at, end_at, priority,
        business:businesses!advertisements_shop_id_fkey (
          id, business_name, slug, is_active
        )
      `)
      .lte('start_at', now)
      .gte('end_at', now)
      // Only active businesses
      .eq('business.is_active', true)
      // Sort: top tier first (desc), then higher priority first, then earliest ending
      .order('tier', { ascending: false })
      .order('priority', { ascending: false })
      .order('end_at', { ascending: true })
      .limit(10)

    if (error) throw error

    const raw = data || []
    const ads = raw.map((row: any) => {
      const biz = Array.isArray(row.business) ? row.business[0] : row.business
      return { ...row, business: biz }
    }).filter(a => a.business && a.business.is_active)

    const payload = ads.map((a: any) => ({
      id: a.id,
      shop_id: a.shop_id,
      shop_name: a.business.business_name,
      shop_slug: a.business.slug,
      tier: a.tier,
      end_at: a.end_at
    }))

    return NextResponse.json({ success: true, ads: payload, count: payload.length })
  } catch (error) {
    console.error('Error fetching ticker ads:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch ticker ads', ads: [], count: 0 }, { status: 500 })
  }
}
