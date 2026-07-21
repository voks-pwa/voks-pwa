# 04 — Add missing FK constraints

**What to build:** Several tables have columns that act as foreign keys but lack explicit FK constraints and sometimes indexes. A new migration adds:
- `reward_shipping.redeem_id` → REFERENCES `reward_redeems(id)`
- `reward_shipping.reward_id` → REFERENCES `reward_catalog(id)`
- `reward_voucher_pool.reward_id` → REFERENCES `reward_catalog(id)`
- Indexes on `reward_shipping.created_by`, `reward_inventory_ledger.admin_id`, `settings.updated_by`, `reward_shipping.reward_id`

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `supabase/migrations/20260812000004_add_missing_foreign_keys.sql`
- [ ] Clean orphaned rows before adding FK constraints
- [ ] Add FK: `reward_shipping.redeem_id → reward_redeems(id)`
- [ ] Add FK: `reward_shipping.reward_id → reward_catalog(id)`
- [ ] Add FK: `reward_voucher_pool.reward_id → reward_catalog(id)`
- [ ] Add missing indexes on FK columns
- [ ] Verify with `npm run build`
