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

States

LOCKED

AVAILABLE

IN_PROGRESS

READY_TO_CLAIM

CLAIMED

EXPIRED

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

# Version

Architecture

v1.0

Status

Frozen

Owner

CTO

Project

VOKS NEXT