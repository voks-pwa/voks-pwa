# Voks PWA — Agent instructions

## First read order

Read AI/ docs in this sequence before coding:
`00_PROJECT_OVERVIEW` → `01_PROJECT_RULES` → `02_CODING_RULES` → `03_ARCHITECTURE` → `CURRENT_TASK` → `SESSION_MEMORY`

## Commands

| `npm run dev` | Vite dev server (PWA service worker enabled) |
| `npm run build` | `tsc -b && vite build` — both typecheck and bundle |
| `npm run check` | `tsc --noEmit` — typecheck only |
| `npm run lint` | `eslint .` |
| `npm run preview` | `npm run build && wrangler dev` — Cloudflare Pages preview |
| `npm run deploy` | `npm run build && wrangler deploy` — deploy to Cloudflare |
| `npm run generate:icons` | Generate PWA icons via sharp (needs image source) |

## Architecture

**Two data sources, never swap roles**:
- **WordPress** owns content: mission definitions, reward catalog, programs, articles, promos
- **Supabase** owns user data: profiles, auth, mission progress, XP/transactions, reward redemptions, notifications

**6-layer flow** (every feature follows this):
`UI → Hook → Service → Repository → Edge Function / Supabase → Database`

**Layer rules** (non-negotiable):
- Components render and call hooks only — no business logic, no direct Supabase calls
- Repositories do data access only — no calculations
- Services hold business logic
- Engines handle complex workflows (mission engine, reward engine)
- Admin mutations → Edge Function → WordPress REST API (never direct from frontend)
- React Query owns server state; Zustand owns client state (player, notifications)

## Key conventions

- **Path alias**: `@/` → `src/`
- **Import order**: React → third-party → `@/lib` → `@/core` → `@/features` → `@/hooks` → `@/components` → relative
- **Types**: per-feature `types.ts`, never redefine in components
- **No `any`** — use `unknown` for unparsed data
- **Tailwind only**, **Lucide icons**, **async/await**, **function components only**
- Feature folders use: `components/`, `hooks/`, `services/`, `repositories/`, `types.ts` (add `engine/` for complex flows). Admin features may use `api/` as an alternative to `repositories/`.
- Edge Functions: `npm:@supabase/supabase-js@2` (Deno import), JSR deps in `supabase/functions/deno.json`
- VS Code: Deno extension enabled only for `supabase/functions`

## Gotchas

- **Swiper + Vite**: if "Invalid hook call" appears, clear `node_modules/.vite` and verify `optimizeDeps.include` in `vite.config.ts` has `react`, `react-dom`, `swiper/react`, `swiper/modules`
- **PWA dev build** generates `dev-dist/` (alongside `dist/` for production)
- **No test framework** is configured — verify changes by `npm run check && npm run build`
- **`verbatimModuleSyntax`** is on — use `import type` for type-only imports
- **Supabase env**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` in `.env` (or `.env.local`)

## Agent skills

### Issue tracker

Issues live in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical roles, each with its default label name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the root. See `docs/agents/domain.md`.

## Session close-out

After completing work, update:
1. `AI/16_SESSION_MEMORY.md`
2. `AI/15_CURRENT_TASK.md` (or `AI/18_TODO.md`)
3. `AI/17_CHANGELOG.md`
