import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Megaphone } from "lucide-react";
import { useCampaignAnalytics } from "@/features/campaigns/hooks/useCampaignAnalytics";
import { useCampaign } from "@/features/campaigns/hooks/useCampaigns";
import { loadCampaignMissions } from "@/features/campaigns/services/campaignMissionLoader";
import { CampaignAnalyticsOverview } from "@/features/campaigns/components/analytics/CampaignAnalyticsOverview";
import { CampaignCompletionFunnel } from "@/features/campaigns/components/analytics/CampaignCompletionFunnel";
import { CampaignTopMissions } from "@/features/campaigns/components/analytics/CampaignTopMissions";
import { CampaignAudience } from "@/features/campaigns/components/analytics/CampaignAudience";
import { CampaignTrend } from "@/features/campaigns/components/analytics/CampaignTrend";

/**
 * Sponsor Analytics — read-only dashboard.
 * Data is aggregated by the Campaign Engine Edge Function from Mission
 * Engine progress. No mission or reward logic is executed here.
 */
export function SponsorAnalyticsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: campaign } = useCampaign(slug);
  const { data, isLoading, isError } = useCampaignAnalytics(slug);

  const missionTitles = useMemo(() => {
    const map = new Map<string, string>();
    if (!slug) return map;
    loadCampaignMissions(slug)
      .then((missions) =>
        missions.forEach((m) => map.set(String(m.id), m.title)),
      )
      .catch(() => undefined);
    return map;
  }, [slug]);

  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
            <ArrowLeft size={18} />
          </div>
          <span>Back</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <BarChart3 size={28} className="text-[#bda752]" />
        <div>
          <h1 className="text-2xl font-black">Sponsor Analytics</h1>
          <p className="text-sm text-gray-500">
            {campaign?.title ?? slug ?? "Campaign"}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="h-48 animate-pulse rounded-3xl bg-gray-100" />
      )}

      {isError && (
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
          <Megaphone size={32} className="mx-auto text-gray-300" />
          <p className="mt-3 text-gray-500">
            Unable to load analytics for this campaign.
          </p>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          <CampaignAnalyticsOverview data={data} />
          <CampaignTrend data={data} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CampaignCompletionFunnel data={data} />
            <CampaignTopMissions data={data} missionTitles={missionTitles} />
          </div>
          <CampaignAudience data={data} />
        </div>
      )}
    </div>
  );
}
