# Grocery App Backend

A Node.js/Express.js backend API for the Grocery Simplified application with Supabase integration.

## Architecture

This backend serves as the middleware layer between the React frontend and Supabase database, providing:

- **Authentication & Authorization**: JWT token validation and role-based access control
- **Business Logic**: Data validation, processing, and security
- **API Layer**: RESTful endpoints for all app functionality
- **Database Operations**: Secure Supabase integration with service role

## Project Structure

```
backend/
├── app.js                 # Main Express application
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variables template
├── controllers/          # Request handlers (future expansion)
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication middleware
│   └── validation.js    # Request validation
├── routes/              # API route definitions
│   ├── auth.js         # Authentication routes
│   ├── groups.js       # Group management
│   ├── products.js     # Product operations
│   ├── payments.js     # Payment handling
│   └── notifications.js # Notification system
├── services/            # External service integrations
│   └── supabase.js     # Supabase client configuration
└── utils/               # Helper functions
    └── helpers.js       # Common utilities
```

## Setup Instructions

### 1. Environment Configuration

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (for backend operations)
- `FRONTEND_URL`: Your frontend URL (for CORS)

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/signout` - Sign out user
- `POST /api/auth/refresh` - Refresh auth token

### Groups
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:groupId` - Get group details
- `POST /api/groups` - Create new group
- `PUT /api/groups/:groupId` - Update group
- `DELETE /api/groups/:groupId` - Delete group
- `POST /api/groups/join/:inviteCode` - Join group by invite
- `POST /api/groups/:groupId/leave` - Leave group

### Products
- `GET /api/products/group/:groupId` - Get group products
- `GET /api/products/:productId` - Get product details
- `POST /api/products` - Add new product
- `PUT /api/products/:productId` - Update product
- `DELETE /api/products/:productId` - Delete product
- `PATCH /api/products/:productId/toggle-purchased` - Toggle purchase status
- `GET /api/products/group/:groupId/categories` - Get product categories

### Payments
- `GET /api/payments/group/:groupId` - Get group payments
- `GET /api/payments/:paymentId` - Get payment details
- `POST /api/payments` - Record new payment
- `PATCH /api/payments/:paymentId/status` - Update payment status
- `DELETE /api/payments/:paymentId` - Delete payment
- `GET /api/payments/group/:groupId/summary` - Get payment summary

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:notificationId` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

## Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configured for frontend origin
- **Helmet Security**: Security headers and protection
- **Input Validation**: Joi schema validation for all endpoints
- **Authentication Middleware**: JWT token verification
- **Role-based Access**: Group membership and role validation

## Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (when implemented)
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Adding New Features

1. **Routes**: Add new route files in `/routes/`
2. **Middleware**: Add custom middleware in `/middleware/`
3. **Validation**: Define Joi schemas in `/middleware/validation.js`
4. **Services**: Add external service integrations in `/services/`
5. **Utils**: Add helper functions in `/utils/`

## Deployment

This backend can be deployed to:
- **Heroku**: Add `Procfile` with `web: node app.js`
- **Vercel**: Add `vercel.json` configuration
- **Railway**: Direct deployment with environment variables
- **AWS/DigitalOcean**: PM2 or Docker deployment

### Environment Variables for Production

Ensure all production environment variables are set:
- Set `NODE_ENV=production`
- Use production Supabase credentials
- Configure proper CORS origins
- Set secure JWT secrets

## Integration with Frontend

The frontend should make API calls to this backend instead of direct Supabase calls:

```javascript
// Example: Instead of direct Supabase call
const { data } = await supabase.from('groups').select('*');

// Use backend API
const response = await fetch('/api/groups', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

## Next Steps

1. **Update Frontend**: Modify React components to use backend APIs
2. **Add Tests**: Implement unit and integration tests
3. **Add Logging**: Implement comprehensive logging
4. **Add Monitoring**: Set up health checks and monitoring
5. **Add Caching**: Implement Redis caching for performance
6. **Add File Upload**: Implement image upload for products/avatars
