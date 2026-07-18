# AI/03_ARCHITECTURE.md

Version: 1.0

Last Updated: 2026-07-13

---

# SYSTEM ARCHITECTURE

This document explains how every major module in the VOKS Radio PWA communicates.

Never bypass this architecture.

---

# Overall Architecture

```
                    WordPress
                        │
        ┌───────────────┼────────────────┐
        │               │                │
     Missions        Rewards         Articles
        │               │                │
        └───────────────┼────────────────┘
                        │
               WordPress REST API
                        │
                        ▼
                 React PWA Frontend
                        │
        ┌───────────────┼────────────────┐
        │               │                │
     Mission        Reward          Admin Panel
      Engine         Engine
        │               │
        └───────────────┼────────────────┐
                        │                │
                   React Query       Zustand
                        │
                        ▼
                Supabase Edge Functions
                        │
                        ▼
                   Supabase Database
                        │
                        ▼
                    PostgreSQL
```

---

# Architecture Layers

The application is divided into six layers.

```
Presentation

↓

Hooks

↓

Service

↓

Repository

↓

Edge Function

↓

Database
```

Every feature follows this order.

---

# Presentation Layer

Location

```
src/features/**/pages
```

or

```
components/
```

Responsibilities

* Render UI
* Handle user interaction
* Call hooks

Never

* Business logic
* SQL
* WordPress API

---

# Hooks Layer

Location

```
hooks/
```

Responsibilities

* React Query
* Zustand
* UI State

Hooks connect UI with Services.

---

# Service Layer

Location

```
services/
```

Responsibilities

Business logic.

Examples

MissionService

RewardService

DashboardService

TransactionService

Services coordinate repositories.

---

# Repository Layer

Location

```
repositories/
```

Responsibilities

Database access only.

Repositories know:

Supabase

Edge Function

REST API

Repositories never calculate rewards.

Repositories never update UI.

---

# Engine Layer

Location

```
engine/
```

Responsibilities

Complex workflows.

Current engines

Mission Engine

Reward Engine

Notification Engine

Future

Achievement Engine

Level Engine

---

# Store Layer

Location

```
store.ts
```

Current stores

MissionStore

NotificationStore

PlayerStore

ProfileStore

Only client state belongs here.

---

# Edge Functions

Location

```
supabase/functions/
```

Responsibilities

Secure server logic.

Current functions

admin-dashboard

admin-users

admin-transactions

admin-rewards

admin-update-redemption

admin-missions

admin-mission-update

xp-transaction

Future

admin-settings

admin-analytics

---

# WordPress Responsibilities

WordPress owns content.

Examples

Mission Definition

Reward Definition

Articles

Programs

Podcast

Banner

CMS

WordPress never stores

Mission Progress

XP

Transactions

User Level

Notifications

---

# Supabase Responsibilities

Supabase owns user data.

Examples

Profiles

Authentication

Mission Progress

Mission Completion

Reward Redemption

XP

Transactions

Notifications

---

# Data Ownership

Mission

Definition

WordPress

Mission

Progress

Supabase

Mission

Completion

Supabase

Reward Catalog

WordPress

Reward Redemption

Supabase

Users

Supabase

Authentication

Supabase

Articles

WordPress

Programs

WordPress

---

# Admin Architecture

```
Admin UI

↓

React Query

↓

Repository

↓

Edge Function

↓

WordPress REST API

↓

WordPress ACF
```

Admin never updates WordPress directly.

---

# Player Architecture

```
Audio Player

↓

Player Store

↓

Mission Runner

↓

Mission Engine

↓

Supabase
```

---

# Mission Flow

```
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

Mission Store

↓

Notification Store
```

Mission Engine is the only module allowed to complete missions.

---

# Reward Flow

```
Reward List

↓

WordPress

↓

User Redeem

↓

Edge Function

↓

Supabase

↓

Reward Redemption
```

---

# Notification Flow

```
Mission Complete

↓

Notification Store

↓

Notification UI

↓

User
```

---

# React Query Responsibilities

Fetch

Cache

Invalidate

Refetch

Never use React Query for local UI state.

---

# Zustand Responsibilities

Player

Dialog

Sidebar

Mission Runtime

Notification

Never store API cache here.

---

# Current Architecture Status

Authentication

Completed

Player

Completed

Mission Engine

Completed

Reward Engine

Completed

Admin Dashboard

Completed

Mission Admin

In Progress

Analytics

Planned

Settings

Planned

---

# Future Expansion

Planned modules

Achievement Engine

Season Pass

Leaderboard

Tournament

Referral System

Marketplace

Radio Schedule

Podcast

Advertising

---

# AI Notes

When implementing any feature:

Identify layer.

Never skip layers.

Never move business logic upward.

Always preserve architecture consistency.
