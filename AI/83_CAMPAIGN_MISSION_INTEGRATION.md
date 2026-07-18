# Campaign ↔ Mission Integration

## Philosophy

Campaign never owns Missions.

Mission never depends on Campaign.

Campaign groups Missions through campaign_slug.

---

Relationship

Campaign.slug

↓

Mission.campaign_slug

---

Flow

Campaign Detail

↓

Load Campaign.slug

↓

Load Missions where

campaign_slug == slug

↓

Mission Engine

↓

Return User Mission State

↓

Campaign UI

---

Campaign shows

- Total Missions
- Completed Missions
- In Progress Missions
- Locked Missions
- Total Campaign VXP
- Campaign Completion %

Campaign never calculates XP.

Campaign never validates mission progress.

Campaign never claims rewards.

Those responsibilities belong to Mission Engine.
