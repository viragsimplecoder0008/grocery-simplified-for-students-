-- COMPLETE DATABASE SETUP FOR GROCERY SIMPLIFIED
-- Run this script in your Supabase SQL Editor to set up all tables and fix "fallback mode"

-- This script combines all your migrations into one complete setup
-- Safe to run multiple times (uses IF NOT EXISTS where possible)

-- 1. Create user roles enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'category_manager', 'student');
    END IF;
END $$;

-- 2. Create profiles table with all required fields
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT,
    currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR')),
    birth_day INTEGER CHECK (birth_day BETWEEN 1 AND 31),
    birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12),
    favorite_cake TEXT,
    favorite_snacks TEXT,
    hobbies TEXT,
    budget DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to existing profiles table
DO $$ 
BEGIN
    -- Add currency column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'currency') THEN
        ALTER TABLE public.profiles ADD COLUMN currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR'));
    END IF;
    
    -- Add birthday columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_day') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_day INTEGER CHECK (birth_day BETWEEN 1 AND 31);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_month') THEN
        ALTER TABLE public.profiles ADD COLUMN birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12);
    END IF;
    
    -- Add preference columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_cake') THEN
        ALTER TABLE public.profiles ADD COLUMN favorite_cake TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'favorite_snacks') THEN
        ALTER TABLE public.profiles ADD COLUMN favorite_snacks TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'hobbies') THEN
        ALTER TABLE public.profiles ADD COLUMN hobbies TEXT;
    END IF;
    
    -- Add budget column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'budget') THEN
        ALTER TABLE public.profiles ADD COLUMN budget DECIMAL(10,2);
    END IF;
END $$;

-- 3. Create categories table with color support
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add color column to existing categories table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'color') THEN
        ALTER TABLE public.categories ADD COLUMN color TEXT DEFAULT '#3B82F6';
    END IF;
END $$;

-- 4. Create products table with all fields
CREATE TABLE IF NOT EXISTS public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'each',
    nutritional_info JSONB,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add missing columns to existing products table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'unit') THEN
        ALTER TABLE public.products ADD COLUMN unit TEXT DEFAULT 'each';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'nutritional_info') THEN
        ALTER TABLE public.products ADD COLUMN nutritional_info JSONB;
    END IF;
END $$;

-- 5. Create grocery_lists table
CREATE TABLE IF NOT EXISTS public.grocery_lists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    is_purchased BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, product_id)
);

