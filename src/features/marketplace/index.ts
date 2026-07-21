export type {
  ProductType,
  OrderStatus,
  MarketplaceCategory,
  MarketplaceProduct,
  MarketplaceInventory,
  MarketplaceOrder,
  MarketplaceOrderItem,
} from "./types";

export {
  getProducts,
  getProductById,
  getProductBySlug,
  getActiveProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./repositories/marketplaceRepository";

export {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./repositories/categoryRepository";

export {
  getInventory,
  getInventoryByProductId,
  updateInventory,
} from "./repositories/inventoryRepository";

export {
  useMarketplaceProducts,
  useMarketplaceProduct,
  useMarketplaceCategories,
  useMarketplaceInventory,
} from "./hooks/useMarketplace";
