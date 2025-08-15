import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BirthdayNotificationService } from "@/services/birthdayNotificationService";
import { Calendar, Gift, TestTube, Mail, Bell } from "lucide-react";
import { toast } from "sonner";

export function BirthdayNotificationDemo() {
  const [testData, setTestData] = useState({
    fullName: 'John Doe',
    birthDay: '15',
    birthMonth: '8', // August (current month for testing)
    daysOffset: '0' // How many days from today to simulate the birthday
  });
  const [isLoading, setIsLoading] = useState(false);

  const simulateBirthday = async () => {
    setIsLoading(true);
    try {
      const today = new Date();
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + parseInt(testData.daysOffset));
      
      // Create test user profile in localStorage
      const testProfile = {
        id: 'test-user-123',
        full_name: testData.fullName,
        birth_day: targetDate.getDate(),
        birth_month: targetDate.getMonth() + 1,
        email: 'test@example.com'
      };
      
      // Store test profile
      localStorage.setItem('test_birthday_profile', JSON.stringify(testProfile));
      
      // Override getCurrentUserProfile for testing
      const originalMethod = (BirthdayNotificationService as any).getCurrentUserProfile;
      (BirthdayNotificationService as any).getCurrentUserProfile = async () => testProfile;
      
      // Trigger birthday check
      const notifications = await BirthdayNotificationService.triggerBirthdayCheck();
      
      // Restore original method
      (BirthdayNotificationService as any).getCurrentUserProfile = originalMethod;
      
      // Clean up test data
      localStorage.removeItem('test_birthday_profile');
      
      if (notifications.length > 0) {
        toast.success(`Generated ${notifications.length} birthday notification(s)!`);
      } else {
        toast.info('No birthday notifications generated for this date range');
      }
      
    } catch (error) {
      console.error('Error simulating birthday:', error);
      toast.error('Failed to simulate birthday notification');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailPreview = () => {
    // Mock email data for preview
    const emailData = {
      to: 'test@example.com',
      name: 'Test User',
      birthdayPerson: testData.fullName,
      daysUntil: parseInt(testData.daysOffset),
      notificationType: parseInt(testData.daysOffset) === 0 ? 'birthday_today' : 
                       parseInt(testData.daysOffset) === 1 ? 'birthday_tomorrow' :
                       parseInt(testData.daysOffset) <= 7 ? 'birthday_week' : 'birthday_month'
    };
    
    // This would show an email preview in a real implementation
    toast.info(`Email preview: ${emailData.birthdayPerson}'s birthday notification`, {
      description: `Would be sent to: ${emailData.to}`
    });
    
    console.log('Email preview data:', emailData);
  };

  const clearAllNotifications = () => {
    localStorage.removeItem('birthday_notifications');
    localStorage.removeItem('birthday_notifications_db');
    toast.success('All test notifications cleared');
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Birthday Notification Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-700">
            Use this tool to test birthday notifications with different scenarios.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Test Person Name</Label>
              <Input
                id="fullName"
                value={testData.fullName}
                onChange={(e) => setTestData({...testData, fullName: e.target.value})}
                placeholder="Enter name for testing"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="daysOffset">Days from Today</Label>
              <Select 
                value={testData.daysOffset} 
                onValueChange={(value) => setTestData({...testData, daysOffset: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Today (birthday today)</SelectItem>
                  <SelectItem value="1">Tomorrow (birthday tomorrow)</SelectItem>
                  <SelectItem value="3">3 days (birthday this week)</SelectItem>
                  <SelectItem value="7">1 week (birthday this week)</SelectItem>
                  <SelectItem value="15">15 days (birthday this month)</SelectItem>
                  <SelectItem value="30">30 days (birthday this month)</SelectItem>
                  <SelectItem value="45">45 days (no notification)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={simulateBirthday}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Gift className="h-4 w-4" />
              {isLoading ? 'Simulating...' : 'Simulate Birthday'}
            </Button>
            
            <Button 
              onClick={testEmailPreview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Preview Email
            </Button>
            
            <Button 
              onClick={clearAllNotifications}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Clear Notifications
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded border">
            <h4 className="font-medium mb-2">Expected Behavior:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li><strong>Today (0 days):</strong> 🎉 "Happy Birthday" toast notification</li>
              <li><strong>Tomorrow (1 day):</strong> 🎂 "Birthday tomorrow" reminder</li>
              <li><strong>This week (2-7 days):</strong> 🎈 "Birthday this week" planning reminder</li>
              <li><strong>This month (8-30 days):</strong> 📅 "Birthday coming up" early planning</li>
              <li><strong>Beyond 30 days:</strong> No notification generated</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
