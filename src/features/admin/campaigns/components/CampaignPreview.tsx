import { Eye, Smartphone, Monitor, X, Star, Zap, Calendar, Flag } from "lucide-react";
import { useState } from "react";
import type { AdminCampaign } from "../types";
import { deriveCampaignStatus, isCampaignVisible, isEndingSoon } from "@/features/campaigns/services/campaignStatus";

const DEVICE_PRESETS = [
  { id: "mobile", label: "Mobile", width: 375, icon: Smartphone },
  { id: "tablet", label: "Tablet", width: 768, icon: Monitor },
  { id: "desktop", label: "Desktop", width: 1024, icon: Monitor },
];

export function CampaignPreview({ campaign }: { campaign: AdminCampaign }) {
  const [device, setDevice] = useState(DEVICE_PRESETS[0]);
  const [showPreview, setShowPreview] = useState(false);

  const derivedStatus = deriveCampaignStatus(campaign);
  const visible = isCampaignVisible(derivedStatus);
  const endingSoon = isEndingSoon(campaign);

  const openPreview = () => setShowPreview(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Campaign Preview</h3>
          <p className="text-sm text-gray-500">See how this campaign appears to users</p>
        </div>
        <button onClick={openPreview} className="rounded-lg bg-[#bda752] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a8913f]">
          <Eye className="h-4 w-4 mr-2" />
          Open Full Preview
        </button>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                {DEVICE_PRESETS.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDevice(d)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition ${device.id === d.id ? "bg-[#bda752] text-white" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowPreview(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className={`mx-auto max-h-[70vh] overflow-auto ${device.id === "mobile" ? "max-w-sm" : device.id === "tablet" ? "max-w-md" : "max-w-lg"}`}>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#bda752] to-[#a8913f] p-6 text-white">
              {campaign.banner_url && (
                <img src={campaign.banner_url} alt={campaign.title} className="absolute inset-0 h-full w-full object-cover opacity-30" loading="lazy" />
              )}
              <div className="relative">
                {campaign.sponsor_name && (
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                    {campaign.sponsor_name}
                  </span>
                )}
                <h1 className="mt-3 text-2xl font-black sm:text-3xl">{campaign.title}</h1>
                {campaign.description && (
                  <p className="mt-2 max-w-xl text-sm text-white/90">{campaign.description}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${visible ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                    {visible ? "Visible" : "Hidden"}
                  </span>
                  {endingSoon && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
                      <Zap className="h-3 w-3" />
                      Ending Soon
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Status</p>
                  <p className="mt-1 font-bold text-gray-900 capitalize">{derivedStatus.replace("_", " ")}</p>
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Visibility</p>
                  <p className="mt-1 font-bold text-gray-900">{visible ? "Public" : "Hidden"}</p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">Schedule</p>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {campaign.campaign_start ? new Date(campaign.campaign_start).toLocaleDateString() : "No start"}
                    {" → "}
                    {campaign.campaign_end ? new Date(campaign.campaign_end).toLocaleDateString() : "Ongoing"}
                  </span>
                </div>
              </div>

              {campaign.sponsor_name && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">Sponsor</p>
                  <p className="mt-1 font-bold text-gray-900">{campaign.sponsor_name}</p>
                </div>
              )}

              {campaign.featured && (
                <div className="rounded-xl bg-amber-50 p-4 border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700">
                    <Star className="h-5 w-5" />
                    <span className="font-bold">Featured Campaign</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#bda752] px-5 py-3 font-bold text-white transition hover:bg-[#a8913f]">
                  <Flag className="h-4 w-4" />
                  Join Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}