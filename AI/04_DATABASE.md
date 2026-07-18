# AI/04_DATABASE.md

Version: 1.0

Last Updated: 2026-07-13

---

# DATABASE ARCHITECTURE

This document defines the database architecture used by VOKS Radio PWA.

Supabase PostgreSQL is the only user database.

WordPress is NOT part of this database.

---

# DATABASE PRINCIPLE

Supabase stores

User Data

WordPress stores

Content Data

Never mix responsibilities.

---

# DATABASE OWNERSHIP

Profiles

Supabase

Authentication

Supabase Auth

Mission Progress

Supabase

Mission Completion

Supabase

XP Transactions

Supabase

Reward Redemption

Supabase

Notifications

Supabase

Settings

Supabase

---

# NEVER STORE

Mission Definition

Reward Definition

Article

Program

Podcast

Banner

inside Supabase.

Those belong to WordPress.

---

# MAIN TABLES

profiles

missions_progress

mission_completions

vxp_transactions

reward_redemptions

notifications

user_settings

---

# profiles

Purpose

Stores user profile.

Primary Key

id

Supabase Auth UUID

Important Fields

display_name

email

avatar_url

badge_name

role

level

current_vxp

lifetime_vxp

created_at

---

# missions_progress

Purpose

Stores current mission progress.

One row

per

User

Mission

Fields

id

user_id

mission_id

progress

completed

claimed

updated_at

Mission ID refers to WordPress Mission ID.

Never UUID.

---

# mission_completions

Purpose

Historical log.

Never update.

Never delete.

Fields

id

user_id

mission_id

reward

completed_at

This table is immutable.

---

# vxp_transactions

Purpose

Complete XP ledger.

Every XP change creates one row.

Never overwrite.

Fields

id

user_id

type

amount

balance_after

reference

created_at

---

# reward_redemptions

Purpose

Stores reward redemption history.

Fields

id

user_id

reward_id

status

created_at

approved_at

completed_at

---

# notifications

Purpose

Stores notification history.

Fields

id

user_id

type

title

message

read

created_at

---

# RELATIONSHIPS

profiles

↓

missions_progress

↓

mission_completions

↓

vxp_transactions

↓

reward_redemptions

↓

notifications

Every table references

profiles.id

---

# DATABASE FLOW

User

↓

Profile

↓

Mission Progress

↓

Mission Completion

↓

XP Transaction

↓

Reward Redemption

↓

Notification

---

# XP PRINCIPLE

current_vxp

Current balance

lifetime_vxp

Total earned

Never decrease lifetime_vxp.

---

# TRANSACTION PRINCIPLE

Transactions are immutable.

Never update.

Never delete.

Only append.

---

# MISSION PRINCIPLE

Mission Definition

WordPress

Mission Progress

Supabase

Mission Completion

Supabase

---

# REWARD PRINCIPLE

Reward Definition

WordPress

Reward Redemption

Supabase

---

# QUERY RULES

Never query database inside UI.

Correct flow

Component

↓

Hook

↓

Service

↓

Repository

↓

Supabase

---

# MIGRATION RULES

Every schema change

requires

Migration

Documentation

Approval

Never edit production tables manually.

---

# RLS

Every user

can only access

their own data.

Admin uses

Service Role

through Edge Functions.

Frontend never uses Service Role.

---

# AI NOTES

Before adding a new table

verify

Does similar table already exist?

Avoid duplication.

Always normalize.

Keep ownership clear.
