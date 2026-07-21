import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ success: false, error: "Missing authorization" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { slug, featured, priority } = body;

    if (!slug) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing slug" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const WP_USER = Deno.env.get("WP_ADMIN_USER");
    const WP_PASSWORD = Deno.env.get("WP_APPLICATION_PASSWORD");

    if (!WP_USER || !WP_PASSWORD) {
      throw new Error("Missing WordPress credentials");
    }

    const auth = btoa(`${WP_USER}:${WP_PASSWORD}`);

    const acf: Record<string, unknown> = {};
    if (featured !== undefined) acf.campaign_featured = featured;
    if (priority !== undefined) acf.campaign_priority = priority;

    const response = await fetch(
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
      return new Response(
        JSON.stringify({ success: false, error: "Campaign not found in WordPress" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const campaignId = campaigns[0].id;

    const updateResponse = await fetch(
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
      return new Response(
        JSON.stringify({ success: false, error: result }),
        { status: updateResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
