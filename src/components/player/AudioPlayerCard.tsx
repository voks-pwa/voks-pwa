import { memo, useEffect, useState } from "react";

import { ListenerCount } from "@/components/player/ListenerCount";
import { LiveStatusBadge } from "@/components/player/LiveStatusBadge";
import { PlayPauseButton } from "@/components/player/PlayPauseButton";
import { SongArtwork } from "@/components/player/SongArtwork";
import { VolumeControls } from "@/components/player/VolumeControls";

import { getDisplayTrack } from "@/lib/now-playing";

import { useNowPlaying } from "@/hooks/use-now-playing";
import { useSongUpdate } from "@/hooks/use-song-update";
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

  const { data: songUpdate } = useSongUpdate();

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
    getDisplayTrack(data, songUpdate);

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
        className={`group relative flex w-full flex-col gap-0 overflow-hidden rounded-[28px] border bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08)] transition-all duration-700 ${
          showHighlight
            ? "border-[#bda752]/40 shadow-[0_0_0_1px_rgba(189,167,82,0.15),0_16px_40px_rgba(189,167,82,0.2)]"
            : "border-black/[0.06]"
        }`}
      >
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#bda752]/40 to-transparent opacity-60" />
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#bda752]/[0.06] to-[#5B5B3F]/[0.04] blur-2xl" />

        <div className="relative flex items-center justify-between px-5 pb-0 pt-3">
          <div className="flex items-center gap-2">
            <LiveStatusBadge isOnline={isOnline} isLive={displayTrack.isLive} />
            {isPlaying && !isError && (
              <span className="hidden items-center gap-1 sm:inline-flex">
                <span className="flex gap-[2px]">
                  <span className="h-2.5 w-[2px] animate-[equalizer_0.8s_ease-in-out_infinite] rounded-full bg-[#bda752]" />
                  <span className="h-2.5 w-[2px] animate-[equalizer_0.8s_0.2s_ease-in-out_infinite] rounded-full bg-[#bda752]" />
                  <span className="h-2.5 w-[2px] animate-[equalizer_0.8s_0.4s_ease-in-out_infinite] rounded-full bg-[#bda752]" />
                </span>
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {listenerCount.toLocaleString()} listeners
          </span>
        </div>

        <div className="relative flex items-center gap-4 px-5 py-4">
          <div className="relative h-[56px] w-[56px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]">
            <img src={programArtwork} alt="" className="h-full w-full object-cover" loading="eager" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5" />
            {isPlaying && <div className="absolute inset-0 rounded-2xl ring-2 ring-[#bda752]/30" />}
            {isPlaying && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#bda752]/10 via-transparent to-transparent" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#bda752]">Now Playing</p>
            <h2 className="mt-0.5 truncate text-[15px] font-bold leading-tight tracking-tight text-gray-900">
              {isError ? "Unable to load station" : displayTrack.title}
            </h2>
            <p className="truncate text-[13px] font-medium text-gray-500">
              {isError ? "Check your connection" : displayTrack.artist}
            </p>
            {currentProgram && !isError && (
              <p className="mt-1 truncate text-[11px] text-gray-400">{currentProgram.title.rendered}</p>
            )}
          </div>

          <button
            type="button"
            onClick={toggle}
            disabled={!streamUrl || !isOnline || isError || status === "loading" || isLoading}
            aria-label={isPlaying ? "Pause stream" : "Play stream"}
            className="relative flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-[#bda752] text-white shadow-[0_8px_20px_rgba(189,167,82,0.35),0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_12px_24px_rgba(189,167,82,0.4)] active:scale-[0.97] disabled:opacity-50 disabled:shadow-none"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent" />
            {status === "loading" || isLoading ? (
              <span className="relative h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/30 border-t-white" />
            ) : isPlaying ? (
              <svg viewBox="0 0 24 24" className="relative h-[22px] w-[22px] fill-white">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="relative ml-0.5 h-[22px] w-[22px] fill-white">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>
        </div>

        <div className="relative flex items-center gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-3">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={volume === 0 ? "Unmute" : "Mute"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-black/5 transition hover:text-gray-700"
          >
            {volume === 0 ? (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 9v6h4l3 3V6l-3 3H9z" />
                <path d="M16 8l4 8M20 8l-4 8" />
              </svg>
            ) : volume < 0.5 ? (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
          <div className="relative flex-1">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#bda752] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#bda752] [&::-webkit-slider-thumb]:shadow-sm"
              aria-label="Volume"
              style={{
                background: `linear-gradient(to right, #bda752 0%, #bda752 ${Math.round(volume * 100)}%, #e5e7eb ${Math.round(volume * 100)}%, #e5e7eb 100%)`,
              }}
            />
          </div>
          <span className="w-9 text-right text-[11px] font-semibold tabular-nums text-gray-500">{Math.round(volume * 100)}%</span>
        </div>

        <style>{`@keyframes equalizer{0%,100%{transform:scaleY(0.5)}50%{transform:scaleY(1)}}`}</style>
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