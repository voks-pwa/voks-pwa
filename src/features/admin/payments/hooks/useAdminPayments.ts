import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPayments,
  updatePaymentStatus,
  getAdminVouchers,
  seedAdminVoucher,
  deleteAdminVoucher,
} from "../api/payments";

export function useAdminPayments() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-payments"],
    queryFn: getAdminPayments,
  });

  const updateStatus = useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: string }) =>
      updatePaymentStatus(paymentId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-payments"] }),
  });

  return { query, updateStatus };
}

export function useAdminVouchers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-marketplace-vouchers"],
    queryFn: getAdminVouchers,
  });

  const seed = useMutation({
    mutationFn: ({
      productId,
      voucherCode,
      expiredAt,
    }: {
      productId: string;
      voucherCode: string;
      expiredAt?: string;
    }) => seedAdminVoucher(productId, voucherCode, expiredAt),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-vouchers"] }),
  });

  const remove = useMutation({
    mutationFn: deleteAdminVoucher,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-vouchers"] }),
  });

  return { query, seed, remove };
}
