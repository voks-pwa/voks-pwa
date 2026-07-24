import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const updateProfileSchema = z.object({
  action: z.literal("update_profile"),
  display_name: z.string().optional(),
  avatar_url: z.string().optional(),
});

const updateSettingsSchema = z.object({
  action: z.literal("update_settings"),
  settings: z.record(z.unknown()).optional(),
});

const getSchema = z.object({
  action: z.literal("get").default("get"),
});

Deno.serve(async (req) => {
  console.log("[admin-settings] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  // ── Environment variables ────────────────────────────────
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  console.log("[admin-settings] env SUPABASE_URL:", SUPABASE_URL ? `set (${SUPABASE_URL})` : "MISSING");
  console.log("[admin-settings] env SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? `set (len=${SUPABASE_SERVICE_ROLE_KEY.length})` : "MISSING");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[admin-settings] FATAL: required environment variables missing");
    return new Response(
      JSON.stringify({
        success: false,
        error: "Server misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const authHeader = req.headers.get("authorization");
    console.log("[admin-settings] authorization header:", authHeader ? "present" : "MISSING");

    const adminCheck = await requireAdmin(authHeader);
    if ("error" in adminCheck) return adminCheck.error;

    const userId = adminCheck.caller.id;

    const rawBody =
      req.method === "POST"
        ? await req.text().catch(() => null)
        : null;

    let parsedBody: Record<string, unknown> = {};
    if (rawBody !== null) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch (e) {
        console.error("[admin-settings] failed to parse JSON body:", e);
      }
    }

    const action = String(parsedBody.action ?? "get");
    console.log("[admin-settings] action:", action, "userId:", userId);

    switch (action) {
      case "get": {
        console.log("[admin-settings] query: settings.select(key,value) + profiles.select(...).eq(id)");
        const [settingsResult, profileResult] = await Promise.all([
          supabase.from("settings").select("key, value"),
          supabase
            .from("profiles")
            .select("id, display_name, email, avatar_url, badge_name, role")
            .eq("id", userId)
            .single(),
        ]);

        console.log("[admin-settings] settings query:", JSON.stringify({
          rows: settingsResult.data?.length ?? 0,
          error: settingsResult.error?.message ?? null,
          code: (settingsResult.error as { code?: string } | null)?.code ?? null,
        }));
        console.log("[admin-settings] profile query:", JSON.stringify({
          found: !!profileResult.data,
          error: profileResult.error?.message ?? null,
          code: (profileResult.error as { code?: string } | null)?.code ?? null,
        }));

        if (profileResult.error) {
          console.error("[admin-settings] profile query FAILED:", profileResult.error);
          throw profileResult.error;
        }
        if (settingsResult.error) {
          console.error("[admin-settings] settings query FAILED:", settingsResult.error);
          throw settingsResult.error;
        }

        const settingsMap: Record<string, unknown> = {};
        for (const row of settingsResult.data ?? []) {
          settingsMap[row.key] = row.value;
        }

        const payload = {
          success: true,
          profile: profileResult.data,
          settings: settingsMap,
        };
        console.log("[admin-settings] ✔ get response:", JSON.stringify({ success: true, settingsKeys: Object.keys(settingsMap).length }));
        return new Response(JSON.stringify(payload), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "update_profile": {
        const upParsed = updateProfileSchema.safeParse(parsedBody);
        if (!upParsed.success) {
          console.warn("[admin-settings] update_profile validation failed");
          return new Response(
            JSON.stringify({ success: false, error: "Invalid update_profile payload" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.log("[admin-settings] update_profile validation passed");
        const { display_name, avatar_url } = upParsed.data;
        console.log("[admin-settings] update_profile:", JSON.stringify({ display_name, avatar_url }));

        const { data, error } = await supabase
          .from("profiles")
          .update({
            ...(display_name !== undefined && { display_name }),
            ...(avatar_url !== undefined && { avatar_url }),
          })
          .eq("id", userId)
          .select("id, display_name, email, avatar_url, badge_name, role")
          .single();

        console.log("[admin-settings] update_profile result:", JSON.stringify({
          updated: !!data,
          error: error?.message ?? null,
          code: (error as { code?: string } | null)?.code ?? null,
        }));

        if (error) {
          console.error("[admin-settings] update_profile FAILED:", error);
          throw error;
        }

        console.log("[admin-settings] ✔ update_profile response: success");
        return new Response(
          JSON.stringify({ success: true, profile: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "update_settings": {
        const usParsed = updateSettingsSchema.safeParse(parsedBody);
        if (!usParsed.success) {
          console.warn("[admin-settings] update_settings validation failed");
          return new Response(
            JSON.stringify({ success: false, error: "settings object required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.log("[admin-settings] update_settings validation passed");
        const { settings } = usParsed.data;

        if (!settings || typeof settings !== "object") {
          return new Response(
            JSON.stringify({
              success: false,
              error: "settings object required",
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        const updates = Object.entries(settings).map(([key, value]) => ({
          key,
          value: typeof value === "string" ? value : JSON.stringify(value),
          updated_by: userId,
          updated_at: new Date().toISOString(),
        }));

        for (const update of updates) {
          console.log("[admin-settings] upsert setting:", update.key);
          const { error } = await supabase
            .from("settings")
            .upsert(update, { onConflict: "key" });

          if (error) {
            console.error("[admin-settings] upsert FAILED for key", update.key, error);
            throw error;
          }
        }

        console.log("[admin-settings] re-fetching settings after upsert");
        const { data: refreshed, error: refreshError } = await supabase
          .from("settings")
          .select("key, value");

        if (refreshError) {
          console.error("[admin-settings] re-fetch FAILED:", refreshError);
          throw refreshError;
        }

        const settingsMap: Record<string, unknown> = {};
        for (const row of refreshed ?? []) {
          settingsMap[row.key] = row.value;
        }

        console.log("[admin-settings] ✔ update_settings response: success, keys:", Object.keys(settingsMap).length);
        return new Response(
          JSON.stringify({ success: true, settings: settingsMap }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        console.warn("[admin-settings] unknown action:", action);
        return new Response(
          JSON.stringify({ success: false, message: "Unknown action" }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (err) {
    const e = err as { message?: string; code?: string; details?: string; hint?: string; stack?: string };
    console.error("[admin-settings] ✖ EXCEPTION:", JSON.stringify({
      message: e?.message ?? String(err),
      code: e?.code ?? null,
      details: e?.details ?? null,
      hint: e?.hint ?? null,
    }));
    console.error("[admin-settings] stack:", e?.stack ?? "(no stack)");

    return new Response(
      JSON.stringify({
        success: false,
        error: e?.message ?? String(err),
        code: e?.code ?? null,
        details: e?.details ?? null,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
