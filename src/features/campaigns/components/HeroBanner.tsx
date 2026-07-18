import { ArrowRight, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CampaignView } from "../services/campaignService";
import { Countdown } from "./Countdown";
import { StatusBadge } from "./StatusBadge";

/**
 * Editorial hero banner. Premium, minimal, large whitespace.
 * Read-only display of a single (featured) campaign.
 */
export function HeroBanner({ campaign }: { campaign: CampaignView }) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/campaigns/${campaign.slug}`)}
      className="group relative block w-full overflow-hidden rounded-[28px] text-left shadow-lg transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bda752] focus-visible:ring-offset-2"
      style={{ minHeight: 320 }}
      aria-label={`Open campaign ${campaign.title}`}
    >
      {campaign.banner_url ? (
        <img
          src={campaign.banner_url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#bda752] to-[#8c7530]" />
      )}

      <div className="absolute inset-0 bg-black/35" />

      <div className="relative flex h-full min-h-[320px] flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <Megaphone size={14} />
            Featured Campaign
          </span>
          <StatusBadge status={campaign.derivedStatus} />
        </div>

        <div>
          <h1 className="max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">
            {campaign.title}
          </h1>
          {campaign.description && (
            <p className="mt-2 max-w-lg text-sm text-white/90 sm:text-base">
              {campaign.description}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Countdown
              timeRemainingMs={campaign.timeRemainingMs}
              variant="light"
            />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#bda752] px-4 py-2 text-sm font-bold text-white shadow-md transition-colors group-hover:bg-[#a8913f]">
              View Campaign
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
