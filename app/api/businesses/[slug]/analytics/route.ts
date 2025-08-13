import { type NextRequest, NextResponse } from "next/server"
import { getBusinessAnalytics, getBusinessBySlug } from "@/lib/database"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = createServerClientForApi()
    const business = await getBusinessBySlug(supabase, params.slug)
    const analytics = await getBusinessAnalytics(supabase, business.id)

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
