export type InventoryMode = "limited" | "unlimited";

export type InventoryTransactionType =
  | "RESERVE"
  | "DEDUCT"
  | "REFUND"
  | "ADJUSTMENT"
  | "RESTOCK";

export interface InventoryRecord {
  reward_id: number;
  current_stock: number;
  reserved_stock: number;
  warning_stock: number;
  inventory_mode: InventoryMode;
  updated_at: string;
}

export interface InventoryLedgerEntry {
  id: string;
  reward_id: number;
  transaction_type: InventoryTransactionType;
  amount: number;
  before_stock: number;
  after_stock: number;
  reference_type: string;
  reference_id: string;
  admin_id: string | null;
  created_at: string;
}

export interface InventoryResult {
  success: boolean;
  error?: string;
  reserved?: number;
  deducted?: number;
  refunded?: number;
  remaining?: number;
  available?: number;
  delta?: number;
  before?: number;
  after?: number;
  unlimited?: boolean;
}

export interface SeedInventoryInput {
  rewardId: number;
  currentStock: number;
  warningStock?: number;
  inventoryMode?: InventoryMode;
}
