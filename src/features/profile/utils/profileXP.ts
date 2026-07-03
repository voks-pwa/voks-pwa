export function getLevelFromXP(
  lifetimeXP: number
) {

  const level =
    Math.floor(lifetimeXP / 1000) + 1;

  const current =
    lifetimeXP % 1000;

  return {

    level,

    current,

    next: 1000,

    progress:
      (current / 1000) * 100,

  };

}