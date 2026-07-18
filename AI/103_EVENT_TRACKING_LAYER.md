# AI/103_EVENT_TRACKING_LAYER.md

# Event Tracking Layer

Status

Frozen

---

# Purpose

Event Tracking Layer mencatat seluruh Action yang terjadi pada aplikasi.

Layer ini menjadi fondasi:

Mission Engine

Analytics

Notification

Campaign

Achievement

Reward

Leaderboard

---

# Flow

User

↓

Action Engine

↓

Tracking Layer

↓

Mission Engine

↓

Reward Engine

↓

Notification

↓

Analytics

---

# Tracking Principles

Every Action

↓

tracked once

Never duplicated

Never skipped

---

# Tracking Payload

Every Event stores

event_name

user_id

source

reference

payload

created_at

---

# Duplicate Prevention

Same

user

+

event

+

reference

within cooldown

↓

ignore

---

# Scheduler Events

Scheduler boleh menghasilkan

scheduler_tick

daily_reset

campaign_start

campaign_end

leaderboard_refresh

mission_refresh

Semua scheduler event tetap masuk Tracking Layer.

---

# Analytics

Tracking Layer menjadi satu-satunya sumber data untuk:

Daily Active Users

Mission Completion

Campaign Performance

Listening Behaviour

Retention

Conversion

Referral

Leaderboard

No analytics module boleh membaca langsung dari Mission Engine.

Analytics membaca Event Tracking Layer.

---

# Production Rule

Every feature

↓

must emit Action

↓

Action Engine

↓

Tracking Layer

↓

Other Engines

Never bypass Tracking Layer.