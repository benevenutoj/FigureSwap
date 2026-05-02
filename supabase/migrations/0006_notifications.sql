-- supabase/migrations/0006_notifications.sql

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) NOT NULL,
    type text NOT NULL, 
    content text NOT NULL,
    link text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for querying unread notifications quickly
CREATE INDEX idx_notifications_user_id_is_read ON public.notifications(user_id, is_read);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications (to mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger function to create notifications on trade inserts/updates
CREATE OR REPLACE FUNCTION notify_trade_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_proposer_name text;
  v_receiver_name text;
BEGIN
  -- Get names
  SELECT name INTO v_proposer_name FROM public.profiles WHERE id = NEW.proposer_id;
  SELECT name INTO v_receiver_name FROM public.profiles WHERE id = NEW.receiver_id;

  -- 1. New Trade Proposed (INSERT)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, type, content, link)
    VALUES (NEW.receiver_id, 'trade_received', v_proposer_name || ' te enviou uma proposta de troca!', '/trades/' || NEW.id);
    RETURN NEW;
  END IF;

  -- 2. Status Changed (UPDATE)
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    
    IF NEW.status = 'accepted' THEN
      INSERT INTO public.notifications (user_id, type, content, link)
      VALUES (NEW.proposer_id, 'trade_accepted', v_receiver_name || ' aceitou sua proposta!', '/trades/' || NEW.id);
    
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, type, content, link)
      VALUES (NEW.proposer_id, 'trade_rejected', v_receiver_name || ' recusou sua proposta.', '/trades/' || NEW.id);
    
    ELSIF NEW.status = 'completed' THEN
      -- Notify both parties
      INSERT INTO public.notifications (user_id, type, content, link)
      VALUES (NEW.proposer_id, 'trade_completed', 'A troca com ' || v_receiver_name || ' foi finalizada!', '/trades/' || NEW.id);
      
      INSERT INTO public.notifications (user_id, type, content, link)
      VALUES (NEW.receiver_id, 'trade_completed', 'A troca com ' || v_proposer_name || ' foi finalizada!', '/trades/' || NEW.id);
      
    END IF;

  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_trade_change
AFTER INSERT OR UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION notify_trade_changes();

-- Add table to Realtime Publication (if it already exists, use IF NOT EXISTS logic or just recreate)
-- This ensures the client can subscribe to changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END
$$;
