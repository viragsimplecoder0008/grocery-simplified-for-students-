-- Fix security warnings by dropping policies first, then recreating functions
DROP POLICY IF EXISTS "Category managers can create categories" ON public.categories;
DROP POLICY IF EXISTS "Category managers can update their categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can create products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;

-- Drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Recreate the policies
CREATE POLICY "Category managers can create categories" ON public.categories
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) = 'category_manager'
  );

CREATE POLICY "Category managers can update their categories" ON public.categories
  FOR UPDATE USING (
    auth.uid() = created_by AND 
    public.get_user_role(auth.uid()) = 'category_manager'
  );

CREATE POLICY "Admins can create products" ON public.products
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update products" ON public.products
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    public.get_user_role(auth.uid()) = 'admin'
  );

-- Update other functions with proper search_path
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

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

-- Recreate triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();