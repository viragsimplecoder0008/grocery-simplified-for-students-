-- Delete all dummy products and sample data from the database
-- This script removes all products, categories, and related sample data

-- First, delete all products (this will cascade to related tables due to foreign key constraints)
DELETE FROM public.products;

-- Delete all categories
DELETE FROM public.categories;

-- Delete any grocery list items that reference the deleted products
DELETE FROM public.grocery_lists;

-- Delete any group grocery list items that reference the deleted products
DELETE FROM public.group_grocery_lists;

-- Reset the sequences to start from 1
ALTER SEQUENCE public.products_id_seq RESTART WITH 1;
ALTER SEQUENCE public.categories_id_seq RESTART WITH 1;
ALTER SEQUENCE public.grocery_lists_id_seq RESTART WITH 1;
ALTER SEQUENCE public.group_grocery_lists_id_seq RESTART WITH 1;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Successfully deleted all dummy products and sample data!';
  RAISE NOTICE '📊 Database is now clean and ready for real products.';
  RAISE NOTICE '🔧 Sequences have been reset to start from 1.';
END $$;
