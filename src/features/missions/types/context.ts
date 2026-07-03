import type { MissionConfig } from "./mission";

export interface MissionContext{

    userId:string;

    mission:MissionConfig;

    amount:number;

    action:string;

}