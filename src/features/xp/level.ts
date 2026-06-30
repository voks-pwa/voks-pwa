export function getLevel(
  xp: number
) {

  return Math.floor(
    xp / 100
  ) + 1
}