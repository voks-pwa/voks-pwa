import { useQuery } from "@tanstack/react-query";
import { getActiveProducts, getProductBySlug } from "../repositories/marketplaceRepository";
import { getCategories } from "../repositories/categoryRepository";
import { getInventory } from "../repositories/inventoryRepository";

export function useMarketplaceProducts() {
  return useQuery({
    queryKey: ["marketplace", "products"],
    queryFn: getActiveProducts,
    staleTime: 60_000,
  });
}

export function useMarketplaceProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["marketplace", "product", slug],
    queryFn: () => (slug ? getProductBySlug(slug) : null),
    enabled: !!slug,
    staleTime: 30_000,
  });
}

export function useMarketplaceCategories() {
  return useQuery({
    queryKey: ["marketplace", "categories"],
    queryFn: getCategories,
    staleTime: 120_000,
  });
}

export function useMarketplaceInventory() {
  return useQuery({
    queryKey: ["marketplace", "inventory"],
    queryFn: getInventory,
    staleTime: 30_000,
  });
}
