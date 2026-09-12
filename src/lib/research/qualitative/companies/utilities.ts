import type { CompanyQualitative } from '../types';

export const UTILITIES: CompanyQualitative[] = [
  {
    ticker: 'CMIG4',
    sector: 'Utilities',
    scope: 'BRAZIL',
    headline:
      'A state-controlled distributor facing a periodic tariff review in May 2026, in a year when the regulator cut the distributor\'s own remuneration in every process it decided.',
    howItEarns: [
      {
        heading: 'A regulated return on the asset base, earned by beating the regulator\'s cost assumption',
        body:
          'Cemig buys energy, delivers it over its own network in Minas Gerais, and collects a tariff ANEEL sets. Earning above the allowed return means operating below the benchmark cost the regulator assumed, holding losses below the allowed level, and collecting what was billed. There is no pricing decision anywhere in the business.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Generation and transmission are the better assets and the smaller ones',
        body:
          'Hydro generation with long concession terms and indexed transmission revenue carry much higher margins than distribution, which is the bulk of revenue. Consolidated EBITDA margin is a weighted average of a thin regulated distribution business and two good ones, which is why a single multiple describes none of them.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the State of Minas Gerais, which holds a majority of the ordinary shares. The controller is a state government with its own fiscal position and electoral calendar.',
      voting:
        'Preferred shares (CMIG4) carry the liquidity and no vote; the state holds the ordinary shares and votes them. Minority capital has economics without any say.',
      relatedPartyExposure: [
        'The controlling shareholder is a state government whose fiscal needs are served by dividends from the company',
        'Senior management and board appointments follow state political cycles',
        'Tariff and investment decisions interact with state policy on electricity prices for consumers who are also voters',
      ],
      minorityProtections: [
        'Preferred dividend priority under Brazilian corporate law',
        'ANEEL regulation, which sets the tariff independently of the controller',
        'NYSE ADR reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Two principals with opposite interests in the same tariff',
        body:
          'The state wants dividends from the company and low bills for its residents, and those pull in opposite directions. A minority shareholder holds a non-voting claim on the outcome of that internal conflict. The company has been professionally run through recent years, but the structure means this is a matter of the current administration\'s preference rather than of protection.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Privatisation talk is recurrent and has not happened',
        body:
          'Sale of the state\'s stake has been discussed across multiple administrations and has repeatedly stalled on political and legal obstacles. An investor should treat it as optionality with no date rather than as a thesis, and should not pay for it.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'An exclusive distribution concession covering nearly all of Minas Gerais',
        mechanism:
          'A distribution network is a legal monopoly for its concession term, and no second operator is permitted to build a competing network in the same area. The asset cannot be duplicated because duplication is forbidden.',
        evidence: 'Exclusive service of one of the largest consumption areas in Brazil under a long-dated concession contract.',
        erodedBy: 'Concession expiry and renewal terms, and free-market migration of large customers out of the captive base.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Mandated network investment plus divestment of non-core stakes accumulated in earlier eras. The direction has been toward simplification and toward the regulated asset base, which is the right one, though it was a long time coming.',
      good: [
        'Selling down minority stakes in unrelated generation projects that consumed capital without control',
        'Meeting the regulatory investment programme, which grows the asset base the return is earned on',
      ],
      bad: [
        'A legacy of minority positions in assets the company did not control, assembled for reasons that were not commercial',
        'Periods of dividend policy driven by the state\'s fiscal calendar rather than by the company\'s capital needs',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The May 2026 tariff review is the single most important event on the calendar',
        body:
          'A periodic review resets Parcela B — the distributor\'s own allowed cost and return — along with quality targets and Factor X. Cemig\'s review was scheduled for May 2026, one of fifteen ANEEL processes in the year. In the 2026 annual adjustments already decided, the portion remunerating the distributor fell in every case analysed, by 2% to 4.5%.',
        basis: 'REPORTED',
      },
      {
        heading: 'The bill rises and the company does not benefit',
        body:
          'ANEEL projected an average increase near 8.6% for 2026, driven by charges rather than by distributor remuneration — the CDE budget alone was proposed at R$52.7 billion, up around 7% on distributed-generation subsidies. Cemig collects and passes that through, earning nothing on it while bearing the collection risk and the consumer reaction.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'An adverse outcome in the periodic review',
        body:
          'The review sets the return for the next cycle. A low allowed WACC or an aggressive Factor X compresses earnings for years, and no operational response recovers it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Behind-the-meter generation eroding billed volume',
        body:
          'Distributed generation reduces the kilowatt-hours billed while the network cost stays. Because allowed revenue is recovered over volume, a shrinking base either raises the tariff on those remaining or under-recovers.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'cmig4-sotp',
        title: 'A thin regulated business and two good ones, priced as one average',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Distribution earns a regulated return in the mid-teens on its asset base; hydro generation with long concession terms and indexed transmission revenue earn far more per real of revenue. A single EBITDA multiple on the consolidated company rates the generation and transmission assets at the distribution business\'s rating. Valuing each on its own contract and asset base — distribution on the regulatory asset base, transmission as an indexed annuity to its concession end, generation on contracted energy — produces a different number, and the parts are separately disclosed enough to do it.',
        requires: [
          'Segment disclosure remains sufficient to value the parts separately',
          'The May 2026 review outcome is no worse than the recent pattern of small Parcela B reductions',
          'Transmission and generation concessions run to term without adverse renegotiation',
        ],
        breaks: [
          'A materially adverse periodic review that impairs the distribution return for the cycle',
          'Generation concession renewal terms that transfer value to the granting authority',
          'State direction of dividends or investment that consumes the good assets\' cash flow',
        ],
        modelLink: [
          { assumption: 'Segment margins', note: 'Value each activity against its own contract rather than applying one consolidated multiple. That gap is the thesis.' },
          { assumption: 'Terminal value / amortiseToYear', note: 'Concession assets must amortise to their contract end. A perpetual terminal value on a concession is a modelling error, not a view.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'cmig4-regulatory-squeeze',
        title: 'The regulator is transferring the distributor\'s margin to the consumer while the bill still rises',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The 2026 tariff processes did two things at once: charges rose more than ten per cent in six of seven cases, up to nineteen in one, and the portion remunerating the distributor fell in every case, by two to four and a half per cent. That is a regulator facing an unaffordable bill and squeezing the one component it can compress without a political cost. A model that extends the historical allowed return through the May 2026 review is assuming the regulator stops doing what it has just done seven times.',
        requires: [
          'Charge growth continues to consume the headroom in the tariff',
          'ANEEL continues to protect the consumer bill by compressing Parcela B',
          'Distributed-generation subsidies are not reformed',
        ],
        breaks: [
          'Subsidy reform that relieves the charge burden and restores tariff headroom',
          'A periodic review that grants a return consistent with the market cost of capital',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Compress the distribution margin from the review date rather than holding the historical allowed return.' },
          { assumption: 'WACC', note: 'The regulatory WACC is the ceiling on returns here. If it is set below the market cost of capital, no operating improvement fixes it.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'O Tempo — 2026 average bill increase of 8% and Cemig\'s May tariff review', url: 'https://www.otempo.com.br/economia/2026/3/17/conta-de-luz-tera-aumento-medio-de-8-em-2026-diz-aneel-reajuste-tarifario-da-cemig-e-em-maio' },
      { label: 'Agência iNFRA / Abradee — charges and subsidies pressuring the bill', url: 'https://agenciainfra.com/blog/abradee-encargos-e-subsidios-pressionam-reajustes-na-conta-de-luz/' },
      { label: 'Poder360 — ANEEL projects 8.6% increase for 2026', url: 'https://www.poder360.com.br/poder-infra/aneel-projeta-alta-de-86-na-conta-de-luz-em-2026/' },
      { label: 'ANEEL — tariff review decisions', url: 'https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/revisao-tarifaria-periodica-da-energisa-sul-sudeste-e-aprovada-pela-aneel' },
    ],
  },

  {
    ticker: 'EQTL3',
    sector: 'Utilities',
    scope: 'BRAZIL',
    headline:
      'A distribution turnaround specialist with no controlling shareholder, which buys underperforming concessions and closes the gap to the regulator\'s benchmark — a model that only works while there are bad concessions left to buy.',
    howItEarns: [
      {
        heading: 'The gap between a badly run concession and the regulatory benchmark',
        body:
          'ANEEL sets an allowed cost and an allowed level of losses. A concession operating worse than those assumptions destroys value; one operating better keeps the difference until the next review. Equatorial buys the first kind and converts it into the second by cutting non-technical losses, improving collection and rebuilding the network. The value created is the closing of that gap, and it is measurable.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Transmission and sanitation extend the same competence',
        body:
          'Transmission lots won at auction and sanitation concessions apply the same skill — building infrastructure to a contracted revenue on time and below the bid assumption. Sanitation in particular is a regulated-return business at an earlier stage of the same consolidation Brazilian electricity distribution went through.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'A corporation with no controlling shareholder and no shareholders\' agreement. Ownership is dispersed across domestic and foreign institutional investors with a very large free float.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'A board without an anchor shareholder is accountable to a dispersed register, which makes strategy more contestable and less predictable',
        'The acquisition-led model means minority capital funds a continuous stream of purchase decisions',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'No controlling block and no shareholders\' agreement, so board seats are contested',
        'ANEEL regulation of every concession, independent of the shareholder register',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Dispersed ownership with a demonstrated operating discipline',
        body:
          'This is the rare Brazilian utility with no state or family controller, and the record has been one of disciplined bidding and delivered turnarounds rather than empire-building. The governance risk is not extraction; it is that an acquisitive company with no anchor holder can keep acquiring, and each deal is harder than the last because the easy concessions have been bought.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Leverage is the mechanism the model runs on',
        body:
          'Turnarounds are funded with debt against a regulated cash flow, which is appropriate — but it means the company carries acquisition leverage continuously rather than in cycles, and a rate shock or an adverse review arrives on a balance sheet that is always working.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'A repeatable turnaround capability',
        mechanism:
          'Cutting non-technical losses requires field operations, data, legal capacity and political relationships in poor concession areas — an organisational skill that has been built over several acquisitions and that competitors bidding for the same assets have not demonstrated.',
        evidence: 'Successive acquisitions of loss-heavy concessions brought toward regulatory benchmarks within a review cycle.',
        erodedBy: 'Running out of underperforming concessions to buy, or paying prices at auction that already assume the turnaround.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'A serial acquirer that has generally paid disciplined prices for assets others did not want and then improved them. The model is genuinely value-creating and it is also self-limiting: each success raises what the market expects the company to pay for the next one.',
      good: [
        'Buying distressed distribution concessions at prices that did not assume the turnaround, then delivering it',
        'Extending into transmission and sanitation, where the same build-to-contract discipline applies',
      ],
      bad: [
        'A permanently levered balance sheet, which leaves less capacity when an adverse review or rate shock arrives',
        'Diversification into adjacent regulated sectors that spreads management attention across more regulators and more concession contracts',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Loss reduction is worth more when the regulator is squeezing Parcela B',
        body:
          'With the distributor\'s allowed remuneration falling 2% to 4.5% in the 2026 processes, operating below the benchmark is the only remaining source of return. A company whose entire competence is beating the benchmark is better placed for that environment than one that merely meets it.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Concession areas with high losses are also areas with weak collection',
        body:
          'The turnaround targets are poor regions where theft and delinquency are structural. With a record 82% of Brazilian households carrying debt, collection is harder precisely in the concessions where the value creation is supposed to come from.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Paying a price that already assumes the turnaround',
        body:
          'The model depends on buying below the value of the improved asset. As the track record becomes known, auction prices rise to reflect it and the excess return disappears — this is the way the strategy ends rather than fails.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Continuous acquisition leverage meeting an adverse review',
        body:
          'A permanently working balance sheet has less room to absorb a bad periodic review or a rate shock than a mature utility that is not acquiring.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'eqtl3-turnaround',
        title: 'The only Brazilian utility whose return comes from operating better, not from the tariff',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Every distributor earns the same regulated return on the same kind of asset base. The dispersion in outcomes comes entirely from whether a company operates above or below the regulator\'s cost and loss assumptions, and this company has built an organisation around closing that gap in concessions others mismanaged. That matters more in 2026 than usual: with ANEEL cutting the allowed remuneration in every process it decided, beating the benchmark is the only return left available.',
        requires: [
          'Underperforming concessions and sanitation assets remain available at prices that do not price the turnaround',
          'Loss and collection improvements continue to be delivered within a review cycle',
          'Leverage stays serviceable through the tariff cycle',
        ],
        breaks: [
          'Auction prices rise to reflect the turnaround the company would deliver, removing the excess return',
          'A concession where losses prove structural rather than operational and the gap does not close',
          'A rate shock or adverse review on a permanently levered balance sheet',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'The thesis is margin convergence toward the regulatory benchmark in acquired concessions. Model it as a ramp, not a step.' },
          { assumption: 'Capex path', note: 'Turnarounds require network investment before they produce the loss reduction. The capex comes first and the margin follows.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'eqtl3-runway',
        title: 'A serial acquirer eventually runs out of things worth acquiring',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The value creation is real and it is not recurring from the existing asset base — it comes from the next acquisition. Brazilian electricity distribution has largely consolidated, the remaining underperforming concessions are fewer and harder, and the company\'s own track record is now priced into what it must bid. Extending into sanitation buys runway and also moves the company into a sector with different regulators, different contracts and no accumulated advantage. A model that extrapolates the historical growth rate is extrapolating an acquisition pipeline rather than a business.',
        requires: [
          'The pipeline of mispriced concessions continues to narrow',
          'Competing bidders price in the achievable turnaround',
        ],
        breaks: [
          'A large new privatisation programme in sanitation or distribution that reopens the opportunity set',
          'Demonstrated organic return improvement in the mature concessions without new acquisitions',
        ],
        modelLink: [
          { assumption: 'Revenue growth / terminal growth', note: 'Separate organic growth in the existing concessions from growth by acquisition. A terminal growth rate that embeds future deals is assuming the pipeline, not the business.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ANEEL — periodic tariff review decisions', url: 'https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/revisao-tarifaria-periodica-da-energisa-sul-sudeste-e-aprovada-pela-aneel' },
      { label: 'Agência iNFRA / Abradee — Parcela B compression in the 2026 processes', url: 'https://agenciainfra.com/blog/abradee-encargos-e-subsidios-pressionam-reajustes-na-conta-de-luz/' },
      { label: 'Itaponews — household indebtedness and collection conditions', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
    ],
  },

  {
    ticker: 'TAEE11',
    sector: 'Utilities',
    scope: 'BRAZIL',
    headline:
      'The closest thing in the Brazilian market to an inflation-linked bond with an equity listing — contracted transmission revenue, no volume risk, and a terminal value that is zero by contract.',
    howItEarns: [
      {
        heading: 'Permitted annual revenue, indexed, regardless of how much power flows',
        body:
          'A transmission concession pays an annual permitted revenue for keeping the lines available, adjusted for inflation each year. It does not depend on how many megawatt-hours cross the line, on the power price, or on economic activity. The operator earns it by keeping availability high and cost below the assumption in its bid.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Construction is where the return is won or lost',
        body:
          'Lots are awarded at auction to the lowest permitted revenue bid. Once signed, the revenue is fixed and indexed while the capital cost is not, so the entire project return is decided by whether the line is built for less than the bid assumed. Everything after commissioning is collection and maintenance.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Jointly controlled under a shareholders\' agreement between Cemig — itself controlled by the State of Minas Gerais — and a Colombian transmission group, with units providing the public float.',
      voting:
        'Units combining ordinary and preferred shares carry the liquidity; control is exercised by the two blocks under agreement. Unit holders have economics and limited voting weight.',
      relatedPartyExposure: [
        'One controller is a state-controlled utility whose own fiscal and political pressures reach this company indirectly',
        'Two industrial controllers who also bid for transmission lots in their own right, which raises the question of which vehicle gets which opportunity',
        'Dividend policy is set by controllers who may want cash upstreamed for their own purposes',
      ],
      minorityProtections: [
        'B3 Level 2 obligations, including tag-along and arbitration',
        'Concession contracts that fix revenue independently of any shareholder decision',
        'Preferred dividend priority within the unit structure',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Two controllers who are also competitors for the same auctions',
        body:
          'Both shareholders build transmission elsewhere on their own account. Which entity bids for which lot is a decision made inside the controlling relationship, and a minority holder cannot see whether the best opportunities are coming to this company or going to its shareholders directly. It is the structural conflict in a jointly controlled vehicle.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A very high payout, which is the correct policy and also a controller preference',
        body:
          'With no volume risk and a contracted revenue stream, there is little reason to retain earnings unless a project pipeline needs funding. High distributions suit minorities and also suit controllers who want cash — the interests happen to align, which is different from being protected.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Signed concession contracts that cannot be competed with',
        mechanism:
          'Each line has a contract granting exclusive permitted revenue for its term. No competitor may build a parallel line to take the revenue, and no market price can undercut it.',
        evidence: 'Revenue that has been stable and indexed through Brazilian recessions, currency crises and power-price collapses alike.',
        erodedBy: 'Contract expiry, and adverse renegotiation of reinforcement or renewal terms with the granting authority.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A discipline of bidding for lots and distributing whatever is not needed to build them. The company has walked away from auctions priced below its return threshold, which is the correct behaviour and shows up as slower growth.',
      good: [
        'Declining lots where the implied return did not clear the cost of capital, rather than bidding to win',
        'Sustaining a very high payout rather than retaining cash with no project to fund',
      ],
      bad: [
        'Growth entirely dependent on an auction calendar the company does not control, with no organic alternative',
        'Periods where competition for lots compressed returns and the company either overpaid or stood still',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Immune to almost everything squeezing the rest of the sector',
        body:
          'The 2026 tariff pressure, the charge burden, the Parcela B compression, distributed generation eroding billed volume — none of it touches a transmission concession. The revenue is contracted and indexed, and the risk is concentrated entirely in construction and in the auction.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Indexation makes this a duration instrument',
        body:
          'A long, inflation-linked, contracted cash flow behaves like an indexed bond, so the share price moves with real interest rates more than with anything the company does. As Selic falls from above 15%, that is a tailwind arriving through the discount rate rather than through earnings.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Concession expiry with no compensation for residual value',
        body:
          'The lines revert to the grantor at the end of the term. A valuation must amortise each concession to its own expiry and assign no perpetual value, and any terminal figure is an implicit bet on winning replacement lots.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Auction competition compressing project returns',
        body:
          'Infrastructure funds with lower return requirements bid the same lots. The company\'s growth then requires either accepting worse returns or not growing.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'taee11-indexed-annuity',
        title: 'An indexed annuity mispriced as an equity',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Transmission revenue is contracted, inflation-linked and independent of volume, power price and economic activity. That is a bond\'s cash flow profile with an equity\'s discount rate applied to it. As Brazilian real rates fall through the easing cycle, the value of a long indexed stream rises mechanically — and none of the 2026 regulatory pressure compressing distribution margins reaches this business at all. The investment case is duration plus a signed contract, not an operating story.',
        requires: [
          'Concession contracts run to term with indexation applied as written',
          'Real interest rates continue to decline',
          'Availability is maintained so that permitted revenue is collected in full',
        ],
        breaks: [
          'Real rates rise, which reverses the duration benefit directly',
          'Adverse renegotiation of indexation or reinforcement terms',
          'A construction overrun on a committed lot that consumes several years of distributions',
        ],
        modelLink: [
          { assumption: 'WACC / discount rate', note: 'This thesis is mostly a discount-rate view. Test the value against a range of real rates rather than a single WACC.' },
          { assumption: 'Revenue indexation', note: 'Model revenue growth as the contractual index, not as a growth rate. There is no volume driver here.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'taee11-terminal-zero',
        title: 'The terminal value is zero by contract, and most models do not say so',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Every line reverts to the grantor at the end of its concession with no compensation for residual value. A discounted cash flow with a growth-in-perpetuity terminal value applied to this company is not optimistic, it is wrong — it assigns value to an asset the contract says will not exist. Once the terminal value is removed and each concession is amortised to its own expiry, the company\'s growth depends entirely on winning replacement lots at returns above its cost of capital, in auctions where infrastructure funds accept less.',
        requires: [
          'Concessions continue to expire without renewal compensation',
          'Auction competition keeps new lot returns close to the cost of capital',
        ],
        breaks: [
          'A regulatory framework change granting compensation or automatic extension at expiry',
          'A sustained widening of auction returns that makes replacement genuinely accretive',
        ],
        modelLink: [
          { assumption: 'amortiseToYear / terminal growth', note: 'Set each concession to amortise to its contract end and the terminal growth to zero. If the valuation collapses, the model was carrying value the contract does not grant.' },
          { assumption: 'Capex path', note: 'Replacement growth requires winning lots. Model new capex only where a lot is actually contracted.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ANEEL — transmission and tariff regulatory decisions', url: 'https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/revisao-tarifaria-periodica-da-energisa-sul-sudeste-e-aprovada-pela-aneel' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
    ],
  },
];
