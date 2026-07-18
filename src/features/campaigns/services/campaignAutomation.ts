import { systemNotification } from "@/features/notifications/services/notificationSubscriber";
import type { CampaignEvaluation, CampaignTransition } from "./campaignScheduler";

const EVENT_MAP: Record<CampaignTransition, "campaign_started" | "campaign_ending" | "campaign_finished"> = {
  started: "campaign_started",
  ending_soon: "campaign_ending",
  ended: "campaign_finished",
  archived: "campaign_finished",
  hidden: "campaign_finished",
};

export function triggerCampaignNotifications(evaluation: CampaignEvaluation): void {
  for (const transition of evaluation.transitions) {
    const eventType = EVENT_MAP[transition.kind];
    if (!eventType) continue;
    systemNotification({
      type: eventType,
      metadata: { campaignSlug: transition.campaign.slug },
    });
  }
}

export interface CampaignHealthCheck {
  ok: boolean;
  issues: string[];
  evaluatedAt: number;
}

export function runCampaignHealthCheck(evaluation: CampaignEvaluation): CampaignHealthCheck {
  const issues: string[] = [];

  for (const view of evaluation.views) {
    if (!view.slug) {
      issues.push("Campaign with missing slug detected.");
    }
    if (view.isVisible && view.derivedStatus === "archived") {
      issues.push(`Archived campaign "${view.slug}" is marked visible.`);
    }
    if (!view.isVisible && view.derivedStatus === "running") {
      issues.push(`Running campaign "${view.slug}" is not visible.`);
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    evaluatedAt: evaluation.evaluatedAt,
  };
}
