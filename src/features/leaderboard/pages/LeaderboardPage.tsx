import { useState } from "react";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Flame,
  Award,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";

import { useLeaderboard } from "../hooks/useLeaderboard";
import { useMyRank } from "../hooks/useMyRank";

import type { LeaderboardPeriod } from "../api/leaderboard";
import type { RankedLeaderboardUser } from "../types";

const PERIODS: {
  key: LeaderboardPeriod;
  label: string;
}[] = [
  { key: "lifetime", label: "All Time" },
  { key: "weekly", label: "This Week" },
  { key: "monthly", label: "This Month" },
];

function getRankIcon(index: number) {
  switch (index) {
    case 0:
      return <Crown size={22} className="text-yellow-500" />;
    case 1:
      return <Medal size={22} className="text-gray-400" />;
    case 2:
      return <Medal size={22} className="text-amber-600" />;
    default:
      return (
        <span className="w-5.5 text-center text-sm font-bold text-gray-400">
          {index + 1}
        </span>
      );
  }
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-400">
        <Minus size={12} /> —
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-600">
        <ChevronUp size={12} /> {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-red-500">
        <ChevronDown size={12} /> {Math.abs(delta)}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-gray-400">
      <Minus size={12} /> 0
    </span>
  );
}

function UserRow({
  user,
  index,
  highlight,
}: {
  user: RankedLeaderboardUser;
  index: number;
  highlight?: boolean;
}) {
  const score = user.period_total ?? user.lifetime_vxp;
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-sm transition ${
        highlight ? "ring-2 ring-[#bda752]/40" : ""
      } ${index < 3 ? "ring-1 ring-yellow-200" : ""}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex w-8 items-center justify-center shrink-0">
          {getRankIcon(index)}
        </div>

        <img
          src={user.avatar_url ?? "https://placehold.co/80"}
          alt={user.display_name ?? ""}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">
            {user.display_name ?? "Unknown"}
          </p>

          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            {user.badge_name && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
                {user.badge_name}
              </span>
            )}

            <span className="text-xs text-gray-400">
              Lv.{user.level}
            </span>

            {user.longest_streak > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-orange-500">
                <Flame size={11} /> {user.longest_streak}
              </span>
            )}

            {user.achievement_count > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-purple-500">
                <Award size={11} /> {user.achievement_count}
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="font-black text-[#bda752]">
            {score.toLocaleString()}{" "}
            <span className="text-xs font-semibold">VXP</span>
          </p>
          <DeltaBadge delta={user.rank_delta} />
        </div>
      </div>
    </div>
  );
}

export function LeaderboardPage() {
  const [period, setPeriod] =
    useState<LeaderboardPeriod>("lifetime");

  const { data, isLoading } = useLeaderboard(period);
  const { myRank, nearby, topUsers } = useMyRank(period);

  const users = data?.users ?? [];
  const top3 = users.slice(0, 3);
  const rest = users.slice(3, 100);

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Trophy size={28} className="text-[#bda752]" />
          <div>
            <h1 className="text-2xl font-black">Leaderboard</h1>
            <p className="text-sm text-gray-500">
              Top listeners ranked by VXP
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              period === p.key
                ? "bg-[#bda752] text-white shadow-md"
                : "bg-white text-gray-600 shadow-sm"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {myRank !== null && (
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#bda752] to-[#a8913f] p-4 text-white shadow-md">
          <div>
            <p className="text-xs font-medium opacity-80">
              Your Rank
            </p>
            <p className="text-2xl font-black">
              #{myRank}
            </p>
          </div>
          <Trophy size={32} className="opacity-90" />
        </div>
      )}

      {isLoading && users.length === 0 ? (
        <div className="flex h-32 items-center justify-center">
          <Star size={32} className="animate-pulse text-gray-300" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.length === 0 && (
            <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
              <Star size={36} className="mx-auto text-gray-300" />
              <p className="mt-3 text-gray-500">
                No data available for this period.
              </p>
            </div>
          )}

          {top3.map((user, i) => (
            <UserRow key={user.id} user={user} index={i} />
          ))}

          {rest.map((user, i) => (
            <UserRow key={user.id} user={user} index={i + 3} />
          ))}
        </div>
      )}

      {nearby.length > 0 && myRank !== null && (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Flame size={18} className="text-[#bda752]" />
            <h2 className="font-bold">Nearby Ranking</h2>
          </div>
          <div className="space-y-3">
            {nearby.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                index={user.rank - 1}
                highlight={user.id === data?.users[myRank - 1]?.id}
              />
            ))}
          </div>
        </section>
      )}

      {topUsers.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-[#bda752]" />
            <h2 className="font-bold">Top 10</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {topUsers.slice(0, 10).map((user, i) => (
              <div
                key={user.id}
                className="rounded-2xl bg-white p-3 text-center shadow-sm"
              >
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center">
                  {getRankIcon(i)}
                </div>
                <p className="truncate text-xs font-semibold">
                  {user.display_name ?? "Unknown"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {(user.period_total ?? user.lifetime_vxp).toLocaleString()} VXP
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
