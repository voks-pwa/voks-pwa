# 08 — Add `updated_at` trigger

**What to build:** 26+ tables have an `updated_at` column with `DEFAULT now()` but no automatic trigger to update it on row modification. A new migration creates a `set_updated_at()` trigger function and applies it to all tables that have the column, ensuring `updated_at` is always accurate without relying on client code.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `supabase/migrations/20260812000008_add_updated_at_trigger.sql`
- [ ] CREATE FUNCTION `set_updated_at()` RETURNS TRIGGER
- [ ] Apply trigger to all tables with `updated_at` column
- [ ] Verify with `npm run build`
