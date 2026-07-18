# AI/63 — Mission Engine Audit v1

**Date**: 2026-07-16  
**Scope**: Complete Mission Ecosystem  
**Type**: Audit Only — No Code, No Refactor, No Migrations, No Implementation

---

# Executive Summary

The VOKS NEXT Mission ecosystem is a **functionally complete, architecturally sound, but production-unhardened** gamification platform. It supports 6 mission types across a clean 6-layer architecture. The Action Engine (Sprint 8.7) provides unified event tracking. The validator system is pluggable and well-typed.

| Dimension | Score | Status |
|-----------|-------|--------|
| Core Architecture | 7/10 | Solid 6-layer separation, Action Engine, pluggable validators |
| Functional Completeness | 7/10 | 6 mission types, XP economy, reward redemption |
| Production Hardening | 4/10 | No tests, no anti-abuse, client-side scheduler, no offline |
| Gamification Depth | 4/10 | No streaks, no achievements, no season pass, no campaigns |
| Developer Experience | 6/10 | Good docs, consistent patterns, some duplication/dead code |

## Overall Score: **58/100**

---

# Current Architecture

## Layer Flow
```
User UI → Action Engine track() → Mission Runner → Mission Engine
  → Progress Service → Repository → Supabase
  → Claim Service → RPC → VXP award + Completion record
  → Notifications → Store
```

### Action Engine (`src/core/action-engine/`)
- `track(name, userId, payload?, amount?)` — single public API
- 12 typed events: PROFILE_COMPLETED, CHECKIN, LISTEN_TICK, LISTEN_STARTED, LISTEN_COMPLETED, PLAYER_PLAY/PAUSE/STOP/DISCONNECT, SHARE, REFERRAL_SUCCESS, SCHEDULER_TICK
- Consumer registry: `subscribeAction(consumer)` → unsubscribe
- Async recording to `activity_logs`

### Mission Engine (`missionEngine.ts`)
- Fetches mission from WordPress cache
- Handles `scheduler_tick` → daily reset
- Calls `processMissionProgress()` → creates/updates `missions_progress`
- On `justCompleted`: `autoClaimIfEligible()` or `processMissionClaim()` → RPC
- `repeatMissionIfNeeded()` for repeatable missions
- Pushes notifications, updates Zustand store

### Reward Engine (`RewardEngine.ts`)
- **Mission reward**: `processMissionClaim()` → `claim_mission_reward` RPC (row locking, VXP award, completion record)
- **Catalog reward**: `processRewardRedemption()` → validates max/user, stock, pending → `deductVXP()` → `redeem_reward` RPC
- **Auto-claim**: Profile and checkin missions auto-claim on completion

### Validator System (5 pluggable validators)
- Profile, Checkin, Listening, Referral, Share
- Clean interface: `MissionValidator { type, validate(input): Promise<Result> }`
- Registry maps `mission.action` → validator
- **Not used by main engine** — only for UI progress display

### State Machine
```
AVAILABLE → IN_PROGRESS → READY_TO_CLAIM → CLAIMED → HISTORY
                                              ↓
                                          EXPIRED
```
- Not enforced at DB level (no CHECK constraint)
- Not used consistently by engine (engine uses boolean fields)

### Scheduler
- Client-side `setInterval` every 60s → `track("SCHEDULER_TICK")`
- Started in `AuthProvider.tsx`
- **Lost on tab switch, sleep, browser close**

### WordPress Integration
- `getAllMissions()`: Axios GET → in-memory cache
- Hardcoded URL, no fallback, no pagination, no stale-while-revalidate

### Database (14 tables, 2 RPCs)
- `missions_progress`: per-user per-mission state (mission_state, period)
- `mission_completions`: immutable completion log
- `vxp_transactions`: full XP ledger
- `claim_mission_reward` RPC: transaction-safe with row locking, auto-creates progress

---

# Strengths

