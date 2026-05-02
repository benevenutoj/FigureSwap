-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  state text,
  city text,
  whatsapp text,
  is_premium boolean default false,
  reputation_score numeric(3, 2) default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

-- 2. Stickers Table (Reference Table)
create table public.stickers (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null, -- e.g., 'BRA-1', 'FWC-10'
  name text not null,
  category text, -- e.g., 'Brazil', 'Stadiums', 'Legends'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Stickers
alter table public.stickers enable row level security;
create policy "Stickers are viewable by everyone." on public.stickers for select using (true);
-- Only admins/service role can insert/update/delete stickers

-- 3. User Inventory Table
create table public.user_inventory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sticker_id uuid references public.stickers(id) on delete cascade not null,
  owned_quantity integer default 0 check (owned_quantity >= 0),
  reserved_quantity integer default 0 check (reserved_quantity >= 0),
  is_wanted boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, sticker_id)
);

-- Constraint to ensure available_quantity is never negative
-- available_quantity = owned_quantity - reserved_quantity
alter table public.user_inventory add constraint reserved_le_owned check (reserved_quantity <= owned_quantity);

-- RLS for Inventory
alter table public.user_inventory enable row level security;
create policy "Inventory is viewable by everyone." on public.user_inventory for select using (true);
create policy "Users can manage their own inventory." on public.user_inventory for all using (auth.uid() = user_id);

-- 4. Trades Table
create type trade_status as enum (
  'pending', 
  'accepted', 
  'rejected', 
  'scheduled', 
  'awaiting_confirmation', 
  'completed', 
  'cancelled', 
  'expired'
);

create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  proposer_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  status trade_status default 'pending' not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (proposer_id != receiver_id)
);

-- RLS for Trades
alter table public.trades enable row level security;
create policy "Users can see trades they are involved in." on public.trades for select using (auth.uid() = proposer_id or auth.uid() = receiver_id);
create policy "Users can create trades." on public.trades for insert with check (auth.uid() = proposer_id);
create policy "Users can update their trades." on public.trades for update using (auth.uid() = proposer_id or auth.uid() = receiver_id);

-- 5. Trade Items Table
-- Represents what stickers are being exchanged in a trade
create table public.trade_items (
  id uuid default uuid_generate_v4() primary key,
  trade_id uuid references public.trades(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  sticker_id uuid references public.stickers(id) on delete cascade not null,
  quantity integer default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Trade Items
alter table public.trade_items enable row level security;
create policy "Users can see items of their trades." on public.trade_items for select using (
  exists (
    select 1 from public.trades t 
    where t.id = trade_items.trade_id and (t.proposer_id = auth.uid() or t.receiver_id = auth.uid())
  )
);
create policy "Users can add items to their trades." on public.trade_items for insert with check (
  exists (
    select 1 from public.trades t 
    where t.id = trade_items.trade_id and t.proposer_id = auth.uid()
  )
);

-- Triggers for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger on_user_inventory_updated
  before update on public.user_inventory
  for each row execute procedure public.handle_updated_at();

create trigger on_trades_updated
  before update on public.trades
  for each row execute procedure public.handle_updated_at();
