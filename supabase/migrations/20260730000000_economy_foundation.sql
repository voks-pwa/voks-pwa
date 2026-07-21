-- Sprint C.0: Economy Foundation
--
-- Adds:
--   1. currency_type column on wallet_ledger (default 'VXP')
--   2. economy_config table — key-value store for economy rules
--   3. economy_spending_limits — per-user period caps
--   4. balance_snapshots — periodic balance snapshots
--   5. RPCs: get_economy_config, check_spending_limit, log_spending, snapshot_balance

-- ============================================================
-- 1. Currency type on wallet_ledger (non-breaking ADD column)
-- ============================================================
ALTER TABLE wallet_ledger
  ADD COLUMN IF NOT EXISTS currency_type TEXT NOT NULL DEFAULT 'VXP';

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_currency
  ON wallet_ledger(user_id, currency_type);

-- ============================================================
-- 2. economy_config — key-value store for economy rules
-- ============================================================
CREATE TABLE IF NOT EXISTS economy_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE economy_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Economy config readable by authenticated"
  ON economy_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Economy config writable by service_role"
  ON economy_config FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Economy config updatable by service_role"
  ON economy_config FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seed default economy config
INSERT INTO economy_config (key, value, description) VALUES
  ('CURRENCIES', '["VXP"]', 'Supported currency types'),
  ('VXP_EARNING_DAILY_CAP', '200', 'Max VXP earnable per user per day (across all sources)'),
  ('VXP_SPENDING_DAILY_CAP', '500', 'Max VXP spendable per user per day'),
  ('VXP_SPENDING_WEEKLY_CAP', '2000', 'Max VXP spendable per user per week'),
  ('VXP_SPENDING_MONTHLY_CAP', '8000', 'Max VXP spendable per user per month'),
  ('VXP_MIN_BALANCE_FOR_REDEMPTION', '100', 'Minimum VXP balance before redeeming rewards'),
  ('ECONOMY_VERSION', '1', 'Economy schema version for future migrations')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. economy_spending_limits — per-user period caps
