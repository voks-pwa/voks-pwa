const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods":
    "GET,POST,OPTIONS",
};

const WP_BASE = "https://voksradio.com/wp-json/wp/v2";
const TYPES = ["voks-plus", "promo"] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing authorization" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const results: Record<string, { count: number; label: string }> = {};

    for (const type of TYPES) {
      try {
        const resp = await fetch(`${WP_BASE}/${type}?_embed&per_page=1`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        });
        if (resp.ok) {
          const total = resp.headers.get("X-WP-Total");
          results[type] = {
            count: total ? parseInt(total, 10) : 0,
            label: type === "voks-plus" ? "Podcasts" : "Promos",
          };
        } else {
          results[type] = { count: 0, label: type, error: `${resp.status}` };
        }
      } catch {
        results[type] = { count: 0, label: type, error: "fetch_failed" };
      }
    }

    return new Response(
      JSON.stringify({ success: true, results, generated_at: new Date().toISOString() }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
