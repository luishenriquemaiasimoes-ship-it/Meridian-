import { isNum } from './core';
import { exitMultipleTerminalValue, gordonTerminalValue } from './dcf';

/* ==================================================================
   Terminal value, both ways, against each other.

   Gordon growth and an exit multiple are two statements about the same
   thing. Whichever the model uses, the other is implied — and when the
   two imply very different futures, that is the finding, not a detail.
   ================================================================== */

export interface TerminalReconciliationInput {
  /** Free cash flow of the final explicit forecast year. */
  finalFcff: number | null;
  /** EBITDA of the final explicit forecast year. */
  finalEbitda: number | null;
  wacc: number | null;
  /** The perpetuity growth the model uses, if it uses Gordon. */
  terminalGrowth: number | null;
  /** The exit multiple the model uses, if it uses one. */
  exitMultiple: number | null;
  /** Median EV/EBITDA of the peer set, for the sanity check. */
  peerMedianExitMultiple?: number | null;
  /** Long-run nominal growth of the economy the company operates in. */
  longRunNominalGrowth?: number | null;
}

export interface TerminalReconciliation {
  gordonValue: number | null;
  exitMultipleValue: number | null;
  /** The multiple the Gordon assumption implies at the final-year EBITDA. */
  impliedMultipleFromGordon: number | null;
  /** The perpetuity growth the exit multiple implies at this WACC. */
  impliedGrowthFromMultiple: number | null;
  /** Gap between the two terminal values, as a share of the larger. */
  divergence: number | null;
  findings: {
    severity: 'ERROR' | 'WARNING' | 'INFO';
    title: string;
    detail: string;
  }[];
}

/**
 * The exit multiple a perpetuity assumption implies:
 * TV = FCFF(n+1) / (WACC - g), so multiple = TV / EBITDA(n).
 */
export function impliedMultipleFromGordon(
  finalFcff: number,
  finalEbitda: number,
  wacc: number,
  terminalGrowth: number,
): number | null {
  const tv = gordonTerminalValue(finalFcff, wacc, terminalGrowth);
  if (!isNum(tv) || !isNum(finalEbitda) || finalEbitda === 0) return null;
  return (tv as number) / finalEbitda;
}

/**
 * The perpetuity growth an exit multiple implies:
 * from TV = EBITDA x m and TV = FCFF(n+1) / (WACC - g),
 * g = (WACC x EBITDA x m - FCFF) / (EBITDA x m + FCFF).
 */
export function impliedGrowthFromMultiple(
  finalFcff: number,
  finalEbitda: number,
  wacc: number,
  multiple: number,
): number | null {
  if (![finalFcff, finalEbitda, wacc, multiple].every(isNum)) return null;
  const tv = finalEbitda * multiple;
  const denom = tv + finalFcff;
  if (denom === 0) return null;
  return (wacc * tv - finalFcff) / denom;
}

export function reconcileTerminalValue(i: TerminalReconciliationInput): TerminalReconciliation {
  const findings: TerminalReconciliation['findings'] = [];
  const { finalFcff, finalEbitda, wacc, terminalGrowth, exitMultiple } = i;

  const gordonValue = isNum(finalFcff) && isNum(wacc) && isNum(terminalGrowth)
    ? gordonTerminalValue(finalFcff as number, wacc as number, terminalGrowth as number)
    : null;
  const exitValue = isNum(finalEbitda) && isNum(exitMultiple)
    ? exitMultipleTerminalValue(finalEbitda as number, exitMultiple as number)
    : null;

  const impliedMultiple = isNum(finalFcff) && isNum(finalEbitda) && isNum(wacc) && isNum(terminalGrowth)
    ? impliedMultipleFromGordon(finalFcff as number, finalEbitda as number, wacc as number, terminalGrowth as number)
    : null;
  const impliedGrowth = isNum(finalFcff) && isNum(finalEbitda) && isNum(wacc) && isNum(exitMultiple)
    ? impliedGrowthFromMultiple(finalFcff as number, finalEbitda as number, wacc as number, exitMultiple as number)
    : null;

  let divergence: number | null = null;
  if (isNum(gordonValue) && isNum(exitValue)) {
    const larger = Math.max(Math.abs(gordonValue as number), Math.abs(exitValue as number));
    divergence = larger === 0 ? 0 : Math.abs((gordonValue as number) - (exitValue as number)) / larger;
    if (divergence > 0.25) {
      findings.push({
        severity: 'WARNING',
        title: 'The two terminal methods disagree materially',
        detail: `Gordon growth gives ${(gordonValue as number).toFixed(0)} and the exit multiple ${(exitValue as number).toFixed(0)} — a gap of ${((divergence as number) * 100).toFixed(0)}%. One of the two assumptions does not describe the same company.`,
      });
    }
  }

  if (isNum(wacc) && isNum(terminalGrowth) && (terminalGrowth as number) >= (wacc as number)) {
    findings.push({
      severity: 'ERROR',
      title: 'Perpetuity growth at or above the discount rate',
      detail: 'The perpetuity is undefined: a company growing at the discount rate forever is worth an infinite amount.',
    });
  }

  if (isNum(impliedGrowth) && isNum(i.longRunNominalGrowth)) {
    if ((impliedGrowth as number) > (i.longRunNominalGrowth as number) + 0.01) {
      findings.push({
        severity: 'WARNING',
        title: 'The exit multiple implies growth above the economy',
        detail: `An exit at ${exitMultiple?.toFixed(1)}x implies ${((impliedGrowth as number) * 100).toFixed(2)}% perpetual growth, against long-run nominal growth of ${(((i.longRunNominalGrowth as number)) * 100).toFixed(2)}%. A company cannot outgrow its economy forever without eventually becoming it.`,
      });
    }
  }

  if (isNum(impliedGrowth) && (impliedGrowth as number) < 0) {
    findings.push({
      severity: 'INFO',
      title: 'The exit multiple implies perpetual decline',
      detail: `An exit at ${exitMultiple?.toFixed(1)}x implies ${((impliedGrowth as number) * 100).toFixed(2)}% growth in perpetuity. That is a defensible view of a shrinking business, but it should be a view, not an accident of picking a peer multiple.`,
    });
  }

  if (isNum(impliedMultiple) && isNum(i.peerMedianExitMultiple)) {
    const peer = i.peerMedianExitMultiple as number;
    const gap = peer === 0 ? null : ((impliedMultiple as number) - peer) / peer;
    if (isNum(gap) && Math.abs(gap as number) > 0.4) {
      findings.push({
        severity: 'WARNING',
        title: 'The perpetuity implies a multiple far from the peer set',
        detail: `Growing at ${((terminalGrowth ?? 0) * 100).toFixed(2)}% forever implies an exit at ${(impliedMultiple as number).toFixed(1)}x, against a peer median of ${peer.toFixed(1)}x. Either the market is wrong about the sector or the growth assumption is.`,
      });
    }
  }

  return {
    gordonValue,
    exitMultipleValue: exitValue,
    impliedMultipleFromGordon: impliedMultiple,
    impliedGrowthFromMultiple: impliedGrowth,
    divergence,
    findings,
  };
}
