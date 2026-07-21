# Fix Plan: Phase D Audit — Database + Architecture Cleanup

## 🔴 FASE 1: Database Critical (migration baru)

### #1 Fix `get_user_recommendation_ids` syntax error
**File:** `supabase/migrations/20260812000001_fix_recommendation_function.sql`
- DROP function `get_user_recommendation_ids`
- CREATE ulang dengan `COALESCE((SELECT jsonb_agg(...) FROM (...)), '[]'::JSONB)` yang benar
- Test: `npm run db:test` atau verify di Supabase Studio

### #2 Cleanup wallet v1 + fix functions
**File:** `supabase/migrations/20260812000002_cleanup_wallet_legacy.sql`
- DROP FUNCTION `credit_wallet`, `debit_wallet`, `get_wallet_balance`, `get_wallet_history` (v1)
- DROP FUNCTION `redeem_reward` (lama, tanpa validasi wallet)
- DROP/CREATE `check_spending_limit` → return `allowed: false` saat limit terlampaui

### #3 Fix dead RLS policy
**File:** `supabase/migrations/20260812000003_fix_reward_catalog_rls.sql`
- DROP POLICY `"Admins can manage rewards"` ON `reward_catalog`
- CREATE POLICY `"Admins can manage rewards"` ON `reward_catalog` FOR ALL TO service_role USING (true) WITH CHECK (true)

### #4 Add missing FK constraints
**File:** `supabase/migrations/20260812000004_add_missing_foreign_keys.sql`
- `reward_shipping.redeem_id` → REFERENCES `reward_redeems(id)`
- `reward_shipping.reward_id` → REFERENCES `reward_catalog(id)`
- `reward_voucher_pool.reward_id` → REFERENCES `reward_catalog(id)`
- Add indexes: `reward_shipping.created_by`, `reward_inventory_ledger.admin_id`, `settings.updated_by`, `reward_shipping.reward_id`

---

## 🟠 FASE 2: Database Duplikasi

### #5 Merge redemption tables
**File:** `supabase/migrations/20260812000005_consolidate_redemption.sql`
- Source of truth: `reward_redeems` (lebih baru, flow proper)
- Migrate data dari `reward_redemptions` → `reward_redeems`
- DROP table `reward_redemptions`
- Update semua kode yang refer ke `reward_redemptions`

### #6 Merge voucher pools
**File:** `supabase/migrations/20260812000006_consolidate_voucher_pool.sql`
- Canonical: `reward_voucher_pool`
- Migrate data `marketplace_voucher_pool` → `reward_voucher_pool`
- DROP table `marketplace_voucher_pool`
- DROP RPC `reserve_marketplace_voucher`, `assign_marketplace_voucher`
- Update kode marketplace yang pakai voucher pool lama

### #7 Merge inventory systems
**File:** `supabase/migrations/20260812000007_consolidate_inventory.sql`
- Canonical: `marketplace_inventory` (lebih baru, UUID PK)
- Migrate data `reward_inventory` → `marketplace_inventory`
- DROP table `reward_inventory`, `reward_inventory_ledger`

### #8 Add updated_at trigger
**File:** `supabase/migrations/20260812000008_add_updated_at_trigger.sql`
- CREATE FUNCTION `set_updated_at()` (RETURNS TRIGGER, SET NEW.updated_at = now())
- Apply trigger ke 26+ tabel yang punya kolom `updated_at`

---

## 🟡 FASE 3: Arsitektur & Layer Violations

### #9 Pindahkan Supabase dari komponen
**Files to edit:**
- `src/features/admin/users/pages/UserDetailPage.tsx` — 4 `supabase.functions.invoke` inline → pindah ke `useUserMutations.ts`
- `src/features/auth/AuthProvider.tsx` — `supabase.from("referrals")` → pindah ke `authService.ts`; `supabase.auth.*` → pindah ke `authService.ts`

### #10 Tambah repository layer
**New files:**
- `src/features/missions/repositories/missionProgressRepository.ts` — untuk validators
- `src/features/retention/repositories/` — untuk milestoneEngine, metricReader
- `src/features/checkout/repositories/cartRepository.ts`
**Refactor:**
- 5 mission validators → panggil repository, bukan supabase langsung
- `cartService.ts` → panggil cartRepository
- `milestoneEngine.ts`, `metricReader.ts` → panggil repository masing-masing
- 5 Live hooks → hapus redundant `supabase.channel()` langsung, pakai repo only

### #11 Fix cross-feature import
**File to edit:**
- `src/features/campaigns/components/CampaignDetail.tsx` — ganti `import { MissionCard }` jadi prop `renderMissionCard` atau buka jadi slot

### #12 Admin api/ → repositories/
**Option A:** Rename semua `admin/*/api/` → `admin/*/repositories/`
**Option B (recommended):** Update AGENTS.md — acknowledge `api/` as valid convention for admin features, no code changes
**Decision:** [TBD when implementing]

### #13 Update import order convention
**File to edit:**
- `AGENTS.md` — tambah `@/core/`, `@/hooks/`, `@/components/` ke import order convention

---

## 🟢 FASE 4: Cleanup

### #14 Bundle size optimization
- Split `AdminRoutes` (705KB): pastikan tiap halaman admin sudah lazy-loaded
- Split `LiveStudioPage` (527KB): pisahkan komponen berat (player, chat, reactions)

### #15 Verifikasi `profiles` table
- Cek apakah `profiles` dari Supabase starter template atau perlu migration
- Jika perlu: migration `20260812000009_create_profiles_table.sql`

### #16 Component Props types
Low priority — skip unless TypeScript error muncul.

---

## Execution Order

```
Fase 1 → migration: #1, #2, #3, #4
Fase 2 → migration: #5, #6, #7, #8
Fase 3 → code: #9, #10, #11, #12, #13
Fase 4 → code: #14, #15, #16
```

Test setelah tiap fase: `npm run check && npm run build`
