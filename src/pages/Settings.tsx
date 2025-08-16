import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditor } from "@/components/ProfileEditor";
import { BirthdayNotifications } from "@/components/BirthdayNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Users, Bell, Shield, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    groupInvites: true,
    newItems: true,
    billSplits: true,
    dailyReminders: false,
    weeklyReports: true,
    emailNotifications: true,
    pushNotifications: true
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'friends',
    shareShoppingLists: true,
    allowInvites: true,
    dataAnalytics: false,
    marketingEmails: false
  });

  const updateNotificationSetting = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
  };

  const updatePrivacySetting = (key: string, value: boolean | string) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen page-gradient">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="groups">
              <Users className="w-4 h-4 mr-2" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="birthdays">
              <Calendar className="w-4 h-4 mr-2" />
              Birthdays
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileEditor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Manage your grocery shopping groups and split bills.</p>
                <Button>Create New Group</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Group Invitations</Label>
                      <p className="text-sm text-gray-500">Get notified when someone invites you to a group</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.groupInvites}
                      onCheckedChange={(checked) => updateNotificationSetting('groupInvites', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Items Added</Label>
                      <p className="text-sm text-gray-500">Notify when someone adds items to shared lists</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.newItems}
                      onCheckedChange={(checked) => updateNotificationSetting('newItems', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Bill Split Updates</Label>
                      <p className="text-sm text-gray-500">Get updates on split bill calculations</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.billSplits}
                      onCheckedChange={(checked) => updateNotificationSetting('billSplits', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Daily Reminders</Label>
                      <p className="text-sm text-gray-500">Daily shopping list reminders</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.dailyReminders}
                      onCheckedChange={(checked) => updateNotificationSetting('dailyReminders', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-gray-500">Weekly spending and shopping summaries</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => updateNotificationSetting('weeklyReports', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Delivery Methods</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => updateNotificationSetting('emailNotifications', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications in the app</p>
                    </div>
                    <Switch 
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => updateNotificationSetting('pushNotifications', checked)}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full">Save Notification Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="birthdays" className="space-y-6">
            <BirthdayNotifications />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Data Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Shopping Lists</Label>
                      <p className="text-sm text-gray-500">Allow others to see your shopping patterns</p>
                    </div>
                    <Switch 
                      checked={privacySettings.shareShoppingLists}
                      onCheckedChange={(checked) => updatePrivacySetting('shareShoppingLists', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Group Invites</Label>
                      <p className="text-sm text-gray-500">Let others invite you to grocery groups</p>
                    </div>
                    <Switch 
                      checked={privacySettings.allowInvites}
                      onCheckedChange={(checked) => updatePrivacySetting('allowInvites', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Data Analytics</Label>
                      <p className="text-sm text-gray-500">Help improve the app with anonymous usage data</p>
                    </div>
                    <Switch 
                      checked={privacySettings.dataAnalytics}
                      onCheckedChange={(checked) => updatePrivacySetting('dataAnalytics', checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-gray-500">Receive promotional emails and updates</p>
                    </div>
                    <Switch 
                      checked={privacySettings.marketingEmails}
                      onCheckedChange={(checked) => updatePrivacySetting('marketingEmails', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Data Management</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      Download My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-orange-600 hover:text-orange-700">
                      Clear Shopping History
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      Delete Account
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button className="w-full">Save Privacy Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
