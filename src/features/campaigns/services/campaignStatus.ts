import type { Campaign, CampaignStatus } from "../types";

export const ENDING_SOON_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const ARCHIVE_GRACE_DAYS = 7;

/**
 * Campaign Status Calculator — the heart of Campaign Automation.
 *
 * The Campaign Engine NEVER stores status; it DERIVES it from schedule +
 * the `campaign_active` flag (WordPress ACF). Automation runs this on every
 * evaluation (app load / interval) to Auto Start, Auto End, Auto Hide, and
 * Auto Archive — purely as a derived observation. No writes, no Mission
 * Engine involvement.
 *
 * State machine:
 *   inactive  -> campaign_active === false
 *   upcoming   -> now < campaign_start
 *   running    -> started, >24h before end
 *   ending_soon -> running and <=24h to end
 *   ended      -> now > campaign_end (still inside grace)
 *   archived   -> ended and past grace (ARCHIVE_GRACE_DAYS)
 *   hidden     -> active but outside any window (no dates)
 */
export function deriveCampaignStatus(
  campaign: Pick<
    Campaign,
    "campaign_start" | "campaign_end" | "campaign_active"
  >,
  now: Date = new Date(),
): CampaignStatus {
  if (!campaign.campaign_active) {
    return "inactive";
  }

  const start = campaign.campaign_start
    ? new Date(campaign.campaign_start)
    : null;
  const end = campaign.campaign_end
    ? new Date(campaign.campaign_end)
    : null;
  const nowMs = now.getTime();

  if (start && nowMs < start.getTime()) {
    return "upcoming";
  }

  if (end) {
    const endMs = end.getTime();
    if (nowMs > endMs) {
      const graceMs = ARCHIVE_GRACE_DAYS * 24 * 60 * 60 * 1000;
      return nowMs - endMs > graceMs ? "archived" : "ended";
    }
    if (endMs - nowMs <= ENDING_SOON_THRESHOLD_MS) {
      return "ending_soon";
    }
    return "running";
  }

  if (start) {
    return "running";
  }

  return "hidden";
}

export function isCampaignVisible(status: CampaignStatus): boolean {
  return (
    status === "running" ||
    status === "upcoming" ||
    status === "ending_soon"
  );
}

export function timeRemainingMs(
  campaign: Pick<Campaign, "campaign_end">,
  now: Date = new Date(),
): number | null {
  if (!campaign.campaign_end) return null;
  const end = new Date(campaign.campaign_end).getTime();
  return Math.max(0, end - now.getTime());
}

export function isEndingSoon(campaign: Campaign, now: Date = new Date()): boolean {
  const remaining = timeRemainingMs(campaign, now);
  return (
    remaining !== null &&
    remaining > 0 &&
    remaining <= ENDING_SOON_THRESHOLD_MS
  );
}

export function isArchived(campaign: Campaign, now: Date = new Date()): boolean {
  return deriveCampaignStatus(campaign, now) === "archived";
}
