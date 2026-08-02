-- Fix mission_completions RLS: prod missing read policy (schema drift).
-- Claim inserts rows (SECURITY DEFINER) but user reads returned empty ->
-- Mission History always empty.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_completions' AND policyname = 'Users can read their own completions') THEN
    CREATE POLICY "Users can read their own completions"
      ON mission_completions FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'mission_completions' AND policyname = 'Service role can manage all completions') THEN
    CREATE POLICY "Service role can manage all completions"
      ON mission_completions FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;
