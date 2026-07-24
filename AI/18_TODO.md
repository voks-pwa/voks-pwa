# AI/18_TODO.md

Version: 2.0

Last Updated: 2026-07-23

---

# PROJECT ROADMAP

This file is auto-synced from AI/TODO_v2.md — the single source of truth for remaining work.

See `AI/TODO_v2.md` for full task breakdown across all phases.

---

# Remaining Phases

## Fase 6 — Documentation Sync 📝

| # | Task | Severitas |
|---|------|-----------|
| 6.1 | README.md — full rewrite (hapus known issues, update features, tambah Phase C/D/E/Fase 0-5) | Critical |
| 6.2 | AI/00_PROJECT_OVERVIEW.md — update module status, EF count 8→25 | High |
| 6.3 | AI/00_SYSTEM_ARCHITECTURE_v1.md — mark deprecated, sync states | High |
| 6.4 | AI/18_TODO.md — rewrite from TODO_v2 | High |
| 6.5 | AI/223_PHASE_E_MASTER_CHECKLIST.md — sync | High |
| 6.6 | AI/15_CURRENT_TASK.md — update | Medium |
| 6.7 | AI/03_ARCHITECTURE.md — Future→Complete | Medium |
| 6.8 | AI/01_PROJECT_RULES.md — update timestamp | Low |
| 6.9 | AI/02_CODING_RULES.md — update timestamp | Low |
| 6.10 | Archive stale session files | Info |

## Fase 7 — CI & Testing 🧪

| # | Task | Severitas |
|---|------|-----------|
| 7.1 | Wallet test — walletEngine credit/debit/createTransaction | Medium |
| 7.2 | Marketplace test — checkout flow, inventory lock, voucher | Medium |
| 7.3 | Economy test — calculateXP, multiplier, spending caps | Medium |
| 7.4 | Edge Function test — admin role check, input validation | Medium |
| 7.5 | CI pipeline — GitHub Actions (check + test + build) | Medium |
| 7.6 | Bundle size budgets — enforce in CI | Low |

---

# Completed Phases

## Fase 0 — Housekeeping ✅
Cleanup: scaffold, empty dirs, dead components, .gitignore

## Fase 1 — Security ✅
RLS, adminAuth, HMAC webhook, CORS, Zod validation, open redirect, sanitizer

## Fase 2 — Data Integrity ✅
Dual ledger fix, atomic RPCs, level/badge DB, FK constraints, earning cap

## Fase 3 — Marketplace ✅
Inventory sync, voucher pool, lock TTL, idempotency, stock re-verify

## Fase 4 — Architecture Enforcement ✅
Layer separation, decoupling, naming, EF hardening, route guards

## Fase 5 — Performance Optimization ✅
Code splitting, React.memo, virtualization, SW caching, lazy loading, images
