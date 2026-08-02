# Cloudflare Worker Setup

Worker

voks-pwa

Runtime

Wrangler v4

Compatibility

nodejs_compat

Assets

directory = ./dist

SPA Routing

single-page-application

---

Required wrangler.json

{
  "$schema": "node_modules/wrangler/config-schema.json",

  "name": "voks-pwa",

  "compatibility_date": "2026-07-03",

  "compatibility_flags": [
    "nodejs_compat"
  ],

  "observability": {
    "enabled": true
  },

  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  }
}

---

Deployment

npm run build

↓

wrangler deploy