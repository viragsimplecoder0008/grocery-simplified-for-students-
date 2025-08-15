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
      const mockSummaries: BillSummary[] = orders.map(order => {
        const mockSplits: GroupBillSplit[] = [
          {
            id: 1,
            order_id: order.id,
            user_id: user?.id || '',
            amount_owed: order.total_amount / 4,
            amount_paid: order.total_amount / 4,
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
          },
          {
            id: 2,
            order_id: order.id,
            user_id: 'user2',
            amount_owed: order.total_amount / 4,
            amount_paid: order.total_amount / 4,
            is_paid: true,
            joined_before_order: true,
            payment_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: 'user2',
              email: 'alice@example.com',
              role: 'student',
              full_name: 'Alice Johnson',
              created_at: '',
              updated_at: ''
            }
          },
          {
            id: 3,
            order_id: order.id,
            user_id: 'user3',
            amount_owed: order.total_amount / 4,
            amount_paid: 0,
            is_paid: false,
            joined_before_order: true,
            payment_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: 'user3',
              email: 'bob@example.com',
              role: 'student',
              full_name: 'Bob Smith',
              created_at: '',
              updated_at: ''
            }
          },
          {
            id: 4,
            order_id: order.id,
            user_id: 'user4',
            amount_owed: order.total_amount / 4,
            amount_paid: 0,
            is_paid: false,
            joined_before_order: true,
            payment_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: 'user4',
              email: 'carol@example.com',
              role: 'student',
              full_name: 'Carol Davis',
              created_at: '',
              updated_at: ''
            }
          },
          {
            id: 5,
            order_id: order.id,
            user_id: 'user5',
            amount_owed: 0,
            amount_paid: 0,
            is_paid: false,
            joined_before_order: false,
            payment_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: 'user5',
              email: 'dave@example.com',
              role: 'student',
              full_name: 'Dave Wilson',
              created_at: '',
              updated_at: ''
            }
          }
        ];

        const membersResponsible = mockSplits.filter(s => s.joined_before_order).length;
        const totalPaid = mockSplits.reduce((sum, s) => sum + (s.is_paid ? s.amount_paid : 0), 0);

        return {
          order_id: order.id,
          total_amount: order.total_amount,
          total_members: mockSplits.length,
          members_who_joined_before: membersResponsible,
          amount_per_member: order.total_amount / membersResponsible,
          total_paid: totalPaid,
          total_outstanding: order.total_amount - totalPaid,
          splits: mockSplits
        };
      });
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
    return "Due";
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
                    <div className="text-xs text-gray-500 mt-1">
                      {summary.splits.filter(s => s.is_paid && s.joined_before_order).length} members paid
                    </div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {formatPrice(summary.total_outstanding, currency)}
                    </div>
                    <div className="text-sm text-red-600">Due</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {summary.splits.filter(s => !s.is_paid && s.joined_before_order).length} members pending
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Payment Status:</h4>
                  
                  {/* Payment Summary */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2">✅ Paid Members</h5>
                      <div className="space-y-1">
                        {summary.splits.filter(s => s.is_paid && s.joined_before_order).map((split) => (
                          <div key={split.id} className="flex items-center gap-1 text-sm">
                            <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                            <span className="text-green-700">{split.user?.full_name || split.user?.email}</span>
                          </div>
                        ))}
                        {summary.splits.filter(s => s.is_paid && s.joined_before_order).length === 0 && (
                          <p className="text-sm text-gray-500 italic">No payments yet</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2">⏳ Due Payments</h5>
                      <div className="space-y-1">
                        {summary.splits.filter(s => !s.is_paid && s.joined_before_order).map((split) => (
                          <div key={split.id} className="flex items-center gap-1 text-sm">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            <span className="text-red-700">{split.user?.full_name || split.user?.email}</span>
                          </div>
                        ))}
                        {summary.splits.filter(s => !s.is_paid && s.joined_before_order).length === 0 && (
                          <p className="text-sm text-gray-500 italic">All paid up! 🎉</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Member List */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">All Members:</h5>
                    {summary.splits.map((split) => (
                      <div key={split.id} className="flex items-center justify-between p-2 bg-white border rounded mb-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(split)}
                          <span className="font-medium">{split.user?.full_name || split.user?.email}</span>
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
