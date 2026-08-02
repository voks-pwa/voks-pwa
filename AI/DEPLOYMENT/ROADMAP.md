# ROADMAP — Mission & Reward Alignment

**Source of truth:** `AI/DEPLOYMENT/MAKSUD.md` · `AI/DEPLOYMENT/ACF_FIELD.md` · `AI/DEPLOYMENT/BAGDE_LEVEL_USER.md`

---

## Task 1 — Level/Badge Alignment

### Problem

6 definisi level/badge bertabrakan — DB `xp_levels` (12 level), client `calculateLevel` (12 level), DB `xp_badges` (9 badge ✅), client `getBadgeName` (9 ✅), client `getLevelFromXP` (flat, dead code), MorePage hardcoded `BADGE_THRESHOLDS` (9 ✅).

`profiles.level` dan `profiles.badge_name` tidak pernah diupdate setelah profile creation.

### Subtasks

| # | Action | Target | Detail |
|---|---|---|---|
| 1a | Reset DB `xp_levels` | `20260822000003_data_integrity.sql` + migration baru | TRUNCATE xp_levels; INSERT 9 baris sesuai badge thresholds |
| 1b | Update `calculateLevel()` | `src/features/xp/utils/level.ts` | Ganti LEVELS array 12→9 item (0,100,500,750,1000,4000,10000,25000,50000) |
| 1c | Hapus `getLevelFromXP` | `src/features/profile/utils/profileXP.ts` | Dead code — gak dipanggil satupun |
| 1d | Wiring DB RPC ke frontend | Baru | Panggil `calculate_badge_for_user()` setelah claim mission / XP berubah |
| 1e | Sync `profiles.level` + `profiles.badge_name` | `missionEngine.ts` / `MissionClaimService.ts` | Setelah VXP credited, update kolom di DB |
| 1f | Panggil `updateBadge()` | `src/features/profile/services/profileBadgeService.ts` | Service udah ada, tinggal dipanggil |
| 1g | MorePage badge progress | `src/pages/MorePage/index.tsx` | Ganti hardcoded `BADGE_THRESHOLDS` → query `xp_badges` via `get_xp_badges()` RPC |

### DB `xp_levels` — Final values

| level | xp_required | title |
|-------|-------------|-------|
| 1 | 0 | Pendatang Baru |
| 2 | 100 | Teman Voks |
| 3 | 500 | Voks Aktif |
| 4 | 750 | Penikmat Frekuensi |
| 5 | 1000 | Voks Addict |
| 6 | 4000 | Penguasa Gelombang |
| 7 | 10000 | Voks Maniac |
| 8 | 25000 | Voks Royalty |
| 9 | 50000 | Voks Legend |

### DB `xp_badges` — ✅ Already correct

| slug | title | min_lifetime_vxp |
|------|-------|------------------|
| pendatang-baru | Pendatang Baru | 0 |
| teman-voks | Teman Voks | 100 |
| voks-aktif | Voks Aktif | 500 |
| penikmat-frekuensi | Penikmat Frekuensi | 750 |
| voks-addict | Voks Addict | 1000 |
| penguasa-gelombang | Penguasa Gelombang | 4000 |
| voks-maniac | Voks Maniac | 10000 |
| voks-vip | Voks VIP | 25000 |
| voks-legend | Voks Legend | 50000 |

---

## Task 2 — Daily Checkin Consolidation

### Problem

Dua sistem checkin paralel:
- **MorePage:** localStorage-based button, fire `track("CHECKIN")`, **VXP tidak bertambah**
- **Mission system:** `CheckinValidator` + auto-claim via `missionEngine`, tapi checkin mission di-exile dari Missions page

### Solution

**Hapus button checkin dari MorePage.** MorePage cuma tampilkan streak info read-only.

**Pindah checkin ke Missions page** sebagai mission card resmi dengan period=daily.

### UX Flow

```
┌─ Daily Missions ─────────────────────┐
│                                      │
│  🎯 Daily Check In                   │
│  Dapatkan VXP setiap hari ☀️         │
│                                      │
│  [+10 VXP]          [Check In]       │  ← Sebelum checkin
│                                      │
│  Streak: 3 hari 🔥                   │
└──────────────────────────────────────┘

┌─ Daily Missions ─────────────────────┐
│                                      │
│  🎯 Daily Check In                   │
│  Dapatkan VXP setiap hari ☀️         │
│                                      │
│  [+10 VXP]       ✅ Completed Today  │  ← Sesudah checkin
│                                      │
│  Streak: 3 hari 🔥                   │
└──────────────────────────────────────┘
```

### Subtasks

| # | Action | Target |
|---|---|---|
| 2a | Hapus `CheckinButton` dari MorePage | `src/pages/MorePage/index.tsx:17-78` |
| 2b | MorePage ganti streak info read-only | `src/pages/MorePage/index.tsx` |
| 2c | Missions page: checkin card dengan "Check In" button | `MissionCard.tsx` (✅ done di sesi sebelumnya — checkin sudah visible) |
| 2d | Pastikan `mission_vxp` dari WP dipakai engine | Verifikasi `missionMapper.ts` → `calculateXP()` |
| 2e | Streak counter di checkin card | `MissionCard.tsx` + `streakRepository` |

