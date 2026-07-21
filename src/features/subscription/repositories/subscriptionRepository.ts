import { supabase } from "@/lib/supabase";
import type {
  SubscriptionPlan,
  UserSubscription,
  SubscriptionInvoice,
  SubscriptionDetail,
  SubscriptionAnalytics,
  SubscriptionActionResult,
  PlanCode,
  BillingInterval,
} from "../types";

export async function createPlanRpc(
  planCode: PlanCode,
  name: string,
  billingInterval: BillingInterval,
  price: number,
  currency: string,
  description: string,
  features: string[],
): Promise<SubscriptionActionResult> {
  const { data, error } = await supabase.rpc("create_subscription_plan", {
    p_plan_code: planCode,
    p_name: name,
    p_billing_interval: billingInterval,
    p_price: price,
    p_currency: currency,
    p_description: description,
    p_features: features,
  });
  if (error) return { success: false, error: error.message };
  return data as SubscriptionActionResult;
}

export async function subscribeUserRpc(
  userId: string,
  planId: string,
  periodDays: number,
  autoRenew: boolean,
  walletTxnId: number | null,
): Promise<SubscriptionActionResult> {
  const { data, error } = await supabase.rpc("subscribe_user", {
    p_user_id: userId,
    p_plan_id: planId,
    p_period_days: periodDays,
    p_auto_renew: autoRenew,
    p_wallet_txn_id: walletTxnId,
  });
  if (error) return { success: false, error: error.message };
  return data as SubscriptionActionResult;
}

export async function renewSubscriptionRpc(
  subscriptionId: string,
  periodDays: number,
  walletTxnId: number | null,
): Promise<SubscriptionActionResult> {
  const { data, error } = await supabase.rpc("renew_subscription", {
    p_subscription_id: subscriptionId,
    p_period_days: periodDays,
    p_wallet_txn_id: walletTxnId,
  });
  if (error) return { success: false, error: error.message };
  return data as SubscriptionActionResult;
}

export async function cancelSubscriptionRpc(subscriptionId: string): Promise<SubscriptionActionResult> {
  const { data, error } = await supabase.rpc("cancel_subscription", { p_subscription_id: subscriptionId });
  if (error) return { success: false, error: error.message };
  return data as SubscriptionActionResult;
}

export async function changePlanRpc(
  subscriptionId: string,
  newPlanId: string,
): Promise<SubscriptionActionResult> {
  const { data, error } = await supabase.rpc("change_subscription_plan", {
    p_subscription_id: subscriptionId,
    p_new_plan_id: newPlanId,
  });
  if (error) return { success: false, error: error.message };
  return data as SubscriptionActionResult;
}

export async function getUserSubscriptionRpc(userId: string): Promise<SubscriptionDetail | null> {
  const { data, error } = await supabase.rpc("get_user_subscription", { p_user_id: userId });
  if (error || !data?.success) return null;
  return data as SubscriptionDetail;
}

export async function getSubscriptionAnalyticsRpc(): Promise<SubscriptionAnalytics | null> {
  const { data, error } = await supabase.rpc("get_subscription_analytics");
  if (error || !data?.success) return null;
  return data as SubscriptionAnalytics;
}

export async function getAllPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function getAllSubscriptions(): Promise<UserSubscription[]> {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getAllInvoices(): Promise<SubscriptionInvoice[]> {
  const { data, error } = await supabase
    .from("subscription_invoices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}
