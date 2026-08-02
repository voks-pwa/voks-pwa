import { readFileSync } from "node:fs";
import { chromium } from "@playwright/test";
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
const BASE_URL = "https://voks-pwa.voksmedsos.workers.dev";
const PROJECT_REF = "aefelmycrbiquqfoafcs";
const STORAGE_KEY = `sb-${PROJECT_REF}-auth-token`;

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const EMAIL = `vokstest${Date.now()}@gmail.com`;
const PASSWORD = "VoksTest!2026#xYz";
const FUNCTION_URL = `${env.VITE_SUPABASE_URL}/functions/v1/test-create-user`;

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`);
}

async function db() {
  const { data, error } = await supabase.rpc("get_wallet_balance", { p_user_id: USER.id });
  return error ? -1 : data.balance;
}

let USER, SESSION;

// 1. Create user + session
const resp = await fetch(FUNCTION_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
const body = await resp.json();
if (!resp.ok || !body.success) throw new Error(body.error ?? `HTTP ${resp.status}`);
USER = { id: body.id, email: body.email };
record("create user (edge fn)", true, `${EMAIL} -> ${USER.id}`);

const { data: signIn } = await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });
if (!signIn.session) throw new Error("no session");
SESSION = signIn.session;
record("sign in", true, "session ok");

await new Promise((r) => setTimeout(r, 2000));
await supabase.auth.setSession(SESSION);

// 2. Launch browser
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE_URL });
await context.addInitScript(() => {
  Object.defineProperty(window.navigator, "share", {
    configurable: true,
    value: async () => {},
  });
});
const page = await context.newPage();
const logs = [];
page.on("console", (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", (err) => logs.push(`[PAGEERROR] ${err.message}`));
page.on("requestfailed", (req) => logs.push(`[REQFAIL] ${req.method()} ${req.url()} ${req.failure()?.errorText}`));
page.on("response", (res) => {
  if (res.status() >= 400) logs.push(`[RESP${res.status()}] ${res.request().method()} ${res.url()}`);
});

await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
await page.evaluate(
  ([k, v]) => localStorage.setItem(k, v),
  [STORAGE_KEY, JSON.stringify(SESSION)]
);
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
record("session injected + reload", true, BASE_URL);

// helper: read Saldo VXP from MorePage
async function readMoreVxp() {
  await page.goto(`${BASE_URL}/more`, { waitUntil: "domcontentloaded" });
  const label = page.getByText("Saldo VXP");
  try { await label.waitFor({ timeout: 20000 }); } catch { return "TIMEOUT"; }
  const cell = label.locator("xpath=..");
  const val = (await cell.locator("p").nth(1).textContent())?.trim() ?? "";
  return val;
}

// helper: read VXP chip from Missions page header
async function readMissionsVxp() {
  await page.goto(`${BASE_URL}/missions`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const chip = page.getByText(/VXP$/).first();
  return (await chip.textContent())?.trim() ?? "";
}

// helper: click a button after scrolling it to viewport center (bottom nav overlap)
async function clickCentered(loc) {
  if (!(await loc.count())) return false;
  await loc.scrollIntoViewIfNeeded();
  await loc.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(400);
  await loc.click();
  return true;
}

// 3. CHECKIN
await page.goto(`${BASE_URL}/missions`, { waitUntil: "domcontentloaded" });
const checkinBtn = page.getByRole("button", { name: "Check In", exact: true });
try {
  await checkinBtn.waitFor({ timeout: 30000 });
} catch { /* fallthrough: report below */ }
const beforeCheckin = await db();
if (await clickCentered(checkinBtn)) {
  await page.waitForTimeout(10000);
  const bal = await db();
  const { data: prog } = await supabase.from("missions_progress").select("*").eq("user_id", USER.id);
  const { data: ledger } = await supabase.from("wallet_ledger").select("amount,transaction_type").eq("user_id", USER.id);
  const credit = (ledger ?? []).reduce((s, l) => s + (l.amount > 0 ? l.amount : 0), 0);
  record("checkin claim credited (DB)", bal > beforeCheckin, `before=${beforeCheckin}, balance=${bal}, credit=${credit}, progressRows=${prog?.length}`);
  const moreVxp = await readMoreVxp();
  record("MorePage Saldo VXP matches DB", moreVxp.replace(/[^\d]/g, "") === String(bal), `MorePage="${moreVxp}", db=${bal}`);
  await page.screenshot({ path: "C:/Users/tresn/AppData/Local/Temp/opencode/more-after-checkin.png" });
} else {
  record("checkin button found", false, "button not rendered");
}

// 4. SHARE (Share Now on missions page)
await page.goto(`${BASE_URL}/missions`, { waitUntil: "domcontentloaded" });
const shareBtn = page.getByRole("button", { name: "Share Now", exact: true }).first();
try {
  await shareBtn.waitFor({ timeout: 30000 });
} catch { /* fallthrough */ }
const beforeShare = await db();
if (await clickCentered(shareBtn)) {
  await page.waitForTimeout(10000);
  const bal = await db();
  const { data: ledger } = await supabase.from("wallet_ledger").select("amount,transaction_type").eq("user_id", USER.id);
  const credit = (ledger ?? []).reduce((s, l) => s + (l.amount > 0 ? l.amount : 0), 0);
  record("share claim credited (DB)", bal > beforeShare, `before=${beforeShare}, balance=${bal}, credit=${credit}`);
} else {
  record("share button found", false, "button not rendered");
}

// 5. Seed + claim referral mission (500) via DB to fund redeem
const { error: seedErr } = await supabase.from("missions_progress").insert({
  user_id: USER.id,
  mission_id: 12342,
  progress: 1,
  completed: true,
  claimed: false,
  mission_state: "READY_TO_CLAIM",
  period: "once",
  completed_at: new Date().toISOString(),
});
if (!seedErr) {
  const before = await db();
  const c = await supabase.rpc("claim_mission_reward", {
    p_user_id: USER.id,
    p_mission_id: 12342,
    p_reward_vxp: 500,
    p_period: "once",
  });
  const bal = await db();
  record("referral claim +500 (DB)", c.data?.success === true && bal === before + 500, `before=${before}, balance=${bal}`);
} else {
  record("seed referral", false, seedErr.message);
}

// 6. REDEEM voucher (500 VXP, cheapest)
const beforeRedeem = await db();
await page.goto(`${BASE_URL}/reward-store`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
const rewardCard = page.getByText("Voucher Sanga Sanga", { exact: false }).first();
if (await rewardCard.count()) {
  await rewardCard.click();
  await page.waitForTimeout(2500);
  const redeemBtn = page.getByRole("button", { name: "Redeem", exact: true });
  if (await clickCentered(redeemBtn)) {
    await page.waitForTimeout(4000);
    const { data: redeems } = await supabase
      .from("reward_redeems")
      .select("reward_id,status,required_vxp")
      .eq("user_id", USER.id);
    const bal = await db();
    record("redeem voucher", (redeems?.length ?? 0) > 0 && bal === beforeRedeem - 500, `redeems=${redeems?.length}, beforeRedeem=${beforeRedeem}, balance=${bal}`);
  } else {
    record("redeem button found", false, "button not rendered");
  }
} else {
  await page.screenshot({ path: "C:/Users/tresn/AppData/Local/Temp/opencode/rewards-page.png" });
  record("reward card found", false, "Voucher Sanga Sanga not rendered on /reward-store");
}

await browser.close();

console.log("\n--- CONSOLE (last 80) ---");
console.log(logs.slice(-80).join("\n"));
const checkinIdx = logs.findIndex((l) => l.includes("RUN ACTION checkin"));
if (checkinIdx >= 0) {
  console.log("\n--- CONSOLE (from RUN ACTION checkin) ---");
  console.log(logs.slice(checkinIdx, checkinIdx + 40).join("\n"));
}

console.log("\n--- USER ---");
console.log(JSON.stringify({ email: EMAIL, password: PASSWORD, id: USER.id }, null, 2));
console.log("\n--- SUMMARY ---");
console.log(JSON.stringify({ results }, null, 2));
