# AI/63 — Mission Engine Audit v1

Date: 2026-07-16
Author: AI Audit Agent
Scope: Complete Mission Ecosystem (Engine, Reward, Action, Referral, Profile, Notification, Live, WordPress CPT, Supabase, UI, Admin)
Type: Audit Only — No Code, No Refactor, No Migrations, No Implementation

---

# Executive Summary

The VOKS NEXT Mission ecosystem is a functionally complete, architecturally sound, but production-unhardened gamification platform. It supports 6 mission types (profile complete, daily checkin, continuous listening, accumulative listening, share, referral) across a clean 6-layer architecture (UI → Hook → Service → Repository → Supabase/WordPress). The Action Engine (Sprint 8.7) provides a unified event tracking layer. The validator system is pluggable and well-typed. The reward economy uses VXP as a single currency with a transaction-safe claim RPC.

## Overall Maturity

| Dimension | Score | Status |
|-----------|-------|--------|
| Core Architecture | 7/10 | Clean 6-layer separation, Action Engine, pluggable validators, typed interfaces |
| Functional Completeness | 7/10 | 6 mission types working, XP economy, reward redemption, admin management |
| Production Hardening | 4/10 | No tests, no anti-abuse, client-side scheduler, no offline support, scalability risks |
| Gamification Depth | 4/10 | No streaks, no achievements, no season pass, no campaigns, single reward currency |
| Developer Experience | 6/10 | Good AI/ docs, consistent patterns, clean folder structure; some duplication and dead code |

## Overall Score: **58/100**

The system can launch in a controlled pilot (≤100 users) but is NOT ready for public production. Key blockers: anti-abuse protection, listen mission code duplication, dead event bus code, client-side scheduler reliability, and zero test coverage.

---

# Current Architecture

## High-Level Data Flow

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  User UI     │────▶│  Action Engine       │────▶│  Mission Engine     │
│  (14 comps)   │     │  track()             │     │  missionEngine()     │
│  3 pages      │     │  12 event types      │     │  orchestrator        │
└─────────────┘     │  consumer registry    │     │  progress→claim→     │
                    │  async recording      │     │  notify→store        │
                    └──────────────────────┘     └──────────┬──────────┘
                           │                                │
                           ▼                                ▼
                    ┌──────────────┐             ┌────────────────────┐
                    │ activity_logs │             │  Validator System  │
                    │  (Supabase)   │             │  5 pluggable       │
                    └──────────────┘             │  Profile, Checkin,  │
                                                 │  Listen, Referral,  │
                                                 │  Share              │
                                                 └────────┬───────────┘
                                                          │
                                                          ▼
                                                 ┌────────────────────┐
                                                 │  Service Layer     │
                                                 │  missionProgress   │
                                                 │  MissionClaim      │
                                                 │  missionRepeat     │
                                                 └────────┬───────────┘
                                                          │
                                                          ▼
                                                 ┌────────────────────┐
                                                 │  Repository Layer  │
                                                 │  3 CRUD files      │
                                                 └────────┬───────────┘
                                                          │
                                                          ▼
                                          ┌───────────────────────────┐
                                          │  Supabase (14 tables)     │
                                          │  WordPress REST API       │
                                          │  2 RPCs (claim, redeem)   │
                                          │  RLS enforced             │
                                          └───────────────────────────┘
```

## Mission Engine

**Location**: `src/features/missions/services/missionEngine.ts` (115 lines)

The Mission Engine is the central orchestrator. It receives inputs from `missionRunner.ts` (which is called by the Action Engine's mission consumer) and coordinates progress tracking, reward claiming, notifications, and store updates.

**Flow**:
1. `runMission({ userId, action, amount })` maps event actions to mission actions (player_play/pause/stop/disconnect/listen_tick → "listen"; others pass through)
2. For `scheduler_tick`: fetches all missions, filters by availability, processes daily resets
3. For other actions: fetches missions by action, filters by availability
4. Each matching mission → `missionEngine()`
5. `missionEngine()`:
   - Fetches mission config from WordPress (cached)
   - Checks mission properties (repeatable, continuous, accumulative, daily)
   - Calls `processMissionProgress()` for progress logic
   - On `justCompleted`: `autoClaimIfEligible()` or `processMissionClaim()` → RPC
   - Calls `repeatMissionIfNeeded()` for repeatable missions
   - Pushes notifications to `useNotificationStore`
   - Updates `useMissionStore` (Zustand) with new progress state

**Key files**:
- `missionRunner.ts` (84 lines) — dispatches events to missions
- `missionEngine.ts` (115 lines) — orchestration
- `missionProgressService.ts` (246 lines) — progress calculation, continuous mode, daily reset
- `missionValidator.ts` (49 lines) — `canRunMission()` checks
- `missionRules.ts` (135 lines) — classification helpers
- `missionStateMachine.ts` (31 lines) — state transitions
- `missionRepeat.ts` (22 lines) — repeatable mission reset

## Reward Engine

**Location**: `src/features/rewards/services/RewardEngine.ts` (80 lines)

**Two paths exist**:

**Path A — Mission Reward** (auto/manual claim):
- `MissionClaimService.processMissionClaim()` → calls `claim_mission_reward` RPC
- RPC: row-level locking (`FOR UPDATE`), validates state, awards VXP via `profiles.current_vxp += reward`, records completion in `mission_completions`
- Auto-claim path (profile/checkin): `autoClaimIfEligible()` checks `isAutoClaimMission()` and calls same RPC
- Result: `{ success, claimed, reward, currentVxp, message }`

**Path B — Catalog Reward** (redeem VXP for rewards):
- `RewardEngine.processRewardRedemption()`:
  1. Validates max per user, pending redemptions, stock availability
  2. Calls `deductVXP()` → `xp-transaction` Edge Function
  3. Calls `createRewardClaim()` → `redeem_reward` RPC (simple insert into `reward_redemptions`)
  4. On VXP deduction failure: returns error; on RPC failure: refunds VXP

**XP System**:
- `awardVXP()` / `deductVXP()` → `xpTransaction()` → `supabase.functions.invoke("xp-transaction")`
- Edge Function: validates input, reads profile balance, creates `vxp_transactions` row, updates `profiles.current_vxp` and `profiles.lifetime_vxp`
- Transaction types: `mission`, `reward`, `bonus`, `admin`, `referral`, `manual`

**Key files**:
- `src/features/rewards/services/RewardEngine.ts` (80 lines)
- `src/features/rewards/services/RewardClaimService.ts` (39 lines)
- `src/features/missions/services/MissionClaimService.ts` (49 lines)
- `src/features/xp/services/xpTransaction.ts` (33 lines)
- `supabase/functions/xp-transaction/index.ts` (197 lines)

## Action Engine

**Location**: `src/core/action-engine/` (4 files, ~90 lines)

The Action Engine is the single event dispatcher created in Sprint 8.7. All user activities flow through it.

**Public API**: `track(name, userId, payload?, amount?)`

**12 typed events**:

| Event Name | Payload | Source |
|-----------|---------|--------|
| PROFILE_COMPLETED | `{ completed_at }` | profileService |
| CHECKIN | `{ date }` | useDailyCheckin |
| LISTEN_TICK | `{ seconds }` | player-store, useListenMission |
| LISTEN_STARTED | `{ station?, program?, timestamp }` | Reserved |
| LISTEN_COMPLETED | `{ minutes, program? }` | Reserved |
| PLAYER_PLAY | `{}` | player-store |
| PLAYER_PAUSE | `{}` | player-store, useListenMission |
| PLAYER_STOP | `{}` | player-store, useListenMission |
| PLAYER_DISCONNECT | `{}` | player-store |
| SHARE | `{ share_type, target, url, timestamp }` | missionShareService |
| REFERRAL_SUCCESS | `{ referrer_id, referred_id, timestamp }` | Defined but never emitted |
| SCHEDULER_TICK | `{}` | missionScheduler |

**Mechanism**:
1. `track()` validates userId, constructs typed `ActionEvent`
2. `dispatchEvent()` iterates all registered consumers (synchronous)
3. Consumer example: `missionConsumer` maps event name → mission action → calls `runMission()`
4. `recordEvent()` asynchronously inserts into `activity_logs` (fire-and-forget)
5. Consumer registration: `subscribeAction(consumer)` → returns unsubscribe function

**Key files**:
- `src/core/action-engine/types.ts` (55 lines)
- `src/core/action-engine/engine.ts` (55 lines)
- `src/core/action-engine/consumers/missionConsumer.ts` (30 lines)
- `src/core/action-engine/index.ts` (5 lines)

## Referral Engine

**Location**: No dedicated folder. Referral logic exists in two places:

1. **ReferralValidator** (`src/features/missions/validators/ReferralValidator.ts`, 25 lines):
   - Queries `referrals` table where `referrer_id = userId`, `reward_granted = false`, `status = 'pending'`, within 30 days
   - Returns `{ complete: score >= target, score, maxScore }`
   - Used by `getValidationProgress()` for UI display only

2. **Action Engine event** (`REFERRAL_SUCCESS`):
   - Defined in types but **never emitted** — no code path fires this event
   - No frontend referral flow exists (no generate code, no share link, no tracking UI)
   - No referral creation UI or API on frontend side

**Summary**: The referral validator can read existing referral data, but there is no complete referral loop. Referrals must be created externally (likely through an Edge Function on user signup). There is no frontend path for users to generate referral codes, share them, or track referral progress.

## Profile Completion

**Location**: `src/features/profile/` (14 files)

**Flow**:
1. User updates profile → `updateProfile()` in `profileService.ts`
2. Profile saved to Supabase via UPSERT pattern in `profileRepository.ts`
3. `calculateProfileCompletion()` checks 9 required fields:
   - `avatar_url`, `display_name`, `full_name`, `phone_number`, `birthday`, `gender`, `province`, `instagram`, `tiktok`
   - Each field = 100/9 = 11.1% (rounded)
4. If completion ≥ 100% and `profile_reward_claimed` is false:
   - Sets `profile_completed = true`, `profile_reward_claimed = true`
   - Calls `track("PROFILE_COMPLETED", id, { completed_at })` via Action Engine
5. Action Engine mission consumer → `runMission({ action: 'profile' })` → finds profile mission → engine creates progress → auto-claims

**Rank System** (`getUserRank.ts`, `profileBadge.ts`):
- 9 tiers based on VXP: Pendatang Baru (0-99) → Voks Legend (50k+)
- Tier range: 1 (0-99) to 9 (50k+)
- Badge name derived from VXP via `getBadgeName()`

**Key files**:
- `src/features/profile/services/profileService.ts` (30 lines)
- `src/features/profile/services/profileRepository.ts`
- `src/features/profile/utils/profileCompletion.ts` (26 lines)
- `src/features/profile/utils/profileBadge.ts` (34 lines)
- `src/features/profile/services/profileXPService.ts` (49 lines)
- `src/lib/getUserRank.ts` (72 lines)

## Validators

**Location**: `src/features/missions/validators/` (6 files, ~130 lines)

**Interface**:
```typescript
interface MissionValidator {
  type: string;
  validate(input: ValidatorInput): Promise<ValidatorResult>;
}
// ValidatorInput { userId, mission }
// ValidatorResult { complete, score, maxScore }
```

**Registry**:
```typescript
const VALIDATOR_REGISTRY = {
  profile: profileValidator,
  checkin: checkinValidator,
  listen: listeningValidator,
  referral: referralValidator,
  share: shareValidator,
};
```

**Individual validators**:

| Validator | Logic | Database Query |
|-----------|-------|---------------|
| ProfileValidator | `calculateProfileCompletion()` from profile service | Reads `profiles` table |
| CheckinValidator | Counts today's `missions_progress` where claimed_at >= today | `missions_progress` |
| ListeningValidator | Reads `missions_progress.progress` vs `durationMinutes*60` | `missions_progress` |
| ReferralValidator | Counts referrals in 30d where `reward_granted=false` and `status=pending` | `referrals` |
| ShareValidator | Counts `activity_logs` with `activity_type=share` in 24h | `activity_logs` |

**Key insight**: Validators are NOT used by the main engine flow. They are only queried by `getValidationProgress()` for UI display of progress percentage. The engine uses its own `canRunMission()` + `processMissionProgress()` logic which does different checks. This means there are two parallel validation paths.

**`isAutoClaimMission()`**: Returns true for `action === "profile"` or `action === "checkin"`. Used by `autoClaimIfEligible()` in the claim service.

**Key files**:
- `src/features/missions/validators/index.ts` (33 lines)
- `src/features/missions/validators/types.ts` (17 lines)
- Individual validators (18-25 lines each)

## History

**Location**: `src/features/missions/components/MissionHistory.tsx` (73 lines)

**Flow**:
- Queries `useMissionProgress()` React Query hook for all user progress
- Filters to `claimed === true` only
- Displays: mission name (with `#ID` fallback when title unavailable), completed date, reward amount (from `mission_completions` or `mission.reward`)

