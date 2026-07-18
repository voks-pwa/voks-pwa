import { supabase } from "@/lib/supabase";

import type { Broadcast, BroadcastFormData } from "../types/broadcast";

export async function createBroadcast(
  data: BroadcastFormData
): Promise<Broadcast> {
  const { data: result, error } =
    await supabase.functions.invoke(
      "admin-broadcast",
      {
        body: {
          action: "create",
          ...data,
        },
      }
    );

  if (error) throw error;
  if (!result.success)
    throw new Error(
      result.error ??
        "Failed to create broadcast"
    );

  return result.broadcast;
}

export async function listBroadcasts(): Promise<
  Broadcast[]
> {
  const { data, error } =
    await supabase.functions.invoke(
      "admin-broadcast",
      {
        body: {
          action: "list",
        },
      }
    );

  if (error) throw error;
  if (!data.success)
    throw new Error(
      data.error ??
        "Failed to list broadcasts"
    );

  return data.broadcasts;
}

export async function sendBroadcast(
  id: string
): Promise<{
  sent_count: number;
}> {
  const { data, error } =
    await supabase.functions.invoke(
      "admin-broadcast",
      {
        body: {
          action: "send",
          id,
        },
      }
    );

  if (error) throw error;
  if (!data.success)
    throw new Error(
      data.error ??
        "Failed to send broadcast"
    );

  return {
    sent_count:
      data.sent_count,
  };
}
