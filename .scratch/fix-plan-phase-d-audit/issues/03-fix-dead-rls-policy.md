# 03 — Fix dead RLS policy on `reward_catalog`

**What to build:** The `reward_catalog` table has a policy `"Admins can manage rewards"` defined as `FOR ALL TO authenticated USING (auth.role() = 'service_role')`. Since `service_role` is never `authenticated`, this policy never matches — admins can't manage rewards. A new migration drops the dead policy and creates it correctly with `TO service_role`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `supabase/migrations/20260812000003_fix_reward_catalog_rls.sql`
- [ ] DROP POLICY `"Admins can manage rewards"` ON `reward_catalog`
- [ ] CREATE POLICY using `TO service_role` with correct USING/CHECK
- [ ] Verify with `npm run build`