**Data source**: `missions_progress` table filtered by `claimed = true`. The `mission_completions` table also stores immutable completion records but is not used by the history UI.

**Visibility rules**:
- CLAIMED missions are hidden from `MissionList` (filtered out at component level: `if (isClaimed) return null`)
- CLAIMED missions appear only in `MissionHistory`
- `MissionList` sorts by `mission.sort` order

**Key files**:
- `src/features/missions/components/MissionHistory.tsx` (73 lines)
- `src/features/missions/components/MissionList.tsx` (137 lines)
- `src/features/missions/components/MissionCard.tsx` (141 lines)
- `src/hooks/useMissionProgress.ts` (25 lines)

## Scheduler

**Location**: `src/features/missions/services/missionScheduler.ts` (23 lines)

**Mechanism**:
- `startMissionScheduler(userId)`: `window.setInterval` every 60 seconds → `track("SCHEDULER_TICK", userId)`
- `stopMissionScheduler()`: `clearInterval`
- Started in `AuthProvider.tsx` when user is authenticated
- Each tick triggers `runMission({ action: 'scheduler_tick' })` which:
  - Fetches all missions (not filtered by action)
  - For each: `missionEngine` checks if daily mission needs reset
  - `processDailyReset()` resets progress if completed_on !== today
  - `shouldUnlockRepeatMission()` resets completed repeatable missions

**Critical limitation**: Client-side only. Browser throttles `setInterval` in background tabs to 1/minute or less. Lost entirely when:
- Browser tab is closed
- User navigates away
- Device goes to sleep
- Browser is backgrounded on mobile

**No server-side fallback exists**. No cron-based scheduler. No missed-tick recovery.

**Key files**:
- `src/features/missions/services/missionScheduler.ts` (23 lines)
- `src/features/auth/AuthProvider.tsx` (160 lines)

## Admin

**Location**: Edge Functions (16 functions) + Admin UI components

**Edge Functions**:

| Function | Lines | Purpose |
|----------|-------|---------|
| `admin-analytics` | 552 | Comprehensive analytics: totals, trends, demographics, devices, AzuraCast, WordPress counts |
| `admin-broadcast` | 312 | CRUD for broadcasts, send to audience |
| `admin-broadcast-wp` | 94 | Fetch WordPress notifications |
| `admin-dashboard` | 291 | Dashboard stats: counts, top users, recent activity |
| `admin-mission-update` | 139 | Update WordPress mission via REST API |
| `admin-missions` | 121 | Mission stats: completion counts, state distribution |
| `admin-reward-update` | 135 | Update WordPress reward via REST API |
| `admin-rewards` | 116 | List reward redemptions with profile data |
| `admin-settings` | 252 | Settings management (get/update profile, update settings) |
| `admin-transactions` | 140 | List XP transactions with profile data |
| `admin-update-redemption` | 102 | Update redemption status (approve/reject/complete) |
| `admin-user-detail` | 92 | Full user profile + stats + recent activity |
| `admin-users` | 102 | Paginated user list with search and role filter |
| `admin-wp-stats` | 63 | WordPress content counts |
| `leaderboard` | 306 | Period-based leaderboard (lifetime/weekly/monthly) |
| `xp-transaction` | 197 | Process XP transactions (create ledger, update balance) |

**Admin UI** (`src/features/admin/missions/` — 9 files):

- **MissionsPage**: Table with search, sort by sort order, edit dialog (title, description, reward, target, active)
- **MissionEditDialog**: Modal for editing mission ACF fields, saves via Edge Function → WordPress REST API
- **MissionTable/MissionRow**: Tabular display with completion/in_progress stats
- **MissionStatusBadge**: Active/inactive visual indicator

**Admin Rewards** (`src/features/admin/rewards/` — 12 files):
- **RewardRedemptionsPage**: Manage redemption requests
- **RedemptionSummary**: Pending/Approved/Completed/Rejected counts
- **RedemptionActionMenu**: Approve/Reject/Complete actions
- Status flow: `pending` → `approved` → `completed` or `pending` → `rejected`

