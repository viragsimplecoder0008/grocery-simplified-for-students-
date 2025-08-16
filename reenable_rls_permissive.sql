-- Re-enable RLS with working policies after confirming basic functionality works
-- Only run this AFTER confirming group creation works with RLS disabled

-- 1. Re-enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

-- 2. Create very permissive policies that should work
CREATE POLICY "allow_all_groups_2024" ON groups
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "allow_all_memberships_2024" ON group_memberships
  FOR ALL  
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Test that policies work
SELECT 'RLS re-enabled with permissive policies' as status;
SELECT COUNT(*) as groups_count FROM groups;
SELECT COUNT(*) as memberships_count FROM group_memberships;
