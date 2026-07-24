import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";

const inputSchema = z.object({
  action: z.enum(["list", "update"]),
  key: z.string().optional(),
  enabled: z.boolean().optional(),
  description: z.string().optional(),
});

Deno.serve(async (req) => {
  console.log("[admin-feature-flags] ▶ request", req.method, req.url);

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
      console.warn("[admin-feature-flags] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[admin-feature-flags] validation passed");

    const { action, key, enabled, description } = parsed.data;

    if (action === "list") {
      console.log("[admin-feature-flags] listing all flags");
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("key");

      if (error) throw error;

      console.log("[admin-feature-flags] ✔ list response, rows:", data?.length ?? 0);
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: corsHeaders },
      );
    }

    if (action === "update") {
      if (!key) {
        console.warn("[admin-feature-flags] update missing key");
        return new Response(
          JSON.stringify({ success: false, error: "Missing key" }),
          { status: 400, headers: corsHeaders },
        );
      }

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: adminCheck.caller.id };
      if (enabled !== undefined) updates.enabled = enabled;
      if (description !== undefined) updates.description = description;

      console.log("[admin-feature-flags] updating flag:", key);
      const { data, error } = await supabase
        .from("feature_flags")
        .update(updates)
        .eq("key", key)
        .select()
        .single();

      if (error) throw error;

      console.log("[admin-feature-flags] ✔ update success:", key);
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: corsHeaders },
      );
    }

    console.warn("[admin-feature-flags] invalid action:", action);
    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: corsHeaders },
    );
  } catch (err) {
    console.error("[admin-feature-flags] ✖ EXCEPTION:", err instanceof Error ? err.message : "Unknown error");
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});
