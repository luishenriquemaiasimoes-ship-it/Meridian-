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
];
