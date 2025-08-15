# Migration Plan: Moving Business Logic to Node.js Backend

## Current State (Frontend-Heavy)
```
React App → Supabase Database
```

## Target State (Proper Backend)
```
React App → Node.js API → Supabase Database
```

## Phase 1: Create Node.js Backend Structure

### 1. Initialize Backend Project
```bash
mkdir backend
cd backend
npm init -y
npm install express cors dotenv helmet morgan
npm install @supabase/supabase-js bcryptjs jsonwebtoken
npm install -D nodemon typescript @types/node @types/express
```

### 2. Backend Folder Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── groupsController.js
│   │   ├── productsController.js
│   │   └── paymentsController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── services/
│   │   ├── groupService.js
│   │   ├── paymentService.js
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── database.js
│   │   └── helpers.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── groups.js
│   │   └── products.js
│   └── app.js
├── package.json
└── .env
```

## Phase 2: Move Business Logic

### Example: Groups Management
**Current (Frontend):**
```typescript
// useGroups.tsx - BAD
const createGroup = async (groupData) => {
  const { data, error } = await supabase
    .from('groups')
    .insert([groupData]);
  // Business logic here...
};
```

**Target (Backend):**
```javascript
// backend/controllers/groupsController.js - GOOD
exports.createGroup = async (req, res) => {
  try {
    // Validation
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    
    // Business Logic
    const groupData = {
      name: name.trim(),
      description: description?.trim(),
      leader_id: req.user.id,
      join_code: generateJoinCode(),
      created_at: new Date().toISOString()
    };
    
    // Database Operation
    const group = await groupService.createGroup(groupData);
    
    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Example: Payment Processing
**Current (Frontend):**
```typescript
// razorpayService.ts - EXPOSED
const processPayment = async (paymentData) => {
  // Payment logic in frontend - SECURITY RISK
};
```

**Target (Backend):**
```javascript
// backend/controllers/paymentsController.js - SECURE
exports.processPayment = async (req, res) => {
  try {
    // Validate payment
    const isValid = await validatePaymentSignature(req.body);
    if (!isValid) return res.status(400).json({ error: 'Invalid payment' });
    
    // Business logic
    const result = await paymentService.recordPayment({
      userId: req.user.id,
      amount: req.body.amount,
      billSplitId: req.body.billSplitId
    });
    
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Phase 3: Update Frontend

**Before:**
```typescript
// Direct database access - BAD
const { data } = await supabase.from('groups').select('*');
```

**After:**
```typescript
// API calls - GOOD
const response = await fetch('/api/groups', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { groups } = await response.json();
```

## Benefits of Migration

### Security
- ✅ Hide business logic from client
- ✅ Server-side validation
- ✅ Secure payment processing
- ✅ Rate limiting and throttling

### Performance
- ✅ Server-side caching
- ✅ Database connection pooling
- ✅ Optimized queries
- ✅ Reduced client bundle size

### Maintainability
- ✅ Centralized business logic
- ✅ Easier testing
- ✅ Better error handling
- ✅ API versioning

## Migration Priority

### High Priority (Security Critical):
1. **Payment processing**
2. **User authentication**
3. **Data validation**

### Medium Priority (Performance):
1. **Group management**
2. **Product CRUD**
3. **Bill splitting**

### Low Priority (Nice to have):
1. **Notifications**
2. **Recommendations**
3. **Analytics**

## Timeline Estimate
- **Phase 1:** Setup backend (1-2 days)
- **Phase 2:** Move core logic (1 week)
- **Phase 3:** Update frontend (2-3 days)
- **Testing & Deployment:** 2-3 days

**Total: ~2 weeks for full migration**

## Alternative: Supabase Edge Functions
If you want to keep using Supabase but add backend logic:
```typescript
// supabase/functions/process-payment/index.ts
export default async function handler(req: Request) {
  // Server-side logic here
  const paymentResult = await processPayment(req.body);
  return new Response(JSON.stringify(paymentResult));
}
```
