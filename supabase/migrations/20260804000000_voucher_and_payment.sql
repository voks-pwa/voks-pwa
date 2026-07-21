-- Sprint C.5: Voucher & Payment
--
-- Tables:
--   1. marketplace_voucher_pool — voucher codes for marketplace products
--   2. payment_records — payment transaction tracking
--   3. payment_webhook_log — audit trail for payment callbacks
-- RPCs:
--   reserve_marketplace_voucher, assign_marketplace_voucher,
--   use_marketplace_voucher, refund_marketplace_voucher,
--   create_payment, update_payment_status

-- ============================================================
-- 1. marketplace_voucher_pool
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_voucher_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  voucher_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE'
    CHECK (status IN ('AVAILABLE', 'RESERVED', 'ASSIGNED', 'USED', 'EXPIRED', 'VOID')),
  assigned_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mvp_code ON marketplace_voucher_pool(voucher_code);
CREATE INDEX IF NOT EXISTS idx_mvp_product ON marketplace_voucher_pool(product_id);
CREATE INDEX IF NOT EXISTS idx_mvp_status ON marketplace_voucher_pool(status);
CREATE INDEX IF NOT EXISTS idx_mvp_assigned ON marketplace_voucher_pool(assigned_user);

ALTER TABLE marketplace_voucher_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mvp service role all"
  ON marketplace_voucher_pool FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "mvp users read own"
  ON marketplace_voucher_pool FOR SELECT
  TO authenticated
  USING (assigned_user = auth.uid());

-- ============================================================
-- 2. payment_records
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'VXP',
  payment_method TEXT NOT NULL DEFAULT 'VXP'
    CHECK (payment_method IN ('VXP', 'MIDTRANS', 'XENDIT', 'QRIS', 'BANK_TRANSFER', 'CREDIT_CARD')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'EXPIRED')),
  gateway TEXT DEFAULT '',
  gateway_txn_id TEXT DEFAULT '',
  idempotency_key TEXT UNIQUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pr_order ON payment_records(order_id);
CREATE INDEX IF NOT EXISTS idx_pr_user ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_pr_status ON payment_records(payment_status);
CREATE INDEX IF NOT EXISTS idx_pr_gateway_txn ON payment_records(gateway_txn_id) WHERE gateway_txn_id != '';

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pr users read own"
  ON payment_records FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "pr service role all"
  ON payment_records FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. payment_webhook_log
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL DEFAULT '',
  raw_payload JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  signature_valid BOOLEAN DEFAULT false,
  error TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE payment_webhook_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pwl service role all"
  ON payment_webhook_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. reserve_marketplace_voucher
