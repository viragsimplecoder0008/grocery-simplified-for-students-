const express = require('express');
const { supabase } = require('../services/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Get all groups for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: groups, error } = await supabase
      .from('groups')
      .select(`
        *,
        group_members!inner(user_id, role, joined_at),
        profiles!group_members(id, full_name, avatar_url)
      `)
      .eq('group_members.user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get single group with details
router.get('/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this group' });
    }

    // Get group with members and products
    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        group_members(
          user_id,
          role,
          joined_at,
          profiles(id, full_name, avatar_url)
        ),
        products(*)
      `)
      .eq('id', groupId)
      .single();

    if (error) {
      throw error;
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create new group
router.post('/', authenticateToken, validate(schemas.createGroup), async (req, res) => {
  try {
    const { name, description, currency } = req.body;

    // Create group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        description,
        currency: currency || 'USD',
        created_by: req.user.id
      })
      .select()
      .single();

    if (groupError) {
      throw groupError;
    }

    // Add creator as admin member
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: req.user.id,
        role: 'admin'
      });

    if (memberError) {
      throw memberError;
    }

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group
router.put('/:groupId', authenticateToken, validate(schemas.updateGroup), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, currency } = req.body;

    // Check if user is admin of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: group, error } = await supabase
      .from('groups')
      .update({ name, description, currency })
      .eq('id', groupId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete group
router.delete('/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is admin of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership || membership.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      throw error;
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Join group by invite code
router.post('/join/:inviteCode', authenticateToken, async (req, res) => {
  try {
    const { inviteCode } = req.params;

    // Find group by invite code
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('invite_code', inviteCode)
      .single();

    if (groupError || !group) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', group.id)
      .eq('user_id', req.user.id)
      .single();

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this group' });
    }

    // Add user to group
    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: req.user.id,
        role: 'member'
      });

    if (memberError) {
      throw memberError;
    }

    res.json({
      message: `Successfully joined ${group.name}`,
      group
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave group
router.post('/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(404).json({ error: 'Not a member of this group' });
    }

    // Prevent last admin from leaving
    if (membership.role === 'admin') {
      const { data: adminCount } = await supabase
        .from('group_members')
        .select('id', { count: 'exact' })
        .eq('group_id', groupId)
        .eq('role', 'admin');

      if (adminCount.length === 1) {
        return res.status(400).json({ 
          error: 'Cannot leave group as the only admin. Transfer admin role first.' 
        });
      }
    }

    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', req.user.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

module.exports = router;
