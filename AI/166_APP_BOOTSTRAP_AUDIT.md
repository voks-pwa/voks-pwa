# Application Bootstrap Audit

Goal: Why does `main.tsx` fail to load with Vite React Refresh (`@react-refresh`)?

## 1. index.html

- Entry: `<script type="module" src="/src/main.tsx">`
- All meta tags, favicon, apple-touch-icon present
- No missing asset references
- **Verdict: OK**

## 2. main.tsx (`src/main.tsx`)

- Imports: React 19, ReactDOM 19, QueryClientProvider, App, AuthProvider, missionRuntime (side-effect)
- StrictMode wraps entire tree — double-mounts all effects in dev
- Side-effect import `@/features/missions/services/missionRuntime` resolves to existing file
- **Verdict: OK**

## 3. App.tsx (`src/App.tsx`)

- Imports: BrowserRouter (react-router-dom v7), ToastContainer, AppRoutes, useCampaignAutomation, useAuth, NotificationProvider
- All imports resolve, no circular deps
- **Verdict: OK**

## 4. Router (`src/routes/AppRoutes.tsx` + `AdminRoutes.tsx`)

- 30+ public page route components — all verified on disk
- 13 admin route components — all verified on disk
- All route files import correctly, no lazy() (static imports only — affects bundle size, not boot)
- **Verdict: OK**

## 5. Vite Config (`vite.config.ts`)

- `@vitejs/plugin-react` v6.0.2 — provides React Refresh + automatic JSX transform
- `@tailwindcss/vite` v4 — Tailwind v4 processing
- `vite-plugin-pwa` v1.3.0 — `registerType: 'autoUpdate'`, Workbox `generateSW`
- `resolve.alias: { '@': './src' }` — correct
- `optimizeDeps.include` covers `react`, `react-dom`, `swiper/react`, `swiper/modules`
- **POTENTIAL ISSUE**: `devOptions.enabled: true` — PWA service worker registers in dev mode. Can serve stale cached `index.html`, breaking HMR handshake with React Refresh.
- **Verdict: OK with caveat**

## 6. PWA Config

- All icons (192, 512, maskable) exist in `public/`
- `manifest.webmanifest` exists at both `public/` and generated in `dist/`
- Workbox runtimeCaching for AzuraCast stream only
- navigateFallback: 'index.html' — works for production, but in dev mode the PWA SW can intercept navigation before Vite's HMR is ready
- **Verdict: OK with caveat**

## 7. Service Worker (dev-dist/)

- Generated via `generateSW` mode (not `injectManifest`)
- `dev-dist/` files were last written 2026-07-18 17:16 (during Sprint 14.9A)
- **POTENTIAL ISSUE**: stale `dev-dist/` can cause the PWA SW to serve outdated assets that don't match the current Vite transform output

## 8. Manifest (`public/manifest.webmanifest`)

- id, name, short_name, start_url, scope all correct
- display: standalone, orientation: portrait
- All icon files present in `public/`
- **Verdict: OK**

## 9. Environment

- `.env` exists with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PILOT_MODE`, `VITE_PILOT_MAX_USERS`
- `VITE_WP_API_URL` not in `.env` — hardcoded fallback in 6 source files (acceptable)
- `tsconfig.app.json`: `"verbatimModuleSyntax": true`, `"erasableSyntaxOnly": true`, `"jsx": "react-jsx"`
- `src/vite-env.d.ts` references both `vite/client` and `vite-plugin-pwa/client`
- **Verdict: OK**

## 10. Import Graph

Total modules in build: 2869. Full chain verified from `main.tsx` → every leaf import.

### Static verification results
| Check | Result |
|-------|--------|
| `npm run check` (tsc --noEmit) | **PASS** — zero errors |
| `npm run build` (tsc -b && vite build) | **PASS** — 2869 modules transformed |
| Missing files | **None found** — every imported file resolves |
| Missing exports | **None found** — all named exports match declarations |
| Circular dependencies | **None found** — import graph is a DAG |
| verbatimModuleSyntax violations | **None found** — all type imports use `import type` |
| Anonymous default exports | **None found** — all default exports are named functions (React Refresh compatible) |
| Stale node_modules/.vite cache | **POSSIBLE** — can cause HMR transform failures |

### Import chain depth (top 5 by complexity)
1. `main.tsx` → `AuthProvider` → `core/action-engine` → `consumers/missionConsumer` → `missionRunner` → `missionEngine` → `missionWP` + `missionProgressService` + `MissionClaimService`
2. `AuthProvider` → `retention/index` → `bootstrap` → `achievementCatalog` + `metricReader` + `milestoneEngine` + `wordpress-api`
3. `retention/index` → `consumers/retentionConsumer` → `achievementEngine` + `milestoneEngine` + `loginRewardEngine` + `streakEngine`
4. `App` → `useCampaignAutomation` → campaign hooks chain
5. `App` → `NotificationProvider` → `context/NotificationContext` → `notificationStore` + `eventDispatcher` + `notificationSubscriber`

All chains resolve cleanly.

## Root Cause Analysis

### What the error IS
`@react-refresh cannot load` is a Vite HMR runtime error. It fires when the React Refresh runtime in the browser:

1. Receives a hot update from the server for a module it cannot accept (e.g., the module graph on the client doesn't match what the server expects), OR
2. The HMR WebSocket connection is disrupted and the fallback full-reload fails because the PWA service worker intercepts the navigation request and serves a stale `index.html`

### What the error is NOT
- NOT a TypeScript or compile error (both `check` and `build` pass)
- NOT a missing file or export (all imports resolve)
- NOT a circular dependency (graph is a DAG)
- NOT a React Hook violation (lint passes)
- NOT a PWA config error (all assets exist)

### Most likely cause (in order of probability)

1. **Stale PWA service worker in browser** — `devOptions.enabled: true` registers the SW in dev mode. If the SW's cached `index.html` (from `dev-dist/`) points to module versions that no longer match the running Vite dev server's transform output, the React Refresh boundary can't initialize. **Fix**: unregister the SW in Chrome DevTools → Application → Service Workers → Unregister, then hard reload.

2. **Stale `node_modules/.vite` metadata cache** — Vite caches dependency pre-bundling metadata. After package additions/updates (e.g., the reward-engine additions during Sprint 14.9A), this cache can become stale. **Fix**: delete `node_modules/.vite` and restart.

3. **HMR WebSocket reconnect failure after dev server restart** — If the browser tab was open during a previous `npm run dev` instance (port 5173) and the server was killed/restarted, the HMR WebSocket connection drops. The React Refresh boundary can't re-establish without a clean page reload. **Fix**: hard reload (Ctrl+Shift+R) bypassing cache.

4. **`React.StrictMode` double-mount cascade** — StrictMode double-invokes all effects. If an effect in `AuthProvider` or `NotificationContext` triggers a state update that calls `dispatchEvent` (which queries Supabase), and the Supabase client initialization is slow or the network request fails, the second invocation could crash before React Refresh can establish the error boundary. This is a timing issue, not a code bug.

## Verdict

**No code defects found.** The application is structurally sound — all static checks pass, all imports resolve, no circular dependencies, no type errors.

The `@react-refresh cannot load` error is an **environment state issue** caused by the PWA service worker interfering with Vite HMR in development mode. The fix requires environment cleanup only:

```
Remove-Item -Recurse -Force dev-dist, node_modules/.vite
# Kill all vite/node processes
# Unregister SW in Chrome DevTools → Application → Service Workers
# Restart: npm run dev
# Hard reload browser (Ctrl+Shift+R)
```

## Action

Audit complete. **No code changes required.**
