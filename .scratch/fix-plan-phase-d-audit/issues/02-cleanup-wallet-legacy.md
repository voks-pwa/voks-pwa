# 02 — Cleanup wallet v1 legacy

**What to build:** The v1 wallet functions (`credit_wallet`, `debit_wallet`, `get_wallet_balance`, `get_wallet_history`) from `20260723000000_create_wallet_ledger.sql` still exist alongside the v2 lifecycle (PENDING→COMMIT). The old `redeem_reward` RPC from `20260715000003_create_redeem_reward_rpc.sql` also still exists and inserts redemptions without wallet validation. And `check_spending_limit` always returns `allowed: true` even when the limit would be exceeded. A new migration drops all v1 wallet functions, drops the old `redeem_reward`, and recreates `check_spending_limit` with correct logic.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `supabase/migrations/20260812000002_cleanup_wallet_legacy.sql`
- [ ] DROP FUNCTION `credit_wallet`, `debit_wallet`, `get_wallet_balance`, `get_wallet_history`
- [ ] DROP FUNCTION `redeem_reward` (old no-validation version)
- [ ] DROP and recreate `check_spending_limit` to return `allowed: false` when limit exceeded
- [ ] Verify with `npm run build`
