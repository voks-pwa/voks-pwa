import {
  getEconomyConfig,
  checkSpendingLimit,
  logSpending,
  getXpRule,
  getDailyEarnings,
  getUserBalance,
} from "../repositories/economyRepository";
import { getCanonicalUser } from "@/features/profile/services/userCanonicalService";
import { getFallbackXP } from "../sources";
import { computeMultiplier } from "./multiplierEngine";
import type { CurrencyType, EconomyConfig, SpendingLimitResult, XpCalculation, XpSource } from "../types";

export interface ValidateTransactionInput {
  userId: string;
  amount: number;
  currencyType?: CurrencyType;
}

export interface ValidateTransactionResult {
  allowed: boolean;
  error?: string;
  hasSufficientBalance: boolean;
  spendingLimit?: SpendingLimitResult;
  config?: EconomyConfig;
}

export interface CalculateXPInput {
  source: XpSource;
  userId: string;
  context?: Record<string, unknown>;
}

export async function loadEconomyConfig(): Promise<EconomyConfig | null> {
  return getEconomyConfig();
}

export async function validateTransaction(
  input: ValidateTransactionInput,
): Promise<ValidateTransactionResult> {
  const { userId, amount, currencyType = "VXP" } = input;

  const [config, limit] = await Promise.all([
    getEconomyConfig(),
    amount < 0 ? checkSpendingLimit(userId, Math.abs(amount), currencyType) : Promise.resolve(null),
  ]);

  if (!config) {
    return {
      allowed: false,
      error: "Economy config not available",
      hasSufficientBalance: false,
    };
  }

  if (amount < 0) {
    if (limit && !limit.allowed) {
      return {
        allowed: false,
        error: `Spending limit exceeded: ${limit.wouldExceed}`,
        hasSufficientBalance: true,
        spendingLimit: limit,
        config,
      };
    }

    // Balance check before debit
    const balance = await getUserBalance(userId);
    const absAmount = Math.abs(amount);
    if (balance < absAmount) {
      return {
        allowed: false,
        error: `Insufficient balance: ${balance} < ${absAmount}`,
        hasSufficientBalance: false,
        spendingLimit: limit ?? undefined,
        config,
      };
    }
  }

  if (amount >= 0) {
    const minBalance = config.VXP_MIN_BALANCE_FOR_REDEMPTION;
    const canonical = await getCanonicalUser(userId);

    if (canonical.wallet.balance < minBalance && amount > 0) {
      return {
        allowed: true,
        hasSufficientBalance: true,
        spendingLimit: limit ?? undefined,
        config,
      };
    }
  }

  return {
    allowed: true,
    hasSufficientBalance: true,
    spendingLimit: limit ?? undefined,
    config,
  };
}

export async function recordSpending(
  userId: string,
  amount: number,
  currencyType: CurrencyType = "VXP",
): Promise<boolean> {
  if (amount >= 0) return true;
  return logSpending(userId, Math.abs(amount), currencyType);
}

export async function calculateXP(input: CalculateXPInput): Promise<XpCalculation> {
  const { source, userId } = input;

  let baseXP: number;
  let fromFallback = false;

  const rule = await getXpRule(source);

  if (rule && rule.enabled) {
    baseXP = rule.base_xp;
  } else {
    baseXP = getFallbackXP(source);
    fromFallback = true;
  }

  const canonical = await getCanonicalUser(userId);
  const userLevel = canonical.level ?? 1;

  const multiplierResult = await computeMultiplier({
    userId,
    baseXP,
    userLevel,
  });

  let finalXP = Math.round(baseXP * multiplierResult.finalMultiplier);

  // Enforce daily earning cap
  const config = await getEconomyConfig();
  if (config) {
    const cap = config.VXP_EARNING_DAILY_CAP;
    const earned = await getDailyEarnings(userId);
    const available = Math.max(0, cap - earned);
    if (finalXP > available) {
      finalXP = available;
    }
  }

  return {
    source,
    baseXP,
    multiplier: multiplierResult.finalMultiplier,
    bonus: multiplierResult.bonus,
    finalXP,
    breakdown: multiplierResult.breakdown,
    fromFallback,
  };
}
