export type ProductType = "REWARD" | "VOUCHER" | "SUBSCRIPTION" | "DIGITAL" | "PHYSICAL";

export type OrderStatus = "DRAFT" | "PENDING" | "PAID" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceProduct {
  id: string;
  product_type: ProductType;
  reward_id: number | null;
  category_id: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  currency: string;
  images: string[];
  featured: boolean;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceInventory {
  id: string;
  product_id: string;
  total_stock: number;
  reserved_stock: number;
  warning_stock: number;
  unlimited: boolean;
  updated_at: string;
}

export interface MarketplaceOrder {
  id: string;
  user_id: string;
  order_status: OrderStatus;
  total_amount: number;
  currency: string;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}
