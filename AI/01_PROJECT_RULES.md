# AI/01_PROJECT_RULES.md

Version: 1.0

Last Updated: 2026-07-23

---

# PROJECT RULES

This document defines the mandatory rules for every AI agent working on the VOKS Radio PWA project.

These rules override assumptions.

If documentation conflicts with assumptions, documentation always wins.

---

# Rule 1

Never guess.

If information is missing:

* inspect the code
* inspect the database
* inspect the API

Never invent missing architecture.

---

# Rule 2

Never create duplicate logic.

Before writing code:

Search whether the feature already exists.

Possible locations:

* repository
* service
* engine
* store
* edge function
* utility

If logic already exists:

Reuse it.

---

# Rule 3

Do not bypass architecture.

Correct flow:

UI

↓

Hook

↓

Service

↓

Repository

↓

Supabase

Never:

UI

↓

Supabase directly

unless explicitly documented.

---

# Rule 4

Business logic never lives inside React components.

React components only:

* render
* call hooks
* display UI

---

# Rule 5

Mission Definition always comes from WordPress.

Never create mission definitions inside Supabase.

Mission Progress belongs to Supabase.

---

# Rule 6

Reward catalog always comes from WordPress.

Reward redemption belongs to Supabase.

---

# Rule 7

Authentication always uses Supabase Auth.

Never implement custom authentication.

---

# Rule 8

Never modify database structure unless requested.

If schema changes are needed:

Explain why.

Generate migration.

Wait for approval.

---

# Rule 9

Never remove existing features to implement new ones.

Always preserve backward compatibility.

---

# Rule 10

Prefer extending existing modules.

Do not create new modules unless necessary.

---

# Rule 11

Always preserve repository pattern.

Repository:

Database access only.

Service:

Business logic only.

UI:

Presentation only.

---

# Rule 12

Edge Functions handle administrative operations.

Admin UI must not directly modify WordPress.

Correct flow:

Admin

↓

Edge Function

↓

WordPress REST API

---

# Rule 13

Never duplicate interfaces.

Types belong inside:

types.ts

Do not redefine interfaces in components.

---

# Rule 14

No "any".

Always define types.

Unknown data should use:

unknown

before parsing.

---

# Rule 15

No hardcoded URLs.

URLs belong inside configuration.

---

# Rule 16

Never hardcode rewards.

Reward values come from WordPress ACF.

---

# Rule 17

Mission IDs are WordPress IDs.

Do not replace them with Supabase UUIDs.

Supabase stores progress.

WordPress stores definitions.

---

# Rule 18

Mission statistics are calculated.

Do not manually edit statistics.

---

# Rule 19

Never delete historical transactions.

Transactions are immutable.

---

# Rule 20

Never overwrite lifetime XP.

Lifetime XP only increases.

---

# Rule 21

Every feature must be modular.

Each feature should contain:

api/

components/

hooks/

repositories/

services/

types.ts

when applicable.

---

# Rule 22

React Query owns server state.

Zustand owns client state.

Do not mix responsibilities.

---

# Rule 23

Notification system must use Notification Store.

Never directly manipulate notification UI.

---

# Rule 24

Mission Engine is the only place allowed to complete missions.

Other modules trigger actions.

Mission Engine decides outcomes.

---

# Rule 25

WordPress is Content Management.

Supabase is User Management.

Never swap responsibilities.

---

# Rule 26

Do not rename folders without approval.

Folder structure is considered stable.

---

# Rule 27

Before creating a new Edge Function:

Search existing functions.

Prefer extending.

---

# Rule 28

When editing existing files:

Modify only required sections.

Avoid unnecessary formatting changes.

---

# Rule 29

All API calls should return consistent JSON.

Preferred format:

{
success: true,
data: ...
}

Errors:

{
success: false,
error: ...
}

---

# Rule 30

After completing any task:

AI must update:

* SESSION_MEMORY.md
* NEXT_TASK.md
* CHANGELOG.md

before ending the session.

---

# Golden Rule

When in doubt:

Read documentation.

Never assume.

Documentation is always the source of truth.

# Task Completion Rule

AI MUST NEVER start the next module while the current module is not fully completed.

Definition of completed:

- Backend completed
- Edge Function completed
- Repository completed
- Hook completed
- Components completed
- UI completed
- No runtime error
- No TypeScript error
- Feature tested

Only then AI may update CURRENT_TASK.md and continue to the next module.

# Critical Rule

Never skip unfinished modules.

Never continue to the next roadmap item while the previous roadmap item still has runtime errors.

Runtime errors have higher priority than new features.

An Edge Function task is COMPLETE only when:

1. Code implemented
2. Type-check passed
3. Docker running
4. supabase functions serve passed
5. invoke() succeeded
6. Frontend integrated

If step 3-5 cannot be executed, mark task as:

VERIFICATION BLOCKED

Never mark it COMPLETED.