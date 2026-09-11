import ExcelJS from 'exceljs';
import type { Currency, FinancialPeriod } from '@/lib/finance/types';
import { BALANCE_SHEET_LINES, CASH_FLOW_LINES, INCOME_STATEMENT_LINES, buildStatementRows } from '@/lib/finance/statementRows';
import type { DcfResult } from '@/lib/finance/dcf';
import { isNum } from '@/lib/finance/core';

/* ================================================================
   Excel export.

   Models are written as *live* worksheets: the DCF sheet carries real
   formulas so an analyst can keep working in Excel, and the statement
   sheets carry values with the same line order as the screen.
   ================================================================ */

const HEADER_FILL = 'FF1B2430';
const HEADER_FONT = 'FFE8ECF1';

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: HEADER_FONT }, size: 10 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: 'middle', horizontal: 'right' };
  });
  row.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
  row.height = 18;
}

function numberFormatFor(currency: Currency): string {
  return currency === 'BRL' ? '#,##0.0;[Red](#,##0.0)' : '#,##0.0;[Red](#,##0.0)';
}

export async function buildFinancialsWorkbook(params: {
  ticker: string;
  companyName: string;
  currency: Currency;
  unit: string;
  annuals: FinancialPeriod[];
  quarters: FinancialPeriod[];
  ltm: FinancialPeriod | null;
}): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MERIDIAN';
  wb.created = new Date();

  const cover = wb.addWorksheet('Cover');
  cover.columns = [{ width: 28 }, { width: 60 }];
  cover.addRows([
    ['MERIDIAN', 'Investment intelligence'],
    ['Company', `${params.companyName} (${params.ticker})`],
    ['Reporting currency', params.currency],
    ['Reporting unit', params.unit],
    ['Exported', new Date().toISOString().slice(0, 19).replace('T', ' ')],
    ['Note', 'Figures are as held in the MERIDIAN workspace. Costs are shown as negative values.'],
  ]);
  cover.getRow(1).font = { bold: true, size: 14 };

  const sheets: [string, typeof INCOME_STATEMENT_LINES, FinancialPeriod[]][] = [
    ['Income statement', INCOME_STATEMENT_LINES, params.annuals],
    ['Balance sheet', BALANCE_SHEET_LINES, params.annuals],
    ['Cash flow', CASH_FLOW_LINES, params.annuals],
    ['Quarterly income', INCOME_STATEMENT_LINES, params.quarters],
  ];

  for (const [name, lines, periods] of sheets) {
    if (!periods.length) continue;
    const ws = wb.addWorksheet(name);
    const rows = buildStatementRows(lines, periods, 'ABSOLUTE');
    ws.columns = [{ width: 38 }, ...periods.map(() => ({ width: 14 }))];
    styleHeader(ws.addRow(['Line item', ...periods.map((p) => p.label)]));
    for (const r of rows) {
      if (r.divider) {
        const dividerRow = ws.addRow([r.label]);
        dividerRow.font = { bold: true, size: 9 };
        continue;
      }
      const row = ws.addRow([`${'    '.repeat(r.indent ?? 0)}${r.label}`, ...periods.map((p) => r.values[p.label] ?? null)]);
      row.eachCell((cell, i) => {
        if (i === 1) return;
        cell.numFmt = numberFormatFor(params.currency);
        if (r.emphasis === 'total') cell.font = { bold: true };
      });
      if (r.emphasis === 'total') row.getCell(1).font = { bold: true };
    }
    ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];
  }

  if (params.ltm) {
    const ws = wb.addWorksheet('LTM');
    const rows = buildStatementRows(INCOME_STATEMENT_LINES, [params.ltm], 'ABSOLUTE');
    ws.columns = [{ width: 38 }, { width: 16 }];
    styleHeader(ws.addRow(['Line item', 'LTM']));
    for (const r of rows) {
      if (r.divider) continue;
      const row = ws.addRow([r.label, r.values.LTM ?? null]);
      row.getCell(2).numFmt = numberFormatFor(params.currency);
    }
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function buildDcfWorkbook(params: {
  ticker: string;
  companyName: string;
  currency: Currency;
  modelName: string;
  result: DcfResult;
}): Promise<Buffer> {
  const { result } = params;
  const a = result.assumptions;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MERIDIAN';

  const ws = wb.addWorksheet('DCF');
  ws.columns = [{ width: 34 }, ...result.years.map(() => ({ width: 14 })), { width: 14 }];

  ws.addRow([`${params.companyName} (${params.ticker}) — ${params.modelName}`]).font = { bold: true, size: 13 };
  ws.addRow([`All figures in ${params.currency} millions unless stated. Formulas are live: change an assumption and the sheet recalculates.`]).font = { italic: true, size: 9 };
  ws.addRow([]);

  const assumptionsStart = ws.rowCount + 1;
  ws.addRow(['Assumptions']).font = { bold: true };
  const waccRow = ws.addRow(['WACC', a.wacc]);
  waccRow.getCell(2).numFmt = '0.00%';
  const gRow = ws.addRow(['Terminal growth', a.terminalGrowth]);
  gRow.getCell(2).numFmt = '0.00%';
  const taxRow = ws.addRow(['Tax rate', a.taxRate]);
  taxRow.getCell(2).numFmt = '0.00%';
  const ndRow = ws.addRow(['Net debt', a.netDebt]);
  ndRow.getCell(2).numFmt = '#,##0.0';
  const miRow = ws.addRow(['Minority interest', a.minorityInterest ?? 0]);
  miRow.getCell(2).numFmt = '#,##0.0';
  const sharesRow = ws.addRow(['Shares outstanding', a.sharesOutstanding]);
  sharesRow.getCell(2).numFmt = '#,##0.0';
  const priceRow = ws.addRow(['Current price', a.currentPrice ?? 0]);
  priceRow.getCell(2).numFmt = '#,##0.00';
  ws.addRow([]);

  const wacc = `$B$${waccRow.number}`;
  const g = `$B$${gRow.number}`;
  const tax = `$B$${taxRow.number}`;

  const headerRow = ws.addRow(['Forecast', ...result.years.map((y) => String(y.year))]);
  styleHeader(headerRow);
  const firstCol = 2;

  const revenueRow = ws.addRow(['Revenue', ...result.years.map((y) => y.revenue)]);
  const growthRow = ws.addRow(['Revenue growth', ...result.years.map((y) => y.revenueGrowth)]);
  const marginRow = ws.addRow(['EBITDA margin', ...result.years.map((y) => y.ebitdaMargin)]);
  const ebitdaRow = ws.addRow(['EBITDA', ...result.years.map((_, i) => ({ formula: `${col(firstCol + i)}${revenueRow.number}*${col(firstCol + i)}${marginRow.number}` }))]);
  const daRow = ws.addRow(['D&A', ...result.years.map((y) => y.da)]);
  const ebitRow = ws.addRow(['EBIT', ...result.years.map((_, i) => ({ formula: `${col(firstCol + i)}${ebitdaRow.number}-${col(firstCol + i)}${daRow.number}` }))]);
  const taxesRow = ws.addRow(['Taxes', ...result.years.map((_, i) => ({ formula: `MAX(0,${col(firstCol + i)}${ebitRow.number}*${tax})` }))]);
  const nopatRow = ws.addRow(['NOPAT', ...result.years.map((_, i) => ({ formula: `${col(firstCol + i)}${ebitRow.number}-${col(firstCol + i)}${taxesRow.number}` }))]);
  const capexRow = ws.addRow(['Capex', ...result.years.map((y) => y.capex)]);
  const nwcRow = ws.addRow(['Change in NWC', ...result.years.map((y) => y.nwcChange)]);
  const fcffRow = ws.addRow(['FCFF', ...result.years.map((_, i) => ({
    formula: `${col(firstCol + i)}${nopatRow.number}+${col(firstCol + i)}${daRow.number}-${col(firstCol + i)}${capexRow.number}-${col(firstCol + i)}${nwcRow.number}`,
  }))]);
  const dfRow = ws.addRow(['Discount factor', ...result.years.map((y) => ({ formula: `1/(1+${wacc})^${y.index}` }))]);
  const pvRow = ws.addRow(['PV of FCFF', ...result.years.map((_, i) => ({
    formula: `${col(firstCol + i)}${fcffRow.number}*${col(firstCol + i)}${dfRow.number}`,
  }))]);

  for (const r of [growthRow, marginRow]) r.eachCell((c, i) => { if (i > 1) c.numFmt = '0.0%'; });
  for (const r of [revenueRow, ebitdaRow, daRow, ebitRow, taxesRow, nopatRow, capexRow, nwcRow, fcffRow, pvRow]) {
    r.eachCell((c, i) => { if (i > 1) c.numFmt = '#,##0.0'; });
  }
  dfRow.eachCell((c, i) => { if (i > 1) c.numFmt = '0.0000'; });
  fcffRow.font = { bold: true };

  ws.addRow([]);
  const last = result.years.length;
  const lastCol = col(firstCol + last - 1);
  const bridgeStart = ws.rowCount + 1;
  ws.addRow(['Valuation']).font = { bold: true };
  const sumPvRow = ws.addRow(['Sum of PV(FCFF)', { formula: `SUM(${col(firstCol)}${pvRow.number}:${lastCol}${pvRow.number})` }]);
  const tvRow = ws.addRow(['Terminal value', { formula: `${lastCol}${fcffRow.number}*(1+${g})/(${wacc}-${g})` }]);
  const pvTvRow = ws.addRow(['PV of terminal value', { formula: `B${tvRow.number}*${lastCol}${dfRow.number}` }]);
  const evRow = ws.addRow(['Enterprise value', { formula: `B${sumPvRow.number}+B${pvTvRow.number}` }]);
  const eqRow = ws.addRow(['Equity value', { formula: `B${evRow.number}-B${ndRow.number}-B${miRow.number}` }]);
  const fvRow = ws.addRow(['Fair value per share', { formula: `B${eqRow.number}/B${sharesRow.number}` }]);
  const upRow = ws.addRow(['Upside vs current price', { formula: `B${fvRow.number}/B${priceRow.number}-1` }]);

  for (const r of [sumPvRow, tvRow, pvTvRow, evRow, eqRow]) r.getCell(2).numFmt = '#,##0.0';
  fvRow.getCell(2).numFmt = '#,##0.00';
  upRow.getCell(2).numFmt = '0.0%';
  fvRow.font = { bold: true };
  upRow.font = { bold: true };

  ws.getCell(`A${assumptionsStart}`).font = { bold: true };
  ws.getCell(`A${bridgeStart}`).font = { bold: true };
  ws.views = [{ state: 'frozen', xSplit: 1 }];

  const notes = wb.addWorksheet('Notes');
  notes.columns = [{ width: 100 }];
  notes.addRow(['MERIDIAN — DCF export']).font = { bold: true, size: 12 };
  notes.addRow(['FCFF = EBIT × (1 − tax rate) + D&A − capex − change in net working capital.']);
  notes.addRow(['Terminal value uses the Gordon growth method: FCFF(n) × (1 + g) ÷ (WACC − g).']);
  notes.addRow(['Enterprise value = sum of discounted forecast cash flows plus the discounted terminal value.']);
  notes.addRow(['Equity value = enterprise value − net debt − minority interest.']);
  if (result.warnings.length) {
    notes.addRow([]);
    notes.addRow(['Warnings from the model:']).font = { bold: true };
    for (const w of result.warnings) notes.addRow([w]);
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export interface PortfolioWorkbookInput {
  name: string;
  currency: Currency;
  benchmarkCode: string;
  inceptionDate: string;
  asOf: string;
  summary: {
    totalMarketValue: number | null;
    investedValue: number | null;
    cash: number;
    unrealizedPnl: number | null;
    unrealizedPnlPct: number | null;
    positionCount: number;
  };
  positions: {
    ticker: string; name: string; sector: string; country: string; currency: string;
    quantity: number; averagePrice: number; currentPrice: number | null;
    marketValue: number | null; weight: number | null;
    unrealizedPnl: number | null; unrealizedPnlPct: number | null;
    pe: number | null; evEbitda: number | null; roic: number | null;
    fcfYield: number | null; beta: number | null;
  }[];
  performance: { label: string; portfolio: number | null; benchmark: number | null; active: number | null }[];
  exposures: { dimension: string; label: string; marketValue: number; weight: number; count: number }[];
  contributions: { ticker: string; weight: number | null; return: number | null; contribution: number | null }[];
  navSeries: { date: string; value: number; unitValue: number; benchmark: number }[];
  transactions: { tradeDate: string; kind: string; ticker: string | null; quantity: number; price: number; amount: number; note: string | null }[];
}

/**
 * The book as a workbook. Positions carry live formulas so a reader can change
 * a price and watch the weights move, which is the point of exporting to Excel
 * rather than to a picture of a table.
 */
export async function buildPortfolioWorkbook(input: PortfolioWorkbookInput): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MERIDIAN';
  wb.created = new Date();

  const money = `#,##0.00;[Red](#,##0.00)`;
  const pct = '0.0%';

  /* --------------------------------- Cover -------------------------------- */
  const cover = wb.addWorksheet('Cover');
  cover.columns = [{ width: 30 }, { width: 62 }];
  cover.addRow(['MERIDIAN']).font = { bold: true, size: 14 };
  cover.addRow([]);
  for (const [k, v] of [
    ['Portfolio', input.name],
    ['Base currency', input.currency],
    ['Benchmark', input.benchmarkCode],
    ['Inception', input.inceptionDate],
    ['Exported', input.asOf],
    ['Positions', String(input.summary.positionCount)],
  ]) {
    const row = cover.addRow([k, v]);
    row.getCell(1).font = { bold: true };
  }
  cover.addRow([]);
  cover.addRow(['Note', 'Figures are computed by MERIDIAN from the data held in the workspace at the time of export. A blank cell means the figure is unavailable — nothing has been substituted for it.']).getCell(2).alignment = { wrapText: true };
  cover.addRow(['', 'MERIDIAN produces recommendations only. It does not route, place or execute orders.']).getCell(2).alignment = { wrapText: true };

  /* ------------------------------- Positions ------------------------------ */
  const ws = wb.addWorksheet('Positions');
  const headers = [
    'Ticker', 'Company', 'Sector', 'Country', 'Currency', 'Shares', 'Average price',
    'Price', 'Market value', 'Weight', 'Unrealised P&L', 'Unrealised %',
    'P/E', 'EV/EBITDA', 'ROIC', 'FCF yield', 'Beta',
  ];
  ws.columns = headers.map((h, i) => ({ width: i === 1 ? 30 : Math.max(12, h.length + 3) }));
  styleHeader(ws.addRow(headers));

  const first = 2;
  input.positions.forEach((p, i) => {
    const r = first + i;
    const row = ws.addRow([
      p.ticker, p.name, p.sector, p.country, p.currency,
      p.quantity, p.averagePrice, p.currentPrice,
      // Live: market value, weight and P&L recompute from shares and price.
      { formula: `IF(H${r}="","",F${r}*H${r})` },
      { formula: `IF(I${r}="","",I${r}/SUM($I$${first}:$I$${first + input.positions.length - 1}))` },
      { formula: `IF(H${r}="","",F${r}*(H${r}-G${r}))` },
      { formula: `IF(OR(H${r}="",G${r}=0),"",H${r}/G${r}-1)` },
      p.pe, p.evEbitda, p.roic, p.fcfYield, p.beta,
    ]);
    row.getCell(6).numFmt = '#,##0';
    for (const c of [7, 8, 9, 11]) row.getCell(c).numFmt = money;
    for (const c of [10, 12, 15, 16]) row.getCell(c).numFmt = pct;
    for (const c of [13, 14, 17]) row.getCell(c).numFmt = '0.00';
  });

  const last = first + input.positions.length - 1;
  const totals = ws.addRow([
    'Total', '', '', '', '', null, null, null,
    { formula: `SUM(I${first}:I${last})` },
    { formula: `SUM(J${first}:J${last})` },
    { formula: `SUM(K${first}:K${last})` },
    null, null, null, null, null,
    { formula: `SUMPRODUCT(J${first}:J${last},Q${first}:Q${last})` },
  ]);
  totals.font = { bold: true };
  totals.getCell(9).numFmt = money;
  totals.getCell(10).numFmt = pct;
  totals.getCell(11).numFmt = money;
  totals.getCell(17).numFmt = '0.00';
  ws.addRow(['Cash', '', '', '', '', null, null, null, input.summary.cash]).getCell(9).numFmt = money;
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 1 }];

  /* ------------------------------ Performance ----------------------------- */
  const perf = wb.addWorksheet('Performance');
  perf.columns = [{ width: 16 }, { width: 16 }, { width: 16 }, { width: 16 }];
  styleHeader(perf.addRow(['Period', 'Portfolio', input.benchmarkCode, 'Active']));
  for (const p of input.performance) {
    const row = perf.addRow([p.label, p.portfolio, p.benchmark, p.active]);
    for (const c of [2, 3, 4]) row.getCell(c).numFmt = pct;
  }
  perf.addRow([]);
  styleHeader(perf.addRow(['Date', 'Net asset value', 'Unit value', `${input.benchmarkCode} (rebased)`]));
  for (const n of input.navSeries) {
    const row = perf.addRow([n.date, n.value, n.unitValue, n.benchmark]);
    row.getCell(2).numFmt = money;
    for (const c of [3, 4]) row.getCell(c).numFmt = '#,##0.0000';
  }

  /* ------------------------------ Attribution ----------------------------- */
  const attr = wb.addWorksheet('Attribution');
  attr.columns = [{ width: 14 }, { width: 14 }, { width: 14 }, { width: 16 }];
  styleHeader(attr.addRow(['Ticker', 'Weight', 'Return', 'Contribution']));
  for (const c of input.contributions) {
    const row = attr.addRow([c.ticker, c.weight, c.return, c.contribution]);
    for (const i of [2, 3, 4]) row.getCell(i).numFmt = pct;
  }

  /* ------------------------------- Exposure ------------------------------- */
  const exp = wb.addWorksheet('Exposure');
  exp.columns = [{ width: 16 }, { width: 26 }, { width: 18 }, { width: 12 }, { width: 10 }];
  styleHeader(exp.addRow(['Dimension', 'Group', 'Market value', 'Weight', 'Holdings']));
  for (const e of input.exposures) {
    const row = exp.addRow([e.dimension, e.label, e.marketValue, e.weight, e.count]);
    row.getCell(3).numFmt = money;
    row.getCell(4).numFmt = pct;
  }

  /* ----------------------------- Transactions ----------------------------- */
  const tx = wb.addWorksheet('Transactions');
  tx.columns = [{ width: 14 }, { width: 14 }, { width: 12 }, { width: 14 }, { width: 14 }, { width: 16 }, { width: 46 }];
  styleHeader(tx.addRow(['Trade date', 'Kind', 'Ticker', 'Quantity', 'Price', 'Amount', 'Note']));
  for (const t of input.transactions) {
    const row = tx.addRow([t.tradeDate, t.kind, t.ticker ?? '', t.quantity, t.price, t.amount, t.note ?? '']);
    row.getCell(4).numFmt = '#,##0';
    for (const c of [5, 6]) row.getCell(c).numFmt = money;
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function buildGenericWorkbook(
  sheetName: string,
  headers: string[],
  rows: (string | number | null)[][],
  meta?: Record<string, string>,
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'MERIDIAN';
  if (meta) {
    const cover = wb.addWorksheet('Cover');
    cover.columns = [{ width: 26 }, { width: 70 }];
    cover.addRow(['MERIDIAN']).font = { bold: true, size: 14 };
    for (const [k, v] of Object.entries(meta)) cover.addRow([k, v]);
  }
  const ws = wb.addWorksheet(sheetName);
  ws.columns = headers.map((h, i) => ({ width: i === 0 ? 26 : Math.max(12, h.length + 3) }));
  styleHeader(ws.addRow(headers));
  for (const r of rows) {
    const row = ws.addRow(r);
    row.eachCell((cell, i) => {
      if (i > 1 && typeof cell.value === 'number') cell.numFmt = '#,##0.00;[Red](#,##0.00)';
    });
  }
  ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];
  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function col(index: number): string {
  let n = index;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export { isNum };
