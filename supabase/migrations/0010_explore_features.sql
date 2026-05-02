-- Migration 0010: Explore Features

-- 1. Get Top Wanted Stickers
create or replace function get_top_wanted_stickers()
returns table (
  sticker_id uuid,
  code text,
  name text,
  team_name text,
  wanted_count bigint
) language plpgsql security definer as $$
begin
  return query
  select 
    s.id as sticker_id,
    s.code,
    s.name,
    s.team_name,
    count(ui.id) as wanted_count
  from public.user_inventory ui
  join public.stickers s on s.id = ui.sticker_id
  where ui.is_wanted = true
  group by s.id, s.code, s.name, s.team_name
  order by wanted_count desc
  limit 5;
end;
$$;

-- 2. Search Users By Sticker
-- Returns users who have a sticker matching the query, and also what they want.
create or replace function search_users_by_sticker(p_query text, p_user_id uuid)
returns table (
  match_user_id uuid,
  match_user_name text,
  match_user_state text,
  match_user_city text,
  match_user_reputation numeric,
  they_give jsonb,
  they_want jsonb
) language plpgsql security definer as $$
begin
  return query
  with search_stickers as (
    select id from public.stickers 
    where code ilike '%' || p_query || '%' or name ilike '%' || p_query || '%'
  ),
  others_giving as (
    select ui.user_id, jsonb_agg(jsonb_build_object('id', s.id, 'code', s.code, 'name', s.name)) as they_give_stickers
    from public.user_inventory ui
    join public.stickers s on s.id = ui.sticker_id
    where ui.user_id != p_user_id 
      and ui.owned_quantity > 0
      and ui.sticker_id in (select id from search_stickers)
    group by ui.user_id
  ),
  others_wanting as (
    select ui.user_id, jsonb_agg(jsonb_build_object('id', s.id, 'code', s.code, 'name', s.name)) as they_want_stickers
    from public.user_inventory ui
    join public.stickers s on s.id = ui.sticker_id
    where ui.user_id in (select user_id from others_giving)
      and ui.is_wanted = true
    group by ui.user_id
  )
  select 
    p.id as match_user_id,
    p.name as match_user_name,
    p.state as match_user_state,
    p.city as match_user_city,
    p.reputation_score as match_user_reputation,
    og.they_give_stickers as they_give,
    coalesce(ow.they_want_stickers, '[]'::jsonb) as they_want
  from public.profiles p
  join others_giving og on og.user_id = p.id
  left join others_wanting ow on ow.user_id = p.id
  order by p.reputation_score desc
  limit 20;
end;
$$;
