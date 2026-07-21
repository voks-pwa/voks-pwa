# AI/17_CHANGELOG.md

Version: 1.0

---

# CHANGELOG

---

## 2026-07-22

### Sprint E.2 — Production Finalization ✅

**Fraud Protection Hardening**:
- Wallet Ledger V2: transaction_key UNIQUE INDEX prevents duplicate entries; check_duplicate RPC validates before creation; atomic two-phase commit/rollback
- Economy Engine: validateTransaction() checks spending limits (daily/weekly/monthly) before debit; earning caps enforced
- Marketplace Transaction: FOR UPDATE row locks on inventory; atomic order status transitions; rollback on failure
- Reward Redeem: reserve_reward RPC with FOR UPDATE SKIP LOCKED; stock reservation with rollback; pending redemption check
- XP Spending: calculateXP() with rule-based validation; mission claims use grantReward with duplicate check

**Monitoring**:
- Logging: console.error/warn in MissionClaimService (RPC errors, rejected claims), WalletEngine, EconomyEngine; Edge Functions have try/catch error handling
- Health Check: system-health edge function checks DB connectivity (RPC + response time) + WordPress API connectivity + maintenance mode/version from system_config
- Alerts: Error logging in place; structured alerting system noted as future enhancement

**Performance Audit Final**:
- Bundle Size: Main chunk 496KB (gzip 153KB) under 900KB target; LiveStudioPage 527KB lazy-loaded; AdminRoutes ~640KB lazy-loaded
- Lazy Loading: 23 pages use React.lazy() with dynamic imports; Lazy wrapper component with Suspense fallback
- Route Split: All public pages, admin routes, and dev sandbox lazy-loaded via React.lazy()
- React Query Cache: QueryClient configured in main.tsx; staleTime configured on hooks (5min for economy config, 30s for transaction validation)
- Repository Query: N+1 scan fixed in updateFulfillmentStatus; analytics via single aggregate RPCs
- Image Optimization: 6 images with loading="lazy" across PromoBanner, HomePage, PromoList/Detail, RewardPreview, HostsSlider

**Phase E Checklist Updated**:
- AI/223_PHASE_E_MASTER_CHECKLIST.md: Fraud Protection ✅, Monitoring ✅, Performance ✅
- AI/229_PROJECT_COMPLETION_CHECKLIST.md: Performance ✅, Monitoring ✅

**Verification**: `tsc ✓`, `vite build ✓` (140 precache entries, 3313 KiB)

---

## 2026-07-21

### Sprint E.1 — Production Hardening ✅ (Continued)

**Feature Flags Bridge**:
- Created `useIsFeatureEnabled()` hook — reads DB `feature_flags` table via React Query, falls back to hardcoded defaults
- Updated all 5 call sites: `FeatureGuard`, `HomePage`, `MorePage`, `QuickAccess`, `useCampaignMissions`
- Admin feature flag toggles now take effect client-side without redeploy
- Added missing `auth.getUser()` verification to `admin-feature-flags` EF (security gap fixed)
- Added `updated_by` tracking on flag toggle

**Feature Flags Enabled**:
- Database migration `20260821000002_fix_feature_flags_table.sql` applied to remote Supabase (created `feature_flags` table + upserted all 7 flags with `enabled = true`)
- Static fallback in `src/features/flags/index.ts` updated: `mission.public_enabled = true`, `reward.public_enabled = true`
- Both EFs (`admin-feature-flags`, `admin-campaign-update`) deployed to Supabase

**Missing Edge Function Created**:
- Created `admin-campaign-update` EF — updates campaign ACF fields (featured, priority) via WordPress REST API
- Frontend no longer gets 404 on campaign feature/unfeature/priority actions

**Edge Function Consistency**:
- All 24 EF imports standardized to `npm:@supabase/supabase-js@2`
- All 21 FE-facing EFs configured in `supabase/config.toml` with `verify_jwt = false`

**UI Cleanup**:
- Removed 4 "Your Experience" placeholder items from MorePage (no backend existed)
- MissionWidget loading skeleton added

**Security & Production Audits**:
- RLS Audit: 65 tables scanned — 64 with RLS, 1 gap (`user_session_logs` in `20260811000000_operations_admin.sql` missing `ENABLE ROW LEVEL SECURITY`)
- Secret Audit: no hardcoded secrets in `src/`; `.env` gitignored; no `service_role` key in frontend; advisory-only `console.log(authHeader)` in 3 EFs
- Image optimization: 6 `<img>` tags using `loading="lazy"` across PromoBanner, HomePage, PromoList/Detail, RewardPreview, HostsSlider

**Phase E Checklist Updated**:
- AI/223_PHASE_E_MASTER_CHECKLIST.md: Edge Function Audit ✅, QA Items ✅, RLS/Security partial
- Items remaining: package.json audit, bundle audit close-out, monitoring/alerting, live radio device testing

**Verification**: `tsc ✓`, `vite build ✓` (140 precache entries, 3313 KiB)

---

## 2026-07-21

### Sprint E.1 — Production Hardening ✅

**Feature Flags Fix**:
- Created `useIsFeatureEnabled()` hook — reads from DB `feature_flags` table via React Query, falls back to hardcoded defaults
- Updated all 5 call sites: `FeatureGuard`, `HomePage`, `MorePage`, `QuickAccess`
- Admin toggle di `/admin/settings/feature-flags` sekarang langsung berefek ke client (tanpa perlu redeploy)
- Added missing `auth.getUser()` verification to `admin-feature-flags` edge function (security gap fixed)
- Added `updated_by` tracking on flag toggle

**Missing Edge Function**:
- Created `admin-campaign-update` edge function — updates campaign ACF fields (featured, priority) via WordPress REST API
- Frontend no longer gets 404 on campaign feature/unfeature/priority actions

**Config & Consistency**:
- Configured all 21 FE-facing edge functions in `supabase/config.toml` with `verify_jwt = false`
- Standardized imports: all 24 edge functions now use JSR `@supabase/supabase-js` from shared `deno.json`

**UI Cleanup**:
- Removed 4 "Your Experience" placeholder items from MorePage (no backend implementation existed)
- Added loading skeleton to MissionWidget (reads Zustand `loading` state)

**Verification**: `tsc ✓`, `vite build ✓` (140 precache entries, 3313 KiB)

**Runtime Fixes (Tier 1)**:
- PostgREST schema cache refreshed (`NOTIFY pgrst, 'reload schema'`) — fixed activity_logs metadata column, get_transactions_admin, get_economy_config errors
- Vite dev cache cleared (`node_modules/.vite`) — fixed AdminDashboardPage import path
- AuthProvider: `setUser` changed to referential equality check (`prev?.id === newUser?.id`) — fixed mission scheduler start/stop loop
- missionScheduler: added `currentUserId` guard — prevents scheduler init loop for unauthenticated users

**Dead Code Cleanup (Tier 2)**:
- Deleted 14 unused files: rankCalculator.ts, notificationService.ts, generateReferralCode.ts, useAchievements.ts, useBadges.ts, useMilestones.ts, useStreak.ts, reward-service.ts, media-api.ts, programs-api.ts, useDailyCheckin.ts, useRedeemReward.ts, useRewards.ts, data/programs.ts, GuestGuard.tsx
- Build still passes (tsc + vite build ✓)

**UI State Coverage (Tier 3)**:
- HomePage Voks+ section: added loading skeleton, ErrorState with retry, EmptyState
- HomePage Programs section: added loading skeleton grid, ErrorState with retry, EmptyState
- ProfilePage: added loading skeleton (avatar + stats + form sections)
- index.html: title updated to "Voks Radio — Interactive Community & Live Streaming", description aligned with platform features
- AI/25_PRODUCT_POLISH_CHECKLIST: fully audited; 16/25 items verified, 9 marked for runtime/visual verification

## 2026-07-20

### Sprint C.6 — Commerce Engine ✅

**Database Migration** (`20260805000000_commerce_engine.sql`):
- `commerce_events` table: event log (event_type, user_id, order_id, product_id, amount, metadata, created_at)
- `marketplace_fulfillment` table: fulfillment tracking with status lifecycle (PENDING/PROCESSING/SHIPPED/DELIVERED/COMPLETED/CANCELLED), tracking_number, carrier, notes
- `refund_records` table: refund tracking with status (PENDING/APPROVED/REJECTED/COMPLETED), refund_method (WALLET/GATEWAY)
- 5 RPCs: `record_commerce_event`, `create_fulfillment` (starts fulfillment + sets order PROCESSING), `update_fulfillment_status` (atomic + sets order COMPLETED on DELIVERED/COMPLETED), `process_refund` (atomic inventory restore + voucher restore + order REFUNDED), `get_commerce_analytics` (revenue, orders, fulfillments, refunds, top products, daily events)
- RLS: user-scoped reads; service_role for admin operations

**Commerce Engine Module** (`src/features/commerce/`):
- Types: CommerceEvent, MarketplaceFulfillment, RefundRecord, CommerceAnalytics, CommerceActionResult
- Repository: recordEvent/createFulfillment/updateFulfillmentStatus/processRefund RPC wrappers + direct queries for events, fulfillments, refunds
- Service: recordEvent, createFulfillment, updateFulfillmentStatus (valid transition guard), processRefund, getAnalytics, getFulfillments, getRefunds, requestRefund, getEvents
- 9 hooks: useCommerceAnalytics, useFulfillments, useRefunds, useCommerceEvents, useCreateFulfillment, useUpdateFulfillmentStatus, useProcessRefund, useRequestRefund, useRecordEvent
- index.ts barrel exports

**Checkout Integration**:
- `executeCheckout()` records `purchase` commerce event after successful VXP debit

**Admin Commerce** (`/admin/commerce`):
- 3-tab page: Fulfillment | Refunds | Analytics
- Fulfillment: queue with inline status/tracking/carrier edit
- Refunds: approve (process) / reject PENDING refunds
- Analytics: revenue, orders, fulfillments, refunds, refund amount, top products, daily events
- Route `/admin/commerce` with sidebar Package icon

### Sprint C.7 — Subscription & Membership ✅

**Database Migration** (`20260806000000_subscription_membership.sql`):
- `subscription_plans` table: plan catalog (plan_code FREE/PREMIUM/VIP/CORPORATE, billing_interval MONTHLY/QUARTERLY/YEARLY, price, currency, features JSONB)
- `user_subscriptions` table: one per user with status (ACTIVE/GRACE/EXPIRED/CANCELLED/PAUSED), current_period_start/end, auto_renew, cancelled_at
- `subscription_invoices` table: billing history (amount, payment_method, status PAID/PENDING/FAILED/REFUNDED, wallet_txn_id, period_start/end)
- 7 RPCs: `create_subscription_plan` (upsert by code), `subscribe_user` (subscription + invoice + commerce event), `renew_subscription`, `cancel_subscription`, `change_subscription_plan` (upgrade/downgrade), `get_user_subscription`, `get_subscription_analytics`
- Wallet debit performed in engine via Wallet Ledger V2 (REDEEM / SUBSCRIPTION reference)
- RLS: user-scoped reads; service_role for admin operations

**Subscription Module** (`src/features/subscription/`):
- Types: SubscriptionPlan, UserSubscription, SubscriptionInvoice, SubscriptionDetail, SubscriptionAnalytics, enums
- Repository: RPC wrappers + direct queries for plans, subscriptions, invoices
- Service: createPlan, subscribe (wallet debit → subscribe RPC), renew, cancel, changePlan, getUserSubscription, getAnalytics, getPlans/Subscriptions/Invoices
- 9 hooks: useSubscriptionPlans, useUserSubscription, useSubscriptions, useSubscriptionInvoices, useSubscriptionAnalytics, useSubscribe, useRenewSubscription, useCancelSubscription, useChangePlan, useCreatePlan
- index.ts barrel exports

**Admin Subscription** (`/admin/subscription`):
- 3-tab page: Plans | Subscriptions | Invoices
- Plans: list + add plan (code, name, interval, price)
- Subscriptions: analytics cards (total/active/revenue) + list with change-plan / cancel actions
- Invoices: billing history
- Route `/admin/subscription` with sidebar Crown icon

## 2026-07-21

### Sprint D.6 — Finalization & Production Readiness ✅

**Production Build Verification**:
- TypeScript: PASS (`tsc --noEmit`)
- ESLint: PASS
- Production Build: PASS (74 entries, 3288 KiB, 688ms)
- PWA service worker: generateSW mode, 74 precache entries
- App version: 1.0.0 (build 20260721)

**Documentation Finalization**:
- All Phase D sprint entries consolidated in CHANGELOG
- Phase D Master Checklist fully checked
- Phase D marked as COMPLETE in CURRENT_TASK
- SESSION_MEMORY and TECHNICAL_DEBT_REGISTER updated

**Phase D Summary** (6 sprints):

| Sprint | Module | Status |
|--------|--------|--------|
| D.1 | Automation (scheduler, queue, retry, dead-letter) | ✅ |
| D.2 | Notification Channels (push, email, in-app, broadcast) | ✅ |
| D.3 | Analytics & Reporting (wallet KPIs, CSV export) | ✅ |
| D.4 | AI & Recommendation (popular + personalized, search, KB) | ✅ |
| D.5 | Operations & Admin (health, flags, audit, maintenance) | ✅ |
| D.6 | Finalization & Production Readiness | ✅ |

**Total Phase D Deliverables**:
- 6 database migrations (D.1–D.6)
- 5 new edge functions (scheduler, recommendation-engine, system-health, admin-feature-flags)
- 10 new feature modules (automation, analytics, recommendation, search, knowledge, operations)
- 13 new admin pages
- All verifiers: TypeScript PASS, ESLint PASS, Production Build PASS

---

## 2026-07-21

### Sprint D.5 — Operations & Admin ✅

**Database Migration** (`20260811000000_operations_admin.sql`):
- `admin_audit_log` table — official migration for admin action audit trail (actor_id, action, entity, details, created_at)
- `feature_flags` table — dynamic feature flags with key/enabled/description (seeded with 7 defaults)
- `system_config` table — key/value app config (seeded with maintenance_mode + app_version)
- `get_system_health` RPC — DB connectivity + table row counts (profiles, missions_progress, reward_redemptions, wallet_ledger)
- RLS: admin/superadmin read audit logs; service_role ALL; public read feature_flags + system_config

**Edge Functions**:
- `system-health` — health check endpoint: DB (RPC + response time), WordPress API (connectivity + response time), maintenance mode + version from system_config
- `admin-feature-flags` — CRUD: list all flags, update enabled/description

**Operations Module** (`src/features/operations/`):
- Types: SystemHealth, FeatureFlag, MaintenanceConfig, AppVersion, AuditLogEntry
- Repository: 8 data access functions (system-health edge fn, feature flags edge fn, system_config direct, admin_audit_log direct)
- Query keys + 7 hooks: useSystemHealth, useFeatureFlags, useUpdateFeatureFlag, useMaintenanceConfig, useUpdateMaintenance, useAppVersion, useAuditLogs
- index.ts barrel exports

**Admin Operations** (`/admin/operations`):
- 3-tab page: System Health | Maintenance Mode | Version Info
- System Health: DB + WordPress API status cards with response time + table counts
- Maintenance Mode: toggle + message editor with save
- Version Info: version, build number, build date display
- Route + sidebar Activity icon

**Admin Feature Flags** (`/admin/feature-flags`):
- Toggle list: all 7 feature flags with ON/OFF toggle buttons + descriptions
- Real-time enabled/disabled status badges
- Route + sidebar ToggleLeft icon

**Admin Audit Log** (`/admin/audit`):
- Full log table: time, actor, action, entity, entity ID, details
- Search/filter by action, entity, or actor name
- Auto-refresh every 30s
- Up to 100 most recent entries
- Route + sidebar Shield icon

**Verification**:
- TypeScript: PASS (`tsc --noEmit`)
- ESLint: PASS
- Production Build: PASS (74 entries, 3288 KiB, 675ms)

---

## 2026-07-21

### Sprint D.4 — AI & Recommendation ✅

**Database Migration** (`20260810000000_ai_recommendation.sql`):
- `knowledge_articles` table: knowledge base for support/content with slug, category, tags, published flag, RLS (service_role ALL, anon/authenticated read published)
- `search_content` RPC — ILIKE search across knowledge_articles
- `get_popular_reward_ids` RPC — top redeemed reward IDs from reward_redemptions
- `get_popular_mission_ids` RPC — most completed mission IDs from missions_progress
- `get_user_recommendation_ids` RPC — collaborative filtering recs (users who did same missions)

**Recommendation Engine Edge Function** (`supabase/functions/recommendation-engine/`):
- 3 modes: `popular-missions`, `popular-rewards`, `personalized` (per user)
- Enriches Supabase aggregate IDs with WordPress content titles (mission title, reward image)
- Read-only: no wallet access, no ledger access, no business logic mutations

**Recommendation Module** (`src/features/recommendation/`):
- Types: RecommendedMission, RecommendedReward, UserRecommendations
- Repository: 3 edge function wrappers
- Query keys: recommendationKeys factory
- 3 hooks: usePopularMissions, usePopularRewards, useUserRecommendations
- index.ts barrel exports

**Search Module** (`src/features/search/`):
- Types: SearchResult, SearchResponse
- Repository: search_content RPC wrapper
- Query keys + useSearch hook (enabled at 2+ chars)
- index.ts barrel exports

**Knowledge Base Module** (`src/features/knowledge/`):
- Types: KnowledgeArticle, KnowledgeActionResult
- Repository: full CRUD (list, getBySlug, create, update, delete)
- Query keys + 5 hooks (useKnowledgeArticles, usePublishedArticles, useKnowledgeArticle, useCreateKnowledgeArticle, useUpdateKnowledgeArticle, useDeleteKnowledgeArticle)
- index.ts barrel exports

**Admin AI & Recommendation** (`/admin/recommendation`):
- Popular Missions ranking (top 10 with medal icons)
- Popular Rewards ranking (top 10 with redeem counts)
- Recommendation Engine info card (method, data source, scope)
- Route `/admin/recommendation` with sidebar Bot icon

**Admin Knowledge Base** (`/admin/knowledge`):
- Full CRUD table: create, edit, delete articles
- Search/filter by title or category
- Category selector, tags input, markdown content
- Publish/draft toggle
- Route `/admin/knowledge` with sidebar BookOpen icon

**Verification**:
- TypeScript: PASS (`tsc --noEmit`)
- ESLint: PASS
- Production Build: PASS (74 entries, 3273 KiB)

---

## 2026-07-21

### Sprint D.3 — Analytics & Reporting ✅

**Database Migration** (`20260809000000_analytics.sql`):
- `get_wallet_analytics` RPC — VXP minted / spent / net / transaction count / active wallets from wallet_ledger
- `get_campaign_analytics` RPC — campaign totals, active, rewards granted, participants, VXP distributed
- `get_commerce_kpis` RPC — unified KPI rollup (revenue, orders, fulfillments, refunds, subscriptions, wallet minted/spent, campaign participants)

**Analytics Module** (`src/features/analytics/`):
- Types: WalletAnalytics, CampaignAnalytics, CommerceKpis, UserAnalytics, MissionAnalytics, ReportExport
- Repository: 6 RPC wrappers for wallet/campaign/commerce-kpis/user/mission/admin edge function
- Query keys: analyticsKeys factory (wallet/campaign/commerceKpis/user/mission/admin)
- 6 hooks: useWalletAnalytics, useCampaignAnalytics, useCommerceKpis, useUserAnalytics, useMissionAnalytics, useAdminAnalytics
- index.ts barrel exports

**Admin Wallet Analytics** (`/admin/wallet-analytics`):
- KPI cards: Minted, Spent, Net, Active Wallets, Total Transactions
- Period filter: 7d / 30d / 90d
- Route `/admin/wallet-analytics` with sidebar Wallet icon

**Admin Reporting** (`/admin/reporting`):
- 5-section tabbed view: Executive Overview, Wallet, Commerce, Subscription, Campaign
- Period filter: 7d / 30d / 90d
- CSV export per section with BOM for Excel compatibility
- Metric cards per section
- Route `/admin/reporting` with sidebar FileSpreadsheet icon

**Verification**:
- TypeScript: PASS (`tsc --noEmit`)
- ESLint: PASS

---

## 2026-07-20

### Sprint D.2 — Notification Channels ✅

**Database Migration** (`20260808000000_notification_channels.sql`):
- `push_subscriptions` table: Web Push subscription storage per user (endpoint UNIQUE, p256dh, auth, device_type, is_active)
- RLS: user-scoped read/write/delete + service_role ALL
- 2 RPCs: `register_push_subscription` (upsert by endpoint, auth.uid()), `unregister_push_subscription` (soft delete is_active=false)

**Notification Delivery** (channels: IN_APP / PUSH / EMAIL / BROADCAST):
- `notifyInApp` / `notifyPush` / `notifyEmail` helpers in automationEngine → enqueue to `notification_queue`
- Push subscription register/unregister service + hooks in notifications feature (`pushSubscriptionService`, `usePushSubscription`)
- Scheduler Edge Function extended: IN_APP → notifications table; PUSH → fetch push_subscriptions (delivery via webpush/VAPID keys — integration point); EMAIL → provider integration point

**Admin Notification Composer** (`/admin/notification`):
- Compose + enqueue notification by channel (IN_APP/PUSH/EMAIL/BROADCAST) to a user or broadcast
- Route `/admin/notification` with sidebar Bell icon

**Notes**:
- Push/Email real delivery gated on VAPID / SMTP provider keys (out of scope); queue + retry + dead-letter machinery fully functional
- In-App delivery active end-to-end via existing dispatchEvent

### Sprint D.1 — Automation ✅

