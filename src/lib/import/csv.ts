import { toNum } from '@/lib/finance/core';

/* ================================================================
   Delimited-file import.

   Column names are matched loosely and in both Portuguese and English,
   because the file the user has is an export from their broker or their
   own spreadsheet, not a format the platform gets to dictate.
   ================================================================ */

export interface Table {
  headers: string[];
  rows: Record<string, string>[];
  delimiter: string;
}

/** Detects the delimiter and parses quoted CSV/TSV/semicolon files. */
export function parseDelimited(text: string): Table {
  const clean = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
  if (!clean) return { headers: [], rows: [], delimiter: ',' };

  const firstLine = clean.split('\n')[0];
  const counts: [string, number][] = [
    [',', (firstLine.match(/,/g) ?? []).length],
    [';', (firstLine.match(/;/g) ?? []).length],
    ['\t', (firstLine.match(/\t/g) ?? []).length],
  ];
  const delimiter = counts.sort((a, b) => b[1] - a[1])[0][1] > 0 ? counts[0][0] : ',';

  const records = splitRecords(clean, delimiter);
  if (!records.length) return { headers: [], rows: [], delimiter };

  const headers = records[0].map((h) => h.trim());
  const rows = records.slice(1)
    .filter((r) => r.some((cell) => cell.trim() !== ''))
    .map((r) => {
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = (r[i] ?? '').trim(); });
      return row;
    });
  return { headers, rows, delimiter };
}

function splitRecords(text: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let field = '';
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === delimiter) { record.push(field); field = ''; continue; }
    if (ch === '\n') { record.push(field); records.push(record); record = []; field = ''; continue; }
    field += ch;
  }
  record.push(field);
  if (record.some((c) => c !== '')) records.push(record);
  return records;
}

/** Finds a column by any of several accepted names, case- and accent-insensitive. */
export function findColumn(headers: string[], candidates: string[]): string | null {
  const normalise = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  const wanted = candidates.map(normalise);
  for (const h of headers) {
    const n = normalise(h);
    if (wanted.includes(n)) return h;
  }
  for (const h of headers) {
    const n = normalise(h);
    if (wanted.some((w) => n.includes(w))) return h;
  }
  return null;
}

export const TICKER_COLUMNS = ['ticker', 'symbol', 'ativo', 'papel', 'codigo', 'code', 'asset', 'security'];
export const QUANTITY_COLUMNS = ['quantity', 'qty', 'quantidade', 'qtd', 'shares', 'acoes', 'position', 'units'];
export const PRICE_COLUMNS = ['averageprice', 'avgprice', 'precomedio', 'precomedio', 'cost', 'custo', 'price', 'preco', 'pm'];

export interface ParsedPositions {
  positions: { ticker: string; quantity: number; averagePrice: number }[];
  skipped: string[];
  mapping: { ticker: string | null; quantity: string | null; price: string | null };
}

/** Maps an arbitrary table onto portfolio positions. */
export function rowsToPositions(table: Table): ParsedPositions {
  const tickerCol = findColumn(table.headers, TICKER_COLUMNS);
  const qtyCol = findColumn(table.headers, QUANTITY_COLUMNS);
  const priceCol = findColumn(table.headers, PRICE_COLUMNS);
  const mapping = { ticker: tickerCol, quantity: qtyCol, price: priceCol };

  if (!tickerCol || !qtyCol) return { positions: [], skipped: [], mapping };

  const positions: ParsedPositions['positions'] = [];
  const skipped: string[] = [];

  for (const row of table.rows) {
    const ticker = (row[tickerCol] ?? '').trim().toUpperCase().replace(/\s+/g, '');
    const quantity = toNum(row[qtyCol]);
    const price = priceCol ? toNum(row[priceCol]) : null;
    if (!ticker) continue;
    if (quantity === null || quantity <= 0) { skipped.push(ticker || '(blank)'); continue; }
    positions.push({
      ticker,
      quantity,
      averagePrice: price !== null && price > 0 ? price : 0,
    });
  }
  return { positions, skipped, mapping };
}

/* --------------------------- CSV output --------------------------- */

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: (string | number | null | undefined)[][], delimiter = ','): string {
  const lines = [headers.map(escapeCell).join(delimiter)];
  for (const row of rows) lines.push(row.map(escapeCell).join(delimiter));
  return lines.join('\n');
}

/** Triggers a browser download of generated text content. */
export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([`﻿${content}`], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
