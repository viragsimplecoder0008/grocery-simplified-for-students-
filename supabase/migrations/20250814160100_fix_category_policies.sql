-- Update category policies to allow both admins and category managers
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
