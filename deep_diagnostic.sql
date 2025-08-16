-- Deep diagnostic of database issues
-- Run this if disabling RLS doesn't fix the problem

-- 1. Check if we can insert a test group manually
INSERT INTO groups (name, description, join_code, leader_id, is_active) 
VALUES (
  'Test Group', 
  'Test Description', 
  'TEST01', 
  'ce72dc97-dafd-4dfe-83af-d3a64a7923f1',  -- Your user ID
  true
) 
ON CONFLICT (join_code) DO NOTHING;

-- 2. Check if we can insert a test membership
INSERT INTO group_memberships (group_id, user_id, role, is_active)
SELECT 
  id,
  'ce72dc97-dafd-4dfe-83af-d3a64a7923f1',
  'leader',
  true
FROM groups 
WHERE join_code = 'TEST01'
ON CONFLICT (group_id, user_id) DO NOTHING;

-- 3. Check results
SELECT 'Manual insert test completed' as status;
SELECT * FROM groups WHERE join_code = 'TEST01';
SELECT * FROM group_memberships WHERE user_id = 'ce72dc97-dafd-4dfe-83af-d3a64a7923f1';
