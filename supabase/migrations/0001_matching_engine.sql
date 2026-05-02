-- supabase/migrations/0001_matching_engine.sql

-- Drop the function if it already exists
drop function if exists get_user_matches(uuid);

-- Create the matching function
create or replace function get_user_matches(p_user_id uuid)
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
  with my_wants as (
    select sticker_id from public.user_inventory
    where user_id = p_user_id and is_wanted = true
  ),
  my_gives as (
    select sticker_id from public.user_inventory
    where user_id = p_user_id and (owned_quantity - reserved_quantity) > 0
  ),
  -- Outros usuários que tem as figurinhas que eu quero disponíveis
  others_giving as (
    select ui.user_id, jsonb_agg(jsonb_build_object('id', s.id, 'code', s.code, 'name', s.name)) as they_give_stickers
    from public.user_inventory ui
    join public.stickers s on s.id = ui.sticker_id
    where ui.user_id != p_user_id 
      and (ui.owned_quantity - ui.reserved_quantity) > 0
      and ui.sticker_id in (select sticker_id from my_wants)
    group by ui.user_id
  ),
  -- Outros usuários que querem as figurinhas que eu tenho disponíveis
  others_wanting as (
    select ui.user_id, jsonb_agg(jsonb_build_object('id', s.id, 'code', s.code, 'name', s.name)) as they_want_stickers
    from public.user_inventory ui
    join public.stickers s on s.id = ui.sticker_id
    where ui.user_id != p_user_id 
      and ui.is_wanted = true
      and ui.sticker_id in (select sticker_id from my_gives)
    group by ui.user_id
  )
  -- O MATCH acontece na interseção (INNER JOIN) entre quem tem o que eu quero E quer o que eu tenho
  select 
    p.id as match_user_id,
    p.name as match_user_name,
    p.state as match_user_state,
    p.city as match_user_city,
    p.reputation_score as match_user_reputation,
    og.they_give_stickers as they_give,
    ow.they_want_stickers as they_want
  from public.profiles p
  join others_giving og on og.user_id = p.id
  join others_wanting ow on ow.user_id = p.id;
end;
$$;
