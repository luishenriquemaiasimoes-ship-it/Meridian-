import { isNum, safeDiv, median } from './core';
import { calculateWacc, costOfEquity, leveredBeta, unleveredBeta } from './wacc';

/* ==================================================================
   Institutional WACC build.

   The plain `wacc.ts` module does the arithmetic. This module does the
   part that actually goes wrong in practice: which risk-free rate, in
   which terms, with which premia, against which capital structure —
   and it says so out loud, with a source on every input.
   ================================================================== */

export type RateBasis = 'NOMINAL' | 'REAL';
export type BetaMethod = 'OBSERVED' | 'BOTTOM_UP';
export type DebtBasis = 'NET_DEBT' | 'GROSS_DEBT';

/** Every WACC input carries where it came from and when. */
export interface SourcedInput<T = number> {
  value: T;
  /** Free text naming the instrument, vendor or filing, e.g. "NTN-F 2031". */
  source: string;
  /** ISO date the figure was observed. */
  asOf: string | null;
}

export interface RiskFreeInput extends SourcedInput {
  /** Whether the quoted rate is nominal or inflation-linked (real). */
  basis: RateBasis;
  /** Expected inflation, required to convert a real rate to nominal. */
  inflation?: number | null;
  /** Instrument name, e.g. "NTN-F" or "NTN-B". */
  instrument?: string | null;
}

export interface PeerBeta {
  ticker: string;
  /** Levered (observed) beta for the peer. */
  leveredBeta: number;
  debtToEquity: number;
  taxRate: number;
}

export interface WaccBuildInput {
  /** Valuation currency; drives the country-premium check. */
  currency: string;
  /** True when the equity risk premium is quoted for a developed market. */
  erpIsDevelopedMarket?: boolean;

  riskFree: RiskFreeInput;
  equityRiskPremium: SourcedInput;
  countryRiskPremium?: SourcedInput | null;
  sizePremium?: SourcedInput | null;

  betaMethod: BetaMethod;
  /** Beta regressed against a benchmark over a stated window. */
  observedBeta?: (SourcedInput & { window?: string | null; benchmark?: string | null }) | null;
  /** Peer set used to build a bottom-up beta. */
  peerBetas?: PeerBeta[];
  /** Capital structure the bottom-up beta is re-levered to. */
  targetDebtToEquity?: number | null;

  costOfDebt: SourcedInput & { basis?: 'REPORTED' | 'SPREAD' | 'YTM' | null };
  taxRate: SourcedInput;

  /** Market value of equity: price x shares. Never book value. */
  marketValueEquity: SourcedInput;
  /** Debt at the basis below. */
  debt: SourcedInput & { basis: DebtBasis };
  /** Cash netted off when `debt.basis` is NET_DEBT, for the disclosure. */
  cash?: number | null;

  /** Long-run structure the analyst declares, for the drift check. */
  targetEquityWeight?: number | null;

  /** Why this build looks the way it does. Required to save. */
  rationale?: string | null;
}

export type CheckSeverity = 'ERROR' | 'WARNING' | 'INFO';

export interface WaccCheck {
  id: string;
  severity: CheckSeverity;
  title: string;
  detail: string;
  /** What to do about it, in the analyst's terms. */
  remedy: string;
  /** True when the analyst has knowingly overridden the check. */
  overridden?: boolean;
}

export interface BetaComparison {
  observed: number | null;
  bottomUp: number | null;
  /** Median unlevered beta of the peer set. */
  peerMedianUnlevered: number | null;
  peerCount: number;
  /** D/E the bottom-up beta was re-levered to. */
  releveredAt: number | null;
  /** The one actually used, and which method produced it. */
  used: number | null;
  usedMethod: BetaMethod;
  /** Gap between the two methods, when both are available. */
  spread: number | null;
}

