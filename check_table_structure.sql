-- Check actual table structure in Supabase
-- Run this in Supabase SQL Editor

-- 1. Check if tables exist
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('groups', 'group_memberships');

-- 2. Check groups table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'groups'
ORDER BY ordinal_position;

-- 3. Check group_memberships table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'group_memberships'
ORDER BY ordinal_position;

-- 4. Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('groups', 'group_memberships');
