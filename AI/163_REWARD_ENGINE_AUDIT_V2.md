# AI/163_REWARD_ENGINE_AUDIT_V2.md

Version: 1.0
Date: 2026-07-18
Type: AUDIT ONLY

---

# REWARD ENGINE AUDIT V2

## ROOT CAUSE — Exact Regression

**Sprint 14.8 — Reward System Stabilization** changed the data source for both Reward Store and Admin Reward Catalog from **WordPress API (direct)** to **Supabase `reward_catalog` table**, but **never applied the migration (`20260728000000_create_reward_catalog.sql`) to the remote Supabase project**.

### What broke

| Page | Route | Old Source | New Source | Remote status |
|------|-------|-----------|-----------|---------------|
| **Reward Store** | `/reward-store` | `useRewards()` → `getRewards()` → WP REST API | `useActiveRewardAggregate()` → `supabase.from("reward_catalog")` | `reward_catalog` = **404 Not Found** |
| **Admin Reward Catalog** | `/admin/reward-catalog` | N/A (new page) | `useAdminRewardCatalog()` → `getRewardAggregate()` → same query | Same **404** |
| **Reward Detail** | `/reward-store/:slug` | `useRewards()` → WP REST API | `useActiveRewardAggregate()` → filter client-side | Same **404** |

**Result**: All three pages show error/empty state because the `reward_catalog` table does not exist in the remote database.

---

## Migration Status — Remote Supabase (`aefelmycrbiquqfoafcs`)

| Table | Migration File | Remote Status | Git Tracked |
|-------|---------------|---------------|-------------|
| `reward_grants` | `20260721000000_reward_grants.sql` | ✅ EXISTS | ❌ No |
| `reward_redemptions` | `20260715000002_create_reward_redemptions.sql` | ✅ EXISTS | ❌ No |
| `reward_items` | (older) | ✅ EXISTS | N/A |
| `reward_claims` | (older) | ✅ EXISTS | N/A |
| `reward_catalog` | `20260728000000_create_reward_catalog.sql` | ❌ **NOT FOUND** | ❌ No |
| `reward_inventory` | `20260725000000_create_reward_inventory.sql` | ❌ **NOT FOUND** | ❌ No |
| `reward_inventory_ledger` | `20260725000000_create_reward_inventory.sql` | ❌ **NOT FOUND** | ❌ No |
| `reward_redeems` | `20260724000000_create_reward_redeems.sql` | ❌ **NOT FOUND** | ❌ No |
| `reward_voucher_pool` | `20260726000000_create_reward_voucher_pool.sql` | ❌ **NOT FOUND** | ❌ No |
| `reward_shipping` | `20260727000000_create_reward_shipping.sql` | ❌ **NOT FOUND** | ❌ No |
| `reward_shipping_timeline` | `20260727000000_create_reward_shipping.sql` | ❌ **NOT FOUND** | ❌ No |
| `wallet_ledger` | `20260723000000_create_wallet_ledger.sql` | ❌ **NOT FOUND** | ❌ No |

**The entire `supabase/migrations/` folder is untracked in git.** No migration files are committed.

---

## LAYER-BY-LAYER AUDIT

---

### LAYER 1: WordPress Reward API

**Source**: `src/services/wordpress-api.ts:161-196`

| Field | Value |
|-------|-------|
| URL | `https://voksradio.com/wp-json/wp/v2/reward?_embed&per_page=100` |
| Method | GET (no auth) |
| Pagination | **No pagination loop** — `per_page=100` hard cap. If >100 rewards exist, only first 100 are synced. |

**Fields returned by WP API (`WPReward` in `src/features/rewards/rewardTypes.ts`):**
```
id, slug, title.rendered, image_url (resolved)
acf: reward_name, reward_subtitle, reward_cost, reward_stock, reward_image,
     reward_active, reward_description, reward_code_type, reward_delivery_type,
     reward_gallery, reward_featured, reward_expired_at, reward_max_per_user,
     reward_status, reward_badge, reward_delivery_notes, reward_terms, Reward_Color,
     reward_priority, reward_bonus_vxp, reward_campaign_slug, reward_required_badge,
     reward_required_achievement, reward_vip_only
```

**Record Count**: Unknown (>100 potentially truncated)

**Failure Points**:
1. **No pagination** — `per_page=100` is a hard limit
2. **N+1 media fetch** — Each reward calls `getMedia()` individually; 50 rewards = 51 HTTP requests
3. **No error retry** — Single failure throws entire batch
4. **CORS/public** — Works without auth, but relies on WP being reachable

---

### LAYER 2: Reward Sync

**Files**:
- `src/features/rewards/services/rewardSyncEngine.ts` (87 lines)
- `src/features/rewards/repositories/rewardSyncRepository.ts` (107 lines)
- `src/features/rewards/services/rewardCatalogMapper.ts`
- `src/features/rewards/rewardMapper.ts` (legacy WP→Reward)

