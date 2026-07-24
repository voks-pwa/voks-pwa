import { supabase } from "@/lib/supabase";
import type { UserStreak } from "../types";

export async function getStreak(
  userId: string,
  streakType: UserStreak["streak_type"] = "daily",
): Promise<UserStreak | null> {
  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .eq("streak_type", streakType)
    .maybeSingle();

  if (error) {
    console.error("[STREAK] read error", error);
    return null;
  }

  return (data as UserStreak | null) ?? null;
}

export async function getStreaks(userId: string): Promise<UserStreak[]> {
  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("[STREAK] read all error", error);
    return [];
  }

  return (data as UserStreak[]) ?? [];
}

export async function upsertStreak(
  userId: string,
  streakType: UserStreak["streak_type"],
  values: Partial<Omit<UserStreak, "id" | "user_id" | "streak_type">>,
): Promise<UserStreak | null> {
  const { data, error } = await supabase
    .from("user_streaks")
    .upsert(
      {
        user_id: userId,
        streak_type: streakType,
        ...values,
      },
      {
        onConflict: "user_id,streak_type",
        ignoreDuplicates: false,
      },
    )
    .select()
    .single();

  if (error) {
    console.error("[STREAK] upsert error", error);
    return null;
  }

  return data as UserStreak;
}
