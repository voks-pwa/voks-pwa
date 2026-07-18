import type { InventoryMode } from "@/features/inventory/types";

export interface RewardAggregate {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  image_url: string;
  sponsor: string;
  category: string;
  campaign_slug: string;
  cost: number;
  featured: boolean;
  priority: number;
  reward_active: boolean;
  max_per_user: number;
  delivery_type: string;
  terms: string;
  delivery_notes: string;
  bonus_vxp: number;
  required_badge: string;
  required_achievement: string;
  vip_only: boolean;
  expired_at: string;
  created_at: string;
  inventory_mode: InventoryMode;
  stock: number;
  reserved: number;
  available: number;
  voucher_available: number;
  voucher_used: number;
  total_redeems: number;
}
