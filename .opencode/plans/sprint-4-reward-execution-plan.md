# Sprint 4 — Reward Experience Execution Plan

## Overview
Implement 8 reward experience tasks following foundation-first order. Fix 6 pre-existing ESLint errors.

## Phase 0: Foundation

### 0.1 — Migration: `reward_redemptions` table
**File**: `supabase/migrations/20260715000002_create_reward_redemptions.sql`

```sql
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_wp_id BIGINT NOT NULL,
  reward_slug TEXT NOT NULL DEFAULT '',
  reward_name TEXT NOT NULL DEFAULT '',
  reward_cost INTEGER NOT NULL DEFAULT 0,
  reward_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(reward_status);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward ON reward_redemptions(reward_wp_id);

ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own redemptions"
  ON reward_redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own redemptions"
  ON reward_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role can manage all redemptions"
  ON reward_redemptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 0.2 — Migration: `redeem_reward` RPC
**File**: `supabase/migrations/20260715000003_create_redeem_reward_rpc.sql`

```sql
CREATE OR REPLACE FUNCTION redeem_reward(
  p_reward_wp_id BIGINT,
  p_reward_slug TEXT,
  p_reward_name TEXT,
  p_reward_cost INTEGER
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO reward_redemptions (user_id, reward_wp_id, reward_slug, reward_name, reward_cost)
  VALUES (auth.uid(), p_reward_wp_id, p_reward_slug, p_reward_name, p_reward_cost)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
```

### 0.3 — Fix `RewardItem` type duplication
- **Delete** inline `RewardItem` from `RewardEngine.ts:4-9`
- **Delete** inline type from `RewardRedemptionService.ts:5-10`
- **Delete** inline type from `RewardClaimService.ts:10-15`
- **Add** exported `RewardItem` to `rewardTypes.ts`:
  ```ts
  export interface RewardItem {
    id: number;
    slug: string;
    title: string;
    cost: number;
  }
  ```
- **Update** imports in all 3 service files to import `RewardItem` from `@/features/rewards/rewardTypes`

### 0.4 — Fix `RewardClaimService.ts`
- Replace `redemption?: unknown` with `redemption?: string`
- Remove `return redemption: data` — use string coercion
- Add missing `userId` parameter to the function signature
- Pass `p_user_id` to RPC call

### 0.5 — Fix `RewardEngine.ts`
- Import `RewardItem` from types instead of inline
- Add `userId` parameter passthrough to `createRewardClaim`

### 0.6 — Fix `RewardRedemptionService.ts`
- Import `RewardItem` from types instead of inline
- Add `userId` to the passthrough

### 0.7 — Fix `reward-service.ts`
- Import `RewardItem` from types instead of inline

### 0.8 — Fix `useRedeemReward.ts`
- Add `["user-redemptions"]` cache invalidation in `onSuccess`
- Add `onError` toast handler
- Import from `@/features/rewards/rewardTypes` for the reward param type

---

## Phase 1: Task 1 — Reward Audit (documentation only, no code)

## Phase 2: Task 2 — Reward Flow (guest vs auth)

### 2.1 — Guest guard in `RewardEngine.ts`
- Before processing, check if `userId` is provided
- Return `{ success: false, message: "Authentication required" }` if missing

### 2.2 — Create `useUserVXP.ts` hook
**File**: `src/features/rewards/hooks/useUserVXP.ts`
- React Query key: `["profile-vxp", user?.id]`
- Fetch `current_vxp` from profile table via `supabase.from("profiles").select("current_vxp").eq("id", userId).single()`
- Return `vxp: number | undefined`, `isLoading: boolean`

### 2.3 — Update `RewardDetailSheet.tsx`
- Display user's VXP balance ("Your VXP: X")
- Disable button if `reward.cost > userVXP`
- Show "Insufficient VXP" instead of "Redeem Reward"

## Phase 3: Task 3 — Reward Detail

### 3.1 — Confirmation dialog
- Add a confirmation state in `RewardDetailSheet.tsx`
- On first click: show "Confirm Redemption?" interstitial within the sheet
- On confirm: call `redeemMutation.mutate()`
- On cancel: return to detail view

### 3.2 — Error toast
- Add `onError` callback to `redeemMutation.mutate()` call
- Use a toast/snackbar to show error message

### 3.3 — Stock indicator
- Show "X/10 remaining" as a progress bar in the detail sheet

## Phase 4: Task 4 — Reward Validation

### 4.1 — Max-per-user check
- In `RewardEngine.ts`, before deducting VXP:
  - Query `reward_redemptions` for existing redemptions by user+reward
  - If count >= `reward.maxPerUser`, return `{ success: false, message: "Max redemptions reached" }`

### 4.2 — Stock check
- Query WP reward stock via API or use snapshot
- Block if stock <= 0

### 4.3 — Duplicate redemption prevention
- Check for existing `pending` or `approved` redemption for same user+reward
- Block if exists

### 4.4 — Double-click prevention
- Already partially done with `isPending` from `useMutation`
- Ensure button is disabled while mutation is running

### 4.5 — History cache invalidation
- Already added in step 0.8

## Phase 5: Task 5 — Reward Categories

### 5.1 — Category filtering in `RewardStorePage.tsx`
- Add filter buttons/chips: All, Physical, Voucher, Coupon, Digital, Merchandise, Special Event
- Filter `rewards` array based on `deliveryType`

### 5.2 — Category badge on `RewardCard.tsx`
- Map deliveryType to a display badge (e.g., "Digital", "Voucher")
- Use distinct colors per category

## Phase 6: Task 6 — Redemption Status

### 6.1 — Add cancelled/expired to `RewardHistoryPage.tsx`
- Add entries to `STATUS_ICONS`, `STATUS_COLORS`, `STATUS_LABELS` for `cancelled` and `expired`

## Phase 7: Task 7 — History

### 7.1 — Loading state
- Add `isLoading` from `useUserRedemptions()` to `RewardHistoryPage.tsx`
- Show skeleton while loading

### 7.2 — Pagination improvement
- Show total count in pagination

## Phase 8: Task 8 — UI Polish

### 8.1 — Error state in `RewardStorePage.tsx`
- Add `isError` from `useRewards()` and show error message + retry button

### 8.2 — Fix `RewardGrid.tsx` no-op onClick
- Wire `onClick` to open `RewardDetailSheet` or remove unused component

### 8.3 — Expired card styling
- Gray out expired rewards in `RewardCard.tsx`
- Show "Expired" overlay

### 8.4 — Responsive grid
- Single column on small screens
- Two columns on md+

### 8.5 — Remove Indonesian comments
- Remove `// spacer supaya...` comment from `RewardDetailSheet.tsx`

## Phase 9: Fix Pre-existing ESLint Errors (6 total)

### 9.1 — `MissionEditDialog.tsx` (line 39)
- Replace `useEffect` with deriving state from props using `key` or `useMemo`

### 9.2 — `RewardEditDialog.tsx` (line 46)
- Same pattern: derive initial state from props, use `key` to reset

### 9.3 — `SettingsPage.tsx` (lines 24, 35, 74)
- Two `useEffect` setState violations + one `any` type
- Derive state from props or use controlled form with `key`

### 9.4 — `MissionDetailPage.tsx` (line 87, 141)
- Move `Icon` component creation outside render function
- Use lookup map instead of calling `getMissionIcon` inside render

## Verification Steps
1. `npm run check` — TypeScript passes
2. `npm run lint` — ESLint passes (0 errors)
3. `npm run build` — Full build passes
4. Manual: redeem flow with sufficient/insufficient VXP
5. Manual: duplicate redemption blocked
6. Manual: guest flow blocked
7. Manual: category filtering works
8. Manual: history page shows all states

## Files to Modify/Create

### New files (4):
- `supabase/migrations/20260715000002_create_reward_redemptions.sql`
- `supabase/migrations/20260715000003_create_redeem_reward_rpc.sql`
- `src/features/rewards/hooks/useUserVXP.ts`

### Modified files (15):
- `src/features/rewards/rewardTypes.ts` — add RewardItem export
- `src/features/rewards/services/RewardEngine.ts` — deduplicate type, add validations
- `src/features/rewards/services/RewardClaimService.ts` — fix unknown, add userId
- `src/features/rewards/services/RewardRedemptionService.ts` — deduplicate type
- `src/services/reward-service.ts` — deduplicate type
- `src/hooks/useRedeemReward.ts` — add cache invalidation, error handling
- `src/features/rewards/components/RewardDetailSheet.tsx` — VXP display, confirm dialog, stock indicator, error toast
- `src/features/rewards/components/RewardCard.tsx` — category badge, expired styling
- `src/features/rewards/components/RewardGrid.tsx` — fix onClick
- `src/features/rewards/pages/RewardHistoryPage.tsx` — cancelled/expired, loading state
- `src/pages/RewardStorePage.tsx` — category filter, error state, responsive grid
- `src/features/admin/missions/components/MissionEditDialog.tsx` — fix eslint
- `src/features/admin/rewards-crud/components/RewardEditDialog.tsx` — fix eslint
- `src/features/admin/settings/pages/SettingsPage.tsx` — fix eslint
- `src/pages/MissionDetailPage.tsx` — fix eslint
