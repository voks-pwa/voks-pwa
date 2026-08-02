-- Mission Claim Repair (2026-07-31)
-- Fixes production schema drift + hardens the mission claim chain.
-- Idempotent: safe to apply on any environment.
--
-- 1. missions_progress missing `updated_at` in prod (breaks get_mission_analytics)
-- 2. claim_mission_reward recreated: writes wallet_ledger, credits current+lifetime_vxp,
--    sets updated_at, records mission_completions
-- 3. set_profile_completion + update_profile_safe recreated to the latest versions
-- 4. user_favorites table recreated (missing in prod, breaks favorites + analytics)
-- 5. get_mission_analytics recreated

-- ============================================================
-- 1. missions_progress — add updated_at (idempotent)
-- ============================================================
ALTER TABLE missions_progress
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- ============================================================
-- 2. claim_mission_reward — definitive version
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

  v_reference_id := 'mission_' || p_mission_id::TEXT
    || CASE WHEN p_period = 'daily' THEN '_' || CURRENT_DATE::TEXT ELSE '' END;

  INSERT INTO public.wallet_ledger (
    user_id, amount, transaction_type, reference_type, reference_id, description
  ) VALUES (
    p_user_id, p_reward_vxp, 'MISSION_REWARD', 'mission', v_reference_id,
    'Mission: ' || p_mission_id::TEXT || ' (' || p_period || ')'
  );

  INSERT INTO public.mission_completions (user_id, mission_id, reward_vxp)
  VALUES (p_user_id, p_mission_id, p_reward_vxp);

  RETURN jsonb_build_object(
    'success', true,
    'reward', p_reward_vxp,
    'current_vxp', v_current_vxp
  );
END;
$$;

-- ============================================================
-- 3a. set_profile_completion — latest version
-- ============================================================
CREATE OR REPLACE FUNCTION set_profile_completion(
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET profile_completed = true,
      profile_reward_claimed = true
  WHERE id = p_user_id;
END;
$$;

-- ============================================================
-- 3b. update_profile_safe — latest version (with level + badge_name)
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
  UPDATE public.profiles
  SET
    full_name             = COALESCE(p_data->>'full_name', full_name),
    display_name          = COALESCE(p_data->>'display_name', display_name),
    bio                   = COALESCE(p_data->>'bio', bio),
    phone_number          = COALESCE(p_data->>'phone_number', phone_number),
    birthday              = COALESCE((p_data->>'birthday')::DATE, birthday),
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
    level                 = COALESCE((p_data->>'level')::INTEGER, level),
    badge_name            = COALESCE(p_data->>'badge_name', badge_name),
    profile_completed     = COALESCE((p_data->>'profile_completed')::BOOLEAN, profile_completed),
    profile_reward_claimed = COALESCE((p_data->>'profile_reward_claimed')::BOOLEAN, profile_reward_claimed)
  WHERE id = p_user_id
  RETURNING * INTO v_profile;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, full_name, display_name)
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
-- 4. user_favorites — recreate (missing in prod)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('program', 'announcer')),
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_target ON user_favorites(target_type, target_id);

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_favorites' AND policyname = 'Users manage own favorites') THEN
    CREATE POLICY "Users manage own favorites"
      ON user_favorites
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END;
$$;

-- ============================================================
-- 5. get_mission_analytics — recreated (works after updated_at exists)
-- ============================================================
CREATE OR REPLACE FUNCTION get_mission_analytics(p_mission_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_attempts', (SELECT COUNT(*) FROM public.missions_progress WHERE mission_id = p_mission_id),
    'total_completions', (SELECT COUNT(*) FROM public.missions_progress WHERE mission_id = p_mission_id AND completed = true),
    'unique_users', (SELECT COUNT(DISTINCT user_id) FROM public.missions_progress WHERE mission_id = p_mission_id),
    'last_completion', (SELECT MAX(updated_at) FROM public.missions_progress WHERE mission_id = p_mission_id AND completed = true)
  ) INTO result;

  RETURN result;
END;
$$;
