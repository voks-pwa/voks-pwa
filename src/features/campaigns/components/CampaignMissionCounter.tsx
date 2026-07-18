import type { CampaignMissionState } from "../hooks/useCampaignMissions";

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-black text-gray-900">{value}</span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>
    </div>
  );
}

/**
 * Campaign Mission Counter — read-only tally of mission states.
 * All values are derived from Mission Engine progress; no mission logic.
 */
export function CampaignMissionCounter({
  state,
}: {
  state: CampaignMissionState;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-3xl bg-white p-5 shadow-sm">
      <Stat label="Missions" value={state.total} />
      <Stat label="Completed" value={state.completed} />
      <Stat label="In Progress" value={state.inProgress} />
    </div>
  );
}
