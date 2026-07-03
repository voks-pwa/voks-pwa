export function calculateBadge(
  lifetimeVxp: number,
  role?: string
) {

  switch (role) {

    case "superadmin":
      return "Super Admin";

    case "admin":
      return "Admin";

    case "announcer":
      return "Penyiar";

  }

  if (lifetimeVxp >= 50000)
    return "Voks Legend";

  if (lifetimeVxp >= 25000)
    return "Voks VIP";

  if (lifetimeVxp >= 10000)
    return "Voks Maniac";

  if (lifetimeVxp >= 4000)
    return "Penguasa Gelombang";

  if (lifetimeVxp >= 1000)
    return "Voks Addict";

  if (lifetimeVxp >= 750)
    return "Penikmat Frekuensi";

  if (lifetimeVxp >= 500)
    return "Voks Aktif";

  if (lifetimeVxp >= 100)
    return "Teman Voks";

  return "Pendatang Baru";

}