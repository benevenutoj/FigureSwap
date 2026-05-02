-- supabase/migrations/0008_payments.sql

CREATE TABLE public.store_products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_price_id text UNIQUE NOT NULL,
    name text NOT NULL,
    description text,
    product_type text NOT NULL CHECK (product_type IN ('credits', 'subscription')),
    credits_amount integer DEFAULT 0,
    price_brl numeric(10,2) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE public.purchases (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    product_id uuid REFERENCES public.store_products(id) NOT NULL,
    stripe_session_id text UNIQUE NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    amount_total numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

-- RLS
ALTER TABLE public.store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON public.store_products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.store_products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);

-- Let's allow users to insert pending purchases via the Server Action (which runs on their behalf)
-- Or rather, server actions run securely, but we need to ensure the user can only insert for themselves.
CREATE POLICY "Users can create pending purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Let's insert some default products (these will need their real Stripe Price IDs later)
INSERT INTO public.store_products (stripe_price_id, name, description, product_type, credits_amount, price_brl) VALUES
('price_credits_10_dummy', '10 Créditos', 'Ideal para quem troca casualmente.', 'credits', 10, 4.90),
('price_credits_25_dummy', '25 Créditos', 'Para os mais engajados.', 'credits', 25, 9.90),
('price_premium_monthly_dummy', 'FigureSwap Premium', 'Re-rolls ilimitados, selo exclusivo e prioridade.', 'subscription', 0, 14.90);
