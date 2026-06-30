import { Trophy } from "lucide-react";

import type {
  MissionConfig,
  MissionProgress,
} from "../missionTypes";

interface Props {

  mission: MissionConfig

  progress?: MissionProgress

}

export function MissionCard({

  mission,

  progress,

}:Props){

  const current =
    progress?.progress ?? 0;

  const percent =
    Math.min(
      current/mission.target,
      1
    )*100;

  return(

    <div className="rounded-2xl bg-white p-5 shadow-sm">

      <div className="flex justify-between">

        <div>

          <h3 className="font-bold">

            {mission.title}

          </h3>

          <p className="mt-2 text-sm text-gray-500">

            {mission.description}

          </p>

        </div>

        <div className="rounded-full bg-amber-50 p-3">

          <Trophy
            size={20}
            className="text-[#bda752]"
          />

        </div>

      </div>

      <div className="mt-5">

        <div className="mb-2 flex justify-between text-xs">

          <span>

            {current}/{mission.target}

          </span>

          <span>

            {Math.round(percent)}%

          </span>

        </div>

        <div className="h-2 rounded-full bg-gray-200">

          <div

            className="h-full rounded-full bg-[#bda752]"

            style={{

              width:`${percent}%`

            }}

          />

        </div>

      </div>

      <div className="mt-4 flex justify-between">

        <span className="text-xs text-gray-500">

          {mission.type}

        </span>

        <span className="font-bold text-[#bda752]">

          +{mission.reward} VXP

        </span>

      </div>

    </div>

  );

}