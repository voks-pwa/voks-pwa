import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { LivePoll } from "../types";
import * as repo from "../repositories/liveRepository";

export function useLivePoll(userId: string | undefined) {
  const [poll, setPoll] = useState<LivePoll | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null);

  useEffect(() => {
    repo.getActivePoll().then(setPoll).catch(console.error);

    const channel = supabase
      .channel("live-poll")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "live_polls" },
        () => {
          repo.getActivePoll().then(setPoll).catch(console.error);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "live_poll_votes" },
        () => {
          repo.getActivePoll().then(setPoll).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const vote = useCallback(
    async (optionId: number) => {
      if (!userId || !poll) return;
      try {
        await repo.castVote(poll.id, optionId, userId);
        setUserVote(optionId);
      } catch (err) {
        console.error("Failed to vote", err);
      }
    },
    [userId, poll]
  );

  return { poll, userVote, vote };
}
