const express = require('express');
const { supabase } = require('../services/supabase');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Get all payments for a group
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

    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        *,
        profiles!payments_paid_by_fkey(id, full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get single payment
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        profiles!payments_paid_by_fkey(id, full_name, avatar_url),
        groups!inner(id, name)
      `)
      .eq('id', paymentId)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', payment.group_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this payment' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Create new payment
router.post('/', authenticateToken, validate(schemas.createPayment), async (req, res) => {
  try {
    const { amount, description, group_id, payment_method, razorpay_payment_id } = req.body;

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

    // For Razorpay payments, verify the payment (in real implementation)
    if (payment_method === 'razorpay' && razorpay_payment_id) {
      // TODO: Verify Razorpay payment signature
      // const isValidPayment = await verifyRazorpayPayment(razorpay_payment_id, amount);
      // if (!isValidPayment) {
      //   return res.status(400).json({ error: 'Invalid payment verification' });
      // }
    }

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        amount,
        description,
        group_id,
        paid_by: req.user.id,
        payment_method,
        razorpay_payment_id,
        status: 'completed'
      })
      .select(`
        *,
        profiles!payments_paid_by_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
});

// Update payment status
router.patch('/:paymentId/status', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get payment to check group membership
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('group_id, paid_by')
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user is member of the group and can update (payer or admin)
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', payment.group_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this payment' });
    }

    if (payment.paid_by !== req.user.id && membership.role !== 'admin') {
      return res.status(403).json({ error: 'Can only update your own payments or be group admin' });
    }

    const { data: updatedPayment, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId)
      .select(`
        *,
        profiles!payments_paid_by_fkey(id, full_name, avatar_url)
      `)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      message: 'Payment status updated successfully',
      payment: updatedPayment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Delete payment
router.delete('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Get payment to check group membership and ownership
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('group_id, paid_by')
      .eq('id', paymentId)
      .single();

    if (paymentError) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if user is member of the group
    const { data: membership, error: memberError } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', payment.group_id)
      .eq('user_id', req.user.id)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({ error: 'Access denied to this payment' });
    }

    // Check if user can delete (payer or admin)
    if (payment.paid_by !== req.user.id && membership.role !== 'admin') {
      return res.status(403).json({ error: 'Can only delete your own payments or be group admin' });
    }

    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (error) {
      throw error;
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Get payment summary for a group
router.get('/group/:groupId/summary', authenticateToken, async (req, res) => {
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

    // Get payment summary
    const { data: payments, error } = await supabase
      .from('payments')
      .select('amount, paid_by, status')
      .eq('group_id', groupId)
      .eq('status', 'completed');

    if (error) {
      throw error;
    }

    // Calculate totals
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const userTotals = payments.reduce((acc, payment) => {
      acc[payment.paid_by] = (acc[payment.paid_by] || 0) + payment.amount;
      return acc;
    }, {});

    // Get group members count for split calculation
    const { data: memberCount } = await supabase
      .from('group_members')
      .select('user_id', { count: 'exact' })
      .eq('group_id', groupId);

    const splitAmount = totalAmount / (memberCount.length || 1);

    res.json({
      totalAmount,
      splitAmount,
      userTotals,
      paymentCount: payments.length,
      memberCount: memberCount.length
    });
  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({ error: 'Failed to fetch payment summary' });
  }
});

module.exports = router;
