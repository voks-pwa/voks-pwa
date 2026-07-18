import { useEffect } from "react";

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

export function AudioPlayerCard() {

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

}