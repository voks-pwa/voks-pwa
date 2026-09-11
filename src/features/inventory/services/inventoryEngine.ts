import {
  getInventory,
  getAllInventory,
  getLowStockByWarning,
  getLedgerHistory,
  seedInventory,
  reserveStockRpc,
  deductStockRpc,
  refundStockRpc,
  adjustStockRpc,
  releaseReservationRpc,
} from "../repositories/inventoryRepository";
import type {
  InventoryRecord,
  InventoryLedgerEntry,
  InventoryResult,
  InventoryMode,
} from "../types";

export async function checkStock(
  rewardId: number,
  quantity = 1,
): Promise<{ available: boolean; currentStock: number; reservedStock: number }> {
  const inv = await getInventory(rewardId);

  if (!inv) {
    return { available: false, currentStock: 0, reservedStock: 0 };
  }

  if (inv.inventory_mode === "unlimited") {
    return { available: true, currentStock: -1, reservedStock: 0 };
  }

  const available = inv.current_stock - inv.reserved_stock;
  return {
    available: available >= quantity,
    currentStock: inv.current_stock,
    reservedStock: inv.reserved_stock,
  };
}

export async function reserveStock(
  rewardId: number,
  quantity = 1,
): Promise<InventoryResult> {
  return reserveStockRpc(rewardId, quantity);
}

export async function deductStock(
  rewardId: number,
  quantity = 1,
  referenceType = "redeem",
  referenceId = "",
): Promise<InventoryResult> {
  const result = await deductStockRpc(rewardId, quantity, referenceType, referenceId);

  if (result.success) {
    const inv = await getInventory(rewardId);
    if (inv && inv.current_stock <= inv.warning_stock) {
      // LOW_STOCK is a system-wide signal — don't log with fake user "system"
      // which violates activity_logs.user_id UUID constraint (code 22P02).
      // Use a fire-and-forget system notification instead.
      try {
        const { systemNotification } = await import(
          "@/features/notifications/services/notificationSubscriber"
        );
        systemNotification({
          type: "admin_broadcast",
          metadata: {
            rewardId,
            currentStock: inv.current_stock,
            warningStock: inv.warning_stock,
          },
        });
        console.warn(
          `[INVENTORY] LOW_STOCK reward ${rewardId}: ${inv.current_stock} <= ${inv.warning_stock}`,
        );
      } catch {
        /* notification failure does not block deduct */
      }
    }
  }

  return result;
}

export async function refundStock(
  rewardId: number,
  quantity = 1,
  referenceType = "redeem",
  referenceId = "",
): Promise<InventoryResult> {
  return refundStockRpc(rewardId, quantity, referenceType, referenceId);
}

export async function adjustStock(
  rewardId: number,
  newStock: number,
  adminId?: string,
  reason = "",
): Promise<InventoryResult> {
  if (newStock < 0) {
    return { success: false, error: "Stock cannot be negative" };
  }

  return adjustStockRpc(rewardId, newStock, adminId, reason);
}

export async function releaseReservation(
  rewardId: number,
  quantity = 1,
): Promise<InventoryResult> {
  return releaseReservationRpc(rewardId, quantity);
}

export async function getLowStockItems(): Promise<InventoryRecord[]> {
  return getLowStockByWarning();
}

export async function getInventoryByReward(
  rewardId: number,
): Promise<InventoryRecord | null> {
  return getInventory(rewardId);
}

export async function getAllInventoryRecords(): Promise<InventoryRecord[]> {
  return getAllInventory();
}

export async function getInventoryLedger(
  rewardId: number,
  limit = 50,
  offset = 0,
): Promise<InventoryLedgerEntry[]> {
  return getLedgerHistory(rewardId, limit, offset);
}

export async function seedOrUpdateInventory(
  rewardId: number,
  currentStock: number,
  warningStock = 5,
  inventoryMode: InventoryMode = "limited",
): Promise<void> {
  await seedInventory({
    rewardId,
    currentStock,
    warningStock,
    inventoryMode,
  });
}
