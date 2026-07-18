import { useLivePoll } from "../hooks/useLivePoll";

interface Props {
  userId: string | undefined;
}

export function LivePoll({ userId }: Props) {
  const { poll, userVote, vote } = useLivePoll(userId);

  if (!poll) return null;

  const totalVotes = poll.options?.reduce((sum, o) => sum + (o.vote_count ?? 0), 0) ?? 0;

  return (
    <div className="rounded-2xl bg-white/5 p-4 backdrop-blur-sm">
      <p className="mb-3 text-sm font-bold text-white">{poll.question}</p>
      <div className="space-y-2">
        {poll.options?.map((opt) => {
          const pct = totalVotes > 0 ? Math.round(((opt.vote_count ?? 0) / totalVotes) * 100) : 0;
          const isSelected = userVote === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={!!userVote}
              onClick={() => vote(opt.id)}
              className="relative w-full overflow-hidden rounded-xl bg-white/10 px-3 py-2.5 text-left text-sm text-white transition hover:bg-white/20 disabled:opacity-90"
            >
              <div
                className={`absolute inset-0 rounded-xl transition-all ${isSelected ? "bg-[#bda752]/30" : "bg-white/5"}`}
                style={{ width: `${pct}%` }}
              />
              <span className="relative z-10 flex items-center justify-between">
                <span>{opt.title}</span>
                <span className="text-xs text-white/60">{pct}%</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-white/40">{totalVotes} votes</p>
    </div>
  );
}
