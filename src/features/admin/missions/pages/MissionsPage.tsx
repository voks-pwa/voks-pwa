import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { getAllMissions, reloadMissionCache } from "@/features/missions/services/missionWP";

import { useAdminMissions, useUpdateMission } from "../hooks/useAdminMissions";
import { MissionTable } from "../components/MissionTable";
import { MissionEditDialog } from "../components/MissionEditDialog";

import type { MissionConfig } from "@/features/missions/services/missionTypes";

type MissionRow = MissionConfig & {
  completed: number;
  in_progress: number;
};

export function MissionsPage() {
  const [search, setSearch] = useState("");

  const [editMission, setEditMission] =
    useState<MissionConfig | null>(null);

  const { data: stats = {} } = useAdminMissions();

  const updateMutation = useUpdateMission();

  const [missions, setMissions] = useState<MissionConfig[]>([]);

  useEffect(() => {
    getAllMissions().then(setMissions);
  }, []);

  const rows: MissionRow[] = useMemo(() => {
    return missions
      .map((mission) => ({
        ...mission,

        completed:
          stats[String(mission.id)]?.completed ?? 0,

        in_progress:
          stats[String(mission.id)]?.in_progress ?? 0,
      }))
      .filter((mission) =>
        mission.title
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort(
        (a, b) =>
          (a.sort ?? 0) -
          (b.sort ?? 0)
      );
  }, [missions, stats, search]);

  const handleEdit = useCallback(
    (missionId: number) => {
      const mission =
        missions.find(
          (m) => m.id === missionId
        ) ?? null;

      setEditMission(mission);
    },
    [missions]
  );

  const handleSave = useCallback(
    async (data: {
      id: number;
      title: string;
      description: string;
      reward: number;
      target: number;
      active: boolean;
    }) => {
      await updateMutation.mutateAsync({ ...data, missionId: data.id });

      setEditMission(null);

      const updated =
        await reloadMissionCache();

      setMissions(updated);
    },
    [updateMutation]
  );

  return (
    <div className="space-y-6 p-8">

      <div>

        <h1 className="text-3xl font-black">
          Missions
        </h1>

        <p className="text-gray-500">
          Manage all application missions.
        </p>

      </div>

      <div className="relative">

        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search mission..."
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4"
        />

      </div>

      <MissionTable
        missions={rows}
        onEdit={handleEdit}
      />

      <MissionEditDialog
        open={editMission !== null}
        mission={editMission}
        saving={updateMutation.isPending}
        onSave={handleSave}
        onClose={() =>
          setEditMission(null)
        }
      />

    </div>
  );
}