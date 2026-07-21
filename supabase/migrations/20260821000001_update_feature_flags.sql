-- Enable mission and reward feature flags (re-run after repair mismatch)
INSERT INTO feature_flags (key, enabled, description) VALUES
  ('mission', true, 'Public mission feature'),
  ('reward', true, 'Public reward store feature')
ON CONFLICT (key) DO UPDATE SET enabled = true, updated_at = now();
