import { useEffect, useState } from "react";
import type { LiveReactionType } from "../types";
import { LIVE_REACTIONS } from "../types";
import { useLiveReactions } from "../hooks/useLiveReactions";

interface Props {
  userId: string | undefined;
}

interface FloatingReaction {
  id: number;
  emoji: string;
  left: number;
}

export function LiveReactions({ userId }: Props) {
  const { reactions, send } = useLiveReactions(userId);
  const [floaters, setFloaters] = useState<FloatingReaction[]>([]);

  useEffect(() => {
    if (reactions.length === 0) return;
    const latest = reactions[reactions.length - 1];
    const floater: FloatingReaction = {
      id: latest.id,
      emoji: latest.reaction,
      left: Math.random() * 60 + 10,
    };
    const frame = requestAnimationFrame(() => {
      setFloaters((prev) => [...prev.slice(-9), floater]);
    });
    const timer = setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== floater.id));
    }, 2000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [reactions]);

  return (
    <div className="relative">
      <div className="absolute bottom-full left-0 mb-2 h-16 w-48 overflow-hidden pointer-events-none">
        {floaters.map((f) => (
          <span
            key={f.id}
            className="absolute bottom-0 animate-bounce text-xl opacity-0"
            style={{
              left: `${f.left}%`,
              animation: "reaction-float 2s ease-out forwards",
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        {LIVE_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => send(emoji as LiveReactionType)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg backdrop-blur-sm transition hover:scale-110 hover:bg-white/20 active:scale-90"
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
