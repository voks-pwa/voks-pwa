-- Sprint D.5: Operations & Admin
--
-- Tables:
--   1. admin_audit_log     — admin action audit trail
--   2. feature_flags       — dynamic feature flags
--   3. system_config       — maintenance mode, version, app-level config
-- RPCs:
--   get_system_health      — DB connectivity + table counts

-- ============================================================
-- 1. admin_audit_log
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT DEFAULT '',
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT DEFAULT '',
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aal_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aal_actor ON admin_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_aal_entity ON admin_audit_log(entity);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aal service role all"
  ON admin_audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "aal superadmin read"
  ON admin_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- ============================================================
-- 2. feature_flags
-- ============================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO feature_flags (key, enabled, description) VALUES
  ('mission', false, 'Public mission feature'),
  ('reward', false, 'Public reward store feature'),
  ('admin', true, 'Admin panel access'),
  ('campaign', true, 'Campaign feature'),
  ('leaderboard', true, 'Leaderboard feature'),
  ('notification', true, 'Notification feature'),
  ('wallet', true, 'Wallet feature')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ff public read"
  ON feature_flags FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "ff service role write"
  ON feature_flags FOR INSERT, UPDATE, DELETE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. system_config
-- ============================================================
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO system_config (key, value) VALUES
  ('maintenance_mode', '{"enabled": false, "message": "We are currently undergoing maintenance. Please check back shortly."}'),
  ('app_version', '{"version": "1.0.0", "build_number": "20260721", "build_date": "2026-07-21T00:00:00Z"}')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sc public read"
  ON system_config FOR SELECT
  TO anon, authenticated
  USING (key IN ('maintenance_mode', 'app_version'));

CREATE POLICY "sc service role all"
  ON system_config FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. get_system_health — DB connectivity + table row counts
-- ============================================================
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_db_ok BOOLEAN;
  v_user_count INT;
  v_mission_count INT;
  v_redeem_count INT;
  v_txn_count INT;
BEGIN
  v_db_ok := true;

  SELECT COUNT(*) INTO v_user_count FROM profiles;
  SELECT COUNT(*) INTO v_mission_count FROM missions_progress;
  SELECT COUNT(*) INTO v_redeem_count FROM reward_redemptions;
  SELECT COUNT(*) INTO v_txn_count FROM wallet_ledger;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'healthy',
    'database', jsonb_build_object(
      'connected', v_db_ok,
      'profiles', v_user_count,
      'missions_progress', v_mission_count,
      'reward_redemptions', v_redeem_count,
      'wallet_ledger', v_txn_count
    ),
    'timestamp', now()
  );
END;
$$;
