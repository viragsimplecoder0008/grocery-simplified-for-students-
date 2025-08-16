// Temporary stub to fix build error - RazorpayPaymentDialog is disabled
import React from 'react';

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
  // Temporary stub - payment dialog disabled due to file corruption
  return null;
};

export default RazorpayPaymentDialog;
