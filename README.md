# Voks PWA — Gamified Radio Experience

Voks PWA is a progressive web application for Voks Radio Bandung, featuring gamified missions, rewards, live streaming, and an admin dashboard — powered by Supabase + WordPress.

## Features

### 📻 Live Streaming
- Real-time radio streaming with HLS.js
- Live chat, polls, reactions, and giveaways
- Now playing + schedule integration

### 🎯 Mission System
- WordPress-defined mission catalog
- Auto-claim, share, and listen missions
- Progress tracking with XP rewards
- Developer mission sandbox for testing

### 🏆 Reward & Marketplace
- Reward catalog synced from WordPress
- VXP-based rewards + paid marketplace
- Voucher pool management
- Inventory lock with TTL

### 💰 Wallet & Economy
- Dual-ledger wallet (current + lifetime VXP)
- Transaction history with atomic create+commit
- Daily earnings cap + spending limits
- XP level/badge system (DB-backed thresholds)

### 👑 Leaderboard
- Lifetime, weekly, monthly rankings
- XP-based positioning
- Auto-refresh

### 📣 Notifications
- Broadcast to all/premium users
- Real-time via Supabase
- Notification stories component

### ⚙️ Admin Panel
- Dashboard, users, transactions, rewards
- Mission management, campaigns
- Analytics (charts with recharts)
- Settings, feature flags, broadcasts
- Automation, knowledge base, audit log

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS 4 + Radix UI
- **State**: React Query (server) + Zustand (client)
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **CMS**: WordPress REST API
- **PWA**: vite-plugin-pwa (Workbox)
- **Deploy**: Cloudflare Pages

## Architecture (6-Layer Flow)

```
UI → Hook → Service → Repository → Edge Function → Database
```

- **UI**: Components render, call hooks only
- **Hooks**: Bridge between UI and services
- **Services**: Business logic
- **Repositories**: Data access only
- **Edge Functions**: Server-side logic (25 functions)
- **Database**: PostgreSQL via Supabase

Two data sources, never swap roles:
- **WordPress** owns content: missions, rewards, programs, articles, promos
- **Supabase** owns user data: profiles, auth, progress, transactions

## Key Stats

| Metric | Value |
|--------|-------|
| Edge Functions | 25 (all with Zod validation + structured logging) |
| Database Tables | 65+ |
| PWA Cache | 106 precache entries, ~3.4 MiB |
| Build | 0 TypeScript errors |
| Audit Score | 6.5 → 9.0+ / 10 |

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite dev server (PWA enabled) |
| `npm run build` | `tsc -b && vite build` |
| `npm run check` | `tsc --noEmit` |
| `npm run lint` | `eslint .` |
| `npm run preview` | Cloudflare Pages preview |
| `npm run deploy` | Build + deploy to Cloudflare |

## Project Status

✅ **Phase A** — Core Foundation (Auth, Streaming, Missions, Rewards, Profile)
✅ **Phase B** — Engagement & Economy (Leaderboard, XP, Wallet, Admin Panel)
✅ **Phase C** — Commerce & Automation (Marketplace, Checkout, Vouchers, Campaigns)
✅ **Phase D** — Production Hardening (Security audit, Wallet V2, RLS, Edge Functions)
✅ **Phase E** — Platform Completion (Feature flags, Admin tools, Fraud protection)
✅ **Fase 0-3** — Audit V1 Remediation (Security, Data Integrity, Marketplace)
✅ **Fase 4** — Architecture Enforcement (Layer separation, Decoupling, Naming)
✅ **Fase 5** — Performance Optimization (Code splitting, Lazy loading, Caching)

## Vite Cache Issues

If you encounter "Invalid hook call" errors with Swiper:
1. Delete `node_modules/.vite`
2. Verify `optimizeDeps.include` has `react`, `react-dom`, `swiper/react`, `swiper/modules`
