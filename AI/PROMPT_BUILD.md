Baca seluruh dokumentasi yang tercantum pada AI/15_CURRENT_TASK.md terlebih dahulu.

AI/15_CURRENT_TASK.md adalah satu-satunya sumber kebenaran (Single Source of Truth) mengenai sprint yang sedang berjalan.

Ikuti seluruh instruksi yang terdapat di dalam file tersebut sebelum melakukan perubahan kode.

Working Rules

Ikuti Repository Pattern.

Gunakan Canonical User Service sebagai Single Source of Truth.

Gunakan Wallet Ledger V2 untuk seluruh transaksi VXP.

Gunakan Economy Engine untuk seluruh perhitungan XP, reward, pricing, multiplier, dan economy.

Jangan membuat query langsung ke:

profiles
wallet_summary
user_badges
user_streaks

Semua akses database harus melalui Repository Layer.

Architecture Rules

Jangan mengubah arsitektur yang sudah ada.

Jangan melakukan refactor besar di luar scope sprint.

Jangan membuat improvisasi fitur.

Jangan menambahkan dependency baru kecuali benar-benar dibutuhkan oleh sprint.

Seluruh perubahan harus tetap konsisten dengan blueprint yang ada pada folder AI.

Scope Rules

Kerjakan hanya sprint yang sedang aktif sesuai AI/15_CURRENT_TASK.md.

Jangan mengerjakan sprint berikutnya.

Jangan mengubah module yang tidak berhubungan.

Jika menemukan bug di luar sprint:

Catat sebagai Technical Debt.
Jangan diperbaiki kecuali memang menjadi bagian sprint.
Verification

Sebelum sprint dianggap selesai, lakukan:

TypeScript Check
ESLint
Production Build

Pastikan semuanya PASS.

Documentation Update

Setelah sprint selesai, update:

AI/17_CHANGELOG.md
AI/15_CURRENT_TASK.md
Checklist sesuai phase yang sedang berjalan
Dokumen milestone bila diperlukan

Jangan membuat dokumentasi baru di luar blueprint kecuali diminta.

Report Format

Selalu berikan laporan dengan format berikut:

Summary

Ringkasan pekerjaan.

Files Changed

Daftar file yang berubah.

Verification
TypeScript
ESLint
Build
Impact

Dampak terhadap sistem.

Remaining

Apa yang masih tersisa untuk sprint berikutnya.

Stop Rule

Setelah satu sprint selesai:

BERHENTI.

Jangan lanjut ke sprint berikutnya.

Tunggu approval.

Absolute Priority
Stabilitas Platform
Konsistensi Arsitektur
Tidak ada duplicate logic
Tidak ada duplicate cache
Tidak ada direct database query
Build harus selalu PASS
Goal

Selesaikan proyek sesuai roadmap yang terdapat pada folder AI hingga mencapai:

Phase E Complete
Production Ready
QA Complete
Public Launch
Version 1.0 Stable