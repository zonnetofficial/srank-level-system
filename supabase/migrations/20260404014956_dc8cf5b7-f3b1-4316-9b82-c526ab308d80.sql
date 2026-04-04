
-- 1. Create SECURITY DEFINER function for inventory grants (prevents direct INSERT bypass)
CREATE OR REPLACE FUNCTION public.grant_inventory_item(
  p_user_id uuid,
  p_item_id uuid,
  p_quantity integer DEFAULT 1,
  p_source text DEFAULT 'system'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow granting to the calling user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot grant items to other users';
  END IF;

  -- Validate quantity
  IF p_quantity < 1 OR p_quantity > 99 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  -- Validate item exists and is active
  IF NOT EXISTS (SELECT 1 FROM shop_items WHERE id = p_item_id AND is_active = true) THEN
    RAISE EXCEPTION 'Item not found or inactive';
  END IF;

  -- Upsert inventory
  INSERT INTO user_inventory (user_id, item_id, quantity, source)
  VALUES (p_user_id, p_item_id, p_quantity, p_source)
  ON CONFLICT (user_id, item_id) 
  DO UPDATE SET quantity = user_inventory.quantity + p_quantity;
END;
$$;

-- 2. Remove the dangerous direct INSERT policy on user_inventory
DROP POLICY IF EXISTS "Users can insert own inventory" ON user_inventory;

-- 3. Add unique constraint needed for upsert (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_inventory_user_item_unique'
  ) THEN
    ALTER TABLE user_inventory ADD CONSTRAINT user_inventory_user_item_unique UNIQUE (user_id, item_id);
  END IF;
END $$;

-- 4. Fix monarch_subscriptions: remove UPDATE policy (mutations move to edge function with service_role)
DROP POLICY IF EXISTS "Users can update own subscription" ON monarch_subscriptions;

-- 5. Fix public role policies → authenticated
ALTER POLICY "Users can view own t_points" ON t_points TO authenticated;
ALTER POLICY "Users can view own tp_transactions" ON tp_transactions TO authenticated;
ALTER POLICY "Anyone authenticated can view active tp_packages" ON tp_packages TO authenticated;
