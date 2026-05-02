-- supabase/migrations/0005_stickers_groups.sql

ALTER TABLE public.stickers ADD COLUMN group_name text;
