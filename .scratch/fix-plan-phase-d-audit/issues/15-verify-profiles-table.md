# 15 — Verify `profiles` table

**What to build:** 19+ tables have FK `REFERENCES profiles(id)` but no `CREATE TABLE profiles` exists in any migration. Investigate where `profiles` comes from (Supabase user management template? External setup?). If missing, create a migration to define it with the correct schema matching FK expectations.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Check Supabase dashboard if `profiles` table exists and its schema
- [ ] Check if Supabase starter template creates `profiles` automatically
- [ ] If missing, create `supabase/migrations/20260812000009_create_profiles_table.sql`
- [ ] Ensure schema matches FK expectations (columns: id, role, current_vxp, lifetime_vxp, etc.)
- [ ] Verify with `npm run build`
