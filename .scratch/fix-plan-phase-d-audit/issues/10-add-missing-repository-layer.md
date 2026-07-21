# 10 — Add missing repository layer

**What to build:** Multiple services and validators bypass the repository layer by calling `supabase` directly. Create the missing repositories and refactor callers:

- `src/features/missions/repositories/missionProgressRepository.ts` — for CheckinValidator, ShareValidator, ReferralValidator, ListeningValidator
- `src/features/retention/repositories/` — for milestoneEngine, metricReader
- `src/features/checkout/repositories/cartRepository.ts` — for cartService
- Clean up Live hooks that use both `supabase.channel()` AND their repo (redundant)

**Blocked by:** #09 (clean component pattern first, then fix service layer)

**Status:** ready-for-agent

- [ ] Create `missionProgressRepository.ts` with query methods for validators
- [ ] Create retention repositories for milestone/metric reads
- [ ] Create `cartRepository.ts` for cart queries
- [ ] Refactor 5 mission validators to use repositories
- [ ] Refactor `cartService.ts` to use repository
- [ ] Refactor `milestoneEngine.ts`, `metricReader.ts` to use repositories
- [ ] Clean up 5 Live hooks — remove redundant direct `supabase.channel()` calls
- [ ] Verify with `npm run check && npm run build`
