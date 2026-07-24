Baca seluruh dokumentasi berikut terlebih dahulu:

AI/15_CURRENT_TASK.md

AI/230_ASSET_MANAGEMENT_SYSTEM.md

AI/231_CLOUDFLARE_R2_SETUP.md

AI/232_ASSET_DATABASE_SCHEMA.md

AI/233_UPLOAD_GATEWAY.md

AI/234_IMAGE_PROCESSING_PIPELINE.md

AI/235_ASSET_CHECKLIST.md

AI/17_CHANGELOG.md

AI/194_TECHNICAL_DEBT_REGISTER.md

Kemudian kerjakan Asset Management System sesuai blueprint.

Aturan:

- Jangan mengubah arsitektur platform.
- Gunakan Repository Pattern.
- Semua upload harus melalui Cloudflare Worker.
- Cloudflare R2 hanya menerima upload dari Worker.
- PostgreSQL tidak boleh menyimpan binary image.
- Semua image diubah menjadi WebP.
- Semua filename menggunakan UUID.
- Metadata disimpan di tabel assets.
- Seluruh modul harus menggunakan Asset Service.

Lakukan:

- TypeScript Check
- ESLint
- Production Build

Update:

- AI/17_CHANGELOG.md
- AI/235_ASSET_CHECKLIST.md
- AI/15_CURRENT_TASK.md

Output:

- Ringkasan
- File yang berubah
- Verifikasi
- Dampak
- Remaining

Berhenti setelah Asset Management System selesai dan tunggu approval.