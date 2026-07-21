-- Sprint D.4: AI & Recommendation
--
-- Tables:
--   1. knowledge_articles — support/content knowledge base
-- RPCs:
--   search_content              — full-text search across knowledge_articles
--   get_popular_reward_ids      — most redeemed reward IDs (enriched by edge fn)
--   get_popular_mission_ids     — most completed mission IDs (enriched by edge fn)
--   get_user_recommendation_ids — personalized recommendation IDs

-- ============================================================
-- 1. knowledge_articles
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ka_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_ka_published ON knowledge_articles(published);

ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ka service role all"
  ON knowledge_articles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ka public read published"
  ON knowledge_articles FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- ============================================================
-- 2. search_content — full-text search across knowledge base
-- ============================================================
CREATE OR REPLACE FUNCTION search_content(p_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_articles JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'content_type', 'knowledge',
      'content_id', id::TEXT,
      'title', title,
      'subtitle', category,
      'excerpt', LEFT(content, 200)
    )
  ), '[]'::JSONB) INTO v_articles
  FROM knowledge_articles
  WHERE published = true
    AND (title ILIKE '%' || p_query || '%' OR content ILIKE '%' || p_query || '%');

  RETURN jsonb_build_object('success', true, 'results', v_articles, 'query', p_query);
END;
$$;

-- ============================================================
-- 3. get_popular_reward_ids — top redeemed reward IDs
-- ============================================================
CREATE OR REPLACE FUNCTION get_popular_reward_ids(p_limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_results JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'reward_id', reward_wp_id,
      'name', reward_name,
      'cost', reward_cost,
      'redeem_count', cnt
    )
  ) INTO v_results
  FROM (
    SELECT reward_wp_id, MAX(reward_name) AS reward_name, MAX(reward_cost) AS reward_cost, COUNT(*) AS cnt
    FROM reward_redemptions
    GROUP BY reward_wp_id
    ORDER BY cnt DESC
    LIMIT p_limit
  ) sub;

  RETURN jsonb_build_object('success', true, 'results', COALESCE(v_results, '[]'::JSONB));
END;
$$;

-- ============================================================
-- 4. get_popular_mission_ids — most completed mission IDs
-- ============================================================
CREATE OR REPLACE FUNCTION get_popular_mission_ids(p_limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_results JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'mission_id', mission_id,
      'completion_count', cnt
    )
  ) INTO v_results
  FROM (
    SELECT mission_id, COUNT(*) AS cnt
    FROM missions_progress
    WHERE completed = true
    GROUP BY mission_id
    ORDER BY cnt DESC
    LIMIT p_limit
  ) sub;

  RETURN jsonb_build_object('success', true, 'results', COALESCE(v_results, '[]'::JSONB));
END;
$$;

-- ============================================================
-- 5. get_user_recommendation_ids — personalized recs by user
-- ============================================================
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
    'popular_missions', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object('mission_id', mission_id, 'count', cnt))
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
