# Code Gaps — Bugs & Analysis

## Gap 1: RLS blocks legitimate system updates

**Severity**: 🔴 BLOCKER
**File**: `supabase/migrations/20260822000002_fix_profiles_rls_update.sql`
**Component**: RLS policy `"Users update own profile"`

### Masalah
RLS `WITH CHECK` memproteksi 10 kolom agar tidak bisa diubah oleh user. Tapi beberapa kolom ini juga perlu diubah oleh system (via `updateProfileRow`):

| Kolom | Perlu diubah oleh | Saat |
|-------|-------------------|------|
| `referral_code` | System (profileService.ts) | Generate referral code untuk user baru |
| `referred_by` | System (authService.ts) | Set referrer saat referral |
| `profile_completed` | System (profileService.ts) | Tandai profile selesai |
| `profile_reward_claimed` | System (profileService.ts) | Tandai reward profile sudah diklaim |

### Dampak
- Profile save gagal (error "Failed to save profile" atau data gak tersimpan)
- Referral gak bisa di-assign
- Profile completion mission gak bisa auto-claim

### Fix
Buat RPC `SECURITY DEFINER` (bypass RLS) untuk update kolom-kolom ini.
Detail di `05_SQL_RPCS.md`.

---

## Gap 2: `grantReward` idempotency blocks repeat claims

**Severity**: 🟡 HIGH
**File**: `src/features/missions/services/MissionClaimService.ts:31`

### Masalah
```ts
referenceId: String(mission.id)  // "12341" — SAMA tiap hari
```
`reward_grants` punya UNIQUE `(user_id, source, reference_id)`. Setelah claim pertama, entry `(user_id, "mission", "12341")` ada. Hari berikutnya `grantReward` cek → skip karena "Reward already granted".

### Dampak
Daily Checkin cuma bisa claim SEKALI. Share (repeatable) juga cuma sekali.

### Fix
```ts
const dateKey = new Date().toISOString().split('T')[0]
referenceId: mission.period === "daily"
  ? `${mission.id}-${dateKey}`
  : String(mission.id)
```

---

## Gap 3: `parseTime` salah parse datetime

**Severity**: 🟡 HIGH
**File**: `src/features/missions/services/missionAvailability.ts:5-13`

### Masalah
```ts
function parseTime(value?: string) {
  const [h, m] = value.split(':').map(Number)  // "2026-07-29 07:00:00"
  return h * 60 + m                              // → ["2026-07-29 07", "00", "00"]
}                                                // h=2026, m=38 → 121598 menit!
```

### Dampak
Mission dengan `mission_start` full datetime selalu dianggap "unavailable" oleh `isMissionAvailableNow()`. Akibatnya mission gak bisa di-proses engine.

### Fix
```ts
function parseTime(value?: string) {
  if (!value) return null
  const timePart = value.includes(' ') ? value.split(' ')[1] : value
  const [h, m] = timePart.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return null
  return h * 60 + m
}
```

---

## Gap 4: ACF time fields belum di-map ke MissionConfig

**Severity**: 🟡 HIGH
**Files**: `missionTypes.ts`, `missionMapper.ts`, `mission.ts`

### Masalah
WordPress sekarang punya field `mission_time_start` / `mission_time_end` (daily time window) dan `mission_start` / `mission_end` (campaign period). Tapi `MissionConfig` type dan mapper belum include field baru ini.

### Fix
Tambah property `dateStart`, `dateEnd`, `timeStart`, `timeEnd` ke `MissionConfig` type dan mapping.

---

## Gap 5: Belum ada pengecekan campaign period

**Severity**: 🟢 MEDIUM
**File**: `src/features/missions/services/missionValidator.ts`

### Masalah
Sekarang cuma ada `isMissionAvailableNow()` yang check time-of-day window. Belum ada fungsi yang ngecek apakah mission masih dalam campaign period (dateStart → dateEnd).

### Fix
Tambah `isMissionInCampaignPeriod(mission)` di `missionAvailability.ts`, panggil di `canRunMission()`.

---

## Gap 6: Referral code format belum "voks-XXXX"

**Severity**: 🟢 MEDIUM
**File**: `src/features/profile/services/profileService.ts:13`

### Masalah
```ts
function generateReferralCode(): string {
  return crypto.randomUUID().slice(0, 8).toUpperCase()  // "A1B2C3D4"
}
```
User ingin format `"voks-4645"` (voks- + 4 digit random).

### Fix
```ts
function generateReferralCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `voks-${digits}`
}
```

---

## Gap 7: Route `/ref/:code` belum ada

**Severity**: 🟡 HIGH
**Component**: Routing

### Masalah
Canonical user punya `referral_url: "{origin}/ref/{code}"`. Tapi route `/ref/:code` tidak ada di app. `saveReferralCode()` tidak pernah dipanggil dari URL handler.

### Dampak
Referral link tidak bisa digunakan. Mission referral tidak bisa diselesaikan.

### Fix
1. Tambah route `/ref/:code` di router
2. `ReferralLandingPage` baca code → save ke localStorage → redirect ke login
3. Kalo user sudah login, langsung proses referral

---

## Gap 8: React Query cache stale setelah claim

**Severity**: 🟢 MEDIUM
**File**: `src/pages/MorePage/index.tsx` (CheckinButton)

### Masalah
`track("CHECKIN")` → engine jalan async → RPC update `current_vxp`. Tapi `useProfile` di MorePage pake React Query cache yang gak refetch.

### Dampak
VXP di UI tidak update setelah checkin/claim.

### Fix
```ts
queryClient.invalidateQueries({ queryKey: ["profile", user.id] })
```

---

## Gap 9: `lifetime_vxp` tidak diupdate oleh `claim_mission_reward` RPC

**Severity**: 🟡 HIGH
**File**: `supabase/migrations/20260716000002_mission_engine_v2.sql`

### Masalah
```sql
UPDATE profiles SET current_vxp = current_vxp + p_reward_vxp WHERE id = p_user_id;
-- lifetime_vxp tidak diupdate!
```

### Dampak
Total VXP seumur hidup tidak bertambah → badge user tidak naik.

### Fix
```sql
UPDATE profiles
SET current_vxp = current_vxp + p_reward_vxp,
    lifetime_vxp = lifetime_vxp + p_reward_vxp
WHERE id = p_user_id;
```

---

## Gap 10: Reward redeem — current_vxp dipotong, lifetime_vxp tetap

**Severity**: ✅ SUDAH BENAR
**Files**: wallet engine, RPC `commit_transaction`, `create_transaction`

### Kondisi Saat Ini
- Redeem reward → debit `current_vxp` → turun
- `lifetime_vxp` tetap (tidak terpengaruh redeem)
- Badge user tidak turun setelah redeem
- ✅ Sudah sesuai ekspektasi

### Verifikasi
RPC `commit_transaction` di `20260801000000_wallet_ledger_v2.sql`:
```sql
-- Debit (redeem): hanya update current_vxp
UPDATE profiles
SET current_vxp = v_new_current
WHERE id = p_user_id;
-- lifetime_vxp tidak disentuh
```
