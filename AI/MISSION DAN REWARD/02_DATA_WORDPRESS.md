# Data WordPress — Missions + ACF Fields

Endpoint: `https://voksradio.com/wp-json/wp/v2/missions?_embed&per_page=100`

## 5 Missions Saat Ini

### 1. Complete Your Profile (ID 12465)

| ACF Field | Value | Notes |
|-----------|-------|-------|
| `mission_action` | `"manual"` | ❌ Harus diubah jadi `"profile"` |
| `mission_type` | `"one_time"` | |
| `mission_vxp` | `150` | |
| `mission_repeat` | `false` | |
| `mission_target` | `1` | |
| `mission_start` | `?` | Campaign period start |
| `mission_end` | `?` | Campaign period end |
| `mission_time_start` | `?` | Daily time window start (HH:MM) |
| `mission_time_end` | `?` | Daily time window end (HH:MM) |
| `mission_active` | `true` | |
| Trigger event | `PROFILE_COMPLETED` | Auto-claim |

### 2. Share Voks Next (ID 12464)

| ACF Field | Value | Notes |
|-----------|-------|-------|
| `mission_action` | `"share"` | ✅ Cocok |
| `mission_type` | `"Special"` | |
| `mission_vxp` | `100` | |
| `mission_repeat` | `true` | Bisa di-share berkali-kali |
| `mission_target` | `1` | |
| `mission_start` | `?` | |
| `mission_end` | `?` | |
| `mission_time_start` | `?` | |
| `mission_time_end` | `?` | |
| `mission_active` | `true` | |
| Trigger event | `SHARE` | Auto-claim |

### 3. Dengerin Pagi Bandung (ID 12343)

| ACF Field | Value | Notes |
|-----------|-------|-------|
| `mission_action` | `"listen"` | ✅ Cocok |
| `mission_type` | `"daily"` | |
| `mission_vxp` | `50` | |
| `mission_repeat` | `true` | |
| `mission_duration_minutes` | `5` | Target = 5 * 60 = 300 detik |
| `mission_listen_mode` | `"continuous"` | |
| `mission_target` | `0` | Duration digunakan sebagai target |
| `mission_start` | `"2026-07-29 07:00:00"` | Campaign period start |
| `mission_end` | `"2026-07-31 09:00:00"` | Campaign period end |
| `mission_time_start` | `"07:00:00"` | ✅ Daily window 07:00 |
| `mission_time_end` | `"09:00:00"` | ✅ Daily window 09:00 |
| `mission_active` | `true` | |
| Trigger event | `LISTEN_TICK` per detik | Continuous: reset on interrupt |

### 4. Invite 1 Friend (ID 12342)

| ACF Field | Value | Notes |
|-----------|-------|-------|
| `mission_action` | `"referral"` | ✅ Cocok |
| `mission_type` | `"referral"` | |
| `mission_vxp` | `500` | |
| `mission_repeat` | `false` | Sekali seumur hidup |
| `mission_target` | `1` | 1 referral = complete |
| `mission_start` | `?` | |
| `mission_end` | `?` | |
| `mission_time_start` | `?` | |
| `mission_time_end` | `?` | |
| `mission_active` | `true` | |
| Trigger event | `REFERRAL_SUCCESS` | Auto-claim |

### 5. Daily Check In (ID 12341)

| ACF Field | Value | Notes |
|-----------|-------|-------|
| `mission_action` | `"checkin"` | ✅ Cocok |
| `mission_type` | `"daily"` | |
| `mission_vxp` | `10` | |
| `mission_repeat` | `true` | Reset tiap hari |
| `mission_target` | `1` | |
| `mission_start` | `?` | |
| `mission_end` | `?` | |
| `mission_time_start` | `?` | |
| `mission_time_end` | `?` | |
| `mission_active` | `true` | |
| Trigger event | `CHECKIN` | Auto-claim |

## ACF Field → MissionConfig Mapping

```ts
// missionMapper.ts
{
  id: wp.id,
  title: wp.title?.rendered ?? "",
  description: wp.acf?.mission_description ?? "",
  type: wp.acf?.mission_type ?? "mission",        // "daily", "one_time", dll
  action: wp.acf?.mission_action ?? "",            // "profile", "share", "listen", "referral", "checkin"
  icon: wp.acf?.mission_icon ?? "trophy",
  badge: wp.acf?.mission_badge,
  target: Number(wp.acf?.mission_target ?? 1),
  reward: Number(wp.acf?.mission_vxp ?? 0),        // VXP reward
  repeat: Boolean(wp.acf?.mission_repeat ?? false),
  active: Boolean(wp.acf?.mission_active ?? true),
  listenMode: wp.acf?.mission_listen_mode ?? "",   // "continuous", "accumulative", ""
  period: wp.acf?.period ?? "once",                // "daily", "weekly", "monthly", "once"
  durationMinutes: wp.acf?.duration_minutes,
  // === NEW FIELDS ===
  dateStart: wp.acf?.mission_start ?? "",          // campaign start datetime
  dateEnd: wp.acf?.mission_end ?? "",              // campaign end datetime
  timeStart: wp.acf?.mission_time_start ?? "",     // daily time window start (HH:MM)
  timeEnd: wp.acf?.mission_time_end ?? "",         // daily time window end (HH:MM)
  // ===
  campaignSlug: wp.acf?.["campaign-slug"] ?? undefined,
}
```

## Action Event → Consumer → Mission Action

| Action Event | Consumer | Mission Action | Sumber |
|-------------|----------|---------------|--------|
| `PROFILE_COMPLETED` | missionConsumer | `"profile"` | profileService.ts |
| `SHARE` | missionConsumer | `"share"` | MorePage, useShareMission |
| `LISTEN_TICK` | missionConsumer | `"listen"` | useListenMission (tiap detik) |
| `REFERRAL_SUCCESS` | missionConsumer | `"referral"` | authService.ts (processReferralAfterLogin) |
| `CHECKIN` | missionConsumer | `"checkin"` | CheckinButton (MorePage) |
| `SCHEDULER_TICK` | missionConsumer | `"scheduler_tick"` | missionScheduler.ts (tiap 60s) |
