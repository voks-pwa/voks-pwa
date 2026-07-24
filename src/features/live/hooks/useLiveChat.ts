import { useEffect, useState, useCallback, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { LiveMessage } from "../types";
import * as repo from "../repositories/liveRepository";
import * as channelRepo from "../repositories/liveChannelRepository";

export function useLiveChat(
  userId: string | undefined,
  profile: { display_name: string | null; avatar_url: string | null; badge_name: string | null; level: number } | undefined,
) {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [sending, setSending] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    repo.getMessages(50).then(setMessages).catch(console.error);

    const channel = channelRepo.createChatChannel(
      (payload) => {
        const msg = payload as LiveMessage;
        if (!msg.deleted) {
          setMessages((prev) => [...prev, msg]);
        }
      },
      (payload) => {
        const msg = payload as LiveMessage;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      },
      (payload) => {
        const old = payload as LiveMessage;
        setMessages((prev) => prev.filter((m) => m.id !== old.id));
      },
    );

    channelRef.current = channel;

    return () => {
      channelRepo.removeChannel(channel);
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
