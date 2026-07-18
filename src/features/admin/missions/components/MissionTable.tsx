import { MissionRow } from "./MissionRow";

interface MissionTableItem {
  id: number;

  title: string;

  reward: number;

  action: string;

  active: boolean;

  completed: number;

  in_progress: number;

  badge?: string;

  icon?: string;

  repeat?: boolean;

  sort?: number;
}

interface Props {
  missions: MissionTableItem[];
  onEdit: (missionId: number) => void;
}

export function MissionTable({
  missions,
  onEdit,
}: Props) {
  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-sm
      "
    >
      <table className="w-full">

        <thead>

          <tr
            className="
              border-b
              bg-gray-50
            "
          >
            <th className="p-4 text-left">
              Mission
            </th>

            <th className="text-left">
              Reward
            </th>

            <th className="text-left">
              Action
            </th>

            <th className="text-left">
              Progress
            </th>

            <th className="text-left">
              Completed
            </th>

            <th className="text-left">
              Status
            </th>

            <th className="text-right pr-6">
              Manage
            </th>

          </tr>

        </thead>

        <tbody>

          {missions.map((mission) => (

            <MissionRow
              key={mission.id}
              mission={mission}
              onEdit={onEdit}
            />

          ))}

        </tbody>

      </table>

    </div>
  );
}