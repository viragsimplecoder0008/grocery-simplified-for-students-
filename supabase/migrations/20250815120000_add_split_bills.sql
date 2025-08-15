-- Add Split Bills functionality to the grocery app
-- This migration creates tables for splitting bills among group members

-- Create split_bills table
CREATE TABLE IF NOT EXISTS public.split_bills (
    id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    tip_amount DECIMAL(10,2) DEFAULT 0,
    split_method TEXT NOT NULL CHECK (split_method IN ('equal', 'itemized', 'custom')),
    items JSONB, -- Store bill items as JSON
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bill_splits table to track individual user amounts
CREATE TABLE IF NOT EXISTS public.bill_splits (
    id BIGSERIAL PRIMARY KEY,
    split_bill_id BIGINT NOT NULL REFERENCES public.split_bills(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_owed DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(split_bill_id, user_id)
);

-- Create split_bill_transactions table to track payments
CREATE TABLE IF NOT EXISTS public.split_bill_transactions (
    id BIGSERIAL PRIMARY KEY,
    bill_split_id BIGINT NOT NULL REFERENCES public.bill_splits(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund')),
    payment_method TEXT, -- 'cash', 'razorpay', 'upi', 'card', 'netbanking', 'wallet', etc.
    transaction_id TEXT, -- External payment system ID (Razorpay payment ID)
    order_id TEXT, -- Razorpay order ID
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled')),
    gateway_response JSONB, -- Store full gateway response for debugging
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.split_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_bill_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for split_bills
CREATE POLICY "Group members can view split bills" ON public.split_bills
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.group_memberships 
            WHERE group_id = split_bills.group_id AND is_active = true
        )
    );

CREATE POLICY "Group members can create split bills" ON public.split_bills
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.group_memberships 
            WHERE group_id = split_bills.group_id AND is_active = true
        )
    );

CREATE POLICY "Bill creators can update their split bills" ON public.split_bills
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Bill creators can delete their split bills" ON public.split_bills
    FOR DELETE USING (auth.uid() = created_by);

-- Create policies for bill_splits
CREATE POLICY "Users can view their own bill splits" ON public.bill_splits
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT created_by FROM public.split_bills WHERE id = bill_splits.split_bill_id
        )
    );

CREATE POLICY "Bill creators can insert bill splits" ON public.bill_splits
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT created_by FROM public.split_bills WHERE id = bill_splits.split_bill_id
        )
    );

CREATE POLICY "Users can update their own bill splits" ON public.bill_splits
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT created_by FROM public.split_bills WHERE id = bill_splits.split_bill_id
        )
    );

-- Create policies for split_bill_transactions
CREATE POLICY "Users can view transactions for their splits" ON public.split_bill_transactions
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.bill_splits WHERE id = split_bill_transactions.bill_split_id
        ) OR
        auth.uid() IN (
            SELECT sb.created_by FROM public.split_bills sb
            JOIN public.bill_splits bs ON sb.id = bs.split_bill_id
            WHERE bs.id = split_bill_transactions.bill_split_id
        )
    );

