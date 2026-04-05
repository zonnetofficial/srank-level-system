
-- Tighten monarch_subscriptions INSERT policy to enforce default values for sensitive fields
DROP POLICY IF EXISTS "Users can insert own subscription" ON monarch_subscriptions;

CREATE POLICY "Users can insert own subscription" ON monarch_subscriptions
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'inactive'
  AND mp_preapproval_id IS NULL
  AND mp_payer_email IS NULL
  AND penalty_amount = 5
  AND streak_at_entry = 0
);
