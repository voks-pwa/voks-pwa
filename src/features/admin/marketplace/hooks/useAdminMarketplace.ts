import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminInventory,
  updateAdminInventory,
} from "../api/marketplace";

export function useAdminProducts() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-marketplace-products"],
    queryFn: getAdminProducts,
  });

  const create = useMutation({
    mutationFn: createAdminProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-products"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateAdminProduct>[1] }) =>
      updateAdminProduct(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-products"] }),
  });

  const remove = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-products"] }),
  });

  return { query, create, update, remove };
}

export function useAdminCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-marketplace-categories"],
    queryFn: getAdminCategories,
  });

  const create = useMutation({
    mutationFn: createAdminCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-categories"] }),
  });

  const update = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof updateAdminCategory>[1] }) =>
      updateAdminCategory(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-categories"] }),
  });

  const remove = useMutation({
    mutationFn: deleteAdminCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-categories"] }),
  });

  return { query, create, update, remove };
}

export function useAdminInventory() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-marketplace-inventory"],
    queryFn: getAdminInventory,
  });

  const update = useMutation({
    mutationFn: ({ productId, updates }: { productId: string; updates: Parameters<typeof updateAdminInventory>[1] }) =>
      updateAdminInventory(productId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-marketplace-inventory"] }),
  });

  return { query, update };
}
