export interface RewardAnalyticsOverview {
  totalRewards: number;
  publishedRewards: number;
  featuredRewards: number;
}

export interface RewardAnalyticsRedeems {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  trend: Record<string, number>;
  statusBreakdown: Record<string, number>;
  topRewards: Record<string, number>;
  leastRewards: Record<string, number>;
}

export interface RewardAnalyticsWallet {
  totalVxpRedeemed: number;
  avgRedeemCost: number;
  highestRedeem: number;
  lowestRedeem: number;
  burnTrend: Record<string, number>;
}

export interface RewardInventoryItem {
  reward_id: number;
  current_stock: number;
  reserved_stock: number;
  warning_stock: number;
  inventory_mode: string;
}

export interface InventoryMovement {
  transaction_type: string;
  amount: number;
  created_at: string;
}

export interface RewardAnalyticsInventory {
  items: RewardInventoryItem[];
  lowStockCount: number;
  outOfStockCount: number;
  totalItems: number;
  movement: InventoryMovement[];
}

export interface RewardAnalyticsVouchers {
  available: number;
  assigned: number;
  used: number;
  expired: number;
  void: number;
  total: number;
  usagePct: number;
}

export interface RewardAnalyticsShipping {
  packingQueue: number;
  readyToShip: number;
  inTransit: number;
  delivered: number;
  completed: number;
  total: number;
}

export interface RewardAnalyticsResponse {
  overview: RewardAnalyticsOverview;
  redeems: RewardAnalyticsRedeems;
  wallet: RewardAnalyticsWallet;
  inventory: RewardAnalyticsInventory;
  vouchers: RewardAnalyticsVouchers;
  shipping: RewardAnalyticsShipping;
  days: number;
}

export interface RedeemTrendPoint {
  date: string;
  redeems: number;
}

export interface WalletTrendPoint {
  date: string;
  vxp: number;
}

export interface TopRewardRow {
  name: string;
  redeems: number;
}

export interface LowStockItem {
  reward_id: number;
  current_stock: number;
  warning_stock: number;
  status: "warning" | "critical";
}
