# PROFILE DATABASE SPEC

Table

profiles

Purpose

Single source of truth for user profile.

Required Columns

- full_name
- display_name
- bio
- phone_number
- avatar_url
- instagram
- tiktok
- youtube
- facebook
- threads
- website
- birthday
- gender
- city
- province
- favorite_program
- favorite_music
- profile_completed
- updated_at

Storage

avatars/

Never store Base64.

Only store URL.

RLS

Authenticated users

Can update only their own profile.

Never expose service role.

Definition of Done

All fields save correctly.

Reload page keeps data.

No missing column.

No schema cache error.