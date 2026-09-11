# MERIDIAN

**AI-Powered Investment Intelligence for Equity Research & Asset Management**

*Research. Valuation. Conviction.*

MERIDIAN is a working equity-research and portfolio-management platform: a financial
engine, a research workflow, a valuation workbench, portfolio and risk analytics, and an
AI analyst that is not allowed to invent a number.

---

## Table of contents

1. [What it does](#what-it-does)
2. [The rule that shapes everything](#the-rule-that-shapes-everything)
3. [Architecture](#architecture)
4. [Stack](#stack)
5. [Setup](#setup)
6. [Environment variables](#environment-variables)
7. [Database](#database)
8. [The financial engine](#the-financial-engine)
9. [Data providers](#data-providers)
10. [The AI layer](#the-ai-layer)
11. [API](#api)
12. [Authentication and permissions](#authentication-and-permissions)
13. [Design system](#design-system)
14. [Tests](#tests)
15. [Deployment](#deployment)
16. [What this is not](#what-this-is-not)

---

## What it does

| Surface | The question it answers |
| --- | --- |
| `/home` | What needs my attention today? |
| `/companies` · `/companies/[ticker]` | What is this business worth, and why? |
| `/screener` | Which companies deserve work next? |
| `/watchlists` | What am I tracking, and what moved? |
| `/valuation` | What do my models say today? |
| `/comparables` | How is this rated against its peers? |
| `/earnings` | What did the print change? |
| `/sectors` | Where is the opportunity concentrated? |
| `/portfolio` | What do I own, and how is it doing? |
| `/risk` | What could go wrong, and how much would it cost? |
| `/monitoring` | Which theses are breaking? |
| `/research` · `/research/notes/[id]` | What has the desk published, and what changed? |
| `/memos` · `/memos/[id]` | What am I asking the committee to approve? |
| `/committee` | What is up for decision? |
| `/library` · `/library/[id]` | Where is that document? |
| `/ai` | Ask the workspace a question. |
| `/workspaces` | Which book am I working in? |
| `/settings/data-sources` | Where is the data coming from? |
| `/settings/data-quality` | How much can I trust the inputs? |
| `/audit` | Who changed what, and when? |

A company page carries thirteen tabs: overview, financials, fundamentals, valuation,
comps, earnings, segments, ownership, thesis, research, news, charts and AI analysis.

---

## The rule that shapes everything

**A number that does not exist is never replaced by one that does.**

This is not a slogan; it is enforced structurally at four levels.

1. **The engine returns `null`.** Every function in `src/lib/finance` returns
   `number | null`. A missing input propagates as `null` — it is never coerced to zero,
   never defaulted, never interpolated. `computeLTM` returns `null` with fewer than four
   quarters rather than annualising three.
2. **The screen renders a dash.** `—` means the datum does not exist. `n/m` means the
   measure is not meaningful for this kind of company, with the reason on hover — for a
   bank, enterprise-value multiples and ROIC are suppressed because deposits and debt are
   operating funding and invested capital is not a meaningful denominator.
3. **A filter never passes a missing value.** The screener counts what it excluded for
   missing data and reports the count, so a thin screen is visible as a thin screen.
4. **The AI says "data unavailable".** Every statement it makes is typed as observed,
   calculated, interpreted, opinion, or missing — and it is given only the workspace's own
   data to work from.

The corollaries the code holds to:

- No calculation lives inside a React component. Pages import from `@/lib/finance/*`.
- No figure reaches the screen without a source. Simulated data is labelled simulated
  everywhere it appears, including after it has been aggregated into an LTM.
- Nothing routes, places or executes an order. The rebalancer produces recommendations;
  a position changes only when someone records the trade.

---

## Architecture

```
src/
  app/                         Next.js App Router
    (app)/                     the authenticated application shell
    api/                       44 route handlers
    login, signup, onboarding  the unauthenticated flow
  components/
    ui/                        primitives, tables, values, icons
    charts/                    a validated Recharts wrapper
    layout/                    sidebar, topbar, command palette, shell
    ai/                        answer cards and the analyst console
  lib/
    finance/                   the financial engine — pure, no I/O
    data-providers/            the market-data interface and the mock provider
    ai/                        intent, context, reasoner, provider abstraction
    auth/                      sessions, password hashing, RBAC
    export/                    the PDF document layout
    import/                    CSV parsing and download helpers
    memo/                      the memo section skeleton
  server/
    context.ts                 resolves user, org, role and active workspace
    http.ts                    route wrapper: auth, permission, error mapping
    cache.ts                   in-process memo cache with TTL
    repositories/              database reads
    services/                  the layer that composes engine + database
tests/                         412 tests over the engine and the generated universe
prisma/
  schema.prisma                49 models
  seed.ts                      the demo organisation, universe and workflow
```

### The three layers, and what each may do

| Layer | May do | May not do |
| --- | --- | --- |
| `lib/finance` | Arithmetic on values passed in | Touch the database, the network, or React |
| `server/services` | Read the database, call the engine, compose results | Format for display, contain business arithmetic |
| `app` + `components` | Render, format, collect input | Compute a financial figure |

The separation is what makes the engine testable without a database and the screens
replaceable without touching a formula.

### Request path

Every server component and API route resolves through `requireContext()` /
`route()`, which establishes the signed-in user, their organisation role and the active
workspace. Workspace isolation is therefore a property of the system rather than a
convention each query has to remember.

---

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router), React 19 | Server components keep the financial engine on the server |
| Language | TypeScript 5.7, `strict` | `number \| null` is the type that encodes the rule above |
| Database | Prisma 6 + SQLite | Zero-setup; the schema is portable to PostgreSQL unchanged |
| Styling | Tailwind CSS 3.4 over CSS custom properties | One token set drives light and dark |
| Charts | Recharts 2.15, wrapped | The wrapper enforces the palette, the legend and a table view |
| Validation | Zod 3 | One schema per endpoint; field errors returned as 422 |
| Auth | `jose` (HS256 JWT) + bcryptjs + a session row | Stateless verification, revocable server-side |
| Excel | ExcelJS | Exports carry live formulas, not values |
| PDF | jsPDF | One research-document layout for notes and memos |
| Tests | Vitest | 412 tests, no database required |

---

## Setup

```bash
npm install
cp .env.example .env          # edit AUTH_SECRET before anything real
npm run setup                 # prisma generate + db push + seed
npm run dev                   # http://localhost:3000
```

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` | `prisma generate` then `next build` |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, one pass |
| `npm run db:push` | Apply the schema to the database |
| `npm run db:seed` | Seed the demo organisation and universe |
| `npm run db:reset` | Drop, re-push, regenerate and re-seed |
| `npm run setup` | Generate, push and seed in one go |

### Demo accounts

All five share the password `meridian2026` and differ only in role, which is the point —
sign in as each to see the permission model change what the interface offers.

| Email | Role |
| --- | --- |
| `demo@meridian.app` | Analyst |
| `pm@meridian.app` | Portfolio manager |
| `analyst@meridian.app` | Analyst |
| `researcher@meridian.app` | Researcher |
| `viewer@meridian.app` | Viewer |

---

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | yes | `file:./meridian.db` | Prisma connection string |
| `AUTH_SECRET` | yes | — | Signs session JWTs. Use 32+ characters; generate with `openssl rand -base64 48` |
| `SESSION_TTL_HOURS` | no | `168` | Session lifetime |
| `ANTHROPIC_API_KEY` | no | — | When set, a model writes the prose over the platform's figures. When unset, the deterministic reasoner answers alone |
| `MERIDIAN_AI_MODEL` | no | `claude-opus-5` | Model identifier for the Anthropic provider |
| `MARKET_DATA_PROVIDER` | no | `mock` | Selects the registered provider |
| `STRIPE_SECRET_KEY` · `STRIPE_PUBLISHABLE_KEY` | no | — | Placeholders. No charge is ever made |

No secret is read in a client component. The AI key is used only inside
`src/lib/ai/llm.ts`, which runs on the server.

---

## Database

49 Prisma models. The shape worth knowing:

**Identity** — `User`, `Session`, `Organization`, `Membership`, `Workspace`.
An organisation has many workspaces; a workspace is a book with its own benchmark,
risk-free rate, equity risk premium and statutory tax rate.

**Reference data, shared across the organisation** — `Company`, `Security`, `PriceBar`,
`FinancialStatement`, `SegmentDatum`, `ManagementRecord`, `OwnershipRecord`, `Estimate`,
`NewsItem`, `EarningsEvent`, `PeerLink`, `Benchmark`, `BenchmarkPoint`, `MarketIndicator`.

**Work, scoped to a workspace** — `InvestmentThesis`, `Catalyst`, `RiskItem`,
`TargetPriceRecord`, `ValuationModel`, `PeerGroup`, `NormalizationAdjustment`,
`ResearchNote`, `ResearchNoteVersion`, `InvestmentMemo`, `Document`, `EarningsReview`,
`Portfolio`, `PortfolioPosition`, `PortfolioTransaction`, `PortfolioValuationPoint`,
`RebalanceTargetRecord`, `Watchlist`, `WatchlistItem`, `SavedScreen`, `Alert`,
`AlertEvent`, `Notification`, `AuditLog`, `DataSource`, `AiConversation`, `AiMessage`,
`CommitteeItem`, `CommitteeVote`, `CommitteeComment`.

### Two conventions worth calling out

**Statements are stored as reported, in millions.** Nothing rewrites them. A change to a
reported figure is a `NormalizationAdjustment` — a separate row carrying its reason and
its author, applied on read and reversible. `REPORTING_UNIT_SCALE` in `format.ts` is what
renders a value stored in millions at human scale, which is why a market capitalisation
reads `R$ 262,18 bi` and not `R$ 262,18 mil`.

**A fund's NAV and its performance are different series.** `PortfolioValuationPoint`
stores `value` (net asset value), `units` and `unitValue`. A subscription creates units at
the prevailing unit value, so it raises the NAV without moving the unit value. Every
performance and risk statistic is measured on `unitValue`, so a cash flow never reads as a
return.

SQLite is the default because it makes the project runnable in one command. The schema
uses no SQLite-specific feature; changing the `datasource` provider to `postgresql` and
re-running `prisma db push` is the whole migration. JSON-shaped columns are stored as
`String` and parsed through `parseJson`, which is portable either way.

---

## The financial engine

`src/lib/finance` — pure TypeScript, no imports outside itself, no I/O, no React. That is
what makes it testable and what keeps arithmetic out of the interface.

| Module | Contents |
| --- | --- |
| `core.ts` | `isNum`, `toNum` (pt-BR and en-US separators, accounting parentheses), `safeDiv`, `growth`, `cagr`, `percentile`, `stdev`, `correlation`, `bisect`, `irr`, discounting |
| `statements.ts` | Statement derivation, the balance-sheet identity check, `computeLTM`, period normalisation |
| `ratios.ts` | Margins, free cash flow, leverage, returns on average balances, DSO/DIO/DPO and the cash conversion cycle |
| `roic.ts` | NOPAT, invested capital, ROIC decomposed into NOPAT margin × capital turnover, the ROIC−WACC spread and economic profit |
| `wacc.ts` | CAPM cost of equity with country and size premia, Hamada levering and unlevering, implied cost of debt |
| `dcf.ts` | FCFF projection, Gordon growth and exit-multiple terminal values, sensitivity grids, reverse DCF, the EV-to-equity bridge |
| `comps.ts` | Multiples, peer statistics, implied valuation, historical multiple ranges |
| `sotp.ts` | Sum-of-the-parts with per-segment multiples |
| `scenarios.ts` | Bull / base / bear sets and probability weighting |
| `portfolio.ts` | Position valuation, attribution, exposure, concentration, look-through metrics, rebalancing |
| `risk.ts` | Volatility, beta, alpha, Sharpe, Sortino, drawdown, VaR, CVaR, correlation matrix, risk contribution, scenario shocks |
| `factors.ts` | Cross-sectional factor scoring and the composite investment score |
| `expectedReturn.ts` | Expected return decomposition |
| `format.ts` | Every display format in one place, including `currencyMillions` and `ordinal` |

### Decisions the engine makes, and why

- **FCFF** = EBIT × (1 − t) + D&A − Capex − ΔNWC. A loss year receives no tax benefit,
  because assuming one manufactures cash flow that does not exist.
- **Terminal value** is `null` when WACC ≤ g, rather than a negative or infinite number.
  A DCF whose terminal value exceeds 85% of enterprise value carries a warning, because at
  that point the model is a statement about perpetuity, not about the business.
- **ROIC** uses average invested capital and excludes cash, so it measures the return on
  capital actually employed in operations.
- **Growth** divides by `|previous|`, so a move from a loss to a profit reads positive.
- **CAGR** is `null` when either endpoint is non-positive, because the root is not real.
- **LTM** needs four consecutive quarters. With three it returns `null`. It is never
  approximated, and its source string carries the provenance of the quarters it summed.
- **Risk contribution** uses the full covariance matrix: MCR_i = (Σw)_i / σ_p,
  RC_i = w_i × MCR_i, and the contributions sum to σ_p.
- **Bank-like companies** (`isBankLike`) suppress enterprise-value multiples and ROIC and
  fall back to P/E, P/B and ROE, with the reason shown rather than the measure hidden.

---

## Data providers

`MarketDataProvider` (`src/lib/data-providers/types.ts`) is the only way market data
enters the system: `getCompany`, `getQuote`, `getFinancials`, `getSegments`,
`getManagement`, `getOwnership`, `getEstimates`, `getNews`, `getEarnings`, `getPeers`,
`getHistoricalPrices`, `getMarketIndicators`, `getBenchmarks`. The registry in
`index.ts` selects one from `MARKET_DATA_PROVIDER`. Adding a real vendor means writing one
class; nothing downstream changes.

### MockMarketDataProvider

26 companies — 16 Brazilian and 10 international — generated deterministically from a
seeded PRNG so the same universe appears on every machine.

It is synthetic, which makes its internal consistency more important, not less:

- **Every balance sheet balances** — annual, quarterly and LTM, for all 26 companies.
- **Every cash-flow statement articulates**: CFO + CFI + CFF equals the reported change in
  cash.
- **Prices load on a shared market factor** scaled by each company's beta, with
  idiosyncratic variance sized so total volatility still matches its anchor. The realised
  beta of a generated series therefore reproduces the beta quoted on the company screen
  (VALE3: 1.17 realised against 1.22 quoted), and the correlation matrix describes real
  co-movement rather than noise.
- **An index is its constituents**: benchmark drift is the capitalisation-weighted drift
  of the names listed on that market, divided by their capitalisation-weighted beta.
- **One trading calendar** stamps prices, benchmark levels and NAV points, so a
  close-to-close return is a genuine one-day return and annualising at 252 is correct.

`tests/universe.test.ts` holds all of this in place — 89 tests that fail if the generator
ever produces a statement that does not balance or a series that does not realise its
anchors.

Every figure it produces is labelled `MockMarketDataProvider` and rendered with a
*simulated* badge. It is never presented as market data.

---

## The AI layer

### What it is given

`src/lib/ai/context.ts` builds the only data the AI may see: the company or portfolio in
scope, drawn from the same computation the screens use. There is no market feed, no news
wire and no consensus service behind it, and it says so.

### What it must produce

Every answer is a list of typed blocks:

| Block | Meaning |
| --- | --- |
| `FACT` | Observed in the data, with its source |
| `CALCULATION` | Computed by the engine, with the inputs named |
| `INTERPRETATION` | A reading of those figures |
| `OPINION` | A judgement, marked as one |
| `MISSING` | The datum does not exist |

### The two providers

`DeterministicProvider` composes answers from `src/lib/ai/reasoner.ts`, which handles
valuation, ROIC, margins, growth, leverage, cash flow, peers, DCF, reverse DCF, target
price, thesis, risks, earnings, capital allocation, what-changed, portfolio review and
portfolio risk — in Portuguese or English. It requires no API key and cannot fabricate,
because it has no generative step.

`AnthropicProvider` is used when `ANTHROPIC_API_KEY` is set. It receives the deterministic
draft plus the same context and is constrained to JSON-schema structured output matching
the block types. **It writes the prose; it does not supply the figures.** On a refusal, a
parse failure or any error, the deterministic draft is returned instead — so the floor of
answer quality never depends on the model being available.

### What it will not do

Invent a number. Claim to have market data. Present an estimate as a fact. Hide a missing
datum. Fabricate news or consensus. Place an order.

---

## API

44 route handlers. Every one resolves through `route()` in `src/server/http.ts`, which
authenticates, checks the permission, and maps errors — Zod failures become 422 with
per-field messages; a thrown error carrying `status` becomes that status; anything else is
a 500 that logs server-side and says nothing revealing to the client.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/login`, `/signup`, `/logout`, `GET /api/auth/session` |
| Workspace | `POST /api/workspace` · `PATCH /api/workspace` · `POST /api/workspace/switch` · `PATCH /api/workspace/layout` |
| Organisation & profile | `PATCH /api/organization` · `PATCH /api/profile` |
| Search | `GET /api/search?q=` |
| Companies | `GET/POST/DELETE /api/normalization`, `/api/normalization/[id]` |
| Research | `POST /api/notes` · `PATCH/DELETE /api/notes/[id]` |
| Memos | `POST /api/memos` · `PATCH/DELETE /api/memos/[id]` |
| Committee | `POST /api/committee` · `PATCH /api/committee/[id]` (vote, comment, decide) |
| Thesis | `POST /api/thesis`, `/api/thesis/catalysts`, `/api/thesis/risks` |
| Valuation | `GET/POST /api/valuation/models` |
| Comparables | `GET/POST /api/peer-groups` · `PATCH/DELETE /api/peer-groups/[id]` |
| Screener | `POST /api/screener/run` · `GET/POST /api/screener/screens` |
| Watchlists | `GET/POST /api/watchlists` · `PATCH/DELETE /api/watchlists/[id]` |
| Portfolio | `GET/POST /api/portfolio`, `/positions`, `/transactions`, `/targets` |
| Monitoring | `GET/POST /api/alerts` · `PATCH/DELETE /api/alerts/[id]` · `POST /api/alerts/evaluate` |
| Notifications | `GET/POST /api/notifications` |
| Documents | `GET/POST /api/documents` · `DELETE /api/documents/[id]` |
| Earnings | `POST /api/earnings/review` |
| Export | `GET /api/export/financials`, `/api/export/dcf`, `/api/export/portfolio` — Excel workbooks carrying live formulas, not values |
| AI | `POST /api/ai/ask` |
| Onboarding | `POST /api/onboarding` |

Every mutation writes an `AuditLog` row on the same request that performed it, so a change
cannot land without its record.

---

## Authentication and permissions

Sessions are HS256 JWTs signed with `AUTH_SECRET` and backed by a `Session` row, so they
verify statelessly and revoke server-side. Passwords are bcrypt-hashed.

Five roles, each inheriting everything below it:

| Role | Adds |
| --- | --- |
| **Viewer** | Read research and portfolios, export data |
| **Researcher** | Write notes, upload documents, keep watchlists, ask the AI analyst |
| **Analyst** | Write theses, build valuation models, write memos, save screens, set alerts |
| **Portfolio manager** | Record trades, set rebalancing targets, vote at committee, close decisions, read the audit trail |
| **Admin** | Manage the organisation, its members, its workspaces and its data sources |

`assertCan(role, permission)` throws a 403 the route wrapper turns into a clean message.
The interface hides what a role cannot do, and the API refuses it regardless — the
check is server-side, not a convenience.

---

## Design system

Institutional, dense, quiet. No emoji, no gradients, no oversized cards.

**Tokens.** Every colour is a CSS custom property (`--m-*` for surfaces and ink, `--viz-*`
for the chart palette) resolved through Tailwind as `rgb(var(--m-ink) / <alpha-value>)`.
Dark and light are one token set with two value sets, switched by `data-theme`.

**Tables** (`components/ui/table.tsx`) — `DataTable` with sticky header and first column,
sorting that always puts missing values last, and inline search. `FinancialTable` renders
period columns with growth rows. `HeatmapTable` for matrices.

**Values** (`components/ui/values.tsx`) — `Num`, `Delta`, `Unavailable`, `Provenance`,
`SimulatedBadge`, `MetricCard`, `BarCell` and the status chips. A value never reaches the
DOM without passing through one of these, which is how the dash-for-missing rule is kept.

**Charts** (`components/charts/`) — Recharts behind `ChartFrame`, which supplies a legend
whenever there is more than one series and a table view of the underlying numbers on every
chart. The categorical palette was validated against MERIDIAN's own surfaces rather than
assumed: dark passes every contrast and colour-distance check; light passes with a warning
on three slots, which the always-present legend and table toggle answer. Bar-and-line
charts share one axis — a second y-axis invites a comparison the data does not support.

**Keyboard** — ⌘K / Ctrl-K opens the command palette from anywhere.

---

## Tests

```bash
npm test
```

412 tests, no database required.

| File | Covers |
| --- | --- |
| `core.test.ts` | Numeric parsing, safe division, growth, CAGR, percentiles, bisection, IRR |
| `statements.test.ts` | Statement derivation, the balance-sheet identity, LTM, normalisation |
| `ratios.test.ts` | Margins, free cash flow, leverage, returns, the cash conversion cycle |
| `valuation.test.ts` | WACC, FCFF projection, terminal values, sensitivity, reverse DCF |
| `comps.test.ts` | Multiples, peer statistics, implied valuation, historical ranges |
| `portfolio.test.ts` | Valuation, attribution, exposure, concentration, rebalancing |
| `risk.test.ts` | Volatility, beta, Sharpe, Sortino, drawdown, VaR, CVaR, risk contribution |
| `factors-format.test.ts` | Factor scoring and every display format |
| `universe.test.ts` | The generated universe: balance-sheet identity and cash-flow articulation in every period of every company, LTM provenance, one trading calendar, and each price series realising its volatility and beta anchors |

The engine is tested against hand-computed fixtures rather than snapshots, so a test
failing means a number changed, not that a string moved.

---

## Deployment

The application is a standard Next.js build.

```bash
npm ci
npm run build
npm start
```

For anything beyond a demo:

1. **Set `AUTH_SECRET`** to a generated 32+ character secret. The value in
   `.env.example` is a placeholder and is not a secret.
2. **Move to PostgreSQL.** Change the `datasource` provider in `prisma/schema.prisma`,
   point `DATABASE_URL` at the server, and run `prisma migrate deploy`. Nothing else
   changes.
3. **Serve over HTTPS.** Session cookies are `httpOnly`, `sameSite=lax` and `secure` in
   production.
4. **Replace the mock provider.** Implement `MarketDataProvider` against a real vendor and
   register it; set `MARKET_DATA_PROVIDER` to its key. The *simulated* badges disappear on
   their own, because they are driven by the source string on the data.
5. **Set `ANTHROPIC_API_KEY`** if you want a model writing the prose. The platform works
   without it.

`exceljs`, `@prisma/client` and `bcryptjs` are declared in `serverExternalPackages`, so
they stay out of the client bundle.

---

## What this is not

- **Not a broker.** Nothing here routes, places or executes an order. The rebalancer
  produces recommendations; a position changes only when someone records the trade.
- **Not investment advice.** It is a tool for doing the analysis, not a source of
  conclusions.
- **Not a market data feed.** The bundled universe is simulated, labelled as simulated
  everywhere it appears, and exists so the platform can be exercised end to end.

---

MERIDIAN — Research. Valuation. Conviction.
