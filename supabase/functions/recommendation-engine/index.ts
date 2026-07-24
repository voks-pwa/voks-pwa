import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { corsHeaders } from "../_shared/cors.ts";
import { parseBody, validationError } from "../_shared/validation.ts";

const WP_API_URL =
  Deno.env.get("WP_API_URL") ?? "https://voksradio.com/wp-json/wp/v2";

interface WPMission {
  id: number;
  title: { rendered: string };
  acf?: {
    mission_description?: string;
    mission_vxp?: number;
    mission_type?: string;
    mission_campaign_slug?: string;
  };
}

interface WPReward {
  id: number;
  title: { rendered: string };
  acf?: {
    reward_name?: string;
    reward_subtitle?: string;
    reward_cost?: number;
    reward_featured?: boolean;
    reward_type?: string;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>;
  };
}

const inputSchema = z.object({
  type: z.enum(["popular-missions", "popular-rewards", "personalized"]),
  user_id: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

Deno.serve(async (req) => {
  console.log("[recommendation-engine] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    console.warn("[recommendation-engine] missing authorization");
    return new Response(
      JSON.stringify({ success: false, error: "Missing authorization" }),
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { authorization: authHeader } } },
    );

    const rawBody = await req.text().catch(() => null);
    const parsed = parseBody(rawBody, inputSchema);
    if (!parsed.success) {
      console.warn("[recommendation-engine] validation failed:", parsed.error);
      return validationError(parsed.error, corsHeaders);
    }
    console.log("[recommendation-engine] validation passed, type:", parsed.data.type);

    const { type, user_id, limit } = parsed.data;
    const p_limit = Math.min(limit ?? 10, 50);

    if (type === "popular-missions") {
      console.log("[recommendation-engine] fetching popular missions");
      const { data: idsData, error: idsError } = await supabase
        .rpc("get_popular_mission_ids", { p_limit });

      if (idsError) throw idsError;

      const result = idsData as unknown as { success: boolean; results: Array<{ mission_id: number; completion_count: number }> };
      const missions = result.results ?? [];

      const wpMissions = await fetchWpMissions(missions.map((m) => m.mission_id));

      const enriched = missions.map((m) => ({
        mission_id: m.mission_id,
        completion_count: m.completion_count,
        ...(wpMissions[m.mission_id] ?? { title: `Mission #${m.mission_id}` }),
      }));

      console.log("[recommendation-engine] ✔ popular-missions, count:", enriched.length);
      return new Response(
        JSON.stringify({ success: true, data: enriched }),
        { headers: corsHeaders },
      );
    }

    if (type === "popular-rewards") {
      console.log("[recommendation-engine] fetching popular rewards");
      const { data: idsData, error: idsError } = await supabase
        .rpc("get_popular_reward_ids", { p_limit });

      if (idsError) throw idsError;

      const result = idsData as unknown as { success: boolean; results: Array<{ reward_id: number; name: string; cost: number; redeem_count: number }> };
      const rewards = result.results ?? [];

      const wpRewards = await fetchWpRewards(rewards.map((r) => r.reward_id));

      const enriched = rewards.map((r) => ({
        reward_id: r.reward_id,
        redeem_count: r.redeem_count,
        cost: r.cost,
        name: r.name,
        image_url: wpRewards[r.reward_id]?.image_url ?? null,
      }));

      console.log("[recommendation-engine] ✔ popular-rewards, count:", enriched.length);
      return new Response(
        JSON.stringify({ success: true, data: enriched }),
        { headers: corsHeaders },
      );
    }

    if (type === "personalized" && user_id) {
      console.log("[recommendation-engine] fetching personalized recs for user:", user_id);
      const { data: recData, error: recError } = await supabase
        .rpc("get_user_recommendation_ids", { p_user_id: user_id, p_limit });

      if (recError) throw recError;

      const result = recData as unknown as {
        success: boolean;
        data: {
          recommended_missions: number[];
          popular_missions: Array<{ mission_id: number; count: number }>;
          redeemed_count: number;
        };
      };
      const recs = result.data;

      const allMissionIds = [
        ...(recs?.recommended_missions ?? []),
        ...(recs?.popular_missions ?? []).map((m) => m.mission_id),
      ];

      const wpMissions = allMissionIds.length > 0
        ? await fetchWpMissions(allMissionIds)
        : {};

      const enrichedRecs = (recs?.recommended_missions ?? []).map((id) => ({
        mission_id: id,
        ...(wpMissions[id] ?? { title: `Mission #${id}` }),
      }));

      const enrichedPopular = (recs?.popular_missions ?? []).map((m) => ({
        mission_id: m.mission_id,
        count: m.count,
        ...(wpMissions[m.mission_id] ?? { title: `Mission #${m.mission_id}` }),
      }));

      console.log("[recommendation-engine] ✔ personalized response");
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            recommended_missions: enrichedRecs,
            popular_missions: enrichedPopular,
            redeemed_count: recs?.redeemed_count ?? 0,
          },
        }),
        { headers: corsHeaders },
      );
    }

    console.warn("[recommendation-engine] invalid type or missing user_id");
    return new Response(
      JSON.stringify({ success: false, error: "Invalid type or missing user_id" }),
      { status: 400, headers: corsHeaders },
    );
  } catch (err) {
    console.error("[recommendation-engine] ✖ EXCEPTION:", err instanceof Error ? err.message : "Unknown error");
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      { status: 500, headers: corsHeaders },
    );
  }
});

async function fetchWpMissions(ids: number[]): Promise<Record<number, { title: string; description?: string; vxp?: number }>> {
  if (ids.length === 0) return {};

  try {
    const res = await fetch(`${WP_API_URL}/missions?per_page=100&_fields=id,title,acf`);
    if (!res.ok) return {};
    const missions = await res.json() as WPMission[];

    const map: Record<number, { title: string; description?: string; vxp?: number }> = {};
    for (const m of missions) {
      if (ids.includes(m.id)) {
        map[m.id] = {
          title: m.title.rendered,
          description: m.acf?.mission_description,
          vxp: m.acf?.mission_vxp,
        };
      }
    }
    return map;
  } catch {
    return {};
  }
}

async function fetchWpRewards(ids: number[]): Promise<Record<number, { image_url?: string }>> {
  if (ids.length === 0) return {};

  try {
    const res = await fetch(`${WP_API_URL}/reward?_embed&per_page=100&_fields=id,_embedded`);
    if (!res.ok) return {};
    const rewards = await res.json() as WPReward[];

    const map: Record<number, { image_url?: string }> = {};
    for (const r of rewards) {
      if (ids.includes(r.id)) {
        map[r.id] = {
          image_url: r._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
        };
      }
    }
    return map;
  } catch {
    return {};
  }
}
