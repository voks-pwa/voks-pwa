import { getInventory } from "../repositories/inventoryRepository";
import { getProducts } from "../repositories/marketplaceRepository";
import type { MarketplaceInventory } from "../types";

export interface ProductInventoryView {
  productId: string;
  productName: string;
  productType: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  warningStock: number;
  unlimited: boolean;
  lowStock: boolean;
}

export async function getProductInventoryViews(): Promise<ProductInventoryView[]> {
  const [products, inventoryRecords] = await Promise.all([
    getProducts(),
    getInventory(),
  ]);

  const inventoryMap = new Map<string, MarketplaceInventory>();
  for (const inv of inventoryRecords) {
    inventoryMap.set(inv.product_id, inv);
  }

  return products.map((product) => {
    const inv = inventoryMap.get(product.id);
    const totalStock = inv?.total_stock ?? 0;
    const reservedStock = inv?.reserved_stock ?? 0;
    const unlimited = inv?.unlimited ?? true;
    const warningStock = inv?.warning_stock ?? 0;

    return {
      productId: product.id,
      productName: product.name,
      productType: product.product_type,
      totalStock,
      reservedStock,
      availableStock: totalStock - reservedStock,
      warningStock,
      unlimited,
      lowStock: !unlimited && (totalStock - reservedStock) <= warningStock,
    };
  });
}
