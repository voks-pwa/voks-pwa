import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useNowPlaying } from "@/hooks/use-now-playing";
import { LIVE_HLS_URL } from "@/lib/constants";

export function LiveStudioPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { data: nowPlaying } = useNowPlaying();
  const [streamError, setStreamError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setStreamError(false);

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) setStreamError(true);
      });
      hls.loadSource(LIVE_HLS_URL);
      hls.attachMedia(video);
      return () => hls.destroy();
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const onError = () => setStreamError(true);
      video.addEventListener("error", onError);
      video.src = LIVE_HLS_URL;
      return () => video.removeEventListener("error", onError);
    }

    setStreamError(true);
  }, []);

  const isOnline = nowPlaying?.is_online ?? false;
  const listenerCount = nowPlaying?.listeners?.current ?? 0;

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

      {streamError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/80 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-white/70">
            Live stream tidak tersedia
          </span>
          <span className="text-[11px] text-white/40">Coba lagi nanti</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-red-500 animate-pulse" : "bg-gray-500"}`} />
          <span className="text-xs font-bold text-white">
            {isOnline ? "LIVE" : "OFFLINE"}
          </span>
          {isOnline && listenerCount > 0 && (
            <span className="text-xs font-semibold text-white/80">
              {listenerCount} listeners
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
