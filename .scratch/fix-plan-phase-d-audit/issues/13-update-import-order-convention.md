# 13 — Update import order convention

**What to build:** The import order convention in `AGENTS.md` only lists: `React → third-party → @/lib → @/features → relative`. But the codebase also uses `@/core/`, `@/hooks/`, `@/components/` path aliases that aren't covered. Update the convention to include these aliases in the correct position.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Update import order section in `AGENTS.md` to include `@/core`, `@/hooks`, `@/components`
- [ ] Verify — no code changes needed, just convention update
