# VOKS RADIO PWA — PROJECT OVERVIEW

Version: 2.0

Last Updated: 2026-07-23

---

# Project Name

VOKS Radio Progressive Web Application (PWA)
yang Bernama VOKS NEXT "New Experience Transformation"

---

# Project Purpose

VOKS Radio PWA is the next-generation digital platform for VOKS Radio.

The application combines:

* Radio Streaming
* Reward System
* Mission System
* Gamification
* User Level
* XP (VXP)
* Redemption
* Admin Dashboard
* WordPress CMS
* Supabase Backend

The project is designed to be scalable, modular, maintainable, and AI-assisted.

---

# Tech Stack

Frontend

* React
* TypeScript
* Vite

Styling

* TailwindCSS

State Management

* Zustand

Server State

* React Query

Backend

* Supabase

Authentication

* Supabase Auth

Database

* PostgreSQL

CMS

* WordPress

API

* WordPress REST API

Server Logic

* Supabase Edge Functions

Deployment

* Cloudflare

---

# High Level Architecture

WordPress

↓

Mission Definition

Reward Definition

Articles

Radio Programs

Banners

↓

REST API

↓

React PWA

↓

Mission Engine

Reward Engine

Notification Engine

Commerce Engine

Subscription Engine

Automation Engine

↓

Supabase

↓

Database

↓

Users

Progress

Transactions

Redemptions

---

# Source of Truth

Mission Definition

WordPress

Reward Definition

WordPress

Articles

WordPress

Radio Programs

WordPress

Users

Supabase

Authentication

Supabase

XP

Supabase

Mission Progress

Supabase

Reward Redemption

Supabase

Notification

Supabase

---

# Project Modules

Frontend

src/features/

Authentication

Player

Mission

Rewards

Notifications

Transactions

Profile

Admin

Commerce

Subscription

Automation

Backend

supabase/functions/

admin-dashboard

admin-users

admin-user-detail

admin-user-actions

admin-transactions

admin-rewards

admin-reward-update

admin-update-redemption

admin-missions

admin-mission-update

admin-campaign-update

admin-broadcast

admin-broadcast-wp

admin-feature-flags

admin-settings

admin-analytics

admin-wp-stats

xp-transaction

campaign-analytics

leaderboard

payment-webhook

recommendation-engine

reward-analytics

scheduler

system-health

---

# Current Admin Modules

Dashboard

Status

Completed

Users

Status

Completed

Transactions

Status

Completed

Rewards

Status

Completed

Mission

Status

Completed

Settings

Status

Completed

Analytics

Status

Completed

Commerce

Status

Completed

Subscription

Status

Completed

Automation

Status

Completed

---

# Mission System

Mission Definition

WordPress

Mission Progress

Supabase

Mission Completion

Supabase

Mission Engine

React

Mission Runtime

React

Mission Reward

Supabase

---

# Reward System

Reward Definition

WordPress

Reward Redemption

Supabase

Reward Inventory

Supabase

---

# XP System

Current XP

Supabase

Lifetime XP

Supabase

Transactions

Supabase

Levels

Calculated

Badges

Calculated

---

# Commerce System

Payment Processing

payment-webhook

Subscription Management

Supabase

Transaction History

Supabase

---

# Subscription System

Tier Management

Supabase

User Subscriptions

Supabase

Auto-Renewal

scheduler

---

# Automation System

Campaign Automation

admin-campaign-update

Broadcast Automation

admin-broadcast

admin-broadcast-wp

Scheduled Tasks

scheduler

---

# AI Development Philosophy

This project is developed together with AI.

AI must never guess architecture.

AI must always read documentation before coding.

AI must update documentation after completing a task.

Documentation is the single source of truth.

---

# Folder Structure

src/

features/

admin/

missions/

dashboard/

users/

transactions/

rewards/

missions/

player/

profile/

notifications/

commerce/

subscription/

automation/

supabase/

functions/

---

# Development Principles

Modular

Reusable

Type Safe

Repository Pattern

Service Layer

Edge Function First

No duplicated logic

Maintainable

Scalable

AI Friendly

---

# Important Notes

Mission data comes from WordPress.

Mission progress comes from Supabase.

Reward catalog comes from WordPress.

Reward redemption comes from Supabase.

Never move mission definitions into Supabase.

Never duplicate WordPress business data.

Always synchronize using APIs.

---

# Documentation Order

AI MUST read documentation in the following order:

1. PROJECT_OVERVIEW
2. PROJECT_RULES
3. CODING_RULES
4. ARCHITECTURE
5. DATABASE
6. WORDPRESS
7. SUPABASE
8. ADMIN_PANEL
9. CURRENT_TASK
10. SESSION_MEMORY

Only after reading these files may AI begin coding.