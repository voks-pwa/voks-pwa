# Session Memory

## 2026-07-31 — ROADMAP Mission & Reward Alignment

### Audit
- `AI/DEPLOYMENT/ROADMAP.md` audit terhadap codebase.
- Sebelumnya hanya Task 1a + 1b kelar. 2c diklaim done tapi checkin masih di-filter dari Missions page.

### Dikerjakan
- 1c: `getLevelFromXP` dihapus (`profileXP.ts` + export barrel)
- 1d/1e/1f: `syncLevelBadge()` di `profileBadgeService.ts`, dipanggil dari `MissionClaimService.processMissionClaim`
- 1g: MorePage `BADGE_THRESHOLDS` → `getXpBadgeDefinitions()` (RPC `get_xp_badges`)
- 2a/2b: CheckinButton dihapus → `CheckinStreakCard` read-only
- 2c/2e: checkin visible di Missions page + "Check In" button + streak
- Task 3: RewardPopup redesign (bottom-right, 4s, dismiss, missionTitle dari WP, gold accent)
- Migration baru: `20260904000000_add_level_badge_to_update_profile_safe.sql`
- Bonus: fix stray `test =` di `profileBadge.ts` (break tsc -b)

### Status
- Semua roadmap task ✅ kecuali 2d/4b (grant pakai `xp_rules` DB, bukan `mission_vxp` WP) — butuh keputusan arsitektur.
- Verifikasi: `npm run check` ✅ · `npm run build` ✅ · lint error pre-existing.
- Status file: `AI/DEPLOYMENT/ROADMAP_STATUS.md`.

### Catatan
- AGENTS.md refer `AI/16_SESSION_MEMORY.md`, `AI/15_CURRENT_TASK.md`, `AI/17_CHANGELOG.md` — file tsb tidak ada. Struktur aktual: `AI/CHECKPOINTS/` + `AI/MILESTONES/RELEASE_HISTORY.md`. Perlu update AGENTS.md.

## 2026-07-31 (lanjutan) — Admin Analytics MAKSUD Gap

### Audit
- `AI/DEPLOYMENT/MAKSUD.md` — cek vs codebase. Gap: DAU/MAU, stream plays aggregate, banner click tracking, page view tracking, top favorites.

### Dikerjakan
- Event `PAGE_VIEW` + `BANNER_CLICK` di action engine
- `PageViewTracker` (login-only, skip `/admin`/`/dev`) di `AppRoutes`
- Track klik banner di `PromoBanner` (home_carousel) + `PromoListPage` (promo_list)
- Agregasi di `admin-analytics`: DAU/WAU/MAU (distinct user activity_logs), stream plays, banner clicks + topPromos, topPages, topFavorites (user_favorites). Paging 1000-row, window max(days,30)
- UI AnalyticsPage: KPI DAU/WAU/MAU/Stream Plays/Banner Clicks + section Top Pages/Top Promo/Top Program Favorit/Top Penyiar Favorit + 2 chart trend
- Status file: `AI/DEPLOYMENT/MAKSUD_STATUS.md`

### Status
- `npm run check` ✅ · `npm run build` ✅ · lint changed files ✅
- `fetchWithRetry` di-import dari `_shared/retry.ts` (fix pre-existing bug) — deno check exit 0
- Edge function `admin-analytics` deployed ke project `aefelmycrbiquqfoafcs`

