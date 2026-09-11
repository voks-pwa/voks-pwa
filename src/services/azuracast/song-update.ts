import { VOKS_SONG_UPDATE_URL } from '@/lib/constants'

export interface SongUpdate {
  raw: string
  artist: string | null
  title: string | null
}

function parseSongUpdateHtml(html: string): SongUpdate | null {
  const match = html.match(/<div[^>]*id=["']main["'][^>]*>([\s\S]*?)<br\s*\/?>/i)
  const inner = match?.[1]?.trim() ?? ''
  const raw = inner.replace(/<[^>]*>/g, '').trim()
  if (!raw) return null
  const parts = raw.split(' - ')
  if (parts.length >= 2) {
    return {
      raw,
      artist: parts[0]?.trim() || null,
      title: parts.slice(1).join(' - ').trim() || null,
    }
  }
  return { raw, artist: null, title: raw }
}

function parseSongUpdateText(text: string): SongUpdate | null {
  const raw = text.replace(/<[^>]*>/g, '').trim()
  if (!raw) return null
  const parts = raw.split(' - ')
  if (parts.length >= 2) {
    return {
      raw,
      artist: parts[0]?.trim() || null,
      title: parts.slice(1).join(' - ').trim() || null,
    }
  }
  return { raw, artist: null, title: raw }
}

/**
 * Fetch song_update.php directly.
 * NOTE: This endpoint has no CORS header, so browser fetch will fail on production.
 * Prefer fetchSongUpdateViaProxy or rely on useSongUpdate which tries proxy first.
 */
export async function fetchSongUpdateDirect(): Promise<SongUpdate | null> {
  const response = await fetch(VOKS_SONG_UPDATE_URL, { cache: 'no-store' })
  if (!response.ok) throw new Error(`song_update HTTP ${response.status}`)
  const html = await response.text()
  return parseSongUpdateHtml(html)
}

/**
 * Fetch via Supabase Edge Function `now-playing-proxy`.
 * Silent fallback — never spam CORS direct fetch in prod.
 * Direct fetch only via Vite dev proxy (/song_update.php).
 */
export async function fetchSongUpdate(): Promise<SongUpdate | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  // If Supabase env is configured, try Edge Function proxy (avoids CORS + handles http:81 server-side)
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const proxyUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/now-playing-proxy`
      const res = await fetch(proxyUrl, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        cache: 'no-store',
      })
      if (res.ok) {
        const json = (await res.json()) as {
          songUpdate?: SongUpdate | null
          azuracast?: unknown
        }
        if (json.songUpdate?.raw) return json.songUpdate
      }
    } catch {
      // Silent — fallback is null, getDisplayTrack will use AzuraCast HTTPS primary
    }
    // Do NOT fallthrough to direct CORS-blocked fetch in prod — return null silently
    return null
  }

  // No Supabase configured — try Vite dev proxy relative URL (avoids CORS in dev)
  // In prod without Supabase, just return null and let AzuraCast HTTPS handle title
  if (import.meta.env.DEV) {
    try {
      const res = await fetch('/song_update.php', { cache: 'no-store' })
      if (res.ok) {
        const html = await res.text()
        return parseSongUpdateHtml(html)
      }
    } catch {
      // silent
    }
  }

  return null
}

export function parseRawSongText(raw: string): SongUpdate | null {
  return parseSongUpdateText(raw)
}
