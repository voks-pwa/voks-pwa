# AI/10_PLAYER_SYSTEM.md

Version: 1.0

Last Updated: 2026-07-13

---

# PLAYER SYSTEM

Player System controls radio playback.

Mission Engine depends on Player System.

---

# RESPONSIBILITIES

Audio playback

Connection state

Listening duration

Player events

Mission triggers

---

# CURRENT STORE

PlayerStore

Responsibilities

Current Stream

Playing

Paused

Stopped

Connection

Volume

Metadata

---

# PLAYER FLOW

User

↓

Player UI

↓

Player Store

↓

Audio Engine

↓

Mission Runner

---

# PLAYER EVENTS

Current

player_play

player_pause

player_stop

player_disconnect

listen_tick

scheduler_tick

Future

buffering

reconnect

stream_changed

quality_changed

podcast_finished

---

# LISTEN TICK

listen_tick

fires every second

↓

Mission Runner

↓

Mission Engine

↓

Mission Progress

Never calculate duration inside UI.

---

# STREAM

Current

Radio Stream

Future

Podcast

Live Event

Archive

Premium Stream

---

# MISSION CONNECTION

Player

never

updates missions.

Player

only emits actions.

Mission Engine decides.

---

# AUDIO RESPONSIBILITY

Player

↓

Audio only

Mission Engine

↓

Gamification

Notification

↓

Feedback

---

# AI NOTES

Never mix

Player logic

with

Mission logic.

Player emits.

Mission decides.
