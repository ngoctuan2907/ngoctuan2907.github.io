import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/database"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
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
