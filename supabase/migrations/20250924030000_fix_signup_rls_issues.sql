-- ============================================================================
-- Fix Signup RLS Issues Migration
-- Addresses critical RLS security issues preventing signup
-- Date: 2025-09-24
-- ============================================================================

-- 1. Fix cuisine_types RLS issue (has policies but RLS disabled)
-- The security lint shows this table has policies but RLS is disabled
-- Let's enable RLS and ensure proper policies exist

ALTER TABLE cuisine_types ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the public read policy to ensure it works
DO $$ BEGIN
    DROP POLICY IF EXISTS public_read_cuisine_types ON cuisine_types;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY public_read_cuisine_types
ON cuisine_types FOR SELECT USING (true);

-- 2. Fix platform_admins RLS issue (public table without RLS)
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

-- Create secure policies for platform_admins
DO $$ BEGIN
    DROP POLICY IF EXISTS platform_admins_admin_only ON platform_admins;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY platform_admins_admin_only
ON platform_admins FOR ALL USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.id = platform_admins.user_id
    )
);

-- 3. Fix plan_features RLS issue (public table without RLS) 
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- Create secure policies for plan_features (read-only for authenticated users)
DO $$ BEGIN
    DROP POLICY IF EXISTS plan_features_read_all ON plan_features;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY plan_features_read_all
ON plan_features FOR SELECT USING (true);

-- Only platform admins can modify plan features
DO $$ BEGIN
    DROP POLICY IF EXISTS plan_features_admin_modify ON plan_features;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY plan_features_admin_modify
ON plan_features FOR ALL USING (
    EXISTS (
        SELECT 1 FROM platform_admins pa 
        WHERE pa.user_id = auth.uid()
    )
);

-- 4. Ensure user_profiles has proper insert policy for signup
-- The signup process needs to create profiles, let's ensure this works
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can insert their own profile during signup" ON user_profiles;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- More permissive insert policy for signup (but still secure)
CREATE POLICY "Users can insert their own profile during signup" ON user_profiles
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- 5. Grant necessary permissions for the auth flow
GRANT SELECT ON cuisine_types TO authenticated, anon;
GRANT SELECT ON plan_features TO authenticated;
GRANT SELECT ON platform_admins TO authenticated;

-- 6. Fix any search_path issues in helper functions
-- The security lint mentioned function search_path issues
CREATE OR REPLACE FUNCTION public.is_platform_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_admins 
        WHERE user_id = auth.uid()
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.can_create_shop()
RETURNS BOOLEAN
SECURITY DEFINER  
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT user_type FROM user_profiles 
        WHERE user_id = auth.uid()
    ) = 'business_owner';
END;
$$;

-- 7. Create a safer profile creation function for signup
CREATE OR REPLACE FUNCTION public.create_user_profile_on_signup(
    p_user_id UUID,
    p_first_name TEXT,
    p_last_name TEXT,
    p_user_type TEXT,
    p_phone TEXT DEFAULT NULL,
    p_intended_business_name TEXT DEFAULT NULL
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Only allow creating profile for the authenticated user or service role
    IF auth.uid() != p_user_id AND (auth.jwt() ->> 'role') != 'service_role' THEN
        RAISE EXCEPTION 'Unauthorized to create profile for this user';
    END IF;
    
    -- Insert the profile
    INSERT INTO user_profiles (
        user_id, 
        first_name, 
        last_name, 
        user_type, 
        phone, 
        intended_business_name
    ) VALUES (
        p_user_id,
        p_first_name,
        p_last_name,
        p_user_type,
        p_phone,
        p_intended_business_name
    ) 
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
END;
$$;

-- 8. Create a trigger to automatically create profiles on user signup
-- This ensures profile creation doesn't fail during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only create profile if it doesn't exist and user has metadata
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = NEW.id) 
       AND NEW.raw_user_meta_data IS NOT NULL THEN
        
        INSERT INTO user_profiles (
            user_id,
            first_name,
            last_name,
            user_type,
            phone,
            intended_business_name
        ) VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'Unknown'),
            COALESCE(NEW.raw_user_meta_data ->> 'last_name', 'User'),
            COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'customer'),
            NEW.raw_user_meta_data ->> 'phone',
            NEW.raw_user_meta_data ->> 'intended_business_name'
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DO $$ BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Log the completion
DO $$
BEGIN
    RAISE NOTICE 'Signup RLS fixes applied successfully at %', NOW();
    RAISE NOTICE 'Fixed: cuisine_types RLS enabled with policies';
    RAISE NOTICE 'Fixed: platform_admins RLS enabled with admin-only access';  
    RAISE NOTICE 'Fixed: plan_features RLS enabled with read access';
    RAISE NOTICE 'Fixed: user_profiles insert policy for signup';
    RAISE NOTICE 'Added: Automatic profile creation trigger';
    RAISE NOTICE 'Added: Helper functions with fixed search_path';
END;
$$;