import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const env = {};
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.replace(/\r$/, "").match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const EMAIL = `vokstest${Date.now()}@gmail.com`;
const PASSWORD = "VoksTest!2026#xYz";
const FUNCTION_URL = `${env.VITE_SUPABASE_URL}/functions/v1/test-create-user`;

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`);
}

// 1. Create dummy user via temp edge function (service role bypasses rate limit)
let user;
try {
  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const body = await resp.json();
  if (!resp.ok || !body.success) throw new Error(body.error ?? `HTTP ${resp.status}`);
  user = { id: body.id, email: body.email };
  record("create user (edge fn)", true, `${EMAIL} -> ${body.id}`);
} catch (err) {
  record("create user (edge fn)", false, err.message);
  console.log(JSON.stringify({ summary: results }, null, 2));
  process.exit(1);
}

// 2. Sign in to obtain a session (anon endpoint, separate rate limit bucket)
let session;
try {
  const { data, error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
  if (error) throw new Error(error.message);
  session = data.session;
  record("sign in", !!session?.access_token, session?.access_token ? "session ok" : "no token");
} catch (err) {
  record("sign in", false, err.message);
  console.log(JSON.stringify({ summary: results, user }, null, 2));
  process.exit(1);
}

// Wait a moment for trigger to create profile
await new Promise((r) => setTimeout(r, 2000));

await supabase.auth.setSession(session);

async function callRpc(rpc, params) {
  const { data, error } = await supabase.rpc(rpc, params);
  return { data, error };
}

// 2. Seed a completed progress row for checkin mission 12341
const seedProgress = async (missionId, period) => {
  const { error } = await supabase
    .from("missions_progress")
    .insert({
      user_id: user.id,
      mission_id: missionId,
      progress: 1,
      completed: true,
      claimed: false,
      mission_state: "READY_TO_CLAIM",
      period,
      completed_at: new Date().toISOString(),
    });
  return error;
};

const seedErr = await seedProgress(12341, "daily");
record("seed progress 12341", !seedErr, seedErr ? seedErr.message : "");

// 3. Claim daily checkin reward (10 VXP)
const claim1 = await callRpc("claim_mission_reward", {
  p_user_id: user.id,
  p_mission_id: 12341,
  p_reward_vxp: 10,
  p_period: "daily",
});
record("claim checkin +10", claim1.error ? false : claim1.data?.success === true, JSON.stringify(claim1.data ?? claim1.error?.message));

// 4. Verify wallet / balance
const bal = await callRpc("get_wallet_balance", { p_user_id: user.id });
record("wallet balance", bal.error ? false : bal.data?.balance === 10, JSON.stringify(bal.data ?? bal.error?.message));

const daily = await callRpc("get_daily_earnings", { p_user_id: user.id, p_date: new Date().toISOString().slice(0, 10) });
record("daily earnings = 10", daily.error ? false : (daily.data?.[0]?.total ?? 0) === 10, JSON.stringify(daily.data ?? daily.error?.message));

// 5. Double claim must be rejected
const claim2 = await callRpc("claim_mission_reward", {
  p_user_id: user.id,
  p_mission_id: 12341,
  p_reward_vxp: 10,
  p_period: "daily",
});
record("double claim rejected", claim2.data?.success === false, JSON.stringify(claim2.data));

// 6. amount=0 graceful (mission 12465, period once) — must NOT error, no wallet ledger
const seedErr2 = await seedProgress(12465, "once");
record("seed progress 12465", !seedErr2, seedErr2 ? seedErr2.message : "");

const claimZero = await callRpc("claim_mission_reward", {
  p_user_id: user.id,
  p_mission_id: 12465,
  p_reward_vxp: 0,
  p_period: "once",
});
record("claim amount=0 graceful", claimZero.error ? false : claimZero.data?.success === true, JSON.stringify(claimZero.data ?? claimZero.error?.message));

const bal2 = await callRpc("get_wallet_balance", { p_user_id: user.id });
record("wallet unchanged after 0", bal2.error ? false : bal2.data?.balance === 10, JSON.stringify(bal2.data ?? bal2.error?.message));

// 7. Analytics
const ua = await callRpc("get_user_analytics", { p_user_id: user.id });
record("user analytics", ua.error ? false : true, JSON.stringify(ua.data ?? ua.error?.message));

console.log("\n--- USER ---");
console.log(JSON.stringify({ email: EMAIL, password: PASSWORD, id: user.id }, null, 2));
console.log("\n--- SUMMARY ---");
console.log(JSON.stringify({ results }, null, 2));
