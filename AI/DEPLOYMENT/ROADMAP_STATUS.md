# ROADMAP STATUS — Mission & Reward Alignment

**Status audit:** 2026-07-31 · **Source:** `AI/DEPLOYMENT/ROADMAP.md`
**Verified by:** `npm run check` ✅ · `npm run build` ✅ · `npm run lint` (hanya error pre-existing)

Legend: ✅ DONE · 🟡 PARTIAL · ❌ BELUM · ⚠️ CAVEAT

---

## Task 1 — Level/Badge Alignment

| # | Subtask | Status | Keterangan |
|---|---|---|---|
| 1a | Reset DB `xp_levels` | ✅ | `20260903000000_reset_xp_levels.sql` — TRUNCATE + 9 baris. Catatan: `20260902000003` definisi function threshold lama (250/500) gak pernah dipanggil — inert |
| 1b | Update `calculateLevel()` 12→9 | ✅ | `src/features/xp/utils/level.ts` — 9 level (0,100,500,750,1000,4000,10000,25000,50000) |
| 1c | Hapus `getLevelFromXP` | ✅ | File `profileXP.ts` dihapus + export dari `profile/index.ts` dicabut (0 caller) |
| 1d | Wiring RPC `calculate_badge_for_user()` | ✅ | Dipanggil di `syncLevelBadge()` (`profileBadgeService.ts`) setelah XP credited |
| 1e | Sync `profiles.level` + `badge_name` | ✅ | `syncLevelBadge()`: baca `lifetime_vxp` → `calculateLevel()` → RPC `calculate_badge_for_user()` → `update_profile_safe` (level + badge_name). Dipanggil di `MissionClaimService.processMissionClaim` |
| 1f | Panggil `updateBadge()` | ✅ | Service jadi basis `syncLevelBadge()` |
| 1g | MorePage badge dari DB | ✅ | `BADGE_THRESHOLDS` dihapus. `getXpBadgeDefinitions()` (`badgeRepository.ts`) via RPC `get_xp_badges()`, dipakai `BadgeProgress` |

**Migration baru:** `20260904000000_add_level_badge_to_update_profile_safe.sql` — whitelist kolom `level` + `badge_name` di RPC `update_profile_safe`.

---

## Task 2 — Daily Checkin Consolidation

| # | Subtask | Status | Keterangan |
|---|---|---|---|
| 2a | Hapus `CheckinButton` dari MorePage | ✅ | Function dihapus. MorePage cuma tampil `CheckinStreakCard` read-only |
| 2b | MorePage streak info read-only | ✅ | `CheckinStreakCard` (icon + `Streak N hari` + "checkin lewat Daily Missions") |
| 2c | Missions page: checkin card + "Check In" | ✅ | Filter exclude checkin di `MissionList.tsx` dihapus. `MissionCard.tsx`: branch `Check In` button → `track("CHECKIN")` + invalidate progress. Claimed state tetap tampil "Completed Today" |
| 2d | `mission_vxp` WP dipakai engine | ⚠️ | Mapping ✅ (`missionMapper.ts:13`). Tapi XP granted pakai `calculateXP` → rule `xp_rules` DB + multiplier, bukan `mission_vxp` langsung. Nilai display ≠ granted. Divergen — lihat Task 4b |
| 2e | Streak counter di checkin card | ✅ | `MissionCard.tsx`: badge `Flame` + `Streak N hari` dari `getStreak()` |

---

## Task 3 — Redesign RewardPopup (Modern Minimal)

| Komponen | Status | Perubahan |
|---|---|---|
| `RewardPopup.tsx` | ✅ | `fixed bottom-6 right-6`, slide-up + fade-in (`slide-in-from-bottom-4 fade-in`), 4s auto-dismiss + tombol dismiss |
| `RewardToast.tsx` | ✅ | White card, `border-l-4 border-l-[#bda752]`, judul dari WP (`missionTitle`), gak ada progress bar, gak ada emoji |
| `RewardBadge.tsx` | ✅ | Gold chip `bg-[#bda752]/10 text-[#bda752]` |
| `missionStore.ts` | ✅ | `MissionProgressState` + field `missionTitle` |
| `missionEngine.ts` | ✅ | Payload `setProgress` + `mission.title` (bukan dari `MissionCard`) |

---

## Task 4 — WordPress VXP Sync

| # | Subtask | Status | Keterangan |
|---|---|---|---|
| 4a | Mapping `mission_vxp` | ✅ | `missionMapper.ts:13` → `reward` |
| 4b | `calculateXP()` nilai dari WP | ✅ | `calculateXP` opsi `baseXPOverride`; `MissionClaimService` grant pakai `mission.reward` (mission_vxp WP). Display = grant |
| 4c | `CHECKIN` diproses missionConsumer | ✅ | `EVENT_ACTION_MAP.CHECKIN → "checkin"` |
| 4d | Auto-claim grant VXP | ✅ | `autoClaimIfEligible` → `processMissionClaim` → `grantReward` → `claim_mission_reward` RPC (definitif: wallet_ledger + current/lifetime_vxp). Bonus: `syncLevelBadge()` ikut jalan |

---

## Hasil Audit Awal (sebelum dikerjakan)

Sebelum sesi ini, hanya **1a + 1b** yang kelar. Sisanya belum, termasuk yang diklaim roadmap "done di sesi sebelumnya" (2c — ternyata checkin masih di-filter dari Missions page, `MissionList.tsx:63`).

## Perubahan yang Dihapus di Luar Roadmap

- `src/features/profile/utils/profileBadge.ts` — baris stray `test = profile.badges?...` (break build tsc -b)
- `src/features/profile/services/profileBadgeService.ts:29` — fix type `string | null → string | undefined`

## Todo Tersisa

- ~~Sinkronisasi `mission_vxp` WP ↔ `xp_rules` DB~~ ✅ (Task 4b selesai 2026-07-31)
- QA lain dari `AI/DEPLOYMENT/TEMUAN.md`: live status inkonsisten, test data live chat, HTML entity mentah, loading lambat
