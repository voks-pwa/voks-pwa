# AI/02_CODING_RULES.md

Version: 1.0

Last Updated: 2026-07-13

---

# CODING RULES

This document defines coding standards for the VOKS Radio PWA project.

Every AI agent must follow these standards.

---

# General Philosophy

Write code as if another engineer will maintain it for the next five years.

Readable code is more valuable than clever code.

---

# TypeScript

Always use TypeScript.

Never disable strict typing.

Never use:

any

Prefer:

unknown

or proper interfaces.

---

# Interfaces

All interfaces belong inside:

types.ts

Never redefine interfaces inside components.

Bad

Component.tsx

interface Mission { ... }

Good

types.ts

export interface Mission { ... }

---

# Component Rules

One component

One responsibility

Do not create huge components.

If component exceeds roughly 250 lines,

consider splitting.

---

# Folder Structure

Feature-first architecture.

Example

features/

missions/

components/

hooks/

repositories/

services/

engine/

types.ts

store.ts

Never place unrelated files together.

---

# Import Order

Always use this order.

1

React

2

Third-party packages

3

Shared libraries

4

Internal features

5

Relative imports

Example

import React

import axios

import { Button }

import { useMission }

import "./style.css"

---

# React Components

Always use function components.

Never use class components.

Preferred

export function MissionCard()

Avoid

class MissionCard

---

# Props

Always define props interface.

Example

interface Props

Never inline anonymous prop types.

---

# Hooks

Hooks belong inside:

hooks/

Never place business logic directly inside pages.

---

# State Management

Server State

React Query

Client State

Zustand

Never use Zustand for API cache.

Never use React Query for UI state.

---

# Repository Pattern

Repository

↓

Database

Only.

Repositories never contain business logic.

Example

MissionRepository

getMission()

updateMission()

deleteMission()

No calculations.

---

# Service Layer

Business logic belongs here.

Examples

MissionService

RewardService

TransactionService

NotificationService

---

# Engine Layer

Complex business flows belong here.

Mission Engine

Reward Engine

XP Engine

Notification Engine

Never duplicate engine logic.

---

# Edge Functions

Edge Functions handle:

Admin

Server validation

External APIs

WordPress updates

Never expose WordPress credentials to frontend.

---

# WordPress

WordPress is read-only from frontend.

Updates happen through Edge Functions only.

---

# Naming Convention

Components

PascalCase

MissionTable

Hooks

camelCase

useMission

Files

camelCase

missionRepository.ts

Types

PascalCase

MissionConfig

---

# Boolean Naming

Use

isCompleted

hasReward

canRepeat

Never

completedFlag

rewardCheck

---

# Async

Always use async/await.

Never chain long promise trees.

---

# Error Handling

Never ignore errors.

Always return meaningful messages.

Preferred

try

catch

Return

success

error

---

# API Response

Always

{

success

data

}

Errors

{

success

false

error

}

Never return raw database responses.

---

# Database

Never query database directly inside components.

Always

Component

↓

Hook

↓

Service

↓

Repository

↓

Supabase

---

# Constants

Magic numbers are forbidden.

Bad

reward = 100

Good

MISSION_REWARD

---

# Icons

Lucide only.

Do not mix icon libraries unless required.

---

# Styling

Tailwind only.

Avoid inline styles.

---

# Comments

Comment why.

Not what.

Bad

increment count

Good

Required because mission progress must remain monotonic.

---

# Logging

Development

console.log

Production

No logs.

Use logger utilities if required.

---

# Performance

Prefer memoization only when necessary.

Avoid premature optimization.

---

# AI Rules

Before creating new code:

Search existing implementation.

Reuse first.

Create second.

---

# Testing Philosophy

Every business rule should be deterministic.

Mission completion

Reward calculation

XP calculation

must always produce identical results.

---

# Refactoring

Refactor only when requested.

Do not rewrite working modules without approval.

---

# Golden Rule

Consistency is more important than personal preference.

Every file should look like it was written by the same engineer.
