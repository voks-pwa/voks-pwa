import { supabase } from "@/lib/supabase";
import { credit } from "@/features/wallet/services/walletEngine";
import { grantBadge } from "@/features/retention/repositories/badgeRepository";
import type { GrantRewardInput, GrantRewardResult, RewardSource } from "./types";

function walletType(source: GrantRewardInput["source"]): string {
  switch (source) {
    case "achievement": return "ACHIEVEMENT_REWARD";
    case "milestone": return "ACHIEVEMENT_REWARD";
    case "login_reward": return "CHECKIN";
    case "referral": return "REFERRAL";
    case "profile": return "PROFILE";
    case "admin": return "ADMIN_ADJUSTMENT";
    default: return "BONUS";
  }
}

export async function grantReward(input: GrantRewardInput): Promise<GrantRewardResult> {
  const { userId, source, referenceId, amount, reason, badge } = input;

  const { data: existing } = await supabase
    .from("reward_grants")
    .select("id")
    .eq("user_id", userId)
    .eq("source", source)
    .eq("reference_id", referenceId)
    .maybeSingle();

  if (existing) {
    return { success: false, skipped: true, error: "Reward already granted" };
  }

  const { error: insertError } = await supabase
    .from("reward_grants")
    .insert({ user_id: userId, source, reference_id: referenceId, amount, reason });

  if (insertError) {
    if (insertError.code === "23505") {
      return { success: false, skipped: true, error: "Reward already granted (concurrent)" };
    }
    return { success: false, skipped: false, error: `Failed to record reward: ${insertError.message}` };
  }

  if (badge) {
    await grantBadge(userId, badge);
  }

  if (amount > 0 && source !== "mission") {
    const result = await credit({
      userId,
      amount,
      transactionType: walletType(source) as never,
      referenceType: source,
      referenceId,
      description: reason,
    });

    if (!result.success) {
      return { success: false, skipped: false, error: `Wallet credit failed: ${result.error}` };
    }
  }

  return { success: true, skipped: false };
}

export async function checkRewardGranted(
  userId: string,
  source: RewardSource,
  referenceId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("reward_grants")
    .select("id")
    .eq("user_id", userId)
    .eq("source", source)
    .eq("reference_id", referenceId)
    .maybeSingle();
  return !!data;
}
