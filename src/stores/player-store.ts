import { create } from 'zustand'
import type { PlayerStatus, PlayerStore } from '@/types/player'

const VOLUME_STORAGE_KEY = 'voks-player-volume'

type PersistedVolumeState = {
  volume: number
  lastVolume: number
}

const getInitialVolumeState = (): PersistedVolumeState => {
  if (typeof window === 'undefined') {
    return { volume: 1, lastVolume: 1 }
  }

  const storedValue = window.localStorage.getItem(VOLUME_STORAGE_KEY)
  if (!storedValue) {
    return { volume: 1, lastVolume: 1 }
  }

  try {
    const parsed = JSON.parse(storedValue) as PersistedVolumeState
    if (
      typeof parsed.volume === 'number' &&
      typeof parsed.lastVolume === 'number' &&
      parsed.volume >= 0 &&
      parsed.volume <= 1 &&
      parsed.lastVolume >= 0 &&
      parsed.lastVolume <= 1
    ) {
      return parsed
    }
  } catch {
    const fallback = Number(storedValue)
    if (Number.isFinite(fallback) && fallback >= 0 && fallback <= 1) {
      return { volume: fallback, lastVolume: fallback > 0 ? fallback : 1 }
    }
  }

  return { volume: 1, lastVolume: 1 }
}

const initialVolumeState = getInitialVolumeState()

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  status: 'idle',
  isPlaying: false,
  volume: initialVolumeState.volume,
  lastVolume: initialVolumeState.lastVolume,
  streamUrl: null,
  error: null,

  setStreamUrl: (url) => set({ streamUrl: url, error: null }),

  play: () => set({ isPlaying: true, status: 'playing', error: null }),

  pause: () => set({ isPlaying: false, status: 'paused' }),

  toggle: () => {
    const { isPlaying } = get()
    if (isPlaying) {
      get().pause()
    } else {
      get().play()
    }
  },

  setVolume: (volume) => {
    const clippedVolume = Math.min(1, Math.max(0, volume))
    const nextState = {
      volume: clippedVolume,
      lastVolume: clippedVolume > 0 ? clippedVolume : get().lastVolume,
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(nextState))
    }

    set(nextState)
  },

  toggleMute: () => {
    const { volume, lastVolume } = get()
    const nextVolume = volume === 0 ? lastVolume || 1 : 0
    const nextState = {
      volume: nextVolume,
      lastVolume: nextVolume > 0 ? nextVolume : lastVolume,
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(VOLUME_STORAGE_KEY, JSON.stringify(nextState))
    }

    set(nextState)
  },

  setStatus: (status) => set({ status }),

  setError: (error) =>
    set({
      error,
      status: error ? 'error' : get().status,
      isPlaying: error ? false : get().isPlaying,
    }),
}))
