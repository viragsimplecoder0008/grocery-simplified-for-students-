import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { formatPrice } from "@/lib/currency";
import { GroupOrder, BillSummary, GroupBillSplit } from "@/types/grocery";
import { Users, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SplitBillProps {
  groupId: number;
  orders: GroupOrder[];
}

export const SplitBill = ({ groupId, orders }: SplitBillProps) => {
  const { user } = useAuth();
  const { currency } = useCurrency();
  const [billSummaries, setBillSummaries] = useState<BillSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orders.length > 0) {
      fetchBillSummaries();
    }
  }, [orders]);

  const fetchBillSummaries = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const mockSummaries: BillSummary[] = orders.map(order => ({
        order_id: order.id,
        total_amount: order.total_amount,
        total_members: 4, // Mock data
        members_who_joined_before: 3,
        amount_per_member: order.total_amount / 3, // Only members who joined before order
        total_paid: order.total_amount * 0.6, // Mock 60% paid
        total_outstanding: order.total_amount * 0.4,
        splits: [
          {
            id: 1,
            order_id: order.id,
            user_id: user?.id || '',
            amount_owed: order.total_amount / 3,
            amount_paid: order.total_amount / 3,
            is_paid: true,
            joined_before_order: true,
            payment_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: user?.id || '',
              email: user?.email || '',
              role: 'student',
              full_name: 'You',
              created_at: '',
              updated_at: ''
            }
          }
        ]
      }));
      setBillSummaries(mockSummaries);
    } catch (error) {
      console.error('Error fetching bill summaries:', error);
      toast.error('Failed to load bill summaries');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = (splitId: number) => {
    toast.success('Payment marked as received');
    // In real app, update the payment status
  };

  const getStatusIcon = (split: GroupBillSplit) => {
    if (split.is_paid) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (!split.joined_before_order) {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (split: GroupBillSplit) => {
    if (split.is_paid) return "Paid";
    if (!split.joined_before_order) return "Joined after order";
    return "Outstanding";
  };

  const getStatusColor = (split: GroupBillSplit) => {
    if (split.is_paid) return "bg-green-100 text-green-800";
    if (!split.joined_before_order) return "bg-gray-100 text-gray-600";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="ml-2">Loading bill summaries...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (billSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Split Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-600">When your group places an order, bill splits will appear here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Split Bills & Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {billSummaries.map((summary) => (
              <div key={summary.order_id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Order #{summary.order_id}</h3>
                    <p className="text-sm text-gray-600">
                      Total: {formatPrice(summary.total_amount, currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {summary.members_who_joined_before} members responsible
                    </div>
                    <div className="font-semibold">
                      {formatPrice(summary.amount_per_member, currency)} per person
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(summary.total_amount, currency)}
                    </div>
                    <div className="text-sm text-blue-600">Total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(summary.total_paid, currency)}
                    </div>
                    <div className="text-sm text-green-600">Paid</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatPrice(summary.total_outstanding, currency)}
                    </div>
                    <div className="text-sm text-red-600">Outstanding</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Member Payments:</h4>
                  {summary.splits.map((split) => (
                    <div key={split.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(split)}
                        <span>{split.user?.full_name || split.user?.email}</span>
                        <Badge className={getStatusColor(split)}>
                          {getStatusText(split)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {split.joined_before_order ? formatPrice(split.amount_owed, currency) : 'N/A'}
                        </span>
                        {!split.is_paid && split.joined_before_order && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkAsPaid(split.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <strong>Bill Split Rule:</strong> Only members who joined before the order was placed are responsible for payment. 
                      New members who join after an order has been placed don't need to contribute to that specific order.
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SplitBill;
