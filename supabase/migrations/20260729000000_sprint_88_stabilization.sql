-- Sprint 8.8: Mission Engine Stabilization
-- 1. Wallet traceability: better descriptions in claim_mission_reward
-- 2. Ensure referrals table has minimal schema

-- ============================================================
-- 1. Wallet Traceability: Update claim_mission_reward RPC
--    Adds mission title to wallet ledger description
-- ============================================================
CREATE OR REPLACE FUNCTION claim_mission_reward(
  p_user_id UUID,
  p_mission_id BIGINT,
  p_reward_vxp INTEGER,
  p_period TEXT DEFAULT 'once'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress RECORD;
  v_current_vxp INTEGER;
  v_created BOOLEAN := false;
  v_reference_id TEXT;
BEGIN
  SELECT * INTO v_progress
  FROM missions_progress
  WHERE user_id = p_user_id AND mission_id = p_mission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO missions_progress (
      user_id, mission_id, progress, completed, completed_at,
      claimed, claimed_at, mission_state, period
    ) VALUES (
      p_user_id, p_mission_id, 1, true, now(),
      true, now(), 'CLAIMED', p_period
    )
    RETURNING * INTO v_progress;
    v_created := true;
  END IF;

  IF NOT v_created THEN
    IF v_progress.claimed THEN
      RETURN jsonb_build_object('success', false, 'error', 'Reward already claimed');
    END IF;

    IF NOT v_progress.completed THEN
      RETURN jsonb_build_object('success', false, 'error', 'Mission not completed');
    END IF;

    UPDATE missions_progress
    SET
      claimed = true,
      claimed_at = now(),
      mission_state = 'CLAIMED'
    WHERE id = v_progress.id;
  END IF;

  UPDATE profiles
  SET current_vxp = current_vxp + p_reward_vxp
  WHERE id = p_user_id
  RETURNING current_vxp INTO v_current_vxp;

  v_reference_id := 'mission_' || p_mission_id::TEXT;

  INSERT INTO wallet_ledger (user_id, amount, transaction_type, reference_type, reference_id, description)
  VALUES (
    p_user_id,
    p_reward_vxp,
    'MISSION_REWARD',
    'mission',
    v_reference_id,
    'Mission: ' || p_mission_id::TEXT || ' (' || p_period || ')'
  );

  INSERT INTO mission_completions (user_id, mission_id, reward_vxp)
  VALUES (p_user_id, p_mission_id, p_reward_vxp);

  RETURN jsonb_build_object(
    'success', true,
    'reward', p_reward_vxp,
    'current_vxp', v_current_vxp
  );
END;
$$;

-- ============================================================
-- 2. Referrals table — ensure schema exists
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_reward ON referrals(referrer_id, reward_granted);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'Users read own referrals') THEN
    CREATE POLICY "Users read own referrals"
      ON referrals FOR SELECT
      TO authenticated
      USING (referrer_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'Users insert own referrals') THEN
    CREATE POLICY "Users insert own referrals"
      ON referrals FOR INSERT
      TO authenticated
      WITH CHECK (referrer_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referrals' AND policyname = 'Service role manages referrals') THEN
    CREATE POLICY "Service role manages referrals"
      ON referrals FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END;
$$;
