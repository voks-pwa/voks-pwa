import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";
import { fetchWithRetry } from "../_shared/retry.ts";

const inputSchema = z.object({
  rewardId: z.number().int().positive("rewardId must be a positive integer"),
  active: z.boolean().optional(),
  name: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  cost: z.number().optional(),
  stock: z.number().optional(),
  status: z.string().optional(),
  featured: z.boolean().optional(),
  priority: z.number().optional(),
});

Deno.serve(async (req) => {
  console.log("[admin-reward-update] ▶ request", req.method, req.url);

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
      console.warn("[admin-reward-update] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[admin-reward-update] validation passed");

    const { rewardId, active, name, subtitle, description, cost, stock, status, featured, priority } = parsed.data;

    const WP_USER = Deno.env.get("WP_ADMIN_USER");
    const WP_PASSWORD = Deno.env.get("WP_APPLICATION_PASSWORD");

    if (!WP_USER || !WP_PASSWORD) {
      throw new Error("Missing WordPress credentials");
    }

    const auth = btoa(`${WP_USER}:${WP_PASSWORD}`);

    const payload: Record<string, unknown> = {
      acf: {
        reward_active: active,
        reward_name: name,
        reward_subtitle: subtitle,
        reward_description: description,
        reward_cost: cost,
        reward_stock: stock,
        reward_status: status,
        reward_featured: featured,
        reward_priority: priority,
      },
    };

    console.log("[admin-reward-update] updating reward ID:", rewardId);
    const response = await fetchWithRetry(
      `https://voksradio.com/wp-json/wp/v2/reward/${rewardId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await response.json();

    if (!response.ok) {
      console.error("[admin-reward-update] WordPress update failed:", response.status);
      return new Response(
        JSON.stringify({ success: false, error: json }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[admin-reward-update] ✔ update success");
    return new Response(
      JSON.stringify({ success: true, reward: json }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[admin-reward-update] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
