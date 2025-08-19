-- ============================================================================
-- Fix cuisine_types RLS - Disable RLS for reference data
-- Date: 2025-08-03
-- ============================================================================

-- Explicitly disable RLS on cuisine_types as it's reference data
ALTER TABLE cuisine_types DISABLE ROW LEVEL SECURITY;
-- Drop any existing policies on cuisine_types (if any exist)
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT pg_policies.policyname 
        FROM pg_policies 
        WHERE pg_policies.schemaname = 'public' 
        AND pg_policies.tablename = 'cuisine_types'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_name) || ' ON public.cuisine_types';
        RAISE NOTICE 'Dropped policy: %', policy_name;
    END LOOP;
END $$;
-- Ensure authenticated users can read cuisine_types
GRANT SELECT ON cuisine_types TO authenticated;
GRANT SELECT ON cuisine_types TO anon;
-- Verify the change
DO $$
DECLARE
    rls_enabled BOOLEAN;
BEGIN
    SELECT pg_class.relrowsecurity INTO rls_enabled
    FROM pg_class
    JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
    WHERE pg_namespace.nspname = 'public' 
    AND pg_class.relname = 'cuisine_types';
    
    IF NOT rls_enabled THEN
        RAISE NOTICE '✅ RLS successfully disabled on cuisine_types';
    ELSE
        RAISE NOTICE '⚠️  RLS is still enabled on cuisine_types';
    END IF;
END $$;
COMMENT ON TABLE cuisine_types IS 'Reference data table - RLS disabled for public access';
