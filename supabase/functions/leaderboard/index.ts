import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface RankInput {
  id: string;
  current_vxp: number;
  lifetime_vxp: number;
  achievement_count: number;
  longest_streak: number;
  created_at: string;
}

function periodStart(period: string): Date | null {
  const now = new Date();
  if (period === "weekly") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  return null;
}

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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const authUser = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (authUser.error || !authUser.data.user) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: corsHeaders },
    );
  }

  const callerId = authUser.data.user.id;

  try {
    const url = new URL(req.url);
    const period =
      url.searchParams.get("period") ?? "lifetime";
    const action = url.searchParams.get("action");

    // ---- Admin: write a ranking snapshot (not part of read path) ----
    if (action === "snapshot") {
      const { data: roleData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", callerId)
        .maybeSingle();

      if (roleData?.role !== "admin" && roleData?.role !== "superadmin") {
        return new Response(
          JSON.stringify({ success: false, error: "Forbidden" }),
          { status: 403, headers: corsHeaders },
        );
      }

      const ranked = await buildRankedUsers(supabase, period);
      const batchAt = new Date().toISOString();

      const rows = ranked.map((u) => ({
        period,
        user_id: u.id,
        rank: u.rank,
        batch_at: batchAt,
      }));

      const { error } = await supabase
        .from("leaderboard_snapshots")
        .insert(rows);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, snapshot_at: batchAt }),
        { headers: corsHeaders },
      );
    }

    // ---- Read path: pure SELECT ----
    const ranked = await buildRankedUsers(supabase, period);

    // Latest snapshot → previous ranks (most recent batch for this period)
    const { data: batchRows } = await supabase.rpc(
      "latest_leaderboard_snapshot",
      { p_period: period },
    ).maybeSingle() as unknown as {
      data: { user_id: string; rank: number }[] | null;
    };

    const prevMap: Record<string, number> = {};
    if (batchRows) {
      for (const r of batchRows) prevMap[r.user_id] = r.rank;
    }

    const users = ranked.map((u, i) => {
      const rank = i + 1;
      const prev = prevMap[u.id] ?? null;
      return {
        ...u,
        rank,
        previous_rank: prev,
        rank_delta: prev !== null ? prev - rank : null,
      };
    });

    const myIndex = users.findIndex((u) => u.id === callerId);
    const myRank = myIndex >= 0 ? myIndex + 1 : null;

    const nearby = myIndex >= 0
      ? users.slice(Math.max(0, myIndex - 2), myIndex + 3)
      : [];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          users,
          myRank,
          nearby,
        },
      }),
      { headers: corsHeaders },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});

async function buildRankedUsers(
  supabase: ReturnType<typeof createClient>,
  period: string,
): Promise<RankInput[]> {
  const start = periodStart(period);

  // Base profiles
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, display_name, avatar_url, badge_name, level, current_vxp, lifetime_vxp, created_at",
    )
    .order("lifetime_vxp", { ascending: false })
    .limit(200);

  if (error) throw error;
  if (!profiles || profiles.length === 0) return [];

  const ids = profiles.map((p: Record<string, unknown>) => p.id as string);

  // Achievement counts
  const { data: ach } = await supabase
    .from("user_achievements")
    .select("user_id")
    .in("user_id", ids);
  const achCount: Record<string, number> = {};
  for (const row of ach ?? []) {
    const uid = (row as Record<string, unknown>).user_id as string;
    achCount[uid] = (achCount[uid] ?? 0) + 1;
  }

  // Streaks (longest)
  const { data: streaks } = await supabase
    .from("user_streaks")
    .select("user_id, longest_streak")
    .in("user_id", ids)
    .eq("streak_type", "daily");
  const streakMap: Record<string, number> = {};
  for (const row of streaks ?? []) {
    streakMap[(row as Record<string, unknown>).user_id as string] =
      (row as Record<string, unknown>).longest_streak as number;
  }

  // Period totals (from vxp_transactions) when period != lifetime
  const periodTotal: Record<string, { total: number; count: number }> = {};
  if (start) {
    const { data: tx } = await supabase
      .from("vxp_transactions")
      .select("user_id, amount")
      .gte("created_at", start.toISOString())
      .gt("amount", 0);
    for (const row of tx ?? []) {
      const uid = (row as Record<string, unknown>).user_id as string;
      const amt = Number((row as Record<string, unknown>).amount) || 0;
      if (!periodTotal[uid]) periodTotal[uid] = { total: 0, count: 0 };
      periodTotal[uid].total += amt;
      periodTotal[uid].count += 1;
    }
  }

  const assembled = profiles.map((p: Record<string, unknown>) => {
    const id = p.id as string;
    const base: RankInput & Record<string, unknown> = {
      id,
      display_name: p.display_name,
      avatar_url: p.avatar_url,
      badge_name: p.badge_name,
      level: p.level,
      current_vxp: p.current_vxp,
      lifetime_vxp: p.lifetime_vxp,
      achievement_count: achCount[id] ?? 0,
      longest_streak: streakMap[id] ?? 0,
      created_at: p.created_at,
      period_total: periodTotal[id]?.total ?? 0,
      period_count: periodTotal[id]?.count ?? 0,
    };
    return base as unknown as RankInput;
  });

  // Deterministic ranking per AI/73 (stable, no random):
  // current_vxp > lifetime_vxp > achievement_count > longest_streak > created_at
  const sorters: Array<(u: RankInput) => number> = [
    (u) => Number(u.current_vxp) || 0,
    (u) => Number(u.lifetime_vxp) || 0,
    (u) => Number(u.achievement_count) || 0,
    (u) => Number(u.longest_streak) || 0,
    (u) => -new Date(u.created_at).getTime(),
  ];

  assembled.sort((a, b) => {
    for (const s of sorters) {
      const d = s(b) - s(a);
      if (d !== 0) return d > 0 ? 1 : -1;
    }
    return 0;
  });

  return assembled;
}
