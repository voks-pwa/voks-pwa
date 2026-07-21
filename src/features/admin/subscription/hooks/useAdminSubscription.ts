import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptions,
  getInvoices,
  getAnalytics,
  getPlans,
  cancel,
  changePlan,
  createPlan,
} from "@/features/subscription/services/subscriptionEngine";
import type { PlanCode, BillingInterval } from "@/features/subscription/types";

export function useAdminSubscriptionPlans() {
  return useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: getPlans,
    staleTime: 60_000,
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: getSubscriptions,
    staleTime: 30_000,
  });
}

export function useAdminInvoices() {
  return useQuery({
    queryKey: ["admin-subscription-invoices"],
    queryFn: getInvoices,
    staleTime: 30_000,
  });
}

export function useAdminSubscriptionAnalytics() {
  return useQuery({
    queryKey: ["admin-subscription-analytics"],
    queryFn: getAnalytics,
    staleTime: 60_000,
  });
}

export function useAdminCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: string) => cancel(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-analytics"] });
    },
  });
}

export function useAdminChangePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { subscriptionId: string; newPlanId: string }) =>
      changePlan(args.subscriptionId, args.newPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-analytics"] });
    },
  });
}

export function useAdminCreatePlan() {
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
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-analytics"] });
    },
  });
}
