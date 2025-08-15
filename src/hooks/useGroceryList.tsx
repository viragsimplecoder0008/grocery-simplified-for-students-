import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GroceryListItem, Product } from '@/types/grocery';

export const useGroceryList = () => {
  const { user } = useAuth();
  const [groceryList, setGroceryList] = useState<GroceryListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGroceryList = async () => {
    if (!user) {
      setGroceryList([]);
      return;
    }

    setLoading(true);
    try {
      // Try database first
      const { data, error } = await supabase
        .from('grocery_lists')
        .select(`
          *,
          product:products(
            *,
            category:categories(id, name, description, created_at, updated_at)
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        if (error.message?.includes('relation') || 
            error.message?.includes('table') || 
            error.message?.includes('schema cache') ||
            error.code === 'PGRST106') {
          // Table doesn't exist, use localStorage fallback
          console.warn('Grocery lists table not available, using localStorage fallback');
          const localList = JSON.parse(localStorage.getItem(`fallback_grocery_list_${user.id}`) || '[]');
          setGroceryList(localList);
        } else {
          throw error;
        }
      } else {
        setGroceryList(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching grocery list:', error);
      // Fallback to localStorage
      const localList = JSON.parse(localStorage.getItem(`fallback_grocery_list_${user.id}`) || '[]');
      setGroceryList(localList);
      toast.error('Using offline mode for grocery list');
    } finally {
      setLoading(false);
    }
  };

  const addToGroceryList = async (product: Product, quantity: number = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to your list');
      return;
    }

    try {
      // Check if item already exists
      const existingItem = groceryList.find(item => item.product_id === product.id);
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        
        try {
          // Try database first
          const { error } = await supabase
            .from('grocery_lists')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id);

          if (error && (error.message?.includes('relation') || 
                       error.message?.includes('table') || 
                       error.message?.includes('schema cache') ||
                       error.code === 'PGRST106')) {
            throw new Error('Database not available');
          } else if (error) {
            throw error;
          }
          
          // Database update successful
          setGroceryList(prev => prev.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: newQuantity }
              : item
          ));
          toast.success(`Updated ${product.name} quantity`);
        } catch (dbError) {
          // Use localStorage fallback
          const updatedList = groceryList.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: newQuantity }
              : item
          );
          setGroceryList(updatedList);
          localStorage.setItem(`fallback_grocery_list_${user.id}`, JSON.stringify(updatedList));
          toast.success(`Updated ${product.name} quantity (offline mode)`);
        }
      } else {
        // Add new item
        const newItem: GroceryListItem = {
          id: Date.now(), // Use timestamp as fallback ID
          user_id: user.id,
          product_id: product.id,
          quantity,
          is_purchased: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product: product
        };

        try {
          // Try database first
          const { data, error } = await supabase
            .from('grocery_lists')
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity
            })
            .select(`
              *,
              product:products(
                *,
                category:categories(id, name, description, created_at, updated_at)
              )
            `)
            .single();

          if (error && (error.message?.includes('relation') || 
                       error.message?.includes('table') || 
                       error.message?.includes('schema cache') ||
                       error.code === 'PGRST106')) {
            throw new Error('Database not available');
          } else if (error) {
            throw error;
          }
          
          // Database insert successful
          setGroceryList(prev => [...prev, data]);
          toast.success(`Added ${product.name} to your list`);
        } catch (dbError) {
          // Use localStorage fallback
          const updatedList = [...groceryList, newItem];
          setGroceryList(updatedList);
          localStorage.setItem(`fallback_grocery_list_${user.id}`, JSON.stringify(updatedList));
          toast.success(`Added ${product.name} to your list (offline mode)`);
        }
      }
    } catch (error: any) {
      console.error('Error adding to grocery list:', error);
      toast.error('Failed to add item to list');
    }
  };

  const updateQuantity = async (listItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromList(listItemId);
      return;
    }

    try {
      // Try database first
      const { error } = await supabase
        .from('grocery_lists')
        .update({ quantity: newQuantity })
        .eq('id', listItemId);

      if (error && (error.message?.includes('relation') || 
                   error.message?.includes('table') || 
                   error.message?.includes('schema cache') ||
                   error.code === 'PGRST106')) {
        throw new Error('Database not available');
      } else if (error) {
        throw error;
      }

      // Database update successful
      setGroceryList(prev => prev.map(item => 
        item.id === listItemId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } catch (dbError) {
      // Use localStorage fallback
      const updatedList = groceryList.map(item => 
        item.id === listItemId 
          ? { ...item, quantity: newQuantity }
          : item
      );
      setGroceryList(updatedList);
      localStorage.setItem(`fallback_grocery_list_${user.id}`, JSON.stringify(updatedList));
    }
  };

  const togglePurchased = async (listItemId: number) => {
    const item = groceryList.find(i => i.id === listItemId);
    if (!item) return;

    try {
      // Try database first
      const { error } = await supabase
        .from('grocery_lists')
        .update({ is_purchased: !item.is_purchased })
        .eq('id', listItemId);

      if (error && (error.message?.includes('relation') || 
                   error.message?.includes('table') || 
                   error.message?.includes('schema cache') ||
                   error.code === 'PGRST106')) {
        throw new Error('Database not available');
      } else if (error) {
        throw error;
      }

      // Database update successful
      setGroceryList(prev => prev.map(listItem => 
        listItem.id === listItemId 
          ? { ...listItem, is_purchased: !listItem.is_purchased }
          : listItem
      ));

      toast.success(item.is_purchased ? 'Item unmarked as purchased' : 'Item marked as purchased');
    } catch (dbError) {
      // Use localStorage fallback
      const updatedList = groceryList.map(listItem => 
        listItem.id === listItemId 
          ? { ...listItem, is_purchased: !listItem.is_purchased }
          : listItem
      );
      setGroceryList(updatedList);
      localStorage.setItem(`fallback_grocery_list_${user.id}`, JSON.stringify(updatedList));
      toast.success(item.is_purchased ? 'Item unmarked as purchased (offline)' : 'Item marked as purchased (offline)');
    }
  };

  const removeFromList = async (listItemId: number) => {
    try {
      // Try database first
      const { error } = await supabase
        .from('grocery_lists')
        .delete()
        .eq('id', listItemId);

      if (error && (error.message?.includes('relation') || 
                   error.message?.includes('table') || 
                   error.message?.includes('schema cache') ||
                   error.code === 'PGRST106')) {
        throw new Error('Database not available');
      } else if (error) {
        throw error;
      }

      // Database delete successful
      setGroceryList(prev => prev.filter(item => item.id !== listItemId));
      toast.success('Item removed from list');
    } catch (dbError) {
      // Use localStorage fallback
      const updatedList = groceryList.filter(item => item.id !== listItemId);
      setGroceryList(updatedList);
      localStorage.setItem(`fallback_grocery_list_${user.id}`, JSON.stringify(updatedList));
      toast.success('Item removed from list (offline)');
    }
  };

  useEffect(() => {
    fetchGroceryList();
  }, [user]);

  return {
    groceryList,
    loading,
    addToGroceryList,
    updateQuantity,
    togglePurchased,
    removeFromList,
    refreshList: fetchGroceryList
  };
};
