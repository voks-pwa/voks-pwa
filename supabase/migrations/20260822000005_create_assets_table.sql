-- Create assets table for Asset Management System
-- Database hanya menyimpan metadata, bukan binary image

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'avatar', 'announcer', 'program', 'campaign',
    'reward', 'marketplace', 'badge', 'achievement', 'promo'
  )),
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  thumbnail_url TEXT,
  mime_type TEXT NOT NULL DEFAULT 'image/webp',
  size INTEGER NOT NULL DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assets_owner_id ON assets(owner_id);
CREATE INDEX idx_assets_asset_type ON assets(asset_type);
CREATE INDEX idx_assets_storage_path ON assets(storage_path);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

-- RLS: public read, owner write
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assets are publicly readable"
  ON assets FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own assets"
  ON assets FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own assets"
  ON assets FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own assets"
  ON assets FOR DELETE
  USING (owner_id = auth.uid());