**Common pattern**: All edge functions:
- Use CORS headers
- `createClient` from `npm:@supabase/supabase-js@2` with service role key
- Authenticate via Bearer token → `supabase.auth.getUser()`
- Return `{ success: true/false, data/error }`

**Missing**: No mission creation UI, no A/B test framework, no user segment management, no mission-specific analytics charts, no funnel analysis.

## Analytics

**Location**: `supabase/functions/admin-analytics/index.ts` (552 lines) + analytics types

**Data collected**:
- Totals: users, transactions, missions, redemptions, listeners, listening minutes, broadcasts, notifications
- Trends (by date): users, XP, missions, redemptions
- Demographics: cities, provinces, genders
- Devices: browser/device/platform breakdown
- Sources: referral sources, countries
- AzuraCast: current listeners, now playing
- WordPress: podcast count, promo count
- Mission breakdown: per-mission completion counts
- Reward breakdown: per-reward redemption counts

**Missing from analytics**:
- Mission completion funnel (view → start → complete → claim → repeat)
- Mission drop-off rates by step
- Mission completion rate by type
- XP economy dashboard (total XP earned vs spent, distribution)
- Mission performance over time (completion rate trends)
- User retention by mission engagement
- Real-time mission monitoring dashboard

**Key files**:
- `supabase/functions/admin-analytics/index.ts` (552 lines)
- `src/features/admin/analytics/types/analytics.ts` (103 lines)
- `src/features/admin/analytics/pages/AnalyticsPage.tsx`
- `src/features/admin/dashboard/types/dashboard.ts` (47 lines)

---

# Strengths

## 1. Clean 6-Layer Separation of Concerns

**Score**: 9/10

The architecture consistently follows UI → Hook → Service → Repository → Supabase/WordPress. Business logic never lives in components. Repositories do data access only. This is production-grade separation that enables independent testing, swapping of data sources, and clear ownership boundaries.

**Evidence**: Every feature folder follows the same structure. No component contains Supabase queries directly. No repository contains business calculations. The Action Engine correctly sits between UI and Mission Engine as a separate layer.

## 2. Action Engine — Unified Event Dispatcher

**Score**: 8/10

The `track()` API is minimal, typed, and extensible. 12 event types have typed payload interfaces. Consumer registry allows multiple engines to subscribe independently. Async recording to `activity_logs` provides a permanent event audit trail. This is the correct foundation for an event-driven gamification system.

**Evidence**: Adding a new event type requires only adding to the union type + payload interface. Adding a new consumer requires one function registration. The mission consumer pattern (mapping events → actions) is clean and isolated.

## 3. Pluggable Validator Architecture

**Score**: 8/10

The `MissionValidator` interface is minimal and clean: `{ type: string; validate(input): Promise<Result> }`. The `VALIDATOR_REGISTRY` pattern makes adding a new validator trivial (one file + one registry entry). Auto-claim detection via `isAutoClaimMission()` is clean and declarative.

**Evidence**: Each validator is 18-25 lines with a single responsibility. Adding a new validator like "SurveyValidator" requires only 25 lines and one line in the registry.

## 4. Transaction-Safe Reward Claim RPC

**Score**: 8/10

The `claim_mission_reward` RPC uses `FOR UPDATE` row locking to prevent race conditions. The auto-claim path creates missing progress rows (no need for prior progress row). Anti-double-claim is enforced at the database level, not just application logic. VXP award and mission completion are in the same database transaction.

**Evidence**: The RPC is defined in SQL with explicit `FOR UPDATE` and `SECURITY DEFINER`. Two versions exist (V2 added auto-claim support). The function returns `{ success, reward, current_vxp }` in a JSONB response.

## 5. WordPress as Content Source for Mission Definitions

**Score**: 7/10

Following the principle "WordPress is content, Supabase is user data" is architecturally correct. ACF fields allow non-technical staff to configure mission parameters (title, description, target, reward, action, type, timing) without developer involvement. The `mapMission()` mapper cleanly transforms WP data to typed `MissionConfig`.

**Evidence**: All mission config originates from WordPress CPT. Supabase stores only user progress. The `missionWP.ts` cache layer provides reasonable performance with a simple invalidation mechanism.

## 6. Complete XP Transaction Ledger

**Score**: 8/10

Every XP change creates a `vxp_transactions` row with `balance_after`. The `lifetime_vxp` field only increases (never decreases), providing a permanent record of total earned XP. The `xp-transaction` Edge Function validates all transactions server-side. This provides a complete, auditable, and tamper-evident XP history.

**Evidence**: The `xp-transaction` Edge Function (197 lines) handles validation, balance read, transaction insert, and profile update in sequence. The `vxp_transactions` table has `balance_after` for rollback detection.

## 7. Comprehensive Admin Edge Functions

**Score**: 7/10

16 edge functions cover missions, rewards, users, analytics, broadcasts, settings, XP, and leaderboards. All use service role access ensuring RLS is never bypassed from frontend. Consistent `{ success: true/false, data/error }` response format. The analytics function (552 lines) provides comprehensive data collection.

**Evidence**: Each edge function follows the same pattern. Authentication via Bearer token. Consistent error handling. The analytics function queries 10+ tables and integrates with AzuraCast for listener data and WordPress for content counts.

## 8. Supabase Realtime Integration (Live Features)

**Score**: 7/10

Live chat, reactions, presence, polls, and giveaways use Supabase Realtime subscriptions correctly. Channel-based architecture with proper cleanup on unmount. Rate limiting on reactions (2s cooldown). Profile data (avatar, display_name, badge, level) is included in message inserts for efficient rendering without extra queries.

**Evidence**: All live hooks call `supabase.removeChannel()` in cleanup. `useLiveReactions` implements `lastSent` ref for rate limiting. `live_messages` migration adds profile snapshot columns for efficient real-time display.

## 9. Repository Pattern with Error Handling

**Score**: 7/10

Repositories provide clean abstractions over Supabase queries. `upsertMissionProgress` uses `onConflict` for idempotent upserts. `maybeSingle()` for graceful missing-data handling. UPSERT pattern in profile repository (update + insert fallback) fixes HTTP 406 errors. Consistent error throwing with meaningful messages.

**Evidence**: `missionProgressRepository.ts` handles all CRUD paths. ProfileRepository uses `.update().select().maybeSingle()` + fallback `.insert()` pattern. Each repository method throws on error with the original error message.

## 10. Zustand Store with Auto-Completion Detection

**Score**: 6/10

The `useMissionStore` Zustand store correctly auto-detects `completedNow` (was not completed → now completed) and updates `latestReward` + `unreadReward` count. `claimReward` increments `totalReward`, decrements `unreadReward`, and sets `claimed = true`. Clean separation: React Query for server state, Zustand for client state.

**Evidence**: `setProgress()` in `missionStore.ts` compares previous vs new completion state. `completeMission` and `claimReward` update the store correctly. `RewardPopup` and `RewardToast` consume `latestReward` and `unreadReward`.

---

# Weaknesses

## 🔴 Critical

### W1. Zero Test Coverage

**Severity**: Critical | **Effort to Fix**: 2 sprints

**Impact**: Any refactor or new feature risks regressions. No safety net for the mission economy. Cannot confidently verify that reward calculations, state transitions, or validator logic are correct after changes.

**Evidence**: AGENTS.md explicitly states "No test framework is configured." Zero test files found in the entire codebase. No vitest, jest, playwright, or any test runner configuration.

### W2. Listen Mission Code Duplication

**Severity**: Critical | **Effort to Fix**: 1 sprint

**Impact**: Two diverging `useListenMission` hooks cause unpredictable behavior. One in `src/hooks/useListenMission.ts` (185 lines, uses `usePlayerStore`), another in `src/features/missions/hooks/useListenMission.ts` (127 lines, uses prop-based `isPlaying`). Two `MissionRuntime` files (`services/missionRuntime.ts` and `types/runtime.ts`) with different date format logic — one uses `toISOString().split('T')[0]`, the other uses `toDateString()`. This will cause production bugs where listening progress behaves differently depending on which component tree mounts which hook.

### W3. Dead Event Bus Code

**Severity**: Critical | **Effort to Fix**: 0.5 sprint

**Impact**: `missionEventBus.ts` (36 lines) and `useMissionEventBus.ts` (48 lines) are no longer consumed after Sprint 8.7 replaced them with Action Engine. However, the old files remain in the codebase, creating confusion. New developers will spend time understanding whether to use `emitMissionEvent()` or `track()`. Dead code increases maintenance burden and cognitive load.

