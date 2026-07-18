# AI/13_EDGE_FUNCTIONS.md

Version: 1.0

Last Updated: 2026-07-13

---

# EDGE FUNCTIONS

This document describes every Edge Function.

---

# PURPOSE

Edge Functions provide

Secure backend logic.

They are the only modules allowed to use

Service Role.

---

# CURRENT FUNCTIONS

## admin-dashboard

Purpose

Dashboard

Returns

Statistics

Recent Activity

Top Users

---

## admin-users

Purpose

Load users

Future

Ban

Role

Reset XP

---

## admin-transactions

Purpose

Load transaction history

Read only

---

## admin-rewards

Purpose

Reward administration

Future CRUD

---

## admin-update-redemption

Purpose

Approve redemption

Workflow

Pending

↓

Approved

↓

Completed

---

## admin-missions

Purpose

Mission statistics

Reads

mission_progress

mission_completion

Returns

completed

in_progress

---

## admin-mission-update

Purpose

Updates

WordPress Mission

Uses

Application Password

---

## xp-transaction

Purpose

XP Ledger

Responsibilities

Create transaction

Update balance

Lifetime XP

---

# FUTURE FUNCTIONS

reward-redeem

leaderboard

analytics

settings

broadcast

podcast-sync

program-sync

---

# DIRECTORY

```text
supabase/functions/

admin-dashboard/

admin-users/

admin-transactions/

admin-rewards/

admin-update-redemption/

admin-missions/

admin-mission-update/

xp-transaction/
```

---

# DEPLOYMENT

Deploy

```bash
supabase functions deploy admin-dashboard
```

Deploy All

Future

CI/CD

---

# SECRETS

Current

SUPABASE_URL

SUPABASE_SERVICE_ROLE_KEY

WP_ADMIN_USER

WP_APPLICATION_PASSWORD

---

# AI RULES

Before creating Edge Function

Search existing ones.

Prefer extending.

Avoid duplicate logic.

One responsibility

per function.
