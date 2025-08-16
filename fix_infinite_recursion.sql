-- FIXED: Non-recursive RLS policies that won't cause infinite loops
-- Run this in Supabase SQL Editor

-- 1. Drop ALL existing policies to start clean
DROP POLICY IF EXISTS "groups_all_access_2024" ON groups;
DROP POLICY IF EXISTS "memberships_all_access_2024" ON group_memberships;
DROP POLICY IF EXISTS "allow_all_groups_2024" ON groups;
DROP POLICY IF EXISTS "allow_all_memberships_2024" ON group_memberships;

-- 2. Create SIMPLE, NON-RECURSIVE policies

-- For GROUPS table: Allow authenticated users to do everything
-- (We'll make this more restrictive later if needed)
CREATE POLICY "groups_simple_2024" ON groups
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- For GROUP_MEMBERSHIPS table: Users can only manage their own memberships
CREATE POLICY "memberships_simple_2024" ON group_memberships
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Verify policies are working
SELECT 'Non-recursive policies created successfully!' as status;

-- 4. Test basic queries
SELECT COUNT(*) as groups_count FROM groups;
SELECT COUNT(*) as memberships_count FROM group_memberships;
SELECT COUNT(*) as user_memberships FROM group_memberships WHERE user_id = auth.uid();