**Evidence**: `subscribeMissionEvent` is never imported anywhere in the codebase. `useMissionEventBus` is no longer imported by `AuthProvider.tsx`. Only `emitMissionEvent` references remain, all in files that now use `track()` instead — the old imports are stale.

### W4. No Anti-Abuse Protection

**Severity**: Critical | **Effort to Fix**: 2 sprints

**Impact**: No rate limiting on any mission action. A user can call `track()` repeatedly from browser console. Listen ticks fire every second with no client-side throttle. No CAPTCHA on reward claims. No IP-based limits. No device fingerprinting. No idempotency keys for duplicate prevention beyond basic state checks.

**Risk**: Economy inflation, fake accounts farming VXP, denial of wallet service.

**Evidence**: No rate limit middleware exists anywhere in the codebase. The Action Engine's `track()` has no throttling. `processMissionClaim` RPC has row locking for race conditions but no limit on how many times it can be called.

### W5. Client-Side Only Scheduler

**Severity**: Critical | **Effort to Fix**: 2 sprints

**Impact**: The 60-second `setInterval` for `SCHEDULER_TICK` is lost when:
- Browser tab is backgrounded (browsers throttle to 1 tick/minute or less)
- User closes browser or navigates away
- Device goes to sleep
- User switches to a different app on mobile

**Risk**: Daily resets may fire late or not at all. Repeatable missions may not unlock. Weekly/monthly boundaries may be missed entirely.

**Evidence**: `missionScheduler.ts` uses `window.setInterval` with no fallback. No server-side cron exists. No missed-tick recovery mechanism.

## 🟠 High

### W6. Listen Ticks Write to Supabase Every Second

**Severity**: High | **Effort to Fix**: 1 sprint

**Impact**: `track("LISTEN_TICK")` fires every second while listening. Each call asynchronously inserts a row into `activity_logs`. For one user listening 2 hours/day: 7,200 rows/day. At 100 concurrent users: 720,000 rows/day. At 1,000 users: 7.2M rows/day. No batching, no throttling, no accumulation before flush.

**Risk**: Supabase row limits exceeded, performance degradation, increased costs.

**Evidence**: `player-store.ts:listenTick()` calls `track("LISTEN_TICK", ...)` every second via `useListenMission` interval. `recordEvent()` in engine.ts inserts to `activity_logs` on each call.

### W7. In-Memory Listen Runtime Lost on Refresh

**Severity**: High | **Effort to Fix**: 1 sprint

**Impact**: `missionRuntime.ts` stores listening state in a module-level `Map<string, MissionRuntime>`. This is lost on page refresh. Current progress is loaded from `missions_progress` on mount (in `useListenMission.ts`), but the in-memory session state (continuous seconds, startedAt, lastTick) is lost. Continuous mode resets on any interruption, including page refresh.

**Evidence**: `missionRuntime.ts` uses `const runtimes = new Map<string, MissionRuntime>()` — module-level variable, not persisted.

### W8. Validators Not Used by Main Engine

**Severity**: High | **Effort to Fix**: 1 sprint

**Impact**: The validator system (`validators/index.ts`) is a well-designed plugin architecture with 5 validators, but the main mission engine (`processMissionProgress`, `canRunMission`) does NOT use it. Validators are only queried by `getValidationProgress()` for UI display. This means:
- ShareValidator checks `activity_logs` for shares in 24h, but the engine doesn't use this for progress decisions
- ReferralValidator checks `referrals` table, but the engine uses its own simpler logic
- Two parallel validation paths can produce different results

**Evidence**: `missionEngine.ts` imports from `missionValidator.ts` (which defines `canRunMission()`), not from `validators/index.ts`. The `validators/index.ts` functions are only imported by `missionValidators.ts` which is used for UI display.

### W9. No Streak System

**Severity**: High | **Effort to Fix**: 2 sprints

**Impact**: No consecutive daily checkin tracking. No streak milestones (3/7/14/30/60/90/365 days). No streak-based bonus rewards. No streak freeze mechanic. No streak UI (flame icon, count display). This is the single highest-leverage retention mechanic in gamification — Duolingo attributes 3x DAU retention to streaks, and every major gamification platform (Shopee, GoPay, TikTok, Snapchat) has streaks.

### W10. No Achievement/Badge System

**Severity**: High | **Effort to Fix**: 2 sprints

**Impact**: `getUserRank.ts` provides XP-based titles (Pendatang Baru → Voks Legend), but there are no earnable achievements or badges. No "Complete 10 missions" badge. No "First Share" achievement. No "30-Day Streak" milestone. No badge display on profile. Badges are the primary long-term retention mechanism and social proof element on Steam, Discord, TikTok, and other platforms.

## 🟡 Medium

### W11. Reward System is Only VXP

**Severity**: Medium | **Effort to Fix**: 1 sprint

**Impact**: The only reward currency is VXP. No reward tiers (bronze/silver/gold multipliers for different engagement levels). No reward bundles (VXP + badge + exclusive content). No bonus point events. `MissionRewardService.ts` is a stub that always returns `{ success: true, reward, claimed: false }` — it does nothing. This limits the reward economy's depth and replayability.

**Evidence**: `MissionRewardService.ts` has no real logic — just returns a hardcoded success response. `RewardItem` type has `cost` (in VXP) but no other reward dimensions.

### W12. Mission State Machine Not Enforced at Database Level

**Severity**: Medium | **Effort to Fix**: 0.5 sprint

**Impact**: `mission_state` is a TEXT column with no CHECK constraint. Invalid states can be inserted. The engine uses boolean fields (`completed`, `claimed`) alongside `mission_state`, creating two parallel sources of truth that can desync. The `missionStateMachine.ts` functions (`canTransition`, `nextState`) are never called by the engine.

**Evidence**: Migration `20260716000002_mission_engine_v2.sql` adds `mission_state TEXT NOT NULL DEFAULT 'AVAILABLE'` — no CHECK constraint. `missionEngine.ts` does not import or call any state machine functions.

### W13. WordPress Cache is In-Memory Only

**Severity**: Medium | **Effort to Fix**: 1 sprint

**Impact**: `missionWP.ts` caches all missions in a module-level array (`let cache: MissionConfig[] = []`). Lost on page refresh. No stale-while-revalidate pattern. No fallback on network error — returns empty array. No pagination — if >100 missions exist on WordPress, only the first page is returned. The WordPress URL is hardcoded.

**Evidence**: `getAllMissions()` checks `cache.length`, fetches via Axios, stores in module variable. On error, returns `[]`. URL string `'https://voksradio.com/wp-json/wp/v2/missions'` is hardcoded.

### W14. React Query + Zustand Progress Duplication

**Severity**: Medium | **Effort to Fix**: 1 sprint

**Impact**: Mission progress is stored in BOTH React Query (`useMissionProgress` → Supabase query, cached by React Query) AND Zustand (`useMissionStore.progress`). The engine updates Zustand on each progress change (`missionEngine.ts:91`), but React Query has its own cache that can desync. Zustand's `totalReward` and `unreadReward` are not persisted. Multiple sources of truth for the same data.

**Evidence**: `missionEngine.ts` calls `useMissionStore.getState().setProgress()` on each progress change. Components use both `useMissionProgress()` (React Query) and `useMissionStore` (Zustand). No sync mechanism exists between them.

### W15. Hardcoded WordPress URL

**Severity**: Medium | **Effort to Fix**: 0.5 sprint

**Impact**: The WordPress REST API URL is hardcoded in `missionWP.ts`. This breaks local development, staging deployments, and any environment that isn't production. Should be in environment configuration (`.env` file).

**Evidence**: `missionWP.ts` line 24: `'https://voksradio.com/wp-json/wp/v2/missions'`

### W16. No Mission Funnel Analytics

**Severity**: Medium | **Effort to Fix**: 2 sprints

**Impact**: Admin analytics provides totals and trends but no mission-specific funnel analysis. Cannot answer: How many users viewed missions vs. started vs. completed vs. claimed? Which mission type has the highest drop-off? What is the average time to complete each mission? No A/B test framework exists for comparing mission variations.

**Evidence**: `AnalyticsTotals` has `missions` (total completions) and `uniqueMissionCompleters` but no funnel metrics. No `AnalyticsFunnel` type exists.

### W17. Notifications Are In-Memory Only

**Severity**: Medium | **Effort to Fix**: 2 sprints

