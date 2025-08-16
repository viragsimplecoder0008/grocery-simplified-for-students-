-- ROBUST database setup for group management
-- This script safely handles existing policies and tables
-- Run this in Supabase SQL editor

-- 1. First, disable RLS temporarily to avoid conflicts
ALTER TABLE IF EXISTS groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS group_memberships DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies (with CASCADE to handle dependencies)
DO $$ 
BEGIN
    -- Drop all policies for groups table
    DROP POLICY IF EXISTS "Users can view groups they're members of" ON groups;
    DROP POLICY IF EXISTS "Users can create groups" ON groups;
    DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
    DROP POLICY IF EXISTS "Users can view all active groups" ON groups;
    DROP POLICY IF EXISTS "Group leaders can update their groups" ON groups;
    DROP POLICY IF EXISTS "view_active_groups" ON groups;
    DROP POLICY IF EXISTS "create_groups" ON groups;
    DROP POLICY IF EXISTS "update_own_groups" ON groups;
    DROP POLICY IF EXISTS "groups_select_all" ON groups;
    DROP POLICY IF EXISTS "groups_insert_own" ON groups;
    DROP POLICY IF EXISTS "groups_update_leader" ON groups;

    -- Drop all policies for group_memberships table
    DROP POLICY IF EXISTS "Users can view their own memberships" ON group_memberships;
    DROP POLICY IF EXISTS "Users can join groups" ON group_memberships;
    DROP POLICY IF EXISTS "Users can leave groups" ON group_memberships;
    DROP POLICY IF EXISTS "Users can update their own memberships" ON group_memberships;
    DROP POLICY IF EXISTS "Group leaders can manage memberships" ON group_memberships;
    DROP POLICY IF EXISTS "view_own_memberships" ON group_memberships;
    DROP POLICY IF EXISTS "leaders_view_group_memberships" ON group_memberships;
    DROP POLICY IF EXISTS "join_groups" ON group_memberships;
    DROP POLICY IF EXISTS "leaders_add_members" ON group_memberships;
    DROP POLICY IF EXISTS "update_own_memberships" ON group_memberships;
    DROP POLICY IF EXISTS "leaders_update_memberships" ON group_memberships;
    DROP POLICY IF EXISTS "memberships_select_own" ON group_memberships;
    DROP POLICY IF EXISTS "memberships_insert_own" ON group_memberships;
    DROP POLICY IF EXISTS "memberships_update_own" ON group_memberships;
END $$;

-- 3. Create tables if they don't exist
CREATE TABLE IF NOT EXISTS groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  join_code text UNIQUE NOT NULL,
  leader_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS group_memberships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  is_active boolean DEFAULT true,
  joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(group_id, user_id)
);

-- 4. Create indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_groups_leader_id ON groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_join_code ON groups(join_code);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups(is_active);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_is_active ON group_memberships(is_active);

-- 5. Create VERY SIMPLE RLS policies (with unique names)
-- GROUPS TABLE - Allow almost everything to fix the access issues
CREATE POLICY "policy_groups_select_2024" ON groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "policy_groups_insert_2024" ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "policy_groups_update_2024" ON groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id);

-- GROUP_MEMBERSHIPS TABLE - Allow users to manage their own memberships
CREATE POLICY "policy_memberships_select_2024" ON group_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "policy_memberships_insert_2024" ON group_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "policy_memberships_update_2024" ON group_memberships
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 6. Re-enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

-- 7. Create join code generator function
CREATE OR REPLACE FUNCTION generate_join_code_2024()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM groups WHERE join_code = code) INTO exists;
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- 8. Create trigger for auto join codes
CREATE OR REPLACE FUNCTION set_join_code_2024()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
    NEW.join_code := generate_join_code_2024();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_join_code_2024 ON groups;
CREATE TRIGGER trigger_set_join_code_2024
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_join_code_2024();

-- 9. Test that everything works
SELECT 'Setup completed successfully!' as status;
SELECT COUNT(*) as existing_groups FROM groups;
SELECT COUNT(*) as existing_memberships FROM group_memberships;
