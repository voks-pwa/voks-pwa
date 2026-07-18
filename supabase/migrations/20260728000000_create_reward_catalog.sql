-- Reward Catalog: synced from WordPress, operational data editable in Dashboard
-- WP owns: title, subtitle, description, image, sponsor, delivery_type, category,
--           terms, delivery_notes, bonus_vxp, campaign_slug, required fields
-- Dashboard owns: cost, featured, priority, reward_active, max_per_user

CREATE TABLE IF NOT EXISTS reward_catalog (
  id INTEGER PRIMARY KEY,                -- WP post ID
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',

  -- WP metadata
  delivery_type TEXT DEFAULT 'digital',
  reward_category TEXT DEFAULT '',
  sponsor TEXT DEFAULT '',
  terms TEXT DEFAULT '',
  delivery_notes TEXT DEFAULT '',
  bonus_vxp INTEGER DEFAULT 0,
  campaign_slug TEXT DEFAULT '',
  required_badge TEXT DEFAULT '',
  required_achievement TEXT DEFAULT '',
  vip_only BOOLEAN DEFAULT false,

  -- Operational (editable in Dashboard)
  cost INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  reward_active BOOLEAN DEFAULT true,
  max_per_user INTEGER DEFAULT 0,

  -- Sync metadata
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_catalog_slug ON reward_catalog (slug);
CREATE INDEX IF NOT EXISTS idx_reward_catalog_active ON reward_catalog (reward_active);
CREATE INDEX IF NOT EXISTS idx_reward_catalog_featured ON reward_catalog (featured);
CREATE INDEX IF NOT EXISTS idx_reward_catalog_category ON reward_catalog (reward_category);
CREATE INDEX IF NOT EXISTS idx_reward_catalog_campaign ON reward_catalog (campaign_slug);

ALTER TABLE reward_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reward catalog"
  ON reward_catalog FOR SELECT
  USING (true);

CREATE POLICY "Admin manage reward catalog"
  ON reward_catalog FOR ALL
  USING (auth.role() = 'service_role');
