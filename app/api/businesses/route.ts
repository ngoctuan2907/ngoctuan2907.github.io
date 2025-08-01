import { type NextRequest, NextResponse } from "next/server"
import { getBusinesses } from "@/lib/database"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const district = searchParams.get("district") || undefined
    const cuisine = searchParams.get("cuisine") || undefined
    const search = searchParams.get("search") || undefined
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    const businesses = await getBusinesses({
      district,
      cuisine,
      search,
      limit,
    })

    return NextResponse.json({ businesses })
  } catch (error) {
    console.error("Error fetching businesses:", error)
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}
