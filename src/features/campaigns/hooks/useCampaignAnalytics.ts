import { useQuery } from "@tanstack/react-query";
import { getCampaignAnalytics } from "../services/campaignAnalytics";
import type { CampaignAnalytics } from "../services/campaignAnalytics";

/**
 * Read-only campaign analytics hook. Data is aggregated server-side by the
 * `campaign-analytics` Edge Function; this hook only renders it.
 */
export function useCampaignAnalytics(slug: string | undefined) {
  return useQuery({
    queryKey: ["campaign-analytics", slug],
    enabled: Boolean(slug),
    queryFn: () => getCampaignAnalytics(slug as string),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export type { CampaignAnalytics };
