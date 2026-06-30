export function getBadge(
  lifetimeXP: number
) {

  if (lifetimeXP >= 50000)
    return 'Voks Legend'

  if (lifetimeXP >= 25000)
    return 'Voks VIP'

  if (lifetimeXP >= 10000)
    return 'Voks Maniac'

  if (lifetimeXP >= 4000)
    return 'Penguasa Gelombang'

  if (lifetimeXP >= 1000)
    return 'Voks Addict'

  if (lifetimeXP >= 750)
    return 'Penikmat Frekuensi'

  if (lifetimeXP >= 500)
    return 'Voks Aktif'

  if (lifetimeXP >= 100)
    return 'Teman Voks'

  return 'Pendatang Baru'
}