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
const STORAGE_KEY = "sb-aefelmycrbiquqfoafcs-auth-token";
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const EMAIL = `vokstest${Date.now()}@gmail.com`;
const PASSWORD = "VoksTest!2026#xYz";
const FUNCTION_URL = `${env.VITE_SUPABASE_URL}/functions/v1/test-create-user`;

const results = [];
function record(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ${detail}`);
}

let USER;

// create user + session
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
record("sign in", true, "session ok");
await new Promise((r) => setTimeout(r, 2000));
await supabase.auth.setSession(signIn.session);

async function db() {
  const { data, error } = await supabase.rpc("get_wallet_balance", { p_user_id: USER.id });
  return error ? -1 : data.balance;
}

// browser
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE_URL });
await context.addInitScript(() => {
  Object.defineProperty(window.navigator, "share", { configurable: true, value: async () => {} });
});
const page = await context.newPage();
page.on("pageerror", (err) => console.log(`[PAGEERROR] ${err.message}`));

await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
await page.evaluate(([k, v]) => localStorage.setItem(k, v), [STORAGE_KEY, JSON.stringify(signIn.session)]);
await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
record("session injected + reload", true);

async function clickCentered(loc) {
  if (!(await loc.count())) return false;
  await loc.scrollIntoViewIfNeeded();
  await loc.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.waitForTimeout(400);
  await loc.click();
  return true;
}

// ── SCENARIO 1: DOUBLE CHECKIN (klik Check In, pastikan 1x credit, gak double) ──
await page.goto(`${BASE_URL}/missions`, { waitUntil: "domcontentloaded" });
const checkinBtn = page.getByRole("button", { name: "Check In", exact: true });
try { await checkinBtn.waitFor({ timeout: 30000 }); } catch {}
const beforeCheckin = await db();
if (await clickCentered(checkinBtn)) {
  await page.waitForTimeout(10000);
  const after = await db();
  record("checkin credited (DB)", after > beforeCheckin, `before=${beforeCheckin}, after=${after}`);

  await page.waitForTimeout(12000); // tunggu window scheduler, pastikan gak double
  const after2 = await db();
  record("no double-credit (scheduler)", after2 === after, `after=${after}, after2=${after2}`);

  const btnCount = await checkinBtn.count();
  record("checkin card -> Completed Today", btnCount === 0, `Check In button count=${btnCount}`);
} else {
  record("checkin button found", false, "button not rendered");
}

// ── SCENARIO 2: MISSION HISTORY tampil ──
await page.goto(`${BASE_URL}/missions`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);
const balNow = await db();
const hist = page.getByText("Mission History");
const hasHist = await hist.count();
const xpEntry = page.getByText(`+${balNow} XP`, { exact: false }).count();
record("Mission History section", hasHist > 0, `section=${hasHist}`);
record("history shows reward", (await xpEntry) > 0, `bal=${balNow}`);

// ── SCENARIO 3: PROFILE MISSION via UI (isi 11 field) ──
await page.goto(`${BASE_URL}/profile`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);

const field = async (label) => page.locator(`label:text-is("${label}")`).locator("xpath=..").locator("input").first();
const fields = [
  ["Display Name", "Test User"],
  ["Full Name", "Test User Full"],
  ["Phone", "081234567890"],
  ["Birthday", "2000-01-15"],
  ["City", "Bandung"],
  ["Province", "Jawa Barat"],
  ["Favorite Program", "Morning Show"],
  ["Favorite Music", "Pop"],
  ["Instagram", "testuser"],
  ["TikTok", "testuser"],
];
for (const [label, val] of fields) {
  const input = await field(label);
  if (await input.count()) { await input.fill(val); }
}
const genderSelect = page.locator('label:text-is("Gender")').locator("xpath=..").locator("select");
if (await genderSelect.count()) { await genderSelect.selectOption("Laki Laki"); }

const beforeProfile = await db();
const saveBtn = page.getByRole("button", { name: "Save Profile", exact: true });
if (await clickCentered(saveBtn)) {
  await page.waitForTimeout(12000);
  const after = await db();
  record("profile mission credited (DB)", after > beforeProfile, `before=${beforeProfile}, after=${after}`);
  const { data: prog } = await supabase.from("missions_progress").select("mission_id,completed,claimed").eq("user_id", USER.id);
  record("profile mission claimed row", (prog ?? []).some((p) => p.mission_id === 12465 && p.completed && p.claimed), `rows=${JSON.stringify(prog)}`);
} else {
  record("save profile button found", false, "button not rendered");
}

// history after profile
await page.goto(`${BASE_URL}/missions`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(3000);
const profTitle = page.getByText("Complete Your Profile", { exact: false }).count();
record("history shows profile mission", (await profTitle) > 0, "Complete Your Profile present");

await browser.close();

console.log("\n--- USER ---");
console.log(JSON.stringify({ email: EMAIL, password: PASSWORD, id: USER.id }, null, 2));
console.log("\n--- SUMMARY ---");
console.log(JSON.stringify({ results }, null, 2));
