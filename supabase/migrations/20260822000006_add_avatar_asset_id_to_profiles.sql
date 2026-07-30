ALTER TABLE profiles
ADD COLUMN avatar_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_avatar_asset_id ON profiles(avatar_asset_id);
