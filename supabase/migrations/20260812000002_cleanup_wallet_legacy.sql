-- Cleanup wallet v1 legacy:
-- 1. Drop v1 wallet functions (replaced by v2 create_transaction/commit_transaction)
-- 2. Drop old redeem_reward (no wallet validation, dead code)
-- 3. Fix check_spending_limit: return allowed=false when limit exceeded

-- ========================
-- 1. Drop v1 wallet RPCs
-- ========================
DROP FUNCTION IF EXISTS credit_wallet(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS debit_wallet(UUID, INTEGER, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_wallet_balance(UUID);
DROP FUNCTION IF EXISTS get_wallet_history(UUID, INT, INT);

-- ========================
-- 2. Drop old redeem_reward
-- ========================
DROP FUNCTION IF EXISTS redeem_reward(UUID, BIGINT, TEXT, TEXT, INTEGER);

-- ========================
-- 3. Fix check_spending_limit
--    was: always returns allowed=true even when limit exceeded
--    fix: returns allowed=false when would_exceed is not null
-- ========================
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
  v_would_exceed TEXT;
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

  v_would_exceed := CASE
    WHEN (v_daily_spent + p_amount) > v_daily_cap THEN 'daily'
    WHEN (v_weekly_spent + p_amount) > v_weekly_cap THEN 'weekly'
    WHEN (v_monthly_spent + p_amount) > v_monthly_cap THEN 'monthly'
    ELSE NULL
  END;

  RETURN jsonb_build_object(
    'success', true,
    'allowed', v_would_exceed IS NULL,
    'daily', jsonb_build_object('spent', v_daily_spent, 'cap', v_daily_cap, 'remaining', v_daily_cap - v_daily_spent),
    'weekly', jsonb_build_object('spent', v_weekly_spent, 'cap', v_weekly_cap, 'remaining', v_weekly_cap - v_weekly_spent),
    'monthly', jsonb_build_object('spent', v_monthly_spent, 'cap', v_monthly_cap, 'remaining', v_monthly_cap - v_monthly_spent),
    'proposed', p_amount,
    'would_exceed', v_would_exceed
  );
END;
$$;