CREATE POLICY "Users can create transactions for their splits" ON public.split_bill_transactions
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.bill_splits WHERE id = split_bill_transactions.bill_split_id
        ) OR
        auth.uid() IN (
            SELECT sb.created_by FROM public.split_bills sb
            JOIN public.bill_splits bs ON sb.id = bs.split_bill_id
            WHERE bs.id = split_bill_transactions.bill_split_id
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_split_bills_group_id ON public.split_bills(group_id);
CREATE INDEX IF NOT EXISTS idx_split_bills_created_by ON public.split_bills(created_by);
CREATE INDEX IF NOT EXISTS idx_split_bills_status ON public.split_bills(status);
CREATE INDEX IF NOT EXISTS idx_bill_splits_split_bill_id ON public.bill_splits(split_bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_splits_user_id ON public.bill_splits(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_splits_status ON public.bill_splits(status);
CREATE INDEX IF NOT EXISTS idx_split_bill_transactions_bill_split_id ON public.split_bill_transactions(bill_split_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_split_bills_updated_at
    BEFORE UPDATE ON public.split_bills
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bill_splits_updated_at
    BEFORE UPDATE ON public.bill_splits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically update bill split status when fully paid
CREATE OR REPLACE FUNCTION public.update_bill_split_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    -- Update the bill split status if amount is fully paid
    IF NEW.amount_paid >= (SELECT amount_owed FROM public.bill_splits WHERE id = NEW.bill_split_id) THEN
        UPDATE public.bill_splits 
        SET status = 'paid', paid_at = COALESCE(NEW.created_at, now())
        WHERE id = NEW.bill_split_id;
    END IF;
    
    -- Check if all splits for this bill are paid and update main bill status
    IF NOT EXISTS (
        SELECT 1 FROM public.bill_splits 
        WHERE split_bill_id = (SELECT split_bill_id FROM public.bill_splits WHERE id = NEW.bill_split_id)
        AND status != 'paid'
    ) THEN
        UPDATE public.split_bills 
        SET status = 'completed'
        WHERE id = (SELECT split_bill_id FROM public.bill_splits WHERE id = NEW.bill_split_id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic status updates
CREATE TRIGGER update_bill_split_status_on_payment
    AFTER INSERT ON public.split_bill_transactions
    FOR EACH ROW 
    WHEN (NEW.transaction_type = 'payment')
    EXECUTE FUNCTION public.update_bill_split_status();

-- Create function to calculate total paid amount for a bill split
CREATE OR REPLACE FUNCTION public.calculate_bill_split_paid_amount(bill_split_id_param BIGINT)
RETURNS DECIMAL(10,2)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
    SELECT COALESCE(SUM(
        CASE 
            WHEN transaction_type = 'payment' THEN amount
            WHEN transaction_type = 'refund' THEN -amount
            ELSE 0
        END
    ), 0)
    FROM public.split_bill_transactions
    WHERE bill_split_id = bill_split_id_param;
$$;

-- Create a view for easy querying of split bill details with user information
CREATE OR REPLACE VIEW public.split_bills_with_details AS
SELECT 
    sb.id,
    sb.group_id,
    sb.title,
    sb.description,
    sb.total_amount,
    sb.tax_amount,
    sb.tip_amount,
    sb.split_method,
    sb.items,
    sb.status as bill_status,
    sb.created_by,
    sb.created_at,
    sb.updated_at,
    creator.full_name as created_by_name,
    creator.email as created_by_email,
    groups.name as group_name,
    COUNT(bs.id) as total_splits,
    COUNT(CASE WHEN bs.status = 'paid' THEN 1 END) as paid_splits,
    SUM(bs.amount_owed) as total_owed,
    SUM(bs.amount_paid) as total_paid
FROM public.split_bills sb
JOIN public.profiles creator ON sb.created_by = creator.id
JOIN public.groups ON sb.group_id = groups.id
LEFT JOIN public.bill_splits bs ON sb.id = bs.split_bill_id
GROUP BY sb.id, creator.id, creator.full_name, creator.email, groups.name;

-- Grant necessary permissions
GRANT SELECT ON public.split_bills_with_details TO authenticated;

-- Insert sample data for testing (optional)
-- This will only run if there are existing groups and users
DO $$ 
DECLARE
    sample_group_id BIGINT;
    sample_user_id UUID;
BEGIN
    -- Get a sample group and user for testing
    SELECT id INTO sample_group_id FROM public.groups LIMIT 1;
    SELECT id INTO sample_user_id FROM public.profiles LIMIT 1;
    
    IF sample_group_id IS NOT NULL AND sample_user_id IS NOT NULL THEN
        -- Insert a sample split bill
        INSERT INTO public.split_bills (
            group_id, 
            title, 
            description, 
            total_amount, 
            tax_amount, 
            tip_amount, 
            split_method, 
            created_by,
            items
        ) VALUES (
            sample_group_id,
            'Pizza Night',
            'Group dinner at Mario''s Pizza',
            45.50,
            3.50,
            7.00,
            'equal',
            sample_user_id,
            '[{"id":"1","name":"Large Pizza","price":25.00,"quantity":1,"assignedTo":[]},{"id":"2","name":"Garlic Bread","price":8.00,"quantity":1,"assignedTo":[]},{"id":"3","name":"Sodas","price":7.00,"quantity":1,"assignedTo":[]}]'::jsonb
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ Split Bills functionality added successfully!';
    RAISE NOTICE '🧾 Tables created: split_bills, bill_splits, split_bill_transactions';
    RAISE NOTICE '🔒 Row Level Security policies configured';
    RAISE NOTICE '📊 View created: split_bills_with_details';
    RAISE NOTICE '🔧 Triggers and functions for automatic status updates';
END $$;
