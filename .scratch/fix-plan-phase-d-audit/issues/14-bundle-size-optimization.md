# 14 — Bundle size optimization

**What to build:** Production build has 3 chunks exceeding 500KB: `AdminRoutes` (705KB), `LiveStudioPage` (527KB), and `index-CmbyTGCD.js` (498KB — just under). Split these large chunks by ensuring dynamic imports are properly used. For AdminRoutes, ensure each admin page is lazy-loaded (not bundled into one chunk). For LiveStudioPage, split heavy sub-components (player, chat, reactions) into separate chunks.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Audit `AdminRoutes.tsx` — verify all page imports use `React.lazy()`
- [ ] Audit `LiveStudioPage.tsx` — identify heavy sub-components
- [ ] Split large chunks with dynamic imports
- [ ] Verify with `npm run build` — check chunk sizes
