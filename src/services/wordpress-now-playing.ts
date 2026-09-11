import { WP_VOKS_API_URL } from '@/lib/constants'
import type { WordPressNowPlaying } from '@/types/wordpress-now-playing'

export async function fetchWpNowPlaying(): Promise<WordPressNowPlaying | null> {
  const url = `${WP_VOKS_API_URL}/now-playing`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const json = (await res.json()) as WordPressNowPlaying
    if (!json.success) return null
    return json
  } catch {
    return null
  }
}