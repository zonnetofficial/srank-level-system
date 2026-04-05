
DROP POLICY IF EXISTS "Users can cancel own subscription" ON public.monarch_subscriptions;

CREATE POLICY "Users can cancel own subscription"
ON public.monarch_subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'cancelled'
  AND penalty_amount = (SELECT ms.penalty_amount FROM public.monarch_subscriptions ms WHERE ms.id = monarch_subscriptions.id)
  AND streak_at_entry = (SELECT ms.streak_at_entry FROM public.monarch_subscriptions ms WHERE ms.id = monarch_subscriptions.id)
  AND blocked_until IS NOT DISTINCT FROM (SELECT ms.blocked_until FROM public.monarch_subscriptions ms WHERE ms.id = monarch_subscriptions.id)
  AND mp_preapproval_id IS NOT DISTINCT FROM (SELECT ms.mp_preapproval_id FROM public.monarch_subscriptions ms WHERE ms.id = monarch_subscriptions.id)
  AND mp_payer_email IS NOT DISTINCT FROM (SELECT ms.mp_payer_email FROM public.monarch_subscriptions ms WHERE ms.id = monarch_subscriptions.id)
);
