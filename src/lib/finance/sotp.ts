import { isNum, safeDiv } from './core';

/* ==================  SUM OF THE PARTS  ================== */

export interface SotpSegmentInput {
  id: string;
  name: string;
  revenue: number | null;
  ebitda: number | null;
  multiple: number | null;
  /** Optional stake adjustment, 1 = fully owned. */
  ownership?: number;
  method?: 'EV_EBITDA' | 'EV_REVENUE' | 'BOOK';
  bookValue?: number | null;
  note?: string;
}

export interface SotpSegmentResult extends SotpSegmentInput {
  margin: number | null;
  enterpriseValue: number | null;
  attributableEv: number | null;
  pctOfTotalEv: number | null;
  evPerShare: number | null;
}

export interface SotpResult {
  segments: SotpSegmentResult[];
  corporateCosts: number | null;
  corporateMultiple: number | null;
  corporateEv: number | null;
  totalEnterpriseValue: number | null;
  netDebt: number;
  minorityInterest: number;
  equityValue: number | null;
  sharesOutstanding: number;
  impliedSharePrice: number | null;
  currentPrice: number | null;
  upside: number | null;
}

export interface SotpInput {
  segments: SotpSegmentInput[];
  /** Annual unallocated corporate costs (positive number). */
  corporateCosts?: number | null;
  corporateMultiple?: number | null;
  netDebt: number;
  minorityInterest?: number;
  sharesOutstanding: number;
  currentPrice?: number | null;
}

function segmentEv(s: SotpSegmentInput): number | null {
  const method = s.method ?? 'EV_EBITDA';
  if (method === 'BOOK') return isNum(s.bookValue) ? s.bookValue : null;
  const metric = method === 'EV_REVENUE' ? s.revenue : s.ebitda;
  if (!isNum(metric) || !isNum(s.multiple)) return null;
  return metric * s.multiple;
}

export function calculateSotp(input: SotpInput): SotpResult {
  const raw = input.segments.map((s) => {
    const ev = segmentEv(s);
    const ownership = isNum(s.ownership) ? (s.ownership as number) : 1;
    return { s, ev, attributable: isNum(ev) ? ev * ownership : null };
  });

  const corporateEv =
    isNum(input.corporateCosts) && isNum(input.corporateMultiple)
      ? -Math.abs(input.corporateCosts as number) * (input.corporateMultiple as number)
      : null;

  const segTotal = raw.reduce((acc, r) => acc + (isNum(r.attributable) ? r.attributable : 0), 0);
  const anySegment = raw.some((r) => isNum(r.attributable));
  const totalEnterpriseValue = anySegment ? segTotal + (corporateEv ?? 0) : null;

  const segments: SotpSegmentResult[] = raw.map(({ s, ev, attributable }) => ({
    ...s,
    margin: safeDiv(s.ebitda, s.revenue),
    enterpriseValue: ev,
    attributableEv: attributable,
    pctOfTotalEv: safeDiv(attributable, totalEnterpriseValue),
    evPerShare: input.sharesOutstanding > 0 ? safeDiv(attributable, input.sharesOutstanding) : null,
  }));

  const minority = input.minorityInterest ?? 0;
  const equityValue = isNum(totalEnterpriseValue)
    ? totalEnterpriseValue - input.netDebt - minority
    : null;
  const impliedSharePrice =
    input.sharesOutstanding > 0 ? safeDiv(equityValue, input.sharesOutstanding) : null;
  const upside =
    isNum(impliedSharePrice) && isNum(input.currentPrice) && (input.currentPrice as number) > 0
      ? (impliedSharePrice as number) / (input.currentPrice as number) - 1
      : null;

  return {
    segments,
    corporateCosts: input.corporateCosts ?? null,
    corporateMultiple: input.corporateMultiple ?? null,
    corporateEv,
    totalEnterpriseValue,
    netDebt: input.netDebt,
    minorityInterest: minority,
    equityValue,
    sharesOutstanding: input.sharesOutstanding,
    impliedSharePrice,
    currentPrice: input.currentPrice ?? null,
    upside,
  };
}
