
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
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

    const {
      missionId,
      active,
      title,
      description,
      reward,
      target,
    } = body;

    const WP_USER = Deno.env.get("WP_ADMIN_USER");
    const WP_PASSWORD = Deno.env.get("WP_APPLICATION_PASSWORD");

    if (!WP_USER || !WP_PASSWORD) {
      throw new Error(
        "Missing WordPress credentials"
      );
    }

    const auth = btoa(
      `${WP_USER}:${WP_PASSWORD}`
    );

    const payload = {
      acf: {
        mission_active: active,
        mission_name: title,
        mission_description: description,
        mission_vxp: reward,
        mission_target: target,
      },
    };

    const response = await fetch(
      `https://voksradio.com/wp-json/wp/v2/missions/${missionId}`,
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
      return new Response(
        JSON.stringify({
          success: false,
          error: json,
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type":
              "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        mission: json,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          err instanceof Error
            ? err.message
            : String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type":
            "application/json",
        },
      }
    );
  }
});