import { prisma } from '@/lib/db';

export type SearchKind =
  | 'COMPANY' | 'RESEARCH_NOTE' | 'INVESTMENT_MEMO' | 'PORTFOLIO'
  | 'WATCHLIST' | 'VALUATION_MODEL' | 'THESIS' | 'EARNINGS' | 'DOCUMENT' | 'SCREEN';

export interface SearchHit {
  kind: SearchKind;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  ticker?: string | null;
  score: number;
}

const KIND_LABEL: Record<SearchKind, string> = {
  COMPANY: 'Company',
  RESEARCH_NOTE: 'Research note',
  INVESTMENT_MEMO: 'Investment memo',
  PORTFOLIO: 'Portfolio',
  WATCHLIST: 'Watchlist',
  VALUATION_MODEL: 'Valuation model',
  THESIS: 'Investment thesis',
  EARNINGS: 'Earnings',
  DOCUMENT: 'Document',
  SCREEN: 'Saved screen',
};

export { KIND_LABEL };

function scoreMatch(query: string, primary: string, secondary = ''): number {
  const q = query.toLowerCase();
  const p = primary.toLowerCase();
  const s = secondary.toLowerCase();
  if (p === q) return 100;
  if (p.startsWith(q)) return 85;
  if (p.includes(q)) return 65;
  if (s.startsWith(q)) return 50;
  if (s.includes(q)) return 35;
  return 0;
}

/**
 * Global search across everything in the workspace. Reference data (companies)
 * is global; every other result is scoped to the caller's workspace.
 */
export async function globalSearch(workspaceId: string, query: string, limit = 30): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 1) return [];
  const hits: SearchHit[] = [];

  const companies = await prisma.company.findMany({
    select: { id: true, ticker: true, name: true, sector: true, country: true },
  });
  for (const c of companies) {
    const score = Math.max(scoreMatch(q, c.ticker, c.name), scoreMatch(q, c.name, c.ticker));
    if (score > 0) {
      hits.push({
        kind: 'COMPANY', id: c.id, title: `${c.ticker} · ${c.name}`,
        subtitle: `${c.sector} — ${c.country}`, href: `/companies/${c.ticker}`,
        ticker: c.ticker, score: score + 10,
      });
    }
  }

  const [notes, memos, portfolios, watchlists, models, theses, docs, screens, earnings] = await Promise.all([
    prisma.researchNote.findMany({ where: { workspaceId }, include: { company: true }, take: 200 }),
    prisma.investmentMemo.findMany({ where: { workspaceId }, include: { company: true }, take: 200 }),
    prisma.portfolio.findMany({ where: { workspaceId } }),
    prisma.watchlist.findMany({ where: { workspaceId } }),
    prisma.valuationModel.findMany({ where: { workspaceId }, include: { company: true }, take: 200 }),
    prisma.investmentThesis.findMany({ where: { workspaceId }, include: { company: true }, take: 200 }),
    prisma.document.findMany({ where: { workspaceId }, take: 200 }),
    prisma.savedScreen.findMany({ where: { workspaceId } }),
    prisma.earningsEvent.findMany({
      where: { company: { ticker: { contains: q.toUpperCase() } } },
      include: { company: true }, take: 40,
    }),
  ]);

  const push = (kind: SearchKind, id: string, title: string, subtitle: string, href: string, ticker?: string | null, body = '') => {
    const score = scoreMatch(q, title, `${subtitle} ${ticker ?? ''} ${body}`);
    if (score > 0) hits.push({ kind, id, title, subtitle, href, ticker, score });
  };

  for (const n of notes) push('RESEARCH_NOTE', n.id, n.title, `${n.status} · ${n.company?.ticker ?? 'General'}`, `/research/notes/${n.id}`, n.company?.ticker, n.sections);
  for (const m of memos) push('INVESTMENT_MEMO', m.id, m.title, `${m.status} · ${m.company.ticker}`, `/memos/${m.id}`, m.company.ticker, m.sections);
  for (const p of portfolios) push('PORTFOLIO', p.id, p.name, p.description ?? 'Portfolio', `/portfolio?id=${p.id}`);
  for (const w of watchlists) push('WATCHLIST', w.id, w.name, w.description ?? 'Watchlist', `/watchlists?id=${w.id}`);
  for (const m of models) push('VALUATION_MODEL', m.id, m.name, `${m.kind} · ${m.company.ticker}`, `/companies/${m.company.ticker}/valuation`, m.company.ticker);
  for (const t of theses) push('THESIS', t.id, `${t.company.ticker} investment thesis`, `${t.recommendation} · ${t.conviction} conviction`, `/companies/${t.company.ticker}/thesis`, t.company.ticker, t.coreThesis);
  for (const doc of docs) push('DOCUMENT', doc.id, doc.name, `${doc.kind} · ${(doc.sizeBytes / 1024).toFixed(0)} KB`, `/library/${doc.id}`, null, doc.content ?? '');
  for (const s of screens) push('SCREEN', s.id, s.name, 'Saved screen', `/screener?screen=${s.id}`);
  for (const e of earnings) push('EARNINGS', e.id, `${e.company.ticker} ${e.label}`, `Reported ${e.reportDate.toISOString().slice(0, 10)}`, `/earnings?id=${e.id}`, e.company.ticker);

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
