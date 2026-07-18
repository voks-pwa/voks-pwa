export interface MissionResult {
  progress: number;
  completed: boolean;
  justCompleted: boolean;
  blocked: boolean;
  claimed: boolean;
  message: string;
  mission_id?: number;
  reward?: number;
}
