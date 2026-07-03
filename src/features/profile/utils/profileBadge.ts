export function getBadgeName(
  xp: number
) {

  if (xp >= 50000)
    return "Legend";

  if (xp >= 20000)
    return "Master";

  if (xp >= 10000)
    return "Elite";

  if (xp >= 5000)
    return "Expert";

  if (xp >= 1000)
    return "Explorer";

  return "Pendatang Baru";

}