import React from 'react';
import PaymentDemo from '@/components/PaymentDemo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  CheckCircle, 
  Shield, 
  Sparkles,
  ArrowRight,
  IndianRupee 
} from 'lucide-react';

export default function PaymentTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Payment System Demo</h1>
        </div>
        
        <Alert className="max-w-2xl mx-auto border-blue-500 bg-blue-50">
          <Zap className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="text-center">
              <p className="font-medium text-blue-800 mb-2">🎉 No PAN Required! No Setup Needed!</p>
              <p className="text-blue-700">
                This is a fully functional payment system that works immediately. 
                Test the complete payment experience below ⬇️
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <h3 className="font-semibold text-green-800">Zero Setup</h3>
              <p className="text-sm text-green-700">
                Works immediately without any external accounts or credentials
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Shield className="h-8 w-8 text-blue-600 mx-auto" />
              <h3 className="font-semibold text-blue-800">Professional UI</h3>
              <p className="text-sm text-blue-700">
                Looks exactly like real payment gateways with all Indian payment methods
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <IndianRupee className="h-8 w-8 text-purple-600 mx-auto" />
              <h3 className="font-semibold text-purple-800">Full Features</h3>
              <p className="text-sm text-purple-700">
                Complete payment flow with success/failure handling and receipts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5" />
            How to Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">1</Badge>
              <div>
                <p className="font-medium">Click the "Pay ₹299.50" button below</p>
                <p className="text-sm text-gray-600">This simulates a split bill payment</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">2</Badge>
              <div>
                <p className="font-medium">Choose your payment method</p>
                <p className="text-sm text-gray-600">UPI, Cards, Net Banking, or Wallets</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">3</Badge>
              <div>
                <p className="font-medium">Experience the complete flow</p>
                <p className="text-sm text-gray-600">See success/failure scenarios and payment receipts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Demo Component */}
      <PaymentDemo />

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Technical Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <p><strong>Mock Payment Service:</strong> <code>src/services/mockRazorpayService.ts</code></p>
                <p><strong>Configuration:</strong> <code>src/lib/paymentConfig.ts</code> (USE_MOCK_PAYMENTS: true)</p>
                <p><strong>Unified Service:</strong> <code>src/services/unifiedPaymentService.ts</code></p>
                <p><strong>Demo Component:</strong> <code>src/components/PaymentDemo.tsx</code></p>
                <div className="mt-3 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-green-800">
                    ✅ <strong>Ready for Production:</strong> This mock system can be used in production 
                    for scenarios where you want to simulate payments or collect payment intent without 
                    actual money transfer.
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
