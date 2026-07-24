import { useEffect, useState, useCallback, useRef } from "react";
import type { LiveReaction, LiveReactionType } from "../types";
import * as repo from "../repositories/liveRepository";
import * as channelRepo from "../repositories/liveChannelRepository";

const RATE_LIMIT_MS = 2_000;

export function useLiveReactions(userId: string | undefined) {
  const [reactions, setReactions] = useState<LiveReaction[]>([]);
  const lastSent = useRef(0);

  useEffect(() => {
    const channel = channelRepo.createReactionsChannel((payload) => {
      const r = payload as LiveReaction;
      setReactions((prev) => [...prev.slice(-49), r]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((x) => x.id !== r.id));
      }, 4_000);
    });

    return () => {
      channelRepo.removeChannel(channel);
    };
  }, []);

  const send = useCallback(
    async (reaction: LiveReactionType) => {
      if (!userId) return;
      const now = Date.now();
      if (now - lastSent.current < RATE_LIMIT_MS) return;
      lastSent.current = now;

      try {
        await repo.insertReaction(userId, reaction);
      } catch (err) {
        console.error("Failed to send reaction", err);
      }
    },
    [userId]
  );

  return { reactions, send };
}
