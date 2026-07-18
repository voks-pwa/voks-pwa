# Action Events Specification

Every user activity generates one event.

---

PROFILE_COMPLETED

payload

user_id

completed_at

---

CHECKIN

payload

user_id

date

---

LISTEN_STARTED

payload

user_id

station

program

timestamp

---

LISTEN_COMPLETED

payload

user_id

minutes

program

---

SHARE

payload

user_id

share_type

target

url

timestamp

---

REFERRAL_SUCCESS

payload

referrer_id

referred_id

timestamp

---

LIVE_REACTION

payload

user_id

emoji

live_session

---

LIVE_CHAT

payload

user_id

message_id

---

POLL_VOTE

payload

user_id

poll_id

option

---

REWARD_CLAIMED

payload

user_id

reward_id

---

PROMO_OPENED

payload

user_id

promo_id

---

PROGRAM_OPENED

payload

user_id

program_id

---

HOST_OPENED

payload

user_id

host_id

---

Future

EVENT_QR_SCAN

SPONSOR_CLICK

STORE_PURCHASE

VIDEO_WATCH

ARTICLE_READ

NEWS_SHARE

LIVE_GIVEAWAY

All reuse same Action Engine.