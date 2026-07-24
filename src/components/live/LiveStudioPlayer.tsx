import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { useOwncastStatus } from "@/hooks/useOwncastStatus";

const STREAM_URL = "https://live.voksradio.com/hls/stream.m3u8";

export function LiveStudioPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: status } = useOwncastStatus();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(STREAM_URL);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = STREAM_URL;
    }
  }, []);

  const isOnline = status?.online ?? false;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black shadow-xl">
      <video
        ref={videoRef}
        controls
        playsInline
        autoPlay
        muted
        className="aspect-video w-full"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
          <span className="text-xs font-bold text-white">
            {isOnline ? "LIVE" : "OFFLINE"}
          </span>
        </div>
      </div>
    </div>
  );
}