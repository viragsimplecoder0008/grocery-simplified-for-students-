-- Add currency field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'GBP', 'INR'));
