# AI/05_WORDPRESS.md

Version: 1.0

Last Updated: 2026-07-13

---

# WORDPRESS ARCHITECTURE

WordPress is the Content Management System.

It is NOT the user database.

---

# PURPOSE

WordPress stores

Mission Definitions

Reward Catalog

Articles

Programs

Podcast

Banner

Static Content

---

# NEVER STORE

Mission Progress

Mission Completion

XP

Transactions

Notifications

Profiles

Authentication

inside WordPress.

---

# DATA OWNERSHIP

Mission Definition

WordPress

Reward Definition

WordPress

Program

WordPress

Article

WordPress

Everything user related

Supabase

---

# CURRENT CUSTOM POST TYPES

missions

rewards

programs

articles

Future

podcasts

ads

events

---

# MISSION POST TYPE

Current endpoint

/wp-json/wp/v2/missions

Mission ID

WordPress Post ID

Mission IDs are stable.

Supabase references these IDs.

Never replace them.

---

# MISSION ACF

mission_type

mission_sort

mission_description

mission_badge

mission_vxp

mission_repeat

mission_icon

mission_action

mission_duration_minutes

mission_listen_mode

mission_target

mission_start

mission_end

mission_active

---

# REWARD ACF

reward_name

reward_cost

reward_category

reward_image

reward_active

reward_stock

reward_description

Future fields may be added.

---

# REST API

Read

Frontend

↓

WordPress

Write

Frontend

↓

Edge Function

↓

WordPress REST API

Frontend never updates WordPress directly.

---

# APPLICATION PASSWORD

Edge Functions authenticate using

WP_ADMIN_USER

WP_APPLICATION_PASSWORD

Stored only inside

Supabase Secrets.

Never expose credentials.

---

# UPDATE FLOW

Admin

↓

React

↓

Repository

↓

Edge Function

↓

WordPress REST API

↓

ACF

---

# CACHE

Mission definitions

cached in

missionWP.ts

Reload only when necessary.

Avoid unnecessary API requests.

---

# missionWP.ts

Responsibilities

Download missions

Normalize ACF

Convert to MissionConfig

Cache

Search by action

Search by ID

This file is the frontend adapter.

---

# MissionConfig

MissionConfig is the canonical frontend model.

All UI uses MissionConfig.

Never consume raw WordPress JSON.

---

# NORMALIZATION

Raw ACF

↓

normalizeMission()

↓

MissionConfig

↓

Application

Never bypass normalization.

---

# ADMIN

Admin updates

mission_active

mission_description

mission_target

mission_reward

mission_sort

through Edge Functions.

Never directly from React.

---

# FUTURE

WordPress may later manage

Achievement Definitions

Season Definitions

Leaderboards Metadata

Tournament Configuration

without changing Supabase schema.

---

# AI NOTES

When adding new mission fields

Update

ACF

↓

normalizeMission()

↓

MissionConfig

↓

types.ts

↓

UI

Never skip normalization.

WordPress is always the source of truth for content.
