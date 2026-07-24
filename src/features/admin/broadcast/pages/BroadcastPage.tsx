import { useState } from "react";
import {
  Send,
  Megaphone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Upload,
  Calendar,
} from "lucide-react";

import { useBroadcasts } from "../hooks/useBroadcast";
import { useWPNotifications } from "../hooks/useBroadcastWP";

import type { BroadcastFormData, BroadcastType, BroadcastPriority, BroadcastAudience } from "../types/broadcast";

type Tab = "create" | "import" | "history";

export function BroadcastPage() {
  const [tab, setTab] = useState<Tab>("create");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<BroadcastType>("broadcast");
  const [priority, setPriority] = useState<BroadcastPriority>("Normal");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [deepLink, setDeepLink] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [historyFilter, setHistoryFilter] = useState<"all" | "sent" | "pending">("all");

  const {
    broadcasts,
    isLoading,
    error,
    create,
    isCreating,
    send,
    isSending,
  } = useBroadcasts();

  const {
    data: wpNotifications,
    isLoading: wpLoading,
  } = useWPNotifications();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: BroadcastFormData = {
      title,
      message,
      type,
      priority,
      audience,
      deep_link: deepLink || undefined,
      scheduled_at: scheduledAt || undefined,
    };

    await create(data);
    setTitle("");
    setMessage("");
    setDeepLink("");
    setScheduledAt("");
  };

  const handleImport = async (wp: NonNullable<typeof wpNotifications>[number]) => {
    const stripped = wp.content.replace(/<[^>]*>/g, "").trim();
    await create({
      title: wp.title,
      message: stripped.substring(0, 500) || "(no content)",
      type: "announcement",
      priority: "Normal",
      audience: "all",
      image_url: wp.featured_image?.source_url,
    });
  };

  const priorityIcon = (p: BroadcastPriority) => {
    switch (p) {
      case "Critical":
        return <AlertTriangle size={14} className="text-red-500" />;
      case "Important":
        return <AlertTriangle size={14} className="text-orange-500" />;
      default:
        return null;
    }
  };

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (historyFilter === "sent") return !!b.sent_at;
    if (historyFilter === "pending") return !b.sent_at;
    return true;
  });

  if (isLoading) {
    return <div className="flex h-52 items-center justify-center">Loading broadcasts...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Failed to load broadcasts.</div>;
  }

  const tabs: { key: Tab; label: string; icon: typeof Send }[] = [
    { key: "create", label: "Create", icon: Send },
    { key: "import", label: "Import WP", icon: Download },
    { key: "history", label: "History", icon: Clock },
  ];

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Broadcast</h1>
          <p className="text-gray-500">Send notifications to users</p>
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "bg-[#bda752] text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "create" && (
        <div className="grid gap-8 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752]"
                  placeholder="e.g. New Mission Available"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752]"
                  placeholder="Write your notification message..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as BroadcastType)}
                    className="w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752]"
                  >
                    <option value="broadcast">Broadcast</option>
                    <option value="announcement">Announcement</option>
                    <option value="promotion">Promotion</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as BroadcastPriority)}
                    className="w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as BroadcastAudience)}
                    className="w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752]"
                  >
                    <option value="all">All Users</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      Schedule (optional)
                    </span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-600">Deep Link (optional)</label>
                <input
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  className="w-full rounded-xl border bg-gray-50 px-4 py-3 outline-none focus:border-[#bda752] focus:ring-1 focus:ring-[#bda752]"
                  placeholder="e.g. /missions/123"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#bda752] px-6 py-3 font-bold text-white transition hover:bg-[#a8933e] disabled:opacity-50"
              >
                <Send size={18} />
                {isCreating ? "Creating..." : scheduledAt ? "Schedule Broadcast" : "Create Broadcast"}
              </button>
            </form>
          </div>

          <div className="xl:col-span-3">
            <h2 className="mb-4 text-xl font-black">
              Sent Broadcasts ({broadcasts.length})
            </h2>

            <div className="space-y-3">
              {broadcasts.length === 0 && (
                <p className="py-12 text-center text-gray-400">No broadcasts sent yet.</p>
              )}

              {broadcasts.map((b) => (
                <div
                  key={b.id}
                  className="flex items-start justify-between rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      {b.sent_at ? (
                        <CheckCircle2 size={16} className="text-green-500" />
                      ) : b.scheduled_at ? (
                        <Calendar size={16} className="text-blue-500" />
                      ) : (
                        <Clock size={16} className="text-gray-400" />
                      )}

                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {b.type}
                      </span>

                      {priorityIcon(b.priority)}

                      {b.priority !== "Normal" && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            b.priority === "Critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {b.priority}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold">{b.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{b.message}</p>

                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                      <span>audience: {b.audience}</span>
                      <span>{b.profiles?.display_name ?? "unknown"}</span>
                      {b.scheduled_at && !b.sent_at && (
                        <span>Scheduled {new Date(b.scheduled_at).toLocaleString()}</span>
                      )}
                      {b.sent_at ? (
                        <span>Sent {new Date(b.sent_at).toLocaleDateString()}</span>
                      ) : !b.scheduled_at ? (
                        <span>Created {new Date(b.created_at).toLocaleDateString()}</span>
                      ) : null}
                    </div>
                  </div>

                  {!b.sent_at && (
                    <button
                      onClick={() => send(b.id)}
                      disabled={isSending}
                      className="ml-4 flex shrink-0 items-center gap-2 rounded-xl bg-[#bda752] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#a8933e] disabled:opacity-50"
                    >
                      <Megaphone size={16} />
                      {isSending ? "..." : "Send"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "import" && (
        <div>
          <h2 className="mb-4 text-xl font-black">
            WordPress Notifications
          </h2>

          {wpLoading && <div className="py-8 text-center text-gray-400">Loading WordPress notifications...</div>}

          {!wpLoading && (!wpNotifications || wpNotifications.length === 0) && (
            <p className="py-12 text-center text-gray-400">No WordPress notifications found.</p>
          )}

          <div className="space-y-3">
            {wpNotifications?.map((wp) => (
              <div
                key={wp.wp_id}
                className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm"
              >
                {wp.featured_image && (
                  <img
                    src={wp.featured_image.source_url}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{wp.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {wp.excerpt.replace(/<[^>]*>/g, "")}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(wp.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleImport(wp)}
                  className="flex shrink-0 items-center gap-2 rounded-xl bg-[#bda752] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#a8933e]"
                >
                  <Upload size={16} />
                  Import
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black">
              Broadcast History ({filteredBroadcasts.length})
            </h2>
            <div className="flex gap-2">
              {(["all", "sent", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    historyFilter === f
                      ? "bg-[#bda752] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredBroadcasts.length === 0 && (
              <p className="py-12 text-center text-gray-400">No broadcasts in this view.</p>
            )}

            {filteredBroadcasts.map((b) => (
              <div
                key={b.id}
                className="flex items-start justify-between rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    {b.sent_at ? (
                      <CheckCircle2 size={16} className="text-green-500" />
                    ) : (
                      <Clock size={16} className="text-gray-400" />
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {b.type}
                    </span>
                    {priorityIcon(b.priority)}
                    {b.priority !== "Normal" && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          b.priority === "Critical"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {b.priority}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{b.audience}</span>
                  </div>

                  <h3 className="font-bold">{b.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{b.message}</p>

                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span>by {b.profiles?.display_name ?? "unknown"}</span>
                    {b.sent_at ? (
                      <span>Sent {new Date(b.sent_at).toLocaleString()}</span>
                    ) : (
                      <span>Created {new Date(b.created_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                {!b.sent_at && (
                  <button
                    onClick={() => send(b.id)}
                    disabled={isSending}
                    className="ml-4 flex shrink-0 items-center gap-2 rounded-xl bg-[#bda752] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#a8933e] disabled:opacity-50"
                  >
                    <Megaphone size={16} />
                    {isSending ? "..." : "Send"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
