# Deployment Guide for Grocery Simplified

This app uses **React + Vite + Supabase** which makes it deployable anywhere! Here are the most popular options:

## 🏗️ Build Process

First, build your app:
```bash
npm run build
```
This creates a `dist` folder with static files that can be deployed anywhere.

## 🌟 Recommended Platforms

### 1. **Vercel (Best for React apps)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
```

### 2. **Netlify (Great for JAMstack)**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Or drag & drop dist folder to netlify.com
```

### 3. **GitHub Pages (Free)**
1. Build your app: `npm run build`
2. Push `dist` folder to `gh-pages` branch
3. Enable GitHub Pages in repository settings

### 4. **Firebase Hosting**
```bash
# Install Firebase CLI
npm i -g firebase-tools

# Initialize and deploy
firebase init hosting
firebase deploy
```

## 🔧 Environment Variables

Set these on your hosting platform:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## 📱 Platform-Specific Instructions

### **Vercel**
- Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### **Netlify**
- Create `public/_redirects`:
```
/*    /index.html   200
```

### **Apache/cPanel**
- Create `.htaccess`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

### **Nginx**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 🐳 Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ☁️ Cloud Storage Options

### **AWS S3 + CloudFront**
1. Upload `dist` folder to S3 bucket
2. Enable static website hosting
3. Set up CloudFront distribution
4. Configure custom domain (optional)

### **Google Cloud Storage**
1. Create bucket with public access
2. Upload `dist` folder
3. Enable website configuration
4. Set up Cloud CDN (optional)

## 🔍 Deployment Checklist

- [ ] App builds successfully (`npm run build`)
- [ ] Environment variables configured
- [ ] Supabase project is accessible
- [ ] SPA routing configured (redirects to index.html)
- [ ] HTTPS enabled (most platforms do this automatically)
- [ ] Custom domain configured (optional)

## 🚨 Common Issues & Solutions

### **Blank Page After Deployment**
- Check browser console for errors
- Verify environment variables are set
- Ensure SPA routing is configured

### **API Errors**
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Ensure CORS is properly configured

### **Routing Issues**
- Make sure all routes redirect to index.html
- Check for correct base path in vite.config.ts

## 🎯 Production Optimizations

1. **Enable gzip compression** on your server
2. **Set proper cache headers** for static assets
3. **Use CDN** for faster global access
4. **Monitor performance** with tools like Lighthouse
5. **Set up error tracking** (e.g., Sentry)

## 💡 Why This Stack is Great for Deployment

- ✅ **Static files** - works anywhere
- ✅ **No server** required for frontend
- ✅ **Supabase** handles all backend needs
- ✅ **Fast builds** with Vite
- ✅ **TypeScript** catches errors early
- ✅ **Modern** and widely supported

Your app will work on ANY platform that can serve static HTML files!
