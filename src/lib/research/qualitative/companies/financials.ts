import type { CompanyQualitative } from '../types';

export const FINANCIALS: CompanyQualitative[] = [
  {
    ticker: 'ITUB4',
    sector: 'Financials',
    scope: 'BRAZIL',
    headline:
      'The best-run large bank in Brazil, controlled by two families through a listed holding, and the one most exposed to the argument about whether spread compression is cyclical or permanent.',
    howItEarns: [
      {
        heading: 'A spread on a very large book, plus fees that do not need capital',
        body:
          'Net interest income on roughly a trillion reais of credit is the bulk of it, earned on a deposit and payroll funding base that costs less than wholesale money. Insurance, cards, asset management and investment banking add fee income that consumes little capital, which is what lifts return on equity above what the credit book alone would produce.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Provisions are the swing factor, not revenue',
        body:
          'Revenue is relatively predictable; the cost of risk is not. A move of fifty basis points in provisions over the book changes earnings more than any commercial initiative, which is why the credit cycle rather than the growth rate determines the year.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Setubal and Villela families and the Moreira Salles group through Itaúsa, a listed holding company, under a long-standing shareholders\' agreement.',
      voting:
        'Preferred shares (ITUB4) carry the liquidity and no vote; control is exercised through ordinary shares held by the holding. Economic exposure and voting power are separated by design.',
      relatedPartyExposure: [
        'A listed holding above the bank means two sets of minority shareholders with claims on the same dividend stream',
        'The holding has historically traded below the value of its bank stake',
        'Preferred holders bear the economics of strategy without a vote on it',
      ],
      minorityProtections: [
        'B3 Level 1 obligations and NYSE ADR reporting',
        'Preferred dividend priority under Brazilian corporate law',
        'Central bank prudential supervision, which constrains what any controller can do with a bank',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Controlled, and the control has been the asset',
        body:
          'Family control through a holding is the classic Brazilian structure that usually warrants a discount. Here the record argues the other way: conservative underwriting through multiple cycles, management continuity, and a return on equity sustained above peers. The structure has produced long-horizon decisions rather than extraction, and the discount an investor applies should reflect the holding layer rather than a fear of expropriation.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A bank\'s real governance constraint is its regulator',
        body:
          'Capital, liquidity and provisioning rules limit what any owner can do with a bank, regardless of the share structure. That makes prudential supervision a genuine minority protection — and it also means the central bank\'s competition agenda is a governance-level influence on strategy, not just a market condition.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Funding cost from a retail and payroll deposit base',
        mechanism:
          'A deposit franchise built over decades funds the loan book below what any entrant pays for wholesale money, and the gap is the spread.',
        evidence: 'Sustained return on equity above private and state peers across cycles.',
        erodedBy: 'Open finance and instant payments reducing the stickiness of deposits, and digital banks paying up for balances.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Underwriting data on the same borrowers over decades',
        mechanism:
          'Behavioural history on a customer base this large produces credit decisions a newcomer cannot replicate from bureau data alone.',
        evidence: 'Lower cost of risk than peers at comparable book growth through the last two credit cycles.',
        erodedBy: 'Open finance, which is explicitly designed to give competitors access to the same history.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Consistently high distributions funded by earnings rather than by balance sheet, with capital deployed into fee businesses and technology rather than into acquisitions at premium prices. The bank has generally declined to buy growth.',
      good: [
        'Rotating the book toward collateral and higher-income customers ahead of the current delinquency cycle',
        'High and steady payout without compromising capital ratios',
        'Building digital capability internally rather than acquiring it at fintech valuations',
      ],
      bad: [
        'A period of losing ground in payments and cards to digital competitors before responding',
        'The holding structure, which persists and carries a visible discount',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Best placed for the easing cycle, most exposed to the structural argument',
        body:
          'With Selic cut to 14.00% by August 2026, credit demand should revive and provisions eventually fall. But the IMF finding that fintech competition cut incumbent net interest margins by 0.9 points between 2018 and 2024 applies most to the bank with the most to lose. The cyclical tailwind and the structural headwind arrive together.',
        basis: 'REPORTED',
      },
      {
        heading: 'Asset quality is still deteriorating, and the mix shift is the defence',
        body:
          'System delinquency over 90 days was 4.7% in June 2026, households at 5.6%. The bank\'s protection is that it rotated toward secured lending before the cycle turned — the coverage ratio tells you whether that rotation was real or presentational.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Permanent rather than cyclical margin compression',
        body:
          'Pix and open finance were policy interventions designed to reduce spreads. Policy does not reverse when the rate cycle does, so part of the lost margin may never return.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Household leverage at a record meeting a weak labour market',
        body:
          'With 82% of households carrying debt, the book\'s sensitivity to unemployment is higher than headline ratios suggest.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'itub4-quality-through-cycle',
        title: 'The premium is earned in the provision line, not the revenue line',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Brazilian banks do not differentiate on what they charge; they differentiate on what they lose. This bank entered the current cycle having already shifted mix toward collateral and payroll-deductible credit, which lowers loss given default on the same headline delinquency. If that rotation was genuine, the earnings hit from a given NPL level is smaller than history implies, and the rate-cutting cycle then arrives on a cleaner book than peers have.',
        requires: [
          'Coverage ratio holds while delinquency peaks, confirming the mix shift was real',
          'Cost of risk falls with a lag as Selic declines',
          'Fee income growth offsets part of the structural spread compression',
        ],
        breaks: [
          'Cost of risk rises above the level implied by the reported mix, showing the rotation was presentational',
          'Unemployment rises enough to break the secured book\'s loss assumptions',
          'Fee income falls as fast as spread, leaving no offset',
        ],
        modelLink: [
          { assumption: 'Cost of risk / provisions', note: 'This thesis lives entirely in the provision assumption. Model loss given default on the secured versus unsecured mix rather than applying a historical average.' },
          { assumption: 'Net interest margin', note: 'Separate the cyclical component from the structural one instead of forecasting a single blended NIM.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'itub4-structural-compression',
        title: 'Pix and open finance repriced the industry, and rates will not undo it',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The compression of the last several years was engineered by the central bank as competition policy, not produced by the rate cycle. The IMF puts the effect at 2.7 points off incumbent lending rates and 0.9 points off net interest margins. A forecast that returns margins to the pre-Pix level is implicitly forecasting a change of regulatory intent, and nothing suggests one. The bank is excellent; the industry it operates in is structurally less profitable than the one that produced its historical returns.',
        requires: [
          'Regulatory competition policy continues in its current direction',
          'Digital lenders retain their share of cards and unsecured lending',
          'Fee income in payments does not recover to prior levels',
        ],
        breaks: [
          'Capital requirements now phasing onto fintechs from July 2026 force consolidation and hand share back to incumbents',
          'Spread recovery in secured lending more than offsets the payments loss',
        ],
        modelLink: [
          { assumption: 'Net interest margin / terminal margin', note: 'The disagreement is about the terminal margin, not the next two years. Set the terminal NIM below the historical average to express it.' },
          { assumption: 'Fee income growth', note: 'Model payments fee income separately — it is the line where the compression is clearest.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IMF — Fintech competition and banks\' shrinking margins in Brazil (Jan 2026)', url: 'https://www.imf.org/en/publications/wp/issues/2026/01/16/fintech-competition-and-banks-shrinking-margins-in-brazil-573281' },
      { label: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br/en' },
      { label: 'ANBC — 2026 macroeconomic scenario and the credit market', url: 'https://anbc.org.br/en/outlook-for-2026-macroeconomic-scenario-and-the-new-contours-of-the-credit-market/' },
    ],
  },

  {
    ticker: 'BBAS3',
    sector: 'Financials',
    scope: 'BRAZIL',
    headline:
      'A state-controlled bank with a genuinely differentiated agribusiness franchise, which cut its payout from 45% to 30% and reduced 2026 profit guidance to preserve capital — in an election year.',
    howItEarns: [
      {
        heading: 'Agribusiness credit is the franchise, not a segment',
        body:
          'The bank is the dominant lender to Brazilian agriculture, much of it through subsidised rural credit programmes where the spread is set by policy rather than by the market. It is a genuinely defensible position — the relationships, the local presence and the programme mandate are not replicable — and it is also the part of the book most exposed to a bad harvest and to farm income.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Payroll-deductible lending and a captive public-sector base',
        body:
          'Lending against public-sector salaries and pensions carries very low loss rates because repayment is deducted at source. Combined with the deposit and payroll relationships that come with being the government\'s bank, this is a low-cost, low-risk core that supports the rest.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'Controlled by the Brazilian federal government, which holds a majority of the ordinary shares directly and through public entities.',
      voting: 'Ordinary shares on the Novo Mercado. The controlling shareholder is the state, and it votes.',
      relatedPartyExposure: [
        'The controller is also the policymaker that sets subsidised credit programmes the bank must originate',
        'Directed lending is a policy instrument whose spread is set with an objective other than return on equity',
        'Senior management appointments follow political cycles, and 2026 is an election year',
        'Dividend policy is influenced by the controller\'s own fiscal position',
      ],
      minorityProtections: [
        'Novo Mercado listing: one share one vote, tag-along, minimum free float',
        'The state-owned enterprises law, which imposes qualification requirements on appointees',
        'Central bank prudential supervision applied identically to state and private banks',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'The least interfered-with of the large state companies, which is not the same as insulated',
        body:
          'Analysts have generally viewed this bank as the least susceptible to government direction among the major state-controlled companies, largely because banking regulation constrains what a controller can do. The constraint is real. It does not extend to directed credit volumes, to management appointments, or to payout — all of which are the controller\'s to decide.',
        basis: 'REPORTED',
      },
      {
        heading: 'The payout cut is the governance question made concrete',
        body:
          'Payout fell from 45% in 2024 to 30% from 2025, and 2026 net profit guidance was reduced to a range of R$18 to R$22 billion on risk metrics and the need to preserve capital. Both are defensible prudential decisions. They are also decisions a minority holder funded and did not vote on, and they arrived in the year before an election.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Agribusiness lending position',
        mechanism:
          'Branch presence in farming regions, decades of borrower history, and the mandate to operate subsidised rural credit give a share of agricultural credit no private bank has attempted to contest.',
        evidence: 'A dominant share of Brazilian rural credit sustained across governments.',
        erodedBy: 'Capital markets funding for agribusiness through CRAs and fintech lenders, and a farm income downturn that makes the book less attractive.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The recent decisions have prioritised capital and provisioning over distribution, which is prudent and was not what shareholders had been receiving. The strategic direction — more agribusiness, more payroll credit, less unsecured — is the right one for the risk environment.',
      good: [
        'Preserving capital and raising provisions ahead of a deteriorating credit cycle rather than defending the payout',
        'Concentrating on segments where the franchise is genuinely differentiated',
      ],
      bad: [
        'A payout reduction that arrived with a guidance cut, which is the sequence that damages credibility most',
        'Periodic obligations to originate directed credit at spreads a private bank would decline',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Agricultural credit quality is the bank-specific cycle',
        body:
          'System delinquency was 4.7% in June 2026 with companies at 3.2%, but this bank\'s risk is concentrated in farm income rather than in household unemployment. Falling crop prices and farm profitability pressure — the same forces cutting equipment sales — reach this book directly and through a different channel from the rest of the sector.',
        basis: 'REPORTED',
      },
      {
        heading: 'Election-year noise is priced, and it is not only noise',
        body:
          'The market charges a discount for predictability, capital discipline and governance at state-controlled companies in election years. For a bank whose controller sets both the credit programmes and the payout, that discount is compensation for a real mechanism rather than sentiment.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Agricultural credit deterioration',
        body:
          'A concentrated exposure to farm income at a point where crop prices have fallen and farm profitability is under pressure. This is the specific risk that distinguishes this bank from its peers.',
        basis: 'REPORTED',
      },
      {
        heading: 'Direction on lending, payout or management after an election',
        body:
          'The controller can change the bank\'s risk appetite, its distribution policy and its leadership. It has done all three before.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'bbas3-agri-franchise',
        title: 'A genuine franchise priced as a state-owned enterprise',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The agribusiness and payroll-deductible books are structurally low-loss positions that no private competitor has seriously contested, and the bank trades at a fraction of the multiple its private peers command. The discount is for the controller, not the franchise. If provisioning has been taken conservatively and the payout reduction was genuinely prudential rather than fiscal, the current rating pays for the governance risk twice.',
        requires: [
          'Agricultural credit losses stay within the provisioning already taken',
          'The payout reduction proves temporary and prudential rather than a permanent shift',
          'No post-election direction on lending spreads or risk appetite',
        ],
        breaks: [
          'Farm income deterioration produces losses beyond the provisions',
          'Payout stays at the reduced level while capital is deployed into directed lending',
          'Management change after the election brings a different risk appetite',
        ],
        modelLink: [
          { assumption: 'Cost of risk / provisions', note: 'Model the agricultural book separately. Its loss driver is farm income, not unemployment, and it is the whole difference from peers.' },
          { assumption: 'Dividend payout', note: 'Payout is the controller\'s decision. Model the 30% level as the base case rather than reverting to 45%.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'bbas3-state-control',
        title: 'The controller decides the payout, the spread and the management',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Banking regulation constrains a controller\'s ability to damage a bank, which is why this has been the least interfered-with of the state companies. It does not constrain the three things that actually determine a minority holder\'s return: how much directed credit the bank originates and at what spread, how much of the profit is distributed, and who runs it. All three moved against shareholders in the last two years, and an election lands in 2026. The appropriate response is an explicit governance premium, not a lower growth rate.',
        requires: [
          'The state retains control',
          'Directed credit programmes remain a policy instrument',
        ],
        breaks: [
          'A binding, published distribution policy the controller commits to across cycles',
          'Privatisation or a material reduction in the state\'s stake',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Add a stated governance premium rather than expressing the concern as a lower terminal growth rate, where it cannot be argued with.' },
          { assumption: 'Net interest margin', note: 'Directed lending carries a policy spread. Model it separately from free credit rather than blending.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'InfoMoney — state-owned enterprises, elections and dividends in 2026', url: 'https://www.infomoney.com.br/onde-investir/dividendos-estatais-efeito-eleicoes-2026/' },
      { label: 'InfoMoney — what to expect from Petrobras, BB and Eletrobras shares in an election year', url: 'https://www.infomoney.com.br/mercados/o-que-esperar-das-acoes-das-estatais-petrobras-petr4-bb-bbas3-e-eletrobras-elet6-em-mais-um-ano-de-eleicoes/' },
      { label: 'Investidor10 — what to expect from the large state companies in 2026', url: 'https://investidor10.com.br/noticias/o-que-esperar-das-grandes-estatais-em-2026-petrobras-banco-do-brasil-axia-e-caixa-117637/' },
      { label: 'Banco Central do Brasil — credit statistics', url: 'https://www.bcb.gov.br/en' },
    ],
  },

  {
    ticker: 'BPAC11',
    sector: 'Financials',
    scope: 'BRAZIL',
    headline:
      'A partnership-run investment bank that has become a universal one, where the founding partner controls the votes and the partners own enough of the equity that their incentives are the governance mechanism.',
    howItEarns: [
      {
        heading: 'Fee businesses first, balance sheet second',
        body:
          'Investment banking, asset and wealth management, and sales and trading generate most of the revenue, and the first two need almost no capital. Wealth management in particular is a recurring fee on assets that grows with markets and with net new money, which is why the return on equity sits above what a credit book alone could produce.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A corporate credit book run as a merchant bank, not a retail lender',
        body:
          'Lending is concentrated, collateralised and originated alongside advisory relationships rather than sold through branches. That produces lower loss rates than a consumer book in a downturn and concentrates the risk in fewer names — a different risk shape, not a smaller one.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by André Esteves and the partnership through a holding structure, with partners collectively holding a large economic stake and the units (BPAC11) providing the public float.',
      voting:
        'Units combining share classes give the liquidity; control sits with the partnership\'s voting shares. Minority unit holders have economic exposure with limited voting weight.',
      relatedPartyExposure: [
        'The controlling partner is also an operating executive, so strategy and compensation are decided by the same people who receive them',
        'Partnership compensation is the largest cost line and is set internally',
        'Principal investments alongside client funds create potential allocation questions between the bank\'s book and its clients',
      ],
      minorityProtections: [
        'B3 Level 2 obligations, including tag-along and arbitration',
        'Central bank prudential supervision of the banking entity',
        'Partners\' own capital at risk in the same instruments, which aligns them with outside holders more than a salaried management would be',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The partnership is the governance model, for better and worse',
        body:
          'Partners buy in with their own money and are paid largely in equity that vests over years, so the people making risk decisions carry the consequences. That is a stronger alignment than most listed banks achieve. The flip side is that a partnership decides its own compensation, and the share of revenue that goes to partners rather than shareholders is not something an outside holder can vote on.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Key-person concentration is real and acknowledged',
        body:
          'The franchise, the client relationships and the risk culture are closely identified with a small group and above all with one person. A bank whose competitive advantage is its people carries a succession risk that does not appear anywhere on the balance sheet.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Partnership economics that retain the people who are the franchise',
        mechanism:
          'Paying senior staff in vesting equity that they also had to buy makes leaving expensive and makes underwriting badly personally costly. Competitors paying cash bonuses cannot replicate the retention or the caution.',
        evidence: 'Low senior partner attrition and a sustained lead in Brazilian investment banking league tables.',
        erodedBy: 'A period of poor returns that makes the equity worth less than a competitor\'s cash offer, or a succession that breaks the culture.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Wealth management relationships with Brazilian high net worth',
        mechanism:
          'Assets under management from wealthy families are sticky because the relationship spans credit, advisory and estate planning, not just a fund selection.',
        evidence: 'Consistent net new money into wealth management across market conditions, producing recurring fee income.',
        erodedBy: 'Platform competition and fee compression from digital brokers reaching the same clients at lower cost.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Aggressive expansion from investment banking into wealth, asset management, digital retail and insurance, funded largely from retained earnings and equity issuance rather than by levering up. The direction has been toward recurring fee income, which is the right direction.',
      good: [
        'Building wealth and asset management into recurring revenue that reduces dependence on capital markets activity',
        'Entering digital retail banking organically rather than paying a fintech multiple to acquire it',
      ],
      bad: [
        'A large compensation share of revenue that limits how much of the franchise\'s value reaches outside shareholders',
        'Expansion into retail banking, where the bank has no funding-cost advantage and competes against incumbents with cheaper deposits',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The easing cycle is more directly good here than for a lender',
        body:
          'Falling Selic revives equity and debt issuance, merger activity and fund flows out of fixed income into managed products. A bank whose revenue is weighted to capital markets and wealth benefits from rate cuts through volumes rather than waiting for provisions to fall.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Least exposed to the Pix and open finance compression',
        body:
          'The margin the central bank\'s competition agenda has been squeezing is in payments and unsecured consumer lending. This bank barely operates there, so the structural headwind that dominates the incumbent retail banks\' outlook largely passes it by.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Concentrated corporate credit meeting a weak corporate cycle',
        body:
          'With average free corporate credit rates above 25% and corporate delinquency at 3.2%, a concentrated book means a small number of names can produce a large provision. The risk is lumpy rather than gradual.',
        basis: 'REPORTED',
      },
      {
        heading: 'Succession and key-person dependence',
        body:
          'The franchise is unusually identified with individuals. This is the risk most likely to be mispriced, because nothing in the financial statements reflects it.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'bpac11-fee-mix',
        title: 'A fee business wearing a bank\'s regulatory clothing',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Most of the revenue comes from advisory, asset and wealth management — activities that consume little capital and earn recurring fees. Those are worth a higher multiple than a spread business, and they are also the activities least touched by the regulatory compression squeezing the retail incumbents. A rate-cutting cycle raises issuance volumes and pushes savings out of fixed income into managed products, which is a direct volume tailwind rather than the slow provision relief a lender waits for.',
        requires: [
          'Wealth and asset management net inflows continue as rates fall',
          'Capital markets activity recovers with the easing cycle',
          'Concentrated corporate credit losses stay contained',
        ],
        breaks: [
          'A small number of large corporate exposures default and consume several quarters of fee income',
          'Fee compression from digital platforms reaches the wealth franchise',
          'Retail banking expansion consumes capital without earning its cost',
        ],
        modelLink: [
          { assumption: 'Revenue mix by segment', note: 'Model fee income and net interest income separately. Blending them into one growth rate is what makes this look like an ordinary bank.' },
          { assumption: 'Return on equity / cost of equity', note: 'A capital-light fee business supports a different ROE and a different multiple than a credit book.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'bpac11-partnership-share',
        title: 'The partnership takes its cut before the shareholder does',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Partnership alignment is genuine and it has a price: compensation is the largest cost line, it is set by the people receiving it, and outside holders have no vote on it. In a good year the partners capture a large share of the franchise value they created; in a bad one the equity component cushions the bank and the shareholder absorbs the result. Add a franchise closely identified with one person and no succession visibility, and the correct response is a governance premium in the discount rate rather than a lower growth assumption.',
        requires: [
          'Compensation remains a large and internally determined share of revenue',
          'Control and executive authority remain with the same group',
        ],
        breaks: [
          'A published compensation framework with a stated ceiling as a share of revenue',
          'A completed, tested succession that leaves the franchise intact',
        ],
        modelLink: [
          { assumption: 'Operating cost ratio', note: 'Model compensation as a share of revenue rather than as a fixed cost that fades with scale — it has not faded.' },
          { assumption: 'Cost of equity', note: 'Key-person and self-set-compensation risk belong in an explicit premium, where they can be argued with.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IMF — fintech competition and Brazilian bank margins', url: 'https://www.imf.org/en/publications/wp/issues/2026/01/16/fintech-competition-and-banks-shrinking-margins-in-brazil-573281' },
      { label: 'Banco Central do Brasil — credit statistics', url: 'https://www.bcb.gov.br/en' },
    ],
  },

  {
    ticker: 'SANB11',
    sector: 'Financials',
    scope: 'BRAZIL',
    headline:
      'The Brazilian subsidiary of a Spanish bank, over ninety per cent controlled, with a free float small enough that the minority position is a structural fact before it is an investment view.',
    howItEarns: [
      {
        heading: 'A full retail and commercial bank, weighted to consumer credit',
        body:
          'Payroll loans, vehicle financing, cards, mortgages and small business credit funded by a retail deposit base. The mix has historically been more consumer-weighted than the domestic leaders, which produces better spreads in good conditions and worse provisions in bad ones.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Vehicle financing is the genuine specialism',
        body:
          'A long-established position in auto lending through dealer relationships gives scale in a collateralised product. It is one of the few segments where this bank rather than the domestic incumbents sets the pace.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by Banco Santander S.A. of Spain with a stake above ninety per cent, leaving a single-digit free float held mostly through units and ADRs.',
      voting:
        'Units combining ordinary and preferred shares provide the float. With a controller at this level, minority votes cannot affect any outcome.',
      relatedPartyExposure: [
        'The parent sets capital allocation, dividend policy and strategy for the Brazilian entity from Madrid, against its own group priorities',
        'Intragroup funding, technology and service agreements are priced between related parties',
        'A free float this small means limited liquidity and a standing possibility of a buyout at a price the parent chooses to offer',
      ],
      minorityProtections: [
        'B3 Level 2 obligations including tag-along rights, which matter more than usual given the controller\'s stake',
        'Brazilian central bank supervision of the local entity as a standalone regulated bank',
        'NYSE ADR reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Ninety per cent control changes what minority analysis means',
        body:
          'At this level the relevant questions are not about strategy, which the minority cannot influence, but about whether value is retained locally: the dividend the parent chooses to take, the terms of intragroup agreements, and whether capital is deployed in Brazil or upstreamed. Tag-along rights are the most consequential protection, because the most likely liquidity event is the parent making an offer.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Local regulation is the real constraint on the parent',
        body:
          'The Brazilian entity is separately capitalised and supervised, so the central bank limits how much the parent can extract or how thinly it can run the local balance sheet. That is a genuine protection and it is external to the share structure.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Auto financing scale through dealer networks',
        mechanism:
          'Dealer relationships and point-of-sale integration in vehicle finance take years to build and produce origination volume competitors cannot buy quickly.',
        evidence: 'A leading share of Brazilian vehicle financing sustained across cycles, in a collateralised product with recoverable security.',
        erodedBy: 'Captive finance arms of the vehicle manufacturers, and digital lenders originating at the dealership on better terms.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Capital deployment follows the parent\'s group priorities, which has meant periods of aggressive growth in Brazil when the group wanted emerging market earnings and periods of restraint when it needed capital elsewhere. The local franchise has been managed competently; the cycle of emphasis has been decided abroad.',
      good: [
        'Building genuine scale in vehicle financing, a defensible collateralised niche',
        'Maintaining local capital levels through the recent credit deterioration',
      ],
      bad: [
        'A consumer-weighted mix that produced provisions above domestic peers when the credit cycle turned',
        'Strategic emphasis that has shifted with the parent\'s needs rather than with the Brazilian opportunity',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'More exposed to the household delinquency cycle than the leaders',
        body:
          'System household delinquency was 5.6% over 90 days in June 2026 against 3.2% for companies. A bank with a heavier consumer mix feels the household number, and its recovery depends on the same easing cycle reaching borrowers rather than on its own decisions.',
        basis: 'REPORTED',
      },
      {
        heading: 'Fully exposed to the fintech compression',
        body:
          'Cards, personal loans and payments are exactly where the IMF measured incumbent margins falling, and they are a meaningful part of this bank\'s revenue. The structural headwind applies at full strength here.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Consumer credit losses above peers',
        body:
          'The mix that produces the better spread produces the worse provision. This has happened in each of the last two cycles.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Liquidity and the terms of any eventual buyout',
        body:
          'A single-digit float is thin, and the most probable liquidity event is an offer priced by the controller. Tag-along protects the principle; it does not set the price.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'sanb11-recovery-beta',
        title: 'The highest beta to a Brazilian consumer credit recovery among the large banks',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A consumer-weighted book is the one that suffers most when delinquency rises and recovers most when it falls. With Selic cut to 14.00% by August 2026 and the easing cycle under way, provisions should decline with a lag on exactly the segments that drove them up. The bank does not need to improve; it needs the cycle to turn, and it is positioned so that the turn matters more here than at a peer with a secured book.',
        requires: [
          'Household delinquency peaks and begins falling as rates decline',
          'Provisions already taken prove adequate for the existing book',
          'The parent leaves local capital in place to fund the recovery in origination',
        ],
        breaks: [
          'Unemployment rises, breaking the link between lower rates and better household credit',
          'Record household indebtedness means lower rates go to debt service rather than to new borrowing',
          'The parent upstreams capital rather than funding local growth',
        ],
        modelLink: [
          { assumption: 'Cost of risk / provisions', note: 'This is entirely a provision thesis. Model the consumer book\'s cost of risk declining from its peak rather than reverting to a long-run average.' },
          { assumption: 'Loan book growth', note: 'A recovery requires origination to resume, which is the parent\'s capital decision as much as a market one.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'sanb11-minority',
        title: 'At ninety per cent control, the minority holds an economic interest rather than an ownership stake',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Every decision that determines the return — dividend policy, capital deployment, the pricing of intragroup agreements, strategic emphasis — is made by a controller with over ninety per cent and its own group priorities. The minority cannot influence any of it, the float is thin enough to impair liquidity, and the most likely exit is an offer the controller prices. Local banking regulation is a real constraint on extraction, and it is the only one. This should be priced as a governance premium rather than assumed to resolve.',
        requires: [
          'The parent retains its stake at the current level',
          'Free float remains small enough to limit liquidity',
        ],
        breaks: [
          'The parent sells down, creating a genuine float and a contested board',
          'A buyout at a price that fully reflects the local franchise, which would end the discount rather than argue about it',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Add an explicit premium for control concentration and liquidity. Stating it makes it arguable.' },
          { assumption: 'Dividend payout', note: 'Payout is the parent\'s choice and follows its group capital needs, not a local earnings formula.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Banco Central do Brasil — credit and delinquency statistics', url: 'https://www.bcb.gov.br/en' },
      { label: 'IMF — fintech competition and Brazilian bank margins', url: 'https://www.imf.org/en/publications/wp/issues/2026/01/16/fintech-competition-and-banks-shrinking-margins-in-brazil-573281' },
    ],
  },

  {
    ticker: 'ITSA4',
    sector: 'Financials',
    scope: 'BRAZIL',
    headline:
      'A holding company whose value is mostly one bank stake, trading below the sum of what it owns — which is the point of owning it and also the reason it stays cheap.',
    howItEarns: [
      {
        heading: 'Dividends received from listed stakes, less holding costs',
        body:
          'Itaúsa does not operate anything. It receives dividends from its stake in Itaú Unibanco and from a portfolio of industrial and infrastructure holdings, pays its own modest costs and taxes, and distributes the rest. The income statement is a pass-through and the balance sheet is the company.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The non-bank portfolio is where capital allocation actually happens',
        body:
          'Stakes in industrials, building materials, sanitation, gas transport and energy distribution are where management makes decisions. They are a small share of net asset value and the whole of the discretionary activity — which means judging this company means judging those acquisitions, not the bank.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Setubal, Villela and Moreira Salles families under a shareholders\' agreement — the same agreement through which control of Itaú Unibanco is exercised.',
      voting:
        'Preferred shares (ITSA4) carry the liquidity and no vote; the families hold the ordinary shares. A minority holder owns economics in a holding that owns economics in a bank.',
      relatedPartyExposure: [
        'Two layers of minority shareholders — in the holding and in the bank — with claims on the same dividend stream',
        'The controlling families decide whether the holding\'s cash is distributed or reinvested into new stakes',
        'Acquisitions by the holding are funded by minority capital and chosen by the controllers',
      ],
      minorityProtections: [
        'B3 Level 1 disclosure obligations',
        'Preferred dividend priority under Brazilian corporate law',
        'A published net asset value that makes the discount observable rather than a matter of opinion',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The discount is the structure, priced',
        body:
          'A listed holding whose principal asset is a listed company almost always trades below the value of its stake. The gap pays for the extra layer, the taxes on moving cash upward, and the risk that the controller reinvests rather than distributes. It is one of the cleanest examples in the market of a governance cost with an observable price — and it does not close on its own.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Reinvestment risk is the real question, not extraction',
        body:
          'These controllers have not extracted value; the concern is different. Cash that could be distributed can instead buy the next industrial stake, and the minority funds an allocation decision it did not make. The holding\'s non-bank acquisitions are therefore the governance record that matters here.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Access to controlling stakes at prices a financial buyer cannot get',
        mechanism:
          'A long-established family group with permanent capital and industrial credibility is offered control positions in Brazilian assets that never reach an auction, and can hold them through cycles no fund could.',
        evidence: 'A portfolio of controlling and co-controlling positions in infrastructure and industrial assets assembled over decades.',
        erodedBy: 'Competition from infrastructure funds with lower return requirements bidding the same assets up.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'High distributions from the bank stake, with a portion recycled into non-bank holdings. The diversification has been gradual and disciplined on price, though the returns on the non-bank portfolio have not matched the bank it is diversifying away from.',
      good: [
        'Building infrastructure and sanitation positions with long contracted revenues at reasonable entry prices',
        'Maintaining a high pass-through of bank dividends rather than accumulating cash at the holding',
      ],
      bad: [
        'Non-bank investments that have generally earned less than the bank stake they were funded from',
        'A holding structure retained for decades, carrying a persistent discount that management has not moved to close',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The bank\'s cycle is this company\'s cycle',
        body:
          'Because the bank stake dominates net asset value, everything that drives Itaú — the easing cycle, provisions, the structural spread compression from Pix and open finance — drives this holding with a lag and a discount attached.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The non-bank stakes bring unrelated regulatory exposure',
        body:
          'Sanitation, gas transport and energy distribution holdings carry concession and tariff risk that has nothing to do with banking. It is genuine diversification of risk as well as of return.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'A discount that persists indefinitely',
        body:
          'Nothing forces the gap to close. An investor buying the discount needs either a catalyst or the patience to collect dividends while it does not.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Cash redeployed into assets earning less than the bank',
        body:
          'The mechanism by which this holding underperforms its own net asset value over time is reinvestment at lower returns than the source of the cash.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'itsa4-discount',
        title: 'The same bank, cheaper, if the discount does not widen',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The holding\'s net asset value is observable because its principal asset is listed. Buying the holding buys the same exposure at a discount, with a dividend yield correspondingly higher on the price paid. The thesis does not require the discount to close — it requires only that it not widen, with the excess yield compensating for the wait. That is a materially more modest requirement than most holding-company cases rest on.',
        requires: [
          'The bank stake continues to distribute at a high payout',
          'The discount to net asset value does not widen materially',
          'Non-bank reinvestment stays a minority of the cash flow',
        ],
        breaks: [
          'The discount widens because reinvestment accelerates into lower-return assets',
          'The bank cuts its payout, removing the yield that pays for the wait',
          'A large debt-funded acquisition at the holding level changes the risk profile',
        ],
        modelLink: [
          { assumption: 'Net asset value bridge', note: 'Value this as a sum of the parts against the listed stake, not on consolidated earnings. The discount is the entire question.' },
          { assumption: 'Dividend payout', note: 'The yield on the discounted price is what compensates for the discount persisting.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'itsa4-reinvestment',
        title: 'Cash leaving a great bank for merely good assets',
        side: 'BEAR',
        weight: 'SUPPORTING',
        rationale:
          'The holding receives dividends from one of the best-returning banks in the market and reinvests part of them into industrial and infrastructure stakes that have not matched it. Every real recycled that way lowers the blended return on the holding\'s capital, which is the mechanism by which a discount widens rather than closes. This is not a governance abuse — the controllers are diversifying a concentrated family position, which is rational for them and dilutive for a shareholder who wanted the bank.',
        requires: [
          'Reinvestment into non-bank assets continues',
          'Those assets continue to earn below the bank\'s return on equity',
        ],
        breaks: [
          'A shift to full pass-through of bank dividends with no new acquisitions',
          'Non-bank holdings demonstrably earning returns comparable to the bank',
        ],
        modelLink: [
          { assumption: 'Reinvestment rate and return on new capital', note: 'Model the blended return on the holding\'s capital rather than the bank\'s ROE. The gap between them is this thesis.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IMF — fintech competition and Brazilian bank margins', url: 'https://www.imf.org/en/publications/wp/issues/2026/01/16/fintech-competition-and-banks-shrinking-margins-in-brazil-573281' },
      { label: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br/en' },
    ],
  },

  {
    ticker: 'B3SA3',
    sector: 'Financials',
    scope: 'BRAZIL',
    headline:
      'A vertically integrated exchange monopoly with dispersed ownership and no controller — the highest-quality business in Brazilian financials, and the one whose entire risk is that someone is finally allowed to compete with it.',
    howItEarns: [
      {
        heading: 'A fee on every transaction, and a second fee on holding the result',
        body:
          'B3 charges to trade and then charges again to clear, settle and custody what was traded. Owning the whole chain means a single transaction generates revenue at several points, and the post-trade revenue is recurring rather than volume-dependent. Fixed income registration, derivatives and the vehicle and property lien registries add fee streams with no relationship to equity market sentiment.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Operating leverage that works violently in both directions',
        body:
          'The cost base is technology and people, almost entirely fixed. An extra million trades costs nothing to process, so incremental revenue falls through to profit at very high margins — and a decline in volumes falls through just as directly. This is why the margin looks extraordinary in a bull market and deteriorates fast in a quiet one.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder and no shareholders\' agreement. Ownership is dispersed among domestic and foreign institutions with a very large free float, and by statute no single holder may exceed a low ownership cap.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with a statutory ownership ceiling that prevents any holder accumulating control.',
      relatedPartyExposure: [
        'The largest customers — banks and brokers — are also participants in the market it operates and the constituency that lobbies on its fees',
        'A board with no anchor shareholder is accountable to a dispersed register and to the regulator',
      ],
      minorityProtections: [
        'Novo Mercado rules plus a statutory cap on individual ownership, which makes a control block structurally impossible',
        'Regulatory oversight by the securities commission and the central bank over clearing and settlement',
        'No related-party transactions with a parent, because there is no parent',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The cleanest governance structure in the Brazilian market',
        body:
          'A statutory ownership cap and no shareholders\' agreement mean the classic Brazilian minority problems — a parent extracting value, a non-voting share class, a controller reinvesting your dividends — simply do not arise. What replaces them is ordinary agency risk between a dispersed register and a professional board, which is a far better problem to have.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The regulator is both protector and the principal threat',
        body:
          'Clearing and settlement are systemically important and supervised accordingly, which protects the franchise\'s integrity. The same regulator decides whether a competing exchange or clearing house may operate. Every material risk to this business runs through a regulatory decision rather than through a market one.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Vertical integration of trading, clearing and custody',
        mechanism:
          'A competitor offering only trading cannot capture the post-trade revenue and cannot offer netting across an existing open-interest pool, so its users would fragment their collateral and pay more in margin. The integration is what makes entry unattractive rather than merely difficult.',
        evidence: 'Multiple announced competitor entries over the past decade that did not reach meaningful volume.',
        erodedBy: 'A regulatory decision to mandate interoperability of clearing, which would let an entrant compete on trading fees alone.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Liquidity as a self-reinforcing asset',
        mechanism:
          'Order flow goes where order flow already is, because the best price is found in the deepest book. A new venue must offer a worse price to attract the flow that would make its price better.',
        evidence: 'Concentration of Brazilian equity and derivatives volume in a single venue despite explicit regulatory openness to competition.',
        erodedBy: 'Order routing rules or fee structures that direct flow away, or a segment where liquidity has not yet concentrated.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'High distributions funded by genuine free cash flow, with capital deployed into adjacent registries and data products that extend the fee base without much capital. The acquisitions have been sensible in direction and not always in price.',
      good: [
        'Extending into fixed income registration and lien registries, adding fee streams uncorrelated with equity volumes',
        'Distributing most of the free cash flow rather than accumulating it, appropriate for a business with no capital needs',
      ],
      bad: [
        'Acquisitions in data and technology at prices that imply growth the assets have not delivered',
        'Fee concessions granted under competitive and political pressure, which have compressed the take rate in some segments',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The easing cycle is a direct volume tailwind',
        body:
          'With Selic falling from above 15% toward 14.00%, capital is pushed out of fixed income into equities and managed products, which raises trading volumes, issuance and custody balances at once. This company benefits from rate cuts more mechanically than any lender does.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Unaffected by the compression squeezing the banks',
        body:
          'Pix and open finance attack payment and lending spreads. An exchange charges a fee for infrastructure nobody has replicated, so the structural headwind dominating the incumbent banks\' outlook does not reach it.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Regulatory authorisation of a competitor, or mandated clearing interoperability',
        body:
          'The monopoly exists at the regulator\'s discretion. Interoperability would be the more damaging of the two, because it removes the vertical integration that makes entry pointless rather than merely allowing an entrant.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Volume dependence through a fixed cost base',
        body:
          'A prolonged low-volume market compresses margins quickly because there is almost no variable cost to cut. The revenue is a monopoly fee, and the quantity is not under the company\'s control.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'b3sa3-integration',
        title: 'Vertical integration, not the licence, is what has kept competitors out',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Brazilian regulation has been formally open to competing venues for years and several entrants have announced plans. None reached scale, because a trading-only competitor cannot offer netting against the existing open interest and cannot capture post-trade revenue — so its users would fragment collateral and pay more in total. The moat is an economic structure rather than a legal prohibition, which makes it more durable than a licence and is why the market keeps mispricing the entry threat.',
        requires: [
          'Clearing remains integrated rather than interoperable by mandate',
          'Liquidity stays concentrated in the incumbent book',
          'Volumes recover with the easing cycle',
        ],
        breaks: [
          'A regulatory mandate for clearing interoperability, which would let an entrant compete on trading fees alone',
          'A competitor reaching enough volume in one segment to start the liquidity flywheel',
          'Fee concessions under political pressure that compress the take rate materially',
        ],
        modelLink: [
          { assumption: 'Revenue driver — fee per transaction', note: 'Entry risk shows up as take-rate compression, not as lost volume. Model the fee per transaction falling with volumes held.' },
          { assumption: 'EBITDA margin path', note: 'Fixed cost base means margin follows volume mechanically. Test a low-volume year rather than averaging.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'b3sa3-regulatory-risk',
        title: 'A monopoly that exists at a regulator\'s discretion is not the same as one that exists by economics',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The same central bank that built Pix to compress payment spreads, mandated open finance to remove the banks\' information advantage, and forced receivables registration is the authority that decides whether clearing must be interoperable. Its demonstrated preference is to engineer competition into concentrated Brazilian financial infrastructure. That is a specific institutional track record pointing at this company, not a generic regulatory risk, and the multiple embeds none of it.',
        requires: [
          'The regulator\'s competition agenda continues to extend into market infrastructure',
          'Political pressure on the cost of capital markets access persists',
        ],
        breaks: [
          'An explicit regulatory position that vertical integration in clearing is preserved',
          'Interoperability introduced and a competitor still failing to reach scale, which would prove the moat is economic',
        ],
        modelLink: [
          { assumption: 'Revenue driver — fee per transaction', note: 'Model a step change down in the take rate rather than a gradual fade. Regulatory outcomes arrive as events.' },
          { assumption: 'Terminal growth', note: 'A terminal value built on monopoly economics is the thing this thesis disputes.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IMF — the Brazilian central bank\'s competition interventions in financial services', url: 'https://www.imf.org/en/publications/wp/issues/2026/01/16/fintech-competition-and-banks-shrinking-margins-in-brazil-573281' },
      { label: 'Chambers — Brazilian financial services regulation trends', url: 'https://practiceguides.chambers.com/practice-guides/financial-services-regulation-2025/brazil/trends-and-developments' },
      { label: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br/en' },
    ],
  },

  {
    ticker: 'BBSE3',
    sector: 'Financials',
    scope: 'BRAZIL',
    headline:
      'An insurance business with almost no capital and an extraordinary return on equity, whose entire distribution is a bank it does not control and whose largest earnings driver is the interest rate.',
    howItEarns: [
      {
        heading: 'Underwriting through a partner, distribution through a branch network it does not own',
        body:
          'Life, rural and credit-life insurance, private pensions and premium bonds sold across a state bank\'s branch network and digital channels under an exclusive agreement. The underwriting sits in joint ventures with an insurance partner; the holding earns its share of the result plus brokerage commission on the distribution. Because it owns very little of the underwriting capital, return on equity is a multiple of what a conventional insurer earns.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The float is a second business, and rates set its value',
        body:
          'Premiums are collected before claims are paid, and the reserves are invested largely in government securities. At a Selic of 14% that financial result is a very large part of earnings; as rates fall it shrinks mechanically with no change in the insurance operation at all. Separating underwriting profit from financial result is essential here and routinely not done.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by Banco do Brasil, which holds a majority of the shares, with the underwriting conducted through joint ventures with an international insurance group. The bank is simultaneously controller, distributor and counterparty.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the state bank holding a clear majority.',
      relatedPartyExposure: [
        'The controller is also the exclusive distribution channel, and the commercial terms between them are a related-party agreement',
        'Renewal of that distribution agreement is negotiated between the controller and its own subsidiary',
        'The ultimate controller is the federal government, through the bank',
        'Product priority inside the branch network competes with the bank\'s own credit products for the same customer moment',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along, minimum free float',
        'Insurance regulator supervision of the underwriting entities and their reserves',
        'Published distribution agreement terms, which make the related-party economics observable',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The distribution agreement is the company',
        body:
          'Everything this business earns depends on exclusive access to a branch network owned by its controller. The terms and the renewal of that access are set by a negotiation in which the minority has no part, and the counterparty is the majority shareholder. This is the single most important governance fact and it is not a hypothetical — the agreement has a term and it ends.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A state controller two layers up',
        body:
          'The federal government controls the bank and the bank controls this company, so government priorities reach the insurer indirectly. Rural insurance in particular sits alongside subsidised agricultural credit as an instrument of farm policy.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Exclusive access to a branch network that reaches where competitors do not',
        mechanism:
          'Selling insurance at the moment a farmer takes rural credit, or a borrower takes a loan, converts a captive interaction into a policy. No independent insurer can buy that placement, and the network extends into municipalities where no competitor has a branch.',
        evidence: 'Dominant share of Brazilian rural insurance and credit-life, at acquisition costs far below an independent distributor\'s.',
        erodedBy: 'Expiry or renegotiation of the distribution agreement on worse terms, or digital distribution reducing the value of a branch moment.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Very high distributions, because the business needs almost no capital — the underwriting capital sits in the joint ventures. That is the correct policy and it also means there is essentially no reinvestment decision to judge management on.',
      good: [
        'Distributing nearly all earnings rather than retaining capital a capital-light business does not need',
        'Structuring underwriting in joint ventures, which keeps the reserve risk off the holding\'s balance sheet',
      ],
      bad: [
        'Almost total dependence on a single distribution channel, which is a strategic exposure never reduced',
        'Limited progress building distribution outside the controller\'s network, leaving no alternative if terms change',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The easing cycle works against this company',
        body:
          'Most Brazilian financials benefit as Selic falls. This one does not: the financial result on the float shrinks directly with the rate. Earnings can decline through an easing cycle while the insurance operation improves, which is the opposite of the sector pattern and is frequently misread.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Rural exposure links it to farm income, not to households',
        body:
          'Agricultural insurance and credit-life on rural lending mean the claims experience follows harvests and farm profitability. With crop prices down and farm income under pressure, that is the live underwriting risk rather than consumer credit.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Distribution agreement renewal',
        body:
          'The agreement that constitutes the business is negotiated with the controlling shareholder and has a finite term. Worse terms would reset the earnings base permanently, and the minority has no seat at that table.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Falling rates compressing the financial result',
        body:
          'A large share of earnings is interest on the float. The easing cycle removes it arithmetically, and no operational improvement offsets a 400 basis point move in Selic.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'bbse3-capital-light',
        title: 'A distribution franchise, not an insurer, and it should be valued as one',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The underwriting capital and reserve risk sit in joint ventures; what the listed company owns is exclusive access to the largest rural and small-town branch network in Brazil, plus a share of the result. That is an asset-light, high-return annuity, and it earns a return on equity conventional insurers cannot approach because it is not carrying their balance sheet. Valued on an insurer\'s book multiple it looks expensive; valued as a distribution agreement with a very high payout it looks different.',
        requires: [
          'The distribution agreement is renewed on terms comparable to the current ones',
          'Rural and credit-life volumes hold as agricultural credit continues',
          'Underwriting results at the joint ventures stay within historical loss ratios',
        ],
        breaks: [
          'The agreement is renegotiated on materially worse economics',
          'Agricultural claims deteriorate with farm income, hitting the underwriting share',
          'The controller prioritises its own credit products over insurance placement in the branch',
        ],
        modelLink: [
          { assumption: 'Return on equity / payout', note: 'Model this as a capital-light fee stream with a very high payout, not as an insurer retaining capital to grow a reserve base.' },
          { assumption: 'Revenue driver — policies distributed', note: 'The volume driver is the branch network\'s reach and the credit it originates, not insurance market growth.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'bbse3-rate-sensitivity',
        title: 'Falling rates take earnings out of this company, not put them in',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'A large part of reported profit is the financial result on insurance float invested in government paper at a Selic near 14%. As the easing cycle proceeds, that line falls arithmetically with no operational cause. An investor who buys this alongside banks as a way to own the Brazilian easing cycle has bought the one financial whose earnings the cycle reduces — and because the underwriting operation may improve at the same time, the deterioration is easy to miss in a headline number.',
        requires: [
          'Selic continues to decline through the forecast period',
          'Reserves remain invested predominantly in floating-rate government securities',
        ],
        breaks: [
          'Underwriting growth in volume and margin large enough to offset the financial result',
          'The easing cycle stalls, holding the float return at current levels',
        ],
        modelLink: [
          { assumption: 'Financial result on float', note: 'Model the financial result off the Selic path explicitly and separately from underwriting. Blending them hides the entire thesis.' },
          { assumption: 'Net income bridge', note: 'Underwriting profit and investment income should be forecast as two lines with different drivers.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50% (May 2026)', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
      { label: 'InfoMoney — state-controlled companies, elections and dividends in 2026', url: 'https://www.infomoney.com.br/onde-investir/dividendos-estatais-efeito-eleicoes-2026/' },
      { label: 'Farm Policy News — farm income to fall in 2026', url: 'https://farmpolicynews.illinois.edu/2026/02/farm-income-to-fall-in-2026-despite-hefty-govt-payments/' },
    ],
  },

  {
    ticker: 'PSSA3',
    sector: 'Financials',
    scope: 'BRAZIL',
    headline:
      'A family-controlled insurer whose real asset is an affiliated broker network, competing in motor insurance where the loss ratio is set by vehicle theft, parts inflation and how disciplined the competition chooses to be.',
    howItEarns: [
      {
        heading: 'Motor insurance underwriting, plus everything sold alongside it',
        body:
          'Automobile insurance is the core, with home, life, consortium, health and financial services cross-sold to the same customer. Underwriting profit is the premium less claims and acquisition cost; the cross-sold products raise revenue per client without a proportionate rise in acquisition spend, which is where the return above a monoline motor insurer comes from.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The float, again, and the same rate sensitivity',
        body:
          'Premiums collected ahead of claims are invested largely in government securities, so a high Selic contributes materially to reported earnings. As with any Brazilian insurer, underwriting result and financial result must be forecast separately or the rate cycle will be mistaken for operating performance.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the founding family through a holding structure, with a strategic partnership in place with a large private bank covering distribution of specific product lines and a substantial free float alongside.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the family holding a controlling block.',
      relatedPartyExposure: [
        'An affiliated broker network distributes the company\'s products, and the commission terms are related-party economics',
        'The bank partnership creates a counterparty that is also a distributor and a shareholder in parts of the business',
        'Family control means strategy is set by owners with a long horizon and concentrated exposure',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'Insurance regulator supervision of reserves and solvency capital',
        'Published related-party disclosures on brokerage and distribution agreements',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Long-tenured family control in a business that rewards patience',
        body:
          'Motor insurance punishes anyone chasing growth: undercutting the market wins share and then produces claims. A controlling family with a multi-decade horizon has consistently chosen to lose share rather than write unprofitable premium, which is exactly the behaviour an outside shareholder should want and the opposite of what quarterly incentives usually produce.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The broker network is an advantage and a related party at once',
        body:
          'Distribution through affiliated brokers gives reach and loyalty that direct channels do not. It also means a large cost line is paid to parties connected to the controller, and the arm\'s-length question is legitimate even where the arrangement is commercially sound.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Independent broker loyalty built over decades',
        mechanism:
          'Brazilian motor insurance is sold by brokers who choose which insurer to place with. Service quality, claims speed and commission consistency determine that choice, and a reputation for paying claims without argument takes decades to build and a single bad year to lose.',
        evidence: 'Consistently high renewal rates and broker placement share in motor insurance across cycles.',
        erodedBy: 'Direct and digital distribution reaching customers without a broker, and aggregators turning the purchase into a price comparison.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Claims and pricing data on the same vehicles and drivers',
        mechanism:
          'Decades of loss experience by vehicle model, region and driver profile allow pricing that a new entrant cannot match without buying the losses first.',
        evidence: 'Loss ratios consistently below the market average in the motor segment.',
        erodedBy: 'Telematics and connected-vehicle data available to any entrant, which substitutes for accumulated history.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Conservative reserving, high distributions, and a willingness to shrink the motor book when pricing is irrational. Expansion has been into adjacent products sold to existing customers rather than into new risks or geographies.',
      good: [
        'Repeatedly ceding motor share rather than matching underpriced competition, then regaining it when the market repriced',
        'Cross-selling into home, life and consortium, raising revenue per customer at low incremental acquisition cost',
      ],
      bad: [
        'Slow to build direct and digital distribution, leaving the company dependent on a broker channel that is being disintermediated elsewhere in the world',
        'Financial services and consortium ventures that have not earned returns comparable to the insurance operation',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Parts inflation and vehicle theft are the underwriting cycle',
        body:
          'Motor claims cost is driven by replacement parts prices — largely imported and currency-linked — and by theft rates. Neither follows the general inflation index the premium is repriced against, so the loss ratio can deteriorate while the economy looks fine.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Falling rates reduce the float contribution here too',
        body:
          'Like every Brazilian insurer, a declining Selic shrinks investment income. Unlike the bancassurance model, this company has a genuine underwriting operation that can offset it if pricing discipline holds across the market.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'A price war in motor insurance',
        body:
          'Capacity is not scarce and a competitor wanting share can always cut price. The market has repeatedly gone through periods where discipline broke, and the participant that holds price loses volume while the one that cuts it loses money.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Broker disintermediation',
        body:
          'The moat is a distribution channel. Aggregators and direct digital channels have eroded exactly this advantage in other markets, and the company has been slow to build an alternative.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'pssa3-discipline',
        title: 'Underwriting discipline is the whole edge, and this owner has demonstrated it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'In a line where capacity is abundant and the product is a commodity, the only durable advantage is refusing to write business at the wrong price. This company has a documented record of ceding motor share through soft markets and regaining it when competitors repriced, which is the behaviour a controlling family with concentrated exposure produces and a share-hungry management does not. Combined with below-market loss ratios and a broker channel that places on service rather than price, that is a genuine and unglamorous edge.',
        requires: [
          'Market pricing discipline holds well enough that holding price does not mean losing the book',
          'Loss ratios stay below market as parts inflation and theft are repriced into premiums',
          'Cross-sold products continue raising revenue per customer',
        ],
        breaks: [
          'A sustained price war that makes disciplined pricing uncompetitive rather than merely smaller',
          'Parts inflation or theft rising faster than premiums can be repriced',
          'Broker channel share eroding to direct and aggregator distribution',
        ],
        modelLink: [
          { assumption: 'Underwriting loss ratio', note: 'Model the combined ratio explicitly and separately from investment income. This thesis is entirely about the former.' },
          { assumption: 'Revenue driver — policies in force', note: 'The bull case accepts flat or falling volumes in a soft market. Do not model share gain and discipline together.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'pssa3-float-and-channel',
        title: 'Two structural headwinds arriving together: the float and the broker',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'A material share of reported earnings is investment income on float at a Selic near 14%, and the easing cycle removes it arithmetically. At the same time the competitive moat is an independent broker network — the precise channel that aggregators and direct digital distribution have disintermediated in every developed insurance market. Neither headwind is cyclical, the company has been slow to build an alternative channel, and a valuation resting on the historical return on equity is resting on a float contribution that is going away.',
        requires: [
          'Selic continues falling, compressing the financial result',
          'Digital and aggregator distribution continues gaining share of the purchase decision',
        ],
        breaks: [
          'Underwriting margin expansion large enough to replace the lost investment income',
          'A successful direct channel built at scale without cannibalising broker loyalty',
        ],
        modelLink: [
          { assumption: 'Financial result on float', note: 'Drive investment income off the Selic path rather than holding it at the historical level.' },
          { assumption: 'Acquisition cost ratio', note: 'Channel shift shows up as commission and acquisition cost, not as lost revenue.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
      { label: 'Banco Central do Brasil', url: 'https://www.bcb.gov.br/en' },
    ],
  },
];
