import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SplitBillDialog from './SplitBillDialog';
import RazorpayPaymentDialog from './RazorpayPaymentDialog';
import { 
  Receipt, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Plus,
  Eye,
  MoreVertical,
  Filter,
  IndianRupee
} from 'lucide-react';

interface SplitBill {
  id: number;
  group_id: number;
  title: string;
  description: string;
  total_amount: number;
  tax_amount: number;
  tip_amount: number;
  split_method: 'equal' | 'itemized' | 'custom';
  items: any[];
  bill_status: string;
  created_by: string;
  created_at: string;
  created_by_name: string;
  created_by_email: string;
  total_splits: number;
  paid_splits: number;
  total_owed: number;
  total_paid: number;
}

interface BillSplit {
  id: number;
  split_bill_id: number;
  user_id: string;
  amount_owed: number;
  amount_paid: number;
  status: 'pending' | 'paid' | 'cancelled';
  paid_at: string | null;
  notes: string | null;
  user_name: string;
  user_email: string;
}

interface SplitBillsManagerProps {
  groupId: number;
}

const SplitBillsManager: React.FC<SplitBillsManagerProps> = ({ groupId }) => {
  const [splitBills, setSplitBills] = useState<SplitBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<SplitBill | null>(null);
  const [billSplits, setBillSplits] = useState<BillSplit[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<BillSplit | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [razorpayDialogOpen, setRazorpayDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSplitBills();
  }, [groupId]);

  const fetchSplitBills = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('split_bills_with_details')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSplitBills(data || []);
    } catch (error) {
      console.error('Error fetching split bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load split bills',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBillSplits = async (billId: number) => {
    try {
      const { data, error } = await supabase
        .from('bill_splits')
        .select(`
          *,
          profiles!inner(
            full_name,
            email
          )
        `)
        .eq('split_bill_id', billId);

      if (error) throw error;

      const splits = data.map(split => ({
        ...split,
        user_name: split.profiles.full_name || split.profiles.email,
        user_email: split.profiles.email
      }));

      setBillSplits(splits);
    } catch (error) {
      console.error('Error fetching bill splits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bill details',
        variant: 'destructive',
      });
    }
  };

  const openBillDetails = async (bill: SplitBill) => {
    setSelectedBill(bill);
    await fetchBillSplits(bill.id);
  };

  const openPaymentDialog = (split: BillSplit) => {
    setSelectedSplit(split);
    setPaymentAmount(split.amount_owed - split.amount_paid);
    setPaymentDialogOpen(true);
  };

  const processPayment = async () => {
    if (!selectedSplit || paymentAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid payment amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create payment transaction
      const { error: transactionError } = await supabase
        .from('split_bill_transactions')
        .insert({
          bill_split_id: selectedSplit.id,
          amount: paymentAmount,
          transaction_type: 'payment',
          payment_method: paymentMethod,
          notes: paymentNotes || null,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (transactionError) throw transactionError;

      // Update the bill split amount_paid
      const newAmountPaid = selectedSplit.amount_paid + paymentAmount;
      const { error: updateError } = await supabase
        .from('bill_splits')
        .update({ amount_paid: newAmountPaid })
        .eq('id', selectedSplit.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Payment recorded successfully!',
      });

      // Refresh data
      fetchSplitBills();
      if (selectedBill) {
        fetchBillSplits(selectedBill.id);
      }

      // Reset form
      setPaymentDialogOpen(false);
      setSelectedSplit(null);
      setPaymentAmount(0);
      setPaymentMethod('cash');
      setPaymentNotes('');

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'venmo':
      case 'paypal':
      case 'zelle':
        return <Smartphone className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredBills = splitBills.filter(bill => {
    if (filterStatus === 'all') return true;
    return bill.bill_status === filterStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading split bills...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Split Bills</h2>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bills</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <SplitBillDialog 
            groupId={groupId}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Split Bill
              </Button>
            }
          />
        </div>
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No Split Bills Found</h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all' 
                ? "Create your first split bill to start sharing expenses with your group."
                : `No bills with status "${filterStatus}" found.`
              }
            </p>
            {filterStatus === 'all' && (
              <SplitBillDialog 
                groupId={groupId}
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Split Bill
                  </Button>
                }
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(bill.bill_status)}
                      <CardTitle className="text-lg">{bill.title}</CardTitle>
                      <Badge variant={bill.bill_status === 'completed' ? 'default' : 'secondary'}>
                        {bill.bill_status}
                      </Badge>
                    </div>
                    {bill.description && (
                      <p className="text-sm text-gray-600">{bill.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ${bill.total_amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {bill.paid_splits}/{bill.total_splits} paid
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Split {bill.split_method === 'equal' ? 'equally' : bill.split_method}</span>
                    </div>
                    <div className="text-gray-600">
                      by {bill.created_by_name} • {new Date(bill.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {bill.items && bill.items.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Items: </span>
                      <span className="text-gray-600">
                        {bill.items.slice(0, 2).map(item => item.name).join(', ')}
                        {bill.items.length > 2 && ` +${bill.items.length - 2} more`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      Progress: ${bill.total_paid.toFixed(2)} of ${bill.total_owed.toFixed(2)}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openBillDetails(bill)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bill Details Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              {selectedBill?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-6">
              {/* Bill Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Bill Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${(selectedBill.total_amount - selectedBill.tax_amount - selectedBill.tip_amount).toFixed(2)}</span>
                  </div>
                  {selectedBill.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${selectedBill.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedBill.tip_amount > 0 && (
                    <div className="flex justify-between">
                      <span>Tip:</span>
                      <span>${selectedBill.tip_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>${selectedBill.total_amount.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              {selectedBill.items && selectedBill.items.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedBill.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <span className="font-medium">{item.name}</span>
                            {item.quantity > 1 && <span className="text-gray-600 ml-2">×{item.quantity}</span>}
                          </div>
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Individual Splits */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Splits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billSplits.map((split) => (
                      <div key={split.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {split.user_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{split.user_name}</div>
                            <div className="text-sm text-gray-600">{split.user_email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${split.amount_owed.toFixed(2)}
                          </div>
                          <div className="text-sm">
                            {split.amount_paid > 0 ? (
                              <span className="text-green-600">
                                Paid: ${split.amount_paid.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-500">Unpaid</span>
                            )}
                          </div>
                          {split.status === 'pending' && split.amount_paid < split.amount_owed && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openPaymentDialog(split)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Banknote className="h-3 w-3 mr-1" />
                                Manual
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedSplit(split);
                                  setRazorpayDialogOpen(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <IndianRupee className="h-3 w-3 mr-1" />
                                Pay Now
                              </Button>
                            </div>
                          )}
                          {split.status === 'paid' && (
                            <Badge variant="default" className="mt-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Paid
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedSplit && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedSplit.user_name}</div>
                <div className="text-sm text-gray-600">
                  Owes: ${selectedSplit.amount_owed.toFixed(2)} | 
                  Paid: ${selectedSplit.amount_paid.toFixed(2)} | 
                  Remaining: ${(selectedSplit.amount_owed - selectedSplit.amount_paid).toFixed(2)}
                </div>
              </div>

              <div>
                <Label htmlFor="paymentAmount">Payment Amount</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  max={selectedSplit.amount_owed - selectedSplit.amount_paid}
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Card
                      </div>
                    </SelectItem>
                    <SelectItem value="venmo">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Venmo
                      </div>
                    </SelectItem>
                    <SelectItem value="paypal">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        PayPal
                      </div>
                    </SelectItem>
                    <SelectItem value="zelle">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Zelle
                      </div>
                    </SelectItem>
                    <SelectItem value="bank_transfer">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentNotes">Notes (Optional)</Label>
                <Input
                  id="paymentNotes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Payment reference, transaction ID, etc."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={processPayment} className="flex-1">
                  Record Payment
                </Button>
                <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Razorpay Payment Dialog */}
      {selectedSplit && (
        <RazorpayPaymentDialog
          open={razorpayDialogOpen}
          onOpenChange={setRazorpayDialogOpen}
          billSplit={{
            ...selectedSplit,
            user_name: selectedSplit.user_name,
            user_email: selectedSplit.user_email
          }}
          billInfo={{
            id: selectedBill?.id || 0,
            title: selectedBill?.title || '',
            group_name: selectedBill?.group_name || '',
            total_amount: selectedBill?.total_amount || 0
          }}
          onPaymentSuccess={() => {
            // Refresh data after successful payment
            fetchSplitBills();
            if (selectedBill) {
              fetchBillSplits(selectedBill.id);
            }
            setRazorpayDialogOpen(false);
            setSelectedSplit(null);
          }}
        />
      )}
    </div>
  );
};

export default SplitBillsManager;
