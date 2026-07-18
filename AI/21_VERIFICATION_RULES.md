# AI/21_VERIFICATION_RULES.md

Version: 1.0

Last Updated: 2026-07-13

---

# PURPOSE

This document defines when a task may be marked:

- COMPLETED
- BLOCKED
- FAILED

AI Agent MUST follow these rules.

---

# STATUS DEFINITIONS

## COMPLETED

A task may ONLY be marked COMPLETED when ALL required verification steps have passed.

Missing one verification step means the task is NOT completed.

---

## BLOCKED

Use BLOCKED when:

- external service unavailable
- missing credentials
- deployment unavailable
- Docker unavailable
- Supabase unavailable
- WordPress unavailable

The reason MUST be documented.

---

## FAILED

FAILED means:

The implementation itself is incorrect.

Examples

- TypeScript errors
- Deno errors
- Runtime crash
- API returns 500 because of implementation
- Invalid database query

FAILED is different from BLOCKED.

---

# EDGE FUNCTION VERIFICATION

Required steps

[x] Function implemented

[x] TypeScript passes

[x] Deno passes

[x] Deployment completed

[x] invoke() succeeds

[x] Frontend successfully consumes API

Only then:

STATUS = COMPLETED

---

# FRONTEND VERIFICATION

Required

[x] Build passes

[x] No console errors

[x] No runtime exceptions

[x] React Query works

[x] UI updated correctly

[x] Loading state

[x] Error state

[x] Success state

---

# WORDPRESS VERIFICATION

Required

[x] REST endpoint reachable

[x] Authentication works

[x] CRUD works

[x] Response validated

---

# DATABASE VERIFICATION

Required

[x] SQL valid

[x] RLS respected

[x] Data updated correctly

[x] No breaking migration

---

# WHEN DEPLOYMENT IS NOT POSSIBLE

If deployment cannot be executed because of environment limitations:

Status

BLOCKED

Reason

Deployment unavailable.

Never mark COMPLETED.

---

# REPORT FORMAT

Every completed task MUST end with

## Verification

Backend

TypeScript

PASS / FAIL

Deno

PASS / FAIL

Deployment

PASS / BLOCKED

Invoke

PASS / BLOCKED

Frontend

PASS / BLOCKED

Final Status

COMPLETED

or

BLOCKED

or

FAILED

---

# AI RULE

Never assume a feature works.

Verify it.

Evidence is required before marking COMPLETED.