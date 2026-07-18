import { Link } from "react-router-dom";
import { ChevronRight, Target } from "lucide-react";
import { useMissionStore } from "../services/missionStore";
import { MissionProgressBar } from "./MissionProgressBar";

export function MissionWidget() {
  const missions = useMissionStore((state) => state.missions);
  const progress = useMissionStore((state) => state.progress);

  const progressEntries = Object.values(progress);

  if (!progressEntries.length) return null;

  const active = progressEntries.filter((p) => !p.completed && !p.claimed);
  const primary = active[0] ??
    progressEntries.find((p) => p.completed && !p.claimed) ??
    progressEntries[0];

  if (!primary) return null;

  const mission = missions.find((m) => m.id === primary.missionId);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bda752]/10 text-[#bda752]">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold">Today&apos;s Mission</h2>
            {active.length > 0 && (
              <p className="text-xs font-semibold text-[#bda752]">
                {active.length} Active
              </p>
            )}
          </div>
        </div>
        <Link
          to="/missions"
          className="flex items-center gap-1 text-xs font-semibold text-[#bda752]"
        >
          View All
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="mt-5">
        <h3 className="mb-1 text-base font-bold text-gray-900">
          {mission?.title ?? "Complete your mission"}
        </h3>

        <div className="mt-4">
          <MissionProgressBar
            progress={primary.progress}
            target={primary.target}
            completed={primary.completed}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            {primary.progress} / {primary.target}
          </span>
          {!primary.completed && (
            <Link
              to={`/missions/${primary.missionId}`}
              className="rounded-xl bg-[#bda752] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#a8913f]"
            >
              Continue Mission
            </Link>
          )}
          {primary.completed && !primary.claimed && (
            <Link
              to={`/missions/${primary.missionId}`}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-600"
            >
              Claim Reward
            </Link>
          )}
          {primary.claimed && (
            <span className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500">
              Completed
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
