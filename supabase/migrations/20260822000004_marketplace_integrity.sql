-- Fase 3 — Marketplace & Commerce
-- Contains: 3.1 (inventory canonical sync), 3.4 (voucher pool sync), 3.8 (lock TTL)

-- ============================================================
-- 3.8: Inventory lock TTL — release stale pending orders > 15 min
-- ============================================================
CREATE OR REPLACE FUNCTION release_stale_locks()
RETURNS TABLE(released_orders BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  UPDATE public.marketplace_orders
  SET order_status = 'CANCELLED',
      updated_at = now()
  WHERE order_status = 'PENDING'
    AND updated_at < now() - interval '15 minutes';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$;

-- ============================================================
-- 3.1: Inventory canonical sync RPC — sync reward_inventory
-- when marketplace_inventory changes for linked products
-- ============================================================
CREATE OR REPLACE FUNCTION sync_inventory_to_reward(p_product_id UUID, p_new_stock INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_reward_id INTEGER;
BEGIN
  SELECT reward_id INTO v_reward_id
  FROM public.marketplace_products
  WHERE id = p_product_id AND reward_id IS NOT NULL;

  IF v_reward_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.reward_inventory
  SET current_stock = p_new_stock,
      updated_at = now()
  WHERE reward_id = v_reward_id;

  RETURN FOUND;
END;
$$;

-- Add locked_at column to marketplace_inventory for TTL tracking
ALTER TABLE marketplace_inventory ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- ============================================================
-- 3.4: Voucher pool sync RPC — sync marketplace voucher
-- to reward voucher pool for linked products
-- ============================================================
CREATE OR REPLACE FUNCTION sync_voucher_to_reward_pool(p_voucher_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_product_id UUID;
  v_reward_id INTEGER;
  v_voucher RECORD;
BEGIN
  SELECT product_id, voucher_code, status, assigned_user, expired_at
  INTO v_product_id, v_voucher.voucher_code, v_voucher.status, v_voucher.assigned_user, v_voucher.expired_at
  FROM public.marketplace_voucher_pool
  WHERE id = p_voucher_id;

  IF v_product_id IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT reward_id INTO v_reward_id
  FROM public.marketplace_products
  WHERE id = v_product_id AND reward_id IS NOT NULL;

  IF v_reward_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.reward_voucher_pool (reward_id, voucher_code, status, assigned_user, expired_at)
  VALUES (v_reward_id, v_voucher.voucher_code, v_voucher.status, v_voucher.assigned_user, v_voucher.expired_at)
  ON CONFLICT (voucher_code) DO NOTHING;

  RETURN FOUND;
END;
$$;
