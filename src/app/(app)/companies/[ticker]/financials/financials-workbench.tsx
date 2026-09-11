'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, cx, Field, InlineNote, Modal, Panel, PanelHeader, Segmented, Select, Textarea, useToast, NumberInput, Input } from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { FinancialTable } from '@/components/ui/table';
import { Num, StatRow } from '@/components/ui/values';
import { balanceSheetCheck, normalizePeriod } from '@/lib/finance/statements';
import { buildStatementRows, STATEMENT_TABS, type StatementKey } from '@/lib/finance/statementRows';
import { formatDate, formatPercent } from '@/lib/finance/format';
import { downloadText, toCsv } from '@/lib/import/csv';
import type { Currency, FinancialPeriod, NormalizationAdjustment, Unit } from '@/lib/finance/types';
import { useRouter } from 'next/navigation';

type PeriodMode = 'ANNUAL' | 'QUARTERLY' | 'LTM_VS_ANNUAL';
type ValueMode = 'ABSOLUTE' | 'PERCENT_OF_REVENUE';

const ADJUSTMENT_CATEGORIES = [
  ['ONE_OFF_EXPENSE', 'One-off expense'],
  ['EXTRAORDINARY_GAIN', 'Extraordinary gain'],
  ['RESTRUCTURING', 'Restructuring'],
  ['IMPAIRMENT', 'Impairment'],
  ['UNUSUAL_TAX', 'Unusual tax effect'],
  ['M_AND_A', 'M&A impact'],
  ['DISCONTINUED_OPS', 'Discontinued operations'],
  ['OTHER', 'Other'],
] as const;

