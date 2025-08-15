import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EmailNotificationService, EmailNotificationData } from "./emailNotificationService";

export interface BirthdayNotification {
  id: string;
  user_id: string;
  full_name: string;
  birth_day: number;
  birth_month: number;
  days_until_birthday: number;
  notification_type: 'birthday_today' | 'birthday_tomorrow' | 'birthday_week' | 'birthday_month';
  message: string;
  timestamp?: string;
  read?: boolean;
}

export class BirthdayNotificationService {
  
  /**
   * Check for upcoming birthdays and send notifications
   */
  static async checkAndSendBirthdayNotifications(): Promise<BirthdayNotification[]> {
    try {
      // For now, work with localStorage profiles since birth_day/birth_month columns might not exist in database
      const notifications: BirthdayNotification[] = [];
      
      // Get current user profile from localStorage or Supabase
      const currentUser = await this.getCurrentUserProfile();
      if (currentUser) {
        const daysUntil = this.calculateDaysUntilBirthday(currentUser.birth_day, currentUser.birth_month);
        const notification = this.createBirthdayNotification(currentUser, daysUntil);
        
        if (notification) {
          notifications.push(notification);
          await this.sendNotification(notification);
        }
      }

      // TODO: When group system is fully integrated, check for group members' birthdays
      // const groupMembers = await this.getGroupMembersBirthdays();
      // ... process group members

      return notifications;
    } catch (error) {
      console.error('Error checking birthday notifications:', error);
      return [];
    }
  }

