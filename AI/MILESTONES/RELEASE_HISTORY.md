# Release History

---

## Sprint Era

Sprint 1

Foundation

✅

Sprint 2

Authentication

✅

Sprint 3

Profile

✅

Sprint 4

Radio

✅

Sprint 5

Community

✅

Sprint 6

Events

✅

Sprint 7

Wallet

✅

Sprint 8

Mission Foundation

✅

Sprint 9

Achievement

✅

Sprint 10

Leaderboard

✅

Sprint 11

Campaign

✅

Sprint 12

Notification

✅

Sprint 13

Reward Store

✅

Sprint 14

Reward Platform

✅

---

## Milestone Era

### v1.0.0-rc1

Release Candidate

Core Platform

Mission

Beta Internal

Reward

Beta Internal

Git Tag

v1.0.0-rc1

---

### Current

Milestone B

Platform Stabilization

Canonical User Service

Admin User Detail

Mission Stabilization

Reward Stabilization

ROADMAP Alignment

✅ 2026-07-31 Mission & Reward Alignment (Task 1-3)
- Level/badge sync ke profiles (calculate_badge_for_user + syncLevelBadge)
- Checkin dipindah ke Missions page (Check In button + streak)
- RewardPopup redesign minimal
- Detail: `AI/DEPLOYMENT/ROADMAP_STATUS.md`

Admin Analytics

✅ 2026-07-31 MAKSUD analytics gap
- DAU/WAU/MAU dari activity_logs
- Stream plays + banner clicks + top pages + top favorites (program/penyiar)
- Tracking PAGE_VIEW + BANNER_CLICK (login-only)
- Fix fetchWithRetry import + deploy admin-analytics (aefelmycrbiquqfoafcs)
- Detail: `AI/DEPLOYMENT/MAKSUD_STATUS.md`

Mission Claim Repair

✅ 2026-07-31
- Prod schema drift fixed: missions_progress.updated_at, claim_mission_reward definitif (wallet_ledger + lifetime_vxp), update_profile_safe, set_profile_completion, get_mission_analytics
- Daily reset jalan (completed_at), MissionHistory baca mission_completions
- Grant pakai mission_vxp WP (ROADMAP Task 4b), period mapping benar
- supabase db push + deploy frontend (voks-pwa.voksmedsos.workers.dev)
- Detail: `AI/DEPLOYMENT/ROADMAP_STATUS.md`

QA TEMUAN

✅ 2026-07-31
- Live status unifikasi ke AzuraCast (home + /live konsisten), listener count
- Test data live chat dihapus (migration cleanup)
- HTML entity decode di layer WP (`src/lib/html.ts`)
- staleTime 5m di hooks WP (loading lebih cepat)
- Detail: `AI/DEPLOYMENT/TEMUAN.md`

Mission Claim Fix (B1-B5)

✅ 2026-07-31
- claim RPC dipanggil dulu, reward_grants setelah sukses (retry bisa jalan)
- amount=0 graceful (skip wallet_ledger) — migration `20260906000000_claim_mission_reward_zero_grace.sql`
- Mission repeatable (Share) reward sekali/hari
- VXP refresh di MorePage/MissionsPage setelah misi (shared queryClient + invalidate profile)
- Fix useRedeem invalidate key
- supabase db push + deploy frontend (2cb3a7b4)

E2E Testing & Fix Produksi

✅ 2026-07-31
- Testing E2E (Playwright + DB layer) vs produksi
- Ketemu + fix 5 bug: mission_completions UUID→bigint, reward_grants RLS 403, continuous-guard ignore non-listen, daily double-credit, overlay MissionCard nutup tombol
- Verifikasi E2E: checkin/share/referral/redeem PASS, MorePage tampil VXP = DB
- Lanjutan: profile mission via UI, double-checkin, Mission History — semua PASS
- Ketemu + fix 2 bug history: mission_completions RLS read policy, invalidate mission-completions
- Report: `AI/DEPLOYMENT/TESTING_REPORT.md`

---

### Next

Milestone C

Economy

Marketplace

Public Release

v1.0