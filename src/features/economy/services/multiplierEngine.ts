import { getActiveMultipliers, getEconomySetting } from "../repositories/economyRepository";
import type { MultiplierBreakdown } from "../types";

export interface MultiplierInput {
  userId: string;
  baseXP: number;
  userLevel?: number;
  isVIP?: boolean;
}

export interface MultiplierResult {
  finalMultiplier: number;
  bonus: number;
  breakdown: MultiplierBreakdown[];
}

export async function computeMultiplier(input: MultiplierInput): Promise<MultiplierResult> {
  const { baseXP, userLevel = 1 } = input;

  const multipliers = await getActiveMultipliers();
  const globalSetting = await getEconomySetting("global_multiplier");
  const globalMultiplier = globalSetting ? Number(globalSetting) : 1.0;

  let cumulativeMultiplier = 1.0;
  const breakdown: MultiplierBreakdown[] = [];

  breakdown.push({
    slug: "global-default",
    title: "Global Default",
    type: "global",
    value: globalMultiplier,
  });
  cumulativeMultiplier *= globalMultiplier;

  for (const m of multipliers) {
    if (!m.enabled) continue;
    if (m.slug === "global-default") continue;

    if (m.type === "level" && userLevel > 0) {
      const levelBonus = 1 + (m.multiplier * Math.floor(userLevel / 10));
      breakdown.push({
        slug: m.slug,
        title: m.title,
        type: m.type,
        value: levelBonus,
      });
      cumulativeMultiplier *= levelBonus;
      continue;
    }

    if (m.start_date && m.end_date) {
      const now = new Date().toISOString();
      if (now < m.start_date || now > m.end_date) continue;
    }

    breakdown.push({
      slug: m.slug,
      title: m.title,
      type: m.type,
      value: m.multiplier,
    });
    cumulativeMultiplier *= m.multiplier;
  }

  const finalMultiplier = Math.max(0.1, cumulativeMultiplier);
  const finalXP = Math.round(baseXP * finalMultiplier);
  const bonus = finalXP - baseXP;

  return {
    finalMultiplier,
    bonus,
    breakdown,
  };
}