-- ============================================================
CREATE OR REPLACE FUNCTION reserve_marketplace_voucher(p_product_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_voucher marketplace_voucher_pool%ROWTYPE;
BEGIN
  SELECT * INTO v_voucher
  FROM marketplace_voucher_pool
  WHERE product_id = p_product_id
    AND status = 'AVAILABLE'
    AND (expired_at IS NULL OR expired_at > now())
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No available voucher');
  END IF;

  UPDATE marketplace_voucher_pool
  SET status = 'RESERVED'
  WHERE id = v_voucher.id;

  RETURN jsonb_build_object(
    'success', true,
    'voucher_id', v_voucher.id,
    'voucher_code', v_voucher.voucher_code
  );
END;
$$;

-- ============================================================
-- 5. assign_marketplace_voucher
-- ============================================================
CREATE OR REPLACE FUNCTION assign_marketplace_voucher(
  p_voucher_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM marketplace_voucher_pool
  WHERE id = p_voucher_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;

  IF v_status != 'RESERVED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not reserved', 'status', v_status);
  END IF;

  UPDATE marketplace_voucher_pool
  SET status = 'ASSIGNED',
      assigned_user = p_user_id,
      assigned_at = now()
  WHERE id = p_voucher_id;

  RETURN jsonb_build_object('success', true, 'voucher_id', p_voucher_id);
END;
$$;

-- ============================================================
-- 6. use_marketplace_voucher
-- ============================================================
CREATE OR REPLACE FUNCTION use_marketplace_voucher(p_voucher_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM marketplace_voucher_pool
  WHERE id = p_voucher_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;

  IF v_status != 'ASSIGNED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not assigned', 'status', v_status);
  END IF;

  UPDATE marketplace_voucher_pool
  SET status = 'USED', used_at = now()
  WHERE id = p_voucher_id;

  RETURN jsonb_build_object('success', true, 'voucher_id', p_voucher_id);
END;
$$;

-- ============================================================
-- 7. refund_marketplace_voucher
-- ============================================================
CREATE OR REPLACE FUNCTION refund_marketplace_voucher(p_voucher_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_used_at TIMESTAMPTZ;
BEGIN
  SELECT status, used_at INTO v_status, v_used_at
  FROM marketplace_voucher_pool
  WHERE id = p_voucher_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;

  IF v_status = 'ASSIGNED' AND v_used_at IS NULL THEN
    UPDATE marketplace_voucher_pool
    SET status = 'AVAILABLE',
        assigned_user = NULL,
        assigned_at = NULL
    WHERE id = p_voucher_id;
    RETURN jsonb_build_object('success', true, 'action', 'returned_to_pool');
  END IF;

  UPDATE marketplace_voucher_pool SET status = 'VOID' WHERE id = p_voucher_id;
  RETURN jsonb_build_object('success', true, 'action', 'voided');
END;
$$;

-- ============================================================
-- 8. create_payment — create a payment record
-- ============================================================
CREATE OR REPLACE FUNCTION create_payment(
  p_order_id UUID,
  p_user_id UUID,
  p_amount INT,
  p_payment_method TEXT DEFAULT 'VXP',
  p_currency TEXT DEFAULT 'VXP',
  p_idempotency_key TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
  v_idem_key TEXT;
BEGIN
  IF p_idempotency_key != '' THEN
    SELECT id INTO v_id
    FROM payment_records
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Duplicate request', 'duplicate', true);
    END IF;
  END IF;

  v_idem_key := CASE WHEN p_idempotency_key = '' THEN gen_random_uuid()::TEXT ELSE p_idempotency_key END;

  INSERT INTO payment_records (order_id, user_id, amount, currency, payment_method, payment_status, idempotency_key)
  VALUES (p_order_id, p_user_id, p_amount, p_currency, p_payment_method, 'PENDING', v_idem_key)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'success', true,
    'payment_id', v_id,
    'payment_method', p_payment_method,
    'amount', p_amount,
    'idempotency_key', v_idem_key
  );
END;
$$;

-- ============================================================
-- 9. update_payment_status — update payment + order status atomically
-- ============================================================
CREATE OR REPLACE FUNCTION update_payment_status(
  p_payment_id UUID,
  p_status TEXT,
  p_gateway_txn_id TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
BEGIN
  SELECT * INTO v_payment
  FROM payment_records
  WHERE id = p_payment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment not found');
  END IF;

  IF v_payment.payment_status IN ('SUCCESS', 'REFUNDED') AND p_status = 'SUCCESS' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Payment already completed');
  END IF;

  UPDATE payment_records
  SET payment_status = p_status,
      gateway_txn_id = CASE WHEN p_gateway_txn_id != '' THEN p_gateway_txn_id ELSE gateway_txn_id END,
      metadata = metadata || p_metadata,
      updated_at = now()
  WHERE id = p_payment_id;

  IF p_status = 'SUCCESS' THEN
    UPDATE marketplace_orders
    SET order_status = 'PAID', updated_at = now()
    WHERE id = v_payment.order_id AND order_status = 'PENDING';
  ELSIF p_status = 'FAILED' THEN
    UPDATE marketplace_orders
    SET order_status = 'CANCELLED', updated_at = now()
    WHERE id = v_payment.order_id AND order_status = 'PENDING';
  END IF;

  RETURN jsonb_build_object('success', true, 'payment_id', p_payment_id, 'status', p_status);
END;
$$;

-- ============================================================
-- 10. expire_marketplace_vouchers — batch expire
-- ============================================================
CREATE OR REPLACE FUNCTION expire_marketplace_vouchers() RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE marketplace_voucher_pool
  SET status = 'EXPIRED'
  WHERE status IN ('AVAILABLE', 'RESERVED')
    AND expired_at IS NOT NULL
    AND expired_at <= now();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
