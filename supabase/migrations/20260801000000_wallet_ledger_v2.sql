-- Sprint C.2: Wallet Ledger v2
--
-- Adds:
--   1. Transaction lifecycle columns to wallet_ledger
--   2. wallet_rollbacks table for rollback audit
--   3. RPCs: create_transaction, commit_transaction, fail_transaction,
--      rollback_transaction, retry_transaction, get_transactions_admin
--   4. Fraud protection: unique transaction_key index

-- ============================================================
-- 1. Extend wallet_ledger with transaction lifecycle columns
-- ============================================================
ALTER TABLE wallet_ledger
  ADD COLUMN IF NOT EXISTS transaction_key TEXT,
  ADD COLUMN IF NOT EXISTS before_balance INTEGER,
  ADD COLUMN IF NOT EXISTS after_balance INTEGER,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'SUCCESS',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rolled_back_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rolled_back_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Unique index for idempotency (nulls allowed for existing records)
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_ledger_txn_key
  ON wallet_ledger(transaction_key)
  WHERE transaction_key IS NOT NULL;

-- Index for admin queries by status
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_status
  ON wallet_ledger(status);

-- ============================================================
-- 2. wallet_rollbacks — rollback audit trail
-- ============================================================
CREATE TABLE IF NOT EXISTS wallet_rollbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_transaction_id BIGINT NOT NULL REFERENCES wallet_ledger(id),
  rollback_transaction_id BIGINT REFERENCES wallet_ledger(id),
  reason TEXT NOT NULL DEFAULT '',
  rolled_back_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wallet_rollbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rollbacks readable by service_role"
  ON wallet_rollbacks FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "rollbacks insertable by service_role"
  ON wallet_rollbacks FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================
-- 3. create_transaction — create a PENDING ledger entry
-- ============================================================
CREATE OR REPLACE FUNCTION create_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_transaction_key TEXT,
  p_source TEXT DEFAULT '',
  p_reference_id TEXT DEFAULT '',
  p_description TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
  v_lifetime INTEGER;
  v_ledger_id BIGINT;
BEGIN
  IF p_amount = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Amount must be non-zero');
  END IF;

  -- Check duplicate
  PERFORM 1 FROM wallet_ledger
  WHERE transaction_key = p_transaction_key;
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Duplicate transaction', 'duplicate', true);
  END IF;

  -- Get current balance
  SELECT COALESCE(SUM(amount), 0) INTO v_balance
  FROM wallet_ledger
  WHERE user_id = p_user_id AND status = 'SUCCESS';

  -- Validate sufficient balance for debits
  IF p_amount < 0 AND v_balance < ABS(p_amount) THEN
    RETURN jsonb_build_object(
      'success', false, 'error', 'Insufficient balance',
      'balance', v_balance, 'required', ABS(p_amount)
    );
  END IF;

  v_new_balance := v_balance + p_amount;

  -- Insert PENDING ledger entry
  INSERT INTO wallet_ledger (
    user_id, amount, transaction_type, reference_type, reference_id,
    description, transaction_key, before_balance, after_balance,
    status, metadata
  ) VALUES (
    p_user_id, p_amount, p_transaction_type, p_source, p_reference_id,
    p_description, p_transaction_key, v_balance, v_new_balance,
    'PENDING', jsonb_build_object('source', p_source, 'reference_id', p_reference_id)
  )
  RETURNING id INTO v_ledger_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_ledger_id,
    'before_balance', v_balance,
    'after_balance', v_new_balance,
    'amount', p_amount
  );
END;
$$;

-- ============================================================
-- 4. commit_transaction — mark SUCCESS + update profiles
-- ============================================================
CREATE OR REPLACE FUNCTION commit_transaction(
  p_transaction_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_txn RECORD;
  v_current_vxp INTEGER;
  v_lifetime_vxp INTEGER;
BEGIN
  SELECT * INTO v_txn
  FROM wallet_ledger
  WHERE transaction_key = p_transaction_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
  END IF;

  IF v_txn.status != 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not in PENDING status', 'status', v_txn.status);
  END IF;

  -- Read current profile values
  SELECT COALESCE(current_vxp, 0), COALESCE(lifetime_vxp, 0)
  INTO v_current_vxp, v_lifetime_vxp
  FROM profiles
  WHERE id = v_txn.user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Update wallet ledger status
  UPDATE wallet_ledger
  SET status = 'SUCCESS',
      after_balance = v_current_vxp + v_txn.amount,
      updated_at = now()
  WHERE id = v_txn.id;

  -- Update profiles
  IF v_txn.amount > 0 THEN
    UPDATE profiles
    SET current_vxp = v_current_vxp + v_txn.amount,
        lifetime_vxp = v_lifetime_vxp + v_txn.amount
    WHERE id = v_txn.user_id;
  ELSE
    UPDATE profiles
    SET current_vxp = v_current_vxp + v_txn.amount
    WHERE id = v_txn.user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_txn.id,
    'amount', v_txn.amount,
    'current_vxp', v_current_vxp + v_txn.amount
  );
END;
$$;