-- ============================================================
CREATE TABLE IF NOT EXISTS economy_spending_limits (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_type TEXT NOT NULL DEFAULT 'VXP',
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  period_start DATE NOT NULL,
  amount_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_spending_limits_unique
  ON economy_spending_limits(user_id, currency_type, period, period_start);

CREATE INDEX IF NOT EXISTS idx_spending_limits_user
  ON economy_spending_limits(user_id);

ALTER TABLE economy_spending_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spending limits readable by own user"
  ON economy_spending_limits FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Spending limits writable by service_role"
  ON economy_spending_limits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. balance_snapshots — periodic snapshots for analytics
-- ============================================================
CREATE TABLE IF NOT EXISTS balance_snapshots (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  currency_type TEXT NOT NULL DEFAULT 'VXP',
  balance INTEGER NOT NULL,
  lifetime_earned INTEGER NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_balance_snapshots_user
  ON balance_snapshots(user_id, snapshot_date DESC);

ALTER TABLE balance_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Snapshots readable by own user"
  ON balance_snapshots FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Snapshots writable by service_role"
  ON balance_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 5. get_economy_config — return all config as JSON
-- ============================================================
CREATE OR REPLACE FUNCTION get_economy_config()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_config JSONB;
BEGIN
  SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb)
  INTO v_config
  FROM economy_config;

  RETURN jsonb_build_object('success', true, 'config', v_config);
END;
$$;

-- ============================================================
-- 6. check_spending_limit — validates a proposed spend
-- ============================================================
CREATE OR REPLACE FUNCTION check_spending_limit(
  p_user_id UUID,
  p_amount INTEGER,
  p_currency_type TEXT DEFAULT 'VXP'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_daily_cap INTEGER;
  v_weekly_cap INTEGER;
  v_monthly_cap INTEGER;
  v_daily_spent INTEGER;
  v_weekly_spent INTEGER;
  v_monthly_spent INTEGER;
  v_today DATE;
  v_week_start DATE;
  v_month_start DATE;
BEGIN
  -- Load caps from config
  SELECT COALESCE((SELECT (value #>> '{}')::INTEGER FROM economy_config WHERE key = 'VXP_SPENDING_DAILY_CAP'), 500) INTO v_daily_cap;
  SELECT COALESCE((SELECT (value #>> '{}')::INTEGER FROM economy_config WHERE key = 'VXP_SPENDING_WEEKLY_CAP'), 2000) INTO v_weekly_cap;
  SELECT COALESCE((SELECT (value #>> '{}')::INTEGER FROM economy_config WHERE key = 'VXP_SPENDING_MONTHLY_CAP'), 8000) INTO v_monthly_cap;

  v_today := CURRENT_DATE;
  v_week_start := date_trunc('week', CURRENT_DATE)::DATE;
  v_month_start := date_trunc('month', CURRENT_DATE)::DATE;

  -- Calculate current spending from ledger
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_daily_spent
  FROM wallet_ledger
  WHERE user_id = p_user_id
    AND currency_type = p_currency_type
    AND amount < 0
    AND created_at::DATE = v_today;

  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_weekly_spent
  FROM wallet_ledger
  WHERE user_id = p_user_id
    AND currency_type = p_currency_type
    AND amount < 0
    AND created_at::DATE >= v_week_start;

  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_monthly_spent
  FROM wallet_ledger
  WHERE user_id = p_user_id
    AND currency_type = p_currency_type
    AND amount < 0
    AND created_at::DATE >= v_month_start;

  RETURN jsonb_build_object(
    'success', true,
    'allowed', true,
    'daily', jsonb_build_object('spent', v_daily_spent, 'cap', v_daily_cap, 'remaining', v_daily_cap - v_daily_spent),
    'weekly', jsonb_build_object('spent', v_weekly_spent, 'cap', v_weekly_cap, 'remaining', v_weekly_cap - v_weekly_spent),
    'monthly', jsonb_build_object('spent', v_monthly_spent, 'cap', v_monthly_cap, 'remaining', v_monthly_cap - v_monthly_spent),
    'proposed', p_amount,
    'would_exceed', CASE
      WHEN (v_daily_spent + p_amount) > v_daily_cap THEN 'daily'
      WHEN (v_weekly_spent + p_amount) > v_weekly_cap THEN 'weekly'
      WHEN (v_monthly_spent + p_amount) > v_monthly_cap THEN 'monthly'
      ELSE NULL
    END
  );
END;
$$;

-- ============================================================
-- 7. log_spending — upsert spending limit tracking
-- ============================================================
CREATE OR REPLACE FUNCTION log_spending(
  p_user_id UUID,
  p_amount INTEGER,
  p_currency_type TEXT DEFAULT 'VXP'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Daily
  INSERT INTO economy_spending_limits (user_id, currency_type, period, period_start, amount_spent)
  VALUES (p_user_id, p_currency_type, 'daily', CURRENT_DATE, p_amount)
  ON CONFLICT (user_id, currency_type, period, period_start)
  DO UPDATE SET amount_spent = economy_spending_limits.amount_spent + p_amount,
                updated_at = now();

  -- Weekly
  INSERT INTO economy_spending_limits (user_id, currency_type, period, period_start, amount_spent)
  VALUES (p_user_id, p_currency_type, 'weekly', date_trunc('week', CURRENT_DATE)::DATE, p_amount)
  ON CONFLICT (user_id, currency_type, period, period_start)
  DO UPDATE SET amount_spent = economy_spending_limits.amount_spent + p_amount,
                updated_at = now();

  -- Monthly
  INSERT INTO economy_spending_limits (user_id, currency_type, period, period_start, amount_spent)
  VALUES (p_user_id, p_currency_type, 'monthly', date_trunc('month', CURRENT_DATE)::DATE, p_amount)
  ON CONFLICT (user_id, currency_type, period, period_start)
  DO UPDATE SET amount_spent = economy_spending_limits.amount_spent + p_amount,
                updated_at = now();

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 8. snapshot_balance — create a balance snapshot for a user
-- ============================================================
CREATE OR REPLACE FUNCTION snapshot_balance(
  p_user_id UUID,
  p_currency_type TEXT DEFAULT 'VXP'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
  v_lifetime INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_balance
  FROM wallet_ledger
  WHERE user_id = p_user_id AND currency_type = p_currency_type;

  SELECT COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) INTO v_lifetime
  FROM wallet_ledger
  WHERE user_id = p_user_id AND currency_type = p_currency_type;

  INSERT INTO balance_snapshots (user_id, currency_type, balance, lifetime_earned, snapshot_date)
  VALUES (p_user_id, p_currency_type, v_balance, v_lifetime, CURRENT_DATE)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_balance,
    'lifetime_earned', v_lifetime
  );
END;
$$;

-- ============================================================
-- 9. admin_update_economy_config — update economy config (service_role only)
-- ============================================================
CREATE OR REPLACE FUNCTION admin_update_economy_config(
  p_updates JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key TEXT;
  v_value JSONB;
BEGIN
  FOR v_key, v_value IN SELECT * FROM jsonb_each(p_updates)
  LOOP
    INSERT INTO economy_config (key, value, description, updated_at)
    VALUES (v_key, v_value, '', now())
    ON CONFLICT (key)
    DO UPDATE SET value = v_value, updated_at = now();
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$;
