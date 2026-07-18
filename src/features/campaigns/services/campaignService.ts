import {
  getCampaigns,
  getCampaignBySlug,
} from "../repositories/campaignRepository";
import {
  deriveCampaignStatus,
  isCampaignVisible,
  timeRemainingMs,
} from "./campaignStatus";
import type { Campaign } from "../types";

export interface CampaignView extends Campaign {
  derivedStatus: Campaign["status"];
  isVisible: boolean;
  timeRemainingMs: number | null;
}

function enrich(
  campaign: Campaign,
  now: Date,
): CampaignView {
  const derivedStatus = deriveCampaignStatus(campaign, now);
  return {
    ...campaign,
    derivedStatus,
    isVisible: isCampaignVisible(derivedStatus),
    timeRemainingMs: timeRemainingMs(campaign, now),
  };
}

/**
 * Campaign Service — orchestration only (Campaign Automation surface).
 *
 * Responsibilities:
 * - Load Campaign from WordPress (via repository)
 * - Validate Campaign Status (status calculator)
 * - Filter Active Campaign (only running/upcoming)
 * - Sort Featured Campaign first
 *
 * Never: gives XP, validates missions, claims rewards, or touches the
 * Mission Engine. Campaign is only a container.
 */
export async function getCampaignsService(
  now: Date = new Date(),
): Promise<CampaignView[]> {
  const campaigns = await getCampaigns();

  const visible = campaigns
    .map((c) => enrich(c, now))
    .filter((c) => c.isVisible);

  return sortFeaturedFirst(visible);
}

export async function getCampaignService(
  slug: string,
  now: Date = new Date(),
): Promise<CampaignView | null> {
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return null;

  return enrich(campaign, now);
}

/**
 * Featured Rotation — featured campaigns first, then by priority (higher
 * number = higher priority), then by campaign_start ascending. Pure
 * derivation; no stored ordering is mutated.
 */
export function sortFeaturedFirst(
  campaigns: CampaignView[],
): CampaignView[] {
  return [...campaigns].sort((a, b) => {
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    const aStart = a.campaign_start ? new Date(a.campaign_start).getTime() : 0;
    const bStart = b.campaign_start ? new Date(b.campaign_start).getTime() : 0;
    return aStart - bStart;
  });
}
