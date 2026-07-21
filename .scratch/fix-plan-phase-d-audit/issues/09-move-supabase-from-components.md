# 09 — Move supabase calls out of components

**What to build:** Two components call supabase directly, violating the architecture rule that components must only call hooks. `UserDetailPage.tsx` has 4 inline `supabase.functions.invoke` calls in JSX onClick handlers. `AuthProvider.tsx` calls `supabase.from("referrals")` and `supabase.auth.*` directly. Move all these calls into the appropriate service files (`useUserMutations.ts` / `authService.ts`).

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] `UserDetailPage.tsx`: move ban/unban/delete/VXP adjust to `useUserMutations.ts` as named mutation functions
- [ ] `AuthProvider.tsx`: move referral logic to `authService.ts`
- [ ] `AuthProvider.tsx`: move `supabase.auth.getSession` and `onAuthStateChange` to `authService.ts`
- [ ] Verify with `npm run check && npm run build`
