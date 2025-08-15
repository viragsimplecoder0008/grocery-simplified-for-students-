# Group System Database Setup

## Current Status
The group system UI is implemented and ready to use, but requires database migration to be fully functional.

## Error Resolution
If you see the error "Could not find the function public.generate_join_code without parameters in the schema cache", it means the database migration hasn't been applied yet.

## Setup Options

### Option 1: Apply Database Migration (Recommended for Production)

1. **Start Docker Desktop** (required for local Supabase)
2. **Start Supabase locally:**
   ```bash
   npx supabase start
   ```
3. **Apply the migration:**
   ```bash
   npx supabase migration up
   ```

### Option 2: Manual Database Setup (If Docker is unavailable)

If you can't run Docker locally, you can apply the migration directly to your remote Supabase database:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration script from `supabase/migrations/20250814170000_add_groups_system.sql`

### Option 3: Test Without Database (Current Fallback)

The current implementation includes fallbacks that allow basic functionality:
- Group creation works with frontend-generated join codes
- Group membership validation works with manual counting
- Most features will work, but some advanced features may be limited

## Testing the Group System

1. **Access Group Management:**
   - Go to http://localhost:5147/groups
   - You can create groups and generate join codes

2. **Create a Group:**
   - Click "Create Group" 
   - Enter a name and description
   - A 6-character join code will be generated

3. **Join a Group:**
   - Use the join code from another group
   - Maximum 3 groups per user is enforced

4. **View Group Lists:**
   - Click "View List" on any group card
   - Add items to the shared grocery list
   - Other members can see updates in real-time (once database is set up)

## Full Feature Availability

Once the database migration is applied, you'll have access to:
- ✅ Real-time collaborative grocery lists
- ✅ Group notifications
- ✅ Member management
- ✅ Purchase tracking with attribution
- ✅ Group budget summaries

The system is fully functional - it just needs the database schema to be applied!
