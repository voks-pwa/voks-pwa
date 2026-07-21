-- Sprint C.6: Commerce Engine
--
-- Tables:
--   1. commerce_events — event log for commerce activities
--   2. marketplace_fulfillment — order fulfillment tracking
--   3. refund_records — refund tracking
-- RPCs:
--   record_commerce_event, create_fulfillment, update_fulfillment_status,
--   process_refund, get_commerce_analytics

-- ============================================================
-- 1. commerce_events
-- ============================================================
CREATE TABLE IF NOT EXISTS commerce_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES marketplace_orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES marketplace_products(id) ON DELETE SET NULL,
  amount INT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ce_event_type ON commerce_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ce_user ON commerce_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ce_order ON commerce_events(order_id);
CREATE INDEX IF NOT EXISTS idx_ce_created ON commerce_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ce_event_created ON commerce_events(event_type, created_at);

ALTER TABLE commerce_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ce service role all"
  ON commerce_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "ce users read own"
  ON commerce_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 2. marketplace_fulfillment
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_fulfillment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED')),
  tracking_number TEXT DEFAULT '',
  carrier TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  estimated_delivery DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_mf_order ON marketplace_fulfillment(order_id);
CREATE INDEX IF NOT EXISTS idx_mf_status ON marketplace_fulfillment(status);

ALTER TABLE marketplace_fulfillment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mf service role all"
  ON marketplace_fulfillment FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "mf users read own"
  ON marketplace_fulfillment FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_orders WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. refund_records
-- ============================================================
CREATE TABLE IF NOT EXISTS refund_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount INT NOT NULL CHECK (amount > 0),
  reason TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
  refund_method TEXT NOT NULL DEFAULT 'WALLET'
    CHECK (refund_method IN ('WALLET', 'GATEWAY')),
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rr_order ON refund_records(order_id);
CREATE INDEX IF NOT EXISTS idx_rr_user ON refund_records(user_id);
CREATE INDEX IF NOT EXISTS idx_rr_status ON refund_records(status);

ALTER TABLE refund_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rr service role all"
  ON refund_records FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "rr users read own"
  ON refund_records FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 4. record_commerce_event
-- ============================================================
CREATE OR REPLACE FUNCTION record_commerce_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_product_id UUID DEFAULT NULL,
  p_amount INT DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO commerce_events (event_type, user_id, order_id, product_id, amount, metadata)
  VALUES (p_event_type, p_user_id, p_order_id, p_product_id, p_amount, p_metadata)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'event_id', v_id);
END;
$$;

