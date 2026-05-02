-- supabase/migrations/0002_trade_transactions.sql

-- Helper function to change trade status
create or replace function update_trade_status(
  p_trade_id uuid,
  p_new_status trade_status,
  p_user_id uuid
) returns void language plpgsql security definer as $$
declare
  v_trade record;
  v_item record;
  v_available int;
begin
  -- Get trade info
  select * into v_trade from public.trades where id = p_trade_id;
  if not found then
    raise exception 'Trade not found';
  end if;

  -- Ensure user is part of the trade
  if p_user_id != v_trade.proposer_id and p_user_id != v_trade.receiver_id then
    raise exception 'Unauthorized';
  end if;

  -- State machine logic
  
  -- TRANSITION TO SCHEDULED (Reserving inventory)
  if p_new_status = 'scheduled' then
    if v_trade.status not in ('pending', 'accepted') then
      raise exception 'Invalid transition to scheduled';
    end if;

    -- Reserve items
    for v_item in select * from public.trade_items where trade_id = p_trade_id loop
      -- Verify available quantity
      select (owned_quantity - reserved_quantity) into v_available 
      from public.user_inventory 
      where user_id = v_item.sender_id and sticker_id = v_item.sticker_id for update;

      if v_available < v_item.quantity then
        raise exception 'Insufficient available inventory for sticker %', v_item.sticker_id;
      end if;

      -- Update reserved quantity
      update public.user_inventory
      set reserved_quantity = reserved_quantity + v_item.quantity
      where user_id = v_item.sender_id and sticker_id = v_item.sticker_id;
    end loop;
    
    -- Set expiration (e.g. 48h as per rules)
    update public.trades set status = 'scheduled', expires_at = now() + interval '48 hours' where id = p_trade_id;

  -- TRANSITION TO COMPLETED (Transferring inventory)
  elsif p_new_status = 'completed' then
    if v_trade.status != 'awaiting_confirmation' then
      raise exception 'Trade must be awaiting confirmation to complete';
    end if;

    -- Transfer items
    for v_item in select * from public.trade_items where trade_id = p_trade_id loop
      -- 1. Deduct from sender (owned and reserved)
      update public.user_inventory
      set owned_quantity = owned_quantity - v_item.quantity,
          reserved_quantity = reserved_quantity - v_item.quantity
      where user_id = v_item.sender_id and sticker_id = v_item.sticker_id;

      -- 2. Add to receiver (owned)
      -- Determine receiver of this specific item
      declare
        v_dest_id uuid;
      begin
        if v_item.sender_id = v_trade.proposer_id then
          v_dest_id := v_trade.receiver_id;
        else
          v_dest_id := v_trade.proposer_id;
        end if;

        insert into public.user_inventory (user_id, sticker_id, owned_quantity)
        values (v_dest_id, v_item.sticker_id, v_item.quantity)
        on conflict (user_id, sticker_id)
        do update set owned_quantity = public.user_inventory.owned_quantity + excluded.owned_quantity;
      end;
    end loop;

    update public.trades set status = 'completed' where id = p_trade_id;

  -- TRANSITION TO CANCELLED / REJECTED / EXPIRED (Releasing inventory if scheduled)
  elsif p_new_status in ('cancelled', 'rejected', 'expired') then
    if v_trade.status in ('scheduled', 'awaiting_confirmation') then
      -- Release reservations
      for v_item in select * from public.trade_items where trade_id = p_trade_id loop
        update public.user_inventory
        set reserved_quantity = reserved_quantity - v_item.quantity
        where user_id = v_item.sender_id and sticker_id = v_item.sticker_id;
      end loop;
    end if;

    update public.trades set status = p_new_status where id = p_trade_id;

  -- OTHER SIMPLE TRANSITIONS
  else
    update public.trades set status = p_new_status where id = p_trade_id;
  end if;
end;
$$;
