import { toast } from 'sonner';

export interface MockPaymentOptions {
  amount: number;
  currency: string;
  description: string;
  userId: string;
  billId: string;
}

export interface MockPaymentResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  signature: string;
  amount: number;
  method: string;
  status: 'completed' | 'failed';
  timestamp: string;
}

class MockRazorpayService {
  private static instance: MockRazorpayService;

  public static getInstance(): MockRazorpayService {
    if (!MockRazorpayService.instance) {
      MockRazorpayService.instance = new MockRazorpayService();
    }
    return MockRazorpayService.instance;
  }

  // Simulate payment methods
  private paymentMethods = [
    { method: 'upi', label: 'UPI (GPay/PhonePe)', icon: '📱' },
    { method: 'card', label: 'Credit/Debit Card', icon: '💳' },
    { method: 'netbanking', label: 'Net Banking', icon: '🏦' },
    { method: 'wallet', label: 'Digital Wallet', icon: '👛' },
  ];

  // Generate realistic mock IDs
  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}_${timestamp}${random}`;
  }

  // Simulate payment processing
  public async processPayment(options: MockPaymentOptions): Promise<MockPaymentResponse> {
    return new Promise((resolve, reject) => {
      // Show mock Razorpay-like interface
      this.showMockPaymentInterface(options, (result) => {
        if (result.success) {
          // Simulate successful payment
          const response: MockPaymentResponse = {
            success: true,
            paymentId: this.generateId('pay'),
            orderId: this.generateId('order'),
            signature: this.generateId('sig'),
            amount: options.amount,
            method: result.method,
            status: 'completed',
            timestamp: new Date().toISOString(),
          };
          
          toast.success(`Payment Successful! 🎉`, {
            description: `₹${options.amount} paid via ${result.methodLabel}`,
            duration: 5000,
          });
          
          resolve(response);
        } else {
          // Simulate payment failure
          const response: MockPaymentResponse = {
            success: false,
            paymentId: this.generateId('pay'),
            orderId: this.generateId('order'),
            signature: '',
            amount: options.amount,
            method: result.method,
            status: 'failed',
            timestamp: new Date().toISOString(),
          };
          
          toast.error("Payment Failed ❌", {
            description: result.error || "Payment was cancelled or failed",
            duration: 5000,
          });
          
          reject(new Error(result.error || 'Payment failed'));
        }
      });
    });
  }

  // Show mock payment interface
  private showMockPaymentInterface(
    options: MockPaymentOptions,
    callback: (result: any) => void
  ): void {
    // Create mock payment dialog
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    dialog.innerHTML = `
      <div style="
        background: white;
        border-radius: 12px;
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 16px;
          ">
            <h2 style="margin: 0; font-size: 18px;">🚀 Mock Razorpay Payment</h2>
          </div>
          <p style="margin: 0; color: #666; font-size: 14px;">
            This is a demo payment interface - No real money involved!
          </p>
        </div>

        <div style="
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        ">
          <div style="font-size: 24px; font-weight: bold; color: #1e293b;">
            ₹${options.amount.toFixed(2)}
          </div>
          <div style="color: #64748b; font-size: 14px; margin-top: 4px;">
            ${options.description}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #374151;">
            Choose Payment Method:
          </h3>
          <div id="payment-methods">
            ${this.paymentMethods.map((method, index) => `
              <div 
                class="payment-method" 
                data-method="${method.method}"
                data-label="${method.label}"
                style="
                  border: 2px solid #e5e7eb;
                  border-radius: 8px;
                  padding: 12px;
                  margin-bottom: 8px;
                  cursor: pointer;
                  transition: all 0.2s;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                "
                onmouseover="this.style.borderColor='#3b82f6'; this.style.backgroundColor='#eff6ff'"
                onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white'"
              >
                <span style="font-size: 20px;">${method.icon}</span>
                <span style="font-weight: 500;">${method.label}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 12px;">
          <button 
            id="cancel-payment"
            style="
              flex: 1;
              padding: 12px;
              border: 2px solid #dc2626;
              background: white;
              color: #dc2626;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            "
            onmouseover="this.style.backgroundColor='#dc2626'; this.style.color='white'"
            onmouseout="this.style.backgroundColor='white'; this.style.color='#dc2626'"
          >
            ❌ Cancel
          </button>
          <button 
            id="pay-now"
            style="
              flex: 2;
              padding: 12px;
              border: none;
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 500;
              transition: all 0.2s;
            "
            onmouseover="this.style.transform='translateY(-1px)'"
            onmouseout="this.style.transform='translateY(0)'"
          >
            💳 Pay Now
          </button>
        </div>

        <div style="
          margin-top: 16px;
          padding: 12px;
          background: #fef3c7;
          border-radius: 6px;
          font-size: 12px;
          color: #92400e;
          text-align: center;
        ">
          🧪 Demo Mode: This simulates the actual Razorpay experience
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    let selectedMethod = this.paymentMethods[0]; // Default to first method

    // Handle method selection
    const methodElements = dialog.querySelectorAll('.payment-method');
    methodElements.forEach(element => {
      element.addEventListener('click', () => {
        // Remove selection from all methods
        methodElements.forEach(el => {
          (el as HTMLElement).style.borderColor = '#e5e7eb';
          (el as HTMLElement).style.backgroundColor = 'white';
        });
        
        // Highlight selected method
        (element as HTMLElement).style.borderColor = '#3b82f6';
        (element as HTMLElement).style.backgroundColor = '#eff6ff';
        
        selectedMethod = {
          method: element.getAttribute('data-method') || '',
          label: element.getAttribute('data-label') || '',
          icon: this.paymentMethods.find(m => m.method === element.getAttribute('data-method'))?.icon || '💳'
        };
      });
    });

    // Handle cancel
    dialog.querySelector('#cancel-payment')?.addEventListener('click', () => {
      document.body.removeChild(dialog);
      callback({
        success: false,
        method: selectedMethod.method,
        methodLabel: selectedMethod.label,
        error: 'Payment cancelled by user'
      });
    });

    // Handle payment
    dialog.querySelector('#pay-now')?.addEventListener('click', () => {
      // Simulate processing time
      const payButton = dialog.querySelector('#pay-now') as HTMLButtonElement;
      payButton.innerHTML = '⏳ Processing...';
      payButton.disabled = true;
      
      setTimeout(() => {
        document.body.removeChild(dialog);
        
        // 90% success rate for demo
        const success = Math.random() > 0.1;
        
        callback({
          success,
          method: selectedMethod.method,
          methodLabel: selectedMethod.label,
          error: success ? null : 'Simulated payment failure for testing'
        });
      }, 2000); // 2 second processing simulation
    });
  }

  // Verify payment signature (mock)
  public verifyPaymentSignature(paymentId: string, orderId: string, signature: string): boolean {
    // In mock mode, always return true for valid-looking IDs
    return paymentId.startsWith('pay_') && orderId.startsWith('order_') && signature.startsWith('sig_');
  }

  // Get payment methods
  public getPaymentMethods() {
    return this.paymentMethods;
  }
}

// Export singleton instance
export const mockRazorpayService = MockRazorpayService.getInstance();
