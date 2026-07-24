import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const WP_BASE = "https://voksradio.com/wp-json/wp/v2";
const TYPES = ["voks-plus", "promo"] as const;

Deno.serve(async (req) => {
  console.log("[admin-wp-stats] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  const adminCheck = await requireAdmin(authHeader);
  if ("error" in adminCheck) return adminCheck.error;

  try {
    console.log("[admin-wp-stats] fetching WordPress stats");
    const results: Record<string, { count: number; label: string }> = {};

    for (const type of TYPES) {
      try {
        const resp = await fetchWithRetry(`${WP_BASE}/${type}?_embed&per_page=1`, {
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

    console.log("[admin-wp-stats] ✔ response:", JSON.stringify(results));
    return new Response(
      JSON.stringify({ success: true, results, generated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[admin-wp-stats] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
