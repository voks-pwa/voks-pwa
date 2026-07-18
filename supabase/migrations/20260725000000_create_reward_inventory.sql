CREATE TABLE IF NOT EXISTS reward_inventory (
  reward_id INTEGER PRIMARY KEY,
  current_stock INTEGER NOT NULL DEFAULT 0,
  reserved_stock INTEGER NOT NULL DEFAULT 0,
  warning_stock INTEGER NOT NULL DEFAULT 5,
  inventory_mode TEXT NOT NULL DEFAULT 'limited',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_inventory_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id INTEGER NOT NULL REFERENCES reward_inventory(reward_id),
  transaction_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  before_stock INTEGER NOT NULL,
  after_stock INTEGER NOT NULL,
  reference_type TEXT NOT NULL DEFAULT '',
  reference_id TEXT NOT NULL DEFAULT '',
  admin_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_ledger_reward ON reward_inventory_ledger(reward_id);
CREATE INDEX IF NOT EXISTS idx_inventory_ledger_created ON reward_inventory_ledger(created_at DESC);

ALTER TABLE reward_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_inventory_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read inventory"
  ON reward_inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages inventory"
  ON reward_inventory FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read inventory ledger"
  ON reward_inventory_ledger FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role manages inventory ledger"
  ON reward_inventory_ledger FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION reserve_stock(
  p_reward_id INTEGER,
  p_quantity INTEGER DEFAULT 1
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_reserved_stock INTEGER;
  v_available INTEGER;
  v_inventory_mode TEXT;
BEGIN
  SELECT current_stock, reserved_stock, inventory_mode
  INTO v_current_stock, v_reserved_stock, v_inventory_mode
  FROM reward_inventory
  WHERE reward_id = p_reward_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inventory not found');
  END IF;

  IF v_inventory_mode = 'unlimited' THEN
    RETURN jsonb_build_object('success', true, 'reserved', p_quantity, 'unlimited', true);
  END IF;

  v_available := v_current_stock - v_reserved_stock;

  IF v_available < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock', 'available', v_available);
  END IF;

  UPDATE reward_inventory
  SET reserved_stock = reserved_stock + p_quantity,
      updated_at = now()
  WHERE reward_id = p_reward_id;

  INSERT INTO reward_inventory_ledger (reward_id, transaction_type, amount, before_stock, after_stock, reference_type, reference_id)
  VALUES (p_reward_id, 'RESERVE', p_quantity, v_current_stock, v_current_stock - v_reserved_stock - p_quantity, 'reserve', 'system');

  RETURN jsonb_build_object('success', true, 'reserved', p_quantity);
END;
$$;

CREATE OR REPLACE FUNCTION deduct_stock(
  p_reward_id INTEGER,
  p_quantity INTEGER DEFAULT 1,
  p_reference_type TEXT DEFAULT '',
  p_reference_id TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_reserved_stock INTEGER;
  v_after_stock INTEGER;
  v_inventory_mode TEXT;
BEGIN
  SELECT current_stock, reserved_stock, inventory_mode
  INTO v_current_stock, v_reserved_stock, v_inventory_mode
  FROM reward_inventory
  WHERE reward_id = p_reward_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inventory not found');
  END IF;

  IF v_inventory_mode = 'unlimited' THEN
    RETURN jsonb_build_object('success', true, 'deducted', p_quantity, 'unlimited', true);
  END IF;

  IF v_current_stock < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock');
  END IF;

  v_after_stock := v_current_stock - p_quantity;
  v_reserved_stock := GREATEST(v_reserved_stock - p_quantity, 0);

  UPDATE reward_inventory
  SET current_stock = v_after_stock,
      reserved_stock = v_reserved_stock,
      updated_at = now()
  WHERE reward_id = p_reward_id;

  INSERT INTO reward_inventory_ledger (reward_id, transaction_type, amount, before_stock, after_stock, reference_type, reference_id)
  VALUES (p_reward_id, 'DEDUCT', p_quantity, v_current_stock, v_after_stock, p_reference_type, p_reference_id);

  RETURN jsonb_build_object('success', true, 'deducted', p_quantity, 'remaining', v_after_stock);
END;
$$;

CREATE OR REPLACE function refund_stock(
  p_reward_id INTEGER,
  p_quantity INTEGER DEFAULT 1,
  p_reference_type TEXT DEFAULT '',
  p_reference_id TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_after_stock INTEGER;
  v_inventory_mode TEXT;
BEGIN
  SELECT current_stock, inventory_mode
  INTO v_current_stock, v_inventory_mode
  FROM reward_inventory
  WHERE reward_id = p_reward_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inventory not found');
  END IF;

  IF v_inventory_mode = 'unlimited' THEN
    RETURN jsonb_build_object('success', true, 'refunded', p_quantity, 'unlimited', true);
  END IF;

  v_after_stock := v_current_stock + p_quantity;

  UPDATE reward_inventory
  SET current_stock = v_after_stock,
      updated_at = now()
  WHERE reward_id = p_reward_id;

  INSERT INTO reward_inventory_ledger (reward_id, transaction_type, amount, before_stock, after_stock, reference_type, reference_id)
  VALUES (p_reward_id, 'REFUND', p_quantity, v_current_stock, v_after_stock, p_reference_type, p_reference_id);

  RETURN jsonb_build_object('success', true, 'refunded', p_quantity, 'remaining', v_after_stock);
END;
$$;

CREATE OR REPLACE FUNCTION adjust_stock(
  p_reward_id INTEGER,
  p_new_stock INTEGER,
  p_admin_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stock INTEGER;
  v_delta INTEGER;
  v_inventory_mode TEXT;
BEGIN
  SELECT current_stock, inventory_mode
  INTO v_current_stock, v_inventory_mode
  FROM reward_inventory
  WHERE reward_id = p_reward_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inventory not found');
  END IF;

  IF v_inventory_mode = 'unlimited' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot adjust unlimited inventory');
  END IF;

  v_delta := p_new_stock - v_current_stock;

  UPDATE reward_inventory
  SET current_stock = p_new_stock,
      updated_at = now()
  WHERE reward_id = p_reward_id;

  INSERT INTO reward_inventory_ledger (reward_id, transaction_type, amount, before_stock, after_stock, reference_type, reference_id, admin_id)
  VALUES (p_reward_id, 'ADJUSTMENT', v_delta, v_current_stock, p_new_stock, 'admin', p_reason, p_admin_id);

  RETURN jsonb_build_object('success', true, 'delta', v_delta, 'before', v_current_stock, 'after', p_new_stock);
END;
$$;

CREATE OR REPLACE FUNCTION release_reservation(
  p_reward_id INTEGER,
  p_quantity INTEGER DEFAULT 1
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reserved_stock INTEGER;
  v_current_stock INTEGER;
BEGIN
  SELECT current_stock, reserved_stock
  INTO v_current_stock, v_reserved_stock
  FROM reward_inventory
  WHERE reward_id = p_reward_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Inventory not found');
  END IF;

  UPDATE reward_inventory
  SET reserved_stock = GREATEST(reserved_stock - p_quantity, 0),
      updated_at = now()
  WHERE reward_id = p_reward_id;

  INSERT INTO reward_inventory_ledger (reward_id, transaction_type, amount, before_stock, after_stock, reference_type, reference_id)
  VALUES (p_reward_id, 'REFUND', p_quantity, v_current_stock, v_current_stock, 'release', 'system');

  RETURN jsonb_build_object('success', true, 'released', p_quantity);
END;
$$;
