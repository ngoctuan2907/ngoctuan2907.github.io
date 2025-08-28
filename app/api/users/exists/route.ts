import { type NextRequest, NextResponse } from "next/server"
import { createServerClientForApi } from "@/lib/supabase-api"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClientForApi()
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ 
        error: "Email parameter is required" 
      }, { status: 400 })
    }

    // Check if user exists in auth.users by searching via RPC or profiles table
    // Since we can't directly query auth.users from client, we'll check if they can sign in
    // or if they have any associated data
    
    // Try to find user by looking for their data in the database
    // This is a simplified approach - in production you might want to store user emails in a profiles table
    const { data: existingMemberships } = await supabase
      .from('memberships')
      .select('user_id')
      .limit(1)

    const { data: existingOrders } = await supabase  
      .from('orders')
      .select('user_id')
      .eq('customer_email', email)
      .limit(1)

    // For this endpoint, we'll return a basic response since we can't directly check auth.users
    // In a real app, you'd typically have a profiles table that mirrors auth.users
    const exists = existingMemberships && existingMemberships.length > 0 || 
                   existingOrders && existingOrders.length > 0

    if (!exists) {
      return NextResponse.json({ 
        exists: false, 
        userType: null 
      })
    }

    const user = { id: existingMemberships?.[0]?.user_id || existingOrders?.[0]?.user_id }

    // User exists, now check what type of user they are
    let userType = 'customer' // default

    // Check if platform admin
    const { data: admin } = await supabase
      .from('platform_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single()

    if (admin) {
      userType = 'platform_admin'
    } else {
      // Check memberships to determine if they're a business user
      const { data: memberships } = await supabase
        .from('memberships')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)

      if (memberships && memberships.length > 0) {
        userType = 'business'
      }
    }

    return NextResponse.json({ 
      exists: true, 
      userType 
    })

  } catch (error: any) {
    console.error('Error checking user existence:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to check user existence' 
    }, { status: 500 })
  }
}