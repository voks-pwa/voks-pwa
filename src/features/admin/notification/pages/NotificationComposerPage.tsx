import { useState } from "react";
import { Send } from "lucide-react";
import { useSendNotification } from "../hooks/useAdminNotification";
import type { NotificationChannel } from "@/features/automation/types";

const CHANNELS: NotificationChannel[] = ["IN_APP", "PUSH", "EMAIL", "BROADCAST"];

export default function NotificationComposerPage() {
  const [channel, setChannel] = useState<NotificationChannel>("IN_APP");
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const send = useSendNotification();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-3xl font-black">Notification Composer</h1>

      <div className="max-w-2xl rounded-2xl border bg-white p-6">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as NotificationChannel)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
              User ID {channel === "BROADCAST" ? "(optional — omit for all)" : ""}
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={channel === "BROADCAST" ? "leave empty for broadcast" : "user uuid"}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">Deep Link (optional)</label>
            <input
              type="text"
              value={deepLink}
              onChange={(e) => setDeepLink(e.target.value)}
              placeholder="/missions/123"
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <button
            disabled={!title || !message || send.isPending}
            onClick={() => {
              if (!title || !message) return;
              if (channel !== "BROADCAST" && !userId) {
                setFeedback({ ok: false, msg: "User ID required for non-broadcast channel" });
                return;
              }
              send.mutate(
                { channel, userId: userId || undefined, title, message, deepLink: deepLink || undefined },
                {
                  onSuccess: (res) => {
                    if (res.success) {
                      setFeedback({ ok: true, msg: "Notification enqueued" });
                      setTitle("");
                      setMessage("");
                      setDeepLink("");
                    } else {
                      setFeedback({ ok: false, msg: res.error ?? "Failed" });
                    }
                  },
                  onError: (err) => setFeedback({ ok: false, msg: err.message }),
                },
              );
            }}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            <Send size={16} />
            {send.isPending ? "Sending..." : "Enqueue Notification"}
          </button>

          {feedback && (
            <p className={`text-sm ${feedback.ok ? "text-green-600" : "text-red-600"}`}>{feedback.msg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
