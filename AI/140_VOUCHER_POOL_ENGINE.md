# Sprint 14E — Voucher Pool Engine

Status

IN PROGRESS

Version

Voucher Engine v1.0

---

Objective

Introduce Voucher Pool.

Voucher Pool manages all redeemable voucher codes.

Reward Store never stores voucher codes.

Voucher Pool becomes the only source.

---

Architecture

Reward Store

↓

Redeem Engine

↓

Voucher Pool

↓

Assigned Voucher

↓

Notification

↓

History

---

Supported Voucher Types

Tokopedia

Shopee

Spotify

Steam

Google Play

Voucher Internal

Campaign Voucher

Future

Gift Card

---

Voucher States

AVAILABLE

↓

RESERVED

↓

ASSIGNED

↓

USED

↓

EXPIRED

↓

VOID

---

Assignment

Redeem Approved

↓

Reserve Voucher

↓

Assign Voucher

↓

Notification

↓

History

---

Refund

Refund

↓

Voucher

↓

AVAILABLE

(if unused)

Else

VOID

---

Verification

Voucher assigned once.

No duplicate assignment.

Voucher history preserved.

Update AI/17_CHANGELOG.md