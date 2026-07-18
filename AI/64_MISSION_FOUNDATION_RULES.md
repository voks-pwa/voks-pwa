# Mission Foundation Rules v1.0

## Rule 1

Mission Definition berasal dari WordPress CPT.

Mission Logic berasal dari Action Engine.

Mission State berasal dari Mission Engine.

Reward berasal dari Reward Engine.

---

## Rule 2

Mission Engine tidak mengetahui UI.

Mission Engine hanya mengetahui:

Mission

Validator

Action

Reward

---

## Rule 3

Action Engine adalah satu-satunya pintu masuk progress mission.

Semua progress harus melalui:

trackAction()

---

## Rule 4

Mission tidak boleh mengandung business logic.

Business logic berada pada Validator.

---

## Rule 5

Mission tidak boleh memberikan reward langsung.

Reward hanya melalui Reward Engine.

---

## Rule 6

Mission History immutable.

Tidak boleh diedit.

Tidak boleh dihapus.

---

## Rule 7

Mission Repeat mengikuti ACF.

mission_repeat=true

↓

Reset Scheduler

mission_repeat=false

↓

Satu kali seumur hidup.

---

## Rule 8

Mission Visibility mengikuti State Machine.

Tidak berdasarkan UI.

---

Mission Engine telah dianggap stable setelah Sprint 8.7 selesai.