import { useQuery } from "@tanstack/react-query";
import {
  getCampaignsService,
  getCampaignService,
} from "../services/campaignService";
import type { CampaignView } from "../services/campaignService";

export function useCampaigns() {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: () => getCampaignsService(),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useCampaign(slug: string | undefined) {
  return useQuery({
    queryKey: ["campaign", slug],
    enabled: Boolean(slug),
    queryFn: () => getCampaignService(slug as string),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export type { CampaignView };
