import { supabase } from "@/lib/supabase";

export const MAX_PILOT_USERS = Number(
  import.meta.env.VITE_PILOT_MAX_USERS ?? 100,
);

export const PILOT_MODE = Boolean(
  import.meta.env.VITE_PILOT_MODE ?? true,
);

export async function getPilotUserCount(): Promise<number> {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("[PILOT] user count error:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function isPilotAtCap(): Promise<boolean> {
  if (!PILOT_MODE) return false;

  const current = await getPilotUserCount();
  const atCap = current >= MAX_PILOT_USERS;

  if (atCap) {
    console.warn(
      `[PILOT] registration blocked: ${current}/${MAX_PILOT_USERS} users`,
    );
  }

  return atCap;
}
