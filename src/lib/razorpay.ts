import Razorpay from 'razorpay';

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  // Test credentials - Replace with your actual Razorpay credentials
  keyId: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_SAMPLE_KEY_ID',
  keySecret: process.env.REACT_APP_RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY',
  
  // For production, use live credentials
  // keyId: 'rzp_live_YOUR_LIVE_KEY_ID',
  // keySecret: 'YOUR_LIVE_SECRET_KEY',
  
  currency: 'INR', // Indian Rupees - change as needed
  receiptPrefix: 'SPLIT_',
  
  // Theme customization
  theme: {
    color: '#3B82F6' // Blue theme to match your app
  }
};

// Razorpay instance for server-side operations (if you have a backend)
export const razorpayInstance = typeof window === 'undefined' 
  ? new Razorpay({
      key_id: RAZORPAY_CONFIG.keyId,
      key_secret: RAZORPAY_CONFIG.keySecret,
    })
  : null;

// Payment status constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

// Payment method mappings
export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  WALLET: 'wallet'
} as const;
