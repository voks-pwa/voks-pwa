import { supabase } from "@/lib/supabase";
import { getCampaigns, getCampaignBySlug } from "@/features/campaigns/repositories/campaignRepository";
import { deriveCampaignStatus } from "@/features/campaigns/services/campaignStatus";
import type {
  AdminCampaign,
  AdminCampaignsParams,
  AdminCampaignsResponse,
  CampaignTimelineEvent,
  CampaignAnalyticsData,
  CampaignMission,
} from "../types";
import type { Campaign } from "@/features/campaigns/types";

const WP_API_URL =
  import.meta.env.VITE_WP_API_URL ?? "https://voksradio.com/wp-json/wp/v2";

function toAdminCampaign(c: Campaign): AdminCampaign {
  return {
    ...c,
    status: deriveCampaignStatus(c),
  };
}

export async function getAdminCampaigns(params: AdminCampaignsParams = {}): Promise<AdminCampaignsResponse> {
  const campaigns = (await getCampaigns()).map(toAdminCampaign);

  let filtered = campaigns;

  if (params.status) {
    filtered = filtered.filter((c) => c.status === params.status);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.sponsor_name?.toLowerCase().includes(q),
    );
  }

  filtered.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (b.priority ?? 0) - (a.priority ?? 0);
  });

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const start = (page - 1) * limit;

  return {
    campaigns: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
}

export async function getAdminCampaignBySlug(slug: string): Promise<AdminCampaign | null> {
  const c = await getCampaignBySlug(slug);
  if (!c) return null;
  return toAdminCampaign(c);
}

export async function getCampaignMissions(campaignSlug: string): Promise<CampaignMission[]> {
  const response = await fetch(`${WP_API_URL}/missions?_embed&per_page=100`);
  if (!response.ok) return [];
  const missions = await response.json();
  return missions
    .filter((m: Record<string, unknown>) => (m.acf as Record<string, unknown>)?.mission_campaign_slug === campaignSlug)
    .map((m: Record<string, unknown>) => ({
      id: m.id as number,
      title: (m.title as { rendered: string })?.rendered ?? "",
      description: (m.acf as Record<string, unknown>)?.mission_description as string ?? "",
      reward: Number((m.acf as Record<string, unknown>)?.mission_vxp ?? 0),
      status: "active",
    }));
}

export async function getCampaignTimeline(campaign: AdminCampaign): Promise<CampaignTimelineEvent[]> {
  const events: CampaignTimelineEvent[] = [];

  if (campaign.campaign_start) {
    events.push({
      id: `start-${campaign.id}`,
      type: "started",
      title: "Campaign Started",
      description: `"${campaign.title}" became active`,
      timestamp: new Date(campaign.campaign_start).getTime(),
    });
  }

  if (campaign.campaign_end) {
    events.push({
      id: `end-${campaign.id}`,
      type: "ended",
      title: "Campaign Ended",
      description: `"${campaign.title}" ended`,
      timestamp: new Date(campaign.campaign_end).getTime(),
    });
  }

  if (campaign.featured) {
    events.push({
      id: `featured-${campaign.id}`,
      type: "featured",
      title: "Marked as Featured",
      description: `"${campaign.title}" featured in hero banner`,
      timestamp: Date.now(),
    });
  }

  if ((campaign.priority ?? 0) > 0) {
    events.push({
      id: `priority-${campaign.id}`,
      type: "priority_changed",
      title: "Priority Set",
      description: `"${campaign.title}" priority: ${campaign.priority}`,
      timestamp: Date.now(),
    });
  }

  events.sort((a, b) => a.timestamp - b.timestamp);
  return events;
}

export async function syncCampaignFromWP(slug: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${WP_API_URL}/campaign?_embed&slug=${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error("Failed to fetch from WP");
    const data = await response.json();
    if (!data.length) return { success: false, message: "Campaign not found in WordPress" };
    return { success: true, message: `Synced "${data[0].title.rendered}" from WordPress` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Sync failed" };
  }
}

export async function updateCampaignFeatured(slug: string, featured: boolean): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.functions.invoke("admin-campaign-update", {
      body: { slug, featured },
    });
    if (error) throw error;
    return { success: true, message: `Campaign ${featured ? "featured" : "unfeatured"}` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function updateCampaignPriority(slug: string, priority: number): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.functions.invoke("admin-campaign-update", {
      body: { slug, priority },
    });
    if (error) throw error;
    return { success: true, message: `Priority set to ${priority}` };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Update failed" };
  }
}

export async function getCampaignAnalytics(campaignSlug: string): Promise<CampaignAnalyticsData> {
  const missions = await getCampaignMissions(campaignSlug);
  const missionIds = missions.map((m) => m.id);

  const { getCampaignStats } = await import("../services/campaignStatsService");
  const stats = await getCampaignStats(missionIds, campaignSlug);

  return {
    overview: {
      impressions: 0,
      views: 0,
      participants: stats.participants,
      completions: stats.completedCount,
      completion_rate: stats.completionRate,
      avg_xp: stats.xpIssued,
      rewards_claimed: stats.rewardDistributed,
    },
    funnel: [
      { stage: "Participants", count: stats.participants, rate: 100 },
      { stage: "Completed", count: stats.completedCount, rate: stats.completionRate * 100 },
    ],
    top_missions: missions.map((m) => ({
      mission_id: m.id,
      title: m.title,
      completions: 0,
      completion_rate: 0,
    })),
    daily_trend: [],
    audience: {
      countries: [],
      devices: [],
    },
  };
}