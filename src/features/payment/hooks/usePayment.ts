import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPaymentByOrderId, getPaymentsByUser } from "../repositories/paymentRepository";
import { initiatePayment } from "../services/paymentService";

export function usePaymentByOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["payment", "order", orderId],
    queryFn: () => (orderId ? getPaymentByOrderId(orderId) : null),
    enabled: !!orderId,
    staleTime: 15_000,
  });
}

export function useUserPayments(userId: string | null) {
  return useQuery({
    queryKey: ["payment", "user", userId],
    queryFn: () => (userId ? getPaymentsByUser(userId) : []),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useInitiatePayment(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      totalAmount,
      paymentMethod,
    }: {
      orderId: string;
      totalAmount: number;
      paymentMethod?: string;
    }) => initiatePayment(userId ?? "", orderId, totalAmount, paymentMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment"] });
    },
  });
}
