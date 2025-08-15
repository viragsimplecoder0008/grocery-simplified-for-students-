#!/bin/bash

echo "🚀 Setting up Razorpay Payment Integration..."
echo ""

echo "📦 Installing Razorpay SDK..."
npm install razorpay

echo ""
echo "📋 Creating environment template..."
if [ ! -f .env.razorpay.example ]; then
    cat > .env.razorpay.example << EOF
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
# Test credentials from Razorpay Dashboard
# Live credentials for production
EOF
fi

echo ""
echo "✅ Razorpay setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Sign up at https://razorpay.com"
echo "2. Get your API keys from Dashboard → Settings → API Keys"
echo "3. Copy .env.razorpay.example to .env and add your credentials"
echo "4. Run database migration for payment tables"
echo "5. Test payments using the integration test component"
echo ""
echo "📚 See RAZORPAY_INTEGRATION_GUIDE.md for detailed setup instructions"
