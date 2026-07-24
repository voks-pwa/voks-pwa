import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";

const WP_BASE = "https://voksradio.com/wp-json/wp/v2";

const actionSchema = z.object({
  action: z.enum(["dashboard", "users", "transactions", "missions", "rewards"]).optional().default("dashboard"),
});

Deno.serve(async (req) => {
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
    const body =
      req.method === "POST"
        ? await req.json().catch(() => ({}))
        : {};

    const parsed = actionSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("[admin-dashboard] validation failed:", parsed.error.issues.map(i => i.message).join("; "));
      return new Response(
        JSON.stringify({ success: false, error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[admin-dashboard] validation passed, action:", parsed.data.action);

    const { action } = parsed.data;

    switch (action) {
      case "dashboard": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekStr = weekAgo.toISOString();

        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        const monthStr = monthAgo.toISOString();

        const [
          users,
          transactions,
          missions,
          rewards,
          topUsers,
          recentActivity,
          missionsToday,
          redemptionsToday,
          usersThisWeek,
          usersThisMonth,
          pendingBroadcasts,
          broadcastCount,
          notificationCount,
          uniqueRedeemers,
          uniqueMissionCompleters,
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("vxp_transactions").select("*", { count: "exact", head: true }),
          supabase.from("mission_completions").select("*", { count: "exact", head: true }),
          supabase.from("reward_redemptions").select("*", { count: "exact", head: true }),
          supabase.from("profiles")
            .select("id, display_name, avatar_url, badge_name, level, lifetime_vxp")
            .order("lifetime_vxp", { ascending: false })
            .limit(10),
          supabase.from("vxp_transactions")
            .select("*, profiles(display_name, avatar_url)")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase.from("mission_completions")
            .select("*", { count: "exact", head: true })
            .gte("completed_at", todayStr),
          supabase.from("reward_redemptions")
            .select("*", { count: "exact", head: true })
            .gte("redeemed_at", todayStr),
          supabase.from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", weekStr),
          supabase.from("profiles")
            .select("*", { count: "exact", head: true })
            .gte("created_at", monthStr),
          supabase.from("broadcasts")
            .select("*", { count: "exact", head: true })
            .is("sent_at", null),
          supabase.from("broadcasts").select("*", { count: "exact", head: true }),
          supabase.from("notifications").select("*", { count: "exact", head: true }),
          supabase.from("reward_redemptions")
            .select("user_id", { count: "exact", head: true })
            .not("reward_status", "eq", "cancelled"),
          supabase.from("mission_completions")
            .select("user_id", { count: "exact", head: true }),
        ]);

        // ── AzuraCast current listeners ──
        let currentListeners = 0;
        const legacyUrl = Deno.env.get("AZURACAST_API_URL") ?? "";
        const azuraBaseUrl = Deno.env.get("AZURACAST_URL") ?? "";
        const azuraStationId = Deno.env.get("AZURACAST_STATION_ID") ?? "";
        const azuraKey = Deno.env.get("AZURACAST_API_KEY") ?? "";

        console.log("[admin-dashboard] AZURACAST_API_URL present:", !!legacyUrl);
        console.log("[admin-dashboard] AZURACAST_URL present:", !!azuraBaseUrl);
        console.log("[admin-dashboard] AZURACAST_STATION_ID present:", !!azuraStationId);
        console.log("[admin-dashboard] AZURACAST_API_KEY present:", !!azuraKey);

        let azFetchUrl = "";
        if (legacyUrl) {
          azFetchUrl = legacyUrl;
        } else if (azuraBaseUrl && azuraStationId) {
          azFetchUrl = `${azuraBaseUrl.replace(/\/$/, "")}/api/station/${azuraStationId}/listeners`;
        }

        if (azFetchUrl && azuraKey) {
          try {
            console.log("[admin-dashboard] Fetching AzuraCast listeners");
            const azResp = await fetchWithRetry(azFetchUrl, {
              headers: { Authorization: `Bearer ${azuraKey}`, Accept: "application/json" },
              signal: AbortSignal.timeout(8000),
            });
            console.log("[admin-dashboard] AzuraCast status:", azResp.status);
            if (azResp.ok) {
              const raw = await azResp.json();
              if (Array.isArray(raw)) {
                currentListeners = raw.length;
              } else if (typeof raw === "object" && raw !== null) {
                const possible = (raw as Record<string, unknown>).listeners ?? (raw as Record<string, unknown>).data ?? null;
                currentListeners = Array.isArray(possible) ? possible.length : 0;
              }
            }
          } catch {
            // AzuraCast unavailable — keep 0
          }
        }

        // ── WordPress content counts ──
        let podcastCount = 0;
        let promoCount = 0;
        try {
          const [podcastResp, promoResp] = await Promise.all([
            fetchWithRetry(`${WP_BASE}/voks-plus?_embed&per_page=1`, {
              headers: { Accept: "application/json" },
              signal: AbortSignal.timeout(5000),
            }),
            fetchWithRetry(`${WP_BASE}/promo?_embed&per_page=1`, {
              headers: { Accept: "application/json" },
              signal: AbortSignal.timeout(5000),
            }),
          ]);
          if (podcastResp.ok) {
            const total = podcastResp.headers.get("X-WP-Total");
            podcastCount = total ? parseInt(total, 10) : 0;
          }
          if (promoResp.ok) {
            const total = promoResp.headers.get("X-WP-Total");
            promoCount = total ? parseInt(total, 10) : 0;
          }
        } catch {
          // WordPress fetch failed — counts stay 0
        }

        return new Response(
          JSON.stringify({
            success: true,
            stats: {
              users: users.count ?? 0,
              transactions: transactions.count ?? 0,
              completedMissions: missions.count ?? 0,
              rewardRedemptions: rewards.count ?? 0,
              missionsToday: missionsToday.count ?? 0,
              redemptionsToday: redemptionsToday.count ?? 0,
              usersThisWeek: usersThisWeek.count ?? 0,
              usersThisMonth: usersThisMonth.count ?? 0,
              pendingBroadcasts: pendingBroadcasts.count ?? 0,
              currentListeners,
              totalBroadcasts: broadcastCount.count ?? 0,
              totalNotifications: notificationCount.count ?? 0,
              totalRewards: uniqueRedeemers.count ?? 0,
              totalMissionsCompleted: uniqueMissionCompleters.count ?? 0,
              podcastCount,
              promoCount,
            },
            topUsers: topUsers.data ?? [],
            recentActivity: recentActivity.data ?? [],
            generated_at: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "users": {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, display_name, email, avatar_url, badge_name, role, level, current_vxp, lifetime_vxp, created_at")
          .order("lifetime_vxp", { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, users: data ?? [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "transactions": {
        const { data, error } = await supabase
          .from("vxp_transactions")
          .select("*, profiles(display_name, avatar_url)")
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, transactions: data ?? [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "missions": {
        const { data, error } = await supabase
          .from("mission_completions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, missions: data ?? [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "rewards": {
        const { data, error } = await supabase
          .from("reward_redemptions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, rewards: data ?? [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, message: "Unknown action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
