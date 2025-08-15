-- Manual SQL to create brands table and related structures
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS on brands table
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_brands_email ON public.brands(email);
CREATE INDEX IF NOT EXISTS idx_brands_name ON public.brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_created_by ON public.brands(created_by);

-- 4. RLS Policies for brands table
CREATE POLICY "Admins can view all brands" ON public.brands
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create brands" ON public.brands
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update brands" ON public.brands
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete brands" ON public.brands
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Add brand_id to products table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id') THEN
    ALTER TABLE public.products ADD COLUMN brand_id BIGINT REFERENCES public.brands(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_products_brand_id ON public.products(brand_id);
  END IF;
END $$;

-- 7. Update the profiles table to include 'brand' role if needed
DO $$
BEGIN
  -- Check if the role enum allows 'brand' 
  -- This might require manual intervention depending on your current schema
  -- You might need to run: ALTER TYPE user_role ADD VALUE 'brand';
END $$;

SELECT 'Brands table and related structures created successfully!' as result;
