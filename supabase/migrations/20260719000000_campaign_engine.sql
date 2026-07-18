-- Sprint 11: Campaign Engine v1.0
-- Campaigns are an orchestration layer on top of the frozen Mission Engine.
-- They group missions (by WordPress mission id), carry schedule/status
-- metadata, and grant a completion reward via the Reward Engine.
-- Campaigns contain NO XP logic and NO mission validation logic.

CREATE TABLE IF NOT EXISTS campaigns (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  sponsor_name TEXT,
  campaign_type TEXT NOT NULL DEFAULT 'sponsored'
    CHECK (campaign_type IN (
      'sponsored', 'brand', 'season', 'radio_event',
      'festival', 'community', 'premium'
    )),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'scheduled', 'running', 'paused',
      'completed', 'expired', 'archived'
    )),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  reward_vxp INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns(active);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active campaigns"
  ON campaigns FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Service role manages campaigns"
  ON campaigns FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Join table linking a campaign to its missions (WordPress mission ids).
CREATE TABLE IF NOT EXISTS campaign_missions (
  id BIGSERIAL PRIMARY KEY,
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  mission_id BIGINT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0,
  UNIQUE (campaign_id, mission_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_missions_campaign
  ON campaign_missions(campaign_id);

ALTER TABLE campaign_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read campaign missions"
  ON campaign_missions FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role manages campaign missions"
  ON campaign_missions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Records that a user has been granted the campaign completion reward,
-- so it is never awarded twice (Reward Engine still enforces server-side).
CREATE TABLE IF NOT EXISTS campaign_rewards (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  reward_vxp INTEGER NOT NULL DEFAULT 0,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_rewards_user
  ON campaign_rewards(user_id);

ALTER TABLE campaign_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own campaign rewards"
  ON campaign_rewards FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role manages campaign rewards"
  ON campaign_rewards FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
