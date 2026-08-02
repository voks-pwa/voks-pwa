import { History, Loader2, CheckCircle2, Trophy, Clock, Target } from "lucide-react";
import { useMissions } from "@/hooks/useMissions";
import { useAuth } from "@/features/auth/useAuth";
import { getUserMissionCompletions } from "../repositories/missionCompletionRepository";
import { useQuery } from "@tanstack/react-query";

export function MissionHistory() {
  const { user } = useAuth();
  const { data: missions = [], isLoading: missionsLoading } = useMissions();

  const { data: completions = [], isLoading: completionsLoading } = useQuery({
    queryKey: ["mission-completions", user?.id],
    enabled: !!user,
    queryFn: () => getUserMissionCompletions(user!.id),
  });

  if (missionsLoading || completionsLoading) {
    return (
      <section className="mt-10">
        <div className="mb-4 flex items-center gap-2">
          <History size={18} className="text-[#bda752]" />
          <h2 className="font-bold">Mission History</h2>
        </div>
        <div className="flex h-20 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-[#bda752]" />
        </div>
      </section>
    );
  }

  const missionMap = new Map(missions.map((m) => [m.id, m]));

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <History size={18} className="text-[#bda752]" />
        <h2 className="font-bold">Mission History</h2>
      </div>

      <div className="space-y-3">
        {completions.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center text-gray-400 shadow-sm">
            No claimed missions yet.
          </div>
        )}

        {completions.map((item) => {
          const mission = missionMap.get(item.mission_id);
          return (
            <div
              key={`${item.mission_id}-${item.completed_at}`}
              className="rounded-2xl bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                    <Trophy size={18} className="text-[#bda752]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {mission?.title ?? "Mission"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {item.completed_at && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={11} />
                          {new Date(item.completed_at).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      )}
                      {mission?.type && (
                        <span className="flex items-center gap-1 text-xs text-gray-400 capitalize">
                          <Target size={11} />
                          {mission.type}
                        </span>
                      )}
                      {mission?.campaignSlug && (
                        <span className="text-xs text-[#bda752]">
                          {mission.campaignSlug}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <span className="text-xs font-semibold text-green-600">
                    +{item.reward_vxp ?? 0} XP
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
