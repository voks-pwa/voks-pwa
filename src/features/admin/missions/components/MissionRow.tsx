import {
  Radio,
  Gift,
} from "lucide-react";

import { MissionStatusBadge } from "./MissionStatusBadge";
import { MissionActionMenu } from "./MissionActionMenu";

interface MissionRowItem {
  id: number;

  title: string;

  reward: number;

  action: string;

  active: boolean;

  completed: number;

  in_progress: number;

  badge?: string;

  icon?: string;
}

interface Props {
  mission: MissionRowItem;
  onEdit: (missionId: number) => void;
}

export function MissionRow({
  mission,
  onEdit,
}: Props) {
  return (
    <tr className="border-b last:border-none">

      <td className="p-4">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#bda752]/10
            "
          >
            <Radio
              size={18}
              className="text-[#bda752]"
            />
          </div>

          <div>

            <div className="font-semibold">
              {mission.title}
            </div>

            {mission.badge && (
              <span
                className="
                  mt-1
                  inline-block
                  rounded-full
                  bg-yellow-100
                  px-2
                  py-0.5
                  text-[10px]
                  font-bold
                  text-yellow-700
                "
              >
                {mission.badge}
              </span>
            )}

          </div>

        </div>

      </td>

      <td>

        <div className="flex items-center gap-2 font-semibold">

          <Gift
            size={15}
            className="text-[#bda752]"
          />

          {mission.reward} VXP

        </div>

      </td>

      <td>

        <span
          className="
            rounded-full
            bg-gray-100
            px-3
            py-1
            text-xs
            font-semibold
          "
        >
          {mission.action}
        </span>

      </td>

      <td>

        <span className="font-semibold">
          {mission.in_progress}
        </span>

      </td>

      <td>

        <span className="font-semibold">
          {mission.completed}
        </span>

      </td>

      <td>

        <MissionStatusBadge
          active={mission.active}
        />

      </td>

      <td className="pr-4 text-right">

        <MissionActionMenu
          missionId={mission.id}
          active={mission.active}
          onEdit={onEdit}
        />

      </td>

    </tr>
  );
}