**Impact**: `useNotificationStore` stores notifications in Zustand only. Lost on page refresh. The `notifications` Supabase table exists (migration 13000001) but the frontend notification store never syncs with it. No push notification integration for missions — users are not re-engaged for incomplete missions or expiring streaks.

**Evidence**: `notificationStore.ts` uses Zustand with an empty initial array. No `useEffect` or query to load from Supabase. `pushMissionNotification` only adds to in-memory store. `notifications` table has RLS for user read but frontend never queries it.

### W18. Referral Flow Incomplete

**Severity**: Medium | **Effort to Fix**: 2 sprints

**Impact**: `REFERRAL_SUCCESS` is defined in Action Engine types but never emitted. No referral code generation UI. No referral link sharing. No referral progress tracking. No referral reward notification. The ReferralValidator reads `referrals` table but there is no frontend path for users to create or track referrals. The full referral loop (generate → share → track → reward) is not implemented.

**Evidence**: `ActionEventName` includes `REFERRAL_SUCCESS` but no code in the codebase calls `track("REFERRAL_SUCCESS", ...)`. No referral feature folder exists. No referral UI components.

### W19. No i18n / Multi-Language Support

**Severity**: Medium | **Effort to Fix**: 1 sprint

**Impact**: All UI text is in Indonesian. Rank titles are Indonesian (Pendatang Baru, Teman Voks, etc.). All mission strings are in Indonesian from WordPress. No i18n framework (react-i18next or similar). No English fallback. Limits international audience and makes future expansion harder.

## 🟢 Low

### W20. Duplicate Context Type Files

**Severity**: Low | **Effort to Fix**: 0.5 sprint

**Impact**: `types/context.ts` and `types/missionContext.ts` define the same `MissionContext` interface with slightly different imports. One imports `MissionConfig` from `types/mission`, the other from `services/missionTypes`. Confusing for maintainers.

### W21. Console.log Statements in Production Code

**Severity**: Low | **Effort to Fix**: 0.5 sprint

**Impact**: Multiple `console.log` and `console.error` statements throughout mission engine, runner, scheduler, hooks, and stores. No log level configuration. No structured logging. AGENTS.md says "Production: No logs" but this is not enforced.

### W22. No Offline Support

**Severity**: Low | **Effort to Fix**: 3 sprints

**Impact**: PWA can cache static assets via Workbox but mission progress requires network. If user is offline, listening progress is not tracked. Duolingo and many gamified apps support offline progress sync via service worker background sync.

### W23. Magic Number for Daily Window

**Severity**: Low | **Effort to Fix**: 0.5 sprint

**Impact**: Daily window checks use string comparison on ISO date (e.g., `today !== completed`). This is timezone-dependent and fragile. Works for UTC-based systems but will break if user's timezone differs from server timezone.

---

# Benchmark

## Shopee Missions

| Aspect | Current Capability | Missing Capability | Recommended Improvement |
|--------|-------------------|-------------------|------------------------|
| Mission Types | 6 types (profile, checkin, listen, share, referral, social) | Game missions, watch video, collect items, flash deals | Add flash missions (limited time window) and content engagement (listen to specific program) |
| Streak System | None | Daily checkin streak with bonus coins | Implement streak tracking, milestone bonuses, streak freeze mechanic |
| Reward Types | Only VXP | Coins + Vouchers + Free Shipping + Cashback | Add reward tiers (multiplier for streak/level), reward bundles |
| Social Mechanics | Share mission exists | Share → earn coins, invite friends bonus, team missions | Add invite missions, team challenges for live events |
| Personalization | None | Recommended missions based on history | Implement mission recommendation based on completed types |
| Anti-Abuse | None | CAPTCHA, daily limits, device limits, IP rate limits | Add rate limiting (sprint 11), server-side validation |

## GoPay Missions

| Aspect | Current Capability | Missing Capability | Recommended Improvement |
|--------|-------------------|-------------------|------------------------|
| Daily Checkin | Exists (basic) | Gamified checkin (spin wheel, surprise bonus) | Add random bonus element to checkin (2-10 VXP random) |
| Referral | Validator only (read-only) | QR code generation, share link, bonus on friend's first action | Implement full referral loop with shareable link, tracking, reward |
| Achievement | None | Level badges, transaction milestones, promo badges | Implement achievement system (Phase 6) |
| Event Missions | None | Time-limited promo events (Hari Besar, payday) | Add campaign/event engine (Phase 9) |
| Push Re-engagement | No mission integration | Reminder for incomplete missions, streak alerts | Integrate push notifications with broadcast table |

## Tokopedia Missions

| Aspect | Current Capability | Missing Capability | Recommended Improvement |
|--------|-------------------|-------------------|------------------------|
| Season Pass | None | Event Pass with 30-50 tier reward track | Implement season pass (Phase 8) with free + premium track |
| Mission Categories | action-based (profile, checkin, listen) | Curated categories (Daily, Weekly, Monthly, Event) | Add category UI with section headers, filters |
| Flash Missions | None | Limited-time bonus missions (1h, 24h) | Implement flash mission framework (expiry-based missions) |
| XP Economy | Single currency (VXP) | Points + Coins + Vouchers + Free Shipping | Add reward tiers with multipliers |
| Leaderboard | Edge function exists, no UI | XP rank + friend comparison + weekly competition | Build leaderboard UI with friend list, weekly period |

## TikTok Rewards

| Aspect | Current Capability | Missing Capability | Recommended Improvement |
|--------|-------------------|-------------------|------------------------|
| Content Engagement | Listen mission exists | Watch video, like, comment, share content | Add content-specific missions (listen to X programs, follow X hosts) |
| Achievement Badges | None | Level badges, creator milestones, live host badges | Implement achievement system with badge display on profile |
| Streak System | None | Login streak (3/7/30 day badges + bonus) | Implement streak system (Phase 7) with milestone badges |
| Personalized Feed | None | "For You" mission recommendations | Add mission recommendation based on user behavior |
| Social Proof | None | Friend's completed missions visible, shared badges | Add social proof (X friends completed this mission) |

## Duolingo

| Aspect | Current Capability | Missing Capability | Recommended Improvement |
|--------|-------------------|-------------------|------------------------|
| Streak System | None | Daily streak with freeze, streak repair, streak society | Implement full streak system with freeze mechanic |
| Friend Leaderboard | None | Weekly XP league with promotion/relegation | Add competitive leaderboard with periods |
| Achievement | None | Badges, lingots, achievement milestones | Implement achievement system (Phase 6) |
| Progressive Difficulty | All missions equal | Adaptive difficulty based on user level | Add difficulty levels, bonus for harder missions |
| Sound/Animation | None | Iconic "ding" sound, confetti on level up | Add celebration animations on mission complete (Phase 10) |
| Offline Support | None | Full offline sync with progress queuing | Implement service worker background sync |

## Discord Quests

| Aspect | Current Capability | Missing Capability | Recommended Improvement |
|--------|-------------------|-------------------|------------------------|
| Share Quests | Share mission exists | Share game → get reward, invite friend | Enhance share mission with invite tracking |
| Partner Integration | None | Game trials, Nitro promotions, brand quests | Add sponsor/brand mission type |
| Progress Visibility | Mission card with progress bar | Clear quest progress with stages/steps | Already similar — good baseline |
| Time-Limited Missions | None | Quests expire in 7-30 days | Add mission expiration/deadline feature |
| Achievement Display | None | Profile badges on user card | Add badge display to profile page |
| Live Event Integration | Live feature exists | Live quests during stream | Add live attendance mission (listen to live show X minutes) |

---

# Gap Analysis

