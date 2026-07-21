-- Sprint D.2: Notification Channels (Push / Email / In-App)
--
-- Tables:
--   1. push_subscriptions — Web Push subscription storage per user
-- RPCs:
--   register_push_subscription, unregister_push_subscription

-- ============================================================
-- 1. push_subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL DEFAULT '',
  auth TEXT NOT NULL DEFAULT '',
  device_type TEXT NOT NULL DEFAULT 'web'
    CHECK (device_type IN ('web', 'android', 'ios')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ps_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_ps_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_ps_active ON push_subscriptions(user_id, is_active);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ps own read"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "ps own write"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "ps own delete"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "ps service role all"
  ON push_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. register_push_subscription
-- ============================================================
CREATE OR REPLACE FUNCTION register_push_subscription(
  p_endpoint TEXT,
  p_p256dh TEXT DEFAULT '',
  p_auth TEXT DEFAULT '',
  p_device_type TEXT DEFAULT 'web'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user UUID;
  v_id UUID;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, device_type, is_active)
  VALUES (v_user, p_endpoint, p_p256dh, p_auth, p_device_type, true)
  ON CONFLICT (endpoint) DO UPDATE
    SET is_active = true,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        device_type = EXCLUDED.device_type,
        updated_at = now()
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'subscription_id', v_id);
END;
$$;

-- ============================================================
-- 3. unregister_push_subscription
-- ============================================================
CREATE OR REPLACE FUNCTION unregister_push_subscription(p_endpoint TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user UUID;
BEGIN
  v_user := auth.uid();
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  UPDATE push_subscriptions
  SET is_active = false, updated_at = now()
  WHERE endpoint = p_endpoint AND user_id = v_user;

  RETURN jsonb_build_object('success', true, 'endpoint', p_endpoint);
END;
$$;
