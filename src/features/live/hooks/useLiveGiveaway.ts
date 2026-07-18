import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { LiveGiveaway } from "../types";
import * as repo from "../repositories/liveRepository";

export function useLiveGiveaway(userId: string | undefined) {
  const [giveaways, setGiveaways] = useState<LiveGiveaway[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<number>>(new Set());
  const [joining, setJoining] = useState<number | null>(null);

  useEffect(() => {
    repo.getActiveGiveaways().then(setGiveaways).catch(console.error);

    const channel = supabase
      .channel("live-giveaways")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_giveaways" },
        () => {
          repo.getActiveGiveaways().then(setGiveaways).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
