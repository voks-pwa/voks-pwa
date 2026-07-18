# AI/155_REWARD_CATALOG_AUDIT.md

Version: 1.0

Date: 2026-07-18

---

# Reward Catalog Audit

Audit of the full reward system after Sprint 14.8 (Reward Sync Layer) to find
data inconsistencies between Reward Store, Reward Catalog, Inventory, Campaign,
and Dashboard.

---

## Finding 1 — Stock is ALWAYS 0 (Critical)

**Files**: `src/features/rewards/services/rewardCatalogMapper.ts:17`
`src/features/admin/rewards-crud/pages/RewardsCatalogPage.tsx:36`

**Code**:
```ts
// rewardCatalogMapper.ts
stock: 0,  // hardcoded zero
```

```ts
// RewardsCatalogPage.tsx normalizeRow
stock: 0,  // hardcoded zero
```

**Root Cause**: `RewardCatalogRow` has no `stock` field. The `reward_catalog` table
has no stock column. Stock lives in `reward_inventory` table (Sprint 14D).
The mapper never queries inventory.

**Impact**:
- `RewardDetailPage.tsx:81` — `const outOfStock = reward.stock <= 0;` → **always true**
  → ALL rewards show "Out of Stock" overlay on detail page, even when
  inventory has stock.
- `RewardDetailSheet.tsx:94` — `reward.stock > 0` → always false → "Out of Stock"
  button label for all rewards.
- `RewardCard.tsx:80` — no outOfStock logic, but `reward.stock` is meaningless.
- `RewardEngine.ts:27` — `reward.stock <= 0` check always fires → old engine
  always returns "out of stock".
- Admin catalog always shows stock=0 in the table column.
- Admin edit dialog always shows stock=0, and saving stock has no effect.

**Fix Needed**: Query `reward_inventory` table alongside `reward_catalog` to
populate `stock`. Or use `inventoryEngine.getInventoryByReward(id)` in a derived
field.

---

## Finding 2 — WP Sync Overwrites Dashboard Cost Edits (High)

**File**: `src/features/rewards/services/rewardSyncEngine.ts:42-46`

**Code**:
```ts
const entries = wpRewards.map(wpToCatalogEntry);
await upsertRewardCatalog(entries);
```

`wpToCatalogEntry` maps `cost: wp.acf?.reward_cost` from WP. The `upsert()` uses
`onConflict: "id"` and updates ALL columns, including `cost`. So any cost change
made in Dashboard (via `updateRewardOperational`) is **overwritten on next sync**.

The sync contract says:
- WP owns Metadata (name, description, image, sponsor)
- Dashboard owns Operational (cost, featured, priority, reward_active)

But the sync engine copies cost FROM WP, violating the separation.

**Fix Needed**: `syncAll` must NOT overwrite `cost`, `featured`, `priority`,
`reward_active`, `max_per_user` — these are Dashboard-owned fields.

---

## Finding 3 — Priority Not Saved to WordPress (High)

**File**: `supabase/functions/admin-reward-update/index.ts:58`

**Code**:
```ts
const { rewardId, active, name, subtitle, description, cost, stock, status, featured } = body;
```

The edge function destructures `rewardId, active, name, subtitle, description,
cost, stock, status, featured`. It does NOT destructure `priority`.

In `RewardsCatalogPage.tsx`, the save flow calls:
1. `updateMutation` → `admin-reward-update` edge function → writes to WP
2. `updateLocalOperational` → writes to local Supabase

Step 2 includes `priority`, but step 1 does not. So priority is only saved
locally and is lost on next sync from WP (which reads priority from WP).

**Fix Needed**: Add `priority` to the edge function body destructuring and
its `acf` payload.

---

## Finding 4 — Old RewardGrid Still Uses WP Direct Path (Medium)

**File**: `src/features/rewards/components/RewardGrid.tsx:2`

**Code**:
```ts
import { useRewards } from "@/hooks/useRewards";
```

`useRewards` (in `src/hooks/useRewards.ts`) calls `getRewards()` (WP REST API)
and maps via `mapReward()` (old WP mapper). This component still reads directly
from WordPress, bypassing the local `reward_catalog`.

`RewardStorePage.tsx` has been updated to use `useActiveRewards()` + local
catalog, but `RewardGrid.tsx` has NOT. If `RewardGrid` is rendered anywhere
in the app, it shows different data than RewardStorePage.

**Check Needed**: Find where `RewardGrid` is imported and whether it should
be migrated to the local catalog.

---

## Finding 5 — Image Display Inconsistency (Medium)

**Files**: Multiple

| Source | Image Value |
|--------|-------------|
| `mapReward` (old WP) | `image: wp.image_url ?? ""` → can be `""` |
| `catalogRowToReward` (new) | `image: row.image_url ?? undefined` → can be `undefined` |
| `RewardCard.tsx` | `<img src={reward.image}>` — renders empty if `""` or `undefined` |
| `RewardDetailSheet.tsx` | `<img src={reward.image}>` — has `onError` hide |
| `RewardDetailPage.tsx` | `<img src={reward.image}>` — has `onError` hide |
| Featured hero in store | `<img src={featured.image}>` — has `onError` hide |

`MediaResolver` (`src/utils/mediaResolver.ts`) exists but is **never called**
in the reward rendering path. The `resolveRewardImage()` function takes
`acfImage` and `bucketPath` params, but the catalog stores `image_url` as
a resolved URL string, so the resolver is bypassed entirely.

