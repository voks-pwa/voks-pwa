-- Fix reward_catalog RLS: make admin policy explicitly TO service_role
-- The original had no TO clause (defaults to PUBLIC) with auth.role() check
-- which works as a blanket deny but is misleading.
-- Explicit TO service_role makes intent clear and matches all other admin policies.

DROP POLICY IF EXISTS "Admin manage reward catalog" ON reward_catalog;

CREATE POLICY "Admin manage reward catalog"
  ON reward_catalog FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
