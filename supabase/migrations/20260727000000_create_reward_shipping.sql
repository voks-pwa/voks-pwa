CREATE TABLE IF NOT EXISTS reward_shipping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  redeem_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id INTEGER NOT NULL,
  recipient_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  province TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  courier TEXT NOT NULL DEFAULT '',
  service TEXT NOT NULL DEFAULT '',
  tracking_number TEXT NOT NULL DEFAULT '',
  shipping_status TEXT NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_shipping_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipping_id UUID NOT NULL REFERENCES reward_shipping(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipping_redeem ON reward_shipping(redeem_id);
CREATE INDEX IF NOT EXISTS idx_shipping_user ON reward_shipping(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_status ON reward_shipping(shipping_status);
CREATE INDEX IF NOT EXISTS idx_shipping_timeline_ship ON reward_shipping_timeline(shipping_id);
CREATE INDEX IF NOT EXISTS idx_shipping_timeline_created ON reward_shipping_timeline(created_at DESC);

ALTER TABLE reward_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_shipping_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own shipping"
  ON reward_shipping FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages shipping"
  ON reward_shipping FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users read own shipping timeline"
  ON reward_shipping_timeline FOR SELECT
  TO authenticated
  USING (shipping_id IN (
    SELECT id FROM reward_shipping WHERE user_id = auth.uid()
  ));

CREATE POLICY "Service role manages shipping timeline"
  ON reward_shipping_timeline FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION create_shipping_record(
  p_redeem_id UUID,
  p_user_id UUID,
  p_reward_id INTEGER,
  p_recipient_name TEXT DEFAULT '',
  p_phone TEXT DEFAULT '',
  p_address TEXT DEFAULT '',
  p_province TEXT DEFAULT '',
  p_city TEXT DEFAULT '',
  p_postal_code TEXT DEFAULT ''
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_shipping_id UUID;
BEGIN
  INSERT INTO reward_shipping (
    redeem_id, user_id, reward_id, recipient_name, phone, address,
    province, city, postal_code, shipping_status
  ) VALUES (
    p_redeem_id, p_user_id, p_reward_id, p_recipient_name, p_phone,
    p_address, p_province, p_city, p_postal_code, 'PENDING'
  )
  RETURNING id INTO v_shipping_id;

  INSERT INTO reward_shipping_timeline (shipping_id, to_status, note)
  VALUES (v_shipping_id, 'PENDING', 'Shipping record created');

  RETURN jsonb_build_object('success', true, 'shipping_id', v_shipping_id);
END;
$$;

CREATE OR REPLACE FUNCTION update_shipping_status(
  p_shipping_id UUID,
  p_status TEXT,
  p_note TEXT DEFAULT '',
  p_created_by UUID DEFAULT NULL,
  p_tracking_number TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_status TEXT;
  v_current_tracking TEXT;
BEGIN
  SELECT shipping_status, tracking_number
  INTO v_current_status, v_current_tracking
  FROM reward_shipping
  WHERE id = p_shipping_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Shipping record not found');
  END IF;

  IF p_tracking_number IS NOT NULL AND p_tracking_number != '' THEN
    IF v_current_tracking IS NOT NULL AND v_current_tracking != '' THEN
      RETURN jsonb_build_object('success', false, 'error', 'Tracking number can only be assigned once');
    END IF;

    UPDATE reward_shipping
    SET tracking_number = p_tracking_number,
        shipping_status = p_status,
        updated_at = now()
    WHERE id = p_shipping_id;
  ELSE
    UPDATE reward_shipping
    SET shipping_status = p_status,
        updated_at = now()
    WHERE id = p_shipping_id;
  END IF;

  INSERT INTO reward_shipping_timeline (shipping_id, from_status, to_status, note, created_by)
  VALUES (p_shipping_id, v_current_status, p_status, p_note, p_created_by);

  RETURN jsonb_build_object('success', true, 'from', v_current_status, 'to', p_status, 'shipping_id', p_shipping_id);
END;
$$;

CREATE OR REPLACE FUNCTION get_shipping_queue(
  p_status TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  IF p_status IS NOT NULL AND p_status != '' THEN
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'redeem_id', s.redeem_id,
        'user_id', s.user_id,
        'reward_id', s.reward_id,
        'recipient_name', s.recipient_name,
        'phone', s.phone,
        'address', s.address,
        'city', s.city,
        'province', s.province,
        'postal_code', s.postal_code,
        'courier', s.courier,
        'service', s.service,
        'tracking_number', s.tracking_number,
        'shipping_status', s.shipping_status,
        'notes', s.notes,
        'created_at', s.created_at,
        'updated_at', s.updated_at,
        'status_history', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', t.id,
              'from_status', t.from_status,
              'to_status', t.to_status,
              'note', t.note,
              'created_by', t.created_by,
              'created_at', t.created_at
            ) ORDER BY t.created_at ASC
          ) FROM reward_shipping_timeline t WHERE t.shipping_id = s.id
        ), '[]'::jsonb)
      ) ORDER BY s.created_at DESC
    ) INTO v_result
    FROM reward_shipping s
    WHERE s.shipping_status = p_status;
  ELSE
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'redeem_id', s.redeem_id,
        'user_id', s.user_id,
        'reward_id', s.reward_id,
        'recipient_name', s.recipient_name,
        'phone', s.phone,
        'address', s.address,
        'city', s.city,
        'province', s.province,
        'postal_code', s.postal_code,
        'courier', s.courier,
        'service', s.service,
        'tracking_number', s.tracking_number,
        'shipping_status', s.shipping_status,
        'notes', s.notes,
        'created_at', s.created_at,
        'updated_at', s.updated_at,
        'status_history', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', t.id,
              'from_status', t.from_status,
              'to_status', t.to_status,
              'note', t.note,
              'created_by', t.created_by,
              'created_at', t.created_at
            ) ORDER BY t.created_at ASC
          ) FROM reward_shipping_timeline t WHERE t.shipping_id = s.id
        ), '[]'::jsonb)
      ) ORDER BY s.created_at DESC
    ) INTO v_result
    FROM reward_shipping s;
  END IF;

  RETURN jsonb_build_object('success', true, 'data', COALESCE(v_result, '[]'::jsonb));
END;
$$;
