# Reward Engine v1.0

Purpose

Reward Engine adalah single source of truth untuk seluruh pemberian reward.

Semua reward HARUS melewati Reward Engine.

Tidak ada module lain yang boleh langsung:

- insert vxp_transactions
- update current_vxp
- update lifetime_vxp
- grant badge
- grant achievement

Semua dilakukan melalui Reward Engine.

--------------------------------

Reward Sources

Mission

Campaign

Referral

Daily Login

Achievement

Badge

Milestone

Profile Complete

Admin Bonus

--------------------------------

Reward Flow

Trigger

↓

Reward Guard

↓

Duplicate Check

↓

Grant Reward

↓

Insert Transaction

↓

Update XP

↓

Emit Event

↓

DONE

--------------------------------

Reward Guard

Reward Guard melakukan validasi:

- reward sudah pernah?
- cooldown?
- repeatable?
- campaign aktif?
- mission valid?
- user eligible?

Jika gagal

STOP

Tidak boleh menghasilkan transaction.

--------------------------------

Idempotency

Semua reward harus idempotent.

Rule

Same User

+

Same Reward

+

Same Reference

=

Maximum 1 Transaction

--------------------------------

Repeatable Reward

Daily

maksimal 1 per hari

Mission Repeat

sesuai mission_repeat

Referral

1 referral = 1 reward

Profile Complete

1 akun = 1 reward seumur hidup

Milestone

1 milestone = 1 reward

Badge

1 badge = 1 reward

Achievement

1 achievement = 1 reward