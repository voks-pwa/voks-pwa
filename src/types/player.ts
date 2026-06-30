export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export interface PlayerState {
  status: PlayerStatus
  isPlaying: boolean
  volume: number
  lastVolume: number
  streamUrl: string | null
  error: string | null
}

export interface PlayerActions {
userId: string | null
setUserId: (userId: string) => void
  setStreamUrl: (url: string) => void
  play: () => void
  pause: () => void
  toggle: () => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setStatus: (status: PlayerStatus) => void
  setError: (error: string | null) => void
  listenTick: () => void
  disconnect: () => void
  stop: () => void
}

export type PlayerStore = PlayerState & PlayerActions