export function FinancialsWorkbench({
  ticker, companyId, currency, unit, standard, annuals, quarters, ltm, adjustments, canEdit, statutoryTaxRate,
}: {
  ticker: string;
  companyId: string;
  currency: Currency;
  unit: Unit;
  standard: string;
  annuals: FinancialPeriod[];
  quarters: FinancialPeriod[];
  ltm: FinancialPeriod | null;
  adjustments: NormalizationAdjustment[];
  canEdit: boolean;
  statutoryTaxRate: number;
}) {
  const router = useRouter();
  const toast = useToast();
  const [statement, setStatement] = useState<StatementKey>('income');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('ANNUAL');
  const [valueMode, setValueMode] = useState<ValueMode>('ABSOLUTE');
  const [showGrowth, setShowGrowth] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    periodLabel: annuals[annuals.length - 1]?.label ?? '',
    lineItem: 'EBITDA' as 'EBITDA' | 'EBIT' | 'NET_INCOME',
    category: 'RESTRUCTURING' as string,
    amount: 0,
    rationale: '',
  });

  const periods = useMemo(() => {
    if (periodMode === 'QUARTERLY') return quarters;
    if (periodMode === 'LTM_VS_ANNUAL') return ltm ? [...annuals.slice(-3), ltm] : annuals;
    return annuals;
  }, [periodMode, annuals, quarters, ltm]);

  const lines = STATEMENT_TABS.find((t) => t.key === statement)!.lines;
  const rows = useMemo(() => buildStatementRows(lines, periods, valueMode), [lines, periods, valueMode]);

  const normalized = useMemo(
    () => periods.map((p) => ({ period: p, result: normalizePeriod(p, adjustments, statutoryTaxRate) })),
    [periods, adjustments, statutoryTaxRate],
  );
  const hasAdjustments = adjustments.length > 0;

  const balanceChecks = periods.map((p) => ({ label: p.label, ...balanceSheetCheck(p.balance) }));
  const broken = balanceChecks.filter((c) => !c.balances);

  const exportCsv = () => {
    downloadText(
      `${ticker}-${statement}-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        ['Line item', ...periods.map((p) => p.label)],
        rows.filter((r) => !r.divider).map((r) => [r.label, ...periods.map((p) => r.values[p.label])]),
      ),
    );
    toast.push({ tone: 'pos', title: 'Statement exported', description: `${ticker} ${statement} as CSV.` });
  };

  const saveAdjustment = async () => {
    if (!form.rationale.trim()) {
      toast.push({ tone: 'warn', title: 'A rationale is required', description: 'Every adjustment records why it was made and by whom.' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/normalization', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Could not save', description: data.error }); return; }
      toast.push({ tone: 'pos', title: 'Adjustment recorded', description: 'It appears in the normalized view and in the audit trail.' });
      setModalOpen(false);
      setForm((f) => ({ ...f, amount: 0, rationale: '' }));
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const removeAdjustment = async (id: string) => {
    const res = await fetch(`/api/normalization/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.push({ tone: 'pos', title: 'Adjustment removed' }); router.refresh(); }
    else toast.push({ tone: 'neg', title: 'Could not remove the adjustment' });
  };

  const unitNote = `Figures in ${currency} ${unit === 'MILLIONS' ? 'millions' : unit.toLowerCase()} under ${standard.replace('_', ' ')}${valueMode === 'PERCENT_OF_REVENUE' ? ' — shown as a percentage of revenue' : ''}. Costs are displayed as negative; totals in bold.`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          value={statement} onChange={(v) => setStatement(v as StatementKey)}
          options={STATEMENT_TABS.map((t) => ({ value: t.key, label: t.label }))}
        />
        <Segmented
          value={periodMode} onChange={(v) => setPeriodMode(v as PeriodMode)}
          options={[
            { value: 'ANNUAL', label: 'Annual' },
            { value: 'QUARTERLY', label: 'Quarterly' },
            { value: 'LTM_VS_ANNUAL', label: 'LTM' },
          ]}
        />
        <Segmented
          size="xs"
          value={valueMode} onChange={(v) => setValueMode(v as ValueMode)}
          options={[{ value: 'ABSOLUTE', label: 'Values' }, { value: 'PERCENT_OF_REVENUE', label: '% of revenue' }]}
        />
        <Button size="xs" variant={showGrowth ? 'secondary' : 'ghost'} onClick={() => setShowGrowth((v) => !v)}>
          {showGrowth ? 'Hide growth' : 'Show growth'}
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" icon={<Icon.Download size={12} />} onClick={exportCsv}>Export CSV</Button>
          <Button size="sm" icon={<Icon.Download size={12} />} onClick={() => window.open(`/api/export/financials?ticker=${ticker}`, '_blank')}>
            Excel
          </Button>
        </div>
      </div>

      {broken.length ? (
        <InlineNote tone="warn">
          The balance sheet does not reconcile for {broken.map((b) => b.label).join(', ')}. Assets differ from
          liabilities plus equity by {broken.map((b) => formatPercent(b.gapPct ?? 0, 2)).join(', ')}.
        </InlineNote>
      ) : null}

      <FinancialTable
        periods={periods.map((p) => ({
          label: p.label,
          sublabel: p.periodType === 'LTM' ? `to ${formatDate(p.endDate)}` : formatDate(p.endDate),
        }))}
        rows={rows}
        currency={currency}
        unitNote={unitNote}
        showGrowth={showGrowth && valueMode === 'ABSOLUTE'}
        growthRowKeys={statement === 'income' ? ['revenue', 'ebitda', 'ebit', 'netIncome'] : statement === 'cashflow' ? ['cfo', 'fcf'] : ['totalAssets', 'totalEquity', 'netDebt']}
        maxHeight="calc(100vh - 330px)"
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Normalized figures"
            subtitle="Reported result plus the adjustments recorded in this workspace."
            actions={canEdit ? <Button size="xs" icon={<Icon.Plus size={11} />} onClick={() => setModalOpen(true)}>Add adjustment</Button> : null}
          />
          {!hasAdjustments ? (
            <p className="py-4 text-center text-xs text-ink-3">
              No adjustments recorded. Reported and normalized figures are identical.
            </p>
          ) : null}
          <div className="overflow-auto">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr>
                  <th className="label border-b border-line px-2 py-1.5 text-left">Measure</th>
                  {normalized.slice(-4).map((n) => (
                    <th key={n.period.label} className="label border-b border-line px-2 py-1.5 text-right">{n.period.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {([
                  ['Reported EBITDA', 'reportedEbitda'],
                  ['Adjustments', 'ebitdaAdjustments'],
                  ['Normalized EBITDA', 'normalizedEbitda'],
                  ['Reported EBIT', 'reportedEbit'],
                  ['Adjustments', 'ebitAdjustments'],
                  ['Normalized EBIT', 'normalizedEbit'],
                  ['Reported net income', 'reportedNetIncome'],
                  ['Adjustments', 'netIncomeAdjustments'],
                  ['Normalized net income', 'normalizedNetIncome'],
                ] as const).map(([label, key]) => (
                  <tr key={label + key} className={cx('border-b border-line/50', label.startsWith('Normalized') && 'font-medium')}>
                    <td className={cx('px-2 py-1', label === 'Adjustments' && 'pl-5 text-ink-3')}>{label}</td>
                    {normalized.slice(-4).map((n) => (
                      <td key={n.period.label} className="px-2 py-1 text-right">
                        <Num value={n.result[key]} format="currencyMillions" currency={currency} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Adjustment register" subtitle="Every entry records its rationale, author and timestamp." />
          {adjustments.length === 0 ? (
            <p className="py-4 text-center text-xs text-ink-3">Nothing recorded for {ticker}.</p>
          ) : (
            <ul className="space-y-2">
              {adjustments.map((a) => (
                <li key={a.id} className="rounded border border-line p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone="outline">{a.periodLabel}</Badge>
                        <Badge tone="accent">{a.lineItem.replace('_', ' ')}</Badge>
                        <span className="text-2xs text-ink-4">{ADJUSTMENT_CATEGORIES.find((c) => c[0] === a.category)?.[1] ?? a.category}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-ink-2">{a.rationale}</p>
                      <p className="mt-1 text-2xs text-ink-4">{a.author} · {formatDate(a.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Num value={a.amount} format="currencyMillions" currency={currency} className="text-xs font-medium" />
                      {canEdit ? (
                        <button type="button" onClick={() => removeAdjustment(a.id)} className="text-2xs text-ink-4 hover:text-neg">Remove</button>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Statement checks" subtitle="Run on every period held in the workspace." dense />
        <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {balanceChecks.map((c) => (
            <StatRow
              key={c.label}
              label={`${c.label} — assets = liabilities + equity`}
              value={c.balances ? <Badge tone="pos">Balances</Badge> : <Badge tone="neg">Off by {formatPercent(c.gapPct ?? 0, 2)}</Badge>}
            />
          ))}
        </div>
      </Panel>

      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title="Add a normalization adjustment"
        subtitle="Adjustments cascade down the income statement and are recorded in the audit trail."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveAdjustment} loading={saving}>Record adjustment</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Period">
              <Select value={form.periodLabel} onChange={(e) => setForm((f) => ({ ...f, periodLabel: e.target.value }))}>
                {[...annuals, ...quarters].map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
              </Select>
            </Field>
            <Field label="Line item">
              <Select value={form.lineItem} onChange={(e) => setForm((f) => ({ ...f, lineItem: e.target.value as typeof f.lineItem }))}>
                <option value="EBITDA">EBITDA</option>
                <option value="EBIT">EBIT</option>
                <option value="NET_INCOME">Net income</option>
              </Select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {ADJUSTMENT_CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label={`Amount (${currency} millions)`} hint="Positive adds back a cost; negative removes a gain.">
              <NumberInput value={form.amount} onValueChange={(v) => setForm((f) => ({ ...f, amount: v }))} />
            </Field>
          </div>
          <Field label="Rationale" required hint="Why this item is not representative of the underlying business.">
            <Textarea
              value={form.rationale}
              onChange={(e) => setForm((f) => ({ ...f, rationale: e.target.value }))}
              placeholder="Provision related to the plant closure announced in the period; it does not recur."
            />
          </Field>
          <InlineNote tone="info">
            An EBITDA adjustment flows through to EBIT and, net of tax at {formatPercent(statutoryTaxRate, 0)}, to net income —
            unless you record an explicit adjustment at those lines.
          </InlineNote>
        </div>
      </Modal>
    </div>
  );
}
