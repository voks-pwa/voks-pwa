import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminFulfillments, getAdminRefunds } from "../api/commerce";
import {
  createFulfillment,
  updateFulfillmentStatus,
  processRefund,
  getAnalytics,
  getEvents,
} from "@/features/commerce/services/commerceEngine";
import type { RefundStatus } from "@/features/commerce/types";

export function useAdminFulfillments() {
  return useQuery({
    queryKey: ["admin-fulfillments"],
    queryFn: getAdminFulfillments,
    staleTime: 30_000,
  });
}

export function useAdminRefunds() {
  return useQuery({
    queryKey: ["admin-refunds"],
    queryFn: getAdminRefunds,
    staleTime: 30_000,
  });
}

export function useAdminCommerceAnalytics(days?: number) {
  return useQuery({
    queryKey: ["admin-commerce-analytics", days],
    queryFn: () => getAnalytics(days),
    staleTime: 60_000,
  });
}

export function useAdminCommerceEvents(days?: number) {
  return useQuery({
    queryKey: ["admin-commerce-events", days],
    queryFn: () => getEvents(days),
    staleTime: 60_000,
  });
}

export function useAdminCreateFulfillment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => createFulfillment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fulfillments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commerce-analytics"] });
    },
  });
}

export function useAdminUpdateFulfillment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { fulfillmentId: string; status: string; trackingNumber?: string; carrier?: string; notes?: string }) =>
      updateFulfillmentStatus(args.fulfillmentId, args.status, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-fulfillments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commerce-analytics"] });
    },
  });
}

export function useAdminProcessRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { refundId: string; status: RefundStatus; processedBy?: string }) =>
      processRefund(args.refundId, args.status, args.processedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-refunds"] });
      queryClient.invalidateQueries({ queryKey: ["admin-commerce-analytics"] });
    },
  });
}
