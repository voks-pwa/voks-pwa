import { useParams } from "react-router-dom";
import { useCampaign } from "@/features/campaigns/hooks/useCampaigns";
import { CampaignDetail } from "@/features/campaigns/components/CampaignDetail";
import { CampaignListSkeleton } from "@/features/campaigns/components/CampaignSkeleton";
import { CampaignEmptyState } from "@/features/campaigns/components/CampaignEmptyState";

export function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: campaign, isLoading, isError } = useCampaign(slug);

  if (isLoading) {
    return <CampaignListSkeleton count={1} />;
  }

  if (isError || !campaign) {
    return <CampaignEmptyState />;
  }

  return <CampaignDetail campaign={campaign} />;
}
