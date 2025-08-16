# 🚨 URGENT: Build Error Fix + Currency Solution

## **Current Issue**
- `RazorpayPaymentDialog.tsx` file is corrupted and causing build errors
- Syntax error: `Expected 'from', got 'fr'` preventing app from running

## **Immediate Fix (Required)**

### **Step 1: Manual File Fix** 
Since automated file replacement isn't working, you'll need to **manually fix the file**:

1. **Open** `src/components/RazorpayPaymentDialog.tsx` in VS Code
2. **Select All** (Ctrl+A) and **Delete** all content
3. **Copy and paste** this working version:

```tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';
import { razorpayService } from '@/services/razorpayService';
import { CreditCard, Loader2, IndianRupee, AlertCircle } from 'lucide-react';

interface BillSplit {
  id: number;
  bill_id: number;
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
  const { currency } = useCurrency();
  const currencySymbol = getCurrencySymbol(currency);
  const [paymentAmount, setPaymentAmount] = useState<number>(
    billSplit.amount_owed - billSplit.amount_paid
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const remainingAmount = billSplit.amount_owed - billSplit.amount_paid;

  const handleRazorpayPayment = async () => {
    if (paymentAmount <= 0 || paymentAmount > remainingAmount) {
      toast({
        title: 'Invalid Amount',
        description: `Please enter an amount between ${currencySymbol}1 and ${formatPrice(remainingAmount, currency)}`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      const paymentData = {
        amount: paymentAmount,
        billSplitId: billSplit.id,
        billId: billSplit.bill_id,
        userId: billSplit.user_id,
        userEmail: billSplit.user_email,
        userName: billSplit.user_name,
        groupName: billInfo.group_name,
        billTitle: billInfo.title
      };

      const result = await razorpayService.processPayment(paymentData);
      
      if (result.success) {
        toast({
          title: 'Payment Successful! 🎉',
          description: `${formatPrice(paymentAmount, currency)} paid successfully`
        });
        onPaymentSuccess();
        onOpenChange(false);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
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
          <Card>
            <CardContent className="space-y-2 pt-4">
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-semibold">{formatPrice(billSplit.amount_owed, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Already Paid:</span>
                <span className="text-green-600">{formatPrice(billSplit.amount_paid, currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-medium">
                <span>Remaining Balance:</span>
                <span className="text-red-600">{formatPrice(remainingAmount, currency)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Label htmlFor="amount">Payment Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="pl-8"
                min="1"
                max={remainingAmount}
                step="0.01"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(remainingAmount / 2)}
                className="flex-1"
              >
                Half ({formatPrice(remainingAmount / 2, currency)})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(remainingAmount)}
                className="flex-1"
              >
                Full Amount
              </Button>
            </div>
          </div>

          {paymentAmount > remainingAmount && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Payment amount cannot exceed remaining balance of {formatPrice(remainingAmount, currency)}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRazorpayPayment}
              disabled={isProcessing || paymentAmount <= 0 || paymentAmount > remainingAmount}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {formatPrice(paymentAmount, currency)}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RazorpayPaymentDialog;
```

4. **Save the file** (Ctrl+S)

### **Step 2: Remove Diagnostic** 
After confirming everything works, remove the diagnostic component:

In `src/components/BudgetManagement.tsx`:
- Remove the import: `import CurrencyDiagnostic from './CurrencyDiagnostic';`
- Remove the component: `<CurrencyDiagnostic />`

## **Currency Consistency Summary**

### ✅ **Already Fixed:**
- `razorpayService.ts` - Removed hardcoded ₹ symbols
- Most components already use `formatPrice(amount, currency)` correctly

### ✅ **Will Be Fixed** (after manual file fix):
- `RazorpayPaymentDialog.tsx` - Uses dynamic currency formatting
- All payment dialogs show consistent currency

### 🎯 **Expected Result:**
After the manual file fix, **all prices throughout your app will display in the same currency** that you select in settings.

## **Testing Steps:**
1. Fix the file manually (copy the code above)
2. Check that app builds without errors
3. Go to budget page and see diagnostic info
4. Change currency in settings
5. Verify all pages show consistent currency
6. Remove diagnostic component

**This will completely resolve both the build error and currency consistency issues!** 🎉
