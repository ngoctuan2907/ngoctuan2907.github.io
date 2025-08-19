import { NextRequest, NextResponse } from 'next/server'
import { createServerClientComponent } from '@/lib/supabase-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  intended_business_name: z.string().optional(),
})

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClientComponent()
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Update user profile
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update({
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        phone: validatedData.phone || null,
        intended_business_name: validatedData.intended_business_name || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Profile update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profile updated successfully' 
    })

  } catch (error: any) {
    console.error('Profile update error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}