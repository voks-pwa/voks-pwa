import { useContext } from "react";
import { CampaignContext } from "./campaignContextValue";

export function useCampaignContext() {
  const ctx = useContext(CampaignContext);
  if (!ctx) {
    throw new Error(
      "useCampaignContext must be used within a CampaignProvider",
    );
  }
  return ctx;
}
