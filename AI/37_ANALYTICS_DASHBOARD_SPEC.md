# Analytics Dashboard UI Specification

Version: 1.0

---

## Goal

Create a premium executive analytics dashboard.

Reference quality:

- Vercel Analytics
- Stripe Dashboard
- Linear
- Plausible Analytics

This dashboard must feel like a SaaS product, not an admin template.

---

# Design Principles

- minimalist
- premium
- whitespace-first
- insight-first
- responsive
- clean typography
- subtle shadows
- soft cards
- consistent spacing
- no unnecessary decorations

Do NOT change

- VOKS colors
- typography
- branding
- logo

---

# Dashboard Layout

## 1 Executive Overview

Display KPI Cards

- Live Listeners
- Peak Today
- Avg Listening Time
- Unique Listeners

Each card contains

- icon
- large metric
- description
- trend indicator

---

## 2 Listening Trend

Large line chart

Range

- Today
- 7 Days
- 30 Days

---

## 3 Listener Sources

Donut Chart

Sources

- PWA
- Website
- TuneIn
- Radio Garden
- OnlineRadioBox
- Direct Stream
- Others

---

## 4 Geographic Distribution

Country cards

Top Cities

Top Countries

Listener totals

---

## 5 Device Analytics

Cards

Desktop

Mobile

Tablet

Smart TV

Head Unit

Operating System

Android

iOS

Windows

macOS

Linux

Browser

Chrome

Safari

Firefox

Edge

Others

---

## 6 Live Broadcast

Display

Now Playing

Program

DJ

Artwork

Bitrate

Listeners

Stream Status

---

## 7 Active Listener Table

Columns

IP

Country

City

Platform

Device

Browser

Listening Duration

Connected Since

Features

Search

Sorting

Pagination

Sticky Header

---

## 8 Executive Insights

Automatically generate

- Peak Hour
- Most Active Country
- Most Popular Device
- Avg Listening Duration
- Top Traffic Source

---

# UI Requirements

Large whitespace

Rounded cards

Subtle shadows

Professional spacing

Charts are minimal

Neutral background

Primary color only for highlights

No gradients

No oversized icons

Loading skeleton

Smooth counters

Responsive

---

# Empty State

Every widget must gracefully handle

- empty data
- API failure
- loading

Never crash.

---

# Performance

Lazy load charts.

Memoize expensive calculations.

Avoid unnecessary re-renders.

---

# Definition of Done

Dashboard looks like a premium SaaS product.

No admin-template appearance.

No visual regression.

Responsive.

Verification completed.