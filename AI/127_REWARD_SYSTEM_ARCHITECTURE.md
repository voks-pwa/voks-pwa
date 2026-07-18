# Reward System Architecture

Status

Frozen

Version

1.0

---

## Philosophy

Reward Catalog belongs to WordPress.

Reward Operations belong to Admin Dashboard.

Wallet remains the financial source of truth.

---

WordPress

Responsible for

- Reward Catalog
- Banner
- Description
- Images
- Category
- Sponsor
- Required VXP
- Publish Status

Never stores

- Redeem
- Inventory
- Shipping
- Voucher Code

---

Dashboard Admin

Responsible for

- Inventory
- Voucher Pool
- Redeem Queue
- Shipping Status
- Redeem Approval
- Stock Monitoring
- Analytics

Never edits

- Reward Description
- Reward Image
- Banner

Those remain in WordPress.

---

Wallet Engine

Responsible for

- Balance
- Ledger
- Deduction
- Refund
- Validation

Reward Store never deducts XP directly.

Wallet Engine does.

---

Flow

WordPress Reward

↓

Reward Store

↓

Wallet Validation

↓

Wallet Ledger

↓

Redeem Queue

↓

Admin

↓

Delivery

↓

Notification

---

Result

CMS

↓

Content

Dashboard

↓

Operations

Wallet

↓

Finance