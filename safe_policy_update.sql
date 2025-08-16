-- Safe policy update - handles existing policies properly
-- Run this in Supabase SQL Editor

-- 1. Drop and recreate the SELECT policy to make it more permissive
DROP POLICY IF EXISTS "policy_memberships_select_2024" ON group_memberships;
DROP POLICY IF EXISTS "policy_memberships_select_enhanced_2024" ON group_memberships;

-- 2. Create enhanced SELECT policy that allows group leaders to see all members
CREATE POLICY "policy_memberships_select_enhanced_2024" ON group_memberships
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR  -- User can see their own memberships
    group_id IN (            -- OR group leaders can see all members in their groups
      SELECT id FROM groups 
      WHERE leader_id = auth.uid() AND is_active = true
    )
  );

-- 3. Verify all policies exist
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('groups', 'group_memberships')
  AND policyname LIKE '%2024%'
ORDER BY tablename, policyname;

-- 4. Test basic access
SELECT 'Policy update completed!' as status;
SELECT COUNT(*) as groups_count FROM groups;
SELECT COUNT(*) as memberships_count FROM group_memberships;
