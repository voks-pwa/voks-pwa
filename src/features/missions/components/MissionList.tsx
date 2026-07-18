import { Loader2, AlertCircle, Target } from "lucide-react";
import { useMissionProgress } from "@/hooks/useMissionProgress";
import { useMissions } from "@/hooks/useMissions";
import { MissionCard } from "./MissionCard";
import type { MissionConfig, MissionProgress } from "../services/missionTypes";
import { deriveMissionState } from "../services/missionStateMachine";

const VISIBLE_STATES = new Set(["NOT_STARTED", "IN_PROGRESS", "READY_TO_CLAIM"]);

function getMissionState(
  mission: MissionConfig,
  progress?: MissionProgress
): string {
  return deriveMissionState(mission, progress ?? null);
}

export function MissionList(){
  const { data: missions = [], isLoading: missionsLoading, isError: missionsError } = useMissions();
  const { data: progress = [] } = useMissionProgress();

  if (missionsLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#bda752]" />
      </div>
    );
  }

  if (missionsError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-8 text-center shadow-sm">
        <AlertCircle className="h-8 w-8 text-red-400" />
        <p className="text-sm text-gray-500">
          Failed to load missions
        </p>
      </div>
    );
  }

  if (!missions.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-8 text-center shadow-sm">
        <Target className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">
          No missions available
        </p>
      </div>
    );
  }

  const sorted = [...missions].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

  const progressMap = new Map(
    progress.map((p: MissionProgress) => [p.mission_id, p])
  );

  const visible = sorted.filter((mission: MissionConfig) => {
    const state = getMissionState(mission, progressMap.get(mission.id));
    return VISIBLE_STATES.has(state);
  });

  if (!visible.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-8 text-center shadow-sm">
        <Target className="h-8 w-8 text-gray-300" />
        <p className="text-sm text-gray-500">
          All missions completed
        </p>
      </div>
    );
  }

  return(
    <div className="space-y-4">
      {visible.map((mission: MissionConfig) => {
        const state = progress.find((p: MissionProgress) => p.mission_id === mission.id);
        return(
          <MissionCard key={mission.id} mission={mission} progress={state} />
        );
      })}
    </div>
  );
}
