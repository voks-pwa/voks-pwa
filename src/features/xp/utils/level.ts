export interface LevelProgress {
  level: number;
  currentXP: number;
  nextXP: number;
  progress: number;
}

const LEVELS = [
  0,      // Level 1: 0 XP
  100,    // Level 2: 100 XP
  500,    // Level 3: 500 XP
  750,    // Level 4: 750 XP
  1000,   // Level 5: 1000 XP
  4000,   // Level 6: 4000 XP
  10000,  // Level 7: 10000 XP
  25000,  // Level 8: 25000 XP
  50000,  // Level 9: 50000 XP
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