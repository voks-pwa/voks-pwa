# Current Architecture

Current Core

WordPress

↓

Supabase

↓

Action Engine

↓

Mission Engine

↓

Wallet

↓

Reward

↓

Notification

↓

Admin

↓

Frontend

---

Problem

Every module still reads user independently.

Canonical User Service

will solve this.

---

Target Architecture

WordPress

Supabase

↓

Canonical User Service

↓

Mission

Reward

Wallet

Campaign

Notification

Leaderboard

Admin

Frontend