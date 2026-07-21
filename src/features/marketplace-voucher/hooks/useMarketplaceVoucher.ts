import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllVouchers,
  getUserVouchers,
  getAvailableVouchers,
  reserveVoucher,
} from "../repositories/marketplaceVoucherRepository";

export function useMarketplaceVoucherPool(productId?: string) {
  return useQuery({
    queryKey: ["marketplace-voucher-pool", productId],
    queryFn: () => {
      if (productId) return getAvailableVouchers(productId);
      return getAllVouchers();
    },
    staleTime: 30_000,
  });
}

export function useUserMarketplaceVouchers(userId: string | null) {
  return useQuery({
    queryKey: ["user-marketplace-vouchers", userId],
    queryFn: () => (userId ? getUserVouchers(userId) : []),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useAvailableMarketplaceVouchers(productId: string | null) {
  return useQuery({
    queryKey: ["available-marketplace-vouchers", productId],
    queryFn: () => (productId ? getAvailableVouchers(productId) : []),
    enabled: !!productId,
    staleTime: 15_000,
  });
}

export function useRequestMarketplaceVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => reserveVoucher(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace-voucher-pool"] });
    },
  });
}
