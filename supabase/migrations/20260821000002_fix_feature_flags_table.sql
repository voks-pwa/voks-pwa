-- Recreate feature_flags table if missing (production fix for migration 20260811000000)
CREATE TABLE IF NOT EXISTS feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT true,
  description TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO feature_flags (key, enabled, description) VALUES
  ('mission', true, 'Public mission feature'),
  ('reward', true, 'Public reward store feature'),
  ('admin', true, 'Admin panel access'),
  ('campaign', true, 'Campaign feature'),
  ('leaderboard', true, 'Leaderboard feature'),
  ('notification', true, 'Notification feature'),
  ('wallet', true, 'Wallet feature')
ON CONFLICT (key) DO UPDATE SET enabled = EXCLUDED.enabled, updated_at = now();

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
