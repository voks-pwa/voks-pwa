import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod";
import { corsHeaders } from "../_shared/cors.ts";

const inputSchema = z.object({
  days: z.number().int().min(1).max(365).optional().default(30),
});

Deno.serve(async (req) => {
  console.log("[reward-analytics] ▶ request", req.method, req.url);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.warn("[reward-analytics] missing authorization");
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
      console.warn("[reward-analytics] unauthorized");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: corsHeaders },
      );
    }

    let bodyInput: Record<string, unknown> = {};
    if (req.method === "POST") {
      try {
        bodyInput = await req.json();
      } catch {
        bodyInput = {};
      }
    }

    const parsed = inputSchema.safeParse(bodyInput);
    if (!parsed.success) {
      console.warn("[reward-analytics] validation failed:", parsed.error.issues.map(i => i.message).join("; "));
      return new Response(
        JSON.stringify({ success: false, error: "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { days } = parsed.data;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    console.log("[reward-analytics] fetching analytics, days:", days);
    const wpApiUrl = "https://voksradio.com/wp-json/wp/v2";

    function aggByDate(
      items: { [key: string]: unknown }[],
      dateField: string,
    ): Record<string, number> {
      const map: Record<string, number> = {};
      for (const item of items) {
        const d = new Date(item[dateField] as string).toISOString().slice(0, 10);
        map[d] = (map[d] ?? 0) + 1;
      }
      return map;
    }

    function aggAmountByDate(
      items: { created_at: string; amount: number }[],
    ): Record<string, number> {
      const map: Record<string, number> = {};
      for (const item of items) {
        const d = new Date(item.created_at).toISOString().slice(0, 10);
        map[d] = (map[d] ?? 0) + Number(item.amount);
      }
      return map;
    }

    let wpTotal = 0;
    let wpPublished = 0;
    let wpFeatured = 0;

    try {
      const resp = await fetch(
        `${wpApiUrl}/reward?per_page=100&_fields=id,acf,featured`,
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) },
      );
      if (resp.ok) {
        const totalHeader = resp.headers.get("X-WP-Total");
        wpTotal = totalHeader ? parseInt(totalHeader, 10) : 0;
        const data: Record<string, unknown>[] = await resp.json();
        wpPublished = data.filter((r) => {
          const acf = r.acf as Record<string, unknown> | undefined;
          return acf?.reward_active !== false;
        }).length;
        wpFeatured = data.filter((r) => r.featured === true).length;
      }
    } catch {
      // WordPress fetch failed
    }

    let allRedeems: Record<string, unknown>[] = [];
    let recentRedeems: Record<string, unknown>[] = [];
    let redeemCountToday = 0;
    let redeemCountWeek = 0;
    let redeemCountMonth = 0;
    let redeemTrend: Record<string, number> = {};
    let topRewards: Record<string, number> = {};
    let leastRewards: Record<string, number> = {};

    try {
      const { data } = await supabase
        .from("reward_redeems")
        .select("id, reward_title, status, created_at")
        .limit(10000);
      allRedeems = data ?? [];

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

      redeemCountToday = allRedeems.filter((r) => (r.created_at as string) >= todayStart).length;
      redeemCountWeek = allRedeems.filter((r) => (r.created_at as string) >= weekAgo).length;
      redeemCountMonth = allRedeems.filter((r) => (r.created_at as string) >= monthAgo).length;

      recentRedeems = allRedeems.filter((r) => (r.created_at as string) >= sinceStr);
      redeemTrend = aggByDate(recentRedeems, "created_at");

      const rewardCounts: Record<string, { count: number; id: number }> = {};
      for (const r of allRedeems) {
        const title = String(r.reward_title ?? "Unknown");
        const id = Number(r.id ?? 0);
        if (!rewardCounts[title]) rewardCounts[title] = { count: 0, id };
        rewardCounts[title].count++;
      }
      const sorted = Object.entries(rewardCounts).sort((a, b) => b[1].count - a[1].count);
      topRewards = Object.fromEntries(sorted.slice(0, 10).map(([k, v]) => [k, v.count]));
      leastRewards = Object.fromEntries(sorted.slice(-5).map(([k, v]) => [k, v.count]));
    } catch {
      // Redeem section failed
    }

    let walletDebits: { created_at: string; amount: number }[] = [];
    let totalVxpRedeemed = 0;
    let avgRedeemCost = 0;
    let highestRedeem = 0;
    let lowestRedeem = 0;
    let walletBurnTrend: Record<string, number> = {};

    try {
      const { data } = await supabase
        .from("wallet_ledger")
        .select("amount, created_at, reference_type")
        .lt("amount", 0)
        .limit(10000);
      walletDebits = (data ?? []).map((r) => ({
        amount: Math.abs(r.amount),
        created_at: r.created_at,
      }));

      totalVxpRedeemed = walletDebits.reduce((sum, r) => sum + r.amount, 0);
      avgRedeemCost = walletDebits.length > 0 ? Math.round(totalVxpRedeemed / walletDebits.length) : 0;
      if (walletDebits.length > 0) {
        const amounts = walletDebits.map((r) => r.amount);
        highestRedeem = Math.max(...amounts);
        lowestRedeem = Math.min(...amounts);
      }

      const recentDebits = walletDebits.filter((r) => r.created_at >= sinceStr);
      walletBurnTrend = aggAmountByDate(recentDebits);
    } catch {
      // Wallet section failed
    }

    let inventoryItems: Record<string, unknown>[] = [];
    let inventoryMovements: { created_at: string; transaction_type: string; amount: number }[] = [];
    let lowStockCount = 0;
    let outOfStockCount = 0;

    try {
      const [invResp, ledResp] = await Promise.all([
        supabase.from("reward_inventory").select("*"),
        supabase.from("reward_inventory_ledger").select("transaction_type, amount, created_at").gte("created_at", sinceStr).order("created_at", { ascending: true }),
      ]);
      inventoryItems = invResp.data ?? [];
      inventoryMovements = (ledResp.data ?? []).map((r) => ({
        transaction_type: r.transaction_type,
        amount: r.amount,
        created_at: r.created_at,
      }));

      for (const item of inventoryItems) {
        const stock = Number(item.current_stock ?? 0);
        const warning = Number(item.warning_stock ?? 0);
        if (stock <= 0) outOfStockCount++;
        else if (stock <= warning) lowStockCount++;
      }
    } catch {
      // Inventory section failed
    }

    let voucherRows: Record<string, unknown>[] = [];
    let voucherAvailable = 0;
    let voucherAssigned = 0;
    let voucherUsed = 0;
    let voucherExpired = 0;
    let voucherVoid = 0;

    try {
      const { data } = await supabase
        .from("reward_voucher_pool")
        .select("status")
        .limit(10000);
      voucherRows = data ?? [];
      for (const v of voucherRows) {
        const status = String(v.status ?? "");
        switch (status) {
          case "AVAILABLE": voucherAvailable++; break;
          case "ASSIGNED": voucherAssigned++; break;
          case "USED": voucherUsed++; break;
          case "EXPIRED": voucherExpired++; break;
          case "VOID": voucherVoid++; break;
        }
      }
    } catch {
      // Voucher section failed
    }

    const totalVouchers = voucherAvailable + voucherAssigned + voucherUsed + voucherExpired + voucherVoid;
    const voucherUsagePct = totalVouchers > 0
      ? Math.round((voucherUsed / totalVouchers) * 100)
      : 0;

    let shippingRows: Record<string, unknown>[] = [];
    let packingQueue = 0;
    let readyToShip = 0;
    let inTransit = 0;
    let delivered = 0;
    let shippingCompleted = 0;

    try {
      const { data } = await supabase
        .from("reward_shipping")
        .select("shipping_status, created_at, updated_at")
        .limit(10000);
      shippingRows = data ?? [];
      for (const s of shippingRows) {
        const status = String(s.shipping_status ?? "");
        switch (status) {
          case "PENDING":
          case "PACKING": packingQueue++; break;
          case "READY_TO_SHIP": readyToShip++; break;
          case "SHIPPED":
          case "IN_TRANSIT": inTransit++; break;
          case "DELIVERED": delivered++; break;
          case "COMPLETED": shippingCompleted++; break;
        }
      }
    } catch {
      // Shipping section failed
    }

    const statusBreakdown: Record<string, number> = {};
    for (const r of allRedeems) {
      const s = String(r.status ?? "unknown");
      statusBreakdown[s] = (statusBreakdown[s] ?? 0) + 1;
    }

    console.log("[reward-analytics] ✔ response");
    const response = {
      success: true,
      data: {
        overview: {
          totalRewards: wpTotal,
          publishedRewards: wpPublished,
          featuredRewards: wpFeatured,
        },
        redeems: {
          total: allRedeems.length,
          today: redeemCountToday,
          thisWeek: redeemCountWeek,
          thisMonth: redeemCountMonth,
          trend: redeemTrend,
          statusBreakdown,
          topRewards,
          leastRewards,
        },
        wallet: {
          totalVxpRedeemed,
          avgRedeemCost,
          highestRedeem,
          lowestRedeem,
          burnTrend: walletBurnTrend,
        },
        inventory: {
          items: inventoryItems.map((i) => ({
            reward_id: i.reward_id,
            current_stock: i.current_stock,
            reserved_stock: i.reserved_stock,
            warning_stock: i.warning_stock,
            inventory_mode: i.inventory_mode,
          })),
          lowStockCount,
          outOfStockCount,
          totalItems: inventoryItems.length,
          movement: inventoryMovements,
        },
        vouchers: {
          available: voucherAvailable,
          assigned: voucherAssigned,
          used: voucherUsed,
          expired: voucherExpired,
          void: voucherVoid,
          total: totalVouchers,
          usagePct: voucherUsagePct,
        },
        shipping: {
          packingQueue,
          readyToShip,
          inTransit,
          delivered,
          completed: shippingCompleted,
          total: shippingRows.length,
        },
        days,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[reward-analytics] ✖ EXCEPTION:", err instanceof Error ? err.message : String(err));
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