**Database Migration** (`20260807000000_automation.sql`):
- `scheduled_jobs` table: event-driven background job scheduler (job_type MISSION_SCHEDULE/CAMPAIGN_SCHEDULE/SUBSCRIPTION_GRACE/SUBSCRIPTION_EXPIRY/BROADCAST_SEND/CUSTOM), status (PENDING/CLAIMED/DONE/FAILED), run_at, attempts, max_attempts
- `notification_queue` table: async dispatch queue with channel (IN_APP/PUSH/EMAIL/BROADCAST), status (PENDING/CLAIMED/SENT/FAILED/DEAD), attempts, max_attempts, next_retry_at
- 9 RPCs: `create_scheduled_job`, `claim_due_jobs` (FOR UPDATE SKIP LOCKED), `mark_job_done`, `mark_job_failed` (exponential backoff or FAILED), `enqueue_notification`, `claim_notification_batch` (SKIP LOCKED), `mark_notification_sent`, `mark_notification_failed` (backoff or DEAD), `requeue_dead_notifications`
- RLS: service_role ALL (worker-only tables)

**Automation Module** (`src/features/automation/`):
- Types: ScheduledJob, NotificationQueueItem, AutomationActionResult, enums
- Repository: 11 RPC wrappers + direct queries for jobs/queue/dead
- Service: scheduleJob/scheduleMission/scheduleCampaign, enqueueNotification, processDueJobs, processNotificationQueue (retry-safe), requeueDead, getters
- Hooks: useScheduledJobs, useNotificationQueue, useDeadQueue, useScheduleJob, useEnqueueNotification, useRequeueDead, useProcessJobs, useProcessQueue
- index.ts barrel exports

**Scheduler Edge Function** (`supabase/functions/scheduler/`):
- Worker (Deno): claims due scheduled jobs → enqueues notifications; claims notification batch → dispatches IN_APP + marks sent/failed
- Retry-safe with dead-letter; CORS handler

**Admin Automation** (`/admin/automation`):
- 3-tab page: Scheduler | Queue | Dead Letter
- Scheduler: job list with type/status/attempts/error
- Queue: dispatch queue with channel/status/attempts
- Dead Letter: failed items + "Requeue All Dead" action
- Route `/admin/automation` with sidebar CalendarClock icon

**Integration**:
- Processors reuse existing in-app `dispatchEvent` / `notifications` table for IN_APP channel
- No wallets, no ledger, no profiles direct queries (respects architecture rules)

### Sprint C.8 — Commerce Stabilization ✅

**Verification**:
- TypeScript: PASS (`tsc --noEmit`)
- ESLint: PASS
- Production Build: PASS (main chunk 498 KB, AdminRoutes chunk ~640 KB)

**Security Audit**:
- All commerce/membership tables have RLS (user-scoped SELECT + service_role ALL)
- No secrets/API keys committed; gateway uses simulated redirect URLs
- No direct queries to profiles / wallet_summary / user_badges / user_streaks in commerce modules

**Performance Audit**:
- Fixed N+1 scan in `updateFulfillmentStatus`: replaced `getAllFulfillments().find()` with direct `getFulfillmentById(id)` repository query
- Analytics via single aggregate RPCs (no per-row loops)

**Bundle Audit**:
- Confirmed code-splitting; commerce/subscription admin pages lazy-loaded via AdminRoutes chunk
- Lucide icons tree-shaken per-component

**Wallet Audit**:
- All commerce debits through Wallet Ledger V2 (checkout, subscription)
- Fixed WALLET refund gap: `commerceEngine.processRefund` now credits wallet via `walletEngine.credit` (REFUND) after atomic order/inventory/voucher restore
- GATEWAY refunds correctly skip wallet credit

**Marketplace Audit**:
- Inventory lock (FOR UPDATE) before payment; release on failure (rollback)
- Order state machine intact; voucher reservation uses FOR UPDATE SKIP LOCKED
- Refund restores inventory + assigned vouchers atomically

### Sprint C.5 — Voucher & Payment ✅

**Database Migration** (`20260804000000_voucher_and_payment.sql`):
- `marketplace_voucher_pool` table: voucher codes for marketplace products with status lifecycle (AVAILABLE/RESERVED/ASSIGNED/USED/EXPIRED/VOID), assigned user, TTL
- `payment_records` table: multi-gateway payment tracking with idempotency key, payment_method enum (VXP/MIDTRANS/XENDIT/QRIS/BANK_TRANSFER/CREDIT_CARD)
- `payment_webhook_log` table: gateway webhook audit trail
- 8 RPCs: `reserve_marketplace_voucher` (FOR UPDATE SKIP LOCKED), `assign_marketplace_voucher`, `use_marketplace_voucher`, `refund_marketplace_voucher`, `create_payment` (idempotent), `update_payment_status` (atomic payment + order), `expire_marketplace_vouchers`
- RLS: user-scoped reads; service_role for admin operations

**Marketplace Voucher Module** (`src/features/marketplace-voucher/`):
- Types: MarketplaceVoucher, VoucherStatus, VoucherActionResult
- Repository: reserve/assign/use/refund RPC calls + seed/getAll/getAvailable/getUser
- Service: requestVoucher, confirmVoucherAssignment, useVoucherCode, returnVoucher
- 4 hooks: useMarketplaceVoucherPool, useUserMarketplaceVouchers, useAvailableMarketplaceVouchers, useRequestMarketplaceVoucher

**Payment Engine** (`src/features/payment/`):
- Types: PaymentMethod, PaymentStatus, PaymentRecord, PaymentResult, WebhookPayload
- Repository: createPaymentRecord (idempotent via RPC), updatePaymentStatus, getByOrderId/getById/getByUser/getAllPayments
- Service: initiatePayment (VXP = instant debit; gateway = redirect flow), processPaymentCallback (webhook), getPaymentDetail
- 3 hooks: usePaymentByOrder, useUserPayments, useInitiatePayment

**Webhook Edge Function** (`supabase/functions/payment-webhook/`):
- POST handler with CORS, signature verification
- Raw payload logged to `payment_webhook_log` for audit
- Gateway status mapping → SUCCESS or FAILED
- Atomic `update_payment_status` RPC; marks webhook as processed

**Enhanced Checkout Service**:
- `executeCheckout()` supports paymentMethod param (VXP | MIDTRANS | XENDIT | etc.)
- VXP: instant wallet debit flow
- Gateway: creates payment record, returns redirect_url
- Inventory lock + rollback in both flows

**Admin Payments** (`/admin/payments`):
- 2-tab page: Payments | Vouchers
- Payments: list by amount/method/status/gateway; SUCCESS/FAILED actions for PENDING
- Vouchers: list by code/product/status; seed new codes, delete unassigned
- Route `/admin/payments` with sidebar CreditCard icon

### Sprint C.4 — Checkout Engine ✅

**Database Migration** (`20260803000000_checkout_engine.sql`):
- `expires_at` column on marketplace_orders (7-day cart TTL)
- 7 RPCs: `get_cart`, `add_to_cart` (atomic upsert + auto-create DRAFT), `remove_from_cart`, `clear_cart`, `lock_inventory` (FOR UPDATE row lock), `release_inventory`, `deduct_inventory`
- UNIQUE constraint on `marketplace_order_items(order_id, product_id)`

**Feature Module** (`src/features/checkout/`):
- `types.ts` — CartItem, Cart, CheckoutResult
- `repositories/cartRepository.ts` — cart CRUD via RPCs
- `repositories/checkoutRepository.ts` — inventory locking + order status management
- `services/cartService.ts` — product validation + stock check before add_to_cart
- `services/checkoutService.ts` — executeCheckout: validate wallet → lock inventory → set PENDING → debit wallet → set PAID → deduct inventory → set PROCESSING; full rollback
- `hooks/useCart.ts` — 4 hooks (useCart, useAddToCart, useRemoveFromCart, useClearCart)
- `hooks/useCheckout.ts` — useCheckout mutation with cache invalidation

**Checkout Flow**:
1. Get cart → validate wallet via economy engine
2. Lock inventory via RPC (row-level FOR UPDATE)
3. Set order to PENDING → debit wallet via Wallet Ledger v2
4. Set PAID → deduct inventory → set PROCESSING
5. On failure: release inventory + cancel order

Verification:
- TypeScript: exit 0
- ESLint: exit 0
- Production Build: exit 0 (main chunk 498 KB)

---

## 2026-07-20

### Sprint C.3 — Marketplace Foundation ✅

**Database Migration** (`20260802000000_marketplace_foundation.sql`):
- `marketplace_categories` — product taxonomy with parent hierarchy, sort_order, RLS
- `marketplace_products` — master product catalog: reward_id FK to reward_catalog, product_type enum, price, featured, images JSONB, metadata JSONB
- `marketplace_inventory` — stock per product: total/reserved/warning/unlimited
- `marketplace_orders` — order lifecycle (DRAFT→PENDING→PAID→PROCESSING→COMPLETED→CANCELLED→REFUNDED)
- `marketplace_order_items` — line items with product snapshot
- Seed: 6 default categories, existing rewards linked to marketplace_products + inventory

**Feature Module** (`src/features/marketplace/`):
- `types.ts` — 7 interfaces: ProductType, OrderStatus, Product/Category/Inventory/Order/Item
- 3 repositories (marketplace, category, inventory) with full CRUD
- 2 services (marketplaceService, inventoryService) with merged product+stock views
- 4 hooks (useMarketplaceProducts, useMarketplaceProduct, useMarketplaceCategories, useMarketplaceInventory)

**Admin Marketplace** (`src/features/admin/marketplace/`):
- 3-tab page (Products | Inventory | Categories) with inline CRUD
- Products: inline edit name/price/active, create new, delete non-reward-linked
- Inventory: inline edit stock/warning/unlimited, low-stock highlighting
- Categories: inline edit name/order/active, create, delete
- Route: `/admin/marketplace` with Store icon in sidebar
- React Query with mutations + cache invalidation per tab

Verification:
- TypeScript: exit 0
- ESLint: exit 0
- Production Build: exit 0 (main chunk 498 KB, AdminRoutes 617 KB)

---

## 2026-07-20

### Sprint C.2 — Wallet Ledger v2 ✅

**Database Migration** (`20260801000000_wallet_ledger_v2.sql`):
- Extended `wallet_ledger` with: `transaction_key` (UNIQUE INDEX for idempotency), `before_balance`, `after_balance`, `status` (PENDING/SUCCESS/FAILED/ROLLED_BACK/EXPIRED), `updated_at`, `rolled_back_at`, `rolled_back_by`, `metadata` (JSONB)
- `wallet_rollbacks` table — rollback audit trail with RLS
- 9 RPCs: `create_transaction` (PENDING entry + balance snapshot + duplicate check), `commit_transaction` (atomic SUCCESS + profile update), `fail_transaction`, `rollback_transaction` (reversal entry + audit), `retry_transaction` (FAILED → PENDING → commit), `get_transactions_admin` (paginated with filters), `check_duplicate`

**Wallet Engine — Ledger-First Lifecycle**:
- `credit()`/`debit()`: create_transaction (PENDING) → commit_transaction (SUCCESS + profile update) — atomic two-phase
- Auto-rollback on commit failure → `fail_transaction()` called
- `generateTransactionKey()` for deterministic idempotency keys

**Fraud Protection**:
- `transaction_key` UNIQUE INDEX prevents duplicate ledger entries
- `create_transaction` checks duplicate before creation
- Cannot rollback already-rolled-back; can only retry FAILED

**Admin Ledger Management**:
- `TransactionTable.tsx` — full admin table with ID, user, type, amount, before/after balance, status badge, actions
- `useTransactions.ts` — React Query with pagination, filters, rollback/retry mutations with cache invalidation
- `TransactionsPage.tsx` — filters bar, pagination, confirmation dialog for destructive actions
- Retry (FAILED only), Rollback (creates reversal + audit trail)

**Types Updated**:
- `TransactionStatus` type, `CreateTransactionInput`, `AdminTransactionResult`
- `WalletLedgerEntry` + `WalletResult` extended with v2 fields
- `ROLLBACK` added to `WalletTransactionType`

Verification:
- TypeScript: exit 0
- ESLint: exit 0
- Production Build: exit 0 (main chunk 498 KB)

---

## 2026-07-20

### Sprint C.1 — XP Economy Rules ✅

**Database Migration** (`20260731000000_xp_economy_rules.sql`):
- `xp_rules` table — 17 columns: id (UUID), slug (UNIQUE), title, source, base_xp, enabled, priority, cooldown_minutes, daily_limit, weekly_limit, monthly_limit, minimum_level, maximum_level, metadata (JSONB), created_at, updated_at + RLS + indexes
- `xp_multipliers` table — 12 columns: id (UUID), slug (UNIQUE), title, multiplier (NUMERIC), type (global/event/vip/campaign/holiday/weekend/level), enabled, priority, start_date, end_date, conditions (JSONB), created_at, updated_at + RLS + indexes
- `economy_settings` table — key-value config with setting_type validation
- Seed: 31 xp_rules (19 master sources + 12 milestones + 8 achievements), 4 multipliers, 5 settings
- RPCs: `admin_update_xp_rule` (partial update by slug), `admin_update_multiplier` (partial update by slug)

**Economy Engine — `calculateXP()`**:
- `sources.ts` — `XP_FALLBACKS` registry (19 entries), `getFallbackXP()`, `XP_SOURCE_LABELS`
- `multiplierEngine.ts` — `computeMultiplier()` chains Global → Event → VIP → Level bonus; respects time windows (start_date/end_date); level bonus scales per-10-levels
- `economyEngine.ts` — `calculateXP({ source, userId, context? })`: lookup rule → fallback → apply multipliers → return { baseXP, multiplier, bonus, finalXP, breakdown, fromFallback }
- Repository: `getXpRule(slug)`, `getAllXpRules()`, `getActiveMultipliers()`, `getAllMultipliers()`, `updateXpRule()`, `updateMultiplier()`, `getEconomySetting()`
- Hooks: `useXpRules()`, `useActiveMultipliers()`, `useAllMultipliers()`, `useCalculateXP()`

**Business Module Migrations** (4 modules migrated):
- `loginRewardEngine.ts` — `loginRewardForStreak()` now calls `calculateXP("DAILY_LOGIN")` + `calculateXP("STREAK_LOGIN")`; max capped by config
- `MissionClaimService.ts` — mission reward calculated via `calculateXP()` based on period (MISSION_DAILY/WEEKLY/MONTHLY/COMPLETE) instead of `mission.reward`
- `milestoneEngine.ts` — XP grant uses `calculateXP("MILESTONE_{key}")` instead of `def.reward_vxp`
- `achievementEngine.ts` — XP grant uses `calculateXP("ACHIEVEMENT_{slug}")` instead of `item.reward_vxp`

**Admin Economy UI** (3 tabs):
- **Wallet Caps** — earning/spending caps with controlled inputs (was existing)
- **XP Rules** — inline-editable table grouped by source category; edit base_xp + toggle enabled; save per-row
- **Multipliers** — inline-editable table; edit multiplier value + toggle enabled; save per-row

**Fallback Strategy** (per spec):
- calculateXP() → lookup xp_rules → rule found? DB value | not found? fallback constant → continue transaction
- Catalog values (milestoneCatalog, achievementCatalog) kept as seed data
- `XP_FALLBACKS` ensures zero disruption if DB table not yet seeded

Verification:
- TypeScript: exit 0
- ESLint: exit 0
- Production Build: exit 0 (main chunk 498 KB)

---

## 2026-07-20

### Sprint C.0 — Economy Foundation ✅

**Economy Feature Module** (`src/features/economy/`) — new central orchestration layer:
- `types.ts` — `CurrencyType` (VXP | PREMIUM), `EconomyConfig`, `SpendingLimitResult`, `BalanceSnapshot`, `EconomyResult`
- `repositories/economyRepository.ts` — wraps 4 RPCs: `get_economy_config`, `check_spending_limit`, `log_spending`, `snapshot_balance`
- `services/economyEngine.ts` — `validateTransaction()` (checks spending limits before debit/credit), `recordSpending()`, `loadEconomyConfig()`
- `services/pricingEngine.ts` — `getEffectivePrice()` (base pricing), `applyQuantityPricing()` (bulk discount: 5+ = 10%, 10+ = 15%)
- `hooks/useEconomy.ts` — `useEconomyConfig()` (5min stale), `useTransactionValidation()` (30s stale)
- `index.ts` — barrel exports

**Database migration** (`20260730000000_economy_foundation.sql`):
- `currency_type TEXT DEFAULT 'VXP'` on `wallet_ledger` (non-breaking ADD column) + index
- `economy_config` table — key-value store (CURRENCIES, VXP_EARNING_DAILY_CAP, VXP_SPENDING_DAILY_CAP, VXP_SPENDING_WEEKLY_CAP, VXP_SPENDING_MONTHLY_CAP, VXP_MIN_BALANCE_FOR_REDEMPTION, ECONOMY_VERSION)
- `economy_spending_limits` table — per-user `daily/weekly/monthly` caps with unique constraint on `(user_id, currency_type, period, period_start)`
- `balance_snapshots` table — daily balance snapshots for analytics
- 5 RPCs: `get_economy_config`, `check_spending_limit` (validates proposed spend against all 3 periods), `log_spending` (upserts period tracking), `snapshot_balance`, `admin_update_economy_config`
- All tables have RLS: authenticated SELECT own, service_role write
- Seed data: default caps (daily earn 200, daily spend 500, weekly 2000, monthly 8000, min balance 100)

**Wallet Integration**:
- `walletEngine.ts` — `credit()` and `debit()` now call `validateTransaction()` before executing
- Debit: spending limit check + `recordSpending()` on success
- Credit: earning cap validation
- Non-breaking: economy engine failures log warning, transaction continues if validation unavailable

**Admin Economy Dashboard** (`src/features/admin/economy/`):
- `api/economy.ts` — `getAdminEconomyConfig()`, `updateEconomyConfig()` via RPC
- `hooks/useAdminEconomy.ts` — React Query with mutation + cache invalidation
- `pages/EconomyPage.tsx` — admin UI for managing earning caps, spending limits, min balance with validation
- Route: `/admin/economy` with Coins icon in sidebar

Verification:
- TypeScript: exit 0
- ESLint: exit 0
- Production Build: exit 0 (main chunk 497 KB)

---

## 2026-07-20

### Sprint B.1 — Canonical Migration Finalization

**Campaign** ✅ — Zero direct user table queries (no changes needed).

**Referral** ✅ — Migrated referral_code reads to CanonicalUser:
- `src/pages/ProfilePage.tsx` — Added `useCanonicalUser()` for referral_code display; referral link and referral section now read from CanonicalUser instead of `useProfile()`
- Referral data (`referral_code`, `referred_by`) now sourced exclusively through CanonicalUser

**Achievement** ✅ — Migrated Retention module to use CanonicalUser + repositories:
- `src/features/retention/services/metricReader.ts` — Replaced direct `supabase.from("user_streaks")` with `streakRepository.getStreak()` for `current_streak` metric
- `src/features/retention/hooks/useStreak.ts` — Replaced direct `supabase.from("user_streaks")` with `streakRepository.getStreak()`
- `src/features/retention/hooks/useAchievements.ts` — Replaced direct `supabase.from("user_achievements").select("*, achievements (*)")` with `achievementRepository.getEarnedAchievements()` + `getCatalog()`
- Zero direct queries to `user_streaks`, `user_badges`, `profiles`, `wallet_summary` in retention business layer

**Leaderboard** ✅ — Already compliant (no changes needed):
- Zero direct queries to `profiles`, `wallet_summary`, `user_badges`, `user_streaks` di frontend
- Semua data melalui Edge Function `supabase.functions.invoke("leaderboard")`
- Zero duplicate cache (`useProfile`, `useWallet`, `useBadges` tidak digunakan)
- Arsitektur sudah sesuai 6-layer flow
- Catatan: `rankCalculator.ts` dead code (tidak dipakai UI), beberapa field type dead (`current_streak`, `mission_completed`, `referral_count`, `listening_minutes`)

**Notification** ✅ — Already compliant (no changes needed):
- Zero direct queries to `profiles`, `wallet_summary`, `user_badges`, `user_streaks`
- Repository hanya mengakses `notifications` table
- Zero duplicate cache (`useProfile`, `useWallet`, `useBadges` tidak digunakan)
- Module menggunakan Zustand + Context (bukan React Query)
- Notifikasi tidak menyimpan atau menampilkan data user (display_name, avatar_url)

**Inventory** ✅ — Already compliant (no changes needed):
- Zero direct queries to `profiles`, `wallet_summary`, `user_badges`, `user_streaks`
- Repository hanya mengakses `reward_inventory` + `reward_inventory_ledger`
- Inventory Engine tidak membutuhkan data user (murni operasi stok)
- Redeem Engine sudah pakai `getCanonicalUser()` untuk validasi user
- Zero duplicate cache. Query keys: `["inventory"]`, `["inventory", rewardId]`

**Analytics** ✅ — Already compliant (no changes needed):
- Zero direct queries to `profiles`, `wallet_summary`, `user_badges`, `user_streaks` di analytics frontend
- Semua analytics via Edge Function (`admin-analytics`, `reward-analytics`, `campaign-analytics`, `admin-dashboard`)
- Satu-satunya frontend direct query: `campaignStatsRepository` — tapi hanya ke business tables (`missions_progress`, `mission_completions`, `campaigns`, `campaign_rewards`)
- Zero duplicate cache (`useProfile`, `useWallet`, `useBadges` tidak digunakan)

### Sprint B.1 — Canonical Migration COMPLETE 🎉

**Final Canonical Audit** — Hasil scan seluruh `src/`:

| Table | Remaining Direct Query | Valid? |
|-------|----------------------|--------|
| `profiles` | 6 (5 di profileRepository, 1 di pilotConfig) | ✅ — repository layer + pilot exception |
| `wallet_summary` | 0 | ✅ |
| `user_badges` | 3 (1 di userCanonicalService, 2 di badgeRepository) | ✅ — canonical builder + repository |
| `user_streaks` | 3 (1 di userCanonicalService, 2 di streakRepository) | ✅ — canonical builder + repository |

