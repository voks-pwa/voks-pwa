# Inventory Rules

Inventory is immutable.

Every stock movement creates a ledger entry.

Never UPDATE ledger.

Never DELETE ledger.

---

Reserve

↓

Reserved Stock +1

---

Approved

↓

Reserved Stock -1

↓

Current Stock -1

---

Rejected

↓

Reserved Stock -1

---

Refund

↓

Current Stock +1

---

Manual Adjustment

↓

Ledger Entry

↓

Current Stock updated

---

Inventory Engine is the only module allowed to modify stock.