| # | Strength | Score | Why |
|---|----------|-------|-----|
| 1 | Clean 6-layer architecture | 9/10 | UI→Hook→Service→Repository→Supabase/WordPress consistently followed |
| 2 | Action Engine design | 8/10 | Minimal typed `track()` API, consumer registry, audit trail |
| 3 | Pluggable validator pattern | 8/10 | Clean interface, registry, adding new validators is trivial |
| 4 | Transaction-safe reward claim | 8/10 | `FOR UPDATE` row locking, `claim_mission_reward` RPC, auto-claim |
| 5 | WordPress as definition source | 7/10 | WP=content, Supabase=user data is architecturally correct |
| 6 | XP transaction ledger | 8/10 | Every XP change creates `vxp_transactions`, `lifetime_vxp` only increases |
| 7 | Admin edge functions | 7/10 | 16 functions, consistent response format, service_role access |
| 8 | Supabase Realtime (Live) | 7/10 | Correct channel-based subscriptions with cleanup |
| 9 | Repository pattern | 7/10 | Clean abstractions, UPSERT pattern, graceful missing-data handling |

---

# Weaknesses

### 🔴 Critical

| # | Weakness | Impact | Fix Effort |
|---|----------|--------|------------|
| W1 | Zero test coverage | Any refactor risks regression; no safety net for mission economy | 2 sprints |
| W2 | Listen mission code duplication | Two diverging `useListenMission` hooks, two `MissionRuntime` files with different date logic | 1 sprint |
| W3 | Dead event bus code | `missionEventBus.ts` and `useMissionEventBus.ts` no longer consumed | 0.5 sprint |
| W4 | No anti-abuse protection | No rate limiting, no idempotency — economy can be exploited from browser console | 2 sprints |
| W5 | Client-side only scheduler | `setInterval` lost on tab switch/sleep; daily resets may not fire | 2 sprints |

### 🟠 High

| # | Weakness | Impact | Fix Effort |
|---|----------|--------|------------|
| W6 | Listen ticks write to Supabase every second | 7,200 rows/day/user — scalability bomb at 100+ users | 1 sprint |
| W7 | In-memory runtime lost on refresh | Listening progress, session state lost on page reload | 1 sprint |
| W8 | Validators not used by main engine | Dual logic path: engine uses `canRunMission()`, validators use separate logic | 1 sprint |
| W9 | No streak system | Highest-leverage retention mechanic missing | 2 sprints |
| W10 | No achievement/badge system | Long-term retention, social proof, identity missing | 2 sprints |

### 🟡 Medium

| # | Weakness | Fix Effort |
|---|----------|------------|
| W11 | Only VXP as reward type | 1 sprint |
| W12 | Mission state not enforced at DB level | 0.5 sprint |
| W13 | WordPress cache in-memory only | 1 sprint |
| W14 | React Query + Zustand progress duplication | 1 sprint |
| W15 | Hardcoded WordPress URL | 0.5 sprint |
| W16 | No mission funnel analytics | 2 sprints |
| W17 | Notifications in-memory only | 2 sprints |
| W18 | Referral flow incomplete | 2 sprints |
| W19 | No i18n/multi-language | 1 sprint |

---

# Benchmark

## Shopee Missions
| Dimension | VOKS | Shopee | Gap |
|-----------|------|--------|-----|
| Mission Types | 6 | 12+ | Missing: game, watch, collect, flash |
| Streak | None | Daily streak + bonus coins | **CRITICAL** |
| Reward Types | Only VXP | Coins+Vouchers+Shipping+Cashback | 1 dimension |
| Anti-Abuse | None | CAPTCHA, device/IP limits | At risk |

## GoPay Missions
| Dimension | VOKS | GoPay | Gap |
|-----------|------|-------|-----|
| Checkin | Exists | Spin wheel + streak | No gamified checkin |
| Referral | Validator only | QR code + share link + bonus | No full loop |
| Push | None | Reminder for incomplete missions | No re-engagement |

## Tokopedia Missions
| Dimension | VOKS | Tokopedia | Gap |
|-----------|------|-----------|-----|
| Season Pass | None | Event Pass (30-50 tiers) | **CRITICAL** |
| Flash Missions | None | Limited-time bonus | No urgency |
| Leaderboard | EF exists, no UI | XP rank + friend comparison | No UI |

## TikTok Rewards
| Dimension | VOKS | TikTok | Gap |
|-----------|------|--------|-----|
| Content Missions | None | Watch, like, comment, share | No content engagement |
| Achievement Badges | None | Level badges, milestones | No badge system |
| Personalized Feed | None | Recommended missions | No recommendation |

## Duolingo
| Dimension | VOKS | Duolingo | Gap |
|-----------|------|----------|-----|
| Streak | None | Freeze, repair, society | **CRITICAL** |
| Friend Leaderboard | None | Weekly XP league | No competition |
| Sound/Animation | None | Iconic ding, confetti | No delight |
| Offline | None | Full offline sync | PWA gap |

