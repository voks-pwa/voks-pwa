-- Fix B2: claim_mission_reward harus graceful saat amount = 0
-- amount 0 (mis. daily earning cap tercapai) sebelumnya INSERT wallet_ledger amount=0
-- -> violate CHECK (amount != 0) -> RPC error -> claim gagal + misi terkunci (reward_grants keburu tercatat).
-- Sekarang: skip wallet_ledger bila amount 0, tetap tandai claimed + record mission_completions.

CREATE OR REPLACE FUNCTION claim_mission_reward(
  p_user_id UUID,
  p_mission_id BIGINT,
  p_reward_vxp INTEGER,
  p_period TEXT DEFAULT 'once'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_progress RECORD;
  v_current_vxp INTEGER;
  v_reference_id TEXT;
BEGIN
  SELECT * INTO v_progress
  FROM public.missions_progress
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

  UPDATE public.missions_progress
  SET claimed = true,
      claimed_at = now(),
      mission_state = 'CLAIMED',
      updated_at = now()
  WHERE id = v_progress.id;

  UPDATE public.profiles
  SET current_vxp = current_vxp + p_reward_vxp,
      lifetime_vxp = lifetime_vxp + p_reward_vxp
  WHERE id = p_user_id
  RETURNING current_vxp INTO v_current_vxp;

  IF p_reward_vxp > 0 THEN
    v_reference_id := 'mission_' || p_mission_id::TEXT
      || CASE WHEN p_period = 'daily' THEN '_' || CURRENT_DATE::TEXT ELSE '' END;

    INSERT INTO public.wallet_ledger (
      user_id, amount, transaction_type, reference_type, reference_id, description
    ) VALUES (
      p_user_id, p_reward_vxp, 'MISSION_REWARD', 'mission', v_reference_id,
      'Mission: ' || p_mission_id::TEXT || ' (' || p_period || ')'
    );
  END IF;

  INSERT INTO public.mission_completions (user_id, mission_id, reward_vxp)
  VALUES (p_user_id, p_mission_id, p_reward_vxp);

  RETURN jsonb_build_object(
    'success', true,
    'reward', p_reward_vxp,
    'current_vxp', v_current_vxp
  );
END;
$$;
