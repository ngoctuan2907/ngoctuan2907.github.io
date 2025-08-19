-- Fix infinite recursion in RLS policies by simplifying dependencies
-- The issue is circular dependencies between stakeholders and memberships policies

-- Temporarily disable RLS to fix the policies
ALTER TABLE stakeholders DISABLE ROW LEVEL SECURITY;
ALTER TABLE memberships DISABLE ROW LEVEL SECURITY;

-- Drop all problematic policies
DROP POLICY IF EXISTS sel_stakeholder ON stakeholders;
DROP POLICY IF EXISTS ins_stakeholder ON stakeholders; 
DROP POLICY IF EXISTS upd_stakeholder ON stakeholders;
DROP POLICY IF EXISTS sel_memberships ON memberships;
DROP POLICY IF EXISTS ins_memberships ON memberships;

-- Create simplified stakeholder policies without circular dependencies
CREATE POLICY sel_stakeholder ON stakeholders
FOR SELECT USING (
  is_platform_admin(auth.uid())
  OR created_by = auth.uid()  -- Users can see stakeholders they created
);

CREATE POLICY ins_stakeholder ON stakeholders
FOR INSERT WITH CHECK (
  is_platform_admin(auth.uid()) 
  OR created_by = auth.uid()  -- Users can create stakeholders with themselves as creator
);

CREATE POLICY upd_stakeholder ON stakeholders
FOR UPDATE USING (
  is_platform_admin(auth.uid())
  OR created_by = auth.uid()  -- Users can update stakeholders they created
);

-- Create simplified membership policies without circular dependencies
CREATE POLICY sel_memberships ON memberships
FOR SELECT USING (
  is_platform_admin(auth.uid())
  OR user_id = auth.uid()  -- Users can see their own memberships
);

CREATE POLICY ins_memberships ON memberships
FOR INSERT WITH CHECK (
  is_platform_admin(auth.uid())
  OR user_id = auth.uid()  -- Users can create their own memberships
);

-- Re-enable RLS
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
