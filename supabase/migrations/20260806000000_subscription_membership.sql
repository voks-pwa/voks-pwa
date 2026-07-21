-- Sprint C.7: Subscription & Membership
--
-- Tables:
--   1. subscription_plans — plan catalog (Free, Premium, VIP, Corporate)
--   2. user_subscriptions — user's active subscription
--   3. subscription_invoices — billing history
-- RPCs:
--   create_subscription_plan, subscribe_user, renew_subscription,
--   cancel_subscription, change_subscription_plan, get_user_subscription,
--   get_subscription_analytics

-- ============================================================
-- 1. subscription_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code TEXT NOT NULL UNIQUE
    CHECK (plan_code IN ('FREE', 'PREMIUM', 'VIP', 'CORPORATE')),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  billing_interval TEXT NOT NULL DEFAULT 'MONTHLY'
    CHECK (billing_interval IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
  price INT NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'VXP',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sp_code ON subscription_plans(plan_code);
CREATE INDEX IF NOT EXISTS idx_sp_active ON subscription_plans(is_active);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sp public read"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "sp service role all"
  ON subscription_plans FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. user_subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'GRACE', 'EXPIRED', 'CANCELLED', 'PAUSED')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days',
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_us_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_us_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_us_plan ON user_subscriptions(plan_id);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "us own read"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "us service role all"
  ON user_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. subscription_invoices
-- ============================================================
CREATE TABLE IF NOT EXISTS subscription_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  amount INT NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'VXP',
  payment_method TEXT NOT NULL DEFAULT 'VXP'
    CHECK (payment_method IN ('VXP', 'MIDTRANS', 'XENDIT', 'QRIS', 'BANK_TRANSFER', 'CREDIT_CARD')),
  status TEXT NOT NULL DEFAULT 'PAID'
    CHECK (status IN ('PAID', 'PENDING', 'FAILED', 'REFUNDED')),
  wallet_txn_id INT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_si_user ON subscription_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_si_sub ON subscription_invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_si_status ON subscription_invoices(status);

ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "si own read"
  ON subscription_invoices FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "si service role all"
  ON subscription_invoices FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. create_subscription_plan
-- ============================================================
CREATE OR REPLACE FUNCTION create_subscription_plan(
  p_plan_code TEXT,
  p_name TEXT,
  p_billing_interval TEXT DEFAULT 'MONTHLY',
  p_price INT DEFAULT 0,
  p_currency TEXT DEFAULT 'VXP',
  p_description TEXT DEFAULT '',
  p_features JSONB DEFAULT '[]'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO subscription_plans (plan_code, name, billing_interval, price, currency, description, features)
  VALUES (p_plan_code, p_name, p_billing_interval, p_price, p_currency, p_description, p_features)
  ON CONFLICT (plan_code) DO UPDATE
    SET name = EXCLUDED.name,
        billing_interval = EXCLUDED.billing_interval,
        price = EXCLUDED.price,
        currency = EXCLUDED.currency,
        description = EXCLUDED.description,
        features = EXCLUDED.features,
        is_active = true,
        updated_at = now()
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'plan_id', v_id);
END;
$$;

-- ============================================================
-- 5. subscribe_user — create subscription (wallet debit done in engine)
-- ============================================================
CREATE OR REPLACE FUNCTION subscribe_user(
  p_user_id UUID,
  p_plan_id UUID,
  p_period_days INT DEFAULT 30,
  p_auto_renew BOOLEAN DEFAULT true,
  p_wallet_txn_id INT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan subscription_plans%ROWTYPE;
  v_sub_id UUID;
  v_start TIMESTAMPTZ := now();
  v_end TIMESTAMPTZ := now() + (p_period_days || ' days')::INTERVAL;
BEGIN
  SELECT * INTO v_plan FROM subscription_plans WHERE id = p_plan_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan not found');
  END IF;

  -- Upsert single subscription per user (replace existing)
  INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end, auto_renew)
  VALUES (p_user_id, p_plan_id, 'ACTIVE', v_start, v_end, p_auto_renew)
  ON CONFLICT (user_id) DO UPDATE
    SET plan_id = EXCLUDED.plan_id,
        status = 'ACTIVE',
        current_period_start = v_start,
        current_period_end = v_end,
        auto_renew = EXCLUDED.auto_renew,
        cancelled_at = NULL,
        metadata = jsonb_build_object('wallet_txn_id', p_wallet_txn_id),
        updated_at = now()
  RETURNING id INTO v_sub_id;

  INSERT INTO subscription_invoices (user_id, subscription_id, amount, currency, payment_method, status, wallet_txn_id, period_start, period_end)
  VALUES (p_user_id, v_sub_id, v_plan.price, v_plan.currency, 'VXP', 'PAID', p_wallet_txn_id, v_start, v_end);

  INSERT INTO commerce_events (event_type, user_id, metadata)
  VALUES ('subscription_started', p_user_id, jsonb_build_object('plan_code', v_plan.plan_code, 'subscription_id', v_sub_id));

  RETURN jsonb_build_object('success', true, 'subscription_id', v_sub_id, 'plan_code', v_plan.plan_code, 'period_end', v_end);
END;
$$;

