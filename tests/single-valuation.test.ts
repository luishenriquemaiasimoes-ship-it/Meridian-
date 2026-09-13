import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * One company, one published fair value.
 *
 * The product used to carry two: a five-year standalone DCF and the full
 * three-statement projection. For Fleury they disagreed by 88% with opposite
 * recommendations, on the same page, with nothing reconciling them. The
 * projection won because it is the model that can be audited — a balance sheet
 * that has to close, a debt schedule that has to amortise, and both routes to
 * equity with the gap between them reported.
 *
 * These tests guard the boundary rather than the arithmetic. Arithmetic is
 * covered elsewhere; what is easy to undo by accident is a screen quietly
 * reading the old engine again.
 */
function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(entry)) out.push(full);
  }
  return out;
}

describe('a single published valuation', () => {
  const appFiles = walk('src/app').filter((f) => !f.includes('/api/'));

  it('has no standalone DCF tab left on the valuation page', () => {
    const page = readFileSync(
      'src/app/(app)/companies/[ticker]/valuation/valuation-workbench.tsx',
      'utf8',
    );
    // The tab set is the surface a reader picks a number from. A second
    // valuation tab is how two answers to one question get back in.
    expect(page).not.toContain("{ value: 'model', label: 'Model' }");
    expect(page).toContain("useState<Tab>('full')");
  });

  it('reads the headline fair value from the published valuation, not from the page', () => {
    const page = readFileSync(
      'src/app/(app)/companies/[ticker]/valuation/valuation-workbench.tsx',
      'utf8',
    );
    const headline = page.slice(page.indexOf('Fair value / share'), page.indexOf('Fair value / share') + 200);
    expect(headline).toContain('props.published');
    expect(headline).not.toContain('result.fairValuePerShare');
  });

  it('keeps the published valuation out of the screens that used to compute their own', () => {
    // A page importing the standalone engine directly is a page that can
    // publish a number nothing else agrees with.
    const offenders = appFiles.filter((f) => {
      const src = readFileSync(f, 'utf8');
      return /from '@\/lib\/finance\/dcf'/.test(src) && /fairValuePerShare/.test(src);
    });
    expect(offenders).toEqual([
      // Two files still reference the engine and neither publishes from it:
      // the unit model receives the published figure as its comparison, and
      // the workbench keeps the engine for the saved-model artifact and the
      // year-by-year export only.
      'src/app/(app)/companies/[ticker]/valuation/unit-model.tsx',
      'src/app/(app)/companies/[ticker]/valuation/valuation-workbench.tsx',
    ]);
  });
});
