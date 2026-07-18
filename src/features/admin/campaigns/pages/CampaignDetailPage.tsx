import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  Eye,
  BarChart3,
  HeartPulse,
  Clock,
  History,
  Shield,
  AlertCircle,
  Star,
  Zap,
  TrendingUp,
} from "lucide-react";
import {
  useAdminCampaign,
  useCampaignMissions,
  useCampaignTimeline,
  useToggleFeatured,
  useUpdatePriority,
} from "../hooks/useAdminCampaigns";
import { deriveCampaignStatus, isCampaignVisible, isEndingSoon, isArchived } from "@/features/campaigns/services/campaignStatus";
import type { CampaignTab, CampaignStatus } from "../types";
import { CampaignPreview } from "../components/CampaignPreview";
import { CampaignTimeline } from "../components/CampaignTimeline";
import { CampaignHealth } from "../components/CampaignHealth";
import { CampaignAnalyticsView } from "../components/CampaignAnalyticsView";
import { CampaignModeration } from "../components/CampaignModeration";

const TABS: { id: CampaignTab; label: string; icon: typeof Eye; description: string }[] = [
  { id: "overview", label: "Overview", icon: Eye, description: "Campaign details & status" },
  { id: "analytics", label: "Analytics", icon: BarChart3, description: "Performance metrics" },
  { id: "health", label: "Health", icon: HeartPulse, description: "Automation health check" },
  { id: "preview", label: "Preview", icon: Eye, description: "User-facing preview" },
  { id: "timeline", label: "Timeline", icon: History, description: "Lifecycle events" },
  { id: "moderation", label: "Moderation", icon: Shield, description: "Admin actions" },
];

function StatusBadge({ status }: { status: CampaignStatus }) {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    draft: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
    scheduled: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    running: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    paused: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    completed: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    expired: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    archived: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
    upcoming: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    ending_soon: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
    ended: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    hidden: { bg: "bg-gray-100", text: "text-gray-400", dot: "bg-gray-300" },
    inactive: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  };
  const labels: Record<string, string> = {
    draft: "Draft",
    scheduled: "Scheduled",
    running: "Live",
    paused: "Paused",
    completed: "Completed",
    expired: "Expired",
    archived: "Archived",
    upcoming: "Upcoming",
    ending_soon: "Ending Soon",
    ended: "Ended",
    hidden: "Hidden",
    inactive: "Inactive",
  };
  const c = colors[status] ?? colors.hidden;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${c.bg} ${c.text}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {labels[status] ?? status}
    </span>
  );
}

export function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<CampaignTab>("overview");
  const toggleFeatured = useToggleFeatured();
  const updatePriority = useUpdatePriority();

  const { data: campaign, isLoading, error, refetch } = useAdminCampaign(slug);
  const { data: missions } = useCampaignMissions(slug);
  const { data: timeline } = useCampaignTimeline(campaign ?? null);

  const derivedStatus = campaign ? deriveCampaignStatus(campaign) : "hidden";
  const visible = campaign ? isCampaignVisible(derivedStatus) : false;
  const endingSoon = campaign ? isEndingSoon(campaign) : false;
  const archived = campaign ? isArchived(campaign) : false;

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="animate-pulse h-8 bg-gray-100 rounded w-1/4" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse h-16 bg-gray-100 rounded" />
        ))}
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-8 text-center text-red-500">
        <AlertCircle className="mx-auto h-12 w-12" />
        <p className="mt-2">Campaign not found</p>
        <button onClick={() => refetch()} className="mt-4 text-sm text-[#bda752] hover:underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-xl hover:bg-gray-100 transition" onClick={() => window.history.back()}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black">{campaign.title}</h1>
              <StatusBadge status={derivedStatus} />
              {campaign.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                  <Star className="h-3 w-3" />
                  Featured
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">Slug: {campaign.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Zap className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Visibility</p>
              <p className="text-xl font-black text-gray-900">{visible ? "Visible" : "Hidden"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ending Soon</p>
              <p className="text-xl font-black text-gray-900">{endingSoon ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Archived</p>
              <p className="text-xl font-black text-gray-900">{archived ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Priority</p>
              <p className="text-xl font-black text-gray-900">{campaign.priority ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
              <Eye className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Missions</p>
              <p className="text-xl font-black text-gray-900">{missions?.length ?? 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100">
          <nav className="flex overflow-x-auto -mb-px" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-t-xl px-5 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-white text-[#bda752] border-b-2 border-[#bda752]"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="mt-2 text-gray-900">{campaign.description ?? "No description"}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">Sponsor</p>
                  <p className="mt-2 text-gray-900">{campaign.sponsor_name ?? "—"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">Campaign Type</p>
                  <p className="mt-2 capitalize text-gray-900">{campaign.campaign_type ?? "sponsored"}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="mt-2 text-gray-900">{campaign.campaign_start ? new Date(campaign.campaign_start).toLocaleDateString() : "—"}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="mt-2 text-gray-900">{campaign.campaign_end ? new Date(campaign.campaign_end).toLocaleDateString() : "Ongoing"}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-gray-50 p-5">
                  <p className="text-sm font-medium text-gray-500">Banner URL</p>
                  <p className="mt-2 text-sm text-gray-600 break-all">{campaign.banner_url ?? "No banner"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <CampaignAnalyticsView campaignSlug={campaign.slug} />
          )}

          {activeTab === "health" && (
            <CampaignHealth />
          )}

          {activeTab === "preview" && (
            <CampaignPreview campaign={campaign} />
          )}

          {activeTab === "timeline" && (
            <CampaignTimeline events={timeline ?? []} />
          )}

          {activeTab === "moderation" && (
            <CampaignModeration
              campaign={campaign}
              toggleFeatured={toggleFeatured}
              updatePriority={updatePriority}
            />
          )}
        </div>
      </div>
    </div>
  );
}