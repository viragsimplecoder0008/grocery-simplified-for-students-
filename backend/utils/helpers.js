const crypto = require('crypto');

// Generate random string for invite codes
const generateInviteCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format currency
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Generate hash for sensitive data
const generateHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Verify Razorpay signature (placeholder)
const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpayOrderId + '|' + razorpayPaymentId)
    .digest('hex');
  
  return expectedSignature === signature;
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Pagination helper
const getPagination = (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// Error response helper
const createErrorResponse = (message, status = 500, details = null) => {
  return {
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  };
};

// Success response helper
const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  generateInviteCode,
  isValidEmail,
  formatCurrency,
  generateHash,
  verifyRazorpaySignature,
  sanitizeInput,
  getPagination,
  createErrorResponse,
  createSuccessResponse
};
