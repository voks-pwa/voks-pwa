-- Restrict profiles UPDATE to user-safe columns only
-- Prevents privilege escalation (role, current_vxp, level, referral_code, etc.)

DROP POLICY IF EXISTS "Users update own profile" ON profiles;

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND (
      COALESCE(role, 'member') = COALESCE(
        (SELECT p.role FROM profiles p WHERE p.id = auth.uid()),
        'member'
      )
    )
    AND (
      COALESCE(current_vxp, 0) = COALESCE(
        (SELECT p.current_vxp FROM profiles p WHERE p.id = auth.uid()),
        0
      )
    )
    AND (
      COALESCE(lifetime_vxp, 0) = COALESCE(
        (SELECT p.lifetime_vxp FROM profiles p WHERE p.id = auth.uid()),
        0
      )
    )
    AND (
      COALESCE(level, 1) = COALESCE(
        (SELECT p.level FROM profiles p WHERE p.id = auth.uid()),
        1
      )
    )
    AND (
      COALESCE(profile_completed, false) = COALESCE(
        (SELECT p.profile_completed FROM profiles p WHERE p.id = auth.uid()),
        false
      )
    )
    AND (
      COALESCE(completed_profile, false) = COALESCE(
        (SELECT p.completed_profile FROM profiles p WHERE p.id = auth.uid()),
        false
      )
    )
    AND (
      COALESCE(profile_reward_claimed, false) = COALESCE(
        (SELECT p.profile_reward_claimed FROM profiles p WHERE p.id = auth.uid()),
        false
      )
    )
    AND (
      referral_code IS NOT DISTINCT FROM (
        SELECT p.referral_code FROM profiles p WHERE p.id = auth.uid()
      )
    )
    AND (
      referred_by IS NOT DISTINCT FROM (
        SELECT p.referred_by FROM profiles p WHERE p.id = auth.uid()
      )
    )
    AND (
      email IS NOT DISTINCT FROM (
        SELECT p.email FROM profiles p WHERE p.id = auth.uid()
      )
    )
    AND (
      badge_name IS NOT DISTINCT FROM (
        SELECT p.badge_name FROM profiles p WHERE p.id = auth.uid()
      )
    )
    AND (
      created_at IS NOT DISTINCT FROM (
        SELECT p.created_at FROM profiles p WHERE p.id = auth.uid()
      )
    )
  );
