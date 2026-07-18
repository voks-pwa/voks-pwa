# AI/12_API_REFERENCE.md

Version: 1.0

Last Updated: 2026-07-13

---

# API REFERENCE

This document lists every API used by VOKS Radio PWA.

---

# API GROUPS

The project currently communicates with

1.

Supabase Edge Functions

2.

WordPress REST API

3.

Supabase Database

---

# FRONTEND FLOW

Component

↓

Hook

↓

API

↓

Repository

↓

Edge Function

↓

Supabase

or

↓

WordPress

---

# EDGE FUNCTIONS

## admin-dashboard

Purpose

Dashboard statistics

Method

POST

Response

```json
{
  "success": true,
  "stats": {},
  "topUsers": [],
  "recentActivity": []
}
```

---

## admin-users

Purpose

Load users

Method

POST

Response

```json
{
  "success": true,
  "users": []
}
```

---

## admin-transactions

Purpose

XP history

Response

transactions[]

---

## admin-rewards

Purpose

Reward administration

Response

rewards[]

---

## admin-update-redemption

Purpose

Approve reward redemption

Input

reward_id

status

---

## admin-missions

Purpose

Mission statistics

Response

```json
{
  "success": true,
  "stats": {
    "12341": {
      "completed": 5,
      "in_progress": 2
    }
  }
}
```

---

## admin-mission-update

Purpose

Update WordPress mission

Input

missionId

title

description

reward

target

active

---

## xp-transaction

Purpose

Create XP transaction

Updates

profiles

vxp_transactions

---

# WORDPRESS REST

Mission

```text
GET
/wp-json/wp/v2/missions
```

Reward

```text
GET
/wp-json/wp/v2/rewards
```

Programs

```text
GET
/wp-json/wp/v2/programs
```

Articles

```text
GET
/wp-json/wp/v2/posts
```

---

# AUTHENTICATION

Frontend

↓

Supabase Auth

Admin

↓

Edge Function

↓

WordPress Application Password

---

# API RULES

Always

Repository

↓

API

Never fetch inside UI.

Never update WordPress directly.

---

# STANDARD RESPONSE

Success

```json
{
  "success": true,
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "error": ""
}
```

---

# AI NOTES

Whenever adding API

Document here.

Keep endpoint list updated.
