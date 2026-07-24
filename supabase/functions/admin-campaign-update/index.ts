import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";
import { fetchWithRetry } from "../_shared/retry.ts";

const inputSchema = z.object({
  slug: z.string().min(1, "slug is required"),
  featured: z.boolean().optional(),
  priority: z.number().int().optional(),
});

Deno.serve(async (req) => {
  console.log("[admin-campaign-update] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  const adminCheck = await requireAdmin(authHeader);
  if ("error" in adminCheck) return adminCheck.error;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const rawBody = await req.text().catch(() => null);
    const parsed = parseBody(rawBody, inputSchema);
    if (!parsed.success) {
      console.warn("[admin-campaign-update] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[admin-campaign-update] validation passed");

    const { slug, featured, priority } = parsed.data;

    const WP_USER = Deno.env.get("WP_ADMIN_USER");
    const WP_PASSWORD = Deno.env.get("WP_APPLICATION_PASSWORD");

    if (!WP_USER || !WP_PASSWORD) {
      throw new Error("Missing WordPress credentials");
    }

    const auth = btoa(`${WP_USER}:${WP_PASSWORD}`);

    const acf: Record<string, unknown> = {};
    if (featured !== undefined) acf.campaign_featured = featured;
    if (priority !== undefined) acf.campaign_priority = priority;

    console.log("[admin-campaign-update] fetching campaign by slug:", slug);
    const response = await fetchWithRetry(
      `https://voksradio.com/wp-json/wp/v2/campaign?slug=${encodeURIComponent(slug)}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    const campaigns = await response.json();
    if (!response.ok || !campaigns.length) {
      console.warn("[admin-campaign-update] campaign not found:", slug);
      return new Response(
        JSON.stringify({ success: false, error: "Campaign not found in WordPress" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const campaignId = campaigns[0].id;
    console.log("[admin-campaign-update] updating campaign ID:", campaignId);

    const updateResponse = await fetchWithRetry(
      `https://voksradio.com/wp-json/wp/v2/campaign/${campaignId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ acf }),
      }
    );

    const result = await updateResponse.json();

    if (!updateResponse.ok) {
      console.error("[admin-campaign-update] WordPress update failed:", updateResponse.status);
      return new Response(
        JSON.stringify({ success: false, error: result }),
        { status: updateResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[admin-campaign-update] ✔ update success");
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[admin-campaign-update] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
