CREATE TABLE IF NOT EXISTS reward_voucher_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id INTEGER NOT NULL,
  voucher_code TEXT NOT NULL,
  voucher_type TEXT NOT NULL DEFAULT 'internal',
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  assigned_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_voucher_code ON reward_voucher_pool(voucher_code);
CREATE INDEX IF NOT EXISTS idx_voucher_reward ON reward_voucher_pool(reward_id);
CREATE INDEX IF NOT EXISTS idx_voucher_status ON reward_voucher_pool(status);

ALTER TABLE reward_voucher_pool ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages voucher pool"
  ON reward_voucher_pool FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read assigned vouchers"
  ON reward_voucher_pool FOR SELECT
  TO authenticated
  USING (assigned_user = auth.uid());

CREATE OR REPLACE FUNCTION reserve_voucher(
  p_reward_id INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_voucher reward_voucher_pool%ROWTYPE;
BEGIN
  SELECT * INTO v_voucher
  FROM reward_voucher_pool
  WHERE reward_id = p_reward_id
    AND status = 'AVAILABLE'
    AND (expired_at IS NULL OR expired_at > now())
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No available voucher');
  END IF;

  UPDATE reward_voucher_pool
  SET status = 'RESERVED'
  WHERE id = v_voucher.id;

  RETURN jsonb_build_object(
    'success', true,
    'voucher_id', v_voucher.id,
    'voucher_code', v_voucher.voucher_code,
    'voucher_type', v_voucher.voucher_type
  );
END;
$$;

CREATE OR REPLACE FUNCTION assign_voucher(
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
  FROM reward_voucher_pool
  WHERE id = p_voucher_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;

  IF v_status != 'RESERVED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher is not reserved');
  END IF;

  UPDATE reward_voucher_pool
  SET status = 'ASSIGNED',
      assigned_user = p_user_id,
      assigned_at = now()
  WHERE id = p_voucher_id;

  RETURN jsonb_build_object('success', true, 'voucher_id', p_voucher_id);
END;
$$;

CREATE OR REPLACE FUNCTION use_voucher(
  p_voucher_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM reward_voucher_pool
  WHERE id = p_voucher_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;

  IF v_status != 'ASSIGNED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher is not assigned');
  END IF;

  UPDATE reward_voucher_pool
  SET status = 'USED',
      used_at = now()
  WHERE id = p_voucher_id;

  RETURN jsonb_build_object('success', true, 'voucher_id', p_voucher_id);
END;
$$;

CREATE OR REPLACE FUNCTION refund_voucher(
  p_voucher_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status TEXT;
  v_used_at TIMESTAMPTZ;
BEGIN
  SELECT status, used_at INTO v_status, v_used_at
  FROM reward_voucher_pool
  WHERE id = p_voucher_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voucher not found');
  END IF;

  IF v_status = 'ASSIGNED' AND v_used_at IS NULL THEN
    UPDATE reward_voucher_pool
    SET status = 'AVAILABLE',
        assigned_user = NULL,
        assigned_at = NULL
    WHERE id = p_voucher_id;

    RETURN jsonb_build_object('success', true, 'action', 'returned_to_pool', 'voucher_id', p_voucher_id);
  END IF;

  UPDATE reward_voucher_pool
  SET status = 'VOID'
  WHERE id = p_voucher_id;

  RETURN jsonb_build_object('success', true, 'action', 'voided', 'voucher_id', p_voucher_id);
END;
$$;

CREATE OR REPLACE FUNCTION expire_vouchers() RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE reward_voucher_pool
  SET status = 'EXPIRED'
  WHERE status IN ('AVAILABLE', 'RESERVED')
    AND expired_at IS NOT NULL
    AND expired_at <= now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
