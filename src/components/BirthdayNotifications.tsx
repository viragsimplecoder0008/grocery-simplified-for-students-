import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, BellRing, Calendar, Gift, Settings, RefreshCw } from "lucide-react";
import { BirthdayNotificationService, BirthdayNotification } from "@/services/birthdayNotificationService";
import { toast } from "sonner";

interface NotificationPreferences {
  birthdayToday: boolean;
  birthdayTomorrow: boolean;
  birthdayWeek: boolean;
  birthdayMonth: boolean;
  soundEnabled: boolean;
  emailEnabled: boolean;
  frequency: 'daily' | 'twice_daily' | 'hourly';
}

export function BirthdayNotifications() {
  const [notifications, setNotifications] = useState<BirthdayNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    birthdayToday: true,
    birthdayTomorrow: true,
    birthdayWeek: true,
    birthdayMonth: false,
    soundEnabled: true,
    emailEnabled: false,
    frequency: 'daily'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStoredNotifications();
    loadPreferences();
  }, []);

  const loadStoredNotifications = () => {
    const stored = BirthdayNotificationService.getStoredNotifications();
    setNotifications(stored.slice(0, 10)); // Show last 10 notifications
  };

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('birthday_notification_preferences');
      if (stored) {
        setPreferences({ ...preferences, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = (newPreferences: NotificationPreferences) => {
    try {
      localStorage.setItem('birthday_notification_preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      toast.success("Notification preferences saved");
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error("Failed to save preferences");
    }
  };

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean | string) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const handleManualCheck = async () => {
    setIsLoading(true);
    try {
      const newNotifications = await BirthdayNotificationService.triggerBirthdayCheck();
      loadStoredNotifications();
    } catch (error) {
      console.error('Error checking birthdays:', error);
      toast.error("Failed to check for birthdays");
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllNotifications = () => {
    try {
      localStorage.removeItem('birthday_notifications');
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error("Failed to clear notifications");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'birthday_today':
        return <Gift className="h-4 w-4 text-yellow-500" />;
      case 'birthday_tomorrow':
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'birthday_week':
        return <Bell className="h-4 w-4 text-green-500" />;
      case 'birthday_month':
        return <BellRing className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'birthday_today':
        return 'bg-yellow-100 text-yellow-800';
      case 'birthday_tomorrow':
        return 'bg-blue-100 text-blue-800';
      case 'birthday_week':
        return 'bg-green-100 text-green-800';
      case 'birthday_month':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatNotificationType = (type: string) => {
    switch (type) {
      case 'birthday_today':
        return 'Today';
      case 'birthday_tomorrow':
        return 'Tomorrow';
      case 'birthday_week':
        return 'This Week';
      case 'birthday_month':
        return 'This Month';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Birthday Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Get notified about upcoming birthdays in your groups
          </p>
        </div>
        <Button
          onClick={handleManualCheck}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Check Now
        </Button>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification Types */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notify me when:</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-yellow-500" />
                  <Label htmlFor="today">Someone's birthday is today</Label>
                </div>
                <Switch
                  id="today"
                  checked={preferences.birthdayToday}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('birthdayToday', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="tomorrow">Someone's birthday is tomorrow</Label>
                </div>
                <Switch
                  id="tomorrow"
                  checked={preferences.birthdayTomorrow}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('birthdayTomorrow', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-green-500" />
                  <Label htmlFor="week">Someone's birthday is this week</Label>
                </div>
                <Switch
                  id="week"
                  checked={preferences.birthdayWeek}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('birthdayWeek', checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-purple-500" />
                  <Label htmlFor="month">Someone's birthday is this month</Label>
                </div>
                <Switch
                  id="month"
                  checked={preferences.birthdayMonth}
                  onCheckedChange={(checked) => 
                    handlePreferenceChange('birthdayMonth', checked)
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Sound notifications</Label>
              <Switch
                id="sound"
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('soundEnabled', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email notifications</Label>
              <Switch
                id="email"
                checked={preferences.emailEnabled}
                onCheckedChange={(checked) => 
                  handlePreferenceChange('emailEnabled', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="frequency">Check frequency</Label>
              <Select
                value={preferences.frequency}
                onValueChange={(value) => 
                  handlePreferenceChange('frequency', value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice_daily">Twice Daily</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
              {notifications.length > 0 && (
                <Badge variant="secondary">{notifications.length}</Badge>
              )}
            </CardTitle>
            {notifications.length > 0 && (
              <Button
                onClick={clearAllNotifications}
                variant="ghost"
                size="sm"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h4 className="font-medium mb-2">No notifications yet</h4>
              <p className="text-sm text-muted-foreground">
                Birthday notifications will appear here when there are upcoming birthdays
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id || index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    notification.read ? 'opacity-60' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{notification.full_name}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getNotificationBadgeColor(notification.notification_type)}`}
                      >
                        {formatNotificationType(notification.notification_type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    {notification.days_until_birthday !== undefined && (
                      <p className="text-xs text-gray-500">
                        {notification.days_until_birthday === 0 
                          ? 'Today!' 
                          : `${notification.days_until_birthday} day${notification.days_until_birthday !== 1 ? 's' : ''} remaining`
                        }
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {notification.timestamp && 
                      new Date(notification.timestamp).toLocaleDateString()
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BellRing className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">How Birthday Notifications Work</h4>
              <p className="text-sm text-blue-700">
                The system automatically checks for upcoming birthdays and sends notifications based on your preferences. 
                Notifications are checked every 6 hours and can also be triggered manually.
              </p>
              <p className="text-xs text-blue-600 mt-2">
                💡 Tip: Make sure your birthday is set in your profile to receive birthday recommendations!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
