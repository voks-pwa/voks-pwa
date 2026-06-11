import { AZURACAST_BASE_URL, STATION_ID } from '@/lib/constants'
import type { AzuraCastNowPlayingResponse } from '@/types/azuracast'

export class AzuraCastApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AzuraCastApiError'
    this.status = status
  }
}

export async function fetchNowPlaying(
  stationId: number = STATION_ID,
): Promise<AzuraCastNowPlayingResponse> {
  const url = `${AZURACAST_BASE_URL}/nowplaying/${stationId}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new AzuraCastApiError(
      `Failed to fetch now playing data (${response.status})`,
      response.status,
    )
  }

  return response.json() as Promise<AzuraCastNowPlayingResponse>
}
