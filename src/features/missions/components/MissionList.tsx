import { useMissionProgress } from "@/hooks/useMissionProgress";

import { useMissions } from "@/hooks/useMissions";

import {

  MissionCard,

} from "./MissionCard";

import type {

  MissionConfig,

  MissionProgress,

} from "../missionTypes";

export function MissionList(){

  const {

    data:missions=[],

  }=useMissions();

  const {

    data:progress=[],

  }=useMissionProgress();

  return(

    <div className="space-y-4">

      {missions.map(

        (mission:MissionConfig)=>{

          const state=

            progress.find(

              (

                p:MissionProgress

              )=>

                p.mission_id===

                mission.id

            );

          return(

            <MissionCard

              key={mission.id}

              mission={mission}

              progress={state}

            />

          );

        }

      )}

    </div>

  );

}