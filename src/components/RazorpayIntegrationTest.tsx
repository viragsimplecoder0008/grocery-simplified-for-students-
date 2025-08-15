import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { razorpayService } from '@/services/razorpayService';
import { RAZORPAY_CONFIG } from '@/lib/razorpay';
import { CheckCircle, AlertCircle, CreditCard, Shield, Smartphone } from 'lucide-react';

export const RazorpayIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkRazorpayConfig();
  }, []);

  const checkRazorpayConfig = () => {
    const results = {
      keyId: !!RAZORPAY_CONFIG.keyId && RAZORPAY_CONFIG.keyId !== 'rzp_test_SAMPLE_KEY_ID',
      keySecret: !!RAZORPAY_CONFIG.keySecret && RAZORPAY_CONFIG.keySecret !== 'YOUR_SECRET_KEY',
      currency: RAZORPAY_CONFIG.currency === 'INR',
      theme: !!RAZORPAY_CONFIG.theme.color
    };
    
    setTestResults(results);
  };

  const testScriptLoading = async () => {
    setLoading(true);
    try {
      const loaded = await razorpayService.loadRazorpayScript();
      setTestResults(prev => ({ ...prev, scriptLoaded: loaded }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, scriptLoaded: false, scriptError: error }));
    } finally {
      setLoading(false);
    }
  };

  const testPayment = async () => {
    setLoading(true);
    try {
      const testPaymentData = {
        billSplitId: 999, // Test ID
        amount: 1.00, // ₹1 test payment
        currency: 'INR',
        description: 'Test Payment - Razorpay Integration',
        userEmail: 'test@example.com',
        userName: 'Test User',
        groupName: 'Test Group',
        billTitle: 'Integration Test'
      };

      // This will open the Razorpay modal for testing
      const result = await razorpayService.processPayment(testPaymentData);
      setTestResults(prev => ({ ...prev, testPayment: result }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, testPayment: { success: false, error } }));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: boolean | undefined, label: string) => {
    if (status === undefined) {
      return <Badge variant="outline">{label}: Not Tested</Badge>;
    }
    return status ? (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        {label}: ✓
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        {label}: ✗
      </Badge>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Razorpay Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Configuration Check */}
          <div className="space-y-2">
            <h3 className="font-semibold">Configuration Check</h3>
            <div className="flex flex-wrap gap-2">
              {getStatusBadge(testResults.keyId, 'Key ID')}
              {getStatusBadge(testResults.keySecret, 'Secret Key')}
              {getStatusBadge(testResults.currency, 'Currency')}
              {getStatusBadge(testResults.theme, 'Theme')}
            </div>
            
            {!testResults.keyId && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please update your .env file with actual Razorpay credentials.
                  Check .env.razorpay.example for the template.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Script Loading Test */}
          <div className="space-y-2">
            <h3 className="font-semibold">Script Loading Test</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(testResults.scriptLoaded, 'Razorpay Script')}
              <Button 
                onClick={testScriptLoading} 
                disabled={loading}
                variant="outline" 
                size="sm"
              >
                Test Script Loading
              </Button>
            </div>
          </div>

          {/* Payment Flow Test */}
          <div className="space-y-2">
            <h3 className="font-semibold">Payment Flow Test</h3>
            <div className="space-y-2">
              <Button 
                onClick={testPayment}
                disabled={loading || !testResults.keyId || !testResults.scriptLoaded}
                className="w-full"
              >
                {loading ? 'Processing...' : 'Test ₹1 Payment'}
              </Button>
              
              {testResults.testPayment && (
                <Alert className={testResults.testPayment.success ? '' : 'border-red-200'}>
                  {testResults.testPayment.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {testResults.testPayment.success 
                      ? `Payment successful! ID: ${testResults.testPayment.paymentId}`
                      : `Payment failed: ${testResults.testPayment.error}`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Test Card Details */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Test Card Numbers (Razorpay Test Mode)</p>
                <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                  <div>✅ Success: 4111 1111 1111 1111</div>
                  <div>❌ Failure: 4000 0000 0000 0002</div>
                  <div>✅ Mastercard: 5555 5555 5554 4444</div>
                  <div>💳 Any CVV: 123</div>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Feature Overview */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">🎉 What's Included</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Cards, UPI, Net Banking
              </div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Mobile Wallets
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Automatic Status Updates
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Secure & PCI Compliant
              </div>
            </div>
          </div>

          {/* Quick Setup Reminder */}
          <Alert>
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Quick Setup Reminder:</p>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Get Razorpay API keys from dashboard</li>
                  <li>Update .env file with your keys</li>
                  <li>Run database migration for split bills</li>
                  <li>Test with above buttons</li>
                  <li>Ready for production! 🚀</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default RazorpayIntegrationTest;
