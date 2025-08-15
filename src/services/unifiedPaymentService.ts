import { mockRazorpayService } from './mockRazorpayService';
import { razorpayService } from './razorpayService';
import { PAYMENT_CONFIG, isUsingMockPayments } from '@/lib/paymentConfig';
import { toast } from 'sonner';

export interface PaymentOptions {
  amount: number;
  currency: string;
  description: string;
  userId: string;
  billId: string;
  userEmail?: string;
  userName?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  signature: string;
  amount: number;
  method: string;
  status: 'completed' | 'failed';
  timestamp: string;
}

class UnifiedPaymentService {
  private static instance: UnifiedPaymentService;

  public static getInstance(): UnifiedPaymentService {
    if (!UnifiedPaymentService.instance) {
      UnifiedPaymentService.instance = new UnifiedPaymentService();
    }
    return UnifiedPaymentService.instance;
  }

  public async processPayment(options: PaymentOptions): Promise<PaymentResponse> {
    try {
      // Show which mode we're using
      if (isUsingMockPayments()) {
        console.log('🧪 Using Mock Payment Mode - No real money involved!');
        return await mockRazorpayService.processPayment(options);
      } else {
        console.log('💳 Using Real Razorpay Integration');
        return await razorpayService.processPayment(options);
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      
      toast.error(error instanceof Error ? error.message : "Payment processing failed", {
        description: "Please try again or contact support if the issue persists"
      });
      
      throw error;
    }
  }

  public verifyPaymentSignature(paymentId: string, orderId: string, signature: string): boolean {
    if (isUsingMockPayments()) {
      return mockRazorpayService.verifyPaymentSignature(paymentId, orderId, signature);
    } else {
      return razorpayService.verifyPaymentSignature(paymentId, orderId, signature);
    }
  }

  public getPaymentMethods() {
    if (isUsingMockPayments()) {
      return mockRazorpayService.getPaymentMethods();
    } else {
      return razorpayService.getPaymentMethods();
    }
  }

  public getPaymentMode(): 'mock' | 'real' {
    return isUsingMockPayments() ? 'mock' : 'real';
  }

  public getConfig() {
    return {
      mode: this.getPaymentMode(),
      currency: PAYMENT_CONFIG.CURRENCY,
      ui: PAYMENT_CONFIG.UI,
      showDemoBadges: PAYMENT_CONFIG.UI.SHOW_DEMO_BADGES && isUsingMockPayments(),
    };
  }
}

// Export singleton instance
export const paymentService = UnifiedPaymentService.getInstance();
