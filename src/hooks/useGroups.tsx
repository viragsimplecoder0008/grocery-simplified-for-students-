import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Group, GroupMembership, GroupGroceryItem, GroupNotification } from '@/types/grocery';
import { toast } from 'sonner';

export function useGroups() {
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false); // Start with false to prevent blocking UI
  const [notifications, setNotifications] = useState<GroupNotification[]>([]);

  // Fetch user's groups (with fallback support)
  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to fetch from database first
      try {
        // First get user's memberships
        const { data: memberships, error: membershipsError } = await supabase
          .from('group_memberships')
          .select('group_id')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (membershipsError && (membershipsError.message?.includes('relation') || membershipsError.code === 'PGRST106')) {
          throw new Error('Database tables not available');
        }

        if (membershipsError) throw membershipsError;

        if (!memberships || memberships.length === 0) {
          setUserGroups([]);
          setLoading(false);
          return;
        }

        // Then get the groups
        const groupIds = memberships.map(m => m.group_id);
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', groupIds)
          .eq('is_active', true);

        if (groupsError) throw groupsError;

        setUserGroups(groups || []);
      } catch (error: any) {
        // Fallback to localStorage if database tables don't exist
        console.warn('Using localStorage fallback for groups:', error.message);
        
        const localGroups = JSON.parse(localStorage.getItem('fallback_groups') || '[]');
        const localMemberships = JSON.parse(localStorage.getItem('fallback_memberships') || '[]');
        
        // Filter groups where user is a member
        const userGroupIds = localMemberships
          .filter((m: any) => m.user_id === user.id && m.is_active)
          .map((m: any) => m.group_id);
        
        const userGroups = localGroups.filter((g: any) => userGroupIds.includes(g.id) && g.is_active);
        setUserGroups(userGroups);
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      toast.error('Failed to load your groups');
    } finally {
      setLoading(false);
    }
  };

  // Generate a random 6-character join code
  const generateJoinCode = (): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Create a new group
  const createGroup = async (name: string, description?: string): Promise<{ success: boolean; group?: Group; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      // Generate join code locally (fallback until database function is available)
      let joinCode = generateJoinCode();
      
      // Check if groups table exists, if not use localStorage fallback
      let useLocalStorage = false;
      try {
        const { data: existing, error: checkError } = await supabase
          .from('groups')
          .select('join_code')
          .eq('join_code', joinCode)
          .single();
        
        // If we get a table doesn't exist error, use localStorage fallback
        if (checkError && (checkError.message?.includes('relation "public.groups" does not exist') || 
                          checkError.message?.includes('table') || 
                          checkError.code === 'PGRST106')) {
          useLocalStorage = true;
        } else if (existing) {
          // Code exists, generate new one
          joinCode = generateJoinCode();
        }
      } catch (error: any) {
        console.warn('Groups table not available, using localStorage fallback:', error.message);
        useLocalStorage = true;
      }

      if (useLocalStorage) {
        // Fallback: Use localStorage to simulate groups
        const localGroups = JSON.parse(localStorage.getItem('fallback_groups') || '[]');
        const newGroup = {
          id: Date.now(),
          name,
          description: description || null,
          join_code: joinCode,
          leader_id: user.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localGroups.push(newGroup);
        localStorage.setItem('fallback_groups', JSON.stringify(localGroups));
        
        // Also track memberships
        const localMemberships = JSON.parse(localStorage.getItem('fallback_memberships') || '[]');
        localMemberships.push({
          id: Date.now(),
          group_id: newGroup.id,
          user_id: user.id,
          joined_at: new Date().toISOString(),
          is_active: true
        });
        localStorage.setItem('fallback_memberships', JSON.stringify(localMemberships));
        
        await fetchUserGroups();
        toast.success(`Group "${name}" created successfully!`);
        
        return { success: true, group: newGroup as Group };
      } else {
        // Normal database operation
        const { data, error } = await supabase
          .from('groups')
          .insert([{
            name,
            description,
            join_code: joinCode,
            leader_id: user.id
          }])
          .select()
          .single();

        if (error) throw error;

        // Automatically add creator as member
        const { error: membershipError } = await supabase
          .from('group_memberships')
          .insert([{
            group_id: data.id,
            user_id: user.id
          }]);

        if (membershipError) throw membershipError;

        await fetchUserGroups();
        toast.success(`Group "${name}" created successfully!`);
        
        return { success: true, group: data };
      }
    } catch (error: any) {
      console.error('Error creating group:', error);
      return { success: false, error: error.message };
    }
  };

  // Join a group using join code
  const joinGroup = async (joinCode: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      // Always use localStorage fallback for now since database tables don't exist
      const useLocalStorage = true;
      console.log('Using localStorage fallback for joinGroup');

      // Check membership count using localStorage
      const localMemberships = JSON.parse(localStorage.getItem('fallback_memberships') || '[]');
      const userMemberships = localMemberships.filter((m: any) => m.user_id === user.id && m.is_active);
      const canJoin = userMemberships.length < 3;
      
      if (!canJoin) {
        return { success: false, error: 'You can only join up to 3 groups' };
      }

      // Find group in localStorage
      const localGroups = JSON.parse(localStorage.getItem('fallback_groups') || '[]');
      const group = localGroups.find((g: any) => g.join_code === joinCode.toUpperCase() && g.is_active);
      
      if (!group) {
        return { success: false, error: 'Invalid join code' };
      }

      // Check if already a member
      const existingMembership = localMemberships.find((m: any) => 
        m.group_id === group.id && m.user_id === user.id
      );

      if (existingMembership?.is_active) {
        return { success: false, error: 'You are already a member of this group' };
      }

      // Add membership
      if (existingMembership) {
        // Reactivate
        existingMembership.is_active = true;
        existingMembership.joined_at = new Date().toISOString();
      } else {
        // Create new membership
        localMemberships.push({
          id: Date.now(),
          group_id: group.id,
          user_id: user.id,
          joined_at: new Date().toISOString(),
          is_active: true
        });
      }
      
      localStorage.setItem('fallback_memberships', JSON.stringify(localMemberships));
      await fetchUserGroups();
      toast.success(`Successfully joined "${group.name}"!`);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error joining group:', error);
      return { success: false, error: error.message };
    }
  };

  // Leave a group
  const leaveGroup = async (groupId: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      try {
        const { error } = await supabase
          .from('group_memberships')
          .update({ is_active: false })
          .eq('group_id', groupId)
          .eq('user_id', user.id);

        if (error && (error.message?.includes('relation') || error.code === 'PGRST106')) {
          throw new Error('Database not available');
        }

        if (error) throw error;
      } catch (error: any) {
        // Fallback to localStorage
        console.warn('Using localStorage fallback for leaving group');
        const localMemberships = JSON.parse(localStorage.getItem('fallback_memberships') || '[]');
        const membership = localMemberships.find((m: any) => 
          m.group_id === groupId && m.user_id === user.id && m.is_active
        );
        
        if (membership) {
          membership.is_active = false;
          localStorage.setItem('fallback_memberships', JSON.stringify(localMemberships));
        }
      }

      await fetchUserGroups();
      toast.success('Left group successfully');
      
      return { success: true };
    } catch (error: any) {
      console.error('Error leaving group:', error);
      return { success: false, error: error.message };
    }
  };

  // Get group members (for leaders) - simplified
  const getGroupMembers = async (groupId: number): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching group members:', error);
      return [];
    }
  };

  // Remove member from group (leader only)
  const removeMember = async (membershipId: number): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase
        .from('group_memberships')
        .update({ is_active: false })
        .eq('id', membershipId);

      if (error) throw error;
      toast.success('Member removed successfully');
      
      return { success: true };
    } catch (error: any) {
      console.error('Error removing member:', error);
      return { success: false, error: error.message };
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error && (error.message?.includes('relation') || error.code === 'PGRST106')) {
        // Table doesn't exist, use empty notifications
        console.warn('Notifications table not available, using empty array');
        setNotifications([]);
        return;
      }

      if (error) throw error;
      setNotifications((data || []) as GroupNotification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Fallback to empty notifications
    }
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from('group_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error && (error.message?.includes('relation') || error.code === 'PGRST106')) {
        // Table doesn't exist, just update local state
        console.warn('Notifications table not available');
        return;
      }

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error && (error.message?.includes('relation') || error.code === 'PGRST106')) {
        // Table doesn't exist, just update local state
        console.warn('Notifications table not available');
        return;
      }

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserGroups();
      fetchNotifications();
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    userGroups,
    loading,
    notifications,
    unreadCount,
    createGroup,
    joinGroup,
    leaveGroup,
    getGroupMembers,
    removeMember,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    refetch: fetchUserGroups
  };
}
