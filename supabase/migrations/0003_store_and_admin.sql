-- supabase/migrations/0003_store_and_admin.sql

-- 1. Add role to profiles
ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user' NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT valid_roles CHECK (role IN ('user', 'admin'));

-- 2. Affiliate Links Table
CREATE TABLE public.affiliate_links (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  pack_size integer NOT NULL, -- e.g., 21, 49, 105
  label text NOT NULL, -- e.g., '21 figurinhas'
  price_text text NOT NULL, -- e.g., 'R$ 45,00'
  url text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Affiliate Links
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
-- Everyone can read active links (or all links, let's restrict to everyone can read active)
CREATE POLICY "Active affiliate links are viewable by everyone." ON public.affiliate_links FOR SELECT USING (is_active = true);
-- Admins can read/write everything
CREATE POLICY "Admins can manage affiliate links." ON public.affiliate_links FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Link Clicks Table (Analytics)
CREATE TABLE public.link_clicks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  link_id uuid REFERENCES public.affiliate_links(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for Link Clicks
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
-- Users can insert their own clicks
CREATE POLICY "Users can track their own clicks." ON public.link_clicks FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Admins can read all clicks
CREATE POLICY "Admins can read all clicks." ON public.link_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Triggers for updated_at
CREATE TRIGGER on_affiliate_links_updated
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
