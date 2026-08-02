# Phase Plan — Mission & Reward

## Phase 0: Fix RLS — System update via SECURITY DEFINER RPC

**Goal**: Bypass RLS untuk update kolom yang perlu diubah system.

### Files

| # | File | Action |
|---|------|--------|
| 0.1 | `supabase/migrations/20260829000000_fix_rls_mission.sql` | **BARU** — 3 RPC SECURITY DEFINER |
| 0.2 | `src/features/profile/services/profileRepository.ts` | Ganti `updateProfileRow` panggil RPC untuk update kolom terproteksi |
| 0.3 | `src/features/auth/authService.ts` | `processReferralAfterLogin` panggil RPC `set_referred_by` |
| 0.4 | `src/features/profile/services/profileService.ts` | `updateProfile` pake RPC untuk `profile_completed`+`profile_reward_claimed` |

### Detail 0.1 — Migration

```sql
-- RPC 1: Update profile safe (user fields + system fields)
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
    full_name = COALESCE(p_data->>'full_name', full_name),
    display_name = COALESCE(p_data->>'display_name', display_name),
    bio = COALESCE(p_data->>'bio', bio),
    phone_number = COALESCE(p_data->>'phone_number', phone_number),
    birthday = COALESCE(p_data->>'birthday', birthday),
    gender = COALESCE(p_data->>'gender', gender),
    city = COALESCE(p_data->>'city', city),
    province = COALESCE(p_data->>'province', province),
    favorite_program = COALESCE(p_data->>'favorite_program', favorite_program),
    favorite_music = COALESCE(p_data->>'favorite_music', favorite_music),
    instagram = COALESCE(p_data->>'instagram', instagram),
    tiktok = COALESCE(p_data->>'tiktok', tiktok),
    youtube = COALESCE(p_data->>'youtube', youtube),
    facebook = COALESCE(p_data->>'facebook', facebook),
    threads = COALESCE(p_data->>'threads', threads),
    website = COALESCE(p_data->>'website', website),
    avatar_url = COALESCE(p_data->>'avatar_url', avatar_url),
    avatar_asset_id = COALESCE((p_data->>'avatar_asset_id')::UUID, avatar_asset_id),
    referral_code = COALESCE(p_data->>'referral_code', referral_code),
    profile_completed = COALESCE((p_data->>'profile_completed')::BOOLEAN, profile_completed),
    profile_reward_claimed = COALESCE((p_data->>'profile_reward_claimed')::BOOLEAN, profile_reward_claimed)
  WHERE id = p_user_id
  RETURNING * INTO v_profile;

  IF NOT FOUND THEN
    INSERT INTO profiles (id, email, full_name)
    VALUES (p_user_id, COALESCE(p_data->>'email', ''), COALESCE(p_data->>'full_name', ''))
    RETURNING * INTO v_profile;
  END IF;

  RETURN row_to_json(v_profile)::JSONB;
END;
$$;

-- RPC 2: Set referred_by
CREATE OR REPLACE FUNCTION set_referred_by(
  p_user_id UUID,
  p_referrer_id UUID
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE profiles SET referred_by = p_referrer_id WHERE id = p_user_id;
END;
$$;

-- RPC 3: Set profile completion flags
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

-- RPC 4: Fix claim_mission_reward — update lifetime_vxp juga
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

  UPDATE missions_progress
  SET claimed = true, claimed_at = now(), mission_state = 'CLAIMED'
  WHERE id = v_progress.id;

  UPDATE profiles
  SET current_vxp = current_vxp + p_reward_vxp,
      lifetime_vxp = lifetime_vxp + p_reward_vxp   -- ★ FIX: update lifetime_vxp
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

### Detail 0.2 — profileRepository.ts

Ganti `updateProfileRow` panggil `update_profile_safe` RPC:

```ts
export async function updateProfileRow(id: string, input: UpdateProfileInput) {
  const { data, error } = await supabase.rpc("update_profile_safe", {
    p_user_id: id,
    p_data: input,
  });

  if (error) throw error;
  return data as Profile;
}
```

### Detail 0.3 — authService.ts

```ts
// Ganti updateProfileRow user_id, { referred_by: referrer.id }
await supabase.rpc("set_referred_by", {
  p_user_id: userId,
  p_referrer_id: referrer.id,
});
```

### Detail 0.4 — profileService.ts

```ts
// Ganti updateProfileRow(id, updates) dengan RPC
await supabase.rpc("set_profile_completion", { p_user_id: id });
```

---

## Phase 1: Referral Code "voks-XXXX" + Route /ref/:code

**Goal**: Format referral code + referral link yang bisa digunakan.

### Files

| # | File | Action |
|---|------|--------|
| 1.1 | `src/features/profile/services/profileService.ts` | Ubah `generateReferralCode()` ke format `voks-{4digit}` |
| 1.2 | `src/router.tsx` (atau AppRouter) | Tambah route `/ref/:code` |
| 1.3 | `src/pages/ReferralLandingPage.tsx` | **BARU** — baca code, save ke localStorage, redirect |

### Detail 1.1 — generateReferralCode

```ts
function generateReferralCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `voks-${digits}`
}
```

Perlu tambah validasi uniqueness:
```ts
async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = `voks-${Math.floor(1000 + Math.random() * 9000)}`
    const existing = await findProfileByReferralCode(code)
    if (!existing) return code
  }
  throw new Error("Failed to generate unique referral code")
}
```

### Detail 1.2 — Route

```tsx
<Route path="/ref/:code" element={<ReferralLandingPage />} />
```

### Detail 1.3 — ReferralLandingPage

```tsx
export function ReferralLandingPage() {
  const { code } = useParams()
  const { user } = useAuth()

  useEffect(() => {
    if (!code) return
    saveReferralCode(code)  // localStorage
    if (user) {
      // User sudah login — langsung proses referral
      handlePostLogin(user)
    }
    navigate("/login")
  }, [code, user])

  return <Loader2 />  // Loading spinner
}
```

---

## Phase 2: New ACF Time Fields

**Goal**: Map field baru `timeStart/timeEnd` (daily window) + `dateStart/dateEnd` (campaign period).

### Files

| # | File | Action |
|---|------|--------|
| 2.1 | `src/features/missions/types/mission.ts` | Tambah `dateStart`, `dateEnd`, `timeStart`, `timeEnd` |
| 2.2 | `src/features/missions/services/missionTypes.ts` | Tambah di WPMission ACF type |
| 2.3 | `src/features/missions/services/missionMapper.ts` | Map field baru |
| 2.4 | `src/features/missions/services/missionAvailability.ts` | Refactor `isMissionAvailableNow` + tambah `isMissionInCampaignPeriod` |
| 2.5 | `src/features/missions/services/missionValidator.ts` | Tambah pengecekan campaign period di `canRunMission` |

### Detail 2.1 — MissionConfig type

```ts
export interface MissionConfig {
  // ... existing fields ...
  dateStart: string      // campaign start datetime
  dateEnd: string        // campaign end datetime
  timeStart: string      // daily time window start (HH:MM)
  timeEnd: string        // daily time window end (HH:MM)
}
```

### Detail 2.3 — missionMapper.ts

```ts
dateStart: wp.acf?.mission_start ?? "",
dateEnd: wp.acf?.mission_end ?? "",
timeStart: wp.acf?.mission_time_start ?? "",
timeEnd: wp.acf?.mission_time_end ?? "",
```

### Detail 2.4 — missionAvailability.ts

```ts
function parseTime(value?: string) {
  if (!value) return null
  const timePart = value.includes(' ') ? value.split(' ')[1] : value
  const [h, m] = timePart.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}

