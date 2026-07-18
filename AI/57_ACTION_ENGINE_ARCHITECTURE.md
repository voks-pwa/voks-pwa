# Action Engine Architecture

Status

NEW FOUNDATION

Version

v1.0

---

Purpose

All user activities must flow through one engine.

Mission Engine no longer detects user activity directly.

Mission Engine only reads events.

---

Architecture

User Action

↓

Action Engine

↓

Event Store

↓

Mission Validator

↓

Mission Progress

↓

Reward Engine

↓

History

---

Action Engine Responsibilities

Record events

Validate payload

Prevent duplicate events

Normalize event format

Dispatch event

Never grant rewards.

Never update mission progress directly.

---

Consumers

Mission Engine

Reward Engine

Analytics

Live Engine

Notification Engine

Future Sponsor Engine

Future Campaign Engine

Future Achievement Engine

Future Badge Engine

Future Leaderboard Engine