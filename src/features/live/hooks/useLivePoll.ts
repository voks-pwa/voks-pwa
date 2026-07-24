import { useEffect, useState, useCallback } from "react";
import type { LivePoll } from "../types";
import * as repo from "../repositories/liveRepository";
import * as channelRepo from "../repositories/liveChannelRepository";

export function useLivePoll(userId: string | undefined) {
  const [poll, setPoll] = useState<LivePoll | null>(null);
  const [userVote, setUserVote] = useState<number | null>(null);

  useEffect(() => {
    repo.getActivePoll().then(setPoll).catch(console.error);

    const channel = channelRepo.createPollChannel(
      () => {
        repo.getActivePoll().then(setPoll).catch(console.error);
      },
      () => {
        repo.getActivePoll().then(setPoll).catch(console.error);
      },
    );

    return () => {
      channelRepo.removeChannel(channel);
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
