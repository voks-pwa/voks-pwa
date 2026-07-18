# Canonical User Service

Status

CORE FOUNDATION

Version

1.0

---

Goal

Create one single source of truth
for every user.

No module may read profile data directly
from Supabase or WordPress.

All modules must use

UserCanonicalService.

---

Sources

Supabase Auth

↓

Profiles

↓

Wallet

↓

Achievements

↓

Badges

↓

Referral

↓

Mission

↓

Notification

↓

Admin

↓

Reward

↓

Campaign

---

Output

Canonical User

{
id

email

avatar_url

display_name

role

status

current_vxp

lifetime_vxp

level

badge

profile_completed

referral_code

referral_url

phone

city

province

social

permissions

}

---

Every module

MUST consume

Canonical User.

Never query

profiles

directly.

Never query

wallet

directly.

Never query

auth.users

directly.