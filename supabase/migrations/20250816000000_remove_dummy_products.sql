-- Delete all dummy products and sample data
-- Migration to remove all test/sample products and categories from the database

BEGIN;

-- Delete all products (this will cascade to related tables due to foreign key constraints)
DELETE FROM public.products WHERE id > 0;

-- Delete all categories
DELETE FROM public.categories WHERE id > 0;

-- Delete any grocery list items that reference the deleted products
DELETE FROM public.grocery_lists WHERE id > 0;

-- Delete any group grocery list items that reference the deleted products  
DELETE FROM public.group_grocery_lists WHERE id > 0;

-- Reset the sequences to start from 1
ALTER SEQUENCE IF EXISTS public.products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.grocery_lists_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS public.group_grocery_lists_id_seq RESTART WITH 1;

-- Add a comment about what this migration does
COMMENT ON TABLE public.products IS 'Products table - cleaned of dummy data, ready for real products';
COMMENT ON TABLE public.categories IS 'Categories table - cleaned of dummy data, ready for real categories';

COMMIT;
