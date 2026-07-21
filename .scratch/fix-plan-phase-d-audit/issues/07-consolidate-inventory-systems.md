# 07 — Consolidate inventory systems

**What to build:** Two parallel inventory systems: `reward_inventory` + `reward_inventory_ledger` (v1) and `marketplace_inventory` (v2 with UUID PK). This is a wide refactor (expand–contract). Canonical: `marketplace_inventory` (newer, UUID PK, cleaner schema). Migrate data from `reward_inventory` into `marketplace_inventory`. Drop `reward_inventory` and `reward_inventory_ledger`. Update all frontend code using the old inventory system.

**Blocked by:** #04 (FK constraint cleanup needed first)

**Status:** ready-for-agent

- [ ] Migration: migrate data from `reward_inventory` to `marketplace_inventory`
- [ ] Migration: DROP TABLE `reward_inventory`, `reward_inventory_ledger`
- [ ] Update all TypeScript types, repositories, hooks using old inventory
- [ ] Verify with `npm run build`
