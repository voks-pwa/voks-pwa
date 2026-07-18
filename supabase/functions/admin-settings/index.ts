import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods":
    "GET,POST,OPTIONS",
};

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

    if (!authHeader) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing authorization",
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    // ── Supabase auth.getUser ──────────────────────────────
    console.log("[admin-settings] calling supabase.auth.getUser()");
    const authUser = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    console.log("[admin-settings] getUser result:", JSON.stringify({
      hasUser: !!authUser.data?.user,
      userId: authUser.data?.user?.id ?? null,
      error: authUser.error?.message ?? null,
    }));

    if (authUser.error || !authUser.data.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = authUser.data.user.id;

    const body =
      req.method === "POST"
        ? await req.json().catch((e) => {
            console.error("[admin-settings] failed to parse JSON body:", e);
            return {};
          })
        : {};

    const action = body.action ?? "get";
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
        const { display_name, avatar_url } = body;
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
        const { settings } = body;
        console.log("[admin-settings] update_settings keys:", settings && typeof settings === "object" ? Object.keys(settings) : "INVALID");

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
