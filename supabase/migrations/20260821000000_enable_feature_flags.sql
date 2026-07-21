-- Enable mission and reward feature flags for public launch
UPDATE feature_flags SET enabled = true, updated_at = now() WHERE key = 'mission';
UPDATE feature_flags SET enabled = true, updated_at = now() WHERE key = 'reward';