-- ============================================================
-- 5. fail_transaction — mark FAILED (no profile update)
-- ============================================================
CREATE OR REPLACE FUNCTION fail_transaction(
  p_transaction_key TEXT,
  p_error TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_txn RECORD;
BEGIN
  SELECT * INTO v_txn
  FROM wallet_ledger
  WHERE transaction_key = p_transaction_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
  END IF;

  IF v_txn.status != 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not in PENDING status', 'status', v_txn.status);
  END IF;

  UPDATE wallet_ledger
  SET status = 'FAILED',
      metadata = metadata || jsonb_build_object('fail_reason', p_error),
      updated_at = now()
  WHERE id = v_txn.id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_txn.id);
END;
$$;

-- ============================================================
-- 6. rollback_transaction — revert a SUCCESS or FAILED transaction
-- ============================================================
CREATE OR REPLACE FUNCTION rollback_transaction(
  p_transaction_key TEXT,
  p_reason TEXT DEFAULT '',
  p_rolled_back_by UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_txn RECORD;
  v_reversal_id BIGINT;
  v_current_vxp INTEGER;
BEGIN
  SELECT * INTO v_txn
  FROM wallet_ledger
  WHERE transaction_key = p_transaction_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
  END IF;

  IF v_txn.status = 'ROLLED_BACK' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already rolled back');
  END IF;

  IF v_txn.status = 'PENDING' THEN
    -- Just mark as rolled back, no reversal needed
    UPDATE wallet_ledger
    SET status = 'ROLLED_BACK',
        rolled_back_at = now(),
        rolled_back_by = p_rolled_back_by,
        updated_at = now()
    WHERE id = v_txn.id;
  ELSE
    -- Create reversal entry
    SELECT COALESCE(current_vxp, 0) INTO v_current_vxp
    FROM profiles
    WHERE id = v_txn.user_id;

    INSERT INTO wallet_ledger (
      user_id, amount, transaction_type, reference_type, reference_id,
      description, transaction_key, before_balance, after_balance,
      status, metadata
    ) VALUES (
      v_txn.user_id, -v_txn.amount, 'ROLLBACK',
      v_txn.reference_type, v_txn.reference_id,
      'Rollback: ' || COALESCE(p_reason, v_txn.description),
      'ROLLBACK_' || p_transaction_key,
      v_current_vxp, v_current_vxp - v_txn.amount,
      'SUCCESS',
      jsonb_build_object('rollback_of', v_txn.id, 'reason', p_reason)
    )
    RETURNING id INTO v_reversal_id;

    -- Update profiles
    UPDATE profiles
    SET current_vxp = v_current_vxp - v_txn.amount
    WHERE id = v_txn.user_id;

    -- Mark original as rolled back
    UPDATE wallet_ledger
    SET status = 'ROLLED_BACK',
        after_balance = v_current_vxp - v_txn.amount,
        rolled_back_at = now(),
        rolled_back_by = p_rolled_back_by,
        updated_at = now()
    WHERE id = v_txn.id;

    -- Record rollback audit
    INSERT INTO wallet_rollbacks (original_transaction_id, rollback_transaction_id, reason, rolled_back_by)
    VALUES (v_txn.id, v_reversal_id, p_reason, p_rolled_back_by);
  END IF;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_txn.id);
END;
$$;

-- ============================================================
-- 7. retry_transaction — retry a FAILED transaction
-- ============================================================
CREATE OR REPLACE FUNCTION retry_transaction(
  p_transaction_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_txn RECORD;
BEGIN
  SELECT * INTO v_txn
  FROM wallet_ledger
  WHERE transaction_key = p_transaction_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Transaction not found');
  END IF;

  IF v_txn.status != 'FAILED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Can only retry FAILED transactions', 'status', v_txn.status);
  END IF;

  -- Set back to PENDING, then commit
  UPDATE wallet_ledger
  SET status = 'PENDING', updated_at = now()
  WHERE id = v_txn.id;

  -- Attempt commit
  RETURN commit_transaction(p_transaction_key);
END;
$$;

-- ============================================================
-- 8. get_transactions_admin — paginated ledger query for admin
-- ============================================================
CREATE OR REPLACE FUNCTION get_transactions_admin(
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_status TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT NULL
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
  WHERE (p_status IS NULL OR status = p_status)
    AND (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_source IS NULL OR reference_type = p_source);

  SELECT COALESCE(jsonb_agg(row_to_json(t)::jsonb ORDER BY t.created_at DESC), '[]'::jsonb) INTO v_data
  FROM (
    SELECT id, user_id, amount, transaction_type, reference_type AS source,
           reference_id, description, transaction_key, before_balance,
           after_balance, status, created_at, updated_at, rolled_back_at
    FROM wallet_ledger
    WHERE (p_status IS NULL OR status = p_status)
      AND (p_user_id IS NULL OR user_id = p_user_id)
      AND (p_source IS NULL OR reference_type = p_source)
    ORDER BY created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) t;

  RETURN jsonb_build_object(
    'success', true,
    'data', v_data,
    'total', v_count
  );
END;
$$;

-- ============================================================
-- 9. check_duplicate — check if a transaction_key already exists
-- ============================================================
CREATE OR REPLACE FUNCTION check_duplicate(
  p_transaction_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM wallet_ledger WHERE transaction_key = p_transaction_key
  ) INTO v_exists;

  RETURN jsonb_build_object('exists', v_exists);
END;
$$;
