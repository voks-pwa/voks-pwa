# LAPORAN TESTING — Mission & Reward (E2E Produksi)

**Tanggal:** 2026-07-31 · **Env:** produksi (`voks-pwa.voksmedsos.workers.dev` + Supabase `aefelmycrbiquqfoafcs`)
**Metode:** Layer 1 (DB/API, supabase-js) + Layer 2 (browser E2E, Playwright + session injection)
**User dummy:** `vokstest*@gmail.com` (dibuat via temp edge function service-role, dibersihkan setelahnya)

---

## Bug yang DITEMUKAN selama testing (akar masalah "mission selesai tapi VXP tidak masuk")

| # | Bug | Dampak | Fix |
|---|---|---|---|
| 1 | **`mission_completions.mission_id` = UUID di prod** (schema drift vs repo BIGINT). Claim RPC INSERT `p_mission_id` (bigint) → **type error → seluruh transaksi rollback → VXP TIDAK PERNAH masuk** | Setiap claim gagal utk semua user | Migration `20260907000000_fix_mission_completions_mission_id.sql` → ubah kolom ke BIGINT |
| 2 | **`reward_grants` INSERT → 403** (RLS policy INSERT hilang di prod/drift). Di kode lama grant dipanggil sebelum claim → `grantReward` gagal → claim dibatalkan | Claim gagal + dedup harian mati | Migration `20260908000000_fix_reward_grants_rls.sql` → tambah policy INSERT/SELECT |
| 3 | **Misi checkin/share/profile punya `listen_mode="continuous"` di WP** → guard "continuous listening" di `processMissionProgress` **meng-ignore action non-listen** (`checkin`/`share`/`profile`) | Mission tidak pernah diproses dari UI (0 progress row) | `missionProgressService.ts`: guard continuous hanya utk `action === "listen"` |
| 4 | **`repeatMissionIfNeeded` reset misi DAILY langsung setelah claim** + `shouldUnlockRepeatMission` reset daily di scheduler → checkin bisa di-claim berulang hari yang sama | Double-credit VXP | `missionRepeat.ts` + `missionRules.ts`: skip reset utk misi daily (reset via daily boundary) |
| 5 | **Overlay kartu mission (`absolute inset-0 z-0`) nutup tombol** Check In / Share Now / Claim Reward → tombol tak bisa diklik di UI | Mission tak bisa dipicu dari UI | `MissionCard.tsx`: area tombol `relative z-10` |

Bug #1 + #2 + #3 = kombinasi fatal yang bikin mission/reward "tidak memberikan hasil" selama ini. #5 ketangkap oleh Playwright (overlay intercepts pointer events).

## Hasil Testing

### Layer 1 — DB/API (script `scripts/e2e/mission-flow.mjs`)

| Test | Hasil | Detail |
|---|---|---|
| Buat user dummy (edge fn) | ✅ PASS | |
| Sign in | ✅ PASS | session ok |
| Seed progress + claim checkin +10 | ✅ PASS | reward=10, current_vxp=10 |
| wallet balance | ✅ PASS | 10 |
| daily earnings | ✅ PASS | 10 |
| Double claim ditolak | ✅ PASS | "Reward already claimed" |
| Claim amount=0 graceful | ✅ PASS | success, wallet tetap |
| user analytics | ✅ PASS | total_xp_earned=10, 1 txn |

### Layer 2 — Browser E2E (script `scripts/e2e/browser-flow.mjs`)

| Test | Hasil | Detail |
|---|---|---|
| Buat user + session injection | ✅ PASS | login state di app |
| **Checkin via UI** | ✅ PASS | balance 0→30 (10 VXP × global_multiplier 3x) |
| **MorePage Saldo VXP tampil = DB** | ✅ PASS | MorePage="30", db=30 — **B5 (refresh VXP) terverifikasi** |
| **Share via UI** | ✅ PASS | balance 30→230 |
| Referral claim +500 | ✅ PASS | 230→730 |
| **Redeem voucher (500 VXP)** | ✅ PASS | `reward_redeems`=1, balance 730→230 |

**Kesimpulan:** seluruh rantai mission & reward bekerja end-to-end di produksi — misi selesai → VXP masuk ke wallet_ledger + profiles → tampil di MorePage → bisa di-redeem di Reward Store.

## Cleanup

- 23 user test `vokstest*@gmail.com` dihapus (data rows + auth) ✅
- Temp edge function `test-create-user` dihapus ✅
- Debug script dihapus; script test tetap di `scripts/e2e/` (butuh temp edge fn utk create user)

## Lanjutan — 3 Skenario Tersisa (2026-07-31) — SEMUA PASS

Script: `scripts/e2e/browser-remaining.mjs`

| Skenario | Hasil | Detail |
|---|---|---|
| Checkin credited | ✅ | 0→30 (10 VXP × multiplier 3) |
| **No double-credit** (klik 1x + tunggu scheduler) | ✅ | 30→30, kartu jadi "Completed Today" |
| **Mission History tampil** | ✅ | "Daily Check In 1 Agu 2026 daily **+30 XP**" |
| **Profile mission via UI** (isi 11 field → Save Profile) | ✅ | 30→230 (+200, kena daily_limit 200) |
| Profile mission row claimed | ✅ | mission 12465 completed+claimed |
| **History tampil profile mission** | ✅ | "Complete Your Profile" muncul |

### Bug tambahan ditemukan (di-fix)

| Bug | Dampak | Fix |
|---|---|---|
| `mission_completions` **kurang RLS read policy** di prod → insert sukses (SECURITY DEFINER) tapi read user diblokir → **Mission History selalu kosong** | History kosong walau claim sukses | Migration `20260909000000_fix_mission_completions_rls.sql` (policy read own + service role) |
| `MissionClaimService` tidak invalidate key `["mission-completions", userId]` setelah claim | History gak refresh (cache 60s) setelah misi baru | Tambah invalidate `mission-completions` |

## Catatan / Masalah Minor (non-blocking)

- **`record_commerce_event` RPC → 404** di prod (dipanggil flow redeem/commerce). Tidak menggagalkan redeem, tapi perlu dibuat.
- **`achievements`/validators HEAD request `ERR_ABORTED`** — React Query HEAD dibatalkan saat navigasi (noise, bukan bug).
- **Global multiplier 3x** aktif di prod → reward display (10) vs granted (30). Sesuai desain, tapi display kartu belum kalikan multiplier.
- **`xp_rules.daily_limit` 200 utk MISSION_COMPLETE** → share/profile cap +200/hari. Sesuai desain.

## File berubah

- Migrations: `20260906000000_claim_mission_reward_zero_grace.sql`, `20260907000000_fix_mission_completions_mission_id.sql`, `20260908000000_fix_reward_grants_rls.sql`, `20260909000000_fix_mission_completions_rls.sql`
- `missionProgressService.ts`, `missionRules.ts`, `missionRepeat.ts`, `MissionClaimService.ts`, `main.tsx`, `useRedeem.ts`, `MissionCard.tsx`
- Script test: `scripts/e2e/mission-flow.mjs`, `scripts/e2e/browser-flow.mjs`, `scripts/e2e/browser-remaining.mjs`
