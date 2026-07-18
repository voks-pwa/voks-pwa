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

  try {
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

    const body =
      req.method === "POST"
        ? await req.json().catch(() => ({}))
        : {};

    const search = body.search ?? "";
    const roleFilter = body.role ?? "";
    const page = Math.max(1, body.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, body.pageSize ?? 10));
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(
        `display_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (roleFilter) {
      query = query.eq("role", roleFilter);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        users: data ?? [],
        total: count ?? 0,
        page,
        pageSize,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: String(err),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
