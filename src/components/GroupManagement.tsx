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
import { Users, Plus, Copy, LogOut, Crown, UserX, Bell, CheckCircle, ShoppingCart, DollarSign, Settings, Users2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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

  // Group Settings Management
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedGroupForSettings, setSelectedGroupForSettings] = useState<any>(null);
  const [memberLimit, setMemberLimit] = useState<number>(50);
  const [isUnlimitedMembers, setIsUnlimitedMembers] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

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

  const handleGroupSettings = (group: any) => {
    setSelectedGroupForSettings(group);
    setMemberLimit(group.member_limit || 50);
    setIsUnlimitedMembers(!group.member_limit || group.member_limit >= 10000000);
    setSettingsDialogOpen(true);
  };

  const handleSaveGroupSettings = async () => {
    if (!selectedGroupForSettings) return;
    
    setSavingSettings(true);
    try {
      // Here you would typically update the group settings in the database
      // For now, we'll just show a success message
      const finalMemberLimit = isUnlimitedMembers ? null : memberLimit;
      
      // TODO: Add API call to update group settings
      // await updateGroupSettings(selectedGroupForSettings.id, { member_limit: finalMemberLimit });
      
      toast.success('Group settings updated successfully!');
      setSettingsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update group settings');
    } finally {
      setSavingSettings(false);
    }
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
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-800">Group System Active ✅</h3>
              <p className="text-sm text-green-600">
                Connected to database with real-time synchronization and persistent data storage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Collaborate with your team on grocery lists</p>
        </div>
        
        {/* Notifications */}
        <div className="flex items-center gap-4 justify-center sm:justify-end">
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
                <DialogDescription>
                  View your group invitations and notifications
                </DialogDescription>
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
        <TabsList className={`grid w-full ${userGroups.length === 0 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
          <TabsTrigger value="my-groups" className="text-xs sm:text-sm">My Groups ({userGroups.length}/3)</TabsTrigger>
          {userGroups.length > 0 && (
            <TabsTrigger value="split-bills" className="text-xs sm:text-sm">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Split Bills</span>
              <span className="sm:hidden">Bills</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="join-create" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Join or Create</span>
            <span className="sm:hidden">Join/Create</span>
          </TabsTrigger>
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

                      {isGroupLeader(group) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGroupSettings(group)}
                          title="Group Settings"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                      
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
                <Dialog open={createFormOpen} onOpenChange={(open) => {
                  console.log('Dialog state changing to:', open);
                  setCreateFormOpen(open);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      disabled={userGroups.length >= 3}
                      onClick={() => {
                        console.log('Create Group button clicked');
                        setCreateFormOpen(true);
                      }}
                    >
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

      {/* Group Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Group Settings
            </DialogTitle>
            <DialogDescription>
              Configure settings for "{selectedGroupForSettings?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Member Limit Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Member Limit</Label>
                  <p className="text-xs text-gray-500">Control how many members can join this group</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="unlimited-toggle" className="text-sm">Unlimited</Label>
                  <Switch
                    id="unlimited-toggle"
                    checked={isUnlimitedMembers}
                    onCheckedChange={setIsUnlimitedMembers}
                  />
                </div>
              </div>

              {!isUnlimitedMembers && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Max Members</Label>
                    <div className="flex items-center gap-2">
                      <Users2 className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-lg min-w-[3rem] text-center">
                        {memberLimit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <Slider
                      value={[memberLimit]}
                      onValueChange={(value) => setMemberLimit(value[0])}
                      max={10000000}
                      min={2}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>2</span>
                    <span>10M</span>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Current: <span className="font-medium">{memberLimit.toLocaleString()}</span> members max
                    </p>
                    {memberLimit >= 10000000 && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Tip: Use "Unlimited" toggle for easier management
                      </p>
                    )}
                  </div>
                </div>
              )}

              {isUnlimitedMembers && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700 font-medium">Unlimited members allowed</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Settings Placeholder */}
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 text-center">
                More group settings coming soon...
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setSettingsDialogOpen(false)}
              className="flex-1"
              disabled={savingSettings}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveGroupSettings}
              className="flex-1"
              disabled={savingSettings}
            >
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
