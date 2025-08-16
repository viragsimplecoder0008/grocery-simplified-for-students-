-- Enhanced RLS fix specifically for group creation and membership management
-- Run this in Supabase SQL editor

-- First, ensure we have the correct table structure
-- groups table should have:
-- - id (uuid, primary key)
-- - name (text)
-- - description (text)
-- - leader_id (uuid, references auth.users)
-- - is_active (boolean, default true)
-- - created_at (timestamp)

-- group_memberships table should have:
-- - id (uuid, primary key)
-- - group_id (uuid, references groups)
-- - user_id (uuid, references auth.users)
-- - role (text, default 'member')
-- - is_active (boolean, default true)
-- - joined_at (timestamp)

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view groups they're members of" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can view all active groups" ON groups;
DROP POLICY IF EXISTS "Group leaders can update their groups" ON groups;
DROP POLICY IF EXISTS "Users can view their own memberships" ON group_memberships;
DROP POLICY IF EXISTS "Users can join groups" ON group_memberships;
DROP POLICY IF EXISTS "Users can leave groups" ON group_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON group_memberships;
DROP POLICY IF EXISTS "Group leaders can manage memberships" ON group_memberships;

-- GROUPS TABLE POLICIES
-- 1. Allow all authenticated users to view active groups
CREATE POLICY "view_active_groups" ON groups
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 2. Allow authenticated users to create groups (they become the leader)
CREATE POLICY "create_groups" ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

-- 3. Allow group leaders to update their groups
CREATE POLICY "update_own_groups" ON groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id);

-- GROUP_MEMBERSHIPS TABLE POLICIES
-- 1. Users can view their own memberships
CREATE POLICY "view_own_memberships" ON group_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Group leaders can view all memberships in their groups
CREATE POLICY "leaders_view_group_memberships" ON group_memberships
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM groups 
      WHERE leader_id = auth.uid() AND is_active = true
    )
  );

-- 3. Users can join groups (create their own membership)
CREATE POLICY "join_groups" ON group_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 4. Group leaders can add members to their groups
CREATE POLICY "leaders_add_members" ON group_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups 
      WHERE leader_id = auth.uid() AND is_active = true
    )
  );

-- 5. Users can update their own memberships (leave groups, etc.)
CREATE POLICY "update_own_memberships" ON group_memberships
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 6. Group leaders can update memberships in their groups
CREATE POLICY "leaders_update_memberships" ON group_memberships
  FOR UPDATE
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM groups 
      WHERE leader_id = auth.uid() AND is_active = true
    )
  );

-- Ensure RLS is enabled
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

-- Test query to verify policies work:
-- SELECT * FROM groups WHERE is_active = true;
-- SELECT * FROM group_memberships WHERE user_id = auth.uid();
