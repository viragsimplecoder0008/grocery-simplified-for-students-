-- ===========================================
-- GROCERY SIMPLIFIED - DATABASE SETUP
-- Run this script in your Supabase SQL Editor
-- ===========================================

-- Step 1: Check if profiles table exists and add brand role
DO $$ 
BEGIN
    -- First, let's see what user roles already exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        -- Add 'brand' to the role enum if it doesn't exist
        -- Note: This might need manual adjustment based on your current schema
        RAISE NOTICE 'Profiles table found with role column';
    ELSE
        RAISE NOTICE 'Profiles table or role column not found - may need manual setup';
    END IF;
END $$;

-- Step 2: Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id), -- Reference auth.users instead of profiles for now
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 3: Enable Row Level Security
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brands_email ON public.brands(email);
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_created_by ON public.brands(created_by);
CREATE INDEX IF NOT EXISTS idx_brands_active ON public.brands(is_active);

-- Step 5: Create RLS Policies (Permissive for now, can be tightened later)
CREATE POLICY "Allow authenticated users to read brands" ON public.brands
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert brands" ON public.brands
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update brands" ON public.brands
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete brands" ON public.brands
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 6: Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger for brands table
DROP TRIGGER IF EXISTS brands_updated_at ON public.brands;
CREATE TRIGGER brands_updated_at
    BEFORE UPDATE ON public.brands
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Step 8: Add brand_id to products table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        -- Check if brand_id column already exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id') THEN
            ALTER TABLE public.products ADD COLUMN brand_id BIGINT REFERENCES public.brands(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
            RAISE NOTICE 'Added brand_id column to products table';
        ELSE
            RAISE NOTICE 'brand_id column already exists in products table';
        END IF;
    ELSE
        RAISE NOTICE 'Products table not found - skipping brand_id addition';
    END IF;
END $$;

-- Step 9: Test the setup (no test brand insertion)
-- Note: Brands should be created through the admin interface
-- which will create both the database record AND the Supabase Auth user

-- Step 10: Verify the setup
SELECT 
    'SUCCESS: Brands table created successfully!' as status,
    COUNT(*) as brand_count
FROM public.brands;

-- Show table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'brands' 
ORDER BY ordinal_position;
