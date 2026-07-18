# AI/09_REWARD_SYSTEM.md

Version: 1.0

Last Updated: 2026-07-13

---

# REWARD SYSTEM

Reward System manages every reward earned and redeemed inside VOKS Radio PWA.

Rewards are divided into two categories.

1. Mission Rewards

↓

XP

2. Redemption Rewards

↓

Real-world items

---

# OWNERSHIP

Reward Definition

WordPress

Reward Redemption

Supabase

Reward Progress

Supabase

Reward UI

Frontend

---

# FLOW

Mission Complete

↓

Mission Reward Service

↓

XP Transaction

↓

Profile Update

↓

Notification

---

# REWARD CATALOG

Source

WordPress

REST Endpoint

/wp-json/wp/v2/rewards

Reward definitions never exist in Supabase.

---

# XP

Mission Reward

↓

XP Transaction

↓

current_vxp

↓

lifetime_vxp

current_vxp

can increase

can decrease

lifetime_vxp

only increases

---

# REDEMPTION FLOW

Reward Page

↓

Reward Repository

↓

Edge Function

↓

Supabase

↓

reward_redemptions

↓

Admin Approval

---

# REDEMPTION STATUS

pending

approved

rejected

completed

cancelled

---

# EDGE FUNCTION

Current

admin-rewards

admin-update-redemption

Future

reward-redeem

reward-stock

---

# REWARD RULES

Reward cost

always from WordPress

Reward stock

future

Reward category

future

Reward image

WordPress

Reward history

Supabase

---

# XP TRANSACTION

Every reward creates

exactly one

XP transaction.

Never directly update XP.

---

# AI NOTES

Never hardcode rewards.

Always read

WordPress

↓

RewardConfig

↓

Reward System
