import { ArrowLeft, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCampaigns } from "@/features/campaigns/hooks/useCampaigns";
import { HeroBanner } from "@/features/campaigns/components/HeroBanner";
import { CampaignCard } from "@/features/campaigns/components/CampaignCard";
import {
  CampaignListSkeleton,
} from "@/features/campaigns/components/CampaignSkeleton";
import { CampaignEmptyState } from "@/features/campaigns/components/CampaignEmptyState";

export function CampaignsPage() {
  const navigate = useNavigate();
  const { data: campaigns = [], isLoading } = useCampaigns();

  const hero = campaigns.find((c) => c.featured) ?? campaigns[0];
  const rest = campaigns.filter((c) => c.id !== hero?.id);

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
          <span>Kembali</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Megaphone size={28} className="text-[#bda752]" />
        <div>
          <h1 className="text-2xl font-black">Campaigns</h1>
          <p className="text-sm text-gray-500">
            Sponsored events &amp; missions
          </p>
        </div>
      </div>

      {isLoading && <CampaignListSkeleton />}

      {!isLoading && campaigns.length === 0 && <CampaignEmptyState />}

      {!isLoading && campaigns.length > 0 && (
        <>
          {hero && <HeroBanner campaign={hero} />}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {rest.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
