import type { MissionConfig } from "../services/missionTypes";

export interface MissionContext {

    userId:string;

    mission:MissionConfig;

    amount:number;

    action:string;

}