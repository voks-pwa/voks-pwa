import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import * as repo from "../repositories/liveRepository";

const TICK_INTERVAL = 30_000;

export function useLivePresence(userId: string | undefined) {
  const [viewerCount, setViewerCount] = useState(0);
  const durationRef = useRef(0);
  const joinedRef = useRef<number>(0);
  joinedRef.current ||= Date.now();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel("live-presence", {
      config: { presence: { key: userId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        setViewerCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    const tick = setInterval(() => {
      durationRef.current = Math.floor((Date.now() - joinedRef.current) / 1000);
      repo.upsertPresence(userId, durationRef.current).catch(() => {});
    }, TICK_INTERVAL);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(tick);
    };
  }, [userId]);

  return { viewerCount };
}