**Sync Flow**:
```
getRewards() → wpToCatalogEntry() → upsertRewardCatalog() → reward_catalog (upsert onConflict:"id")
                                        ↓
                     for each: seedOrUpdateInventory() → reward_inventory
```

**`wpToCatalogEntry()` field mapping** (`rewardSyncEngine.ts:6-28`):

| WP ACF Field | Catalog Column | Mapped? | Notes |
|-------------|---------------|---------|-------|
| `reward_name` / `title.rendered` | `title` | ✅ | |
| `reward_subtitle` | `subtitle` | ✅ | |
| `reward_description` | `description` | ✅ | |
| `reward_image` (media ID → URL resolved in Layer 1) | `image_url` | ✅ | |
| `reward_delivery_type` | `delivery_type` | ✅ | |
| `reward_code_type` | `reward_category` | ✅ | **MISNAMED** — `reward_code_type` mapped to `reward_category` |
| `reward_badge` | `sponsor` | ✅ | **MISNAMED** — `reward_badge` mapped to `sponsor` |
| `reward_terms` | `terms` | ✅ | |
| `reward_delivery_notes` | `delivery_notes` | ✅ | |
| `reward_bonus_vxp` | `bonus_vxp` | ✅ | |
| `reward_campaign_slug` | `campaign_slug` | ✅ | |
| `reward_required_badge` | `required_badge` | ✅ | |
| `reward_required_achievement` | `required_achievement` | ✅ | |
| `reward_vip_only` | `vip_only` | ✅ | |
| **`reward_cost`** | `cost` | **❌ NOT SYNCED** | Defaults to 0; Dashboard-only |
| **`reward_stock`** | — | ❌ (used for inventory seeding only) | Not stored in catalog |
| **`reward_active`** | `reward_active` | **❌ NOT SYNCED** | Defaults to true; Dashboard-only |
| **`reward_featured`** | `featured` | **❌ NOT SYNCED** | Defaults to false; Dashboard-only |
| **`reward_priority`** | `priority` | **❌ NOT SYNCED** | Defaults to 0; Dashboard-only |
| **`reward_max_per_user`** | `max_per_user` | **❌ NOT SYNCED** | Defaults to 0; Dashboard-only |
| **`reward_expired_at`** | (missing column) | **❌ NOT STORED ANYWHERE** | **DATA LOSS** — `expired_at` is always `""` in aggregate |

**Failure Points**:
1. **`expired_at` is completely lost** — Column doesn't exist in `reward_catalog` schema. The `WPReward` type has `reward_expired_at` in ACF, but it is never mapped during sync. The aggregate hardcodes `expired_at: ""`. **Expiration is entirely broken.**
2. **Field misnaming**: `reward_badge` → `sponsor`, `reward_code_type` → `reward_category`
3. **Operational fields not synced**: `cost`, `active`, `featured`, `priority`, `max_per_user` must be set manually in Dashboard after every sync

---

### LAYER 3: `reward_catalog` Table

**Migration**: `supabase/migrations/20260728000000_create_reward_catalog.sql`

