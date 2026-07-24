-- Fase 2 — Data Integrity & Wallet
-- Contains: 2.5 (stale PENDING recovery), 2.8 (level thresholds),
-- 2.9 (badge thresholds), 2.10 (missing RPCs), 2.13 (wallet_txn_id fix), 2.14 (reward_id FK)

-- ============================================================
-- 2.5: Stale PENDING recovery — expire transactions >5 minutes
-- ============================================================
CREATE OR REPLACE FUNCTION expire_stale_pending()
RETURNS TABLE(expired_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  UPDATE wallet_ledger
  SET status = 'EXPIRED',
      updated_at = now(),
      metadata = COALESCE(metadata, '{}'::jsonb) || '{"expired_by": "stale_recovery", "expired_at": "' || now()::text || '"}'::jsonb
  WHERE status = 'PENDING'
    AND created_at < now() - interval '5 minutes'
    AND transaction_key IS NOT NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$;

-- ============================================================
-- 2.8: Level thresholds — migrate hardcoded LEVELS to DB table
-- ============================================================
CREATE TABLE IF NOT EXISTS xp_levels (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  xp_required INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  rewards JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO xp_levels (level, xp_required, title) VALUES
  (1, 0, 'Newbie'),
  (2, 100, 'Pemula'),
  (3, 250, 'Aktif'),
  (4, 500, 'Antusias'),
  (5, 1000, 'Voks Addict'),
  (6, 2000, 'Penguasa Gelombang'),
  (7, 4000, 'Voks Maniac'),
  (8, 7000, 'Voks VIP'),
  (9, 10000, 'Voks Legend'),
  (10, 15000, 'Voks Elite'),
  (11, 25000, 'Voks Master'),
  (12, 50000, 'Voks Supreme')
ON CONFLICT (level) DO NOTHING;

-- RPC to get all level thresholds
CREATE OR REPLACE FUNCTION get_xp_levels()
RETURNS SETOF public.xp_levels
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.xp_levels ORDER BY level ASC;
$$;

-- RPC to calculate level from lifetime XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(p_lifetime_xp INTEGER)
RETURNS TABLE(level INTEGER, xp_required INTEGER, next_xp_required INTEGER, progress NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_level INTEGER;
  v_current_xp_required INTEGER;
  v_next_xp_required INTEGER;
  v_max_level INTEGER;
BEGIN
  SELECT MAX(level) INTO v_max_level FROM public.xp_levels;

  SELECT lvl.level, lvl.xp_required
  INTO v_current_level, v_current_xp_required
  FROM public.xp_levels lvl
  WHERE lvl.xp_required <= p_lifetime_xp
  ORDER BY lvl.level DESC
  LIMIT 1;

  IF v_current_level IS NULL THEN
    v_current_level := 1;
    v_current_xp_required := 0;
  END IF;

  SELECT xp_required INTO v_next_xp_required
  FROM public.xp_levels
  WHERE level = v_current_level + 1;

  IF v_next_xp_required IS NULL THEN
    v_next_xp_required := v_current_xp_required;
  END IF;

  RETURN QUERY
  SELECT
    v_current_level AS level,
    v_current_xp_required AS xp_required,
    v_next_xp_required AS next_xp_required,
    CASE
      WHEN v_current_level >= v_max_level THEN 100.0
      WHEN v_next_xp_required = v_current_xp_required THEN 0.0
      ELSE ROUND((p_lifetime_xp - v_current_xp_required)::NUMERIC / (v_next_xp_required - v_current_xp_required) * 100, 1)
    END AS progress;
END;
$$;

-- ============================================================
-- 2.9: Badge thresholds — migrate hardcoded badges to DB table
-- ============================================================
CREATE TABLE IF NOT EXISTS xp_badges (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  min_lifetime_vxp INTEGER NOT NULL DEFAULT 0,
  min_role TEXT,
  icon_url TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO xp_badges (slug, title, description, min_lifetime_vxp, sort_order) VALUES
  ('pendatang-baru', 'Pendatang Baru', 'Memulai perjalanan di Voks', 0, 1),
  ('teman-voks', 'Teman Voks', 'Telah mengumpulkan 100 VXP', 100, 2),
  ('voks-aktif', 'Voks Aktif', 'Telah mengumpulkan 500 VXP', 500, 3),
  ('penikmat-frekuensi', 'Penikmat Frekuensi', 'Telah mengumpulkan 750 VXP', 750, 4),
  ('voks-addict', 'Voks Addict', 'Telah mengumpulkan 1000 VXP', 1000, 5),
  ('penguasa-gelombang', 'Penguasa Gelombang', 'Telah mengumpulkan 4000 VXP', 4000, 6),
  ('voks-maniac', 'Voks Maniac', 'Telah mengumpulkan 10000 VXP', 10000, 7),
  ('voks-vip', 'Voks VIP', 'Telah mengumpulkan 25000 VXP', 25000, 8),
  ('voks-legend', 'Voks Legend', 'Telah mengumpulkan 50000 VXP', 50000, 9)
ON CONFLICT (slug) DO NOTHING;

-- Insert role-based badges
INSERT INTO xp_badges (slug, title, description, min_role, sort_order) VALUES
  ('admin', 'Admin', 'Admin Voks', 'admin', 10),
  ('superadmin', 'Super Admin', 'Super Admin Voks', 'superadmin', 11),
  ('announcer', 'Penyiar', 'Penyiar Voks', 'announcer', 12)
ON CONFLICT (slug) DO NOTHING;

-- RPC to get all badge definitions
CREATE OR REPLACE FUNCTION get_xp_badges()
RETURNS SETOF public.xp_badges
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.xp_badges ORDER BY sort_order ASC;
$$;

-- RPC to calculate badge for a user
CREATE OR REPLACE FUNCTION calculate_badge_for_user(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_role TEXT;
  v_lifetime_vxp INTEGER;
  v_badge TEXT;
BEGIN
  SELECT role, lifetime_vxp INTO v_role, v_lifetime_vxp
  FROM public.profiles WHERE id = p_user_id;

  -- Role-based badges take priority
  IF v_role IN ('superadmin', 'admin', 'announcer') THEN
    SELECT title INTO v_badge
    FROM public.xp_badges
    WHERE min_role = v_role
    ORDER BY sort_order ASC
    LIMIT 1;

    IF v_badge IS NOT NULL THEN
      RETURN v_badge;
    END IF;
  END IF;

  -- VXP-based badges
  SELECT title INTO v_badge
  FROM public.xp_badges
  WHERE min_role IS NULL
    AND min_lifetime_vxp <= v_lifetime_vxp
  ORDER BY min_lifetime_vxp DESC
  LIMIT 1;

  RETURN COALESCE(v_badge, 'Pendatang Baru');
END;
$$;

-- ============================================================
-- 2.10: Missing RPCs — get_user_analytics, get_mission_analytics, get_warning_threshold
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_transactions', (SELECT COUNT(*) FROM wallet_ledger WHERE user_id = p_user_id),
    'total_xp_earned', (SELECT COALESCE(SUM(amount), 0) FROM wallet_ledger WHERE user_id = p_user_id AND amount > 0 AND status = 'SUCCESS'),
    'total_xp_spent', (SELECT COALESCE(SUM(ABS(amount)), 0) FROM wallet_ledger WHERE user_id = p_user_id AND amount < 0 AND status = 'SUCCESS'),
    'missions_completed', (SELECT COUNT(*) FROM missions_progress WHERE user_id = p_user_id AND completed = true),
    'rewards_redeemed', (SELECT COUNT(*) FROM reward_redeems WHERE user_id = p_user_id AND status = 'APPROVED'),
    'current_streak', (SELECT COALESCE(current_streak, 0) FROM user_streaks WHERE user_id = p_user_id),
    'badges_earned', (SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id)
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_mission_analytics(p_mission_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_attempts', (SELECT COUNT(*) FROM missions_progress WHERE mission_id = p_mission_id),
    'total_completions', (SELECT COUNT(*) FROM missions_progress WHERE mission_id = p_mission_id AND completed = true),
    'unique_users', (SELECT COUNT(DISTINCT user_id) FROM missions_progress WHERE mission_id = p_mission_id),
    'last_completion', (SELECT MAX(updated_at) FROM missions_progress WHERE mission_id = p_mission_id AND completed = true)
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_warning_threshold()
RETURNS TABLE(
  setting_key TEXT,
  setting_value TEXT,
  threshold_type TEXT,
  description TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT 'VXP_EARNING_DAILY_CAP', setting_value, 'soft_limit', 'Daily earning cap for VXP'
  FROM public.economy_settings WHERE setting_key = 'VXP_EARNING_DAILY_CAP'
  UNION ALL
  SELECT 'VXP_SPENDING_DAILY_CAP', setting_value, 'soft_limit', 'Daily spending cap for VXP'
  FROM public.economy_settings WHERE setting_key = 'VXP_SPENDING_DAILY_CAP'
  UNION ALL
  SELECT 'VXP_MIN_BALANCE_FOR_REDEMPTION', setting_value, 'hard_limit', 'Minimum balance required for redemption'
  FROM public.economy_settings WHERE setting_key = 'VXP_MIN_BALANCE_FOR_REDEMPTION'
  UNION ALL
  SELECT 'STREAK_BREAK_ALLOWANCE', setting_value, 'soft_limit', 'Allowed streak breaks before reset'
  FROM public.economy_settings WHERE setting_key = 'STREAK_BREAK_ALLOWANCE';
$$;

-- ============================================================
-- 2.5 (cont): Scheduler integration for expire_stale_pending
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_pending()
RETURNS TABLE(action TEXT, count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_expired BIGINT;
BEGIN
  SELECT expired_count INTO v_expired FROM expire_stale_pending();
  RETURN QUERY SELECT 'expired_stale_pending'::TEXT, v_expired;
END;
$$;

-- ============================================================
-- 2.6: RPC for get_daily_earnings (used by economy engine calculateXP)
-- ============================================================
CREATE OR REPLACE FUNCTION get_daily_earnings(p_user_id UUID, p_date TEXT)
RETURNS TABLE(total BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(amount), 0)::BIGINT
  FROM wallet_ledger
  WHERE user_id = p_user_id
    AND amount > 0
    AND status = 'SUCCESS'
    AND created_at::DATE = p_date::DATE;
END;
$$;

-- ============================================================
-- 2.13: Fix subscription_invoices.wallet_txn_id — INT → BIGINT + FK
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'subscription_invoices'
  ) AND EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'wallet_ledger'
  ) THEN
    ALTER TABLE subscription_invoices
      ALTER COLUMN wallet_txn_id TYPE BIGINT USING wallet_txn_id::BIGINT;

    IF EXISTS (
      SELECT 1 FROM subscription_invoices
      WHERE wallet_txn_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM wallet_ledger WHERE id = wallet_txn_id)
    ) THEN
      RAISE NOTICE 'Some wallet_txn_id values do not reference existing wallet_ledger entries; FK skipped';
    ELSE
      ALTER TABLE subscription_invoices
        ADD CONSTRAINT fk_subscription_invoices_wallet_txn
        FOREIGN KEY (wallet_txn_id)
        REFERENCES wallet_ledger(id)
        ON DELETE SET NULL;
    END IF;
  ELSE
    RAISE NOTICE 'subscription_invoices table does not exist; skipping 2.13';
  END IF;
END;
$$;

-- ============================================================
-- 2.14: Fix reward_redeems.reward_id — add FK to reward_catalog
-- ============================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'reward_redeems'
  ) AND EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'reward_catalog'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM reward_redeems rr
      WHERE NOT EXISTS (SELECT 1 FROM reward_catalog rc WHERE rc.id = rr.reward_id)
    ) THEN
      RAISE NOTICE 'Some reward_redeems.reward_id values do not reference existing reward_catalog entries; FK skipped';
    ELSE
      ALTER TABLE reward_redeems
        ADD CONSTRAINT fk_reward_redeems_reward_catalog
        FOREIGN KEY (reward_id)
        REFERENCES reward_catalog(id)
        ON DELETE RESTRICT;
    END IF;
  ELSE
    RAISE NOTICE 'reward_redeems or reward_catalog table does not exist; skipping 2.14';
  END IF;
END;
$$;
