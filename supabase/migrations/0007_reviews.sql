-- supabase/migrations/0007_reviews.sql

-- Add rating columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating_avg numeric(3,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trade_id uuid REFERENCES public.trades(id) NOT NULL,
    reviewer_id uuid REFERENCES public.profiles(id) NOT NULL,
    reviewee_id uuid REFERENCES public.profiles(id) NOT NULL,
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(trade_id, reviewer_id) -- A user can only review a specific trade once
);

CREATE INDEX idx_reviews_reviewee_id ON public.reviews(reviewee_id);

-- RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" 
ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Trigger to recalculate profile rating
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_avg numeric;
  v_count integer;
BEGIN
  -- Calculate new average and count for the reviewee
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO v_avg, v_count
  FROM public.reviews
  WHERE reviewee_id = NEW.reviewee_id;

  -- Update profile
  UPDATE public.profiles
  SET rating_avg = ROUND(v_avg, 2),
      review_count = v_count
  WHERE id = NEW.reviewee_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_insert
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_profile_rating();

-- Update the matching function to return the new rating columns
drop function if exists get_user_matches(uuid);

create or replace function get_user_matches(p_user_id uuid)
returns table (
  match_user_id uuid,
  match_user_name text,
  match_user_state text,
  match_user_city text,
  match_user_reputation numeric,
  match_rating_avg numeric,
  match_review_count integer,
  they_give jsonb,
  they_want jsonb
) language plpgsql security definer as $$
begin
  return query
  with my_wants as (
    select sticker_id from public.user_inventory
    where user_id = p_user_id and is_wanted = true
  ),
  my_gives as (
    select sticker_id from public.user_inventory
    where user_id = p_user_id and (owned_quantity - reserved_quantity) > 0
  ),
  others_giving as (
    select ui.user_id, jsonb_agg(jsonb_build_object('id', s.id, 'code', s.code, 'name', s.name)) as they_give_stickers
    from public.user_inventory ui
    join public.stickers s on s.id = ui.sticker_id
    where ui.user_id != p_user_id 
      and (ui.owned_quantity - ui.reserved_quantity) > 0
      and ui.sticker_id in (select sticker_id from my_wants)
    group by ui.user_id
  ),
  others_wanting as (
    select ui.user_id, jsonb_agg(jsonb_build_object('id', s.id, 'code', s.code, 'name', s.name)) as they_want_stickers
    from public.user_inventory ui
    join public.stickers s on s.id = ui.sticker_id
    where ui.user_id != p_user_id 
      and ui.is_wanted = true
      and ui.sticker_id in (select sticker_id from my_gives)
    group by ui.user_id
  )
  select 
    p.id as match_user_id,
    p.name as match_user_name,
    p.state as match_user_state,
    p.city as match_user_city,
    p.reputation_score as match_user_reputation,
    p.rating_avg as match_rating_avg,
    p.review_count as match_review_count,
    og.they_give_stickers as they_give,
    ow.they_want_stickers as they_want
  from public.profiles p
  join others_giving og on og.user_id = p.id
  join others_wanting ow on ow.user_id = p.id;
end;
$$;
