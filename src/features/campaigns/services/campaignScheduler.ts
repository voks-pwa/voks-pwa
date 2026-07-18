import { getCampaigns } from "../repositories/campaignRepository";
import {
  deriveCampaignStatus,
  isCampaignVisible,
  timeRemainingMs,
} from "./campaignStatus";
import { sortFeaturedFirst } from "./campaignService";
import type { Campaign, CampaignStatus } from "../types";
import type { CampaignView } from "./campaignService";

export type CampaignTransition =
  | "started"
  | "ending_soon"
  | "ended"
  | "archived"
  | "hidden";

export interface CampaignEvaluation {
  views: CampaignView[];
  /** Campaigns whose derived status changed since the previous snapshot. */
  transitions: Array<{
    campaign: CampaignView;
    from: CampaignStatus;
    to: CampaignStatus;
    kind: CampaignTransition;
  }>;
  /** Campaigns the automation considers safe/consistent. */
  healthy: boolean;
  evaluatedAt: number;
}

/**
 * Campaign Scheduler (Automation Engine).
 *
 * Runs purely as a DERIVATION over the Campaign Engine. Given the previous
 * status snapshot, it recomputes every campaign's derived status and reports
 * transitions (Auto Start / Auto End / Auto Archive / Auto Hide / Ending
 * Soon). It never writes to WordPress or Supabase and never touches the
 * Mission Engine — it only observes and reports.
 */
export function evaluateCampaigns(
  campaigns: Campaign[],
  previous: Map<string, CampaignStatus> | null,
  now: Date = new Date(),
): CampaignEvaluation {
  const views = campaigns.map((c) => {
    const derivedStatus = deriveCampaignStatus(c, now);
    return {
      ...c,
      derivedStatus,
      isVisible: isCampaignVisible(derivedStatus),
      timeRemainingMs: timeRemainingMs(c, now),
    } satisfies CampaignView;
  });

  const transitions: CampaignEvaluation["transitions"] = [];
  const snapshot = new Map<string, CampaignStatus>();

  for (const view of views) {
    snapshot.set(view.slug, view.derivedStatus);
    const from = previous?.get(view.slug);
    if (from && from !== view.derivedStatus) {
      const kind = toTransition(from, view.derivedStatus);
      if (kind) {
        transitions.push({ campaign: view, from, to: view.derivedStatus, kind });
      }
    }
  }

  return {
    views: sortFeaturedFirst(views),
    transitions,
    healthy: true,
    evaluatedAt: now.getTime(),
  };
}

function toTransition(
  from: CampaignStatus,
  to: CampaignStatus,
): CampaignTransition | null {
  if (from === "upcoming" && (to === "running" || to === "ending_soon")) {
    return "started";
  }
  if (from === "running" && to === "ending_soon") {
    return "ending_soon";
  }
  if (
    (from === "running" || from === "ending_soon" || from === "upcoming") &&
    to === "ended"
  ) {
    return "ended";
  }
  if (to === "archived") {
    return "archived";
  }
  if (to === "hidden" || to === "inactive") {
    return "hidden";
  }
  return null;
}

/**
 * Loads campaigns and evaluates the full automation pass.
 * Used on app load and on a background interval.
 */
export async function runCampaignScheduler(
  previous: Map<string, CampaignStatus> | null,
  now: Date = new Date(),
): Promise<CampaignEvaluation> {
  const campaigns = await getCampaigns();
  return evaluateCampaigns(campaigns, previous, now);
}
