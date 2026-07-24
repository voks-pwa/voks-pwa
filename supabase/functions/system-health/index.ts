import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const WP_API_URL =
  Deno.env.get("WP_API_URL") ?? "https://voksradio.com/wp-json/wp/v2";

Deno.serve(async (req) => {
  console.log("[system-health] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    console.warn("[system-health] missing authorization");
    return new Response(
      JSON.stringify({ success: false, error: "Missing authorization" }),
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { authorization: authHeader } } },
    );

    console.log("[system-health] checking database health");
    const dbStart = performance.now();
    const { data: healthData, error: dbError } = await supabase
      .rpc("get_system_health");
    const dbMs = Math.round(performance.now() - dbStart);

    if (dbError) throw dbError;
    const dbHealth = healthData as unknown as {
      success: boolean;
      status: string;
      database: Record<string, unknown>;
    };

    console.log("[system-health] checking WordPress health");
    const wpStart = performance.now();
    let wpOk = false;
    let wpError: string | null = null;
    try {
      const wpRes = await fetch(`${WP_API_URL}/missions?_fields=id&per_page=1`);
      wpOk = wpRes.ok;
      if (!wpRes.ok) wpError = `HTTP ${wpRes.status}`;
    } catch (e) {
      wpError = e instanceof Error ? e.message : "Unknown error";
    }
    const wpMs = Math.round(performance.now() - wpStart);

    const { data: mmData } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", "maintenance_mode")
      .single();

    const maintenance = mmData?.value as { enabled: boolean; message: string } | undefined;

    const { data: verData } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", "app_version")
      .single();

    const version = verData?.value as { version: string; build_number: string; build_date: string | null } | undefined;

    const allOk = dbHealth?.status === "healthy" && wpOk;

    console.log("[system-health] ✔ status:", allOk ? "healthy" : "degraded");
    return new Response(
      JSON.stringify({
        success: true,
        status: allOk ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        database: {
          connected: dbHealth?.status === "healthy",
          response_time_ms: dbMs,
          tables: dbHealth?.database ?? {},
        },
        wordpress: {
          connected: wpOk,
          response_time_ms: wpMs,
          error: wpError,
        },
        app: {
          version: version?.version ?? "unknown",
          build_number: version?.build_number ?? "unknown",
          build_date: version?.build_date ?? null,
        },
        maintenance_mode: {
          enabled: maintenance?.enabled ?? false,
          message: maintenance?.message ?? "",
        },
        checks: {
          database: dbHealth?.status === "healthy",
          wordpress_api: wpOk,
        },
      }),
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error("[system-health] ✖ EXCEPTION:", err instanceof Error ? err.message : "Unknown error");
    return new Response(
      JSON.stringify({
        success: false,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});
