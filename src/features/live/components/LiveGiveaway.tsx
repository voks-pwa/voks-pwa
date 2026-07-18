import { Gift, Loader2, Check } from "lucide-react";
import { useLiveGiveaway } from "../hooks/useLiveGiveaway";

interface Props {
  userId: string | undefined;
}

export function LiveGiveaway({ userId }: Props) {
  const { giveaways, joinedIds, join, joining } = useLiveGiveaway(userId);

  if (!giveaways.length) return null;

  return (
    <div className="space-y-3">
      {giveaways.map((g) => {
        const hasJoined = joinedIds.has(g.id);
        const isJoining = joining === g.id;

        return (
          <div
            key={g.id}
            className="rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Gift size={20} className="text-rose-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{g.title}</p>
                {g.description && (
                  <p className="text-xs text-white/60">{g.description}</p>
                )}
              </div>
              {!hasJoined && userId && (
                <button
                  type="button"
                  disabled={isJoining}
                  onClick={() => join(g.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/30 disabled:opacity-50"
                >
                  {isJoining ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Join"
                  )}
                </button>
              )}
              {hasJoined && (
                <span className="flex items-center gap-1 rounded-xl bg-emerald-500/30 px-3 py-2 text-xs font-bold text-emerald-300">
                  <Check size={14} /> Joined
                </span>
              )}
            </div>
            {g.winner && (
              <p className="mt-2 text-xs text-amber-300">
                Winner selected
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
