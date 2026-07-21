# 12 — Admin naming convention

**What to build:** Admin features use `api/` directories for data access instead of `repositories/` as specified in the coding convention. Chosen approach: update `AGENTS.md` to acknowledge `api/` as a valid convention for admin features (recommended — zero code changes), OR rename all 16 `admin/*/api/` to `admin/*/repositories/`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Update `AGENTS.md` to list `api/` as a valid convention alongside `repositories/` for admin features
- [ ] Or rename all `admin/*/api/` directories to `admin/*/repositories/` and update imports
- [ ] Verify with `npm run build`
