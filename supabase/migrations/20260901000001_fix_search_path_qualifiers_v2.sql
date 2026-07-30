-- Fix v2: qualify all table references in functions with SET search_path = ''
-- 7 functions across 2 migration files had unqualified table names

-- ============================================================
-- From 20260822000004_marketplace_integrity.sql
-- ============================================================

CREATE OR REPLACE FUNCTION release_stale_locks()
RETURNS TABLE(released_orders BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  UPDATE public.marketplace_orders
  SET order_status = 'CANCELLED',
      updated_at = now()
  WHERE order_status = 'PENDING'
    AND updated_at < now() - interval '15 minutes';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$;

CREATE OR REPLACE FUNCTION sync_inventory_to_reward(p_product_id UUID, p_new_stock INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_reward_id INTEGER;
BEGIN
  SELECT reward_id INTO v_reward_id
  FROM public.marketplace_products
  WHERE id = p_product_id AND reward_id IS NOT NULL;

  IF v_reward_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.reward_inventory
  SET current_stock = p_new_stock,
      updated_at = now()
  WHERE reward_id = v_reward_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION sync_voucher_to_reward_pool(p_voucher_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_product_id UUID;
  v_reward_id INTEGER;
  v_voucher RECORD;
BEGIN
  SELECT product_id, voucher_code, status, assigned_user, expired_at
  INTO v_product_id, v_voucher.voucher_code, v_voucher.status, v_voucher.assigned_user, v_voucher.expired_at
  FROM public.marketplace_voucher_pool
  WHERE id = p_voucher_id;

  IF v_product_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT reward_id INTO v_reward_id
  FROM public.marketplace_products
  WHERE id = v_product_id AND reward_id IS NOT NULL;

  IF v_reward_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.reward_voucher_pool (reward_id, voucher_code, status, assigned_user, expired_at)
  VALUES (v_reward_id, v_voucher.voucher_code, v_voucher.status, v_voucher.assigned_user, v_voucher.expired_at)
  ON CONFLICT (voucher_code) DO NOTHING;

  RETURN FOUND;
END;
$$;

-- ============================================================
-- From 20260829000000_fix_rls_mission.sql
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

CREATE OR REPLACE FUNCTION set_referred_by(
  p_user_id UUID,
  p_referrer_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
  SET referred_by = p_referrer_id
  WHERE id = p_user_id;
END;
$$;

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
  SET claimed = true, claimed_at = now(), mission_state = 'CLAIMED'
  WHERE id = v_progress.id;

  UPDATE public.profiles
  SET current_vxp = current_vxp + p_reward_vxp,
      lifetime_vxp = lifetime_vxp + p_reward_vxp
  WHERE id = p_user_id
  RETURNING current_vxp INTO v_current_vxp;

  INSERT INTO public.mission_completions (user_id, mission_id, reward_vxp)
  VALUES (p_user_id, p_mission_id, p_reward_vxp);

  RETURN jsonb_build_object(
    'success', true,
    'reward', p_reward_vxp,
    'current_vxp', v_current_vxp
  );
END;
$$;
