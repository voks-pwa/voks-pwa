-- Sprint 8.1: Add profile snapshot columns to live_messages
-- Enables avatar/display_name/badge/level in realtime chat without extra fetches
ALTER TABLE live_messages
  ADD COLUMN display_name TEXT,
  ADD COLUMN avatar_url TEXT,
  ADD COLUMN badge_name TEXT,
  ADD COLUMN level INTEGER NOT NULL DEFAULT 0;
