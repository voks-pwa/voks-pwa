import {
  registerPushSubscription,
  unregisterPushSubscription,
  getMyPushSubscriptions,
} from "../repositories/pushSubscriptionRepository";
import type { PushSubscriptionRecord } from "../repositories/pushSubscriptionRepository";

export async function registerPush(input: {
  endpoint: string;
  p256dh?: string;
  auth?: string;
  deviceType?: string;
}): Promise<{ success: boolean; subscription_id?: string; error?: string }> {
  return registerPushSubscription(input.endpoint, input.p256dh, input.auth, input.deviceType);
}

export async function unregisterPush(endpoint: string): Promise<{ success: boolean; error?: string }> {
  const result = await unregisterPushSubscription(endpoint);
  if (!result.success) return { success: false, error: result.error };
  return { success: true };
}

export async function listMyPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
  return getMyPushSubscriptions();
}

export async function registerBrowserPush(
  subscription: PushSubscriptionJSON | null,
): Promise<{ success: boolean; error?: string }> {
  if (!subscription || !subscription.endpoint) {
    return { success: false, error: "Invalid push subscription" };
  }
  const result = await registerPushSubscription(
    subscription.endpoint,
    subscription.keys?.p256dh ?? "",
    subscription.keys?.auth ?? "",
    "web",
  );
  if (!result.success) return { success: false, error: result.error };
  return { success: true };
}
