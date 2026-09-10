'use client';

import { useState } from 'react';
import { cx, Segmented, Tooltip } from '@/components/ui/primitives';
import { Delta, Num } from '@/components/ui/values';
import type { MarketIndicatorRow } from '@/server/services/dashboard';

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'All', INDEX: 'Indices', RATE: 'Rates', FX: 'Currencies', COMMODITY: 'Commodities', MACRO: 'Macro',
};

function decimalsFor(unit: string): number {
  if (unit === 'RATE') return 3;
  if (unit === 'PERCENT') return 2;
  if (unit === 'POINTS') return 0;
  return 2;
}

/**
 * Market snapshot. Level plus the change against the prior close, so a glance
 * answers "what moved" rather than only "what is the number".
 */
export function MarketStrip({ indicators }: { indicators: MarketIndicatorRow[] }) {
  const [category, setCategory] = useState<string>('ALL');
  const categories = ['ALL', ...Array.from(new Set(indicators.map((i) => i.category)))];
  const shown = category === 'ALL' ? indicators : indicators.filter((i) => i.category === category);

  return (
    <section className="panel p-3" aria-label="Market snapshot">
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div>
          <span className="label">Market snapshot</span>
          <span className="ml-2 text-2xs text-ink-4">
            as of {indicators[0]?.asOf ?? '—'} · MockMarketDataProvider (simulated)
          </span>
        </div>
        <Segmented
          size="xs"
          value={category}
          onChange={setCategory}
          options={categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c }))}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {shown.map((i) => (
          <Tooltip key={i.code} content={`${i.name} — previous ${i.previous.toLocaleString('pt-BR')}`}>
            <div className="min-w-0 cursor-help">
              <div className="truncate text-2xs uppercase tracking-wider text-ink-4">{i.code}</div>
              <div className="flex items-baseline gap-1.5">
                <Num value={i.value} format="ratio" decimals={decimalsFor(i.unit)} className="text-sm font-medium" />
                <Delta
                  value={i.unit === 'PERCENT' ? (i.change ?? null) : i.changePct}
                  format={i.unit === 'PERCENT' ? 'ratio' : 'percentSigned'}
                  decimals={i.unit === 'PERCENT' ? 2 : 2}
                  className={cx('text-2xs')}
                />
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </section>
  );
}
