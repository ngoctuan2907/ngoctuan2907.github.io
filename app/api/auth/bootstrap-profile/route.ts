import { NextResponse } from 'next/server'
import { createServerClientForApi } from '@/lib/supabase-api'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createServerClientForApi()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Upsert user profile
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Business Owner'
  const [firstName, ...lastNameParts] = fullName.split(' ')
  const lastName = lastNameParts.join(' ') || 'User'

  const { error: profileErr } = await supabase
    .from('user_profiles')
    .upsert({ 
      user_id: user.id, 
      first_name: firstName,
      last_name: lastName,
      user_type: 'business_owner'
    }, { 
      onConflict: 'user_id' 
    })
  if (profileErr) {
    console.error('Profile upsert failed:', profileErr)
    return NextResponse.json({ error: 'Profile upsert failed' }, { status: 500 })
  }

  // Ensure a stakeholder row for the owner
  const { data: existingStakeholder } = await supabase
    .from('stakeholders')
    .select('id')
    .eq('created_by', user.id)
    .maybeSingle()

  let stakeholderId = existingStakeholder?.id

  if (!stakeholderId) {
    const { data: newStakeholder, error: stakeholderError } = await supabase
      .from('stakeholders')
      .insert({ 
        created_by: user.id, 
        name: user.user_metadata?.full_name || 'My Coffee Business', 
        status: 'inactive' 
      })
      .select('id')
      .single()

    if (stakeholderError || !newStakeholder) {
      console.error('Stakeholder create failed:', stakeholderError)
      return NextResponse.json({ error: 'Stakeholder create failed' }, { status: 500 })
    }
    stakeholderId = newStakeholder.id
  }

  // Ensure membership role
  const { error: membershipErr } = await supabase
    .from('memberships')
    .upsert({ 
      user_id: user.id, 
      stakeholder_id: stakeholderId, 
      role: 'stakeholder_owner' 
    }, { 
      onConflict: 'user_id,stakeholder_id' 
    })

  if (membershipErr) {
    console.error('Membership upsert failed:', membershipErr)
    return NextResponse.json({ error: 'Membership upsert failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, stakeholder_id: stakeholderId })
}