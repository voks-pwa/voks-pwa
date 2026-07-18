import type { Campaign, CampaignStatus } from "@/features/campaigns/types";

export interface AdminCampaign extends Campaign {
  missionCount?: number;
  participantCount?: number;
  completionRate?: number;
}

export interface CampaignModerationAction {
  type: "toggle_featured" | "set_priority" | "sync_wp";
  campaignId: number;
  value?: boolean | number;
}

export interface CampaignTimelineEvent {
  id: string;
  timestamp: string;
  type: "created" | "started" | "ended" | "featured" | "priority_changed" | "synced";
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface CampaignHealthCheck {
  healthy: boolean;
  lastEvaluated: number;
  issues: string[];
  campaignsChecked: number;
  transitionsDetected: number;
}

export interface CampaignsListParams {
  status?: CampaignStatus;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CampaignsListResponse {
  campaigns: AdminCampaign[];
  total: number;
  page: number;
  limit: number;
}

export type CampaignTab =
  | "overview"
  | "analytics"
  | "health"
  | "preview"
  | "timeline"
  | "moderation";