## Discord Quests
| Dimension | VOKS | Discord | Gap |
|-----------|------|---------|-----|
| Invite Quests | Share exists | Invite friend → reward | No invite flow |
| Partner Integration | None | Game trials, Nitro promos | No sponsors |
| Time-Limited | None | 7-30 day expiry | No expiration |

---

# Gap Analysis

| # | Current | Target | Impact | Complexity | Priority |
|---|---------|--------|--------|------------|----------|
| G1 | No tests | Unit + integration tests | Prevents confident refactoring | Medium | P0 |
| G2 | No streaks | Daily streak + freeze + milestones | 3x DAU retention | Medium | P0 |
| G3 | No achievements | Earnable badges + milestones | Long-term retention | Medium | P0 |
| G4 | No anti-abuse | Rate limit + idempotency + server validation | Protects economy | Medium | P0 |
| G5 | Listen duplicated | Single implementation | Eliminates bugs | Low | P0 |
| G6 | Client scheduler | Server cron + client fallback | Reliable resets | High | P1 |
| G7 | Per-second DB writes | Batch every 30-60s | 60x write reduction | Medium | P1 |
| G8 | No referral emission | Full referral loop | User acquisition | Medium | P1 |
| G9 | No season pass | Free + premium track | Monetization | High | P1 |
| G10 | Validators unused | Engine uses validators | Consistent logic | Medium | P1 |

---

# Priority Matrix

| Priority | Items | Total Effort |
|----------|-------|-------------|
| **P0 Critical** | Anti-abuse, listen consolidation, dead code removal, streaks, achievements, tests | ~9.5 sprints |
| **P1 High** | Server scheduler, batch listen, referral loop, season pass, wire validators | ~9 sprints |
| **P2 Medium** | Config, state consolidation, notifications, funnel analytics, flash missions, leaderboard | ~7.5 sprints |
| **P3 Low** | i18n, offline, logging, new mission types, sponsor missions, sound/animation | ~11.5 sprints |

---

# Production Readiness

| Dimension | Score |
|-----------|-------|
| Architecture | 7/10 |
| Scalability | 4/10 |
| Maintainability | 6/10 |
| Performance | 5/10 |
| Security | 7/10 |
| Reward Economy | 6/10 |
| Mission UX | 6/10 |
| Analytics | 5/10 |
| Admin | 6/10 |
| Developer Experience | 6/10 |

**Overall: 56/100**

### Go/No-Go
- ✅ **Pilot** (≤100 users): Go — monitor closely
- ❌ **Public Production**: No-go — anti-abuse, listen duplication, zero tests, client-side scheduler

---

# Sprint Recommendation

## Sprint 10: Foundation Cleanup
- Remove dead event bus code (0.5 sprint)
- Consolidate listen mission (1 sprint)
- WP URL → env config (0.5 sprint)

## Sprint 11-12: Anti-Abuse + Batching
- Rate limiting in Action Engine (1 sprint)
- Idempotency keys (0.5 sprint)
- Batch listen event recording (30s flush) (1 sprint)

## Sprint 12-13: Server-Side Scheduler
- Edge Function cron for daily/weekly/monthly resets
- Client scheduler → fallback

## Sprint 13-14: Tests
- Vitest/Playwright setup
- Mission engine unit tests
- Claim RPC tests
- Validator tests

## Sprint 15-16: Streak System
- `user_streaks` table
- Streak tracking + freeze mechanic
- Streak UI (flame, count, milestones)

## Sprint 17-18: Achievement System
- WordPress achievement CPT
- 8-10 launch achievements
- Badge display on profile

---

# Final Conclusion

**The Mission Engine is NOT ready for public production but IS ready for a controlled pilot.**

The architecture is sound (58/100). The Action Engine, validator pattern, and RPC-based claims are production-grade decisions. The main gaps are **production hardening** (anti-abuse, tests, scheduler) and **gamification depth** (streaks, achievements) — not fundamental architecture.

Four hard blockers must be resolved before scaling beyond 100 users:
1. **Anti-abuse** — economy will be exploited without rate limiting
2. **Listen consolidation** — two implementations will produce bugs
3. **Dead code removal** — maintenance confusion
4. **Tests** — no safety net for refactoring

Recommended: 4 hardening sprints → public beta → then add streaks + achievements in v1.1.

*End of Audit*