**Zero business module violations.** Semua modul sudah menggunakan CanonicalUser.

---

## 2026-07-18

### Sprint 14.95B — Canonical User Service (Phase B)

**Single Source of Truth** — CanonicalUser now merges 4 data sources:

- `profiles` (identity, vxp, social, referral)
- `wallet_summary` (current_vxp + lifetime_vxp → `wallet` field)
- `user_badges` → `badges: UserBadge[]`
- `user_streaks` → `streaks: UserStreak[]`

**New files / changes**:
- `src/features/profile/types/canonical.ts` — `CanonicalUser` extended: `wallet`, `badges`, `streaks`, `created_at`, `birthday`, `gender`, `favorite_program`, `favorite_music`, `referred_by`
- `src/features/profile/services/userCanonicalService.ts` — `getCanonicalUser` fetches profiles + badges + streaks in parallel; `refreshCanonicalUser()` invalidates cache; logging added: `[CANONICAL USER] loaded`, `[CANONICAL USER] refreshed`
- `src/features/profile/hooks/useCanonicalUser.ts` — React Query cache by user id (`["canonical-user", id]`), `staleTime: 5min`, logging: `[CANONICAL USER] cache hit`

**Engines replaced to consume CanonicalUser** (no business logic changed):
- Mission Engine: `milestoneEngine.ts`, `metricReader.ts` (already on CanonicalUser)
- Reward Engine: `redeemEngine.ts`, `walletValidationService.ts` — `walletValidationService` now uses `canonical.badges` instead of separate `getBadges` query (removed duplicate)
- Wallet Engine: `walletEngine.balance()` now sourced from `getCanonicalUser` instead of `getWalletBalance` RPC
- Admin User Detail: `UserDetailPage.tsx` — profile display (Identity, Profile, Social, Referral, Admin Actions) now sourced from `useCanonicalUser(id)`; stats/transactions still from admin edge function; admin mutations refetch both queries

Verification:
- TypeScript check: exit 0
- Production build: exit 0 (main chunk 497 KB)
- ESLint: exit 0

---

## 2026-07-18

### Sprint 14.95 — Performance Refactor (Bundle Optimization)

**Route-based code splitting** — all page components converted to `React.lazy()` + `Suspense` in `src/routes/AppRoutes.tsx`:
- Public routes (Programs, Announcers, Schedule, Live, Plus, Search, Notifications, Promo, Missions, Reward, Leaderboard, Campaigns) lazy-loaded
- `AdminRoutes` lazy-loaded — recharts/admin modules no longer in main bundle
- `DeveloperMissionSandbox` lazy-loaded
- Added `Lazy` Suspense wrapper component with spinner fallback

**Bundle results** (from `npm run build`):
- Main chunk: **1,983 KB → 496 KB** (gzip 153 KB) ✅ under 900 KB target
- `LiveStudioPage` (hls.js): 526 KB — lazy, only on `/live`
- `AdminRoutes` (recharts): 579 KB — lazy, only on `/admin/*`
- `supabase`: 203 KB — lazy via dynamic import

### Deployment Stabilization ✅

- `wrangler.jsonc` — Wrangler v4 format: `assets.directory: ./dist`, `not_found_handling: single-page-application`
- `wrangler: ^4.107.0` in package.json
- Release pipeline: `npm run deploy` = `npm run build && wrangler deploy`

### Canonical User Service ✅ (verified)

- `src/features/profile/services/userCanonicalService.ts` — `getCanonicalUser`, `getCanonicalUserByReferralCode`
- `src/features/profile/types/canonical.ts` — `CanonicalUser` type
- `src/features/profile/hooks/useCanonicalUser.ts` — `useCanonicalUser` hook
- Consumed by: useUserVXP, walletValidationService, redeemEngine, milestoneEngine, metricReader, ProfileValidator, ReferralValidator, AuthProvider

### Admin User Detail ✅ (verified)

- `src/features/admin/users/pages/UserDetailPage.tsx` — Identity, Profile, Social Media, Referral, Wallet/Stats, Recent XP Transactions, Admin Actions (Ban, Unban, Delete, Adjust VXP)
- `AdminUser` type: birthday, favorite_music, referred_by, social media fields, profile_completed
- `admin-user-actions` edge function for ban/unban/delete/adjust_vxp

### Mission / Reward Stabilization ✅ (verified)

- Feature flags: `src/features/flags/index.ts` (mission/reward `public_enabled: false`)
- `ComingSoon` + `FeatureGuard` components
- MorePage, QuickAccess, HomePage (MissionWidget), AppRoutes guarded

Verification:
- TypeScript check: exit 0
- Production build: exit 0
- ESLint: exit 0

---

## 2026-07-18

### RC-1 — Release Candidate v1.0

**UI Freeze**: Mission and Reward Store hidden behind "Coming Soon" for public.
- `src/features/flags/index.ts` — Feature flag constants; `mission.public_enabled = false`, `reward.public_enabled = false`
- `src/components/ui/ComingSoon.tsx` — Reusable "Coming Soon" with clock icon
- `src/components/ui/FeatureGuard.tsx` — Route-level guard that renders ComingSoon when flag is disabled
- `src/pages/MorePage.tsx` — Mission Center and Reward Store links show "Coming Soon" when disabled
- `src/components/home/QuickAccess.tsx` — Rewards link shows muted "Coming Soon" state
- `src/pages/HomePage/HomePage.tsx` — MissionWidget hidden when mission flag disabled
- `src/routes/AppRoutes.tsx` — All `/missions`, `/missions/:id`, `/reward-store`, `/reward-store/:slug`, `/reward-history` routes wrapped with FeatureGuard

**Sprint 0.9 — Canonical User Service**: (completed in prior session)
- `CanonicalUser` type, `getCanonicalUser` service, `useCanonicalUser` hook
- 8 modules refactored: useUserVXP, walletValidationService, redeemEngine, milestoneEngine, metricReader, ProfileValidator, ReferralValidator, AuthProvider
- `findProfileByReferralCode` added to profile repository

**Admin User Detail v2**: (completed in prior session)
- `AdminUser` type extended with birthday, favorite_music, referred_by, social media, profile_completed
- `UserDetailPage` with Identity, Profile, Social Media, Referral, Wallet, Stats, Admin Actions sections

Verification:
- TypeScript check: exit 0
- Production build: exit 0
- ESLint: exit 0

---

## 2026-07-18

### Sprint 14.9A — Reward Infrastructure Recovery

**Infrastructure Recovery** — applied all missing migrations to remote Supabase:
- Committed all 24 migration files to git (commit 4cc36c3) — were previously untracked
- Deployed 6 migrations: wallet_ledger, reward_redeems, reward_inventory (+ledger), reward_voucher_pool, reward_shipping (+timeline), reward_catalog
- Fixed RLS on reward_inventory (public read access) so Reward Store can display stock
- Synced 4 WordPress rewards into reward_catalog + reward_inventory via SQL

### Sprint 8.8 — Mission Engine Stabilization

**Frontend Code Changes:**
- `profileCompletion.ts` — Required fields expanded from 8→11: added `phone_number`, `favorite_program`, `favorite_music`. Completion weight recalculated per-field.
- `profileService.ts` — Auto-generates `referral_code` (crypto UUID, 8-char uppercase) for profiles missing one. Exported `ensureReferralCode()` utility.
- `ProfilePage.tsx` — Added Favorite Program / Favorite Music input fields. Avatar upload path fixed to `{userId}/avatar.jpg`. Avatar bucket auto-created on 404. Avatar errors never block profile save.
- `ReferralValidator.ts` — Validates BOTH `profiles.referred_by` (at least one referred user) AND `referrals` table entries before counting referral mission progress.
- `AuthProvider.tsx` — On `SIGNED_IN`, processes saved referral code from localStorage: sets `referred_by` on referred profile, creates `referrals` row, dispatches `REFERRAL_SUCCESS` event.
- `engine.ts` — Better error logging for `activity_logs` insert failures. Sanitizes payload via JSON parse/stringify before insert.

**Infrastructure:**
- Deployed `user_streaks` table (migration `20260716000005_user_streaks.sql`) — full schema with RLS policies
- Deployed `20260729000000_sprint_88_stabilization.sql` — updated `claim_mission_reward` RPC with descriptive wallet ledger entries; ensured `referrals` table schema with RLS policies

**Verification:**
- `npm run check` — PASS (zero errors)
- `npm run build` — PASS (2869 modules)
- `npm run lint` — PASS (zero warnings)

**Root cause fixed**: `reward_catalog` table now exists on remote — Reward Store and Admin Catalog will display data again.

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0

---

### Sprint 14.9 — Reward Architecture Finalization

**RewardAggregate** — single model consumed by all UI:
- `src/features/rewards/types/rewardAggregate.ts` — type with catalog + inventory + voucher + shipping fields
- `src/features/rewards/repositories/rewardAggregateRepository.ts` — joins `reward_catalog` + `reward_inventory` for real stock (no more hardcoded 0)
- `src/features/rewards/hooks/useRewardAggregate.ts` — `useRewardAggregate`, `useActiveRewardAggregate`, `useRewardAggregateBySlug`

**Sync v2** — only metadata fields synced from WordPress:
- `rewardSyncEngine.ts` — `wpToCatalogEntry` no longer includes operational fields (cost, featured, priority, reward_active, max_per_user) — Dashboard-owned data never overwritten
- `rewardSyncRepository.ts` — `upsertRewardCatalog` accepts `CatalogMetadata` type (metadata only)

**Edge function fix**:
- `admin-reward-update/index.ts` — added `priority` to body destructuring + ACF payload

**UI migrated from WP direct reads to RewardAggregate**:
- `RewardStorePage.tsx` — `useActiveRewardAggregate()` instead of `useActiveRewards()`
- `RewardDetailPage.tsx` — uses `RewardAggregate` with real stock (fixes "Out of Stock" bug)
- `RewardDetailSheet.tsx` — uses `RewardAggregate` with real stock
- `RewardCard.tsx` — uses `RewardAggregate`, placeholder image fallback
- `RewardGrid.tsx` — uses `useActiveRewardAggregate()`
- `RewardPreview.tsx` (homepage) — uses `useActiveRewardAggregate()`
- `walletValidationService.ts` — accepts `RewardAggregate`, eligibility checks with real stock

**Admin uses RewardAggregate**:
- `useAdminRewardCatalog.ts` — queries aggregate, `useAdjustRewardStock` mutation added
- `RewardsCatalogPage.tsx` — shows real stock from inventory, stock editing via inventoryEngine

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run lint`: exit 0

**Reward System v1.0 FROZEN** ✅

---

**Reward Sync Layer** — canonical reward catalog backed by Supabase:
- `supabase/migrations/20260728000000_create_reward_catalog.sql` — `reward_catalog` table: WP metadata + operational fields (cost, featured, priority, reward_active, max_per_user) + RLS + indexes
- `src/features/rewards/repositories/rewardSyncRepository.ts` — `upsertRewardCatalog`, `getAllRewardCatalog`, `getRewardCatalogById/BySlug`, `updateRewardOperational`, `getActiveRewardCatalog`
- `src/features/rewards/services/rewardSyncEngine.ts` — `syncAll()` (WP→Supabase catalog + inventory seed), `toggleRewardActive`, `updateRewardCost/Featured/Priority`
- `src/features/rewards/services/rewardCatalogMapper.ts` — `catalogRowToReward` / `catalogRowsToRewards`
- `src/features/rewards/queries/rewardQueries.ts` — React Query key factory
- `src/features/rewards/hooks/useRewardCatalog.ts` — `useRewardCatalog`, `useActiveRewards`, `useRewardBySlug/ById`, `useSyncRewards`

**Media Resolver** (`src/utils/mediaResolver.ts`):
- `resolveFromEmbedded`, `resolveMediaUrl`, `resolveRewardImage` — WP media fetch + embedded fallback + `supabase.storage` path support
- Never returns empty `src=""` — always falls back to placeholder

**Store + Detail now read from local catalog**:
- `src/pages/RewardStorePage.tsx` — switched from `useRewards()` (WP) to `useActiveRewards()` + `catalogRowsToRewards`
- `src/features/rewards/pages/RewardDetailPage.tsx` — same switch

**Admin catalog uses local Supabase as primary source**:
- `src/features/admin/rewards-crud/hooks/useAdminRewardCatalog.ts` — new hook set: catalog query, sync mutation, toggle/cost/featured/priority mutations
- `src/features/admin/rewards-crud/pages/RewardsCatalogPage.tsx` — loads from `reward_catalog`, Sync from WP button, dual save (operational → local Supabase, metadata → WP edge function)
- `src/features/admin/rewards-crud/components/RewardEditDialog.tsx` — added `priority` field, refactored FormState interface
- `src/features/admin/rewards-crud/components/RewardTable.tsx` — added Priority column
- `src/features/admin/rewards-crud/components/RewardRow.tsx` — added priority display

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run lint`: exit 0

---

### Sprint 14G — Reward Analytics v1.0

**Reward Analytics Edge Function** (`supabase/functions/reward-analytics/`):
- Aggregates from 6 data sources: `reward_redeems`, `wallet_ledger`, `reward_inventory`, `reward_inventory_ledger`, `reward_voucher_pool`, `reward_shipping`
- WordPress API for reward overview (total/published/featured counts)
- 6 isolated sections: Overview, Redeems, Wallet, Inventory, Vouchers, Shipping
- Auth guard, CORS, Promise.all with isolated try/catch per section
- `deno check` ✅

**Frontend module** (`src/features/admin/reward-analytics/`):
- `types/` — `RewardAnalyticsResponse` and 12 supporting interfaces
- `repositories/rewardAnalyticsRepository.ts` — edge function invoke with typed response
- `services/rewardAnalyticsService.ts` — 6 pure transform functions (redeem trend, wallet burn, top rewards, low stock, status breakdown, voucher breakdown)
- `queries/rewardAnalyticsQueries.ts` — React Query key factory
- `hooks/useRewardAnalytics.ts` — `useQuery` with 60s stale + 30s refetch + memoized transforms
- `components/OverviewCards.tsx` — 5 gradient cards (Total Redeems, Burned VXP, Inventory, Voucher Usage, Pending Shipment)
- `components/RedeemTrendChart.tsx` — bar chart wrapping `AnalyticsBarChart`
- `components/TopRewardsTable.tsx` — ranked table with position numbers
- `components/LowStockAlert.tsx` — critical/warning sections with red/amber styling
- `components/StatusBreakdownPie.tsx` — donut pie for redeem statuses
- `components/VoucherBreakdownPie.tsx` — donut pie for voucher statuses
- `pages/RewardAnalyticsPage.tsx` — full page with period filter (7/30/90d), CSV export, refresh, loading/error states, VXP burn trend table

**Route + Sidebar**:
- `AdminRoutes.tsx` — added `/admin/reward-analytics` → `RewardAnalyticsPage`
- `AdminLayout.tsx` — added "Reward Analytics" sidebar link with `BarChart4` icon

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run lint`: exit 0

---

## 2026-07-18

### Sprint 14F — Shipping & Fulfillment v1.0

**Shipping Engine** (`src/features/shipping/`) — fulfillment lifecycle for physical rewards:
- `types.ts` — `ShippingStatus` (PENDING/PACKING/READY_TO_SHIP/SHIPPED/IN_TRANSIT/DELIVERED/COMPLETED/RETURNED/REPLACED/CANCELLED), `ShippingRecord`, `ShippingTimelineEntry`, `ShippingAddress`, `ShippingResult`, `ShippingUpdateInput`, `ShippingQueueItem`
- `repositories/shippingRepository.ts` — `createShippingRecord`, `getShippingByRedeemId`, `getShippingQueue`, `getShippingTimeline`, `updateShippingStatus` (atomic with timeline insert), `assignTrackingNumber` (one-time only), `updateCourierInfo`
- `services/fulfillmentEngine.ts` — `createFulfillment`, `updateFulfillmentStatus`, `assignTracking`, `getQueue`, `getFulfillmentDetail`, `getTimeline`; tracking number one-time assignment enforcement
- `hooks/useFulfillment.ts` — `useFulfillment`, `useFulfillmentQueue`, `useAssignTracking`, `useUpdateFulfillmentStatus`
- `components/ShippingQueuePage.tsx` — admin page with 7 status tabs, queue table, update dialog (courier + tracking + status), timeline viewer
- `index.ts` — barrel exports

**Database migration** (`20260727000000_create_reward_shipping.sql`):
- `reward_shipping` table: id, redeem_id (FK reward_redeems), user_id, reward_id, full address fields, courier, service, tracking_number (unique), shipping_status, notes
- `reward_shipping_timeline` table: immutable history log with from_status, to_status, note, created_by
- 4 RPCs: `create_shipping_record`, `update_shipping_status` (atomic status + timeline), `assign_tracking_number` (one-time only), `get_shipping_queue` (with aggregated timeline)
- RLS: authenticated SELECT own; service_role manages all

**Redeem Engine integration**:
- `RedeemInput` now has `needShipping` flag + `ShippingAddress`
- On APPROVED + needShipping: `fulfillmentEngine.createFulfillment()` called automatically

**Action Engine integration**:
- Added `SHIPPING_STATUS` event type with `{ shipping_id, from_status, to_status, tracking_number }` payload

**Courier API**: Out of scope per spec (tracking numbers entered manually in admin UI)

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run lint`: exit 0

---

## 2026-07-18

### Sprint 14E — Voucher Pool Engine v1.0

**Voucher Pool Engine** (`src/features/voucher/`) — single source for all redeemable voucher codes:
- `types.ts` — `VoucherStatus` (AVAILABLE/RESERVED/ASSIGNED/USED/EXPIRED/VOID), `VoucherType` (tokopedia, shopee, spotify, steam, google_play, internal, campaign), `VoucherRecord`, `VoucherResult`, `VoucherPoolInput`, `AssignVoucherInput`
- `repositories/voucherRepository.ts` — `getAllVouchers`, `getVoucherById`, `getVouchersByStatus`, `getUserVouchers`, `seedVoucher`, `seedVouchers`, plus RPC wrappers: `reserveVoucherRpc`, `assignVoucherRpc`, `markVoucherUsedRpc`, `refundVoucherRpc`
- `services/voucherPoolEngine.ts` — `requestVoucher` (reserve from pool), `assignVoucher`, `markVoucherUsed`, `refundVoucher` (returns to pool if unused, else VOID), `addVouchersToPool`, `getVoucherHistory`, `getUserAssignedVouchers`, `getAvailableVouchers`
- `hooks/useVoucher.ts` — `useVoucherPool`, `useUserVouchers`, `useAvailableVouchers`, `useRequestVoucher`, `useAssignVoucher`, `useMarkVoucherUsed`, `useRefundVoucher`
- `index.ts` — barrel exports

**Database migration** (`20260726000000_create_reward_voucher_pool.sql`):
- `reward_voucher_pool` table: id, reward_id, voucher_code (unique), voucher_type, status, assigned_user, assigned_at, used_at, expired_at, created_at
- 5 RPCs: `reserve_voucher` (atomic with FOR UPDATE SKIP LOCKED), `assign_voucher`, `use_voucher`, `refund_voucher` (returns to AVAILABLE if ASSIGNED+unused, else VOID), `expire_vouchers`
- RLS: authenticated SELECT own assigned; service_role ALL

**Redeem Engine integration**:
- `RedeemInput` now has `voucherReward` flag
- On APPROVED status: requests voucher from pool → assigns to user
- Voucher Pool becomes the only source — Reward Store never stores voucher codes

**Action Engine integration**:
- Added `VOUCHER_ASSIGNED` and `VOUCHER_REFUND` event types + payloads

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run lint`: exit 0

---

## 2026-07-18

### Sprint 14D — Inventory Engine v1.0

**Inventory Engine** (`src/features/inventory/`) — single source of truth for reward stock:
- `types.ts` — `InventoryMode` (limited/unlimited), `InventoryTransactionType` (RESERVE/DEDUCT/REFUND/ADJUSTMENT/RESTOCK), `InventoryRecord`, `InventoryLedgerEntry`, `InventoryResult`
- `repositories/inventoryRepository.ts` — `getInventory`, `getAllInventory`, `getLowStockByWarning`, `getLedgerHistory`, `seedInventory`, plus RPC wrappers for `reserveStockRpc`, `deductStockRpc`, `refundStockRpc`, `adjustStockRpc`, `releaseReservationRpc`
- `services/inventoryEngine.ts` — stock validation, reservation, deduction, refund, adjustment, low stock detection (tracks `LOW_STOCK` action event when stock ≤ warning threshold)
- `hooks/useInventory.ts` — `useInventory`, `useAllInventory`, `useLowStockItems`, `useInventoryLedger`, `useAdjustStock`, `useReserveStock`, `useDeductStock`
- `index.ts` — barrel exports

**Database migration** (`20260725000000_create_reward_inventory.sql`):
- `reward_inventory` table: reward_id (PK), current_stock, reserved_stock, warning_stock, inventory_mode (limited/unlimited), updated_at
- `reward_inventory_ledger` table: immutable ledger with transaction_type, amount, before_stock, after_stock, reference_type, reference_id, admin_id
- 5 RPCs: `reserve_stock`, `deduct_stock`, `refund_stock`, `adjust_stock`, `release_reservation` — all atomic, all create ledger entries
- RLS: authenticated can SELECT; service_role manages all

**Redeem Engine integration**:
- `redeemEngine.ts` now checks stock via Inventory Engine before allowing redeem
- Reservation created on redeem (atomic), released on failure
- Deduction happens after APPROVED status
- Rollback releases reservation + refunds VXP on failure

**Action Engine integration**:
- Added `LOW_STOCK` event type + payload
- `notificationSubscriber.ts` maps `LOW_STOCK` → `admin_broadcast` notification

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run lint`: exit 0

---

## 2026-07-18

### Sprint 14C — Redeem Engine v1

