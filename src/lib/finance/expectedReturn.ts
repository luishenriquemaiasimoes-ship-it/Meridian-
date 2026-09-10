import { isNum, safeDiv } from './core';

/* ==============  VALUATION BRIDGE / EXPECTED RETURN  ============== */

export interface ValuationBridgeInput {
  currentPrice: number;
  /** Expected annualised earnings (or FCF) growth over the horizon. */
  earningsGrowth: number;
  /** Current and expected exit multiple on the same metric. */
  currentMultiple: number | null;
  exitMultiple: number | null;
  dividendYield: number;
  /** Positive = dilution (share count up), negative = buyback. */
  shareCountChange: number;
  years: number;
}

export interface ValuationBridgeResult {
  startPrice: number;
  earningsGrowthContribution: number | null;
  multipleChangeContribution: number | null;
  dividendContribution: number | null;
  dilutionContribution: number | null;
  endPrice: number | null;
  totalReturn: number | null;
  annualizedReturn: number | null;
  years: number;
}

/**
 * Decomposes expected return into growth, re-rating, income and dilution.
 * Contributions are expressed in price units so they add up to the end price.
 */
export function valuationBridge(i: ValuationBridgeInput): ValuationBridgeResult {
  const { currentPrice: p0, years } = i;
  if (!isNum(p0) || p0 <= 0 || years <= 0) {
    return {
      startPrice: p0, earningsGrowthContribution: null, multipleChangeContribution: null,
      dividendContribution: null, dilutionContribution: null, endPrice: null,
      totalReturn: null, annualizedReturn: null, years,
    };
  }

  const growthFactor = (1 + i.earningsGrowth) ** years;
  const priceAfterGrowth = p0 * growthFactor;
  const earningsGrowthContribution = priceAfterGrowth - p0;

  const multipleRatio =
    isNum(i.currentMultiple) && isNum(i.exitMultiple) && (i.currentMultiple as number) !== 0
      ? (i.exitMultiple as number) / (i.currentMultiple as number)
      : 1;
  const priceAfterRerating = priceAfterGrowth * multipleRatio;
  const multipleChangeContribution = priceAfterRerating - priceAfterGrowth;

  const dilutionFactor = 1 / (1 + i.shareCountChange) ** years;
  const endPrice = priceAfterRerating * dilutionFactor;
  const dilutionContribution = endPrice - priceAfterRerating;

  const dividendContribution = p0 * i.dividendYield * years;

  const totalReturn = (endPrice + dividendContribution) / p0 - 1;
  const annualizedReturn = (1 + totalReturn) ** (1 / years) - 1;

  return {
    startPrice: p0,
    earningsGrowthContribution,
    multipleChangeContribution,
    dividendContribution,
    dilutionContribution,
    endPrice,
    totalReturn,
    annualizedReturn,
    years,
  };
}

export interface ExpectedReturnInput {
  currentPrice: number;
  targetPrice: number | null;
  dividendYield: number;
  years: number;
}

export interface ExpectedReturnResult {
  priceAppreciation: number | null;
  dividendYield: number;
  totalReturn: number | null;
  annualizedReturn: number | null;
}

export function expectedReturn(i: ExpectedReturnInput): ExpectedReturnResult {
  const appreciation = safeDiv(
    isNum(i.targetPrice) ? (i.targetPrice as number) - i.currentPrice : null,
    i.currentPrice,
  );
  if (!isNum(appreciation)) {
    return { priceAppreciation: null, dividendYield: i.dividendYield, totalReturn: null, annualizedReturn: null };
  }
  const years = i.years > 0 ? i.years : 1;
  const total = (appreciation as number) + i.dividendYield * years;
  const annualized = (1 + total) ** (1 / years) - 1;
  return {
    priceAppreciation: appreciation,
    dividendYield: i.dividendYield,
    totalReturn: total,
    annualizedReturn: annualized,
  };
}
