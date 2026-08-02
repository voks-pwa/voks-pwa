# SQL RPCs — Functions & Queries

## Migration Baru: `20260829000000_fix_rls_mission.sql`

### RPC 1: `update_profile_safe`

Update profile fields dengan bypass RLS (SECURITY DEFINER).

**Digunakan oleh**: `profileRepository.ts` (menggantikan `supabase.from("profiles").update()`)

```sql
CREATE OR REPLACE FUNCTION update_profile_safe(
  p_user_id UUID,
  p_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  UPDATE profiles
  SET
    full_name          = COALESCE(p_data->>'full_name', full_name),
    display_name       = COALESCE(p_data->>'display_name', display_name),
    bio                = COALESCE(p_data->>'bio', bio),
    phone_number       = COALESCE(p_data->>'phone_number', phone_number),
    birthday           = COALESCE(p_data->>'birthday', birthday),
    gender             = COALESCE(p_data->>'gender', gender),
    city               = COALESCE(p_data->>'city', city),
    province           = COALESCE(p_data->>'province', province),
    favorite_program   = COALESCE(p_data->>'favorite_program', favorite_program),
    favorite_music     = COALESCE(p_data->>'favorite_music', favorite_music),
    instagram          = COALESCE(p_data->>'instagram', instagram),
    tiktok             = COALESCE(p_data->>'tiktok', tiktok),
    youtube            = COALESCE(p_data->>'youtube', youtube),
    facebook           = COALESCE(p_data->>'facebook', facebook),
    threads            = COALESCE(p_data->>'threads', threads),
    website            = COALESCE(p_data->>'website', website),
    avatar_url         = COALESCE(p_data->>'avatar_url', avatar_url),
    avatar_asset_id    = COALESCE((p_data->>'avatar_asset_id')::UUID, avatar_asset_id),
    email              = COALESCE(p_data->>'email', email),
    referral_code      = COALESCE(p_data->>'referral_code', referral_code),
    profile_completed  = COALESCE((p_data->>'profile_completed')::BOOLEAN, profile_completed),
    profile_reward_claimed = COALESCE((p_data->>'profile_reward_claimed')::BOOLEAN, profile_reward_claimed)
  WHERE id = p_user_id
  RETURNING * INTO v_profile;

  -- Insert fallback kalo row belum ada
  IF NOT FOUND THEN
    INSERT INTO profiles (id, email, full_name, display_name)
    VALUES (
      p_user_id,
      COALESCE(p_data->>'email', ''),
      COALESCE(p_data->>'full_name', ''),
      COALESCE(p_data->>'display_name', '')
    )
    RETURNING * INTO v_profile;
  END IF;

  RETURN row_to_json(v_profile)::JSONB;
END;
$$;
```

**Catatan**: `COALESCE(p_data->>'field', existing_value)` — kalo field gak ada di JSON, pake nilai lama.

---

### RPC 2: `set_referred_by`

Set referrer untuk user baru.

**Digunakan oleh**: `authService.ts` (`processReferralAfterLogin`)

```sql
CREATE OR REPLACE FUNCTION set_referred_by(
  p_user_id UUID,
  p_referrer_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE profiles
  SET referred_by = p_referrer_id
  WHERE id = p_user_id;
END;
$$;
```

---

### RPC 3: `set_profile_completion`

Tandai profile sebagai completed + reward claimed.

**Digunakan oleh**: `profileService.ts` (`updateProfile`), `authService.ts` (`checkAndFireProfileCompletion`)

```sql
CREATE OR REPLACE FUNCTION set_profile_completion(
  p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE profiles
  SET profile_completed = true,
      profile_reward_claimed = true
  WHERE id = p_user_id;
END;
$$;
```

---

### RPC 4: `claim_mission_reward` (FIX)

Sama seperti existing, tapi update `lifetime_vxp` juga.

