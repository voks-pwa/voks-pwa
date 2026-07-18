# Admin User Detail Fix

Status

Hotfix

---

Goal

Memperbaiki halaman:

/admin/users/:id

yang saat ini menampilkan Not Found.

---

Checklist

1.

Periksa routing.

Pastikan terdapat route:

/admin/users/:id

atau

/admin/users/:userId

dan konsisten.

---

2.

Periksa seluruh Link.

Cari semua:

navigate()

<Link>

href

yang menuju User Detail.

Pastikan mengirim:

user.id

bukan

undefined

atau

email

---

3.

Periksa AppRoutes.

Pastikan UserDetailPage sudah ter-register.

Contoh:

/admin/users/:id

↓

UserDetailPage

---

4.

Periksa UserDetailPage.

Pastikan membaca:

useParams()

dan menggunakan nama parameter yang sama dengan route.

Contoh

route

:id

↓

params.id

bukan

params.userId

---

5.

Periksa Admin Sidebar.

Pastikan tidak ada redirect ke

/not-found

---

6.

Periksa Loader.

Jika data user tidak ditemukan,

tampilkan:

User not found

BUKAN redirect ke 404.

---

7.

Periksa query Supabase.

Pastikan query menggunakan

profiles.id

bukan

auth.users.id

yang salah.

---

Verification

Harus dapat membuka

/admin/users/{uuid}

langsung.

Refresh browser tetap berhasil.

Direct URL tetap berhasil.

Tidak redirect ke 404.

Update

AI/17_CHANGELOG.md