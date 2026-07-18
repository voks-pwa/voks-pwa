import type { MissionState } from "./state";

export interface MissionProgress {
  id?: number;
  user_id?: string;
  mission_id: number;
  progress: number;
  completed: boolean;
  completed_at?: string | null;
  claimed: boolean;
  claimed_at?: string | null;
  mission_state: MissionState;
  period: string;
  updated_at?: string;
}

export interface MissionProgressInsert {
  user_id: string;
  mission_id: number;
  progress?: number;
  completed?: boolean;
  completed_at?: string | null;
  claimed?: boolean;
  mission_state: MissionState;
  period?: string;
}
