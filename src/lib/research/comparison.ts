import { isNum } from '@/lib/finance/core';
import type { PeerComparisonRow } from './types';

/* ==================================================================
   The peer comparison table.

   The product does not decide which measures matter in an industry.
   It supplies every metric it computes, lets the analyst pick the
   rows, and lets them add rows it cannot compute at all. Nothing here
   knows the name of a single sector.
   ================================================================== */

/** Every metric the platform can put in a comparison row. */
export const COMPARISON_METRICS: {
  key: string; label: string; format: PeerComparisonRow['format']; inverse?: boolean; group: string;
}[] = [
  { key: 'marketCap', label: 'Market capitalisation', format: 'currencyMillions', group: 'Size' },
  { key: 'enterpriseValue', label: 'Enterprise value', format: 'currencyMillions', group: 'Size' },
  { key: 'revenue', label: 'Revenue', format: 'currencyMillions', group: 'Size' },
  { key: 'ebitda', label: 'EBITDA', format: 'currencyMillions', group: 'Size' },

  { key: 'revenueGrowth', label: 'Revenue growth', format: 'percent', group: 'Growth' },
  { key: 'ebitdaGrowth', label: 'EBITDA growth', format: 'percent', group: 'Growth' },
  { key: 'revenueCagr3y', label: 'Revenue CAGR, 3 years', format: 'percent', group: 'Growth' },

  { key: 'grossMargin', label: 'Gross margin', format: 'percent', group: 'Profitability' },
  { key: 'ebitdaMargin', label: 'EBITDA margin', format: 'percent', group: 'Profitability' },
  { key: 'ebitMargin', label: 'EBIT margin', format: 'percent', group: 'Profitability' },
  { key: 'netMargin', label: 'Net margin', format: 'percent', group: 'Profitability' },

  { key: 'roic', label: 'ROIC', format: 'percent', group: 'Returns' },
  { key: 'roe', label: 'ROE', format: 'percent', group: 'Returns' },
  { key: 'roce', label: 'ROCE', format: 'percent', group: 'Returns' },
  { key: 'wacc', label: 'WACC', format: 'percent', inverse: true, group: 'Returns' },
  { key: 'roicSpread', label: 'ROIC − WACC', format: 'percent', group: 'Returns' },

  { key: 'netDebtToEbitda', label: 'Net debt / EBITDA', format: 'multiple', inverse: true, group: 'Leverage' },
  { key: 'debtToEquity', label: 'Debt / equity', format: 'multiple', inverse: true, group: 'Leverage' },
  { key: 'interestCoverage', label: 'Interest coverage', format: 'multiple', group: 'Leverage' },

  { key: 'capexToRevenue', label: 'Capex % of revenue', format: 'percent', inverse: true, group: 'Capital intensity' },
  { key: 'fcfConversion', label: 'FCF conversion', format: 'percent', group: 'Capital intensity' },
  { key: 'cashConversionCycle', label: 'Cash conversion cycle', format: 'number', inverse: true, group: 'Capital intensity' },
  { key: 'assetTurnover', label: 'Asset turnover', format: 'multiple', group: 'Capital intensity' },

  { key: 'evEbitda', label: 'EV / EBITDA', format: 'multiple', inverse: true, group: 'Valuation' },
  { key: 'evEbit', label: 'EV / EBIT', format: 'multiple', inverse: true, group: 'Valuation' },
  { key: 'pe', label: 'P / E', format: 'multiple', inverse: true, group: 'Valuation' },
  { key: 'pb', label: 'P / Book', format: 'multiple', inverse: true, group: 'Valuation' },
  { key: 'fcfYield', label: 'FCF yield', format: 'percent', group: 'Valuation' },
  { key: 'dividendYield', label: 'Dividend yield', format: 'percent', group: 'Valuation' },

  { key: 'return12m', label: '12-month return', format: 'percent', group: 'Market' },
  { key: 'volatility', label: 'Volatility', format: 'percent', inverse: true, group: 'Market' },
  { key: 'beta', label: 'Beta', format: 'multiple', group: 'Market' },
];

/** The least a company has to expose to sit in a comparison. */
export interface ComparableCompany {
  ticker: string;
  bankLike: boolean;
}

export interface ComparisonCell {
  ticker: string;
  value: number | string | null;
  /** Rank inside the row, 1 being best under the row's own direction. */
  rank: number | null;
  /** Where it sits in the row, 0 to 1, for the bar. */
  position: number | null;
  /** True when a measure is not meaningful for this company. */
  notMeaningful: boolean;
}

export interface ComparisonRowResult extends PeerComparisonRow {
  cells: ComparisonCell[];
  median: number | null;
  /** Companies excluded because the measure is not meaningful for them. */
  excluded: string[];
}

/**
 * Measures that mean nothing for a bank-like company, whatever the sector.
 * This is not a sector rule: it is the same test the rest of the platform
 * applies wherever enterprise value or invested capital is undefined.
 */
export const NOT_MEANINGFUL_FOR_BANKS = new Set([
  'enterpriseValue', 'evEbitda', 'evEbit', 'evRevenue', 'roic', 'roicSpread',
  'netDebtToEbitda', 'capexToRevenue', 'assetTurnover', 'cashConversionCycle',
  'ebitdaMargin', 'ebitda', 'ebitdaGrowth', 'interestCoverage', 'fcfConversion',
]);

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = sorted.length / 2;
  return sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Builds the comparison table. A row reads only the companies for which the
 * measure means something: including a bank's EV/EBITDA to make the table
 * rectangular would be worse than leaving the cell empty.
 */
export function buildComparison<T extends ComparableCompany>(
  rows: PeerComparisonRow[],
  tickers: string[],
  metrics: Map<string, T>,
): ComparisonRowResult[] {
  return rows.map((row) => {
    const excluded: string[] = [];

    const cells: ComparisonCell[] = tickers.map((ticker) => {
      const m = metrics.get(ticker);
      if (row.kind === 'MANUAL') {
        return { ticker, value: row.values?.[ticker] ?? null, rank: null, position: null, notMeaningful: false };
      }
      if (!m || !row.metric) return { ticker, value: null, rank: null, position: null, notMeaningful: false };

      if (m.bankLike && NOT_MEANINGFUL_FOR_BANKS.has(row.metric)) {
        excluded.push(ticker);
        return { ticker, value: null, rank: null, position: null, notMeaningful: true };
      }
      const raw = (m as unknown as Record<string, number | null>)[row.metric] ?? null;
      return { ticker, value: isNum(raw) ? raw : null, rank: null, position: null, notMeaningful: false };
    });

    const numeric = cells
      .filter((c) => typeof c.value === 'number')
      .map((c) => ({ ticker: c.ticker, value: c.value as number }));

    if (numeric.length > 1) {
      const sorted = numeric.slice().sort((a, b) => (row.inverse ? a.value - b.value : b.value - a.value));
      const min = Math.min(...numeric.map((n) => n.value));
      const max = Math.max(...numeric.map((n) => n.value));
      const span = max - min;
      for (const cell of cells) {
        if (typeof cell.value !== 'number') continue;
        cell.rank = sorted.findIndex((s) => s.ticker === cell.ticker) + 1;
        const raw = span === 0 ? 0.5 : (cell.value - min) / span;
        cell.position = row.inverse ? 1 - raw : raw;
      }
    }

    return { ...row, cells, median: median(numeric.map((n) => n.value)), excluded };
  });
}
