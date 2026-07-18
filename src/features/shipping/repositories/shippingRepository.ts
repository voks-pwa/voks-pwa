import { supabase } from "@/lib/supabase";
import type {
  ShippingRecord,
  ShippingTimelineEntry,
  ShippingResult,
  ShippingStatus,
  ShippingAddress,
  ShippingQueueItem,
} from "../types";

export async function getShippingByRedeem(
  redeemId: string,
): Promise<ShippingRecord | null> {
  const { data, error } = await supabase
    .from("reward_shipping")
    .select("*")
    .eq("redeem_id", redeemId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserShipping(
  userId: string,
): Promise<ShippingRecord[]> {
  const { data, error } = await supabase
    .from("reward_shipping")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getShippingTimeline(
  shippingId: string,
): Promise<ShippingTimelineEntry[]> {
  const { data, error } = await supabase
    .from("reward_shipping_timeline")
    .select("*")
    .eq("shipping_id", shippingId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createShippingRpc(
  redeemId: string,
  userId: string,
  rewardId: number,
  address: ShippingAddress,
): Promise<ShippingResult> {
  const { data, error } = await supabase.rpc("create_shipping_record", {
    p_redeem_id: redeemId,
    p_user_id: userId,
    p_reward_id: rewardId,
    p_recipient_name: address.recipientName,
    p_phone: address.phone,
    p_address: address.address,
    p_province: address.province,
    p_city: address.city,
    p_postal_code: address.postalCode,
  });

  if (error) return { success: false, error: error.message };
  return data as ShippingResult;
}

export async function updateShippingStatusRpc(
  shippingId: string,
  status: string,
  note?: string,
  createdBy?: string,
  trackingNumber?: string,
): Promise<ShippingResult> {
  const { data, error } = await supabase.rpc("update_shipping_status", {
    p_shipping_id: shippingId,
    p_status: status,
    p_note: note ?? "",
    p_created_by: createdBy ?? null,
    p_tracking_number: trackingNumber ?? null,
  });

  if (error) return { success: false, error: error.message };
  return data as ShippingResult;
}

export async function getShippingQueue(
  status?: ShippingStatus,
): Promise<ShippingQueueItem[]> {
  const { data, error } = await supabase.rpc("get_shipping_queue", {
    p_status: status ?? null,
  });

  if (error) throw error;

  const result = data as {
    success: boolean;
    data: ShippingQueueItem[];
  };

  if (!result.success) return [];
  return result.data ?? [];
}
