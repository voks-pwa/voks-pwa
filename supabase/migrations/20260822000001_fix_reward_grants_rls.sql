-- Fix reward_grants RLS: change INSERT policy from authenticated to service_role only
-- Previously, any authenticated user could INSERT their own reward grants (self-granting risk)

DROP POLICY IF EXISTS "Users insert own reward grants" ON reward_grants;

CREATE POLICY "reward_grants service role insert"
  ON reward_grants FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "reward_grants authenticated read"
  ON reward_grants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
