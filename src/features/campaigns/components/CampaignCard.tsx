import { ArrowRight, Calendar, Megaphone } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useNavigate } from "react-router-dom";
import type { CampaignView } from "../services/campaignService";
import { StatusBadge } from "./StatusBadge";

function formatDateRange(
  start: string | null,
  end: string | null,
): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (end) return `Until ${fmt(end)}`;
  if (start) return `From ${fmt(start)}`;
  return "Ongoing";
}

/**
 * Campaign card — display only. No mission or reward logic.
 */
export function CampaignCard({ campaign }: { campaign: CampaignView }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/campaigns/${campaign.slug}`)}
      className="group block w-full overflow-hidden rounded-3xl bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bda752] focus-visible:ring-offset-2"
      aria-label={`Open campaign ${campaign.title}`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {campaign.banner_url ? (
          <OptimizedImage
            src={campaign.banner_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#bda752] to-[#8c7530]">
            <Megaphone size={32} className="text-white/80" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={campaign.derivedStatus} size="sm" />
        </div>
        {campaign.featured && (
          <div className="absolute right-3 top-3 rounded-full bg-[#bda752] px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
            Featured
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="truncate text-lg font-black text-gray-900">
            {campaign.title}
          </h3>
          {campaign.sponsor_name && (
            <p className="mt-0.5 text-xs font-medium text-gray-400">
              by {campaign.sponsor_name}
            </p>
          )}
        </div>

        {campaign.description && (
          <p className="line-clamp-2 text-sm text-gray-500">
            {campaign.description}
          </p>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <Calendar size={14} />
            {formatDateRange(campaign.campaign_start, campaign.campaign_end)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#bda752]">
            View
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </button>
  );
}
