# AI/14_FOLDER_STRUCTURE.md

Version: 1.0

Last Updated: 2026-07-13

---

# PROJECT STRUCTURE

VOKS Radio PWA follows Feature Based Architecture.

---

# ROOT

```text
src/

features/

components/

hooks/

lib/

services/

utils/

types/
```

---

# FEATURES

```text
features/

admin/

missions/

rewards/

player/

notifications/

profile/

auth/

dashboard/
```

Every feature is isolated.

---

# ADMIN

```text
admin/

dashboard/

users/

transactions/

rewards/

missions/
```

Each module

api

components

hooks

pages

types

---

# MISSIONS

```text
missions/

components/

engine/

repositories/

services/

hooks/

pages/

types/
```

---

# ENGINE

Contains

Mission Engine

Reward Engine

Runtime

Rules

Store

Never place UI here.

---

# SERVICES

Business logic.

Coordinates repositories.

---

# REPOSITORIES

Database

REST API

Edge Functions

Only data access.

---

# COMPONENTS

Reusable UI.

No business logic.

---

# PAGES

Entry point.

Render UI.

---

# HOOKS

React Query

Zustand

Local UI state

---

# TYPES

Every feature owns

types.ts

Avoid global interfaces unless shared.

---

# LIB

Shared

Supabase

Utilities

Configuration

---

# SUPABASE

```text
supabase/

functions/

migrations/
```

---

# AI

```text
AI/

00_PROJECT_OVERVIEW

01_PROJECT_RULES

02_CODING_RULES

03_ARCHITECTURE

04_DATABASE

05_WORDPRESS

06_SUPABASE

07_ADMIN_PANEL

08_MISSION_ENGINE

09_REWARD_SYSTEM

10_PLAYER_SYSTEM

11_NOTIFICATION_SYSTEM

12_API_REFERENCE

13_EDGE_FUNCTIONS

14_FOLDER_STRUCTURE

15_CURRENT_TASK

16_SESSION_MEMORY

17_CHANGELOG

18_TODO

19_AI_WORKFLOW

20_PROMPT
```

---

# IMPORT RULES

Use aliases

```text
@/features/

@/components/

@/lib/
```

Avoid long relative imports.

---

# NAMING

Pages

PascalCase

Components

PascalCase

Hooks

camelCase

Repositories

camelCase

Services

camelCase

Stores

camelCase

---

# AI RULES

When adding files

Always follow

Feature

↓

Layer

↓

Responsibility

Never place files outside architecture.

Consistency is more important than speed.
