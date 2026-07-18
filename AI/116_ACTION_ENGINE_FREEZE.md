# Sprint 12.6 — Action Engine Freeze v1.0

Status

Foundation Freeze

---

Objective

Freeze Action Engine as the single event source across VOKS NEXT.

No module may modify Mission, XP, Achievement or Leaderboard directly.

Everything must flow through Action Engine.

---

Canonical Flow

User Action

↓

Action Engine

↓

Mission Engine

↓

XP Engine

↓

Achievement Engine

↓

Leaderboard Engine

↓

Notification Engine

↓

History

---

Supported Actions

checkin

listen_start

listen_progress

listen_complete

profile_completed

share

referral

campaign_join

campaign_complete

mission_join

mission_complete

reward_claim

badge_unlock

achievement_unlock

reaction_send

chat_send

poll_vote

future

purchase

store_redeem

watch_video

---

Rules

Every action

must

have

action_type

user_id

timestamp

payload

Action Engine never contains business logic.

Business logic belongs to downstream engines.

---

Verification

Search project.

Ensure no module bypasses Action Engine.

Mission Engine receives only Action events.

XP Engine receives only Mission events.

Achievement Engine receives only XP / Mission events.

Update AI/17_CHANGELOG.md