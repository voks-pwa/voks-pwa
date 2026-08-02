// Update getBadgeName to match exact BADGE_LEVEL_USER.md thresholds (already matches)
// Keeping this function as-is since it already matches BADGE_LEVEL_USER.md
export function getBadgeName(
  xp: number
) {

  if (xp >= 50000 && xp < Infinity)
    return "Voks Legend";

  if (xp >= 25000 && xp <= 49999)
    return "Voks Royalty";

  if (xp >= 10000 && xp <= 24999)
    return "Voks Maniac";

  if (xp >= 4000 && xp <= 9999)
    return "Penguasa Gelombang";

  if (xp >= 1000 && xp <= 3999)
    return "Voks Addict";

  if (xp >= 750 && xp <= 999)
    return "Penikmat Frekuensi";

  if (xp >= 500 && xp <= 749)
    return "Voks Aktif";

  if (xp >= 100 && xp <= 499)
    return "Teman Voks";

  if (xp >= 0 && xp <= 99)
    return "Pendatang Baru";

  return "Pendatang Baru";

}
