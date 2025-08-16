-- Complete database setup for group management
-- Run this in Supabase SQL editor to ensure all tables exist with proper RLS

-- 1. Create groups table if it doesn't exist
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

-- 2. Create group_memberships table if it doesn't exist
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

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_leader_id ON groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_join_code ON groups(join_code);
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups(is_active);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_is_active ON group_memberships(is_active);

-- 4. Drop ALL existing RLS policies to start fresh
DROP POLICY IF EXISTS "Users can view groups they're members of" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can view all active groups" ON groups;
DROP POLICY IF EXISTS "Group leaders can update their groups" ON groups;
DROP POLICY IF EXISTS "view_active_groups" ON groups;
DROP POLICY IF EXISTS "create_groups" ON groups;
DROP POLICY IF EXISTS "update_own_groups" ON groups;

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

-- 5. Create SIMPLE, NON-RECURSIVE RLS policies

-- GROUPS TABLE POLICIES
CREATE POLICY "groups_select_all" ON groups
  FOR SELECT
  TO authenticated
  USING (true); -- Allow all authenticated users to see all groups

CREATE POLICY "groups_insert_own" ON groups
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "groups_update_leader" ON groups
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id);

-- GROUP_MEMBERSHIPS TABLE POLICIES  
CREATE POLICY "memberships_select_own" ON group_memberships
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "memberships_insert_own" ON group_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "memberships_update_own" ON group_memberships
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 6. Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;

-- 7. Create function to generate join codes (optional)
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate 6-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM groups WHERE join_code = code) INTO exists;
    
    -- If code doesn't exist, return it
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- 8. Add trigger to auto-generate join codes
CREATE OR REPLACE FUNCTION set_join_code()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.join_code IS NULL OR NEW.join_code = '' THEN
    NEW.join_code := generate_join_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_join_code ON groups;
CREATE TRIGGER trigger_set_join_code
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_join_code();

-- 9. Test queries to verify everything works
-- These should run without errors:
-- SELECT * FROM groups;
-- SELECT * FROM group_memberships WHERE user_id = auth.uid();

COMMENT ON TABLE groups IS 'Groups that users can create and join';
COMMENT ON TABLE group_memberships IS 'Membership records for users in groups';
