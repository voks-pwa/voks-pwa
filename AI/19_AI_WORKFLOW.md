# AI WORKFLOW

Version: 2.0

Last Updated: 2026-07-13

---

# Purpose

This document defines the standard workflow for every AI Agent working on the VOKS Radio PWA project.

Every coding session MUST follow this workflow.

Never skip any step.

---

# Project Flow

ROADMAP

↓

CURRENT_TASK

↓

TASK FILE

↓

IMPLEMENTATION

↓

SESSION MEMORY

↓

CHANGELOG

↓

STOP

---

# Step 1

Read project documentation.

Read in this exact order.

README.md

20_PROMPT.md

01_PROJECT_RULES.md

02_CODING_RULES.md

03_ARCHITECTURE.md

ROADMAP.md

15_CURRENT_TASK.md

16_SESSION_MEMORY.md

---

# Step 2

Read the task referenced inside

15_CURRENT_TASK.md

Example

AI/tasks/mission-crud.md

This file contains the engineering ticket.

---

# Step 3

Review existing implementation.

Before writing any code:

Review existing components.

Review existing hooks.

Review repositories.

Review Edge Functions.

Review WordPress integration.

Never duplicate code.

Always reuse existing architecture.

---

# Step 4

Implement only the requested task.

Never work outside the current task.

Never refactor unrelated code.

Never rename folders.

Never rewrite existing systems unless required.

---

# Step 5

Architecture Rules

Always follow

Repository

↓

API

↓

React Query Hook

↓

UI

Never perform API calls directly inside React components.

---

# Step 6

TypeScript Rules

Strict typing.

No any.

No duplicated interfaces.

Reuse existing types whenever possible.

---

# Step 7

Validation

Before finishing:

Project builds successfully.

TypeScript passes.

No duplicated requests.

No unused files.

No unnecessary refactoring.

---

# Step 8A

Update TASK_BOARD.md

Every completed milestone MUST update

AI/TASK_BOARD.md

Update

Current Module

Completed Checklist

Current Step

Progress Percentage

Overall Project Progress

Blockers

Next Task

This document is the primary progress tracker.

Always keep it synchronized with CURRENT_TASK.

---

# Documentation Order

AI MUST update documentation in this order

1.

TASK_BOARD.md

↓

2.

SESSION_MEMORY.md

↓

3.

CHANGELOG.md

↓

4.

CURRENT_TASK.md

---

Never skip TASK_BOARD.

---

# Step 9

Stop.

Never continue to the next roadmap item automatically.

Wait until CURRENT_TASK changes.

---

# Rules

DO

✔ Read CURRENT_TASK first

✔ Read SESSION_MEMORY

✔ Follow ROADMAP

✔ Reuse architecture

✔ Keep files small

✔ Keep components focused

✔ Update documentation

---

DO NOT

✘ Modify unrelated files

✘ Rewrite completed modules

✘ Introduce new architecture

✘ Skip documentation updates

✘ Ignore TypeScript errors

✘ Use any

---

# Terminal Command

Every session starts with

Execute AI/START.md

Nothing else is required.

---

# Human Workflow

Developer

↓

Update CURRENT_TASK

↓

Update Task File

↓

Run

Execute AI/START.md

↓

AI Implements

↓

AI Updates Documentation

↓

Stop

---

End of Document

---

# DEBUG MODE

If current task is fixing a bug.

AI MUST switch into DEBUG WORKFLOW.

Read

AI/DEBUG_WORKFLOW.md

Follow every step.

Do not skip.

After debugging is complete:

Return to CURRENT_TASK.

Continue roadmap.

Never start another feature while bugs remain.