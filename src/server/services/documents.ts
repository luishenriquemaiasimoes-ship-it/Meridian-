import ExcelJS from 'exceljs';
import { extractFromText, type ExtractionResult } from '@/lib/import/extract';
import { parseDelimited } from '@/lib/import/csv';

/* ================================================================
   Text extraction by file type.

   Each reader returns plain text; the extraction layer above works on
   text only, so adding a format means adding a reader, not changing the
   analysis.
   ================================================================ */

export interface ReadResult {
  text: string;
  method: string;
  warning: string | null;
}

export async function readPdf(buffer: Buffer): Promise<ReadResult> {
  try {
    // The package entry point runs debug code on import; the lib module does not.
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
    const parsed = await pdfParse(buffer);
    if (!parsed.text?.trim()) {
      return {
        text: '',
        method: 'pdf-parse',
        warning: 'The PDF contains no extractable text. It is most likely a scan; the file is stored but nothing could be read from it.',
      };
    }
    return { text: parsed.text, method: 'pdf-parse', warning: null };
  } catch {
    return {
      text: '',
      method: 'pdf-parse',
      warning: 'This PDF could not be parsed. The file is stored, but no text was extracted from it.',
    };
  }
}

export async function readSpreadsheet(buffer: Buffer): Promise<ReadResult> {
  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer as unknown as ArrayBuffer);
    const parts: string[] = [];
    wb.eachSheet((sheet) => {
      parts.push(`# ${sheet.name}`);
      sheet.eachRow((row) => {
        const cells: string[] = [];
        row.eachCell({ includeEmpty: false }, (cell) => {
          const v = cell.value;
          if (v === null || v === undefined) return;
          if (typeof v === 'object' && v !== null && 'result' in v) {
            cells.push(String((v as { result: unknown }).result));
          } else {
            cells.push(String(v));
          }
        });
        if (cells.length) parts.push(cells.join('\t'));
      });
    });
    return { text: parts.join('\n'), method: 'exceljs', warning: null };
  } catch {
    return { text: '', method: 'exceljs', warning: 'The workbook could not be read. It is stored, but nothing was extracted.' };
  }
}

export function readDelimited(text: string): ReadResult {
  const table = parseDelimited(text);
  if (!table.headers.length) return { text, method: 'raw', warning: null };
  const lines = [table.headers.join('\t'), ...table.rows.map((r) => table.headers.map((h) => r[h] ?? '').join('\t'))];
  return { text: lines.join('\n'), method: 'delimited', warning: null };
}

export interface ProcessedDocument {
  text: string;
  method: string;
  warning: string | null;
  extraction: ExtractionResult;
}

export async function processUpload(
  filename: string,
  mimeType: string,
  buffer: Buffer,
): Promise<ProcessedDocument> {
  const lower = filename.toLowerCase();
  let read: ReadResult;

  if (lower.endsWith('.pdf') || mimeType === 'application/pdf') {
    read = await readPdf(buffer);
  } else if (lower.endsWith('.xlsx') || lower.endsWith('.xlsm') || mimeType.includes('spreadsheetml')) {
    read = await readSpreadsheet(buffer);
  } else if (lower.endsWith('.csv') || lower.endsWith('.tsv') || mimeType === 'text/csv') {
    read = readDelimited(buffer.toString('utf-8'));
  } else {
    read = { text: buffer.toString('utf-8'), method: 'utf-8', warning: null };
  }

  return { ...read, extraction: extractFromText(read.text) };
}

export function documentKindFromName(filename: string): string {
  const l = filename.toLowerCase();
  if (/(earnings|release|resultado|itr|dfp)/.test(l)) return 'EARNINGS_RELEASE';
  if (/(presentation|apresenta|deck|slides)/.test(l)) return 'PRESENTATION';
  if (/(transcript|call|confer)/.test(l)) return 'TRANSCRIPT';
  if (/(filing|20-?f|10-?k|10-?q|formul[aá]rio)/.test(l)) return 'FILING';
  if (/(model|dcf|valuation|planilha)/.test(l)) return 'MODEL';
  return 'OTHER';
}
