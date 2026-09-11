import { Loader2, AlertCircle, Target, CalendarCheck, Megaphone } from "lucide-react";
import { useMissionProgress } from "@/hooks/useMissionProgress";
import { useMissions } from "@/hooks/useMissions";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { MissionCard } from "./MissionCard";
import type { MissionConfig, MissionProgress } from "../services/missionTypes";
import { deriveMissionState } from "../services/missionStateMachine";
import { calculateProfileCompletion } from "@/features/profile/utils/profileCompletion";

const VISIBLE_STATES = new Set(["NOT_STARTED", "IN_PROGRESS", "READY_TO_CLAIM"]);

function getMissionState(
  mission: MissionConfig,
  progress?: MissionProgress
): string {
  return deriveMissionState(mission, progress ?? null);
}

export function MissionList(){
  const { data: profile } = useProfile()
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

  const profileCompleted = profile ? calculateProfileCompletion(profile) >= 100 : false

  const visible = sorted.filter((mission: MissionConfig) => {
    if (mission.action === "checkin") {
      const state = getMissionState(mission, progressMap.get(mission.id));
      return state === "CLAIMED" || VISIBLE_STATES.has(state);
    }
    if (mission.action === "profile" && profileCompleted) return false
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

  // Shopee-style grouping: Daily vs Campaign sponsor (WP campaignSlug) vs Sekali
  const daily = visible.filter((m) => m.type === "daily" || m.action === "checkin");
  const campaign = visible.filter((m) => !!m.campaignSlug);
  const campaignIds = new Set(campaign.map((m) => m.id));
  const dailyIds = new Set(daily.map((m) => m.id));
  const once = visible.filter((m) => !dailyIds.has(m.id) && !campaignIds.has(m.id));

  const Section = ({ title, icon: Icon, items, emptyText }: { title: string; icon: typeof CalendarCheck; items: typeof visible; emptyText: string }) => {
    if (!items.length) return null;
    return (
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Icon size={16} className="text-[#bda752]" />
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">{items.length}</span>
        </div>
        <div className="space-y-3">
          {items.map((mission) => {
            const state = progress.find((p) => p.mission_id === mission.id);
            return <MissionCard key={mission.id} mission={mission} progress={state} />;
          })}
        </div>
        {items.length === 0 && <p className="text-sm text-gray-400">{emptyText}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Section title="Misi Harian" icon={CalendarCheck} items={daily} emptyText="Tidak ada misi harian" />
      {campaign.length > 0 && (
        <Section title="Misi Campaign Sponsor" icon={Megaphone} items={campaign} emptyText="Tidak ada campaign" />
      )}
      <Section title="Misi Sekali & Lainnya" icon={Target} items={once} emptyText="Tidak ada misi" />

      {/* Hint untuk WP integration */}
      <p className="text-center text-xs text-gray-400">
        Misi campaign dibuat di WordPress (field campaignSlug) — otomatis muncul di sini.
      </p>
    </div>
  );
}
