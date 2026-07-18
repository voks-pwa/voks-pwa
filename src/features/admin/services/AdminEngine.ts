import { grantReward } from "@/core/reward-engine";

export async function giveBonusXP(
  userId: string,
  amount: number,
  reason = "Admin Bonus",
) {
  return grantReward({
    userId,
    source: "admin",
    referenceId: `admin-${Date.now()}`,
    amount,
    reason,
  });
}

export async function removeXP(
  userId: string,
  amount: number,
  reason = "Admin Deduction",
) {
  return grantReward({
    userId,
    source: "admin",
    referenceId: `admin-${Date.now()}`,
    amount: -Math.abs(amount),
    reason,
  });
}