import type { CompanyQualitative } from '../types';

export const INDUSTRIALS: CompanyQualitative[] = [
  {
    ticker: 'ECOR3',
    sector: 'Industrials',
    scope: 'BRAZIL',
    headline:
      'A toll road operator whose every asset reverts to the state on a known date — so the valuation is a sum of contracts amortising to expiry, and any perpetual terminal value is a modelling error rather than a view.',
    howItEarns: [
      {
        heading: 'A contractual tariff per vehicle, indexed and exclusive',
        body:
          'Each concession sets a toll adjusted annually by a named index, collected from every vehicle for a fixed term. There is no pricing decision and no competitor: the road is exclusive for its term. What the operator controls is cost, capex efficiency against the contractual obligation, and the outcome of rebalancing when government changes the terms.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Heavy vehicle traffic is an agricultural export derivative',
        body:
          'Toll revenue weights heavily toward trucks, which pay multiples of a car. Truck traffic follows harvests and commodity export flows rather than consumer activity, which makes these assets a soy and sugar logistics play more than a GDP one.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No single controlling shareholder following the exit of the former Italian parent and successive capital raises. Ownership is dispersed across Brazilian and foreign institutions with a large free float.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'Historical construction and service arrangements with parties connected to former controlling shareholders',
        'A board without an anchor holder makes the auction bidding policy contestable',
        'The company was implicated in corruption investigations concerning concession dealings, which reshaped both management and governance',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'Concession contracts that fix tariffs and terms independently of shareholders',
        'A compliance regime rebuilt after the investigations, with independent board oversight',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A governance history that is the reason for the discount',
        body:
          'The company was central to investigations into how Brazilian road concessions were awarded and renegotiated, which cost it management, capital and credibility. The compliance rebuild since has been substantial. For an investor the relevant question is not whether the past was bad but whether the auction discipline that follows a scandal survives the next competitive auction.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'No controller means no one committed to bidding discipline',
        body:
          'Growth comes only from winning concessions, and an auction is won by the most optimistic bidder. A dispersed register gives no shareholder enough at stake to insist on walking away from a lot, which is precisely the discipline this business model requires.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Exclusive concessions on routes with no alternative',
        mechanism:
          'A toll road contract grants exclusivity for its term, and the alternative routes are slower or do not exist. Truck operators on an export corridor have no practical substitute, which is why traffic is inelastic to the tariff.',
        evidence: 'Traffic volumes sustained through Brazilian recessions, with heavy vehicle counts following harvests rather than the economy.',
        erodedBy: 'Concession expiry, which ends the exclusivity entirely, and rail competition on the same export corridors.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Bidding for lots and executing the contractual capex, funded with long indexed debt. The record includes both disciplined portfolio pruning and historical bids whose returns did not justify the grant payments made.',
      good: [
        'Divesting concessions approaching expiry and non-core assets rather than holding them to reversion',
        'Matching long indexed concession revenue with long indexed debt, which is the correct funding structure',
      ],
      bad: [
        'Historical auction bids and renegotiations made in a period when the process itself was compromised',
        'Capex obligations on won lots that exceeded the assumptions in the bid, borne entirely by shareholders',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The contract is the regulation, and it cannot be improved after signing',
        body:
          'Unlike a rate-regulated utility whose return is reset periodically, a concession\'s economics are fixed in a document signed at the start. That protects against adverse regulatory resets and means a bad bid cannot be fixed. Reading the contract is the analysis, not preliminary diligence.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Rebalancing claims are worth less than their face amount',
        body:
          'When government changes an obligation or grants a tariff discount, the contract provides for economic rebalancing through term extension or tariff adjustment. The mechanism works slowly and through negotiation, so a claim on the balance sheet should be discounted heavily.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Winning an auction on an optimistic traffic forecast',
        body:
          'The classic Brazilian infrastructure loss: a lot won with aggressive traffic growth and a large grant payment, funded with debt, delivering below the cost of capital for twenty-five years. Nothing afterwards fixes it.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Capex overruns on contractual obligations',
        body:
          'Lane duplications and works are mandatory on a schedule regardless of traffic. The revenue is fixed and indexed; a cost overrun is entirely the shareholder\'s.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'ecor3-sotp-to-expiry',
        title: 'A portfolio of dated contracts, each worth discounting separately',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Every concession has its own term, index, tariff and capex obligation, so a single EBITDA multiple on the consolidated company averages assets with nothing in common — a concession with twenty years left and one with four are not the same asset. Discounting each contract to its own expiry, with the contractual tariff and the committed capex, produces a defensible number that routinely differs from the multiple. The tariffs are indexed and the traffic is inelastic on export corridors, so the cash flows are unusually knowable; the work is arithmetic rather than forecasting.',
        requires: [
          'Concessions run to term with indexation applied as written',
          'Heavy vehicle traffic follows harvests rather than falling with the consumer economy',
          'Committed capex is executed near the contractual assumptions',
        ],
        breaks: [
          'Rebalancing disputes that alter tariffs or obligations materially',
          'Capex overruns on mandatory works, which the fixed tariff cannot absorb',
          'An aggressive auction bid that commits capital below the cost of capital for decades',
        ],
        modelLink: [
          { assumption: 'amortiseToYear per concession', note: 'Each asset must amortise to its own contract end. This is the single most important input and the one a consolidated model gets wrong.' },
          { assumption: 'Revenue indexation', note: 'Model revenue growth as the contractual index and traffic separately. There is no pricing driver here.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'ecor3-terminal-zero',
        title: 'The assets revert to the state, and most models value them as if they do not',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'At the end of each concession the road returns to the granting authority, generally without compensation for residual value. A discounted cash flow with a growth-in-perpetuity terminal value therefore assigns value to assets the contract says will not belong to the company. Once terminal value is removed and each concession amortises to expiry, growth depends entirely on winning replacement lots — in auctions decided by the most optimistic bidder, at a company with no anchor shareholder to enforce walking away, and a history of exactly that discipline failing.',
        requires: [
          'Concessions continue expiring without renewal compensation',
          'Auction competition keeps new lot returns near or below the cost of capital',
        ],
        breaks: [
          'A regulatory framework granting compensation or automatic extension at expiry',
          'A sustained widening of auction returns that makes replacement genuinely accretive',
        ],
        modelLink: [
          { assumption: 'Terminal growth', note: 'Set terminal growth to zero and amortise each concession to its contract end. If the valuation collapses, the model was carrying value the contract does not grant.' },
          { assumption: 'Capex path', note: 'Model new capex only where a lot is actually won and contracted. Assumed future wins are the error.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ANEEL — indexed concession revenue methodology, comparable for transport concessions', url: 'https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/revisao-tarifaria-periodica-da-energisa-sul-sudeste-e-aprovada-pela-aneel' },
      { label: 'Farm Policy News — agricultural volumes and farm income', url: 'https://farmpolicynews.illinois.edu/2026/02/farm-income-to-fall-in-2026-despite-hefty-govt-payments/' },
    ],
  },

  {
    ticker: 'CCRO3',
    sector: 'Industrials',
    scope: 'BRAZIL',
    headline:
      'The largest Brazilian concession group — roads, airports and urban mobility — where each contract has a different term and index, and the sum of the parts is the only honest valuation.',
    howItEarns: [
      {
        heading: 'Three concession types with different revenue mechanics',
        body:
          'Toll roads earn a tariff per vehicle; airports earn regulated aeronautical fees plus unregulated commercial revenue from retail and parking; urban rail and metro concessions earn a fee per passenger or an availability payment. Only the airports have a genuine commercial revenue line the operator can grow.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Airport commercial revenue is the one place with real upside',
        body:
          'Retail, food, parking and advertising in a terminal are not regulated in the way the landing fee is, and revenue per passenger can be grown by the operator. It is the only part of a concession portfolio where commercial skill rather than contract compliance determines the outcome.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'A corporation with no single controlling shareholder after the former shareholders\' agreement was dissolved, leaving a dispersed register of Brazilian and foreign institutions with a large free float.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'Legacy construction and service relationships with parties connected to former controlling shareholders',
        'The group was implicated in investigations into how concessions were awarded and renegotiated',
        'A dispersed board with no anchor holder deciding the auction bidding policy',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'Concession contracts fixing tariffs and terms independently of shareholders',
        'A compliance framework rebuilt after the investigations, with independent oversight',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Dissolving the shareholders\' agreement improved the structure and removed the anchor',
        body:
          'Ending the controlling agreement made the company a true corporation with contested board seats, which removed the possibility of value being directed to a controller. It also left no shareholder with enough at stake to enforce bidding discipline in auctions, which is the discipline this business most needs.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The compliance rebuild followed a genuine failure',
        body:
          'Investigations into concession awards and renegotiations cost the group management and credibility. The remediation has been substantial and the test is the next competitive auction rather than the policy document.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Operating capability that qualifies the group for the largest lots',
        mechanism:
          'Airport and metro concessions require demonstrated operating experience to prequalify, and only a handful of Brazilian groups have it. That restricts the bidder pool on exactly the largest and longest assets.',
        evidence: 'A portfolio spanning roads, airports and urban rail, which very few competitors are qualified to assemble.',
        erodedBy: 'International operators entering Brazilian auctions with their own track records, which widens the bidder pool and compresses returns.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Airport terminals as retail real estate',
        mechanism:
          'A captive audience with time to spend in a space with no competing retail is an unusually good commercial environment, and the concession grants exclusivity over it for the term.',
        evidence: 'Commercial revenue per passenger growth independent of the regulated tariff.',
        erodedBy: 'Passenger traffic weakness, and concession expiry ending the exclusivity.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A large and continuous auction programme across three concession types, funded with long indexed debt, alongside disposals of assets near expiry. Diversification across types spreads risk and spreads management attention.',
      good: [
        'Diversifying across roads, airports and urban mobility, which spreads traffic, regulatory and counterparty exposure',
        'Divesting concessions approaching reversion rather than holding them to zero',
      ],
      bad: [
        'Historical bids and renegotiations made during the period the award process was compromised',
        'A portfolio complex enough that consolidated metrics describe none of the individual contracts',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Airport traffic is the only volume line with structural growth',
        body:
          'Toll road traffic follows harvests and industrial activity, and urban mobility follows population. Air passenger volumes in Brazil have structural growth from a low base, which makes the airport segment the only genuinely growing part of a concession portfolio.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Every contract reverts, on a different date',
        body:
          'Roads, airports and metro concessions all end and return to the state. With dozens of contracts expiring across three decades, the company is a portfolio of amortising assets whose aggregate life is shorter than a perpetual multiple implies.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Aggressive bidding by a board with no anchor shareholder',
        body:
          'Growth requires winning auctions, auctions reward optimism, and no shareholder has enough at stake to insist on discipline. This is the structural risk created by the otherwise welcome dissolution of the control agreement.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Contractual capex against fixed indexed revenue',
        body:
          'Mandatory works on a schedule with revenue fixed by contract means every overrun is the shareholder\'s. Across dozens of concurrent contracts, the exposure is continuous.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'ccro3-airport-commercial',
        title: 'The airports are a retail business inside a concession portfolio',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Toll roads and metro lines are compliance businesses: collect a contractual tariff, execute mandated capex, hand the asset back. Airport terminals are different — retail, food, parking and advertising revenue is not regulated like the landing fee, the audience is captive with time to spend, and revenue per passenger can be grown by the operator. It is the only line in this portfolio where commercial skill changes the outcome, it sits on the only structurally growing volume base in Brazilian infrastructure, and a consolidated concession multiple values it as if it were a toll booth.',
        requires: [
          'Air passenger volumes continue growing from a low base',
          'Commercial revenue per passenger continues rising independently of the regulated tariff',
          'Airport concessions run to term without adverse rebalancing',
        ],
        breaks: [
          'Passenger traffic weakness from economic conditions or airline capacity reduction',
          'Regulatory extension of tariff control into commercial revenue',
          'Terminal capex obligations exceeding the assumptions in the bid',
        ],
        modelLink: [
          { assumption: 'Segment margins and revenue drivers', note: 'Model aeronautical and commercial revenue per passenger separately from road tariffs. The thesis exists only at segment level.' },
          { assumption: 'amortiseToYear per concession', note: 'Airport concessions have their own terms. The commercial upside is capped by the contract end like everything else.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'ccro3-bidding-discipline',
        title: 'A corporation with no owner, in a business where the most optimistic bidder wins',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Growth in a concession group comes only from auctions, and auctions are won by whoever underwrites the lowest return. Dissolving the shareholders\' agreement removed the risk of a controller extracting value and also removed the only party with enough at stake to insist on walking away from an overpriced lot. This is a company with a documented history of the award process failing, a board accountable to a dispersed register, and a growth model that requires saying no. A model extrapolating historical growth is extrapolating an auction calendar and assuming discipline that the structure does not enforce.',
        requires: [
          'Growth continues depending on competitive auction wins',
          'No shareholder emerges with enough stake to enforce bidding discipline',
        ],
        breaks: [
          'A published return threshold for auctions that the company demonstrably holds to by declining lots',
          'A strategic shareholder taking a large enough position to anchor capital allocation',
        ],
        modelLink: [
          { assumption: 'Capex path and new concessions', note: 'Model only contracted concessions. Growth from assumed future auction wins is the assumption this thesis attacks.' },
          { assumption: 'WACC versus project IRR', note: 'Test whether recent auction wins clear the cost of capital. If they do not, growth destroys value.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ANEEL — indexed concession revenue methodology, comparable for transport concessions', url: 'https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/revisao-tarifaria-periodica-da-energisa-sul-sudeste-e-aprovada-pela-aneel' },
      { label: 'Itaponews — Brazilian credit cost and consumer conditions', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
    ],
  },

  {
    ticker: 'RAIL3',
    sector: 'Industrials',
    scope: 'BRAZIL',
    headline:
      'A railway that moves grain from the interior to port on a concession running to 2058 after early renewal — the longest-dated infrastructure contract in the Brazilian market, and the one most exposed to the harvest.',
    howItEarns: [
      {
        heading: 'Tonne-kilometres of grain, on a network nobody can duplicate',
        body:
          'Revenue is volume transported times a tariff per tonne-kilometre, predominantly soy and corn moving from Mato Grosso and the interior to the port of Santos. Rail beats trucking decisively over long distances, so on those corridors the competition is the road rather than another railway.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Fixed cost base means the marginal tonne is nearly all margin',
        body:
          'Track, locomotives and wagons cost the same whether the train is full or half empty. Incremental volume therefore carries a very high contribution margin, and a poor harvest removes it just as directly. Operating leverage runs hard in both directions.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No single controlling shareholder. Ownership is dispersed across Brazilian and foreign institutions with a large free float, following the restructuring of the former controlling arrangements.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'Take-or-pay contracts with large agricultural trading houses that are also the principal customers',
        'A board without an anchor shareholder deciding a very large long-dated capex programme',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'A concession contract with defined terms running to 2058, independent of shareholders',
        'ANTT regulation of the concession and its investment obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Early renewal to 2058 was the decisive governance event',
        body:
          'Renewing the concession decades ahead of expiry, in exchange for committed investment obligations, converted a medium-dated asset into a very long one. That is the single most valuable thing the company has done for shareholders, and it came with a capex commitment that is not optional.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The capex obligation is the price of the term',
        body:
          'The extended concession carries mandatory investment in track, capacity and new line extensions. Revenue is tariff-based and volume-dependent; the obligation is fixed. That asymmetry is the standing risk in any concession and here it runs for three decades.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'A rail corridor from the agricultural frontier to port',
        mechanism:
          'Over long distances rail costs a fraction of trucking per tonne-kilometre, and building a parallel railway is not economically or practically possible. On the Mato Grosso to Santos corridor the alternative is a truck, which is why the tariff holds.',
        evidence: 'Sustained share of grain volumes on the corridor against road competition, with volumes following harvests rather than economic activity.',
        erodedBy: 'Competing rail projects and northern port routes that shift export flows away from Santos, and concession expiry in 2058.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A very large committed investment programme attached to the concession extension, funded with long debt. Free cash flow is suppressed for years while capacity is built, which is the correct shape for the contract obtained.',
      good: [
        'Securing the concession extension to 2058, which transformed the asset\'s duration and therefore its value',
        'Matching long indexed concession revenue with long-dated debt rather than short funding',
      ],
      bad: [
        'A capex obligation large relative to the company, committed against volume forecasts that depend on harvests decades ahead',
        'Capacity expansion into corridors where competing northern routes may capture the flows',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Volumes follow the harvest, not the economy',
        body:
          'Grain transported depends on planted area, yields and export demand. Brazilian agriculture has been the resilient part of the economy while consumer sectors contracted, which is why this company\'s volumes held while retail-exposed industrials weakened.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Farm income pressure reaches the customer, not the tariff',
        body:
          'Falling crop prices and farm profitability squeeze the grower and the trader rather than the railway, whose tariff is contractual. The transmission is indirect: weaker farm economics eventually reduce planted area and therefore volume, with a lag of seasons.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Northern corridor competition redirecting export flows',
        body:
          'Investment in northern ports and alternative rail routes shortens the distance to water for some producing regions. Flows that shift north do not come back, and the company\'s capex is committed to the southern corridor.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A poor harvest against a fixed cost base',
        body:
          'With most costs fixed, a drought or a planting reduction removes contribution margin immediately. It is a weather exposure sitting inside an infrastructure valuation.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'rail3-duration',
        title: 'A contract to 2058 is the longest-dated cash flow in the Brazilian market',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Almost every Brazilian concession is a medium-dated asset amortising to a reversion date inside a normal valuation horizon. This one runs to 2058, which means the terminal value problem that dominates the rest of the sector barely applies: there are three decades of contractual, indexed, volume-driven cash flow to discount. Combined with a corridor where rail beats trucking decisively and a duplicate railway cannot be built, that duration is the asset — and as Brazilian real rates fall, a very long cash flow revalues upward mechanically.',
        requires: [
          'The concession runs to term with its committed investment executed near plan',
          'Grain volumes on the corridor grow with planted area and export demand',
          'Real interest rates continue declining',
        ],
        breaks: [
          'Northern port and rail routes capturing a material share of the flows the capex was built for',
          'Capex overruns on the committed programme, which the tariff cannot absorb',
          'Real rates rising, which reverses the duration benefit directly',
        ],
        modelLink: [
          { assumption: 'amortiseToYear', note: 'Set the concession end at 2058. The whole thesis is that this asset has a duration the sector does not.' },
          { assumption: 'WACC / discount rate', note: 'A three-decade cash flow is highly rate-sensitive. Test across a real rate range rather than a single WACC.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'rail3-harvest-and-capex',
        title: 'A weather exposure and a fixed obligation, both inside an infrastructure valuation',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The revenue is volume times tariff, and the volume is grain — dependent on planted area, yields and rainfall. The cost base is track and rolling stock, almost entirely fixed, so a poor harvest removes contribution margin immediately. Layered on that is a committed capex programme obtained in exchange for the concession extension, which must be spent regardless of what the harvest does and which is sized against volume forecasts decades out, on a corridor where northern port routes are actively competing for the same flows.',
        requires: [
          'Committed capex remains mandatory regardless of volumes',
          'Northern routes continue attracting investment and capturing flows',
          'Farm income pressure eventually reduces planted area in the served regions',
        ],
        breaks: [
          'Volume growth on the corridor that comfortably absorbs the capacity being built',
          'Rebalancing of the capex obligation if volumes disappoint',
          'Northern route capacity constraints keeping flows on the southern corridor',
        ],
        modelLink: [
          { assumption: 'Revenue driver — tonne-kilometres', note: 'Model a poor-harvest year explicitly rather than smoothing volumes. Fixed costs make the single bad year matter.' },
          { assumption: 'Capex path', note: 'The committed programme is not discretionary. Model it as fixed while flexing volumes, and see what the covenants do.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Farm Policy News — farm income to fall in 2026 despite government payments', url: 'https://farmpolicynews.illinois.edu/2026/02/farm-income-to-fall-in-2026-despite-hefty-govt-payments/' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
    ],
  },

  {
    ticker: 'EMBR3',
    sector: 'Industrials',
    scope: 'BRAZIL',
    headline:
      'A commercial and executive aircraft manufacturer with a backlog measured in years, a golden share held by the Brazilian government, and an industry where the constraint is the supply chain rather than demand.',
    howItEarns: [
      {
        heading: 'Aircraft delivered, plus a services business that follows the fleet',
        body:
          'Revenue comes from delivering commercial regional jets, executive aircraft and defence products, recognised on delivery. Behind each delivery sits decades of parts and maintenance revenue at far better margins, which is the annuity attached to every airframe sold.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The backlog converts to cash only as fast as suppliers allow',
        body:
          'With a multi-year order book, revenue is set by how many aircraft can be built rather than how many are ordered. Engine, casting and structural bottlenecks have capped delivery rates industry-wide, which means an order book that cannot be delivered is not the same asset as one that can.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'A corporation with dispersed ownership and no controlling shareholder, subject to a golden share held by the Brazilian federal government carrying veto rights over specific matters including change of control and certain defence decisions.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the government\'s golden share holding defined veto powers.',
      relatedPartyExposure: [
        'The government\'s golden share can block change of control and specific strategic decisions',
        'Defence contracts negotiated with the same government that holds the veto',
        'Risk-sharing partnerships with suppliers who share development cost and programme economics',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'No controlling block, so board composition is contested',
        'NYSE listing and its disclosure obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The golden share blocked a sale and defines the strategic ceiling',
        body:
          'Government veto rights over change of control mean the company cannot be acquired, which removes takeover premium as a source of return and also protects it from being absorbed. The failed combination with a foreign manufacturer demonstrated both the veto\'s relevance and the strategic constraint it imposes.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Risk-sharing partnerships spread development cost and programme upside',
        body:
          'Aircraft programmes are developed with suppliers who fund part of the cost in exchange for a share of the economics. That reduces the capital at risk on a new programme and permanently gives away part of its return, which is a reasonable trade for a manufacturer of this size and one that caps the margin.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Certification and installed base in regional aircraft',
        mechanism:
          'Certifying a commercial aircraft takes years and billions, and airlines that operate a type have invested in pilots, maintenance and spares. A competitor must certify a product and then persuade an operator to absorb transition costs.',
        evidence: 'A dominant position in the regional jet segment sustained against attempts by larger manufacturers to enter it.',
        erodedBy: 'A new entrant with state support certifying a competing type, and larger manufacturers stretching narrowbodies down into the segment.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Services revenue attached to the delivered fleet',
        mechanism:
          'Parts, maintenance and support for aircraft in service generate margin for decades after delivery, and an operator generally cannot source them elsewhere.',
        evidence: 'A services business that grows with the installed fleet independently of new delivery rates.',
        erodedBy: 'Third-party parts approvals and independent maintenance providers taking share of the aftermarket.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Programme development funded partly through risk-sharing partners, plus defence and executive aviation as diversification. The company has survived cycles that removed competitors, and the capital intensity of aircraft development is permanent.',
      good: [
        'Using risk-sharing partnerships to fund programme development, limiting the capital at risk on any single aircraft',
        'Building executive aviation and defence into genuine businesses that diversify away from airline order cycles',
      ],
      bad: [
        'A period of programme development and restructuring costs that consumed years of cash flow with delayed returns',
        'Dependence on a supply chain the company does not control, which has capped deliveries and therefore revenue',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The industry backlog is roughly a decade of production',
        body:
          'Commercial aerospace carries an order backlog of approximately 14,000 to 17,000 aircraft — close to 60% of the active fleet and about twelve years of output at current rates. Demand is not the constraint anywhere in this industry.',
        basis: 'REPORTED',
      },
      {
        heading: 'Supply chain bottlenecks are the binding limit on revenue',
        body:
          'Engine, casting and structural shortages have constrained delivery rates across the industry for several years. That means the backlog converts to cash more slowly than the order book suggests, and a manufacturer\'s revenue is set by its suppliers.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Supply chain constraints capping deliveries',
        body:
          'Revenue is recognised on delivery, and delivery depends on engines and structures arriving. The company can hire and buy material and still not deliver, which produces inventory and underabsorbed cost rather than revenue.',
        basis: 'REPORTED',
      },
      {
        heading: 'Currency mismatch between costs and revenue',
        body:
          'Aircraft are sold in dollars while a substantial part of the cost base is in reais. A stronger real compresses margin with no operational cause, and the hedging only defers it.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'embr3-backlog-conversion',
        title: 'Demand is settled; the whole question is throughput',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'With an industry backlog close to 60% of the active fleet and around twelve years of production, no aircraft manufacturer needs to win orders — it needs to build. That inverts the usual analysis: revenue growth comes from delivery rate improvement rather than from market share or economic recovery, and each delivery adds decades of higher-margin services revenue behind it. Every increment of supply chain relief converts directly into revenue that is already contracted, which is a far more knowable growth path than demand forecasting.',
        requires: [
          'Supply chain bottlenecks ease enough to raise delivery rates',
          'Backlog orders convert rather than being deferred or cancelled',
          'Services revenue continues growing with the installed fleet',
        ],
        breaks: [
          'Supply constraints persisting, so the backlog ages without converting',
          'Order deferrals or cancellations as airlines reassess capacity',
          'A stronger real compressing margin on dollar-denominated deliveries',
        ],
        modelLink: [
          { assumption: 'Revenue driver — aircraft delivered', note: 'Model deliveries explicitly against backlog rather than a revenue growth rate. Throughput is the entire variable.' },
          { assumption: 'Segment margins', note: 'Services carries far better margin than aircraft delivery. Model them separately or the mix effect disappears.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'embr3-golden-share-and-fx',
        title: 'A veto that removes the takeover premium and a currency that removes the margin',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Two structural features cap the return regardless of operations. The government\'s golden share blocks change of control, which was demonstrated when a combination with a foreign manufacturer failed — so the strategic premium a subscale aerospace manufacturer would normally attract is unavailable. And the revenue is dollar-denominated while a large part of the cost base is in reais, so a currency appreciation compresses margin with no operational cause and hedging only moves the timing. Neither is a risk that management can fix, and both belong in the discount rate.',
        requires: [
          'The golden share remains in place with its veto rights',
          'The cost base remains substantially in reais against dollar revenue',
        ],
        breaks: [
          'A change to the golden share arrangement permitting a strategic transaction',
          'Cost base dollarisation through international manufacturing that removes the mismatch',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'A permanent block on change of control removes an option the market otherwise prices. State it as a premium.' },
          { assumption: 'EBITDA margin path', note: 'Model margin against a range of exchange rates rather than one. The sensitivity is the thesis.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Aerospace Manufacturing and Design — 2026 aerospace manufacturers outlook', url: 'https://www.aerospacemanufacturinganddesign.com/article/2026-forecast-aerospace-manufacturers-industry-outlook/' },
      { label: 'IATA — aerospace supply chain bottlenecks continue to constrain airlines', url: 'https://www.iata.org/en/pressroom/2025-releases/2025-12-09-02/' },
      { label: 'Flight Plan — Airbus and Boeing orders and deliveries, 2026', url: 'https://flightplan.forecastinternational.com/2026/05/12/airbus-and-boeing-report-april-2026-commercial-aircraft-orders-and-deliveries/' },
    ],
  },

  {
    ticker: 'WEGE3',
    sector: 'Industrials',
    scope: 'BRAZIL',
    headline:
      'The rare Brazilian industrial that exports engineering rather than commodities — family-controlled, consistently the most expensive stock in the market, and the one whose multiple is the whole argument.',
    howItEarns: [
      {
        heading: 'Electric motors and automation, made cheaply and sold globally',
        body:
          'Motors, drives, automation systems, transformers and generators sold into industrial, commercial and energy applications across more than a hundred countries. Vertical integration — the company makes its own castings, windings and electronics — plus manufacturing in low-cost locations produces a cost position that supports both price competitiveness and high margins.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Short-cycle products and long-cycle projects, in different proportions',
        body:
          'Standard motors sold through distribution are a short-cycle, book-and-ship business that tracks industrial activity. Transformers, generation equipment and large automation projects are long-cycle with a backlog. The mix determines how quickly a slowdown reaches the income statement.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the founding families through a holding structure that has been stable for decades, with a substantial institutional free float and significant foreign ownership.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the founding families holding the controlling block.',
      relatedPartyExposure: [
        'A controlling family group decides the capital programme and the pace of international expansion',
        'A long-standing employee participation culture that aligns staff with the company',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'A decades-long record of disclosure and consistent capital allocation',
        'A large foreign institutional register that has engaged on valuation and capital deployment',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The best long-run capital allocation record among Brazilian industrials',
        body:
          'Decades of organic expansion funded from cash flow, low leverage, consistent returns on capital above the cost of capital, and no history of destructive acquisitions or diversification outside the core. For a controlled Brazilian company that record is the argument for the control rather than against it.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Conservatism is the visible feature and it has a cost',
        body:
          'Very low leverage and organic growth mean the company does not use its balance sheet to accelerate, which caps growth in periods when acquisition would have been accretive. That is a deliberate choice by owners with a multi-generational horizon, and a shareholder wanting faster compounding is not aligned with it.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Vertical integration producing a genuine cost advantage',
        mechanism:
          'Making its own castings, windings, electronics and enclosures, in low-cost manufacturing locations, gives a cost per motor that competitors buying components cannot match — which lets the company compete on price in developed markets while earning high margins.',
        evidence: 'Operating margins materially above global electrical equipment peers, sustained while gaining international share.',
        erodedBy: 'Component cost inflation that affects the company more than competitors, and currency appreciation that removes the local-cost advantage.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Distribution and specification in industrial markets',
        mechanism:
          'Motors are specified by engineers and bought through distributors who stock what is asked for. Getting onto approved vendor lists and into distributor inventory takes years, and it is why an installed base persists across product generations.',
        evidence: 'International revenue share grown steadily over decades against entrenched local competitors.',
        erodedBy: 'Chinese manufacturers competing on price in the standard product segment, where specification matters least.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Organic capacity expansion funded from cash flow, low leverage maintained through cycles, and selective bolt-on acquisitions in adjacent products or geographies. There is very little to criticise and the conservatism is itself a choice.',
      good: [
        'Decades of organic international expansion funded internally, without the leverage or dilution most industrials use',
        'Bolt-on acquisitions confined to adjacent products and geographies where the existing manufacturing advantage applies',
      ],
      bad: [
        'A balance sheet so conservative that acquisition opportunities were declined in periods when they would have been accretive',
        'Exposure to wind turbine and generation equipment cycles that have been considerably more volatile than the motor business',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Reshoring and electrification are demand tailwinds that are genuinely policy-driven',
        body:
          'Manufacturing relocation and public infrastructure programmes create demand for motors, drives and automation that is slow and policy-supported rather than cyclical. The industrial machinery market is projected to grow at a mid-single-digit rate through the next decade on exactly those drivers.',
        basis: 'REPORTED',
      },
      {
        heading: 'Tariffs hit a company that ships heavy goods across borders',
        body:
          'Capital goods carry long supply chains and long order-to-delivery lags, so a tariff arrives as a cost on equipment already priced. For an exporter manufacturing in Brazil and selling into North America and Europe, trade policy is an operating variable rather than background.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The multiple, which is the entire risk',
        body:
          'The business is excellent and the shares have persistently traded at a premium to global industrial peers. Almost the whole range of outcomes for a shareholder depends on whether that premium holds rather than on the company\'s own performance.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Currency appreciation removing the cost advantage',
        body:
          'Manufacturing in reais and selling in dollars and euros is the source of the margin. A stronger real compresses it directly, with no operational cause and no offset.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'wege3-cost-plus-specification',
        title: 'A low-cost manufacturer selling into specified markets, which is a rare combination',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Most low-cost manufacturers compete only on price and earn commodity margins. This one makes its own components in low-cost locations and sells into markets where engineers specify the product and distributors stock it — so it captures a cost advantage and a specification position at the same time. That is why margins exceed global peers while international share keeps rising, and why reshoring and electrification demand reach it as a genuine tailwind rather than as a narrative.',
        requires: [
          'The vertical integration cost advantage holds against component cost inflation',
          'The currency does not appreciate enough to erase the manufacturing differential',
          'Reshoring and electrification demand continues supporting industrial equipment orders',
        ],
        breaks: [
          'A materially stronger real compressing export margins',
          'Chinese competition taking the standard product segment on price in the company\'s export markets',
          'Tariffs on capital goods raising the landed cost of Brazilian-manufactured equipment',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Model the margin against a range of exchange rates. The cost advantage is a currency position as much as an engineering one.' },
          { assumption: 'Revenue growth by geography', note: 'Model domestic and export revenue separately. They have different drivers and different margins.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'wege3-multiple-risk',
        title: 'An excellent company where the multiple is the investment decision',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'There is very little to dispute about the operating business: the returns on capital, the margin, the international expansion and the capital discipline are all genuine and long-established. That is precisely the problem — it is all known, and the shares have persistently traded at a premium to global industrial peers that assumes the compounding continues at the historical rate. A shareholder buying today is underwriting the multiple, not the company, and a high-quality industrial re-rating downward produces a poor outcome from an unchanged business. Growth is also organic and internally funded by choice, which caps how fast the earnings can catch up to the rating.',
        requires: [
          'The premium to global peers is sustained by continued above-peer growth',
          'Organic funding continues to cap the pace of expansion',
        ],
        breaks: [
          'Earnings growth accelerating enough to grow into the multiple',
          'A willingness to use the balance sheet for accretive acquisitions, raising the growth rate',
        ],
        modelLink: [
          { assumption: 'Terminal growth and exit multiple', note: 'Test the value at a peer-average exit multiple rather than the historical premium. That difference is the thesis.' },
          { assumption: 'Revenue growth', note: 'Organic, internally funded growth has a ceiling. Do not model acquisition-led growth this company has not done.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Global Market Insights — industrial machinery market outlook to 2035', url: 'https://www.gminsights.com/industry-analysis/industrial-machinery-market' },
      { label: 'CNABKE — 2026 global machinery and industrial equipment outlook: opportunities and risks', url: 'https://www.cnabke.com/en/blogs/2026-global-machinery-industrial-equipment-outlook.html' },
    ],
  },

  {
    ticker: 'RENT3',
    sector: 'Industrials',
    scope: 'BRAZIL',
    headline:
      'A car rental and fleet management company that is really a financing and used-car business: it buys vehicles with debt, rents them, and makes or loses the money on what they sell for.',
    howItEarns: [
      {
        heading: 'Rental revenue, then the residual value on resale',
        body:
          'Cars are bought at fleet discounts, rented for a period, then sold through a retail used-car network. The rental earns a daily rate and the disposal earns or loses the difference between the depreciated book value and the market price. Both matter, and the second is where the surprises are.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Fleet management is a contracted lease, not a rental',
        body:
          'Corporate fleet outsourcing is a multi-year contract at a fixed monthly fee, which is closer to a financial lease than to renting. That part of the business has predictable revenue and residual value risk concentrated at contract end rather than continuously.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No single controlling shareholder following the merger that combined the two largest Brazilian operators. Ownership is dispersed across Brazilian and foreign institutions with founder families holding significant non-controlling stakes.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'Founder family stakes from both merged entities, with influence but not control',
        'Vehicle purchase agreements with manufacturers who are also the source of the fleet discount the model depends on',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'No controlling block, so board composition is contested',
        'Disclosure of fleet size, average purchase price and average resale price, which makes the residual value question observable',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A merger that created scale and a large integration task',
        body:
          'Combining the two largest operators produced genuine purchasing scale with manufacturers and a national used-car retail network, and required divesting stores and fleet as a condition. The synergies are real; the integration and the leverage carried through a rising rate cycle are what determined the outcome.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Leverage against a depreciating asset is the structural feature',
        body:
          'Fleet is funded with debt and the asset securing it loses value by design. That is a financing business, and it means the company is exposed to the interest rate on the liability and the residual value of the asset simultaneously — a combination that turns hostile quickly.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Purchasing scale with vehicle manufacturers',
        mechanism:
          'Buying hundreds of thousands of cars a year secures a discount to list that no smaller operator obtains, and that discount is effectively the gross margin on the eventual resale.',
        evidence: 'Average fleet purchase prices materially below retail, sustained across the vehicle cycle.',
        erodedBy: 'Manufacturers reducing fleet channel discounts to protect retail pricing, which removes the advantage at the source.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'A national used-car retail network',
        mechanism:
          'Selling decommissioned fleet through own stores to retail buyers captures the retail rather than wholesale price, which is worth several percentage points of the vehicle value on every unit.',
        evidence: 'Resale prices achieved above wholesale auction levels, which is where the residual value margin comes from.',
        erodedBy: 'Used-car price weakness, and online marketplaces compressing the retail-to-wholesale spread.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Fleet growth funded with debt through a period when Brazilian rates rose above 15%, plus the merger integration. The recent direction has been to shrink fleet and prioritise returns over scale, which is the correct correction.',
      good: [
        'Reducing fleet and prioritising rate discipline over volume once funding costs rose',
        'Building the used-car retail network, which captures the retail rather than wholesale disposal price',
      ],
      bad: [
        'Fleet expansion funded with debt into a rising rate cycle, which compressed returns on a leveraged depreciating asset',
        'Merger leverage carried through the rate peak, leaving financial expense consuming a large share of operating profit',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The easing cycle helps on both sides of the balance sheet',
        body:
          'With Selic cut to 14.00% by August 2026 and falling, the cost of funding the fleet declines and consumer credit for used-car buyers becomes more available. Both effects are direct and both are the reverse of what happened on the way up.',
        basis: 'REPORTED',
      },
      {
        heading: 'Used-car prices depend on a consumer with record debt',
        body:
          'Residual values are set by what retail buyers will pay, and with 82% of Brazilian households carrying debt and credit rates above 25%, the buyer for a decommissioned fleet car is constrained. The disposal margin is hostage to the same consumer weakness that hurts retail.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Residual value falling below depreciated book value',
        body:
          'The whole model rests on selling cars for more than they are carried at. A used-car price decline turns the disposal from a source of margin into a loss on every unit, and the fleet is large.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Financial expense against a leveraged fleet',
        body:
          'Funding a depreciating asset with debt means the rate and the residual both matter. At Brazilian rates the interest cost consumes a large share of operating profit until the cycle turns further.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'rent3-rate-cycle-both-sides',
        title: 'The easing cycle relieves the funding cost and the buyer at the same time',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'This is a financing business dressed as a rental company, so the rate cycle works on it twice. Falling Selic reduces the cost of the debt funding the fleet, and it simultaneously restores consumer credit for the retail buyers who purchase decommissioned cars — which supports residual values, the other half of the margin. Both effects are direct and mechanical, and both were what made the rising cycle so painful. Add purchasing scale with manufacturers and a retail disposal network that captures retail rather than wholesale prices, and the operating model is sound once the financing cost normalises.',
        requires: [
          'Selic continues falling, reducing the cost of fleet funding',
          'Used-car prices hold or recover as consumer credit becomes available',
          'Fleet discipline is maintained rather than volume being chased as funding cheapens',
        ],
        breaks: [
          'Used-car price weakness persisting despite cheaper credit',
          'Manufacturers cutting fleet channel discounts, removing the purchasing advantage',
          'Fleet growth resuming aggressively as funding costs fall, repeating the previous cycle',
        ],
        modelLink: [
          { assumption: 'Cost of debt and debt schedule', note: 'Model the funding cost against the Selic path explicitly. This is a leveraged business and the rate is half the thesis.' },
          { assumption: 'Depreciation and residual value per vehicle', note: 'Model the resale price against depreciated book value. The disposal margin is the other half and it does not appear in a revenue line.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'rent3-residual-risk',
        title: 'A leveraged position in a depreciating asset whose exit price is set by a stretched consumer',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The company borrows to buy assets that lose value by design, and the return depends on selling them above the carried value to retail buyers. Those buyers are Brazilian households, 82% of whom carry debt at credit rates above 25%, in a market where broad retail contracted 2.2%. If used-car prices fall, the loss is on every unit in a very large fleet, arrives through depreciation and disposal rather than through revenue, and is compounded by the interest on the debt that bought them. This is the mechanism by which fleet businesses fail, and it does not require anything operational to go wrong.',
        requires: [
          'Consumer credit conditions remain tight enough to suppress used-car demand',
          'The fleet remains debt-funded at current leverage',
        ],
        breaks: [
          'A sustained recovery in used-car prices as credit becomes available',
          'Deleveraging to a level where residual value movements are absorbed rather than amplified',
        ],
        modelLink: [
          { assumption: 'Depreciation rate and residual value', note: 'Test a residual value below depreciated book. That converts depreciation into a real loss and it is where the model breaks.' },
          { assumption: 'Net debt and covenant headroom', note: 'Model leverage against a trough EBITDA and check the covenants. The risk is the interaction of the two.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
      { label: 'Itaponews — expensive credit and record household indebtedness', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
      { label: 'Brazil Economy — retail contraction and consumer conditions', url: 'https://brazileconomy.com.br/empresas/2026/08/varejo-brasileiro-enfrenta-mudanca-estrutural-diante-do-avanco-das-plataformas-digitais/' },
    ],
  },

  {
    ticker: 'POMO4',
    sector: 'Industrials',
    scope: 'BRAZIL',
    headline:
      'A truck and bus manufacturer controlled by a German parent, selling into a market where the buyer is a freight operator financing the purchase at Brazilian rates.',
    howItEarns: [
      {
        heading: 'Trucks and buses sold to operators who borrow to buy them',
        body:
          'Heavy and medium commercial vehicles sold to freight companies, agricultural operators and bus fleets. Almost every unit is financed, so the effective price to the buyer is the instalment rather than the sticker — which makes the interest rate as important to volumes as the vehicle price.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Parts and service follow the fleet for a decade',
        body:
          'A truck in service generates parts and maintenance revenue for many years at margins well above the vehicle sale. That aftermarket revenue follows the installed fleet rather than current orders, which is what keeps the company profitable through a demand trough.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by a German commercial vehicle group, with preferred shares (POMO4) carrying the market liquidity and no vote. Strategy, product and capital allocation follow the parent\'s global framework.',
      voting:
        'Preferred shares have no vote; control rests with the ordinary shares the parent holds. Minority capital has economics without a say.',
      relatedPartyExposure: [
        'The parent supplies technology, platforms and components, and those transfer prices determine the Brazilian entity\'s margin',
        'Product decisions and export allocation are made within the parent\'s global structure',
        'The parent\'s own financial condition and strategic priorities reach the subsidiary directly',
      ],
      minorityProtections: [
        'Preferred dividend priority under Brazilian corporate law',
        'B3 disclosure requirements',
        'Local manufacturing and a domestic supplier base that give the Brazilian entity operational substance independent of the parent',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Transfer pricing with the parent determines the reported margin',
        body:
          'Platforms, engines and components supplied by the parent are priced between related parties, and that price decides how much of the vehicle\'s profit is recognised in Brazil rather than in Germany. Minority holders own the Brazilian entity and not the group, so the allocation is not neutral to them.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A non-voting share class concentrates the exposure',
        body:
          'Minority capital sits in preferred shares with the full economics and no vote on strategy, product or capital. Combined with a foreign parent whose priorities are set abroad, that is the classic subsidiary minority position.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Dealer and service network across Brazilian freight corridors',
        mechanism:
          'A truck operator buys where it can get parts and service on the routes it runs. A dealer and workshop network along the main freight corridors takes decades to build and is what makes the vehicle serviceable, which is why operators are reluctant to switch brands.',
        evidence: 'Sustained market share in Brazilian heavy trucks across cycles, with aftermarket revenue following the installed fleet.',
        erodedBy: 'Competitors building comparable networks, and Chinese manufacturers entering with price and building service over time.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Local manufacturing and a domestic supplier base',
        mechanism:
          'Producing in Brazil avoids import duties, qualifies for local content in financing programmes and shortens lead times, which imported competitors cannot match on cost or availability.',
        evidence: 'Access to subsidised equipment financing programmes that require local content, which imported vehicles do not qualify for.',
        erodedBy: 'Trade liberalisation, and local assembly by new entrants that qualifies them for the same programmes.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Product and capacity decisions follow the parent\'s global plan, with local investment in manufacturing and the dealer network. Distributions have been substantial in good years, which is appropriate for a business with limited independent growth options.',
      good: [
        'Maintaining the dealer and service network, which is the actual competitive asset and the source of aftermarket margin',
        'Distributing cash in strong years rather than retaining it for investment decided abroad',
      ],
      bad: [
        'Capital and product strategy determined by a parent whose priorities are European rather than Brazilian',
        'Cyclical capacity utilisation that has swung violently with the freight cycle and the availability of subsidised financing',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Subsidised equipment financing is the demand mechanism',
        body:
          'Brazilian heavy vehicle demand has historically turned on the availability and rate of subsidised investment financing programmes. When those are funded and cheap, orders arrive; when they are not, the market halves. It is closer to the housing programme dynamic than to a normal capital goods cycle.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Freight volumes follow the harvest',
        body:
          'Truck demand derives from the freight to be moved, and in Brazil that is dominated by agricultural output heading to port. Farm income pressure reaches the operator\'s appetite for a new truck with a lag of seasons.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Financing availability and rates determining volumes',
        body:
          'With almost every unit financed, the order book is a credit condition rather than a demand condition. A subsidised programme being unfunded can halve the market with no change in freight volumes.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Chinese entrants building networks over time',
        body:
          'The moat is a dealer and service network, which a well-funded entrant can build. It takes years, which is the protection, and years is not forever.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'pomo4-aftermarket-ballast',
        title: 'The installed fleet pays the bills when nobody is buying trucks',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Heavy vehicle sales are among the most violently cyclical revenue lines in any market, and Brazilian sales are additionally hostage to subsidised financing availability. What makes the business survivable is that every truck already sold generates parts and service revenue for a decade at margins well above the vehicle, through the dealer network that is the real competitive asset. As Selic falls from above 15%, the financing that drives new orders becomes affordable again while the aftermarket keeps running — so the recovery arrives on top of a base that never disappeared.',
        requires: [
          'Falling rates restore financing availability for freight operators',
          'The dealer and service network retains the aftermarket as the fleet ages',
          'Agricultural freight volumes support operator replacement appetite',
        ],
        breaks: [
          'Subsidised financing programmes remaining unfunded regardless of the rate',
          'Chinese entrants taking share in both new vehicles and the parts aftermarket',
          'Farm income weakness reducing planted area and therefore freight volumes',
        ],
        modelLink: [
          { assumption: 'Segment margins — vehicles versus parts and services', note: 'Model the aftermarket separately. It is the counter-cyclical base and a blended margin hides it entirely.' },
          { assumption: 'Revenue driver — units sold', note: 'Drive volumes off financing availability and rates rather than off GDP. That is the actual mechanism.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'pomo4-subsidiary-minority',
        title: 'A non-voting stake in a subsidiary whose margin is set by transfer prices',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Minority capital sits in preferred shares with the full economics and no vote, in a company controlled by a German parent that also supplies its platforms, engines and components. The price of those intercompany supplies determines how much of each vehicle\'s profit is recognised in Brazil rather than abroad — and minority holders own the Brazilian entity, not the group. Product strategy, export allocation and capital are decided in Europe against European priorities. None of that is improper and all of it means the reported margin is partly an allocation decision made by the counterparty.',
        requires: [
          'The parent retains control and remains the principal component supplier',
          'Minority capital remains in the non-voting class',
        ],
        breaks: [
          'A migration to a single voting share class, which would align votes with economics',
          'Local sourcing that reduces the share of cost bought from the parent',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Add an explicit premium for a non-voting minority in a subsidiary with related-party supply. Stating it makes it arguable.' },
          { assumption: 'Gross margin', note: 'The gross margin is partly a transfer price. Test the valuation across a range rather than extrapolating the reported level.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
      { label: 'Farm Policy News — farm income to fall in 2026', url: 'https://farmpolicynews.illinois.edu/2026/02/farm-income-to-fall-in-2026-despite-hefty-govt-payments/' },
      { label: 'CNABKE — 2026 global machinery and industrial equipment outlook', url: 'https://www.cnabke.com/en/blogs/2026-global-machinery-industrial-equipment-outlook.html' },
    ],
  },

  {
    ticker: 'DE',
    sector: 'Industrials',
    scope: 'GLOBAL',
    headline:
      'An agricultural equipment maker in the thirty-sixth consecutive month of a demand contraction, whose consolidated balance sheet is dominated by a captive finance company holding used equipment as collateral while used values fall.',
    howItEarns: [
      {
        heading: 'Machines sold once, serviced for twenty years',
        body:
          'Agricultural, construction and forestry equipment sold through independent dealers, with parts and service generating margin for the life of the machine. The aftermarket is roughly double the margin of the original equipment and follows the installed base rather than the order cycle, which is what sustains profitability through a downturn.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The finance arm is a bank the group does not call one',
        body:
          'A captive finance company funds dealer inventory and customer purchases, and carries most of the group\'s debt. Consolidated leverage therefore looks alarming until it is separated, and the collateral behind that book is used equipment whose value falls in exactly the downturn that raises the default risk.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder, though a large long-term investment vehicle holds a stake around ten per cent. Ownership is otherwise dispersed across institutional and index managers.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'The captive finance company lends to the dealers who sell the group\'s equipment, so credit decisions and sales incentives interact',
        'A large long-term shareholder with a permanent horizon and board access',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'Separate reporting of the finance segment, which allows industrial and financial leverage to be distinguished',
        'SEC reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The captive finance arm is where the risk is least visible',
        body:
          'Funding customer purchases raises equipment sales in a good market and accumulates credit exposure secured on depreciating machines. In a downturn used values fall, which weakens the collateral and the trade-in that funds the next purchase simultaneously. It behaves like a bank precisely when it matters, and it is not analysed as one.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Production has been restrained rather than pushed into the dealer channel',
        body:
          'Manufacturers have cut output and reduced inventories through this downturn rather than building into a dealer glut. That is the correct discipline and the opposite of the industry\'s historical behaviour, and it is why the correction has been shallower than the demand decline alone implies.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Dealer network with entrenched service relationships',
        mechanism:
          'A farmer buys where the machine can be serviced quickly during a harvest window, and dealers carry the brand\'s parts and trained technicians. Switching brands means switching dealers, which a farmer with a narrow planting window will not do lightly.',
        evidence: 'Market share in large agricultural equipment sustained across cycles, with aftermarket revenue attached to the installed base.',
        erodedBy: 'Right-to-repair rules reducing the service tie, and competitors building comparable dealer coverage.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Precision agriculture installed on the existing fleet',
        mechanism:
          'Guidance, prescription and connected-machine software installed on machines already in service creates switching costs and the possibility of recurring revenue, which converts a cyclical equipment sale into something closer to a subscription.',
        evidence: 'A growing base of connected machines with software features sold as ongoing services.',
        erodedBy: 'Third-party precision platforms that work across brands, which would break the tie to the machine.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Large and consistent buybacks, a modest dividend, and investment in precision agriculture technology. Production discipline in the downturn has been better than the industry\'s historical record.',
      good: [
        'Restraining production and reducing dealer inventories through the downturn rather than building into a glut',
        'Investing in precision agriculture, which is a genuine attempt to convert a cyclical sale into recurring revenue',
      ],
      bad: [
        'Buybacks concentrated in the peak years, which is the standard cyclical error of returning most capital when the shares are most expensive',
        'A finance book whose collateral quality deteriorates in the same downturn that raises its default risk, which is a correlated exposure rather than a diversifying one',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Thirty-six consecutive months below the growth-neutral level',
        body:
          'US tractor sales fell 10.9% and combines 5.3% year on year in July 2026, and the Creighton rural equipment index sat at 22.2 against a growth-neutral 50 — its thirty-sixth straight month below that line. Farm income is forecast to fall in 2026 despite government payments.',
        basis: 'REPORTED',
      },
      {
        heading: 'The problem is affordability, not only demand',
        body:
          'Machinery prices stayed high while farm incomes fell, so the replacement decision is being deferred rather than downgraded. That builds pent-up demand and delays it, which makes the eventual recovery sharper and its timing unknowable.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Used equipment values undermining the trade-in and the collateral',
        body:
          'Falling used values reduce the trade-in that funds a new purchase and weaken the security behind the finance book. Both effects deepen and lengthen the correction, and both operate through the balance sheet rather than the order book.',
        basis: 'REPORTED',
      },
      {
        heading: 'Tariffs on equipment already priced into a backlog',
        body:
          'Capital goods carry long order-to-delivery lags, so a tariff arrives as a cost on machines whose price is already agreed. It compresses margin on revenue already contracted.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'de-deferred-replacement',
        title: 'Three years of deferred replacement is pent-up demand, not destroyed demand',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A farmer who does not replace a combine still needs a combine. Thirty-six consecutive months below the growth-neutral level, with machinery prices high and farm incomes falling, means the fleet is ageing and the replacement is deferred rather than cancelled — and manufacturers have restrained production rather than flooding the dealer channel, so the correction is not being deepened by inventory. Meanwhile the aftermarket runs at roughly double the equipment margin on an installed base that grows older and needs more parts. The recovery is a question of when, and the balance sheet and the aftermarket fund the wait.',
        requires: [
          'Production discipline holds so dealer inventories do not build',
          'Aftermarket revenue continues growing with an ageing installed fleet',
          'Farm income stabilises enough to release the deferred replacement',
        ],
        breaks: [
          'Used equipment values falling far enough to impair the finance book and the trade-in mechanism',
          'Crop prices staying low for long enough that deferred replacement becomes reduced fleet size',
          'Tariffs compressing margin on equipment already priced in the backlog',
        ],
        modelLink: [
          { assumption: 'Revenue driver — machines sold', note: 'Model unit volumes recovering from a trough on a deferred-replacement schedule rather than a growth rate off a depressed base.' },
          { assumption: 'Segment margins — equipment versus aftermarket', note: 'The aftermarket is roughly double the margin and does not follow the order cycle. Model it separately or the trough looks worse than it is.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'de-captive-finance',
        title: 'A bank inside an industrial, holding depreciating collateral in a downturn',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Most of the group\'s debt sits in a captive finance company whose loan book is secured on used equipment — and used equipment values fall in the same downturn that raises the borrowers\' default risk. That is a correlated exposure, not a diversifying one, and the market analyses the group on industrial multiples while carrying financial leverage of roughly three times EBITDA on a consolidated basis. The tell is that the collateral, the trade-in that funds the next sale, and the borrower\'s income all deteriorate together, which is precisely how a captive finance arm turns a cyclical slowdown into a credit event.',
        requires: [
          'Used equipment values continue declining',
          'Farm income pressure persists, raising borrower stress',
          'The finance book remains a large share of consolidated leverage',
        ],
        breaks: [
          'Used values stabilising, which restores both the collateral and the trade-in',
          'Loss experience in the finance book staying within historical ranges through the trough',
        ],
        modelLink: [
          { assumption: 'Segment separation — industrial versus financial', note: 'Model the finance arm separately with its own leverage and loss assumptions. Consolidated leverage of three times EBITDA is not an industrial figure.' },
          { assumption: 'Cost of risk / provisions', note: 'Give the finance book a cost-of-risk assumption as you would a bank. That line does not exist in an industrial model and it is where this thesis lives.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'farmdoc daily — farm machinery demand remains weak (Aug 2026)', url: 'https://farmdocdaily.illinois.edu/2026/08/farm-machinery-demand-remains-weak-as-manufacturers-manage-production/' },
      { label: 'Agrolatam — US tractor and combine sales collapse, May 2026', url: 'https://www.agrolatam.com/machine/us-tractor-combine-sales-collapse-may-2026/' },
      { label: 'Farm Policy News — farm income to fall in 2026 despite government payments', url: 'https://farmpolicynews.illinois.edu/2026/02/farm-income-to-fall-in-2026-despite-hefty-govt-payments/' },
      { label: 'Agrolatam — US farm machinery market 2026: sales, tariffs, inventories', url: 'https://www.agrolatam.com/usa/machine/us-farm-machinery-sales-2026-tariffs-inventories-prices/' },
    ],
  },

  {
    ticker: 'CAT',
    sector: 'Industrials',
    scope: 'GLOBAL',
    headline:
      'The machine is sold once and the parts are sold for twenty years — which is why a company selling equipment into cyclical end markets earns margins that look nothing like a cyclical industrial\'s.',
    howItEarns: [
      {
        heading: 'Construction, mining and energy equipment, sold through independent dealers',
        body:
          'Excavators, haul trucks, engines and turbines sold into construction, resource extraction and power generation. The dealer network is independently owned, which means the company sells to dealers rather than to end users and the dealers carry the inventory and the customer relationship.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The aftermarket is the business the multiple should reflect',
        body:
          'Parts, service and rebuilds on machines already in the field carry roughly double the margin of the original equipment and follow the installed base rather than the order cycle. A mining truck runs for decades and is rebuilt repeatedly, and the owner has no alternative supplier for the components.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Independent dealers who are the sole channel to end customers and hold the inventory position',
        'A captive finance arm lending to dealers and end customers against the equipment sold',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'Separate reporting of the financial products segment',
        'SEC reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Dealer inventory is where the cycle is managed and hidden',
        body:
          'Because the company sells to independent dealers, reported revenue reflects what dealers order rather than what end users buy. Dealer inventory changes therefore amplify the cycle in both directions, and the disclosure of that gap is what separates a real demand read from a channel one.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A services revenue target is the strategic commitment worth tracking',
        body:
          'Management has framed growth around raising services revenue rather than machine volumes, which is the correct direction for a cyclical manufacturer. Whether that target is met is the clearest available test of whether the cyclicality is genuinely being reduced or merely described differently.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Installed base with captive parts economics',
        mechanism:
          'A mining haul truck or excavator runs for decades and is rebuilt several times, and the parts come from the manufacturer. Downtime on a mine site costs far more than a part, so operators do not risk third-party components on critical equipment.',
        evidence: 'Aftermarket margins roughly double equipment margins, on revenue that follows the installed fleet rather than orders.',
        erodedBy: 'Third-party and remanufactured parts taking share, and customers accepting more downtime risk to save cost.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'The independent dealer network',
        mechanism:
          'Dealers with decades of local relationships, service capability and parts inventory are effectively irreplaceable distribution. A competitor entering a region must build the same network before it can promise uptime.',
        evidence: 'A dealer network with coverage and tenure no competitor has replicated in the major markets.',
        erodedBy: 'Direct sales models and rental channels bypassing dealers, and dealer consolidation increasing their leverage.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Large and consistent buybacks and dividend growth funded by genuine free cash flow, with capital directed toward services capability and power generation rather than equipment capacity. The cyclical timing of the buybacks is the recurring criticism.',
      good: [
        'Directing growth investment toward services and aftermarket capability rather than adding equipment capacity into a cyclical market',
        'Building the energy and power generation business, whose demand drivers are data centre and grid investment rather than construction',
      ],
      bad: [
        'Buybacks weighted toward peak years, which is returning most capital when the shares are most expensive',
        'A captive finance book secured on used equipment, whose collateral weakens in the same downturn that raises default risk',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Power generation demand is the new and genuinely large driver',
        body:
          'US data centre power demand is projected to rise from 31 GW in 2025 to 41 GW in 2026 and 66 GW the year after. Reciprocating engines, turbines and backup generation for those facilities is equipment demand with a multi-year order book and nothing to do with the construction cycle.',
        basis: 'REPORTED',
      },
      {
        heading: 'Reshoring and infrastructure support the heavy equipment base',
        body:
          'Manufacturing relocation and federal infrastructure programmes create demand for heavy and material handling equipment that is policy-driven and slow. It partially offsets weakness in resource and residential construction.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Dealer inventory unwinding faster than end demand falls',
        body:
          'Reported revenue is dealer orders. When dealers destock, revenue falls faster than end-user activity and the reported cycle is worse than the real one — and the reverse on the way up, which is how this business surprises in both directions.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Tariffs on equipment already in a backlog',
        body:
          'Long order-to-delivery lags mean a tariff arrives as a cost on machines already priced. It compresses margin on contracted revenue, and the supply chain response takes years.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'cat-power-generation',
        title: 'The data centre build is equipment demand with no construction cycle attached',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'US data centre power demand is forecast to roughly double from 31 GW to 66 GW within two years, and every one of those facilities needs turbines, reciprocating engines and backup generation ordered years ahead. That is a multi-year order book driven by compute investment rather than by construction or resource cycles, arriving at a company whose aftermarket already earns roughly double the equipment margin on a growing installed base. The demand driver is new, large, and unrelated to the cycle the shares are rated on.',
        requires: [
          'Data centre power equipment demand converts to orders at the forecast pace',
          'Aftermarket revenue keeps growing with the installed base',
          'Dealer inventories stay balanced so reported revenue tracks end demand',
        ],
        breaks: [
          'Data centre capital plans being deferred, which removes the order book rather than delaying it',
          'Dealer destocking that makes reported revenue worse than end demand',
          'Tariffs compressing margin on equipment already priced in the backlog',
        ],
        modelLink: [
          { assumption: 'Segment margins and revenue by segment', note: 'Model energy and transportation separately from construction industries. The thesis lives entirely in one segment.' },
          { assumption: 'Revenue driver — machines sold versus aftermarket', note: 'Aftermarket is roughly double the margin and follows the fleet. Blended, the quality of the earnings disappears.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'cat-channel-cycle',
        title: 'Reported revenue is dealer orders, and the peak is where buybacks happened',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The company sells to independent dealers, so revenue reflects channel orders rather than end-user demand — which means a destocking cycle produces a revenue decline steeper than the underlying market, and it has done so repeatedly. On top of that, capital returns have been weighted to the peak years, so the most shares were repurchased at the highest prices. Add a captive finance book secured on used equipment whose value falls in the same downturn that raises default risk, and the consolidated picture is more cyclical and more levered than the aftermarket narrative suggests.',
        requires: [
          'Dealer inventories remain elevated relative to end demand',
          'Capital returns continue being sized against current rather than mid-cycle earnings',
        ],
        breaks: [
          'Dealer inventories normalising so reported revenue tracks end demand',
          'Buybacks sized against mid-cycle earnings rather than peak cash flow',
        ],
        modelLink: [
          { assumption: 'Revenue driver — machines sold', note: 'Model dealer orders and end-user demand as different things. The destocking gap is the thesis.' },
          { assumption: 'Share count and buyback timing', note: 'Test per-share value with buybacks sized at mid-cycle earnings rather than peak cash flow.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Goldman Sachs — US data centre power demand projected to double by 2027', url: 'https://www.goldmansachs.com/insights/articles/us-data-center-power-demand-projected-to-double-by-2027' },
      { label: 'CNABKE — 2026 global machinery and industrial equipment outlook', url: 'https://www.cnabke.com/en/blogs/2026-global-machinery-industrial-equipment-outlook.html' },
      { label: 'Global Market Insights — industrial machinery market outlook', url: 'https://www.gminsights.com/industry-analysis/industrial-machinery-market' },
    ],
  },

  {
    ticker: 'HON',
    sector: 'Industrials',
    scope: 'GLOBAL',
    headline:
      'A conglomerate in the process of dismantling itself into three, where the aerospace aftermarket is the asset worth owning and the announced separation is the thesis.',
    howItEarns: [
      {
        heading: 'Aerospace aftermarket, which is most of the value',
        body:
          'Avionics, engines and auxiliary power units certified on aircraft in service generate spares and repair revenue for the airframe\'s life, at margins far above the original equipment. Certification means the operator cannot substitute a part, so the revenue follows the installed fleet and flight hours rather than new aircraft orders.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Three other businesses with unrelated drivers',
        body:
          'Building automation, industrial automation and advanced materials each serve different customers with different cycles. The logic that held them together was operating discipline applied across portfolios, and that logic is now being abandoned by the company itself.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Risk and revenue sharing arrangements with airframe manufacturers on specific aerospace programmes',
        'Separation agreements and shared services arrangements that will govern the relationship between the entities after the breakup',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'Segment reporting sufficient to value the businesses separately, which is what makes the breakup case testable',
        'SEC reporting obligations and an active proxy record including activist engagement',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The company has accepted that the conglomerate structure was the problem',
        body:
          'Announcing a separation into independent aerospace, automation and materials companies is an admission that the diversified structure was destroying value rather than creating it. That is the right conclusion and it arrived after activist pressure, which says something about how the board reached it.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Separations create costs and dis-synergies before they create value',
        body:
          'Splitting a conglomerate involves duplicated corporate functions, transitional service agreements, tax structuring and stranded costs. The value case rests on the separated multiples exceeding the conglomerate multiple by more than those costs, and the costs are certain while the multiples are not.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Certified aerospace content on in-service aircraft',
        mechanism:
          'Once a component is certified on an aircraft type, it is the only legal option for that application for the airframe\'s service life. The operator must buy the part or the repair from the certificate holder, at whatever the catalogue says.',
        evidence: 'Aftermarket margins far above original equipment, on revenue that follows flight hours and the installed fleet.',
        erodedBy: 'Parts manufacturer approvals allowing third-party alternatives, and fleet retirements removing the installed base.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Installed base in building automation and control systems',
        mechanism:
          'Building control systems installed in commercial property are replaced on multi-decade cycles and generate service and upgrade revenue in between, with switching requiring recommissioning the building.',
        evidence: 'Recurring service revenue attached to an installed base across commercial real estate.',
        erodedBy: 'Open protocol and software-defined building systems that reduce the tie to the original hardware vendor.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Decades of bolt-on acquisitions across four portfolios, consistent buybacks and dividend growth, and now a structural separation. The acquisitions were individually defensible and collectively produced a conglomerate discount the company is now dismantling.',
      good: [
        'Announcing the separation, which addresses the structural discount rather than arguing against it',
        'Sustained investment in the aerospace aftermarket, which is the highest-return part of the portfolio',
      ],
      bad: [
        'Decades of portfolio expansion that built a diversified structure the company has now concluded should not exist',
        'Acquisitions in advanced materials and automation that did not earn returns comparable to aerospace, diluting the blended return on capital',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The aerospace backlog is roughly a decade of production',
        body:
          'Commercial aerospace carries a backlog of approximately 14,000 to 17,000 aircraft, close to 60% of the active fleet. Every aircraft delivered adds decades of certified aftermarket content, so the installed base grows regardless of how fast airframers can build.',
        basis: 'REPORTED',
      },
      {
        heading: 'Supply chain bottlenecks delay deliveries and not flight hours',
        body:
          'Engine and structural shortages have capped delivery rates industry-wide, which slows new installed-base growth. The existing fleet keeps flying and generating aftermarket demand, and constrained new deliveries actually extend the service life of aircraft already in the air.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Separation costs exceeding the re-rating',
        body:
          'Dis-synergies, duplicated corporate functions and stranded costs are certain. The multiple expansion that justifies them is not, and a breakup executed into a weak market can destroy value on the way to unlocking it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Aftermarket share loss to approved third-party parts',
        body:
          'Regulatory approval of alternative parts is the mechanism that erodes a certified aftermarket position, and it advances slowly and permanently.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'hon-breakup-value',
        title: 'The separation is the catalyst, and the aerospace aftermarket is what is being unlocked',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A certified aerospace aftermarket business generating high-margin recurring revenue from an installed base that grows with every aircraft delivered deserves a far higher multiple than a diversified industrial conglomerate receives. The company has accepted this and is separating into independent entities. The value case is arithmetic rather than operational: rate each business against its own peer set instead of applying one conglomerate multiple, deduct the separation costs, and compare. Segment reporting makes it testable, which is what distinguishes this from most breakup stories.',
        requires: [
          'The separation completes broadly as announced',
          'The aerospace entity is rated against aerospace peers rather than industrial ones',
          'Separation costs and dis-synergies stay within the announced range',
        ],
        breaks: [
          'Separation costs and stranded overhead exceeding the multiple expansion',
          'The separated entities trading at a discount to peers on subscale or leverage grounds',
          'Aftermarket share loss to approved alternative parts',
        ],
        modelLink: [
          { assumption: 'Segment margins and separate valuation', note: 'This is a sum of the parts. Value each segment against its own peers and deduct separation costs explicitly, rather than applying one multiple.' },
          { assumption: 'Revenue driver — aftermarket versus original equipment', note: 'The aerospace value is the aftermarket. Model it off flight hours and installed base, not off airframe deliveries.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'hon-breakup-costs',
        title: 'Breakups cost money now and unlock value later, if at all',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Separating a conglomerate produces duplicated corporate functions, transitional service agreements, tax leakage and stranded costs — all certain, all immediate. The re-rating that justifies them requires the independent entities to be valued against their best peers, which assumes they are seen as comparable in scale, growth and balance sheet. Subscale industrial spin-offs frequently are not. Meanwhile the announced separation was reached under activist pressure rather than from conviction, which is not the profile of a management team best placed to execute a three-way split cleanly.',
        requires: [
          'Separation costs and dis-synergies prove material relative to the value unlocked',
          'The independent entities are judged subscale relative to their peer sets',
        ],
        breaks: [
          'Separation executed at low cost with each entity rated in line with peers',
          'Evidence that the businesses were already being managed independently enough that dis-synergies are minimal',
        ],
        modelLink: [
          { assumption: 'One-off separation costs and stranded overhead', note: 'Model these explicitly in the equity bridge. A sum of the parts that ignores them overstates the unlock.' },
          { assumption: 'Exit multiple by segment', note: 'Test the sum of the parts at a discount to peer multiples rather than at parity. The gap is the thesis.' },
        ],
        conviction: 'LOW',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Aerospace Manufacturing and Design — 2026 aerospace manufacturers outlook', url: 'https://www.aerospacemanufacturinganddesign.com/article/2026-forecast-aerospace-manufacturers-industry-outlook/' },
      { label: 'IATA — aerospace supply chain bottlenecks continue to constrain airlines', url: 'https://www.iata.org/en/pressroom/2025-releases/2025-12-09-02/' },
      { label: 'Honeywell Aerospace — Form 8-K, FY2026', url: 'https://www.sec.gov/Archives/edgar/data/0002089271/000162828026043193/exhibit991-informationstat.htm' },
    ],
  },

  {
    ticker: 'UPS',
    sector: 'Industrials',
    scope: 'GLOBAL',
    headline:
      'A fixed-cost network sized for a parcel volume that trade policy has just removed: sub-$800 parcel imports into the United States fell about 54% after the de minimis exemption was suspended.',
    howItEarns: [
      {
        heading: 'Density economics: the last parcel on a route is nearly all profit',
        body:
          'A delivery network has enormous fixed cost in sorting facilities, aircraft and routes. Once a driver is on a street, an additional stop costs very little, so profitability follows volume density and package mix rather than parcel count alone. That also means a volume decline falls almost entirely through to profit.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Revenue per package is the lever that has been doing the work',
        body:
          'With volumes stagnant, earnings growth has come from pricing, surcharges and shifting mix toward higher-yield segments such as healthcare and business-to-business. That is finite: price can be raised until customers route volume elsewhere.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder in economic terms, but a dual-class structure gives super-voting shares — held substantially by founding family interests and long-term holders — control of the vote.',
      voting:
        'Class A shares carry ten votes and Class B one, so voting control rests with holders whose economic stake is far smaller than their influence.',
      relatedPartyExposure: [
        'A super-voting class held by long-term and family interests, whose horizon and priorities differ from the public shareholder base',
        'A heavily unionised workforce whose contract terms are negotiated periodically and set a large share of the cost base',
      ],
      minorityProtections: [
        'Class B economic rights and dividend parity',
        'SEC reporting obligations',
        'A large institutional register that has engaged publicly on capital allocation and the cost base',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A dual-class structure in a business facing structural decisions',
        body:
          'Super-voting shares mean the shareholders who must approve a major restructuring are not the ones bearing most of the economics. In a business that needs to shrink a network, renegotiate labour and reset its cost base, the alignment between voting control and economic exposure matters more than usual.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Labour contracts fix a large share of the cost base for years',
        body:
          'A multi-year union agreement locks wage and benefit costs regardless of what volumes do. When the contract was signed against expected volume growth that did not arrive, the cost base becomes fixed at a level the network cannot support — which is the position a fixed-cost operator least wants.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Route density and integrated air and ground network',
        mechanism:
          'Owning aircraft, sorting hubs and delivery routes at national scale gives a cost per package no new entrant can approach, and time-definite delivery commitments require the whole integrated system rather than a piece of it.',
        evidence: 'Cost per package and service reliability that regional and asset-light competitors have not matched at national scale.',
        erodedBy: 'Large shippers insourcing their own delivery, which removes the densest and most profitable volume from the network.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Healthcare and specialist logistics capability',
        mechanism:
          'Temperature-controlled, validated and regulated shipping for pharmaceuticals requires facilities, qualifications and audit history that take years to build, and the revenue per package is far above standard parcels.',
        evidence: 'Higher-yield healthcare volumes growing as a deliberate mix shift away from commoditised business-to-consumer parcels.',
        erodedBy: 'Specialist competitors and manufacturers building their own cold chain capability.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A long dividend record maintained through a volume decline, network automation investment, and facility closures. The strategic choice to prioritise revenue per package over volume is correct and has limits.',
      good: [
        'Shifting mix toward healthcare and higher-yield segments rather than defending commoditised parcel volume on price',
        'Closing facilities and automating sorting to reduce the fixed cost base as volumes fell',
      ],
      bad: [
        'A labour agreement signed against volume growth expectations that did not materialise, fixing a large cost base in a declining network',
        'A dividend maintained and grown through a structural volume decline, which constrains the flexibility needed to resize the network',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Trade policy removed a large share of the lowest-value volume',
        body:
          'Sub-$800 parcel volume entering the United States fell by approximately 54% after the de minimis exemption was suspended, and the European Union applies a €3 duty on parcels below €150 from 1 July 2026. That is a structural reduction in exactly the high-count, low-value cross-border flow networks were sized for.',
        basis: 'REPORTED',
      },
      {
        heading: 'The lost volume was low-yield, which softens the earnings impact',
        body:
          'Cross-border low-value parcels carried poor revenue per package. Losing them hurts density and helps mix, so the effect on profit is smaller than the volume decline suggests — but a fixed-cost network still has to be resized around it.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Fixed costs against a permanently smaller network',
        body:
          'If the volume decline is structural rather than cyclical, the network must shrink — and a unionised cost base fixed by contract makes shrinking slow and expensive. The mismatch between a fixed cost and a falling volume is how a network operator loses money quickly.',
        basis: 'REPORTED',
      },
      {
        heading: 'Large shippers insourcing the densest volume',
        body:
          'The most profitable packages are the dense, predictable ones, and those are exactly what a large e-commerce shipper can deliver itself. Losing them removes the volume that pays for the network.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'ups-mix-over-volume',
        title: 'The volume that left was the volume worth losing',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The 54% collapse in sub-$800 parcel imports removed high-count, low-value cross-border flow that earned very little per package and consumed sorting capacity. Losing it hurts density and improves mix, and the company has been deliberately steering the same direction — toward healthcare, business-to-business and specialist logistics where revenue per package is a multiple of a standard parcel. With facility closures and automation reducing the fixed base, a smaller, higher-yield network can earn more than a larger commoditised one. The thesis is revenue per package, not volumes.',
        requires: [
          'Revenue per package continues rising as mix shifts toward healthcare and business-to-business',
          'Facility closures and automation reduce the fixed cost base in step with volumes',
          'Large shippers do not insource the dense, profitable volume',
        ],
        breaks: [
          'Density falling far enough that cost per package rises despite the better mix',
          'The unionised cost base preventing the network from being resized',
          'Price increases pushing customers to route volume to competitors',
        ],
        modelLink: [
          { assumption: 'Revenue driver — packages and revenue per package', note: 'Model volume and yield separately. The thesis is that yield rises faster than volume falls, and a single revenue line hides it.' },
          { assumption: 'Fixed versus variable cost split', note: 'Density economics mean cost per package rises as volume falls. If the model flexes cost with revenue, it is not testing this.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'ups-fixed-cost-mismatch',
        title: 'A network and a labour contract sized for volumes that are not coming back',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'This is a fixed-cost business facing a structural volume reduction: cross-border low-value parcels into the United States down about 54% by policy, and the European Union imposing a duty on the same flow from July 2026. A multi-year union agreement fixes a large share of the cost base regardless, and it was negotiated against volume growth that did not arrive. Density is the entire cost advantage, so fewer packages on the same routes raises cost per package at the same time as revenue falls. Resizing a unionised network is slow and expensive, and the dividend is being maintained through it.',
        requires: [
          'The volume reduction proves structural rather than cyclical',
          'Labour cost remains fixed by contract while volumes decline',
          'Network resizing continues to lag the volume decline',
        ],
        breaks: [
          'Cross-border volume rerouting through channels that still use the network',
          'A labour agreement renegotiated to variable cost terms',
          'Domestic volume growth offsetting the lost cross-border flow',
        ],
        modelLink: [
          { assumption: 'Revenue driver — package volumes', note: 'Model a structurally lower volume base rather than a cyclical dip, and hold the cost base fixed. That combination is the thesis.' },
          { assumption: 'Operating leverage', note: 'Test the margin with volumes down and cost per package up. Density working in reverse is the mechanism.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Carra Globe — US de minimis exemption suspended in 2026', url: 'https://carraglobe.com/us-de-minimis-exemption-suspended-2026/' },
      { label: 'Council of the EU — customs duty on small parcels from 1 July 2026', url: 'https://www.consilium.europa.eu/en/press/press-releases/2025/12/12/customs-council-agrees-to-levy-customs-duty-on-small-parcels-as-of-1-july-2026/' },
      { label: 'Bird & Bird — new EU customs duty handling fees and VAT requirements from 2026', url: 'https://www.twobirds.com/en/insights/2026/new-customs-duty-handling-fees-and-vat-requirements-starting-from-2026-five-things-ecommerce-busi' },
    ],
  },
];
