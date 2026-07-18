-- Sprint 9: Mission Engine V2
-- State machine, anti-double-claim, period tracking

ALTER TABLE missions_progress
  ADD COLUMN IF NOT EXISTS mission_state TEXT NOT NULL DEFAULT 'AVAILABLE',
  ADD COLUMN IF NOT EXISTS period TEXT NOT NULL DEFAULT 'once',
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_missions_progress_state ON missions_progress(mission_state);
CREATE INDEX IF NOT EXISTS idx_missions_progress_period ON missions_progress(period);

-- Anti-double-claim RPC (transaction-safe)
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
BEGIN
  -- Lock the progress row to prevent race conditions
  SELECT * INTO v_progress
  FROM missions_progress
  WHERE user_id = p_user_id AND mission_id = p_mission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission not joined');
  END IF;

  IF NOT v_progress.completed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission not completed');
  END IF;

  IF v_progress.claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward already claimed');
  END IF;

  -- Update progress
  UPDATE missions_progress
  SET
    claimed = true,
    claimed_at = now(),
    mission_state = 'CLAIMED'
  WHERE id = v_progress.id;

  -- Award VXP
  UPDATE profiles
  SET current_vxp = current_vxp + p_reward_vxp
  WHERE id = p_user_id
  RETURNING current_vxp INTO v_current_vxp;

  -- Record completion
  INSERT INTO mission_completions (user_id, mission_id, reward_vxp)
  VALUES (p_user_id, p_mission_id, p_reward_vxp);

  RETURN jsonb_build_object(
    'success', true,
    'reward', p_reward_vxp,
    'current_vxp', v_current_vxp
  );
END;
$$;

-- Migrate existing data: set mission_state based on current boolean fields
UPDATE missions_progress
SET mission_state = CASE
  WHEN claimed THEN 'CLAIMED'
  WHEN completed THEN 'READY_TO_CLAIM'
  ELSE 'IN_PROGRESS'
  END
WHERE mission_state = 'AVAILABLE';
