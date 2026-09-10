/**
 * MERIDIAN — financial engine primitives.
 *
 * Every function in the engine is pure and side-effect free. `null` is the
 * single representation of "data unavailable"; it is never silently coerced to
 * zero, because a missing margin and a zero margin are different facts.
 */

export type Num = number | null | undefined;

/** True when the value is a usable finite number. */
export function isNum(v: Num): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Coerce to a finite number or null. Strings are tolerated (CSV / Excel input). */
export function toNum(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const s = v.trim();
    if (!s) return null;
    // Accounting negatives: (1.234,5) / (1,234.5)
    const neg = /^\(.*\)$/.test(s);
    let body = s.replace(/[()\s%]/g, '').replace(/[R$€£¥]/gi, '');
    // Decide decimal separator by the last separator present.
    const lastComma = body.lastIndexOf(',');
    const lastDot = body.lastIndexOf('.');
    if (lastComma > lastDot) body = body.replace(/\./g, '').replace(',', '.');
    else body = body.replace(/,/g, '');
    const n = Number(body);
    if (!Number.isFinite(n)) return null;
    return neg ? -n : n;
  }
  return null;
}

/** Division that returns null instead of Infinity/NaN. */
export function safeDiv(a: Num, b: Num): number | null {
  if (!isNum(a) || !isNum(b) || b === 0) return null;
  const r = a / b;
  return Number.isFinite(r) ? r : null;
}

/** Sum of the defined values. Returns null when *no* value is defined. */
export function sum(...vals: Num[]): number | null {
  const xs = vals.filter(isNum);
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0);
}

/** Subtraction requiring both operands. */
export function sub(a: Num, b: Num): number | null {
  if (!isNum(a) || !isNum(b)) return null;
  return a - b;
}

export function mul(a: Num, b: Num): number | null {
  if (!isNum(a) || !isNum(b)) return null;
  return a * b;
}

export function add(a: Num, b: Num): number | null {
  if (!isNum(a) || !isNum(b)) return null;
  return a + b;
}

export function neg(a: Num): number | null {
  return isNum(a) ? -a : null;
}

