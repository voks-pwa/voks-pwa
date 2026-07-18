# AI/101_ACTION_ENGINE_SPEC.md

# Action Engine Specification v1.0

Status:
Frozen Architecture

---

# Purpose

Action Engine adalah pusat seluruh event yang terjadi di aplikasi VOKS NEXT.

Semua interaksi pengguna harus menghasilkan Action.

Action kemudian diteruskan ke engine lain.

Action Engine TIDAK memberikan reward.

Action Engine hanya mengirim event.

---

# Architecture

User

↓

Action

↓

Action Engine

↓

Event Dispatcher

↓

Mission Engine

Campaign Engine

Achievement Engine

Badge Engine

Notification Engine

Analytics Engine

Reward Engine

---

# Responsibilities

Action Engine hanya bertugas:

- menerima action
- memvalidasi payload
- memberi timestamp
- memberi actor
- mendistribusikan event

Tidak boleh:

- grant XP
- unlock badge
- unlock achievement
- insert transaction

---

# Event Structure

Every Action contains

action

user_id

reference_id

payload

created_at

source

Example

```
{
 action:"mission_join",
 user_id:"uuid",
 reference_id:"mission_123",
 payload:{},
 source:"pwa"
}
```

---

# Source

Possible source

- pwa
- admin
- scheduler
- campaign
- webhook
- system

---

# Event Rules

Every user interaction

↓

must become Action

↓

Action Engine

↓

Dispatcher

↓

Other Engines