import { debit } from "@/features/wallet/services/walletEngine";
import { validateTransaction } from "@/features/economy/services/economyEngine";
import {
  createPlanRpc,
  subscribeUserRpc,
  renewSubscriptionRpc,
  cancelSubscriptionRpc,
  changePlanRpc,
  getUserSubscriptionRpc,
  getSubscriptionAnalyticsRpc,
  getAllPlans,
  getAllSubscriptions,
  getAllInvoices,
} from "../repositories/subscriptionRepository";
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

const BILLING_DAYS: Record<BillingInterval, number> = {
  MONTHLY: 30,
  QUARTERLY: 90,
  YEARLY: 365,
};

export async function createPlan(
  planCode: PlanCode,
  name: string,
  billingInterval: BillingInterval,
  price: number,
  options?: { currency?: string; description?: string; features?: string[] },
): Promise<SubscriptionActionResult> {
  return createPlanRpc(
    planCode,
    name,
    billingInterval,
    price,
    options?.currency ?? "VXP",
    options?.description ?? "",
    options?.features ?? [],
  );
}

export async function subscribe(
  userId: string,
  planId: string,
  planPrice: number,
  billingInterval: BillingInterval,
  autoRenew = true,
): Promise<SubscriptionActionResult> {
  if (planPrice > 0) {
    const validation = await validateTransaction({ userId, amount: -planPrice });
    if (!validation.allowed) {
      return { success: false, error: validation.error ?? "Insufficient VXP balance" };
    }

    const walletResult = await debit({
      userId,
      amount: planPrice,
      transactionType: "REDEEM",
      transactionKey: `SUBSCRIBE_${userId}_${planId}_${Date.now()}`,
      referenceType: "SUBSCRIPTION",
      referenceId: planId,
      description: `Subscription: ${billingInterval} plan`,
    });

    if (!walletResult.success) {
      return { success: false, error: walletResult.error ?? "Payment failed" };
    }

    return subscribeUserRpc(userId, planId, BILLING_DAYS[billingInterval], autoRenew, walletResult.transaction_id ?? null);
  }

  return subscribeUserRpc(userId, planId, BILLING_DAYS[billingInterval], autoRenew, null);
}

export async function renew(
  subscriptionId: string,
  planPrice: number,
  billingInterval: BillingInterval,
  userId: string,
): Promise<SubscriptionActionResult> {
  if (planPrice > 0) {
    const validation = await validateTransaction({ userId, amount: -planPrice });
    if (!validation.allowed) {
      return { success: false, error: validation.error ?? "Insufficient VXP balance" };
    }

    const walletResult = await debit({
      userId,
      amount: planPrice,
      transactionType: "REDEEM",
      transactionKey: `RENEW_${subscriptionId}_${Date.now()}`,
      referenceType: "SUBSCRIPTION",
      referenceId: subscriptionId,
      description: `Subscription renewal: ${billingInterval}`,
    });

    if (!walletResult.success) {
      return { success: false, error: walletResult.error ?? "Renewal payment failed" };
    }

    return renewSubscriptionRpc(subscriptionId, BILLING_DAYS[billingInterval], walletResult.transaction_id ?? null);
  }

  return renewSubscriptionRpc(subscriptionId, BILLING_DAYS[billingInterval], null);
}

export async function cancel(subscriptionId: string): Promise<SubscriptionActionResult> {
  return cancelSubscriptionRpc(subscriptionId);
}

export async function changePlan(
  subscriptionId: string,
  newPlanId: string,
): Promise<SubscriptionActionResult> {
  return changePlanRpc(subscriptionId, newPlanId);
}

export async function getUserSubscription(userId: string): Promise<SubscriptionDetail | null> {
  return getUserSubscriptionRpc(userId);
}

export async function getAnalytics(): Promise<SubscriptionAnalytics | null> {
  return getSubscriptionAnalyticsRpc();
}

export async function getPlans(): Promise<SubscriptionPlan[]> {
  return getAllPlans();
}

export async function getSubscriptions(): Promise<UserSubscription[]> {
  return getAllSubscriptions();
}

export async function getInvoices(): Promise<SubscriptionInvoice[]> {
  return getAllInvoices();
}
