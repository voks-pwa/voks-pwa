# 06 — Consolidate voucher pools

**What to build:** Two parallel voucher pool systems: `reward_voucher_pool` (v1) and `marketplace_voucher_pool` (v2 with `marketplace_products` FK). This is a wide refactor (expand–contract). Canonical: `reward_voucher_pool`. Migrate marketplace voucher data into `reward_voucher_pool`. Drop `marketplace_voucher_pool` table and its associated RPCs (`reserve_marketplace_voucher`, `assign_marketplace_voucher`). Update all code that uses marketplace voucher APIs.

**Blocked by:** #04 (FK on reward_id needs canonical table settled)

**Status:** ready-for-agent

- [ ] Migration: migrate data from `marketplace_voucher_pool` to `reward_voucher_pool`
- [ ] Migration: DROP TABLE `marketplace_voucher_pool`
- [ ] Migration: DROP FUNCTION `reserve_marketplace_voucher`, `assign_marketplace_voucher`
- [ ] Update TypeScript types, repositories, hooks for marketplace voucher
- [ ] Verify with `npm run build`
