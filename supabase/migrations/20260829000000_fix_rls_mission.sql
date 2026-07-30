-- Phase 0: Fix RLS — System update via SECURITY DEFINER RPC
-- Bypass RLS untuk update kolom yang perlu diubah oleh system
-- (referral_code, referred_by, profile_completed, profile_reward_claimed, lifetime_vxp)

-- ============================================================
-- RPC 1: Update profile safe (bypass RLS)
-- Digunakan oleh: profileRepository.ts
-- ============================================================
CREATE OR REPLACE FUNCTION update_profile_safe(
  p_user_id UUID,
  p_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  UPDATE profiles
  SET
    full_name             = COALESCE(p_data->>'full_name', full_name),
    display_name          = COALESCE(p_data->>'display_name', display_name),
    bio                   = COALESCE(p_data->>'bio', bio),
    phone_number          = COALESCE(p_data->>'phone_number', phone_number),
    birthday              = COALESCE(p_data->>'birthday', birthday),
    gender                = COALESCE(p_data->>'gender', gender),
    city                  = COALESCE(p_data->>'city', city),
    province              = COALESCE(p_data->>'province', province),
    favorite_program      = COALESCE(p_data->>'favorite_program', favorite_program),
    favorite_music        = COALESCE(p_data->>'favorite_music', favorite_music),
    instagram             = COALESCE(p_data->>'instagram', instagram),
    tiktok                = COALESCE(p_data->>'tiktok', tiktok),
    youtube               = COALESCE(p_data->>'youtube', youtube),
    facebook              = COALESCE(p_data->>'facebook', facebook),
    threads               = COALESCE(p_data->>'threads', threads),
    website               = COALESCE(p_data->>'website', website),
    avatar_url            = COALESCE(p_data->>'avatar_url', avatar_url),
    avatar_asset_id       = COALESCE((p_data->>'avatar_asset_id')::UUID, avatar_asset_id),
    email                 = COALESCE(p_data->>'email', email),
    referral_code         = COALESCE(p_data->>'referral_code', referral_code),
    profile_completed     = COALESCE((p_data->>'profile_completed')::BOOLEAN, profile_completed),
    profile_reward_claimed = COALESCE((p_data->>'profile_reward_claimed')::BOOLEAN, profile_reward_claimed)
  WHERE id = p_user_id
  RETURNING * INTO v_profile;

  IF NOT FOUND THEN
    INSERT INTO profiles (id, email, full_name, display_name)
    VALUES (
      p_user_id,
      COALESCE(p_data->>'email', ''),
      COALESCE(p_data->>'full_name', ''),
      COALESCE(p_data->>'display_name', '')
    )
    RETURNING * INTO v_profile;
  END IF;

  RETURN row_to_json(v_profile)::JSONB;
END;
$$;

-- ============================================================
-- RPC 2: Set referred_by (bypass RLS)
-- Digunakan oleh: authService.ts (processReferralAfterLogin)
-- ============================================================
CREATE OR REPLACE FUNCTION set_referred_by(
  p_user_id UUID,
  p_referrer_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE profiles
  SET referred_by = p_referrer_id
  WHERE id = p_user_id;
END;
$$;

-- ============================================================
-- RPC 3: Set profile completion flags (bypass RLS)
-- Digunakan oleh: profileService.ts, authService.ts (checkAndFireProfileCompletion)
-- ============================================================
CREATE OR REPLACE FUNCTION set_profile_completion(
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE profiles
  SET profile_completed = true,
      profile_reward_claimed = true
  WHERE id = p_user_id;
END;
$$;

-- ============================================================
-- RPC 4: claim_mission_reward — FIX tambah lifetime_vxp
-- Override semua definisi sebelumnya (ada di 3 file migration)
-- ============================================================
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
BEGIN
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

  UPDATE missions_progress
  SET claimed = true, claimed_at = now(), mission_state = 'CLAIMED'
  WHERE id = v_progress.id;

  -- ★ FIX: Update lifetime_vxp juga
  UPDATE profiles
  SET current_vxp = current_vxp + p_reward_vxp,
      lifetime_vxp = lifetime_vxp + p_reward_vxp
  WHERE id = p_user_id
  RETURNING current_vxp INTO v_current_vxp;

  INSERT INTO mission_completions (user_id, mission_id, reward_vxp)
  VALUES (p_user_id, p_mission_id, p_reward_vxp);

  RETURN jsonb_build_object(
    'success', true,
    'reward', p_reward_vxp,
    'current_vxp', v_current_vxp
  );
END;
$$;
