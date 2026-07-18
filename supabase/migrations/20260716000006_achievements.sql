-- Sprint 17 (draft): Achievement / Badge Engine
-- Initial schema for earnable achievements + user tracking.
-- DRAFT ONLY: not yet wired into app logic (Step 5 prep).

-- Achievement catalog (source: WordPress CPT or seed)
CREATE TABLE IF NOT EXISTS achievements (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  badge_name TEXT,
  tier TEXT NOT NULL DEFAULT 'bronze'
    CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  reward_vxp INTEGER NOT NULL DEFAULT 0,
  trigger_type TEXT NOT NULL DEFAULT 'mission'
    CHECK (trigger_type IN ('mission', 'streak', 'share', 'referral', 'profile', 'listen', 'custom')),
  trigger_key TEXT,
  target_value INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_achievements_slug ON achievements(slug);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(active);

-- User earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reward_vxp INTEGER NOT NULL DEFAULT 0,
  seen BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_ach ON user_achievements(achievement_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read achievement catalog"
  ON achievements FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Users read own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages achievements"
  ON achievements FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role manages user achievements"
  ON user_achievements FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
