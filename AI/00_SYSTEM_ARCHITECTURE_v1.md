> **Status: DEPRECATED** — This document describes an early engine architecture (v1.0) that no longer reflects the codebase. Since its writing, most engines were refactored into the 6-layer feature pattern (`UI → Hook → Service → Repository → Edge Function → Database`). Many new engines and modules were added. See notes throughout and the updated engine list at the bottom. Refer to `AI/03_ARCHITECTURE.md` for the current architecture.

# VOKS NEXT
## System Architecture v1.0

---

# Philosophy

VOKS NEXT is built using a modular Engine Architecture.

Every feature is developed as an independent Engine.

Each Engine has:

- Repository
- State
- Validator
- Scheduler (optional)
- UI Layer
- Analytics Layer

No Engine should directly modify another Engine.

Communication only happens through the Action Engine.

---

# High Level Architecture

                    WordPress CMS
                 (Content Management)
                          │
                          ▼
                 WordPress REST API
                          │
                          ▼
                 Repository Layer
                          │
                          ▼
                  Action Engine
                          │
     ┌──────────────┬──────────────┬──────────────┐
     ▼              ▼              ▼              ▼

 Mission Engine   Reward Engine  Campaign Engine  Live Engine

     ▼              ▼              ▼              ▼

Retention Engine  Achievement Engine  Notification Engine

     ▼              ▼              ▼

Leaderboard Engine

     ▼

Analytics Engine

     ▼

Premium Dashboard

---

> **Note:** The diagram above is historical. See "Actual Engine Inventory" below for the full list of engines currently in the codebase.

---

# Core Engines

## Action Engine

Responsibilities

- Track every user action
- Broadcast events
- Trigger Mission Engine
- Trigger Campaign Engine
- Trigger Reward Engine

Single Source of Truth.

---

## Mission Engine

Responsibilities

Mission lifecycle.

States (updated — `LOCKED` was renamed to `NOT_STARTED`)

NOT_STARTED

IN_PROGRESS

READY_TO_CLAIM

CLAIMED

HISTORY

ARCHIVED

Consumes Action Engine events only.

---

## Campaign Engine

Responsibilities

Seasonal Events

Sponsor Campaign

Brand Campaign

Special Event

Campaign controls Mission availability.

---

## Reward Engine

Responsibilities

VXP

Reward Store

Coupon

Voucher

Digital Reward

---

## Achievement Engine

Responsibilities

Badge

Milestone

Streak

Collection

Long-term progression.

---

## Leaderboard Engine

Responsibilities

XP Ranking

Season Ranking

Weekly Ranking

Monthly Ranking

All Time Ranking

---

## Retention Engine

Responsibilities

Daily Login

Daily Reward

Comeback Reward

Streak

Reminder

---

## Live Engine

Responsibilities

Owncast Video

Realtime Chat

Reaction

Poll

Presence

Live Giveaway

---

## Analytics Engine

Responsibilities

Listener Analytics

Campaign Analytics

Mission Analytics

Reward Analytics

Realtime Dashboard

---

## Notification Engine

Responsibilities

Push Notification

In App Notification

Mission Reminder

Campaign Reminder

Reward Reminder

---

# Repository Layer

WordPress

Programs

Hosts

Schedules

Promo

Mission

Campaign

Pages

News

Supabase

Profiles

Rewards

Leaderboard

Mission Progress

Campaign Progress

Achievements

Analytics

Realtime

---

# Communication Rules

Engine

↓

Action Engine

↓

Another Engine

Never

Mission

↓

Reward

Directly.

Never

Campaign

↓

Leaderboard

Directly.

Always

through

Action Engine.

---

# Design Rules

Every Engine must be

Independent

Replaceable

Testable

No circular dependency.

No Engine knows internal implementation of another Engine.

---

# 6-Layer Flow (Reconciliation)

The architecture described above (engines communicating through Action Engine) has evolved into a standardised 6-layer flow that every feature follows:

```
UI → Hook → Service → Repository → Edge Function → Database
```

Engines now live primarily at the **Service** layer (and sometimes the **Repository** layer). They do not cross-communicate directly. Instead:

- Engines at the Service layer can call other engines' services (via import) or dispatch events through the Action Engine.
- The Action Engine (`src/core/action-engine/`) remains the canonical event bus for cross-feature communication.
- Admin mutations go through Edge Functions → WordPress REST API (never direct from frontend).
- React Query owns server state; Zustand owns client state.

