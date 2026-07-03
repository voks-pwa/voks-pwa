export interface LevelProgress {
  level: number;
  currentXP: number;
  nextXP: number;
  progress: number;
}

const LEVELS = [
  0,
  100,
  250,
  500,
  1000,
  2000,
  4000,
  7000,
  10000,
  15000,
  25000,
  50000,
];

export function calculateLevel(
  lifetimeXP: number
): LevelProgress {

  let level = 1;

  for (let i = 0; i < LEVELS.length; i++) {

    if (lifetimeXP >= LEVELS[i]) {

      level = i + 1;

    }

  }

  const currentXP =
    LEVELS[level - 1];

  const nextXP =
    LEVELS[level] ??
    currentXP;

  const progress =
    level >= LEVELS.length
      ? 100
      : (
          (lifetimeXP - currentXP) /
          (nextXP - currentXP)
        ) * 100;

  return {

    level,

    currentXP,

    nextXP,

    progress,

  };

}