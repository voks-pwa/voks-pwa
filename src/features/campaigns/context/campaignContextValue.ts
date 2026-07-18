import { createContext } from "react";
import type { CampaignView } from "../services/campaignService";

export interface CampaignContextValue {
  campaigns: CampaignView[];
  isLoading: boolean;
  isError: boolean;
  activeCampaigns: CampaignView[];
  featuredCampaigns: CampaignView[];
  getCampaign: (slug: string) => CampaignView | undefined;
  refetch: () => void;
}

export const CampaignContext =
  createContext<CampaignContextValue | null>(null);
