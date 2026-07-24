import { createClient } from "npm:@supabase/supabase-js@2";

export interface AdminCaller {
  id: string;
  email?: string;
  role: string;
}

export async function requireAdmin(
  authHeader: string | null,
): Promise<{ caller: AdminCaller } | { error: Response }> {
  if (!authHeader) {
    return {
      error: new Response(
        JSON.stringify({ success: false, error: "Missing authorization" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    };
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const authUser = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );

  if (authUser.error || !authUser.data.user) {
    return {
      error: new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      ),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authUser.data.user.id)
    .single();

  if (!profile || !["admin", "superadmin"].includes(profile.role)) {
    return {
      error: new Response(
        JSON.stringify({ success: false, error: "Forbidden: admin role required" }),
        { status: 403, headers: { "Content-Type": "application/json" } },
      ),
    };
  }

  return {
    caller: {
      id: authUser.data.user.id,
      email: authUser.data.user.email ?? undefined,
      role: profile.role,
    },
  };
}
