# AI/08_MISSION_ENGINE.md

Version: 1.0

Last Updated: 2026-07-13

---

# MISSION ENGINE

Mission Engine is the heart of the VOKS Radio PWA gamification system.

Every mission completion MUST pass through Mission Engine.

No module is allowed to complete missions directly.

---

# PURPOSE

Mission Engine handles

* Mission validation
* Progress update
* Completion
* Reward calculation
* Claim
* Repeat mission
* Notification

---

# FLOW

```text
Player Action

↓

Mission Runner

↓

Mission Engine

↓

Mission Progress Service

↓

Mission Reward Service

↓

Mission Claim Service

↓

Mission Repeat

↓

Mission Store

↓

Notification
```

---

# CURRENT FILES

```text
engine/

missionEngine.ts

missionRunner.ts

missionProgressService.ts

missionRewardService.ts

missionClaimService.ts

missionRepeat.ts

missionRuntime.ts

missionRules.ts

missionStore.ts

missionWP.ts
```

---

# MISSION SOURCE

Mission definitions come from

WordPress

missionWP.ts downloads

↓

normalizeMission()

↓

MissionConfig

↓

Mission Engine

Mission Engine never reads WordPress directly.

---

# PLAYER ACTIONS

Current actions

listen

listen_tick

player_play

player_pause

player_stop

player_disconnect

scheduler_tick

Future actions

share_story

invite_friend

review_google

daily_login

watch_ads

---

# MISSION TYPES

Current

Daily

Continuous

Repeatable

Accumulative

Future

Weekly

Monthly

Seasonal

Event

---

# PROGRESS

Mission Engine never edits progress manually.

Progress always goes through

processMissionProgress()

---

# REWARD

Completion

↓

processMissionReward()

↓

XP Transaction

↓

Mission Claim

---

# CLAIM

Mission completion

does not automatically mean

claimed.

Mission Claim Service handles

claimed status.

---

# REPEAT

Repeatable missions

↓

missionRepeat.ts

↓

reset progress

↓

continue

---

# DAILY RESET

scheduler_tick

↓

processDailyReset()

↓

Mission Runtime

↓

Mission Store

---

# STORE

Mission Store contains

Current Progress

Completed

Reward

Claimed

Target

Never store permanent data here.

---

# NOTIFICATION

Mission Complete

↓

Notification Store

↓

UI

---

# RULES

Only Mission Engine

may

Complete mission

Calculate reward

Claim mission

Repeat mission

No other module may do this.

---

# AI NOTES

When implementing new mission types

Never modify Mission Runner first.

Always

Mission Rules

↓

Mission Progress

↓

Mission Reward

↓

Mission Engine

Mission Engine is always the orchestrator.
