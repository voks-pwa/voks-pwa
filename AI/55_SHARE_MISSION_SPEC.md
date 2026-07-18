# Share Mission Specification

Mission

Share VOKS Next

Mission Action

share

Source

WordPress Mission CPT

mission_action = share

---

Behaviour

When user taps

Join Mission

↓

Open native Share dialog

Use Web Share API

navigator.share()

---

Share Data

Title

VOKS NEXT

Text

Yuk dengerin radio digital Bandung di VOKS NEXT!

URL

https://app.voksradio.com

---

Fallback

If Web Share API unavailable

↓

Copy Link

↓

Toast

"Link berhasil disalin"

---

Validation

Mission becomes READY_TO_CLAIM only after

Share API completed

OR

Copy Link completed

---

History

Mission History

Share VOKS Next

Completed

Reward

50 VXP

Date

...

---

Future

Allow campaign specific share links

Sponsor share

Referral share

Program share

Promo share

All reuse same Share Engine.