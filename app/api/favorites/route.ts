import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createServerClientForApi()
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's saved cafes
    const { data: savedCafes, error } = await supabase
      .from("saved_cafes")
      .select(`
        id,
        created_at,
        business:business_id (
          id,
          business_name,
          slug,
          description,
          district,
          price_range,
          cover_image_url,
          status
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      favorites: savedCafes 
    })
  } catch (error) {
    console.error("Error fetching favorites:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch favorites",
      favorites: []
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createServerClientForApi()
  try {
    const { business_id } = await request.json()

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Add to favorites
    const { data, error } = await supabase
      .from("saved_cafes")
      .insert({
        user_id: user.id,
        business_id
      })
      .select()
      .single()

    if (error) {
      // Handle duplicate entries
      if (error.code === '23505') {
        return NextResponse.json({ 
          success: false,
          error: "Already in favorites" 
        }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ 
      success: true,
      favorite: data
    }, { status: 201 })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to add to favorites" 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createServerClientForApi()
  try {
    const { searchParams } = request.nextUrl
    const businessId = searchParams.get("business_id")

    if (!businessId) {
      return NextResponse.json({ error: "Business ID required" }, { status: 400 })
    }

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Remove from favorites
    const { error } = await supabase
      .from("saved_cafes")
      .delete()
      .eq("user_id", user.id)
      .eq("business_id", businessId)

    if (error) throw error

    return NextResponse.json({ 
      success: true,
      message: "Removed from favorites"
    })
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to remove from favorites" 
    }, { status: 500 })
  }
}