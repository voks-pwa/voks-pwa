const OWNCAST_URL = "https://live.voksradio.com/api/status";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://voks.app",
  "https://voks-pwa.pages.dev",
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "https://voks.app";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request: Request): Promise<Response> {
    const origin = request.headers.get("Origin");
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...cors, "Content-Type": "application/json" },
      });
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