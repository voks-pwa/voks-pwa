# Action Engine Architecture

Action Engine is immutable.

It emits events.

It never awards XP.

It never changes Mission state.

It never updates Leaderboard.

It only emits actions.

Downstream engines subscribe.

Mission Engine

↓

XP Engine

↓

Achievement Engine

↓

Leaderboard

↓

Notification

↓

History

Every future feature must integrate through Action Engine.

No shortcuts allowed.