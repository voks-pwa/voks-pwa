import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  recordEvent,
  createFulfillment,
  updateFulfillmentStatus,
  processRefund,
  getAnalytics,
  getFulfillments,
  getFulfillment,
  getRefunds,
  getOrderRefunds,
  requestRefund,
  getEvents,
} from "../services/commerceEngine";
import type { RefundStatus } from "../types";

export function useCommerceAnalytics(days?: number) {
  return useQuery({
    queryKey: ["commerce-analytics", days],
    queryFn: () => getAnalytics(days),
    staleTime: 60_000,
  });
}

export function useFulfillments() {
  return useQuery({
    queryKey: ["fulfillments"],
    queryFn: getFulfillments,
    staleTime: 30_000,
  });
}

export function useFulfillment(orderId: string | undefined) {
  return useQuery({
    queryKey: ["fulfillment", orderId],
    queryFn: () => (orderId ? getFulfillment(orderId) : null),
    enabled: !!orderId,
    staleTime: 30_000,
  });
}

export function useRefunds() {
  return useQuery({
    queryKey: ["refunds"],
    queryFn: getRefunds,
    staleTime: 30_000,
  });
}

export function useOrderRefunds(orderId: string | undefined) {
  return useQuery({
    queryKey: ["order-refunds", orderId],
    queryFn: () => (orderId ? getOrderRefunds(orderId) : []),
    enabled: !!orderId,
    staleTime: 30_000,
  });
}

export function useCommerceEvents(days?: number) {
  return useQuery({
    queryKey: ["commerce-events", days],
    queryFn: () => getEvents(days),
    staleTime: 60_000,
  });
}

export function useCreateFulfillment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => createFulfillment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fulfillments"] });
      queryClient.invalidateQueries({ queryKey: ["commerce-analytics"] });
    },
  });
}

export function useUpdateFulfillmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      fulfillmentId: string;
      status: string;
      trackingNumber?: string;
      carrier?: string;
      notes?: string;
    }) => updateFulfillmentStatus(args.fulfillmentId, args.status, args),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fulfillments"] });
      queryClient.invalidateQueries({ queryKey: ["commerce-analytics"] });
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { refundId: string; status: RefundStatus; processedBy?: string }) =>
      processRefund(args.refundId, args.status, args.processedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refunds"] });
      queryClient.invalidateQueries({ queryKey: ["commerce-analytics"] });
    },
  });
}

export function useRequestRefund() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: { orderId: string; userId: string; amount: number; reason: string }) =>
      requestRefund(args.orderId, args.userId, args.amount, args.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["refunds"] });
      queryClient.invalidateQueries({ queryKey: ["order-refunds"] });
    },
  });
}

export function useRecordEvent() {
  return useMutation({
    mutationFn: (args: {
      eventType: string;
      userId?: string;
      orderId?: string;
      productId?: string;
      amount?: number;
      metadata?: Record<string, unknown>;
    }) => recordEvent(args.eventType, args),
    onSuccess: () => {
      // analytics is eventually consistent
    },
  });
}
