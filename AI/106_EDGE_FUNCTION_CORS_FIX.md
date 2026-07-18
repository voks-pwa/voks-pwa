# Edge Function CORS Hotfix

Function

admin-user-detail

---

Goal

Fix failed OPTIONS preflight.

---

Requirements

Edge Function MUST respond to:

OPTIONS

with

200

or

204

---

Verify

Access-Control-Allow-Origin

Access-Control-Allow-Headers

Access-Control-Allow-Methods

---

No redirect allowed.

---

Function should support

OPTIONS

GET

POST

if applicable.

---

Verification

Open

/admin/users/:id

No browser CORS error.

No OPTIONS failure.