export interface WaccBuildResult {
  /** Risk-free rate in nominal terms, whatever was supplied. */
  riskFreeNominal: number | null;
  /** The rate exactly as supplied, before any conversion. */
  riskFreeAsSupplied: number | null;
  riskFreeConverted: boolean;

  beta: BetaComparison;

  costOfEquity: number | null;
  costOfDebtPreTax: number | null;
  costOfDebtAfterTax: number | null;
  taxRate: number | null;

  equityWeight: number | null;
  debtWeight: number | null;
  debtToEquity: number | null;
  wacc: number | null;

  /** One row per component, for the build summary card. */
  components: {
    key: string;
    label: string;
    value: number | null;
    format: 'percent' | 'ratio' | 'currency';
    source: string;
    asOf: string | null;
    note?: string;
  }[];

  checks: WaccCheck[];
  input: WaccBuildInput;
}

/** Fisher: (1 + nominal) = (1 + real) x (1 + inflation). */
export function fisherNominal(realRate: number, inflation: number): number | null {
  if (!isNum(realRate) || !isNum(inflation)) return null;
  return (1 + realRate) * (1 + inflation) - 1;
}

export function fisherReal(nominalRate: number, inflation: number): number | null {
  if (!isNum(nominalRate) || !isNum(inflation)) return null;
  if (1 + inflation === 0) return null;
  return (1 + nominalRate) / (1 + inflation) - 1;
}

/**
 * Bottom-up beta: unlever each peer at its own capital structure and tax rate,
 * take the median, and re-lever to the subject's structure. The median rather
 * than the mean, because one peer with an extreme structure should not set the
 * beta for the sector.
 */
export function bottomUpBeta(peers: PeerBeta[], targetDebtToEquity: number, targetTaxRate: number): {
  unleveredMedian: number | null;
  relevered: number | null;
  perPeer: { ticker: string; levered: number; unlevered: number | null }[];
} {
  const perPeer = (peers ?? []).map((p) => ({
    ticker: p.ticker,
    levered: p.leveredBeta,
    unlevered: unleveredBeta(p.leveredBeta, p.debtToEquity, p.taxRate),
  }));
  const usable = perPeer.map((p) => p.unlevered).filter(isNum) as number[];
  const unleveredMedian = usable.length ? median(usable) : null;
  const relevered =
    isNum(unleveredMedian) && isNum(targetDebtToEquity) && isNum(targetTaxRate)
      ? leveredBeta(unleveredMedian as number, targetDebtToEquity, targetTaxRate)
      : null;
  return { unleveredMedian, relevered, perPeer };
}

/** Currencies whose equity risk premium is normally quoted for a developed market. */
const DEVELOPED_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'JPY', 'CHF']);

