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