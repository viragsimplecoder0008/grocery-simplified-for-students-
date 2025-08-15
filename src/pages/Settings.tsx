import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ProfileEditor } from "@/components/ProfileEditor";
import { BirthdayNotifications } from "@/components/BirthdayNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Users, Bell, Shield, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

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
                <CardTitle>General Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Configure general app notifications and alerts.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="birthdays" className="space-y-6">
            <BirthdayNotifications />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Control your privacy and data sharing preferences.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
