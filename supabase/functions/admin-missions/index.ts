import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const querySchema = z.object({
  mode: z.enum(["stats", "monitor"]).default("stats"),
});

Deno.serve(async (req) => {
  console.log("[admin-missions] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  const adminCheck = await requireAdmin(authHeader);
  if ("error" in adminCheck) return adminCheck.error;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") ?? "stats";

    const parsed = querySchema.safeParse({ mode });
    if (!parsed.success) {
      console.warn("[admin-missions] validation failed:", parsed.error.issues.map(i => i.message).join("; "));
      return new Response(
        JSON.stringify({ success: false, error: "Invalid mode parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[admin-missions] validation passed, mode:", parsed.data.mode);

    if (parsed.data.mode === "monitor") {
      console.log("[admin-missions] fetching monitor data");
      const { data: completions, error: ce } = await supabase
        .from("mission_completions")
        .select("mission_id, completed_at, reward_vxp");

      if (ce) throw ce;

      const { data: progress, error: pe } = await supabase
        .from("missions_progress")
        .select("mission_id, completed, claimed, mission_state, period");

      if (pe) throw pe;

      const totalUsers = new Set(progress.map((p: { mission_id: number }) => p.mission_id));

      const stateCounts: Record<string, number> = {};
      let completedCount = 0;
      let claimedCount = 0;

      for (const p of progress) {
        const state = p.mission_state ?? "UNKNOWN";
        stateCounts[state] = (stateCounts[state] ?? 0) + 1;
        if (p.completed) completedCount++;
        if (p.claimed) claimedCount++;
      }

      console.log("[admin-missions] ✔ monitor response");
      return new Response(
        JSON.stringify({
          success: true,
          monitor: {
            totalProgressRecords: progress.length,
            totalCompletions: completions.length,
            totalUniqueUsers: totalUsers.size,
            completionRate: progress.length > 0
              ? Math.round((completedCount / progress.length) * 100)
              : 0,
            claimRate: completedCount > 0
              ? Math.round((claimedCount / completedCount) * 100)
              : 0,
            stateDistribution: stateCounts,
            totalRewardVxp: completions.reduce((sum: number, c: { reward_vxp: number }) => sum + (c.reward_vxp ?? 0), 0),
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[admin-missions] fetching stats data");
    const { data: completions, error: completionError } = await supabase
      .from("mission_completions")
      .select("mission_id");

    if (completionError) throw completionError;

    const { data: progress, error: progressError } = await supabase
      .from("missions_progress")
      .select("mission_id, completed");

    if (progressError) throw progressError;

    const stats: Record<string, { completed: number; in_progress: number }> = {};

    for (const row of completions ?? []) {
      const missionId = String(row.mission_id);
      if (!stats[missionId]) stats[missionId] = { completed: 0, in_progress: 0 };
      stats[missionId].completed++;
    }

    for (const row of progress ?? []) {
      const missionId = String(row.mission_id);
      if (!stats[missionId]) stats[missionId] = { completed: 0, in_progress: 0 };
      if (!row.completed) stats[missionId].in_progress++;
    }

    console.log("[admin-missions] ✔ stats response");
    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[admin-missions] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
