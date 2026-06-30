export function getLevelProgress(
  xp: number
) {

  const levels = [
    0,
    100,
    250,
    500,
    1000,
  ]

  let currentLevel = 1

  for (
    let i = 0;
    i < levels.length;
    i++
  ) {
    if (xp >= levels[i]) {
      currentLevel = i + 1
    }
  }

  const currentXP =
    levels[currentLevel - 1]

  const nextXP =
    levels[currentLevel] ??
    levels[currentLevel - 1]

  const progress =
    currentLevel >= 5
      ? 100
      : (
          (
            xp - currentXP
          ) /
          (
            nextXP - currentXP
          )
        ) * 100

  return {
    currentLevel,
    currentXP,
    nextXP,
    progress,
  }
}