import { supabase } from "@/lib/supabase";
import type {
  InventoryRecord,
  InventoryLedgerEntry,
  InventoryResult,
  InventoryMode,
} from "../types";

export async function getInventory(
  rewardId: number,
): Promise<InventoryRecord | null> {
  const { data, error } = await supabase
    .from("reward_inventory")
    .select("*")
    .eq("reward_id", rewardId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getAllInventory(): Promise<InventoryRecord[]> {
  const { data, error } = await supabase
    .from("reward_inventory")
    .select("*")
    .order("reward_id");

  if (error) throw error;
  return data ?? [];
}

export async function getLowStockItems(
  threshold?: number,
): Promise<InventoryRecord[]> {
  let query = supabase
    .from("reward_inventory")
    .select("*")
    .eq("inventory_mode", "limited");

  if (threshold !== undefined) {
    query = query.lte("current_stock", threshold);
  } else {
    query = query.lte("current_stock", supabase.rpc("get_warning_threshold"));
  }

  const { data, error } = await query.order("current_stock");
  if (error) throw error;
  return data ?? [];
}

export async function getLowStockByWarning(): Promise<InventoryRecord[]> {
  const { data: direct, error: directError } = await supabase
    .from("reward_inventory")
    .select("*")
    .eq("inventory_mode", "limited");

  if (directError) throw directError;

  const items = direct ?? [];
  return items.filter(
    (item) => item.current_stock <= item.warning_stock,
  );
}

export async function getLedgerHistory(
  rewardId: number,
  limit = 50,
  offset = 0,
): Promise<InventoryLedgerEntry[]> {
  const { data, error } = await supabase
    .from("reward_inventory_ledger")
    .select("*")
    .eq("reward_id", rewardId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data ?? [];
}

export async function seedInventory(input: {
  rewardId: number;
  currentStock: number;
  warningStock?: number;
  inventoryMode?: InventoryMode;
}): Promise<void> {
  const { error } = await supabase.from("reward_inventory").upsert(
    {
      reward_id: input.rewardId,
      current_stock: input.currentStock,
      warning_stock: input.warningStock ?? 5,
      inventory_mode: input.inventoryMode ?? "limited",
    },
    { onConflict: "reward_id" },
  );

  if (error) throw error;
}

export async function reserveStockRpc(
  rewardId: number,
  quantity = 1,
): Promise<InventoryResult> {
  const { data, error } = await supabase.rpc("reserve_stock", {
    p_reward_id: rewardId,
    p_quantity: quantity,
  });

  if (error) return { success: false, error: error.message };
  return data as InventoryResult;
}

export async function deductStockRpc(
  rewardId: number,
  quantity = 1,
  referenceType = "",
  referenceId = "",
): Promise<InventoryResult> {
  const { data, error } = await supabase.rpc("deduct_stock", {
    p_reward_id: rewardId,
    p_quantity: quantity,
    p_reference_type: referenceType,
    p_reference_id: referenceId,
  });

  if (error) return { success: false, error: error.message };
  return data as InventoryResult;
}

export async function refundStockRpc(
  rewardId: number,
  quantity = 1,
  referenceType = "",
  referenceId = "",
): Promise<InventoryResult> {
  const { data, error } = await supabase.rpc("refund_stock", {
    p_reward_id: rewardId,
    p_quantity: quantity,
    p_reference_type: referenceType,
    p_reference_id: referenceId,
  });

  if (error) return { success: false, error: error.message };
  return data as InventoryResult;
}

export async function adjustStockRpc(
  rewardId: number,
  newStock: number,
  adminId?: string,
  reason = "",
): Promise<InventoryResult> {
  const { data, error } = await supabase.rpc("adjust_stock", {
    p_reward_id: rewardId,
    p_new_stock: newStock,
    p_admin_id: adminId ?? null,
    p_reason: reason,
  });

  if (error) return { success: false, error: error.message };
  return data as InventoryResult;
}

export async function releaseReservationRpc(
  rewardId: number,
  quantity = 1,
): Promise<InventoryResult> {
  const { data, error } = await supabase.rpc("release_reservation", {
    p_reward_id: rewardId,
    p_quantity: quantity,
  });

  if (error) return { success: false, error: error.message };
  return data as InventoryResult;
}
