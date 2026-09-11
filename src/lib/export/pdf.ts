import { jsPDF } from 'jspdf';

/**
 * Research documents are printed from one layout so a note and a memo come off
 * the desk looking like the same firm produced them: a rule under the title, a
 * metadata block, sections that break cleanly across pages, an optional table
 * of figures, and a footer that states where the numbers came from.
 */

export interface PdfMeta {
  label: string;
  value: string;
}

export interface PdfSection {
  title: string;
  body: string;
}

export interface PdfTable {
  title: string;
  columns: string[];
  rows: string[][];
  note?: string;
}

export interface PdfDocumentInput {
  /** Shown small above the title, e.g. "Research note" or "Investment memo". */
  kicker: string;
  title: string;
  subtitle?: string;
  meta: PdfMeta[];
  sections: PdfSection[];
  tables?: PdfTable[];
  /** Printed at the foot of every page, under the page number. */
  provenance: string;
  fileName: string;
}

const PAGE = { width: 595.28, height: 841.89 };      // A4 in points
const MARGIN = { left: 56, right: 56, top: 56, bottom: 58 };
const CONTENT_WIDTH = PAGE.width - MARGIN.left - MARGIN.right;

const INK = [26, 28, 33] as const;
const INK_2 = [74, 80, 92] as const;
const INK_3 = [122, 129, 143] as const;
const RULE = [214, 218, 226] as const;
const ACCENT = [42, 92, 214] as const;

export function buildResearchPdf(input: PdfDocumentInput): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  let y = MARGIN.top;

  const setInk = (c: readonly [number, number, number]) => doc.setTextColor(c[0], c[1], c[2]);

  /** Moves to a new page when the next block would not fit. */
  const ensure = (needed: number) => {
    if (y + needed <= PAGE.height - MARGIN.bottom) return;
    doc.addPage();
    y = MARGIN.top;
  };

  const paragraph = (
    text: string,
    opts: { size: number; lineHeight: number; color: readonly [number, number, number]; style?: 'normal' | 'bold'; gap?: number },
  ) => {
    doc.setFont('helvetica', opts.style ?? 'normal');
    doc.setFontSize(opts.size);
    setInk(opts.color);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH) as string[];
    for (const line of lines) {
      ensure(opts.lineHeight);
      doc.text(line, MARGIN.left, y);
      y += opts.lineHeight;
    }
    y += opts.gap ?? 0;
  };

  /* ------------------------------- Header ------------------------------- */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  setInk(ACCENT);
  doc.text('MERIDIAN', MARGIN.left, y);
  doc.setFont('helvetica', 'normal');
  setInk(INK_3);
  doc.text(input.kicker.toUpperCase(), MARGIN.left + 62, y);
  y += 18;

  paragraph(input.title, { size: 19, lineHeight: 24, color: INK, style: 'bold', gap: 2 });
  if (input.subtitle) {
    paragraph(input.subtitle, { size: 10, lineHeight: 14, color: INK_3, gap: 6 });
  }

  doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
  doc.setLineWidth(0.7);
  doc.line(MARGIN.left, y, PAGE.width - MARGIN.right, y);
  y += 16;

  /* ------------------------------ Metadata ------------------------------ */
  if (input.meta.length) {
    const columns = 3;
    const columnWidth = CONTENT_WIDTH / columns;
    const rows = Math.ceil(input.meta.length / columns);
    ensure(rows * 26 + 8);
    input.meta.forEach((m, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = MARGIN.left + col * columnWidth;
      const rowY = y + row * 26;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      setInk(INK_3);
      doc.text(m.label.toUpperCase(), x, rowY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setInk(INK);
      doc.text(doc.splitTextToSize(m.value, columnWidth - 10)[0] ?? m.value, x, rowY + 11);
    });
    y += rows * 26 + 10;
  }

  /* ------------------------------ Sections ------------------------------ */
  for (const section of input.sections) {
    ensure(34);
    y += 6;
    paragraph(section.title, { size: 11, lineHeight: 15, color: INK, style: 'bold', gap: 3 });
    const body = section.body.trim() || 'Not written.';
    const written = !!section.body.trim();
    for (const block of body.split(/\n{2,}/)) {
      paragraph(block.trim(), {
        size: 9.5,
        lineHeight: 13.5,
        color: written ? INK_2 : INK_3,
        gap: 7,
      });
    }
  }

  /* ------------------------------- Tables ------------------------------- */
  for (const table of input.tables ?? []) {
    ensure(60);
    y += 10;
    paragraph(table.title, { size: 11, lineHeight: 15, color: INK, style: 'bold', gap: 5 });

    const columnWidth = CONTENT_WIDTH / table.columns.length;
    const drawHeader = () => {
      ensure(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      setInk(INK_3);
      table.columns.forEach((c, i) => {
        const right = i > 0;
        doc.text(
          c.toUpperCase(),
          right ? MARGIN.left + (i + 1) * columnWidth - 4 : MARGIN.left,
          y,
          { align: right ? 'right' : 'left' },
        );
      });
      y += 5;
      doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
      doc.line(MARGIN.left, y, PAGE.width - MARGIN.right, y);
      y += 11;
    };

    drawHeader();
    for (const row of table.rows) {
      if (y + 14 > PAGE.height - MARGIN.bottom) {
        doc.addPage();
        y = MARGIN.top;
        drawHeader();
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      row.forEach((cell, i) => {
        const right = i > 0;
        setInk(right ? INK : INK_2);
        const text = doc.splitTextToSize(cell, columnWidth - 8)[0] ?? cell;
        doc.text(
          text,
          right ? MARGIN.left + (i + 1) * columnWidth - 4 : MARGIN.left,
          y,
          { align: right ? 'right' : 'left' },
        );
      });
      y += 14;
    }

    if (table.note) {
      y += 2;
      paragraph(table.note, { size: 7.5, lineHeight: 10.5, color: INK_3, gap: 4 });
    }
  }

  /* ------------------------------- Footer ------------------------------- */
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(RULE[0], RULE[1], RULE[2]);
    doc.setLineWidth(0.5);
    doc.line(MARGIN.left, PAGE.height - MARGIN.bottom + 16, PAGE.width - MARGIN.right, PAGE.height - MARGIN.bottom + 16);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    setInk(INK_3);
    doc.text(input.provenance, MARGIN.left, PAGE.height - MARGIN.bottom + 28, { maxWidth: CONTENT_WIDTH - 60 });
    doc.text(`${i} / ${pages}`, PAGE.width - MARGIN.right, PAGE.height - MARGIN.bottom + 28, { align: 'right' });
  }

  return doc;
}

export function downloadResearchPdf(input: PdfDocumentInput): void {
  buildResearchPdf(input).save(input.fileName);
}

/** Lowercase, accent-stripped, hyphenated — used for the file name. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'document';
}
