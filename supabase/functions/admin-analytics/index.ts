import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { requireAdmin } from "../_shared/adminAuth.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry } from "../_shared/retry.ts";

const inputSchema = z.object({
  days: z.number().int().min(1).max(365).optional().default(30),
});

interface AzuraCastListener {
  ip: string;
  user_agent: string;
  connected_on: string;
  connected_seconds: number;
  device?: { platform?: string; browser?: string; is_mobile?: boolean };
}

interface NowPlayingData {
  isLive: boolean;
  streamerName: string;
  songTitle: string;
  songArtist: string;
  bitrate: number;
  listeners: number;
}

Deno.serve(async (req) => {
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

    const body =
      req.method === "POST"
        ? await req.json().catch(() => ({}))
        : {};

    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      console.warn("[admin-analytics] validation failed:", parsed.error.issues.map(i => i.message).join("; "));
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log("[admin-analytics] validation passed");

    const { days } = parsed.data;

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    // ── Aggregate helpers ──
    function aggByDate<T extends Record<string, unknown>>(
      items: T[],
      dateField: keyof T
    ): Record<string, number> {
      const map: Record<string, number> = {};
      for (const item of items) {
        const d = new Date(item[dateField] as string).toISOString().slice(0, 10);
        map[d] = (map[d] ?? 0) + 1;
      }
      return map;
    }

    function aggXPByDate(
      items: { created_at: string; amount: number }[]
    ): Record<string, number> {
      const map: Record<string, number> = {};
      for (const item of items) {
        const d = new Date(item.created_at).toISOString().slice(0, 10);
        map[d] = (map[d] ?? 0) + Number(item.amount);
      }
      return map;
    }

    function aggByField(items: { [key: string]: unknown }[], field: string): Record<string, number> {
      const map: Record<string, number> = {};
      for (const item of items) {
        const val = String(item[field] ?? "unknown");
        map[val] = (map[val] ?? 0) + 1;
      }
      return map;
    }

    // ── Section 1: Row counts (isolated) ──
    let profileCount: number = 0;
    let transactionCount: number = 0;
    let missionCount: number = 0;
    let redemptionCount: number = 0;
    let missionUniqueUsers: number = 0;
    let rewardUniqueUsers: number = 0;

    try {
      const results = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("vxp_transactions").select("*", { count: "exact", head: true }),
        supabase.from("mission_completions").select("*", { count: "exact", head: true }),
        supabase.from("reward_redemptions").select("*", { count: "exact", head: true }),
        supabase.from("mission_completions").select("user_id", { count: "exact", head: true }),
        supabase.from("reward_redemptions").select("user_id", { count: "exact", head: true }).not("reward_status", "eq", "cancelled"),
      ]);
      profileCount = results[0].count ?? 0;
      transactionCount = results[1].count ?? 0;
      missionCount = results[2].count ?? 0;
      redemptionCount = results[3].count ?? 0;
      missionUniqueUsers = results[4].count ?? 0;
      rewardUniqueUsers = results[5].count ?? 0;
    } catch {
      // Section 1 failed — counts stay 0
    }

    // ── Section 2: Trend data (isolated) ──
    let profilesData: { created_at: string }[] = [];
    let transactionsData: { created_at: string; amount: number }[] = [];
    let completionsData: { completed_at: string; mission_id: number }[] = [];
    let redemptionsData: { redeemed_at: string; reward_status: string }[] = [];

    try {
      const results = await Promise.all([
        supabase.from("profiles").select("created_at").gte("created_at", sinceStr).order("created_at", { ascending: true }),
        supabase.from("vxp_transactions").select("created_at, amount").gte("created_at", sinceStr).gt("amount", 0).order("created_at", { ascending: true }),
        supabase.from("mission_completions").select("completed_at, mission_id").gte("completed_at", sinceStr).order("completed_at", { ascending: true }),
        supabase.from("reward_redemptions").select("redeemed_at, reward_status").gte("redeemed_at", sinceStr).order("redeemed_at", { ascending: true }),
      ]);
      profilesData = results[0].data ?? [];
      transactionsData = results[1].data ?? [];
      completionsData = results[2].data ?? [];
      redemptionsData = results[3].data ?? [];
    } catch {
      // Section 2 failed — trends stay empty
    }

    const usersByDate = aggByDate(profilesData, "created_at");
    const xpByDate = aggXPByDate(transactionsData);
    const missionsByDate = aggByDate(completionsData, "completed_at");
    const redemptionsByDate = aggByDate(redemptionsData, "redeemed_at");

    // ── Section 3: Demographics (isolated) ──
    let cityData: { city: string }[] = [];
    let provinceData: { province: string }[] = [];
    let genderData: { gender: string }[] = [];

    try {
      const results = await Promise.all([
        supabase.from("profiles").select("city").not("city", "is", null).limit(1000),
        supabase.from("profiles").select("province").not("province", "is", null).limit(1000),
        supabase.from("profiles").select("gender").not("gender", "is", null).limit(1000),
      ]);
      cityData = results[0].data ?? [];
      provinceData = results[1].data ?? [];
      genderData = results[2].data ?? [];
    } catch {
      // Section 3 failed — demographics stay empty
    }

    // ── Section 4: Broadcast & notification data (isolated) ──
    let broadcastRows: { created_at: string; sent_at: string | null }[] = [];
    let notificationRows: { read_at: string | null }[] = [];
    let rewardBreakdownRows: { reward_status: string }[] = [];
    let missionBreakdownRows: { mission_id: number }[] = [];

    try {
      const results = await Promise.all([
        supabase.from("broadcasts").select("created_at, sent_at"),
        supabase.from("notifications").select("read_at"),
        supabase.from("reward_redemptions").select("reward_status").not("reward_status", "is", null).limit(5000),
        supabase.from("mission_completions").select("mission_id").not("mission_id", "is", null).limit(5000),
      ]);
      broadcastRows = results[0].data ?? [];
      notificationRows = results[1].data ?? [];
      rewardBreakdownRows = results[2].data ?? [];
      missionBreakdownRows = results[3].data ?? [];
    } catch {
      // Section 4 failed — broadcast/notification/breakdown stay empty
    }

    const totalBroadcasts = broadcastRows.length;
    const sentBroadcasts = broadcastRows.filter((b) => b.sent_at).length;
    const pendingBroadcasts = totalBroadcasts - sentBroadcasts;
    const totalNotifications = notificationRows.length;
    const readNotifications = notificationRows.filter((n) => n.read_at).length;
    const unreadNotifications = totalNotifications - readNotifications;
    const rewardByStatus = aggByField(rewardBreakdownRows, "reward_status");
    const missionByType = aggByField(missionBreakdownRows, "mission_id");

    // ── Broadcast trend (per-day sent/pending) ──
    const broadcastTrend: Record<string, { sent: number; pending: number }> = {};
    for (const b of broadcastRows) {
      const createdDay = new Date(b.created_at).toISOString().slice(0, 10);
      if (!broadcastTrend[createdDay]) broadcastTrend[createdDay] = { sent: 0, pending: 0 };
      if (b.sent_at) {
        const sentDay = new Date(b.sent_at).toISOString().slice(0, 10);
        if (!broadcastTrend[sentDay]) broadcastTrend[sentDay] = { sent: 0, pending: 0 };
        broadcastTrend[sentDay].sent += 1;
      } else {
        broadcastTrend[createdDay].pending += 1;
      }
    }

    // ── Section 5: Engagement — activity_logs + user_favorites (isolated) ──
    const activitySince = new Date();
    activitySince.setDate(activitySince.getDate() - Math.max(days, 30));
    const activitySinceStr = activitySince.toISOString();
    const sinceDateStr = since.toISOString().slice(0, 10);

    let activityRows: { created_at: string; user_id: string; activity_type: string; metadata: Record<string, unknown> | null }[] = [];
    try {
      const pages: typeof activityRows = [];
      for (let offset = 0; offset < 20000; offset += 1000) {
        const { data, error } = await supabase
          .from("activity_logs")
          .select("created_at, user_id, activity_type, metadata")
          .gte("created_at", activitySinceStr)
          .order("created_at", { ascending: false })
          .range(offset, offset + 999);
        if (error) {
          console.error("[admin-analytics] activity_logs error:", error.message);
          break;
        }
        if (!data || data.length === 0) break;
        pages.push(...data as typeof pages);
        if (data.length < 1000) break;
      }
      activityRows = pages;
    } catch (err) {
      console.error("[admin-analytics] activity_logs fetch threw:", err instanceof Error ? err.message : String(err));
    }

    // Active users: DAU (today), WAU (7d), MAU (30d) — distinct user_id
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOf7d = new Date(startOfToday.getTime() - 6 * 86400000);
    const startOf30d = new Date(startOfToday.getTime() - 29 * 86400000);

    const dauSet = new Set<string>();
    const wauSet = new Set<string>();
    const mauSet = new Set<string>();
    const activeUsersByDate: Record<string, Set<string>> = {};
    for (const row of activityRows) {
      const t = new Date(row.created_at).getTime();
      if (t >= startOfToday.getTime()) dauSet.add(row.user_id);
      if (t >= startOf7d.getTime()) wauSet.add(row.user_id);
      if (t >= startOf30d.getTime()) mauSet.add(row.user_id);
      const day = new Date(row.created_at).toISOString().slice(0, 10);
      if (day >= sinceDateStr) {
        (activeUsersByDate[day] ??= new Set()).add(row.user_id);
      }
    }
    const activeTrend: Record<string, number> = {};
    for (const [day, set] of Object.entries(activeUsersByDate)) {
      activeTrend[day] = set.size;
    }

    // Stream plays, banner clicks, page views
    const playsByDate: Record<string, number> = {};
    const clicksByDate: Record<string, number> = {};
    const topPromoMap: Record<string, { count: number; title: string }> = {};
    const topPageMap: Record<string, number> = {};
    let streamPlaysTotal = 0;
    let bannerClicksTotal = 0;

    for (const row of activityRows) {
      if (row.created_at < sinceStr) continue;
      const day = new Date(row.created_at).toISOString().slice(0, 10);
      const meta = row.metadata ?? {};
      if (row.activity_type === "player_play") {
        streamPlaysTotal += 1;
        playsByDate[day] = (playsByDate[day] ?? 0) + 1;
      } else if (row.activity_type === "banner_click") {
        bannerClicksTotal += 1;
        clicksByDate[day] = (clicksByDate[day] ?? 0) + 1;
        const id = String(meta.promo_id ?? "unknown");
        const title = String(meta.promo_title ?? "");
        if (!topPromoMap[id]) topPromoMap[id] = { count: 0, title };
        topPromoMap[id].count += 1;
      } else if (row.activity_type === "page_view") {
        const path = String(meta.path ?? meta.page ?? "unknown");
        topPageMap[path] = (topPageMap[path] ?? 0) + 1;
      }
    }

    const topPromos = Object.entries(topPromoMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([id, v]) => ({ id, title: v.title, count: v.count }));

    const topPages = Object.entries(topPageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    // Top favorite programs & announcers from user_favorites
    let topPrograms: { id: string; count: number }[] = [];
    let topAnnouncers: { id: string; count: number }[] = [];
    try {
      const favPages: { target_type: string; target_id: string }[] = [];
      for (let offset = 0; offset < 20000; offset += 1000) {
        const { data, error } = await supabase
          .from("user_favorites")
          .select("target_type, target_id")
          .order("created_at", { ascending: false })
          .range(offset, offset + 999);
        if (error) {
          console.error("[admin-analytics] user_favorites error:", error.message);
          break;
        }
        if (!data || data.length === 0) break;
        favPages.push(...data as typeof favPages);
        if (data.length < 1000) break;
      }
      const favProgram = new Map<string, number>();
      const favAnnouncer = new Map<string, number>();
      for (const fav of favPages) {
        if (fav.target_type === "program") favProgram.set(fav.target_id, (favProgram.get(fav.target_id) ?? 0) + 1);
        else if (fav.target_type === "announcer") favAnnouncer.set(fav.target_id, (favAnnouncer.get(fav.target_id) ?? 0) + 1);
      }
      topPrograms = [...favProgram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, count]) => ({ id, count }));
      topAnnouncers = [...favAnnouncer.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, count]) => ({ id, count }));
    } catch (err) {
      console.error("[admin-analytics] user_favorites fetch threw:", err instanceof Error ? err.message : String(err));
    }

    // ── External: AzuraCast listener data (isolated) ──
    let azuracastListeners: AzuraCastListener[] = [];
    let azuracastError: string | null = null;

    try {
      // Support both old (AZURACAST_API_URL full URL) and new (AZURACAST_URL + AZURACAST_STATION_ID) secret names
      const legacyUrl = Deno.env.get("AZURACAST_API_URL") ?? "";
      const azuraBaseUrl = Deno.env.get("AZURACAST_URL") ?? "";
      const azuraStationId = Deno.env.get("AZURACAST_STATION_ID") ?? "";
      const azuraKey = Deno.env.get("AZURACAST_API_KEY") ?? "";

      console.log("[admin-analytics] AZURACAST_API_URL present:", !!legacyUrl);
      console.log("[admin-analytics] AZURACAST_URL present:", !!azuraBaseUrl);
      console.log("[admin-analytics] AZURACAST_STATION_ID present:", !!azuraStationId);
      console.log("[admin-analytics] AZURACAST_API_KEY present:", !!azuraKey);

      let fetchUrl = "";
      if (legacyUrl) {
        fetchUrl = legacyUrl;
        console.log("[admin-analytics] Using legacy AZURACAST_API_URL");
      } else if (azuraBaseUrl && azuraStationId) {
        fetchUrl = `${azuraBaseUrl.replace(/\/$/, "")}/api/station/${azuraStationId}/listeners`;
        console.log("[admin-analytics] Using constructed URL from AZURACAST_URL + AZURACAST_STATION_ID");
      }

      if (!fetchUrl || !azuraKey) {
        const missing: string[] = [];
        if (!fetchUrl) missing.push("AZURACAST_API_URL (or AZURACAST_URL + AZURACAST_STATION_ID)");
        if (!azuraKey) missing.push("AZURACAST_API_KEY");
        azuracastError = `AzuraCast not configured: missing ${missing.join(", ")}`;
        console.log("[admin-analytics]", azuracastError);
      } else {
        const maskedUrl = fetchUrl.replace(/\/api\/station\/\d+\/listeners$/, "/api/station/***/listeners");
        console.log("[admin-analytics] Fetching", maskedUrl);
        console.log("[admin-analytics] Auth header: Bearer [redacted, length=" + azuraKey.length + "]");
        console.log("[admin-analytics] Accept: application/json");

        const response = await fetchWithRetry(fetchUrl, {
          headers: { Authorization: `Bearer ${azuraKey}`, Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        });

        console.log("[admin-analytics] AzuraCast response status:", response.status, response.statusText);
        console.log("[admin-analytics] AzuraCast Content-Type:", response.headers.get("content-type"));

        if (response.ok) {
          const body = await response.text();
          const trimmed = body.length > 500 ? body.substring(0, 500) + "..." : body;
          console.log("[admin-analytics] AzuraCast raw body preview:", trimmed);

          let parsed: unknown;
          try {
            parsed = JSON.parse(body);
          } catch {
            azuracastError = `AzuraCast returned non-JSON body: ${trimmed.substring(0, 100)}`;
            console.log("[admin-analytics] Parse error:", azuracastError);
            parsed = null;
          }

          if (parsed) {
            if (Array.isArray(parsed)) {
              azuracastListeners = parsed as AzuraCastListener[];
              console.log("[admin-analytics] Parsed as array, count:", azuracastListeners.length);
            } else if (typeof parsed === "object" && parsed !== null) {
              // AzuraCast may wrap listeners in an object
              const obj = parsed as Record<string, unknown>;
              const possible = obj.listeners ?? obj.data ?? obj.results ?? null;
              if (Array.isArray(possible)) {
                azuracastListeners = possible as AzuraCastListener[];
                console.log("[admin-analytics] Parsed from wrapped field, count:", azuracastListeners.length);
              } else {
                azuracastError = `AzuraCast returned non-array JSON object: ${JSON.stringify(parsed).substring(0, 200)}`;
                console.log("[admin-analytics] Unexpected shape:", azuracastError);
              }
            } else {
              azuracastError = `AzuraCast returned unexpected type: ${typeof parsed}`;
              console.log("[admin-analytics] Type error:", azuracastError);
            }
          }
        } else {
          const errBody = await response.text().catch(() => "(no body)");
          azuracastError = `AzuraCast returned ${response.status}: ${errBody.substring(0, 200)}`;
          console.log("[admin-analytics] HTTP error:", azuracastError);
        }
      }
    } catch (err) {
      azuracastError = `AzuraCast fetch threw: ${err instanceof Error ? err.message : String(err)}`;
      console.log("[admin-analytics] Fetch threw:", azuracastError);
    }

    // ── Listener trend (per-day session count) ──
    const listenerTrend: Record<string, number> = {};
    for (const listener of azuracastListeners) {
      const d = new Date(listener.connected_on).toISOString().slice(0, 10);
      listenerTrend[d] = (listenerTrend[d] ?? 0) + 1;
    }

    // ── External: WordPress content counts (isolated) ──
    let podcastCount = 0;
    let promoCount = 0;
    try {
      const [podcastResp, promoResp] = await Promise.all([
        fetchWithRetry("https://voksradio.com/wp-json/wp/v2/voks-plus?_embed&per_page=1", {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        }),
        fetchWithRetry("https://voksradio.com/wp-json/wp/v2/promo?_embed&per_page=1", {
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

    // ── Device/browser/platform from AzuraCast user agents ──
    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const platformMap: Record<string, number> = {};

    for (const listener of azuracastListeners) {
      const ua = (listener.user_agent ?? "").toLowerCase();
      if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        deviceMap["mobile"] = (deviceMap["mobile"] ?? 0) + 1;
      } else if (ua.includes("tablet") || ua.includes("ipad")) {
        deviceMap["tablet"] = (deviceMap["tablet"] ?? 0) + 1;
      } else {
        deviceMap["desktop"] = (deviceMap["desktop"] ?? 0) + 1;
      }

      if (ua.includes("chrome")) browserMap["Chrome"] = (browserMap["Chrome"] ?? 0) + 1;
      else if (ua.includes("firefox")) browserMap["Firefox"] = (browserMap["Firefox"] ?? 0) + 1;
      else if (ua.includes("safari")) browserMap["Safari"] = (browserMap["Safari"] ?? 0) + 1;
      else if (ua.includes("edge")) browserMap["Edge"] = (browserMap["Edge"] ?? 0) + 1;
      else browserMap["Other"] = (browserMap["Other"] ?? 0) + 1;

      if (ua.includes("android")) platformMap["Android"] = (platformMap["Android"] ?? 0) + 1;
      else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) platformMap["iOS"] = (platformMap["iOS"] ?? 0) + 1;
      else if (ua.includes("windows")) platformMap["Windows"] = (platformMap["Windows"] ?? 0) + 1;
      else if (ua.includes("mac")) platformMap["macOS"] = (platformMap["macOS"] ?? 0) + 1;
      else if (ua.includes("linux")) platformMap["Linux"] = (platformMap["Linux"] ?? 0) + 1;
      else platformMap["Other"] = (platformMap["Other"] ?? 0) + 1;
    }

    const countryMap: Record<string, number> = {};
    for (const listener of azuracastListeners) {
      const ip = listener.ip ?? "unknown";
      countryMap[ip.startsWith("::") ? "Unknown" : "Indonesia"] = (countryMap["Indonesia"] ?? 0) + 1;
    }

    const uniqueListeners = azuracastListeners.length;
    const totalConnectedSeconds = azuracastListeners.reduce((sum, l) => sum + (l.connected_seconds ?? 0), 0);
    const avgListeningMinutes = uniqueListeners > 0 ? Math.round(totalConnectedSeconds / uniqueListeners / 60) : 0;

    // Peak today: max value in listenerTrend for today's date
    const today = new Date().toISOString().slice(0, 10);
    const peakToday = Math.max(
      ...Object.entries(listenerTrend)
        .filter(([date]) => date === today)
        .map(([, count]) => count),
      0
    );

    // ── Listener sources derived from user-agent ──
    const sourceMap: Record<string, number> = {};
    for (const listener of azuracastListeners) {
      const ua = (listener.user_agent ?? "").toLowerCase();
      if (ua.includes("tunein") || ua.includes("tune-in")) {
        sourceMap["TuneIn"] = (sourceMap["TuneIn"] ?? 0) + 1;
      } else if (ua.includes("radiogarden") || ua.includes("radio.garden")) {
        sourceMap["Radio Garden"] = (sourceMap["Radio Garden"] ?? 0) + 1;
      } else if (ua.includes("onlineradiobox")) {
        sourceMap["OnlineRadioBox"] = (sourceMap["OnlineRadioBox"] ?? 0) + 1;
      } else if (ua.includes("pwa") || ua.includes("voks-pwa") || ua.includes("serviceworker")) {
        sourceMap["PWA"] = (sourceMap["PWA"] ?? 0) + 1;
      } else if (ua.includes("website") || (ua.includes("mozilla") && !ua.includes("mobile"))) {
        sourceMap["Website"] = (sourceMap["Website"] ?? 0) + 1;
      } else if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        sourceMap["Direct Stream"] = (sourceMap["Direct Stream"] ?? 0) + 1;
      } else {
        sourceMap["Others"] = (sourceMap["Others"] ?? 0) + 1;
      }
    }

    // ── External: AzuraCast nowplaying (isolated) ──
    let nowplayingLive: NowPlayingData | null = null;

    try {
      const legacyUrl = Deno.env.get("AZURACAST_API_URL") ?? "";
      const azuraBaseUrl = Deno.env.get("AZURACAST_URL") ?? "";
      const azuraStationId = Deno.env.get("AZURACAST_STATION_ID") ?? "";
      const azuraKey = Deno.env.get("AZURACAST_API_KEY") ?? "";

      let nowplayingUrl = "";
      if (legacyUrl) {
        nowplayingUrl = legacyUrl.replace(/\/listeners$/, "/nowplaying");
      } else if (azuraBaseUrl && azuraStationId) {
        nowplayingUrl = `${azuraBaseUrl.replace(/\/$/, "")}/api/station/${azuraStationId}/nowplaying`;
      }

      if (nowplayingUrl && azuraKey) {
        const npResp = await fetchWithRetry(nowplayingUrl, {
          headers: { Authorization: `Bearer ${azuraKey}`, Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        });

        if (npResp.ok) {
          const npBody: unknown = await npResp.json();
          const npArr = Array.isArray(npBody) ? npBody : [npBody];
          if (npArr.length > 0) {
            const np = npArr[0] as Record<string, unknown>;
            const liveSection = np.live as Record<string, unknown> | undefined;
            const nowPlayingSection = np.now_playing as Record<string, unknown> | undefined;
            const nowPlayingSong = nowPlayingSection?.song as Record<string, unknown> | undefined;
            const station = np.station as Record<string, unknown> | undefined;
            const mounts = station?.mounts as Array<Record<string, unknown>> | undefined;
            const listenersSection = np.listeners as Record<string, unknown> | undefined;

            nowplayingLive = {
              isLive: liveSection?.is_live === true,
              streamerName: String(liveSection?.streamer_name ?? ""),
              songTitle: String(nowPlayingSong?.title ?? ""),
              songArtist: String(nowPlayingSong?.artist ?? ""),
              bitrate: Number(mounts?.[0]?.bitrate ?? 0),
              listeners: Number(listenersSection?.current ?? 0),
            };
          }
        }
      }
    } catch {
      // nowplaying fetch failed — keep null
    }

    const response = {
      success: true,
      data: {
        totals: {
          users: profileCount,
          transactions: transactionCount,
          missions: missionCount,
          redemptions: redemptionCount,
          currentListeners: uniqueListeners,
          totalListenedMinutes: Math.round(totalConnectedSeconds / 60),
          avgListeningMinutes,
          peakToday,
          totalBroadcasts,
          pendingBroadcasts,
          sentBroadcasts,
          totalNotifications,
          readNotifications,
          unreadNotifications,
          uniqueMissionCompleters: missionUniqueUsers,
          uniqueRedeemers: rewardUniqueUsers,
          podcastCount,
          promoCount,
        },
        trends: {
          users: usersByDate,
          xp: xpByDate,
          missions: missionsByDate,
          redemptions: redemptionsByDate,
        },
        azuracast: {
          listeners: azuracastListeners.slice(0, 200).map((l) => ({
            ip: l.ip,
            userAgent: l.user_agent,
            connectedSeconds: l.connected_seconds,
            connectedAt: l.connected_on,
          })),
          uniqueCount: uniqueListeners,
          totalConnectedSeconds,
          error: azuracastError,
        },
        demographics: {
          cities: aggByField(cityData, "city"),
          provinces: aggByField(provinceData, "province"),
          genders: aggByField(genderData, "gender"),
        },
        wordpress: {
          podcastCount,
          promoCount,
        },
        broadcasts: {
          total: totalBroadcasts,
          sent: sentBroadcasts,
          pending: pendingBroadcasts,
        },
        notifications: {
          total: totalNotifications,
          read: readNotifications,
          unread: unreadNotifications,
        },
        rewardBreakdown: rewardByStatus,
        missionBreakdown: missionByType,
        activeUsers: {
          dau: dauSet.size,
          wau: wauSet.size,
          mau: mauSet.size,
          trend: activeTrend,
        },
        streamPlays: {
          total: streamPlaysTotal,
          trend: playsByDate,
        },
        bannerClicks: {
          total: bannerClicksTotal,
          trend: clicksByDate,
          topPromos,
        },
        topPages,
        topFavorites: {
          programs: topPrograms,
          announcers: topAnnouncers,
        },
        devices: deviceMap,
        browsers: browserMap,
        platforms: platformMap,
        countries: countryMap,
        listenerSources: sourceMap,
        nowplaying: nowplayingLive,
        broadcastTrend,
        listenerTrend,
        days,
      },
    };

    console.log("[admin-analytics] Response shape keys:", Object.keys(response.data).join(", "));
    console.log("[admin-analytics] totals keys:", Object.keys(response.data.totals).join(", "));
    console.log("[admin-analytics] azuracast keys:", Object.keys(response.data.azuracast).join(", "));
    console.log("[admin-analytics] nowplaying type:", typeof response.data.nowplaying, response.data.nowplaying === null ? "null" : "object");
    console.log("[admin-analytics] Full response:", JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
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
