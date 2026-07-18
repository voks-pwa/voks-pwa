# Redeem Transaction Rules

Redeem is atomic.

Transaction

Validate

↓

Deduct Wallet

↓

Wallet Ledger

↓

Redeem Record

↓

Notification

↓

Commit

If any step fails

↓

Rollback

Never leave inconsistent state.