| # | Current State | Target State | Business Impact | Technical Complexity | Priority | Risk |
|---|--------------|-------------|-----------------|---------------------|----------|------|
| G1 | Zero test coverage | Unit + integration tests for mission engine, RPCs, validators | Prevents confident refactoring, enables safe deployment | Medium | P0 — CRITICAL | Low — well-understood scope |
| G2 | No streak system | Daily streak with freeze, milestone bonuses, streak UI | 3x DAU retention (industry benchmark), core engagement mechanic | Medium | P0 — CRITICAL | Low — well-defined pattern |
| G3 | No achievement/badge system | Earnable badges, milestone achievements, profile display | Long-term retention, social proof, viral sharing | Medium | P0 — CRITICAL | Low — straightforward implementation |
| G4 | No anti-abuse protection | Rate limiting, idempotency keys, server-side validation, claim cooldown | Prevents economy inflation, protects reward system integrity | Medium | P0 — CRITICAL | High — missing this allows exploitation |
| G5 | Listen mission code duplicated | Single useListenMission, single MissionRuntime | Eliminates bugs caused by diverging implementations | Low | P0 — CRITICAL | Low — simple consolidation |
| G6 | Client-side only scheduler | Server-side cron + client-side fallback | Ensures daily/weekly/monthly resets fire reliably | High | P1 — HIGH | Medium — requires edge function + cron |
| G7 | Per-second Supabase writes | Batch listen events, flush every 30-60s | 60x reduction in DB writes, scalability | Medium | P1 — HIGH | Low — accumulation pattern |
| G8 | No referral emission path | Full referral loop: generate → share → track → reward | User acquisition channel, viral growth | Medium | P1 — HIGH | Low — clear flow |
| G9 | No season pass | Free + premium track with 30-50 tiers | Monetization path, power user retention | High | P1 — HIGH | Medium — requires payment integration |
| G10 | Validators not used by engine | Engine calls validators for progress decisions | Consistent single validation path, eliminates dual logic | Medium | P1 — HIGH | Low — integration only |
| G11 | Dead event bus code | Remove unused missionEventBus.ts and useMissionEventBus.ts | 84 lines dead code eliminated, reduced maintenance | Low | P2 — MEDIUM | Low |
| G12 | Hardcoded WordPress URL | Environment variable (VITE_WP_API_URL) | Enables local dev + staging + multiple environments | Low | P2 — MEDIUM | Low |
| G13 | React Query + Zustand overlap | Single source of truth for mission progress | Prevents desync bugs, reduces complexity | Medium | P2 — MEDIUM | Low |
| G14 | Notifications in-memory only | Sync with notifications table, push integration | Persistent notifications, user re-engagement | Medium | P2 — MEDIUM | Low |
| G15 | In-memory listen runtime | Persist listen session to localStorage or IndexedDB | Survives page refresh, more accurate tracking | Medium | P2 — MEDIUM | Low |
| G16 | No mission funnel analytics | View → start → complete → claim funnel, drop-off % | Data-driven product decisions, optimization | High | P2 — MEDIUM | Low |
| G17 | No multi-language | i18n framework, English + Indonesian | International audience expansion | Low | P3 — LOW | Low |
| G18 | No offline support | Background sync for mission progress | PWA parity, emerging market UX reliability | High | P3 — LOW | Low |
| G19 | Console.log in production | Log level config, structured logging | Debugging, monitoring in production | Low | P3 — LOW | Low |

---

# Priority Matrix

## P0 — CRITICAL (Must Fix Before Production)

| # | Improvement | Estimated Effort | Dependencies | Business Rationale |
|---|-------------|-----------------|--------------|-------------------|
| P0.1 | Anti-abuse system (rate limiting, idempotency, server validation) | 2 sprints | None | Without this, the reward economy can be exploited from browser console. Users can call `track()` arbitrarily. |
| P0.2 | Listen mission consolidation (single hook, single runtime) | 1 sprint | None | Two diverging implementations will cause production bugs where listening progress behaves unpredictably. |
| P0.3 | Remove dead event bus code | 0.5 sprint | None | `missionEventBus.ts` and `useMissionEventBus.ts` no longer consumed. Causes maintenance confusion. |
| P0.4 | Streak system | 2 sprints | Profile Engine | Highest-leverage engagement mechanic. Industry benchmark: 3x DAU retention. |
| P0.5 | Achievement/badge system | 2 sprints | Streak system (optional) | Long-term retention. Social proof. Identity. Required for profile depth. |
| P0.6 | Test framework + core tests | 2 sprints | None | No refactoring or new features are safe without a test suite. |

## P1 — HIGH (Should Fix Before Scaling Beyond Pilot)

| # | Improvement | Estimated Effort | Dependencies | Business Rationale |
|---|-------------|-----------------|--------------|-------------------|
| P1.1 | Server-side scheduler (cron) | 2 sprints | Edge Function infra | Ensures daily/weekly/monthly resets fire reliably. Client becomes fallback. |
| P1.2 | Batch listen event recording | 1 sprint | Action Engine | 60x reduction in Supabase writes. Prevents scalability wall. |
| P1.3 | Full referral loop | 2 sprints | Action Engine | User acquisition channel. Currently broken (event defined but never emitted). |
| P1.4 | Season pass | 3 sprints | Streak + Achievement systems | Monetization path. Power user retention. Requires engagement loops first. |
| P1.5 | Wire validators into engine | 1 sprint | None | Eliminates dual validation path. Consistent decision logic. |

## P2 — MEDIUM (Post-Launch Improvements)

| # | Improvement | Estimated Effort |
|---|-------------|-----------------|
| P2.1 | Environment config for WP URL | 0.5 sprint |
| P2.2 | React Query + Zustand consolidation | 1 sprint |
| P2.3 | Notification persistence + push | 2 sprints |
| P2.4 | Listen runtime persistence (localStorage) | 1 sprint |
| P2.5 | Mission funnel analytics dashboard | 2 sprints |
| P2.6 | Flash/expiring missions | 1 sprint |
| P2.7 | Friend leaderboard UI | 2 sprints |
| P2.8 | Reward tiers (bronze/silver/gold) | 1 sprint |

## P3 — LOW (Future)

| # | Improvement | Estimated Effort |
|---|-------------|-----------------|
| P3.1 | i18n / multi-language | 1 sprint |
| P3.2 | Offline progress (background sync) | 3 sprints |
| P3.3 | Log level configuration | 0.5 sprint |
| P3.4 | New mission types (QR, event, survey, watch, sponsor) | 2 sprints each |
| P3.5 | Sound effects + celebration animations | 1 sprint |
| P3.6 | Haptic feedback on mobile | 0.5 sprint |

---

# Production Readiness

## Dimension Scores (1-10)

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Architecture** | 7/10 | Clean 6-layer separation, Action Engine, pluggable validators, typed interfaces. Deduction: code duplication (listen, runtime, context types), dead event bus code, dual state management (React Query + Zustand). |
| **Scalability** | 4/10 | Per-second listen writes to Supabase will not scale past 100 concurrent users. Client-side scheduler doesn't scale. In-memory caches lost on refresh. No pagination for WordPress mission data. |
| **Maintainability** | 6/10 | Consistent patterns, good folder structure, well-typed interfaces. Deduction: code duplication (listen, runtime, context), dead code (event bus), 246-line monolithic progress service, hardcoded URLs. |
| **Performance** | 5/10 | Per-second Supabase inserts (no batching), no caching strategy for WordPress data, in-memory runtime only. Client-side only scheduler adds no server load but is unreliable. |
| **Security** | 7/10 | RLS on all tables, service_role for edge functions, no credential exposure, transaction-safe RPC with row locking. Deduction: no anti-abuse, no rate limiting, no CAPTCHA, no idempotency keys. |
| **Reward Economy** | 6/10 | Transaction-safe RPC with FOR UPDATE locking, complete XP ledger with balance_after, lifetime XP monotonic. Deduction: only VXP as reward, no economy monitoring dashboard, no inflation protection, stub MissionRewardService. |
| **Mission UX** | 6/10 | Clean neumorphism design, progress bars, reward popups, reward toast. Deduction: no animations, no sound effects, no celebration on completion, offline state unclear, no category navigation. |
| **Analytics** | 5/10 | Comprehensive edge function analytics (552 lines) collecting totals, trends, demographics, devices. Deduction: no mission funnel analysis, no mission-specific dashboards, no A/B testing, no real-time monitoring, no economy dashboard. |
| **Admin** | 6/10 | Full CRUD for missions/rewards/users via edge functions, redemption management, mission statistics. Deduction: no mission creation UI (edit only), no user segment targeting, no mission analytics charts, no drag-and-drop sort. |
| **Developer Experience** | 6/10 | Extensive AI/ docs (20+ documents), consistent patterns, clean folder structure, typed interfaces. Deduction: zero tests, dead code, code duplication, hardcoded URLs, console.log in production, no linter for production logs. |

## Overall Production Readiness: **56/100**

| Score | Interpretation |
|-------|---------------|
| 90-100 | Production-ready |
| 70-89 | Beta-ready |
| 50-69 | Pilot-ready |
| 0-49 | Not ready |

### Assessment

**Go for Controlled Pilot** (≤100 users):
- Core mission lifecycle works end-to-end
- Admin can configure and monitor missions
- Reward economy is transaction-safe
- Validators provide progress visibility
- Admin analytics provide operational visibility