Components use `onError` handlers to hide broken images, but this means a
reward with no image shows a blank (empty) area instead of a placeholder.

**Fix Needed**: Either resolve images at sync time (store resolved URL in
`image_url`), or use `MediaResolver.resolveRewardImage()` at render time
with placeholder fallback.

---

## Finding 6 — `reward_catalog` Has No `reward_status` Column (Medium)

**File**: `supabase/migrations/20260728000000_create_reward_catalog.sql`

The `reward_catalog` table has `reward_active` (boolean) but no `reward_status`
(string). WordPress ACF has `reward_status` field. The `RewardCatalogRow`
interface also omits it.

Old `mapReward()` maps `status: wp.acf.reward_status ?? "Available"` (string).
New `catalogRowToReward` maps `status: row.reward_active ? "active" : "inactive"`.
These are different representations. Components that check `reward.status === "expired"`
will never see "expired" from the local catalog source.

**Impact**: `RewardCard.tsx` checks `reward.status === "expired"` — this will
never match from catalog data. Only `reward.expiredAt` check works.

**Fix**: Either add `reward_status` column to catalog, or remove status-based
branching and rely entirely on `reward_active` + `expiredAt`.

---

## Finding 7 — `useRewardEligibility` Checks `reward.stock` (Low)

**File**: `src/features/rewards/services/walletValidationService.ts:48-50`

**Code**:
```ts
if (reward.stock <= 0) {
  return { eligible: false, reason: "Reward Sold Out" };
}
```

Since stock is always 0 (Finding 1), ALL rewards return "Reward Sold Out"
from the eligibility check. This cascades:
- `RewardDetailPage` shows "Reward Sold Out" in eligibility badge.
- `RewardDetailSheet` shows "Reward Sold Out" in eligibility badge.
- Redeem button shows "Reward Sold Out".

Meanwhile, `redeemEngine.ts` correctly checks stock via Inventory Engine
(`checkStock` → `getInventory`), so the actual redeem flow has correct
stock validation. But the eligibility UI always blocks redemption.

**Fix**: Same as Finding 1 — populate stock from inventory table.

---

## Finding 8 — Admin Cannot Edit Stock (Low)

**File**: `src/features/rewards/repositories/rewardSyncRepository.ts:68-75`

`updateRewardOperational` only allows:
```ts
Partial<Pick<RewardCatalogRow, "cost" | "featured" | "priority" | "reward_active" | "max_per_user">>
```

No stock support. Stock management must go through
`inventoryEngine.adjustStock()` or `inventoryEngine.seedOrUpdateInventory()`.

The admin dialog has a stock field, but:
1. It always shows 0 (hardcoded in `normalizeRow`).
2. Saving stock from the dialog has no effect (not in `updateRewardOperational`).

To enable stock editing, the admin page needs to:
1. Load stock from `reward_inventory` table.
2. Call `inventoryEngine.adjustStock()` on save.

---

## Summary

| # | Issue | Severity | File(s) |
|---|-------|----------|---------|
| 1 | Stock always 0 → all rewards show "Out of Stock" | Critical | `rewardCatalogMapper.ts`, `RewardDetailPage.tsx`, `RewardDetailSheet.tsx` |
| 2 | WP sync overwrites dashboard cost edits | High | `rewardSyncEngine.ts` |
| 3 | Priority not sent to WP on save | High | `admin-reward-update/index.ts` |
| 4 | Old RewardGrid reads WP directly | Medium | `RewardGrid.tsx` |
| 5 | Image display never uses MediaResolver | Medium | `RewardCard.tsx`, `RewardDetailSheet.tsx`, `RewardDetailPage.tsx` |
| 6 | `reward_status` missing from catalog → status mismatch | Medium | `reward_catalog` migration, `rewardCatalogMapper.ts` |
| 7 | Eligibility check uses stock=0 → always "Sold Out" | High | `walletValidationService.ts` |
| 8 | Admin cannot edit stock (only sees 0) | Medium | `RewardsCatalogPage.tsx`, `updateRewardOperational` |

---

## Appendix — Data Flow Diagram

```
WordPress REST API
  │
  ├── rewardSyncEngine.syncAll() ───→ reward_catalog table (Supabase)
  │                                      │
  │                                      ├── useRewardCatalog() / useActiveRewards()
  │                                      │      │
  │                                      │      └── catalogRowToReward() → Reward
  │                                      │              │ stock: 0 ← BUG
  │                                      │              │
  │                                      │              ├── RewardStorePage ✅ (uses catalog)
  │                                      │              ├── RewardDetailPage ⚠️ (stock=0)
  │                                      │              ├── RewardDetailSheet ⚠️ (stock=0)
  │                                      │              └── RewardCard ⚠️ (stock meaningless)
  │                                      │
  │                                      └── RewardsCatalogPage (admin) ⚠️ (stock=0)
  │
  ├── useRewards() ───→ mapReward() → Reward 🟡 (Legacy WP path, still used by RewardGrid)
  │
  └── admin-reward-update ───→ WP REST API POST ⚠️ (missing priority)

reward_inventory table (Supabase) ←── syncAll seeds stock from WP ACF
  │
  ├── checkStock() / reserveStock() / deductStock() / refundStock()
  │
  └── NOT CONNECTED to reward_catalog queries (disconnected data)
```
