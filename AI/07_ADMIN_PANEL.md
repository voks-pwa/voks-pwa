# AI/07_ADMIN_PANEL.md

Version: 1.0

Last Updated: 2026-07-13

---

# ADMIN PANEL ARCHITECTURE

The Admin Panel manages application data.

It does NOT directly modify databases or WordPress.

Every modification passes through the architecture.

---

# PURPOSE

Admin manages

Users

Transactions

Rewards

Missions

Dashboard

Future

Settings

Analytics

Broadcast

Moderation

---

# CURRENT MODULES

Dashboard

Completed

Users

Completed

Transactions

Completed

Rewards

Completed

Missions

In Progress

Settings

Not Started

Analytics

Not Started

---

# FOLDER STRUCTURE

```text
src/features/admin/

dashboard/

users/

transactions/

rewards/

missions/
```

Every module follows

api/

components/

hooks/

pages/

types.ts

---

# DATA FLOW

Admin UI

↓

React Query

↓

API Layer

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

# DASHBOARD

Edge Function

admin-dashboard

Displays

Statistics

Recent Activity

Top Users

Counts

---

# USERS

Edge Function

admin-users

Displays

Profile

Role

XP

Level

Badge

Future

Suspend

Ban

Reset XP

---

# TRANSACTIONS

Edge Function

admin-transactions

Displays

XP History

Reason

Amount

Date

Never editable.

---

# REWARDS

Edge Function

admin-rewards

Displays

Reward Catalog

Stock

Category

Status

Future

CRUD

---

# MISSIONS

Mission definitions

WordPress

Mission statistics

Supabase

Current flow

MissionTable

↓

MissionRow

↓

MissionActionMenu

↓

admin-mission-update

↓

WordPress

Mission statistics

↓

admin-missions

↓

Supabase

---

# ADMIN ACTIONS

Edit

↓

Edge Function

Toggle Active

↓

Edge Function

Delete

Future

Create

Future

---

# DESIGN PRINCIPLES

Fast

Simple

Minimal

Responsive

Professional

---

# UI COMPONENTS

MissionTable

MissionRow

MissionStatusBadge

MissionActionMenu

Search

Pagination (future)

Filters (future)

---

# REACT QUERY

Every page should use

useQuery()

Mutations

↓

useMutation()

Never call fetch directly inside components.

---

# ADMIN API

Each module owns its own api/

Example

missions/api/

users/api/

dashboard/api/

Never mix APIs.

---

# PERMISSIONS

Future

Admin

Super Admin

Moderator

Content Manager

Current

Single Admin Role

---

# ERROR HANDLING

Show readable messages.

Never expose

SQL

Stack trace

Secrets

---

# FUTURE ROADMAP

Analytics

System Settings

Broadcast Notifications

Mission Builder

Reward Builder

Feature Flags

Audit Log

Role Management

---

# AI RULES

Before creating new admin pages

Search existing patterns.

Reuse

Table

Badge

Menu

Card

Hook

Repository

Never create duplicate admin components.

Consistency is mandatory.

The Admin Panel should always look like one cohesive system.
