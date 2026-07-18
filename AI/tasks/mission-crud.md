# TASK

Mission CRUD

---

## Objective

Complete Mission CRUD for Admin Panel.

---

## Scope

Mission Edit

Mission Save

Mission Refresh

Validation

Error Handling

---

## Requirements

### Edit Dialog

- Open from MissionActionMenu
- Load existing mission
- Edit:
  - title
  - description
  - reward
  - target
  - active status

---

### Save

Use

supabase/functions/admin-mission-update

Never call WordPress directly from frontend.

---

### Refresh

After save:

- close dialog
- refresh Mission Table
- refresh statistics if needed

No page reload.

---

### Validation

Title

Required

Reward

Numeric

Target

Numeric

Description

Optional

---

### Architecture

Repository

↓

API

↓

React Query Hook

↓

Dialog

↓

Mission Table

No API calls inside components.

---

### TypeScript

- No any
- Strict typing

---

## Files

src/features/admin/missions/

supabase/functions/admin-mission-update/

src/features/missions/services/missionWP.ts

---

## Definition of Done

- Mission editable
- Saved to WordPress
- Table refreshes automatically
- Statistics stay correct
- No duplicate requests
- TypeScript clean

---

## After Complete

Update

AI/SESSION_MEMORY.md

Update

AI/CHANGELOG.md

Update

AI/15_CURRENT_TASK.md

Set next task:

Reward CRUD