# AI/11_NOTIFICATION_SYSTEM.md

Version: 1.0

Last Updated: 2026-07-13

---

# NOTIFICATION SYSTEM

Notification System delivers feedback to users.

Notifications are UI state.

History is stored in Supabase.

---

# RESPONSIBILITIES

Mission Complete

Reward Earned

Reward Approved

XP Earned

System Messages

Future Push Notifications

---

# FLOW

Mission Complete

↓

Notification Store

↓

Notification UI

↓

User

---

# STORE

NotificationStore

Current responsibilities

Queue

Read

Unread

Dismiss

Animation

---

# DATABASE

notifications

Purpose

History

Audit

Cross-device sync

---

# TYPES

Current

mission

reward

system

Future

announcement

broadcast

promotion

maintenance

friend

referral

---

# CURRENT FLOW

Mission Engine

↓

Notification Store

↓

Toast

↓

Notification Page

---

# UI

Notification Bell

Toast

History

Future

Push

Email

In-app Inbox

---

# RULES

Notification Store

owns UI

Database

owns history

Never directly modify UI from Mission Engine.

Always use Notification Store.

---

# FUTURE

Realtime notifications

Supabase Realtime

↓

Notification Store

↓

UI

---

# AI NOTES

Any new feature that informs the user

must use

Notification Store.

Never build a second notification system.
