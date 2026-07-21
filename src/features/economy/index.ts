export type {
  CurrencyType,
  EconomyConfig,
  SpendingPeriod,
  SpendingLimitResult,
  BalanceSnapshot,
  EconomyResult,
  XpSource,
  XpRule,
  XpMultiplier,
  XpCalculation,
  MultiplierBreakdown,
  EconomySetting,
} from "./types";

export {
  loadEconomyConfig,
  validateTransaction,
  recordSpending,
  calculateXP,
} from "./services/economyEngine";

export type { ValidateTransactionInput, ValidateTransactionResult, CalculateXPInput } from "./services/economyEngine";

export { computeMultiplier } from "./services/multiplierEngine";
export type { MultiplierInput, MultiplierResult } from "./services/multiplierEngine";

export { getEffectivePrice, applyQuantityPricing } from "./services/pricingEngine";
export type { PricedItem, PriceResult } from "./services/pricingEngine";

export {
  useEconomyConfig,
  useTransactionValidation,
  useXpRules,
  useActiveMultipliers,
  useAllMultipliers,
  useCalculateXP,
} from "./hooks/useEconomy";

export { XP_FALLBACKS, getFallbackXP, XP_SOURCE_LABELS } from "./sources";
