# Mission Engine Contract

Mission Engine bertanggung jawab terhadap:

✔ State

✔ Lifecycle

✔ Validator Execution

✔ Reward Trigger

✔ History Trigger

Mission Engine TIDAK bertanggung jawab terhadap:

✖ UI

✖ React

✖ Button

✖ Animation

✖ Page

✖ Navigation

---

Action Engine

Only producer.

Reward Engine

Only reward processor.

History

Only recorder.

UI

Only renderer.

---

Dependency Rule

UI

↓

Mission Hook

↓

Mission Engine

↓

Action Engine

↓

Validator

↓

Reward Engine

↓

History

Tidak boleh ada dependency terbalik.