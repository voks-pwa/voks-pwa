# Core Architecture Freeze v1.0

Status:
FROZEN

Purpose

Core modules below are now considered stable.

New features must extend these modules.

Do not redesign or rewrite them unless explicitly requested.

---

Frozen Modules

- Authentication
- Profile
- Reward Engine
- Mission Engine
- Referral Engine
- Notification Engine
- WordPress Integration
- Live Engine
- Analytics Engine

---

Mission Engine

Mission Definition
→ WordPress CPT

Mission Progress
→ Supabase

Mission Validator
→ Validator Layer

Reward
→ Reward Engine

History
→ Mission History

---

Referral

Profile owns

- referral_code
- referred_by

Referral relationship

→ referrals table

Reward

→ Reward Engine only

---

Profile Complete

Required

Avatar

Display Name

Full Name

Phone Number

Birthday

Gender

Province

Instagram

TikTok

Calculated automatically.

Never manually updated.

---

Future Features

May plug into Mission Engine

- QR Event
- Sponsor Campaign
- Live Event
- Social Share
- Poll
- Giveaway
- Watch Video
- Listen Program