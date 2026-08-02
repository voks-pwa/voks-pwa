# MAKSUD STATUS — Mission & Reward + Admin Analytics

**Status audit:** 2026-07-31 · **Source:** `AI/DEPLOYMENT/MAKSUD.md`
**Verified by:** `npm run check` ✅ · `npm run build` ✅ · lint file diubah ✅

Legend: ✅ DONE · 🟡 PARTIAL · ❌ BELUM

---

## Visi MAKSUD: Mission & Reward

Sudah dibahas lengkap di `AI/DEPLOYMENT/ROADMAP.md` + `AI/DEPLOYMENT/ROADMAP_STATUS.md`. Inti:
- ✅ Mission dibuat di WordPress, user dapat VXP, redeem di Reward Store
- ✅ Login/Sign up wajib (sumber data pendengar)
- ✅ Semua task ROADMAP selesai (kecuali sinkronisasi `mission_vxp` WP ↔ `xp_rules` DB, lihat ROADMAP_STATUS)

## Visi MAKSUD: Admin Analytics

Kebutuhan MAKSUD: data pengguna (jumlah, DAU, MAU), klik banner promo, play streaming, page terpopuler, program & penyiar favorit — untuk menarik klien + report klien.

### Hasil Audit (sebelum dikerjakan)

| Kebutuhan | Sebelum | Sumber data |
|---|---|---|
| Jumlah user | ✅ Sudah ada | `profiles` |
| DAU / MAU | ❌ Belum | `activity_logs` (distinct user_id) |
| Play streaming | 🟡 Event ada, gak di-aggregate | `activity_logs` `player_play` |
| Klik banner promo | ❌ Belum ada tracking | Perlu event `BANNER_CLICK` |
| Page terpopuler | ❌ Belum ada tracking | Perlu event `PAGE_VIEW` |
| Program favorit | 🟡 Data ada, gak di-aggregate | `user_favorites` + `FAVORITE_PROGRAM` |
| Penyiar favorit | 🟡 Data ada, gak di-aggregate | `user_favorites` + `FAVORITE_ANNOUNCER` |

### Implementasi

| # | Perubahan | File |
|---|---|---|
| 1 | Event `PAGE_VIEW` + `BANNER_CLICK` | `src/core/action-engine/types.ts` |
| 2 | Tracker page view (login-only, skip `/admin` + `/dev`) | `src/components/tracking/PageViewTracker.tsx` + mount di `src/routes/AppRoutes.tsx` |
| 3 | Track klik banner | `src/components/ui/PromoBanner.tsx` (position `home_carousel`), `src/pages/PromoListPage.tsx` (position `promo_list`) |
| 4 | Agregasi: DAU/WAU/MAU, stream plays, banner clicks, top pages, top favorites | `supabase/functions/admin-analytics/index.ts` (paging 1000-row, window `max(days, 30)`) |
| 5 | Tipe response baru | `src/features/admin/analytics/types/analytics.ts` |
| 6 | UI: KPI User Activity + Engagement Detail | `src/features/admin/analytics/pages/AnalyticsPage.tsx` |

### Hasil Akhir

**KPI baru:** DAU, WAU, MAU, Stream Plays, Banner Clicks.
**Section baru:** Top Pages, Top Promo Diklik, Top Program Favorit, Top Penyiar Favorit (judul di-resolve dari WP via `usePrograms`/`useAnnouncers`, fallback `#id`).
**Charts baru:** Daily Active Users + Stream Plays trend (reuse `AnalyticsLineChart`).
Semua existing (listener AzuraCast, demografi, device/browser, broadcast, notifikasi, export CSV/Excel) tetap.

### Catatan

- **Tracking login-only** — `track()` butuh `userId`; guest tidak tercatat (konsisten arsitektur, login wajib di MAKSUD).
- **MAU window** — dihitung dari `max(days, 30)` trailing hari; akurat untuk days ≥ 30.

### Status Deploy (2026-07-31)

- ✅ `fetchWithRetry` di-import dari `_shared/retry.ts` (sebelumnya undefined, fetch AzuraCast/WP gagal diam-diam)
- ✅ Edge function `admin-analytics` deployed ke project `aefelmycrbiquqfoafcs` (deno check exit 0 sebelum deploy)

## Todo Tersisa

- ~~Sinkronisasi `mission_vxp` WP ↔ `xp_rules` DB~~ ✅ (ROADMAP Task 4b selesai 2026-07-31)
- QA lain dari `AI/DEPLOYMENT/TEMUAN.md` (di luar scope):
  - Live status inkonsisten (home LIVE vs /live OFFLINE, audio paused)
  - Hapus test data live chat (`test`, `sdasda`, `User`)
  - HTML entity mentah (`&#038;`, `&#8211;`) di judul konten
  - Loading 3–6 detik (perf)
