import { supabase } from "@/lib/supabase";

export interface PushSubscriptionRecord {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  device_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function registerPushSubscription(
  endpoint: string,
  p256dh?: string,
  auth?: string,
  deviceType?: string,
): Promise<{ success: boolean; subscription_id?: string; error?: string }> {
  const { data, error } = await supabase.rpc("register_push_subscription", {
    p_endpoint: endpoint,
    p_p256dh: p256dh ?? "",
    p_auth: auth ?? "",
    p_device_type: deviceType ?? "web",
  });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; subscription_id?: string; error?: string };
}

export async function unregisterPushSubscription(
  endpoint: string,
): Promise<{ success: boolean; endpoint?: string; error?: string }> {
  const { data, error } = await supabase.rpc("unregister_push_subscription", {
    p_endpoint: endpoint,
  });
  if (error) return { success: false, error: error.message };
  return data as { success: boolean; endpoint?: string; error?: string };
}

export async function getMyPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}