---

## Task 3 — Redesign RewardPopup (Modern Minimal)

### Problem

RewardPopup saat ini:
- `fixed right-6 top-6` — nutup konten
- Yellow-orange gradient — outdated
- `"Mission #${id}"` — gak nunjukin nama misi asli
- Progress bar — gak relevan buat mission complete
- Emoji `🎉` di teks — kurang profesional

### Desain Baru

```
┌─────────────────────────────┐
│ ║                          │  ← Gold left border accent (4px)
│ ║  🏆 Complete Your Profile │  ← Title dari WP (bukan "Mission #X")
│ ║                          │
│ ║      +150 VXP            │  ← Gold reward chip
│ ║                          │
│ ║                     ✕    │  ← Subtle dismiss button
│ ║           4s auto-dismiss │
└─────────────────────────────┘
  → fixed bottom-6 right-6
  → animate slide-up + fade-in
  → w-72 max, shadow-lg, rounded-2xl
  → bg-white, not gradient
```

### Komponen yang Diubah

| Komponen | Sekarang | Nanti |
|---|---|---|
| `RewardPopup.tsx` | `fixed right-6 top-6`, slide from right, 3.5s | `fixed bottom-6 right-6`, slide-up fade-in, 4s + dismiss button |
| `RewardToast.tsx` | Yellow gradient header, emoji, progress bar, `"Mission #${id}"` | Clean white card, gold left border, mission title dari WP, no progress bar, no emoji |
| `RewardBadge.tsx` | Yellow chip `bg-yellow-100` | Gold chip `bg-[#bda752]/10 text-[#bda752]` |
| `missionStore.ts` | `latestReward` cuma punya `missionId` | Tambah field `missionTitle` biar bisa tampil nama asli |
| `MissionCard.tsx` | setProgress panggil `missionStore` dengan missionId aja | Tambah `mission.title` di payload |

### Animasi

```css
/* Slide-up + fade-in */
@keyframes slideUpFadeIn {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
```

---

## Task 4 — WordPress VXP Sync

### Problem

Daily checkin di WordPress punya `mission_vxp: 10` tapi ketika user checkin via MorePage, VXP tidak bertambah. Flow `track("CHECKIN")` → action engine → mission consumer → run mission → engine harusnya auto-claim, tapi mungkin tidak sampai karena:
1. MorePage checkin tidak nunggu response engine
2. localStorage checkin mungkin skip engine entirely

### Subtasks

| # | Action | Detail |
|---|---|---|
| 4a | Verifikasi `missionMapper.ts` mapping `mission_vxp` | Pastikan WP `acf.mission_vxp` → `MissionConfig.reward` |
| 4b | Verifikasi `calculateXP()` di `economyEngine.ts` | Pastikan engine pake nilai dari WP, bukan hardcoded |
| 4c | Pastikan `CHECKIN` event diproses `missionConsumer` | Cek `src/core/action-engine/consumers/missionConsumer.ts` |
| 4d | Pastikan auto-claim flow grant VXP | Cek `MissionClaimService.ts` → `grantReward()` → `credit()` |

### Expected flow (sudah benar secara arsitektur)

```
User klik "Check In"
  → track("CHECKIN", userId, { date })
    → action engine → missionConsumer
      → runMission({ action: "checkin" })
        → missionEngine → processMissionProgress
          → autoClaimIfEligible(progress)
            → processMissionClaim → credit(userId, mission.reward, "MISSION_REWARD")
              → wallet_engine.credit()
                → wallet_ledger INSERT
                  → profiles.current_vxp += reward ✅
```

---

## Timeline

| Priority | Task | Estimated effort |
|---|---|---|
| 🔴 P0 | Task 1b — Update `calculateLevel()` | 10 min |
| 🔴 P0 | Task 1a — DB migration `xp_levels` | 15 min |
| 🔴 P0 | Task 2a+2c — Checkin di Missions page | 15 min |
| 🟡 P1 | Task 3 — RewardPopup redesign | 30 min |
| 🟡 P1 | Task 1e+1f — Sync level/badge ke profile | 20 min |
| 🟢 P2 | Task 1g — MorePage badge from DB | 15 min |
| 🟢 P2 | Task 4 — WordPress VXP verification | 15 min |
| ⚪ P3 | Task 1c — Hapus `getLevelFromXP` | 5 min |
| ⚪ P3 | Task 1d — Wiring DB RPC ke frontend | 20 min |

---

## Files Changed

### Source files
- `src/features/xp/utils/level.ts` — LEVELS array 12→9
- `src/features/profile/utils/profileXP.ts` — Hapus dead code
- `src/features/missions/components/RewardPopup.tsx` — Animasi, posisi, dismiss
- `src/features/missions/components/RewardToast.tsx` — Redesign minimal
- `src/features/missions/components/RewardBadge.tsx` — Gold chip
- `src/features/missions/services/missionStore.ts` — Tambah `missionTitle`
- `src/pages/MorePage/index.tsx` — Hapus checkin button, badge dari DB

### Migration files
- `supabase/migrations/20260901000003_reset_xp_levels.sql` — TRUNCATE + INSERT 9 level
