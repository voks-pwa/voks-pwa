import { supabase } from "@/lib/supabase";

interface EmbeddedMedia {
  source_url?: string;
  media_details?: {
    sizes?: Record<string, { source_url: string }>;
  };
}

interface MediaResponse {
  source_url: string;
  media_details?: {
    sizes?: Record<string, { source_url: string }>;
  };
}

const WP_API_URL = import.meta.env.VITE_WP_API_URL ?? "https://voksradio.com/wp-json/wp/v2";

const PLACEHOLDER = "/placeholder.svg";

const mediaCache = new Map<number, string>();

async function fetchMediaUrl(mediaId: number): Promise<string> {
  if (mediaCache.has(mediaId)) return mediaCache.get(mediaId)!;

  try {
    const res = await fetch(`${WP_API_URL}/media/${mediaId}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return PLACEHOLDER;

    const media: MediaResponse = await res.json();
    const url =
      media.media_details?.sizes?.medium_large?.source_url ??
      media.media_details?.sizes?.full?.source_url ??
      media.source_url;

    const result = url ?? PLACEHOLDER;
    mediaCache.set(mediaId, result);
    return result;
  } catch {
    return PLACEHOLDER;
  }
}

export function resolveFromEmbedded(
  embedded?: Record<string, unknown[]>,
  size?: string,
): string | null {
  if (!embedded) return null;
  const mediaArr = embedded["wp:featuredmedia"] as EmbeddedMedia[] | undefined;
  if (!mediaArr?.[0]) return null;

  const media = mediaArr[0];
  if (size && media.media_details?.sizes?.[size]?.source_url) {
    return media.media_details.sizes[size].source_url;
  }
  return (
    media.media_details?.sizes?.medium_large?.source_url ??
    media.media_details?.sizes?.full?.source_url ??
    media.source_url ??
    null
  );
}

export async function resolveMediaUrl(
  mediaId: number | undefined | null,
  embedded?: Record<string, unknown[]>,
): Promise<string> {
  const fromEmbedded = resolveFromEmbedded(embedded);
  if (fromEmbedded) return fromEmbedded;

  if (mediaId) {
    return fetchMediaUrl(mediaId);
  }

  return PLACEHOLDER;
}

export async function resolveRewardImage(
  acfImage?: number,
  bucketPath?: string | null,
): Promise<string> {
  if (bucketPath) {
    const { data } = supabase.storage.from("rewards").getPublicUrl(bucketPath);
    if (data?.publicUrl) return data.publicUrl;
  }

  if (acfImage) return fetchMediaUrl(acfImage);

  return PLACEHOLDER;
}
