Temuan utama

Status radio tidak konsisten

Homepage menampilkan LIVE dan 12 listeners.
Halaman /live menampilkan OFFLINE.
Audio di homepage dalam keadaan paused, dan audio live belum memiliki sumber aktif.
Ini berpotensi membuat pengguna mengira radio sedang live padahal player tidak berjalan.
Data test terlihat di Live Chat

Muncul pesan seperti test, sdasda, dan Test.
Nama pengguna juga tampil sebagai User.
Jika ini bukan data produksi yang disengaja, sebaiknya hapus data seed/test dari database.
Konten menampilkan HTML entity mentah

Contoh yang terlihat: &#038; dan &#8211; pada judul konten.
Seharusnya tampil sebagai & dan tanda –.
Kemungkinan masalah escaping pada data WordPress/API atau rendering frontend.
Yang berfungsi

Homepage.
Programs.
Announcers.
Schedule.
Voks+.
Missions.
Reward Store.
Notifications.
Redirect login Google ke Supabase OAuth.
Reward Store menampilkan 4 reward, harga, stok, detail, dan tombol redeem.
Mission Center menampilkan 5 misi dan redirect login.
Catatan

Beberapa halaman membutuhkan sekitar 3–6 detik untuk memuat data; awalnya sempat hanya menampilkan Loading..., tetapi akhirnya berhasil.

# Fitur Mission & Reward
setelah saya test dengan membuat akun user baru. Fitur missions belum berjalan sebagaimana mestinya. seperti complete profile sudah dilakukan tapi rewards vxp nya tidak bertambah. kemudian untuk mission share juga sudah dilakukan tapi reward vxp nya tidak bertambah pada user. bantu analisa dan cek sistem mission dan reward ini harus sesuai dengan visi saya.

# Status (2026-07-31)

## Mission & Reward — ✅ DIPERBAIKI
- Prod schema drift fixed: `missions_progress.updated_at`, `claim_mission_reward` definitif (wallet_ledger + current/lifetime_vxp), `update_profile_safe`, `set_profile_completion`, `get_mission_analytics`
- Daily reset jalan (reset by `completed_at`), MissionHistory baca `mission_completions` permanen
- Grant pakai `mission_vxp` WP (display = grant), period mapping dari `mission_type`
- Migrasi pending di-push (`supabase db push`), frontend deployed (voks-pwa.voksmedsos.workers.dev)
- Verifikasi prod: `get_mission_analytics` → 200 (misi 12341: 4 attempts, 3 completions)

## QA Lain — Status 2026-07-31 (semua selesai)
- ✅ Live status inkonsisten: homepage (AzuraCast) vs /live (Owncast) → `LiveStudioPlayer` kini pakai sumber yang sama (`useNowPlaying` → `is_online` AzuraCast) + tampil jumlah listener. Konsisten dengan homepage.
- ✅ Test data live chat (`test`, `sdasda`, `Test`, username `Admin Voks`/`dmj.rajandreas`) → dihapus via migration `20260905000001_cleanup_live_chat_test_data.sql`. Verified: `live_messages` 0 rows.
- ✅ HTML entity mentah (`&#038;`, `&#8211;`) → util `src/lib/html.ts` (`decodeEntities` + `decodeWpText`) diterapkan di layer fetch WP (`wordpress-api.ts`, `missionMapper.ts`).
- ✅ Loading 3–6 detik → `staleTime` 5 menit di hooks `usePrograms`, `useAnnouncers`, `useVoksPlus` (gak refetch tiap navigasi).

Deploy: frontend ke `voks-pwa.voksmedsos.workers.dev` (Version ID f601a740).