# Live Database Checklist

Required Tables

✅ live_messages
✅ live_presence
✅ live_reactions
✅ live_polls
✅ live_poll_options
✅ live_poll_votes
✅ live_giveaways
✅ live_giveaway_entries
✅ live_moderation_logs

Every table must have

✅ RLS enabled (9/9)
✅ SELECT policy (9/9 public read)
✅ INSERT policy (7/9: auth-only for user data; live_polls/live_poll_options/live_giveaways/live_moderation_logs = admin-only)
✅ UPDATE policy (live_messages: admin pin; live_presence: own upsert)
✅ DELETE policy (live_messages: own + admin; live_reactions: own + admin)
✅ Realtime enabled (8/9 — moderation_logs intentionally excluded, admin audit only)
✅ Index (live_messages: idx_live_messages_created_at DESC; live_reactions: idx_live_reactions_created_at DESC; all PKs; unique constraints for vote/entry de-dup)
✅ Types (src/features/live/types.ts)

Acceptance

✅ No PGRST205
✅ No schema cache error
✅ Realtime working
✅ Migration applied via `supabase db query --linked` (Docker unavailable, direct SQL execution)

Verification (2026-07-16)

1. `supabase migration list` showed `20260716000000` pending (no remote marker)
2. `supabase db query --linked --file 20260716000000_create_live_tables.sql` — exit 0, no errors
3. REST API HEAD request for all 9 tables — 200 OK all tables (no 404)
4. Unauthenticated INSERT → 401 (RLS enforced)
5. Anon SELECT → 200 (public read working)
6. `pg_publication_tables` — 8 live tables in supabase_realtime
7. `pg_class` — RLS enabled on all 9
8. `pg_policies` — all expected policies exist
9. `pg_indexes` — all PKs + custom indexes exist