import { useEffect, useRef } from "react";
import {
  runCampaignScheduler,
  type CampaignEvaluation,
} from "../services/campaignScheduler";
import {
  triggerCampaignNotifications,
  runCampaignHealthCheck,
} from "../services/campaignAutomation";
import type { CampaignStatus } from "../types";

const SCHEDULER_INTERVAL_MS = 60 * 1000;

/**
 * Campaign Automation hook.
 *
 * Runs the Campaign Scheduler on app load and on a background interval.
 * Each pass derives statuses (Auto Start / End / Visibility / Archive),
 * fires in-app notifications on transitions, and runs a health check.
 *
 * Pure observation only — never writes to WordPress/Supabase and never
 * touches the Mission Engine.
 */
export function useCampaignAutomation(): void {
  const previous = useRef<Map<string, CampaignStatus> | null>(null);
  const lastRun = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      const evaluation: CampaignEvaluation = await runCampaignScheduler(
        previous.current,
      );
      if (cancelled) return;

      triggerCampaignNotifications(evaluation);
      runCampaignHealthCheck(evaluation);

      previous.current = new Map(
        evaluation.views.map((v) => [v.slug, v.derivedStatus]),
      );
      lastRun.current = evaluation.evaluatedAt;
    }

    void tick();
    const id = setInterval(() => void tick(), SCHEDULER_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
}
