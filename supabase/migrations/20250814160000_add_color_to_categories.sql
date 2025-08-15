-- Add color column to categories table
ALTER TABLE public.categories 
ADD COLUMN color TEXT DEFAULT '#3B82F6';
