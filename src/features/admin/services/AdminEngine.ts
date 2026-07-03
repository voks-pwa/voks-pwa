import { adminAdjustXP } from "@/features/xp/services/adminAdjustXP";

export async function giveBonusXP(
  userId: string,
  amount: number,
  reason = "Admin Bonus",
) {
  return adminAdjustXP({
    userId,
    amount,
    reason,
  });
}

export async function removeXP(
  userId: string,
  amount: number,
  reason = "Admin Deduction",
) {
  return adminAdjustXP({
    userId,
    amount: -Math.abs(amount),
    reason,
  });
}