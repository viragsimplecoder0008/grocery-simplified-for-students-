// Payment Configuration
// Set USE_MOCK_PAYMENTS to true for demo/development without Razorpay account
// Set to false when you have real Razorpay credentials

export const PAYMENT_CONFIG = {
  // 🎯 Set this to true to use mock payments (no PAN required!)
  USE_MOCK_PAYMENTS: true,
  
  // 🔧 Razorpay configuration (only used when USE_MOCK_PAYMENTS is false)
  RAZORPAY: {
    KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
    KEY_SECRET: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'demo_secret',
    CURRENCY: 'INR',
    COMPANY_NAME: 'Grocery Simplified',
    COMPANY_LOGO: '/placeholder.svg',
  },
  
  // 💰 Currency formatting
  CURRENCY: {
    CODE: 'INR',
    SYMBOL: '₹',
    LOCALE: 'en-IN',
  },
  
  // 🎨 UI Configuration
  UI: {
    THEME_COLOR: '#3b82f6',
    COMPANY_NAME: 'Grocery Simplified',
    SUPPORT_EMAIL: 'support@grocerysimplified.com',
    SHOW_DEMO_BADGES: true, // Show "demo mode" indicators
  },
} as const;

// Helper function to check if we're in mock mode
export const isUsingMockPayments = () => PAYMENT_CONFIG.USE_MOCK_PAYMENTS;

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(PAYMENT_CONFIG.CURRENCY.LOCALE, {
    style: 'currency',
    currency: PAYMENT_CONFIG.CURRENCY.CODE,
  }).format(amount);
};

// Payment method configurations
export const PAYMENT_METHODS = {
  UPI: { icon: '📱', label: 'UPI (GPay, PhonePe)', color: '#00bcd4' },
  CARD: { icon: '💳', label: 'Credit/Debit Card', color: '#ff9800' },
  NETBANKING: { icon: '🏦', label: 'Net Banking', color: '#4caf50' },
  WALLET: { icon: '👛', label: 'Digital Wallet', color: '#9c27b0' },
  CASH: { icon: '💵', label: 'Cash Payment', color: '#795548' },
  BANK_TRANSFER: { icon: '🏧', label: 'Bank Transfer', color: '#607d8b' },
} as const;
