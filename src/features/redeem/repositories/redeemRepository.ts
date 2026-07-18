import { supabase } from "@/lib/supabase";
import type { RedeemRecord, RedeemStatus } from "../types";

export async function insertRedeem(input: {
  userId: string;
  rewardId: number;
  rewardTitle: string;
  requiredVxp: number;
  approvalRequired: boolean;
  status: string;
}): Promise<RedeemRecord> {
  const { data, error } = await supabase
    .from("reward_redeems")
    .insert({
      user_id: input.userId,
      reward_id: input.rewardId,
      reward_title: input.rewardTitle,
      required_vxp: input.requiredVxp,
      approval_required: input.approvalRequired,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserRedeems(userId: string): Promise<RedeemRecord[]> {
  const { data, error } = await supabase
    .from("reward_redeems")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateRedeemStatus(
  redeemId: string,
  status: RedeemStatus,
  notes?: string,
): Promise<void> {
  const updateData: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (notes !== undefined) updateData.notes = notes;

  const { error } = await supabase
    .from("reward_redeems")
    .update(updateData)
    .eq("id", redeemId);

  if (error) throw error;
}

export async function getRedeemById(redeemId: string): Promise<RedeemRecord | null> {
  const { data, error } = await supabase
    .from("reward_redeems")
    .select("*")
    .eq("id", redeemId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
