# Roadmap Mission & Reward — VOKS NEXT

## Visi

PWA VOKS NEXT: streaming audio/video + user login sebagai pendengar.
User login → Mission → VXP (Voks Experience Point) → Reward Store → Redeem hadiah.

`lifetime_vxp` sebagai acuan badge/level user (tidak pernah turun).
`current_vxp` sebagai saldo redeem (bisa berkurang saat redeem).

```
Flow: Sign Up → Mission (daily checkin, listen, share, referral, profile)
      → Dapat VXP (current_vxp + lifetime_vxp naik)
      → Reward Store → Redeem (current_vxp turun, lifetime_vxp tetap)
      → lifetime_vxp naik → Badge naik (Pendatang Baru → Teman Voks → ... → Voks Legend)
```

## Milestone

| Phase | Nama | Estimasi | Status |
|-------|------|----------|--------|
| 0 | Fix RLS — System update lewat RPC | 30m | ⏳ |
| 1 | Referral Code "voks-XXXX" + route /ref/:code | 1hr | ⏳ |
| 2 | New ACF Time Fields (time_start/time_end) | 1hr | ⏳ |
| 3 | Bug Fixes (claim, cache, parseTime) | 1hr | ⏳ |
| 4 | Reward Store verifikasi end-to-end | 1hr | ⏳ |
| 5 | Update AI docs | 30m | ⏳ |

## Badge Level (berdasarkan lifetime_vxp)

| Rentang lifetime_vxp | Badge |
|----------------------|-------|
| 0 – 99 | Pendatang Baru |
| 100 – 499 | Teman Voks |
| 500 – 749 | Voks Aktif |
| 750 – 999 | Penikmat Frekuensi |
| 1.000 – 3.999 | Voks Addict |
| 4.000 – 9.999 | Penguasa Gelombang |
| 10.000 – 24.999 | Voks Maniac |
| 25.000 – 49.999 | Voks Royalty |
| ≥ 50.000 | Voks Legend |

## Reward Redeem — VXP Flow

```
Redeem hadiah:
  current_vxp = current_vxp - harga_reward  (Turun)
  lifetime_vxp = lifetime_vxp                (Tetap, badge gak turun)

Menyelesaikan mission:
  current_vxp = current_vxp + reward         (Naik)
  lifetime_vxp = lifetime_vxp + reward       (Naik, badge naik)
```
