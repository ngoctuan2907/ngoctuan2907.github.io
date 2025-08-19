import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClientComponent()
    
    const { data: business, error } = await supabase
      .from('businesses')
      .select(`
        *,
        business_cuisines(cuisine_types(*)),
        reviews(*),
        menu_items(*),
        business_hours(*)
      `)
      .eq('id', params.id)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 }
      )
    }

    if (!business) {
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