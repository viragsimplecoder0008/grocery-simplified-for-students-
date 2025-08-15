import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { GroupGroceryItem, Product } from '@/types/grocery';
import { toast } from 'sonner';

export function useGroupGroceryList(groupId: number | null) {
  const { user } = useAuth();
  const [groupItems, setGroupItems] = useState<GroupGroceryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch group grocery items
  const fetchGroupItems = async () => {
    if (!groupId || !user) {
      setGroupItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('group_grocery_lists')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroupItems((data as GroupGroceryItem[]) || []);
    } catch (error) {
      console.error('Error fetching group items:', error);
      toast.error('Failed to load group grocery list');
    } finally {
      setLoading(false);
    }
  };

  // Add item to group grocery list
  const addGroupItem = async (itemData: {
    name: string;
    quantity: number;
    price: number;
    category?: string;
    product_id?: number;
    notes?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!groupId || !user) {
      return { success: false, error: 'Not authenticated or no group selected' };
    }

    try {
      const { data, error } = await supabase
        .from('group_grocery_lists')
        .insert([{
          group_id: groupId,
          name: itemData.name,
          quantity: itemData.quantity,
          price: itemData.price,
          category: itemData.category,
          product_id: itemData.product_id,
          notes: itemData.notes,
          added_by: user.id,
          is_purchased: false
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchGroupItems();
      toast.success(`Added "${itemData.name}" to group list`);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding group item:', error);
      return { success: false, error: error.message };
    }
  };

  // Update group item
  const updateGroupItem = async (itemId: number, updates: Partial<GroupGroceryItem>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('group_grocery_lists')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      await fetchGroupItems();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating group item:', error);
      return { success: false, error: error.message };
    }
  };

  // Mark item as purchased
  const purchaseGroupItem = async (itemId: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('group_grocery_lists')
        .update({
          is_purchased: true,
          purchased_by: user.id,
          purchased_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      await fetchGroupItems();
      toast.success('Item marked as purchased');
      
      return { success: true };
    } catch (error: any) {
      console.error('Error purchasing group item:', error);
      return { success: false, error: error.message };
    }
  };

  // Mark item as not purchased
  const unpurchaseGroupItem = async (itemId: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('group_grocery_lists')
        .update({
          is_purchased: false,
          purchased_by: null,
          purchased_at: null
        })
        .eq('id', itemId);

      if (error) throw error;

      await fetchGroupItems();
      toast.success('Item marked as not purchased');
      
      return { success: true };
    } catch (error: any) {
      console.error('Error unpurchasing group item:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete group item
  const deleteGroupItem = async (itemId: number): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('group_grocery_lists')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchGroupItems();
      toast.success('Item removed from group list');
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting group item:', error);
      return { success: false, error: error.message };
    }
  };

  // Get group shopping summary
  const getGroupSummary = () => {
    const totalItems = groupItems.length;
    const purchasedItems = groupItems.filter(item => item.is_purchased).length;
    const totalValue = groupItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const purchasedValue = groupItems
      .filter(item => item.is_purchased)
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      totalItems,
      purchasedItems,
      remainingItems: totalItems - purchasedItems,
      totalValue,
      purchasedValue,
      remainingValue: totalValue - purchasedValue,
      completionPercentage: totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0
    };
  };

  // Set up real-time subscription for group items
  useEffect(() => {
    if (!groupId || !user) return;

    const subscription = supabase
      .channel(`group_grocery_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_grocery_lists',
          filter: `group_id=eq.${groupId}`
        },
        () => {
          fetchGroupItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [groupId, user]);

  // Fetch items when groupId changes
  useEffect(() => {
    fetchGroupItems();
  }, [groupId, user]);

  return {
    groupItems,
    loading,
    addGroupItem,
    updateGroupItem,
    purchaseGroupItem,
    unpurchaseGroupItem,
    deleteGroupItem,
    getGroupSummary,
    refetch: fetchGroupItems
  };
}
