import {
  debit,
  validateTransaction,
  initiatePayment,
  recordEvent,
  requestVoucher,
  confirmVoucherAssignment,
  getInventoryByProductId,
} from "@/core/checkout-engine";
import { getActiveCart } from "./cartService";
import {
  lockOrderInventory,
  releaseOrderInventory,
  deductOrderInventory,
  updateOrderStatus,
} from "../repositories/checkoutRepository";
import type { CheckoutResult } from "../types";

export async function executeCheckout(
  userId: string,
  paymentMethod: string = "VXP",
): Promise<CheckoutResult> {
  if (!userId) {
    return { success: false, error: "User ID required" };
  }

  const cart = await getActiveCart(userId);
  if (!cart.order || cart.items.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  const { order, items, total } = cart;

  if (total <= 0) {
    return { success: false, error: "Invalid cart total" };
  }

  const lockResult = await lockOrderInventory(order.id);
  if (!lockResult.success) {
    return { success: false, error: lockResult.error ?? "Failed to reserve stock" };
  }

  try {
    await updateOrderStatus(order.id, "PENDING");

    if (paymentMethod === "VXP") {
      const validation = await validateTransaction({ userId, amount: -total });
      if (!validation.allowed) {
        await releaseOrderInventory(order.id);
        await updateOrderStatus(order.id, "CANCELLED");
        return { success: false, error: validation.error ?? "Insufficient VXP balance" };
      }

      const walletResult = await debit({
        userId,
        amount: total,
        transactionType: "REDEEM",
        transactionKey: `CHECKOUT_${userId}_${order.id}`,
        referenceType: "MARKETPLACE",
        referenceId: order.id,
        description: `Checkout: ${items.length} item(s) for ${total.toLocaleString()} VXP`,
      });

      if (!walletResult.success) {
        await releaseOrderInventory(order.id);
        await updateOrderStatus(order.id, "CANCELLED");
        return { success: false, error: walletResult.error ?? "Payment failed" };
      }

      // Stock re-verification before finalizing
      for (const item of items) {
        const inventory = await getInventoryByProductId(item.product_id);
        const available = inventory ? inventory.total_stock - inventory.reserved_stock : 0;
        if (!inventory?.unlimited && available < 0) {
          await releaseOrderInventory(order.id);
          await updateOrderStatus(order.id, "CANCELLED");
          return { success: false, error: `Insufficient stock for ${item.product_name}` };
        }
      }

      await updateOrderStatus(order.id, "PAID");
      await deductOrderInventory(order.id);

      // Assign vouchers for VOUCHER items
      const voucherItems = items.filter((i) => i.product_type === "VOUCHER");
      for (const item of voucherItems) {
        try {
          const voucherResult = await requestVoucher(item.product_id);
          if (voucherResult.success && voucherResult.voucher_id) {
            await confirmVoucherAssignment(voucherResult.voucher_id, userId);
          }
        } catch { /* voucher failure non-blocking */ }
      }

      const isAllDigital = items.every((i) => i.product_type === "DIGITAL" || i.product_type === "VOUCHER");
      if (isAllDigital) {
        await updateOrderStatus(order.id, "PROCESSING");
      }

      try {
        await recordEvent("purchase", {
          userId,
          orderId: order.id,
          amount: total,
          metadata: { item_count: items.length, payment_method: "VXP" },
        });
      } catch { /* event recording non-blocking */ }

      return {
        success: true,
        order_id: order.id,
        transaction_id: walletResult.transaction_id,
        current_vxp: walletResult.current_vxp,
        payment_method: "VXP",
      };
    }

    const paymentResult = await initiatePayment(userId, order.id, total, paymentMethod);

    if (!paymentResult.success) {
      await releaseOrderInventory(order.id);
      await updateOrderStatus(order.id, "CANCELLED");
      return { success: false, error: paymentResult.error ?? "Payment initiation failed" };
    }

    return {
      success: true,
      order_id: order.id,
      payment_method: paymentMethod,
      redirect_url: paymentResult.redirect_url,
    };
  } catch (err) {
    await releaseOrderInventory(order.id);
    await updateOrderStatus(order.id, "CANCELLED");
    return { success: false, error: err instanceof Error ? err.message : "Checkout failed" };
  }
}
