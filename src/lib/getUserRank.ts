export function getUserRank(vxp: number) {
  if (vxp >= 50000)
    return {
      level: 9,
      title: 'Voks Legend',
      min: 50000,
      max: Infinity,
    }

  if (vxp >= 25000)
    return {
      level: 8,
      title: 'Voks Royalty',
      min: 25000,
      max: 49999,
    }

  if (vxp >= 10000)
    return {
      level: 7,
      title: 'Voks Maniac',
      min: 10000,
      max: 24999,
    }

  if (vxp >= 4000)
    return {
      level: 6,
      title: 'Penguasa Gelombang',
      min: 4000,
      max: 9999,
    }

  if (vxp >= 1000)
    return {
      level: 5,
      title: 'Voks Addict',
      min: 1000,
      max: 3999,
    }

  if (vxp >= 750)
    return {
      level: 4,
      title: 'Penikmat Frekuensi',
      min: 750,
      max: 999,
    }

  if (vxp >= 500)
    return {
      level: 3,
      title: 'Voks Aktif',
      min: 500,
      max: 749,
    }

  if (vxp >= 100)
    return {
      level: 2,
      title: 'Teman Voks',
      min: 100,
      max: 499,
    }

  return {
    level: 1,
    title: 'Pendatang Baru',
    min: 0,
    max: 99,
  }
}