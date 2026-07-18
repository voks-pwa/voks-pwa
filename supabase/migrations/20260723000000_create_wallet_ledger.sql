-- Sprint 14: Wallet Engine v1 — wallet_ledger table + RPCs
--
-- wallet_ledger is the single source of truth for all VXP movements.
-- Immutable: no UPDATE, no DELETE. Refunds and penalties create new entries.

CREATE TABLE IF NOT EXISTS wallet_ledger (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount != 0),
  transaction_type TEXT NOT NULL,
  reference_type TEXT NOT NULL DEFAULT '',
  reference_id TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_user ON wallet_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_lookup ON wallet_ledger(user_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_created ON wallet_ledger(user_id, created_at DESC);

ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own ledger"
  ON wallet_ledger FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Block direct INSERT from client (must go through credit_wallet / debit_wallet RPCs)
CREATE POLICY "Only service role inserts ledger"
  ON wallet_ledger FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================
-- credit_wallet: add XP (positive amount)
-- ============================================================
CREATE OR REPLACE FUNCTION credit_wallet(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT DEFAULT 'BONUS',
  p_reference_type TEXT DEFAULT '',
  p_reference_id TEXT DEFAULT '',
  p_description TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_current INTEGER;
  v_new_lifetime INTEGER;
  v_current INTEGER;
  v_lifetime INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  SELECT COALESCE(current_vxp, 0), COALESCE(lifetime_vxp, 0)
  INTO v_current, v_lifetime
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  INSERT INTO wallet_ledger (user_id, amount, transaction_type, reference_type, reference_id, description)
  VALUES (p_user_id, p_amount, p_transaction_type, p_reference_type, p_reference_id, p_description);

  v_new_current := v_current + p_amount;
  v_new_lifetime := v_lifetime + p_amount;

  UPDATE profiles
  SET current_vxp = v_new_current, lifetime_vxp = v_new_lifetime
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'amount', p_amount,
    'current_vxp', v_new_current,
    'lifetime_vxp', v_new_lifetime
  );
END;
$$;

-- ============================================================
-- debit_wallet: deduct XP (validates sufficient balance)
-- ============================================================
CREATE OR REPLACE FUNCTION debit_wallet(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT DEFAULT 'REDEEM',
  p_reference_type TEXT DEFAULT '',
  p_reference_id TEXT DEFAULT '',
  p_description TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
  v_new_current INTEGER;
  v_current INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be positive');
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_balance
  FROM wallet_ledger
  WHERE user_id = p_user_id;

  IF v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient VXP', 'balance', v_balance, 'required', p_amount);
  END IF;

  SELECT COALESCE(current_vxp, 0) INTO v_current
  FROM profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  INSERT INTO wallet_ledger (user_id, amount, transaction_type, reference_type, reference_id, description)
  VALUES (p_user_id, -p_amount, p_transaction_type, p_reference_type, p_reference_id, p_description);

  v_new_current := v_current - p_amount;

  UPDATE profiles
  SET current_vxp = v_new_current
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'amount', -p_amount,
    'current_vxp', v_new_current,
    'balance', v_balance - p_amount
  );
END;
$$;

-- ============================================================
-- get_wallet_balance: returns SUM(amount) from wallet_ledger
-- ============================================================
CREATE OR REPLACE FUNCTION get_wallet_balance(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_balance INTEGER;
  v_lifetime INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_balance
  FROM wallet_ledger
  WHERE user_id = p_user_id;

  SELECT COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) INTO v_lifetime
  FROM wallet_ledger
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'balance', v_balance,
    'lifetime_vxp', v_lifetime
  );
END;
$$;

-- ============================================================
-- get_wallet_history: paginated ledger entries
-- ============================================================
CREATE OR REPLACE FUNCTION get_wallet_history(
  p_user_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_count INT;
  v_data JSONB;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM wallet_ledger
  WHERE user_id = p_user_id;

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.created_at DESC), '[]'::jsonb) INTO v_data
  FROM (
    SELECT id, amount, transaction_type, reference_type, reference_id, description, created_at
    FROM wallet_ledger
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) t;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_data,
    'total', v_count,
    'limit', p_limit,
    'offset', p_offset
  );
END;
$$;
