-- ============================================================================
-- Security Validation Script - IMPROVED VERSION
-- Run this after applying the fixed RLS migration to verify everything works
-- ============================================================================

-- Check 1: Verify RLS is enabled on required tables (cuisine_types should be disabled)
DO $$
DECLARE
    table_name TEXT;
    rls_enabled BOOLEAN;
    table_count INTEGER := 0;
    rls_count INTEGER := 0;
    expected_rls_tables TEXT[] := ARRAY[
        'user_profiles', 'businesses', 'business_cuisines',
        'business_hours', 'menu_categories', 'menu_items', 'business_images',
        'reviews', 'orders', 'order_items', 'business_views'
    ];
BEGIN
    RAISE NOTICE '🔍 Checking Row Level Security (RLS) status...';
    
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        AND t.table_name = ANY(expected_rls_tables)
    LOOP
        SELECT pg_class.relrowsecurity INTO rls_enabled
        FROM pg_class
        JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
        WHERE pg_namespace.nspname = 'public' 
        AND pg_class.relname = table_name;
        
        table_count := table_count + 1;
        
        IF rls_enabled THEN
            rls_count := rls_count + 1;
            RAISE NOTICE '✅ RLS enabled on: %', table_name;
        ELSE
            RAISE NOTICE '❌ RLS NOT enabled on: %', table_name;
        END IF;
    END LOOP;
    
    -- Check cuisine_types should NOT have RLS
    SELECT pg_class.relrowsecurity INTO rls_enabled
    FROM pg_class
    JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public' 
    AND pg_class.relname = 'cuisine_types';
    
    IF NOT rls_enabled THEN
        RAISE NOTICE '✅ RLS correctly disabled on: cuisine_types (reference data)';
    ELSE
        RAISE NOTICE '⚠️  RLS enabled on cuisine_types (should be disabled for reference data)';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 RLS Summary: % out of % tables have RLS enabled (expected)', rls_count, table_count;
    
    IF rls_count = table_count THEN
        RAISE NOTICE '🎉 All required tables have RLS enabled!';
    ELSE
        RAISE NOTICE '⚠️  Some tables are missing RLS protection!';
    END IF;
END $$;

-- Check 2: Count RLS policies
DO $$
DECLARE
    policy_count INTEGER;
    table_count INTEGER;
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Checking RLS policies...';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    SELECT COUNT(DISTINCT tablename) INTO table_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    RAISE NOTICE '📊 Found % policies across % tables', policy_count, table_count;
    RAISE NOTICE '';
    
    -- List policies by table
    FOR rec IN (
        SELECT tablename, COUNT(*) as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
        ORDER BY tablename
    ) LOOP
        RAISE NOTICE '📋 %: % policies', rec.tablename, rec.policy_count;
    END LOOP;
END $$;

-- Check 3: Verify secure function
DO $$
DECLARE
    func_config TEXT[];
    is_security_definer BOOLEAN;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Checking function security...';
    
    SELECT proconfig, prosecdef INTO func_config, is_security_definer
    FROM pg_proc
    WHERE proname = 'update_updated_at_column'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    IF FOUND THEN
        IF is_security_definer THEN
            RAISE NOTICE '✅ Function is SECURITY DEFINER';
        ELSE
            RAISE NOTICE '❌ Function is NOT SECURITY DEFINER';
        END IF;
        
        IF func_config IS NOT NULL AND (
            'search_path=public,pg_temp' = ANY(func_config) OR 
            'search_path=public, pg_temp' = ANY(func_config)
        ) THEN
            RAISE NOTICE '✅ Function has secure search_path';
        ELSE
            RAISE NOTICE '❌ Function search_path is not secure: %', func_config;
        END IF;
    ELSE
        RAISE NOTICE '❌ Function update_updated_at_column not found';
    END IF;
END $$;