**No-Go for Public Production**:
- No anti-abuse protection — economy WILL be exploited
- Listen mission WILL produce excessive DB writes at scale (>100 users)
- Scheduler WILL miss ticks — daily resets WILL fail for some users
- No tests — each deploy risks regression
- Dead code and duplication WILL cause production bugs

---

# Gamification Roadmap

## Phase 1 — Mission Foundation

**Status**: COMPLETE

| Feature | Status | Score |
|---------|--------|-------|
| Core Mission Lifecycle (AVAILABLE → IN_PROGRESS → READY_TO_CLAIM → CLAIMED → HISTORY) | ✅ | 7/10 |
| Profile Complete Mission | ✅ | 8/10 |
| Daily Checkin Mission | ✅ | 7/10 |
| Listening Mission (continuous + accumulative) | ✅ | 5/10 |
| Share Mission | ✅ | 7/10 |
| Referral Validator | ✅ | 4/10 |
| Action Engine (event tracking) | ✅ | 7/10 |
| State Machine | ✅ | 6/10 |
| Admin Mission CRUD | ✅ | 6/10 |
| RPC-based Reward Claim | ✅ | 8/10 |
| XP Transaction System | ✅ | 8/10 |
| Rank System (9 tiers) | ✅ | 5/10 |
| Analytics (totals + trends) | ✅ | 5/10 |

**Score**: 6.4/10

---

## Phase 2 — Mission Lifecycle

**Status**: PARTIALLY COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| State Machine (AVAILABLE → IN_PROGRESS → READY_TO_CLAIM → CLAIMED → HISTORY) | ✅ | Implemented but not DB-enforced |
| Anti-Double-Claim | ✅ | RPC row locking |
| Visibility Rules (CLAIMED hidden from list) | ✅ | Component-level filtering |
| Mission Expiry | ❌ | No expiration mechanism |
| Mission Cooldown | ❌ | No cooldown between claims |

**Score**: 5.0/10

---

## Phase 3 — Mission Categories

**Status**: NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Daily Missions | ⚠️ | Exists as `mission.type === 'daily'` but no UI category |
| Weekly Missions | ❌ | Type defined, scheduler not wired |
| Monthly Missions | ❌ | Type defined, scheduler not wired |
| Campaign Missions | ❌ | No campaign engine |
| Live Missions | ❌ | No live engagement missions |
| Achievement Missions | ❌ | No achievement system |
| Sponsor Missions | ❌ | No sponsor integration |
| Category UI (tabs/sections) | ❌ | All missions listed flat |

**Score**: 1.0/10

---

## Phase 4 — Mission Scheduler

**Status**: PARTIALLY COMPLETE

| Feature | Status | Notes |
|---------|--------|-------|
| Daily Reset (client-side) | ✅ | `setInterval` every 60s |
| Daily Reset (server-side) | ❌ | No cron |
| Weekly Reset | ❌ | Not implemented |
| Monthly Reset | ❌ | Not implemented |
| Campaign Schedule | ❌ | No campaign start/end date handling |
| Missed-Tick Recovery | ❌ | No recovery on reconnect |

**Score**: 2.0/10

---

## Phase 5 — Progress Engine

**Status**: COMPLETE

| Feature | Status | Score |
|---------|--------|-------|
| Background Listening (continuous) | ✅ | 6/10 |
| Background Listening (accumulative) | ✅ | 6/10 |
| Profile Completion Tracking | ✅ | 8/10 |
| Share Tracking | ✅ | 7/10 |
| Checkin Tracking | ✅ | 7/10 |
| Referral Tracking | ⚠️ | Validator only, no emission | 4/10 |
| Live Engagement Tracking | ❌ | 0/10 |
| Offline Progress | ❌ | 0/10 |

**Score**: 5.0/10

---

## Phase 6 — Achievement System

**Status**: NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Achievement Definitions (WordPress CPT) | ❌ | Not created |
| Achievement Detection Engine | ❌ | Not built |
| Earnable Badges | ❌ | Not built |
| Badge Display on Profile | ❌ | Not built |
| Achievement Notification | ❌ | Not built |
| Milestone Achievements (10 missions, 100 missions) | ❌ | Not built |
| Streak Achievements (7-day, 30-day) | ❌ | Not built |

**Score**: 0/10

---

## Phase 7 — Streak Engine

**Status**: NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Consecutive Day Tracking | ❌ | Not built |
| Streak Freeze Mechanic | ❌ | Not built |
| Streak Milestone Rewards | ❌ | Not built |
| Streak UI (flame, count) | ❌ | Not built |
| Streak Notification (at-risk) | ❌ | Not built |
| Streak Recovery | ❌ | Not built |

**Score**: 0/10

---

## Phase 8 — Season Pass

**Status**: NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Free XP Track | ❌ | Not built |
| Premium Reward Track | ❌ | Not built |
| Season Tiers (30-50) | ❌ | Not built |
| Season Rotation | ❌ | Not built |
| Season Pass UI | ❌ | Not built |
| Payment Integration | ❌ | Not built |

**Score**: 0/10

---

## Phase 9 — Campaign Engine

**Status**: NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Sponsor Campaign Missions | ❌ | Not built |
| Brand Mission Integration | ❌ | Not built |
| Limited Event Missions | ❌ | Not built |
| Flash Missions (1h-24h) | ❌ | Not built |
| Campaign Schedule (start/end) | ❌ | Not built |
| Campaign Analytics | ❌ | Not built |

**Score**: 0/10

---

## Phase 10 — Gamification Analytics

**Status**: NOT STARTED

| Feature | Status | Notes |
|---------|--------|-------|
| Mission Conversion Funnel | ❌ | Not built |
| Drop-off Analysis | ❌ | Not built |
| XP Economy Dashboard | ❌ | Not built |
| Retention Analysis | ❌ | Not built |
| A/B Test Framework | ❌ | Not built |
| Real-time Mission Monitor | ❌ | Not built |

**Score**: 0/10

---

## Roadmap Summary

| Phase | Name | Status | Score | Priority |
|-------|------|--------|-------|----------|
| 1 | Mission Foundation | ✅ COMPLETE | 6.4/10 | — |
| 2 | Mission Lifecycle | ⚠️ PARTIAL | 5.0/10 | P0 (hardening) |
| 3 | Mission Categories | ❌ NOT STARTED | 1.0/10 | P2 |
| 4 | Mission Scheduler | ⚠️ PARTIAL | 2.0/10 | P1 |
| 5 | Progress Engine | ⚠️ PARTIAL | 5.0/10 | P1 |
| 6 | Achievement System | ❌ NOT STARTED | 0/10 | P0 |
| 7 | Streak Engine | ❌ NOT STARTED | 0/10 | P0 |
| 8 | Season Pass | ❌ NOT STARTED | 0/10 | P1 |
| 9 | Campaign Engine | ❌ NOT STARTED | 0/10 | P2 |
| 10 | Gamification Analytics | ❌ NOT STARTED | 0/10 | P2 |

---

# Sprint Recommendation

## Next Implementation Order

### Sprint 10: Foundation Cleanup (2 sprints)
**Why first**: Low-effort, high-impact fixes that must precede any new features or scaling.

| Task | Effort | Dependencies |
|------|--------|-------------|
| Remove dead event bus code (`missionEventBus.ts`, `useMissionEventBus.ts`) | 0.5 sprint | None |
| Consolidate listen mission (choose one hook, one runtime, remove duplicates) | 1 sprint | None |
| Move hardcoded WP URL to environment config | 0.5 sprint | None |

### Sprint 11-12: Anti-Abuse + Listen Batching (2 sprints)
**Why second**: Protects the economy before public launch. Must be in place before scaling.

| Task | Effort | Dependencies |
|------|--------|-------------|
| Rate limiting middleware in Action Engine (max 10 actions/min/user) | 1 sprint | Sprint 10 cleanup |
| Idempotency keys for mission actions (prevent duplicate claims) | 0.5 sprint | None |
| Batch listen event recording (accumulate seconds, flush every 30-60s) | 1 sprint | Sprint 10 cleanup |

### Sprint 12-13: Server-Side Scheduler (2 sprints)
**Why third**: Ensures mission lifecycle reliability before users rely on daily/weekly missions.

