# 01 — Fix `get_user_recommendation_ids` syntax error

**What to build:** The `get_user_recommendation_ids` function in migration `20260810000000_ai_recommendation.sql` has a dangling `'[]'::JSONB` outside any statement (lines 170-181). A new migration drops the broken function and recreates it with correct SQL: `COALESCE((SELECT jsonb_agg(...) FROM (...)), '[]'::JSONB)`. After applying, `npm run build` must still pass.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Create `supabase/migrations/20260812000001_fix_recommendation_function.sql`
- [ ] DROP the broken `get_user_recommendation_ids` function
- [ ] CREATE the corrected function with proper subquery wrapping
- [ ] Verify with `npm run build`
