// Backend API endpoints for Razorpay integration
// Place this in your backend server (Node.js/Express)

const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SAMPLE_KEY_ID',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY',
});

// Create Razorpay order
app.post('/api/create-razorpay-order', async (req, res) => {
  try {
    const { amount, currency, receipt, notes } = req.body;

    // Validate amount
    if (!amount || amount < 100) {
      return res.status(400).json({ 
        error: 'Amount must be at least ₹1 (100 paise)' 
      });
    }

    const options = {
      amount: Math.round(amount), // Amount in paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    
    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
});

// Verify payment signature
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ 
        error: 'Missing payment verification parameters' 
      });
    }

    // Create signature for verification
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === signature;

    if (isAuthentic) {
      // Payment is verified
      res.json({
        success: true,
        verified: true,
        paymentId,
        orderId
      });
    } else {
      res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      details: error.message 
    });
  }
});

// Get payment details
app.get('/api/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at,
        captured: payment.captured
      }
    });

  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ 
      error: 'Failed to fetch payment details',
      details: error.message 
    });
  }
});

// Refund payment
app.post('/api/refund-payment', async (req, res) => {
  try {
    const { paymentId, amount, notes } = req.body;

    if (!paymentId) {
      return res.status(400).json({ 
        error: 'Payment ID is required' 
      });
    }

    const refundData = {
      payment_id: paymentId,
      notes: notes || {}
    };

    // Add amount if partial refund
    if (amount) {
      refundData.amount = Math.round(amount);
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    
    res.json({
      success: true,
      refund: {
        id: refund.id,
        payment_id: refund.payment_id,
        amount: refund.amount,
        status: refund.status,
        created_at: refund.created_at
      }
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      error: 'Failed to process refund',
      details: error.message 
    });
  }
});

// Webhook to handle Razorpay events
app.post('/api/razorpay-webhook', (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    const payment = req.body.payload.payment.entity;

    console.log(`Webhook received: ${event}`, payment);

    switch (event) {
      case 'payment.captured':
        // Handle successful payment
        console.log(`Payment captured: ${payment.id}`);
        // Update your database here
        break;
      
      case 'payment.failed':
        // Handle failed payment
        console.log(`Payment failed: ${payment.id}`);
        // Update your database here
        break;
      
      case 'refund.created':
        // Handle refund creation
        console.log(`Refund created: ${payment.id}`);
        // Update your database here
        break;

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Test endpoint to verify Razorpay configuration
app.get('/api/razorpay/test', (req, res) => {
  res.json({
    success: true,
    message: 'Razorpay configuration is working',
    keyId: process.env.RAZORPAY_KEY_ID?.substring(0, 12) + '...',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = {
  razorpay
};
