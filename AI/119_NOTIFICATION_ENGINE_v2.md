# Sprint 13 — Notification Engine v2

Status

Core Platform

---

Objective

Build an event-driven Notification Engine.

Notification must subscribe to Action Engine.

No module may directly create notifications.

---

Architecture

Action Engine

↓

Notification Engine

↓

notification_queue

↓

notification_delivery

↓

notification_history

↓

PWA

↓

Admin

---

Sources

Mission Engine

Campaign Engine

Achievement Engine

Leaderboard Engine

Reward Engine

Live Engine

Profile Engine

Future

Store

Wallet

Subscription

---

Supported Notification Types

Mission

Campaign

Achievement

Badge

Reward

XP

Leaderboard

Referral

Share

Profile

Live

Moderator

System

Announcement

---

Priority

Critical

High

Normal

Low

Silent

---

Delivery

In-App

Push (future)

Email (future)

WhatsApp (future)

Discord Webhook (future)

---

Read State

UNREAD

↓

READ

↓

ARCHIVED

Never delete notification automatically.

---

Grouping

XP notifications

↓

merge

Mission completed

↓

single notification

Campaign completed

↓

single notification

Spam prevention required.

---

Verification

Notification generated only from Action Engine.

No module inserts directly into notifications table.

History preserved.

Update AI/17_CHANGELOG.md