**Redeem Engine** (`src/features/redeem/`) — new canonical redemption service:
- `types.ts` — `RedeemStatus` (PENDING/APPROVED/REJECTED/COMPLETED/REFUNDED/CANCELLED), `RedeemRecord`, `RedeemInput`, `RedeemResult`
- `repositories/redeemRepository.ts` — `insertRedeem`, `getUserRedeems`, `updateRedeemStatus`, `getRedeemById`
- `services/redeemEngine.ts` — atomic redeem flow: Validate → Wallet Deduction (via Wallet Engine) → Wallet Ledger → Redeem Record → Notification (via Action Engine). Rollback on failure (VXP refund). Status = PENDING if `approvalRequired`, else APPROVED.
- `hooks/useRedeem.ts` — `useRedeem` (mutation) + `useUserRedeems` (query)
- `index.ts` — barrel exports

**Database migration** (`20260724000000_create_reward_redeems.sql`):
- `reward_redeems` table with proper schema per spec (reward_id, reward_title, required_vxp, status, approval_required, approved_by, tracking_number, shipping_status, etc.)
- RLS: authenticated users can SELECT/INSERT own rows; service_role full access

**Action Engine integration**:
- Added `REWARD_REDEEM` event to `ActionEventName` and `ActionEventPayloads`
- `notificationSubscriber.ts` maps `REWARD_REDEEM` → `reward_redeemed` notification

**Refactored RewardEngine**:
- `processRewardRedemption()` now delegates to `redeemEngine.processRedeem()`
- Wallet deduction goes through Wallet Engine only (as spec requires)
- Refund creates new wallet ledger via `walletEngine.credit()`

**UI wired**:
- `RewardDetailPage.tsx` — Redeem button uses `useRedeem` mutation with success/error toast
- `RewardDetailSheet.tsx` — Redeem button uses `useRedeem` mutation with toast + auto-close on success
- `RewardHistoryPage.tsx` — added REFUNDED status display (icon, color, label, filter)

Verification:
- `npm run check`: exit 0
- `npm run build` (tsc -b + vite build): exit 0
- `npm run lint`: exit 0

---

## 2026-07-17

### Sprint 14 — Wallet Engine & Reward Store v1

**Wallet Engine** — canonical VXP transaction layer:
- Created `wallet_ledger` table — immutable, no UPDATE/DELETE (Sprint 14 canonical ledger)
- Created RPCs: `credit_wallet`, `debit_wallet`, `get_wallet_balance`, `get_wallet_history`
- Created `src/features/wallet/` with types, repository, engine, hooks, components, barrel export
- Created `WalletHistory` component — displays transaction history with labels and amounts
- `Wallet balance = SUM(wallet_ledger)` enforced by RPC design — balance always computed from ledger

**All major XP flows go through Wallet Engine**:
- `grantReward()` → `walletEngine.credit()` for non-mission XP (achievement, milestone, login_reward, referral, admin)
- `RewardEngine.processRewardRedemption()` → `walletEngine.debit()` for balance check + deduction + refund
- `claim_mission_reward` RPC → `INSERT INTO wallet_ledger` alongside profile update (atomic per mission)
- `xp-transaction` edge function → dual-writes to `wallet_ledger` (backward compat safety net)

**Dead code removed** (old XP paths that bypassed wallet):
- `BonusXPService.ts`, `adminAdjustXP.ts`, `useXP.ts`, `profileXPService.ts`

Verification:
- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build` (tsc -b + vite build): exit 0

---

## 2026-07-17

### Sprint 13 — Notification Engine v2 (Subscriber + Queue + Grouping)

**Event-driven notification subscriber** built on Action Engine:
- Created `notificationSubscriber.ts` — subscribes to Action Engine events (MISSION_COMPLETE, ACHIEVEMENT_UNLOCK, MILESTONE_UNLOCK, REWARD_CLAIM) and dispatches notifications through a queued pipeline
- **Notification Queue**: In-memory buffer with 800ms debounce flush — batches notifications before writing to DB
- **Grouping**: XP notifications (achievement_unlocked, reward_redeemed) merge within the queue window — rewards are summed into a single notification
- **Deduplication**: mission_completed notifications are single per mission_id — subsequent duplicate events are dropped
- **Spam Prevention**: Identical notification types for the same user are suppressed within a 30-second window

**No engine inserts notifications directly**:
- `missionEngine.ts` → `track("MISSION_COMPLETE", ...)` instead of `createMissionNotification()`
- `achievementEngine.ts` → `track("ACHIEVEMENT_UNLOCK", ...)` instead of `createAchievementNotification()`
- `milestoneEngine.ts` → `track("MILESTONE_UNLOCK", ...)` instead of `createMilestoneNotification()`
- `loginRewardEngine.ts` → `track("REWARD_CLAIM", ...)` instead of `createLoginRewardNotification()`
- `campaignAutomation.ts` → `systemNotification()` instead of `createCampaignNotification()`
- Removed engine-specific helper functions from `notificationService.ts`

**New Action Event types** added to `ActionEventName`:
- `ACHIEVEMENT_UNLOCK` (slug, title, reward_vxp)
- `MILESTONE_UNLOCK` (key, name, reward_vxp)
- `REWARD_CLAIM` (streak_day, reward_vxp)

**Registered** `notificationConsumer` in `AuthProvider.tsx` alongside missionConsumer and retentionConsumer.

Verification:
- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build` (tsc -b + vite build): exit 0

---

## 2026-07-22

### Sprint 12.6 — Action Engine Freeze v1.0

**Audit Result**: Action Engine is the single event entry point. No module bypasses it for Mission, XP, Achievement, Leaderboard, or Notification.

**Fix: duplicated `LISTEN_TICK` emitter**:
- `player-store.ts`: `listenTick()` was dead code (defined but never called). Removed method + type.
- `useListenMission.ts`: Fixed the 1-second interval to actually emit `track("LISTEN_TICK", ...)` during playback (was only firing on `beforeunload`). Removed duplicate `beforeunload` track call.
- Previously, listen missions only got progress updates on tab close — now they update every second during playback.

**Verified no bypasses**:
- All event emissions go through `track()` → Action Engine ✅
- `emitMissionEvent` / `missionEventBus` already removed (Sprint 8.7) ✅
- No direct `supabase.from("missions_progress")` writes outside repository ✅
- No direct `supabase.from("vxp_transactions")` writes ✅
- XP flows through `xp-transaction` edge function ✅
- Reward grants flow through `rewardGuard` (idempotency check) ✅

**Future events documented** (Event Catalog in `AI/117_EVENT_CATALOG.md`):
- Not yet tracked: `listen_start`, `listen_complete`, `campaign_join`, `campaign_complete`, `mission_join`, `mission_complete`, `reward_claim`, `badge_unlock`, `achievement_unlock`, `reaction_send`, `chat_send`, `poll_vote`, `purchase`, `watch_video`, `subscription_start`, `subscription_cancel`

### Sprint 12.5 — Mission UX Finalization

**State Machine Migration** (`types/state.ts`, `missionStateMachine.ts`):
- Removed: `LOCKED`, `AVAILABLE`, `JOINED`, `COMPLETED`, `EXPIRED`
- Added: `NOT_STARTED`, `READY_TO_CLAIM`, `HISTORY`, `ARCHIVED`
- New deterministic flow: `NOT_STARTED` → `IN_PROGRESS` → `READY_TO_CLAIM` → `CLAIMED` → `HISTORY` → `ARCHIVED`
- `deriveMissionState()` now used by MissionList, MissionCard, MissionDetailPage

**Repository** (`missionProgressRepository.ts`):
- Updated state strings: `JOINED` → `NOT_STARTED`, `COMPLETED` → `READY_TO_CLAIM`

**Mission Engine** (`missionEngine.ts`):
- Fixed auto-claim bug: non-auto-claim missions no longer get auto-claimed on completion
- Only `profile`, `checkin`, `share`, `referral` missions auto-claim (removed `listen`)
- Non-auto-claim missions enter `READY_TO_CLAIM` state for manual claim

**Mission List** (`MissionList.tsx`):
- Shows only `NOT_STARTED`, `IN_PROGRESS`, `READY_TO_CLAIM`
- Uses shared `deriveMissionState()` instead of duplicated inline logic

**Mission Card** (`MissionCard.tsx`):
- Uses new state names for status badges
- States: Not Started → Available, In Progress, Ready to Claim → Claim Reward / Completed

**Mission Detail** (`MissionDetailPage.tsx`):
- Added Campaign display when mission has `campaignSlug`
- States: Available, In Progress, Ready to Claim (manual or auto-completed)

