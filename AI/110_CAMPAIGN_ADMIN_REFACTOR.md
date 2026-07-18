# Campaign Admin Refactor v2

Status

Architecture Refactor

---

Objective

Remove unnecessary dependency on campaign-analytics Edge Function.

Campaign Admin must become a native dashboard over Campaign Engine.

WordPress remains the Source of Truth.

Supabase becomes the operational data layer.

---

Architecture

WordPress Campaign CPT
        │
        ▼
Campaign Sync
        │
        ▼
Campaign Engine
        │
        ├── PWA
        ├── Mission Engine
        ├── Notification Engine
        └── Admin Dashboard

Campaign statistics MUST come from Supabase.

Campaign metadata MAY come from WordPress (or campaign_cache in future Sprint).

---

Campaign Metadata

Read from

/wp-json/wp/v2/campaign?_embed

Fields

- title
- subtitle
- banner
- thumbnail
- sponsor
- theme_color
- featured
- priority
- active
- schedule
- deep_link

---

Campaign Statistics

Read ONLY from Supabase.

Never call WordPress.

Statistics include

- participant_count
- mission_count
- completed_count
- completion_rate
- reward_distributed
- xp_distributed
- active_today

---

Campaign Status

ACTIVE

campaign_active == true

AND

now >= campaign_start

AND

now <= campaign_end

Else

INACTIVE

---

Moderation

Moderation becomes Campaign Health Dashboard.

Display

Campaign

Participants

Completion %

Mission Count

XP Issued

Reward Distributed

Recent Activity

Mission Errors

Refresh Statistics

Recalculate Cache

No editing.

Campaign editing remains inside WordPress.

---

Edge Function

campaign-analytics

No longer required by Admin.

Do not remove it yet.

Mark as deprecated.

No Admin page should depend on it.

---

Verification

Admin Campaign page loads without Edge Function.

No CORS.

No OPTIONS request.

Campaign data matches WordPress.

Statistics match Supabase.

Update

AI/17_CHANGELOG.md