CREATE TABLE IF NOT EXISTS reward_redeems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id INTEGER NOT NULL,
  reward_title TEXT NOT NULL DEFAULT '',
  required_vxp INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'PENDING',
  approval_required BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  tracking_number TEXT,
  shipping_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_redeems_user ON reward_redeems(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redeems_status ON reward_redeems(status);
CREATE INDEX IF NOT EXISTS idx_reward_redeems_reward ON reward_redeems(reward_id);

ALTER TABLE reward_redeems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own redeems"
  ON reward_redeems FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own redeems"
  ON reward_redeems FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all redeems"
  ON reward_redeems FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
