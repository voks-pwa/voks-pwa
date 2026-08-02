-- Fix reward_grants RLS: prod missing the INSERT policy (schema drift).
-- grantReward -> INSERT reward_grants was 403 -> claim chain broke in old code,
-- and idempotency (daily dedup) was disabled.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_grants' AND policyname = 'Users read own reward grants') THEN
    CREATE POLICY "Users read own reward grants"
      ON reward_grants FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_grants' AND policyname = 'Users insert own reward grants') THEN
    CREATE POLICY "Users insert own reward grants"
      ON reward_grants FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END;
$$;
