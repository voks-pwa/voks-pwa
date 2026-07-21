import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing authorization" }),
      { status: 401, headers: corsHeaders },
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authUser = await supabase.auth.getUser(
    authHeader.replace("Bearer ", "")
  );

  if (authUser.error || !authUser.data.user) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const { action, key, enabled, description } = await req.json();

    if (action === "list") {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("key");

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: corsHeaders },
      );
    }

    if (action === "update") {
      if (!key) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing key" }),
          { status: 400, headers: corsHeaders },
        );
      }

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString(), updated_by: authUser.data.user.id };
      if (enabled !== undefined) updates.enabled = enabled;
      if (description !== undefined) updates.description = description;

      const { data, error } = await supabase
        .from("feature_flags")
        .update(updates)
        .eq("key", key)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: corsHeaders },
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: "Invalid action" }),
      { status: 400, headers: corsHeaders },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});
