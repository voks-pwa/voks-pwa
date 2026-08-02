-- ROADMAP Task 1e/1f: allow level + badge_name sync via update_profile_safe

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
