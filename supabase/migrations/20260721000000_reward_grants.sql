-- Reward grants idempotency ledger.
-- Every reward action (XP, badge, achievement unlock, milestone, login bonus,
-- referral bonus, profile bonus, admin bonus) is recorded here.
-- UNIQUE(user_id, source, reference_id) ensures that the same reward
-- for the same user + source is never granted twice.
CREATE TABLE IF NOT EXISTS reward_grants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN (
    'mission', 'achievement', 'milestone', 'login_reward',
    'badge', 'referral', 'profile', 'admin'
  )),
  reference_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, source, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_reward_grants_user ON reward_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_grants_lookup ON reward_grants(user_id, source, reference_id);

ALTER TABLE reward_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reward grants"
  ON reward_grants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own reward grants"
  ON reward_grants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
