-- Add budget fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN budget DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN budget_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add budget fields to groups table (will need to be created when groups migration is applied)
-- This will be handled separately since groups table might not exist yet

-- Create brands table for brand management
CREATE TABLE public.brands (
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

-- Add brand_id to products table
ALTER TABLE public.products 
ADD COLUMN brand_id BIGINT REFERENCES public.brands(id) ON DELETE SET NULL;

-- Create group_budgets table for group budget management
CREATE TABLE public.group_budgets (
  id BIGSERIAL PRIMARY KEY,
  group_id BIGINT, -- Will reference groups(id) when available
  budget DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  requested_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_budgets ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_brands_email ON public.brands(email);
CREATE INDEX idx_brands_name ON public.brands(name);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_group_budgets_group_id ON public.group_budgets(group_id);
CREATE INDEX idx_group_budgets_requested_by ON public.group_budgets(requested_by);

-- RLS Policies for brands table
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

-- RLS Policies for group_budgets table
CREATE POLICY "Group members can view budget requests for their groups" ON public.group_budgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (
        role = 'admin' OR 
        requested_by = auth.uid() OR
        approved_by = auth.uid()
      )
    )
  );

CREATE POLICY "Group members can request budget changes" ON public.group_budgets
  FOR INSERT WITH CHECK (
    requested_by = auth.uid()
  );

CREATE POLICY "Group leaders can approve budget changes" ON public.group_budgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (
        role = 'admin' OR 
        approved_by = auth.uid()
      )
    )
  );

-- Create function to update budget timestamps
CREATE OR REPLACE FUNCTION public.update_budget_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.budget_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles budget updates
CREATE TRIGGER update_profiles_budget_timestamp
  BEFORE UPDATE OF budget ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_budget_timestamp();

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_group_budgets_updated_at
  BEFORE UPDATE ON public.group_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