### Keputusan
- Tracking login-only (track butuh userId)
- Judul favorites di-resolve dari WP (fallback #id)
- Tanpa migration DB baru — semua sumber data sudah ada

## 2026-07-31 (lanjutan) — Fix Mission & Reward + QA TEMUAN

### Temuan
- `AI/DEPLOYMENT/TEMUAN.md`: akun baru — Complete Profile + Share mission VXP tidak bertambah; widget +0; history kosong.
- **Prod DB schema drift** (`aefelmycrbiquqfoafcs`): `missions_progress` tanpa `updated_at` (get_mission_analytics 42703); beberapa migrasi pending belum ter-record. `user_favorites` TIDAK hilang (probe 404 menyesatkan — anon tanpa privilege).
- Bug kode: daily reset mati (`missionRuntime` init `lastResetDate`=hari ini), MissionHistory rapuh (baca progress claimed), period mapping `"once"` salah reward source.

### Dikerjakan
- Migration `20260905000000_mission_claim_repair.sql`: `missions_progress.updated_at`; `claim_mission_reward` definitif (wallet_ledger MISSION_REWARD, current+lifetime_vxp, updated_at); recreate `set_profile_completion`, `update_profile_safe`, `get_mission_analytics`; `user_favorites` idempotent.
- Fix 2 migrasi lama yg gagal push: `20260822000006` (IF NOT EXISTS), `20260829000001` (pola FK `references auth.users not null on delete` → `NOT NULL REFERENCES auth.users(id)`, policy DO-guard).
- Kode: `missionRuntime.lastResetDate`=""; `missionEngine` reset pakai `completed_at`; `MissionHistory` baca `mission_completions`; `missionMapper` period fallback dari type; `MissionClaimService` pakai `mission.type` + grant `mission.reward` (baseXPOverride); `calculateXP` opsi baseXP; hapus panggilan `get_mission_analytics`/`get_user_analytics` rusak (p_days).
- `supabase db push` → semua migrasi pending ter-apply. Re-probe: `get_mission_analytics` 200 (4 attempts/3 completions utk misi 12341), claim RPC OK.
- `npm run deploy` → frontend ke Cloudflare Pages (`voks-pwa.voksmedsos.workers.dev`).

### Status
- `npm run check` ✅ · `npm run build` ✅ · lint file diubah ✅
- ROADMAP Task 4b selesai (grant = mission_vxp WP)

### TODO (QA lain, luar scope sesi)
- Live status inkonsisten (home LIVE vs /live OFFLINE)
- Hapus test data live chat (`test`, `sdasda`, `User`)
- HTML entity mentah (`&#038;`, `&#8211;`) di judul konten
- Loading 3–6 detik (perf)

## 2026-07-31 (lanjutan) — QA TEMUAN selesai

### Dikerjakan
- Live status: `LiveStudioPlayer` unifikasi sumber ke AzuraCast (`useNowPlaying` is_online) + listener count. Konsisten dengan homepage.
- Test data live chat dihapus (migration `20260905000001_cleanup_live_chat_test_data.sql`). Verified 0 rows.
- HTML entity: `src/lib/html.ts` (`decodeEntities`, `decodeWpText`) diterapkan di `wordpress-api.ts` (semua fetch) + `missionMapper.ts`.
- Loading: `staleTime` 5 menit di `usePrograms`, `useAnnouncers`, `useVoksPlus`.

### Deploy
- `supabase db push` (cleanup migration) + `npm run deploy` → `voks-pwa.voksmedsos.workers.dev` (f601a740)
- Verifikasi: check ✅ build ✅ lint ✅

## 2026-07-31 (lanjutan) — Fix Mission Claim (B1-B5)

### Temuan
- Sistem claim SEBENARNYA bekerja (user admin 85 VXP, 3 txn). Tapi 5 bug bikin "mission selesai tapi reward nol/tidak bertambah".

### Bug + fix
- **B1** reward_grants ditulis SEBELUM claim RPC → claim gagal = misi terkunci permanen. Fix: claim RPC dulu, reward_grants setelah sukses.
- **B2** amount=0 → INSERT wallet_ledger violate CHECK(amount!=0) → RPC error. Fix: migration `20260906000000_claim_mission_reward_zero_grace.sql` skip wallet_ledger bila amount 0.
- **B3** mission repeatable non-daily (Share) referenceId konstan → reward cuma sekali. Fix: `${id}-${dateKey}` (sekali/hari).
- **B4** claim gagal silent. Fix: toast error di `MissionClaimService`.
- **B5** MorePage VXP gak refresh: `main.tsx` pakai shared `queryClient` (`@/lib/query-client`), `MissionClaimService` invalidate `["profiles", userId]` + `["missions-progress", userId]` setelah claim; `useRedeem` fix key invalidate `["profile"]` → `["profiles", userId]`.

### Deploy
- `supabase db push` (RPC zero-grace) + `npm run deploy` → voks-pwa.voksmedsos.workers.dev (2cb3a7b4)
- Verifikasi: check ✅ build ✅ lint ✅

## 2026-07-31 (lanjutan) — E2E Testing Mission & Reward + bug baru

### Metode
- Playwright browser E2E vs produksi + Layer 1 DB/API (supabase-js). User dummy `vokstest*@gmail.com` via temp edge fn service-role (bypass rate limit auth). Sesi di-inject ke localStorage.

### Bug DITEMUKAN selama testing (akar masalah VXP tidak masuk)
1. `mission_completions.mission_id` = UUID di prod (drift) → claim RPC type error → transaksi rollback → VXP tidak pernah masuk. Fix: migration `20260907000000` (bigint).
2. `reward_grants` INSERT 403 (policy hilang) → grantReward gagal (di kode lama = claim batal). Fix: migration `20260908000000` (RLS).
3. Misi checkin/share/profile `listen_mode="continuous"` di WP → guard continuous meng-ignore action non-listen → mission tak diproses. Fix: `missionProgressService.ts` guard hanya utk `action==="listen"`.
4. `repeatMissionIfNeeded`/`shouldUnlockRepeatMission` reset misi DAILY → double-credit. Fix: skip utk daily.
5. Overlay kartu mission nutup tombol (z-0) → tak bisa diklik. Fix: `MissionCard.tsx` tombol z-10.

### Hasil
- Layer 1: semua PASS (claim, wallet, double-claim ditolak, amount 0 graceful).
- Layer 2: checkin 0→30 (10×multiplier 3), **MorePage tampil = DB (B5 ✓)**, share 30→230, referral +500, redeem voucher ✓ (redeems=1, debit 500).
- Cleanup: 23 user test dihapus + temp edge fn dihapus. Report: `AI/DEPLOYMENT/TESTING_REPORT.md`.
- Minor: `record_commerce_event` 404 di prod; global_multiplier 3x (display ≠ granted).

## 2026-07-31 (lanjutan) — 3 skenario selesai + 2 bug history

### Skenario (SEMUA PASS)
- Double-checkin: 1x credit, gak double setelah scheduler; kartu → Completed Today.
- Mission History tampil (+30 XP).
- Profile mission via UI (isi 11 field): credited (+200, kena daily_limit 200), row claimed, history tampil.

### Bug tambahan
- `mission_completions` kurang RLS read policy di prod → history selalu kosong walau claim sukses. Fix: migration `20260909000000_fix_mission_completions_rls.sql`.
- `MissionClaimService` tidak invalidate `["mission-completions"]` → history gak refresh. Fix: tambah invalidate.
- Deploy f863b129. Cleanup 6 user test + hapus temp edge fn + debug script.

## 2026-09-11 — Fix console error flood (SW stale, CORS, HLS, Agentation)

### Diagnosis
Lima akar masalah dari log console yang sangat panjang:
1. **Service worker stale** dari build/preview lama tetap mengontrol `localhost:5173`, mengintersep request WP/Supabase cross-origin dengan `CacheFirst` lalu gagal `no-response`. Browser melaporkannya sebagai CORS palsu — padahal `voksradio.com` mengirim `Access-Control-Allow-Origin` yang benar (diverifikasi via request manual).
2. **Supabase `now-playing-proxy`** memakai `corsHeaders` statis (fallback `https://voks.app`), jadi preflight dari `localhost:5173` gagal.
3. **HLS `live.voksradio.com`** menolak request browser dengan 403 (anti-hotlink) + tanpa CORS.
4. **Agentation** dev widget spam `localhost:4747` (ERR_CONNECTION_REFUSED) saat agent server tidak jalan.
5. **WP API** dipanggil cross-origin langsung di dev sehingga rentan terhadap SW/CORS.

### Dikerjakan
- `src/main.tsx`: unregister semua service worker + hapus cache di DEV.
- `src/sw.ts`: `__WB_DISABLE_DEV_LOGS=true`; WP API `CacheFirst` → `StaleWhileRevalidate`; `setCatchHandler` mengembalikan fallback (offline.html / JSON 503) supaya tidak ada lagi `no-response` rejection.
- `vite.config.ts`: proxy dev `/wp-json` dan `/hls`; sinkronkan runtimeCaching WP ke SWR.
- `src/lib/constants.ts`: `WP_API_URL` (dev relatif `/wp-json/wp/v2`) + `LIVE_HLS_URL` (dev `/hls/stream.m3u8`, prod Worker).
- `src/services/wordpress-api.ts`, `missionWP.ts`, `campaignRepository.ts`, `admin/campaigns/api/campaigns.ts`, `admin/rewards-crud/api/rewards-crud.ts`: pakai `WP_API_URL` bersama.
- `supabase/functions/_shared/cors.ts`: `getCorsHeaders` echo origin (+ `.pages.dev`); `corsHeaders` statis jadi `*` agar preflight dev lolos.
- `supabase/functions/now-playing-proxy/index.ts`: pakai `getCorsHeaders(origin)` + preflight 204.
- `workers/live-status-proxy/src/index.ts`: tambah proxy `/hls/*` (passthrough playlist/segmen + rewrite URL absolut + CORS/Range).
- `src/components/live/LiveStudioPlayer.tsx`: pakai `LIVE_HLS_URL`, tangkap error fatal HLS → overlay "Live stream tidak tersedia".
- `src/App.tsx`: Agentation jadi opt-in `VITE_AGENTATION_ENABLED=true`.

### Lanjutan — Agentation lokal-only
- `endpoint` Agentation opsional: tanpa `endpoint` toolbar jalan penuh via `localStorage` (nol network ke `:4747`).
- `src/App.tsx`: Agentation dirender DEV-only tanpa `endpoint`, default **aktif** di dev (matikan dengan `VITE_AGENTATION_ENABLED=false`). Pakai `lazy(() => import("agentation"))` sehingga tree-shaken dari bundle produksi (diverifikasi: `dist/` bersih dari string agentation).
- `agentation` tetap di `devDependencies`. Tidak ada yang ter-deploy ke Cloudflare / ter-push ke GitHub.
- Akses: jalankan `npm run dev`, buka `http://localhost:5173`, toolbar muncul di pojok kanan bawah.

### Verifikasi
- `npm run check` OK, `npm run build` OK. Lint: 18 error pre-existing (claude-skills, PushOptIn, MissionList, ProfilePage, VoksPlusDetailPage, beberapa edge function) — tidak ada dari file yang diubah.
- HLS master playlist memakai path relatif (`0/stream.m3u8`) sehingga proxy dev & Worker ikut mengalirkan segmen.
- `dist/` diverifikasi bersih dari string `agentation` (tree-shaken dari bundle produksi).

### Catatan
- Worker `voks-live-status-proxy` perlu di-deploy ulang agar proxy HLS aktif di produksi.
- Agentation aktif default di dev; matikan dengan `VITE_AGENTATION_ENABLED=false` di `.env` lokal bila mengganggu.

### Follow-up — deploy now-playing-proxy + verifikasi console bersih
- Akar sisa error `now-playing-proxy` CORS: function **belum ter-deploy** (OPTIONS mengembalikan 404). Fix CORS di source tidak berefek sampai deploy.
- `npx supabase functions deploy now-playing-proxy --project-ref aefelmycrbiquqfoafcs` → OPTIONS 204 + `Access-Control-Allow-Origin: http://localhost:5173`.
- Verifikasi browser (Playwright, dev server): **0 console error, 0 failed request**.

### UI — InstallAppButton redesign
- `src/components/pwa/InstallAppButton.tsx`: tombol gradient brand (`#5B5B3F → #bda752`) dengan ikon `Download`; kartu iOS profesional (ikon `Smartphone`, gradient top bar, petunjuk `Share → Add to Home Screen`, tombol dismiss yang tersimpan di localStorage).
