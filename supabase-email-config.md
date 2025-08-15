# Supabase Email Configuration Guide

## Quick Setup Instructions

### 1. Custom Email Template
- Copy the content from `email-template-confirmation.html`
- Go to Supabase Dashboard > Authentication > Email Templates
- Paste into "Confirm signup" template
- Save changes

### 2. Change Sender Name (SMTP Required)

#### Option A: Gmail SMTP Setup
1. Create a Gmail account for your app (e.g., noreply.grocerysimplified@gmail.com)
2. Enable 2-factor authentication
3. Generate an "App Password" (not your regular password)
4. In Supabase: Authentication > Settings > SMTP Settings
5. Configure:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: your-app-email@gmail.com
   Password: [your-16-character-app-password]
   Sender Name: Grocery Simplified
   Sender Email: your-app-email@gmail.com
   ```

#### Option B: SendGrid (Recommended for Production)
1. Sign up for SendGrid (free tier: 100 emails/day)
2. Create API key
3. Verify sender email
4. Configure in Supabase:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [your-sendgrid-api-key]
   Sender Name: Grocery Simplified
   Sender Email: noreply@yourdomain.com
   ```

### 3. Test the Setup
1. Create a test user account
2. Check the confirmation email
3. Verify it shows "Grocery Simplified" as sender
4. Confirm the email template looks correct

### 4. Email Template Variables
The template uses these Supabase variables:
- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .Email }}` - User's email address (if needed)
- `{{ .SiteName }}` - Your site name

## Production Checklist
- [ ] Custom email template uploaded
- [ ] SMTP configured with proper sender name
- [ ] Test email sent and verified
- [ ] Template displays correctly on mobile
- [ ] All links work properly
