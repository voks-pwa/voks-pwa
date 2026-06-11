import {
  AZURACAST_BASE_URL,
  STATION_ID,
  VOKS_STREAM_URL,
} from '@/lib/constants'
import type { AzuraCastNowPlayingResponse } from '@/types/azuracast'

export class AzuraCastApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AzuraCastApiError'
    this.status = status
  }
}

function normalizeStreamUrl(url: string) {
  try {
    const streamUrl = new URL(url)

    if (
      streamUrl.hostname === 'a7.alhastream.com' &&
      streamUrl.port === '4000' &&
      streamUrl.pathname === '/radio'
    ) {
      return VOKS_STREAM_URL
    }
  } catch {
    return url
  }

  return url
}

function normalizeNowPlayingResponse(
  data: AzuraCastNowPlayingResponse,
): AzuraCastNowPlayingResponse {
  return {
    ...data,
    station: {
      ...data.station,
      listen_url: normalizeStreamUrl(data.station.listen_url),
      mounts: data.station.mounts.map((mount) => ({
        ...mount,
        url: normalizeStreamUrl(mount.url),
      })),
    },
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

  const data = (await response.json()) as AzuraCastNowPlayingResponse

  return normalizeNowPlayingResponse(data)
}
