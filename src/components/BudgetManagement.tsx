import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { useCurrency } from '@/hooks/useCurrency';
import { formatPrice, getCurrencySymbol } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, Clock, Check, X, AlertCircle } from 'lucide-react';
import { BudgetRequest, Group } from '@/types/grocery';
import { toast } from 'sonner';

const BudgetManagement = () => {
  const { user, profile, updateProfile } = useAuth();
  const { userGroups: groups } = useGroups();
  const { currency } = useCurrency();
  const currencySymbol = getCurrencySymbol(currency);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [budgetRequests, setBudgetRequests] = useState<BudgetRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    budget: '',
    groupId: '',
    notes: ''
  });

  const currentBudget = profile?.budget || 0;

  useEffect(() => {
    fetchBudgetRequests();
  }, [user]);

  const fetchBudgetRequests = async () => {
    if (!user) return;

    try {
      // Since group_budgets table doesn't exist yet, use localStorage fallback
      const localRequests = JSON.parse(localStorage.getItem(`fallback_budget_requests_${user.id}`) || '[]');
      setBudgetRequests(localRequests);
    } catch (error: any) {
      console.error('Error fetching budget requests:', error);
      setBudgetRequests([]);
    }
  };

  const handlePersonalBudgetUpdate = async () => {
    if (!user || !formData.budget) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    const newBudget = parseFloat(formData.budget);
    if (isNaN(newBudget) || newBudget < 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    try {
      setLoading(true);

      // Update the profile through the useAuth hook (which handles both database and localStorage)
      await updateProfile({ budget: newBudget });
      
      toast.success('Personal budget updated successfully!');
      setDialogOpen(false);
      setFormData({ budget: '', groupId: '', notes: '' });
    } catch (error: any) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupBudgetRequest = async (group: Group) => {
    if (!user || !formData.budget) {
      toast.error('Please enter a valid budget amount');
      return;
    }

    const newBudget = parseFloat(formData.budget);
    if (isNaN(newBudget) || newBudget < 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    try {
      setLoading(true);

      const budgetRequest: BudgetRequest = {
        id: Date.now(),
        group_id: group.id,
        budget: newBudget,
        requested_by: user.id,
        status: 'pending',
        requested_at: new Date().toISOString(),
        notes: formData.notes || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store in localStorage since database table doesn't exist yet
      const existingRequests = JSON.parse(localStorage.getItem(`fallback_budget_requests_${user.id}`) || '[]');
      const updatedRequests = [...existingRequests, budgetRequest];
      localStorage.setItem(`fallback_budget_requests_${user.id}`, JSON.stringify(updatedRequests));
      
      // Also store for the group leader to see
      const leaderRequests = JSON.parse(localStorage.getItem(`fallback_budget_requests_${group.leader_id}`) || '[]');
      const updatedLeaderRequests = [...leaderRequests, budgetRequest];
      localStorage.setItem(`fallback_budget_requests_${group.leader_id}`, JSON.stringify(updatedLeaderRequests));

      setBudgetRequests(updatedRequests);
      toast.success(`Budget change request sent to group leader for "${group.name}"`);
      
      setDialogOpen(false);
      setFormData({ budget: '', groupId: '', notes: '' });
    } catch (error: any) {
      console.error('Error creating budget request:', error);
      toast.error('Failed to create budget request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (requestId: number, action: 'approve' | 'reject') => {
    if (!user) return;

    try {
      const localRequests = JSON.parse(localStorage.getItem(`fallback_budget_requests_${user.id}`) || '[]');
      const updatedRequests = localRequests.map((request: BudgetRequest) => {
        if (request.id === requestId) {
          return {
            ...request,
            status: action === 'approve' ? 'approved' : 'rejected',
            approved_by: user.id,
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
        return request;
      });

      localStorage.setItem(`fallback_budget_requests_${user.id}`, JSON.stringify(updatedRequests));
      setBudgetRequests(updatedRequests);
      
      toast.success(`Budget request ${action === 'approve' ? 'approved' : 'rejected'}`);
    } catch (error: any) {
      console.error('Error updating budget request:', error);
      toast.error('Failed to update budget request');
    }
  };

  const openPersonalBudgetDialog = () => {
    setFormData({ budget: currentBudget.toString(), groupId: '', notes: '' });
    setDialogOpen(true);
  };

  const openGroupBudgetDialog = (groupId: number) => {
    setFormData({ budget: '', groupId: groupId.toString(), notes: '' });
    setDialogOpen(true);
  };

  const selectedGroup = groups.find(g => g.id.toString() === formData.groupId);
  const isGroupLeader = (groupId: number) => {
    const group = groups.find(g => g.id === groupId);
    return group?.leader_id === user?.id;
  };

  const pendingRequests = budgetRequests.filter(r => r.status === 'pending');
  const myRequests = budgetRequests.filter(r => r.requested_by === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>
          <p className="text-gray-600">Manage your personal and group budgets</p>
        </div>
      </div>

      {/* Current Personal Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Personal Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-600">
                {formatPrice(currentBudget, currency)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Your current shopping budget
              </p>
            </div>
            <Button onClick={openPersonalBudgetDialog}>
              Update Budget
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Group Budgets */}
      {groups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group Budgets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">{group.name}</h3>
                  <p className="text-sm text-gray-600">
                    {isGroupLeader(group.id) ? 'You are the leader' : `Leader: ${group.leader?.full_name || group.leader?.email}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => openGroupBudgetDialog(group.id)}
                  disabled={isGroupLeader(group.id)}
                >
                  {isGroupLeader(group.id) ? 'You\'re the leader' : 'Request Budget Change'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Pending Approval Requests (for group leaders) */}
      {pendingRequests.filter(r => r.requested_by !== user?.id).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Budget Requests Requiring Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.filter(r => r.requested_by !== user?.id).map((request) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">Budget Change Request</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested budget: <strong>{formatPrice(request.budget, currency)}</strong>
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        Notes: {request.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprovalAction(request.id, 'approve')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApprovalAction(request.id, 'reject')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* My Budget Requests */}
      {myRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              My Budget Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">Budget Change Request</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested budget: <strong>{formatPrice(request.budget, currency)}</strong>
                    </p>
                    {request.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        Notes: {request.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested {new Date(request.requested_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    request.status === 'approved' ? 'default' :
                    request.status === 'rejected' ? 'destructive' : 'secondary'
                  }>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Budget Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.groupId ? `Request Budget Change - ${selectedGroup?.name}` : 'Update Personal Budget'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">New Budget ({currencySymbol})</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            
            {formData.groupId && (
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Explain why you need this budget change..."
                  rows={3}
                />
                <p className="text-sm text-gray-600">
                  This request will be sent to the group leader for approval.
                </p>
              </div>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={formData.groupId ? () => handleGroupBudgetRequest(selectedGroup!) : handlePersonalBudgetUpdate}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Processing...' : (formData.groupId ? 'Send Request' : 'Update Budget')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetManagement;
