export interface AdminMissionStat {
  completed: number;
  in_progress: number;
}

export type AdminMissionStats =
  Record<string, AdminMissionStat>;