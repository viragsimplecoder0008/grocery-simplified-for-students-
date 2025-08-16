-- Simple test to check groups table access
-- Run this AFTER running complete_groups_setup.sql

-- Test 1: Check if tables exist
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('groups', 'group_memberships');

-- Test 2: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('groups', 'group_memberships')
ORDER BY tablename, policyname;

-- Test 3: Try to select from groups (should work)
SELECT COUNT(*) as total_groups FROM groups;

-- Test 4: Try to select user's memberships (should work)
SELECT COUNT(*) as user_memberships 
FROM group_memberships 
WHERE user_id = auth.uid();
