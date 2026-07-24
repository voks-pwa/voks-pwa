import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";
import { fetchWithRetry } from "../_shared/retry.ts";

const WP_API_URL = "https://voksradio.com/wp-json/wp/v2/notification?_embed";

const inputSchema = z.object({
  action: z.enum(["list"]).default("list"),
});

Deno.serve(async (req) => {
  console.log("[admin-broadcast-wp] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const adminCheck = await requireAdmin(authHeader);
    if ("error" in adminCheck) return adminCheck.error;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rawBody = await req.text().catch(() => null);
    const parsed = parseBody(rawBody, inputSchema);
    if (!parsed.success) {
      console.warn("[admin-broadcast-wp] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[admin-broadcast-wp] validation passed");

    const { action } = parsed.data;

    switch (action) {
      case "list": {
        console.log("[admin-broadcast-wp] fetching WordPress notifications");
        const wpResponse = await fetchWithRetry(WP_API_URL, {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(10000),
        });

        if (!wpResponse.ok) {
          console.error("[admin-broadcast-wp] WordPress API returned", wpResponse.status);
          return new Response(
            JSON.stringify({ success: false, error: `WordPress API returned ${wpResponse.status}` }),
            { status: 502, headers: corsHeaders }
          );
        }

        const posts = await wpResponse.json();

        const notifications = (Array.isArray(posts) ? posts : []).map((post: Record<string, unknown>) => ({
          wp_id: post.id,
          title: (post.title as { rendered?: string })?.rendered ?? "Untitled",
          content: (post.content as { rendered?: string })?.rendered ?? "",
          excerpt: (post.excerpt as { rendered?: string })?.rendered ?? "",
          date: post.date,
          link: post.link,
          featured_image:
            (post._embedded as Record<string, unknown>)?.["wp:featuredmedia"]?.[0] as { source_url?: string } ?? null,
        }));

        console.log("[admin-broadcast-wp] ✔ list response, items:", notifications.length);
        return new Response(
          JSON.stringify({ success: true, notifications }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        console.warn("[admin-broadcast-wp] unknown action:", action);
        return new Response(
          JSON.stringify({ success: false, message: "Unknown action" }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (err) {
    console.error("[admin-broadcast-wp] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