// Daily time window — jam berapa mission tersedia hari ini
export function isMissionAvailableNow(mission: MissionConfig) {
  if (!mission.active) return false

  const start = parseTime(mission.timeStart)
  const end = parseTime(mission.timeEnd)

  if (start === null || end === null) return true  // 24/7

  const now = new Date()
  const minutes = now.getHours() * 60 + now.getMinutes()
  return minutes >= start && minutes <= end
}

// Campaign period — apakah mission masih dalam periode aktif
export function isMissionInCampaignPeriod(mission: MissionConfig) {
  if (!mission.dateStart && !mission.dateEnd) return true  // no period = always

  const now = new Date()
  if (mission.dateStart && new Date(mission.dateStart) > now) return false
  if (mission.dateEnd && new Date(mission.dateEnd) < now) return false
  return true
}
```

### Detail 2.5 — canRunMission

```ts
export function canRunMission(mission, progress) {
  if (!mission.active) return false
  if (!isMissionAvailableNow(mission)) return false
  if (!isMissionInCampaignPeriod(mission)) return false   // ★ NEW
  if (progress?.claimed) return false
  if (!progress) return true
  if (!mission.repeat && progress.completed) return false
  if (mission.type === 'daily') { /* same */ }
  return true
}
```

---

## Phase 3: Bug Fixes

**Goal**: Semua bug minor + UX.

### Files

| # | File | Action |
|---|------|--------|
| 3.1 | `src/features/missions/services/MissionClaimService.ts` | `referenceId` harian (repeat fix) |
| 3.2 | `src/pages/MorePage/index.tsx` | CheckinButton — invalidateQueries |
| 3.3 | `src/features/missions/services/missionAvailability.ts` | Fix parseTime (sudah di Phase 2.4) |
| 3.4 | `AI/17_CHANGELOG.md` + `AI/16_SESSION_MEMORY.md` | Update docs |

### Detail 3.1 — MissionClaimService.ts

```ts
const dateKey = new Date().toISOString().split('T')[0]
const referenceId = mission.period === "daily"
  ? `${mission.id}-${dateKey}`
  : String(mission.id)

