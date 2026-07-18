import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { LiveMessage } from "../types";
import * as repo from "../repositories/liveRepository";

export function useLiveChat(
  userId: string | undefined,
  profile: { display_name: string | null; avatar_url: string | null; badge_name: string | null; level: number } | undefined,
) {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    repo.getMessages(50).then(setMessages).catch(console.error);

    const channel = supabase
      .channel("live-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_messages" },
        (payload) => {
          const msg = payload.new as LiveMessage;
          if (!msg.deleted) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "live_messages" },
        (payload) => {
          const msg = payload.new as LiveMessage;
          setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "live_messages" },
        (payload) => {
          const old = payload.old as LiveMessage;
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const send = useCallback(
    async (message: string) => {
      if (!userId || !message.trim() || sending || !profile) return;
      setSending(true);
      try {
        await repo.insertMessage({
          user_id: userId,
          message: message.trim(),
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          badge_name: profile.badge_name,
          level: profile.level,
        });
      } catch (err) {
        console.error("Failed to send message", err);
      } finally {
        setSending(false);
      }
    },
    [userId, sending, profile],
  );

  const remove = useCallback(async (id: number) => {
    try {
      await repo.deleteMessage(id);
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  }, []);

  const pin = useCallback(async (id: number, pinned: boolean) => {
    try {
      await repo.pinMessage(id, pinned);
    } catch (err) {
      console.error("Failed to pin message", err);
    }
  }, []);

  return { messages, send, remove, pin, sending };
}
