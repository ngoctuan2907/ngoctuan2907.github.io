-- Fix check_user_exists function to properly detect auth users
-- Issue: INNER JOIN returns false negatives when profile is missing but auth user exists
-- Solution: Check auth.users first, then LEFT JOIN for user_type

CREATE OR REPLACE FUNCTION public.check_user_exists(email_to_check TEXT)
RETURNS JSON
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE 
    u_id uuid;
    utype text;
BEGIN
    -- First check if user exists in auth.users
    SELECT id INTO u_id FROM auth.users WHERE email = email_to_check;
    
    IF FOUND THEN
        -- User exists in auth, now get their type from profile (if exists)
        SELECT user_type INTO utype FROM user_profiles WHERE user_id = u_id LIMIT 1;
        RETURN json_build_object('exists', true, 'user_type', utype);
    END IF;
    
    -- User doesn't exist in auth.users
    RETURN json_build_object('exists', false, 'user_type', NULL);
END;
$$;

-- Ensure proper permissions are granted
GRANT EXECUTE ON FUNCTION public.check_user_exists(TEXT) TO authenticated, anon;

-- Add comment for documentation
COMMENT ON FUNCTION public.check_user_exists(TEXT) IS 
'Checks if a user exists in auth.users (not just user_profiles). Returns exists=true if auth user exists, regardless of profile state. This prevents false "available" responses during signup when profile was deleted but auth user remains.';