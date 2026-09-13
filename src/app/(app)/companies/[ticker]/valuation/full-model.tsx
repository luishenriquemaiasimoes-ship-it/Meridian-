'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Badge, Button, cx, EmptyState, InlineNote, Input, NumberInput, Panel, PanelHeader,
  PercentInput, Segmented, Tabs, Tooltip, useToast,
} from '@/components/ui/primitives';
import { Icon } from '@/components/ui/icons';
import { Num } from '@/components/ui/values';
import { DASH, formatMetric, formatPercent, REPORTING_UNIT_SCALE } from '@/lib/finance/format';
import { isNum } from '@/lib/finance/core';
import type { Currency } from '@/lib/finance/types';
import type { MetricFormat } from '@/lib/finance/format';
import type { ProjectionContext, ProjectionRun } from '@/server/services/projection';
import type { ProjectionInput } from '@/lib/finance/projection/types';

/* ==================================================================
   The full model.

   Every number on this screen is the output of a driver the analyst can
   see and change. The statements are read across the years the way a
   model is read, and the build-ups sit behind them so the question
   "where does this come from" always has one more level of answer.
   ================================================================== */

type Tab = 'income' | 'balance' | 'cash' | 'drivers' | 'debt' | 'value';

const TABS: { value: Tab; label: string }[] = [
  { value: 'income', label: 'DRE projetada' },
  { value: 'balance', label: 'Balanço projetado' },
  { value: 'cash', label: 'Fluxo de caixa' },
  { value: 'drivers', label: 'Build-up' },
  { value: 'debt', label: 'Dívida e D&A' },
  { value: 'value', label: 'FCFF, FCFE e covenants' },
];

