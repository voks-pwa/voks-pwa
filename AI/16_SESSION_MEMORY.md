# AI/16_SESSION_MEMORY.md

## Session: Sprint 0.9 — Canonical User Service

### Completed
- Created `CanonicalUser` type, `getCanonicalUser` service, `useCanonicalUser` hook
- Refactored 8 modules to consume CanonicalUser instead of direct `supabase.from("profiles")`:
  - `useUserVXP`, `walletValidationService`, `redeemEngine`, `milestoneEngine`, `metricReader`, `ProfileValidator`, `ReferralValidator`, `AuthProvider`
- Added `findProfileByReferralCode` to profile repository
- Enhanced Admin User Detail (UserDetailPage) with Identity, Profile, Social Media, Referral sections using profile data
- Fixed AdminRole type to include "banned" (from previous sprint work)
- All verifiers pass: check, build (2872 modules), lint

### Key Decisions
- CanonicalUser is a read-only aggregate; mutations continue via repository/service chain
- `walletValidationService` consolidated dual DB reads (VXP + role) into single `getCanonicalUser` call
- `ReferralValidator` removed redundant profiles query since referrals table already covers it
- `UserDetailPage` uses edge function data (full profile row) rather than redundant `useCanonicalUser` call for the target user

### Known Issues
- Pre-existing build errors in Broadcast, Missions, Rewards, Leaderboard modules (unrelated to Sprint 0.9)
- `tsc --noEmit` (npm run check) with root tsconfig (`"files": []`) does not actually check any files — use `tsc -b` or `npm run build` for real type checking
