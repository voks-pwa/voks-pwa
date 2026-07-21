-- Add missing FK constraints and indexes identified in audit.
-- Run in a transaction: clean orphaned rows first, then add constraints.

BEGIN;

-- ========================
-- 1. reward_shipping.redeem_id → reward_redeems(id)
-- ========================
DELETE FROM reward_shipping rs
WHERE NOT EXISTS (SELECT 1 FROM reward_redeems rr WHERE rr.id = rs.redeem_id);

ALTER TABLE reward_shipping
  ADD CONSTRAINT fk_shipping_redeem
  FOREIGN KEY (redeem_id) REFERENCES reward_redeems(id) ON DELETE CASCADE;

-- ========================
-- 2. reward_shipping.reward_id → reward_catalog(id)
-- ========================
DELETE FROM reward_shipping rs
WHERE NOT EXISTS (SELECT 1 FROM reward_catalog rc WHERE rc.id = rs.reward_id);

ALTER TABLE reward_shipping
  ADD CONSTRAINT fk_shipping_reward
  FOREIGN KEY (reward_id) REFERENCES reward_catalog(id) ON DELETE CASCADE;

-- ========================
-- 3. reward_voucher_pool.reward_id → reward_catalog(id)
-- ========================
DELETE FROM reward_voucher_pool rvp
WHERE NOT EXISTS (SELECT 1 FROM reward_catalog rc WHERE rc.id = rvp.reward_id);

ALTER TABLE reward_voucher_pool
  ADD CONSTRAINT fk_voucher_reward
  FOREIGN KEY (reward_id) REFERENCES reward_catalog(id) ON DELETE CASCADE;

-- ========================
-- 4. Missing indexes on FK columns
-- ========================
CREATE INDEX IF NOT EXISTS idx_shipping_timeline_created_by
  ON reward_shipping_timeline(created_by);

CREATE INDEX IF NOT EXISTS idx_inventory_ledger_admin
  ON reward_inventory_ledger(admin_id);

CREATE INDEX IF NOT EXISTS idx_settings_updated_by
  ON settings(updated_by);

CREATE INDEX IF NOT EXISTS idx_shipping_reward_id
  ON reward_shipping(reward_id);

COMMIT;