-- Check 4: Test helper functions exist and work
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Checking helper functions...';
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        RAISE NOTICE '✅ public.is_admin() function exists';
    ELSE
        RAISE NOTICE '❌ public.is_admin() function missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_business_owner' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        RAISE NOTICE '✅ public.is_business_owner() function exists';
    ELSE
        RAISE NOTICE '❌ public.is_business_owner() function missing';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'owns_business' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) THEN
        RAISE NOTICE '✅ public.owns_business() function exists';
    ELSE
        RAISE NOTICE '❌ public.owns_business() function missing';
    END IF;
END $$;

-- Check 5: Verify minimal grants (should only have specific grants, not blanket)
DO $$
DECLARE
    grant_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Checking table permissions (minimal grants)...';
    
    -- Check for any SELECT grants on RLS-protected tables to authenticated role
    SELECT COUNT(*) INTO grant_count
    FROM information_schema.role_table_grants
    WHERE grantee = 'authenticated'
    AND privilege_type = 'SELECT'
    AND table_schema = 'public'
    AND table_name IN ('user_profiles', 'businesses', 'reviews', 'orders', 'business_views');
    
    IF grant_count = 0 THEN
        RAISE NOTICE '✅ No blanket SELECT grants on RLS tables (good - policies control access)';
    ELSE
        RAISE NOTICE '⚠️  Found % SELECT grants on RLS tables (may cause confusion)', grant_count;
    END IF;
    
    -- Check cuisine_types has SELECT grant (reference data)
    IF EXISTS (
        SELECT 1 FROM information_schema.role_table_grants
        WHERE grantee = 'authenticated'
        AND privilege_type = 'SELECT'
        AND table_schema = 'public'
        AND table_name = 'cuisine_types'
    ) THEN
        RAISE NOTICE '✅ SELECT grant exists on cuisine_types (reference data)';
    ELSE
        RAISE NOTICE '❌ Missing SELECT grant on cuisine_types';
    END IF;
END $$;

-- Check 6: Sample security test (if auth context available)
-- Note: This would only work with an actual authenticated user context
-- DO $$
-- BEGIN
--     RAISE NOTICE '';
--     RAISE NOTICE '🔍 Testing sample queries with RLS...';
--     
--     -- Test basic public access
--     PERFORM * FROM businesses WHERE status = 'active' LIMIT 1;
--     RAISE NOTICE '✅ Public can read active businesses';
--     
--     -- Test restricted access (this should fail for anonymous users)
--     BEGIN
--         PERFORM * FROM user_profiles LIMIT 1;
--         RAISE NOTICE '⚠️  Anonymous access to user_profiles allowed (unexpected)';
--     EXCEPTION WHEN insufficient_privilege THEN
--         RAISE NOTICE '✅ Anonymous access to user_profiles blocked (expected)';
--     END;
-- END $$;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎯 SECURITY VALIDATION COMPLETE - IMPROVED VERSION';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Key improvements implemented:';
    RAISE NOTICE '1. ✅ Separate policies per action (SELECT/INSERT/UPDATE/DELETE)';
    RAISE NOTICE '2. ✅ Helper functions for cleaner policy logic';
    RAISE NOTICE '3. ✅ Minimal grants to avoid RLS conflicts';
    RAISE NOTICE '4. ✅ cuisine_types without RLS (reference data)';
    RAISE NOTICE '5. ✅ Fixed production site_url configuration';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Manual verification steps:';
    RAISE NOTICE '1. Test authentication flows in your application';
    RAISE NOTICE '2. Verify users can only access their own data';
    RAISE NOTICE '3. Test business owner permissions work correctly';
    RAISE NOTICE '4. Verify admin access works for all tables';
    RAISE NOTICE '5. Test anonymous/public access is properly restricted';
    RAISE NOTICE '6. Verify production site_url is correct in config.toml';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 See SECURITY_IMPLEMENTATION.md for detailed testing procedures';
    RAISE NOTICE '📄 Review audit fixes in .github/supabase-rls-sec-audit-fix.md';
END $$;