  /**
   * Get current user profile with birthday information
   */
  private static async getCurrentUserProfile(): Promise<any | null> {
    try {
      // Try to get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // First try localStorage fallback (where birthday data is likely stored)
      const localProfile = localStorage.getItem(`fallback_profile_${user.id}`);
      if (localProfile) {
        const profile = JSON.parse(localProfile);
        if (profile.birth_day && profile.birth_month && profile.full_name) {
          return {
            id: user.id,
            full_name: profile.full_name,
            birth_day: profile.birth_day,
            birth_month: profile.birth_month
          };
        }
      }

      // Fallback to database (might not have birthday columns yet)
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('id', user.id)
          .single();

        if (!error && profile) {
          // Check if birthday info exists in localStorage
          const localBirthday = localStorage.getItem(`user_birthday_${user.id}`);
          if (localBirthday) {
            const birthday = JSON.parse(localBirthday);
            return {
              ...profile,
              birth_day: birthday.birth_day,
              birth_month: birthday.birth_month
            };
          }
        }
      } catch (dbError) {
        console.warn('Database profile not available:', dbError);
      }

      return null;
    } catch (error) {
      console.error('Error getting current user profile:', error);
      return null;
    }
  }

  /**
   * Calculate days until next birthday
   */
  private static calculateDaysUntilBirthday(birthDay: number, birthMonth: number): number {
    const today = new Date();
    const currentYear = today.getFullYear();
    let birthday = new Date(currentYear, birthMonth - 1, birthDay);
    
    // If birthday has passed this year, calculate for next year
    if (birthday < today) {
      birthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
    }
    
    const timeDiff = birthday.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  /**
   * Create birthday notification based on days until birthday
   */
  private static createBirthdayNotification(profile: any, daysUntil: number): BirthdayNotification | null {
    let notificationType: BirthdayNotification['notification_type'] | null = null;
    let message = '';

    if (daysUntil === 0) {
      notificationType = 'birthday_today';
      message = `🎉 Happy Birthday ${profile.full_name}! Hope you have a wonderful day!`;
    } else if (daysUntil === 1) {
      notificationType = 'birthday_tomorrow';
      message = `🎂 ${profile.full_name}'s birthday is tomorrow! Don't forget to get cake ingredients!`;
    } else if (daysUntil <= 7) {
      notificationType = 'birthday_week';
      message = `🎈 ${profile.full_name}'s birthday is in ${daysUntil} days. Time to plan the celebration!`;
    } else if (daysUntil <= 30) {
      notificationType = 'birthday_month';
      message = `📅 ${profile.full_name}'s birthday is coming up in ${daysUntil} days.`;
    }

    if (!notificationType) return null;

    return {
      id: `birthday_${profile.id}_${Date.now()}`,
      user_id: profile.id,
      full_name: profile.full_name,
      birth_day: profile.birth_day,
      birth_month: profile.birth_month,
      days_until_birthday: daysUntil,
      notification_type: notificationType,
      message
    };
  }

  /**
   * Send notification via multiple channels
   */
  private static async sendNotification(notification: BirthdayNotification): Promise<void> {
    try {
      // 1. In-app toast notification
      this.sendToastNotification(notification);

      // 2. Store in localStorage for persistent notifications
      this.storeLocalNotification(notification);

      // 3. Attempt to store in database (with fallback)
      await this.storeDatabaseNotification(notification);

      // 4. Email notification (if enabled and user has email)
      await this.sendEmailNotification(notification);

      // 5. Future: SMS integration
      // await this.sendSMSNotification(notification);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send in-app toast notification
   */
  private static sendToastNotification(notification: BirthdayNotification): void {
    const getToastConfig = () => {
      switch (notification.notification_type) {
        case 'birthday_today':
          return {
            title: "🎉 Birthday Today!",
            description: notification.message,
            duration: 10000,
            className: "border-l-4 border-l-yellow-400 bg-yellow-50"
          };
        case 'birthday_tomorrow':
          return {
            title: "🎂 Birthday Tomorrow!",
            description: notification.message,
            duration: 8000,
            className: "border-l-4 border-l-blue-400 bg-blue-50"
          };
        case 'birthday_week':
          return {
            title: "🎈 Birthday This Week",
            description: notification.message,
            duration: 6000,
            className: "border-l-4 border-l-green-400 bg-green-50"
          };
        case 'birthday_month':
          return {
            title: "📅 Upcoming Birthday",
            description: notification.message,
            duration: 4000,
            className: "border-l-4 border-l-purple-400 bg-purple-50"
          };
        default:
          return {
            title: "Birthday Reminder",
            description: notification.message,
            duration: 5000
          };
      }
    };

    const config = getToastConfig();
    toast(config.description, {
      description: config.title,
      duration: config.duration,
      className: config.className
    });
  }

  /**
   * Store notification in localStorage for persistence
   */
  private static storeLocalNotification(notification: BirthdayNotification): void {
    try {
      const key = 'birthday_notifications';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      
      // Add new notification and keep only last 50
      existing.unshift({
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
      });
      
      const limited = existing.slice(0, 50);
      localStorage.setItem(key, JSON.stringify(limited));
    } catch (error) {
      console.error('Error storing local notification:', error);
    }
  }

  /**
   * Store notification in database with fallback to localStorage
   */
  private static async storeDatabaseNotification(notification: BirthdayNotification): Promise<void> {
    try {
      // For now, just store in localStorage since database schema might not be ready
      // TODO: When database is properly set up, implement database storage
      
      const dbKey = 'birthday_notifications_db';
      const existing = JSON.parse(localStorage.getItem(dbKey) || '[]');
      existing.unshift({
        ...notification,
        timestamp: new Date().toISOString(),
        stored_in_db: false // Flag to indicate this is localStorage fallback
      });
      
      // Keep only last 100 database notifications
      const limited = existing.slice(0, 100);
      localStorage.setItem(dbKey, JSON.stringify(limited));
      
      console.log('Birthday notification stored in localStorage (database fallback)');
      
    } catch (error) {
      console.warn('Could not store notification in database or localStorage:', error);
    }
  }

  /**
   * Get stored birthday notifications
   */
  static getStoredNotifications(): BirthdayNotification[] {
    try {
      const key = 'birthday_notifications';
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving stored notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static markNotificationAsRead(notificationId: string): void {
    try {
      const key = 'birthday_notifications';
      const notifications = this.getStoredNotifications();
      const updated = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Clear old notifications (older than 30 days)
   */
  static clearOldNotifications(): void {
    try {
      const key = 'birthday_notifications';
      const notifications = this.getStoredNotifications();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filtered = notifications.filter(n => {
        const notificationDate = new Date(n.timestamp || 0);
        return notificationDate > thirtyDaysAgo;
      });
      
      localStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error clearing old notifications:', error);
    }
  }

  /**
   * Initialize birthday notification system
   */
  static initialize(): void {
    // Clear old notifications on startup
    this.clearOldNotifications();
    
    // Check for birthdays immediately
    this.checkAndSendBirthdayNotifications();
    
    // Set up interval to check every 6 hours
    setInterval(() => {
      this.checkAndSendBirthdayNotifications();
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
    
    // Also check daily at 9 AM (if browser is open)
    const now = new Date();
    const nineAM = new Date();
    nineAM.setHours(9, 0, 0, 0);
    
    if (now > nineAM) {
      nineAM.setDate(nineAM.getDate() + 1);
    }
    
    const msUntilNineAM = nineAM.getTime() - now.getTime();
    
    setTimeout(() => {
      this.checkAndSendBirthdayNotifications();
      // Then set daily interval
      setInterval(() => {
        this.checkAndSendBirthdayNotifications();
      }, 24 * 60 * 60 * 1000); // 24 hours
    }, msUntilNineAM);
  }

  /**
   * Manually trigger birthday check (for testing or manual refresh)
   */
  static async triggerBirthdayCheck(): Promise<BirthdayNotification[]> {
    toast.loading("Checking for birthdays...", { duration: 2000 });
    const notifications = await this.checkAndSendBirthdayNotifications();
    
    if (notifications.length === 0) {
      toast.success("No upcoming birthdays found");
    } else {
      toast.success(`Found ${notifications.length} birthday notification(s)`);
    }
    
    return notifications;
  }

  /**
   * Future: Email notification integration
   */
  private static async sendEmailNotification(notification: BirthdayNotification): Promise<void> {
    try {
      // Check if email notifications are enabled in preferences
      const preferences = localStorage.getItem('birthday_notification_preferences');
      const emailEnabled = preferences ? JSON.parse(preferences).emailEnabled : false;
      
      if (!emailEnabled) {
        return; // Email notifications disabled
      }

      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        console.log('No user email available for birthday notification');
        return;
      }

      const emailData: EmailNotificationData = {
        to: user.email,
        name: user.email.split('@')[0], // Use email prefix as name fallback
        birthdayPerson: notification.full_name,
        daysUntil: notification.days_until_birthday,
        notificationType: notification.notification_type
      };

      const success = await EmailNotificationService.sendBirthdayNotification(emailData);
      if (success) {
        console.log('Birthday email notification sent successfully');
      } else {
        console.warn('Failed to send birthday email notification');
      }
      
    } catch (error) {
      console.error('Error sending email notification:', error);
    }
  }

  /**
   * Future: SMS notification integration
   */
  private static async sendSMSNotification(notification: BirthdayNotification): Promise<void> {
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // This would require phone numbers in user profiles
    console.log('Future: SMS notification would be sent:', notification);
  }
}
