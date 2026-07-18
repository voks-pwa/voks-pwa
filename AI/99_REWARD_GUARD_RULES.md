# Reward Guard Rules

Reward Guard dijalankan sebelum reward diberikan.

--------------------------------

Validation

1.

Reward Exists?

YES

↓

STOP

--------------------------------

2.

Cooldown?

Not expired

↓

STOP

--------------------------------

3.

Campaign Active?

NO

↓

STOP

--------------------------------

4.

Mission Active?

NO

↓

STOP

--------------------------------

5.

Repeat Rule

Daily

↓

today already claimed?

↓

STOP

--------------------------------

Referral

same referral?

↓

STOP

--------------------------------

Achievement

already unlocked?

↓

STOP

--------------------------------

Badge

already owned?

↓

STOP

--------------------------------

Milestone

already completed?

↓

STOP

--------------------------------

Profile Complete

already rewarded?

↓

STOP

--------------------------------

Only after ALL validation passes

↓

Reward Engine

↓

Grant XP

↓

Transaction

↓

Update XP

↓

Emit Event