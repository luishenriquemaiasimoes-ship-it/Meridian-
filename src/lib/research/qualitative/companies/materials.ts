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
];