```sql
CREATE OR REPLACE FUNCTION claim_mission_reward(
  p_user_id UUID,
  p_mission_id BIGINT,
  p_reward_vxp INTEGER,
  p_period TEXT DEFAULT 'once'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_progress RECORD;
  v_current_vxp INTEGER;
BEGIN
  -- Lock row anti-race
  SELECT * INTO v_progress
  FROM missions_progress
  WHERE user_id = p_user_id AND mission_id = p_mission_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission not joined');
  END IF;

  IF NOT v_progress.completed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Mission not completed');
  END IF;

  IF v_progress.claimed THEN
    RETURN jsonb_build_object('success', false, 'error', 'Reward already claimed');
  END IF;

  -- Mark claimed
  UPDATE missions_progress
  SET claimed = true, claimed_at = now(), mission_state = 'CLAIMED'
  WHERE id = v_progress.id;

  -- ★ FIX: Update lifetime_vxp juga
  UPDATE profiles
  SET current_vxp = current_vxp + p_reward_vxp,
      lifetime_vxp = lifetime_vxp + p_reward_vxp
  WHERE id = p_user_id
  RETURNING current_vxp INTO v_current_vxp;

  INSERT INTO mission_completions (user_id, mission_id, reward_vxp)
  VALUES (p_user_id, p_mission_id, p_reward_vxp);

  RETURN jsonb_build_object(
    'success', true,
    'reward', p_reward_vxp,
    'current_vxp', v_current_vxp
  );
END;
$$;
```

---

## Existing RPCs — Status

| RPC | File | Status | Notes |
|-----|------|--------|-------|
| `claim_mission_reward` | `20260716000002` | 🔴 FIX | Tambah `lifetime_vxp` update |
| `claim_mission_reward` (duplicate) | `20260716000003` | 🔴 DUPLIKAT | Perlu dihapus atau diselaraskan |
| `claim_mission_reward` (duplicate 2) | `20260729000000` | 🔴 DUPLIKAT | Perlu dihapus atau diselaraskan |
| `credit_wallet` | `20260723000000` | ✅ OK | Update current + lifetime |
| `commit_transaction` | `20260801000000` | ✅ OK | Update lifetime on credit only |
| `create_transaction` | `20260801000000` | ✅ OK | Create pending transaction |
| `calculate_badge_for_user` | `20260822000003` | ✅ OK | Baca dari `xp_badges` + `lifetime_vxp` |
| `calculate_level_from_xp` | `20260822000003` | ✅ OK | Baca dari `xp_levels` + `lifetime_vxp` |
| `get_xp_levels` | `20260822000003` | ✅ OK | Return all levels |
| `update_profile_safe` | **BARU** | 🆕 New | Phase 0 |
| `set_referred_by` | **BARU** | 🆕 New | Phase 0 |
| `set_profile_completion` | **BARU** | 🆕 New | Phase 0 |

---

## Query Debug

```sql
-- Cek referal code user
SELECT id, referral_code, referred_by, current_vxp, lifetime_vxp
FROM profiles
WHERE referral_code IS NOT NULL
ORDER BY created_at DESC;

-- Cek mission progress user
SELECT mp.*, m.title
FROM missions_progress mp
LEFT JOIN ...missions m ON mp.mission_id = m.id
WHERE mp.user_id = '<user_id>'
ORDER BY mp.updated_at DESC;

-- Cek reward grants untuk mission
SELECT * FROM reward_grants
WHERE source = 'mission'
  AND user_id = '<user_id>'
ORDER BY granted_at DESC;

-- Cek claim duplikat — Cari claim yang reference_id-nya beda format
SELECT user_id, reference_id, COUNT(*)
FROM reward_grants
WHERE source = 'mission'
GROUP BY user_id, reference_id
HAVING COUNT(*) > 1;

-- Cek total VXP
SELECT id, current_vxp, lifetime_vxp, badge_name
FROM profiles
WHERE id = '<user_id>';

-- Cek badge thresholds
SELECT * FROM xp_badges ORDER BY xp_required;

-- Cek level thresholds
SELECT * FROM xp_levels ORDER BY xp_required;
```
