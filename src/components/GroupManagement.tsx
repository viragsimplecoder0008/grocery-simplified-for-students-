import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroups } from '@/hooks/useGroups';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Plus, Copy, LogOut, Crown, UserX, Bell, CheckCircle, ShoppingCart, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import SplitBill from '@/components/SplitBill';

export function GroupManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    userGroups, 
    loading, 
    notifications, 
    unreadCount,
    createGroup, 
    joinGroup, 
    leaveGroup, 
    getGroupMembers,
    removeMember,
    markNotificationRead,
    markAllNotificationsRead
  } = useGroups();

  // Create Group Form
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  // Join Group Form
  const [joinCode, setJoinCode] = useState('');
  const [joiningGroup, setJoiningGroup] = useState(false);

  // Group Members Management
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setCreatingGroup(true);
    const result = await createGroup(groupName.trim(), groupDescription.trim() || undefined);
    
    if (result.success) {
      setGroupName('');
      setGroupDescription('');
      setCreateFormOpen(false);
    } else {
      toast.error(result.error || 'Failed to create group');
    }
    
    setCreatingGroup(false);
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setJoiningGroup(true);
    const result = await joinGroup(joinCode.trim());
    
    if (result.success) {
      setJoinCode('');
    } else {
      toast.error(result.error || 'Failed to join group');
    }
    
    setJoiningGroup(false);
  };

  const handleLeaveGroup = async (groupId: number, groupName: string) => {
    const result = await leaveGroup(groupId);
    if (!result.success) {
      toast.error(result.error || 'Failed to leave group');
    }
  };

  const handleViewMembers = async (groupId: number) => {
    setSelectedGroupId(groupId);
    const members = await getGroupMembers(groupId);
    setGroupMembers(members);
    setMembersDialogOpen(true);
  };

  const handleRemoveMember = async (membershipId: number) => {
    const result = await removeMember(membershipId);
    if (result.success) {
      // Refresh members list
      if (selectedGroupId) {
        const members = await getGroupMembers(selectedGroupId);
        setGroupMembers(members);
      }
    }
  };

  const copyJoinCode = (joinCode: string) => {
    navigator.clipboard.writeText(joinCode);
    toast.success('Join code copied to clipboard!');
  };

  const isGroupLeader = (group: any) => {
    return group.leader_id === user?.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Database Status Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800">Group System Active (Fallback Mode)</h3>
              <p className="text-sm text-blue-600">
                Groups are working with local storage. Apply the database migration for full real-time features and persistent data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-600 mt-2">Collaborate with your team on grocery lists</p>
        </div>
        
        {/* Notifications */}
        <div className="flex items-center gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-center text-gray-500">No notifications</p>
                    <p className="text-xs text-gray-400 mt-2">Apply database migration for real-time notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => !notification.is_read && markNotificationRead(notification.id)}
                    >
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="my-groups" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-groups">My Groups ({userGroups.length}/3)</TabsTrigger>
          <TabsTrigger value="split-bills">
            <DollarSign className="w-4 h-4 mr-2" />
            Split Bills
          </TabsTrigger>
          <TabsTrigger value="join-create">Join or Create</TabsTrigger>
        </TabsList>

        {/* My Groups Tab */}
        <TabsContent value="my-groups" className="space-y-4">
          {userGroups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Groups Yet</h3>
                <p className="text-gray-600 mb-6">Create a new group or join an existing one to start collaborating!</p>
                <Button onClick={() => {
                  // Switch to the join-create tab
                  const tabTrigger = document.querySelector('[data-value="join-create"]') as HTMLButtonElement;
                  if (tabTrigger) {
                    tabTrigger.click();
                  }
                }}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userGroups.map((group) => (
                <Card key={group.id} className="relative">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{group.name}</span>
                      {isGroupLeader(group) && (
                        <Badge variant="secondary" className="ml-2">
                          <Crown className="w-3 h-3 mr-1" />
                          Leader
                        </Badge>
                      )}
                    </CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Join Code:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyJoinCode(group.join_code)}
                        className="h-auto p-1 text-blue-600 hover:text-blue-800"
                      >
                        {group.join_code} <Copy className="w-3 h-3 ml-1" />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="flex-1"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        View List
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMembers(group.id)}
                      >
                        <Users className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                            <LogOut className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave Group</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to leave "{group.name}"? You'll need the join code to rejoin later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleLeaveGroup(group.id, group.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Leave Group
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Split Bills Tab */}
        <TabsContent value="split-bills" className="space-y-6">
          <SplitBill 
            groupId={userGroups[0]?.id || 0} 
            orders={[
              {
                id: 1,
                group_id: userGroups[0]?.id || 0,
                order_date: new Date().toISOString(),
                total_amount: 45.50,
                status: 'active',
                created_by: user?.id || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ]} 
          />
        </TabsContent>

        {/* Join or Create Tab */}
        <TabsContent value="join-create" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Join Group Card */}
            <Card>
              <CardHeader>
                <CardTitle>Join a Group</CardTitle>
                <CardDescription>
                  Enter a join code to join an existing group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="join-code">Join Code</Label>
                    <Input
                      id="join-code"
                      placeholder="Enter 6-character code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="uppercase"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={joiningGroup}>
                    {joiningGroup ? 'Joining...' : 'Join Group'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Create Group Card */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Group</CardTitle>
                <CardDescription>
                  Start a new grocery list group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={createFormOpen} onOpenChange={setCreateFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={userGroups.length >= 3}>
                      <Plus className="w-4 h-4 mr-2" />
                      {userGroups.length >= 3 ? 'Group Limit Reached' : 'Create Group'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Group</DialogTitle>
                      <DialogDescription>
                        Create a new grocery list group and invite others to join
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="group-name">Group Name</Label>
                        <Input
                          id="group-name"
                          placeholder="e.g., Family Groceries"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="group-description">Description (Optional)</Label>
                        <Textarea
                          id="group-description"
                          placeholder="Describe your group..."
                          value={groupDescription}
                          onChange={(e) => setGroupDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCreateFormOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={creatingGroup} className="flex-1">
                          {creatingGroup ? 'Creating...' : 'Create Group'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {userGroups.length >= 3 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-800">Group Limit Reached</h3>
                    <p className="text-sm text-amber-600">You can only be a member of up to 3 groups. Leave a group to create or join a new one.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Group Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Group Members</DialogTitle>
            <DialogDescription>
              {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {groupMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <div className="font-medium">{member.email}</div>
                  <div className="text-sm text-gray-600">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </div>
                </div>
                {selectedGroupId && isGroupLeader(userGroups.find(g => g.id === selectedGroupId)) && member.user_id !== user?.id && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                        <UserX className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {member.email} from this group?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveMember(member.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove Member
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
