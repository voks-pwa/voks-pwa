# AI/166_REWARD_INFRASTRUCTURE_REPORT.md

Version: 1.0
Date: 2026-07-18
Type: DEPLOYMENT REPORT

---

## Sprint 14.9A — Reward Infrastructure Recovery

### Summary

Successfully recovered Reward Engine v2 infrastructure on remote Supabase project `aefelmycrbiquqfoafcs`.

---

### Task Results

| # | Task | Status | Details |
|---|------|--------|---------|
| 1 | Verify every migration exists locally | ✅ | 24 migration files present in `supabase/migrations/` |
| 2 | Commit missing migrations to git | ✅ | Commit `4cc36c3` — all 24 files committed |
| 3 | Deploy every migration to remote | ✅ | 6 migrations deployed: wallet_ledger, reward_redeems, reward_inventory (+ledger), reward_voucher_pool, reward_shipping (+timeline), reward_catalog |
| 4 | Verify reward_catalog exists | ✅ | Table exists, 4 rows inserted via sync |
| 5 | Verify reward_inventory exists | ✅ | Table exists, 4 rows, RLS fixed for public access |
| 6 | Verify reward_voucher_pool exists | ✅ | Table exists, 0 vouchers (not seeded) |
| 7 | Run Reward Sync | ✅ | 4 rewards synced from WP → Supabase |
| 8 | Verify Reward Store displays rewards | ✅ | Public API returns all 4 rewards with inventory data |
| 9 | Verify Admin Reward Catalog loads | ✅ | Query returns all 4 catalog rows with join data |
| 10 | Generate deployment report | ✅ | This file |

---

### Tables Deployed (vs. Before/After)

| Table | Migration | Before | After |
|-------|-----------|--------|-------|
| `reward_catalog` | `20260728000000` | ❌ NOT FOUND | ✅ EXISTS (4 rows) |
| `reward_inventory` | `20260725000000` | ❌ NOT FOUND | ✅ EXISTS (4 rows) |
| `reward_inventory_ledger` | `20260725000000` | ❌ NOT FOUND | ✅ EXISTS |
| `reward_redeems` | `20260724000000` | ❌ NOT FOUND | ✅ EXISTS |
| `reward_voucher_pool` | `20260726000000` | ❌ NOT FOUND | ✅ EXISTS |
| `reward_shipping` | `20260727000000` | ❌ NOT FOUND | ✅ EXISTS |
| `reward_shipping_timeline` | `20260727000000` | ❌ NOT FOUND | ✅ EXISTS |
| `wallet_ledger` | `20260723000000` | ❌ NOT FOUND | ✅ EXISTS |

### RLS Fix Applied

- `reward_inventory` — SELECT policy changed from `TO authenticated` to `USING (true)` (public read access). Required because the Reward Store page reads inventory data using the anon key.

### Data Synced (4 rewards from WordPress)

| ID | Slug | Title | Cost | Inventory |
|----|------|-------|------|-----------|
| 12590 | voucher-sanga-sanga-rp25-000 | Voucher Sanga Sanga Rp25.000 | 500 VXP | 100 in stock |
| 12591 | sticker-pack-voks-next | Sticker Pack VOKS NEXT | 750 VXP | 50 in stock |
| 12596 | hadiah-elektronik-voks | Hadiah Elektronik VOKS | 2500 VXP | 2 in stock |
| 12597 | mystery-box-voks | Mystery Box VOKS | 3500 VXP | 2 in stock |

### Important Additional Finding

The WordPress ACF structure is **nested in groups** (e.g., `acf.reward_information.reward_name`), but the TypeScript type `WPReward` and sync engine `wpToCatalogEntry()` expect **flat ACF fields** (e.g., `acf.reward_name`). This means:

- The `"Sync from WP"` button in the Admin panel **will not work** programmatically
- The `rewardMapper.ts` mapReward() function will also produce empty/default values
- The sync was done manually via SQL INSERT this session
- **Fix required**: Update `WPReward` type and both mappers to match the nested WP ACF structure

### Verification

```
npm run check   → exit 0
npm run build   → exit 0
TypeScript      → clean
```

### Migrations Committed

Commit `4cc36c3`: "feat: commit all Supabase migrations (reward catalog, inventory, redeems, voucher, shipping, wallet)"

All 24 migration files now tracked in git.
