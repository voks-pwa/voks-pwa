# Sprint 14C — Redeem Engine v1

Status

IN PROGRESS

---

Objective

Introduce Redeem Engine.

Redeem Engine becomes the only service allowed to redeem rewards.

Reward Store never modifies data directly.

---

Architecture

Reward Store

↓

Wallet Validation

↓

Redeem Engine

↓

Wallet Engine

↓

Wallet Ledger

↓

Redeem Repository

↓

Notification

↓

Admin Queue

---

Redeem Flow

User

↓

Click Redeem

↓

Eligibility Validation

↓

Wallet Deduction

↓

Wallet Ledger

↓

Redeem Record

↓

Notification

↓

Admin Queue (if approval required)

↓

Finished

---

Rules

Redeem Engine

MUST

deduct VXP

create wallet ledger

create redeem record

create notification

Everything happens in one transaction.

---

Failure

If one step fails

↓

Rollback

No partial redeem.

---

Redeem Status

PENDING

APPROVED

REJECTED

COMPLETED

CANCELLED

REFUNDED

---

Approval

If

need_approval == true

↓

Status

PENDING

Else

↓

APPROVED

---

Wallet

Wallet deduction happens immediately.

Refund creates a new wallet ledger.

Never UPDATE ledger.

---

Verification

One redeem

↓

One wallet ledger

↓

One notification

↓

One redeem record

Update

AI/17_CHANGELOG.md