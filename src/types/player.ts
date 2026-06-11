export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error'

export interface PlayerState {
  status: PlayerStatus
  isPlaying: boolean
  volume: number
  streamUrl: string | null
  error: string | null
}

export interface PlayerActions {
  setStreamUrl: (url: string) => void
  play: () => void
  pause: () => void
  toggle: () => void
  setVolume: (volume: number) => void
  setStatus: (status: PlayerStatus) => void
  setError: (error: string | null) => void
}

export type PlayerStore = PlayerState & PlayerActions
