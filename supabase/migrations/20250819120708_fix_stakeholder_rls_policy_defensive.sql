-- Fix stakeholder RLS policy to allow users to create their own stakeholder records
-- This addresses the bootstrap-profile API issue where users couldn't create stakeholder records
-- Uses defensive approach to only run if tables exist

DO $$
BEGIN
  -- Only proceed if stakeholders table exists
  IF to_regclass('public.stakeholders') IS NOT NULL THEN
    
    -- Drop the existing restrictive insert policy
    DROP POLICY IF EXISTS ins_stakeholder ON stakeholders;
    
    -- Create a new policy that allows users to create their own stakeholder records
    -- This enables the bootstrap-profile API to work for user registration
    CREATE POLICY ins_stakeholder ON stakeholders
    FOR INSERT WITH CHECK (
      is_platform_admin(auth.uid()) 
      OR created_by = auth.uid()  -- Allow users to create stakeholder records where they are the creator
    );
    
  END IF;
END$$;