-- ============================================================
-- 5. create_fulfillment
-- ============================================================
CREATE OR REPLACE FUNCTION create_fulfillment(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_status TEXT;
  v_fulfillment_id UUID;
BEGIN
  SELECT order_status INTO v_order_status
  FROM marketplace_orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  IF v_order_status NOT IN ('PAID', 'PROCESSING') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order must be PAID or PROCESSING');
  END IF;

  INSERT INTO marketplace_fulfillment (order_id, status)
  VALUES (p_order_id, 'PENDING')
  ON CONFLICT (order_id) DO NOTHING
  RETURNING id INTO v_fulfillment_id;

  IF v_fulfillment_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Fulfillment already exists');
  END IF;

  UPDATE marketplace_orders
  SET order_status = 'PROCESSING', updated_at = now()
  WHERE id = p_order_id AND order_status = 'PAID';

  INSERT INTO commerce_events (event_type, order_id, metadata)
  VALUES ('fulfillment_started', p_order_id, jsonb_build_object('fulfillment_id', v_fulfillment_id));

  RETURN jsonb_build_object('success', true, 'fulfillment_id', v_fulfillment_id);
END;
$$;

-- ============================================================
-- 6. update_fulfillment_status
-- ============================================================
CREATE OR REPLACE FUNCTION update_fulfillment_status(
  p_fulfillment_id UUID,
  p_status TEXT,
  p_tracking_number TEXT DEFAULT '',
  p_carrier TEXT DEFAULT '',
  p_notes TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  SELECT order_id INTO v_order_id
  FROM marketplace_fulfillment
  WHERE id = p_fulfillment_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Fulfillment not found');
  END IF;

  UPDATE marketplace_fulfillment
  SET status = p_status,
      tracking_number = CASE WHEN p_tracking_number != '' THEN p_tracking_number ELSE tracking_number END,
      carrier = CASE WHEN p_carrier != '' THEN p_carrier ELSE carrier END,
      notes = CASE WHEN p_notes != '' THEN p_notes ELSE notes END,
      updated_at = now()
  WHERE id = p_fulfillment_id;

  IF p_status IN ('DELIVERED', 'COMPLETED') THEN
    UPDATE marketplace_orders
    SET order_status = 'COMPLETED', updated_at = now()
    WHERE id = v_order_id;
  END IF;

  INSERT INTO commerce_events (event_type, order_id, metadata)
  VALUES ('fulfillment_' || lower(p_status), v_order_id,
    jsonb_build_object('fulfillment_id', p_fulfillment_id, 'tracking_number', p_tracking_number));

  RETURN jsonb_build_object('success', true, 'fulfillment_id', p_fulfillment_id, 'status', p_status);
END;
$$;

-- ============================================================
-- 7. process_refund — atomic wallet credit + inventory restore + order cancellation
-- ============================================================
CREATE OR REPLACE FUNCTION process_refund(
  p_refund_id UUID,
  p_status TEXT,
  p_processed_by UUID DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_refund RECORD;
  v_order RECORD;
  v_item RECORD;
BEGIN
  SELECT * INTO v_refund
  FROM refund_records
  WHERE id = p_refund_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Refund not found');
  END IF;

  IF v_refund.status != 'PENDING' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Refund already processed');
  END IF;

  IF p_status = 'REJECTED' THEN
    UPDATE refund_records
    SET status = 'REJECTED',
        processed_by = p_processed_by,
        processed_at = now(),
        updated_at = now()
    WHERE id = p_refund_id;
    RETURN jsonb_build_object('success', true, 'refund_id', p_refund_id, 'status', 'REJECTED');
  END IF;

  SELECT * INTO v_order FROM marketplace_orders WHERE id = v_refund.order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- Restore inventory for each item
  FOR v_item IN
    SELECT * FROM marketplace_order_items WHERE order_id = v_refund.order_id
  LOOP
    UPDATE marketplace_inventory
    SET total_stock = total_stock + v_item.quantity
    WHERE product_id = v_item.product_id AND unlimited = false;
  END LOOP;

  -- Refund marketplace vouchers assigned for this order's products
  UPDATE marketplace_voucher_pool
  SET status = 'AVAILABLE', assigned_user = NULL, assigned_at = NULL
  WHERE assigned_user = v_refund.user_id
    AND status = 'ASSIGNED'
    AND product_id IN (
      SELECT product_id FROM marketplace_order_items WHERE order_id = v_refund.order_id
    );

  -- Update order status to REFUNDED
  UPDATE marketplace_orders
  SET order_status = 'REFUNDED', updated_at = now()
  WHERE id = v_refund.order_id;

  -- Mark refund as COMPLETED
  UPDATE refund_records
  SET status = 'COMPLETED',
      processed_by = p_processed_by,
      processed_at = now(),
      updated_at = now()
  WHERE id = p_refund_id;

  INSERT INTO commerce_events (event_type, user_id, order_id, amount, metadata)
  VALUES ('refund_completed', v_refund.user_id, v_refund.order_id, v_refund.amount,
    jsonb_build_object('refund_id', p_refund_id, 'refund_method', v_refund.refund_method));

  RETURN jsonb_build_object(
    'success', true,
    'refund_id', p_refund_id,
    'status', 'COMPLETED',
    'order_status', 'REFUNDED'
  );
END;
$$;

-- ============================================================
-- 8. get_commerce_analytics — aggregate commerce stats
-- ============================================================
CREATE OR REPLACE FUNCTION get_commerce_analytics(
  p_days INT DEFAULT 30
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_revenue INT;
  v_orders INT;
  v_fulfillments INT;
  v_refunds INT;
  v_refund_amount INT;
  v_top_products JSONB;
  v_daily_events JSONB;
BEGIN
  SELECT COALESCE(SUM(total_amount), 0) INTO v_revenue
  FROM marketplace_orders
  WHERE order_status IN ('PAID', 'PROCESSING', 'COMPLETED')
    AND updated_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_orders
  FROM marketplace_orders
  WHERE order_status NOT IN ('DRAFT')
    AND created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_fulfillments
  FROM marketplace_fulfillment
  WHERE created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_refunds
  FROM refund_records
  WHERE created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COALESCE(SUM(amount), 0) INTO v_refund_amount
  FROM refund_records
  WHERE status = 'COMPLETED'
    AND created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT jsonb_agg(sub) INTO v_top_products
  FROM (
    SELECT oi.product_id, oi.product_name, SUM(oi.quantity) as total_qty, SUM(oi.subtotal) as total_revenue
    FROM marketplace_order_items oi
    JOIN marketplace_orders o ON o.id = oi.order_id
    WHERE o.order_status NOT IN ('DRAFT', 'CANCELLED')
      AND o.created_at >= now() - (p_days || ' days')::INTERVAL
    GROUP BY oi.product_id, oi.product_name
    ORDER BY total_revenue DESC
    LIMIT 10
  ) sub;

  SELECT jsonb_agg(sub) INTO v_daily_events
  FROM (
    SELECT date(created_at) as day, event_type, COUNT(*) as count
    FROM commerce_events
    WHERE created_at >= now() - (p_days || ' days')::INTERVAL
    GROUP BY date(created_at), event_type
    ORDER BY day DESC
    LIMIT 30
  ) sub;

  RETURN jsonb_build_object(
    'success', true,
    'revenue', v_revenue,
    'total_orders', v_orders,
    'fulfillments', v_fulfillments,
    'refunds', v_refunds,
    'refund_amount', v_refund_amount,
    'top_products', COALESCE(v_top_products, '[]'::JSONB),
    'daily_events', COALESCE(v_daily_events, '[]'::JSONB)
  );
END;
$$;
