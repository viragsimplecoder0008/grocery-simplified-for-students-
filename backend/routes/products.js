const express = require('express');
const { supabase } = require('../services/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Get all products for a group
router.get('/group/:groupId', authenticateToken, async (req, res) => {
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

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_added_by_fkey(id, full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_added_by_fkey(id, full_name, avatar_url),
        groups!inner(id, name)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', product.group_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this product' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', authenticateToken, validate(schemas.createProduct), async (req, res) => {
  try {
    const { name, category, brand, price, quantity, unit, notes, group_id } = req.body;

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', group_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this group' });
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name,
        category,
        brand,
        price,
        quantity,
        unit,
        notes,
        group_id,
        added_by: req.user.id
      })
      .select(`
        *,
        profiles!products_added_by_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update product
router.put('/:productId', authenticateToken, validate(schemas.updateProduct), async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    // Get product to check group membership
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('group_id, added_by')
      .eq('id', productId)
      .single();

    if (productError) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', product.group_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this product' });
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select(`
        *,
        profiles!products_added_by_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    // Get product to check group membership and ownership
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('group_id, added_by')
      .eq('id', productId)
      .single();

    if (productError) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', product.group_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this product' });
    }

    // Check if user can delete (owner or admin)
    if (product.added_by !== req.user.id && membership.role !== 'admin') {
      return res.status(403).json({ error: 'Can only delete your own products or be group admin' });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      throw error;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Toggle product purchased status
router.patch('/:productId/toggle-purchased', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    // Get current product state
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('group_id, is_purchased')
      .eq('id', productId)
      .single();

    if (productError) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', product.group_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this product' });
    }

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({ 
        is_purchased: !product.is_purchased,
        purchased_at: !product.is_purchased ? new Date().toISOString() : null,
        purchased_by: !product.is_purchased ? req.user.id : null
      })
      .eq('id', productId)
      .select(`
        *,
        profiles!products_added_by_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: `Product marked as ${updatedProduct.is_purchased ? 'purchased' : 'not purchased'}`,
      product: updatedProduct
    });
  } catch (error) {
    console.error('Toggle purchased error:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Get categories for a group
router.get('/group/:groupId/categories', authenticateToken, async (req, res) => {
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

    const { data: categories, error } = await supabase
      .from('products')
      .select('category')
      .eq('group_id', groupId)
      .not('category', 'is', null);

    if (error) {
      throw error;
    }

    // Get unique categories
    const uniqueCategories = [...new Set(categories.map(c => c.category))];

    res.json(uniqueCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
