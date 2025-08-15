import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { paymentService } from '@/services/unifiedPaymentService';
import { formatCurrency, PAYMENT_CONFIG } from '@/lib/paymentConfig';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  Shield,
  CheckCircle,
  AlertCircle,
  Play,
  Settings,
  IndianRupee,
  Zap
} from 'lucide-react';

export function PaymentDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const config = paymentService.getConfig();

  const handleDemoPayment = async () => {
    setIsProcessing(true);
    setLastResult(null);

    try {
      const result = await paymentService.processPayment({
        amount: 299.50,
        currency: 'INR',
        description: 'Demo Split Bill Payment - Grocery Shopping',
        userId: 'demo_user_123',
        billId: 'demo_bill_456',
        userEmail: 'demo@example.com',
        userName: 'Demo User',
      });

      setLastResult(result);
    } catch (error) {
      setLastResult({ success: false, error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentMethodBadge = ({ method, icon: Icon, label, color }) => (
    <Badge variant="outline" className="gap-2 px-3 py-1" style={{ borderColor: color }}>
      <Icon className="h-4 w-4" style={{ color }} />
      {label}
    </Badge>
  );

  return (
    <div className="space-y-4">
      {/* Current Mode Indicator */}
      <Alert className={config.mode === 'mock' ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'}>
        <div className="flex items-center gap-2">
          {config.mode === 'mock' ? (
            <>
              <Zap className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">🧪 Mock Payment Mode Active</p>
                <p className="text-sm text-blue-700">
                  No PAN required! Simulates the full payment experience without real transactions.
                </p>
              </div>
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium text-green-800">💳 Real Payment Mode Active</p>
                <p className="text-sm text-green-700">
                  Connected to live Razorpay integration for real transactions.
                </p>
              </div>
            </>
          )}
        </div>
      </Alert>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Supported Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <PaymentMethodBadge 
              method="upi" 
              icon={Smartphone} 
              label="UPI" 
              color="#00bcd4" 
            />
            <PaymentMethodBadge 
              method="card" 
              icon={CreditCard} 
              label="Cards" 
              color="#ff9800" 
            />
            <PaymentMethodBadge 
              method="netbanking" 
              icon={Building2} 
              label="Net Banking" 
              color="#4caf50" 
            />
            <PaymentMethodBadge 
              method="wallet" 
              icon={Wallet} 
              label="Wallets" 
              color="#9c27b0" 
            />
          </div>
          
          {config.mode === 'mock' && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Demo Mode:</strong> All payment methods are simulated. No real money is involved!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Demo Payment Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Try Payment Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Demo Split Bill Payment</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(299.50)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Grocery Shopping - Your share of group bill
            </p>
          </div>

          <Button 
            onClick={handleDemoPayment}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <IndianRupee className="h-4 w-4 mr-2" />
                Pay {formatCurrency(299.50)}
              </>
            )}
          </Button>

          {/* Payment Result */}
          {lastResult && (
            <Alert className={lastResult.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
              <div className="flex items-start gap-2">
                {lastResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {lastResult.success ? '✅ Payment Successful!' : '❌ Payment Failed'}
                  </p>
                  {lastResult.success ? (
                    <div className="text-sm text-green-700 mt-1 space-y-1">
                      <p><strong>Payment ID:</strong> {lastResult.paymentId}</p>
                      <p><strong>Method:</strong> {lastResult.method}</p>
                      <p><strong>Amount:</strong> {formatCurrency(lastResult.amount)}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-700 mt-1">
                      {lastResult.error || 'Payment processing failed'}
                    </p>
                  )}
                </div>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Current Mode:</strong> {config.mode === 'mock' ? 'Mock Payments' : 'Real Payments'}</p>
                <p><strong>Currency:</strong> {config.currency.code} ({config.currency.symbol})</p>
                <p><strong>Setup Required:</strong> {config.mode === 'mock' ? 'None! ✅' : 'Razorpay API keys'}</p>
                <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">
                  💡 To switch modes, edit <code>src/lib/paymentConfig.ts</code> and change <code>USE_MOCK_PAYMENTS</code>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentDemo;