-- 6. Create groups system tables
CREATE TABLE IF NOT EXISTS public.groups (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    join_code TEXT UNIQUE NOT NULL,
    max_members INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT TRUE,
    budget DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_memberships (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.group_grocery_lists (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    estimated_cost DECIMAL(10,2),
    is_purchased BOOLEAN DEFAULT FALSE,
    purchased_by UUID REFERENCES public.profiles(id),
    purchased_at TIMESTAMP WITH TIME ZONE,
    added_by UUID NOT NULL REFERENCES public.profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.group_notifications (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT REFERENCES public.groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Create split bills system tables
CREATE TABLE IF NOT EXISTS public.split_bills (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    split_method TEXT NOT NULL CHECK (split_method IN ('equal', 'itemized', 'custom')),
    items JSONB, -- Store bill items as JSON
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bill_splits (
    id BIGSERIAL PRIMARY KEY,
    split_bill_id BIGINT NOT NULL REFERENCES public.split_bills(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_owed DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(split_bill_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.split_bill_transactions (
    id BIGSERIAL PRIMARY KEY,
    bill_split_id BIGINT NOT NULL REFERENCES public.bill_splits(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund')),
    payment_method TEXT, -- 'cash', 'razorpay', 'upi', 'card', 'netbanking', 'wallet', etc.
    transaction_id TEXT, -- External payment system ID (Razorpay payment ID)
    order_id TEXT, -- Razorpay order ID
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled')),
    gateway_response JSONB, -- Store full gateway response for debugging
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_bill_transactions ENABLE ROW LEVEL SECURITY;

-- 8. Create utility functions
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'admin@grocerysimplified.com' THEN 'admin'::public.user_role
      WHEN NEW.email = 'GrocerySimplifed@web.com' THEN 'category_manager'::public.user_role
      ELSE 'student'::public.user_role
    END,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 9. Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_grocery_lists_updated_at ON public.grocery_lists;
CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_group_grocery_lists_updated_at ON public.group_grocery_lists;
CREATE TRIGGER update_group_grocery_lists_updated_at
    BEFORE UPDATE ON public.group_grocery_lists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_split_bills_updated_at
    BEFORE UPDATE ON public.split_bills
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bill_splits_updated_at
    BEFORE UPDATE ON public.bill_splits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update bill split status when fully paid
CREATE OR REPLACE FUNCTION public.update_bill_split_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    -- Update the bill split status if amount is fully paid
    IF NEW.amount_paid >= (SELECT amount_owed FROM public.bill_splits WHERE id = NEW.bill_split_id) THEN
        UPDATE public.bill_splits 
        SET status = 'paid', paid_at = COALESCE(NEW.created_at, now())
        WHERE id = NEW.bill_split_id;
    END IF;
    
    -- Check if all splits for this bill are paid and update main bill status
    IF NOT EXISTS (
        SELECT 1 FROM public.bill_splits 
        WHERE split_bill_id = (SELECT split_bill_id FROM public.bill_splits WHERE id = NEW.bill_split_id)
        AND status != 'paid'
    ) THEN
        UPDATE public.split_bills 
        SET status = 'completed'
        WHERE id = (SELECT split_bill_id FROM public.bill_splits WHERE id = NEW.bill_split_id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic status updates
CREATE TRIGGER update_bill_split_status_on_payment
    AFTER INSERT ON public.split_bill_transactions
    FOR EACH ROW 
    WHEN (NEW.transaction_type = 'payment')
    EXECUTE FUNCTION public.update_bill_split_status();-- 10. Create security policies
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories policies
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and category managers can create categories" ON public.categories;
CREATE POLICY "Admins and category managers can create categories" ON public.categories
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) IN ('admin', 'category_manager')
  );

DROP POLICY IF EXISTS "Admins and category managers can update categories" ON public.categories;
CREATE POLICY "Admins and category managers can update categories" ON public.categories
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) IN ('admin', 'category_manager')
  );

DROP POLICY IF EXISTS "Admins and category managers can delete categories" ON public.categories;
CREATE POLICY "Admins and category managers can delete categories" ON public.categories
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) IN ('admin', 'category_manager')
  );

-- Products policies
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can create products" ON public.products;
CREATE POLICY "Admins can create products" ON public.products
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Grocery lists policies
DROP POLICY IF EXISTS "Users can view their own grocery lists" ON public.grocery_lists;
CREATE POLICY "Users can view their own grocery lists" ON public.grocery_lists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own grocery lists" ON public.grocery_lists;
CREATE POLICY "Users can manage their own grocery lists" ON public.grocery_lists
  FOR ALL USING (auth.uid() = user_id);

-- Groups policies
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.groups;
CREATE POLICY "Users can view groups they belong to" ON public.groups
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.group_memberships 
      WHERE group_id = groups.id AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
CREATE POLICY "Users can create groups" ON public.groups
  FOR INSERT WITH CHECK (auth.uid() = leader_id);

DROP POLICY IF EXISTS "Group leaders can update their groups" ON public.groups;
CREATE POLICY "Group leaders can update their groups" ON public.groups
  FOR UPDATE USING (auth.uid() = leader_id);

-- Group memberships policies
DROP POLICY IF EXISTS "Users can view group memberships for their groups" ON public.group_memberships;
CREATE POLICY "Users can view group memberships for their groups" ON public.group_memberships
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.uid() IN (
      SELECT leader_id FROM public.groups WHERE id = group_id
    )
  );

DROP POLICY IF EXISTS "Users can join groups" ON public.group_memberships;
CREATE POLICY "Users can join groups" ON public.group_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave groups" ON public.group_memberships;
CREATE POLICY "Users can leave groups" ON public.group_memberships
  FOR UPDATE USING (auth.uid() = user_id);

-- Group grocery lists policies
DROP POLICY IF EXISTS "Group members can view group grocery lists" ON public.group_grocery_lists;
CREATE POLICY "Group members can view group grocery lists" ON public.group_grocery_lists
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.group_memberships 
      WHERE group_id = group_grocery_lists.group_id AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Group members can add to group grocery lists" ON public.group_grocery_lists;
CREATE POLICY "Group members can add to group grocery lists" ON public.group_grocery_lists
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.group_memberships 
      WHERE group_id = group_grocery_lists.group_id AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Group members can update group grocery lists" ON public.group_grocery_lists;
CREATE POLICY "Group members can update group grocery lists" ON public.group_grocery_lists
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.group_memberships 
      WHERE group_id = group_grocery_lists.group_id AND is_active = true
    )
  );

-- Group notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.group_notifications;
CREATE POLICY "Users can view their own notifications" ON public.group_notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.group_notifications;
CREATE POLICY "Users can update their own notifications" ON public.group_notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Split bills policies
DROP POLICY IF EXISTS "Group members can view split bills" ON public.split_bills;
CREATE POLICY "Group members can view split bills" ON public.split_bills
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.group_memberships 
      WHERE group_id = split_bills.group_id AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Group members can create split bills" ON public.split_bills;
CREATE POLICY "Group members can create split bills" ON public.split_bills
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.group_memberships 
      WHERE group_id = split_bills.group_id AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Bill creators can update their split bills" ON public.split_bills;
CREATE POLICY "Bill creators can update their split bills" ON public.split_bills
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Bill creators can delete their split bills" ON public.split_bills;
CREATE POLICY "Bill creators can delete their split bills" ON public.split_bills
  FOR DELETE USING (auth.uid() = created_by);

-- Bill splits policies
DROP POLICY IF EXISTS "Users can view their own bill splits" ON public.bill_splits;
CREATE POLICY "Users can view their own bill splits" ON public.bill_splits
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT created_by FROM public.split_bills WHERE id = bill_splits.split_bill_id
    )
  );

