import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { razorpayService } from '@/services/razorpayService';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  IndianRupee
} from 'lucide-react';

interface BillSplit {
  id: number;
  split_bill_id: number;
  user_id: string;
  amount_owed: number;
  amount_paid: number;
  status: 'pending' | 'paid' | 'cancelled';
  user_name: string;
  user_email: string;
}

interface BillInfo {
  id: number;
  title: string;
  group_name: string;
  total_amount: number;
}

interface RazorpayPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billSplit: BillSplit;
  billInfo: BillInfo;
  onPaymentSuccess: () => void;
}

export const RazorpayPaymentDialog: React.FC<RazorpayPaymentDialogProps> = ({
  open,
  onOpenChange,
  billSplit,
  billInfo,
  onPaymentSuccess
}) => {
  const [paymentAmount, setPaymentAmount] = useState<number>(
    billSplit.amount_owed - billSplit.amount_paid
  );
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'manual'>('razorpay');
  const { toast } = useToast();

  const remainingAmount = billSplit.amount_owed - billSplit.amount_paid;
  const isFullPayment = paymentAmount === remainingAmount;

  const handleRazorpayPayment = async () => {
    if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
      toast({
        title: 'Invalid Amount',
        description: `Please enter an amount between ₹1 and ₹${remainingAmount.toFixed(2)}`,
        variant: 'destructive'
      });
      return;
    }

    setProcessing(true);
    
    try {
      const paymentData = {
        billSplitId: billSplit.id,
        amount: paymentAmount,
        currency: 'INR',
        description: `Payment for ${billInfo.title} - ${billInfo.group_name}`,
        userEmail: billSplit.user_email,
        userName: billSplit.user_name,
        groupName: billInfo.group_name,
        billTitle: billInfo.title
      };

      const result = await razorpayService.processPayment(paymentData);
      
      if (result.success) {
        toast({
          title: 'Payment Successful! 🎉',
          description: `₹${paymentAmount.toFixed(2)} paid successfully via Razorpay`
        });
        onPaymentSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: 'Payment Failed',
          description: result.error || 'Something went wrong with the payment',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to process payment',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'razorpay':
        return <CreditCard className="h-4 w-4" />;
      case 'upi':
        return <Smartphone className="h-4 w-4" />;
      case 'netbanking':
        return <Building2 className="h-4 w-4" />;
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Make Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bill Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">{billInfo.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-semibold">₹{billSplit.amount_owed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Already Paid:</span>
                <span className="text-green-600">₹{billSplit.amount_paid.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Remaining:</span>
                <span className="text-red-600">₹{remainingAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label htmlFor="paymentAmount">Payment Amount</Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="paymentAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                max={remainingAmount}
                min={0.01}
                step="0.01"
                className="pl-10"
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(remainingAmount / 2)}
                disabled={processing}
              >
                Half (₹{(remainingAmount / 2).toFixed(2)})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(remainingAmount)}
                disabled={processing}
              >
                Full Amount
              </Button>
            </div>
          </div>

          {/* Payment Method Info */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Secure Payment via Razorpay</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1">
                    <CreditCard className="h-3 w-3" />
                    Cards
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Smartphone className="h-3 w-3" />
                    UPI
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    Net Banking
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Smartphone className="h-3 w-3" />
                    Wallets
                  </Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Payment Status Indicators */}
          {billSplit.status === 'paid' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-700">
                This bill split has been fully paid!
              </AlertDescription>
            </Alert>
          )}

          {paymentAmount > remainingAmount && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Payment amount cannot exceed remaining balance of ₹{remainingAmount.toFixed(2)}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRazorpayPayment}
              disabled={processing || paymentAmount <= 0 || paymentAmount > remainingAmount}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ₹{paymentAmount.toFixed(2)}
                </>
              )}
            </Button>
          </div>

          {/* Payment Security Info */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>🔒 Your payment is secured by Razorpay</p>
            <p>💳 All major payment methods accepted</p>
            <p>📱 UPI, Cards, Net Banking, Wallets supported</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RazorpayPaymentDialog;