**Schema**:
```sql
id              INTEGER PRIMARY KEY
slug            TEXT UNIQUE NOT NULL
title           TEXT NOT NULL DEFAULT ''
subtitle        TEXT DEFAULT ''
description     TEXT DEFAULT ''
image_url       TEXT DEFAULT ''
delivery_type   TEXT DEFAULT 'digital'
reward_category TEXT DEFAULT ''
sponsor         TEXT DEFAULT ''
terms           TEXT DEFAULT ''
delivery_notes  TEXT DEFAULT ''
bonus_vxp       INTEGER DEFAULT 0
campaign_slug   TEXT DEFAULT ''
required_badge  TEXT DEFAULT ''
required_achievement TEXT DEFAULT ''
vip_only        BOOLEAN DEFAULT false
cost            INTEGER NOT NULL DEFAULT 0
featured        BOOLEAN DEFAULT false
priority        INTEGER DEFAULT 0
reward_active   BOOLEAN DEFAULT true
max_per_user    INTEGER DEFAULT 0
synced_at       TIMESTAMPTZ
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**Indexes**: slug, reward_active, featured, reward_category, campaign_slug

**RLS**: Public SELECT, service_role ALL

**Record Count on Remote**: **0 — Table does not exist**

**Missing Fields** (compared to `WPReward` ACF):
- ❌ `expired_at` — The most critical missing field. Used in UI for expired overlay checks and eligibility.

---

### LAYER 4: `reward_inventory` Table

**Migration**: `supabase/migrations/20260725000000_create_reward_inventory.sql`

**Schema**:
```sql
reward_id       INTEGER PRIMARY KEY
current_stock   INTEGER NOT NULL DEFAULT 0
reserved_stock  INTEGER NOT NULL DEFAULT 0
warning_stock   INTEGER NOT NULL DEFAULT 5
inventory_mode  TEXT NOT NULL DEFAULT 'limited'
updated_at      TIMESTAMPTZ
```

**Related**: `reward_inventory_ledger` (transaction log)

**Stored Procedures**: reserve_stock, deduct_stock, refund_stock, adjust_stock, release_reservation

**Record Count on Remote**: **0 — Table does not exist**

---

### LAYER 5: RewardRepository

**Files**:

| File | Purpose | Remote Status |
|------|---------|---------------|
| `src/features/rewards/repositories/rewardSyncRepository.ts` | CRUD `reward_catalog` | ❌ Table not found |
| `src/features/rewards/repositories/rewardAggregateRepository.ts` | Merge catalog + inventory | ❌ Tables not found |
| `src/features/rewards/repositories/rewardRedemptionRepository.ts` | Read `reward_redemptions` | ✅ Table exists |
| `src/features/inventory/repositories/inventoryRepository.ts` | CRUD `reward_inventory` | ❌ Table not found |
| `src/features/redeem/repositories/redeemRepository.ts` | Write `reward_redeems` | ❌ Table not found |

**CRITICAL: Dual-Table Problem**
- **Write path**: `redeemEngine` → `redeemRepository` → writes to **`reward_redeems`**
- **Read path (history)**: `rewardRedemptionRepository` → reads from **`reward_redemptions`**
- The admin redemptions page and reward history page read from `reward_redemptions`, but the live flow writes to `reward_redeems`. **Redemption data is invisible to users and admins.**

| Aspect | `reward_redeems` | `reward_redemptions` |
|--------|-----------------|---------------------|
| Status values | UPPERCASE | lowercase |
| Migration | `20260724000000` | `20260715000002` |
| Written by | redeemEngine (live) | redeem_reward RPC (dead) |
| Read by | getUserRedeems() | getUserRedemptions() (history page) |
| Admin reads | — | admin-rewards edge function |
| Remote status | ❌ NOT FOUND | ✅ EXISTS |

---

### LAYER 6: RewardAggregate

**Files**:
- `src/features/rewards/types/rewardAggregate.ts` — `RewardAggregate` interface (34 lines)
- `src/features/rewards/repositories/rewardAggregateRepository.ts` — Merge logic (103 lines)

**Merge Flow**:
```
getRewardAggregate():
  1. SELECT * FROM reward_catalog ORDER BY priority, title
  2. SELECT * FROM reward_inventory
  3. Build Map<reward_id, inventory data>
  4. mergeCatalogWithInventory() → RewardAggregate[]
