import { memo, useEffect, useState } from "react";

import { ListenerCount } from "@/components/player/ListenerCount";
import { LiveStatusBadge } from "@/components/player/LiveStatusBadge";
import { PlayPauseButton } from "@/components/player/PlayPauseButton";
import { SongArtwork } from "@/components/player/SongArtwork";
import { VolumeControls } from "@/components/player/VolumeControls";

import { getDisplayTrack } from "@/lib/now-playing";

import { useNowPlaying } from "@/hooks/use-now-playing";
import { useCurrentProgram } from "@/hooks/useCurrentProgram";

import { usePlayerStore } from "@/stores/player-store";

import fallbackCover from "@/assets/branding/voks-vinyl-cover.jpg";

import { useAuth } from "@/features/auth/useAuth";

import {
  useListenMission,
} from "@/features/missions/hooks/useListenMission";

export const AudioPlayerCard = memo(function AudioPlayerCard({
  compact,
  highlight,
}: {
  compact?: boolean
  highlight?: boolean
} = {}) {

  const [showHighlight, setShowHighlight] = useState(highlight)

  useEffect(() => {
    if (!highlight) return
    const timer = setTimeout(() => setShowHighlight(false), 3000)
    return () => clearTimeout(timer)
  }, [highlight])

  const {
    data,
    isLoading,
    isError,
  } = useNowPlaying();

  const {
    user,
  } = useAuth();

  const isPlaying =
    usePlayerStore(
      state => state.isPlaying
    );

  const status =
    usePlayerStore(
      state => state.status
    );

  const toggle =
    usePlayerStore(
      state => state.toggle
    );

  useListenMission(
    user?.id,
    isPlaying
  );

  const displayTrack =
    getDisplayTrack(data);

  const streamUrl =
    data?.station.listen_url;

  const listenerCount =
    data?.listeners.current ?? 0;

  const isOnline =
    data?.is_online ?? false;

  const setStreamUrl =
    usePlayerStore(
      state => state.setStreamUrl
    );

  const currentProgram =
    useCurrentProgram();

  const programArtwork =
    currentProgram?._embedded?.[
      "wp:featuredmedia"
    ]?.[0]?.media_details?.sizes
      ?.medium_large?.source_url ??
    currentProgram?._embedded?.[
      "wp:featuredmedia"
    ]?.[0]?.source_url ??
    fallbackCover;

  useEffect(() => {

    if (streamUrl) {

      setStreamUrl(streamUrl);

    }

  }, [
    streamUrl,
    setStreamUrl,
  ]);

  const volume =
    usePlayerStore(
      state => state.volume
    );

  const setVolume =
    usePlayerStore(
      state => state.setVolume
    );

  const toggleMute =
    usePlayerStore(
      state => state.toggleMute
    );

  if (compact) {
    return (
      <section
        aria-label="Audio Player"
        className={`flex w-full items-center gap-4 rounded-3xl border bg-white p-4 shadow-sm transition-all duration-1000 ${
          showHighlight
            ? "border-[#bda752] shadow-[0_0_24px_rgba(189,167,82,0.4)]"
            : "border-black/5"
        }`}
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl shadow-md">
          <img
            src={programArtwork}
            alt=""
            className="h-full w-full object-cover"
          />
          {isPlaying && (
            <div className="absolute inset-0 rounded-2xl ring-2 ring-[#bda752]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <LiveStatusBadge
              isOnline={isOnline}
              isLive={displayTrack.isLive}
            />
            <span className="text-xs text-gray-400">
              {listenerCount.toLocaleString()} listeners
            </span>
          </div>
          <h2 className="mt-1 truncate text-base font-bold text-gray-900">
            {isError ? "Unable to load station" : displayTrack.title}
          </h2>
          <p className="truncate text-sm text-gray-500">
            {isError ? "Check your connection" : displayTrack.artist}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={volume === 0 ? "Unmute" : "Mute"}
              className="flex h-6 w-6 shrink-0 items-center justify-center text-gray-400 transition hover:text-gray-600"
            >
              {volume === 0 ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 9v6h4l3 3V6l-3 3H9z" />
                  <path d="M18 6l-6 6 6 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-[#bda752]"
              aria-label="Volume"
            />
            <span className="w-8 text-right text-xs text-gray-400 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={!streamUrl || !isOnline || isError || status === "loading" || isLoading}
          aria-label={isPlaying ? "Pause stream" : "Play stream"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#bda752] text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {status === "loading" || isLoading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-3 border-white/30 border-t-white" />
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-white">
              <path d="M8 5v14l11-7L8 5z" />
            </svg>
          )}
        </button>
      </section>
    );
  }

  return (

    <section
      aria-label="Audio Player"
      className="
        flex
        w-full
        flex-col
        items-center
        gap-8
        rounded-3xl
        border
        border-black/5
        bg-white
        p-8
        shadow-sm
      "
    >

      <LiveStatusBadge
        isOnline={isOnline}
        isLive={displayTrack.isLive}
      />

      <SongArtwork
        artworkUrl={programArtwork}
        title={
          currentProgram?.title.rendered ??
          displayTrack.title
        }
        isPlaying={isPlaying}
      />

      <div className="w-full text-center">

        <h1 className="text-xl font-bold text-text sm:text-2xl">

          {
            isError
              ? "Unable to load station"
              : displayTrack.title
          }

        </h1>

        <p className="mt-1 text-base text-secondary">

          {
            isError
              ? "Check your connection"
              : displayTrack.artist
          }

        </p>

      </div>

      <ListenerCount
        count={listenerCount}
      />

      <VolumeControls
        volume={volume}
        onChange={setVolume}
        onToggleMute={toggleMute}
      />

      {/* PLAYER BUTTON */}

      <div className="flex justify-center pt-2">

        <PlayPauseButton
          isPlaying={isPlaying}
          isLoading={
            status === "loading" ||
            isLoading
          }
          disabled={
            !streamUrl ||
            !isOnline ||
            isError
          }
          onClick={toggle}
        />

      </div>

    </section>

  );

})