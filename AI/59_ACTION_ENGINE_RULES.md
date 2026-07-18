# Action Engine Rules

Location

src/core/action-engine

---

Public API

track()

Examples

track("CHECKIN")

track("PROFILE_COMPLETED")

track("LISTEN_COMPLETED")

track("SHARE")

track("REFERRAL_SUCCESS")

---

Rules

Every feature calls Action Engine.

Never call Mission Engine directly.

Never grant rewards.

Never write VXP.

Never update missions.

Action Engine only records events.

Mission Engine consumes events.

Reward Engine consumes validated missions.

---

Duplicate Prevention

Each event must define unique key.

Example

CHECKIN

user

date

LISTEN

user

program

day

PROFILE_COMPLETE

once per account

REFERRAL

one referred account

SHARE

daily limit configurable