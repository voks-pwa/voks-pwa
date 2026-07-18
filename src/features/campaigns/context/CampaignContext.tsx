import { useMemo, type ReactNode } from "react";
import { useCampaigns } from "../hooks/useCampaigns";
import {
  CampaignContext,
  type CampaignContextValue,
} from "./campaignContextValue";

export function CampaignProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isError, refetch } = useCampaigns();

  const campaigns = useMemo(() => data ?? [], [data]);

  const value = useMemo<CampaignContextValue>(() => {
    const active = campaigns.filter((c) => c.isVisible);
    const featured = active.filter((c) => c.featured);

    return {
      campaigns,
      isLoading,
      isError,
      activeCampaigns: active,
      featuredCampaigns: featured,
      getCampaign: (slug: string) =>
        campaigns.find((c) => c.slug === slug),
      refetch: () => {
        void refetch();
      },
    };
  }, [campaigns, isLoading, isError, refetch]);

  return (
    <CampaignContext.Provider value={value}>
      {children}
    </CampaignContext.Provider>
  );
}


