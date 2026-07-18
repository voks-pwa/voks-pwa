import { Clock, Zap, Star, Shield, AlertCircle, AlertTriangle, RotateCcw, Calendar } from "lucide-react";
import type { CampaignTimelineEvent } from "../types";

const EVENT_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  started: { icon: Zap, color: "text-emerald-600", bg: "bg-emerald-100", label: "Started" },
  ended: { icon: AlertCircle, color: "text-slate-600", bg: "bg-slate-100", label: "Ended" },
  ending_soon: { icon: Zap, color: "text-amber-600", bg: "bg-amber-100", label: "Ending Soon" },
  archived: { icon: Shield, color: "text-gray-600", bg: "bg-gray-100", label: "Archived" },
  featured: { icon: Star, color: "text-amber-600", bg: "bg-amber-100", label: "Featured" },
  priority_changed: { icon: AlertTriangle, color: "text-indigo-600", bg: "bg-indigo-100", label: "Priority Changed" },
  synced: { icon: RotateCcw, color: "text-blue-600", bg: "bg-blue-100", label: "Synced" },
  moderated: { icon: Shield, color: "text-purple-600", bg: "bg-purple-100", label: "Moderated" },
  created: { icon: Calendar, color: "text-gray-600", bg: "bg-gray-100", label: "Created" },
};

export function CampaignTimeline({ events }: { events: CampaignTimelineEvent[] }) {
  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4">
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">No timeline events recorded</p>
          <p className="text-sm text-gray-400">Events will appear as the campaign progresses</p>
        </div>
      ) : (
        <dl className="space-y-4">
          {sortedEvents.map((event) => {
            const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG.created;
            const Icon = config.icon;
            return (
              <div key={event.id} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: config.bg }}>
                  <Icon className="h-5 w-5" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <dt className="text-sm font-semibold text-gray-900">{config.label}</dt>
                    <dd className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </dd>
                  </div>
                  <dd className="mt-1 text-sm text-gray-600">{event.description}</dd>
                </div>
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}