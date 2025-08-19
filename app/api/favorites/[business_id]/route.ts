import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { business_id: string } }) {
  const supabase = createServerClientForApi()
  try {
    const businessId = params.business_id

    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if business is in favorites
    const { data, error } = await supabase
      .from("saved_cafes")
      .select("id")
      .eq("user_id", user.id)
      .eq("business_id", businessId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error
    }

    return NextResponse.json({ 
      success: true,
      isFavorited: !!data
    })
  } catch (error) {
    console.error("Error checking favorite status:", error)
    return NextResponse.json({ 
      success: false,
      error: "Failed to check favorite status",
      isFavorited: false
    }, { status: 500 })
  }
}