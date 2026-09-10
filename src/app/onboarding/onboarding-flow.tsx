'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, cx, Field, InlineNote, Input, Panel } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { parseDelimited, rowsToPositions } from '@/lib/import/csv';

type WorkspaceType = 'ASSET_MANAGEMENT' | 'EQUITY_RESEARCH' | 'FAMILY_OFFICE' | 'INDEPENDENT';
type Market = 'BRAZIL' | 'US' | 'GLOBAL';
type Start = 'DEMO' | 'IMPORT' | 'EMPTY';

const TYPES: { value: WorkspaceType; label: string; description: string }[] = [
  { value: 'ASSET_MANAGEMENT', label: 'Asset management', description: 'Portfolios, attribution, risk and an investment committee alongside the research.' },
  { value: 'EQUITY_RESEARCH', label: 'Equity research', description: 'Coverage, models, notes and published recommendations.' },
  { value: 'FAMILY_OFFICE', label: 'Family office', description: 'A concentrated book with long horizons and a monitoring emphasis.' },
  { value: 'INDEPENDENT', label: 'Independent analyst', description: 'One person, full stack: screen, model, write, track.' },
];

const MARKETS: { value: Market; label: string; description: string }[] = [
  { value: 'BRAZIL', label: 'Brazil', description: 'BRL base currency, Ibovespa benchmark, Selic-linked risk-free rate.' },
  { value: 'US', label: 'United States', description: 'USD base currency, S&P 500 benchmark, Treasury-linked risk-free rate.' },
  { value: 'GLOBAL', label: 'Global', description: 'Mixed universe with currency conversion into the workspace base currency.' },
];

