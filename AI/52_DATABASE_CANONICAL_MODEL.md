# Canonical Database Model

## Profiles

Application MUST only use

avatar_url

display_name

full_name

phone_number

birthday

gender

province

instagram

tiktok

facebook

youtube

threads

website

favorite_program

favorite_music

current_vxp

lifetime_vxp

role

referral_code

profile_completed

updated_at

---

Legacy fields

phone

birth_date

completed_profile

remain in database only for backward compatibility.

Never use them inside React.

---

Profile Completion

Required

full_name

display_name

birthday

gender

province

city

instagram

tiktok

Everything else optional (including avatar_url, phone_number, facebook, threads, youtube, website, bio, favorite_program, favorite_music).

Completion is calculated.

Never stored manually.

---

Referral

Profile only stores

referral_code

referred_by

Referral relationship comes from

referrals table.

---

Referrals

Columns

id

referrer_id

referred_id

status

reward_granted

reward_granted_at

created_at

This becomes source of truth.

---

Mission Engine never validates referrals using profiles.