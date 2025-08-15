# 🔥 Razorpay Payment Integration Setup Guide

Complete guide to integrate Razorpay payments with your Split Bills feature for seamless online payments.

## 📋 Prerequisites

1. **Razorpay Account**: Sign up at [razorpay.com](https://razorpay.com)
2. **Indian Bank Account**: Required for Razorpay (supports INR)
3. **Business Documents**: PAN, Bank details, GST (if applicable)

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Razorpay Credentials
1. **Login to Razorpay Dashboard**
2. Go to **Settings → API Keys**
3. **Generate Test Keys** (for development)
4. **Generate Live Keys** (for production)

### Step 2: Environment Variables
```bash
# Copy the example file
cp .env.razorpay.example .env.local

# Edit .env.local with your actual keys
REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET
```

### Step 3: Run Database Migration
```sql
-- In Supabase SQL Editor, run:
-- supabase/migrations/20250815120000_add_split_bills.sql
-- or use complete-database-setup.sql for full setup
```

### Step 4: Test Payment
1. **Go to any group** → Split Bills tab
2. **Create a test split bill**
3. **Click "Pay Now"** button
4. **Use test card**: 4111 1111 1111 1111

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Razorpay      │
│   React App     │    │   (Optional)    │    │   Gateway       │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • Payment UI    │───▶│ • Create Orders │───▶│ • Process       │
│ • Razorpay SDK  │    │ • Verify Sigs   │    │   Payments      │
│ • State Mgmt    │◄───│ • Webhooks      │◄───│ • Callbacks     │
│ • Supabase      │    │ • Supabase      │    │ • Settlements   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💳 Payment Flow

### User Experience
1. **User clicks "Pay Now"** on their split amount
2. **Razorpay modal opens** with payment options
3. **User selects payment method** (UPI/Card/Net Banking)
4. **Payment processes** through Razorpay
5. **Success callback** updates bill status
6. **Transaction recorded** in database

### Technical Flow
```typescript
// 1. Create payment order
const paymentData = {
  billSplitId: 123,
  amount: 500.00,
  description: "Pizza Night - Food Lovers Group"
};

// 2. Initialize Razorpay
const result = await razorpayService.processPayment(paymentData);

// 3. Handle success/failure
if (result.success) {
  // Update database
  // Show success message
  // Refresh bill status
}
```

## 🛠️ Configuration Options

### Payment Methods Supported
- **💳 Credit/Debit Cards** (Visa, Mastercard, RuPay)
- **📱 UPI** (GPay, PhonePe, Paytm, etc.)
- **🏦 Net Banking** (All major banks)
- **👛 Wallets** (Paytm, Mobikwik, Freecharge)
- **💰 EMI** (Credit card EMI options)

### Currency Support
```typescript
// Currently configured for INR
currency: 'INR'

// Can be extended to support:
// USD, EUR, GBP, SGD, AED, etc.
```

### Theme Customization
```typescript
theme: {
  color: '#3B82F6', // Matches your app's blue theme
  backdrop_color: 'rgba(0,0,0,0.5)'
}
```

## 🔒 Security Features

### Built-in Security
- **🛡️ PCI DSS Compliant**: Razorpay handles card data securely
- **🔐 SSL Encryption**: All communications encrypted
- **🔍 Signature Verification**: Prevents tampering
- **🚫 No Card Storage**: Cards never touch your servers

### Implementation Security
```typescript
// Payment verification (server-side recommended)
const isValid = await razorpayService.verifyPaymentSignature(
  paymentId, orderId, signature
);

// Database security with RLS
CREATE POLICY "Users can only see their transactions"
ON split_bill_transactions FOR SELECT
USING (created_by = auth.uid());
```

## 📊 Analytics & Monitoring

### Payment Analytics
- **Success Rate**: Track payment completion
- **Method Preference**: UPI vs Cards vs Net Banking
- **Failure Reasons**: Identify common issues
- **Settlement Tracking**: Monitor money flow

### Database Insights
```sql
-- Payment method distribution
SELECT payment_method, COUNT(*), SUM(amount)
FROM split_bill_transactions
WHERE payment_status = 'success'
GROUP BY payment_method;

-- Success rate by method
SELECT 
  payment_method,
  COUNT(*) as total,
  COUNT(CASE WHEN payment_status = 'success' THEN 1 END) as successful,
  ROUND(100.0 * COUNT(CASE WHEN payment_status = 'success' THEN 1 END) / COUNT(*), 2) as success_rate
FROM split_bill_transactions
GROUP BY payment_method;
```

## 🧪 Testing

### Test Credentials
```bash
# Test Key ID (safe to commit)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SAMPLE_KEY_ID

# Test Cards
4111111111111111  # Visa Success
4000000000000002  # Visa Failed  
5555555555554444  # Mastercard Success
5200000000000007  # Mastercard Failed

# Test UPI ID
success@razorpay  # Always succeeds
failure@razorpay  # Always fails
```

### Test Scenarios
1. **✅ Successful Payment**: Use test card 4111111111111111
2. **❌ Failed Payment**: Use test card 4000000000000002
3. **⏸️ Payment Abandonment**: Close modal without paying
4. **🔄 Partial Payments**: Pay less than full amount
5. **💰 Full Payment**: Pay complete remaining balance

## 🚦 Production Deployment

### Pre-launch Checklist
- [ ] **Live API Keys**: Replace test keys with live keys
- [ ] **Webhook Setup**: Configure production webhook URL
- [ ] **SSL Certificate**: Ensure HTTPS on production domain  
- [ ] **Bank Account**: Link business bank account
- [ ] **KYC Complete**: Complete merchant verification
- [ ] **Settlement Account**: Configure auto-settlements

### Go-Live Steps
```bash
# 1. Update environment variables
REACT_APP_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY
RAZORPAY_KEY_SECRET=YOUR_LIVE_SECRET

# 2. Deploy to production
npm run build
# Deploy to your hosting platform

# 3. Test with small amount
# Make a ₹1 test payment to verify integration

# 4. Monitor transactions
# Check Razorpay dashboard for successful settlements
```

## 🔧 Advanced Features

### Subscription Payments (Future)
```typescript
// For recurring group expenses
const subscription = await razorpay.subscriptions.create({
  plan_id: 'plan_monthly_groceries',
  customer_notify: 1,
  quantity: groupMembers.length
});
```

### Smart Routing
```typescript
// Route payments based on success rates
const preferredMethods = ['upi', 'card', 'netbanking'];
// Show methods in order of success rate
```

### Multi-currency Support
```typescript
// For international groups
const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
const userCurrency = getUserPreferredCurrency();
```

## 🐛 Troubleshooting

### Common Issues

**❌ "Razorpay script not loaded"**
```javascript
// Solution: Check internet connection and script URL
await razorpayService.loadRazorpayScript();
```

**❌ "Invalid key_id"**
```bash
# Solution: Verify environment variables
echo $REACT_APP_RAZORPAY_KEY_ID
# Should show: rzp_test_... or rzp_live_...
```

**❌ "Payment verification failed"**
```typescript
// Solution: Check signature verification
const isValid = crypto
  .createHmac('sha256', keySecret)
  .update(orderId + '|' + paymentId)
  .digest('hex') === signature;
```

### Debug Mode
```typescript
// Enable debug logging
const razorpayService = RazorpayPaymentService.getInstance();
razorpayService.enableDebugMode(true);
```

### Support Channels
- **📧 Email**: team@razorpay.com
- **💬 Discord**: [Your Discord Server]
- **📞 Phone**: 1800-120-020-029 (Razorpay Support)
- **🌐 Documentation**: https://razorpay.com/docs/

## 📈 Performance Optimization

### Loading Optimization
- **Lazy Load**: Razorpay script loads only when needed
- **Caching**: Payment methods cached locally
- **Preload**: Critical payment data fetched early

### Database Optimization
- **Indexes**: Added for payment queries
- **Archival**: Old transactions moved to archive tables
- **Compression**: Large JSON responses compressed

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)
- **💳 Payment Success Rate**: Target >95%
- **⚡ Payment Speed**: Average <30 seconds
- **💰 Settlement Time**: T+2 days (Razorpay standard)
- **🐛 Error Rate**: Target <5%
- **👥 User Adoption**: % of users using online payments

### Business Impact
- **💸 Reduced Cash Handling**: Less manual reconciliation
- **⏰ Faster Settlements**: Immediate payment confirmations
- **📊 Better Tracking**: Digital payment trails
- **🎯 Higher Completion**: Easier payment = more payments

---

## 🎉 You're All Set!

Your split bills feature now supports **seamless online payments** through Razorpay! 

### What's Next?
1. **Test thoroughly** with different payment methods
2. **Monitor success rates** and optimize accordingly  
3. **Gather user feedback** on payment experience
4. **Scale to handle** increased payment volume

**Happy Payment Processing! 💳✨**

*Transform bill splitting from painful to delightful with instant online payments.*
