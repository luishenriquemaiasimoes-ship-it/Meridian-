import type { CompanyQualitative } from '../types';

export const MATERIALS: CompanyQualitative[] = [
  {
    ticker: 'VALE3',
    sector: 'Materials',
    scope: 'BRAZIL',
    headline:
      'A first-quartile iron ore producer with genuinely dispersed ownership and no shareholders\' agreement — now facing the one competitor that attacks the part of its advantage cost position does not protect.',
    howItEarns: [
      {
        heading: 'Cost position plus a grade premium, not price',
        body:
          'Vale sells at the index like everyone else. Its earnings come from two spreads: a cash cost per tonne in the first quartile of the global curve, and a quality differential earned above the 62% Fe benchmark because higher-grade ore raises blast furnace productivity. Owning the railways and ports between mine and ship is what makes the first spread durable — the logistics are frequently worth more than the mine.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Energy transition metals are a second business, not a hedge',
        body:
          'Nickel and copper are around a fifth of revenue at materially lower margins than iron ore. They diversify the revenue line and dilute the return, which is the trade the company has chosen. Capital allocation in 2026 was roughly $1.0 billion to growth against $4.5 billion to maintenance and technology — an explicit choice to optimise what exists rather than to build.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'A genuine corporation with diluted control. No shareholders\' agreement has been in force since 2020, and no single holder has a majority — the register is pension funds, index managers, a Japanese trading house and a very large free float.',
      voting:
        'One class of ordinary shares on the Novo Mercado, B3\'s highest governance tier, with an NYSE ADR and a Latibex listing alongside.',
      relatedPartyExposure: [
        'Government-linked pension funds are among the largest holders and have exercised influence on board composition and on the chief executive',
        'The 2025 chief executive change followed strategic disagreement and pressure from large shareholders including government-linked entities',
        'Political interest in a company of this national significance recurs independently of the shareholder register',
      ],
      minorityProtections: [
        'Novo Mercado listing rules: one share one vote, tag-along, minimum free float',
        'Adherence to the Brazilian Code of Corporate Governance, reported 30 July 2026',
        'No controlling block and no shareholders\' agreement, so board seats are contested rather than allocated',
        'US reporting obligations through the NYSE listing',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'Dispersed ownership cuts both ways',
        body:
          'The absence of a controller removes the classic Brazilian minority risk of value being extracted by a parent. It replaces it with a different one: a board without an anchor shareholder is more exposed to whoever organises a majority in a given year, and in 2025 that produced a chief executive replacement driven by shareholder pressure rather than by performance against plan. Predictability of strategy is the cost of dispersion.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Legacy dam liabilities are a governance question, not only a provision',
        body:
          'The settlements arising from the Mariana and Brumadinho failures are large, long-dated and revised over time. They sit in provisions and are genuinely uncertain in amount, which means a material part of equity value depends on negotiation outcomes rather than on operations. Any valuation that treats the provision as a fixed number is understating the range.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Tier-one ore bodies with integrated logistics',
        mechanism:
          'The Northern System ore is naturally high grade and the company owns the railway and port that move it. A competitor cannot buy either; both are geology and decades of infrastructure.',
        evidence: 'Cash cost per tonne in the first quartile of the global cost curve, sustained across price cycles.',
        erodedBy: 'A new low-cost, high-grade system entering the seaborne market — which is exactly what Simandou is.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Blending and product flexibility',
        mechanism:
          'A portfolio of grades plus blending capacity at Asian ports lets the company sell to the specification each mill wants rather than a single product, capturing value from the spread between grades instead of from one premium.',
        evidence: 'Strategy explicitly shifted toward portfolio flexibility, blending and selective use of third-party material rather than defending every premium tonne.',
        erodedBy: 'A compressed grade spectrum: if high-grade supply becomes abundant, there is less spread to arbitrage.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'The current posture is deliberately unambitious on growth: maintenance and technology over greenfield, with a five-year roadmap toward 360 million tonnes of capacity that is a recovery of lost volume rather than an expansion beyond the prior peak. For a commodity producer in a softening market, spending four and a half times more on the existing base than on growth is the correct instinct.',
      good: [
        'Returning capital through dividends and buybacks rather than approving supply into a weakening market',
        'Prioritising the existing asset base and productivity over greenfield tonnes in the 2026 capital plan',
        'Removing the shareholders\' agreement and moving to Novo Mercado, which genuinely improved minority standing',
      ],
      bad: [
        'A base metals portfolio assembled at high multiples that has yet to earn a return comparable to the iron ore business',
        'Tailings management failures whose cost dwarfs any capital allocation decision the company has made',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Simandou hits the premium, not the cost position',
        body:
          'Vale is safe from being out-competed on cost — it is already at the bottom of the curve. What is exposed is the grade premium, because Simandou ships roughly 65% Fe material into the same market. Volumes are ramping from a small base, around 16 million tonnes expected in 2026 against a system designed for 120 million tonnes, and the ramp has slipped. The threat is real, dated and gradual rather than immediate.',
        basis: 'REPORTED',
      },
      {
        heading: 'Chinese steel demand is the volume question the company cannot influence',
        body:
          'Chinese crude steel output fell about 4% year on year in early 2026 and portside inventories reached a record 179.5 million tonnes. Vale can optimise mix and cost against that but cannot change it, which is why the honest framing is that half this investment case is a view on China held by the analyst, not by the company.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Grade premium compression as new high-grade supply lands',
        body:
          'The quality differential is a meaningful part of realised price per tonne and it is the most directly exposed line to Simandou. Unlike a cost disadvantage, it cannot be fixed operationally.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Dam and environmental liabilities being revised upward',
        body:
          'Settlement amounts have been renegotiated before. A revision is a direct transfer from equity value, arrives without warning, and is not correlated with the commodity cycle that otherwise drives the shares.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Political attention to a nationally significant company',
        body:
          'Dispersed ownership does not insulate the company from pressure over pricing, employment, domestic processing or board composition, and 2026 is a Brazilian election year.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'vale-cost-curve',
        title: 'The cost position survives the cycle that closes the marginal tonne',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'In a price-taking industry the first-quartile producer is profitable at the price that shuts the fourth quartile, and those closures are what eventually turn the cycle. A softening iron ore market is therefore not symmetrically bad for Vale: it compresses near-term earnings and removes competing supply. The argument is not that prices are going up — it is that the company survives a price at which others cannot, and emerges with more share.',
        requires: [
          'Cash cost per tonne stays in the first quartile through the downturn',
          'Currency does not move against the company in a way that erases the local-cost advantage',
          'Volumes are maintained toward the 360 Mtpa roadmap without an aggressive capex commitment',
        ],
        breaks: [
          'Cost per tonne rises toward the curve\'s middle, through inflation, stripping ratios or logistics',
          'The company responds to price weakness by approving growth capex rather than holding discipline',
          'High-cost supply proves stickier than expected because it is state-supported rather than commercial',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per tonne', note: 'The bear case for price does not need to change the volume driver; hold volumes and cut realised price per tonne.' },
          { assumption: 'EBITDA margin path', note: 'Test margin at a price that closes fourth-quartile supply rather than at the strip.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'vale-premium-compression',
        title: 'The grade premium is the part of the moat Simandou actually takes',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Vale\'s realised price sits above the 62% Fe benchmark because its ore is better. Simandou introduces roughly 65% Fe material into the same seaborne market, which adds supply precisely where that differential is earned. The company\'s own strategic response — portfolio flexibility and blending rather than defending every premium tonne — is a reasonable adaptation and also an acknowledgement that the premium is not defensible. A model carrying the historical realised premium into the terminal year is assuming away the single most concrete competitive development in this industry in a decade.',
        requires: [
          'Simandou ramps toward its designed capacity over the next several years',
          'The high-grade premium narrows rather than being sustained by direct-reduction demand growing in step',
          'Vale\'s blending strategy captures less value than the premium it replaces',
        ],
        breaks: [
          'Simandou\'s ramp continues to slip materially, delaying the supply for years',
          'Decarbonising steelmaking raises high-grade demand fast enough to absorb the new supply',
          'Blending and third-party sourcing prove to earn a comparable spread to the grade premium',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per tonne', note: 'Reduce the realised price per tonne relative to the benchmark to model premium compression without touching volumes.' },
          { assumption: 'Terminal growth', note: 'A terminal value built on the historical premium is the specific thing this thesis disputes.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'vale-governance',
        title: 'Dispersed control is a real improvement, and it has a price',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'Removing the shareholders\' agreement and listing on Novo Mercado genuinely improved minority standing — this is not a company where a parent can extract value through related-party terms. The cost is strategic volatility: a board with no anchor holder changed the chief executive in 2025 under shareholder pressure, and government-linked pension funds remain among the largest holders. The discount an investor applies should be for unpredictability of strategy, not for expropriation risk, and those are different discounts.',
        requires: [
          'No controlling block reassembles',
          'Board composition continues to be contested rather than allocated by agreement',
        ],
        breaks: [
          'A new shareholders\' agreement or a coordinated block emerges',
          'Government-linked holders convert influence into direction on pricing, investment or domestic processing',
        ],
        modelLink: [
          { assumption: 'Cost of equity — country and company premium', note: 'Strategic unpredictability belongs in the discount rate explicitly, not hidden in a lower terminal growth rate.' },
          { assumption: 'Dividend payout', note: 'Distribution policy at a board without an anchor holder is less predictable than the historical average suggests.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Vale — governance and shareholder protections report (July 2026)', url: 'https://www.theglobeandmail.com/investing/markets/stocks/VALE-N/pressreleases/3595835/vale-s-a-details-governance-compliance-and-shareholder-protections-in-july-2026-report/' },
      { label: 'Vale — governance', url: 'https://www.vale.com/esg/governance' },
      { label: 'Vale — 2025 board governance actions and 2026 priorities (6-K)', url: 'https://www.stocktitan.net/sec-filings/VALE/6-k-vale-s-a-current-report-foreign-issuer-4d25be9c8532.html' },
      { label: 'Discovery Alert — Vale\'s 2026 iron ore technology investment strategy', url: 'https://discoveryalert.com/vales-iron-ore-technology-investment-2026/' },
      { label: 'Wood Mackenzie — Simandou iron ore 2026', url: 'https://www.woodmac.com/press-releases/simandou-iron-ore-2026/' },
      { label: 'Investing.com — Vale upgraded as Simandou delays keep iron ore prices higher', url: 'https://ca.investing.com/news/stock-market-news/vale-upgraded-as-simandou-delays-to-keep-iron-ore-prices-higher-4358784' },
    ],
  },

  {
    ticker: 'SUZB3',
    sector: 'Materials',
    scope: 'BRAZIL',
    headline:
      'The lowest-cost pulp producer in the world, controlled by two families, which has spent the last cycle converting that cost advantage into capacity rather than into distributions.',
    howItEarns: [
      {
        heading: 'A cost advantage grown in the ground',
        body:
          'Eucalyptus in Brazil reaches harvest in six to seven years against more than twenty in the northern hemisphere. That biological fact, plus plantation scale near the mills, produces a cash cost per tonne no competitor can match. The company sells a commodity at the index; the entire return is the gap between that index and a cost base set by geography.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Paper and tissue are a partial hedge, not a business of equal quality',
        body:
          'Converting pulp into paper, packaging and tissue captures a downstream margin and dampens the pulp cycle, because paper prices move later and less. It is a smaller and lower-return activity than the pulp line, and its main value is that it gives the company somewhere to put fibre when pulp prices are poor.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Family-controlled through a shareholders\' agreement between the Feffer and Votorantim (Ermírio de Moraes) groups, formed when Suzano acquired Fibria. Together they hold a controlling block with a large institutional and foreign free float alongside.',
      voting: 'Ordinary shares on the Novo Mercado, with an NYSE ADR. One share one vote within a controlling agreement.',
      relatedPartyExposure: [
        'Two family groups coordinating through an agreement decide strategy, including the pace of capacity expansion that dominates the cash flow profile',
        'Controlling shareholders with long horizons may accept lower near-term returns for scale in a way a dispersed register would not',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'NYSE listing and its disclosure obligations',
        'A large, active foreign institutional base that has historically pushed back on capital allocation',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Control is stable and the interest is scale',
        body:
          'The controlling families are industrialists rather than financial owners, and the record shows a consistent preference for building the lowest-cost asset base over returning cash. That has generally served minority holders because the projects have been genuinely accretive — but it is a preference, and an investor who wants distributions is not aligned with the controller.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Dollar debt against dollar revenue, reported in reais',
        body:
          'Revenue is dollar-linked and so is most of the debt, which is the correct natural hedge. The consequence is that reported leverage in reais swings with the exchange rate even when nothing economic changes, and reported net income carries large unrealised exchange results. Reading either without adjusting is reading the currency, not the company.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Forest-to-mill cost position',
        mechanism:
          'Short rotation cycles, plantation density near the mills, and single-line mills at world scale give a cash cost per tonne structurally below northern-hemisphere producers. None of it can be replicated without the climate.',
        evidence: 'Sustained position at the bottom of the global pulp cash cost curve across price cycles.',
        erodedBy: 'Logistics cost inflation, plantation disease, or a shift in demand toward fibre types Brazil does not grow.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The company builds. A new world-scale mill roughly every cycle, funded with dollar debt, has taken the company from a Brazilian producer to the global cost leader — and has also meant leverage peaks exactly when pulp prices trough, because the capex commitment is fixed and the revenue is not.',
      good: [
        'The Fibria combination, which consolidated the two lowest-cost producers and gave the merged company genuine influence over market supply',
        'Sequential world-scale mill projects delivered near budget, each lowering the average cost per tonne',
      ],
      bad: [
        'Timing: the largest capital commitments have repeatedly coincided with the top of the pulp cycle, so the debt is taken on before the price falls',
        'Exploratory interest in acquiring assets outside the low-cost fibre thesis, where the company has no structural advantage',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'A tightening market that cannot pass the price on',
        body:
          'Global pulp operating rates are forecast at 91% for 2026 and 2027, above the 90% level where pricing power conventionally returns to producers. The offset is that downstream paper and board markets are oversupplied, so the customer cannot absorb a higher pulp price. A tight pulp market with a weak paper market caps the realisable increase.',
        basis: 'REPORTED',
      },
      {
        heading: 'The cost leader is the one that can add supply',
        body:
          'Because it sits at the bottom of the curve, Suzano can commission capacity that is profitable at prices which would not justify a northern-hemisphere project. That is an advantage for the company and a structural reason the pulp cycle keeps being capped — it is the marginal supplier of new supply as well as the lowest-cost producer.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Leverage meeting a pulp trough',
        body:
          'Dollar debt against a dollar commodity is the right structure, but the absolute quantum matters when the price falls and a mill is mid-construction. This is the recurring shape of stress at this company and it is a balance-sheet risk rather than an operating one.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Chinese demand and inventory behaviour',
        body:
          'China is the marginal buyer of market pulp and its buyers destock aggressively. Price can fall well below the level implied by operating rates for several quarters purely on inventory, with no change in underlying consumption.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'suzb3-cost-leader',
        title: 'Cost leadership in a commodity is the only durable advantage, and this is the cleanest example of it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Suzano does not need the pulp price to rise. It needs the cost curve to stay shaped as it is, which depends on biology and geography rather than on strategy. At the bottom of that curve the company earns through the trough that pushes higher-cost tonnes out, and the closures are what turn the price. The investment case is a cost position, not a commodity forecast — which is a far more defensible thing to underwrite.',
        requires: [
          'Cash cost per tonne holds its position at the bottom of the global curve',
          'Capex discipline through the trough so the balance sheet is not the binding constraint',
          'Operating rates stay near the level where high-cost supply is unprofitable',
        ],
        breaks: [
          'Logistics or energy cost inflation specific to Brazil narrows the gap to northern producers',
          'A major capital commitment is made near the cycle peak and funded into a downturn',
          'Plantation disease or climate damage raises the delivered cost of fibre',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per tonne', note: 'Test a price low enough to close fourth-quartile supply and see whether this company is still profitable. That is the thesis.' },
          { assumption: 'Capex path', note: 'The bull case depends on capex fading toward maintenance rather than a new mill being sanctioned into the trough.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'suzb3-downstream-cap',
        title: 'Tight pulp does not help if the paper market cannot pay',
        side: 'BEAR',
        weight: 'SUPPORTING',
        rationale:
          'The bull case on pulp pricing rests on operating rates above 90%. But the mechanism by which a high operating rate becomes a higher price requires the buyer to pass it downstream, and paper and board markets are oversupplied with rising input and energy costs of their own. Producers can hold the line on price and lose volume, or move volume and not get the price. A model that applies the historical relationship between operating rates and pulp price is assuming a downstream market that does not currently exist.',
        requires: [
          'Downstream paper and board oversupply persists',
          'Pulp buyers continue to resist increases by drawing inventory',
        ],
        breaks: [
          'Paper and board capacity rationalises, restoring the customer\'s ability to absorb price',
          'Demand growth in tissue and packaging outpaces the downstream capacity overhang',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price growth', note: 'Hold price growth below the rate implied by operating rates to express this.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Fastmarkets — Critical pulp industry insights: 2026 outlook and supply trends', url: 'https://www.fastmarkets.com/insights/critical-pulp-industry-insights-2026-outlook-and-supply-trends/' },
      { label: 'FRED — Producer price index, wood pulp', url: 'https://fred.stlouisfed.org/series/WPU0911' },
    ],
  },

  {
    ticker: 'GGBR4',
    sector: 'Materials',
    scope: 'BRAZIL',
    headline:
      'A family-controlled steelmaker whose North American mini-mills have become the better half of the company, while the Brazilian operation absorbs whatever import pressure the trade regime allows.',
    howItEarns: [
      {
        heading: 'Two steel businesses with different physics',
        body:
          'Long steel in Brazil is made from scrap and pig iron in electric furnaces and sold into construction, competing against imports. The North American operation is a mini-mill business selling into a market with trade protection and better spreads. The consolidated margin is mostly a weighted average of two regional spreads, and North America has carried it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The metal spread, not the steel price',
        body:
          'An electric-furnace producer earns the gap between the steel price and the scrap price. Both move together, so the headline steel price says less about earnings than the spread does — and a falling steel price with a faster-falling scrap price is a good quarter.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'Controlled by the Johannpeter family through Metalúrgica Gerdau, a listed holding company above the operating company.',
      voting:
        'A two-tier structure: preferred shares (GGBR4) carry the liquidity and no vote, ordinary shares carry control, and a listed holding sits above both. Economic exposure and voting power are deliberately separated.',
      relatedPartyExposure: [
        'A listed holding company above the operating company means two sets of minority shareholders with different interests in the same cash flow',
        'The holding structure historically traded at a discount to its stake, which is a standing signal about how the market prices the arrangement',
        'Preferred holders have economic exposure with no vote on capital allocation',
      ],
      minorityProtections: [
        'B3 Level 1 disclosure obligations and NYSE ADR reporting',
        'Preferred share dividend priority under Brazilian corporate law',
        'Simplification of the holding structure has been pursued, reducing the layers over time',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The holding discount is the governance cost, quantified',
        body:
          'When a listed holding company owns a listed operating company, the market usually values the holding below its stake. That gap is the market pricing the structure — the extra layer, the reduced control, the tax on moving cash upward. It is one of the few cases where a governance concern has a directly observable price.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Family control has been an advantage in the downturns',
        body:
          'The record through Brazilian steel cycles is one of relatively conservative leverage and willingness to close capacity rather than defend volume. A family with generational horizons and a concentrated position has behaved more cautiously than a professionally managed peer might, and in a cyclical commodity that is worth something.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'North American mini-mill position behind trade protection',
        mechanism:
          'Scrap-based mini-mills close to their end markets, in a jurisdiction that restricts imports, earn a spread that is not competed away by seaborne supply.',
        evidence: 'The North American segment has delivered materially better margins than the Brazilian operation across recent years.',
        erodedBy: 'Trade liberalisation, or domestic capacity additions that compete the regional spread away from the inside.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The direction of travel has been away from Brazil and toward North America and specialty steels, which is the correct reading of where the returns are. Leverage has been managed down from prior cycles, and the company has been willing to divest and close rather than hold subscale assets.',
      good: [
        'Reallocating capital toward the North American operation, which earns the better spread',
        'Reducing leverage through the last cycle instead of funding volume',
        'Closing and divesting subscale plants rather than defending production',
      ],
      bad: [
        'A historical footprint assembled across too many geographies, several of which were later exited at a loss',
        'A holding structure that persisted long after its rationale, carrying a visible market discount',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Brazilian long steel is the import-exposed end of the sector',
        body:
          'With Chinese steel production still large and export-oriented, Brazilian domestic producers face import pressure whenever the trade regime allows it. The company cannot control this and the sector\'s Brazilian margin is effectively set by how much protection is in force in a given year.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Scrap-based production is structurally advantaged in decarbonisation',
        body:
          'An electric-furnace, scrap-fed producer emits a fraction of a blast furnace per tonne. As carbon border mechanisms and customer procurement rules tighten, this is a real and durable relative advantage over integrated competitors — on a timescale that belongs in a terminal value rather than a forecast.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Import penetration in the Brazilian market',
        body:
          'The domestic spread depends on trade measures that are political and revisable. A relaxation transmits directly into the Brazilian segment margin with no operational offset available.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'North American spread normalisation',
        body:
          'The segment carrying consolidated earnings is earning an unusually good spread behind trade protection. If that normalises, the better half of the company gets worse and the weaker half does not improve.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'ggbr4-north-america',
        title: 'This is a North American mini-mill company with a Brazilian legacy attached',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The segment disclosure shows where the earnings come from, and it is not Brazil. Valuing the whole company on a Brazilian steel multiple prices the better business at the worse business\'s rating. A sum of the parts that rates the North American operation against its US peers and the Brazilian operation against its own reality produces a different answer — and the capital plan is deliberately moving weight toward the better half.',
        requires: [
          'North American trade protection persists in some form',
          'Capital continues to be allocated toward the segment that earns the better spread',
          'The Brazilian operation does not consume the group\'s cash flow',
        ],
        breaks: [
          'US trade measures are relaxed and the regional spread compresses toward the seaborne price',
          'Domestic US capacity additions compete the spread away',
          'Brazilian operations require sustained investment that the segment cannot fund itself',
        ],
        modelLink: [
          { assumption: 'Segment margins', note: 'The thesis is a sum of the parts: rate the segments separately rather than applying one consolidated multiple.' },
          { assumption: 'EBITDA margin path', note: 'The consolidated margin is a weighted average of two regional spreads; model them separately and reweight.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'ggbr4-structure',
        title: 'The holding structure is a discount the company can close and has not',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'Two listed layers over one set of assets, with preferred shares carrying the economics and no vote, is a structure the market prices at a discount for good reason. Simplification has progressed but not concluded. For an investor this is neither a bull nor a bear case; it is a reason the shares can be cheap on fundamentals and stay cheap, and it should be in the discount rate rather than expected to resolve.',
        requires: [
          'The structure persists',
          'Preferred shares remain the liquid instrument for minority investors',
        ],
        breaks: [
          'Full consolidation into a single share class on Novo Mercado, which would remove the discount rather than argue about it',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'A structural governance discount belongs in the discount rate explicitly, where it can be argued with, not buried in the terminal growth rate.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ING Think — iron ore and steel market outlook', url: 'https://think.ing.com/articles/iron-ore-heads-for-a-softer-year' },
    ],
  },

  {
    ticker: 'CSNA3',
    sector: 'Materials',
    scope: 'BRAZIL',
    headline:
      'An integrated steelmaker that is also a miner, a cement producer and a logistics owner, controlled by one family — a conglomerate whose parts are worth arguing about separately because the market rates them as one.',
    howItEarns: [
      {
        heading: 'Integrated steel, plus a mining business that funds it',
        body:
          'Blast-furnace flat steel sold into Brazilian industry and construction, fed partly by the company\'s own iron ore. The mining arm is a separate listed vehicle and has frequently been the more profitable asset, which means consolidated steel margins are subsidised by a business that does not need the steel mill to exist.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Cement and logistics are real assets, not decorations',
        body:
          'Acquired cement capacity and owned railway and port stakes generate cash with different cyclicality from steel. This is what makes the company a genuine sum-of-the-parts case rather than a steel producer with distractions — and also what makes a single EBITDA multiple on it close to meaningless.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'Controlled by Benjamin Steinbruch and family through a holding structure, with a substantial free float alongside.',
      voting: 'Ordinary shares, with the controlling block holding a clear majority of the votes.',
      relatedPartyExposure: [
        'A separately listed mining subsidiary creates two sets of minority holders with claims on related cash flows and intercompany ore pricing between them',
        'The controlling shareholder has historically driven acquisition-led diversification, which minority holders have funded but not chosen',
        'Leverage decisions have been taken with a controller whose exposure is concentrated and long-dated',
      ],
      minorityProtections: [
        'B3 listing obligations and NYSE ADR reporting',
        'Separate listing of the mining arm, which at least makes intercompany terms observable',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Acquisition-led strategy with a levered balance sheet',
        body:
          'The company has grown by buying — cement, logistics, energy — often while carrying leverage above its steel peers. That has repeatedly created stress in downturns and has required asset sales and subsidiary listings to relieve. The strategy is the controller\'s, and the refinancing risk is shared.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Intercompany ore pricing is where two minorities meet',
        body:
          'When a listed parent buys ore from its listed subsidiary, the transfer price allocates profit between two groups of minority shareholders. Both sets are entitled to ask whether the price is arm\'s length, and the answer is not obvious from either set of statements.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Vertical integration from ore to mill to port',
        mechanism:
          'Owning the ore, the mill and a share of the logistics to move both removes third-party margin and insulates input cost. Few steelmakers anywhere own the whole chain.',
        evidence: 'Mining segment profitability that has repeatedly exceeded the steel segment, retained within the group.',
        erodedBy: 'Iron ore price weakness, which removes the subsidy and exposes the steel operation on its own economics.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A record of buying assets across sectors with debt, then selling stakes or listing subsidiaries to deleverage when the cycle turns. The assets acquired have often been decent; the timing and the funding have been the problem.',
      good: [
        'Listing the mining arm, which crystallised value the consolidated multiple was not giving',
        'Building genuine cement scale at a cost below replacement',
      ],
      bad: [
        'Leverage carried above peers into multiple downturns, forcing asset sales at the wrong time',
        'Diversification into sectors where the company has no cost or scale advantage',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Exposed to the same Chinese steel weakness, with an ore hedge',
        body:
          'Chinese output down about 4% year on year and record portside inventories pressure both the steel price and the ore price. For an integrated producer that sells ore as well, the two exposures are partly offsetting but both point the same way in 2026.',
        basis: 'REPORTED',
      },
      {
        heading: 'Grade premium compression reaches the mining arm too',
        body:
          'Simandou\'s high-grade supply affects any producer earning a quality differential. The mining subsidiary is smaller and less advantaged than the sector leader, so it has less cushion.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Refinancing at a leverage level above peers',
        body:
          'The recurring shape of trouble here is debt maturing into a weak steel market. It has been managed before, each time by selling something.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Conglomerate discount that does not close',
        body:
          'The parts may be worth more than the whole indefinitely. A sum-of-the-parts valuation is only realisable if the controller chooses to realise it, and this controller has preferred to hold.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'csna3-sotp',
        title: 'The parts are worth more than the multiple, and the mining arm proves it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Steel, mining, cement and logistics have different margins, different cycles and different peer multiples. Applying one consolidated EBITDA multiple averages a first-rate mining asset with a cyclical steel mill and a cement business, and the average flatters neither. The separate listing of the mining subsidiary provides an observable market value for one part, which makes the sum-of-the-parts arithmetic testable rather than theoretical.',
        requires: [
          'Segment disclosure remains sufficient to value the parts separately',
          'The mining stake retains a market value close to its listed price',
          'Leverage does not force a sale of the best asset at the worst time',
        ],
        breaks: [
          'A funding squeeze forces disposal of the mining stake below its value',
          'The controller shows no intention of ever narrowing the discount',
          'Iron ore weakness removes the mining arm\'s contribution and with it the sum-of-the-parts case',
        ],
        modelLink: [
          { assumption: 'Segment margins', note: 'This thesis is a sum of the parts. Value each segment against its own peers rather than applying a single consolidated multiple.' },
          { assumption: 'Net debt', note: 'The bridge from enterprise to equity value is where the leverage either does or does not consume the discount.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'csna3-leverage',
        title: 'Leverage is the mechanism by which this company\'s good assets get sold cheaply',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The pattern has repeated: acquire with debt, hit a downturn, sell or list an asset to deleverage. Each cycle the assets sold are the ones that were easiest to sell, which tends to mean the best ones. For a minority holder the risk is not insolvency — it is that the sum-of-the-parts value keeps being realised by the company at the wrong moment and for the wrong reason.',
        requires: [
          'Leverage stays above the level at which a steel downturn is comfortably absorbed',
          'Steel and ore prices remain weak enough to pressure coverage',
        ],
        breaks: [
          'Sustained deleveraging to a level where no forced sale is plausible',
          'A commodity recovery that restores coverage before any maturity wall',
        ],
        modelLink: [
          { assumption: 'Debt schedule and cost of debt', note: 'Model the maturity profile explicitly; the risk is a refinancing date meeting a trough, not an average leverage ratio.' },
          { assumption: 'Covenant headroom', note: 'Test net debt to EBITDA against covenant levels at a trough EBITDA rather than a mid-cycle one.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ING Think — iron ore heads towards a softer year', url: 'https://think.ing.com/articles/iron-ore-heads-for-a-softer-year' },
      { label: 'Wood Mackenzie — Simandou iron ore 2026', url: 'https://www.woodmac.com/press-releases/simandou-iron-ore-2026/' },
    ],
  },

  {
    ticker: 'USIM5',
    sector: 'Materials',
    scope: 'BRAZIL',
    headline:
      'A flat-steel producer serving Brazilian industry, governed by a shareholders\' agreement between a Japanese steelmaker and an Argentine group — a structure that has produced open boardroom conflict.',
    howItEarns: [
      {
        heading: 'Flat steel for industry, exposed to imports at every price',
        body:
          'Rolled and coated flat products sold to automotive, white goods and capital goods manufacturers. Industrial customers buy on price and specification and can switch to imports, so the realised price tracks the import parity price rather than domestic cost. Volume follows Brazilian industrial production, which has been the weak part of the economy.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Captive mining reduces the input cost but not the price risk',
        body:
          'Owned iron ore lowers the cost per tonne and adds a small merchant ore business. It improves the cost position without giving any influence over the steel price, so it dampens the cycle rather than changing the character of the business.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled through a shareholders\' agreement between Nippon Steel and the Ternium/Techint group, with the two blocks holding the ordinary shares and a large free float in the preferred line.',
      voting:
        'Preferred shares (USIM5) carry the liquidity and no vote; control sits with the ordinary shares held under the agreement. Minority economic exposure is separated from any say in how the company is run.',
      relatedPartyExposure: [
        'Two industrial controllers who are also global competitors in steel, with their own commercial interests in the same markets',
        'Governance disputes between the blocks have reached public conflict over board and management appointments',
        'Preferred holders bear the full economics of a strategy they have no vote on',
      ],
      minorityProtections: [
        'Preferred dividend priority under Brazilian corporate law',
        'B3 disclosure requirements',
        'Public visibility of the disputes themselves, which has occasionally forced resolution',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Two controllers who compete with each other is the core problem',
        body:
          'A shareholders\' agreement works when the parties want the same thing. Here the parties are global steelmakers with their own Brazilian and Latin American interests, and the company\'s strategy is the outcome of their negotiation rather than of a single owner\'s plan. Periods of open dispute have coincided with management turnover and strategic drift, and that history is the reason for a governance discount.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The non-voting structure concentrates the cost on minorities',
        body:
          'Minority capital sits in the preferred line, which has the economics and no vote. When the controlling parties disagree, minority holders absorb the consequences without any mechanism to influence the resolution.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Installed flat-steel capacity with captive ore',
        mechanism:
          'Integrated flat-steel capacity in Brazil is effectively unbuildable at today\'s costs and returns, and owned ore lowers the delivered input cost.',
        evidence: 'A cost position that has allowed the company to survive repeated import cycles that would have closed a non-integrated roller.',
        erodedBy: 'Sustained import penetration at prices below domestic cash cost, which trade policy may or may not prevent.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Largely defensive: blast furnace reline and maintenance spending, capacity idling in downturns, and little expansion. For a company in a structurally difficult position that is the right instinct, but it is also not a growth story under any assumption.',
      good: [
        'Idling capacity rather than producing into a loss during import-driven downturns',
        'Reline investment that preserved the integrated position at a controlled cost',
      ],
      bad: [
        'Long periods of strategic indecision attributable to controller disagreement rather than to markets',
        'Repeated management changes that interrupted whatever plan was in progress',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The most import-exposed position in Brazilian steel',
        body:
          'Flat steel for industrial buyers is the segment where imported material substitutes most easily. With Chinese output still export-oriented, the company\'s realised price is set by trade measures more than by its own cost base.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Brazilian industrial demand is the weak side of a weak consumer',
        body:
          'Automotive and white goods demand depends on consumer credit at rates above 25% for corporates and a record 82% of households carrying debt. The volume outlook is worse than the general economy, not better.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Import penetration without offsetting trade measures',
        body:
          'The single variable that decides the margin is one the company does not control and cannot hedge.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Renewed controller conflict',
        body:
          'The governance history is not settled. Another public dispute would again produce management churn and strategic delay, at minority holders\' expense.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'usim5-optionality',
        title: 'A deep-cyclical option on Brazilian industry and on trade protection',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Integrated flat-steel capacity with captive ore, trading at a fraction of replacement cost, is a levered option on two things recovering: Brazilian industrial production and effective trade protection. Neither requires the company to do anything well. The asymmetry is real because the downside is already reflected — but so is the reason for it, and this is an option rather than a compounding business.',
        requires: [
          'Brazilian industrial demand recovers as rates fall',
          'Trade measures on flat steel are maintained or strengthened',
          'The balance sheet survives the wait without dilution',
        ],
        breaks: [
          'Import protection is relaxed',
          'Industrial demand stays weak through the rate-cutting cycle, breaking the link between credit cost and volume',
          'Capacity requires reline capital the company must raise equity for',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per tonne', note: 'Realised price tracks import parity, so model the price the trade regime allows rather than a domestic cost-plus.' },
          { assumption: 'EBITDA margin path', note: 'The upside case is margin recovery on unchanged volumes; test both separately.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'usim5-governance',
        title: 'Two competing controllers is a permanent discount, not a temporary one',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The company is run by agreement between two global steelmakers who compete with each other, while minority capital sits in a non-voting share class. That is not a problem management can fix, because management is the thing being disputed. Any valuation should carry an explicit governance premium in the discount rate, and an investor should assume the discount persists rather than that a resolution is due.',
        requires: [
          'The shareholders\' agreement structure remains',
          'Minority capital remains in the non-voting line',
        ],
        breaks: [
          'One controller buys out the other, producing a single owner with a single plan',
          'A migration to Novo Mercado with one share class, which would remove the structure rather than argue about it',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Add an explicit governance premium. Stating it makes it arguable; hiding it in a low terminal growth rate does not.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ING Think — iron ore and Chinese steel demand', url: 'https://think.ing.com/articles/iron-ore-heads-for-a-softer-year' },
      { label: 'Itaponews — Brazilian credit cost and household indebtedness', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
    ],
  },

  {
    ticker: 'KLBN11',
    sector: 'Materials',
    scope: 'BRAZIL',
    headline:
      'A paper and packaging company with its own pulp — the most integrated position in Brazilian fibre, controlled by the Klabin family through a long-standing agreement.',
    howItEarns: [
      {
        heading: 'Packaging is the business; pulp is the input it also sells',
        body:
          'Containerboard, kraft paper and corrugated boxes sold into food, agribusiness and consumer goods, made from the company\'s own fibre. Packaging demand follows food and agricultural volumes rather than industrial production, which makes it one of the most defensive revenue lines in the Brazilian market. Surplus pulp is sold at the index.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Integration means the pulp cycle hits the margin in both directions',
        body:
          'When pulp prices are high, the merchant pulp sales earn well and the paper business pays more for its fibre internally. When pulp is weak, the reverse. Integration dampens the swing rather than removing it, and it is why margins here are steadier than at a pure pulp producer.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'Controlled by the Klabin family through a shareholders\' agreement, with a large institutional free float held mostly through the KLBN11 unit.',
      voting:
        'Units combining ordinary and preferred shares provide the liquidity; control rests with the family agreement over the ordinary shares. Unit holders have limited voting influence relative to their economics.',
      relatedPartyExposure: [
        'A long-established controlling family sets the capital programme, which has repeatedly been large relative to the company',
        'Unit structure separates economic exposure from voting weight',
      ],
      minorityProtections: [
        'B3 Level 2 obligations, including tag-along rights and arbitration',
        'Preferred dividend priority within the unit',
        'A concentrated institutional base that has historically engaged on capital allocation',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Generational ownership, generational projects',
        body:
          'A family that has owned the company for decades has funded successive multi-year expansions that depress free cash flow for years before contributing. This is a legitimate strategy for an owner with a thirty-year horizon and an uncomfortable one for a shareholder with a three-year one. It is not a conflict of interest; it is a difference in horizon, and it should be priced as such.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Dollar revenue, dollar debt, real reporting',
        body:
          'Pulp and export packaging revenues are dollar-linked and the debt is largely dollar-denominated, which is the correct hedge. Reported leverage and net income in reais therefore move with the exchange rate independently of operations.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Integrated fibre-to-box position',
        mechanism:
          'Owning plantations, pulp mills, paper machines and corrugating plants in one chain removes third-party margin at every step and guarantees fibre supply at cost.',
        evidence: 'Margins materially more stable across the pulp cycle than pure-play pulp producers achieve.',
        erodedBy: 'A sustained paper price environment weak enough that the internal fibre advantage cannot be recovered downstream.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Packaging demand tied to food rather than to industry',
        mechanism:
          'Corrugated box demand follows agricultural and food volumes, which are among the least cyclical activities in the Brazilian economy.',
        evidence: 'Volume resilience through domestic downturns that reduced industrial packaging demand elsewhere.',
        erodedBy: 'Substitution away from corrugated, or a harvest failure that cuts agricultural packaging volumes.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Sequential large expansions funded with dollar debt, each of which has lowered the cost base and each of which has taken leverage up for several years before contributing. The projects have generally delivered; the question has always been the payment schedule.',
      good: [
        'Expansions that genuinely lowered the cost position and lengthened the integrated chain',
        'Maintaining dollar debt against dollar revenue rather than mismatching the hedge',
      ],
      bad: [
        'Capital commitments that pushed leverage into pulp downturns, compressing distributions for years',
        'A period of free cash flow consistently absorbed by capex, limiting what minority holders received from a good operating business',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The tight-pulp, weak-paper squeeze applies from both sides',
        body:
          'Pulp operating rates near 91% favour the merchant pulp sales, while oversupplied downstream paper and board markets limit what the packaging business can charge. An integrated producer feels both, and they partly cancel — which is exactly the point of integration.',
        basis: 'REPORTED',
      },
      {
        heading: 'Brazilian agribusiness volume is the demand driver that matters',
        body:
          'Box demand tracks harvests, protein exports and food processing. Those have been the resilient part of the Brazilian economy while consumer-facing sectors contracted, which is why this company\'s volumes have held up better than the retail data would suggest.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Capex cycles compressing distributions',
        body:
          'The principal risk to a shareholder is not operational failure but a decade of good operating cash flow being spent on the next mill. The history says this is the base case rather than a risk.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Pulp price weakness on the merchant volumes',
        body:
          'The portion sold as market pulp carries full commodity exposure, so a pulp downturn reaches earnings even though the packaging business is stable.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'klbn11-integration',
        title: 'Integration is worth a higher multiple than either half would earn alone',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A pure pulp producer is a commodity business and a pure box maker is a low-margin converter. Owning the chain from plantation to corrugated plant means fibre at cost, guaranteed supply, and a packaging business whose demand follows food rather than industry. That combination produces margin stability that neither activity achieves separately, and stability in a Brazilian industrial is scarce enough to be worth paying for.',
        requires: [
          'Packaging volumes continue to track agricultural and food activity rather than general industry',
          'The internal fibre cost advantage is retained rather than competed away downstream',
          'Capex moderates enough for the operating cash flow to reach shareholders',
        ],
        breaks: [
          'A new expansion is sanctioned that extends the free cash flow drought',
          'Corrugated substitution or a harvest shock cuts packaging volumes',
          'Paper price weakness deep enough that integration cannot recover the fibre value',
        ],
        modelLink: [
          { assumption: 'Capex path and fade', note: 'The bull case requires capex fading toward maintenance. Model the fade explicitly — it is the difference between a cash-returning business and a construction project.' },
          { assumption: 'EBITDA margin path', note: 'Integration should show as a narrower margin range than a pure pulp peer, not a higher average.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'klbn11-capex',
        title: 'A good business whose cash flow belongs to the next project',
        side: 'BEAR',
        weight: 'SUPPORTING',
        rationale:
          'The operating business is genuinely high quality. The shareholder return has repeatedly been a different question, because each cycle\'s cash flow has funded the following cycle\'s mill. A controlling family with a generational horizon is rationally indifferent to when that cash reaches minorities. The bear case is not that the company is bad — it is that the discounted cash available to equity is smaller than the operating quality implies, for structural rather than cyclical reasons.',
        requires: [
          'The controller continues to prefer expansion over distribution',
          'Project pipelines remain available at attractive returns',
        ],
        breaks: [
          'An explicit shift to a distribution policy with a stated payout floor',
          'Completion of the current programme with no successor project sanctioned',
        ],
        modelLink: [
          { assumption: 'Capex path', note: 'This thesis is entirely a capex assumption. Hold capex near the historical average instead of fading it and see what happens to equity value.' },
          { assumption: 'Dividend payout', note: 'Distributions are the controller\'s choice, not a mechanical output of earnings.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Fastmarkets — Critical pulp industry insights: 2026 outlook', url: 'https://www.fastmarkets.com/insights/critical-pulp-industry-insights-2026-outlook-and-supply-trends/' },
      { label: 'FRED — Producer price index, paperboard', url: 'https://tradingeconomics.com/united-states/producer-price-index-by-commodity-for-pulp-paper-and-allied-products-paperboard-fed-data.html' },
    ],
  },

  {
    ticker: 'RIO',
    sector: 'Materials',
    scope: 'GLOBAL',
    headline:
      'The lowest-cost iron ore producer in the Pilbara, and the operator bringing Simandou into the market — long the asset that compresses the premium its own Australian ore earns.',
    howItEarns: [
      {
        heading: 'Pilbara iron ore, shipped on owned rail and port',
        body:
          'The majority of earnings come from a single integrated system in Western Australia: mines, a private railway, and ports, producing a blended product at a cash cost among the lowest globally. Aluminium, copper and minerals add diversification at materially lower returns.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Simandou makes it a participant in its own disruption',
        body:
          'Rio operates and part-owns the Guinean project whose 65% Fe material competes with the grade premium its Pilbara product earns. That is an unusual position: the new supply dilutes one part of the portfolio and accrues to another, so the net effect on the company is far smaller than on a pure Pilbara competitor.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. A dual-listed structure with entities in the United Kingdom and Australia, dispersed institutional ownership, and one large strategic holder built up by a Chinese state-owned aluminium group.',
      voting: 'Ordinary shares in both listed entities, one share one vote, with no control block.',
      relatedPartyExposure: [
        'A large strategic shareholder linked to the Chinese state, in a company whose principal customer base is Chinese steel mills',
        'Joint venture partners in Simandou include Chinese steel and infrastructure interests, so the competing supply is developed with the customer',
      ],
      minorityProtections: [
        'Dual primary listings with UK and Australian governance and disclosure regimes',
        'No controlling block, so board composition is contested',
        'Foreign investment review in both jurisdictions limits accumulation of control',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Social licence is a balance-sheet item here',
        body:
          'The destruction of the Juukan Gorge rock shelters cost the chief executive and two senior executives their positions and reset how the company negotiates with traditional owners. The lasting effect is that approvals take longer and cost more, which shows up as slower volume growth rather than as a provision.',
        basis: 'REPORTED',
      },
      {
        heading: 'Diversification has repeatedly earned less than the core',
        body:
          'Aluminium and the minerals businesses have absorbed capital for decades at returns below the Pilbara system. The company is not badly governed; it has simply been unable to find anything as good as the asset it already owns, which is the central capital allocation problem of a first-quartile producer.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'The Pilbara integrated system',
        mechanism:
          'Ore bodies, a private heavy-haul railway and dedicated ports, built over fifty years, deliver tonnes to ship at a cost no greenfield project can match. The railway alone would be uneconomic to replicate.',
        evidence: 'Cash cost per tonne at the bottom of the global curve, sustained through every price cycle since the system was completed.',
        erodedBy: 'Grade decline in the existing pits requiring replacement capital, and new low-cost supply entering the seaborne market.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Very high distributions from the iron ore business, funding a copper and lithium growth ambition that has been slow and expensive to build. The company returns cash well and reinvests it less well.',
      good: [
        'Sustaining high payouts rather than approving marginal expansion at the top of the cycle',
        'Building a position in Simandou, which hedges the company against the supply it is bringing to market',
      ],
      bad: [
        'Decades of capital into aluminium at returns far below the iron ore system',
        'Project execution failures and cultural failures that cost both capital and the speed of future approvals',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Chinese steel weakness hits the earnings, Simandou hedges the premium',
        body:
          'Chinese output fell about 4% year on year in early 2026 with portside inventories at a record 179.5 million tonnes. The price exposure is the same as any Pilbara producer\'s; the difference is that the grade premium compression from Simandou partly accrues back to Rio as an owner.',
        basis: 'REPORTED',
      },
      {
        heading: 'Aluminium is a power business wearing a metals label',
        body:
          'Smelting economics are set by the cost of electricity, so the aluminium division is exposed to power prices and carbon policy rather than to the metal cycle alone. It is the part of the portfolio least related to the iron ore thesis.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Replacement capital in the Pilbara',
        body:
          'Existing pits deplete and grades decline. Sustaining current volumes and product quality requires continuous investment that is not growth, and the market tends to treat it as if it were optional.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Concentration in one customer country',
        body:
          'A majority of iron ore goes to China, whose steel demand is the single variable the company cannot influence and whose state-linked interests are both a shareholder and a joint venture partner.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'rio-hedged-disruption',
        title: 'The only iron ore producer that is hedged against Simandou',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'New high-grade supply from Guinea compresses the quality premium that Pilbara and Brazilian ore earn. Rio is uniquely positioned because it operates and part-owns the project doing the compressing, so a dollar of premium lost in Australia is partly recovered as an owner in Africa. Against peers facing the same premium compression with no offsetting interest, that is a genuine structural advantage and it is not reflected in a sector that is rated on iron ore price alone.',
        requires: [
          'Simandou ramps and Rio\'s share of it earns an acceptable return',
          'Pilbara cash costs stay at the bottom of the curve through replacement capital',
          'The premium compression is gradual rather than abrupt',
        ],
        breaks: [
          'Simandou returns disappoint because the capital cost of the Guinean infrastructure exceeds what the ore earns',
          'Premium compression proves faster than the Guinean volumes ramp, so the loss precedes the offset',
          'Pilbara replacement capital rises enough to move the cost position',
        ],
        modelLink: [
          { assumption: 'Segment margins', note: 'Model the Pilbara and the Guinean interest separately. The hedge only exists if they are not blended.' },
          { assumption: 'Revenue driver — realised price per tonne', note: 'Compress the Pilbara realised premium and credit the Guinean equity contribution. The net is the thesis.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'rio-reinvestment',
        title: 'A world-class asset attached to decades of mediocre reinvestment',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The Pilbara system is among the best industrial assets in the world and the company has spent fifty years failing to find another. Aluminium has absorbed capital at returns far below it; the copper and lithium ambition is slow and expensive; and project and cultural failures have raised the cost and duration of every future approval. The risk to a shareholder is not the iron ore price — it is that the cash the iron ore generates keeps being invested at a lower return than distributing it would have earned.',
        requires: [
          'Reinvestment into diversification continues at returns below the core business',
          'Growth ambitions in copper and lithium require continued capital before contributing',
        ],
        breaks: [
          'A copper position that demonstrably earns returns comparable to iron ore',
          'A shift to returning substantially all free cash flow rather than funding diversification',
        ],
        modelLink: [
          { assumption: 'Capex path', note: 'Split growth capex from sustaining capex and test the equity value if growth spending earns only its cost of capital.' },
          { assumption: 'Return on invested capital', note: 'Model the blended return on capital rather than the iron ore segment margin. The gap is the thesis.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Wood Mackenzie — Simandou iron ore 2026', url: 'https://www.woodmac.com/press-releases/simandou-iron-ore-2026/' },
      { label: 'ING Think — iron ore heads towards a softer year', url: 'https://think.ing.com/articles/iron-ore-heads-for-a-softer-year' },
      { label: 'Fastmarkets — Simandou reshapes freight, premiums and decarbonisation', url: 'https://www.fastmarkets.com/insights/simandou-supply-growth-reshapes-outlook-for-freight-premiums-decarbonization-iron-ore-decoded-2026/' },
    ],
  },

  {
    ticker: 'BHP',
    sector: 'Materials',
    scope: 'GLOBAL',
    headline:
      'The most disciplined capital allocator among the major miners, which has spent the last decade simplifying toward iron ore and copper — and whose copper ambition is the reason to own it rather than a peer.',
    howItEarns: [
      {
        heading: 'Western Australian iron ore, with copper as the second pillar',
        body:
          'The Pilbara operation is the cash engine, at a cost position comparable to the best in the industry. Copper from Chile and South Australia is the deliberate second pillar, chosen because electrification raises demand against a supply base constrained by declining grades and permitting.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Simplification is the strategy, and it has been executed',
        body:
          'Petroleum was demerged, thermal coal divested, and the dual-listed structure collapsed into a single Australian entity. The portfolio now contains fewer, better things, which is a rarer achievement in mining than growth.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. A single Australian-listed entity since the unification of the former dual-listed structure, with dispersed institutional ownership and a very large free float.',
      voting: 'Ordinary shares, one share one vote, no control block.',
      relatedPartyExposure: [
        'Joint venture partners in specific copper and iron ore assets',
        'Samarco is held in a joint venture whose dam failure liabilities are shared with another major producer',
      ],
      minorityProtections: [
        'Single voting class with dispersed ownership under Australian governance rules',
        'Foreign investment review limiting accumulation of control',
        'A record of shareholder votes materially constraining management on structure and remuneration',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Unification removed a structure that had outlived its purpose',
        body:
          'Collapsing the dual-listed company into one entity simplified the share register, removed arbitrage between two lines and made capital allocation cleaner. It also removed a source of the discount the structure carried. This is the kind of governance improvement that shows up in the share price rather than in a report.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Samarco is a shared liability with an unshared reputation',
        body:
          'The dam failure liabilities are held in a joint venture with another producer, so the obligation is split and the negotiation is joint. Settlement amounts have been revised and remain uncertain, which means part of equity value here depends on legal outcomes rather than on mining.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'First-quartile cost position in two commodities at once',
        mechanism:
          'Very few companies hold a bottom-of-the-curve position in more than one commodity. Doing so means the portfolio remains profitable through a downturn in either, without the diversification-into-mediocrity problem.',
        evidence: 'Sustained first-quartile cost positions in Western Australian iron ore and in its principal copper operations.',
        erodedBy: 'Grade decline in copper requiring more ore moved per tonne of metal, and iron ore premium compression from new supply.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The clearest capital discipline in the sector: a published framework, a willingness to demerge and divest rather than hold, and repeated refusal to complete large acquisitions at prices it judged too high. Growth has been slower as a result, which is the point.',
      good: [
        'Demerging petroleum and exiting thermal coal, concentrating the portfolio on assets with a cost advantage',
        'Walking away from large copper acquisitions rather than raising the offer, then investing organically instead',
        'Unifying the dual-listed structure, removing a standing discount',
      ],
      bad: [
        'A period of aggressive acquisition in US shale that was later written down almost entirely',
        'Samarco liabilities arising from a joint venture whose risk was not priced into the returns it was earning',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Exposed to the same iron ore weakness, less exposed to the premium',
        body:
          'Chinese steel output down around 4% and record portside inventories pressure the price for every Pilbara producer. BHP\'s product is less grade-premium dependent than the highest-grade Brazilian ore, so Simandou\'s effect on it is smaller than on a premium-reliant competitor.',
        basis: 'REPORTED',
      },
      {
        heading: 'Copper is a supply story, not a demand forecast',
        body:
          'The copper case does not require electrification to exceed expectations. It requires supply to keep disappointing, which it has: grades decline, water and permitting constrain expansion, and the projects that do get built cost more per tonne than the last generation.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Copper grade decline and capital intensity',
        body:
          'Falling head grades mean more rock moved for the same metal, so unit costs rise structurally and sustaining capital grows. This is the way a good copper asset becomes an average one without anything going wrong.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Iron ore concentration in Chinese demand',
        body:
          'The cash engine depends on one customer country whose steel production may be past its peak. Copper is the intended answer and it is not yet large enough to be one.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'bhp-copper-supply',
        title: 'Copper is a bet on supply failing, which is a better bet than demand succeeding',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Most copper cases rest on electrification demand forecasts that have repeatedly been too optimistic about timing. The stronger argument is on the supply side and it is already observable: head grades are declining across the industry, water and permitting constrain expansion in the main producing regions, and each new generation of projects costs more per tonne of capacity. A company with a first-quartile cost position and an organic pipeline benefits from that whether or not demand accelerates, and it is funded by an iron ore business that needs no capital.',
        requires: [
          'Copper supply growth continues to disappoint relative to announced pipelines',
          'The organic copper pipeline is delivered near its capital estimates',
          'Iron ore cash flow continues funding it without external capital',
        ],
        breaks: [
          'A wave of copper supply arriving from projects currently assumed to be delayed',
          'Copper capital intensity rising enough that new tonnes earn only their cost of capital',
          'Iron ore weakness deep enough that the copper programme requires external funding',
        ],
        modelLink: [
          { assumption: 'Segment margins', note: 'Model copper and iron ore separately with their own price decks. Blending them hides which one the thesis depends on.' },
          { assumption: 'Capex path', note: 'Copper growth capex is the investment being underwritten. Test the return on it explicitly rather than as consolidated capex intensity.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'bhp-iron-dependence',
        title: 'Still an iron ore company, and the customer may be past peak steel',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Simplification improved the portfolio and did not change its concentration: the large majority of earnings still come from Pilbara iron ore sold mostly to Chinese mills. Chinese steel output fell around 4% early in 2026 against record portside inventories, and the structural reading is that peak Chinese steel is behind us. Copper is the intended replacement and is years from being large enough. A model applying mid-cycle iron ore economics to the terminal year is assuming a customer whose demand may be in permanent decline.',
        requires: [
          'Chinese steel demand is structurally lower rather than cyclically depressed',
          'Copper remains too small to offset iron ore decline within the forecast horizon',
        ],
        breaks: [
          'Indian and Southeast Asian steel growth absorbing the volume China gives up',
          'Copper scaling faster than expected through acquisition or accelerated organic delivery',
        ],
        modelLink: [
          { assumption: 'Revenue driver — volumes and price per tonne', note: 'Model iron ore volumes flat or declining with a structurally lower price rather than reverting to the mid-cycle average.' },
          { assumption: 'Terminal growth', note: 'A terminal value on mid-cycle iron ore economics is exactly what this disputes.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ING Think — iron ore heads towards a softer year', url: 'https://think.ing.com/articles/iron-ore-heads-for-a-softer-year' },
      { label: 'Wood Mackenzie — Simandou iron ore 2026', url: 'https://www.woodmac.com/press-releases/simandou-iron-ore-2026/' },
      { label: 'Fastmarkets — shift in iron ore trade flows and grade preferences', url: 'https://www.fastmarkets.com/insights/shift-iron-ore-trade-flows-across-imported-iron-ore-grades-expected/' },
    ],
  },

  {
    ticker: 'FCX',
    sector: 'Materials',
    scope: 'GLOBAL',
    headline:
      'The purest large-cap copper exposure available, with one irreplaceable Indonesian mine, a partially nationalised ownership of it, and a US leaching programme that adds metal with almost no new capital.',
    howItEarns: [
      {
        heading: 'Copper concentrate and cathode, plus gold as a by-product that pays for a lot of it',
        body:
          'Grasberg in Indonesia and the Americas operations produce copper, with Grasberg also yielding enough gold that the by-product credit materially lowers the effective copper cost. Molybdenum adds a third stream. The company is leveraged to the copper price with almost no offsetting business.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Leaching existing stockpiles is the cheapest new metal in the industry',
        body:
          'Recovering copper from material already mined and stacked requires process improvement rather than new pits, permits or trucks. It is incremental production at a fraction of greenfield capital intensity, and it is the most underappreciated part of the volume outlook.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder in the listed company. The critical control fact is at the asset level: the Indonesian government, through a state mining holding company, holds a majority of the Grasberg operating entity following the 2018 divestment agreement.',
      voting: 'Ordinary shares of the listed company, one share one vote, dispersed ownership.',
      relatedPartyExposure: [
        'The Indonesian state is majority owner of the company\'s most valuable asset while the listed company operates it',
        'Smelting, export licensing and royalty terms are negotiated with a government that is also the majority partner',
        'Mining licence extension beyond its current term is a political decision by that same partner',
      ],
      minorityProtections: [
        'Dispersed ownership with a single voting class in the listed entity',
        'A negotiated operating agreement that preserves operatorship and economics through a defined term',
        'SEC reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The best asset is majority-owned by a government',
        body:
          'The 2018 restructuring transferred majority ownership of the Grasberg entity to Indonesian state interests while leaving the listed company as operator with a defined economic share. That resolved a long dispute and created a permanent dependency: licence extension, export permits, smelter obligations and fiscal terms all sit with a partner that can outvote the operator.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Resource nationalism is the sector risk this company has already lived',
        body:
          'Most miners discuss resource nationalism as a hypothetical. This one has already given up majority ownership of its crown asset and built a domestic smelter it did not want, and it is still exposed to the next round of the same negotiation.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Grasberg: an ore body with no substitute',
        mechanism:
          'One of the largest copper and gold deposits ever found, with grades and a gold credit that no new project can match. The underground block caves now in production extend its life at costs a greenfield mine cannot approach.',
        evidence: 'Copper produced at an effective cost far below the industry average once the gold by-product credit is applied.',
        erodedBy: 'Licence and fiscal renegotiation, and the eventual depletion of the highest-grade zones.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Leach recovery from existing stockpiles',
        mechanism:
          'Adding copper from material already mined requires no new permits, pits or haulage — only metallurgy and time. Competitors without decades of stacked low-grade material have nothing comparable to work with.',
        evidence: 'Incremental annual production added at capital intensity far below any new mine.',
        erodedBy: 'Diminishing returns as the most amenable material is processed first.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Disciplined since the shale misadventure: deleveraging, a variable distribution tied to cash flow, and growth weighted toward brownfield and leaching rather than greenfield. The company learned an expensive lesson and appears to have kept it.',
      good: [
        'Prioritising leach recovery and brownfield expansion, which add metal at a fraction of greenfield capital intensity',
        'A distribution policy explicitly tied to cash flow rather than a fixed dividend defended with debt',
      ],
      bad: [
        'The oil and gas acquisitions of the early 2010s, financed with debt and written down almost in full — one of the clearest capital destruction episodes in the sector',
        'A smelter built under political obligation rather than because it earned a return',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The supply constraint is real and this company sits inside it',
        body:
          'Copper supply growth keeps disappointing because grades decline, water and permitting constrain expansion, and new projects cost more per tonne than the last generation. A producer with an existing tier-one ore body and low-capital leach growth is on the right side of that, and it does not need a demand forecast to work.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'No iron ore, so no offset when copper is weak',
        body:
          'Unlike the diversified majors, there is no second commodity funding the first. That is why this is the cleanest copper exposure and also why a copper downturn arrives undiluted.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Indonesian licence, fiscal and export terms',
        body:
          'The most valuable asset operates under an agreement with a government that owns the majority of it. Extension terms, royalties and export rules are the single largest variable in the valuation and are not a mining question.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Undiluted copper price exposure',
        body:
          'With no second commodity, earnings and the share price move with copper at close to full beta. That is the attraction and the risk in the same sentence.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'fcx-low-capital-growth',
        title: 'Growing copper production without building a mine',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The industry\'s problem is that new copper costs more per tonne every cycle — declining grades, water constraints, permitting, and capital intensity that makes marginal projects uneconomic at reasonable prices. This company adds metal by recovering copper from rock it already mined and stacked, which requires metallurgy rather than permits. Combined with brownfield extensions at a tier-one ore body, that is volume growth at a fraction of the capital the rest of the industry must spend, in the commodity where supply is the binding constraint.',
        requires: [
          'Leach recovery continues to deliver incremental tonnes at low capital intensity',
          'Brownfield extensions at the main asset proceed under stable licence terms',
          'Copper supply growth industry-wide continues to disappoint',
        ],
        breaks: [
          'Leach recovery hits diminishing returns as the amenable material is consumed',
          'A copper supply wave from projects currently assumed delayed',
          'Licence or fiscal renegotiation that reduces the company\'s share of the main asset\'s economics',
        ],
        modelLink: [
          { assumption: 'Revenue driver — pounds of copper produced', note: 'Model leach tonnes separately from mined tonnes. They have completely different capital intensity, which is the thesis.' },
          { assumption: 'Capex path', note: 'Growth here should show as volume rising with capex staying near sustaining levels. If the model needs greenfield capex, the thesis is not being expressed.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'fcx-sovereign-risk',
        title: 'A government owns most of the asset the valuation depends on',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The 2018 restructuring left Indonesian state interests holding the majority of the Grasberg operating entity, with the listed company as operator. Licence extension, export permits, smelter obligations and fiscal terms are all decided by that majority partner. The company has already been through one round of this and surrendered control of its best asset plus a smelter it did not want. Valuing the asset on its mining economics alone prices in none of the next negotiation, and the discount rate is where that belongs rather than in a probability-weighted scenario nobody updates.',
        requires: [
          'The Indonesian state retains majority ownership of the operating entity',
          'Licence and fiscal terms remain subject to periodic renegotiation',
        ],
        breaks: [
          'A long-dated licence extension on terms that fix the economics for the mine\'s remaining life',
          'A change in ownership structure restoring majority economics to the listed company',
        ],
        modelLink: [
          { assumption: 'Cost of equity — country premium', note: 'Apply an explicit sovereign premium to the asset, not a blended company-level rate. The exposure is concentrated in one jurisdiction.' },
          { assumption: 'Minority interest', note: 'The state\'s majority of the operating entity has to flow through minority interest correctly, or the equity value is overstated.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ING Think — base metals and mining market outlook', url: 'https://think.ing.com/articles/iron-ore-heads-for-a-softer-year' },
      { label: 'Procurement Resource — commodity price trends', url: 'https://www.procurementresource.com/resource-center/iron-ore-price-trends' },
    ],
  },

  {
    ticker: 'LIN',
    sector: 'Materials',
    scope: 'GLOBAL',
    headline:
      'Not a commodity business despite the sector label: industrial gases sold on fifteen-year take-or-pay contracts with energy cost pass-through, which is why it earns utility-like returns with chemical-company multiples nowhere in sight.',
    howItEarns: [
      {
        heading: 'On-site plants built next to a customer who cannot leave',
        body:
          'The largest contracts involve building an air separation unit on a customer\'s site — a steel mill, a refinery, a semiconductor fab — under a fifteen-year take-or-pay agreement with energy costs passed through and inflation indexation. The customer pays whether or not it takes the gas, and switching supplier would mean building a new plant.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Merchant and packaged gases earn on density, not contracts',
        body:
          'Bulk deliveries by truck and cylinder sales to smaller customers are priced locally and depend on route density. Because gases are expensive to transport relative to their value, whoever has the nearest plant wins — which makes this a collection of local monopolies rather than a global market.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. A widely held company formed from the Linde and Praxair merger, with dispersed institutional ownership and a very large free float.',
      voting: 'Ordinary shares, one share one vote.',
      relatedPartyExposure: [
        'Joint ventures and long-term supply arrangements with individual large industrial customers',
      ],
      minorityProtections: [
        'Single voting class with dispersed ownership',
        'Disclosure obligations of a large US and European listed issuer',
        'No controlling block, so board composition is contested',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The merger delivered what mergers usually promise and rarely provide',
        body:
          'The Linde and Praxair combination produced genuine cost synergies and, more importantly, imported the more disciplined pricing and capital allocation culture of the smaller partner into the larger. Margins expanded materially after the deal and have kept expanding, which is the unusual part.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Capital discipline is enforced by a published return threshold',
        body:
          'The company declines projects below its return hurdle, which shows up as slower volume growth and higher margins than peers chasing tonnage. It is the clearest case in the sector of a management team optimising returns rather than scale.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'On-site contracts with take-or-pay and pass-through',
        mechanism:
          'A fifteen-year contract where the customer pays a fixed fee regardless of volume, with energy costs passed through and prices indexed, removes volume risk, input cost risk and inflation risk simultaneously. Replacing the supplier means building a plant.',
        evidence: 'Revenue and margin stability through industrial recessions that halved customers\' own output.',
        erodedBy: 'Contract expiry with a customer that has since built its own capacity, or the closure of the customer\'s plant entirely.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Local density in merchant distribution',
        mechanism:
          'Gases cost more to move than they are worth over distance, so the nearest plant has a cost advantage no distant competitor can overcome. Each region is effectively its own market with two or three participants.',
        evidence: 'Pricing power in merchant and packaged gases sustained above general industrial inflation.',
        erodedBy: 'A competitor building local capacity, which requires a customer base large enough to justify it.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Among the best in industrials: projects accepted only above a published return threshold, a large contracted backlog rather than speculative capacity, and consistent buybacks and dividend growth funded by genuine free cash flow.',
      good: [
        'Growing the contracted project backlog rather than building speculative merchant capacity',
        'Declining volume growth in favour of price and return discipline after the merger',
        'Steady buybacks funded from free cash flow rather than from leverage',
      ],
      bad: [
        'Exposure to large hydrogen and decarbonisation projects whose economics depend on subsidy regimes and customer commitments that may not hold',
        'A pre-merger history at both predecessors of chasing volume in Asia at returns below the hurdle now applied',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The semiconductor build-out is a direct contracted opportunity',
        body:
          'Every new fab needs ultra-high-purity gases on site under long contracts. With hyperscaler capital spending driving fab construction and advanced packaging capacity nearly doubling, this is contracted backlog growth tied to the AI cycle without any exposure to which chip wins.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Not exposed to the commodity cycle its sector label implies',
        body:
          'Grouped with miners and chemical producers, this business has pass-through energy costs, take-or-pay volumes and indexed pricing. Iron ore weakness, pulp oversupply and Chinese steel output — the drivers that dominate the Materials dossier — barely touch it.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Industrial customer closures rather than industrial weakness',
        body:
          'Take-or-pay survives a customer producing less. It does not survive a customer shutting the plant, which is what has been happening to European heavy industry. The risk is structural deindustrialisation in specific regions, not the cycle.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Hydrogen projects dependent on subsidy and offtake',
        body:
          'Large decarbonisation projects carry capital commitments whose returns depend on subsidy regimes and customer commitments that are less firm than a traditional on-site contract.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'lin-contract-quality',
        title: 'A utility misfiled under Materials',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Fifteen-year take-or-pay contracts with energy pass-through and inflation indexation remove volume risk, input cost risk and inflation risk at the same time, and the customer cannot switch without building a plant. That is a better contract than most regulated utilities have, on assets financed at industrial rather than utility leverage. Sitting in a sector rated on Chinese steel output and commodity prices, the business is repeatedly analysed against drivers that do not reach it, and the semiconductor build-out is adding contracted backlog with no exposure to which chip wins.',
        requires: [
          'On-site contract renewals continue at comparable terms',
          'Project backlog continues to be accepted only above the return hurdle',
          'Semiconductor and industrial gas demand supports backlog growth',
        ],
        breaks: [
          'Customer plant closures rather than production cuts, which take-or-pay does not survive',
          'Return discipline abandoned to win hydrogen or decarbonisation volume',
          'Contract renewals at materially worse terms as customers gain alternatives',
        ],
        modelLink: [
          { assumption: 'Revenue growth and margin stability', note: 'Model contracted on-site revenue separately from merchant. The first is an annuity; the second is cyclical and locally priced.' },
          { assumption: 'WACC', note: 'If the contract quality is genuinely utility-like, the discount rate should reflect that rather than a Materials-sector beta.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'lin-deindustrialisation',
        title: 'Take-or-pay does not protect against a customer that closes',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The contract structure is excellent at handling a customer that produces less and useless against a customer that shuts down. European heavy industry — steel, chemicals, refining — has been closing capacity under energy cost and competitive pressure, and each closure removes an on-site plant\'s revenue permanently rather than cyclically. Meanwhile the growth backlog is increasingly weighted to hydrogen and decarbonisation projects whose returns depend on subsidy regimes rather than on a customer\'s own economics. The quality of the existing contracts is not in question; the durability of the customer base behind them is.',
        requires: [
          'European and other high-cost-region industrial capacity continues to close',
          'Growth backlog remains weighted toward subsidy-dependent projects',
        ],
        breaks: [
          'Industrial capacity stabilising, or closures being offset by new on-site contracts in growing regions',
          'Hydrogen projects proving to earn the return hurdle without subsidy dependence',
        ],
        modelLink: [
          { assumption: 'Revenue growth by region', note: 'Model regional revenue separately. A closure is a permanent step down in one region, not a lower growth rate globally.' },
          { assumption: 'Capex path and project returns', note: 'Test the equity value if the decarbonisation backlog earns only its cost of capital.' },
        ],
        conviction: 'LOW',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IDC — semiconductor market forecast 2026 and fab investment', url: 'https://www.idc.com/resource-center/blog/semiconductor-market-to-surge-past-the-trillion-dollar-threshold-ai-infrastructure-drives-market-growth/' },
      { label: 'McKinsey Electronics — semiconductor outlook 2026 and packaging capacity', url: 'https://www.mckinsey-electronics.com/post/strategic-semiconductor-and-electronic-component-trends-to-shape-2026-market-dynamics-technologica' },
    ],
  },
];