-- ============================================================
-- 6. renew_subscription
-- ============================================================
CREATE OR REPLACE FUNCTION renew_subscription(
  p_subscription_id UUID,
  p_period_days INT DEFAULT 30,
  p_wallet_txn_id INT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub user_subscriptions%ROWTYPE;
  v_plan subscription_plans%ROWTYPE;
  v_new_end TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_sub FROM user_subscriptions WHERE id = p_subscription_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Subscription not found');
  END IF;

  SELECT * INTO v_plan FROM subscription_plans WHERE id = v_sub.plan_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Plan not found');
  END IF;

  v_new_end := GREATEST(v_sub.current_period_end, now()) + (p_period_days || ' days')::INTERVAL;

  UPDATE user_subscriptions
  SET status = 'ACTIVE',
      current_period_start = now(),
      current_period_end = v_new_end,
      cancelled_at = NULL,
      updated_at = now()
  WHERE id = p_subscription_id;

  INSERT INTO subscription_invoices (user_id, subscription_id, amount, currency, payment_method, status, wallet_txn_id, period_start, period_end)
  VALUES (v_sub.user_id, p_subscription_id, v_plan.price, v_plan.currency, 'VXP', 'PAID', p_wallet_txn_id, now(), v_new_end);

  INSERT INTO commerce_events (event_type, user_id, metadata)
  VALUES ('subscription_renewed', v_sub.user_id, jsonb_build_object('subscription_id', p_subscription_id));

  RETURN jsonb_build_object('success', true, 'subscription_id', p_subscription_id, 'period_end', v_new_end);
END;
$$;

-- ============================================================
-- 7. cancel_subscription
-- ============================================================
CREATE OR REPLACE FUNCTION cancel_subscription(p_subscription_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub user_subscriptions%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM user_subscriptions WHERE id = p_subscription_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Subscription not found');
  END IF;

  UPDATE user_subscriptions
  SET status = 'CANCELLED',
      auto_renew = false,
      cancelled_at = now(),
      updated_at = now()
  WHERE id = p_subscription_id;

  INSERT INTO commerce_events (event_type, user_id, metadata)
  VALUES ('subscription_cancelled', v_sub.user_id, jsonb_build_object('subscription_id', p_subscription_id));

  RETURN jsonb_build_object('success', true, 'subscription_id', p_subscription_id);
END;
$$;

-- ============================================================
-- 8. change_subscription_plan (upgrade / downgrade)
-- ============================================================
CREATE OR REPLACE FUNCTION change_subscription_plan(
  p_subscription_id UUID,
  p_new_plan_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub user_subscriptions%ROWTYPE;
  v_plan subscription_plans%ROWTYPE;
BEGIN
  SELECT * INTO v_sub FROM user_subscriptions WHERE id = p_subscription_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Subscription not found');
  END IF;

  SELECT * INTO v_plan FROM subscription_plans WHERE id = p_new_plan_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Target plan not found');
  END IF;

  UPDATE user_subscriptions
  SET plan_id = p_new_plan_id,
      updated_at = now()
  WHERE id = p_subscription_id;

  INSERT INTO commerce_events (event_type, user_id, metadata)
  VALUES ('subscription_changed', v_sub.user_id, jsonb_build_object('subscription_id', p_subscription_id, 'new_plan_code', v_plan.plan_code));

  RETURN jsonb_build_object('success', true, 'subscription_id', p_subscription_id, 'plan_code', v_plan.plan_code);
END;
$$;

-- ============================================================
-- 9. get_user_subscription
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sub RECORD;
BEGIN
  SELECT us.*, sp.plan_code, sp.name as plan_name, sp.billing_interval, sp.price, sp.currency
  INTO v_sub
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active subscription');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub.id,
    'plan_code', v_sub.plan_code,
    'plan_name', v_sub.plan_name,
    'status', v_sub.status,
    'billing_interval', v_sub.billing_interval,
    'price', v_sub.price,
    'currency', v_sub.currency,
    'current_period_start', v_sub.current_period_start,
    'current_period_end', v_sub.current_period_end,
    'auto_renew', v_sub.auto_renew
  );
END;
$$;

-- ============================================================
-- 10. get_subscription_analytics
-- ============================================================
CREATE OR REPLACE FUNCTION get_subscription_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total INT;
  v_active INT;
  v_revenue INT;
  v_by_plan JSONB;
BEGIN
  SELECT COUNT(*) INTO v_total FROM user_subscriptions;
  SELECT COUNT(*) INTO v_active FROM user_subscriptions WHERE status = 'ACTIVE';
  SELECT COALESCE(SUM(amount), 0) INTO v_revenue FROM subscription_invoices WHERE status = 'PAID';

  SELECT jsonb_agg(sub) INTO v_by_plan
  FROM (
    SELECT sp.plan_code, sp.name, COUNT(us.id) as subscriber_count
    FROM subscription_plans sp
    LEFT JOIN user_subscriptions us ON us.plan_id = sp.id AND us.status = 'ACTIVE'
    GROUP BY sp.plan_code, sp.name
    ORDER BY subscriber_count DESC
  ) sub;

  RETURN jsonb_build_object(
    'success', true,
    'total_subscriptions', v_total,
    'active_subscriptions', v_active,
    'total_revenue', v_revenue,
    'by_plan', COALESCE(v_by_plan, '[]'::JSONB)
  );
END;
$$;
