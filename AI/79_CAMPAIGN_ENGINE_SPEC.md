# Campaign Engine Specification v1.0

## Philosophy

Campaign is NOT Mission.

Campaign is NOT Reward.

Campaign is only a container.

Mission Engine remains the single source of truth.

---

## Responsibilities

Campaign Engine

- Load Campaign
- Validate Campaign Status
- Filter Active Campaign
- Sort Featured Campaign
- Provide Campaign Detail

Campaign Engine NEVER

- Give XP
- Validate Mission
- Claim Reward
- Modify Leaderboard

Those belong to other Engines.

---

## Campaign Status

Upcoming

Running

Ended

Hidden

Inactive

---

## API Source

WordPress

/wp-json/wp/v2/campaign?_embed

---

## Output

Campaign[]

↓

Campaign Detail

↓

Mission Engine