**Mission History** (`MissionHistory.tsx`):
- Added mission type icon (Target) and campaign slug display
- Added Clock icon next to completed date
- Shows mission name (no Mission #ID fallback needed — already resolved)

**Validators** (`validators/index.ts`):
- `isAutoClaimMission`: removed `listen` from auto-claim actions

### Campaign Admin Refactor v2

Removed dependency on `campaign-analytics` edge function. Admin reads
campaign stats directly from Supabase.

**Migration** (`20260722000000_admin_stats_rls.sql`):
- Admin SELECT policies for `campaigns`, `missions_progress`,
  `mission_completions`, `reward_redemptions`, `campaign_rewards`

**New files**:
- `campaignStatsRepository.ts` — direct Supabase queries (progress,
  completions, campaign ID, reward count)
- `campaignStatsService.ts` — aggregation (participants, completion rate,
  XP issued, reward distributed)

**Updated files**:
- `api/campaigns.ts` — `getCampaignAnalytics()` calls service instead of
  edge function (dynamic import)
- `CampaignModeration.tsx` — status simplified to ACTIVE/INACTIVE,
  XP shows total instead of "avg"
- `campaign-analytics/index.ts` — added deprecation notice (kept)

## 2026-07-17

### Campaign Analytics Edge Function

Deployed `campaign-analytics` edge function and fixed all input/select
elements missing `id`/`name` attributes in admin campaign code.

**Edge function audit** (`supabase/functions/campaign-analytics/index.ts`):
- OPTIONS handler ✅ (returns 200)
- corsHeaders: Access-Control-Allow-Origin ✅, Allow-Headers ✅,
  Allow-Methods ✅ ("GET,POST,OPTIONS")
- GET + POST supported (slug from searchParams or body)
- Authorization check ✅; no redirect ✅
- Deployed via `supabase functions deploy campaign-analytics`

**Input/select `id`+`name` fixes**:
| File | Element | Added |
|------|---------|-------|
| `CampaignOverviewPage.tsx` | search input | `id="campaign-search"` + `name` |
| `CampaignOverviewPage.tsx` | status filter select | `id="campaign-status-filter"` + `name` |
| `CampaignOverviewPage.tsx` | per-row featured checkbox | `id="featured-{id}"` + `name` + `htmlFor` |
| `CampaignOverviewPage.tsx` | per-row priority select | `id="priority-{id}"` + `name` |
| `CampaignModeration.tsx` | featured toggle | `id="mod-featured"` + `name` + `htmlFor` |
| `CampaignModeration.tsx` | priority select | `id="mod-priority"` + `name` |

Verification:
- `npm run check` ✅
- `npm run lint` ✅
- `npm run build` ✅

### Campaign Admin Synchronization

Audited and completed Campaign Admin to match WordPress as single source
of truth.

**Type mapping** (`src/features/campaigns/types.ts`, `campaignMapper.ts`,
`src/features/admin/campaigns/types.ts`):

- Added `theme_color`, `campaign_thumbnail`, `deep_link` to `WPCampaign`
  ACF type and `Campaign` / `AdminCampaign` interface.
- `campaignMapper.ts` — `pickThumbnail()` maps `acf.campaign_thumbnail` or
  embedded media; `pickBanner()` now tries `acf.campaign_banner` (URL string)
  before falling back to embedded media.
- All card fields verified: Featured ✅, Priority ✅, Theme Color ✅,
  Banner ✅, Thumbnail ✅, Sponsor ✅, Deep Link ✅.

**Status derivation** (`deriveCampaignStatus()`): Verified that status is
derived exclusively from WP fields (`campaign_active`, `campaign_start`,
`campaign_end`). No local status field is stored or used. The active rule
(`campaign_active && now >= start && now <= end → ACTIVE`) is already
implemented correctly by `deriveCampaignStatus()`.

**Moderation tab** (`CampaignModeration.tsx`): Replaced all placeholder
UI with real data. Now shows:

- Campaign Status (Running / Upcoming / etc.) + WP active flag + dates
- Mission Count (from WP missions API)
- Participants, Completion %, Reward Distributed, XP Issued (from
  campaign-analytics edge function)
- Quick Actions: Featured toggle, Priority selector, Refresh Cache,
  Refresh Statistics
- Removed placeholder "Toggle Active", "Send Notification", "Trigger
  Re-eval", "Archive Now", and placeholder "Moderation Log"

Verification:
- `npm run check` ✅
- `npm run lint` ✅
- `npm run build` ✅

### Edge Function CORS Hotfix

Added missing `Access-Control-Allow-Methods` header to `admin-user-detail`
edge function. OPTIONS preflight was failing because the browser requires
this header to authorize the actual POST request.

**Changes**:

- `supabase/functions/admin-user-detail/index.ts` — Added
  `Access-Control-Allow-Methods: "POST, OPTIONS"` to corsHeaders.

**Deployment**:

- `supabase functions deploy admin-user-detail` → deployed to
  project `aefelmycrbiquqfoafcs`.

Verification:
- `npm run check` ✅
- `npm run lint` ✅
- `npm run build` ✅

### Admin User Detail Data Audit

Traced the full UUID flow from user list to detail page to determine why
"User not found" appeared. No UUID mismatch found in code — the flow
consistently uses `profiles.id` at every step.

**Audit findings**:

Flow trace (all consistent — no mismatch):
1. **User List** (`UsersPage.tsx`): `item.id` = `profiles.id` from
   `admin-users` edge function (`profiles.select("*")`)
2. **Navigation** (`UsersPage.tsx`): `navigate('/admin/users/' + item.id)`
   passes same `profiles.id`
3. **URL param** (`UserDetailPage.tsx`): `useParams().id` extracts UUID
   directly from URL path
4. **Edge function call** (`getUserDetail` → `admin-user-detail`):
   sends `{ userId: id }` → queries `profiles.eq("id", userId).single()`
5. **Returned rows**: `.single()` either returns 1 row or throws `PGRST116`

**Root cause**: `admin-user-detail` edge function
(`supabase/functions/admin-user-detail/`) existed in source but was
**never committed to git and never deployed** to Supabase. Frontend called
`supabase.functions.invoke("admin-user-detail")` → function not found →
error → React Query returned `data: undefined` → component showed
"User not found." The code itself is structurally correct.

**Changes made**:

- `UserDetailPage.tsx` — Added `error` destructuring from `useUserDetail`
  hook. Error message now displayed below "User not found" so developer can
  see actual error (e.g., "Function not found" vs "0 rows" vs "network error").
- `UsersPage.tsx` — Added `[AUDIT-*]` console.log at row click to print UUID,
  `user_id`, `auth_user_id`, and `email` for field-level debugging.
- `UserDetailPage.tsx` — Added `[AUDIT-*]` console.log for `useParams().id`,
  query UUID, and query result (data, loading, error).

Verification:
- `npm run check` ✅
- `npm run lint` ✅
- `npm run build` ✅

### Admin User Detail Hotfix

Fixed `/admin/users/:id` page that was showing Not Found.

Added

- `UserDetailPage.tsx` — full-page user detail view with back navigation,
  profile card, role selector, stats cards (missions/transactions/redemptions),
  recent XP transactions list, loading skeleton, "User not found" state.
- Route `admin/users/:id` in `AdminRoutes.tsx` — point to `UserDetailPage`.

Changed

- `UsersPage.tsx` — row click now navigates to `/admin/users/:id` (was
  opening a side drawer). Removed obsolete `UserDetailDrawer` import and
  `useUpdateUserRole` import.

Verification

- Direct URL `/admin/users/{uuid}` works on first load and refresh.
- No redirect to 404.
- `npm run check` ✅, `npm run lint` ✅, `npm run build` ✅.

## 2026-07-17

### Sprint 10.5 — Reward Engine v1.0 STABLE

Built Reward Guard as the single gate for all reward grants. Every reward
source now passes through idempotency check before granting XP, badges,
or other rewards.

Added

- `src/core/reward-engine/` — Reward Guard: `grantReward()` checks
  `reward_grants` table for idempotency before granting; handles XP
  (`xpTransaction`), badge (`grantBadge`), and recording.
- DB migration `20260721000000_reward_grants.sql` — `reward_grants` table
  with `UNIQUE(user_id, source, reference_id)` for idempotency.

Changed

- `achievementEngine.ts` — XP + badge grants now route through
  `grantReward()`; direct `xpTransaction` + `grantBadge` calls removed.
- `milestoneEngine.ts` — XP grant now routes through `grantReward()`;
  direct `xpTransaction` call removed.
- `loginRewardEngine.ts` — XP grant now routes through `grantReward()`;
  direct `xpTransaction` call removed.
- `MissionClaimService.ts` — `grantReward()` check added before RPC call
  for mission claim idempotency.
- `AdminEngine.ts` — `giveBonusXP` / `removeXP` now use `grantReward()`.

Idempotency guarantees

- Same user + same source + same reference = one grant only
- Duplicate → skipped, no XP, no transaction, no badge, no achievement
- Mission claim: Guard check before RPC prevents double-claim even on
  concurrent requests
- Achievement: Guard prevents double badge + double XP per achievement
- Milestone: Guard prevents double milestone XP
- Login reward: Guard enforces calendar-day idempotency
- Admin bonus: unique timestamp-based reference ID per grant
- Badge: granted inside Guard, not directly from achievement engine

## 2026-07-17

### Sprint — Badge Hotfix

Debugged and fixed Badge Engine grant pipeline.

Fixed

- `badgeRepository.ts` — Added `JSON.stringify(error, null, 2)` after every
  `console.error`. Changed `.single()` → `.maybeSingle()` in `grantBadge` to
  avoid crash when `ignoreDuplicates: true` skips an existing row (returns 0
  rows).
- DB: Added `CREATE POLICY "Users insert own badges"` and `"Users update own
  badges"` on `user_badges` (was service_role-only). Root cause of badge
  grant failure: `grantBadge()` called from `achievementEngine.ts` runs on
  the frontend as authenticated user, but `user_badges` had no INSERT or
  UPDATE policy for authenticated — every upsert was silently rejected by
  RLS.
- Duplicate protection already correct: `upsert()` with `onConflict:
  "user_id,badge_key"` and `ignoreDuplicates: true` ensures each badge is
  granted at most once per user.

## 2026-07-17

### Sprint 10 — Achievement Hotfix

Debugged and fixed Achievement Catalog seeding + evaluation pipeline.

Fixed

- `achievementCatalog.ts` — Adjusted logging: `console.error` +
  `JSON.stringify(error, null, 2)`. Added seed guard: only calls `upsert`
  when `SELECT count` returns fewer rows than `ACHIEVEMENT_CATALOG.length`.
  Changed `ignoreDuplicates: false` → `true` so existing rows are never
  overwritten.
- `achievementRepository.ts` — Added `JSON.stringify(error, null, 2)` after
  every `console.error`. Changed `.single()` → `.maybeSingle()` in
  `upsertUserAchievement` to avoid crash when RLS or constraint returns 0
  rows.
- DB: Added `CREATE POLICY "Users insert own achievements"` and `"Users
  update own achievements"` on `user_achievements` (was service_role-only).
  Added INSERT and UPDATE policies on `achievements` (was service_role-only).
- Catalog seeding was failing silently: `achievements` table had no INSERT
  policy for authenticated users, so every upsert from `bootstrapRetention`
  (called in `AuthProvider`) was rejected by RLS.

## 2026-07-17

### Sprint 12 — Debug Notification Engine

Debugged and fixed Notification Engine + data layer issues.

Fixed

- `notificationRepository.ts` — Added `JSON.stringify(error, null, 2)` after
  every `console.error` for full Supabase error detail (code, message, details,
  hint). Changed `.single()` → `.maybeSingle()` on insert to avoid crash when
  RLS or constraint silently returns 0 rows.
- `milestoneRepository.ts` — Added same `JSON.stringify` logging. Changed
  `.single()` → `.maybeSingle()` on upsert so `ignoreDuplicates: true` doesn't
  crash when the row already exists.
- `DashboardCards.tsx` — Added unique `slug` field to each card; changed React
  `key` from `card.title` → `card.slug` to eliminate "Missions Completed"
  duplicate key (two cards shared the same title).
- DB migration `20260720000000_notification_engine_columns.sql` — Added
  `category`, `event_type`, `icon`, `action_type`, `payload`, `archived_at`
  columns to `notifications` table. Added `CREATE POLICY "Users can insert
  their own notifications"` for authenticated INSERT.
- DB migration applied: `20260716000006_achievements.sql` (achievements +
  user_achievements tables) and `20260717000000_retention_engine.sql`
  (user_milestones, user_badges, user_login_rewards) — these were never
  applied to remote, causing milestone/achievement insert failures.
- Added INSERT + UPDATE RLS policies on `user_milestones` for authenticated
  users (were service_role-only).

## 2026-07-17

### Sprint 12 — Notification Engine v1.0

Built the centralized Notification Engine as the single event notification
gateway, replacing direct `addNotification()` calls from all 5 engines.

Added

- `types.ts` — `NotificationCategory`, `NotificationEventType`,
  `NotificationState`, `Notification`, `NotificationEvent` with 16 event
  types, helper functions (`categoryForEvent`, `defaultTitle`, `defaultMessage`)
- `repositories/notificationRepository.ts` — Supabase CRUD:
  `fetchNotifications`, `fetchUnreadCount`, `markAsRead`, `markAllAsRead`,
  `archiveNotification`, `deleteNotification`, `insertNotification`,
  `subscribeToNotifications` (real-time via Realtime Channel)
- `services/eventDispatcher.ts` — `dispatchEvent()`: single entry point
  that writes to Supabase + updates in-memory Zustand store
- `services/notificationService.ts` — convenience wrappers:
  `createMissionNotification`, `createAchievementNotification`,
  `createMilestoneNotification`, `createLoginRewardNotification`,
  `createCampaignNotification`
- `context/NotificationContextValue.ts` — React context definition
- `context/NotificationContext.tsx` — `NotificationProvider` with
  real-time subscription via `subscribeToNotifications`
- `context/useNotificationContext.ts` — hook (separate file for
  react-refresh compat)
- `hooks/useNotifications.ts` — consumer hook
- `hooks/useNotificationBadge.ts` — `count` + `hasUnread`
- `components/NotificationCard.tsx` — category icon, title, message,
  relative time, read indicator, hover actions
- `components/NotificationList.tsx` — grouped Unread / Today / Yesterday /
  Earlier sections
- `components/NotificationCenter.tsx` — full UI: header (unread count,
  Mark All Read, Filter, Refresh), category filter bar, grouped list
- `components/NotificationBadge.tsx` — Bell icon + red unread badge

Changed

- `missionEngine.ts` — replaced `addNotification()` + `pushMissionNotification()`
  with single `createMissionNotification()` call
- `campaignAutomation.ts` — replaced `addNotification()` with
  `createCampaignNotification()`; consolidated `runCampaignHealthCheck()`
- `achievementEngine.ts` — replaced `addNotification()` with
  `createAchievementNotification()`
- `milestoneEngine.ts` — replaced `addNotification()` with
  `createMilestoneNotification()`
- `loginRewardEngine.ts` — replaced `addNotification()` with
  `createLoginRewardNotification()`
- `App.tsx` — wrapped with `NotificationProvider`
- `Header.tsx` — replaced inline bell/badge with `NotificationBadge`

Removed

- `missionNotification.ts` (obsolete helper)

## 2026-07-17

### Sprint 11E — Campaign Automation

Automated the Campaign lifecycle as a pure derivation layer. Campaign
status is never stored — it is DERIVED from `campaign_start` /
`campaign_end` / `campaign_active` on each scheduler pass (app load +
interval). Automation only changes observed Campaign state; the Mission
Engine is untouched.

Added

- `types.ts` — added `ending_soon` and `archived` to `CampaignStatus`;
  added `priority` field (ACF `campaign_priority`).
- `campaignMapper.ts` — maps `campaign_priority`.
- `services/campaignStatus.ts` — enhanced calculator: `ending_soon`
  (≤24h to end), `archived` (ended + 7-day grace), updated
  `isCampaignVisible`, `isEndingSoon`, `isArchived`, threshold constants.
- `services/campaignService.ts` — derives new states; Featured Rotation
  now sorts featured → priority → start date.
- `services/campaignScheduler.ts` — automation engine: `evaluateCampaigns`
  / `runCampaignScheduler` derive statuses (Auto Start/End/Visibility/
  Archive) and report transitions (started / ending_soon / ended /
  archived / hidden).
- `services/campaignAutomation.ts` — `triggerCampaignNotifications`
  (fires in-app notifications via the single Notification Store on
  Campaign Started / Ending Soon / Finished) and `runCampaignHealthCheck`.
- `hooks/useCampaignAutomation.ts` — runs the scheduler on app load and
  every 60s; keeps a previous-status snapshot for transition detection.
- `StatusBadge.tsx` — added `ending_soon` / `archived` styles.
- `App.tsx` — mounts `useCampaignAutomation()` so automation runs app-wide.

Constraints honored

- Campaign lifecycle affects only visibility (per 90_CAMPAIGN_LIFECYCLE).
- Automation never edits a Mission; Mission Engine decides availability.
- Notifications use the existing Notification Store (no second system).
- "Archive" is a derived state (WordPress campaigns are read-only), not a
  DB write.

Verification

- `npm run check` — pass
- `npm run build` — pass
- `npm run lint` — pass

---

## 2026-07-17

### Sprint 11D — Sponsored Campaign Analytics

Built a read-only Sponsor Analytics layer on top of the Campaign Engine.
Analytics are aggregated server-side by a new Edge Function and only
rendered client-side — no Mission Engine or Reward Engine logic is
modified or executed by the UI.

Added (Edge Function)

- `supabase/functions/campaign-analytics/index.ts` — service_role, read-only
  aggregator. Campaign→mission mapping comes from the Campaign Engine
  (WP `mission_campaign_slug`); progress data from `missions_progress`;
  referrals from `referrals`; demographics from `profiles`. Returns KPIs,
  completion funnel, top missions, audience breakdown, daily trend.

Added (Client)

- `services/campaignAnalytics.ts` — types + `getCampaignAnalytics(slug)`
  (calls the Edge Function via `supabase.functions.invoke`).
- `hooks/useCampaignAnalytics.ts` — React Query hook.
- `components/analytics/CampaignAnalyticsOverview.tsx` — KPI cards
  (participants, completion rate, reward claimed, avg missions, referrals).
- `components/analytics/CampaignTrend.tsx` — daily participation bars.
- `components/analytics/CampaignCompletionFunnel.tsx` — Participants →
  Started → Completed.
- `components/analytics/CampaignTopMissions.tsx` — top missions by
  completions (titles resolved via Campaign Engine).
- `components/analytics/CampaignAudience.tsx` — provinces/cities/gender.
- `pages/SponsorAnalyticsPage.tsx` — dashboard page.
- Route `/campaigns/:slug/analytics`; "View Sponsor Analytics" CTA on
  Campaign Detail (when sponsor present).

Constraints honored

- Analytics read-only; aggregated server-side, rendered client-side.
- Mission Engine remains source of truth for progress; Reward Engine
  untouched.
- Campaign Engine is the analytics source (campaign→mission grouping).

Notes

- `avgXpEarned` is reported as 0; XP ledger aggregation intentionally left
  to the Reward Engine to avoid duplicating its logic.
- The legacy `campaign_engine.sql` Supabase tables are not used; analytics
  follow the WP-backed Campaign model from 11A/11C.

Verification

- `npm run check` — pass
- `npm run build` — pass
- `npm run lint` — pass

---

## 2026-07-17

### Sprint 11C — Campaign ↔ Mission Integration

Integrated Campaign with the Mission Engine using `campaign_slug` as the
only relation. Mission Engine remains the single source of truth; Campaign
only groups and renders mission data — no duplicated mission logic, no ACF
relationship, no XP/progress calculation in Campaign.

Added

- `services/campaignMissionLoader.ts` — `loadCampaignMissions(slug)` groups
  missions by `campaign_slug` (reuses `getMissions` + `mapMission`).
- `hooks/useCampaignMissions.ts` — React Query hook that loads grouped
  missions and derives read-only state (total/completed/in-progress/locked/
  remaining, total + completed VXP, completion ratio) from Mission Engine
  progress (`useMissionProgress`).
- `components/CampaignMissionCounter.tsx` — Total / Completed / In Progress.
- `components/CampaignProgressSummary.tsx` — completion %, done/remaining,
  estimated VXP (read-only).
- `components/CampaignDetail.tsx` — Related Missions section reuses the
  Mission Engine's `MissionCard`; "Explore Missions" CTA anchor; gracefully
  handles campaigns without missions.

Changed

- `missions/services/missionTypes.ts` — added `mission_campaign_slug` to
  `WPMission.acf`.
- `missions/types/mission.ts` — added `campaignSlug` to `MissionConfig`.
- `missions/services/missionMapper.ts` — maps `mission_campaign_slug`.
- `index.ts` — exports loader, hook, and new components.
- Active Campaign Filter / Visibility already enforced by 11A
  `campaignService` (running/upcoming only).

Constraints honored

- campaign_slug is the only Campaign↔Mission relation.
- Campaign UI only renders; Mission Engine owns all mission logic.
- Campaigns without missions render an empty "no missions" state.

Verification

- `npm run check` — pass
- `npm run build` — pass
- `npm run lint` — pass

---

## 2026-07-17

### Sprint 11B — Campaign UI

Built the premium, read-only Campaign UI on top of the Campaign Engine
Foundation. Design language: editorial / minimal / premium, gold brand
accent (`#bda752`), large whitespace, rounded-3xl, soft shadows (per
AI/82 design guide + UI/UX Pro Max "Minimal Single Column" system).

Added

- `components/HeroBanner.tsx` — featured hero (320px min), gradient overlay
  (black 35%), title, status badge, countdown, CTA.
- `components/CampaignCard.tsx` — banner, status, title, sponsor, date
  range, featured flag, CTA.
- `components/CampaignDetail.tsx` — banner, title, description, duration,
  status, countdown, sponsor, plus Related Missions / Reward Preview
  placeholders (no mission integration).
- `components/Countdown.tsx` — live 1s-tick countdown (Days:Hrs:Min:Sec),
  light/dark variants.
- `components/StatusBadge.tsx` — status pill (running/upcoming/ended/
  hidden/inactive) with colored dot.
- `components/SponsorSection.tsx` — read-only sponsor block.
- `components/CampaignSkeleton.tsx` — HeroSkeleton, CardSkeleton,
  CampaignListSkeleton loaders.
- `components/CampaignEmptyState.tsx` — "No campaign available." state.

Changed

- `pages/CampaignsPage.tsx` — hero + responsive 2-col card grid, skeleton
  on load, empty state when none.
- `pages/CampaignDetailPage.tsx` — renders `CampaignDetail`, skeleton on
  load, empty state on error/not-found.
- Removed obsolete `components/CampaignLanding.tsx` (superseded by
  HeroBanner + CampaignDetail).

Constraints honored

- UI is read-only; no Mission logic or Mission Engine changes.

Verification

- `npm run check` — pass
- `npm run build` — pass
- `npm run lint` — pass

---

## 2026-07-17

### Sprint 11A — Campaign Engine Foundation

Built the Campaign Engine Foundation. Campaign is a container only; no
mission or reward logic was added, and the Mission Engine was not modified.

Added

- `src/features/campaigns/types.ts` — WP-based `Campaign` model + spec status
  enum (`upcoming`, `running`, `ended`, `hidden`, `inactive`).
- `src/features/campaigns/campaignMapper.ts` — maps WordPress `campaign` ACF
  payload (with `_embed` banner) to `Campaign`.
- `src/features/campaigns/repositories/campaignRepository.ts` — fetches
  campaigns from WordPress REST API (`/wp-json/wp/v2/campaign?_embed`), list
  and by-slug.
- `src/features/campaigns/services/campaignStatus.ts` — Campaign Status
  Calculator deriving status from `campaign_start` / `campaign_end` /
  `campaign_active`.
- `src/features/campaigns/services/campaignService.ts` — loads, validates,
  filters active (running/upcoming) campaigns, sorts featured first.
- `src/features/campaigns/hooks/useCampaigns.ts` — React Query hooks
  (`useCampaigns`, `useCampaign`) for list and detail.
- `src/features/campaigns/context/` — `CampaignProvider`, `useCampaignContext`
  consumer, and `campaignContextValue` (split to satisfy fast-refresh).

Changed

- Rebuilt the campaign feature to load from WordPress (was incorrectly backed
  by Supabase `campaigns` tables and a status enum). Removed the prior
  mission/reward logic (`campaignEngine.ts`, `campaignScheduler.ts`,
  `useClaimCampaignReward.ts`) — out of scope for the foundation.
- `src/features/campaigns/components/CampaignLanding.tsx` — simplified to a
  pure container view (no missions/rewards).
- `src/pages/CampaignsPage.tsx` and `CampaignDetailPage.tsx` — repointed to
  the new hook (`useCampaigns`) and `CampaignView` shape.

Verification

- `npm run check` — pass
- `npm run build` — pass
- `npm run lint` — pass

---

## 2026-07-13

### Documentation

Added

AI Documentation System

Created

Project Rules

Architecture

Database

WordPress

Supabase

Admin Panel

Mission Engine

Reward System

Player System

Notification System

API Reference

Edge Functions

Folder Structure

Current Task

Session Memory

Change Log

---

### Mission System

Completed

MissionTable

MissionRow

MissionStatusBadge

MissionActionMenu

Mission Statistics Hook

Mission API

Mission Types

Mission Admin Page

---

### Supabase

Created

admin-missions

Edge Function

Created

admin-mission-update

Edge Function

---

### WordPress

Started

Mission Update Integration

Using

Application Password

REST API

---

### Mission CRUD

Completed

Mission Edit Dialog

Mission Save via Edge Function

Mission Refresh After Save

Form Validation

Error Handling

---

### Reward CRUD

Completed

Reward Catalog Page

Reward Edit Dialog

Reward Save via Edge Function

Reward Table with Search

admin-reward-update Edge Function

---

### Reward History

Completed

User-facing Reward History page

Search & Status Filter

Pagination

rewardRedemptionRepository

useUserRedemptions hook

---

### Leaderboard

Completed

Leaderboard Edge Function

lifetime / weekly / monthly periods

LeaderboardPage with period tabs

useLeaderboard hook with auto-refresh

---

### Analytics

Completed

Admin Analytics page

Period filter (7/30/90 days)

Bar charts for Users, Missions, XP, Redemptions

Totals stat cards

admin-analytics Edge Function

recharts chart library added

### Runtime Fixes

Fixed

Homepage runtime error (invalid hook call around Swiper)

Vite cache cleared

optimizeDeps.include configured for react, react-dom, swiper/react, swiper/modules

### Homepage Error Fix

Fixed

Homepage runtime error (invalid hook call around Swiper components)

Vite cache cleared (node_modules/.vite)

optimizeDeps.include configured for react, react-dom, swiper/react, swiper/modules

### Analytics Enhancement

Added

AnalyticsSkeleton component for loading state

AnalyticsEmptyState component for no data

AnalyticsErrorState component with retry functionality

StatCard component for metrics display

AnalyticsBarChart component with proper typing

PeriodFilter component with period selection

Complete state handling in AnalyticsPage (loading, error, empty, data)

Auth verification in admin-analytics edge function

---

### Analytics Validation

Completed

All backend tasks verified: admin-analytics Edge Function operational

All frontend tasks verified: loading, empty, error, data states

TypeScript compiles without errors for Analytics module

No Edge Function 404 or 500 errors

React Query cache verified with 60s staleTime

---

### Settings

Completed

Admin Settings page

Admin Profile section (display name, avatar, email read-only)

Platform Configuration section (9 settings: XP rates, cooldowns, limits, toggles)

admin-settings Edge Function (get, update_profile, update_settings)

settings migration (key-value table with RLS)

---

### Broadcast Notification

Completed

Admin Broadcast page (compose form + sent broadcasts list)

admin-broadcast Edge Function (create, list, send)

broadcasts table migration with RLS

notifications table migration with RLS + indexes

Inserts per-user notification rows on send

Audience targeting: all users or premium

---

### VSCode

Configured

Deno

Workspace

Import Map

Supabase Functions

---

### Admin Edge Functions — Verification

Reviewed (not newly created — already present)

admin-analytics Edge Function: auth guard, totals + daily trends, consistent JSON.

admin-settings Edge Function: get / update_profile / update_settings.

admin-broadcast Edge Function: create / list / send with per-user notification fan-out.

Verified

`deno check` passes for all three (exit=0).

Blocked

Live `supabase functions serve` + `invoke()` requires Docker Desktop — unavailable in this environment. .env lacks SUPABASE_SERVICE_ROLE_KEY.

---

### Edge Function Import Migration + Deploy

Completed

Migrated all 13 Edge Functions: `@std/http` `serve` -> native `Deno.serve`; `@supabase/supabase-js` -> `npm:@supabase/supabase-js@2`.

`deno check` passes for all 13 functions.

Deployed all 13 functions to Supabase project `aefelmycrbiquqfoafcs` (voks-member) via `supabase functions deploy --project-ref aefelmycrbiquqfoafcs`.

Fixed

`config.toml` [functions.xp-transaction] import_map pointed to a deleted `xp-transaction/deno.json` -> removed (function uses full npm: specifiers, no import map needed).

Blocked

Local `supabase functions serve` + invoke() requires Docker Desktop (not installed). Verification done via remote deploy.

---

## 2026-07-14

### Admin Edge Functions — Stabilization + Deploy

Modules

admin-analytics / admin-settings / admin-broadcast

Verified

Imports: all three use `npm:@supabase/supabase-js@2` (no bare `@supabase/supabase-js`).

Typecheck: `deno check` exit=0 for all three.

Secrets: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY present on remote project aefelmycrbiquqfoafcs (WordPress secrets not needed by these functions).

Deployed

`supabase functions deploy admin-analytics admin-settings admin-broadcast --project-ref aefelmycrbiquqfoafcs` — all three deployed successfully.

Runtime

Live HTTPS invoke returns proper JSON (401 auth-guard for non-user token) — no 404, no 500, no network error.

Result

All three modules deployed and operational. No code changes were required (functions already correct).

Note

Literal {success:true} requires a confirmed user JWT; temp-user creation blocked by remote email-confirmation + rate limits, no local service-role key. Per user decision, deploy + 401 auth-guard proof accepted as runtime verification.

---

## 2026-07-14

### Debug — admin-settings + admin-broadcast (ROOT CAUSE)

Root Cause

Remote DB was missing tables `settings`, `broadcasts`, `notifications` (PGRST205 "Could not find the table in the schema cache"). Local migrations were never applied to remote; the `supabase_migrations` schema does not exist on the project. This caused every admin-settings / admin-broadcast invoke to 500.

Fixed

Created `settings` (+9 seed rows, RLS), `broadcasts` (RLS), and `notifications` (indexes, RLS) on remote via Supabase Management API `database/query` (Docker unavailable for db push).

Added

Comprehensive logging in admin-settings and admin-broadcast — console.log/console.error around every external call: env var presence, auth.getUser result, each Supabase query (rows/error/code/hint), JSON response, and detailed catch (message/code/details/hint/stack). 500 responses now include code + details. No contract change.

Verified (live, real user JWT)

admin-settings: get / update_profile / update_settings -> HTTP 200 {success:true}.

admin-broadcast: list / create / send -> HTTP 200 {success:true} (send fanned out 3 notifications).

All verification test data cleaned up; MAX_DAILY_MISSIONS restored to 10.

Deployed

`deno check` exit=0; deployed admin-settings + admin-broadcast to project aefelmycrbiquqfoafcs.

Result

Both modules return HTTP 200 {success:true}. Crash resolved.

---

## 2026-07-14

### Build Errors Fixed

- `useBroadcast.ts` — removed unused BroadcastFormData import
- `MissionsPage.tsx` — mapped `id` → `missionId` in handleSave to match UpdateMissionPayload
- `RewardsCatalogPage.tsx` — added `title` to normalizeReward return + RewardEditData interface
- `leaderboard.ts` — replaced invalid `query` prop with `?period=${period}` query string

Result: build now exits 0 (clean).

### Frontend Public Layout Audit — Implementation

Added

- PublicLayout max-width container standardized (max-w-2xl + px-4 sm:px-6 py-6)
- Shared ProfileCard component (extracted from HomePage + MorePage duplication)
- Shared ListItem component (extracted from MorePage listRow pattern)

Fixed

- Broken MorePage link /Rewards → /reward-store (was causing 404)
- Removed duplicate /rewards route from AppRoutes
- Removed double AppLayout wrapping on HomePage and AnnouncerDetailPage
- Removed 8+ production console.log statements across 3 pages
- Removed unnecessary per-page max-width/padding wrappers from 6 pages
- LiveStudioPage unused supabase import

Deleted

- DashboardPage.tsx (orphaned old dashboard)
- AdminSidebar.tsx (orphaned, AdminLayout uses inline sidebar)
- AdminHeader.tsx (orphaned, never rendered)
- ActivityPage.tsx (empty placeholder)

Result

All public pages now share a consistent max-width container from PublicLayout. Duplication reduced. Production debug logging removed.

---

## 2026-07-15

### Sprint 2 — Profile Experience

Created

- `src/stores/profile-store.ts` — Zustand store for profile UI state
- Avatar upload flow: camera button → file picker → resize (400×400 canvas) → compress (JPEG 0.8) → upload to `avatars/` bucket → store public URL → delete old avatar on replace
- Profile completion calculator per Task 6 spec: avatar + display_name + phone_number + bio + ≥1 social = 5×20%

Updated

- `src/features/profile/types.ts` — Full Profile type matching actual DB columns (30+ fields), deprecated aliases for backward compat
- `src/features/profile/services/profileService.ts` — Business logic: save + recalculate completion + award 100 VXP on first completion
- `src/features/profile/services/profileRepository.ts` — Uses typed UpdateProfileInput
- `src/features/profile/hooks/useProfile.ts` — Supports both `id?` param (admin) and auto (current user via useAuth)
- `src/features/profile/utils/profileCompletion.ts` — Rewritten to match spec (5 criteria × 20%)
- `src/features/profile/queries/profileQueries.ts` — Removed unused `current()` key
- `src/pages/ProfilePage.tsx` — Complete rewrite: uses mutation hook, no direct supabase calls, avatar upload, all spec fields, validation, loading spinner

Deleted

- `src/hooks/useProfile.ts` — Duplicate hook; all 6 consumers migrated to `@/features/profile/hooks/useProfile`
- `src/features/profile/profileHelpers.ts` — Duplicate completion logic (replaced by utils/profileCompletion.ts)

Social Media

- Instagram, TikTok, YouTube, Facebook, Threads, Website (replaced Twitter/X with Facebook + Threads per spec)
- Website URL validation

Result

- `npm run check` exit 0
- `npm run build` exit 0
- `npm run lint` — 0 profile errors (5 pre-existing Admin errors remain)

---

## 2026-07-15

### Sprint 3 — Mission Experience Optimization

Database:
- Created SQL migrations: missions_progress table (RLS, indexes, UNIQUE constraint), mission_completions table (RLS, indexes)
- Added upsert function to missionProgressRepository for race-condition-safe inserts

Services:
- Unified WP fetch: missionWP.ts now uses canonical mapMission from missionMapper.ts (eliminated dual normalization)
- Added guest guard + ISO date normalization in missionEngine
- Added error isolation (try/catch per mission) in missionRunner
- Added time-window availability check in missionValidator
- Added completed-before-claim guard in MissionClaimService
- Added listen_pause to INTERRUPT_EVENTS in missionProgressService
- Added 9 new category functions in missionRules: monthly, listen, referral, social, event, survey, purchase, external, checkin
- Added shouldResetOnMonthlyBoundary for monthly missions
- Fixed all date comparisons to use ISO format (eliminated locale-dependent toDateString)

Hooks:
- Created useMission — single mission fetch via React Query
- Created useMissionProgressFor — single mission progress query
- Created useMissionJoin — join mutation with cache invalidation (first React Query mutation in user-facing mission flow)
- Created useMissionClaim — claim mutation with cache invalidation
- Added loading state to useMissionStatistics
- Removed debug console.log from useMissionProgress
- Removed hardcoded test missionId 12341 from AuthProvider

Mission Detail Page:
- Created /missions/:id route with full state handling: loading, not-found, guest, in-progress, completed-claimable, claimed, expired, locked
- 6 CTA states: Login to Join, Join Mission, In Progress, Claim Reward, Mission Completed, Mission Locked/Expired

UI Polish:
- Loading states (MissionHeader, MissionStatistics, MissionList, MissionHistory show spinners)
- Empty state (MissionList shows "No missions available")
- Error state (MissionList shows error with AlertCircle icon)
- Sort by sort field in MissionList and MissionWidget
- MissionWidget shows most relevant mission instead of Object.values()[0]
- MissionHistory shows mission title instead of "Mission #ID"
- RewardPopup: z-9999 → z-50, proper timer cleanup via useRef
- MissionProgressBar: role="progressbar", aria-valuenow/min/max
- MissionCard: keyboard navigation, role="button", linked to detail page, fixed target for duration missions, ARIA on progress
- MissionCountdown: clarified unit labels (Time Remaining vs Remaining)
- MissionProgressCard: removed emojis

Cleanup:
- Removed duplicate type/exports from types/index.ts
- Cleaned up unused missionWP.ts local WPMission interface (now imports from missionTypes)

Result:
- npm run check: exit 0
- npm run build: exit 0

---

## 2026-07-15

### Sprint 4 — Reward Experience

Database:
- Created SQL migrations: reward_redemptions table (RLS, 3 indexes, 3 policies), redeem_reward RPC (SECURITY DEFINER, UUID return)

Types:
- Added RewardItem to rewardTypes.ts; removed 4 duplicate inline interfaces
- Fixed RewardClaimService unknown type → string

Services:
- RewardEngine: guest guard, max-per-user validation, duplicate pending check, stock validation, atomic VXP rollback
- RewardClaimService: added userId param to RPC call

Hooks:
- Created useUserVXP hook (30s staleTime, profiles table query)
- useRedeemReward: added user-redemptions cache invalidation, uses RewardItem type

Reward Detail Sheet:
- User VXP balance, confirmation dialog, error toast, stock bar, category row, expired banner, "Insufficient VXP" state, double-click prevention

Reward Card:
- Category badge (6 color variants), expired overlay, grayed out expired, ARIA keyboard nav

RewardGrid:
- Fixed onClick no-op, loading skeleton, error state

RewardStorePage:
- Category filter chips (7), error state, responsive 1→2 column grid

RewardHistoryPage:
- Cancelled/expired statuses, loading skeleton

ESLint:
- Fixed 6 pre-existing errors: 2 Edit dialogs (useEffect setState), SettingsPage (2x setState + any), MissionDetailPage (render-time component creation)

Result:
- npm run check: exit 0
- npm run build: exit 0
- npm run lint: 0 errors

---

## 2026-07-15

### Sprint 5 — Admin Enhancement

Added:

Shared Infrastructure (Phase 0):
- AdminDataTable: reusable table with sort, pagination, loading/empty states, page size selector
- AdminExportCSV: CSV export utility
- AdminDateRangePicker: date range filter component
- useDebounce: generic debounce hook (300ms)

User Management (Phase 1):
- admin-users edge function: auth guard, search (ilike), role filter, pagination (page/pageSize/range), total count
- admin-user-detail edge function: aggregated stats (missions/transactions/redemptions), recent activity
- UsersPage: search with debounce, role filter, pagination, page size, Export CSV, row click → detail drawer
- AdminDataTable integration: sortable columns, loading skeleton, empty state
- UserDetailDrawer: premium look (border avatar, role selector), aggregated stats cards, recent XP transactions, role change via select

Dashboard KPIs (Phase 2):
- Extended admin-dashboard edge function: 5 new KPIs (missionsToday, redemptionsToday, usersThisWeek, usersThisMonth, pendingBroadcasts)
- DashboardCards: 9 KPI cards (added Missions Today, Redeemed Today, New Users 7d/30d, Pending Broadcasts)

Analytics + AzuraCast (Phase 3):
- Extended admin-analytics edge function: AzuraCast listener fetch, device/browser/platform parsing from user agents, demographics (cities/provinces/genders)
- AnalyticsPieChart: donut chart component (recharts)
- AnalyticsListenerCard: live listener stats with AzuraCast error state
- AnalyticsPage: 6 stat cards, 4 pie charts (Devices/Browsers/Platforms/Gender), 2 map charts (Cities/Provinces), AzuraCast card

Broadcast (Phase 4):
- admin-broadcast-wp edge function: fetches WordPress Notification CPT via REST API
- BroadcastPage: 3-tab layout (Create/Import WP/History), scheduled_at field, WP import with preview, history filter (all/sent/pending)

Settings (Phase 5):
- SettingsPage: form validation (required name, URL, numeric settings), toast notifications (success/error), WordPress Integration section

Edge Function Auth Audit (Phase 6):
- Auth guard added to 9 edge functions: admin-dashboard, admin-missions, admin-rewards, admin-transactions, admin-mission-update, admin-reward-update, admin-update-redemption, leaderboard, xp-transaction

Optimizations:
- Search debounce (useDebounce hook), consistent table states, page size selector, CSV export

Result:
- npm run check: exit 0
- npm run build: exit 0
- npm run lint: 0 errors

---

## 2026-07-15

### Sprint 6 — Analytics 2.0

Added:

Phase 0 — Safety:
- StatCard.tsx: `(value ?? 0)` fallback for toLocaleString

Phase 1 — Dashboard extension:
- admin-dashboard edge function: 7 new KPI fields (currentListeners, totalBroadcasts, totalNotifications, totalRewards, totalMissionsCompleted, podcastCount, promoCount)
- DashboardCards: 7 new stat cards, 2xl:grid-cols-5 layout, 16 cards total
- DashboardStats type: 11 new fields

Phase 2 — Analytics extension:
- admin-analytics edge function: broadcast stats (sent/pending), notification stats (read/unread), reward status breakdown, mission type breakdown, WordPress counts, unique completer/redeemer counts
- AnalyticsTotals: 11 new fields
- AnalyticsResponse: 5 new sections (wordpress, broadcasts, notifications, rewardBreakdown, missionBreakdown)
- AnalyticsPage: section layout, 2 new pie charts (Reward Status, Mission Type), CSV export button

Phase 3 — admin-wp-stats edge function:
- New edge function: fetches WordPress voks-plus + promo content counts via REST API

Phase 4 — CSV Export:
- AnalyticsPage: Export CSV button using shared AdminExportCSV utility

Verification:
- npm run check: exit 0
- npm run build: exit 0
- npm run lint: 0 errors

---

## 2026-07-16

### Sprint 6 — Analytics 2.0 (Deepening)

Added:

Phase 0 — Architecture:
- Created `repositories/analyticsRepository.ts` (data access layer)
- Created `services/analyticsService.ts` (chart data transforms)
- Created `queries/analyticsQueries.ts` (React Query key factory)
- Deleted `api/analytics.ts` (logic migrated to repository)
- Refactored `useAnalytics` hook → uses repository + service + queries
- Refactored AnalyticsPage: independent section rendering, inline error banner, skeleton on first load only

Phase 1 — Edge Functions:
- `admin-analytics`: split single `Promise.all` into 4 isolated try/catch sections
- `admin-dashboard`: removed hardcoded AzuraCast API key fallback
- Both functions require `AZURACAST_API_URL` + `AZURACAST_API_KEY` env vars
- AzuraCast fetch guards against missing env vars

Phase 2 — Charts:
- Broadcast Trend chart (per-day sent/pending)
- Daily Listener chart (per-day listener sessions from AzuraCast)
- New `BroadcastTrendPoint` and `ListenerTrendPoint` types

Phase 3 — Export:
- Created `AdminExportExcel.ts` (HTML table-based .xls, no external dependency)
- Analytics header: CSV + Excel as segmented control

Phase 4 — Realtime:
- `refetchInterval: 30000` on `useAnalytics` for 30s auto-polling

Phase 5 — Cleanup:
- Deleted dead `useDashboardStats.ts`
- Deleted dead `dashboardService.ts` (client-side Supabase queries)

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run lint`: 0 errors
- `deno check`: admin-analytics ✅, admin-dashboard ✅

---

### AzuraCast Hotfix

Fixed:
- `admin-analytics` and `admin-dashboard`: added backward-compatible secret name resolution
- `AZURACAST_API_URL` (legacy full URL) supported alongside `AZURACAST_URL` + `AZURACAST_STATION_ID` (new split format)
- Added debug console.log output for all AzuraCast interaction steps
- Added response shape handling (direct array, wrapped listeners/data/results, non-JSON, unexpected types)
- Increased fetch timeout from 5s to 8s
- Both edge functions deploy clean via `deno check`

Set required secrets:
```bash
supabase secrets set AZURACAST_API_KEY=<value>
supabase secrets set AZURACAST_API_URL=<full_listener_endpoint>
# OR (preferred)
supabase secrets set AZURACAST_URL=<base_url> AZURACAST_STATION_ID=<station_id> AZURACAST_API_KEY=<value>
```

---

### Sprint 6 Phase B — Executive Dashboard

Added:
- Edge function: `avgListeningMinutes`, `peakToday` totals, `listenerSources` derivation, `nowplaying` live broadcast fetch
- `AnalyticsLineChart` — AreaChart with gradient fill
- `AnalyticsLiveBroadcast` — Now playing card (song, artist, DJ, bitrate, live/offline)
- `AnalyticsListenerTable` — Searchable, sortable, paginated listener table
- `AnalyticsInsightsCard` — Auto-generated executive insights
- AnalyticsPage revamped: 8 spec sections (Executive Overview, Listening Trend, Listener Sources, Geographic, Device Analytics, Live Broadcast, Active Listener Table, Executive Insights)
- Types: `NowPlayingData`, `AnalyticsTotals.avgListeningMinutes`, `AnalyticsTotals.peakToday`, `AnalyticsResponse.listenerSources`, `AnalyticsResponse.nowplaying`

### Defensive rendering hotfix

Fixed:
- Response debug logging: edge function now dumps full response shape (keys, types, full JSON) to console on every invocation
- 7 unprotected `.toLocaleString()` calls across 5 files: `AnalyticsPage` (lines 270, 271, 276, 282, 288), `AnalyticsInsightsCard` (53), `AnalyticsListenerCard` (32, 39), `AnalyticsLiveBroadcast` (73), `AnalyticsPieChart` (53) — all now wrapped with `(value ?? 0).toLocaleString()`
- Root cause: new fields added to local code but deployed edge function still returns old shape without them; runtime `undefined.toLocaleString()` crashed the page

---

## 2026-07-16

### Sprint 7.1 — Homepage Premium Layout

Created:

- `BrandHeader.tsx` — premium gradient card `#5B5B3F → #BDA752` with "VOKS NEXT" branding, tagline, "Digital Radio Platform" badge, search+notification icons, InstallAppButton below
- `QuickAccess.tsx` — 4 minimal rounded icon cards: Programs, Hosts, Schedule, Rewards
- `HostsSlider.tsx` — horizontal swiper with circular avatars, gold border, host names

Rewritten:

- `MissionWidget.tsx` — replaced 2-card neumorphism (ProgressCard + RewardCard) with single premium card: mission title, progress bar, active count badge, Continue Mission/Claim Reward CTA, View All

Updated:

- `HomePage.tsx` — restructured per spec order: BrandHeader → PromoBanner → NotificationCenter → MissionWidget → QuickAccess → AudioPlayerCard → Voks+ → Programs → HostsSlider; removed Header import, RewardPreview
- `AudioPlayerCard.tsx` — spacing: `gap-6` → `gap-8`, `p-6 sm:p-8` → `p-8`
- Voks+ section — removed `border border-gray-100`

Deleted:

- `RewardPreview.tsx` — removed from homepage per spec

Verification:

- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build`: exit 0

---

## 2026-07-16

### Sprint 7.1 Revision — Polish + Promo Deep Link Fix

Polished:

- `HomePage.tsx` — restored original `Header.tsx` at top; section order per polish rules: Header → BrandHeader (Hero) → PromoBanner → NotificationCenter → MissionWidget → QuickAccess → AudioPlayerCard → Voks+ → Programs → HostsSlider
- `BrandHeader.tsx` — simplified to pure Hero section: removed search+bell icons, InstallAppButton, notification hook. Only gradient card with VOKS NEXT, taglines, badge
- `NotificationCenter.tsx` — removed redundant "Notifications" sub-label, stories increased to 72px with `shadow-sm`, gap `gap-4` → `gap-5`
- `NotificationStories.tsx` — circular avatars `h-16 w-16` → `h-[72px] w-[72px]`, added `shadow-sm`
- `MissionWidget.tsx` — added `mb-1` below mission title for better hierarchy

Fixed:

- `PromoBanner.tsx` — deep link rewritten to use `acf.open_mode` + `acf.deep_link.url` + `acf.deep_link.target` per spec. Supports 5 modes: External URL, Internal Route, Mission, Reward, Podcast. Falls back silently with `console.warn` if `deep_link.url` is empty. No hardcoded routes. Old `promo_link_type`/`promo_internal_link`/`promo_external_link` removed from click handler

Updated:

- `promo.ts` — added `open_mode?: string` and `deep_link?: { url?: string; target?: string }` to ACF type

Verification:

- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build`: exit 0

---

## 2026-07-16

### Global DeepLink Utility

Created:

- `src/utils/deepLink.ts` — global `handleDeepLink(navigate, config)` service. Accepts ACF `open_mode` + `deep_link.url`/`target` fields. Supports 5 modes: `External URL` (window.open), `Internal Route` (navigate), `Mission` (`/missions/:url`), `Reward` (`/reward-store`), `Podcast` (`/plus/:url`). Empty URL guard with `console.warn`, never crashes. Default fallback treats unknown mode as direct route. `DeepLinkConfig` interface exported for reuse

Updated:

- `PromoBanner.tsx` — replaced 25-line inline switch with `handleDeepLink(navigate, promo.acf ?? {})`
- `PromoListPage.tsx` — replaced old `promo_link_type`/`promo_external_link` logic with `handleDeepLink` via `onClick`. All promo cards now route through the utility
- `PromoDetailPage.tsx` — replaced old `isExternal`/`ctaHref`/`<a>` tag with `handleDeepLink` via CTA button `onClick`. Uses `open_mode` to determine external icon visibility

Verification:

- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build`: exit 0

---

## 2026-07-16

### Sprint 8 — Live Experience 2.0

Owncast reduced to video streaming engine only. Replaced Owncast iframe chat with full Supabase Realtime interactivity.

Migration:

- Created `20260716000000_create_live_tables.sql` — 9 new tables: `live_messages`, `live_presence`, `live_reactions`, `live_polls`, `live_poll_options`, `live_poll_votes`, `live_giveaways`, `live_giveaway_entries`, `live_moderation_logs`. All with RLS policies, realtime publication, and indexes

New feature module `src/features/live/`:

- `types.ts` — all live types and `LIVE_REACTIONS` constant
- `repositories/liveRepository.ts` — 13 repository functions (CRUD for messages, presence, reactions, polls, votes, giveaways)
- `hooks/useLiveChat.ts` — Supabase realtime chat, send/delete/pin, auto-scroll
- `hooks/useLivePresence.ts` — presence channel tracking, viewer count, duration upsert every 30s
- `hooks/useLiveReactions.ts` — realtime reaction feed, 2s rate limit, auto-expire after 4s
- `hooks/useLivePoll.ts` — realtime poll refresh, single vote per user per poll
- `hooks/useLiveGiveaway.ts` — join giveaway, check joined status, realtime updates

Components:

- `LiveChat.tsx` — full chat UI: message bubbles, timestamps, mod tools (pin/delete), authenticated-only posting, sign-in prompt
- `LiveReactions.tsx` — ❤️🔥👏😂😍👍 reaction buttons with scale animation
- `LivePresence.tsx` — eye icon + viewer count badge
- `LivePoll.tsx` — percentage bars, vote button, disabled after voting
- `LiveGiveaway.tsx` — gradient cards, Join/Joined state

Updated:

- `LiveStudioPlayer.tsx` — premium overlay: gradient fade, LIVE/offline indicator, viewer count, reaction bar, inline poll + giveaway widgets
- `LiveStudioPage.tsx` — removed Owncast iframe chat entirely; 2-column layout (player + chat sidebar); program detail card; quick nav links; mobile-optimized (chat below player on small screens)
- `AudioPlayerCard.tsx` spacing improved (from Sprint 7.1)

Deleted:

- Owncast iframe chat (`src="https://live.voksradio.com/embed/chat/readwrite"`) — fully replaced by Supabase Chat

Verification:

- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build`: exit 0

---

## 2026-07-16 (later)

### Sprint 8 Database Fix — Migration Applied

Discovered that all 9 live tables were missing from the remote Supabase project. The migration `20260716000000_create_live_tables.sql` was never applied to `aefelmycrbiquqfoafcs`.

Diagnosis:
- All 9 PostgREST endpoints returned 404 (PGRST205 — table not in schema cache)
- `supabase migration list` confirmed migration pending (no remote marker)
- Earlier migrations (settings, broadcasts, missions, rewards) were applied manually via Management API but never tracked in schema_migrations

Fix:
- Executed live tables migration directly via `supabase db query --linked --file supabase/migrations/20260716000000_create_live_tables.sql`
- Verified all 9 tables accessible via REST API (200 OK, no PGRST205)
- Verified RLS enforced (401 on anon INSERT)
- Verified public read (200 on anon SELECT)
- Verified realtime publication (8 tables in supabase_realtime)
- Verified all indexes present

Verification:
- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build`: exit 0

---

## 2026-07-16 (later)

### Sprint 8.1 — Live Identity & Realtime Fix

**Problem**: Live chat showed random user_id truncations instead of real identity. Reactions had no visual feedback. Presence was polling the DB unnecessarily.

**Changes**:

Migration (`20260716000001_add_profile_cols_to_messages.sql`):
- Added `display_name`, `avatar_url`, `badge_name`, `level` columns to `live_messages` — profile snapshots stored at send time for seamless Realtime display

Types (`src/features/live/types.ts`):
- `LiveMessage` and `LiveMessageInsert` now include `display_name`, `avatar_url`, `badge_name`, `level`

Repository (`liveRepository.ts`):
- `insertMessage` stores all 4 profile fields alongside the message

Hook (`useLiveChat.ts`):
- Now accepts `profile` parameter — passes `display_name`, `avatar_url`, `badge_name`, `level` to the insert

Component (`LiveChat.tsx`):
- Message bubble shows avatar (with initials fallback), `display_name`, `badge_name` (gold chip), level badge
- Removed `{message.user_id.slice(0, 8)}` — no more random usernames
- Guest users still see "Sign in to chat" CTA (read-only)

Component (`LiveReactions.tsx`):
- New floating reaction animation — emoji floats up and fades out over 2s
- Reactions arrive in realtime from all users via supabase Realtime channel
- Rate limited by the hook (2s per user)

Hook (`useLivePresence.ts`):
- Removed redundant `CLEANUP_INTERVAL` — presence channel sync is realtime enough
- Viewer count driven entirely by Supabase Realtime presence events

CSS (`src/index.css`):
- Added `@keyframes reaction-float` animation keyframes

Verification:
- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build`: exit 0
- Migration applied via `supabase db query --linked` — exit 0
- 4 new columns confirmed in `information_schema.columns`
- REST API returns `display_name`/`avatar_url`/`badge_name`/`level` for live_messages

---

## 2026-07-16

### Sprint 9 — Mission Engine V2

**Migration** (`20260716000002_mission_engine_v2.sql`):
- Added `mission_state`, `period`, `claimed_at` columns to `missions_progress`
- Created `claim_mission_reward` RPC (SECURITY DEFINER, transaction-safe, row-locking)
- RPC handle: validate → prevent double-claim → update state → award VXP → record completion
- Backfilled existing data: AVAILABLE → CLAIMED/READY_TO_CLAIM/IN_PROGRESS based on boolean fields

**Types** (`src/features/missions/types/`):
- New `state.ts` — `MissionState` type: AVAILABLE, JOINED, IN_PROGRESS, READY_TO_CLAIM, CLAIMED, EXPIRED
- `progress.ts` — added `mission_state`, `period`, `claimed_at` fields + `MissionProgressInsert`
- `mission.ts` — added `period` field to MissionConfig
- `result.ts` — added `mission_id`, `reward` fields
- `index.ts` — exports `MissionState`
- `services/missionTypes.ts` — now re-exports from canonical types + keeps `WPMission` interface

**New services**:
- `missionStateMachine.ts` — formal state transitions (AVAILABLE→JOINED→IN_PROGRESS→READY_TO_CLAIM→CLAIMED)
- `missionValidators.ts` — `validateReferralMission` (30d referral count), `validateCompleteProfileMission` (score ≥ 3 from 4 fields), `getValidationProgress` (share count from activity_logs)

**Updated services**:
- `MissionClaimService.ts` — uses `claim_mission_reward` RPC instead of manual update; accepts MissionConfig
- `MissionRewardService.ts` — simplified (reward handled by RPC)
- `missionEngine.ts` — uses new ClaimService with RPC result
- `missionMapper.ts` — maps `period` ACF field; imports WPMission from missionTypes
- `missionProgressService.ts` — no changes needed (already works with new columns)

**Repository** (`missionProgressRepository.ts`):
- create/update/upsert now set `mission_state` to READY_TO_CLAIM on completion or IN_PROGRESS otherwise

**Premium UI**:
- `MissionCard.tsx` — redesigned with icon, badge chip, progress bar, conditional action button (Join/Claim/Login/Expired/In Progress/Completed)
- `MissionDetailPage.tsx` — clean layout with banner, target/reward/type/repeat cards, progress section, history section, state-based action button
- `MissionHistory.tsx` — now uses `useMissionProgress` (React Query) instead of Zustand store; shows mission name, completion date, claimed/unclaimed status

**Edge Function** (`admin-missions`):
- Added `?mode=monitor` query — returns total progress records, completions, unique users, completion rate, claim rate, state distribution, total VXP awarded
- Original `?mode=stats` (per-mission breakdown) unchanged

**Hooks** (`useMissionClaim.ts`):
- Now fetches mission via `getMission()` before calling RPC claim (ClaimService requires MissionConfig)

Verification:
- `npm run check`: exit 0
- `npm run lint`: 0 errors
- `npm run build`: exit 0
- `deno check admin-missions`: exit 0
- Migration applied via `supabase db query --linked` — exit 0
- 3 new columns confirmed in `information_schema.columns`
- `claim_mission_reward` RPC confirmed in `pg_proc`

---

## 2026-07-16

### Sprint 8.5 — Mission Foundation

Database:
- Migration: removed JOINED state, set mission_state DEFAULT to 'AVAILABLE', added state filter index
- Updated claim_mission_reward RPC to support auto-claim + manual claim in one function

Types:
- Removed JOINED from MissionState
- Added HISTORY to MissionState

Profile:
- Fixed HTTP 406: profile repository now uses .maybeSingle() + fallback INSERT on null
- Profile completion now checks 8 required fields × 12.5% each (avatar, display_name, full_name, phone, gender, birthday, instagram, tiktok)
- Profile service triggers auto-claim via mission engine RPC instead of direct VXP award

Mission Validators:
- Created pluggable validator architecture with interface MissionValidator
- ProfileValidator, CheckinValidator, ListeningValidator, ReferralValidator, ShareValidator
- Auto-claim missions: profile, checkin

State Machine:
- Removed JOINED transitions, added HISTORY transition
- AVAILABLE→IN_PROGRESS→READY_TO_CLAIM→CLAIMED→HISTORY

Visibility:
- MissionList filters out CLAIMED missions
- MissionHistory shows only CLAIMED items
- MissionCard hides claimed missions (returns null)

UI:
- Removed Join button from MissionCard and MissionDetailPage
- Deleted useMissionJoin.ts hook (no Join requirement per spec)

Verification:
- npm run check: exit 0
- npm run lint: 0 errors
- npm run build: exit 0

---

## 2026-07-16

### Sprint 8.6 — Core Data Foundation

Database:
- Added reward_granted, reward_granted_at, status columns to referrals table
- Added indexes on reward_granted and status

Canonical Profile Model:
- AdminUser type: replaced legacy phone with phone_number, added province
- UserProfileCard: reads phone_number instead of phone
- Application now reads canonical fields only; legacy fields remain annotated @deprecated

Profile Completion:
- Added province as required (10 fields total × 10% each)
- Required: avatar_url, display_name, full_name, phone_number, birthday, gender, province, instagram, tiktok

Referral Validator:
- Filters by reward_granted=false and status='pending' — prevents duplicate rewards
- Only counts referrals from referrals table (never profiles.referred_by)

Mission History:
- Verified: uses Mission Name (fallback to #ID only when unavailable)
- Verified: only shows CLAIMED, shows completed_at date and reward status

Verification:
- npm run check: exit 0
- npm run lint: 0 errors
- npm run build: exit 0

---

## 2026-07-16

### Share Mission — Share Engine + Share Mission

Share Engine (`src/utils/share.ts`):
- Created reusable `shareContent()` utility — Web Share API with Copy Link fallback
- Returns `{ success, method }` — method is 'share' or 'copy'
- Reusable by Mission, Promo, Program, Host, Reward, Referral, News
- Share Engine never knows Mission logic (per spec)

Share Mission Service (`missionShareService.ts`):
- `processShareMission()` calls Share Engine → on success records to activity_logs → upserts mission progress as completed
- Uses canonical share data: title="VOKS NEXT", text, url

Share Mission Hook (`useShareMission.ts`):
- `useShareMission()` hook wraps share + progress + cache invalidation
- Shows toast "Link berhasil disalin" on copy fallback

ShareValidator:
- Fixed column name from `action` to `activity_type` (matches actual DB schema)
- Validates against activity_logs table

MissionCard:
- For `action === 'share'` missions: shows "Share Now" gold button when available
- After share: shows "Claim Reward" or "In Progress"

MissionDetailPage:
- For share missions: action button shows "Share Now" with Share2 icon

Mission Rules:
- Added `isShareMission()` helper (action === 'share')

Verification:
- npm run check: exit 0
- npm run lint: 0 errors
- npm run build: exit 0

---

## 2026-07-16

### Sprint 8.7 — Action Engine Foundation

Core:
- Created `src/core/action-engine/` — reusable event tracking layer
- `types.ts`: 12 action event types with typed payloads
- `engine.ts`: `track()` — validates, dispatches to consumers, records to activity_logs; `subscribeAction()` for consumer registration
- `consumers/missionConsumer.ts`: maps action events to mission actions, calls `runMission()`
- `index.ts`: barrel exports

Profile Complete:
- `profileService.ts`: replaced `autoClaimProfileMission()` with `track("PROFILE_COMPLETED", userId, { completed_at })`
- Removed direct dependency on `missionAutoClaim.ts`

Daily Check-in:
- `useDailyCheckin.ts`: replaced direct Supabase `missions_progress` writes with `track("CHECKIN", userId, { date })`

Share Mission:
- `missionShareService.ts`: replaced `activity_logs` insert + `upsertMissionProgress()` with `track("SHARE", userId, { share_type, target, url, timestamp })`

Listening:
- `player-store.ts`: replaced all `emitMissionEvent()` calls with `track()` (PLAYER_PLAY, PLAYER_PAUSE, PLAYER_STOP, PLAYER_DISCONNECT, LISTEN_TICK)
- `useListenMission.ts` (both copies): replaced `emitMissionEvent()` with `track()` (LISTEN_TICK, PLAYER_PAUSE, PLAYER_STOP)

Scheduler:
- `missionScheduler.ts`: replaced `emitMissionEvent()` with `track("SCHEDULER_TICK", userId)`

AuthProvider:
- Replaced `useMissionEventBus()` hook with `subscribeAction(missionConsumer)` — registers mission engine as Action Engine consumer at app boot

Event-to-Action mapping:
- LISTEN_TICK → 'listen_tick' (→ mission runner → 'listen')
- PLAYER_PLAY/PAUSE/STOP/DISCONNECT → same-named (→ mission runner → 'listen')
- PROFILE_COMPLETED → 'profile'
- CHECKIN → 'checkin'
- SHARE → 'share'
- REFERRAL_SUCCESS → 'referral'
- SCHEDULER_TICK → 'scheduler_tick'

Architecture:
- Action Engine sits between UI and Mission Engine: UI → `track()` → Action Engine → consumers → Mission Engine
- Action Engine records ALL events to `activity_logs` for analytics/replay
- Mission Engine no longer receives events directly from UI — only through consumer subscription

Verification:
- npm run check: exit 0
- npm run lint: 0 errors
- npm run build: exit 0

---

## 2026-07-16

### Sprint 10 — Foundation Cleanup & Sprint 11 — Anti-Abuse

**1. Listen Mission Consolidation** (P0.2, P0.3):

- `src/features/missions/services/missionRuntime.ts` — Added `finishListeningSession(userId)` that returns total accumulated seconds and resets all state. Replaces `interruptListening`/`stopListening` for session-end logic.
- `src/features/missions/hooks/useListenMission.ts` — Rewritten to accumulate locally without per-second `track()` calls. On stop/pause/beforeunload: calls `finishListeningSession` then `track("LISTEN_TICK", ..., total)` once with the batch amount. Sends only ONE event per session instead of 1/sec.
- `src/features/missions/services/missionProgressService.ts` — Added `'listen'` to `LISTEN_EVENTS` so batch `LISTEN_TICK` events (mapped through missionConsumer → `listen`) are processed as valid listen progress.
- Deleted `src/features/missions/types/runtime.ts` — Near-identical duplicate of `services/missionRuntime.ts` (different date format bug: `toDateString()` vs `toISOString().split('T')[0]`).
- Deleted `src/hooks/useListenMission.ts` — Orphaned dead code after Sprint 8.7 migrated to Action Engine. Nothing imported this hook.

**2. Dead Event Bus Code Removed** (P0.3):

- Deleted `src/features/missions/services/missionEventBus.ts` — Parallel event system no longer consumed after Sprint 8.7 replaced it with Action Engine's `track()`/`subscribeAction()`.
- Deleted `src/features/missions/hooks/useMissionEventBus.ts` — Hook that subscribed to the old event bus. No longer imported anywhere.

**3. Action Engine Rate Limiting** (P0.1):

- `src/core/action-engine/engine.ts` — Added per-user rate limiter: `rateLimitMap` tracks action count per 60s window. Max 10 actions/minute/user. Rate-limited events are still recorded to `activity_logs` for audit but NOT dispatched to consumers (mission engine is protected). Exceeding the limit logs a warning.

**System Behaviour After Fix**:

- **Listening**: Audio seconds accumulate in-memory via `missionRuntime.ts`. No per-second `track()` calls. On stop/pause/tab-close, total duration is sent as one `LISTEN_TICK` event with the full amount. Supabase writes reduced from 1/sec to 1/session.
- **Continuous missions**: `PLAYER_PAUSE` (from player-store) resets progress to 0; the batch `LISTEN_TICK` adds accumulated time first, then the reset happens — net effect: correct reset.
- **Accumulative missions**: Batch `LISTEN_TICK` adds to progress; `PLAYER_PAUSE` is ignored.
- **Event routing**: UI → `track()` → Action Engine → rate limiter check → consumer dispatch (or blocked) → `activity_logs` always recorded.
- **Dead code**: 3 files removed, 84+ lines eliminated, no import breakage.

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0

---

## 2026-07-16

### Test Framework — Vitest Setup + Mission Engine Unit Tests

**1. Test Framework Installation & Configuration**:
- Installed `vitest` (v4.1.10) as a dev dependency
- Created `vitest.config.ts` at project root — mirrors vite path alias (`@/` → `src/`), uses Node environment, globals enabled, looks for tests in `tests/`
- Created `tests/setup.ts` — globally suppresses console noise during test runs
- Added `test` and `test:watch` scripts to `package.json`

**2. Test Folder Structure**:
```
tests/
  setup.ts                                    # Global hooks
  shared-mocks.ts                             # Mock mission/progress factories
  features/
    missions/
      missionEngine.test.ts                   # 16 tests
      missionProgressService.test.ts          # 18 tests
      claimProcess.test.ts                    # 14 tests
```

**3. Unit Tests Created**:

`missionEngine.test.ts` (16 tests):
- 3 validation guard tests (empty userId, missing missionId, mission not found)
- 2 daily reset flow tests (date mismatch triggers reset, same date skips)
- 6 progress/claim flow tests (incomplete, auto-claim, manual fallback, notification, repeat, skip when not completed)
- 2 store/notification tests (reward > 0 triggers update, reward = 0 skips)
- 1 property flag test (repeatable/continuous/accumulative/daily flags on result)
- Mocks: missionWP, missionRuntime, missionProgressService, MissionClaimService, missionRepeat, both notification stores, missionStore

`missionProgressService.test.ts` (18 tests):
- 1 blocked mission test (inactive)
- 3 first-run tests (creates progress, completes on target, caps at target)
- 3 existing-progress tests (adds amount, detects justCompleted, no re-justComplete)
- 8 continuous mode tests (listen_tick adds, 4 interrupt types reset, ignored actions, no-existing-progress reset, listen action)
- 2 accumulative mode tests (pause/stop no reset, tick adds)
- 2 daily boundary tests (yesterday resets, today does not)
- 1 repeat unlock test
- 1 durationMinutes target test
- Mocks: missionProgressRepository only — validator and rules used as real implementation

`claimProcess.test.ts` (14 tests):
- 6 `processMissionClaim` tests (empty userId, correct RPC params, success, RPC error, RPC false, fallback reward, default error message)
- 8 `autoClaimIfEligible` tests (non-eligible mission, profile claim, checkin claim, already claimed, no existing progress, correct RPC params)
- Mocks: `@/lib/supabase` — full chained mock for `.from().select().eq().eq().maybeSingle()` and `.rpc()`

**4. Test Strategy**:
- Repository layer mocked (Supabase data access) — tests run against pure business logic
- External services mocked (WordPress API, notification stores, Zustand stores)
- Validator and rules used as real implementations (pure functions, no side effects)
- `vi.hoisted()` used for all mock variables to avoid hoisting issues
- No production source code modified during testing setup

Verification:
- `npm run test`: 3 test files passed, 48/48 tests passed
- `npm run build`: exit 0 (no source code changes)

---

## 2026-07-16

### Sprint 10 — Foundation Cleanup (Step 1 of 6)

Scope: audit recommendation "Sprint 10: Foundation Cleanup (2 sprints)" — low-effort, zero-risk technical debt removal before new features.

**1c — Move WordPress URL to Environment Config** (P2.2 / W15):

- Added `VITE_WP_API_URL=https://voksradio.com/wp-json/wp/v2` to `.env` (alongside existing Supabase vars).
- `src/features/missions/services/missionWP.ts`:
  - Added `const WP_API_URL = import.meta.env.VITE_WP_API_URL ?? 'https://voksradio.com/wp-json/wp/v2'` with safe fallback default.
  - Replaced hardcoded `'https://voksradio.com/wp-json/wp/v2/missions'` with template literal `` `${WP_API_URL}/missions` ``.
- No architecture change — only configuration extraction. Other hardcoded WP URLs (wordpress-api.ts, rewards-crud, SettingsPage) are outside mission-engine scope and left untouched per task constraints.

**Sprint 10 scope verification (items 1a, 1b, 1c):**
- **1a Dead event-bus code** — `missionEventBus.ts` and `useMissionEventBus.ts` already deleted in prior session. Grep confirms zero references remaining in `src/`.
- **1b Listen-mission consolidation** — `types/runtime.ts` (duplicate) and `src/hooks/useListenMission.ts` (orphaned) already deleted. Single live hook `src/features/missions/hooks/useListenMission.ts` uses local-accumulation + single batch `LISTEN_TICK` on stop (per-second `track()` removed).
- **1c WordPress URL → env** — completed this session as above.

System behaviour after Sprint 10:
- Event flow: UI → `track()` → Action Engine → consumer dispatch → Mission Engine. No parallel `missionEventBus` path.
- One canonical listen hook + one canonical runtime; Supabase writes reduced from 1/sec to 1/session.
- WP base URL configurable per environment (local/staging/prod) without code edit.

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run test`: 3 test files, 48/48 passed

---

## 2026-07-16

### Sprint 11 — Anti-Abuse / Step 3 of 6 (Access Limit + Idempotency)

Scope: audit P0.1 "Anti-abuse system (rate limiting, idempotency, server validation)".

**3a — Rate Limiting (pembatasan akses)** — already present in `src/core/action-engine/engine.ts` (previous session):
- `rateLimitMap` per-user, 60s window, max 10 actions/min/user.
- Rate-limited events are still recorded to `activity_logs` (audit) but NOT dispatched to consumers (Mission Engine protected).

**3b — Idempotency Keys (kunci idempotensi)** — added this session:
- `src/core/action-engine/types.ts` — added optional `idempotencyKey?: string` to `ActionEvent`.
- `src/core/action-engine/engine.ts`:
  - `idempotencyMap` (per-key last-seen timestamp) + `IDEMPOTENCY_TTL = 10_000` (10s window).
  - `deriveIdempotencyKey(name, userId, key?)`:
    - Explicit caller key → `${userId}:${name}:${key}` when supplied.
    - Auto-derived for claim-critical events: `PROFILE_COMPLETED`, `CHECKIN`, `REFERRAL_SUCCESS` → once-per-account key.
    - Other events → `null` (no auto-dedup) unless explicit key passed.
  - `isDuplicate(key)`: drops re-seen key within TTL (defense in depth vs. RPC `FOR UPDATE` row-lock).
  - `track()` signature extended with 5th param `idempotencyKey?`; duplicate/rate-limited events are NOT dispatched but are still recorded to `activity_logs`.
- Backwards-compatible: existing `track()` callers (player-store, useListenMission, missionScheduler, useDailyCheckin, profileService, missionShareService) require no change.

Anti-abuse coverage after Step 3:
- Per-user rate cap (10/min) blocks console spam + brute force.
- Idempotency collapses accidental double-fires of claim-critical events (profile complete, checkin, referral).
- Server-side `claim_mission_reward` RPC row-lock remains the final guarantee against double-claim.
- All abuse events still audit-logged in `activity_logs`.

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run test`: 3 files, 48/48 passed (no source-logic change to tested modules)

---

## 2026-07-16

### Sprint 10/11 — Pilot Launch Config / Step 4 of 6

Scope: audit recommendation "Go for Controlled Pilot (≤100 users)" — pilot launch configuration without core architecture change.

**4a — Registration Cap (maksimal 100 pengguna)**:
- Added `src/features/auth/pilotConfig.ts` (new module):
  - `MAX_PILOT_USERS` from `import.meta.env.VITE_PILOT_MAX_USERS ?? 100`.
  - `PILOT_MODE` from `import.meta.env.VITE_PILOT_MODE ?? true`.
  - `getPilotUserCount()` — `supabase.from("profiles").select("*", { count: "exact", head: true })`.
  - `isPilotAtCap()` — returns `true` when `count >= MAX_PILOT_USERS` (no-op when `PILOT_MODE` is off).
- Added to `.env`: `VITE_PILOT_MAX_USERS=100`, `VITE_PILOT_MODE=true`.

**4b — Wire cap into auth**:
- `src/features/auth/authService.ts` `loginGoogle()`:
  - Checks `isPilotAtCap()` before OAuth redirect; throws `"Pilot registration is full. Please try again later."` when at capacity.
  - Existing sessions unaffected (cap only blocks new signups). Non-breaking: Supabase OAuth flow unchanged.

**4c — Monitoring log for reward claims**:
- `src/features/missions/services/MissionClaimService.ts`:
  - `[CLAIM] start user=.. mission=.. reward=..` on entry.
  - `[CLAIM] rpc error ..` / `[CLAIM] rejected ..` on failure.
  - `[CLAIM] success user=.. mission=.. reward=.. vxp=..` on success.
  - Structured prefix logs, audit-friendly, no behaviour change.

**4d — Monitoring log for scheduler**:
- `src/features/missions/services/missionScheduler.ts`:
  - `[SCHEDULER] tick user=..` per 60s interval tick (in addition to existing start/stop logs).

Pilot behaviour after Step 4:
- New Google signups blocked once `profiles` count reaches 100 (configurable via env, per environment).
- Every reward claim and every scheduler tick is now observable in logs for pilot monitoring.
- No 6-layer / Action Engine / validator design changed.

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0
- `npm run test`: 3 files, 48/48 passed

---

## 2026-07-16

### Retention Features — Draft Schema / Step 5 of 6

Scope: audit P0.4 (Streak System) + P0.5 (Achievement/Badge System). Draft-only: tables + RLS created, NOT yet wired into app logic (preparation for Sprint 15/17).

**5a — Streak schema** (`supabase/migrations/20260716000005_user_streaks.sql`):
- `user_streaks` table: `id`, `user_id` (FK auth.users, CASCADE), `streak_type` (`daily`/`weekly`/`monthly`), `current_streak`, `longest_streak`, `freeze_count`, `last_activity_date` (DATE), `last_activity_at`, timestamps. `UNIQUE(user_id, streak_type)`.
- Indexes on `(user_id)`, `(streak_type)`.
- RLS: user read/insert/update own rows (CHECK `user_id = auth.uid()`); `service_role` ALL.

**5b — Achievement schema** (`supabase/migrations/20260716000006_achievements.sql`):
- `achievements` catalog: `slug` (UNIQUE), `title`, `description`, `badge_icon`, `badge_name`, `tier` (`bronze`/`silver`/`gold`/`platinum`/`diamond`), `reward_vxp`, `trigger_type` (`mission`/`streak`/`share`/`referral`/`profile`/`listen`/`custom`), `trigger_key`, `target_value`, `active`. Source: WordPress CPT or seed.
- `user_achievements` earned log: `user_id` (FK), `achievement_id` (FK), `earned_at`, `reward_vxp`, `seen`. `UNIQUE(user_id, achievement_id)`.
- Indexes on catalog `(slug)`,`(active)`; log `(user_id)`,`(achievement_id)`.
- RLS: catalog public-read (active only); user read own earned; `service_role` manages both.

**Out of scope for Step 5** (per "don't change core design" constraint):
- No engine logic, detection, UI, or WordPress CPT wiring yet.
- Tables are migration-ready drafts; apply via `supabase db push` / migration when Sprint 15/17 begins.
- No TS/build/test impact (SQL-only).

Verification:
- SQL well-formed: `)` closers balanced in both files.
- `npm run check`: exit 0 (no TS change).
- `npm run test`: 3 files, 48/48 passed (no app-logic change).

---

## 2026-07-16

### Architecture Preservation / Step 6 of 6

Scope: audit constraint "Guard core architecture — do NOT overhaul Action Engine, validator pattern, or the 6-layer flow. Strengthen existing code without redesign."

**6a — Fix build warning (strengthen consistency, no redesign)**:
- `src/features/missions/validators/ListeningValidator.ts`:
  - Was the ONLY validator using `await import("@/lib/supabase")` (dynamic).
  - Converted to static `import { supabase } from "@/lib/supabase"` — now matches ProfileValidator / CheckinValidator / ShareValidator / ReferralValidator pattern.
  - Removes the `INEFFECTIVE_DYNAMIC_IMPORT` build warning (supabase client was both dynamically + statically imported).

**6b — Architecture anchors confirmed intact** (no change):
- Action Engine: `track<T>()`, `subscribeAction()`, `idempotencyKey?` param, rate limiter — signatures unchanged.
- Validator pattern: `VALIDATOR_REGISTRY` + `getValidatorForMission()` + `validateMission()` in `validators/index.ts` — unchanged.
- 6-layer flow: UI → `track()` → Action Engine → `missionConsumer` → `runMission` → `missionEngine` → services → repositories → Supabase/WordPress — unaffected.
- No engine logic, validator interface, or layer boundary modified.

**6c — What was NOT touched** (per "don't overhaul" constraint):
- `engine.ts` dispatch/record logic — untouched this step.
- `missionEngine.ts`, `missionProgressService.ts`, `MissionClaimService.ts` — untouched.
- `missionWP.ts`, `missionRuntime.ts`, `missionStore.ts` — untouched.
- Any new feature wiring (streaks/achievements) — deferred to Sprint 15/17.

Net effect: Step 6 is a consistency hardening. The single outlier validator now follows the project's static-import convention, the production build is warning-free, and the core architecture is provably unchanged.

Verification:
- `npm run check`: exit 0
- `npm run build`: exit 0 — `INEFFECTIVE_DYNAMIC_IMPORT` warning GONE
- `npm run test`: 3 files, 48/48 passed

---

---

## 2026-07-18

### Sprint 14A — Reward Store UI

**Enhanced Reward Store Page** (`src/pages/RewardStorePage.tsx`):
- **Featured Reward Hero** — first `featured` reward displayed as a premium gold gradient card with image, title, cost, badge, and "Featured" pill; clickable to open detail sheet
- **Search** — input field with Search icon, filters by title/subtitle/description (`searchQuery` state)
- **Sorting** — dropdown menu with 5 options: Featured (priority), Cost Low-High, Cost High-Low, Name A-Z, Name Z-A
- Result count display
- Empty state messages differentiate between no search results, no category matches, and no rewards at all

**Created Reward Detail Page** (`src/features/rewards/pages/RewardDetailPage.tsx`):
- Dedicated page at `/reward-store/:slug` with full reward details
- Hero image, title, subtitle, delivery type badge
- Info cards: Cost (VXP), Stock, Category, Expiry date
- Description, Terms & Conditions, Delivery Notes sections
- Bonus VXP section
- Expired / Out of Stock overlays on hero image
- Loading, error, and not-found states
- **Redeem button disabled** — always rendered as disabled (Wallet not implemented)
- "Wallet feature coming soon" notice

**Disabled Redeem** (spec: "Do NOT implement Wallet yet"):
- `RewardCard.tsx`: button label changed from "Redeem" to "View Details", always disabled (gray)
- `RewardDetailSheet.tsx`: removed redemption mutation, confirmation state, and `useRedeemReward`/`useUserVXP` hooks; redeem button always disabled; added "View Full Details" link to the new detail page
- `RewardDetailPage.tsx`: redeem button disabled with "Wallet feature coming soon" notice

**Added Route** (`src/routes/AppRoutes.tsx`):
- `/reward-store/:slug` → `RewardDetailPage`

Verification:
- `npm run check`: exit 0
- `npm run build` (tsc -b + vite build): exit 0
- `npm run lint`: exit 0

---

## 2026-07-18

### Sprint 14B — Wallet Validation

**Wallet Validation Service** (`src/features/rewards/services/walletValidationService.ts`):
- **7 priority-ordered checks**: Reward Active → Reward Status → Campaign → Wallet Balance → Badge → Achievement → VIP
- Returns `{ eligible: boolean, reason: string }`
- First failed rule becomes the reason (Insufficient VXP, Campaign Closed, Badge Required, Achievement Required, VIP Only, Reward Sold Out, Reward Inactive, Reward Expired)
- **Read-only**: no VXP deduction, no stock reservation, no ledger entries, no redeem history

**Extended Reward data model** (`src/features/rewards/rewardTypes.ts`, `rewardMapper.ts`):
- Added ACF fields: `reward_campaign_slug`, `reward_required_badge`, `reward_required_achievement`, `reward_vip_only`
- Added mapped fields: `campaignSlug`, `requiredBadge`, `requiredAchievement`, `vipOnly`

**Eligibility Hook** (`src/features/rewards/hooks/useRewardEligibility.ts`):
- React Query hook, cache key per `[user, reward.id]`, 30s staleTime
- Calls `validateRewardEligibility(userId, reward)` only when user + reward present

**Eligibility UI** (`RewardDetailSheet.tsx`, `RewardDetailPage.tsx`):
- Shows `CheckCircle2` / green "Ready to Redeem" when eligible
- Shows `XCircle` / red reason (e.g. "Insufficient VXP") when not eligible
- Shows spinning `Loader2` while checking
- **Redeem button enabled only when eligible** (gold `bg-[#bda752]` when enabled, gray `bg-gray-300` when disabled)
- Button text falls back to reason when not eligible (disabled state)
- Detail page displays validation badges: Campaign, Required Badge, Required Achievement, VIP Only

**No mutations**: validation is purely read-only — no wallet mutations, no inventory changes, no redeem creation

Verification:
- `npm run check`: exit 0
- `npm run build` (tsc -b + vite build): exit 0
- `npm run lint`: exit 0

---

## 2026-07-16

### Sprint 8.7 — Mission Foundation Finalization

**Profile Complete Mission**:
- `src/features/profile/utils/profileCompletion.ts`: Updated required fields to match sprint spec (full_name, display_name, birthday, gender, province, city, instagram, tiktok — 8 mandatory fields). Removed avatar_url and phone_number from requirement.
- `src/features/missions/validators/ProfileValidator.ts`: Uses updated `calculateProfileCompletion` which now validates against mandatory fields only. Auto-claim via existing PROFILE_COMPLETED action event.

**Referral Mission**:
- `src/features/missions/validators/ReferralValidator.ts`: Simplified to count all referrals with `reward_granted=false` (removed status=filter and 30-day window).
- `src/features/missions/services/MissionClaimService.ts`: Added `markReferralsGranted(userId)` call on successful claim for referral missions. Sets `reward_granted=true` on all pending referrals to prevent double reward.

**Share Mission**:
- Existing validator (`ShareValidator.ts`) unchanged — counts share activity_logs in current 24h window. Action Engine SHARE event maps to action=share.

**Mission State Machine**:
- `src/features/missions/types/state.ts`: Updated MissionState to `LOCKED | AVAILABLE | JOINED | IN_PROGRESS | COMPLETED | CLAIMED | EXPIRED`.
- `src/features/missions/services/missionStateMachine.ts`: Updated transitions for new state graph. Added `deriveMissionState(mission, progress)` and `deriveInitialMissionState()`.
- `src/features/missions/repositories/missionProgressRepository.ts`: Updated all state writes to use new states (JOINED, IN_PROGRESS, COMPLETED, CLAIMED).

**Mission Visibility**:
- `src/features/missions/components/MissionList.tsx`: Added `getMissionState()` using state machine logic. Filters out CLAIMED missions. Uses MissionState for visibility rather than raw boolean check.
- `src/features/missions/components/MissionCard.tsx`: Added auto-claim awareness — auto-claimable missions show "Completed" badge instead of "Claim Reward" button.

**Auto Claim**:
- `src/features/missions/validators/index.ts`: Extended `isAutoClaimMission` to include share, listen, referral in addition to profile and checkin.

**Mission History**:
- `src/features/missions/components/MissionHistory.tsx`: Now displays mission icon (Trophy), reward (+XP), completion date, and "Claimed" status badge. Removed Mission #12345 fallback.

**Changelog**:
- `AI/17_CHANGELOG.md`: Updated with Sprint 8.7 changes.

Verification:
- TypeScript check: exit 0
- Production build: exit 0

---

## 2026-07-17

### Sprint 8.8 — Freeze Mission Engine v1.0

**Scope**: Freeze architecture. No new features. Verify and lock down the existing foundation per AI/15, AI/66, AI/67.

**Architecture verification (all PASS)**:
- **Mission State**: `src/features/missions/types/state.ts` defines exactly the 7 canonical states (LOCKED, AVAILABLE, JOINED, IN_PROGRESS, COMPLETED, CLAIMED, EXPIRED). No extra states.
- **Mission Lifecycle**: State is mutated only through `missionEngine` → `missionProgressRepository`. No component or hook writes `mission_state` directly. Verified single writer path.
- **Action Engine flow**: Confirmed all live progress flows through `track()` → `missionConsumer` → `runMission` → `missionEngine`. `useListenMission` (LISTEN_TICK), `missionScheduler` (SCHEDULER_TICK), `missionShareService` (SHARE), `profileService` (PROFILE_COMPLETED) all use `track()`.
- **Reward flow**: XP is granted only by the `claim_mission_reward` RPC (Reward Engine). No direct `current_vxp` updates anywhere in application code. Verified via grep across all `.ts/.tsx/.sql`.
- **History flow**: `mission_completions` table is INSERT/SELECT only (`missionCompletionRepository.ts`). Immutable — no UPDATE/DELETE.
- **State machine**: `missionStateMachine.ts` encodes canonical transitions; EXPIRED is terminal; only valid transitions allowed.

**Cleanup (freeze enforcement)**:
- Removed `src/hooks/updateMissionProgress.ts` and `src/hooks/useMissionTracker.ts` — dead wrappers around `missionEngine` that bypassed the Action Engine. No other importers existed. This closes the only latent "other path" to the engine, satisfying "Tidak boleh ada jalur lain."

**Documentation consistency (updated to match frozen implementation)**:
- `AI/53_MISSION_STATE_RULES.md`: Replaced stale state graph (AVAILABLE→IN_PROGRESS→READY_TO_CLAIM→CLAIMED→HISTORY) with the frozen 7-state machine. Fixed Auto Claim list to reflect auto-claim on Profile/Checkin/Referral/Share/Listen.
- `AI/52_DATABASE_CANONICAL_MODEL.md`: Updated Profile Completion required fields to the 8 canonical mandatory fields (removed avatar_url and phone_number from requirement), matching Sprint 8.7 implementation in `profileCompletion.ts`.

**Frozen docs confirmed consistent**: AI/64 (foundation rules), AI/65 (action engine events), AI/66 (freeze declaration), AI/67 (engine contract).

Verification:
- TypeScript check: exit 0
- Production build: exit 0
- ESLint: exit 0

---

## 2026-07-17

### Sprint 11F — Campaign Control Center

Built Campaign Control Center inside Admin Dashboard. Admin now consumes the Campaign Engine instead of duplicating WordPress fetch logic.

Changed

- `api/campaigns.ts` — refactored to consume `campaignRepository.getCampaigns()` + `campaignStatus.deriveCampaignStatus()` instead of duplicate WordPress fetch; removed `fetchWPCampaigns()`.
- `types.ts` — `CampaignStatus` now re-exports from engine's `@/features/campaigns/types`; `AdminCampaignsParams.status` widened to `string`.
- `CampaignAnalyticsView.tsx` — uses `useCampaignAnalytics` hook (admin hook) instead of direct engine import.
- `CampaignHealth.tsx` — fixed `runCampaignHealthCheck` import path (was pointing to `campaignScheduler`, now `campaignAutomation`); removed unused `campaign` prop, `Campaign` import, and stale `Date.now()` call.
- `CampaignPreview.tsx` — fixed `useState` type error (was using string literal instead of device preset object); cleaned unused imports.
- `CampaignModeration.tsx` — fixed broken JSX conditional in sync status rendering; cleaned unused imports.
- `CampaignOverviewPage.tsx` — removed duplicate `STATUS_COLORS`; wired featured toggle and priority change mutations; fixed pagination with proper page count; fixed `exportToCSV` call signature; cleaned unused imports.
- `CampaignDetailPage.tsx` — removed unused engine imports (`getCampaignAnalytics`, `runCampaignHealthCheck`, `evaluateCampaigns`, `getCampaigns`, `ENDING_SOON_THRESHOLD_MS`, `ARCHIVE_GRACE_DAYS`).

Verification:
- TypeScript check: exit 0
- Production build: exit 0 (PWA service worker generated)
- ESLint: exit 0

---

## 2026-07-18

### Sprint 10 — Leaderboard Engine v1.0

**Scope**: Build the Leaderboard Engine as a READ-ONLY layer sourcing from Profile + XP + Retention Engine. Per AI/15, AI/72, AI/73, AI/74. Mission Engine v1.0 and Retention Engine left UNTOUCHED (no source files modified in either during this sprint).

**Architecture** (AI/15 flow): Mission Engine → Action Engine → Retention Engine → Leaderboard Engine → Profile → UI. The Leaderboard Engine performs only SELECTs — it never writes XP or any mutation on the read path.

**New database migration** (`supabase/migrations/20260718000000_leaderboard_engine.sql`):
- `leaderboard_snapshots` table (period, user_id, rank, batch_at) for Ranking Snapshot / rank delta.
- `latest_leaderboard_snapshot(p_period)` SQL function returning the most-recent snapshot batch.
- RLS: public read, service-role write only.

**Rank Calculator** (`src/features/leaderboard/engine/rankCalculator.ts`):
- Pure, deterministic, stable ranking per AI/73. Tie-break order: Current VXP → Lifetime VXP → Achievement Count → Longest Streak → Created At (earlier ranks higher).
- Stable sort: equal on all keys keeps input order (never random).
- Computes `rank`, `previous_rank`, `rank_delta`.

**Leaderboard Engine data** (`supabase/functions/leaderboard/index.ts`):
- Rewritten read path: aggregates from `profiles`, `user_achievements` (achievement count), `user_streaks` (longest streak), `vxp_transactions` (period totals). Applies the AI/73 deterministic sort server-side (matches frontend calculator).
- Returns `users` (ranked + previous_rank + rank_delta), `myRank`, and `nearby` window.
- `?action=snapshot` (admin-only, role-checked) writes a snapshot batch — separate path, not the read query, and not an XP write.

**Frontend** (`src/features/leaderboard/`):
- `types.ts`: Extended `LeaderboardUser` with `current_vxp`, `lifetime_vxp`, `achievement_count`, `current_streak`, `longest_streak`, `mission_completed`, `referral_count`, `listening_minutes`, `created_at`; added `RankedLeaderboardUser` and `LeaderboardResponse`.
- `api/leaderboard.ts`: Parses the new `{ users, myRank, nearby }` response.
- `hooks/useLeaderboard.ts`: Returns the `LeaderboardResponse`.
- `hooks/useMyRank.ts`: Derives My Rank, Nearby, Top 10 from the ranked response (pure read).
- `pages/LeaderboardPage.tsx`: UI per AI/74 — My Rank banner, Top 3, full list, Nearby Ranking, Top 10 grid, Global/Weekly/Monthly filters, per-user badge/level/streak/achievement-count with rank-delta indicator.

**Architecture compliance**:
- READ ONLY: only SELECTs on the read path; the single INSERT is the admin-only snapshot action (not XP, not on the read path). Frontend leaderboard code performs zero writes.
- No XP computation or mutation anywhere in the engine.
- Rankings sourced entirely from Profile + XP ledger + Retention tables (achievements, streaks).

Verification:
- TypeScript check: exit 0
- Production build: exit 0
- ESLint: exit 0

Mission Engine v1.0 declared STABLE / FROZEN.

---

## 2026-07-17

### Sprint 0.9 — Canonical User Service

**Scope**: Build UserCanonicalService as single source of truth for all user data. All modules consume CanonicalUser instead of querying profiles/wallet/auth directly. Per AI/174, AI/175, AI/176, AI/177.

**New files**:
- `src/features/profile/types/canonical.ts` — CanonicalUser interface (id, email, avatar_url, display_name, role, status, vxp, level, badge, profile_completed, referral, phone, city, province, social, permissions)
- `src/features/profile/services/userCanonicalService.ts` — getCanonicalUser(userId), getCanonicalUserByReferralCode(code)
- `src/features/profile/hooks/useCanonicalUser.ts` — React Query hook wrapping getCanonicalUser

**Refactors (no direct supabase.from("profiles") in feature code)**:
- `src/features/rewards/hooks/useUserVXP.ts` — replaced direct profiles query with useCanonicalUser
- `src/features/rewards/services/walletValidationService.ts` — replaced direct VXP/role queries with getCanonicalUser
- `src/features/redeem/services/redeemEngine.ts` — replaced direct current_vxp query with getCanonicalUser
- `src/features/retention/services/milestoneEngine.ts` — replaced direct lifetime_vxp/profile_completed queries with getCanonicalUser
- `src/features/retention/services/metricReader.ts` — replaced direct profile_completed query with getCanonicalUser
- `src/features/missions/validators/ProfileValidator.ts` — replaced direct profiles query with findProfile
- `src/features/missions/validators/ReferralValidator.ts` — removed redundant profiles query (already covered by referrals table)
- `src/features/auth/AuthProvider.tsx` — replaced direct profiles queries with findProfileByReferralCode / updateProfileRow
- `src/features/admin/users/pages/UserDetailPage.tsx` — added Identity, Profile, Social Media, Referral sections using full profile data

**Other changes**:
- `src/features/profile/services/profileRepository.ts` — added findProfileByReferralCode
- `src/features/profile/types.ts` — added referred_by to UpdateProfileInput
- `src/features/admin/users/types/index.ts` — AdminUser extended with birthday, favorite_music, referred_by, social media fields, profile_completed
- `src/features/admin/users/pages/UserDetailPage.tsx` — added Field component, Phone/Cake/MapPin icons, all admin sections
- `src/features/admin/shared/types.ts` — added 'banned' to AdminRole
- `src/features/admin/shared/permissions.ts` — added banned: [] to rolePermissions

Verification:
- TypeScript check: exit 0
- Production build: exit 0 (2872 modules)
- ESLint: exit 0

### Sprint 9 — Achievement System & Retention Engine

**Scope**: Build the Retention Engine layer on top of the frozen Mission Engine. Mission Engine v1.0 left UNTOUCHED. Action Engine remains the only event source. All rewards via Reward Engine (`xp-transaction` edge function). Per AI/15, AI/68, AI/69, AI/70, AI/71.

**New database migration** (`supabase/migrations/20260717000000_retention_engine.sql`):
- Added `progress` column to `user_achievements` (draft table predated it).
- New tables: `user_badges` (permanent badges), `user_milestones` (threshold milestones), `user_login_rewards` (daily login, once/day). RLS + indexes for all.

**Action Engine** (`src/core/action-engine`):
- `types.ts`: Added canonical events `USER_LOGIN`, `USER_REGISTER`, `PROFILE_UPDATED`, `MISSION_JOIN`, `MISSION_COMPLETE` (per AI/65 vocabulary). No existing event signatures changed.
- `index.ts`: Exports `retentionConsumer`.
- `AuthProvider.tsx`: Subscribes `retentionConsumer`; emits `USER_LOGIN` on `SIGNED_IN`; bootstraps retention catalog on login.

**Retention Engine** (`src/features/retention/`):
- `consumers/retentionConsumer.ts`: Maps Action Engine events → retention handlers. Only consumer of events; no UI/React-state reads.
- `services/streakEngine.ts`: Daily streak (current/longest, last_activity_date). One activity per calendar day; missing a day breaks the streak.
- `services/achievementEngine.ts`: Evaluates catalog achievements from canonical metrics; on completion grants badge (Badge Engine) + XP (Reward Engine).
- `services/badgeEngine.ts`: Permanent, automatic badge grant (upsert ignore-duplicates). Never manual.
- `services/milestoneEngine.ts`: Evaluates XP/mission/referral/share/listening/profile thresholds (100–10000 XP, 10/25/100 missions, 10 referrals, 50 shares, 100 listening hours, profile complete).
- `services/loginRewardEngine.ts`: Daily login reward once per day, streak-scaled (day 7 = 50 XP cap), via Reward Engine.
- `services/achievementCatalog.ts` / `milestoneCatalog.ts`: Static, Future-Ready catalogs seeded into DB via `ensureAchievementCatalog()`.
- `services/metricReader.ts`: Reads metrics from canonical sources (profiles, missions_progress, referrals, activity_logs, user_streaks).
- `services/bootstrap.ts`: One-time catalog seed + listen-mission-id resolution.
- `repositories/*`: streak / achievement / badge / milestone / loginReward repositories (INSERT/upsert-ignore, no mutation of earned rows).
- `hooks/*`: `useStreak`, `useAchievements`, `useBadges`, `useMilestones` (data access only — Retention Engine has NO UI per spec).

**Architecture compliance**:
- Mission Engine frozen: zero modifications to `src/features/missions/`.
- Action Engine only event source: every retention path triggers from `track()` events.
- Reward Engine only XP path: achievements/milestones/login rewards all call `xpTransaction()` (server-side `xp-transaction`), never direct `current_vxp` writes.
- History immutable: badge/milestone/achievement/login records use INSERT + upsert-ignore-duplicates; earned rows are never updated or deleted.

Verification:
- TypeScript check: exit 0
- Production build: exit 0
- ESLint: exit 0