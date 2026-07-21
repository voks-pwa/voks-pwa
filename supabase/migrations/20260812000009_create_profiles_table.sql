-- Create profiles table — referenced by 19+ tables but never defined in any migration.
-- This assumes profiles is created by Supabase template or manually.
-- Using IF NOT EXISTS and CREATE OR REPLACE to be safe.

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL DEFAULT '',

  full_name TEXT,
  display_name TEXT,
  bio TEXT,
  phone_number TEXT,
  phone TEXT,
  avatar_url TEXT,

  instagram TEXT,
  tiktok TEXT,
  youtube TEXT,
  facebook TEXT,
  threads TEXT,
  website TEXT,

  birthday TEXT,
  birth_date TEXT,
  gender TEXT,
  city TEXT,
  province TEXT,
  favorite_program TEXT,
  favorite_music TEXT,

  profile_completed BOOLEAN NOT NULL DEFAULT false,
  completed_profile BOOLEAN NOT NULL DEFAULT false,
  profile_reward_claimed BOOLEAN NOT NULL DEFAULT false,

  level INTEGER NOT NULL DEFAULT 1,
  current_vxp INTEGER NOT NULL DEFAULT 0,
  lifetime_vxp INTEGER NOT NULL DEFAULT 0,
  badge_name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  referral_code TEXT,
  referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_referral ON profiles(referral_code);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'superadmin')));

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, avatar_url, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_profile_on_signup ON auth.users;
CREATE TRIGGER trg_create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_on_signup();
