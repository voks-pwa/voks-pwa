# Inventory Database

Table

reward_inventory

Fields

reward_id

current_stock

reserved_stock

warning_stock

inventory_mode

updated_at

---

Table

reward_inventory_ledger

Fields

id

reward_id

transaction_type

amount

before_stock

after_stock

reference_type

reference_id

admin_id

created_at

---

Transaction Types

RESERVE

DEDUCT

REFUND

ADJUSTMENT

RESTOCK