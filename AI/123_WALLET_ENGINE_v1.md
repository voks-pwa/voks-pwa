# Sprint 14 — Wallet Engine v1

Status

Core Financial Layer

---

Objective

Introduce Wallet Engine as the canonical VXP transaction layer.

Wallet becomes the single source of truth.

---

Architecture

Mission Engine

↓

Achievement Engine

↓

Campaign Engine

↓

Wallet Engine

↓

Wallet Ledger

↓

Reward Store

---

Wallet Balance

Current VXP

Lifetime Earned

Lifetime Spent

Pending

Reserved (future)

---

Transaction Types

MISSION_REWARD

ACHIEVEMENT_REWARD

CAMPAIGN_REWARD

CHECKIN

LISTEN

PROFILE

REFERRAL

SHARE

BONUS

PENALTY

REDEEM

REFUND

ADMIN_ADJUSTMENT

SYSTEM

---

Rules

Wallet balance

=

SUM(ledger)

Never update balance manually.

---

Ledger

Immutable.

No UPDATE.

No DELETE.

Refund creates new transaction.

Penalty creates new transaction.

---

Verification

Current VXP

must equal

SUM(ledger)

Update

AI/17_CHANGELOG.md