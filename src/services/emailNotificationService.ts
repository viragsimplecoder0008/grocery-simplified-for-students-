/**
 * Email Notification Service for Birthday Reminders
 * 
 * This service provides email functionality for sending birthday notifications.
 * Currently configured as a mock service that logs to console, but can be easily
 * extended to integrate with real email services like:
 * - SendGrid
 * - Nodemailer
 * - AWS SES
 * - Mailgun
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailNotificationData {
  to: string;
  name: string;
  birthdayPerson: string;
  daysUntil: number;
  notificationType: 'birthday_today' | 'birthday_tomorrow' | 'birthday_week' | 'birthday_month';
}

export class EmailNotificationService {
  private static readonly FROM_EMAIL = 'notifications@grocerysimplified.com';
  private static readonly FROM_NAME = 'Grocery Simplified';

  /**
   * Send birthday notification email
   */
  static async sendBirthdayNotification(data: EmailNotificationData): Promise<boolean> {
    try {
      const template = this.generateEmailTemplate(data);
      
      // For now, this is a mock implementation that logs to console
      // In production, replace this with actual email service integration
      console.log('📧 Birthday Email Notification:');
      console.log('To:', data.to);
      console.log('Subject:', template.subject);
      console.log('Content:', template.text);
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual email service
      // return await this.sendWithSendGrid(data.to, template);
      // return await this.sendWithNodemailer(data.to, template);
      // return await this.sendWithAWSSES(data.to, template);
      
      return true; // Mock success
    } catch (error) {
      console.error('Error sending birthday email:', error);
      return false;
    }
  }

  /**
   * Generate email template based on notification type
   */
  private static generateEmailTemplate(data: EmailNotificationData): EmailTemplate {
    const { birthdayPerson, daysUntil, notificationType } = data;
    
    let subject = '';
    let content = '';
    let emoji = '';

    switch (notificationType) {
      case 'birthday_today':
        emoji = '🎉';
        subject = `${emoji} ${birthdayPerson}'s Birthday is Today!`;
        content = `
          <h2>🎂 Birthday Celebration Time!</h2>
          <p>Today is <strong>${birthdayPerson}'s birthday</strong>!</p>
          <p>Don't forget to:</p>
          <ul>
            <li>Wish them a happy birthday</li>
            <li>Get cake ingredients if you haven't already</li>
            <li>Plan a celebration</li>
          </ul>
          <p>Make their day special! 🎈</p>
        `;
        break;
        
      case 'birthday_tomorrow':
        emoji = '🎂';
        subject = `${emoji} ${birthdayPerson}'s Birthday is Tomorrow!`;
        content = `
          <h2>🎈 Birthday Reminder</h2>
          <p><strong>${birthdayPerson}'s birthday</strong> is tomorrow!</p>
          <p>Last chance to:</p>
          <ul>
            <li>Buy birthday cake ingredients</li>
            <li>Get decorations</li>
            <li>Plan the celebration</li>
            <li>Invite friends</li>
          </ul>
          <p>Don't let this special day pass by unnoticed! 🎁</p>
        `;
        break;
        
      case 'birthday_week':
        emoji = '📅';
        subject = `${emoji} ${birthdayPerson}'s Birthday is This Week`;
        content = `
          <h2>🎪 Upcoming Birthday</h2>
          <p><strong>${birthdayPerson}'s birthday</strong> is in ${daysUntil} days!</p>
          <p>Time to start planning:</p>
          <ul>
            <li>Add party supplies to your grocery list</li>
            <li>Plan the menu</li>
            <li>Send invitations</li>
            <li>Think about decorations</li>
          </ul>
          <p>A little planning makes birthdays extra special! 🌟</p>
        `;
        break;
        
      case 'birthday_month':
        emoji = '🗓️';
        subject = `${emoji} ${birthdayPerson}'s Birthday is Coming Up`;
        content = `
          <h2>📋 Birthday Planning Reminder</h2>
          <p><strong>${birthdayPerson}'s birthday</strong> is in ${daysUntil} days.</p>
          <p>Early planning suggestions:</p>
          <ul>
            <li>Ask about their favorite cake flavor</li>
            <li>Consider dietary preferences</li>
            <li>Think about party themes</li>
            <li>Start saving for special ingredients</li>
          </ul>
          <p>Early planning leads to amazing celebrations! ✨</p>
        `;
        break;
    }

    const html = this.generateHTMLTemplate(subject, content, birthdayPerson, daysUntil);
    const text = this.generateTextTemplate(subject, content);

    return { subject, html, text };
  }

  /**
   * Generate HTML email template
   */
  private static generateHTMLTemplate(subject: string, content: string, birthdayPerson: string, daysUntil: number): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" width="600" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                    <tr>
                        <td style="padding: 40px 40px 30px 40px; text-align: center;" align="center">
                            
                            <!-- Header Icon -->
                            <div style="background: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 16px; width: 60px; height: 60px; margin: 0 auto 24px; display: inline-block;">
                                <span style="font-size: 32px; line-height: 28px;">🛒</span>
                            </div>
                            
                            <!-- App Title -->
                            <h1 style="color: white; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
                                Grocery Simplified
                            </h1>
                            <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; margin: 0 0 32px 0;">
                                Birthday Notification
                            </p>
                            
                            <!-- Main Content -->
                            <div style="background: white; border-radius: 12px; padding: 32px; text-align: left; margin-bottom: 24px;">
                                ${content}
                                
                                <!-- Birthday Info Card -->
                                <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                                    <h3 style="color: #2d3436; margin: 0 0 8px 0; font-size: 18px;">🎂 ${birthdayPerson}</h3>
                                    <p style="color: #636e72; margin: 0; font-size: 14px;">
                                        ${daysUntil === 0 ? 'Birthday is TODAY!' : daysUntil === 1 ? 'Birthday is TOMORROW!' : `Birthday in ${daysUntil} days`}
                                    </p>
                                </div>
                                
                                <!-- Action Button -->
                                <div style="text-align: center; margin: 24px 0;">
                                    <a href="http://localhost:5147" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                                        Open Grocery Simplified
                                    </a>
                                </div>
                            </div>
                            
                            <!-- Footer -->
                            <p style="color: rgba(255, 255, 255, 0.7); font-size: 12px; margin: 0;">
                                You received this because you have birthday notifications enabled.<br>
                                <a href="#" style="color: rgba(255, 255, 255, 0.9);">Manage notification preferences</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
  }

  /**
   * Generate plain text email template
   */
  private static generateTextTemplate(subject: string, content: string): string {
    // Strip HTML tags and format for plain text
    const plainContent = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return `
GROCERY SIMPLIFIED - Birthday Notification

${subject}

${plainContent}

--
Grocery Simplified
Smart shopping for students
http://localhost:5147

To manage your notification preferences, visit: http://localhost:5147/settings
`;
  }

  /**
   * Future: SendGrid integration
   */
  private static async sendWithSendGrid(to: string, template: EmailTemplate): Promise<boolean> {
    // TODO: Implement SendGrid integration
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // 
    // const msg = {
    //   to: to,
    //   from: { email: this.FROM_EMAIL, name: this.FROM_NAME },
    //   subject: template.subject,
    //   text: template.text,
    //   html: template.html,
    // };
    // 
    // try {
    //   await sgMail.send(msg);
    //   return true;
    // } catch (error) {
    //   console.error('SendGrid error:', error);
    //   return false;
    // }
    
    console.log('SendGrid integration not implemented yet');
    return false;
  }

  /**
   * Future: Nodemailer integration
   */
  private static async sendWithNodemailer(to: string, template: EmailTemplate): Promise<boolean> {
    // TODO: Implement Nodemailer integration
    // const nodemailer = require('nodemailer');
    // 
    // const transporter = nodemailer.createTransporter({
    //   // Configure your email service
    // });
    // 
    // const mailOptions = {
    //   from: `"${this.FROM_NAME}" <${this.FROM_EMAIL}>`,
    //   to: to,
    //   subject: template.subject,
    //   text: template.text,
    //   html: template.html
    // };
    // 
    // try {
    //   await transporter.sendMail(mailOptions);
    //   return true;
    // } catch (error) {
    //   console.error('Nodemailer error:', error);
    //   return false;
    // }
    
    console.log('Nodemailer integration not implemented yet');
    return false;
  }

  /**
   * Future: AWS SES integration  
   */
  private static async sendWithAWSSES(to: string, template: EmailTemplate): Promise<boolean> {
    // TODO: Implement AWS SES integration
    console.log('AWS SES integration not implemented yet');
    return false;
  }
}
