import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getActiveCart, addItemToCart, removeItemFromCart, clearActiveCart } from "../services/cartService";

export function useCart(userId: string | null) {
  return useQuery({
    queryKey: ["cart", userId],
    queryFn: () => (userId ? getActiveCart(userId) : { order: null, items: [], total: 0 }),
    enabled: !!userId,
    staleTime: 10_000,
  });
}

export function useAddToCart(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      addItemToCart(userId ?? "", productId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}

export function useRemoveFromCart(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      removeItemFromCart(userId ?? "", productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}

export function useClearCart(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clearActiveCart(userId ?? ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}
