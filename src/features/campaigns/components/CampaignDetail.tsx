import { ArrowLeft, CalendarDays, Megaphone, Trophy, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MissionCard } from "@/features/missions/components/MissionCard";
import type { CampaignView } from "../services/campaignService";
import { Countdown } from "./Countdown";
import { StatusBadge } from "./StatusBadge";
import { SponsorSection } from "./SponsorSection";
import { CampaignMissionCounter } from "./CampaignMissionCounter";
import { CampaignProgressSummary } from "./CampaignProgressSummary";
import { useCampaignMissions } from "../hooks/useCampaignMissions";

function formatDuration(
  start: string | null,
  end: string | null,
): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  if (end) return `Ends ${fmt(end)}`;
  if (start) return `Starts ${fmt(start)}`;
  return "Ongoing";
}

/**
 * Campaign detail — read-only display only. Campaign groups missions via
 * `campaign_slug`; all mission state is rendered from the Mission Engine.
 * Campaign never computes XP, progress, or rewards itself.
 */
export function CampaignDetail({ campaign }: { campaign: CampaignView }) {
  const navigate = useNavigate();
  const { state, isLoading: missionsLoading } = useCampaignMissions(
    campaign.slug,
  );

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/campaigns")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 transition-colors hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Campaigns
      </button>

      <div className="relative overflow-hidden rounded-[28px] shadow-lg">
        {campaign.banner_url ? (
          <img
            src={campaign.banner_url}
            alt=""
            className="h-56 w-full object-cover sm:h-72"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-[#bda752] to-[#8c7530] sm:h-72">
            <Megaphone size={40} className="text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="mb-2">
            <StatusBadge status={campaign.derivedStatus} />
          </div>
          <h1 className="text-2xl font-black leading-tight text-white sm:text-3xl">
            {campaign.title}
          </h1>
        </div>
      </div>

      {campaign.description && (
        <p className="text-[15px] leading-relaxed text-gray-600">
          {campaign.description}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-400">Status</p>
          <div className="mt-2">
            <StatusBadge status={campaign.derivedStatus} />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
            <CalendarDays size={14} />
            Duration
          </p>
          <p className="mt-2 text-sm font-bold text-gray-800">
            {formatDuration(campaign.campaign_start, campaign.campaign_end)}
          </p>
        </div>
      </div>

      <section className="rounded-3xl bg-gradient-to-br from-[#bda752] to-[#a8913f] p-5 text-white shadow-md">
        <p className="text-xs font-medium text-white/80">Time Remaining</p>
        <div className="mt-3">
          <Countdown timeRemainingMs={campaign.timeRemainingMs} variant="light" />
        </div>
      </section>

      <SponsorSection sponsorName={campaign.sponsor_name} />

      {campaign.sponsor_name && (
        <button
          type="button"
          onClick={() => navigate(`/campaigns/${campaign.slug}/analytics`)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#bda752]/30 bg-white px-5 py-3 font-bold text-[#bda752] shadow-sm transition hover:bg-amber-50 active:scale-[0.98]"
        >
          <BarChart3 size={18} />
          View Sponsor Analytics
        </button>
      )}

      {state.hasMissions && (
        <>
          <CampaignMissionCounter state={state} />
          <CampaignProgressSummary state={state} />

          <a
            href="#related-missions"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#bda752] px-5 py-3 font-bold text-white shadow-md transition hover:bg-[#a8913f] active:scale-[0.98]"
          >
            <Trophy size={18} />
            Explore {state.total} Missions
          </a>
        </>
      )}

      <section id="related-missions" className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <Trophy size={14} className="text-[#bda752]" />
            Related Missions
          </p>
          {state.hasMissions && (
            <span className="text-xs font-semibold text-gray-400">
              {state.completed}/{state.total}
            </span>
          )}
        </div>

        {missionsLoading ? (
          <p className="mt-3 text-sm text-gray-400">Loading missions…</p>
        ) : !state.hasMissions ? (
          <p className="mt-3 text-sm text-gray-400">
            No missions linked to this campaign yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {state.missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                progress={state.progressByMission.get(mission.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
