-- NUCLEAR OPTION: Drop and recreate tables completely
-- ⚠️ WARNING: This will delete ALL existing group data
-- Only use if other methods fail

-- 1. Drop existing tables
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

-- 2. Recreate with correct structure
CREATE TABLE groups (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  join_code text UNIQUE NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
  leader_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE group_memberships (
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

-- 3. Create indexes
CREATE INDEX idx_groups_leader_id ON groups(leader_id);
CREATE INDEX idx_groups_join_code ON groups(join_code);
CREATE INDEX idx_groups_is_active ON groups(is_active);
CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX idx_group_memberships_is_active ON group_memberships(is_active);

-- 4. NO RLS policies initially - let's test without them first
-- We'll add policies later once we confirm basic access works

SELECT 'Tables recreated successfully - no RLS policies yet' as status;
