# Mission Engine Architecture

Mission Definition

↓

Validator

↓

Progress

↓

State

↓

Reward Engine

↓

History

---

Mission Definition

Source

WordPress CPT

https://voksradio.com/wp-json/wp/v2/missions?_embed

Definition never changes.

---

Mission Progress

Stored in Supabase.

Contains

user_id

mission_id

progress

status

claimed_at

completed_at

---

Mission State

AVAILABLE

Mission can start.

---

IN_PROGRESS

Progress exists.

---

READY_TO_CLAIM

Target reached.

Reward not yet received.

---

CLAIMED

Reward received.

Immediately moved to History.

---

Mission Visibility

Mission Page

AVAILABLE

IN_PROGRESS

READY_TO_CLAIM

History Page

CLAIMED

Only.

---

Validator Examples

Daily Checkin

One claim per day.

Listening

Continuous timer.

Referral

Verified signup.

Profile

100% required fields.

Share

navigator.share success.

Future validators should plug into the same architecture.

Validator must never directly modify rewards.

Reward Engine handles rewards.