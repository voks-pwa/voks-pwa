-- Sprint 10: Leaderboard Engine v1.0
-- Ranking snapshot store. The Leaderboard Engine is READ ONLY; snapshots
-- are written by an admin refresh action (separate path), never by the
-- read query. Used to compute rank delta (previous_rank).

CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  period TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  batch_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (period, user_id, batch_at)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_period_batch
  ON leaderboard_snapshots(period, batch_at);
CREATE INDEX IF NOT EXISTS idx_leaderboard_snapshots_user
  ON leaderboard_snapshots(user_id);

ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read leaderboard snapshots"
  ON leaderboard_snapshots FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role manages snapshots"
  ON leaderboard_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Returns the full most-recent snapshot batch for a period.
CREATE OR REPLACE FUNCTION latest_leaderboard_snapshot(p_period TEXT)
RETURNS TABLE (user_id UUID, rank INTEGER)
LANGUAGE sql
STABLE
AS $$
  SELECT s.user_id, s.rank
  FROM leaderboard_snapshots s
  WHERE s.period = p_period
    AND s.batch_at = (
      SELECT MAX(batch_at)
      FROM leaderboard_snapshots
      WHERE period = p_period
    );
$$;
