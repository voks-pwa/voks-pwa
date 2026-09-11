import { getCorsHeaders } from "../_shared/cors.ts";

const VOKS_SONG_UPDATE_URL = "https://voksradio.com/song_update.php";
const AZURACAST_URL = "https://a7.alhastream.com/api/nowplaying/42";
const AZURACAST_HTTP_URL = "http://a7.alhastream.com:81/api/nowplaying/42";

function parseSongUpdateHtml(html: string): { raw: string; artist: string | null; title: string | null } {
  // Extract <div id="main">...<br /> content
  const match = html.match(/<div[^>]*id=["']main["'][^>]*>([\s\S]*?)<br\s*\/?>/i);
  const inner = match?.[1]?.trim() ?? "";
  // Strip any remaining tags
  const raw = inner.replace(/<[^>]*>/g, "").trim();
  if (!raw) return { raw: "", artist: null, title: null };
  const parts = raw.split(" - ");
  if (parts.length >= 2) {
    return {
      raw,
      artist: parts[0]?.trim() || null,
      title: parts.slice(1).join(" - ").trim() || null,
    };
  }
  return { raw, artist: null, title: raw };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Allow GET without auth for public now-playing data
  // POST/others also allowed — this is public metadata

  try {
    const [songUpdateRes, azuracastRes, azuracastHttpRes] = await Promise.allSettled([
      fetch(VOKS_SONG_UPDATE_URL, {
        headers: { "User-Agent": "VoksPWA/1.0" },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(AZURACAST_URL, {
        headers: { "User-Agent": "VoksPWA/1.0", accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(AZURACAST_HTTP_URL, {
        headers: { "User-Agent": "VoksPWA/1.0", accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    let songUpdate: { raw: string; artist: string | null; title: string | null } | null = null;
    let songUpdateError: string | null = null;

    if (songUpdateRes.status === "fulfilled" && songUpdateRes.value.ok) {
      const html = await songUpdateRes.value.text();
      songUpdate = parseSongUpdateHtml(html);
    } else if (songUpdateRes.status === "fulfilled") {
      songUpdateError = `song_update HTTP ${songUpdateRes.value.status}`;
    } else {
      songUpdateError = songUpdateRes.reason instanceof Error ? songUpdateRes.reason.message : "song_update fetch failed";
    }

    let azuracast: unknown = null;
    let azuracastError: string | null = null;

    // Prefer HTTPS, fallback to HTTP:81 (server-side, no mixed-content)
    const preferred = azuracastRes.status === "fulfilled" && azuracastRes.value.ok ? azuracastRes : null;
    const fallback = azuracastHttpRes.status === "fulfilled" && azuracastHttpRes.value.ok ? azuracastHttpRes : null;

    if (preferred) {
      azuracast = await preferred.value.json();
    } else if (fallback) {
      azuracast = await fallback.value.json();
    } else {
      // Both failed — compose error from both attempts
      const httpsErr = azuracastRes.status === "fulfilled"
        ? `https HTTP ${azuracastRes.value.status}`
        : azuracastRes.reason instanceof Error ? azuracastRes.reason.message : "https fetch failed";
      const httpErr = azuracastHttpRes.status === "fulfilled"
        ? `http:81 HTTP ${azuracastHttpRes.value.status}`
        : azuracastHttpRes.reason instanceof Error ? azuracastHttpRes.reason.message : "http:81 fetch failed";
      azuracastError = `${httpsErr}; ${httpErr}`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        songUpdate,
        azuracast,
        errors: {
          songUpdate: songUpdateError,
          azuracast: azuracastError,
        },
      }),
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error("[now-playing-proxy] ✖", err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});
