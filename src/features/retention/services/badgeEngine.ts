import { grantBadge } from "../repositories/badgeRepository";
import type { UserBadge } from "../types";

/**
 * Badge Engine.
 *
 * Rules (AI/70):
 * - Badges are granted automatically only (never manually).
 * - Badges are stored permanently (upsert with ignoreDuplicates).
 * - The only caller is the Achievement Engine upon completion.
 */
export async function awardBadge(
  userId: string,
  badge: Omit<UserBadge, "id" | "earned_at" | "user_id">,
): Promise<UserBadge | null> {
  return grantBadge(userId, badge);
}
