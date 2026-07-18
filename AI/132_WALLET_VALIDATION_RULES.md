# Wallet Validation Rules

Wallet Validation is read-only.

It never changes data.

---

Inputs

User

Reward

Wallet

Campaign

Badge

Achievement

---

Outputs

eligible

boolean

reason

string

---

Example

eligible = true

reason = ""

eligible = false

reason = "Insufficient VXP"

---

Priority Order

Reward Active

↓

Reward Status

↓

Campaign

↓

Wallet Balance

↓

Badge

↓

Achievement

↓

VIP

First failed rule becomes reason.