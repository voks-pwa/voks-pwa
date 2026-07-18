import {
  createShippingRpc,
  updateShippingStatusRpc,
  getShippingByRedeem,
  getUserShipping,
  getShippingTimeline,
  getShippingQueue,
} from "../repositories/shippingRepository";
import { track } from "@/core/action-engine/engine";
import type {
  ShippingRecord,
  ShippingTimelineEntry,
  ShippingResult,
  ShippingStatus,
  ShippingAddress,
  ShippingQueueItem,
} from "../types";

const VALID_TRANSITIONS: Record<ShippingStatus, ShippingStatus[]> = {
  PENDING: ["PACKING", "CANCELLED"],
  PACKING: ["READY_TO_SHIP", "CANCELLED"],
  READY_TO_SHIP: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["IN_TRANSIT", "RETURNED", "CANCELLED"],
  IN_TRANSIT: ["DELIVERED", "RETURNED"],
  DELIVERED: ["COMPLETED", "REPLACED", "RETURNED"],
  COMPLETED: ["REPLACED"],
  RETURNED: ["REPLACED"],
  REPLACED: [],
  CANCELLED: [],
};

export function isValidTransition(
  from: ShippingStatus,
  to: ShippingStatus,
): boolean {
  const allowed = VALID_TRANSITIONS[from];
  if (!allowed) return false;
  return allowed.includes(to);
}

export async function createFulfillment(
  redeemId: string,
  userId: string,
  rewardId: number,
  address: ShippingAddress,
): Promise<ShippingResult> {
  return createShippingRpc(redeemId, userId, rewardId, address);
}

export async function updateStatus(
  shippingId: string,
  status: ShippingStatus,
  options?: {
    note?: string;
    createdBy?: string;
    trackingNumber?: string;
  },
): Promise<ShippingResult> {
  const shipping = await getShippingById(shippingId);
  if (!shipping) {
    return { success: false, error: "Shipping record not found" };
  }

  if (!isValidTransition(shipping.shipping_status, status)) {
    return {
      success: false,
      error: `Cannot transition from ${shipping.shipping_status} to ${status}`,
    };
  }

  const result = await updateShippingStatusRpc(
    shippingId,
    status,
    options?.note,
    options?.createdBy,
    options?.trackingNumber,
  );

  if (result.success) {
    try {
      await track("SHIPPING_STATUS", "system", {
        shipping_id: shippingId,
        from_status: shipping.shipping_status,
        to_status: status,
        tracking_number: options?.trackingNumber ?? "",
      });
    } catch {
      /* notification failure does not block */
    }
  }

  return result;
}

export async function assignTracking(
  shippingId: string,
  trackingNumber: string,
  courier?: string,
  adminId?: string,
): Promise<ShippingResult> {
  if (!trackingNumber.trim()) {
    return { success: false, error: "Tracking number is required" };
  }

  const shipping = await getShippingById(shippingId);
  if (!shipping) {
    return { success: false, error: "Shipping record not found" };
  }

  if (shipping.tracking_number) {
    return { success: false, error: "Tracking number can only be assigned once" };
  }

  return updateShippingStatusRpc(
    shippingId,
    "SHIPPED",
    courier ? `Courier: ${courier}` : "",
    adminId,
    trackingNumber,
  );
}

export async function getShippingById(
  shippingId: string,
): Promise<ShippingRecord | null> {
  return getShippingByRedeem(shippingId);
}

export async function getFulfillmentByRedeem(
  redeemId: string,
): Promise<ShippingRecord | null> {
  return getShippingByRedeem(redeemId);
}

export async function getUserFulfillments(
  userId: string,
): Promise<ShippingRecord[]> {
  return getUserShipping(userId);
}

export async function getTimeline(
  shippingId: string,
): Promise<ShippingTimelineEntry[]> {
  return getShippingTimeline(shippingId);
}

export async function getAdminQueue(
  status?: ShippingStatus,
): Promise<ShippingQueueItem[]> {
  return getShippingQueue(status);
}
