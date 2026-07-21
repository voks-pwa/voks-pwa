import type { OrderStatus } from "@/features/marketplace/types";

export interface CartItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_type: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  order: {
    id: string;
    user_id: string;
    order_status: OrderStatus;
    total_amount: number;
    currency: string;
    expires_at: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  items: CartItem[];
  total: number;
}

export interface CheckoutResult {
  success: boolean;
  error?: string;
  order_id?: string;
  transaction_id?: number;
  current_vxp?: number;
  payment_method?: string;
  redirect_url?: string;
}