| Task | Effort | Dependencies |
|------|--------|-------------|
| Edge Function cron for daily reset (midnight) | 1 sprint | Edge Function infra |
| Edge Function cron for weekly reset (Monday 00:00) | 0.5 sprint | Daily cron done |
| Edge Function cron for monthly reset (1st 00:00) | 0.5 sprint | Daily cron done |
| Client scheduler becomes fallback only | 0.5 sprint | Cron functions done |

### Sprint 13-14: Test Framework (2 sprints)
**Why fourth**: Enables confident refactoring for all subsequent phases. Without tests, every change is risky.

| Task | Effort | Dependencies |
|------|--------|-------------|
| Test framework setup (Vitest) | 0.5 sprint | None |
| Mission engine unit tests (progress, claim, repeat, state machine) | 1 sprint | Sprint 10 cleanup |
| Reward claim RPC integration tests | 0.5 sprint | None |
| Validator unit tests | 0.5 sprint | None |

### Sprint 15-16: Streak System (2 sprints)
**Why fifth**: Highest-leverage engagement mechanic. Drives DAU retention.

| Task | Effort | Dependencies |
|------|--------|-------------|
| `user_streaks` table + migration | 0.5 sprint | None |
| Streak tracking logic (consecutive checkins, streak freeze) | 1 sprint | Test framework |
| Streak milestone rewards (3, 7, 14, 30, 60, 90, 365 days) | 0.5 sprint | Streak tracking |
| Streak UI (flame icon, count display, milestone badges) | 0.5 sprint | Streak tracking |

### Sprint 17-18: Achievement System (2 sprints)
**Why sixth**: Foundation for identity, social proof, and long-term retention.

| Task | Effort | Dependencies |
|------|--------|-------------|
| WordPress achievement CPT + ACF fields | 0.5 sprint | None |
| `achievements` table + migration | 0.5 sprint | None |
| Achievement detection engine (watches for conditions) | 1 sprint | Streak system (some achievements reference streaks) |
| Badge display on profile page | 0.5 sprint | Achievement engine |
| 8-10 launch achievements | 0.5 sprint | Achievement engine |

### Sprint 19-20: Engine Integration (2 sprints)
**Why seventh**: Eliminates dual validation path between validators and engine.

| Task | Effort | Dependencies |
|------|--------|-------------|
| Wire validators into engine (engine calls `validateMission()`) | 1 sprint | Test framework |
| Remove `canRunMission()` duplicate logic | 0.5 sprint | Validators wired |
| Full referral loop (generate code → share → track → reward) | 2 sprints | Action Engine |

### Sprint 21+: Premium Features
**Why later**: Requires engagement loops (streaks, achievements) as foundation.

| Sprint | Feature | Dependencies |
|--------|---------|-------------|
| 21-22 | Season pass (free track) | Streak + Achievement |
| 23 | Season pass (premium track) | Payment integration |
| 24-25 | Mission funnel analytics | Batch listen + tests |
| 26-27 | Campaign engine + flash missions | Season pass |
| 28 | Reward tiers + bonus events | Economy monitoring |

## Dependency Graph

```
Sprint 10 (Cleanup)
  └── Removes dead code, consolidates listen, fixes URL
        │
Sprint 11-12 (Anti-Abuse + Batching)
  └── Rate limits, idempotency, batch writes
        │
Sprint 12-13 (Server Scheduler)
  └── Cron resets, client fallback
        │
Sprint 13-14 (Tests)
  └── Safety net for all subsequent changes
        │
        ├────────────────────────────┐
        │                            │
Sprint 15-16 (Streaks)    Sprint 17-18 (Achievements)
  └── Core retention        └── Identity + badges
        │                            │
        └──────────┬─────────────────┘
                   │
          Sprint 19-20 (Wire Validators + Referral Loop)
                   │
          Sprint 21+ (Season Pass, Campaigns, Analytics)
```

---

# Final Conclusion

## As CTO: Is the Mission Engine Ready for Production?

**No — but it is ready for a controlled pilot.**

The VOKS NEXT Mission ecosystem has a **sound architecture** (58/100) with clean separation of concerns, typed interfaces, transaction-safe reward claims, and a unified event tracking layer. The codebase demonstrates strong engineering discipline — the 6-layer flow is consistently followed, TypeScript types are well-defined, and the Action Engine provides the correct foundation for event-driven gamification.

However, the system has **three hard blockers** and **three critical gaps** that prevent public production launch.

---

## What MUST Be Completed Before Production

### Hard Blockers

1. **Anti-abuse system** (P0.1, 2 sprints)
   Without rate limiting or idempotency, the reward economy can be exploited on day one. A single malicious user can call `track()` 1,000 times from the browser console and claim rewards faster than the system can detect. **This is the highest-risk item.** Implement rate limiting (10 actions/min/user), idempotency keys, and server-side claim validation.

2. **Listen mission consolidation** (P0.2, 1 sprint)
   Two diverging `useListenMission` hooks with different runtime tracking will cause production bugs. Users will unpredictably lose listening progress depending on which component tree mounts which hook. The two `MissionRuntime` files with different date format logic will cause subtle daily reset errors.

3. **Test framework** (P0.6, 2 sprints)
   Without a single test, every deployment is a leap of faith. Refactoring the listen mission, adding anti-abuse, or changing any reward logic without tests is irresponsible. Start with mission engine unit tests, reward claim RPC tests, and validator tests.

### Critical Gaps (Nice-to-Have for Launch, Must-Have for Retention)

4. **Dead event bus code** (P0.3, 0.5 sprint)
   Low effort, high clarity impact. `missionEventBus.ts` and `useMissionEventBus.ts` are no longer consumed. Remove them to eliminate maintenance confusion.

5. **Streak system** (P0.4, 2 sprints)
   Not strictly required for v1.0 launch, but it is the single highest-leverage retention mechanic. If you want users coming back daily, implement streaks. Duolingo attributes 3x DAU retention to streaks. Shopee, GoPay, TikTok all have streaks.

6. **Achievement/badge system** (P0.5, 2 sprints)
   Not required for v1.0 launch, but badges provide identity, social proof, and long-term retention. Without achievements, the mission system lacks depth beyond "complete and claim."

---

## What Can Wait Until After Production

| Feature | Rationale | Target Version |
|---------|-----------|----------------|
| Server-side scheduler | Client-side works for pilot; upgrade when scaling | v1.1 (after Sprint 13) |
| Batch listen recording | Acceptable at pilot scale (≤100 users) | v1.1 (after Sprint 12) |
| Full referral loop | Validator works for existing referrals | v1.1 |
| Season pass | Requires streaks + achievements as foundation | v1.2 |
| Wire validators into engine | Existing `canRunMission()` works correctly | v1.1 |
| Mission funnel analytics | Manual monitoring sufficient for pilot | v1.2 |
| Notification persistence | In-memory notifications work for single session | v1.1 |
| i18n / multi-language | All-Indonesian is acceptable for current market | v1.3 |
| Offline support | Not expected for radio streaming PWA | v1.3 |
| Sound effects + animations | Quality-of-life improvement | v1.1 |
| New mission types | Extend after core is solid | v1.2+ |

---

## Final Recommendations

1. **Start Sprint 10 immediately**: Foundation cleanup (dead code, listen consolidation, WP URL) is low-effort, zero-risk, and removes immediate technical debt.

2. **Set up the test framework before any new features**: Do not add streaks, achievements, or any new mission type until there are tests for the core engine. Without tests, each new feature risks breaking existing functionality.

3. **Treat anti-abuse as a hard gate for public launch**: Do not scale beyond pilot users without rate limiting and idempotency. The cost of fixing an exploited economy after launch is 10x the cost of prevention.

4. **Launch pilot with controlled user group** (≤100 users): The system is stable enough for early adopters. Monitor claim rates, listen tick frequency, and scheduler behavior. Use pilot data to prioritize production hardening.

5. **Prioritize streaks and achievements as post-launch P0**: These are not launch blockers but they are retention multipliers. Schedule them in the first post-launch sprint cycle.

6. **Keep the architecture as-is**: The Action Engine, validator pattern, 6-layer separation, and RPC-based claims are correct decisions. Do not redesign — only harden and extend.

## Verdict

**Pilot-ready: ✅ | Production-ready: ❌**
**Recommended timeline: 4-6 hardening sprints → public beta → v1.0 launch**

The foundation is strong enough to support years of gamification growth. Invest the time in production hardening now — the first 100 users will forgive bugs, but the first 10,000 will not.

---

*End of Audit v1 — Document created from complete codebase analysis (50+ source files, 16 edge functions, 10 migrations, 20+ documentation files). No code was written or modified.*