```

**Hardcoded zero fields** in merge:
```typescript
expired_at: "",          // ← ALWAYS "" — column missing from catalog
voucher_available: 0,    // ← ALWAYS 0 — never computed
voucher_used: 0,         // ← ALWAYS 0 — never computed
total_redeems: 0,        // ← ALWAYS 0 — never computed
```

**Failure Points**:
1. **`expired_at` always `""`** — Expired overlay never triggers
2. **Three fields always 0** — No queries against voucher pool or redeems tables
3. **`getActiveRewardAggregate()` fetches ALL then filters in JS** instead of using `getActiveRewardCatalog()`
4. **`getRewardAggregateBySlug()` loads ALL inventory** even for a single slug lookup
5. **Entire function fails on remote** because `reward_catalog` table doesn't exist

---

### LAYER 7: Reward Store (UI)

**File**: `src/pages/RewardStorePage.tsx` (470 lines)
**Route**: `/reward-store`

**Data Source**: `useActiveRewardAggregate()` → `getActiveRewardAggregate()` → `getRewardAggregate()`

**UI States**: Loading (skeleton), Error ("Failed to load rewards"), Empty ("No Rewards Available"), Data (grid)

**Features**:
- Featured Reward Hero
- Search (by name, subtitle, description)
- Sort (priority, cost asc/desc, name asc/desc)
- Category filter (all, digital, voucher, coupon, physical, merchandise, event)
- Result count

**Failure Points**:
1. **🔴 `reward_catalog` table doesn't exist** → query throws error → error state shown
2. **`expired_at` always `""`** → expired overlay never shows even if set in WP
3. **Stock display inconsistency**: Card shows `available` (stock - reserved), Detail sheet shows `stock` (raw)

---

### LAYER 8: Reward Detail

**Files**:
- `src/features/rewards/components/RewardDetailSheet.tsx` (301 lines) — Bottom sheet
- `src/features/rewards/pages/RewardDetailPage.tsx` (361 lines) — Full page
- Route: `/reward-store/:slug`

**Data Source**: `useActiveRewardAggregate()` (fetches ALL rewards, filters client-side)

**Failure Points**:
1. **🔴 Same root cause** — Depends on `reward_catalog` table → fails
2. **Inefficient**: Loads ALL active rewards to display one detail
3. **Button text logic bug**: `!eligibility?.eligible ? "Redeem" : "Redeem"` — same text regardless

---

### LAYER 9: Admin Reward Catalog

**Files**:
- `src/features/admin/rewards-crud/pages/RewardsCatalogPage.tsx` (200 lines)
- `src/features/admin/rewards-crud/components/RewardEditDialog.tsx` (522 lines)
- `src/features/admin/rewards-crud/hooks/useAdminRewardCatalog.ts` (97 lines)
- Route: `/admin/reward-catalog`

**Data Source**: `useAdminRewardCatalog()` → `getRewardAggregate()`

**Sync Flow**: "Sync from WP" button → `syncAll()` → `upsertRewardCatalog()` + `seedOrUpdateInventory()`

**Edit Flow**: Save → Edge Function (WP update) + `updateRewardOperational()` (catalog) + `adjustStock()` (inventory)

**Failure Points**:
1. **🔴 Same root cause** — `reward_catalog` table doesn't exist → catalog loading fails
2. **Sync button would also fail** — `upsertRewardCatalog()` writes to non-existent table
3. **Admin redemption page** reads from `reward_redemptions` but new redeems go to `reward_redeems`
4. **Triple-write risk**: Save writes to WP + catalog + inventory independently; any one failure creates inconsistency

---

## CRITICAL ISSUES SUMMARY

| # | Severity | Issue | Layer | Impact |
|---|----------|-------|-------|--------|
| 1 | **🔴 CRITICAL** | **`reward_catalog` table missing on remote** — migration never applied | 3, 5, 7, 8, 9 | **Reward Store and Admin Reward Catalog cannot display any data** |
| 2 | **🔴 CRITICAL** | **5+ migrations never applied to remote** (catalog, inventory, redeems, voucher, shipping, wallet) | All | Entire reward engine v2 infrastructure missing |
| 3 | **🔴 CRITICAL** | **Migrations not in git** — entire `supabase/migrations/` untracked | Infra | No deployment pipeline can apply them |
| 4 | **🟠 HIGH** | **Dual-table split**: redeems written to `reward_redeems` but read from `reward_redemptions` | 5, 7, 8, 9 | Redemption history and admin management show no data |
| 5 | **🟠 HIGH** | **`expired_at` never synced** — column missing from `reward_catalog` schema | 2, 3, 6 | Rewards can never expire; eligibility always passes |
| 6 | **🟠 HIGH** | **Field misnaming**: `reward_badge` → `sponsor`, `reward_code_type` → `reward_category` | 2, 6 | Semantic data loss in catalog |
| 7 | **🟡 MEDIUM** | `getRewardAggregateBySlug()` loads ALL inventory records | 6 | Performance issue, scales poorly |
| 8 | **🟡 MEDIUM** | No WordPress pagination loop — `per_page=100` hard cap | 1 | Rewards >100 never appear |
| 9 | **🟡 MEDIUM** | Three aggregate fields always 0 (`voucher_available`, `voucher_used`, `total_redeems`) | 6 | Incomplete data shape |
| 10 | **🔵 LOW** | Inconsistent stock display (card shows `available`, sheet shows `stock`) | 7, 8 | UX confusion |
| 11 | **🔵 LOW** | Button text logic identical for eligible/ineligible state | 8 | UX bug |
| 12 | **🔵 LOW** | Admin-edit triple-write can cause inconsistency | 9 | Data drift risk |

---

## FIX ORDER RECOMMENDATION

Stop. Per `100_PERINTAH.md`, this audit is READ-ONLY. No code or patches applied.

When fix is authorized, order should be:

1. **Commit all migration files to git**
2. **Apply migrations to remote Supabase** (via `supabase db push` or Management API queries)
3. **Sync rewards from WP** (click "Sync from WP" in Admin or call `syncAll()`)
4. **Fix `expired_at`**: Add column to `reward_catalog`, update sync engine, update aggregate mapper
5. **Fix dual-table split**: Either write to `reward_redemptions` or read from `reward_redeems` — unify
6. **Fix field misnaming**: Map `reward_badge` → `badge` (not `sponsor`), `reward_code_type` → `code_type` (not `category`)
7. **Performance**: Paginate WP fetch, lazy-load inventory in aggregate by-slug
8. **UX bugs**: Stock display consistency, button text logic

---

## Verification Commands

```bash
# TypeScript check
npm run check

# Build
npm run build

# Lint
npm run lint
```
