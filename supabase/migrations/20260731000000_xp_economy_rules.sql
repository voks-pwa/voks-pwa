-- Sprint C.1: XP Economy Rules
--
-- Adds:
--   1. xp_rules table — master XP rules per source
--   2. xp_multipliers table — global/event/VIP/level multipliers
--   3. economy_settings table — global economy config
--   4. Seed all current XP rules from business modules
--   5. Seed default multipliers

-- ============================================================
-- 1. xp_rules — master XP rules
-- ============================================================
CREATE TABLE IF NOT EXISTS xp_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT '',
  base_xp INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  cooldown_minutes INTEGER,
  daily_limit INTEGER,
  weekly_limit INTEGER,
  monthly_limit INTEGER,
  minimum_level INTEGER,
  maximum_level INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_rules_source ON xp_rules(source);
CREATE INDEX IF NOT EXISTS idx_xp_rules_enabled ON xp_rules(enabled);

ALTER TABLE xp_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_rules readable by authenticated"
  ON xp_rules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "xp_rules writable by service_role"
  ON xp_rules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. xp_multipliers — multiplier rules
-- ============================================================
CREATE TABLE IF NOT EXISTS xp_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  multiplier NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  type TEXT NOT NULL DEFAULT 'global' CHECK (type IN ('global', 'event', 'vip', 'campaign', 'holiday', 'weekend', 'level')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_xp_multipliers_type ON xp_multipliers(type);
CREATE INDEX IF NOT EXISTS idx_xp_multipliers_enabled ON xp_multipliers(enabled);

ALTER TABLE xp_multipliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "xp_multipliers readable by authenticated"
  ON xp_multipliers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "xp_multipliers writable by service_role"
  ON xp_multipliers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. economy_settings — global economy key-value config
-- ============================================================
CREATE TABLE IF NOT EXISTS economy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL DEFAULT '',
  setting_type TEXT NOT NULL DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT NOT NULL DEFAULT '',
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE economy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "economy_settings readable by authenticated"
  ON economy_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "economy_settings writable by service_role"
  ON economy_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. Seed: XP Sources (master categories)
-- ============================================================
INSERT INTO xp_rules (slug, title, source, base_xp, priority) VALUES
  ('MISSION_COMPLETE',   'Mission Completion',     'mission',    150, 100),
  ('MISSION_DAILY',     'Daily Mission',           'mission',    50,  90),
  ('MISSION_WEEKLY',    'Weekly Mission',          'mission',    200, 80),
  ('MISSION_MONTHLY',   'Monthly Mission',          'mission',    500, 70),
  ('CAMPAIGN_COMPLETE', 'Campaign Complete',        'campaign',   300, 100),
  ('CAMPAIGN_SHARE',    'Campaign Share',           'campaign',   50,  90),
  ('CAMPAIGN_JOIN',     'Campaign Join',            'campaign',   25,  80),
  ('REFERRAL_INVITE',   'Referral Invite',          'referral',   100, 100),
  ('REFERRAL_REGISTER', 'Referral Register',        'referral',   200, 90),
  ('REFERRAL_FIRST_LOGIN', 'Referral First Login',  'referral',   50,  80),
  ('ACHIEVEMENT_UNLOCK','Achievement Unlock',       'achievement', 100, 100),
  ('BADGE_UNLOCK',      'Badge Unlock',             'badge',      150, 100),
  ('LISTENING_MINUTE',  'Listening Per Minute',     'listening',  2,   100),
  ('LISTENING_HOUR',    'Listening Hour',           'listening',  50,  90),
  ('DAILY_LOGIN',       'Daily Login',              'login',      10,  100),
  ('STREAK_LOGIN',      'Streak Login Bonus',       'login',      5,   90),
  ('REWARD_CASHBACK',   'Reward Cashback',          'reward',     10,  100),
  ('ADMIN_ADJUSTMENT',  'Admin Adjustment',         'admin',      0,   100),
  ('ADMIN_BONUS',       'Admin Bonus',              'admin',      100, 90)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. Seed: Milestone XP Rules (from milestoneCatalog.ts)
-- ============================================================
INSERT INTO xp_rules (slug, title, source, base_xp, priority) VALUES
  ('MILESTONE_xp_100',           'Reach 100 XP',          'milestone', 20,  100),
  ('MILESTONE_xp_500',           'Reach 500 XP',          'milestone', 50,  90),
  ('MILESTONE_xp_1000',          'Reach 1000 XP',         'milestone', 100, 80),
  ('MILESTONE_xp_5000',          'Reach 5000 XP',         'milestone', 300, 70),
  ('MILESTONE_xp_10000',         'Reach 10000 XP',        'milestone', 600, 60),
  ('MILESTONE_missions_10',      'Complete 10 Missions',  'milestone', 50,  100),
  ('MILESTONE_missions_25',      'Complete 25 Missions',  'milestone', 120, 90),
  ('MILESTONE_missions_100',     'Complete 100 Missions', 'milestone', 400, 80),
  ('MILESTONE_referrals_10',     'Get 10 Referrals',      'milestone', 200, 100),
  ('MILESTONE_shares_50',        'Share 50 Times',        'milestone', 150, 100),
  ('MILESTONE_listening_100h',   'Listen 100 Hours',      'milestone', 250, 100),
  ('MILESTONE_profile_complete', 'Complete Profile',      'milestone', 30,  100)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 6. Seed: Achievement XP Rules (from achievementCatalog.ts)
-- ============================================================
INSERT INTO xp_rules (slug, title, source, base_xp, priority) VALUES
  ('ACHIEVEMENT_profile_identity',   'Profile Identity',        'achievement', 50,  100),
  ('ACHIEVEMENT_social_butterfly',   'Social Butterfly',        'achievement', 80,  90),
  ('ACHIEVEMENT_connector',          'Connector',               'achievement', 60,  80),
  ('ACHIEVEMENT_networker',          'Networker',               'achievement', 200, 70),
  ('ACHIEVEMENT_listener_1',         'Listener Level 1',        'achievement', 50,  100),
  ('ACHIEVEMENT_listener_2',         'Listener Level 2',        'achievement', 150, 90),
  ('ACHIEVEMENT_daily_devotion',     'Daily Devotion',          'achievement', 100, 100),
  ('ACHIEVEMENT_mission_runner',     'Mission Runner',          'achievement', 120, 100)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. Seed: Default Multipliers
-- ============================================================
INSERT INTO xp_multipliers (slug, title, multiplier, type, enabled, priority) VALUES
  ('global-default', 'Global Default', 1.0, 'global', true, 1),
  ('weekend-bonus',  'Weekend 2x',      2.0, 'weekend', true, 10),
  ('vip-bonus',      'VIP 1.5x',       1.5, 'vip', true, 20),
  ('level-bonus',    'Level per-10',   0.1, 'level', true, 30)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 8. Seed: Economy Settings
-- ============================================================
INSERT INTO economy_settings (setting_key, setting_value, setting_type, description) VALUES
  ('global_multiplier',         '1.0',   'number', 'Global XP multiplier applied to all sources'),
  ('login_daily_max_xp',        '50',    'number', 'Maximum XP per daily login'),
  ('login_streak_increment',    '5',     'number', 'XP increment per consecutive login streak day'),
  ('login_streak_bonus_threshold', '7', 'number', 'Days of streak before bonus kicks in'),
  ('xp_calculation_version',    '1',     'number', 'Economy engine version for future migration')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================================
-- 9. admin_update_xp_rule — update a rule by slug
-- ============================================================
CREATE OR REPLACE FUNCTION admin_update_xp_rule(
  p_slug TEXT,
  p_updates JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE xp_rules
  SET
    base_xp = COALESCE((p_updates->>'base_xp')::INTEGER, base_xp),
    enabled = COALESCE((p_updates->>'enabled')::BOOLEAN, enabled),
    title = COALESCE(p_updates->>'title', title),
    daily_limit = COALESCE((p_updates->>'daily_limit')::INTEGER, daily_limit),
    weekly_limit = COALESCE((p_updates->>'weekly_limit')::INTEGER, weekly_limit),
    monthly_limit = COALESCE((p_updates->>'monthly_limit')::INTEGER, monthly_limit),
    minimum_level = COALESCE((p_updates->>'minimum_level')::INTEGER, minimum_level),
    maximum_level = COALESCE((p_updates->>'maximum_level')::INTEGER, maximum_level),
    cooldown_minutes = COALESCE((p_updates->>'cooldown_minutes')::INTEGER, cooldown_minutes),
    updated_at = now()
  WHERE slug = p_slug;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 10. admin_update_multiplier — update a multiplier by slug
-- ============================================================
CREATE OR REPLACE FUNCTION admin_update_multiplier(
  p_slug TEXT,
  p_updates JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE xp_multipliers
  SET
    multiplier = COALESCE((p_updates->>'multiplier')::NUMERIC, multiplier),
    enabled = COALESCE((p_updates->>'enabled')::BOOLEAN, enabled),
    title = COALESCE(p_updates->>'title', title),
    start_date = COALESCE((p_updates->>'start_date')::TIMESTAMPTZ, start_date),
    end_date = COALESCE((p_updates->>'end_date')::TIMESTAMPTZ, end_date),
    updated_at = now()
  WHERE slug = p_slug;

  RETURN jsonb_build_object('success', true);
END;
$$;
