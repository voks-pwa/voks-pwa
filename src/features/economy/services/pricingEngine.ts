export interface PricedItem {
  basePrice: number;
  currencyType: "VXP" | "PREMIUM";
  tier?: string;
  quantity?: number;
}

export interface PriceResult {
  unitPrice: number;
  totalPrice: number;
  currencyType: "VXP" | "PREMIUM";
  appliedDiscount: number;
  discountLabel: string | null;
}

export async function getEffectivePrice(item: PricedItem): Promise<PriceResult> {
  const unitPrice = item.basePrice;

  const { quantity = 1 } = item;

  const totalPrice = unitPrice * quantity;

  return {
    unitPrice,
    totalPrice,
    currencyType: item.currencyType,
    appliedDiscount: 0,
    discountLabel: null,
  };
}

export function applyQuantityPricing(
  unitPrice: number,
  quantity: number,
): { effectiveUnitPrice: number; discount: number; label: string | null } {
  if (quantity >= 10) {
    return {
      effectiveUnitPrice: Math.round(unitPrice * 0.85),
      discount: Math.round(unitPrice * quantity * 0.15),
      label: "Bulk discount (15%)",
    };
  }
  if (quantity >= 5) {
    return {
      effectiveUnitPrice: Math.round(unitPrice * 0.9),
      discount: Math.round(unitPrice * quantity * 0.1),
      label: "Bulk discount (10%)",
    };
  }

  return { effectiveUnitPrice: unitPrice, discount: 0, label: null };
}
