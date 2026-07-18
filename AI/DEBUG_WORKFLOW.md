# AI/DEBUG_WORKFLOW.md

# DEBUG WORKFLOW

Version: 1.0

Last Updated: 2026-07-13

---

# PURPOSE

Never guess.

Always verify.

Always find the root cause before modifying code.

This workflow is mandatory.

---

# DEBUG ORDER

Every bug MUST follow this order.

1.

Read the error carefully.

Do not start coding.

---

2.

Identify bug category.

Possible categories:

- Frontend
- Backend
- Edge Function
- Supabase
- WordPress
- Database
- Authentication
- Network
- Build
- TypeScript

---

3.

Verify Backend first.

If the feature uses Edge Functions:

CHECK

✓ Function exists

✓ Function name

✓ Function deployed

✓ Function URL

✓ Environment variables

✓ Function logs

Only continue after backend is verified.

---

4.

Verify invoke()

Find

supabase.functions.invoke()

Check

- function name
- payload
- headers
- auth
- response

Never assume invoke() is correct.

---

5.

Check Edge Function logs.

If available.

Look for

- 500 errors
- missing env
- database error
- WordPress error
- timeout

Never modify frontend before reading logs.

---

6.

Check Supabase.

Verify

- table exists

- RLS

- permissions

- service role

- API response

---

7.

Check WordPress.

If feature depends on WordPress.

Verify

REST endpoint

Authentication

HTTP status

JSON response

---

8.

Check Network.

Verify

Browser Network tab

HTTP status

Request payload

Response body

---

9.

Only now inspect Frontend.

Check

React Query

Hooks

State

Component lifecycle

Rendering

Loading state

---

10.

Fix the smallest possible code.

Never refactor unrelated code.

Never rewrite architecture.

---

11.

Verify.

Confirm

No runtime error

No TypeScript error

No console error

No duplicated request

Feature works

---

12.

Update documentation.

Append only.

Update

AI/SESSION_MEMORY.md

AI/CHANGELOG.md

AI/TASK_BOARD.md

---

# EDGE FUNCTION CHECKLIST

Before modifying frontend.

Verify:

□ Function exists

□ Function deployed

□ Function reachable

□ invoke() correct

□ Logs checked

□ Environment variables

□ Returns expected JSON

---

# FRONTEND CHECKLIST

□ Query executes

□ Mutation executes

□ Loading

□ Error

□ Empty state

□ Success state

□ Cache invalidation

□ UI refresh

---

# NEVER

Never guess.

Never skip backend verification.

Never edit frontend first for API failures.

Never ignore logs.

Never modify unrelated files.

---

# EXAMPLE

Error

Failed to load analytics

Correct order

Edge Function

↓

invoke()

↓

Supabase

↓

Logs

↓

Network

↓

Frontend

Wrong order

Frontend

↓

Hooks

↓

Components

↓

Guessing

---

# PROJECT RULE

Backend first.

Frontend second.

Always.