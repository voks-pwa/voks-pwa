-- Sprint 8.5: Mission Foundation
-- Remove JOINED state, add HISTORY support
-- Profile auto-claim integration

-- Ensure mission_state values are clean (remove JOINED)
UPDATE missions_progress
SET mission_state = 'AVAILABLE'
WHERE mission_state = 'JOINED';

-- Allow claimed_at to be set by the system for auto-claim
ALTER TABLE missions_progress
  ALTER COLUMN mission_state SET DEFAULT 'AVAILABLE';

-- Add index for easier state filtering
CREATE INDEX IF NOT EXISTS idx_missions_progress_state_filter
  ON missions_progress(mission_state)
  WHERE mission_state IN ('AVAILABLE', 'IN_PROGRESS', 'READY_TO_CLAIM');

-- Update RPC to handle auto-claim (allow claiming without progress row)
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
BEGIN
  -- Try to find existing progress row
  SELECT * INTO v_progress
  FROM missions_progress
  WHERE user_id = p_user_id AND mission_id = p_mission_id
  FOR UPDATE;

  -- If no progress row exists, create one (auto-claim path)
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

  -- Validate state
  IF NOT v_created THEN
    IF v_progress.claimed THEN
      RETURN jsonb_build_object('success', false, 'error', 'Reward already claimed');
    END IF;

    IF NOT v_progress.completed THEN
      RETURN jsonb_build_object('success', false, 'error', 'Mission not completed');
    END IF;

    -- Update existing progress to CLAIMED
    UPDATE missions_progress
    SET
      claimed = true,
      claimed_at = now(),
      mission_state = 'CLAIMED'
    WHERE id = v_progress.id;
  END IF;

  -- Award VXP
  UPDATE profiles
  SET current_vxp = current_vxp + p_reward_vxp
  WHERE id = p_user_id
  RETURNING current_vxp INTO v_current_vxp;

  -- Record in wallet ledger
  INSERT INTO wallet_ledger (user_id, amount, transaction_type, reference_type, reference_id, description)
  VALUES (p_user_id, p_reward_vxp, 'MISSION_REWARD', 'mission', p_mission_id::TEXT, 'Mission reward');

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