export function buildWaccInstitutional(input: WaccBuildInput): WaccBuildResult {
  const checks: WaccCheck[] = [];

  /* ------------------------------ Risk free ------------------------------ */
  const supplied = isNum(input.riskFree?.value) ? input.riskFree.value : null;
  let riskFreeNominal = supplied;
  let riskFreeConverted = false;

  if (input.riskFree?.basis === 'REAL') {
    const inflation = input.riskFree.inflation;
    if (isNum(supplied) && isNum(inflation)) {
      riskFreeNominal = fisherNominal(supplied as number, inflation as number);
      riskFreeConverted = true;
      checks.push({
        id: 'rf-converted',
        severity: 'INFO',
        title: 'Risk-free rate converted to nominal',
        detail: `${input.riskFree.instrument ?? 'The quoted instrument'} is inflation-linked, so ${(supplied as number * 100).toFixed(2)}% real was converted at ${(inflation as number * 100).toFixed(2)}% inflation to ${((riskFreeNominal as number) * 100).toFixed(2)}% nominal.`,
        remedy: 'Check that the rest of the model is in nominal terms. A real rate against nominal cash flows understates the discount rate.',
      });
    } else {
      riskFreeNominal = null;
      checks.push({
        id: 'rf-real-no-inflation',
        severity: 'ERROR',
        title: 'Inflation-linked rate with no inflation assumption',
        detail: `${input.riskFree?.instrument ?? 'The instrument'} quotes a real rate, and no expected inflation was supplied to convert it.`,
        remedy: 'Supply expected inflation, or quote a nominal instrument instead.',
      });
    }
  }

  if (!isNum(riskFreeNominal)) {
    checks.push({
      id: 'rf-missing',
      severity: 'ERROR',
      title: 'No risk-free rate',
      detail: 'The cost of equity cannot be computed without it.',
      remedy: 'Enter the yield on a government bond of comparable duration to the forecast.',
    });
  }
  if (!input.riskFree?.source?.trim()) {
    checks.push({
      id: 'rf-no-source',
      severity: 'WARNING',
      title: 'Risk-free rate has no source',
      detail: 'The rate is in the model but nothing says which instrument or date it came from.',
      remedy: 'Name the instrument and the observation date so the number can be checked later.',
    });
  }

  /* --------------------------------- Beta -------------------------------- */
  const taxRate = isNum(input.taxRate?.value) ? input.taxRate.value : null;
  const marketEquity = isNum(input.marketValueEquity?.value) ? input.marketValueEquity.value : null;
  const debtValue = isNum(input.debt?.value) ? input.debt.value : null;
  const impliedDe = isNum(debtValue) && isNum(marketEquity) && marketEquity !== 0
    ? (debtValue as number) / (marketEquity as number)
    : null;

  const targetDe = isNum(input.targetDebtToEquity) ? (input.targetDebtToEquity as number) : impliedDe;
  const bu = bottomUpBeta(input.peerBetas ?? [], targetDe ?? NaN, taxRate ?? NaN);
  const observed = isNum(input.observedBeta?.value) ? (input.observedBeta as SourcedInput).value : null;

  const usedBeta = input.betaMethod === 'OBSERVED' ? observed : bu.relevered;
  const beta: BetaComparison = {
    observed,
    bottomUp: bu.relevered,
    peerMedianUnlevered: bu.unleveredMedian,
    peerCount: bu.perPeer.filter((p) => isNum(p.unlevered)).length,
    releveredAt: isNum(targetDe) ? (targetDe as number) : null,
    used: usedBeta,
    usedMethod: input.betaMethod,
    spread: isNum(observed) && isNum(bu.relevered) ? (observed as number) - (bu.relevered as number) : null,
  };

  if (!isNum(usedBeta)) {
    checks.push({
      id: 'beta-missing',
      severity: 'ERROR',
      title: `No ${input.betaMethod === 'OBSERVED' ? 'observed' : 'bottom-up'} beta`,
      detail: input.betaMethod === 'OBSERVED'
        ? 'No regression beta was supplied.'
        : 'The peer set produced no usable unlevered beta, or no capital structure to re-lever to.',
      remedy: 'Supply a beta, or switch to the other method.',
    });
  }
  if (isNum(beta.spread) && Math.abs(beta.spread as number) > 0.25) {
    checks.push({
      id: 'beta-divergence',
      severity: 'WARNING',
      title: 'The two beta methods disagree',
      detail: `Observed ${observed?.toFixed(2)} against bottom-up ${bu.relevered?.toFixed(2)} — a gap of ${Math.abs(beta.spread as number).toFixed(2)}.`,
      remedy: 'A wide gap usually means the regression window spans a period that no longer describes the business, or the peer set is not comparable. Say which you trust and why.',
    });
  }
  if (input.betaMethod === 'BOTTOM_UP' && beta.peerCount > 0 && beta.peerCount < 3) {
    checks.push({
      id: 'beta-thin-peers',
      severity: 'WARNING',
      title: 'Bottom-up beta rests on a thin peer set',
      detail: `Only ${beta.peerCount} peer${beta.peerCount === 1 ? '' : 's'} produced an unlevered beta.`,
      remedy: 'A median over fewer than three names is one name with extra steps. Widen the peer set or use the observed beta.',
    });
  }

  /* -------------------------------- Premia ------------------------------- */
  const erp = isNum(input.equityRiskPremium?.value) ? input.equityRiskPremium.value : null;
  const crp = isNum(input.countryRiskPremium?.value) ? (input.countryRiskPremium as SourcedInput).value : null;
  const sizePremium = isNum(input.sizePremium?.value) ? (input.sizePremium as SourcedInput).value : null;

  const erpIsDeveloped = input.erpIsDevelopedMarket ?? true;
  const localCurrency = !DEVELOPED_CURRENCIES.has((input.currency ?? '').toUpperCase());

  if (!isNum(erp)) {
    checks.push({
      id: 'erp-missing',
      severity: 'ERROR',
      title: 'No equity risk premium',
      detail: 'CAPM needs it.',
      remedy: 'Enter the premium and name where it came from.',
    });
  }
  if (localCurrency && erpIsDeveloped && !isNum(crp)) {
    checks.push({
      id: 'crp-missing',
      severity: 'WARNING',
      title: `No country risk premium in a ${input.currency} model`,
      detail: `The equity risk premium is quoted for a developed market and the valuation is in ${input.currency}. Without a country premium the cost of equity carries no compensation for sovereign risk.`,
      remedy: 'Add a country premium (a sovereign spread such as EMBI+ is the usual source), or state why this company does not carry it — an exporter earning in hard currency is a real argument.',
    });
  }
  if (isNum(crp) && (crp as number) > 0.08) {
    checks.push({
      id: 'crp-large',
      severity: 'INFO',
      title: 'Country premium above 800 bps',
      detail: `${((crp as number) * 100).toFixed(0)} bps is a large addition to the cost of equity.`,
      remedy: 'Check whether the premium is being applied twice — once here and once inside a locally-quoted equity risk premium.',
    });
  }

  const ke = isNum(riskFreeNominal) && isNum(usedBeta) && isNum(erp)
    ? costOfEquity({
        riskFreeRate: riskFreeNominal as number,
        beta: usedBeta as number,
        equityRiskPremium: erp as number,
        countryRiskPremium: crp ?? 0,
        sizePremium: sizePremium ?? 0,
      })
    : null;

  /* ------------------------------ Cost of debt --------------------------- */
  const kdPre = isNum(input.costOfDebt?.value) ? input.costOfDebt.value : null;
  if (!isNum(kdPre)) {
    checks.push({
      id: 'kd-missing',
      severity: 'ERROR',
      title: 'No cost of debt',
      detail: 'The debt leg of the WACC cannot be computed.',
      remedy: 'Use the average cost reported in the notes, a spread over the policy rate, or the yield on the company’s own bonds.',
    });
  }
  if (isNum(kdPre) && isNum(riskFreeNominal) && (kdPre as number) < (riskFreeNominal as number)) {
    checks.push({
      id: 'kd-below-rf',
      severity: 'WARNING',
      title: 'Cost of debt below the risk-free rate',
      detail: `${((kdPre as number) * 100).toFixed(2)}% against a risk-free ${((riskFreeNominal as number) * 100).toFixed(2)}%.`,
      remedy: 'This happens with subsidised or directed credit, which is legitimate — but check it is not a stale reported figure or a real rate compared against a nominal one.',
    });
  }
  if (!isNum(taxRate)) {
    checks.push({
      id: 'tax-missing',
      severity: 'ERROR',
      title: 'No tax rate',
      detail: 'The after-tax cost of debt cannot be computed.',
      remedy: 'Use the statutory rate, or the effective rate when it is stable and representative.',
    });
  }

  /* --------------------------- Capital structure ------------------------- */
  if (!isNum(marketEquity)) {
    checks.push({
      id: 'equity-missing',
      severity: 'ERROR',
      title: 'No market value of equity',
      detail: 'The weights cannot be computed.',
      remedy: 'Market value is price times shares outstanding. Book equity is not a substitute.',
    });
  }
  if (!input.marketValueEquity?.source?.toLowerCase().includes('market')
    && !input.marketValueEquity?.source?.toLowerCase().includes('price')) {
    checks.push({
      id: 'equity-basis',
      severity: 'INFO',
      title: 'Confirm the equity weight is at market value',
      detail: `The source reads "${input.marketValueEquity?.source || 'unset'}".`,
      remedy: 'Weights built on book equity understate the equity share for any company trading above book, which pulls the WACC toward the cost of debt.',
    });
  }

  const waccResult = calculateWacc({
    costOfEquity: ke ?? NaN,
    costOfDebt: kdPre ?? NaN,
    taxRate: taxRate ?? NaN,
    marketValueEquity: marketEquity ?? NaN,
    marketValueDebt: debtValue ?? NaN,
  });

  if (isNum(waccResult.equityWeight) && isNum(input.targetEquityWeight)) {
    const drift = Math.abs((waccResult.equityWeight as number) - (input.targetEquityWeight as number));
    if (drift > 0.15) {
      checks.push({
        id: 'structure-drift',
        severity: 'WARNING',
        title: 'Current structure is far from the declared target',
        detail: `Today the book is ${((waccResult.equityWeight as number) * 100).toFixed(0)}% equity against a target of ${((input.targetEquityWeight as number) * 100).toFixed(0)}%.`,
        remedy: 'A perpetuity discounted at today’s structure assumes today’s leverage forever. Either discount at the target structure or say why the current one persists.',
      });
    }
  }

  if (input.debt?.basis === 'NET_DEBT') {
    checks.push({
      id: 'debt-basis-net',
      severity: 'INFO',
      title: 'Weights use net debt',
      detail: isNum(input.cash)
        ? `Cash of ${input.cash} is netted against gross debt.`
        : 'Cash is netted against gross debt.',
      remedy: 'Netting cash is defensible when the cash is genuinely surplus. When it is operating cash, or trapped in a subsidiary, gross debt is the honest basis.',
    });
  }

  if (!input.rationale?.trim()) {
    checks.push({
      id: 'no-rationale',
      severity: 'WARNING',
      title: 'No rationale recorded',
      detail: 'Nothing says why this beta method, these premia and this capital structure were chosen.',
      remedy: 'A sentence here is what makes the number defensible at committee six months from now.',
    });
  }

  const components: WaccBuildResult['components'] = [
    {
      key: 'rf', label: 'Risk-free rate (nominal)', value: riskFreeNominal, format: 'percent',
      source: input.riskFree?.source ?? '', asOf: input.riskFree?.asOf ?? null,
      note: riskFreeConverted
        ? `Converted from ${((supplied ?? 0) * 100).toFixed(2)}% real at ${(((input.riskFree.inflation ?? 0)) * 100).toFixed(2)}% inflation`
        : input.riskFree?.instrument ?? undefined,
    },
    {
      key: 'beta', label: `Beta (${input.betaMethod === 'OBSERVED' ? 'observed' : 'bottom-up'})`,
      value: usedBeta, format: 'ratio',
      source: input.betaMethod === 'OBSERVED'
        ? input.observedBeta?.source ?? ''
        : `Median of ${beta.peerCount} peers, re-levered at D/E ${isNum(targetDe) ? (targetDe as number).toFixed(2) : '—'}`,
      asOf: input.betaMethod === 'OBSERVED' ? input.observedBeta?.asOf ?? null : null,
      note: input.betaMethod === 'OBSERVED' ? input.observedBeta?.window ?? undefined : undefined,
    },
    { key: 'erp', label: 'Equity risk premium', value: erp, format: 'percent', source: input.equityRiskPremium?.source ?? '', asOf: input.equityRiskPremium?.asOf ?? null },
    { key: 'crp', label: 'Country risk premium', value: crp, format: 'percent', source: input.countryRiskPremium?.source ?? '', asOf: input.countryRiskPremium?.asOf ?? null },
    ...(isNum(sizePremium) ? [{ key: 'size', label: 'Size premium', value: sizePremium, format: 'percent' as const, source: input.sizePremium?.source ?? '', asOf: input.sizePremium?.asOf ?? null }] : []),
    { key: 'ke', label: 'Cost of equity', value: ke, format: 'percent', source: 'Rf + beta x ERP + CRP', asOf: null },
    { key: 'kd', label: 'Cost of debt (pre-tax)', value: kdPre, format: 'percent', source: input.costOfDebt?.source ?? '', asOf: input.costOfDebt?.asOf ?? null },
    { key: 'tax', label: 'Tax rate', value: taxRate, format: 'percent', source: input.taxRate?.source ?? '', asOf: input.taxRate?.asOf ?? null },
    { key: 'kdAt', label: 'Cost of debt (after tax)', value: waccResult.afterTaxCostOfDebt, format: 'percent', source: 'Kd x (1 - t)', asOf: null },
    { key: 'e', label: 'Market value of equity', value: marketEquity, format: 'currency', source: input.marketValueEquity?.source ?? '', asOf: input.marketValueEquity?.asOf ?? null },
    { key: 'd', label: `Debt (${input.debt?.basis === 'NET_DEBT' ? 'net' : 'gross'})`, value: debtValue, format: 'currency', source: input.debt?.source ?? '', asOf: input.debt?.asOf ?? null },
    { key: 'we', label: 'Equity weight', value: waccResult.equityWeight, format: 'percent', source: 'E / (D + E)', asOf: null },
    { key: 'wd', label: 'Debt weight', value: waccResult.debtWeight, format: 'percent', source: 'D / (D + E)', asOf: null },
    { key: 'wacc', label: 'WACC', value: waccResult.wacc, format: 'percent', source: 'We x Ke + Wd x Kd x (1 - t)', asOf: null },
  ];

  return {
    riskFreeNominal,
    riskFreeAsSupplied: supplied,
    riskFreeConverted,
    beta,
    costOfEquity: ke,
    costOfDebtPreTax: kdPre,
    costOfDebtAfterTax: waccResult.afterTaxCostOfDebt,
    taxRate,
    equityWeight: waccResult.equityWeight,
    debtWeight: waccResult.debtWeight,
    debtToEquity: safeDiv(debtValue, marketEquity),
    wacc: waccResult.wacc,
    components,
    checks,
    input,
  };
}

export interface WaccDiffRow {
  key: string;
  label: string;
  from: number | null;
  to: number | null;
  delta: number | null;
  format: 'percent' | 'ratio' | 'currency';
}

/**
 * What changed between two builds. A WACC that moved 50 bps between versions
 * should be explainable by a named component, not discovered later.
 */
export function diffWaccBuilds(before: WaccBuildResult | null, after: WaccBuildResult): {
  rows: WaccDiffRow[];
  waccDelta: number | null;
} {
  if (!before) return { rows: [], waccDelta: null };
  const byKey = new Map(before.components.map((c) => [c.key, c]));
  const rows = after.components
    .map((c) => {
      const prev = byKey.get(c.key);
      const from = prev?.value ?? null;
      const to = c.value;
      return {
        key: c.key,
        label: c.label,
        from,
        to,
        delta: isNum(from) && isNum(to) ? (to as number) - (from as number) : null,
        format: c.format,
      };
    })
    .filter((r) => r.delta === null ? r.from !== r.to : Math.abs(r.delta) > 1e-9);
  return {
    rows,
    waccDelta: isNum(before.wacc) && isNum(after.wacc) ? (after.wacc as number) - (before.wacc as number) : null,
  };
}
