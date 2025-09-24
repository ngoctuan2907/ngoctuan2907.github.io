import { type NextRequest, NextResponse } from "next/server"
import { getBusinesses } from "@/lib/database"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('[ENV] SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('[ENV] ANON key present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const supabase = createServerClientForApi()
    const { searchParams } = request.nextUrl
    const district = searchParams.get("district") || undefined
    const cuisine = searchParams.get("cuisine") || undefined
    const search = searchParams.get("search") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const businesses = await getBusinesses(supabase, {
      district,
      cuisine,
      search,
      limit,
    }).catch((e) => {
      console.error('getBusinesses failed:', JSON.stringify(e, null, 2))
      throw e
    })

    return NextResponse.json({ 
      success: true,
      businesses 
    })
  } catch (error) {
    console.error("Error fetching businesses:", JSON.stringify(error, null, 2))
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}
