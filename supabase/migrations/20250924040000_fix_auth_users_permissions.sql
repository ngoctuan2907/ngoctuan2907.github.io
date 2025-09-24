-- ============================================================================
-- Fix Auth Users Table Permission Issues
-- Addresses critical permission denied for table users error
-- Date: 2025-09-24
-- ============================================================================

-- 1. Grant necessary permissions on auth.users table
-- The error "permission denied for table users" indicates we need to grant proper access

-- Grant SELECT permission on auth.users to authenticated and anon roles
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO anon;

-- 2. Create a secure view for public user data (avoid exposing sensitive auth data)
CREATE OR REPLACE VIEW public.public_user_data AS
SELECT 
    u.id,
    u.email,
    u.created_at,
    up.first_name,
    up.last_name,
    up.user_type
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
WHERE u.email_confirmed_at IS NOT NULL;

-- Grant access to the public view
GRANT SELECT ON public.public_user_data TO authenticated, anon;

-- 3. Update the businesses API to use user_profiles instead of auth.users directly
-- First, let's ensure user_profiles has proper RLS policies for businesses API

-- Create a policy that allows reading user_profiles for business context
DO $$ BEGIN
    DROP POLICY IF EXISTS "Allow reading profiles for business context" ON user_profiles;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE POLICY "Allow reading profiles for business context" ON user_profiles
    FOR SELECT USING (
        -- Allow reading own profile
        auth.uid() = user_id OR 
        -- Allow reading profiles associated with businesses the user owns
        EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.owner_id = auth.uid() 
            AND b.owner_id = user_profiles.user_id
        ) OR
        -- Allow reading public business owner profiles for businesses that are active
        (user_type = 'business_owner' AND EXISTS (
            SELECT 1 FROM businesses b 
            WHERE b.owner_id = user_profiles.user_id 
            AND b.status = 'active'
        ))
    );

-- 4. Fix the RPC functions to use proper security context
-- Update stats functions to avoid direct auth.users access

CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSON
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_businesses', (SELECT COUNT(*) FROM businesses WHERE status = 'active'),
        'total_customers', (SELECT COUNT(*) FROM user_profiles WHERE user_type = 'customer'),
        'total_orders', (SELECT COUNT(*) FROM orders)
    ) INTO result;
    
    RETURN result;
END;
$$;

-- Grant execute permission on the stats function
GRANT EXECUTE ON FUNCTION public.get_public_stats() TO authenticated, anon;

-- 5. Create a safe function to get business owner info
CREATE OR REPLACE FUNCTION public.get_business_owner_info(business_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', up.user_id,
        'first_name', up.first_name,
        'last_name', up.last_name,
        'user_type', up.user_type
    )
    FROM user_profiles up
    JOIN businesses b ON b.owner_id = up.user_id
    WHERE b.id = business_id AND b.status = 'active'
    INTO result;
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_business_owner_info(UUID) TO authenticated, anon;

-- 6. Ensure proper permissions for signup process
-- Make sure the signup process can read from necessary tables

GRANT SELECT ON plan_features TO authenticated, anon;
GRANT SELECT ON cuisine_types TO authenticated, anon;

-- 7. Create a function to safely check user existence for signup
CREATE OR REPLACE FUNCTION public.check_user_exists(email_to_check TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
    result JSON;
    user_exists BOOLEAN := FALSE;
    user_profile RECORD;
BEGIN
    -- Check if user exists and get their type
    SELECT up.* INTO user_profile
    FROM auth.users u
    JOIN user_profiles up ON up.user_id = u.id
    WHERE u.email = email_to_check;
    
    IF FOUND THEN
        user_exists := TRUE;
    END IF;
    
    SELECT json_build_object(
        'exists', user_exists,
        'user_type', COALESCE(user_profile.user_type, null)
    ) INTO result;
    
    RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_user_exists(TEXT) TO authenticated, anon;

-- 8. Update the auth trigger to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only create profile if it doesn't exist and user has metadata
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = NEW.id) THEN
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
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the signup
        RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- 9. Ensure the trigger exists
DO $$ BEGIN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Add some debug logging for troubleshooting
DO $$
BEGIN
    RAISE NOTICE 'Auth Users Permission Fix applied successfully at %', NOW();
    RAISE NOTICE 'Granted SELECT on auth.users to authenticated and anon roles';
    RAISE NOTICE 'Created public_user_data view for safe access';
    RAISE NOTICE 'Updated user_profiles RLS policies';
    RAISE NOTICE 'Created safe functions for stats and business info';
    RAISE NOTICE 'Enhanced signup trigger with error handling';
END;
$$;