-- supabase/migrations/0004_credits_referrals.sql

-- 1. Add credits and referral fields to profiles
ALTER TABLE public.profiles ADD COLUMN credits integer DEFAULT 5 NOT NULL;
ALTER TABLE public.profiles ADD COLUMN referral_code text UNIQUE;
ALTER TABLE public.profiles ADD COLUMN referred_by uuid REFERENCES public.profiles(id);

-- Create index for faster lookups on referral code
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- Create a secure function to grant referral reward
CREATE OR REPLACE FUNCTION grant_referral_reward(p_new_user_id uuid, p_referrer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if already referred (to prevent double dipping)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_new_user_id AND referred_by IS NOT NULL) THEN
    RETURN;
  END IF;

  -- Update the new user with who referred them
  UPDATE public.profiles SET referred_by = p_referrer_id WHERE id = p_new_user_id;

  -- Give 2 credits to the referrer
  UPDATE public.profiles SET credits = credits + 2 WHERE id = p_referrer_id;
END;
$$;
