import { Link } from "react-router-dom";
import { Radio, Mic2, Calendar, Target } from "lucide-react";

import { useMissionStore } from "@/features/missions/services/missionStore";

const links = [
  { to: "/programs", icon: Radio, label: "Programs" },
  { to: "/announcers", icon: Mic2, label: "Hosts" },
  { to: "/schedule", icon: Calendar, label: "Schedule" },
  { to: "/missions", icon: Target, label: "Missions" },
];

function MissionBadge() {
  const progress = useMissionStore((state) => state.progress);
  const totalReward = useMissionStore((state) => state.totalReward);
  const progressEntries = Object.values(progress);
  const hasProgress = progressEntries.length > 0;

  const overallProgress = hasProgress
    ? Math.round(
        progressEntries.reduce((sum, p) => sum + (p.progress / p.target), 0) /
          progressEntries.length *
          100,
      )
    : 0;

  const activeCount = progressEntries.filter(
    (p) => !p.completed && !p.claimed,
  ).length;

  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - overallProgress / 100);

  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
      {hasProgress && (
        <svg
          className="absolute -inset-0.5 h-5 w-5 -rotate-90"
          viewBox="0 0 22 22"
          fill="none"
        >
          <circle
            cx="11"
            cy="11"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <circle
            cx="11"
            cy="11"
            r={radius}
            stroke="#bda752"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
      )}
      <Target size={20} />
      {totalReward > 0 && (
        <span className="absolute -right-2 -top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
          {totalReward}
        </span>
      )}
      {activeCount > 0 && totalReward === 0 && (
        <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#bda752] text-[10px] font-bold leading-none text-white">
          {activeCount}
        </span>
      )}
    </div>
  );
}

export function QuickAccess() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {links.map((link) => {
        const Icon = link.icon;

        return (
          <Link
            key={link.to}
            to={link.to}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            {link.to === "/missions" ? (
              <MissionBadge />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600">
                <Icon size={20} />
              </div>
            )}
            <span className="text-xs font-semibold text-gray-700">
              {link.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
