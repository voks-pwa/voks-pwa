-- Fix get_user_recommendation_ids: dangling '[]'::JSONB outside COALESCE
-- The original had popular_missions wrapped incorrectly:
--   (SELECT COALESCE(jsonb_agg(...) FROM (...) pop), '[]'::JSONB)
-- Fixed:
--   COALESCE((SELECT jsonb_agg(...) FROM (...) pop), '[]'::JSONB)

DROP FUNCTION IF EXISTS get_user_recommendation_ids(UUID, INT);

CREATE OR REPLACE FUNCTION get_user_recommendation_ids(p_user_id UUID, p_limit INT DEFAULT 5)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_completed_missions BIGINT[];
  v_redeemed_rewards BIGINT[];
  v_recs JSONB;
BEGIN
  -- Get user's completed mission IDs
  SELECT ARRAY_AGG(mission_id) INTO v_completed_missions
  FROM missions_progress
  WHERE user_id = p_user_id AND completed = true;

  -- Get user's redeemed reward WP IDs
  SELECT ARRAY_AGG(reward_wp_id) INTO v_redeemed_rewards
  FROM reward_redemptions
  WHERE user_id = p_user_id;

  -- Find missions completed by users who did the same missions (collaborative)
  SELECT jsonb_build_object(
    'recommended_missions', COALESCE(
      (SELECT jsonb_agg(DISTINCT mp2.mission_id)
       FROM missions_progress mp2
       WHERE mp2.user_id IN (
         SELECT DISTINCT mp1.user_id
         FROM missions_progress mp1
         WHERE mp1.mission_id = ANY(v_completed_missions)
           AND mp1.user_id != p_user_id
       )
       AND mp2.completed = true
       AND mp2.mission_id != ALL(COALESCE(v_completed_missions, '{}'::BIGINT[]))
       LIMIT p_limit),
      '[]'::JSONB
    ),
    'popular_missions', COALESCE(
      (SELECT jsonb_agg(jsonb_build_object('mission_id', mission_id, 'count', cnt))
       FROM (
         SELECT mission_id, COUNT(*) AS cnt
         FROM missions_progress
         WHERE completed = true
         GROUP BY mission_id
         ORDER BY cnt DESC
         LIMIT 3
       ) pop),
      '[]'::JSONB
    ),
    'redeemed_count', COALESCE(array_length(v_redeemed_rewards, 1), 0)
  ) INTO v_recs;

  RETURN jsonb_build_object('success', true, 'data', v_recs);
END;
$$;
