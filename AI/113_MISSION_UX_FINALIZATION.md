# Sprint 12.5 — Mission UX Finalization

Status

Mission Engine v1.1

---

Objective

Complete Mission UX.

Mission must behave like:

- Shopee Mission
- GoPay Mission
- TikTok Mission
- Duolingo Quest

No inconsistent state.

---

Mission State Machine

NOT_STARTED

↓

IN_PROGRESS

↓

READY_TO_CLAIM

↓

CLAIMED

↓

HISTORY

↓

ARCHIVED

State transitions must be deterministic.

---

Progress Engine

Every Action Engine event must

1.

Update Progress

↓

2.

Evaluate Target

↓

3.

Update Mission State

↓

4.

Update Visibility

↓

5.

Trigger Reward

↓

6.

Create History

---

Mission List

Display only

NOT_STARTED

IN_PROGRESS

READY_TO_CLAIM

Never display

CLAIMED

ARCHIVED

Those belong to History.

---

Mission Detail

Display

Mission Name

Description

Reward

Mission Type

Progress

Requirement

Repeat Rule

Campaign

Remaining Time

Mission State

---

Progress Bar

Every mission must show

current_progress

/

target_progress

Example

Complete Profile

8 / 8

Share

0 / 1

Referral

0 / 1

Listen

4 / 10 minutes

---

Mission Status

Use badges

Not Started

In Progress

Ready

Completed

Expired

Do not always show

"In Progress"

---

History

History must use

Mission Name

NOT

Mission #12345

Display

Mission Name

Completed At

Reward

Campaign

XP Earned

---

Visibility Rule

Mission disappears immediately after

CLAIMED

unless

mission_repeat == true

For repeatable missions

reappear according to rule

daily

weekly

campaign

special

---

Repeat Rule

Daily

↓

reset every local day

Weekly

↓

reset every Monday

Campaign

↓

active until campaign ends

Special

↓

never repeats

---

Auto Claim

These mission types must auto claim

Complete Profile

Daily Check In

Referral

Share

Other mission types

↓

READY_TO_CLAIM

↓

manual claim

---

Verification

Mission state changes correctly.

Mission disappears after claim.

History updated.

Mission Detail consistent.

No infinite "Progress".

Update AI/17_CHANGELOG.md