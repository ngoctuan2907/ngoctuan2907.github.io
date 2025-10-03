import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientComponent()
    const identifier = params.id
    
    // First try to find by ID (if it's numeric)
    let business = null
    let error = null
    
    const isNumericId = /^\d+$/.test(identifier)
    
    if (isNumericId) {
      const result = await supabase
        .from('businesses')
        .select(`
          *,
          business_cuisines(cuisine_types(*)),
          reviews(*),
          menu_items(*),
          business_hours(*)
        `)
        .eq('id', identifier)
        .single()
      
      business = result.data
      error = result.error
    }
    
    // If not found by ID or identifier is not numeric, try by slug
    if (!business) {
      const result = await supabase
        .from('businesses')
        .select(`
          *,
          business_cuisines(cuisine_types(*)),
          reviews(*),
          menu_items(*),
          business_hours(*)
        `)
        .eq('slug', identifier)
        .single()
      
      business = result.data
      error = result.error
    }

    if (error || !business) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      business
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'