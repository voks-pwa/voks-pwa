import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods":
    "GET,POST,OPTIONS",
};

Deno.serve(async (req) => {
  console.log("[admin-broadcast] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // ── Environment variables ────────────────────────────────
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  console.log("[admin-broadcast] env SUPABASE_URL:", SUPABASE_URL ? `set (${SUPABASE_URL})` : "MISSING");
  console.log("[admin-broadcast] env SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? `set (len=${SUPABASE_SERVICE_ROLE_KEY.length})` : "MISSING");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[admin-broadcast] FATAL: required environment variables missing");
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
    console.log("[admin-broadcast] authorization header:", authHeader ? "present" : "MISSING");

    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // ── Supabase auth.getUser ──────────────────────────────
    console.log("[admin-broadcast] calling supabase.auth.getUser()");
    const authUser = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    console.log("[admin-broadcast] getUser result:", JSON.stringify({
      hasUser: !!authUser.data?.user,
      userId: authUser.data?.user?.id ?? null,
      error: authUser.error?.message ?? null,
    }));

    if (authUser.error || !authUser.data.user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const userId = authUser.data.user.id;

    const body =
      req.method === "POST"
        ? await req.json().catch((e) => {
            console.error("[admin-broadcast] failed to parse JSON body:", e);
            return {};
          })
        : {};

    const action = body.action ?? "list";
    console.log("[admin-broadcast] action:", action, "userId:", userId);

    switch (action) {
      case "create": {
        const {
          title,
          message,
          type,
          priority,
          audience,
          deep_link,
          image_url,
          scheduled_at,
        } = body;

        console.log("[admin-broadcast] create payload:", JSON.stringify({ title, hasMessage: !!message, type, priority, audience }));

        if (!title || !message) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "title and message are required",
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log("[admin-broadcast] query: broadcasts.insert(...)");
        const { data, error } = await supabase
          .from("broadcasts")
          .insert({
            title,
            message,
            type: type ?? "broadcast",
            priority: priority ?? "Normal",
            audience: audience ?? "all",
            deep_link: deep_link ?? null,
            image_url: image_url ?? null,
            scheduled_at: scheduled_at ?? null,
            created_by: userId,
          })
          .select()
          .single();

        console.log("[admin-broadcast] insert result:", JSON.stringify({
          created: !!data,
          id: data?.id ?? null,
          error: error?.message ?? null,
          code: (error as { code?: string } | null)?.code ?? null,
        }));

        if (error) {
          console.error("[admin-broadcast] create FAILED:", error);
          throw error;
        }

        console.log("[admin-broadcast] ✔ create response: success");
        return new Response(
          JSON.stringify({ success: true, broadcast: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "list": {
        console.log("[admin-broadcast] query: broadcasts.select(*, profiles join).order(created_at desc)");
        const { data, error } = await supabase
          .from("broadcasts")
          .select("*, profiles!broadcasts_created_by_fkey(display_name, avatar_url)")
          .order("created_at", { ascending: false });

        console.log("[admin-broadcast] list result:", JSON.stringify({
          rows: data?.length ?? 0,
          error: error?.message ?? null,
          code: (error as { code?: string } | null)?.code ?? null,
          hint: (error as { hint?: string } | null)?.hint ?? null,
        }));

        if (error) {
          console.error("[admin-broadcast] list FAILED:", error);
          throw error;
        }

        console.log("[admin-broadcast] ✔ list response: success, rows:", data?.length ?? 0);
        return new Response(
          JSON.stringify({ success: true, broadcasts: data ?? [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "send": {
        const { id } = body;
        console.log("[admin-broadcast] send id:", id);

        if (!id) {
          return new Response(
            JSON.stringify({ success: false, error: "broadcast id required" }),
            { status: 400, headers: corsHeaders }
          );
        }

        console.log("[admin-broadcast] query: broadcasts.select(*).eq(id).single()");
        const { data: broadcast, error: fetchError } = await supabase
          .from("broadcasts")
          .select("*")
          .eq("id", id)
          .single();

        console.log("[admin-broadcast] fetch broadcast result:", JSON.stringify({
          found: !!broadcast,
          sent_at: broadcast?.sent_at ?? null,
          audience: broadcast?.audience ?? null,
          error: fetchError?.message ?? null,
          code: (fetchError as { code?: string } | null)?.code ?? null,
        }));

        if (fetchError || !broadcast) {
          console.error("[admin-broadcast] broadcast not found:", fetchError);
          return new Response(
            JSON.stringify({ success: false, error: "Broadcast not found" }),
            { status: 404, headers: corsHeaders }
          );
        }

        if (broadcast.sent_at) {
          console.warn("[admin-broadcast] broadcast already sent at", broadcast.sent_at);
          return new Response(
            JSON.stringify({ success: false, error: "Already sent" }),
            { status: 400, headers: corsHeaders }
          );
        }

        let targetIds: { id: string }[] = [];

        if (broadcast.audience === "all") {
          console.log("[admin-broadcast] query: profiles.select(id) [all]");
          const { data: profiles, error: profErr } = await supabase
            .from("profiles")
            .select("id");
          console.log("[admin-broadcast] profiles(all) result:", JSON.stringify({ rows: profiles?.length ?? 0, error: profErr?.message ?? null }));
          if (profErr) { console.error("[admin-broadcast] profiles(all) FAILED:", profErr); throw profErr; }
          targetIds = profiles ?? [];
        } else {
          console.log("[admin-broadcast] query: profiles.select(id).eq(role,", broadcast.audience, ")");
          const { data: profiles, error: profErr } = await supabase
            .from("profiles")
            .select("id")
            .eq("role", broadcast.audience);
          console.log("[admin-broadcast] profiles(filtered) result:", JSON.stringify({ rows: profiles?.length ?? 0, error: profErr?.message ?? null }));
          if (profErr) { console.error("[admin-broadcast] profiles(filtered) FAILED:", profErr); throw profErr; }
          targetIds = profiles ?? [];
        }

        const notifications = targetIds.map((profile) => ({
          user_id: profile.id,
          type: broadcast.type,
          title: broadcast.title,
          message: broadcast.message,
          priority: broadcast.priority,
          deep_link: broadcast.deep_link,
          image_url: broadcast.image_url,
          broadcast_id: broadcast.id,
        }));

        console.log("[admin-broadcast] notifications to insert:", notifications.length);

        if (notifications.length > 0) {
          console.log("[admin-broadcast] query: notifications.insert(rows)");
          const { error: insertError } = await supabase
            .from("notifications")
            .insert(notifications);

          console.log("[admin-broadcast] notifications insert result:", JSON.stringify({
            error: insertError?.message ?? null,
            code: (insertError as { code?: string } | null)?.code ?? null,
          }));

          if (insertError) {
            console.error("[admin-broadcast] notifications insert FAILED:", insertError);
            throw insertError;
          }
        }

        console.log("[admin-broadcast] query: broadcasts.update(sent_at).eq(id)");
        const { error: updateError } = await supabase
          .from("broadcasts")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", id);

        console.log("[admin-broadcast] update sent_at result:", JSON.stringify({
          error: updateError?.message ?? null,
          code: (updateError as { code?: string } | null)?.code ?? null,
        }));

        if (updateError) {
          console.error("[admin-broadcast] update sent_at FAILED:", updateError);
          throw updateError;
        }

        console.log("[admin-broadcast] ✔ send response: success, sent_count:", notifications.length);
        return new Response(
          JSON.stringify({ success: true, sent_count: notifications.length }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        console.warn("[admin-broadcast] unknown action:", action);
        return new Response(
          JSON.stringify({ success: false, message: "Unknown action" }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (err) {
    const e = err as { message?: string; code?: string; details?: string; hint?: string; stack?: string };
    console.error("[admin-broadcast] ✖ EXCEPTION:", JSON.stringify({
      message: e?.message ?? String(err),
      code: e?.code ?? null,
      details: e?.details ?? null,
      hint: e?.hint ?? null,
    }));
    console.error("[admin-broadcast] stack:", e?.stack ?? "(no stack)");

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
