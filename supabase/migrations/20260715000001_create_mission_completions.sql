CREATE TABLE IF NOT EXISTS mission_completions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id BIGINT NOT NULL,
  reward_vxp INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mission_completions_user ON mission_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_completions_mission ON mission_completions(mission_id);

ALTER TABLE mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own completions"
  ON mission_completions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all completions"
  ON mission_completions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
