# Sprint 14B — Wallet Validation Engine

Status

IN PROGRESS

Version

Wallet Engine v1.1

---

Objective

Introduce Wallet Validation before Redeem.

Reward Store must validate user eligibility before allowing redemption.

No VXP deduction yet.

No inventory deduction yet.

Validation only.

---

Validation Flow

Reward

↓

Wallet Engine

↓

Load Wallet

↓

Balance Check

↓

Requirement Check

↓

Campaign Check

↓

Badge Check

↓

Achievement Check

↓

Eligibility Result

---

Validation Rules

1.

Wallet Balance

current_vxp >= required_vxp

2.

Reward Active

reward_active == true

3.

Availability

status == Available

4.

Campaign

If campaign_slug exists

↓

Campaign must be active

5.

Badge Requirement

If required_badge exists

↓

User must own badge

6.

Achievement Requirement

If required_achievement exists

↓

User must unlock achievement

7.

VIP Reward

If vip_only == true

↓

User role must satisfy requirement

---

Validation Result

ELIGIBLE

or

NOT_ELIGIBLE

Reason returned.

Example

Insufficient VXP

Campaign Closed

Badge Required

Achievement Required

Reward Sold Out

Reward Inactive

VIP Only

---

No Deduction

Wallet Validation MUST NOT

deduct VXP

reserve stock

create ledger

create redeem history

Those belong to Sprint 14C.

---

Verification

Reward Detail correctly reports eligibility.

Redeem button state changes.

No Wallet mutation occurs.

Update AI/17_CHANGELOG.md