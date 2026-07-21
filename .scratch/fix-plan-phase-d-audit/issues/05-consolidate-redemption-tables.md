# 05 — Consolidate redemption tables

**What to build:** Two parallel tables store reward redemptions: `reward_redemptions` (v1, from `20260715000002`) and `reward_redeems` (v2, from `20260724000000`). This is a wide refactor (expand–contract). First, migrate existing data from `reward_redemptions` to `reward_redeems`. Then drop `reward_redemptions`. Finally, update all frontend code that references `reward_redemptions` to use `reward_redeems` instead.

**Blocked by:** #04 (FK on redeem_id needs the canonical table settled first)

**Status:** ready-for-agent

- [ ] Migration: INSERT into `reward_redeems` from `reward_redemptions` with data mapping
- [ ] Migration: DROP TABLE `reward_redemptions`
- [ ] Update all TypeScript types, repositories, hooks referencing `reward_redemptions`
- [ ] Update admin pages that reference the old table
- [ ] Verify with `npm run build`
