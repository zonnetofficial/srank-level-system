
CREATE OR REPLACE FUNCTION public.update_inventory_quantity(p_inventory_id uuid, p_new_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Validate quantity
  IF p_new_quantity < 0 OR p_new_quantity > 9999 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;

  -- Only allow updating own inventory rows
  UPDATE user_inventory
  SET quantity = p_new_quantity
  WHERE id = p_inventory_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory item not found or not owned';
  END IF;
END;
$$;
