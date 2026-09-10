/**
 * Chart theme tokens.
 *
 * Every value resolves to a CSS custom property defined in globals.css, so the
 * light and dark palettes swap with the theme without re-rendering React. The
 * categorical order is fixed and never cycled: a ninth series folds into
 * "Other" or the view becomes small multiples.
 */

export const SERIES = [
  'var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)', 'var(--viz-4)',
  'var(--viz-5)', 'var(--viz-6)', 'var(--viz-7)', 'var(--viz-8)',
] as const;

/** Scatter, bubble and matrix forms compare every pair, so they cap at three. */
export const ALL_PAIRS_SERIES = SERIES.slice(0, 3);

export const SEQUENTIAL = [
  'var(--viz-seq-1)', 'var(--viz-seq-2)', 'var(--viz-seq-3)',
  'var(--viz-seq-4)', 'var(--viz-seq-5)', 'var(--viz-seq-6)',
] as const;

export const DIVERGING = {
  negative: 'var(--viz-div-neg)',
  mid: 'var(--viz-div-mid)',
  positive: 'var(--viz-div-pos)',
} as const;

export const CHROME = {
  grid: 'var(--viz-grid)',
  axis: 'var(--viz-axis)',
  ink: 'var(--viz-ink)',
  muted: 'var(--viz-muted)',
  surface: 'var(--viz-surface)',
} as const;

export const POSITIVE = 'rgb(var(--m-pos))';
export const NEGATIVE = 'rgb(var(--m-neg))';
export const ACCENT = 'rgb(var(--m-accent))';
export const BRASS = 'rgb(var(--m-brass))';

export function seriesColor(index: number): string {
  return SERIES[index % SERIES.length];
}

/** Axis and tick styling shared by every chart so they read as one system. */
export const AXIS_PROPS = {
  stroke: CHROME.axis,
  tick: { fill: CHROME.muted, fontSize: 10 },
  tickLine: false,
  axisLine: { stroke: CHROME.axis },
} as const;

export const GRID_PROPS = {
  stroke: CHROME.grid,
  strokeDasharray: '0',
  vertical: false,
} as const;

/** 2px stroke on lines, ≥8px markers, 4px rounded data-ends on bars. */
export const LINE_WIDTH = 2;
export const BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];
export const DOT_SIZE = 8;