export function OnboardingFlow({ userName, organizationName }: { userName: string; organizationName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('ASSET_MANAGEMENT');
  const [market, setMarket] = useState<Market>('BRAZIL');
  const [start, setStart] = useState<Start>('DEMO');
  const [portfolioName, setPortfolioName] = useState('');
  const [positions, setPositions] = useState<{ ticker: string; quantity: number; averagePrice: number }[]>([]);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onFile = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const table = parseDelimited(text);
      const parsed = rowsToPositions(table);
      if (!parsed.positions.length) {
        setImportNote(null);
        setError('No usable rows were found. The file needs a ticker column and a quantity column.');
        return;
      }
      setPositions(parsed.positions);
      setStart('IMPORT');
      setImportNote(
        `${parsed.positions.length} position${parsed.positions.length === 1 ? '' : 's'} read from ${file.name}` +
        (parsed.skipped.length ? `. ${parsed.skipped.length} row${parsed.skipped.length === 1 ? '' : 's'} skipped: ${parsed.skipped.slice(0, 3).join(', ')}${parsed.skipped.length > 3 ? '…' : ''}` : '.'),
      );
    } catch {
      setError('That file could not be read as CSV. Export as CSV and try again.');
    }
  };

  const finish = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceType, market, start, portfolioName, positions: start === 'IMPORT' ? positions : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Setup failed.'); return; }
      router.push('/home');
      router.refresh();
    } catch {
      setError('The server did not respond.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Workspace type', 'Market', 'Starting data'];

  return (
    <div className="mt-8">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome, {userName.split(' ')[0]}</h1>
      <p className="mt-1 text-base text-ink-3">
        Three choices and {organizationName} is ready. Everything here can be changed later in settings.
      </p>

      <ol className="mt-6 flex items-center gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span className={cx(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-2xs num transition',
              i < step ? 'bg-accent text-white' : i === step ? 'border border-accent text-accent' : 'border border-line text-ink-4',
            )}>
              {i < step ? <Icon.Check size={11} strokeWidth={2.6} /> : i + 1}
            </span>
            <span className={cx('truncate text-xs', i === step ? 'text-ink font-medium' : 'text-ink-4')}>{s}</span>
            {i < steps.length - 1 ? <span className="h-px flex-1 bg-line" /> : null}
          </li>
        ))}
      </ol>

      <Panel className="mt-4">
        {step === 0 ? (
          <div className="space-y-2">
            <p className="label">What kind of work happens here?</p>
            {TYPES.map((t) => (
              <button
                key={t.value} type="button" onClick={() => setWorkspaceType(t.value)}
                className={cx(
                  'flex w-full items-start gap-3 rounded border px-3 py-2.5 text-left transition focus-ring',
                  workspaceType === t.value ? 'border-accent bg-accent/[0.06]' : 'border-line hover:border-line-strong hover:bg-raised',
                )}
              >
                <span className={cx('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', workspaceType === t.value ? 'border-accent bg-accent text-white' : 'border-line-strong')}>
                  {workspaceType === t.value ? <Icon.Check size={10} strokeWidth={3} /> : null}
                </span>
                <span>
                  <span className="block text-base font-medium text-ink">{t.label}</span>
                  <span className="block text-xs text-ink-3">{t.description}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-2">
            <p className="label">Which market do you cover?</p>
            {MARKETS.map((m) => (
              <button
                key={m.value} type="button" onClick={() => setMarket(m.value)}
                className={cx(
                  'flex w-full items-start gap-3 rounded border px-3 py-2.5 text-left transition focus-ring',
                  market === m.value ? 'border-accent bg-accent/[0.06]' : 'border-line hover:border-line-strong hover:bg-raised',
                )}
              >
                <span className={cx('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', market === m.value ? 'border-accent bg-accent text-white' : 'border-line-strong')}>
                  {market === m.value ? <Icon.Check size={10} strokeWidth={3} /> : null}
                </span>
                <span>
                  <span className="block text-base font-medium text-ink">{m.label}</span>
                  <span className="block text-xs text-ink-3">{m.description}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <p className="label">How would you like to start?</p>
            <div className="space-y-2">
              {[
                { value: 'DEMO' as Start, label: 'Start with demo data', description: 'A starting watchlist, portfolio and valuation model built from the reference universe, so every module has something in it.' },
                { value: 'IMPORT' as Start, label: 'Import a portfolio', description: 'Upload a CSV or Excel export with ticker, quantity and average price columns.' },
                { value: 'EMPTY' as Start, label: 'Start empty', description: 'Just the company universe. Build everything yourself.' },
              ].map((o) => (
                <button
                  key={o.value} type="button" onClick={() => setStart(o.value)}
                  className={cx(
                    'flex w-full items-start gap-3 rounded border px-3 py-2.5 text-left transition focus-ring',
                    start === o.value ? 'border-accent bg-accent/[0.06]' : 'border-line hover:border-line-strong hover:bg-raised',
                  )}
                >
                  <span className={cx('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border', start === o.value ? 'border-accent bg-accent text-white' : 'border-line-strong')}>
                    {start === o.value ? <Icon.Check size={10} strokeWidth={3} /> : null}
                  </span>
                  <span>
                    <span className="block text-base font-medium text-ink">{o.label}</span>
                    <span className="block text-xs text-ink-3">{o.description}</span>
                  </span>
                </button>
              ))}
            </div>

            {start === 'IMPORT' ? (
              <div className="rounded border border-line bg-sunken p-3">
                <Field label="Portfolio name" className="mb-3">
                  <Input value={portfolioName} onChange={(e) => setPortfolioName(e.target.value)} placeholder="Imported portfolio" />
                </Field>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-line-strong px-3 py-5 text-xs text-ink-3 transition hover:border-accent hover:text-ink-2">
                  <Icon.Upload size={14} />
                  Choose a CSV file
                  <input
                    type="file" accept=".csv,.txt,.tsv" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
                  />
                </label>
                <p className="mt-2 text-2xs text-ink-4">
                  Expected columns: ticker, quantity, average price. Column names are matched
                  case-insensitively and Portuguese headers (ativo, quantidade, preço médio) are recognised.
                </p>
                {importNote ? <p className="mt-2 text-xs text-pos">{importNote}</p> : null}
              </div>
            ) : null}

            {start === 'DEMO' ? (
              <InlineNote tone="info">
                The demo universe is generated by MockMarketDataProvider. It is internally consistent and
                clearly labelled as simulated everywhere it appears — no figure is presented as a market quotation.
              </InlineNote>
            ) : null}
          </div>
        ) : null}

        {error ? <div className="mt-3"><InlineNote tone="neg">{error}</InlineNote></div> : null}

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < 2 ? (
            <Button variant="primary" onClick={() => setStep((s) => s + 1)} iconRight={<Icon.ArrowRight size={13} />}>
              Continue
            </Button>
          ) : (
            <Button variant="primary" onClick={finish} loading={loading} iconRight={<Icon.ArrowRight size={13} />}>
              Open MERIDIAN
            </Button>
          )}
        </div>
      </Panel>
    </div>
  );
}
