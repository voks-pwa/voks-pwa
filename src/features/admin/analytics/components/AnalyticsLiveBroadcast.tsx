import { Radio, Users, Mic, Activity } from "lucide-react";

import type { NowPlayingData } from "../types/analytics";

interface AnalyticsLiveBroadcastProps {
  nowplaying: NowPlayingData | null;
  isLoading: boolean;
}

export function AnalyticsLiveBroadcast({ nowplaying, isLoading }: AnalyticsLiveBroadcastProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
          <Radio size={20} className="text-[#bda752]" />
          Live Broadcast
        </h3>
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  }

  if (!nowplaying) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
          <Radio size={20} className="text-[#bda752]" />
          Live Broadcast
        </h3>
        <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-500">
          <Activity size={18} className="shrink-0" />
          <span>AzuraCast nowplaying data unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black">
        <Radio size={20} className="text-[#bda752]" />
        Live Broadcast
      </h3>

      <div className={`rounded-2xl p-5 ${nowplaying.isLive ? "bg-green-50" : "bg-gray-50"}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-full ${nowplaying.isLive ? "bg-green-500" : "bg-gray-400"}`} />
            <span className={`text-sm font-bold ${nowplaying.isLive ? "text-green-700" : "text-gray-500"}`}>
              {nowplaying.isLive ? "LIVE" : "OFFLINE"}
            </span>
          </div>
          <span className="text-xs text-gray-400">{nowplaying.bitrate > 0 ? `${nowplaying.bitrate} kbps` : ""}</span>
        </div>

        <div className="mb-3">
          <p className="text-xs text-gray-500">Now Playing</p>
          <p className="text-xl font-black text-gray-800">{nowplaying.songTitle || "—"}</p>
          {nowplaying.songArtist && (
            <p className="text-sm text-gray-500">{nowplaying.songArtist}</p>
          )}
        </div>

        {nowplaying.streamerName && (
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
            <Mic size={14} />
            <span>{nowplaying.streamerName}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={14} />
          <span>{(nowplaying.listeners ?? 0).toLocaleString()} listeners</span>
        </div>
      </div>
    </div>
  );
}
