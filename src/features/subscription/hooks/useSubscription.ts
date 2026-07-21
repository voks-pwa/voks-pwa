import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  subscribe,
  renew,
  cancel,
  changePlan,
  getUserSubscription,
  getAnalytics,
  getPlans,
  getSubscriptions,
  getInvoices,
  createPlan,
} from "../services/subscriptionEngine";
import type { PlanCode, BillingInterval } from "../types";

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: getPlans,
    staleTime: 60_000,
  });
}

export function useUserSubscription(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-subscription", userId],
    queryFn: () => (userId ? getUserSubscription(userId) : null),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useSubscriptions() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: getSubscriptions,
    staleTime: 30_000,
  });
}

export function useSubscriptionInvoices() {
  return useQuery({
    queryKey: ["subscription-invoices"],
    queryFn: getInvoices,
    staleTime: 30_000,
  });
}

export function useSubscriptionAnalytics() {
  return useQuery({
    queryKey: ["subscription-analytics"],
    queryFn: getAnalytics,
    staleTime: 60_000,
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      userId: string;
      planId: string;
      planPrice: number;
      billingInterval: BillingInterval;
      autoRenew?: boolean;
    }) => subscribe(args.userId, args.planId, args.planPrice, args.billingInterval, args.autoRenew),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
    },
  });
}

export function useRenewSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { subscriptionId: string; planPrice: number; billingInterval: BillingInterval; userId: string }) =>
      renew(args.subscriptionId, args.planPrice, args.billingInterval, args.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => cancel(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { subscriptionId: string; newPlanId: string }) =>
      changePlan(args.subscriptionId, args.newPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["user-subscription"] });
    },
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      planCode: PlanCode;
      name: string;
      billingInterval: BillingInterval;
      price: number;
      currency?: string;
      description?: string;
      features?: string[];
    }) => createPlan(args.planCode, args.name, args.billingInterval, args.price, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-analytics"] });
    },
  });
}
