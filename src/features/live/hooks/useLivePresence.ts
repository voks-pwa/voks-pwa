import { useEffect, useState, useRef } from "react";
import * as repo from "../repositories/liveRepository";
import * as channelRepo from "../repositories/liveChannelRepository";

const TICK_INTERVAL = 30_000;

export function useLivePresence(userId: string | undefined) {
  const [viewerCount, setViewerCount] = useState(0);
  const durationRef = useRef(0);
  const joinedRef = useRef<number>(0);
  joinedRef.current ||= Date.now();

  useEffect(() => {
    if (!userId) return;

    const channel = channelRepo.createPresenceChannel(userId, setViewerCount);

    const tick = setInterval(() => {
      durationRef.current = Math.floor((Date.now() - joinedRef.current) / 1000);
      repo.upsertPresence(userId, durationRef.current).catch(() => {});
    }, TICK_INTERVAL);

    return () => {
      channelRepo.removeChannel(channel);
      clearInterval(tick);
    };
  }, [userId]);

  return { viewerCount };
}
