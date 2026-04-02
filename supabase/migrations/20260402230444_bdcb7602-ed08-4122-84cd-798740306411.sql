
-- 1. Remove INSERT and UPDATE policies from dark_points (only service_role should modify)
DROP POLICY IF EXISTS "Users can insert own dark_points" ON public.dark_points;
DROP POLICY IF EXISTS "Users can update own dark_points" ON public.dark_points;

-- 2. Remove INSERT policy from dp_transactions (only service_role should insert)
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.dp_transactions;

-- 3. Remove INSERT and UPDATE policies from t_points (only service_role should modify)
DROP POLICY IF EXISTS "Users can insert own t_points" ON public.t_points;
DROP POLICY IF EXISTS "Users can update own t_points" ON public.t_points;

-- 4. Remove INSERT policy from tp_transactions (only service_role should insert)
DROP POLICY IF EXISTS "Users can insert own tp_transactions" ON public.tp_transactions;

-- 5. Fix character_equipment policies: change from public to authenticated
DROP POLICY IF EXISTS "Anyone can view character equipment" ON public.character_equipment;
CREATE POLICY "Authenticated can view character equipment"
  ON public.character_equipment FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can delete own equipment" ON public.character_equipment;
CREATE POLICY "Users can delete own equipment"
  ON public.character_equipment FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own equipment" ON public.character_equipment;
CREATE POLICY "Users can insert own equipment"
  ON public.character_equipment FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own equipment" ON public.character_equipment;
CREATE POLICY "Users can update own equipment"
  ON public.character_equipment FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
