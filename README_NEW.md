# 🛒 Grocery Simplified - AI-Powered Collaborative Shopping

A modern, collaborative grocery list application with AI-powered recommendations, budget management, and offline-first architecture.

## 🌟 Features

### 👥 Collaborative Groups
- **Create & Join Groups**: Form shopping groups with friends, family, or roommates
- **Non-Expiring Join Codes**: Simple 6-digit codes for easy group joining
- **Shared Grocery Lists**: Collaborate on shopping lists in real-time
- **Max 3 Groups**: Users can be part of up to 3 groups simultaneously
- **Complete Offline Support**: All group features work offline with localStorage fallback

### 💰 Smart Budget Management
- **Personal Budget Tracking**: Set and monitor your individual shopping budget
- **Group Budget Controls**: Group leaders can manage shared budgets
- **Approval Workflow**: Budget changes in groups require leader approval
- **Real-time Budget Monitoring**: Track spending against your budget in real-time
- **Currency Support**: Multi-currency support with proper formatting

### 🏢 Brand Management System
- **Admin Brand Creation**: Admins can create brand accounts instead of individual products
- **Auto-Generated Credentials**: Brands get `brandname@grocerysimplified.com` emails
- **Secure Password Generation**: Automatic password generation for brand accounts
- **Product Curation**: Users can only select from admin-curated product lists
- **Fallback Support**: Complete localStorage fallback for offline operation

### 🤖 AI-Powered Recommendations
- **Birthday-Based Suggestions**: Personalized recommendations based on your birthday
- **Seasonal Recommendations**: Products suggested based on current season
- **Preference Learning**: AI learns from your favorite cakes, snacks, and hobbies
- **Gemini AI Integration**: Powered by Google's Gemini AI with your provided API key
- **Smart Fallback**: Intelligent fallback recommendations when AI service is unavailable

### 📱 User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Live updates across all connected devices
- **Offline-First**: Complete functionality even without internet connection
- **Role-Based Access**: Different features for students, admins, and category managers
- **Profile Management**: Comprehensive user profiles with birthday and preferences

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.7+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd grocery-simplified-for-students
   ```

2. **Run the setup script**
   
   **Windows:**
   ```cmd
   setup.bat
   ```
   
   **Linux/MacOS:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start the application**
   
   **Terminal 1 - AI API Server:**
   ```bash
   python api_server.py
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Gemini AI API
The Gemini AI API key is pre-configured in `gemini_config.py`:
```python
API_KEY = "AIzaSyDFFD2PgDhh1bcZQPyvKn9sF84w_Nxm6ws"
```

### Environment Variables
Create a `.env` file for additional configuration:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 📖 Usage Guide

### Creating Your First Group
1. Sign up/Sign in to your account
2. Click "Create Group" on the homepage
3. Enter a group name and description
4. Share the 6-digit join code with friends
5. Start collaborating on grocery lists!

### Managing Budgets
1. Set your personal budget in the Budget Card
2. Group leaders can modify group budgets
3. Budget change requests require approval
4. Monitor spending in real-time

### Getting AI Recommendations
1. Update your profile with:
   - Birthday (month & day)
   - Favorite cake flavors
   - Favorite snacks
   - Hobbies and interests
2. View personalized recommendations on the homepage
3. Recommendations update based on proximity to your birthday

### Brand Management (Admins Only)
1. Navigate to Admin Panel
2. Click "Manage Brands"
3. Create new brand accounts
4. Brands can then add their products
5. Users select from curated product lists

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for component library
- **Supabase** for backend services

### Backend Services
- **Supabase** PostgreSQL database
- **Python Flask** API for AI recommendations
- **Google Gemini AI** for intelligent suggestions
- **localStorage** for offline fallback storage

### Offline-First Design
All features work offline with comprehensive localStorage fallbacks:
- Group creation and management
- Grocery list operations
- Budget tracking
- Brand management
- User profiles and preferences

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **Role-based access control** (Student, Admin, Category Manager)
- **Secure authentication** via Supabase Auth
- **Input validation** on all forms
- **XSS protection** with proper sanitization

## 🎯 User Roles

### Students
- Create and join groups
- Manage grocery lists
- Set personal budgets
- Get AI recommendations
- Select from curated products

### Admins
- All student features
- Create brand accounts
- Manage system-wide settings
- Access admin panel

### Category Managers
- All student features
- Manage product categories
- Moderate content

## 🧪 Testing

### Manual Testing
1. Create multiple user accounts
2. Test group creation and joining
3. Verify budget management workflows
4. Test AI recommendations with different profiles
5. Confirm offline functionality

### API Testing
Test the AI API endpoints:
```bash
# Health check
curl http://localhost:5000/api/health

# Test recommendations
curl http://localhost:5000/api/test-recommendations
```

## 🔄 Database Migrations

The application includes comprehensive database migrations in `/supabase/migrations/`:
- User profiles with birthday fields
- Group management tables
- Budget tracking system
- Brand management tables
- Product and category structures

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Progressive Web App (PWA) capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Check the console for detailed error logs
- All operations have comprehensive fallbacks
- Database issues are handled gracefully
- AI service failures fall back to intelligent defaults

## 🆕 Recent Updates

### Version 2.0 - AI Integration
- ✅ Added Gemini AI birthday recommendations
- ✅ Implemented user profile with birthday fields
- ✅ Created Python API service for AI features
- ✅ Enhanced fallback systems for offline operation

### Version 1.5 - Brand Management
- ✅ Replaced admin product creation with brand system
- ✅ Added auto-generated brand credentials
- ✅ Restricted users to curated product selection
- ✅ Implemented comprehensive localStorage fallbacks

### Version 1.0 - Core Features
- ✅ Group collaboration system
- ✅ Budget management with approval workflows
- ✅ Offline-first architecture
- ✅ Role-based access control

## 🚀 Future Enhancements

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Advanced AI recommendations
- [ ] Recipe suggestions
- [ ] Price comparison features
- [ ] Inventory tracking
- [ ] Shopping history analytics

---

**Built with ❤️ for collaborative grocery shopping**
