-- EMERGENCY: Disable RLS completely to test basic functionality
-- This will temporarily remove all security to diagnose the issue
-- Run this in Supabase SQL Editor

-- 1. Disable RLS on both tables
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships DISABLE ROW LEVEL SECURITY;

-- 2. Test that basic queries work without RLS
SELECT 'RLS disabled - testing basic access' as status;

-- 3. Test simple queries
SELECT COUNT(*) as groups_count FROM groups;
SELECT COUNT(*) as memberships_count FROM group_memberships;

-- 4. Test the exact query that's failing in the app
SELECT group_id 
FROM group_memberships 
WHERE user_id = 'ce72dc97-dafd-4dfe-83af-d3a64a7923f1' 
  AND is_active = true;

-- 5. Check table constraints and structure
SELECT 
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name IN ('groups', 'group_memberships')
ORDER BY table_name, constraint_type;
