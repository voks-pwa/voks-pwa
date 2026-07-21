export type { CartItem, Cart, CheckoutResult } from "./types";

export {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "./repositories/cartRepository";

export {
  lockOrderInventory,
  releaseOrderInventory,
  deductOrderInventory,
  updateOrderStatus,
  getOrderItems,
} from "./repositories/checkoutRepository";

export {
  addItemToCart,
  getActiveCart,
  clearActiveCart,
  removeItemFromCart,
} from "./services/cartService";

export {
  executeCheckout,
} from "./services/checkoutService";

export {
  useCart,
  useAddToCart,
  useRemoveFromCart,
  useClearCart,
} from "./hooks/useCart";

export {
  useCheckout,
} from "./hooks/useCheckout";
