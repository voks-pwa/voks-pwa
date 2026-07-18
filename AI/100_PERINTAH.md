Sprint 8.8 — Mission Engine Stabilization

Read

AI/168_MISSION_ENGINE_STABILIZATION.md

AI/169_PROFILE_COMPLETION_SPEC.md

AI/170_REFERRAL_ENGINE_VALIDATION.md

AI/171_PROFILE_MEDIA_STORAGE.md

AI/172_WALLET_REWARD_TRACEABILITY.md

AI/15_CURRENT_TASK.md

Implement the following:

================================================

PROFILE COMPLETION

================================================

Profile Complete MUST use:

Mandatory Basic Information

- Full Name
- Display Name
- Phone Number
- Birthday
- Gender
- Province
- City
- Favorite Program
- Favorite Music

Mandatory Social

- Instagram
- TikTok

Optional

- Facebook
- Youtube
- Threads
- Website

Optional fields MUST NOT affect profile completion.

Complete Profile Mission

Auto Complete

Auto Claim

150 VXP

Only Once

================================================

REFERRAL

================================================

Every profile must always have

referral_code

referral_url

Copy Link Button

Restore Referral section on Profile Page.

Referral Mission must validate

profiles.referred_by

AND

referrals table

Never award automatically.

================================================

AVATAR

================================================

Fix

Bucket not found.

Create / verify Storage Bucket

avatars

Upload path

avatars/{user_id}

Never fail Profile Save.

================================================

MISSION

================================================

Fix

Complete Profile Mission

Share Mission

Referral Mission

Mission History

Mission Progress

================================================

ACTION ENGINE

================================================

Fix activity_logs 400.

Audit payload.

Match schema.

================================================

STREAK

================================================

Verify

user_streaks

exists.

Apply migration if missing.

================================================

WALLET

================================================

Every VXP transaction must contain

source_engine

reason

event_id

No anonymous rewards.

================================================

Verification

================================================

Run

npm run check

npm run build

npm run lint

Update

AI/17_CHANGELOG.md

Stop after Mission Engine v1.1 becomes Production Stable.