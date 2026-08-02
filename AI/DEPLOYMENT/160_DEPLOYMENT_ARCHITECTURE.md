# Deployment Architecture

Status

Current

Cloudflare Worker

GitHub

↓

Cloudflare Build

↓

npm run build

↓

dist/

↓

Wrangler Deploy

↓

Cloudflare Worker Assets

↓

React SPA

↓

Supabase

↓

WordPress

---

Platform

Frontend

React + Vite

Backend

Supabase

CMS

WordPress Headless

Hosting

Cloudflare Worker

Assets

Cloudflare Static Assets

Authentication

Supabase Auth

Realtime

Supabase

Notifications

Supabase Edge Functions

---

Deployment Flow

Developer

↓

Git Push

↓

GitHub

↓

Cloudflare

↓

Build

↓

Wrangler Deploy

↓

Production