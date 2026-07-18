# Sprint 14D — Inventory Engine

Status

IN PROGRESS

Version

Inventory Engine v1.0

---

Objective

Introduce Inventory Engine.

Inventory becomes the single source of truth for reward stock.

WordPress only stores reward metadata.

---

Architecture

Reward Catalog (WordPress)

↓

Reward Store

↓

Redeem Engine

↓

Inventory Engine

↓

Inventory Ledger

↓

Admin Dashboard

---

Responsibilities

Inventory Engine

- Stock Validation
- Stock Reservation
- Stock Deduction
- Stock Refund
- Low Stock Detection

WordPress

- Reward Name
- Description
- Images
- Sponsor
- Required VXP

Dashboard

- Current Stock
- Stock Adjustment
- Inventory History
- Low Stock Monitoring

---

Inventory Flow

Reward

↓

Check Inventory

↓

Reserve Stock

↓

Redeem Approved

↓

Deduct Stock

↓

Inventory Ledger

---

Refund

Refund

↓

Restore Stock

↓

Inventory Ledger

---

Stock Modes

Unlimited

Limited

Digital Pool (future)

Voucher Pool (future)

---

Low Stock

If

current_stock <= warning_stock

↓

Generate Admin Notification

---

Verification

Stock never becomes negative.

Refund restores stock.

Inventory Ledger created.

Update AI/17_CHANGELOG.md