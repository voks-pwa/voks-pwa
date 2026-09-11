export const AZURACAST_BASE_URL = 'https://a7.alhastream.com/api'
export const STATION_ID = 42
export const NOW_PLAYING_POLL_INTERVAL_MS = 15_000
export const VOKS_STREAM_URL = 'https://a7.alhastream.com:4000/radio'
export const OWNCAST_STATUS_URL = 'https://voks-live-status-proxy.voksmedsos.workers.dev/api/status'
export const VOKS_SONG_UPDATE_URL = 'https://voksradio.com/song_update.php'
export const SONG_UPDATE_POLL_INTERVAL_MS = 15_000

/**
 * WordPress REST base.
 * In dev we go through the Vite proxy (`/wp-json`) so requests are same-origin —
 * this avoids CORS and keeps the service worker from intercepting cross-origin calls.
 */
export const WP_API_URL =
  import.meta.env.VITE_WP_API_URL ??
  (import.meta.env.DEV
    ? '/wp-json/wp/v2'
    : 'https://voksradio.com/wp-json/wp/v2')

/**
 * WordPress custom REST (voks/v1). In dev goes through the Vite proxy (`/wp-json`)
 * so it's same-origin; prod hits voksradio.com directly.
 */
export const WP_VOKS_API_URL =
  import.meta.env.VITE_WP_VOKS_API_URL ??
  (import.meta.env.DEV
    ? '/wp-json/voks/v1'
    : 'https://voksradio.com/wp-json/voks/v1')

/**
 * Owncast HLS stream.
 * Direct browser access to live.voksradio.com returns 403 (anti-hotlink) + no CORS,
 * so dev proxies via Vite and prod goes through the live-status-proxy Worker.
 */
export const LIVE_HLS_URL =
  import.meta.env.VITE_LIVE_HLS_URL ??
  (import.meta.env.DEV
    ? '/hls/stream.m3u8'
    : 'https://voks-live-status-proxy.voksmedsos.workers.dev/hls/stream.m3u8')

