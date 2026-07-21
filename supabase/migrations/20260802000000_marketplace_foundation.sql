-- Sprint C.3: Marketplace Foundation
--
-- Tables:
--   1. marketplace_categories — product taxonomy
--   2. marketplace_products — master product catalog (links to reward_catalog)
--   3. marketplace_inventory — stock tracking per product
--   4. marketplace_orders — user orders
--   5. marketplace_order_items — line items in orders
-- Seed: default categories + link existing rewards to marketplace_products

-- ============================================================
-- 1. marketplace_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  parent_id UUID REFERENCES marketplace_categories(id),
  image_url TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mc_slug ON marketplace_categories(slug);
CREATE INDEX IF NOT EXISTS idx_mc_parent ON marketplace_categories(parent_id);

ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories public read"
  ON marketplace_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "categories service write"
  ON marketplace_categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. marketplace_products
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL CHECK (product_type IN ('REWARD', 'VOUCHER', 'SUBSCRIPTION', 'DIGITAL', 'PHYSICAL')),
  reward_id INT REFERENCES reward_catalog(id) ON DELETE SET NULL,
  category_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  price INT NOT NULL CHECK (price >= 0),
  original_price INT CHECK (original_price >= 0),
  currency TEXT NOT NULL DEFAULT 'VXP',
  images JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mp_product_type ON marketplace_products(product_type);
CREATE INDEX IF NOT EXISTS idx_mp_category ON marketplace_products(category_id);
CREATE INDEX IF NOT EXISTS idx_mp_reward ON marketplace_products(reward_id);
CREATE INDEX IF NOT EXISTS idx_mp_active ON marketplace_products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_mp_featured ON marketplace_products(featured) WHERE featured = true;

ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products public read"
  ON marketplace_products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "products service write"
  ON marketplace_products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. marketplace_inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID UNIQUE NOT NULL REFERENCES marketplace_products(id) ON DELETE CASCADE,
  total_stock INT NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
  reserved_stock INT NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
  warning_stock INT DEFAULT 0,
  unlimited BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mi_product ON marketplace_inventory(product_id);

ALTER TABLE marketplace_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory public read"
  ON marketplace_inventory FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "inventory service write"
  ON marketplace_inventory FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 4. marketplace_orders
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (order_status IN ('DRAFT', 'PENDING', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED')),
  total_amount INT NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'VXP',
  notes TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mo_user ON marketplace_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_mo_status ON marketplace_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_mo_created ON marketplace_orders(created_at DESC);

ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders own read"
  ON marketplace_orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "orders own insert"
  ON marketplace_orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders service all"
  ON marketplace_orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 5. marketplace_order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES marketplace_products(id),
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price INT NOT NULL CHECK (unit_price >= 0),
  subtotal INT NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX IF NOT EXISTS idx_moi_order ON marketplace_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_moi_product ON marketplace_order_items(product_id);

ALTER TABLE marketplace_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items own read"
  ON marketplace_order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM marketplace_orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "order_items service all"
  ON marketplace_order_items FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 6. Seed: default categories
-- ============================================================
INSERT INTO marketplace_categories (slug, name, description, sort_order) VALUES
  ('voucher', 'Voucher', 'Digital voucher codes', 1),
  ('merchandise', 'Merchandise', 'Physical merchandise items', 2),
  ('digital', 'Digital Goods', 'Digital downloads and content', 3),
  ('subscription', 'Subscription', 'Premium subscription plans', 4),
  ('event', 'Event', 'Event tickets and passes', 5),
  ('donation', 'Donation', 'Charity and social causes', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. Seed: link existing active reward_catalog entries to marketplace_products
-- ============================================================
WITH default_cat AS (
  SELECT id FROM marketplace_categories WHERE slug = 'voucher' LIMIT 1
)
INSERT INTO marketplace_products (product_type, reward_id, category_id, name, slug, description, price, original_price, currency, featured, is_active)
SELECT
  'REWARD',
  rc.id,
  default_cat.id,
  rc.title,
  rc.slug,
  COALESCE(rc.description, ''),
  rc.cost,
  rc.cost,
  'VXP',
  rc.featured,
  rc.reward_active
FROM reward_catalog rc
CROSS JOIN default_cat
WHERE NOT EXISTS (
  SELECT 1 FROM marketplace_products mp WHERE mp.reward_id = rc.id
);

-- ============================================================
-- 8. Seed: create marketplace_inventory entries for seeded products
-- ============================================================
INSERT INTO marketplace_inventory (product_id, total_stock, reserved_stock, warning_stock, unlimited)
SELECT
  mp.id,
  COALESCE(ri.current_stock, 0),
  COALESCE(ri.reserved_stock, 0),
  COALESCE(ri.warning_stock, 0),
  CASE WHEN ri.inventory_mode = 'unlimited' THEN true ELSE false END
FROM marketplace_products mp
LEFT JOIN reward_inventory ri ON ri.reward_id = mp.reward_id
WHERE NOT EXISTS (
  SELECT 1 FROM marketplace_inventory mi WHERE mi.product_id = mp.id
);
