import { useEffect, useState, useCallback } from "react";
import type { LiveGiveaway } from "../types";
import * as repo from "../repositories/liveRepository";
import * as channelRepo from "../repositories/liveChannelRepository";

export function useLiveGiveaway(userId: string | undefined) {
  const [giveaways, setGiveaways] = useState<LiveGiveaway[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [joining, setJoining] = useState<number | null>(null);

  useEffect(() => {
    repo.getActiveGiveaways().then(setGiveaways).catch(console.error);

    const channel = channelRepo.createGiveawayChannel(() => {
      repo.getActiveGiveaways().then(setGiveaways).catch(console.error);
    });

    return () => {
      channelRepo.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!userId || !giveaways.length) return;
    giveaways.forEach((g) => {
      repo.hasJoinedGiveaway(g.id, userId).then((joined) => {
        if (joined) setJoinedIds((prev) => new Set(prev).add(g.id));
      });
    });
  }, [userId, giveaways]);

  const join = useCallback(
    async (giveawayId: number) => {
      if (!userId || joining !== null) return;
      setJoining(giveawayId);
      try {
        await repo.joinGiveaway(giveawayId, userId);
        setJoinedIds((prev) => new Set(prev).add(giveawayId));
      } catch (err) {
        console.error("Failed to join giveaway", err);
      } finally {
        setJoining(null);
      }
    },
    [userId, joining]
  );

  return { giveaways, joinedIds, join, joining };
}
