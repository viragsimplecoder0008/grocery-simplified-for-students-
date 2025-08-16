import { supabase } from '@/integrations/supabase/client';
import { RAZORPAY_CONFIG, PAYMENT_STATUS } from '@/lib/razorpay';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentData {
  billSplitId: number;
  amount: number;
  currency?: string;
  description: string;
  userEmail: string;
  userName: string;
  groupName: string;
  billTitle: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  error?: string;
  data?: any;
}

export class RazorpayPaymentService {
  private static instance: RazorpayPaymentService;
  private isScriptLoaded = false;

  static getInstance(): RazorpayPaymentService {
    if (!RazorpayPaymentService.instance) {
      RazorpayPaymentService.instance = new RazorpayPaymentService();
    }
    return RazorpayPaymentService.instance;
  }

  // Load Razorpay script dynamically
  async loadRazorpayScript(): Promise<boolean> {
    if (this.isScriptLoaded) return true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  }

  // Convert amount to smallest currency unit (paise for INR)
  private convertToPaise(amount: number): number {
    return Math.round(amount * 100);
  }

  // Generate receipt ID
  private generateReceiptId(billSplitId: number): string {
    return `${RAZORPAY_CONFIG.receiptPrefix}${billSplitId}_${Date.now()}`;
  }

  // Create order on your backend (you'll need to implement this endpoint)
  async createOrder(paymentData: PaymentData): Promise<{ orderId: string; amount: number }> {
    try {
      // For now, we'll create a mock order
      // In production, you should call your backend to create a Razorpay order
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const amount = this.convertToPaise(paymentData.amount);
      
      // TODO: Implement actual backend call
      // const response = await fetch('/api/create-razorpay-order', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     amount,
      //     currency: paymentData.currency || 'INR',
      //     receipt: this.generateReceiptId(paymentData.billSplitId),
      //     notes: {
      //       billSplitId: paymentData.billSplitId.toString(),
      //       billTitle: paymentData.billTitle
      //     }
      //   })
      // });
      // const order = await response.json();
      
      return { orderId, amount };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Process payment through Razorpay
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay');
      }

      // Create order
      const { orderId, amount } = await this.createOrder(paymentData);

      // Configure Razorpay options
      const options = {
        key: RAZORPAY_CONFIG.keyId,
        amount: amount, // Amount in paise
        currency: paymentData.currency || RAZORPAY_CONFIG.currency,
        order_id: orderId,
        name: 'Grocery Simplified',
        description: paymentData.description,
        image: '/favicon.ico', // Your app logo
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment and record transaction
            await this.handlePaymentSuccess(response, paymentData);
            return { success: true, paymentId: response.razorpay_payment_id, orderId };
          } catch (error) {
            console.error('Payment verification failed:', error);
            throw error;
          }
        },
        prefill: {
          name: paymentData.userName,
          email: paymentData.userEmail,
        },
        notes: {
          billSplitId: paymentData.billSplitId.toString(),
          groupName: paymentData.groupName,
          billTitle: paymentData.billTitle
        },
        theme: RAZORPAY_CONFIG.theme,
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled');
            return { success: false, error: 'Payment cancelled by user' };
          }
        }
      };

      return new Promise((resolve) => {
        const rzp = new window.Razorpay({
          ...options,
          handler: async (response: RazorpayResponse) => {
            try {
              await this.handlePaymentSuccess(response, paymentData);
              resolve({ 
                success: true, 
                paymentId: response.razorpay_payment_id, 
                orderId: response.razorpay_order_id 
              });
            } catch (error) {
              resolve({ success: false, error: 'Payment verification failed' });
            }
          },
          modal: {
            ondismiss: () => {
              resolve({ success: false, error: 'Payment cancelled by user' });
            }
          }
        });

        rzp.on('payment.failed', (response: any) => {
          console.error('Payment failed:', response.error);
          resolve({ 
            success: false, 
            error: response.error.description || 'Payment failed' 
          });
        });

        rzp.open();
      });

    } catch (error: any) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message || 'Payment processing failed' };
    }
  }

  // Handle successful payment
  private async handlePaymentSuccess(response: RazorpayResponse, paymentData: PaymentData): Promise<void> {
    try {
      // Get current user
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser?.user?.id) {
        throw new Error('User not authenticated');
      }

      // Record payment transaction
      const { error: transactionError } = await supabase
        .from('split_bill_transactions')
        .insert({
          bill_split_id: paymentData.billSplitId,
          amount: paymentData.amount,
          transaction_type: 'payment',
          payment_method: 'razorpay',
          transaction_id: response.razorpay_payment_id,
          notes: `Razorpay Payment - Order: ${response.razorpay_order_id}`,
          created_by: currentUser.user.id
        });

      if (transactionError) {
        throw new Error(`Failed to record transaction: ${transactionError.message}`);
      }

      // Update bill split amount paid
      const { data: billSplit, error: fetchError } = await supabase
        .from('bill_splits')
        .select('amount_paid, amount_owed')
        .eq('id', paymentData.billSplitId)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch bill split: ${fetchError.message}`);
      }

      const newAmountPaid = (billSplit.amount_paid || 0) + paymentData.amount;
      const { error: updateError } = await supabase
        .from('bill_splits')
        .update({ 
          amount_paid: newAmountPaid,
          status: newAmountPaid >= billSplit.amount_owed ? 'paid' : 'pending'
        })
        .eq('id', paymentData.billSplitId);

      if (updateError) {
        throw new Error(`Failed to update bill split: ${updateError.message}`);
      }

      toast.success('Payment successful! 🎉', {
        description: `Payment of ${paymentData.amount.toFixed(2)} processed via Razorpay`
      });

    } catch (error: any) {
      console.error('Error handling payment success:', error);
      toast.error('Payment recorded but there was an issue updating the bill', {
        description: error.message
      });
      throw error;
    }
  }

  // Verify payment signature (should be done on backend in production)
  async verifyPaymentSignature(
    paymentId: string, 
    orderId: string, 
    signature: string
  ): Promise<boolean> {
    try {
      // In production, this should be done on your backend for security
      // For now, we'll assume verification is successful
      console.log('Payment signature verification:', { paymentId, orderId, signature });
      
      // TODO: Implement server-side signature verification
      // const response = await fetch('/api/verify-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ paymentId, orderId, signature })
      // });
      // return response.ok;
      
      return true;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      // In production, call your backend to get payment status from Razorpay
      console.log('Getting payment status for:', paymentId);
      return PAYMENT_STATUS.SUCCESS;
    } catch (error) {
      console.error('Error getting payment status:', error);
      return PAYMENT_STATUS.FAILED;
    }
  }

  // Refund payment (if needed)
  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResult> {
    try {
      // TODO: Implement refund functionality
      console.log('Refunding payment:', paymentId, amount);
      
      // This should be done on your backend
      // const response = await fetch('/api/refund-payment', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ paymentId, amount })
      // });
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const razorpayService = RazorpayPaymentService.getInstance();
