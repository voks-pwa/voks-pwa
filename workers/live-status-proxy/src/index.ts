const OWNCAST_URL = "https://live.voksradio.com/api/status";
const OWNCAST_ORIGIN = "https://live.voksradio.com";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://voks.app",
  "https://voks-pwa.pages.dev",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin && (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".pages.dev"))
      ? origin
      : "https://voks.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, range",
    "Access-Control-Expose-Headers": "content-length, content-range, accept-ranges",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Proxy Owncast HLS playlists + segments.
 * The origin (live.voksradio.com) returns 403 to browser requests (anti-hotlink)
 * and no CORS headers, so the player must load through this Worker.
 */
async function proxyHls(request: Request, cors: Record<string, string>): Promise<Response> {
  const url = new URL(request.url);
  const upstreamUrl = `${OWNCAST_ORIGIN}${url.pathname}${url.search}`;

  const upstream = await fetch(upstreamUrl, {
    headers: {
      "User-Agent": "VoksPWA/1.0",
      ...(request.headers.get("range") ? { Range: request.headers.get("range") as string } : {}),
    },
  });

  const contentType = upstream.headers.get("Content-Type") ?? "application/octet-stream";
  const headers: Record<string, string> = {
    ...cors,
    "Content-Type": contentType,
    "Cache-Control": "no-cache",
  };
  const contentRange = upstream.headers.get("Content-Range");
  const contentLength = upstream.headers.get("Content-Length");
  const acceptRanges = upstream.headers.get("Accept-Ranges");
  if (contentRange) headers["Content-Range"] = contentRange;
  if (contentLength) headers["Content-Length"] = contentLength;
  if (acceptRanges) headers["Accept-Ranges"] = acceptRanges;

  // Rewrite absolute origin URLs in playlists so segments also flow through the Worker.
  if (contentType.includes("mpegurl") || url.pathname.endsWith(".m3u8")) {
    const body = await upstream.text();
    const rewritten = body
      .replaceAll(`${OWNCAST_ORIGIN}/hls/`, "/hls/")
      .replaceAll(`${OWNCAST_ORIGIN}/`, "/");
    return new Response(rewritten, { status: upstream.status, headers });
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin);
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (url.pathname.startsWith("/hls/")) {
      try {
        return await proxyHls(request, cors);
      } catch {
        return new Response(JSON.stringify({ error: "HLS upstream unavailable" }), {
          status: 502,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
    }

    try {
      const upstream = await fetch(OWNCAST_URL);

      const body = await upstream.text();
      const headers: Record<string, string> = {
        ...cors,
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "public, max-age=30",
      };

      return new Response(body, {
        status: upstream.status,
        headers,
      });
    } catch {
      return new Response(JSON.stringify({ online: false }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};
