# AI/44_DEEPLINK_RULES.md

## Purpose

Semua fitur pada VOKS PWA yang membuka URL harus menggunakan helper global.

Tidak boleh lagi ada logic parsing URL di masing-masing component.

---

# Global Helper

Seluruh project wajib menggunakan:

src/utils/deepLink.ts

Helper ini menjadi single source of truth.

Semua component harus memanggil helper tersebut.

Contoh penggunaan:

* Promo Banner
* Notification
* Mission
* Reward
* VOKS+
* Podcast
* Banner Sponsor
* Future Advertisement
* External CTA

---

# URL Rules

Helper harus mengenali seluruh variasi URL berikut.

Valid

https://example.com

Valid

http://example.com

Valid

https:/example.com

Valid

http:/example.com

Valid

[www.example.com](http://www.example.com)

Valid

tk.tokopedia.com/xxxx

Valid

instagram.com/xxxx

Valid

youtube.com/xxxx

Valid

youtu.be/xxxx

Valid

wa.me/xxxx

Valid

mailto:

Valid

tel:

---

# Normalization

Jika URL hanya memiliki satu slash

https:/example.com

helper harus otomatis mengubah menjadi

https://example.com

Jika URL diawali [www](http://www).

otomatis menjadi

https://www....

Jika URL tidak memiliki protocol

helper menambahkan

https://

---

# Internal Route

Jika hostname adalah

voksradio.com

atau

app.voksradio.com

maka helper harus membuka Internal Route apabila route tersedia.

Jika route tidak tersedia maka buka browser.

---

# External URL

Semua domain selain milik VOKS dianggap external.

Harus menggunakan

window.open(url,"_blank","noopener,noreferrer")

---

# Invalid URL

Jika parsing gagal

jangan crash.

Tampilkan warning

Invalid Deep Link

dan abaikan action.

---

# Forbidden

Tidak boleh lagi ada:

window.location

navigate(url)

if(url.startsWith(...))

regex URL di component

Semua wajib melalui helper.

---

# Verification

AI harus memastikan:

✓ Tokopedia URL berjalan

✓ Tokopedia Affiliate berjalan

✓ Instagram berjalan

✓ YouTube berjalan

✓ Website VOKS berjalan

✓ Internal Route tetap bekerja

✓ Tidak ada localhost/https:/... lagi

Baru kemudian update CHANGELOG.
