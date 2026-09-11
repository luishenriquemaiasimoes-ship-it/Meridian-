import { toNum } from '@/lib/finance/core';

/* ================================================================
   DOCUMENT INTELLIGENCE

   Locates financial figures inside an uploaded document and keeps a
   reference to the exact line each one came from. Nothing is written
   into the statements automatically: an extracted value is a candidate
   the analyst confirms, and it always carries its source.
   ================================================================ */

export interface ExtractedMetric {
  key: string;
  label: string;
  value: number;
  unit: 'ABSOLUTE' | 'THOUSANDS' | 'MILLIONS' | 'BILLIONS' | 'PERCENT';
  currency: string | null;
  /** The line of the source document the value was read from. */
  sourceLine: string;
  lineNumber: number;
  confidence: number;
}

export interface ExtractionResult {
  metrics: ExtractedMetric[];
  guidance: { text: string; lineNumber: number }[];
  risks: { text: string; lineNumber: number }[];
  commentary: { text: string; lineNumber: number }[];
  strategy: { text: string; lineNumber: number }[];
  characters: number;
  lines: number;
}

interface MetricPattern {
  key: string;
  label: string;
  patterns: RegExp[];
  percent?: boolean;
}

/** Bilingual line labels — Brazilian filings mix Portuguese and English. */
const METRIC_PATTERNS: MetricPattern[] = [
  { key: 'revenue', label: 'Revenue', patterns: [/\b(net\s+)?revenue\b/i, /\breceita\s+(l[ií]quida|operacional|total)?\b/i, /\bnet\s+sales\b/i, /\bfaturamento\b/i] },
  { key: 'grossProfit', label: 'Gross profit', patterns: [/\bgross\s+profit\b/i, /\blucro\s+bruto\b/i] },
  { key: 'ebitda', label: 'EBITDA', patterns: [/\bebitda\b/i, /\blajida\b/i] },
  { key: 'ebit', label: 'EBIT', patterns: [/\bebit\b/i, /\blajir\b/i, /\boperating\s+(income|profit)\b/i, /\bresultado\s+operacional\b/i] },
  { key: 'netIncome', label: 'Net income', patterns: [/\bnet\s+(income|profit|earnings)\b/i, /\blucro\s+l[ií]quido\b/i] },
  { key: 'eps', label: 'Earnings per share', patterns: [/\b(earnings|eps)\s*(per\s+share)?\b/i, /\blucro\s+por\s+a[çc][ãa]o\b/i] },
  { key: 'cfo', label: 'Cash from operations', patterns: [/\bcash\s+(flow\s+)?from\s+operations?\b/i, /\bfluxo\s+de\s+caixa\s+operacional\b/i, /\boperating\s+cash\s+flow\b/i] },
  { key: 'capex', label: 'Capital expenditure', patterns: [/\bcapex\b/i, /\bcapital\s+expenditure/i, /\binvestimentos?\b/i] },
  { key: 'fcf', label: 'Free cash flow', patterns: [/\bfree\s+cash\s+flow\b/i, /\bfluxo\s+de\s+caixa\s+livre\b/i] },
  { key: 'netDebt', label: 'Net debt', patterns: [/\bnet\s+debt\b/i, /\bd[ií]vida\s+l[ií]quida\b/i] },
  { key: 'totalAssets', label: 'Total assets', patterns: [/\btotal\s+assets\b/i, /\bativo\s+total\b/i] },
  { key: 'totalEquity', label: 'Total equity', patterns: [/\b(total\s+)?(shareholders?[’']?\s+)?equity\b/i, /\bpatrim[oô]nio\s+l[ií]quido\b/i] },
  { key: 'ebitdaMargin', label: 'EBITDA margin', patterns: [/\bebitda\s+margin\b/i, /\bmargem\s+ebitda\b/i], percent: true },
  { key: 'grossMargin', label: 'Gross margin', patterns: [/\bgross\s+margin\b/i, /\bmargem\s+bruta\b/i], percent: true },
  { key: 'netMargin', label: 'Net margin', patterns: [/\bnet\s+margin\b/i, /\bmargem\s+l[ií]quida\b/i], percent: true },
];

const GUIDANCE_PATTERNS = [/\bguidance\b/i, /\bwe\s+expect\b/i, /\bexpectativa\b/i, /\bproje[çc][ãa]o\b/i, /\boutlook\b/i, /\bfor\s+the\s+full\s+year\b/i, /\bpara\s+o\s+ano\b/i];
const RISK_PATTERNS = [/\brisk\b/i, /\brisco\b/i, /\buncertaint/i, /\bincerteza/i, /\bexposure\s+to\b/i, /\bmay\s+adversely\b/i];
const COMMENTARY_PATTERNS = [/\bmanagement\b/i, /\bceo\b/i, /\bchief\s+executive\b/i, /\bdiretor\s+presidente\b/i, /\badministra[çc][ãa]o\b/i, /\bcomment/i];
const STRATEGY_PATTERNS = [/\bstrateg/i, /\bestrat[ée]gi/i, /\bcapital\s+allocation\b/i, /\baloca[çc][ãa]o\s+de\s+capital\b/i, /\backquisition\b/i, /\baquisi[çc][ãa]o\b/i];

const UNIT_PATTERNS: [RegExp, ExtractedMetric['unit']][] = [
  [/\b(bilh(õ|o)es|billion|bn|bi)\b/i, 'BILLIONS'],
  [/\b(milh(õ|o)es|million|mm|mn|mi)\b/i, 'MILLIONS'],
  [/\b(mil|thousand|k)\b/i, 'THOUSANDS'],
];

const CURRENCY_PATTERNS: [RegExp, string][] = [
  [/R\$/i, 'BRL'], [/\bBRL\b/i, 'BRL'],
  [/US\$|\bUSD\b/i, 'USD'], [/\$(?!\s*R)/, 'USD'],
  [/€|\bEUR\b/i, 'EUR'], [/£|\bGBP\b/i, 'GBP'],
];

/** Pulls the most plausible number out of a labelled line. */
function firstNumber(line: string): number | null {
  const matches = line.match(/\(?-?\s*[\d][\d.,]*\s*\)?%?/g);
  if (!matches) return null;
  for (const raw of matches) {
    const cleaned = raw.trim();
    // Skip bare years and page numbers.
    if (/^\d{4}$/.test(cleaned) && Number(cleaned) > 1900 && Number(cleaned) < 2100) continue;
    const n = toNum(cleaned.replace('%', ''));
    if (n !== null && Math.abs(n) > 0) return n;
  }
  return null;
}

function detectUnit(line: string, percent: boolean): ExtractedMetric['unit'] {
  if (percent || /%/.test(line)) return 'PERCENT';
  for (const [pattern, unit] of UNIT_PATTERNS) if (pattern.test(line)) return unit;
  return 'ABSOLUTE';
}

function detectCurrency(line: string): string | null {
  for (const [pattern, code] of CURRENCY_PATTERNS) if (pattern.test(line)) return code;
  return null;
}

export function extractFromText(text: string): ExtractionResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const metrics: ExtractedMetric[] = [];
  const seen = new Set<string>();

  lines.forEach((line, index) => {
    if (line.length > 400) return;
    for (const spec of METRIC_PATTERNS) {
      if (seen.has(spec.key)) continue;
      if (!spec.patterns.some((p) => p.test(line))) continue;
      const value = firstNumber(line);
      if (value === null) continue;
      const unit = detectUnit(line, !!spec.percent);
      metrics.push({
        key: spec.key,
        label: spec.label,
        value: unit === 'PERCENT' ? value / 100 : value,
        unit,
        currency: detectCurrency(line),
        sourceLine: line.slice(0, 220),
        lineNumber: index + 1,
        // A line that contains only the label and one number is the most reliable shape.
        confidence: line.length < 90 ? 0.85 : 0.6,
      });
      seen.add(spec.key);
    }
  });

  const collect = (patterns: RegExp[], limit: number) =>
    lines
      .map((line, index) => ({ text: line, lineNumber: index + 1 }))
      .filter((l) => l.text.length > 40 && l.text.length < 400 && patterns.some((p) => p.test(l.text)))
      .slice(0, limit);

  return {
    metrics,
    guidance: collect(GUIDANCE_PATTERNS, 8),
    risks: collect(RISK_PATTERNS, 8),
    commentary: collect(COMMENTARY_PATTERNS, 6),
    strategy: collect(STRATEGY_PATTERNS, 6),
    characters: text.length,
    lines: lines.length,
  };
}
