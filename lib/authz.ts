/**
 * Authorization helpers for server-side permission checks
 * Uses admin client to bypass RLS for consistent authz
 */

import { createSupabaseAdmin } from './supabase-server'

export class AuthorizationError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' = 'FORBIDDEN'
  ) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

/**
 * Verifies that a user has stakeholder_owner role for a given stakeholder
 * @param userId - The user ID to check
 * @param stakeholderId - The stakeholder ID to check ownership for
 * @throws AuthorizationError if the user is not a stakeholder owner
 */
export async function requireStakeholderOwner(
  userId: string, 
  stakeholderId: string
): Promise<void> {
  const supabase = createSupabaseAdmin()
  
  const { data: membership, error } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('stakeholder_id', stakeholderId)
    .eq('role', 'stakeholder_owner')
    .single()

  if (error || !membership) {
    throw new AuthorizationError(
      'Only stakeholder owners can perform this action',
      'FORBIDDEN'
    )
  }
}

/**
 * Verifies that a business exists in the database
 * @param businessId - The business ID to validate
 * @throws AuthorizationError if the business does not exist
 */
export async function requireValidBusiness(businessId: string): Promise<void> {
  const supabase = createSupabaseAdmin()
  
  const { data: business, error } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .single()

  if (error || !business) {
    throw new AuthorizationError(
      'Invalid business_id',
      'NOT_FOUND'
    )
  }
}

/**
 * Verifies that all menu items belong to the specified business
 * @param itemIds - Array of menu item IDs to validate
 * @param businessId - The business ID that should own all items
 * @throws AuthorizationError if any item doesn't belong to the business
 */
export async function requireItemsBelongToBusiness(
  itemIds: string[],
  businessId: string
): Promise<void> {
  const supabase = createSupabaseAdmin()
  
  const { data: items, error } = await supabase
    .from('menu_items')
    .select('id, business_id')
    .in('id', itemIds)

  if (error) {
    throw new AuthorizationError(
      'Failed to validate menu items',
      'NOT_FOUND'
    )
  }

  if (!items || items.length !== itemIds.length) {
    throw new AuthorizationError(
      'One or more menu items not found',
      'NOT_FOUND'
    )
  }

  // Check if all items belong to the specified business
  const invalidItems = items.filter(item => item.business_id !== businessId)
  if (invalidItems.length > 0) {
    throw new AuthorizationError(
      'Cross-business items are not allowed in a single order',
      'FORBIDDEN'
    )
  }
}