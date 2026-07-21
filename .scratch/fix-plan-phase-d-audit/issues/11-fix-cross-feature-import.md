# 11 — Fix cross-feature component import

**What to build:** `CampaignDetail.tsx` imports `MissionCard` directly from `@/features/missions/components/MissionCard`. Per architecture rules, components should not import from other feature's component directories. Change CampaignDetail to accept a `renderMissionCard` prop or render the mission card through a shared abstraction.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Refactor `CampaignDetail.tsx` to receive `MissionCard` as a prop or slot
- [ ] Update all callers of CampaignDetail to pass the MissionCard
- [ ] Verify with `npm run check && npm run build`
