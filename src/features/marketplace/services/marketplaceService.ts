import { getActiveProducts, getProductBySlug } from "../repositories/marketplaceRepository";
import { getCategories } from "../repositories/categoryRepository";
import { getInventoryByProductId } from "../repositories/inventoryRepository";

export interface ProductWithInventory {
  product: Awaited<ReturnType<typeof getProductBySlug>>;
  available: number;
  inStock: boolean;
}

export async function getMarketplaceCatalog() {
  const [products, categories] = await Promise.all([
    getActiveProducts(),
    getCategories(),
  ]);

  return { products, categories };
}

export async function getProductDetail(slug: string): Promise<ProductWithInventory | null> {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  const inventory = await getInventoryByProductId(product.id);
  const available = inventory ? inventory.total_stock - inventory.reserved_stock : 0;
  const unlimited = inventory?.unlimited ?? true;

  return {
    product,
    available,
    inStock: unlimited || available > 0,
  };
}
