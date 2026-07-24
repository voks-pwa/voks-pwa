import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";

const inputSchema = z.object({
  search: z.string().optional().default(""),
  role: z.string().optional().default(""),
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(10),
});

Deno.serve(async (req) => {
  console.log("[admin-users] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    const adminCheck = await requireAdmin(authHeader);
    if ("error" in adminCheck) return adminCheck.error;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rawBody = req.method === "POST" ? await req.text().catch(() => null) : null;
    const parsed = parseBody(rawBody, inputSchema);
    if (!parsed.success) {
      console.warn("[admin-users] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }

    const { search, role, page, pageSize } = parsed.data;
    const offset = (page - 1) * pageSize;
    console.log("[admin-users] query params:", JSON.stringify({ search, role, page, pageSize }));

    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(
        `display_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    if (role) {
      query = query.eq("role", role);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    console.log("[admin-users] ✔ response, users:", data?.length ?? 0, "total:", count ?? 0);
    return new Response(
      JSON.stringify({
        success: true,
        users: data ?? [],
        total: count ?? 0,
        page,
        pageSize,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[admin-users] ✖ EXCEPTION:", String(err));
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
