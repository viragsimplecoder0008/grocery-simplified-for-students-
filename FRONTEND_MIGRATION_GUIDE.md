# Frontend Migration Guide

This guide explains how to migrate your React frontend from direct Supabase calls to using the new Node.js backend API.

## Overview

The migration involves:
1. **Replacing direct Supabase calls** with backend API calls
2. **Updating authentication flow** to work with backend tokens
3. **Modifying data fetching hooks** to use the new API service
4. **Updating environment variables** for backend communication

## Step 1: Update Environment Variables

Add backend URL to your `.env` file:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Keep existing Supabase vars for auth (frontend still handles auth)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Update API Service

The new `src/services/api.ts` is already created. Import and use it in your components:

```typescript
import apiService from '../services/api';

// Set token when user logs in
apiService.setToken(session?.access_token || null);
```

## Step 3: Update Authentication Hook

Modify `src/hooks/useAuth.tsx` to work with the backend:

```typescript
// Add this to useAuth hook
useEffect(() => {
  if (session?.access_token) {
    apiService.setToken(session.access_token);
  } else {
    apiService.setToken(null);
  }
}, [session]);
```

## Step 4: Update Groups Hook

Replace `src/hooks/useGroups.tsx` with backend API calls:

### Before (Direct Supabase):
```typescript
const { data: groups } = useQuery({
  queryKey: ['groups'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
});
```

### After (Backend API):
```typescript
const { data: groups } = useQuery({
  queryKey: ['groups'],
  queryFn: () => apiService.getGroups(),
  enabled: !!session
});
```

## Step 5: Update Product Operations

Replace direct Supabase product operations:

### Before:
```typescript
const addProduct = async (productData) => {
  const { data, error } = await supabase
    .from('products')
    .insert(productData);
  
  if (error) throw error;
  return data;
};
```

### After:
```typescript
const addProduct = async (productData) => {
  return apiService.createProduct(productData);
};
```

## Step 6: Update Payment Operations

Replace payment handling:

### Before:
```typescript
const createPayment = async (paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData);
  
  if (error) throw error;
  return data;
};
```

### After:
```typescript
const createPayment = async (paymentData) => {
  return apiService.createPayment(paymentData);
};
```

## Step 7: Update Components

Update your React components to use the new API service:

### Groups Management Component:
```typescript
// src/components/GroupManagement.tsx
import apiService from '../services/api';

const GroupManagement = () => {
  const { data: groups, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: () => apiService.getGroups(),
    enabled: !!session
  });

  const createGroupMutation = useMutation({
    mutationFn: apiService.createGroup,
    onSuccess: () => {
      refetch();
      toast.success('Group created successfully');
    }
  });

  // Rest of component...
};
```

### Product List Component:
```typescript
// src/components/ProductList.tsx
import apiService from '../services/api';

const ProductList = ({ groupId }) => {
  const { data: products } = useQuery({
    queryKey: ['products', groupId],
    queryFn: () => apiService.getGroupProducts(groupId),
    enabled: !!groupId && !!session
  });

  const togglePurchaseMutation = useMutation({
    mutationFn: apiService.toggleProductPurchased,
    onSuccess: () => {
      queryClient.invalidateQueries(['products', groupId]);
    }
  });

  // Rest of component...
};
```

## Step 8: Error Handling

Update error handling to work with backend API responses:

```typescript
const handleApiError = (error: Error) => {
  console.error('API Error:', error);
  
  // Backend returns structured error responses
  if (error.message.includes('Access denied')) {
    toast.error('You don\'t have permission for this action');
  } else if (error.message.includes('token')) {
    toast.error('Please log in again');
    // Redirect to login
  } else {
    toast.error('Something went wrong. Please try again.');
  }
};
```

## Step 9: Update Real-time Subscriptions

If you're using Supabase real-time subscriptions, you'll need to modify them:

### Option 1: Keep Supabase subscriptions for real-time updates
```typescript
// Keep existing real-time subscriptions but use backend for mutations
useEffect(() => {
  const subscription = supabase
    .channel('products_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' },
      () => {
        // Refetch data from backend
        queryClient.invalidateQueries(['products']);
      }
    )
    .subscribe();

  return () => subscription.unsubscribe();
}, []);
```

### Option 2: Implement WebSocket in backend (future enhancement)
```typescript
// Future: WebSocket connection to backend
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  queryClient.invalidateQueries([update.table]);
};
```

## Step 10: Update Configuration Files

Update your Vite configuration if needed:

```typescript
// vite.config.ts
export default defineConfig({
  // ... existing config
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
});
```

## Step 11: Testing the Migration

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

3. **Test each feature**:
   - [ ] User authentication
   - [ ] Create/view groups
   - [ ] Add/edit products
   - [ ] Payment functionality
   - [ ] Notifications

## Common Issues and Solutions

### Issue 1: CORS Errors
**Solution**: Ensure backend CORS is configured for your frontend URL:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 2: Authentication Token Issues
**Solution**: Make sure token is being passed correctly:
```typescript
// Check if token is being set
console.log('Current token:', apiService.token);

// Verify token format
if (session?.access_token) {
  console.log('Token format:', session.access_token.substring(0, 20) + '...');
}
```

### Issue 3: API Response Format Differences
**Solution**: Update your component logic to handle backend response format:
```typescript
// Backend might return { data: [...], message: "Success" }
// Instead of just [...]
const { data: groups } = useQuery({
  queryKey: ['groups'],
  queryFn: async () => {
    const response = await apiService.getGroups();
    return Array.isArray(response) ? response : response.data;
  }
});
```

## Rollback Plan

If you need to rollback to direct Supabase calls:

1. **Keep both implementations**:
   ```typescript
   const USE_BACKEND = process.env.VITE_USE_BACKEND === 'true';
   
   const getGroups = () => {
     if (USE_BACKEND) {
       return apiService.getGroups();
     } else {
       return supabaseDirectCall();
     }
   };
   ```

2. **Use environment variable** to switch between backends

3. **Gradual migration**: Migrate one feature at a time

## Benefits After Migration

✅ **Security**: Business logic runs on server, not exposed to clients
✅ **Performance**: Optimized database queries and caching
✅ **Scalability**: Better control over API rate limiting and load
✅ **Maintainability**: Centralized business logic and validation
✅ **Flexibility**: Easier to add integrations and external services

## Next Steps

1. Complete the migration following this guide
2. Test thoroughly in development
3. Set up proper error monitoring
4. Deploy backend to production
5. Update frontend environment variables for production
6. Monitor performance and user experience
