CREATE TABLE IF NOT EXISTS missions_progress (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id BIGINT NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_missions_progress_user ON missions_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_progress_mission ON missions_progress(mission_id);

ALTER TABLE missions_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own mission progress"
  ON missions_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own mission progress"
  ON missions_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own mission progress"
  ON missions_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all mission progress"
  ON missions_progress FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
