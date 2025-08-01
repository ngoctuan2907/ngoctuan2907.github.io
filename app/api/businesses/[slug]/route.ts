import { type NextRequest, NextResponse } from "next/server"
import { getBusinessBySlug, createBusinessView } from "@/lib/database"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const business = await getBusinessBySlug(params.slug)

    // Track the view
    const forwardedFor = request.headers.get("x-forwarded-for")
    const userAgent = request.headers.get("user-agent")
    const viewerIp = forwardedFor?.split(",")[0] || "unknown"

    await createBusinessView(business.id, viewerIp, userAgent || undefined)

    return NextResponse.json({ business })
  } catch (error) {
    console.error("Error fetching business:", error)
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }
}
