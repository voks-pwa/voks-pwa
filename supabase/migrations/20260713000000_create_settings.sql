CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are readable by authenticated users"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Settings are writable by admins via edge function"
  ON settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO settings (key, value) VALUES
  ('XP_PER_MISSION', '50'),
  ('MISSION_COOLDOWN_MINUTES', '1440'),
  ('MAX_DAILY_MISSIONS', '10'),
  ('REDEMPTION_APPROVAL_REQUIRED', 'true'),
  ('MIN_XP_FOR_REDEMPTION', '100'),
  ('LISTEN_XP_PER_MINUTE', '2'),
  ('LISTEN_XP_DAILY_CAP', '100'),
  ('SITE_NAME', '"VOKS Radio"'),
  ('SITE_DESCRIPTION', '"VOKS Radio PWA — Earn XP, Complete Missions, Redeem Rewards"')
ON CONFLICT (key) DO NOTHING;
