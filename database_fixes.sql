-- Run these SQL commands in your Supabase Dashboard -> SQL Editor

-- 1. Add color column to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3B82F6';

-- 2. Update category policies to allow both admins and category managers
DROP POLICY IF EXISTS "Category managers can create categories" ON public.categories;
DROP POLICY IF EXISTS "Category managers can update their categories" ON public.categories;

-- Allow both admins and category managers to create categories
CREATE POLICY "Admins and category managers can create categories" ON public.categories
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) IN ('admin', 'category_manager')
  );

-- Allow both admins and category managers to update categories
CREATE POLICY "Admins and category managers can update categories" ON public.categories
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) IN ('admin', 'category_manager')
  );

-- Allow both admins and category managers to delete categories
CREATE POLICY "Admins and category managers can delete categories" ON public.categories
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) IN ('admin', 'category_manager')
  );

-- 3. Optional: Add some sample categories with colors
INSERT INTO public.categories (name, description, color) VALUES
  ('Fruits & Vegetables', 'Fresh produce items', '#22C55E'),
  ('Dairy & Eggs', 'Milk, cheese, eggs and dairy products', '#F59E0B'),
  ('Meat & Seafood', 'Fresh and frozen meat and seafood', '#EF4444'),
  ('Bakery', 'Bread, pastries and baked goods', '#8B5CF6'),
  ('Snacks & Candy', 'Chips, cookies, candy and treats', '#EC4899'),
  ('Beverages', 'Drinks, juices, sodas and water', '#06B6D4')
ON CONFLICT (name) DO UPDATE SET 
  description = EXCLUDED.description,
  color = EXCLUDED.color;
