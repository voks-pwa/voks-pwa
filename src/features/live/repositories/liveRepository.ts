import { z } from 'zod';

import { supabase } from "@/lib/supabase";
import type {
  LiveMessage,
  LiveMessageInsert,
  LivePoll,
  LiveReaction,
  LiveGiveaway,
} from "../types";

export type { LiveMessageInsert };

const messageSchema = z.object({
  user_id: z.string().uuid(),
  message: z.string().min(1).max(500),
  display_name: z.string().max(100).nullable().optional(),
  avatar_url: z.string().max(500).nullable().optional(),
  badge_name: z.string().max(100).nullable().optional(),
  level: z.number().int().min(0),
});

export async function insertMessage(input: LiveMessageInsert): Promise<LiveMessage> {
  const parsed = messageSchema.parse(input);
  const { data, error } = await supabase
    .from("live_messages")
    .insert({
      user_id: parsed.user_id,
      message: parsed.message,
      display_name: parsed.display_name ?? null,
      avatar_url: parsed.avatar_url ?? null,
      badge_name: parsed.badge_name ?? null,
      level: parsed.level,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMessage(id: number): Promise<void> {
  const { error } = await supabase
    .from("live_messages")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function pinMessage(id: number, pinned: boolean): Promise<void> {
  const { error } = await supabase
    .from("live_messages")
    .update({ pinned })
    .eq("id", id);

  if (error) throw error;
}

export async function getMessages(limit = 50): Promise<LiveMessage[]> {
  const { data, error } = await supabase
    .from("live_messages")
    .select("*")
    .eq("deleted", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data.reverse();
}

export async function upsertPresence(userId: string, duration: number): Promise<void> {
  const { error } = await supabase
    .from("live_presence")
    .upsert(
      { user_id: userId, last_seen: new Date().toISOString(), duration },
      { onConflict: "user_id" }
    );

  if (error) throw error;
}

export async function getPresenceCount(): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { count, error } = await supabase
    .from("live_presence")
    .select("*", { count: "exact", head: true })
    .gte("last_seen", fiveMinutesAgo);

  if (error) throw error;
  return count ?? 0;
}

export async function insertReaction(userId: string, reaction: string): Promise<LiveReaction> {
  const { data, error } = await supabase
    .from("live_reactions")
    .insert({ user_id: userId, reaction })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getActivePoll(): Promise<LivePoll | null> {
  const { data: poll, error } = await supabase
    .from("live_polls")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;

  const { data: options, error: optsError } = await supabase
    .from("live_poll_options")
    .select("*")
    .eq("poll_id", poll.id);

  if (optsError) throw optsError;

  const votesPromises = options.map(async (opt) => {
    const { count } = await supabase
      .from("live_poll_votes")
      .select("*", { count: "exact", head: true })
      .eq("option_id", opt.id);
    return { ...opt, vote_count: count ?? 0 };
  });

  poll.options = await Promise.all(votesPromises);
  return poll;
}

export async function castVote(pollId: number, optionId: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from("live_poll_votes")
    .insert({ poll_id: pollId, option_id: optionId, user_id: userId });

  if (error) throw error;
}

export async function getActiveGiveaways(): Promise<LiveGiveaway[]> {
  const { data, error } = await supabase
    .from("live_giveaways")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function joinGiveaway(giveawayId: number, userId: string): Promise<void> {
  const { error } = await supabase
    .from("live_giveaway_entries")
    .insert({ giveaway_id: giveawayId, user_id: userId });

  if (error) throw error;
}

export async function hasJoinedGiveaway(giveawayId: number, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("live_giveaway_entries")
    .select("id")
    .eq("giveaway_id", giveawayId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
