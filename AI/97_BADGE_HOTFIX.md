Sprint Badge Hotfix

Do NOT redesign Badge Engine.

Only debug.

Tasks

1.

badgeRepository.ts

Replace every

console.log(error)

with

console.error(JSON.stringify(error,null,2))

2.

Inspect Badge grant failure.

Verify:

- badges table
- user_badges table
- foreign keys
- RLS
- insert payload
- duplicate badge protection

3.

Badges are permanent.

Never insert duplicate badge.

Use upsert() or existence check.

4.

Do NOT modify:

Mission Engine

Action Engine

Achievement Engine

Notification Engine

Verification

npm run check

npm run build

npm run lint

Update AI/17_CHANGELOG.md

Stop after verification.