const guard = await grantReward({
  userId,
  source: "mission",
  referenceId,                    // ★ FIX
  amount,
  reason: `Mission: ${mission.title}`,
})
```

### Detail 3.2 — CheckinButton

```tsx
import { useQueryClient } from "@tanstack/react-query"
// ...
const queryClient = useQueryClient()

const handleCheckin = () => {
  track("CHECKIN", user.id, { date: today })
  localStorage.setItem(storageKey, "true")
  setDone(true)
  queryClient.invalidateQueries({ queryKey: ["profile", user.id] })
  showToast({ type: "success", title: "Checkin berhasil!", message: "VXP ditambahkan ke akun kamu" })
}
```

---

## Phase 4: Verifikasi End-to-End

**Goal**: Test semua flow.

### Skenario Test

| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Profile mission | Sign up baru → isi 11 field profile → save | VXP +150, mission hilang dari list |
| 2 | Daily Checkin | Buka MorePage → klik "Checkin Harian" | VXP +10, button disable |
| 3 | Daily Checkin (hari-2) | Besok buka MorePage | Button aktif lagi, VXP +10 |
| 4 | Share | Klik "Share App" → copy link | VXP +100 |
| 5 | Dengerin Pagi | Putar streaming 07:00-09:00 ≥5 menit | VXP +50, progress bar |
| 6 | Dengerin (luar jam) | Putar di luar 07:00-09:00 | Progress gak jalan |
| 7 | Referral | Buka /ref/voks-1234 → login | Referrer dapet VXP +500 |
| 8 | Redeem | Buka Reward Store → redeem hadiah | current_vXP turun, lifetime_vxp tetap |

---

## Phase 5: Update AI Docs

| File | Action |
|------|--------|
| `AI/17_CHANGELOG.md` | Catat semua perubahan |
| `AI/16_SESSION_MEMORY.md` | Update session state |