export function FullModel(props: {
  ticker: string;
  modelId: string | null;
  currency: Currency;
  canEdit: boolean;
  /** The DCF tab's fair value, so the two can be reconciled where they differ. */
  dcfFairValue?: number | null;
}) {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('income');
  const [context, setContext] = useState<ProjectionContext | null>(null);
  const [input, setInput] = useState<ProjectionInput | null>(null);
  const [run, setRun] = useState<ProjectionRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let live = true;
    setLoading(true);
    fetch(`/api/valuation/projection?ticker=${props.ticker}${props.modelId ? `&modelId=${props.modelId}` : ''}`)
      .then((r) => r.json())
      .then((d) => {
        if (!live || d.error) return;
        setContext(d.context as ProjectionContext);
        setInput((d.context.saved ?? d.context.suggested) as ProjectionInput);
        setRun(d.run as ProjectionRun);
      })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [props.ticker, props.modelId]);

  const recompute = useCallback(async (next: ProjectionInput) => {
    setBusy(true);
    try {
      const res = await fetch('/api/valuation/projection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: props.ticker, modelId: props.modelId, input: next }),
      });
      const d = await res.json();
      if (res.ok) setRun(d.run as ProjectionRun);
    } finally { setBusy(false); }
  }, [props.ticker, props.modelId]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = input ? JSON.stringify(input) : '';
  useEffect(() => {
    if (!input) return;
    if (timer.current) clearTimeout(timer.current);
    const next = input;
    timer.current = setTimeout(() => { void recompute(next); }, 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, recompute]);

  const patch = (next: Partial<ProjectionInput>) => {
    setInput((a) => (a ? { ...a, ...next } : a));
    setDirty(true);
  };

  const save = async () => {
    if (!input) return;
    setBusy(true);
    try {
      const res = await fetch('/api/valuation/projection', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: props.ticker, modelId: props.modelId, input, save: true }),
      });
      const d = await res.json();
      if (!res.ok) { toast.push({ tone: 'neg', title: 'Não salvo', description: d.error }); return; }
      setRun(d.run as ProjectionRun);
      setDirty(false);
      toast.push({ tone: 'pos', title: 'Modelo salvo' });
    } finally { setBusy(false); }
  };

  if (loading) {
    return <Panel><div className="p-6 text-center text-xs text-ink-3">Lendo o histórico reportado…</div></Panel>;
  }
  if (!context || !input || !run) {
    return (
      <Panel>
        <EmptyState
          icon={<Icon.Valuation size={22} />}
          title="Sem histórico suficiente"
          description="Um modelo completo parte do último balanço reportado. Sem demonstrações anuais não há de onde partir."
        />
      </Panel>
    );
  }

  const { projected, valuation } = run;
  const years = projected.years;
  const closes = projected.balance.every((b) => b.balances);

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Modelo completo"
          subtitle={`Base ${context.baseYear} · ${input.years} anos projetados · ${input.revenue.length} linhas de receita · partindo do balanço reportado`}
          actions={
            <div className="flex flex-wrap items-center gap-1.5">
              {busy ? <span className="text-2xs text-ink-4">recalculando…</span> : null}
              <Tooltip content={closes
                ? 'Ativo igual a passivo mais patrimônio líquido em todos os anos projetados.'
                : 'O balanço não fecha. A diferença é mostrada por ano, não tapada.'}>
                <Badge tone={closes ? 'pos' : 'neg'}>{closes ? 'balanço fecha' : 'balanço não fecha'}</Badge>
              </Tooltip>
              {props.canEdit ? (
                <>
                  <Button size="xs" variant="ghost" onClick={() => { setInput(context.suggested); setDirty(true); }}>
                    Voltar ao reportado
                  </Button>
                  <Button size="xs" onClick={() => void save()} disabled={busy || !dirty || !context.modelId}>
                    Salvar
                  </Button>
                </>
              ) : null}
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-px border-y border-line bg-line sm:grid-cols-5">
          <Stat label="Valor por ação" value={valuation.valuePerShare} format="currency" currency={props.currency} />
          <Stat label="Preço" value={valuation.currentPrice} format="currency" currency={props.currency} />
          <Stat label="Upside" value={valuation.upside} format="percentSigned" tone />
          <Stat label="TIR desalavancada" value={valuation.unleveredIrr} format="percent" />
          <Stat label="TIR alavancada" value={valuation.leveredIrr} format="percent" />
        </div>
        {isNum(props.dcfFairValue) && isNum(valuation.valuePerShare) ? (
          <div className="mt-3 rounded border border-line bg-sunken p-2.5 text-xs leading-relaxed text-ink-2">
            <span className="font-medium text-ink-1">Por que este número difere do DCF na aba Model.</span>{' '}
            O DCF chega a{' '}
            <Num value={props.dcfFairValue} format="currency" currency={props.currency} decimals={2} />{' '}
            e este modelo a{' '}
            <Num value={valuation.valuePerShare} format="currency" currency={props.currency} decimals={2} />
            {', '}
            uma diferença de{' '}
            <Num
              value={(valuation.valuePerShare as number) / (props.dcfFairValue as number) - 1}
              format="percent"
            />
            . Três razões, nenhuma delas um erro: o DCF projeta cinco anos e este projeta dez; o DCF
            desce de EV para equity subtraindo a dívida líquida, enquanto este desconta o fluxo ao
            acionista (FCFE) e multiplica pela participação; e um modelo salvo congela a taxa de
            desconto da data em que foi salvo, enquanto este usa a construção corrente. Onde as duas
            rotas deste modelo divergem entre si, a diferença aparece como{' '}
            <span className="font-medium text-ink-1">routeGap</span> na ponte de equity abaixo.
          </div>
        ) : null}
        {valuation.warnings.length ? (
          <div className="space-y-1.5 p-3">
            {valuation.warnings.map((w) => <InlineNote key={w} tone="warn">{w}</InlineNote>)}
          </div>
        ) : null}
      </Panel>

      <Tabs value={tab} onChange={(v) => setTab(v as Tab)} tabs={TABS} />

      {tab === 'income' ? (
        <StatementTable
          title="Demonstração do resultado"
          subtitle="Projetada a partir dos drivers, não de uma margem."
          years={years} currency={props.currency}
          rows={[
            { label: 'Receita bruta', pick: (i) => projected.income[i].grossRevenue, format: 'currencyMillions' },
            { label: 'Deduções', pick: (i) => projected.income[i].deductions, format: 'currencyMillions', indent: 1 },
            { label: 'Receita líquida', pick: (i) => projected.income[i].netRevenue, format: 'currencyMillions', emphasis: true },
            { label: '% crescimento', pick: (i) => projected.income[i].revenueGrowth, format: 'percent', indent: 1, muted: true },
            { divider: 'Custos' },
            ...input.costs.filter((c) => c.block === 'COGS').map((c) => ({
              label: c.label, indent: 1, format: 'currencyMillions' as MetricFormat,
              pick: (i: number) => -(projected.income[i].costLines.find((x) => x.key === c.key)?.amount ?? 0),
            })),
            { label: 'Custo total', pick: (i) => projected.income[i].cogs, format: 'currencyMillions' },
            { label: 'Lucro bruto', pick: (i) => projected.income[i].grossProfit, format: 'currencyMillions', emphasis: true },
            { label: '% margem bruta', pick: (i) => projected.income[i].grossMargin, format: 'percent', indent: 1, muted: true },
            { divider: 'Despesas' },
            ...input.costs.filter((c) => c.block === 'SGA').map((c) => ({
              label: c.label, indent: 1, format: 'currencyMillions' as MetricFormat,
              pick: (i: number) => -(projected.income[i].costLines.find((x) => x.key === c.key)?.amount ?? 0),
            })),
            { label: 'EBITDA', pick: (i) => projected.income[i].ebitda, format: 'currencyMillions', emphasis: true },
            { label: '% margem EBITDA', pick: (i) => projected.income[i].ebitdaMargin, format: 'percent', indent: 1, muted: true },
            { label: 'Depreciação', pick: (i) => projected.income[i].depreciation, format: 'currencyMillions', indent: 1 },
            { label: 'Amortização', pick: (i) => projected.income[i].amortisation, format: 'currencyMillions', indent: 1 },
            { label: 'EBIT', pick: (i) => projected.income[i].ebit, format: 'currencyMillions', emphasis: true },
            { label: '% margem EBIT', pick: (i) => projected.income[i].ebitMargin, format: 'percent', indent: 1, muted: true },
            { divider: 'Resultado financeiro' },
            { label: 'Receitas financeiras', pick: (i) => projected.income[i].financialIncome, format: 'currencyMillions', indent: 1 },
            { label: 'Despesas financeiras', pick: (i) => projected.income[i].financialExpense, format: 'currencyMillions', indent: 1 },
            { label: 'LAIR', pick: (i) => projected.income[i].ebt, format: 'currencyMillions' },
            { label: 'Imposto de renda', pick: (i) => projected.income[i].taxes, format: 'currencyMillions', indent: 1 },
            { label: 'Alíquota efetiva', pick: (i) => projected.income[i].effectiveTaxRate, format: 'percent', indent: 1, muted: true },
            { label: 'Lucro líquido', pick: (i) => projected.income[i].netIncome, format: 'currencyMillions', emphasis: true },
            { label: '% margem líquida', pick: (i) => projected.income[i].netMargin, format: 'percent', indent: 1, muted: true },
          ]}
        />
      ) : null}

      {tab === 'balance' ? (
        <StatementTable
          title="Balanço patrimonial"
          subtitle="O caixa vem do fluxo de caixa; os lucros acumulados absorvem o resultado. A linha de verificação mostra a diferença, se houver."
          years={years} currency={props.currency}
          rows={[
            { divider: 'Ativo' },
            { label: 'Caixa e equivalentes', pick: (i) => projected.balance[i].cash, format: 'currencyMillions', indent: 1 },
            { label: 'Clientes', pick: (i) => projected.balance[i].receivables, format: 'currencyMillions', indent: 1 },
            { label: 'Estoques', pick: (i) => projected.balance[i].inventory, format: 'currencyMillions', indent: 1 },
            { label: 'Outros ativos circulantes', pick: (i) => projected.balance[i].otherCurrentAssets, format: 'currencyMillions', indent: 1 },
            { label: 'Ativo circulante', pick: (i) => projected.balance[i].currentAssets, format: 'currencyMillions' },
            { label: 'Imobilizado', pick: (i) => projected.balance[i].tangibleAssets, format: 'currencyMillions', indent: 1 },
            { label: 'Intangível', pick: (i) => projected.balance[i].intangibleAssets, format: 'currencyMillions', indent: 1 },
            { label: 'Outros ativos não circulantes', pick: (i) => projected.balance[i].otherNonCurrentAssets, format: 'currencyMillions', indent: 1 },
            { label: 'Ativo não circulante', pick: (i) => projected.balance[i].nonCurrentAssets, format: 'currencyMillions' },
            { label: 'Ativo total', pick: (i) => projected.balance[i].totalAssets, format: 'currencyMillions', emphasis: true },
            { divider: 'Passivo e patrimônio líquido' },
            { label: 'Fornecedores', pick: (i) => projected.balance[i].payables, format: 'currencyMillions', indent: 1 },
            { label: 'Dívida circulante', pick: (i) => projected.balance[i].shortTermDebt, format: 'currencyMillions', indent: 1 },
            { label: 'Provisões', pick: (i) => projected.balance[i].provisions, format: 'currencyMillions', indent: 1 },
            { label: 'Outras obrigações circulantes', pick: (i) => projected.balance[i].otherCurrentLiabilities, format: 'currencyMillions', indent: 1 },
            { label: 'Passivo circulante', pick: (i) => projected.balance[i].currentLiabilities, format: 'currencyMillions' },
            { label: 'Dívida não circulante', pick: (i) => projected.balance[i].longTermDebt, format: 'currencyMillions', indent: 1 },
            { label: 'Outras obrigações não circulantes', pick: (i) => projected.balance[i].otherNonCurrentLiabilities, format: 'currencyMillions', indent: 1 },
            { label: 'Passivo total', pick: (i) => projected.balance[i].totalLiabilities, format: 'currencyMillions' },
            { label: 'Capital social', pick: (i) => projected.balance[i].shareCapital, format: 'currencyMillions', indent: 1 },
            { label: 'Lucros acumulados', pick: (i) => projected.balance[i].retainedEarnings, format: 'currencyMillions', indent: 1 },
            { label: 'Participação de minoritários', pick: (i) => projected.balance[i].minorityInterest, format: 'currencyMillions', indent: 1 },
            { label: 'Patrimônio líquido', pick: (i) => projected.balance[i].equity, format: 'currencyMillions', emphasis: true },
            { label: 'Passivo + PL', pick: (i) => projected.balance[i].totalLiabilitiesAndEquity, format: 'currencyMillions', emphasis: true },
            { divider: 'Verificação' },
            { label: 'Diferença (ativo − passivo − PL)', pick: (i) => projected.balance[i].balanceGap, format: 'currencyMillions', check: true },
          ]}
        />
      ) : null}

      {tab === 'cash' ? (
        <StatementTable
          title="Demonstração do fluxo de caixa"
          subtitle="O caixa final de cada ano é o caixa do balanço, por construção."
          years={years} currency={props.currency}
          rows={[
            { divider: 'Atividades operacionais' },
            { label: 'Lucro líquido', pick: (i) => projected.cashFlow[i].netIncome, format: 'currencyMillions', indent: 1 },
            { label: 'Depreciação e amortização', pick: (i) => projected.cashFlow[i].da, format: 'currencyMillions', indent: 1 },
            { label: 'Variação do capital de giro', pick: (i) => projected.cashFlow[i].workingCapitalChange, format: 'currencyMillions', indent: 1 },
            { label: 'Caixa das atividades operacionais', pick: (i) => projected.cashFlow[i].operatingCashFlow, format: 'currencyMillions', emphasis: true },
            { divider: 'Atividades de investimento' },
            { label: 'Investimentos (capex)', pick: (i) => projected.cashFlow[i].capex, format: 'currencyMillions', indent: 1 },
            { label: 'Caixa das atividades de investimento', pick: (i) => projected.cashFlow[i].investingCashFlow, format: 'currencyMillions', emphasis: true },
            { divider: 'Atividades de financiamento' },
            { label: 'Captações de dívida', pick: (i) => projected.cashFlow[i].debtDrawn, format: 'currencyMillions', indent: 1 },
            { label: 'Amortizações de dívida', pick: (i) => projected.cashFlow[i].debtRepaid, format: 'currencyMillions', indent: 1 },
            { label: 'Dividendos pagos', pick: (i) => projected.cashFlow[i].dividendsPaid, format: 'currencyMillions', indent: 1 },
            { label: 'Caixa das atividades de financiamento', pick: (i) => projected.cashFlow[i].financingCashFlow, format: 'currencyMillions', emphasis: true },
            { divider: 'Variação de caixa' },
            { label: 'Saldo inicial', pick: (i) => projected.cashFlow[i].openingCash, format: 'currencyMillions' },
            { label: 'Aumento (redução) de caixa', pick: (i) => projected.cashFlow[i].netChangeInCash, format: 'currencyMillions' },
            { label: 'Saldo final', pick: (i) => projected.cashFlow[i].closingCash, format: 'currencyMillions', emphasis: true },
          ]}
        />
      ) : null}

      {tab === 'drivers' ? (
        <Drivers
          context={context} input={input} run={run} years={years}
          currency={props.currency} canEdit={props.canEdit} patch={patch}
        />
      ) : null}

      {tab === 'debt' ? (
        <DebtAndDepreciation input={input} run={run} years={years} currency={props.currency}
          canEdit={props.canEdit} patch={patch} />
      ) : null}

      {tab === 'value' ? (
        <ValueBridge run={run} years={years} currency={props.currency} />
      ) : null}
    </div>
  );
}

