
-- 1. Add UNIQUE constraint on monarch_subscriptions(user_id) to prevent multiple rows
ALTER TABLE public.monarch_subscriptions ADD CONSTRAINT monarch_subscriptions_user_id_key UNIQUE (user_id);

-- 2. Restrict monarch_subscriptions INSERT: mp_preapproval_id and mp_payer_email must be NULL on client insert
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.monarch_subscriptions;
CREATE POLICY "Users can insert own subscription"
ON public.monarch_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND status = 'inactive' 
  AND mp_preapproval_id IS NULL 
  AND mp_payer_email IS NULL
);

-- 3. Replace marketplace UPDATE with a SECURITY DEFINER function
DROP POLICY IF EXISTS "Sellers can cancel own listings" ON public.marketplace_listings;

CREATE OR REPLACE FUNCTION public.cancel_marketplace_listing(p_listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE marketplace_listings
  SET status = 'cancelled'
  WHERE id = p_listing_id 
    AND seller_id = auth.uid() 
    AND status = 'active';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found, not owned, or not active';
  END IF;
END;
$$;

-- 4. Replace character_equipment INSERT/UPDATE/DELETE with a SECURITY DEFINER function
DROP POLICY IF EXISTS "Users can insert own equipment" ON public.character_equipment;
DROP POLICY IF EXISTS "Users can update own equipment" ON public.character_equipment;
DROP POLICY IF EXISTS "Users can delete own equipment" ON public.character_equipment;

CREATE OR REPLACE FUNCTION public.equip_item(p_slot text, p_item_id uuid DEFAULT NULL, p_title_key text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate slot
  IF p_slot NOT IN ('weapon', 'armor', 'aura', 'frame', 'title', 'accessory') THEN
    RAISE EXCEPTION 'Invalid slot';
  END IF;

  -- If equipping an item, verify ownership in inventory
  IF p_item_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_inventory 
      WHERE user_id = auth.uid() AND item_id = p_item_id AND quantity >= 1
    ) THEN
      RAISE EXCEPTION 'Item not in inventory';
    END IF;
  END IF;

  -- Delete existing equipment in this slot
  DELETE FROM character_equipment WHERE user_id = auth.uid() AND slot = p_slot;

  -- Insert new equipment if provided
  IF p_item_id IS NOT NULL OR p_title_key IS NOT NULL THEN
    INSERT INTO character_equipment (user_id, slot, item_id, title_key)
    VALUES (auth.uid(), p_slot, p_item_id, p_title_key);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.unequip_slot(p_slot text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM character_equipment WHERE user_id = auth.uid() AND slot = p_slot;
END;
$$;
