export interface MissionConfig {
  id: number;
  title: string;
  description: string;
  type: string;
  action: string;
  icon: string;
  badge?: string;
  target: number;
  reward: number;
  repeat: boolean;
  active: boolean;
  listenMode: string;
  repeatable: boolean;
  continuous: boolean;
  accumulative: boolean;
  daily: boolean;
  period: "daily" | "weekly" | "monthly" | "once";
  durationMinutes?: number;
  start?: string;
  end?: string;
  sort: number;
  campaignSlug?: string;
}
