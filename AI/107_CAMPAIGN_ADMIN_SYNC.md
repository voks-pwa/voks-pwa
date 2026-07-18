# Campaign Admin Synchronization

Status

Hotfix

---

Goal

Menyamakan Campaign Admin dengan WordPress Campaign API.

Tidak boleh ada perbedaan status.

Campaign Admin menjadi representasi langsung dari WordPress.

---

## Source of Truth

Campaign hanya berasal dari:

/wp-json/wp/v2/campaign?_embed

Admin Dashboard tidak boleh membuat status sendiri.

---

## Mapping

WordPress

acf.schedule.campaign_active

↓

Admin

status

---

WordPress

campaign_start

↓

start_date

---

WordPress

campaign_end

↓

end_date

---

WordPress

campaign_featured

↓

featured

---

WordPress

campaign_priority

↓

priority

---

WordPress

theme_color

↓

theme_color

---

WordPress

campaign_banner

↓

banner

---

WordPress

campaign_thumbnail

↓

thumbnail

---

## Active Rule

Campaign dianggap ACTIVE apabila

campaign_active == true

DAN

today >= campaign_start

DAN

today <= campaign_end

Selain itu

↓

Inactive

---

## Do NOT

Jangan membuat field status manual.

Selalu hitung dari data WP.

---

Verification

Campaign Active di WP

↓

Campaign Active di Dashboard

100% identik.