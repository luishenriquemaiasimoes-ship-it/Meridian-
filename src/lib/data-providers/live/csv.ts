/* ==================================================================
   The CVM's CSV dialect.

   Semicolon separated, Latin-1 encoded, with a header row. Brazilian
   public data has used this shape for twenty years and it will not
   change to suit us. Numbers use a dot decimal in these files even
   though the rest of Brazilian convention does not, which is the kind
   of detail that silently turns 1.234 into 1234 if assumed.
   ================================================================== */

export type Row = Record<string, string>;

function splitLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"') {
        if (line[i + 1] === '"') { field += '"'; i++; } else { quoted = false; }
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === sep) {
      out.push(field); field = '';
    } else field += c;
  }
  out.push(field);
  return out;
}

/** Parses a CVM CSV. `buf` is decoded as Latin-1, which is what they publish. */
export function parseCsv(buf: Buffer, separator = ';'): Row[] {
  const text = buf.toString('latin1').replace(/^﻿/, '');
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const header = splitLine(lines[0], separator).map((h) => h.trim());
  const rows: Row[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], separator);
    const row: Row = {};
    for (let c = 0; c < header.length; c++) row[header[c]] = (cells[c] ?? '').trim();
    rows.push(row);
  }
  return rows;
}

/**
 * A numeric cell, or null.
 *
 * Returns null for an empty or non-numeric cell rather than zero: a line the
 * company did not report and a line it reported as zero are different facts,
 * and a balance sheet that silently fills the first with the second stops
 * balancing for reasons nobody can trace.
 */
export function numeric(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}