This replaces the earlier "all engines fan out from Action Engine" model with a linear data flow while keeping the Action Engine as the event backbone.

---

# Actual Engine Inventory (codebase as of 2026-07-23)

## Core engines (`src/core/`)

| Engine | Path |
|--------|------|
| Action Engine | `src/core/action-engine/` |
| Reward Engine | `src/core/reward-engine/` |
| Checkout Engine | `src/core/checkout-engine/` |

## Feature engines (`src/features/*/services/` or `src/features/*/engine/`)

| Engine | Path | Domain |
|--------|------|--------|
| missionEngine | `src/features/missions/services/missionEngine.ts` | Mission lifecycle, state machine |
| badgeEngine | `src/features/retention/services/badgeEngine.ts` | Badge awarding |
| streakEngine | `src/features/retention/services/streakEngine.ts` | Daily/weekly streak tracking |
| milestoneEngine | `src/features/retention/services/milestoneEngine.ts` | Milestone progression |
| loginRewardEngine | `src/features/retention/services/loginRewardEngine.ts` | Daily login rewards |
| achievementEngine | `src/features/retention/services/achievementEngine.ts` | Achievement system |
| walletEngine | `src/features/wallet/services/walletEngine.ts` | Wallet V2 with dual-ledger accounting |
| rewardSyncEngine | `src/features/rewards/services/rewardSyncEngine.ts` | WordPress ↔ Supabase reward catalog sync |
| RewardEngine | `src/features/rewards/services/RewardEngine.ts` | Reward operations (legacy) |
| commerceEngine | `src/features/commerce/services/commerceEngine.ts` | Commerce events, fulfillment, refunds |
| inventoryEngine | `src/features/inventory/services/inventoryEngine.ts` | Stock management, reservations |
| fulfillmentEngine | `src/features/shipping/services/fulfillmentEngine.ts` | Shipping fulfillment state machine |
| subscriptionEngine | `src/features/subscription/services/subscriptionEngine.ts` | Subscription plans, billing, renewals |
| automationEngine | `src/features/automation/services/automationEngine.ts` | Scheduled jobs, notification queues |
| redeemEngine | `src/features/redeem/engine/redeemEngine.ts` | Reward redemption flow |
| voucherPoolEngine | `src/features/voucher/engine/voucherPoolEngine.ts` | Voucher pool management |
| economyEngine | `src/features/economy/services/economyEngine.ts` | XP calculation, spending limits, economy config |
| pricingEngine | `src/features/economy/services/pricingEngine.ts` | Dynamic pricing rules |
| multiplierEngine | `src/features/economy/services/multiplierEngine.ts` | XP multiplier logic |
| AdminEngine | `src/features/admin/services/AdminEngine.ts` | Admin operations |

## Additional modules not documented in v1.0

| Module | Path | Purpose |
|--------|------|---------|
| Marketplace | `src/features/marketplace/` | Product catalog, categories, orders |
| Marketplace Voucher | `src/features/marketplace-voucher/` | Voucher listings on marketplace |
| Commerce | `src/features/commerce/` | Commerce events, fulfillment tracking |
| Checkout | `src/features/checkout/` | Checkout flow (uses Checkout Engine from core) |
| Wallet V2 (dual ledger) | `src/features/wallet/` | Dual-ledger wallet with credit/debit, transaction keys, idempotency |
| Subscription | `src/features/subscription/` | Recurring billing, plan management |
| Automation | `src/features/automation/` | Scheduled jobs, notification queue, dead-letter queue |
| Shipping / Fulfillment | `src/features/shipping/` | Physical reward shipping with status machine |
| Inventory | `src/features/inventory/` | Stock tracking, ledger, reservations |
| Voucher Pool | `src/features/voucher/` | Voucher generation, pool management |
| Redeem | `src/features/redeem/` | Reward redemption workflow |
| Economy | `src/features/economy/` | XP rules, multipliers, spending limits, pricing |

---

# Version

Architecture

v1.0 (DEPRECATED)

Status

Superseded by 6-layer flow (see `AI/03_ARCHITECTURE.md`)

Owner

CTO

Project

VOKS NEXT

---

*Document updated 2026-07-23 — reconciled with codebase, added deprecation notice, updated mission states (LOCKED → NOT_STARTED), added 6-layer flow reconciliation, added full engine inventory.*