export function abs(a: Num): number | null {
  return isNum(a) ? Math.abs(a) : null;
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/**
 * Period-over-period growth. Uses |previous| in the denominator so that a swing
 * from a negative to a positive base produces a positive growth rate rather
 * than an inverted sign. Returns null when the base is zero or missing.
 */
export function growth(current: Num, previous: Num): number | null {
  if (!isNum(current) || !isNum(previous) || previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

/**
 * Compound annual growth rate over `years` periods.
 * Undefined when either endpoint is non-positive (a fractional power of a
 * negative base is not a real number) — the caller should fall back to `growth`.
 */
export function cagr(endValue: Num, beginValue: Num, years: number): number | null {
  if (!isNum(endValue) || !isNum(beginValue)) return null;
  if (years <= 0) return null;
  if (beginValue <= 0 || endValue <= 0) return null;
  return Math.pow(endValue / beginValue, 1 / years) - 1;
}

export function mean(values: Num[]): number | null {
  const xs = values.filter(isNum);
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function median(values: Num[]): number | null {
  const xs = values.filter(isNum).slice().sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
}

export function min(values: Num[]): number | null {
  const xs = values.filter(isNum);
  return xs.length ? Math.min(...xs) : null;
}

export function max(values: Num[]): number | null {
  const xs = values.filter(isNum);
  return xs.length ? Math.max(...xs) : null;
}

/** Linear-interpolated percentile (same convention as Excel PERCENTILE.INC). */
export function percentile(values: Num[], p: number): number | null {
  const xs = values.filter(isNum).slice().sort((a, b) => a - b);
  if (!xs.length) return null;
  if (xs.length === 1) return xs[0];
  const q = clamp(p, 0, 1);
  const idx = q * (xs.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return xs[lo];
  return xs[lo] + (xs[hi] - xs[lo]) * (idx - lo);
}

/** Where `value` sits inside `values`, as a 0–1 rank. */
export function percentileRank(values: Num[], value: Num): number | null {
  if (!isNum(value)) return null;
  const xs = values.filter(isNum);
  if (!xs.length) return null;
  const below = xs.filter((x) => x < value).length;
  const equal = xs.filter((x) => x === value).length;
  return (below + equal / 2) / xs.length;
}

/** Sample standard deviation (n-1). Needs at least 2 observations. */
export function stdev(values: Num[]): number | null {
  const xs = values.filter(isNum);
  if (xs.length < 2) return null;
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(variance);
}

export function covariance(a: number[], b: number[]): number | null {
  const n = Math.min(a.length, b.length);
  if (n < 2) return null;
  const ma = a.slice(0, n).reduce((x, y) => x + y, 0) / n;
  const mb = b.slice(0, n).reduce((x, y) => x + y, 0) / n;
  let acc = 0;
  for (let i = 0; i < n; i++) acc += (a[i] - ma) * (b[i] - mb);
  return acc / (n - 1);
}

export function correlation(a: number[], b: number[]): number | null {
  const cov = covariance(a, b);
  const sa = stdev(a);
  const sb = stdev(b);
  if (cov === null || sa === null || sb === null || sa === 0 || sb === 0) return null;
  return cov / (sa * sb);
}

/** Round to `dp` decimals, avoiding binary float artefacts. */
export function round(v: Num, dp = 2): number | null {
  if (!isNum(v)) return null;
  const f = 10 ** dp;
  return Math.round((v + Number.EPSILON * Math.sign(v || 1)) * f) / f;
}

/**
 * Bisection root finder — used by the reverse-DCF and IRR solvers.
 * Returns null when the bracket does not contain a sign change.
 */
export function bisect(
  fn: (x: number) => number | null,
  lo: number,
  hi: number,
  opts: { tolerance?: number; maxIterations?: number } = {},
): number | null {
  const tol = opts.tolerance ?? 1e-7;
  const maxIter = opts.maxIterations ?? 200;
  let a = lo;
  let b = hi;
  const fa = fn(a);
  const fb = fn(b);
  if (fa === null || fb === null) return null;
  if (fa === 0) return a;
  if (fb === 0) return b;
  if (fa * fb > 0) return null;
  let mid = a;
  for (let i = 0; i < maxIter; i++) {
    mid = (a + b) / 2;
    const fm = fn(mid);
    if (fm === null) return null;
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return mid;
    if (fm * (fn(a) as number) < 0) b = mid;
    else a = mid;
  }
  return mid;
}

/** Internal rate of return for an evenly spaced cash-flow series. */
export function irr(cashflows: number[], guessRange: [number, number] = [-0.9, 10]): number | null {
  if (cashflows.length < 2) return null;
  const npv = (r: number): number | null => {
    if (r <= -1) return null;
    let acc = 0;
    for (let t = 0; t < cashflows.length; t++) acc += cashflows[t] / (1 + r) ** t;
    return Number.isFinite(acc) ? acc : null;
  };
  return bisect(npv, guessRange[0], guessRange[1]);
}

/** Present value of a series discounted at a constant rate (t starts at 1). */
export function discountSeries(values: Num[], rate: Num, midYear = false): number | null {
  if (!isNum(rate) || rate <= -1) return null;
  let acc = 0;
  let any = false;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (!isNum(v)) continue;
    any = true;
    const t = midYear ? i + 0.5 : i + 1;
    acc += v / (1 + rate) ** t;
  }
  return any ? acc : null;
}

export function discountFactor(rate: Num, period: number, midYear = false): number | null {
  if (!isNum(rate) || rate <= -1) return null;
  const t = midYear ? period - 0.5 : period;
  return 1 / (1 + rate) ** t;
}
