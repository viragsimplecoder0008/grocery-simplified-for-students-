import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Receipt, Users, DollarSign, Calculator, Send, UserPlus, Trash2, Equal } from 'lucide-react';

interface GroupMember {
  id: string;
  full_name: string;
  email: string;
  user_id: string;
}

interface BillItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  assignedTo: string[];
}

interface SplitBillDialogProps {
  trigger?: React.ReactNode;
  groupId?: number;
}

export const SplitBillDialog: React.FC<SplitBillDialogProps> = ({ trigger, groupId }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [billTitle, setBillTitle] = useState('');
  const [billDescription, setBillDescription] = useState('');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'itemized' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<Record<string, number>>({});
  const [taxAmount, setTaxAmount] = useState(0);
  const [tipAmount, setTipAmount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open && groupId) {
      fetchGroupMembers();
    }
  }, [open, groupId]);

  const fetchGroupMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          user_id,
          profiles!inner(
            id,
            full_name,
            email
          )
        `)
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (error) throw error;

      const members = data.map(item => ({
        id: item.profiles.id,
        full_name: item.profiles.full_name || item.profiles.email,
        email: item.profiles.email,
        user_id: item.user_id
      }));

      setGroupMembers(members);
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load group members',
        variant: 'destructive',
      });
    }
  };

  const addBillItem = () => {
    const newItem: BillItem = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      quantity: 1,
      assignedTo: []
    };
    setBillItems([...billItems, newItem]);
  };

  const updateBillItem = (id: string, field: keyof BillItem, value: any) => {
    setBillItems(items => 
      items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeBillItem = (id: string) => {
    setBillItems(items => items.filter(item => item.id !== id));
  };

  const togglePersonForItem = (itemId: string, personId: string) => {
    updateBillItem(itemId, 'assignedTo', 
      billItems.find(item => item.id === itemId)?.assignedTo.includes(personId)
        ? billItems.find(item => item.id === itemId)?.assignedTo.filter(id => id !== personId)
        : [...(billItems.find(item => item.id === itemId)?.assignedTo || []), personId]
    );
  };

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + taxAmount + tipAmount;
    return { subtotal, total };
  };

  const calculateSplits = () => {
    const { total } = calculateTotals();
    const splits: Record<string, number> = {};

    if (splitMethod === 'equal') {
      const perPerson = total / groupMembers.length;
      groupMembers.forEach(member => {
        splits[member.user_id] = perPerson;
      });
    } else if (splitMethod === 'itemized') {
      // Calculate based on assigned items
      groupMembers.forEach(member => {
        let memberTotal = 0;
        billItems.forEach(item => {
          if (item.assignedTo.includes(member.user_id)) {
            const itemTotal = item.price * item.quantity;
            const splitCount = item.assignedTo.length;
            memberTotal += itemTotal / splitCount;
          }
        });
        // Add proportional tax and tip
        const memberProportion = memberTotal / calculateTotals().subtotal;
        memberTotal += (taxAmount + tipAmount) * memberProportion;
        splits[member.user_id] = memberTotal;
      });
    } else if (splitMethod === 'custom') {
      Object.assign(splits, customSplits);
    }

    return splits;
  };

  const createSplitBill = async () => {
    if (!billTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a bill title',
        variant: 'destructive',
      });
      return;
    }

    if (billItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one item',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      const splits = calculateSplits();
      const { total } = calculateTotals();

      // Create the split bill record
      const { data: splitBill, error: billError } = await supabase
        .from('split_bills')
        .insert({
          group_id: groupId,
          title: billTitle,
          description: billDescription,
          total_amount: total,
          tax_amount: taxAmount,
          tip_amount: tipAmount,
          split_method: splitMethod,
          created_by: currentUser?.user?.id,
          items: billItems,
          status: 'pending'
        })
        .select()
        .single();

      if (billError) throw billError;

      // Create individual split records for each member
      const splitRecords = Object.entries(splits).map(([userId, amount]) => ({
        split_bill_id: splitBill.id,
        user_id: userId,
        amount_owed: amount,
        status: userId === currentUser?.user?.id ? 'paid' : 'pending'
      }));

      const { error: splitsError } = await supabase
        .from('bill_splits')
        .insert(splitRecords);

      if (splitsError) throw splitsError;

      // Send notifications to group members
      const notifications = groupMembers
        .filter(member => member.user_id !== currentUser?.user?.id)
        .map(member => ({
          group_id: groupId,
          user_id: member.user_id,
          type: 'split_bill',
          title: 'New Split Bill',
          message: `${currentUser?.user?.email} created a new split bill: ${billTitle}`,
          data: { split_bill_id: splitBill.id, amount: splits[member.user_id] }
        }));

      if (notifications.length > 0) {
        await supabase.from('group_notifications').insert(notifications);
      }

      toast({
        title: 'Success',
        description: 'Split bill created successfully!',
      });

      // Reset form
      setBillTitle('');
      setBillDescription('');
      setBillItems([]);
      setTaxAmount(0);
      setTipAmount(0);
      setCustomSplits({});
      setOpen(false);

    } catch (error) {
      console.error('Error creating split bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to create split bill',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, total } = calculateTotals();
  const splits = calculateSplits();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Receipt className="h-4 w-4" />
            Split Bill
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Create Split Bill
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Bill Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Bill Title*</Label>
              <Input
                id="title"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                placeholder="e.g., Dinner at Tony's"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={billDescription}
                onChange={(e) => setBillDescription(e.target.value)}
                placeholder="Additional details about this bill"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="splitMethod">Split Method</Label>
              <Select value={splitMethod} onValueChange={(value: any) => setSplitMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">
                    <div className="flex items-center gap-2">
                      <Equal className="h-4 w-4" />
                      Split Equally
                    </div>
                  </SelectItem>
                  <SelectItem value="itemized">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      By Items
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Custom Amounts
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Bill Items</Label>
                <Button onClick={addBillItem} size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              {billItems.map((item) => (
                <Card key={item.id} className="p-3">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateBillItem(item.id, 'name', e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.price || ''}
                        onChange={(e) => updateBillItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      />
                      <div className="flex gap-1">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity || ''}
                          onChange={(e) => updateBillItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => removeBillItem(item.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {splitMethod === 'itemized' && (
                      <div>
                        <Label className="text-xs">Assign to:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {groupMembers.map(member => (
                            <Badge
                              key={member.user_id}
                              variant={item.assignedTo.includes(member.user_id) ? 'default' : 'outline'}
                              className="cursor-pointer text-xs"
                              onClick={() => togglePersonForItem(item.id, member.user_id)}
                            >
                              {member.full_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tax">Tax Amount</Label>
                <Input
                  id="tax"
                  type="number"
                  value={taxAmount || ''}
                  onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="tip">Tip Amount</Label>
                <Input
                  id="tip"
                  type="number"
                  value={tipAmount || ''}
                  onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Split Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tip:</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Split Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupMembers.map(member => (
                  <div key={member.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {member.full_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.full_name}</span>
                    </div>
                    <div className="text-right">
                      {splitMethod === 'custom' ? (
                        <Input
                          type="number"
                          value={customSplits[member.user_id] || ''}
                          onChange={(e) => setCustomSplits(prev => ({
                            ...prev,
                            [member.user_id]: parseFloat(e.target.value) || 0
                          }))}
                          className="w-20 h-8 text-right"
                          placeholder="0.00"
                        />
                      ) : (
                        <span className="font-semibold">
                          ${(splits[member.user_id] || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={createSplitBill} disabled={loading} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Split Bill'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SplitBillDialog;
