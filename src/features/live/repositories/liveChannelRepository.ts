import { supabase } from "@/lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

export function createChatChannel(
  onInsert: (payload: unknown) => void,
  onUpdate: (payload: unknown) => void,
  onDelete: (payload: unknown) => void,
): RealtimeChannel {
  return supabase
    .channel("live-chat")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "live_messages" },
      (payload) => onInsert(payload.new),
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "live_messages" },
      (payload) => onUpdate(payload.new),
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "live_messages" },
      (payload) => onDelete(payload.old),
    )
    .subscribe();
}

export function createGiveawayChannel(onChange: () => void): RealtimeChannel {
  return supabase
    .channel("live-giveaways")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "live_giveaways" },
      () => onChange(),
    )
    .subscribe();
}

export function createPollChannel(
  onPollChange: () => void,
  onVoteChange: () => void,
): RealtimeChannel {
  return supabase
    .channel("live-poll")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "live_polls" },
      () => onPollChange(),
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "live_poll_votes" },
      () => onVoteChange(),
    )
    .subscribe();
}

export function createReactionsChannel(onInsert: (payload: unknown) => void): RealtimeChannel {
  return supabase
    .channel("live-reactions")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "live_reactions" },
      (payload) => onInsert(payload.new),
    )
    .subscribe();
}

export function createPresenceChannel(
  userId: string,
  onSync: (viewerCount: number) => void,
): RealtimeChannel {
  const channel = supabase.channel("live-presence", {
    config: { presence: { key: userId } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      onSync(Object.keys(state).length);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ user_id: userId, online_at: new Date().toISOString() });
      }
    });

  return channel;
}

export function removeChannel(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
