# Fulfillment Rules

Shipping only applies to

need_shipping == true

Digital rewards bypass Fulfillment Engine.

---

Tracking Number

may only be assigned once.

---

Every status change

creates

Shipping Timeline.

Never overwrite history.

---

Status Order

PENDING

↓

PACKING

↓

READY_TO_SHIP

↓

SHIPPED

↓

IN_TRANSIT

↓

DELIVERED

↓

COMPLETED

---

Return

↓

RETURNED

Replacement

↓

REPLACED