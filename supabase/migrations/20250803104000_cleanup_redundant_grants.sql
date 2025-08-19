-- ============================================================================
-- Clean up redundant SELECT grants on RLS tables
-- Date: 2025-08-03
-- ============================================================================

-- Remove redundant SELECT grants on RLS-protected tables
-- RLS policies should control access, not blanket grants

REVOKE SELECT ON user_profiles FROM authenticated;
REVOKE SELECT ON businesses FROM authenticated;
REVOKE SELECT ON reviews FROM authenticated;
REVOKE SELECT ON orders FROM authenticated;
REVOKE SELECT ON business_views FROM authenticated;
-- Keep these grants that are intentional:
-- - cuisine_types: reference data, no RLS
-- - business_views: INSERT needed for analytics tracking

-- Verify the cleanup
DO $$
DECLARE
    grant_count INTEGER;
BEGIN
    RAISE NOTICE '🔍 Verifying grant cleanup...';
    
    -- Check for any SELECT grants on RLS-protected tables to authenticated role
    SELECT COUNT(*) INTO grant_count
    FROM information_schema.role_table_grants
    WHERE grantee = 'authenticated'
    AND privilege_type = 'SELECT'
    AND table_schema = 'public'
    AND table_name IN ('user_profiles', 'businesses', 'reviews', 'orders', 'business_views');
    
    IF grant_count = 0 THEN
        RAISE NOTICE '✅ No redundant SELECT grants on RLS tables (policies control access)';
    ELSE
        RAISE NOTICE '⚠️  Still found % SELECT grants on RLS tables', grant_count;
    END IF;
    
    -- Verify cuisine_types still has its grant
    IF EXISTS (
        SELECT 1 FROM information_schema.role_table_grants
        WHERE grantee = 'authenticated'
        AND privilege_type = 'SELECT'
        AND table_schema = 'public'
        AND table_name = 'cuisine_types'
    ) THEN
        RAISE NOTICE '✅ SELECT grant preserved on cuisine_types (reference data)';
    ELSE
        RAISE NOTICE '❌ Missing SELECT grant on cuisine_types';
    END IF;
END $$;
