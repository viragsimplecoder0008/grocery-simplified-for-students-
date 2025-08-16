-- Step-by-step database RLS fix
-- Run these commands one by one in Supabase SQL editor

-- STEP 1: Clear all existing policies (run this first)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on groups table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'groups'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON groups';
    END LOOP;
    
    -- Drop all policies on group_memberships table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'group_memberships'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON group_memberships';
    END LOOP;
    
    RAISE NOTICE 'All existing policies cleared successfully';
END $$;

-- STEP 2: Create new policies for groups (run this second)
CREATE POLICY "Users can view all active groups" ON groups
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can create groups" ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Group leaders can update their groups" ON groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id AND is_active = true);

-- STEP 3: Create new policies for group_memberships (run this third)
CREATE POLICY "Users can view their own memberships" ON group_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can join groups" ON group_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own memberships" ON group_memberships
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- STEP 4: Ensure RLS is enabled (run this last)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

-- Verification query (optional - run to check if policies are created correctly)
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('groups', 'group_memberships')
ORDER BY tablename, policyname;
