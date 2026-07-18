# Mission Progress Engine

Every Action Engine event must update Mission Engine.

Action

↓

Mission Progress

↓

Mission Evaluator

↓

Mission State

↓

Reward Engine

↓

History

↓

Notification

Never bypass this flow.

Mission Progress becomes the single source of truth.

Mission Detail and Mission List must read only from Mission State.

No duplicated logic.
