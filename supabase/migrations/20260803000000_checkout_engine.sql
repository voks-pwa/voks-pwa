-- Sprint C.4: Checkout Engine
--
-- Adds:
--   1. expires_at to marketplace_orders (cart TTL)
--   2. RPCs: add_to_cart, remove_from_cart, clear_cart, get_cart,
--      lock_inventory, release_inventory, process_checkout

-- ============================================================
-- 1. Add expires_at for cart expiry
-- ============================================================
ALTER TABLE marketplace_orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- ============================================================
-- 2. get_cart — get the user's active DRAFT cart with items
-- ============================================================
CREATE OR REPLACE FUNCTION get_cart(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_order JSONB;
  v_items JSONB;
  v_total INT;
BEGIN
  SELECT row_to_json(o)::jsonb INTO v_order
  FROM marketplace_orders o
  WHERE o.user_id = p_user_id AND o.order_status = 'DRAFT'
  ORDER BY o.created_at DESC
  LIMIT 1;

  IF v_order IS NULL THEN
    RETURN jsonb_build_object('order', null, 'items', '[]'::jsonb, 'total', 0);
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(i)::jsonb), '[]'::jsonb) INTO v_items
  FROM marketplace_order_items i
  WHERE i.order_id = (v_order->>'id')::UUID;

  SELECT COALESCE(SUM(subtotal), 0) INTO v_total
  FROM marketplace_order_items
  WHERE order_id = (v_order->>'id')::UUID;

  RETURN jsonb_build_object(
    'order', v_order,
    'items', v_items,
    'total', v_total
  );
END;
$$;

-- ============================================================
-- 3. add_to_cart — atomic upsert: creates DRAFT order if needed
-- ============================================================
CREATE OR REPLACE FUNCTION add_to_cart(
  p_user_id UUID,
  p_product_id UUID,
  p_quantity INT DEFAULT 1,
  p_product_name TEXT DEFAULT '',
  p_product_type TEXT DEFAULT 'DIGITAL',
  p_unit_price INT DEFAULT 0
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_subtotal INT;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quantity must be positive');
  END IF;

  -- Get or create DRAFT order
  SELECT id INTO v_order_id
  FROM marketplace_orders
  WHERE user_id = p_user_id AND order_status = 'DRAFT'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_order_id IS NULL THEN
    INSERT INTO marketplace_orders (user_id, order_status, total_amount, expires_at)
    VALUES (p_user_id, 'DRAFT', 0, now() + interval '7 days')
    RETURNING id INTO v_order_id;
  END IF;

  v_subtotal := p_quantity * p_unit_price;

  -- Upsert order item
  INSERT INTO marketplace_order_items (order_id, product_id, product_name, product_type, quantity, unit_price, subtotal)
  VALUES (v_order_id, p_product_id, p_product_name, p_product_type, p_quantity, p_unit_price, v_subtotal)
  ON CONFLICT ON CONSTRAINT marketplace_order_items_order_id_product_id_key
  DO UPDATE SET
    quantity = marketplace_order_items.quantity + EXCLUDED.quantity,
    subtotal = (marketplace_order_items.quantity + EXCLUDED.quantity) * marketplace_order_items.unit_price;

  -- Update order total
  UPDATE marketplace_orders
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM marketplace_order_items
    WHERE order_id = v_order_id
  ),
  updated_at = now()
  WHERE id = v_order_id;

  RETURN jsonb_build_object('success', true, 'order_id', v_order_id::TEXT);
END;
$$;

-- ============================================================
-- 4. remove_from_cart — remove item from cart
-- ============================================================
CREATE OR REPLACE FUNCTION remove_from_cart(
  p_user_id UUID,
  p_product_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  SELECT id INTO v_order_id
  FROM marketplace_orders
  WHERE user_id = p_user_id AND order_status = 'DRAFT'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_order_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cart not found');
  END IF;

  DELETE FROM marketplace_order_items
  WHERE order_id = v_order_id AND product_id = p_product_id;

  UPDATE marketplace_orders
  SET total_amount = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM marketplace_order_items
    WHERE order_id = v_order_id
  ),
  updated_at = now()
  WHERE id = v_order_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 5. clear_cart — remove all items from cart
-- ============================================================
CREATE OR REPLACE FUNCTION clear_cart(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  SELECT id INTO v_order_id
  FROM marketplace_orders
  WHERE user_id = p_user_id AND order_status = 'DRAFT'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_order_id IS NULL THEN
    RETURN jsonb_build_object('success', true);
  END IF;

  DELETE FROM marketplace_order_items WHERE order_id = v_order_id;

  UPDATE marketplace_orders
  SET total_amount = 0, updated_at = now()
  WHERE id = v_order_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 6. lock_inventory — reserve stock for order items (atomic)
-- ============================================================
CREATE OR REPLACE FUNCTION lock_inventory(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_inv RECORD;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM marketplace_order_items
    WHERE order_id = p_order_id
  LOOP
    SELECT * INTO v_inv
    FROM marketplace_inventory
    WHERE product_id = v_item.product_id
    FOR UPDATE;

    IF v_inv.unlimited THEN
      CONTINUE;
    END IF;

    IF (v_inv.total_stock - v_inv.reserved_stock) < v_item.quantity THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Insufficient stock for product',
        'product_id', v_item.product_id::TEXT
      );
    END IF;

    UPDATE marketplace_inventory
    SET reserved_stock = reserved_stock + v_item.quantity,
        updated_at = now()
    WHERE product_id = v_item.product_id;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 7. release_inventory — release reserved stock for order items
-- ============================================================
CREATE OR REPLACE FUNCTION release_inventory(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM marketplace_order_items
    WHERE order_id = p_order_id
  LOOP
    UPDATE marketplace_inventory
    SET reserved_stock = GREATEST(0, reserved_stock - v_item.quantity),
        updated_at = now()
    WHERE product_id = v_item.product_id;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 8. deduct_inventory — confirm reservation (deduct from stock)
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_inventory(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
BEGIN
  FOR v_item IN
    SELECT product_id, quantity
    FROM marketplace_order_items
    WHERE order_id = p_order_id
  LOOP
    UPDATE marketplace_inventory
    SET total_stock = total_stock - v_item.quantity,
        reserved_stock = GREATEST(0, reserved_stock - v_item.quantity),
        updated_at = now()
    WHERE product_id = v_item.product_id
      AND unlimited = false;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================
-- 9. Add unique constraint on order_items (order_id + product_id)
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'marketplace_order_items_order_id_product_id_key'
  ) THEN
    ALTER TABLE marketplace_order_items
    ADD CONSTRAINT marketplace_order_items_order_id_product_id_key
    UNIQUE (order_id, product_id);
  END IF;
END;
$$;
