-- Sprint 9: Retention Engine v1.0
-- Adds tables for Badge, Milestone, Daily Login Reward, and progress tracking
-- for user achievements. Designed to sit on top of the frozen Mission Engine.

-- ============================================================
-- user_achievements: add progress column (draft table predates it)
-- ============================================================

ALTER TABLE user_achievements
  ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0;

-- ============================================================
-- user_badges: permanent, automatically granted badges
-- ============================================================

CREATE TABLE IF NOT EXISTS user_badges (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT,
  source TEXT NOT NULL DEFAULT 'achievement',
  source_id BIGINT,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages badges"
  ON user_badges FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- user_milestones: threshold-based milestones
-- ============================================================

CREATE TABLE IF NOT EXISTS user_milestones (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  metric TEXT NOT NULL,
  threshold_value INTEGER NOT NULL,
  reward_vxp INTEGER NOT NULL DEFAULT 0,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_key)
);

CREATE INDEX IF NOT EXISTS idx_user_milestones_user ON user_milestones(user_id);

ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own milestones"
  ON user_milestones FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages milestones"
  ON user_milestones FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- user_login_rewards: daily login reward (once per day)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_login_rewards (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_date DATE NOT NULL,
  streak_day INTEGER NOT NULL DEFAULT 1,
  reward_vxp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, reward_date)
);

CREATE INDEX IF NOT EXISTS idx_user_login_rewards_user ON user_login_rewards(user_id);

ALTER TABLE user_login_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own login rewards"
  ON user_login_rewards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own login rewards"
  ON user_login_rewards FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role manages login rewards"
  ON user_login_rewards FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
