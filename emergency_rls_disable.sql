-- EMERGENCY FIX: Ultra-permissive policies to bypass all RLS issues
-- Run this in Supabase SQL Editor if still getting 500 errors

-- Temporarily disable RLS completely to test
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships DISABLE ROW LEVEL SECURITY;

-- Check if this resolves the 500 errors
-- If it does, then we know it's a policy issue

-- Test queries (should work with RLS disabled):
SELECT 'Groups table accessible' as test_result;
SELECT COUNT(*) as group_count FROM groups;
SELECT COUNT(*) as membership_count FROM group_memberships;
