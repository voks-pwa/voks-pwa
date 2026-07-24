import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { corsHeaders } from "../_shared/cors.ts";

const WP_API_URL =
  Deno.env.get("WP_API_URL") ?? "https://voksradio.com/wp-json/wp/v2";

interface WPMission {
  id: number;
  acf?: { mission_campaign_slug?: string };
}

const querySchema = z.object({
  slug: z.string().min(1, "campaign slug is required"),
});

async function getCampaignMissionIds(slug: string): Promise<number[]> {
  const res = await fetch(`${WP_API_URL}/missions?per_page=100&_fields=id,acf`);
  if (!res.ok) return [];
  const missions = (await res.json()) as WPMission[];
  return missions
    .filter((m) => m.acf?.mission_campaign_slug === slug)
    .map((m) => m.id);
}

function topN(
  map: Record<string, number>,
  n = 5,
): Array<{ key: string; value: number }> {
  return Object.entries(map)
    .filter(([k]) => k && k !== "unknown")
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

Deno.serve(async (req) => {
  console.log("[campaign-analytics] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.warn("[campaign-analytics] missing authorization");
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
      console.warn("[campaign-analytics] unauthorized");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: corsHeaders },
      );
    }

    const url = new URL(req.url);
    const slugParam = url.searchParams.get("slug") ??
      (await req.json().catch(() => ({}))).slug;

    const parsed = querySchema.safeParse({ slug: slugParam });
    if (!parsed.success) {
      console.warn("[campaign-analytics] validation failed: missing slug");
      return new Response(
        JSON.stringify({ success: false, error: "Missing campaign slug" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const { slug } = parsed.data;
    console.log("[campaign-analytics] querying campaign:", slug);

    const missionIds = await getCampaignMissionIds(slug);
    if (missionIds.length === 0) {
      console.log("[campaign-analytics] no missions found for campaign:", slug);
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            slug,
            missionCount: 0,
            participants: 0,
            completedParticipants: 0,
            joinRate: 0,
            completionRate: 0,
            rewardClaimed: 0,
            avgMissionsCompleted: 0,
            avgXpEarned: 0,
            funnel: { participants: 0, started: 0, completed: 0 },
            topMissions: [],
            audience: { provinces: [], cities: [], gender: [] },
            referrals: 0,
            dailyParticipation: [],
          },
        }),
        { headers: corsHeaders },
      );
    }

    const { data: progress } = await supabase
      .from("missions_progress")
      .select("user_id, mission_id, progress, completed, claimed, updated_at")
      .in("mission_id", missionIds);

    const rows = progress ?? [];

    const userIds = new Set(rows.map((r) => r.user_id));
    const participants = userIds.size;

    const byUser = new Map<string, Set<number>>();
    const claimedUsers = new Set<string>();
    const missionCompletionCount = new Map<number, number>();
    const dailyMap: Record<string, number> = {};

    for (const r of rows) {
      if (!byUser.has(r.user_id)) byUser.set(r.user_id, new Set());
      byUser.get(r.user_id)!.add(r.mission_id);

      if (r.completed) {
        missionCompletionCount.set(
          r.mission_id,
          (missionCompletionCount.get(r.mission_id) ?? 0) + 1,
        );
      }
      if (r.claimed) {
        claimedUsers.add(r.user_id);
      }
      if (r.updated_at) {
        const d = new Date(r.updated_at).toISOString().slice(0, 10);
        dailyMap[d] = (dailyMap[d] ?? 0) + 1;
      }
    }

    let completedParticipants = 0;
    let sumUserMissions = 0;
    for (const [, missionSet] of byUser) {
      sumUserMissions += missionSet.size;
      if (missionSet.size >= missionIds.length) completedParticipants += 1;
    }

    const missionCount = missionIds.length;
    const avgMissionsCompleted =
      participants > 0 ? sumUserMissions / participants : 0;

    const rewardClaimed = claimedUsers.size;

    let referrals = 0;
    if (participants > 0) {
      const { count } = await supabase
        .from("referrals")
        .select("*", { count: "exact", head: true })
        .in("referrer_id", [...userIds]);
      referrals = count ?? 0;
    }

    const provinces: Record<string, number> = {};
    const cities: Record<string, number> = {};
    const gender: Record<string, number> = {};
    if (participants > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("province, city, gender")
        .in("id", [...userIds])
        .limit(2000);
      for (const p of profiles ?? []) {
        if (p.province) provinces[p.province] = (provinces[p.province] ?? 0) + 1;
        if (p.city) cities[p.city] = (cities[p.city] ?? 0) + 1;
        if (p.gender) gender[p.gender] = (gender[p.gender] ?? 0) + 1;
      }
    }

    const started = participants;
    const joinRate = missionCount > 0 ? participants : 0;
    const completionRate =
      participants > 0 ? completedParticipants / participants : 0;

    const dailyParticipation = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    console.log("[campaign-analytics] ✔ response, participants:", participants);
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          slug,
          missionCount,
          participants,
          completedParticipants,
          joinRate,
          completionRate,
          rewardClaimed,
          avgMissionsCompleted,
          avgXpEarned: 0,
          funnel: { participants, started, completed: completedParticipants },
          topMissions: topN(
            Object.fromEntries(missionCompletionCount),
            5,
          ),
          audience: {
            provinces: topN(provinces, 6),
            cities: topN(cities, 6),
            gender: topN(gender, 4),
          },
          referrals,
          dailyParticipation,
        },
      }),
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("[campaign-analytics] ✖ EXCEPTION:", String(error));
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: corsHeaders },
    );
  }
});
