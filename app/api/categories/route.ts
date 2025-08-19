import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createServerClientComponent()
    
    // Get all cuisine types with business counts
    const { data: cuisines, error } = await supabase
      .from('cuisine_types')
      .select(`
        id,
        name,
        business_cuisines!inner(
          businesses!inner(
            id,
            status
          )
        )
      `)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Transform and count active businesses for each cuisine
    const categories = cuisines.map(cuisine => {
      const activeBusinessCount = cuisine.business_cuisines.filter(
        (bc: any) => bc.businesses?.status === 'active'
      ).length

      // Map cuisine names to appropriate icons
      const getIcon = (name: string) => {
        const lowerName = name.toLowerCase()
        if (lowerName.includes('local') || lowerName.includes('singapore')) return '🇸🇬'
        if (lowerName.includes('western') || lowerName.includes('american')) return '🍔'
        if (lowerName.includes('asian') || lowerName.includes('chinese') || lowerName.includes('thai')) return '🍜'
        if (lowerName.includes('dessert') || lowerName.includes('sweet') || lowerName.includes('cake')) return '🧁'
        if (lowerName.includes('coffee') || lowerName.includes('cafe')) return '☕'
        if (lowerName.includes('healthy') || lowerName.includes('salad') || lowerName.includes('vegetarian')) return '🥗'
        if (lowerName.includes('indian') || lowerName.includes('curry')) return '🍛'
        if (lowerName.includes('japanese') || lowerName.includes('sushi')) return '🍣'
        if (lowerName.includes('italian') || lowerName.includes('pizza')) return '🍕'
        if (lowerName.includes('mexican')) return '🌮'
        if (lowerName.includes('korean')) return '🥘'
        if (lowerName.includes('mediterranean')) return '🫒'
        return '🍽️' // Default food icon
      }

      return {
        id: cuisine.id,
        name: cuisine.name,
        icon: getIcon(cuisine.name),
        count: activeBusinessCount,
        slug: cuisine.name.toLowerCase().replace(/\s+/g, '-')
      }
    })

    // Filter out categories with zero businesses and sort by count
    const activeCategories = categories
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      success: true,
      categories: activeCategories
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