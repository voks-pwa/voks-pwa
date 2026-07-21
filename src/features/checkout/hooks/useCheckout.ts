import { useMutation, useQueryClient } from "@tanstack/react-query";
import { executeCheckout } from "../services/checkoutService";

export function useCheckout(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => executeCheckout(userId ?? ""),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["cart", userId] });
        queryClient.invalidateQueries({ queryKey: ["wallet-balance", userId] });
        queryClient.invalidateQueries({ queryKey: ["admin-marketplace-orders"] });
      }
    },
  });
}
