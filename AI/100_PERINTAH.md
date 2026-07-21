# VOKS NEXT — CURRENT TASK EXECUTION PROMPT

## Context

Anda adalah Senior Software Architect untuk project **VOKS NEXT PWA**.

Ikuti seluruh spesifikasi yang ada pada:

* AI/15_CURRENT_TASK.md
* AI/186_CANONICAL_MIGRATION_FINALIZATION.md
* AI/187_MODULE_DEPENDENCY_GRAPH.md
* AI/188_CANONICAL_API_RULES.md
* AI/189_CANONICAL_MIGRATION_CHECKLIST.md

Semua keputusan harus mengikuti dokumen tersebut.

---

# OBJECTIVE

Melanjutkan Phase B:

## Sprint B.1 — Canonical Migration Finalization

Target sprint ini adalah menyelesaikan migrasi seluruh Business Module agar hanya menggunakan **CanonicalUserService**.

CanonicalUser sekarang merupakan **Single Source of Truth**.

Business Module tidak boleh lagi mengakses:

* profiles
* wallet_summary
* user_badges
* user_streaks

secara langsung.

Semua modul WAJIB menggunakan:

* getCanonicalUser()
* useCanonicalUser()

---

# PRIORITY ORDER

Kerjakan satu modul sampai selesai sebelum lanjut ke modul berikut.

Urutan:

1.

Campaign

↓

2.

Referral

↓

3.

Achievement

↓

4.

Leaderboard

↓

5.

Notification

↓

6.

Inventory

↓

7.

Analytics

---

# FOR EACH MODULE

Lakukan proses berikut.

## STEP 1

Audit module.

Temukan:

* direct Supabase query
* duplicate query
* duplicate cache
* duplicate wallet lookup
* duplicate badge lookup

---

## STEP 2

Ganti seluruh dependency menjadi:

CanonicalUser

---

## STEP 3

Hapus seluruh query lama.

Jangan menyisakan query:

```ts
.from("profiles")

.from("wallet_summary")

.from("user_badges")

.from("user_streaks")
```

di Business Layer.

---

## STEP 4

Update React Query.

Gunakan:

```ts
["canonical-user", userId]
```

sebagai cache utama.

Tidak boleh ada cache user lain.

---

## STEP 5

Testing

Setelah satu modul selesai:

* TypeScript
* ESLint
* Production Build

Semua harus PASS.

---

# IMPORTANT RULES

Jangan mengubah:

* Reward Engine

* Mission Engine

* Wallet Engine

* Admin User Detail

karena sudah stabil.

Jangan mengubah struktur CanonicalUser.

Jika ada field baru diperlukan, tambahkan melalui CanonicalUserService, bukan query baru.

---

# OUTPUT FORMAT

Untuk setiap modul tampilkan:

## Audit

* Temuan

## Root Cause

* Penyebab

## Fix

* File yang diubah

## Verification

* Build
* TypeScript
* ESLint

## Remaining

* Apa yang belum selesai

---

# STOP RULE

Setelah satu modul selesai,

BERHENTI.

Jelaskan:

* Mengapa solusi ini benar.
* Dampaknya terhadap modul lain.
* Apa yang perlu diverifikasi.
* Tunggu approval sebelum melanjutkan ke modul berikut.

Jangan mengerjakan modul berikutnya tanpa approval.

---

# SUCCESS CRITERIA

Sprint selesai apabila:

✓ Zero direct query ke profiles.

✓ Zero duplicate wallet query.

✓ Zero duplicate badge query.

✓ Zero duplicate streak query.

✓ Semua Business Module menggunakan CanonicalUser.

✓ Canonical Architecture Audit lulus.

✓ React Query hanya memiliki satu cache user.

✓ Production build PASS.

✓ Tidak ada regression pada Mission Engine maupun Reward Engine.

---

Sebelum mulai implementasi, jelaskan secara rinci:

1. Modul mana yang akan dikerjakan terlebih dahulu.
2. File yang diperkirakan berubah.
3. Risiko migrasi.
4. Cara rollback jika terjadi regression.

Setelah itu tunggu approval sebelum menulis kode.
