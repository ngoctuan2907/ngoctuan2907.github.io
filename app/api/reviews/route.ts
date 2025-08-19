import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    const { searchParams } = request.nextUrl
    const businessId = searchParams.get("business_id")
    const limit = parseInt(searchParams.get("limit") || "10")
    
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
    
    if (businessId) {
      query = query.eq('business_id', businessId)
    }
    
    const { data: reviews, error } = await query.limit(limit)
    
    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, reviews: reviews || [] })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClientForApi()
  try {
    const body = await request.json()
    const { business_id, customer_id, rating, comment } = body

    // Validate required fields
    if (!business_id || !customer_id || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        business_id,
        customer_id,
        rating,
        comment,
        status: "published",
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json({ error: "You have already reviewed this business" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ review: data }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
