CREATE OR REPLACE FUNCTION redeem_reward(
  p_user_id UUID,
  p_reward_wp_id BIGINT,
  p_reward_slug TEXT,
  p_reward_name TEXT,
  p_reward_cost INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO reward_redemptions (user_id, reward_wp_id, reward_slug, reward_name, reward_cost)
  VALUES (p_user_id, p_reward_wp_id, p_reward_slug, p_reward_name, p_reward_cost)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