DROP POLICY IF EXISTS "Bill creators can insert bill splits" ON public.bill_splits;
CREATE POLICY "Bill creators can insert bill splits" ON public.bill_splits
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM public.split_bills WHERE id = bill_splits.split_bill_id
    )
  );

DROP POLICY IF EXISTS "Users can update their own bill splits" ON public.bill_splits;
CREATE POLICY "Users can update their own bill splits" ON public.bill_splits
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT created_by FROM public.split_bills WHERE id = bill_splits.split_bill_id
    )
  );

-- Split bill transactions policies
DROP POLICY IF EXISTS "Users can view transactions for their splits" ON public.split_bill_transactions;
CREATE POLICY "Users can view transactions for their splits" ON public.split_bill_transactions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.bill_splits WHERE id = split_bill_transactions.bill_split_id
    ) OR
    auth.uid() IN (
      SELECT sb.created_by FROM public.split_bills sb
      JOIN public.bill_splits bs ON sb.id = bs.split_bill_id
      WHERE bs.id = split_bill_transactions.bill_split_id
    )
  );

DROP POLICY IF EXISTS "Users can create transactions for their splits" ON public.split_bill_transactions;
CREATE POLICY "Users can create transactions for their splits" ON public.split_bill_transactions
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.bill_splits WHERE id = split_bill_transactions.bill_split_id
    ) OR
    auth.uid() IN (
      SELECT sb.created_by FROM public.split_bills sb
      JOIN public.bill_splits bs ON sb.id = bs.split_bill_id
      WHERE bs.id = split_bill_transactions.bill_split_id
    )
  );

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_birth_month_day ON public.profiles(birth_month, birth_day) WHERE birth_month IS NOT NULL AND birth_day IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON public.categories(created_by);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON public.grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_product_id ON public.grocery_lists(product_id);
CREATE INDEX IF NOT EXISTS idx_groups_leader_id ON public.groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_groups_join_code ON public.groups(join_code);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_user ON public.group_memberships(group_id, user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_active ON public.group_memberships(user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_group_grocery_lists_group_id ON public.group_grocery_lists(group_id);
CREATE INDEX IF NOT EXISTS idx_group_notifications_user_unread ON public.group_notifications(user_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_split_bills_group_id ON public.split_bills(group_id);
CREATE INDEX IF NOT EXISTS idx_split_bills_created_by ON public.split_bills(created_by);
CREATE INDEX IF NOT EXISTS idx_split_bills_status ON public.split_bills(status);
CREATE INDEX IF NOT EXISTS idx_bill_splits_split_bill_id ON public.bill_splits(split_bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_splits_user_id ON public.bill_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_splits_status ON public.bill_splits(status);
CREATE INDEX IF NOT EXISTS idx_split_bill_transactions_bill_split_id ON public.split_bill_transactions(bill_split_id);

-- 12. Database setup complete - ready for admin to add real categories and products

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Database setup complete! All tables, functions, triggers, and policies have been created.';
    RAISE NOTICE '🎯 Your app should now connect to the database instead of using fallback mode.';
    RAISE NOTICE '🧪 Use the Database Connection Tester in Settings to verify the setup.';
END $$;
