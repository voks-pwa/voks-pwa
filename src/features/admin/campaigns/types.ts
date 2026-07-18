import type { CampaignStatus } from "@/features/campaigns/types";

export type { CampaignStatus };

export type CampaignTab = "overview" | "analytics" | "health" | "preview" | "timeline" | "moderation";

export interface CampaignTimelineEvent {
  id: string;
  type: "created" | "started" | "ending_soon" | "ended" | "archived" | "featured" | "priority_changed" | "synced" | "moderated";
  title: string;
  description: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface AdminCampaign {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  thumbnail_url: string | null;
  sponsor_name: string | null;
  campaign_type: string | null;
  campaign_start: string | null;
  campaign_end: string | null;
  campaign_active: boolean;
  featured: boolean;
  priority: number;
  theme_color: string | null;
  deep_link: string | null;
  status: CampaignStatus;
  synced_at?: string;
}

export interface AdminCampaignsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminCampaignsResponse {
  campaigns: AdminCampaign[];
  total: number;
  page: number;
  limit: number;
}

export interface CampaignMission {
  id: number;
  title: string;
  description: string;
  reward: number;
  status: string;
}

export interface CampaignAnalyticsData {
  overview: {
    impressions: number;
    views: number;
    participants: number;
    completions: number;
    completion_rate: number;
    avg_xp: number;
    rewards_claimed: number;
  };
  funnel: {
    stage: string;
    count: number;
    rate: number;
  }[];
  top_missions: {
    mission_id: number;
    title: string;
    completions: number;
    completion_rate: number;
  }[];
  daily_trend: {
    date: string;
    views: number;
    participants: number;
    completions: number;
  }[];
  audience: {
    countries: { country: string; count: number }[];
    devices: { device: string; count: number }[];
  };
}