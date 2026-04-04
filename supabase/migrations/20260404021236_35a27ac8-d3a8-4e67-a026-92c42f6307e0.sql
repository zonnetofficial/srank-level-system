
-- 1. Fix monarch_subscriptions INSERT: only allow status='inactive'
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.monarch_subscriptions;
CREATE POLICY "Users can insert own subscription"
ON public.monarch_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'inactive');

-- 2. Remove permissive UPDATE policy on user_inventory (all mutations via RPC)
DROP POLICY IF EXISTS "Users can update own inventory" ON public.user_inventory;

-- 3. Fix marketplace_listings UPDATE: restrict field changes
DROP POLICY IF EXISTS "Users can update own listings" ON public.marketplace_listings;
CREATE POLICY "Sellers can cancel own listings"
ON public.marketplace_listings
FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id AND status = 'cancelled');