/* ========================= statement table ========================= */

interface Row {
  label?: string;
  divider?: string;
  pick?: (i: number) => number | null;
  format?: MetricFormat;
  indent?: number;
  emphasis?: boolean;
  muted?: boolean;
  /** A verification row: zero is the right answer, anything else is a finding. */
  check?: boolean;
}

function StatementTable(props: {
  title: string; subtitle: string; years: number[]; currency: Currency; rows: Row[];
}) {
  return (
    <Panel>
      <PanelHeader title={props.title} subtitle={props.subtitle} />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-line">
              <th className="sticky left-0 z-10 bg-panel px-3 py-2 text-left font-medium text-ink-3 min-w-[240px]">
                Linha
              </th>
              {props.years.map((y) => (
                <th key={y} className="num px-3 py-2 text-right font-medium text-ink whitespace-nowrap min-w-[108px]">
                  {y}E
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows.map((r, idx) => {
              if (r.divider) {
                return (
                  <tr key={`d-${idx}`} className="bg-sunken/60">
                    <td colSpan={props.years.length + 1} className="label sticky left-0 bg-sunken/60 px-3 py-1">
                      {r.divider}
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={`${r.label}-${idx}`} className="border-b border-line/50 hover:bg-sunken/40">
                  <td
                    className={cx(
                      'sticky left-0 bg-panel px-3 py-1 whitespace-nowrap',
                      r.emphasis ? 'font-medium text-ink' : r.muted ? 'text-ink-4' : 'text-ink-2',
                    )}
                    style={{ paddingLeft: `${12 + (r.indent ?? 0) * 14}px` }}
                  >
                    {r.label}
                  </td>
                  {props.years.map((y, i) => {
                    const v = r.pick?.(i) ?? null;
                    const failing = r.check && isNum(v) && Math.abs(v as number) > 0.01;
                    return (
                      <td key={y} className="px-3 py-1 text-right whitespace-nowrap">
                        {r.check ? (
                          <span className={cx('num text-2xs', failing ? 'text-neg font-medium' : 'text-pos')}>
                            {failing ? formatMetric(v, 'currencyMillions', { currency: props.currency }) : 'OK'}
                          </span>
                        ) : (
                          <Num
                            value={v} format={r.format ?? 'currencyMillions'} currency={props.currency}
                            className={cx(r.emphasis && 'font-medium', r.muted && 'text-2xs')}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Stat(props: {
  label: string; value: number | null; format: MetricFormat; currency?: Currency; tone?: boolean;
}) {
  const v = props.value;
  return (
    <div className="bg-panel px-3 py-2">
      <span className="label">{props.label}</span>
      <span className={cx(
        'block num text-lg font-semibold',
        !isNum(v) ? 'text-ink-4'
          : props.tone ? ((v as number) >= 0 ? 'text-pos' : 'text-neg') : 'text-ink',
      )}>
        {isNum(v) ? formatMetric(v, props.format, { currency: props.currency, decimals: 2 }) : DASH}
      </span>
    </div>
  );
}

export { StatementTable };

/* =========================== build-ups =========================== */


/**
 * The price per unit, in currency.
 *
 * Revenue is carried in millions and volumes are absolute, so the model's
 * price is in millions per unit: scaling it back is what turns 0.0000061 into
 * the six reais and ten centavos a driver actually pays. The decimals adapt
 * because the same field holds a toll and the price of a mine.
 */
function unitPrice(price: number | null, currency: Currency): string {
  if (!isNum(price)) return DASH;
  const perUnit = (price as number) * REPORTING_UNIT_SCALE;
  const magnitude = Math.abs(perUnit);
  const decimals = magnitude >= 1000 ? 0 : magnitude >= 10 ? 2 : magnitude >= 0.1 ? 3 : 4;
  return formatMetric(perUnit, 'currency', { currency, decimals });
}

function Drivers(props: {
  context: ProjectionContext; input: ProjectionInput; run: ProjectionRun;
  years: number[]; currency: Currency; canEdit: boolean;
  patch: (next: Partial<ProjectionInput>) => void;
}) {
  const { input, run, years, currency } = props;

  const setRevenue = (key: string, next: Partial<ProjectionInput['revenue'][number]>) =>
    props.patch({ revenue: input.revenue.map((r) => (r.key === key ? { ...r, ...next } : r)) });
  const setCost = (key: string, next: Partial<ProjectionInput['costs'][number]>) =>
    props.patch({ costs: input.costs.map((c) => (c.key === key ? { ...c, ...next } : c)) });

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Build-up da receita"
          subtitle="Cada linha tem o seu próprio motor. Uma linha de volume e preço projeta os dois separadamente; uma linha percentual resolve depois da linha que referencia."
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-line text-2xs text-ink-3">
                <th className="px-3 py-2 text-left font-medium min-w-[190px]">Linha</th>
                <th className="px-2 py-2 text-left font-medium">Motor</th>
                <th className="px-2 py-2 text-right font-medium">Crescimento</th>
                {years.slice(0, 6).map((y) => (
                  <th key={y} className="num px-3 py-2 text-right font-medium">{y}E</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {input.revenue.map((line) => (
                <tr key={line.key} className="border-b border-line/50 hover:bg-sunken/40">
                  <td className="px-3 py-1.5">
                    <span className="text-ink-2">{line.label}</span>
                    {line.source ? <span className="block text-2xs text-ink-4">{line.source}</span> : null}
                  </td>
                  <td className="px-2 py-1.5">
                    <Badge tone="outline">
                      {line.kind === 'VOLUME_PRICE' ? 'volume × preço'
                        : line.kind === 'PCT_OF' ? `% de ${line.ofKey}`
                        : line.kind === 'CONSTRUCTION' ? 'capex como receita' : 'crescimento'}
                    </Badge>
                    {line.priceIndex ? <span className="ml-1.5 text-2xs text-ink-4">{line.priceIndex}</span> : null}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <div className="ml-auto w-[86px]">
                      {line.kind === 'GROWTH' ? (
                        <PercentInput
                          value={line.revenueGrowth?.[0] ?? 0} step={0.5} decimals={1} disabled={!props.canEdit}
                          onValueChange={(v) => setRevenue(line.key, { revenueGrowth: [v] })}
                        />
                      ) : line.kind === 'VOLUME_PRICE' ? (
                        <PercentInput
                          value={line.priceGrowth?.[0] ?? 0} step={0.5} decimals={1} disabled={!props.canEdit}
                          onValueChange={(v) => setRevenue(line.key, { priceGrowth: [v] })}
                        />
                      ) : line.kind === 'PCT_OF' ? (
                        <PercentInput
                          value={line.pctOf?.[0] ?? 0} step={0.5} decimals={1} disabled={!props.canEdit}
                          onValueChange={(v) => setRevenue(line.key, { pctOf: [v] })}
                        />
                      ) : <span className="text-2xs text-ink-4">—</span>}
                    </div>
                  </td>
                  {years.slice(0, 6).map((y, i) => {
                    const cell = run.projected.revenue[i]?.lines.find((l) => l.key === line.key);
                    return (
                      <td key={y} className="px-3 py-1.5 text-right">
                        <Num value={cell?.gross ?? null} format="currencyMillions" currency={currency} />
                        {isNum(cell?.volume) ? (
                          <span className="block text-2xs text-ink-4">
                            {formatMetric(cell?.volume ?? null, 'number', { decimals: 0 })} × {unitPrice(cell?.price ?? null, currency)}
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-b border-line bg-sunken/40">
                <td className="px-3 py-1.5 font-medium text-ink" colSpan={3}>Receita líquida</td>
                {years.slice(0, 6).map((y, i) => (
                  <td key={y} className="px-3 py-1.5 text-right">
                    <Num value={run.projected.revenue[i]?.netRevenue ?? null} format="currencyMillions" currency={currency} className="font-medium" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Build-up de custos" subtitle="Cada linha contra o seu próprio driver." />
          <div className="divide-y divide-line">
            {input.costs.map((c) => (
              <div key={c.key} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <span className="block text-xs text-ink-2">{c.label}</span>
                  <span className="block text-2xs text-ink-4">
                    {c.block} · {c.kind === 'PCT_REVENUE' ? '% da receita' : c.kind === 'CONSTRUCTION' ? 'espelha o capex' : c.kind.toLowerCase()}
                    {c.base === 'NET_REVENUE_EX_CONSTRUCTION' ? ' (ex-construção)' : ''}
                  </span>
                </div>
                <div className="w-[92px] shrink-0">
                  {c.kind === 'PCT_REVENUE' || c.kind === 'PCT_REVENUE_LINE' ? (
                    <PercentInput
                      value={c.pct?.[0] ?? 0} step={0.5} decimals={1} disabled={!props.canEdit}
                      onValueChange={(v) => setCost(c.key, { pct: [v] })}
                    />
                  ) : <span className="block text-right text-2xs text-ink-4">derivado</span>}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Capital de giro por prazos" subtitle="Em dias. O giro cai fora dos prazos, não de um percentual." />
          <div className="divide-y divide-line">
            {([
              ['receivableDays', 'PMR clientes (sobre a receita)'],
              ['payableDays', 'PMP fornecedores (sobre o custo)'],
              ['inventoryDays', 'PME estoques (sobre o custo)'],
              ['otherAssetDays', 'Outros ativos (sobre a receita)'],
              ['otherLiabilityDays', 'Outras obrigações (sobre a receita)'],
            ] as const).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-xs text-ink-2">{label}</span>
                <div className="w-[92px] shrink-0">
                  <NumberInput
                    value={Math.round((input.workingCapital[k] ?? 0) * 10) / 10}
                    step="0.5" disabled={!props.canEdit} suffix="d"
                    onValueChange={(v) => props.patch({ workingCapital: { ...input.workingCapital, [k]: v } })}
                  />
                </div>
              </div>
            ))}
            <div className="px-3 py-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs text-ink-2">Capital de giro líquido, {years[0]}E</span>
                <Num value={run.projected.workingCapital[0]?.netWorkingCapital ?? null} format="currencyMillions" currency={currency} />
              </div>
              <p className="mt-0.5 text-2xs leading-relaxed text-ink-4">
                Um capital de giro negativo é financiamento dos fornecedores: nesse caso o crescimento gera caixa em vez de consumir.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="De onde veio cada ponto de partida" subtitle="Toda premissa inicial foi lida de um demonstrativo, e diz de qual." />
        <table className="w-full text-2xs">
          <tbody className="divide-y divide-line">
            {props.context.provenance.map((p) => (
              <tr key={p.path}>
                <td className="px-3 py-1.5 text-ink-2">{p.label}</td>
                <td className="num px-2 py-1.5 text-right text-ink">
                  {p.value === null ? DASH
                    : Math.abs(p.value) < 3 ? formatPercent(p.value, 2)
                    : formatMetric(p.value, 'number', { decimals: 0 })}
                </td>
                <td className="px-3 py-1.5 text-ink-4">{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

function DebtAndDepreciation(props: {
  input: ProjectionInput; run: ProjectionRun; years: number[]; currency: Currency;
  canEdit: boolean; patch: (next: Partial<ProjectionInput>) => void;
}) {
  const { input, run, years, currency } = props;
  const d = run.projected.debtSchedule;

  return (
    <div className="space-y-4">
      <Panel>
        <PanelHeader
          title="Cronograma de dívida"
          subtitle="Saldo inicial, captações, amortizações, saldo final. Os juros incidem sobre o saldo médio."
          actions={
            <div className="flex items-center gap-2">
              <Segmented
                value={input.debt.rollMaturities ? 'roll' : 'amortise'}
                onChange={(v) => props.patch({ debt: { ...input.debt, rollMaturities: v === 'roll' } })}
                options={[{ value: 'roll', label: 'Rola vencimentos' }, { value: 'amortise', label: 'Amortiza' }]}
              />
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-px border-y border-line bg-line sm:grid-cols-4">
          <Stat label="Custo da dívida" value={input.debt.costOfDebt} format="percent" />
          <Stat label="Anos de amortização" value={input.debt.amortisationYears} format="number" />
          <Stat label="Capex financiado por dívida" value={input.debt.capexFundedByDebt} format="percent" />
          <Stat label="Rendimento do caixa" value={input.debt.cashYield ?? null} format="percent" />
        </div>
        <StatementTable
          title="" subtitle="" years={years} currency={currency}
          rows={[
            { label: 'Saldo inicial', pick: (i) => d.years[i]?.opening ?? null },
            { label: '(+) Captações', pick: (i) => d.years[i]?.draws ?? null, indent: 1 },
            { label: '(−) Amortizações', pick: (i) => -(d.years[i]?.amortisation ?? 0), indent: 1 },
            { label: 'Saldo final', pick: (i) => d.years[i]?.closing ?? null, emphasis: true },
            { label: 'Parcela circulante', pick: (i) => d.years[i]?.currentPortion ?? null, indent: 1, muted: true },
            { label: 'Despesa de juros', pick: (i) => -(d.years[i]?.interest ?? 0) },
          ]}
        />
      </Panel>

      <div className="space-y-4">
        <Panel>
          <PanelHeader
            title="Depreciação por safra"
            subtitle="Cada adição é baixada pela vida que lhe cabe, não por um percentual da receita."
          />
          <StatementTable
            title="" subtitle="" years={years} currency={currency}
            rows={[
              { label: 'Depreciação do imobilizado', pick: (i) => -(run.projected.depreciationSchedule.rows[i]?.charge ?? 0) },
              { label: 'Imobilizado final', pick: (i) => run.projected.depreciationSchedule.rows[i]?.closing ?? null, emphasis: true },
              { label: 'Amortização do intangível', pick: (i) => -(run.projected.amortisationSchedule.rows[i]?.charge ?? 0) },
              { label: 'Intangível final', pick: (i) => run.projected.amortisationSchedule.rows[i]?.closing ?? null, emphasis: true },
            ]}
          />
        </Panel>

        <Panel>
          <PanelHeader title="Programa de investimentos" subtitle="O que é gasto, como é classificado e por quanto tempo é baixado." />
          <div className="divide-y divide-line">
            {input.capex.map((c, idx) => (
              <div key={c.key} className="space-y-2 px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-ink">{c.label}</span>
                  {c.amortiseToYear ? <Badge tone="accent">baixa até {c.amortiseToYear}</Badge> : null}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="label">% da receita</span>
                    <PercentInput
                      value={c.pctRevenue?.[0] ?? 0} step={0.5} decimals={1} disabled={!props.canEdit}
                      onValueChange={(v) => props.patch({
                        capex: input.capex.map((x, i) => (i === idx ? { ...x, pctRevenue: [v], amounts: undefined } : x)),
                      })}
                    />
                  </label>
                  <label className="block">
                    <span className="label">% tangível</span>
                    <PercentInput
                      value={c.tangibleShare} step={1} decimals={0} disabled={!props.canEdit}
                      onValueChange={(v) => props.patch({
                        capex: input.capex.map((x, i) => (i === idx ? { ...x, tangibleShare: Math.min(1, Math.max(0, v)) } : x)),
                      })}
                    />
                  </label>
                  <label className="block">
                    <span className="label">Vida útil</span>
                    <NumberInput
                      value={c.usefulLife} step="1" disabled={!props.canEdit} suffix="a"
                      onValueChange={(v) => props.patch({
                        capex: input.capex.map((x, i) => (i === idx ? { ...x, usefulLife: Math.max(1, Math.round(v)) } : x)),
                      })}
                    />
                  </label>
                </div>
                {c.source ? <p className="text-2xs text-ink-4">{c.source}</p> : null}
                {isNum(c.contractedRemaining) ? (
                  <p className="text-2xs text-ink-3">
                    Contratado restante: <Num value={c.contractedRemaining ?? null} format="currencyMillions" currency={currency} />
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ValueBridge(props: { run: ProjectionRun; years: number[]; currency: Currency }) {
  const { run, years, currency } = props;
  const v = run.valuation;
  const covenantKeys = Array.from(new Set(v.covenants.map((c) => c.key)));

  return (
    <div className="space-y-4">
      <StatementTable
        title="FCFF e FCFE"
        subtitle="O FCFF tributa o EBIT, porque é desalavancado. O FCFE serve e rola a dívida e devolve o escudo fiscal dos juros."
        years={years} currency={currency}
        rows={[
          { label: 'EBIT', pick: (i) => v.cashFlows[i]?.ebit ?? null },
          { label: 'Imposto sobre o EBIT', pick: (i) => v.cashFlows[i]?.taxOnEbit ?? null, indent: 1 },
          { label: 'NOPAT', pick: (i) => v.cashFlows[i]?.nopat ?? null, emphasis: true },
          { label: '(+) Depreciação e amortização', pick: (i) => v.cashFlows[i]?.da ?? null, indent: 1 },
          { label: '(−) Capex', pick: (i) => v.cashFlows[i]?.capex ?? null, indent: 1 },
          { label: '(+/−) Variação do capital de giro', pick: (i) => v.cashFlows[i]?.workingCapitalChange ?? null, indent: 1 },
          { label: 'FCFF', pick: (i) => v.cashFlows[i]?.fcff ?? null, emphasis: true },
          { label: 'FCFF descontado', pick: (i) => v.cashFlows[i]?.pvFcff ?? null, indent: 1, muted: true },
          { divider: 'Ponte para o acionista' },
          { label: '(+) Captações de dívida', pick: (i) => v.cashFlows[i]?.debtDrawn ?? null, indent: 1 },
          { label: '(−) Amortizações', pick: (i) => v.cashFlows[i]?.debtRepaid ?? null, indent: 1 },
          { label: '(−) Juros líquidos após impostos', pick: (i) => v.cashFlows[i]?.netInterestAfterTax ?? null, indent: 1 },
          { label: 'FCFE', pick: (i) => v.cashFlows[i]?.fcfe ?? null, emphasis: true },
          { label: 'FCFE descontado', pick: (i) => v.cashFlows[i]?.pvFcfe ?? null, indent: 1, muted: true },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="As duas rotas até o equity" subtitle="Devem chegar ao mesmo lugar. Quando não chegam, a diferença é o tamanho da inconsistência." />
          <div className="divide-y divide-line">
            <BridgeRow label="Valor presente do FCFF explícito" value={v.pvExplicitFcff} currency={currency} />
            <BridgeRow label="Valor presente da perpetuidade" value={v.pvTerminalValue} currency={currency} />
            <BridgeRow label="Enterprise value" value={v.enterpriseValue} currency={currency} strong />
            <BridgeRow label="(−) Dívida líquida" value={v.netDebt ? -v.netDebt : null} currency={currency} />
            <BridgeRow label="Equity pela rota desalavancada" value={v.equityValueFromFcff} currency={currency} strong />
            <BridgeRow label="Equity pela rota alavancada (FCFE)" value={v.equityValueFromFcfe} currency={currency} strong />
            <BridgeRow label="Diferença entre as rotas" value={v.routeGap} currency={currency} />
            {v.ownership < 1 ? (
              <BridgeRow label={`Equity atribuível (${formatPercent(v.ownership, 0)})`} value={v.attributableEquityValue} currency={currency} strong />
            ) : null}
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            title="Covenants"
            subtitle="Testados todos os anos, com a folga. Uma quebra é um evento de inadimplemento antes de ser um número."
            actions={v.covenantBreaches.length
              ? <Badge tone="neg">{v.covenantBreaches.length} ano(s) em quebra</Badge>
              : <Badge tone="pos">sem quebras</Badge>}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-line text-2xs text-ink-3">
                  <th className="px-3 py-2 text-left font-medium">Teste</th>
                  {years.slice(0, 8).map((y) => <th key={y} className="num px-2 py-2 text-right font-medium">{y}E</th>)}
                </tr>
              </thead>
              <tbody>
                {covenantKeys.map((k) => {
                  const row = v.covenants.filter((c) => c.key === k);
                  const first = row[0];
                  return (
                    <tr key={k} className="border-b border-line/50">
                      <td className="px-3 py-1.5">
                        <span className="text-ink-2">{first?.label}</span>
                        <span className="block text-2xs text-ink-4">
                          {first?.comparator === 'GTE' ? '≥' : '≤'} {first?.threshold}
                        </span>
                      </td>
                      {years.slice(0, 8).map((y) => {
                        const cell = row.find((c) => c.year === y);
                        return (
                          <td key={y} className="px-2 py-1.5 text-right">
                            <span className={cx('num', cell?.passes === false ? 'text-neg font-medium' : 'text-ink-2')}>
                              {isNum(cell?.value) ? (cell?.value as number).toFixed(2) : DASH}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function BridgeRow(props: { label: string; value: number | null; currency: Currency; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-3 py-1.5">
      <span className={cx('text-xs', props.strong ? 'font-medium text-ink' : 'text-ink-2')}>{props.label}</span>
      <Num value={props.value} format="currencyMillions" currency={props.currency}
        className={props.strong ? 'font-medium' : undefined} />
    </div>
  );
}
