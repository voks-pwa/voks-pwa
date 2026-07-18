import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods":
    "GET,POST,OPTIONS",
};

const WP_API_URL = "https://voksradio.com/wp-json/wp/v2/notification?_embed";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing authorization" }),
        { status: 401, headers: corsHeaders }
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

    const body = await req.json().catch(() => ({}));
    const action = body.action ?? "list";

    switch (action) {
      case "list": {
        const wpResponse = await fetch(WP_API_URL, {
          headers: { "Accept": "application/json" },
          signal: AbortSignal.timeout(10000),
        });

        if (!wpResponse.ok) {
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

        return new Response(
          JSON.stringify({ success: true, notifications }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, message: "Unknown action" }),
          { status: 400, headers: corsHeaders }
        );
    }
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
