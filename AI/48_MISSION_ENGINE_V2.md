# Sprint 9 — Mission Engine V2

Status:
IN PROGRESS

Priority:
CRITICAL

Objective

Mission menjadi sistem utama retention PWA VOKS.

WordPress hanya sebagai CMS.

Seluruh validasi dijalankan oleh Mission Engine.

---

Mission Flow

WordPress Mission

↓

Mission Engine

↓

Validation Engine

↓

Mission Progress

↓

Ready To Claim

↓

Reward Engine

↓

History

---

Mission States

AVAILABLE

JOINED

IN_PROGRESS

READY_TO_CLAIM

CLAIMED

EXPIRED

---

Supported Mission Types

Daily

Listening

Referral

Share

Complete Profile

Special

Event

Partner

---

Mission Rules

Daily Checkin

- hanya 1 claim / hari

Listening

- progress realtime
- continuous mode
- accumulative mode
- sesuai ACF

Referral

Reward diberikan kepada referrer.

Share

gunakan navigator.share()

Complete Profile

cek:

avatar

instagram

whatsapp

display_name

---

Mission Card

Display

Mission Icon

Mission Title

Mission Description

Mission Badge

Reward

Progress

Action Button

Button State

Join

Continue

Claim

Completed

Expired

---

Mission Detail

Mission Banner

Mission Rules

Reward

Progress

Mission Duration

Mission Type

Mission History

Action Button

---

Mission History

Gunakan

Mission Name

bukan

Mission ID

Display

Mission

Reward

Status

Completed Time

---

Validation

Tidak boleh double claim.

Gunakan

user_id

mission_id

period

Period

daily

weekly

monthly

once

---

Reward Engine

Reward hanya diberikan ketika

READY_TO_CLAIM

↓

CLAIM

berhasil.

Gunakan transaction.

Rollback apabila gagal.

---

Admin

Mission Monitor

Mission Statistics

Mission Progress

Mission Completion Rate

Mission Claim Rate

Mission Failure

Mission tetap dibuat dari WordPress.