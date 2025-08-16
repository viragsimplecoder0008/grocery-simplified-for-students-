-- Fix RLS policies to prevent infinite recursion
-- Run this in Supabase SQL editor
-- This script is safe to run multiple times

-- First, drop ALL existing policies for groups table
DROP POLICY IF EXISTS "Users can view groups they're members of" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can view all active groups" ON groups;
DROP POLICY IF EXISTS "Group leaders can update their groups" ON groups;

-- Create simpler, non-recursive policies for groups
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

-- Drop ALL existing policies for group_memberships table
DROP POLICY IF EXISTS "Users can view their own memberships" ON group_memberships;
DROP POLICY IF EXISTS "Users can join groups" ON group_memberships;
DROP POLICY IF EXISTS "Users can leave groups" ON group_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON group_memberships;

-- Create policies for group_memberships
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

-- Ensure RLS is enabled
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
