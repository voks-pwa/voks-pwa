import { create } from 'zustand'
import type { PlayerStatus, PlayerStore } from '@/types/player'

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  status: 'idle',
  isPlaying: false,
  volume: 1,
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

  setVolume: (volume) =>
    set({ volume: Math.min(1, Math.max(0, volume)) }),

  setStatus: (status: PlayerStatus) => set({ status }),

  setError: (error) =>
    set({
      error,
      status: error ? 'error' : get().status,
      isPlaying: error ? false : get().isPlaying,
    }),
}))
