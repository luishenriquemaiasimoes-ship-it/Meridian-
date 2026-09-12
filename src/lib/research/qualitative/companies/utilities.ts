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

  {
    ticker: 'SBSP3',
    sector: 'Utilities',
    scope: 'BRAZIL',
    headline:
      'A newly privatised water utility being asked to raise investment 151% while its 2026 tariff recovers only accumulated inflation — with an operator as reference shareholder and the state still holding 18%.',
    howItEarns: [
      {
        heading: 'A regulated return on sanitation infrastructure, earned over decades',
        body:
          'Sabesp supplies water and collects sewage across most of São Paulo state under a contract with regulated tariffs set by ARSESP. Revenue is volume times tariff, but volume is close to inelastic — people use water regardless — so the business is effectively a regulated return on an asset base that grows as the network extends.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Growth is the universalisation mandate, not commercial expansion',
        body:
          'The regional sanitation plan approved in May 2024 contemplates R$260 billion of investment through 2060, with R$69 billion required to universalise water and sewage service by 2029 — a target pulled forward from 2033. That capital programme is the growth: every real invested enters the asset base the return is earned on, and the obligation is contractual rather than optional.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'Privatised in July 2024 through a R$14.8 billion follow-on offering. The Equatorial group holds 15% as reference shareholder, with the right to appoint the chief executive and directors plus three board seats, under a five-year lock-up running to 31 December 2029. The State of São Paulo retained 18.3%, down from 50.3%.',
      voting:
        'Ordinary shares. Neither the reference shareholder nor the state holds a majority, so control is exercised through the shareholders\' agreement and appointment rights rather than through votes.',
      relatedPartyExposure: [
        'The state is simultaneously a large shareholder, the counterparty to the concession contract, and the government whose voters pay the tariff',
        'The reference shareholder appoints management while holding only 15% of the economics, so it directs a company it mostly does not own',
        'Equatorial funded its stake with a large capital increase of its own, which links this company\'s governance to another listed company\'s balance sheet',
      ],
      minorityProtections: [
        'Novo Mercado listing: one share one vote, tag-along, minimum free float',
        'ARSESP regulation of tariffs, independent of any shareholder',
        'A published shareholders\' agreement and a contractual lock-up preventing the reference shareholder exiting before 2030',
        'A concession contract with defined targets, which constrains what the state can demand informally',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'An operator running the company and a state holding a fifth of it',
        body:
          'This is an unusual and, on balance, favourable structure: a private operator with distribution turnaround experience appoints the management, while the state retains a large economic interest that aligns it with the share price rather than only with the tariff. The risk is the reverse of the usual one — a reference shareholder with appointment rights but a minority economic stake has an incentive to run the company in ways that suit its own group, and the other 85% of holders rely on the agreement to prevent it.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The state is on both sides of the tariff',
        body:
          'São Paulo signs the concession, its agency sets the tariff, and it owns 18.3% of the company that collects it. When affordability and return conflict, the state has a financial interest in both answers, and which one prevails is a political judgement rather than a contractual one.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'A sanitation concession over the largest urban market in South America',
        mechanism:
          'Water and sewage networks are natural monopolies granted by contract, and no competitor is permitted to build a parallel system. The asset base is irreplaceable and the customer cannot switch supplier.',
        evidence: 'Exclusive service of the São Paulo metropolitan region and most of the state under a long-dated contract with defined targets.',
        erodedBy: 'Contract renegotiation, municipal exits from the regional arrangement, or a tariff framework that denies the return on the mandated investment.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The entire capital allocation question is whether R$69 billion can be deployed by 2029 at a return above the cost of capital. There is very little discretion: the programme is contractual, the timetable was pulled forward, and management\'s task is execution cost rather than project selection.',
      good: [
        'A privatisation structure that brought in an operator with a demonstrated record of cutting losses and improving collection in difficult concessions',
        'Efficiency gains since privatisation delivered against a cost base that was previously run to state-enterprise standards',
      ],
      bad: [
        'A mandated capital programme whose timetable was set politically rather than by what the tariff can fund',
        'The first post-privatisation tariff outcome recovered inflation only, which does not fund a 151% increase in investment',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The first post-privatisation review delivered no real increase',
        body:
          'ARSESP\'s December 2025 review set the 2026 adjustment at 6.11%, recomposing accumulated IPCA over the sixteen months from the new contract\'s July 2024 start through October 2025. The state was explicit that there would be no real increase for consumers in 2026 despite investment rising 151%. That is the squeeze the whole investment case now turns on.',
        basis: 'REPORTED',
      },
      {
        heading: 'Sanitation is where electricity distribution was two decades ago',
        body:
          'A fragmented, largely municipal sector being consolidated under a regulatory framework that permits a return on invested capital. The playbook — buy or win a concession, invest, cut losses, earn the regulated return — is the one Brazilian electricity distribution already ran, and the operators doing it here are the ones who ran it there.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Investing R$69 billion against a tariff that recovers only inflation',
        body:
          'Capital enters the asset base and earns a return only if the tariff framework grants it. A regulator holding the real tariff flat while the obligation accelerates transfers the cost to the shareholder, and the 2026 outcome is the first data point.',
        basis: 'REPORTED',
      },
      {
        heading: 'Political affordability pressure on a newly privatised monopoly',
        body:
          'A privatised water company raising bills is among the most politically exposed positions in Brazil. The state owns 18.3% and answers to the same voters.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'sbsp3-rate-base',
        title: 'Value comes from the asset base, and the mandate guarantees it grows',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A regulated utility earns an allowed return on invested capital, so a contractual obligation to invest R$69 billion by 2029 is a guaranteed expansion of the base that return is earned on. Add an operator with a demonstrated record of cutting losses and improving collection to a company previously run to state-enterprise cost standards, and there are two compounding effects: a bigger base and a better cost position against the benchmark. Free cash flow will be deeply negative throughout, which is what the business is supposed to look like.',
        requires: [
          'The tariff framework grants a return on the mandated investment, even if real tariffs lag in the near term',
          'Efficiency gains continue against the pre-privatisation cost base',
          'The reference shareholder remains through the lock-up and the operating improvement continues',
        ],
        breaks: [
          'Successive reviews recover inflation only, so capital enters the base without earning its cost',
          'Execution cost overruns on the universalisation programme, which is fixed in obligation and not in price',
          'A renegotiation that shifts the investment burden without adjusting the return',
        ],
        modelLink: [
          { assumption: 'Capex path', note: 'Model the mandated programme explicitly rather than as a percentage of revenue. It is contractual and front-loaded to 2029.' },
          { assumption: 'WACC / regulatory return', note: 'The allowed return is the ceiling. If it is below the cost of capital, growing the asset base destroys value rather than creating it.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'sbsp3-tariff-squeeze',
        title: 'The first review told you who pays for universalisation',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The 2026 tariff recovers sixteen months of accumulated IPCA and nothing more, while the investment obligation rises 151%. Those two facts together describe a regulator and a state shareholder choosing consumer affordability over shareholder return at the first opportunity after privatisation. The bull case requires the regulated return to be granted on an enormous capital programme; the only evidence available so far points the other way, and the political incentives point the same way for as long as the target date stands.',
        requires: [
          'Real tariffs continue to lag the cost of the mandated programme',
          'The 2029 universalisation date is held to, keeping the capital timetable compressed',
          'Affordability remains politically decisive for the state as shareholder and regulator',
        ],
        breaks: [
          'A review that grants a real increase reflecting the invested capital',
          'The universalisation date being relaxed, spreading the capital over more years',
          'Efficiency gains large enough to fund the programme without a tariff increase',
        ],
        modelLink: [
          { assumption: 'Revenue driver — tariff growth', note: 'Model tariff growth at inflation with no real component and see whether the capital programme still earns its cost. That is the whole disagreement.' },
          { assumption: 'FCFF / funding gap', note: 'Negative free cash flow has to be funded. Check whether the debt schedule and covenants survive the programme at a flat real tariff.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'SEMIL São Paulo — investment 151% higher with no real tariff increase in 2026', url: 'https://semil.sp.gov.br/2025/12/mesmo-com-investimento-151-maior-tarifa-da-sabesp-nao-tera-aumento-real-para-o-consumidor-em-2026/' },
      { label: 'O Imparcial — Sabesp 2026 tariff adjustment of 6.11%', url: 'https://www.imparcial.com.br/noticias/tarifas-da-sabesp-terao-reajuste-de-6-11-para-2026,77556' },
      { label: 'InfoMoney — Sabesp\'s first tariff review since privatisation', url: 'https://www.infomoney.com.br/mercados/sabesp-sbsp3-tera-1a-revisao-tarifaria-desde-a-privatizacao-o-que-esperar/' },
      { label: 'Poder360 — shareholding structure of the privatised Sabesp', url: 'https://www.poder360.com.br/poder-economia/saiba-como-fica-a-composicao-acionaria-da-sabesp-privatizada/' },
      { label: 'Equatorial — completion of the Sabesp privatisation and reference investor role', url: 'https://www.equatorialenergia.com.br/governo-de-sao-paulo-conclui-privatizacao-da-sabesp-e-grupo-equatorial-se-torna-investidor-de-referencia/' },
    ],
  },

  {
    ticker: 'CPLE6',
    sector: 'Utilities',
    scope: 'BRAZIL',
    headline:
      'A former state utility restructured as a true corporation with every shareholder\'s vote capped at 10% — including the state\'s, which kept a golden share over distribution investment and the headquarters.',
    howItEarns: [
      {
        heading: 'Three regulated and contracted businesses in Paraná',
        body:
          'Distribution earns a regulated return on its asset base in Paraná, transmission earns indexed permitted revenue, and generation sells hydro and wind output into regulated auctions and the free market. Only the third carries price risk, and it is the one most often valued as if it were as safe as the other two.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The efficiency gap is the post-corporatisation opportunity',
        body:
          'A company run for decades to state-enterprise cost standards has a gap to the regulator\'s benchmark that private management can close. That gap is finite and it is the specific, measurable source of value creation from the restructuring — headcount, procurement, losses and collection rather than any new market.',
        basis: 'INTERPRETATION',
      },
    ],
    control: {
      form:
        'Restructured as a true corporation with no controlling shareholder in the offering concluded in August 2023. Any holder or block accumulating more than 10% keeps its proportional dividends but has its voting power capped at 10%, which reduced the state\'s effective vote from 69.7% of the ordinary shares.',
      voting:
        'A 10% voting ceiling applies to every shareholder, and the state retains a golden share with veto powers directed at guaranteeing distribution investment and keeping the company\'s name and headquarters in Curitiba.',
      relatedPartyExposure: [
        'The state remains a large economic holder and retains veto rights over specific matters through the golden share',
        'Distribution investment is protected by that veto, which can require capital deployment the market would not choose',
        'The headquarters and name protections tie the company to a location for political rather than commercial reasons',
      ],
      minorityProtections: [
        'A statutory 10% voting cap, which makes any control block structurally impossible',
        'Novo Mercado listing requirements, which permit only voting shares in that segment',
        'ANEEL regulation of the distribution and transmission concessions, independent of shareholders',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'The voting cap is a genuine structural protection, and the golden share is a real limit',
        body:
          'Capping every vote at 10% removes the possibility of a controller extracting value — the same model used in the Eletrobras privatisation. What remains is narrower and specific: the state can veto matters affecting distribution investment, the company name and the headquarters. That is far less than control and more than nothing, and it is the part of the structure an investor should actually price.',
        basis: 'REPORTED',
      },
      {
        heading: 'No controller means no anchor either',
        body:
          'A dispersed register with capped votes produces a board accountable to everyone and to no one in particular. The upside is contestability; the cost is that a long-horizon capital programme has no shareholder committed to seeing it through, and strategy can shift with the composition of a given assembly.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Exclusive distribution and transmission concessions in Paraná',
        mechanism:
          'Network monopolies granted by contract for long terms, which no competitor may duplicate and no customer may bypass except by generating their own power.',
        evidence: 'Exclusive service of one of Brazil\'s wealthier and more industrialised states under long-dated concessions.',
        erodedBy: 'Concession expiry and renewal terms, and free-market migration of large industrial customers out of the captive base.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Since corporatisation the direction has been cost reduction, disposal of non-core holdings and disciplined participation in auctions. The constraint is that distribution investment is protected by a golden share, so the one area where capital could be trimmed is the one area the state can insist upon.',
      good: [
        'Cutting a cost base built to state-enterprise standards, closing part of the gap to the regulatory benchmark',
        'Divesting non-core stakes and thermal assets that fitted no strategy',
      ],
      bad: [
        'A legacy of minority holdings in generation projects acquired without control or clear rationale',
        'Capital allocation partly constrained by veto rights over distribution investment, regardless of the return available',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Parcela B compression meets a company with a cost gap still to close',
        body:
          'With ANEEL cutting the distributor\'s allowed remuneration in every 2026 process it decided, the only remaining return is operating below the benchmark. A recently corporatised utility still carrying state-enterprise cost habits has more of that gap available than a peer that closed it a decade ago.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Generation exposure is the part that is not regulated',
        body:
          'Hydro and wind output sold into the free market carries real price and hydrology risk, including the generation scaling factor that allocates shortfall when reservoirs fall. Valuing the generation segment on the distribution segment\'s multiple understates its volatility.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'The efficiency gap closing faster than the return improves',
        body:
          'Cost reduction is finite and the regulator recalibrates the benchmark at the next review, handing part of the gain to consumers through Factor X. Operating outperformance in this sector is temporary by design.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Golden share vetoes directing capital',
        body:
          'Protected distribution investment can require deployment the market would not choose. It is narrow, but it applies to the largest part of the asset base.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'cple6-efficiency',
        title: 'The value is a cost gap, and corporatisation is what allows closing it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Every Brazilian distributor earns the same regulated return on the same kind of asset base. The dispersion comes from operating above or below the regulator\'s cost assumption, and a company run for decades as a state enterprise sits well above it. The 10% voting cap removed the political constraint that kept it there, so the thesis is specific and measurable: headcount, procurement, losses and collection converging toward the benchmark. It is also finite, and the next review takes part of it back.',
        requires: [
          'Cost reduction continues toward the regulatory benchmark',
          'The golden share is used narrowly rather than to direct material capital',
          'Generation contracting limits exposure to a dry year during the transition',
        ],
        breaks: [
          'Factor X at the next review recaptures the efficiency gains faster than they are delivered',
          'Golden share vetoes compel distribution investment at returns below the cost of capital',
          'Hydrology or free-market price weakness in the generation segment offsets the distribution improvement',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Model margin converging toward the benchmark over the forecast, then flattening as the regulator recalibrates. A permanently improving margin is the error to avoid here.' },
          { assumption: 'Segment margins', note: 'Generation, transmission and distribution have different risk; value them separately rather than on one consolidated multiple.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'cple6-no-anchor',
        title: 'A capped vote protects against a controller and provides no owner',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'The 10% ceiling genuinely removes expropriation risk — no shareholder can accumulate control regardless of how many shares it buys. What it also removes is any holder with enough at stake to insist on a decade-long cost and capital programme through a change of management or a weak year. Combined with a golden share that can direct the largest part of the capital plan, the structure is protective and unanchored at once. That belongs in the discount rate as strategic unpredictability, which is a different discount from expropriation risk and should not be confused with it.',
        requires: [
          'The voting cap and golden share remain in the bylaws',
          'No shareholder assembles an informal coordinating block',
        ],
        breaks: [
          'A bylaw change removing the cap, which would reintroduce the possibility of a controller',
          'A demonstrated multi-year delivery record that shows the structure does not impede execution',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Price strategic unpredictability explicitly rather than hiding it in terminal growth, and price it lower than an expropriation premium would be.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Forbes Brasil — Copel approves bylaws permitting the restructuring', url: 'https://forbes.com.br/forbes-money/2023/07/copel-aprova-estatuto-que-permite-privatizacao-apesar-de-posicao-contraria-do-bndes/' },
      { label: 'Seu Dinheiro — shareholders approve the bylaw change opening the way to the restructuring', url: 'https://www.seudinheiro.com/2023/empresas/privatizacao-da-copel-cple6-acionistas-aprovam-mudanca-de-estatuto-que-abre-caminho-para-desestatizacao-vinp-lvit/' },
      { label: 'Government of Paraná — public hearing on Copel\'s transformation into a corporation', url: 'https://www.parana.pr.gov.br/aen/Noticia/Governo-promoveu-audiencia-publica-sobre-transformacao-da-Copel-em-corporacao' },
      { label: 'Agência iNFRA / Abradee — Parcela B compression in the 2026 processes', url: 'https://agenciainfra.com/blog/abradee-encargos-e-subsidios-pressionam-reajustes-na-conta-de-luz/' },
    ],
  },

  {
    ticker: 'AXIA3',
    sector: 'Utilities',
    scope: 'BRAZIL',
    headline:
      'The former Eletrobras, renamed in November 2025, where privatisation converted contracted hydro into merchant exposure and capped the government\'s vote at 10% while it kept nearly 40% of the economics.',
    howItEarns: [
      {
        heading: 'A hydro fleet selling into the free market, plus transmission as ballast',
        body:
          'The generation fleet is largely hydro with very low marginal cost, and privatisation decontracted much of it — so output that once earned a regulated tariff now sells at the market price. That converts a utility into something closer to a commodity producer with the lowest cost position in its market. Transmission earns indexed permitted revenue and is the stable half.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The cost position is the whole generation argument',
        body:
          'A depreciated hydro plant has almost no marginal cost, so it is profitable at power prices that would close a thermal plant. In a merchant market the low-cost producer captures the spread between its cost and the marginal generator\'s, and that spread widens exactly when hydrology is poor and thermal plants dispatch.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Privatised in 2022 with the government\'s voting power capped at 10% regardless of its economic stake, which remains around 39% including public entities. Renamed Axia Energia in November 2025, with the ELET tickers replaced by AXIA.',
      voting:
        'A 10% voting ceiling applies to the government\'s holding, so the largest economic shareholder cannot control the company. No other holder is close to control either.',
      relatedPartyExposure: [
        'The largest economic shareholder is the federal government, whose interests in power prices and employment differ from a return-maximising owner\'s',
        'Legacy obligations and litigation inherited from the state era continue to be negotiated with the same government',
        'Compulsory loan litigation and other historical liabilities are disputes with the state that is also the biggest shareholder',
      ],
      minorityProtections: [
        'A statutory voting cap that makes state control structurally impossible',
        'An agreement reached with the Union that clarified governance, which investors now monitor as the key variable',
        'ANEEL regulation of the transmission concessions independently of shareholders',
        'NYSE listing and its disclosure obligations',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'Governance predictability is the variable, not control',
        body:
          'The voting cap settled the control question. What remained contested was the practical influence of a 39% shareholder that is also the government, and an agreement with the Union clarified it. Investors now monitor predictability of governance rather than the risk of a takeover, and dividends have become a consequence of executing the strategic plan rather than a political outcome.',
        basis: 'REPORTED',
      },
      {
        heading: 'The legacy liabilities are a negotiation with the largest shareholder',
        body:
          'Historical obligations from the state era — compulsory loan litigation among them — are disputes where the counterparty and the biggest economic holder are the same entity. That is an unusual alignment and it cuts both ways: settlement is possible, and the terms are not set in an arm\'s-length market.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'The lowest marginal cost generation fleet in the market',
        mechanism:
          'Large, long-depreciated hydro capacity produces at a marginal cost far below any thermal alternative, and no competitor can build equivalent capacity — the sites are taken and new large hydro is not being permitted.',
        evidence: 'A generation fleet that remains profitable at power prices which would render thermal dispatch uneconomic.',
        erodedBy: 'Concession renewal terms, hydrology risk allocated through the generation scaling factor, and sustained low free-market prices from renewable oversupply.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Transmission revenue that is indexed and contracted',
        mechanism:
          'Permitted revenue for line availability, adjusted for inflation, with no volume or price exposure at all.',
        evidence: 'Revenue stability through power-price collapses and recessions alike.',
        erodedBy: 'Concession expiry, since the lines revert to the grantor with no compensation for residual value.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Post-privatisation the work has been cost reduction, disposal of non-core and thermal assets, resolution of legacy liabilities, and returning capital. That sequence is the correct one for a company converting from a state enterprise into a merchant generator, and much of it is done.',
      good: [
        'Cutting a cost base built over decades of state ownership and reducing headcount toward private-sector norms',
        'Divesting thermal and non-core holdings that fitted no strategy and consumed capital',
        'Reaching an agreement with the Union that removed the standing governance uncertainty',
      ],
      bad: [
        'A very large inherited liability stack that continues to absorb management attention and cash',
        'Decontracting into the free market was the point of the privatisation and it transferred price risk from the tariff to the shareholder',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Immune to the distribution squeeze, exposed to the power price instead',
        body:
          'The Parcela B compression and the charge burden that dominate the 2026 outlook for distributors do not reach a generator and transmitter. What reaches this company is hydrology, the free-market price, and the renewable oversupply that has been depressing it.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Distributed generation subsidies work against the merchant price',
        body:
          'The CDE budget of R$52.7 billion for 2026, driven mainly by distributed-generation subsidies, funds capacity that displaces demand from the grid. Subsidised supply growing faster than demand is a structural headwind to the free-market price this company now sells into.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Free-market power prices held down by subsidised renewable supply',
        body:
          'Decontracting converted a tariff into a price. If subsidised distributed and centralised renewables keep supply ahead of demand, that price stays low and the low marginal cost protects survival rather than returns.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Hydrology and the generation scaling factor',
        body:
          'A dry year forces thermal dispatch, raises the spot price, and simultaneously reduces the assured energy a hydro generator can deliver against its contracts. The mechanism has required retroactive legislative relief twice, which indicates the scale.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'axia3-cost-position',
        title: 'The lowest marginal cost fleet in a merchant market',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Privatisation converted a regulated tariff into a market price, which sounds like added risk and is also what gives a long-depreciated hydro fleet access to the spread between its own cost and the marginal thermal generator\'s. The company does not need high power prices; it needs the price to clear above its own cost, which it does in almost all conditions, and the spread widens in exactly the dry years that hurt everyone else. Add indexed transmission revenue as ballast and a settled governance framework, and this is a cost-position argument rather than a power-price forecast.',
        requires: [
          'Free-market prices clear above the hydro fleet\'s marginal cost, which is a low bar',
          'Concession renewal terms do not transfer the fleet\'s economics to the grantor',
          'Legacy liabilities resolve within the amounts provisioned',
        ],
        breaks: [
          'Sustained free-market prices low enough that low marginal cost only ensures survival, not returns',
          'A dry year triggering generation scaling factor exposure on contracted volumes',
          'An adverse outcome in the legacy litigation that exceeds provisions materially',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per MWh', note: 'Model the free-market price explicitly rather than a regulated tariff growth rate. Decontracting is the whole change.' },
          { assumption: 'Segment margins', note: 'Generation and transmission have opposite risk profiles. Value the indexed annuity separately from the merchant fleet.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'axia3-subsidised-supply',
        title: 'The state is subsidising the supply that competes with its own biggest asset',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The CDE budget for 2026 was proposed at R$52.7 billion, driven mainly by subsidies for distributed generation — capacity that displaces grid demand and adds supply. A merchant generator selling into the free market faces subsidised competition growing faster than consumption, which caps the price it can realise regardless of how low its own cost is. The company was decontracted into precisely this market, and the government holding nearly 40% of its economics is the one funding the subsidy.',
        requires: [
          'Distributed and centralised renewable capacity continues growing faster than demand',
          'Subsidy reform continues to stall',
          'Free-market prices stay depressed as a result',
        ],
        breaks: [
          'Subsidy reform that slows the addition of displacing capacity',
          'Demand growth — data centres, electrification, industrial load — absorbing the new supply',
          'A sustained dry period that resets the price level upward',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per MWh', note: 'Hold the realised free-market price flat in real terms rather than assuming a recovery to historical levels.' },
          { assumption: 'Terminal growth', note: 'A terminal value built on a mid-cycle power price is the specific thing this thesis disputes.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Bora Investir (B3) — Eletrobras changes its name to Axia Energia and the new ticker', url: 'https://borainvestir.b3.com.br/noticias/empresas/eletrobras-muda-nome-para-axia-energia-3-anos-apos-privatizacao-confira-novo-ticker/' },
      { label: 'InfoMoney — AXIA3 debuts on B3', url: 'https://www.infomoney.com.br/mercados/axia3-axia-ex-eletrobras-estreia-novo-ticker-na-b3-nesta-segunda/' },
      { label: 'Investidor10 — what to expect from the large former state companies in 2026', url: 'https://investidor10.com.br/noticias/o-que-esperar-das-grandes-estatais-em-2026-petrobras-banco-do-brasil-axia-e-caixa-117637/' },
      { label: 'Nova Cana — charges and distributed-generation subsidies driving the 2026 tariff', url: 'https://www.novacana.com/noticias/encargos-tendem-impulsionar-tarifa-energia-2026-apesar-medidas-alivio-aneel-081225' },
    ],
  },

  {
    ticker: 'ENGI11',
    sector: 'Utilities',
    scope: 'BRAZIL',
    headline:
      'A family-controlled distribution group that specialises in the concessions nobody else wants — poor, high-loss areas where the value created is the gap to the regulator\'s benchmark.',
    howItEarns: [
      {
        heading: 'Turning badly run concessions into benchmark ones',
        body:
          'Energisa operates distribution concessions across smaller and poorer states, several acquired in privatisations of failing state utilities. The return comes from cutting non-technical losses, improving collection and rebuilding networks until the concession operates below ANEEL\'s cost and loss assumptions — at which point the difference is the shareholder\'s until the next review.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Scale across many small concessions rather than one large one',
        body:
          'Operating a dozen concessions in different states spreads regulatory and hydrological exposure and allows shared procurement, systems and field practice. It also means a dozen separate tariff cycles and a dozen regulatory relationships to manage.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Botelho family through a holding structure, with units (ENGI11) providing the public float. The family has operated electricity distribution for generations and treats it as a permanent business rather than a position.',
      voting:
        'Units combine ordinary and preferred shares and carry the liquidity; the family holds control through the ordinary shares. Unit holders have economics with limited voting weight.',
      relatedPartyExposure: [
        'A controlling family decides the acquisition programme that minority capital funds',
        'Unit structure separates economics from votes',
        'Related-party service and management arrangements within the group structure',
      ],
      minorityProtections: [
        'B3 Level 2 obligations, including tag-along and arbitration',
        'Preferred dividend priority within the unit',
        'ANEEL regulation of each concession independently of any shareholder',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Generational operators in a business that rewards patience',
        body:
          'Turning a failing concession around takes a full review cycle or more before the economics appear, which is a horizon a family owner can hold and a quarterly-reporting management often cannot. The record of buying distressed distribution assets and delivering the improvement is long and consistent, which is the strongest governance argument available for a controlled company.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Continuous acquisition leverage is the structural cost',
        body:
          'The model requires debt against regulated cash flows, so the balance sheet is permanently working. That is appropriate for the asset class and it leaves less capacity when an adverse review, a rate shock or a difficult concession arrives.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Loss reduction capability in difficult concession areas',
        mechanism:
          'Cutting theft and improving collection in poor regions requires field operations, local political relationships, legal capacity and data built over many concessions. Competitors bidding the same assets have not demonstrated it, which is why these assets keep being available cheaply.',
        evidence: 'Successive acquisitions of loss-heavy state utilities brought toward regulatory benchmarks within a review cycle.',
        erodedBy: 'Exhaustion of the pipeline of underperforming concessions, or auction prices that already assume the turnaround.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'A serial acquirer of distressed distribution concessions with a long record of paying disciplined prices and delivering the operational improvement. The strategy is genuinely value-creating and self-limiting for the same reason as any turnaround model.',
      good: [
        'Acquiring failing state distributors at prices that did not price the turnaround, then delivering it across multiple concessions',
        'Spreading regulatory and hydrological exposure across many states rather than concentrating in one',
      ],
      bad: [
        'A permanently levered balance sheet that leaves limited headroom for an adverse tariff cycle',
        'Growth that depends on a privatisation pipeline the company does not control and that is narrowing',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Beating the benchmark is the only return the 2026 regulator left available',
        body:
          'ANEEL cut the distributor\'s allowed remuneration in every 2026 process it decided, by 2% to 4.5%, while charges rose over 10% in six of seven. A company whose entire competence is operating below the benchmark is better positioned for that than one that merely meets it.',
        basis: 'REPORTED',
      },
      {
        heading: 'Collection is hardest exactly where the value creation is supposed to come from',
        body:
          'The concessions targeted are in poorer regions where delinquency is structural. With a record 82% of Brazilian households carrying debt, the collection improvement the model depends on runs against the macroeconomic current.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'A narrowing pipeline of concessions worth buying',
        body:
          'Brazilian electricity distribution has largely consolidated. The remaining opportunities are fewer and the company\'s own record is priced into what it must bid.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'An adverse review landing on a permanently levered balance sheet',
        body:
          'The turnaround model runs on debt. A bad periodic review or a rate shock arrives on a balance sheet with less capacity than a mature utility would have.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'engi11-turnaround',
        title: 'A repeatable operating skill in the only part of the tariff the company controls',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The regulator sets the tariff and the allowed loss level; a distributor earns above its permitted return only by operating below those assumptions. This group has done that across a dozen concessions bought from failing state utilities, and the skill — field operations, collection, local relationships — is organisational rather than financial, which is why competitors bidding the same assets have not replicated it. In a year when ANEEL is compressing the allowed remuneration itself, operating outperformance is the only return left.',
        requires: [
          'Loss and collection improvements continue to be delivered within a review cycle',
          'Distressed concessions remain available at prices that do not assume the turnaround',
          'Leverage stays serviceable across the tariff cycle',
        ],
        breaks: [
          'Auction prices rise to reflect the achievable improvement',
          'A concession where losses prove structural rather than operational',
          'An adverse review or rate shock on a permanently working balance sheet',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Model margin converging toward the benchmark as a ramp in acquired concessions, then flattening as the regulator recalibrates.' },
          { assumption: 'Capex path', note: 'Network investment precedes loss reduction. The capex comes first and the margin follows by a year or more.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'engi11-pipeline',
        title: 'Growth is an acquisition pipeline, not a business',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The existing concessions, once converged to the benchmark, grow only with the regulated asset base and inflation. Everything above that has come from the next acquisition, and the supply of mispriced distribution concessions in Brazil is finite and largely consumed. A model extrapolating the historical growth rate is extrapolating a privatisation calendar rather than an operating business, and the company\'s own success has raised what it must pay for whatever remains.',
        requires: [
          'The pipeline of distressed concessions continues to narrow',
          'Competing bidders price in the achievable turnaround',
        ],
        breaks: [
          'A new privatisation programme — sanitation or gas — that reopens the opportunity set at similar returns',
          'Demonstrated organic return improvement in the mature concessions without new acquisitions',
        ],
        modelLink: [
          { assumption: 'Revenue growth / terminal growth', note: 'Separate organic growth in existing concessions from growth by acquisition. A terminal rate embedding future deals is assuming the pipeline.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ANEEL — Energisa Sul-Sudeste periodic tariff review approved', url: 'https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/revisao-tarifaria-periodica-da-energisa-sul-sudeste-e-aprovada-pela-aneel' },
      { label: 'Agência iNFRA / Abradee — Parcela B compression in the 2026 processes', url: 'https://agenciainfra.com/blog/abradee-encargos-e-subsidios-pressionam-reajustes-na-conta-de-luz/' },
      { label: 'Itaponews — household indebtedness at a record', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
    ],
  },

  {
    ticker: 'EGIE3',
    sector: 'Utilities',
    scope: 'BRAZIL',
    headline:
      'A contracted generator controlled by a French parent, which sells almost all its output forward and therefore looks nothing like the merchant generators it is grouped with.',
    howItEarns: [
      {
        heading: 'Selling energy forward, not at the spot price',
        body:
          'Engie Brasil contracts the large majority of its assured energy years ahead, at prices fixed and indexed in the contract. That removes the power-price exposure that defines a merchant generator and converts the business into something closer to a portfolio of indexed annuities with hydrological risk attached.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Gas transport and transmission add contracted infrastructure',
        body:
          'A stake in gas transmission infrastructure and transmission lines earn take-or-pay and permitted revenue with no volume exposure. These are the highest-quality cash flows in the group and are structurally different from generation.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Engie group of France, which holds a clear majority, with a free float of institutional and retail holders alongside. Strategy, capital allocation and dividend policy follow the parent\'s group framework.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the parent holding the majority.',
      relatedPartyExposure: [
        'The parent sets capital allocation and dividend policy against its own group priorities and European decarbonisation targets',
        'Project opportunities in Brazil could be developed by the parent directly or through this vehicle, and the allocation is a related-party decision',
        'Technology, services and procurement arrangements with the parent group',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'ANEEL regulation of the generation and transmission concessions',
        'A long record of high, consistent distributions that the parent has not interrupted',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A foreign parent whose priorities are set elsewhere, and a good record',
        body:
          'Capital allocation is decided within a European group pursuing its own decarbonisation agenda, which has generally meant the Brazilian subsidiary gets funded for renewables and transmission when they fit that agenda. Distributions have been high and consistent. The structural risk is not extraction but that the Brazilian opportunity set is judged against a global capital budget rather than on its own returns.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Contracting discipline is the governance behaviour that matters',
        body:
          'A generator can always sell more energy uncontracted and report better numbers in a high-price year. This company has consistently chosen to contract forward instead, forgoing upside for predictability. That is a management choice a controlling parent enforces, and it is the reason the earnings look unlike a merchant peer\'s.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'A long, contracted and indexed sales book',
        mechanism:
          'Energy sold years forward at fixed indexed prices removes the market price from the revenue equation, so the company earns a spread over its own cost rather than a commodity price.',
        evidence: 'Earnings stability through power-price cycles that moved merchant generators\' results by multiples.',
        erodedBy: 'Contract roll-off into a depressed free market, and hydrological shortfall that forces buying energy at spot to honour contracts.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Disciplined renewable development plus contracted infrastructure, funded conservatively and distributing generously. Growth has been steady rather than transformative, which is the appropriate shape for a contracted generator.',
      good: [
        'Building wind and solar capacity with power purchase agreements signed before construction',
        'Acquiring contracted gas transmission infrastructure, which is uncorrelated with generation',
        'Sustaining a high payout rather than retaining capital for projects that do not clear the return threshold',
      ],
      bad: [
        'Growth constrained by a parent\'s global capital budget rather than by Brazilian opportunity',
        'Thermal assets that fit the portfolio historically and fit the parent\'s current agenda poorly',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The contracted book is the defence against subsidised oversupply',
        body:
          'Distributed-generation subsidies funded through a R$52.7 billion CDE budget add capacity that displaces grid demand and depresses free-market prices. A generator with its output sold forward is insulated for the length of its contracts — and exposed at every roll-off date.',
        basis: 'REPORTED',
      },
      {
        heading: 'Hydrology is the residual risk contracting cannot remove',
        body:
          'Selling assured energy forward means owing delivery. When reservoirs fall, assured energy is reduced and the generator must buy at spot to honour contracts. The generation scaling factor allocates that shortfall and has twice required legislative relief, which indicates how large it can be.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Contract roll-off into a weak free market',
        body:
          'Each expiring contract is repriced at whatever the market offers. Subsidised renewable supply growing faster than demand means the renewal price is the risk, and it arrives on a schedule that is knowable in advance.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A dry year meeting a fully contracted position',
        body:
          'Being contracted is protection against price and exposure to volume. The worst outcome is a hydrological shortfall with an obligation to deliver.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'egie3-contracted',
        title: 'Contracted, indexed cash flow that the sector\'s problems do not reach',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Almost everything pressuring Brazilian utilities in 2026 — Parcela B compression, the charge burden, distributed generation eroding billed volume, free-market price weakness — reaches distributors and merchant generators. A generator with its output sold forward at indexed prices, plus take-or-pay gas transmission and permitted transmission revenue, is insulated from all of it for the length of its contracts. As real rates fall, a long indexed cash flow revalues upward through the discount rate. This is a duration and contract-quality argument, not an operating one.',
        requires: [
          'Contracting discipline is maintained rather than traded for spot upside',
          'Hydrology stays within a range that does not force spot purchases to honour contracts',
          'Real interest rates continue to decline',
        ],
        breaks: [
          'A dry period forcing energy purchases at spot against contracted delivery',
          'Contracts rolling off into a materially weaker free market',
          'Real rates rising, which reverses the duration benefit directly',
        ],
        modelLink: [
          { assumption: 'Revenue driver — contracted price per MWh', note: 'Model the contracted book and its roll-off schedule rather than a market price. The renewal price at each expiry is the real variable.' },
          { assumption: 'WACC / discount rate', note: 'Much of the value here is duration. Test against a range of real rates.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'egie3-rolloff',
        title: 'The protection has an expiry date, and the market it rolls into is oversupplied',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Contracted revenue is only as durable as the contracts. Subsidised distributed and centralised renewable capacity is being added faster than Brazilian demand grows, funded by a CDE budget of R$52.7 billion rising on exactly those subsidies. Every contract that expires is repriced into that market. A valuation that carries the current realised price into perpetuity is assuming a renewal price the supply balance does not support, and the roll-off schedule makes the timing knowable rather than speculative.',
        requires: [
          'Subsidised renewable capacity continues growing faster than demand',
          'Subsidy reform continues to stall',
          'Contract roll-offs occur while prices are depressed',
        ],
        breaks: [
          'Demand growth from electrification, data centres or industrial load absorbing the new supply',
          'Subsidy reform slowing capacity additions',
          'A sustained dry period resetting the price level upward',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price growth', note: 'Step the realised price down at each contract roll-off rather than growing it with inflation throughout.' },
          { assumption: 'Terminal growth', note: 'A terminal value on the current contracted price is precisely what this thesis disputes.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Nova Cana — charges and distributed-generation subsidies driving the 2026 tariff', url: 'https://www.novacana.com/noticias/encargos-tendem-impulsionar-tarifa-energia-2026-apesar-medidas-alivio-aneel-081225' },
      { label: 'Poder360 — ANEEL projects an 8.6% bill increase for 2026', url: 'https://www.poder360.com.br/poder-infra/aneel-projeta-alta-de-86-na-conta-de-luz-em-2026/' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
    ],
  },

  {
    ticker: 'NEE',
    sector: 'Utilities',
    scope: 'UNITED_STATES',
    headline:
      'A regulated Florida monopoly bolted to the largest renewable developer in North America, whose free cash flow is deeply negative by design — and which is now exposed to the politics of who pays for data centre load.',
    howItEarns: [
      {
        heading: 'An authorised return on rate base, in a state whose population keeps growing',
        body:
          'Florida Power & Light earns a regulated return on the capital its commission approves, and the customer count grows with Florida\'s population. Growth is not a market-share contest; it is the pace at which the regulator allows investment. That is why capex runs near revenue and free cash flow is negative — the capital spending is the product.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Contracted renewables, and the tax structures behind them',
        body:
          'The competitive arm signs twenty-year offtake agreements before it builds, so the revenue is contracted rather than merchant. Production and investment tax credits, monetised through tax-equity structures, are why the effective tax rate sits in low double digits and why noncontrolling interests can absorb losses rather than profits.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across index and active institutional managers with a very large free float, which is the norm for a large US utility.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Tax-equity partners hold economic interests in specific renewable projects with claims that rank ahead of common equity in those structures',
        'Intersegment arrangements between the regulated utility and the competitive arm are reviewed by the commission',
      ],
      minorityProtections: [
        'Dispersed ownership with a single voting class',
        'State commission oversight of the regulated utility, including of related-party dealings',
        'SEC reporting and the disclosure regime for a large domestic issuer',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Ordinary agency risk, and an unusually complex capital structure',
        body:
          'Governance here is not about control — there is no controller — but about whether an investor can see through the structure. Tax-equity partnerships, project-level financing and noncontrolling interests that sometimes absorb losses make consolidated earnings harder to interpret than at a plain regulated utility, and the reported effective tax rate is a structuring outcome rather than a tax rate.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The commission is the governance body that matters',
        body:
          'Every consequential variable — allowed return, equity ratio, what counts as prudent cost, how fast it may be recovered — is decided by the Florida commission. A constructive relationship there is worth more to shareholders than any board process, and it is not something a shareholder can influence.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'An exclusive service territory with structural population growth',
        mechanism:
          'A statutory monopoly over electricity supply in a state that keeps gaining residents means the customer base grows without any competitive effort, and every new connection justifies more approved capital.',
        evidence: 'The largest US regulated electric utility by customer count, in one of the fastest-growing states.',
        erodedBy: 'Commission decisions on allowed return, and political pressure on bills that limits how much capital may be recovered.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Development scale and cost of capital in renewables',
        mechanism:
          'The largest renewable pipeline in North America buys turbines and panels at volumes smaller developers cannot, funds at an investment-grade cost of capital, and uses tax-equity structures that require scale to access.',
        evidence: 'A development pipeline and installed base larger than any North American competitor.',
        erodedBy: 'Changes to the tax credit regime, which would alter the after-tax return on assets already built.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Enormous and continuous: capital spending runs at multiples of depreciation, funded by debt and equity issuance, deployed into a rate base and a contracted renewable pipeline. The discipline question is not whether to spend but whether each dollar earns above its cost — and for the regulated half, the commission decides that.',
      good: [
        'Deploying capital into an authorised rate base at a spread over the cost of capital, which is the cleanest form of value creation available to a utility',
        'Contracting renewable output before construction rather than building merchant capacity',
      ],
      bad: [
        'A capital structure complex enough that reported earnings require significant adjustment to interpret',
        'Growth plans that embed a data centre load forecast the company does not control and that may prove partly speculative',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The first genuine demand growth in twenty years, and the queue overstates it',
        body:
          'US data centre power demand is projected to rise from 31 GW in 2025 to 41 GW in 2026 and 66 GW the year after. But large-load interconnection requests reached roughly 700 GW in 2025 — more than the 477 GW the entire country consumed in 2023 — because the same project queues in several places at once. Utilities that imposed stricter terms saw their large-load queues shrink by half or more.',
        basis: 'REPORTED',
      },
      {
        heading: 'Affordability is the fastest-growing risk in the sector',
        body:
          'If new load is served with capital recovered from all ratepayers, residential bills rise for demand households did not cause. That transmits into disallowed costs, hostile rate cases and legislated cost-allocation rules. The Dallas Fed has estimated wholesale prices could rise as much as 50%, and PJM capacity prices already rose 833% between two delivery years.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Building for load that does not arrive',
        body:
          'The historical analogue is the nuclear build of the 1970s: capacity commissioned against a forecast that did not materialise, then partially disallowed from rate base as imprudent. The loss is not the asset but the portion the commission refuses to let the company earn on.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Tax credit regime changes',
        body:
          'The after-tax return on the renewable fleet depends on credits and the structures that monetise them. A change alters the economics of assets already in the ground, and there is no operational response.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'nee-rate-base',
        title: 'Negative free cash flow is the business working, not failing',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A regulated utility earns an authorised return on the equity portion of its rate base, so growth equals the pace of approved investment. This company deploys capital at close to its annual revenue and earns a spread on all of it, in a state gaining population, alongside a renewable arm that contracts its output for twenty years before building. A discounted cash flow that stops at free cash flow will value this business near zero and be wrong — the correct frame is rate base growth times the spread between authorised return and cost of capital.',
        requires: [
          'The commission continues to approve the capital plan and grant a return above the cost of capital',
          'Florida\'s population and load growth continue',
          'Renewable offtake agreements continue to be signed ahead of construction',
        ],
        breaks: [
          'A rate case that cuts the authorised return or disallows capital as imprudent',
          'Affordability politics that shift cost recovery or cap bill increases',
          'Tax credit changes that reduce the after-tax return on the renewable fleet',
        ],
        modelLink: [
          { assumption: 'Capex path and fade', note: 'The capex is the product. Do not fade it to maintenance levels early — but do check what the equity is worth if the commission stops approving it.' },
          { assumption: 'WACC versus authorised return', note: 'Value creation is the spread between the two. If the authorised return is below the cost of capital, growing the rate base destroys value.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'nee-affordability',
        title: 'The load is partly a queue artefact, and the bill is a political problem',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Rate base plans now embed a data centre demand outlook, and the evidence that the pipeline is inflated is direct: 700 GW of interconnection requests against a country that consumed 477 GW in total, and queues halving where utilities demanded financial commitments. The asymmetry is harsh — if the load arrives the utility earns on the capital, and if it does not the capital was still spent and a commission decides who pays. Meanwhile residential bills are rising for demand households did not create, which is how cost disallowance and legislated cost allocation actually happen.',
        requires: [
          'A material share of the interconnection pipeline proves speculative or duplicated',
          'Affordability pressure translates into commission or legislative action',
          'Capital continues being committed ahead of firm, financially backed load',
        ],
        breaks: [
          'Large-load agreements with binding financial commitments covering the capital being deployed',
          'Cost-allocation rules that place the burden on large loads rather than on all ratepayers',
          'Demand materialising at the pace forecast',
        ],
        modelLink: [
          { assumption: 'Revenue driver — MWh sold', note: 'Model volumes on contracted, financially committed load rather than on queue position.' },
          { assumption: 'Capex path', note: 'Test the equity value if capital is deployed and only part of it enters rate base — that is what disallowance means.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Goldman Sachs — US data centre power demand projected to double by 2027', url: 'https://www.goldmansachs.com/insights/articles/us-data-center-power-demand-projected-to-double-by-2027' },
      { label: 'Utility Dive — six power sector trends to watch in 2026', url: 'https://www.utilitydive.com/news/utility-power-sector-trends-2026/808782/' },
      { label: 'Columbia CGEP — effects of load growth on US electricity prices', url: 'https://www.energypolicy.columbia.edu/publications/the-effects-of-load-growth-on-electricity-prices-in-the-united-states-a-literature-review/' },
      { label: 'EPRI — data centre load growth in context', url: 'https://powering-intelligence.epri.com/load-growth.html' },
    ],
  },

  {
    ticker: 'DUK',
    sector: 'Utilities',
    scope: 'UNITED_STATES',
    headline:
      'A pure regulated return across six states, where the investment case is a forecast of rate case outcomes rather than of electricity demand — and where the same data centre load brings both the growth and the political risk.',
    howItEarns: [
      {
        heading: 'An allowed return on rate base, granted state by state',
        body:
          'Duke earns whatever return its commissions authorise on the capital they approve, in the Carolinas, Florida, the Midwest and Indiana. Demand barely moves; growth comes from investing capital those commissions permit. Forecasting the business means forecasting regulatory outcomes and the pace of the capital plan.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Generation replacement is the capital programme',
        body:
          'Retiring coal and replacing it with gas, renewables and grid hardening is a multi-decade, commission-approved spend. The transition is the growth driver: every replacement dollar enters the rate base, and the political argument is over the pace rather than the direction.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across index and institutional managers with a very large free float, typical of a large regulated US utility.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Intersegment transactions between regulated subsidiaries in different states, each reviewed by its own commission',
        'Noncontrolling interests in specific projects and structures',
      ],
      minorityProtections: [
        'Single voting class with dispersed ownership',
        'Six separate commissions supervising the regulated subsidiaries, including related-party dealings',
        'SEC reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Six regulators is diversification and complexity at once',
        body:
          'Operating across six jurisdictions means no single commission decision is decisive, which genuinely reduces risk relative to a single-state utility. It also means six rate case calendars, six political environments and six sets of cost-allocation rules, and an investor has to track all of them to know what the company will earn.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The gap between authorised and earned return is the management scorecard',
        body:
          'A utility persistently earning below its allowed return is either badly run or badly regulated, and the two require opposite responses from an investor. That gap, sustained over several years, is the most informative and least-read number in the sector.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Statutory service territories across six states',
        mechanism:
          'Exclusive franchises granted by statute over transmission and distribution networks that cannot be economically duplicated, serving customers who cannot switch supplier.',
        evidence: 'Exclusive service of large territories including several with above-average population growth, under franchises measured in decades.',
        erodedBy: 'Commission decisions on allowed return and cost recovery, and retail choice legislation where it is considered.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Investment-grade cost of capital at this leverage',
        mechanism:
          'A utility running at five to six times EBITDA can only fund a large capital programme if it borrows cheaply. Scale and rating are what make the spread between authorised return and funding cost positive.',
        evidence: 'Continuous access to long-dated debt markets to fund a capital plan larger than annual revenue.',
        erodedBy: 'A downgrade, or a period where the incremental cost of debt exceeds the authorised return until the next rate case.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A very large, commission-approved capital plan funded with debt and equity, deployed into generation replacement and grid investment. There is limited discretion: the plan is negotiated with regulators, and management\'s value-add is executing it at or below the approved cost.',
      good: [
        'A capital programme concentrated in regulated rate base rather than in merchant generation',
        'Exiting merchant and international businesses accumulated in earlier eras to focus on the regulated return',
      ],
      bad: [
        'Coal ash and environmental remediation liabilities from the legacy generation fleet, recovered from ratepayers only partially and after dispute',
        'Periods of earned return below the authorised level, which is value left on the table whatever its cause',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'PJM capacity prices rose 833%, and Duke sits next to that market',
        body:
          'Capacity prices in PJM rose 833% between the 2024-25 and 2025-26 delivery years, and EIA projects PJM demand growth around 4% in 2026 driven mostly by data centres. For a utility in adjacent and overlapping territories that is both an opportunity to invest and a signal of how fast the cost of serving load is rising.',
        basis: 'REPORTED',
      },
      {
        heading: 'Affordability politics arrive through six legislatures',
        body:
          'The mechanism is the same everywhere: bills rise for residential customers to serve load they did not create, and commissions or legislatures respond with cost-allocation rules or disallowance. Operating in six states means six places this can happen and none where it is decisive.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Disallowance of capital deployed against load that did not arrive',
        body:
          'The commission decides retrospectively whether spending was prudent. Capital committed on a data centre forecast that proves speculative is the specific exposure, and it is a regulatory rather than an operational loss.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Regulatory lag on a permanently levered balance sheet',
        body:
          'At five to six times EBITDA, a rise in the cost of new debt compresses the spread immediately while the authorised return adjusts only at the next rate case. The squeeze happens in between.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'duk-regulated-spread',
        title: 'A spread business with six regulators, which is safer than one',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Earnings are the authorised return applied to approved capital, so a utility growing rate base at a mid-single-digit rate grows earnings at that rate almost regardless of electricity demand. Spreading that across six jurisdictions means no single adverse commission decision is decisive, which is a genuine risk reduction relative to a single-state peer. The data centre buildout gives the company more approved capital to deploy than it has had in twenty years, and the return on it is granted rather than competed for.',
        requires: [
          'Commissions continue approving the capital plan at returns above the cost of capital',
          'Earned return stays close to the authorised level rather than persistently below it',
          'Load growth justifies the investment in at least several of the six jurisdictions',
        ],
        breaks: [
          'Rate cases that cut the allowed return or slow cost recovery',
          'Capital disallowed as imprudent after load fails to materialise',
          'A sustained gap between earned and authorised return, indicating the plan is not being executed at approved cost',
        ],
        modelLink: [
          { assumption: 'Capex path and fade', note: 'Rate base growth is the earnings driver. Model the approved plan rather than a percentage of revenue, and do not fade it to maintenance early.' },
          { assumption: 'WACC versus authorised return', note: 'The spread between the two, times the equity in rate base, is the value creation. Test it at a higher cost of debt.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'duk-who-pays',
        title: 'The bill is rising faster than the load is arriving',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'PJM capacity prices rose 833% in a single delivery-year transition, and 700 GW of interconnection requests nationally against 477 GW of actual consumption says much of the pipeline is duplicated. Utilities are being asked to commit capital now against load that may never connect, and the cost lands on residential ratepayers in the interim. That is the precondition for cost disallowance and legislated cost reallocation — the two mechanisms by which a regulated utility loses money without anything operational going wrong.',
        requires: [
          'A material share of the large-load pipeline proves speculative',
          'Residential bill increases translate into commission or legislative response',
          'Capital continues to be committed ahead of financially backed commitments',
        ],
        breaks: [
          'Large-load tariffs and deposit requirements that place the cost on the customer causing it',
          'Load arriving at the forecast pace, validating the capital plan',
          'Commission decisions that pre-approve recovery before capital is committed',
        ],
        modelLink: [
          { assumption: 'Revenue driver — MWh delivered', note: 'Drive volumes off contracted large-load agreements rather than off interconnection queue position.' },
          { assumption: 'Capex path', note: 'Model a case where capital is spent and only part enters rate base. That is what a disallowance does to the return.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Utility Dive — six power sector trends to watch in 2026', url: 'https://www.utilitydive.com/news/utility-power-sector-trends-2026/808782/' },
      { label: 'Goldman Sachs — US data centre power demand', url: 'https://www.goldmansachs.com/insights/articles/us-data-center-power-demand-projected-to-double-by-2027' },
      { label: 'EIA 2026 outlook — capacity buildout and electricity demand', url: 'https://www.power-eng.com/business/policy-and-regulation/eias-2026-outlook-projects-massive-capacity-buildout-as-data-centers-reshape-electricity-demand/' },
      { label: 'Columbia CGEP — load growth and electricity prices', url: 'https://www.energypolicy.columbia.edu/publications/the-effects-of-load-growth-on-electricity-prices-in-the-united-states-a-literature-review/' },
    ],
  },
];
