# AI/06_SUPABASE.md

Version: 1.0

Last Updated: 2026-07-13

---

# SUPABASE ARCHITECTURE

Supabase is the backend platform used by VOKS Radio PWA.

Responsibilities:

* Authentication
* Database
* Storage
* Edge Functions
* Security
* Realtime (future)

Supabase is NOT a CMS.

WordPress remains the CMS.

---

# PROJECT STRUCTURE

```text
supabase/

functions/

admin-dashboard

admin-users

admin-transactions

admin-rewards

admin-update-redemption

admin-missions

admin-mission-update

xp-transaction
```

---

# RESPONSIBILITIES

Supabase owns

Authentication

↓

Profiles

↓

Mission Progress

↓

Mission Completion

↓

Transactions

↓

Reward Redemption

↓

Notifications

---

# AUTHENTICATION

Provider

Supabase Auth

Primary Key

auth.users.id

Every profile references

auth.users.id

Never create custom authentication.

---

# DATABASE ACCESS

Frontend

↓

Repository

↓

Supabase Client

Never query Supabase directly from UI.

---

# EDGE FUNCTIONS

Edge Functions are used when

* Service Role required
* WordPress update
* Admin action
* Secure validation
* Multi-step transaction

Never expose Service Role Key.

---

# CURRENT EDGE FUNCTIONS

admin-dashboard

Purpose

Dashboard statistics

---

admin-users

Purpose

Manage users

---

admin-transactions

Purpose

Transaction history

---

admin-rewards

Purpose

Reward administration

---

admin-update-redemption

Purpose

Approve reward redemption

---

admin-missions

Purpose

Mission statistics

---

admin-mission-update

Purpose

Update WordPress Mission

---

xp-transaction

Purpose

XP transaction processing

---

# SERVICE ROLE

Only Edge Functions may use

SUPABASE_SERVICE_ROLE_KEY

Frontend always uses

Anon Key

---

# ENVIRONMENT VARIABLES

SUPABASE_URL

SUPABASE_ANON_KEY

SUPABASE_SERVICE_ROLE_KEY

WP_ADMIN_USER

WP_APPLICATION_PASSWORD

Never hardcode secrets.

---

# RLS

Every table should use Row Level Security.

Users

↓

Own rows only

Admins

↓

Service Role

Never disable RLS unless documented.

---

# FILE STORAGE

Currently unused.

Future

Avatar

Reward Images

Podcast

Audio

Documents

---

# TRANSACTION RULES

XP changes

must always create

vxp_transactions

Never update XP without transaction history.

---

# EDGE FUNCTION RESPONSE

Always

{
success: true,
data: ...
}

Errors

{
success: false,
error: ...
}

Never return raw exceptions.

---

# LOGGING

Edge Functions should log

Start

Input

Validation

Database

Result

Error

Only during development.

---

# DEPLOYMENT

Deploy

```bash
supabase functions deploy <function-name>
```

Secrets

```bash
supabase secrets set
```

Logs

```bash
supabase functions logs
```

---

# AI RULES

Before creating a new Edge Function

Search existing ones.

Prefer extending.

Never duplicate functionality.

---

# FUTURE

Realtime

Storage

Cron Jobs

Webhook

Scheduled Tasks

Analytics

will all use Supabase.

Supabase is the backend platform.

WordPress remains content only.
