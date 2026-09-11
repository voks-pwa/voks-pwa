import { Flame, Gift, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { getStreak } from "@/features/retention/repositories/streakRepository";

const DAYS = [1, 2, 3, 4, 5, 6, 7];
const REWARDS = [10, 15, 20, 25, 30, 40, 60];

export function MissionStreak7() {
  const { user } = useAuth();
  const { data: streak } = useQuery({
    queryKey: ["streak", user?.id, "daily"],
    enabled: !!user,
    queryFn: () => getStreak(user!.id, "daily"),
  });

  const current = streak?.current_streak ?? 0;
  // If 0 completed today but has streak, show that streak days
  const filled = current > 0 ? (current >= 7 ? 7 : current) : 0;

  if (!user) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-[#5d5b3d] via-[#887845] to-[#bda752] p-5 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Flame size={22} />
          </div>
          <div>
            <h3 className="font-bold">7 Hari Check-in Streak</h3>
            <p className="mt-0.5 text-sm text-white/80">Login untuk mulai streak harian</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {DAYS.map((d) => (
            <div key={d} className="flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xs font-bold text-white/70">
                {d}
              </div>
              <span className="text-[10px] text-white/60">+{REWARDS[d - 1]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-[#bda752]">
            <Flame size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Check-in 7 Hari</h3>
            <p className="text-xs text-gray-500">Streak {current} hari · Hadiah hingga 60 VXP</p>
          </div>
        </div>
        {filled === 7 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
            <CheckCircle2 size={12} /> Lengkap
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {DAYS.map((d) => {
          const isDone = d <= filled;
          const isToday = d === filled + 1 && filled < 7;
          return (
            <div key={d} className="flex flex-col items-center gap-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition ${
                  isDone
                    ? "bg-[#bda752] text-white shadow-sm"
                    : isToday
                      ? "bg-amber-50 text-[#bda752] ring-1 ring-[#bda752]/30"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {isDone ? <CheckCircle2 size={14} /> : d}
              </div>
              <span
                className={`text-[10px] font-semibold ${isDone ? "text-[#bda752]" : "text-gray-400"}`}
              >
                +{REWARDS[d - 1]}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <Gift size={14} /> Bonus harian
        </span>
        <span className="text-xs font-bold text-[#bda752]">{current > 0 ? `Day ${filled}/7` : "Mulai hari ini"}</span>
      </div>
    </div>
  );
}
