import type { CompanyQualitative } from '../types';

export const REAL_ESTATE: CompanyQualitative[] = [
  {
    ticker: 'MRVE3',
    sector: 'Real Estate',
    scope: 'BRAZIL',
    headline:
      'A low-income homebuilder whose addressable market is a government programme — now funded at a record R$208.7 billion for 2026, with a new tier reaching R$600,000 that opens the middle class to subsidised rates.',
    howItEarns: [
      {
        heading: 'Building to a price ceiling the programme sets',
        body:
          'MRV builds standardised apartment units priced to qualify for Minha Casa Minha Vida financing. The selling price is effectively capped by the programme tier, so the margin is the gap between that ceiling and the cost per square metre. Volume is determined by how many units the FGTS will finance in a year.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Revenue recognised over construction, so today\'s margin is last year\'s decision',
        body:
          'Under the percentage-of-completion method, revenue and margin are recognised as a project is built over two to three years. The margin reported now reflects land bought and prices set years earlier against costs incurred since, which is why a cost inflation shock appears long after it happened.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Menin family, founders of the business, through a holding position, with a substantial institutional free float. The family has built low-income housing across multiple cycles.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the family holding the largest block.',
      relatedPartyExposure: [
        'A controlling family decides the land acquisition and launch programme that minority capital funds',
        'A US homebuilding subsidiary expanded with group capital, operating in a different market with different economics',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'Programme rules and price ceilings set by government, independent of any shareholder',
        'Segment reporting separating the Brazilian and US operations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Generational operators in a business that punishes over-expansion',
        body:
          'The family has run this business through several cycles of aggressive landbanking followed by cost overruns and cancellations. That experience is an asset, and it has not prevented the company from repeating parts of the pattern — most recently expanding geographically and into the United States while Brazilian margins were compressing.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The US subsidiary is a different business funded by the same capital',
        body:
          'Building for rent in the United States is a distinct model with different funding, different cyclicality and no programme subsidy. It diversifies the group and consumes Brazilian shareholders\' capital in a market where the company has no structural advantage.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Scale and standardisation in programme-compliant construction',
        mechanism:
          'Building the same unit type repeatedly across many sites drives cost per square metre below what a regional builder achieves, and the programme accreditation plus mortgage origination capability at scale cannot be assembled quickly.',
        evidence: 'Sustained leadership in units financed under the programme across administrations.',
        erodedBy: 'Construction cost inflation outpacing the ceiling adjustment, which compresses the margin regardless of scale.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'A landbank acquired before the cycle',
        mechanism:
          'Land bought at pre-boom prices is the homebuilder\'s real asset: it sets the margin on everything built on it, and it cannot be replicated at today\'s prices.',
        evidence: 'A landbank sized in years of launches, carried at historical cost.',
        erodedBy: 'Landbanking at cycle-peak prices, which converts the asset into a future margin problem.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Landbanking and launches driven by programme capacity, plus a geographic and international expansion that stretched the balance sheet during a period of cost inflation. Recent direction has been to focus on cash generation and the core programme tiers.',
      good: [
        'Positioning product to sit just under programme ceilings, capturing the subsidised mortgage rate and the larger buyer pool',
        'Refocusing on cash generation and core tiers after the margin compression rather than continuing to expand',
      ],
      bad: [
        'Geographic and US expansion funded while Brazilian margins were compressing and rates were rising',
        'Launches into a period when construction cost inflation exceeded the ceiling adjustment, which recognised poor margins for years afterwards',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The programme is funded at a record level for 2026',
        body:
          'Roughly R$208.7 billion was made available for 2026, including R$142.1 billion from the FGTS housing fund and R$12.5 billion in subsidies for lower-income families, plus R$24.8 billion from the Social Fund. Programme capacity is the volume constraint, and it has been relaxed.',
        basis: 'REPORTED',
      },
      {
        heading: 'The new R$600,000 tier changes the addressable product',
        body:
          'The programme now runs four urban tiers with a ceiling up to R$600,000 in the fourth, with FGHab guarantee support for up to 36 months. That brings middle-income buyers previously priced out by construction inflation into subsidised rates, at a better margin than the entry tier.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'INCC running above the ceiling adjustment',
        body:
          'With the selling price capped, construction cost inflation transfers directly out of the margin. Because projects run two to three years, the damage is locked in before it is reported.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Programme rules are set by government resolution',
        body:
          'Tiers, ceilings, subsidy amounts and the FGTS budget change by ministerial decision. A revenue forecast here is a forecast of policy continuity and should be stated as one.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'mrve3-tier-four',
        title: 'A record programme budget plus a new tier is a demand expansion, not a cycle',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'This is not a cyclical homebuilder; its addressable market is a policy parameter, and that parameter has moved decisively in its favour. R$208.7 billion available for 2026, R$142.1 billion of it from the FGTS, and a fourth tier reaching R$600,000 with guarantee support for three years, brings buyers previously excluded by construction inflation into subsidised mortgage rates. For a builder with scale in standardised construction and a landbank at historical cost, that is volume at a better margin than the entry tier, and it does not require the interest rate cycle to cooperate.',
        requires: [
          'Programme funding and the new tier ceilings remain in place',
          'Product is positioned to qualify within the tiers rather than just above them',
          'Construction cost inflation stays below the ceiling adjustment',
        ],
        breaks: [
          'INCC running above the ceiling adjustment, compressing margin on units already launched',
          'A change of government reducing programme funding or tier ceilings',
          'Cancellations rising as buyers fail credit approval at the new tier',
        ],
        modelLink: [
          { assumption: 'Revenue driver — units launched and price per unit', note: 'Model units by programme tier with their own ceilings. A blended average price hides the entire tier-four argument.' },
          { assumption: 'Gross margin in backlog', note: 'Margin is locked at launch and recognised over construction. Model the backlog margin rather than a forward margin assumption.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'mrve3-policy-peak',
        title: 'A record budget is the top of a political priority, not a permanent base',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The housing deficit is real and measured in millions of units; whether it is funded is a separate question. The programme is financed largely from workers\' severance contributions rather than a federal budget line, which is what allowed it to grow — and also means it depends on formal employment and competes with other claims on the same fund. Builders that add capacity, landbank and geographic reach to a record funding level carry that capacity through whatever follows, and this company\'s own history is one of expanding into peaks and recognising the consequences two years later.',
        requires: [
          'Current funding represents a policy peak rather than a sustainable base',
          'The company adds capacity and landbank against it',
        ],
        breaks: [
          'Multi-year funding commitments that survive a change of administration',
          'FGTS contributions growing enough to sustain the programme without competing claims',
          'Disciplined launches that do not extend capacity beyond mid-cycle volumes',
        ],
        modelLink: [
          { assumption: 'Revenue driver — units launched', note: 'Model volumes at a mid-cycle programme funding level rather than the 2026 record, and see what the equity is worth.' },
          { assumption: 'Landbank and capex', note: 'Land bought against peak volumes is the mechanism by which the next downturn is funded today.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Forbes Brasil — record MCMV budget for 2026', url: 'https://forbes.com.br/forbes-money/forbes-real-estate/2026/07/minha-casa-minha-vida-2026-mcmv/' },
      { label: 'NSC Total — R$160bn FGTS package and the 2026 housing market', url: 'https://www.nsctotal.com.br/noticias/pacote-de-r-160-bilhoes-do-fgts-promete-mexer-no-mercado-imobiliario-em-2026/' },
      { label: 'Mix Vale — MCMV 2026: new tier finances property up to R$600,000', url: 'https://www.mixvale.com.br/2026/09/04/minha-casa-minha-vida-2026-nova-faixa-financia-imovel-de-r-600-mil/' },
      { label: 'Revista Empreende — FGTS expands MCMV subsidies', url: 'https://revistaempreende.com.br/fgts-amplia-subsidios-minha-casa-minha-vida-2026/' },
    ],
  },

  {
    ticker: 'CYRE3',
    sector: 'Real Estate',
    scope: 'BRAZIL',
    headline:
      'A mid and high-end developer whose products sit above the programme ceilings — so it sells into market-rate mortgages while its low-income competitors sell into subsidised ones, and the new R$600,000 tier reaches into its lower range.',
    howItEarns: [
      {
        heading: 'Developing for buyers who finance at market rates',
        body:
          'Cyrela develops mid, high and luxury residential projects in the main metropolitan markets, priced above the subsidised programme tiers. Buyers finance through the savings-funded SBPE system or pay cash, so affordability depends on the mortgage rate and on wealth rather than on a subsidy.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Joint ventures and partner brands spread the capital',
        body:
          'A large share of launches is done through joint ventures and partner developers, which lets the company put its brand and expertise into more projects than its own balance sheet would fund. It also means consolidated figures include minority interests that dilute the headline result.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Horn family, founders of the business, with a substantial institutional free float. The family has developed in São Paulo across several property cycles.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the family holding the controlling block.',
      relatedPartyExposure: [
        'Joint ventures and partner developer arrangements, several with related or affiliated entities',
        'A controlling family decides the landbank and launch programme',
        'Minority interests in project-level vehicles that share the economics of consolidated launches',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'Project-level disclosure of joint venture economics',
        'A concentrated institutional base that has engaged on capital allocation and distributions',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A complex structure of partial interests in many projects',
        body:
          'Launches through joint ventures, partner brands and project-specific vehicles make consolidated figures hard to interpret: revenue includes projects the company partly owns, and minority interest removes a meaningful share of the result. Analysing this company requires looking through to the company\'s own economic share rather than at consolidated revenue.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The family has generally been disciplined on the cycle',
        body:
          'Across the 2010s downturn the company reduced launches, cut its landbank and survived a period that removed several listed competitors. That record of contraction is the relevant governance evidence for a developer, because the failure mode is always expansion into a peak.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Brand and landbank in prime São Paulo locations',
        mechanism:
          'In mid and high-end residential, the buyer is paying partly for the developer\'s reputation for delivering on time and to specification, and partly for the location. Prime urban land in the largest Brazilian market is genuinely scarce and was bought before the current prices.',
        evidence: 'Price premiums and absorption rates above the market in comparable locations, sustained across cycles.',
        erodedBy: 'Land price inflation in prime areas, and a delivery failure that damages the brand the premium rests on.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Disciplined through the last downturn and expansionary in the recovery, with joint ventures used to extend reach without proportional capital. Distributions have been substantial when the cycle allowed.',
      good: [
        'Cutting launches and landbank through the 2010s downturn, which is why the company survived a cycle that removed competitors',
        'Using joint ventures and partner brands to extend the launch programme without a proportional balance sheet commitment',
      ],
      bad: [
        'A structure of partial interests complex enough that consolidated figures misstate the company\'s own economics',
        'Historical expansion into segments and geographies later exited, which is the standard developer pattern',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The new programme tier reaches the bottom of this company\'s range',
        body:
          'A fourth MCMV tier financing units up to R$600,000, with FGHab support for 36 months, brings subsidised rates to product that previously required market-rate mortgages. For a developer whose lower-middle range sits near that ceiling, it is an expansion of the financeable buyer pool at that price point.',
        basis: 'REPORTED',
      },
      {
        heading: 'Everything above the ceiling depends on the rate cycle',
        body:
          'Mid and high-end buyers finance at market rates funded by savings deposits, so affordability follows Selic. With rates cut to 14.00% by August 2026 and falling, the constraint on this company\'s core product is loosening — and it is a cycle rather than a policy change.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Mortgage funding availability, not just the rate',
        body:
          'The savings-funded mortgage system depends on deposit inflows, which fall when rates are high because savers move to higher-yielding instruments. Funding scarcity can constrain sales even when the rate itself would be affordable.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Cancellations on delivery in a weak consumer environment',
        body:
          'Brazilian buyers can cancel and recover much of what they paid. With a record 82% of households carrying debt, cancellation rates rise on delivery and reverse revenue already recognised.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'cyre3-rate-cycle',
        title: 'The clearest listed beneficiary of the Brazilian easing cycle',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Unlike the low-income builders whose volumes are set by programme funding, this company sells into market-rate mortgages — so the rate cycle is the demand driver rather than a background condition. Selic was cut in steps through 2026 to 14.00% and the easing continues, which both lowers the instalment and restores savings-deposit inflows that fund the mortgage system. Meanwhile the new R$600,000 programme tier reaches into the bottom of the company\'s range, adding subsidised financing to product that previously had none.',
        requires: [
          'The easing cycle continues, lowering mortgage rates and restoring deposit funding',
          'Cancellation rates stay contained as projects deliver',
          'Product positioned near the new tier ceiling captures the subsidised financing',
        ],
        breaks: [
          'Savings deposit outflows constraining mortgage funding regardless of the rate',
          'Cancellations rising on delivery, reversing recognised revenue',
          'Land cost inflation in prime areas compressing margins on future launches',
        ],
        modelLink: [
          { assumption: 'Revenue driver — units and price per unit by segment', note: 'Model product above and below the programme ceiling separately. They have different buyers and different financing.' },
          { assumption: 'WACC and cancellation rate', note: 'Both the discount rate and the buyer\'s mortgage rate move with Selic. Model the demand effect, not just the valuation effect.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'cyre3-look-through',
        title: 'Consolidated figures overstate what shareholders actually own',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'A large share of launches happens through joint ventures, partner brands and project-level vehicles in which the company holds a partial interest. Consolidated revenue therefore includes projects it does not fully own, and minority interest removes a meaningful share of the result before it reaches shareholders. Valuing this company on consolidated multiples overstates the economics; the honest approach is to look through to the company\'s own share of each project. That is not a bull or bear case — it is a reason the reported numbers and the shareholder\'s numbers differ, systematically.',
        requires: [
          'The joint venture and partner structure persists',
          'A material share of launches continues to be conducted through partial interests',
        ],
        breaks: [
          'Simplification into wholly owned development, which would align consolidated and economic figures',
        ],
        modelLink: [
          { assumption: 'Minority interest', note: 'The bridge from enterprise value to equity value has to deduct minority interest properly. This is where the overstatement lives.' },
          { assumption: 'Segment / project-level revenue', note: 'Model the company\'s economic share of launches rather than consolidated launch volume.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Mix Vale — MCMV 2026 fourth tier up to R$600,000', url: 'https://www.mixvale.com.br/2026/09/04/minha-casa-minha-vida-2026-nova-faixa-financia-imovel-de-r-600-mil/' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
      { label: 'Itaponews — household indebtedness at a record', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
    ],
  },

  {
    ticker: 'MULT3',
    sector: 'Real Estate',
    scope: 'BRAZIL',
    headline:
      'An owner of dominant shopping centres collecting index-linked rent from tenants whose sales are falling — which is why realised rent growth sits below the contractual index.',
    howItEarns: [
      {
        heading: 'Contractual rent indexed to inflation, plus a share of tenant sales',
        body:
          'Leases set a minimum rent adjusted annually by IGP-M or IPCA, with a percentage-of-sales component above a threshold. The landlord therefore captures inflation contractually and tenant growth partially, which is a better structure than either alone.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Dominance in a catchment is what makes the rent collectable',
        body:
          'A mall that is the primary destination in its catchment gets the anchor tenants, the traffic and the pricing power. A secondary mall in the same city gets the tenants who could not get into the first and rent they cannot always pay. Portfolio quality, not square metres, is the asset.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the founding family with a Canadian institutional partner holding a significant strategic stake, and a substantial free float alongside.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the controlling group holding the largest position.',
      relatedPartyExposure: [
        'A strategic institutional partner with board representation and its own real estate interests',
        'Property management and development services provided within the group structure',
        'Partial ownership interests in individual malls shared with other institutional owners',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'Asset-level disclosure of occupancy, sales per square metre and occupancy cost',
        'A sophisticated institutional partner whose interests largely align with minority holders',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A quality-over-quantity strategy, consistently applied',
        body:
          'The company has concentrated on dominant assets in strong catchments and sold or avoided secondary malls, which is the correct strategy in a format where the winner in each catchment takes most of the economics. That discipline is visible in occupancy and sales per square metre relative to peers.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Partial interests in individual assets complicate the accounts',
        body:
          'Malls held in partnership with other institutional owners mean consolidated figures and the company\'s economic share differ. Net asset value analysis requires looking through to ownership percentages asset by asset.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Catchment dominance in irreplaceable locations',
        mechanism:
          'The primary mall in a catchment cannot be duplicated: the land, the approvals and the anchor tenant relationships are taken. A competitor building nearby competes for the traffic the incumbent already has, which is why dominant malls hold occupancy through downturns that empty secondary ones.',
        evidence: 'Occupancy and sales per square metre sustained above the market through Brazilian recessions.',
        erodedBy: 'E-commerce shifting categories out of physical retail, and a catchment\'s demographics deteriorating.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Expansion of dominant assets, disposal of secondary ones, and distributions from the resulting cash flow. Redevelopment of existing malls has generally earned better returns than greenfield, which is the right conclusion for a mature format.',
      good: [
        'Selling secondary assets and concentrating capital on dominant ones, which is where the durable economics are',
        'Expanding and redeveloping existing malls rather than building new ones into a format with limited growth',
      ],
      bad: [
        'Partial interests in assets that complicate the structure and dilute control over individual properties',
        'Greenfield development in earlier cycles into catchments that did not support a dominant asset',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Contractual indexation meets tenants who cannot pay it',
        body:
          'Broad Brazilian retail contracted 2.2% year on year in February 2026 while real incomes rose 5.2%, and large retail brands accumulated around R$20 billion in judicial recovery proceedings during the year. A landlord insisting on the full index increase in that environment chooses between discounts and vacancy, which is why realised rent growth sits below the contract.',
        basis: 'REPORTED',
      },
      {
        heading: 'Occupancy cost is the ratio that predicts the trouble',
        body:
          'Rent as a share of tenant sales rises automatically when sales fall, and above a certain level tenants close stores. That ratio, not the occupancy rate, is the leading indicator, and it deteriorates before any vacancy appears.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Tenant failure in a weak discretionary market',
        body:
          'Apparel, electronics and home goods retailers — the mall\'s core tenants — face Asian platform competition and credit costs above 25%. Judicial recovery filings among large brands remove rent and leave space to re-let in the same weak market.',
        basis: 'REPORTED',
      },
      {
        heading: 'Rate sensitivity through the asset value',
        body:
          'Mall values are net operating income divided by a cap rate that follows real rates. The rate cycle moves the net asset value before it moves the rent roll, which is why the shares trade with duration.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'mult3-dominance',
        title: 'In a weak retail market the dominant mall gains tenants and the secondary one loses them',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Retail weakness is not uniform across landlords. When a chain rationalises its store base it closes the secondary locations and keeps the one in the dominant mall, because that is where the sales are. A portfolio concentrated in catchment-dominant assets therefore gains share of a shrinking tenant universe, and the judicial recovery wave among large brands accelerates that concentration rather than only damaging it. Add contractual indexation and a falling discount rate as Selic declines, and the asset class is better positioned than the retail sales data suggests.',
        requires: [
          'Portfolio remains concentrated in catchment-dominant assets',
          'Occupancy cost stays below the level where dominant-mall tenants close',
          'Real rates continue falling, supporting asset values',
        ],
        breaks: [
          'Occupancy cost rising to the point where even dominant-mall stores become unprofitable',
          'E-commerce taking enough of the anchor categories that traffic falls structurally',
          'Real rates rising, which compresses asset values directly',
        ],
        modelLink: [
          { assumption: 'Revenue driver — occupied area and rent per square metre', note: 'Model occupancy and rent per square metre separately, and check realised rent growth against the contractual index. The gap is the discount being granted.' },
          { assumption: 'WACC / cap rate', note: 'Asset value is net operating income over a cap rate that follows real rates. Test the value across a rate range.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'mult3-occupancy-cost',
        title: 'Contractual rent growth that cannot be collected is not rent growth',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Leases index to IGP-M or IPCA, but the rent is only worth what tenants can pay out of sales — and broad retail contracted 2.2% year on year while the index kept rising. Occupancy cost therefore climbs automatically toward the level at which stores close. A landlord can report rising same-store rent while granting discounts, deferring increases and watching the tenant mix deteriorate, and by the time vacancy appears the anchors that generated the traffic have gone. The reported metric improves while the asset gets worse.',
        requires: [
          'Tenant sales continue growing more slowly than the contractual index',
          'Discretionary retail weakness persists through the credit cycle',
        ],
        breaks: [
          'Tenant sales recovering as Selic falls and credit becomes affordable again',
          'Mix shift toward services, food and entertainment tenants whose sales are less exposed to platform competition',
        ],
        modelLink: [
          { assumption: 'Revenue driver — rent per square metre', note: 'Model realised rent growth below the contractual index, which is what discounts and deferrals actually produce.' },
          { assumption: 'Occupancy', note: 'Test the value with occupancy falling a few points. In a fixed-cost asset that is where the operating leverage bites.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Brazil Economy — Brazilian retail faces structural change from digital platforms', url: 'https://brazileconomy.com.br/empresas/2026/08/varejo-brasileiro-enfrenta-mudanca-estrutural-diante-do-avanco-das-plataformas-digitais/' },
      { label: 'Poder360 — large retail brands accumulate R$20bn in judicial recovery in 2026', url: 'https://www.poder360.com.br/poder-economia/grandes-marcas-do-varejo-acumulam-r-20-bilhoes-em-rjs-em-2026/' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
    ],
  },

  {
    ticker: 'ALOS3',
    sector: 'Real Estate',
    scope: 'BRAZIL',
    headline:
      'A shopping centre owner formed by merging two portfolios, still working through which assets are genuinely dominant — in a retail market where only the dominant ones hold their rent.',
    howItEarns: [
      {
        heading: 'Indexed minimum rent plus a share of tenant sales',
        body:
          'The same lease structure as any Brazilian mall: a minimum rent adjusted by IGP-M or IPCA, plus a percentage of sales above a threshold, plus service charges. The landlord captures inflation contractually and tenant growth partially.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Portfolio recycling is an active part of the business',
        body:
          'Selling stakes in non-core assets and reinvesting in dominant ones or in buybacks is a continuous activity rather than an occasional one. For a merged portfolio with a range of asset quality, it is the mechanism by which the average improves.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No single controlling shareholder following the merger that created the company. Ownership is dispersed across Brazilian and foreign institutions with a large free float.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'Legacy management and service arrangements inherited from the merged entities',
        'Partial ownership interests in individual malls shared with institutional co-owners',
        'A board without an anchor shareholder makes strategy contestable',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'No controlling block, so board composition is contested',
        'Asset-level disclosure of occupancy, sales per square metre and occupancy cost',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A merger whose synergies are real and whose portfolio is uneven',
        body:
          'Combining two mall portfolios produces genuine cost synergies in management, leasing and service charges. It also produces an asset base with a wider range of quality than either company had alone, and the work of identifying and selling the weaker assets takes years. Judging this company means judging the disposal programme, not the merger arithmetic.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Dispersed ownership after a merger means contestable strategy',
        body:
          'With no anchor holder and a register assembled from two shareholder bases, the board is accountable to everyone and committed by no one. That makes a multi-year portfolio recycling programme harder to sustain than it would be under a long-horizon controller.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Dominant assets within a mixed portfolio',
        mechanism:
          'The genuinely dominant centres in the portfolio have the same irreplaceability as any primary mall — the land, approvals and anchor relationships in their catchments are taken. The moat exists asset by asset rather than at company level.',
        evidence: 'Occupancy and sales per square metre in the top assets comparable to the best in the market, with a wider dispersion below them.',
        erodedBy: 'Catchment deterioration in the secondary assets, and e-commerce in the anchor categories.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Post-merger integration, disposal of non-core assets, and reinvestment into dominant centres and buybacks. The direction is right and the pace is what determines whether the merger created value.',
      good: [
        'Realising management and leasing synergies from the combination, which were the deal\'s stated rationale',
        'Recycling capital out of secondary assets into dominant ones and into buybacks when the shares traded below asset value',
      ],
      bad: [
        'A merged portfolio with a wider quality range than either predecessor, requiring years of disposals to resolve',
        'Partial interests in individual assets that complicate both control and the net asset value calculation',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The retail weakness sorts dominant malls from the rest',
        body:
          'With broad retail down 2.2% year on year and around R$20 billion of judicial recovery among large retail brands in 2026, chains are closing secondary locations and keeping dominant ones. A mixed portfolio experiences both sides of that sorting simultaneously.',
        basis: 'REPORTED',
      },
      {
        heading: 'Occupancy cost rises automatically when tenant sales fall',
        body:
          'Rent indexed to inflation against falling sales pushes occupancy cost up toward the level at which stores close. In secondary assets that threshold is reached sooner, which is why portfolio quality determines the outcome.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Secondary assets losing tenants to dominant competitors',
        body:
          'When a chain rationalises, the store that closes is in the weaker mall. A portfolio with a range of asset quality loses rent at the bottom while the market concentrates at the top.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Disposals into a weak transaction market',
        body:
          'Selling secondary malls requires a buyer, and buyers for weak retail assets in a weak retail market price them accordingly. The recycling programme may take longer or realise less than the plan assumes.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'alos3-synergy-and-recycling',
        title: 'Merger synergies plus disposals, priced as if neither will happen',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The combination created genuine cost synergies in management, leasing and service charges, and left a portfolio whose average quality can be raised by selling the bottom and reinvesting in the top or in buybacks. With the shares trading below the implied value of the assets, recycling capital out of secondary malls into repurchases is directly accretive. The thesis is an execution one — synergies delivered and disposals completed — and both are measurable rather than speculative.',
        requires: [
          'Synergies from the combination continue being realised in the cost line',
          'Non-core disposals complete at prices near carrying value',
          'Dominant assets hold occupancy and rent through the retail weakness',
        ],
        breaks: [
          'Disposals stalling or completing well below carrying value in a weak transaction market',
          'Secondary asset deterioration outpacing the disposal programme',
          'A dispersed board abandoning the recycling programme under pressure for distributions',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Synergies show as margin expansion on flat revenue. Model the cost line rather than the rent roll for that part of the thesis.' },
          { assumption: 'Net asset value bridge', note: 'Value this asset by asset with ownership percentages, then compare to the share price. The disposal case only exists in that comparison.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'alos3-quality-dispersion',
        title: 'A portfolio average is not an investment case when the dispersion is this wide',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Mall economics are asset-specific: the dominant centre in a catchment holds its tenants through a downturn and the secondary one does not. A merged portfolio with a wide quality range is therefore two different businesses reported as one average, and the average improves only as the weak half is sold — into a market where buyers of weak retail assets are scarce. Meanwhile occupancy cost is rising automatically against falling tenant sales, and it crosses the store-closure threshold in secondary assets first.',
        requires: [
          'Retail weakness persists, continuing to sort dominant assets from secondary ones',
          'The transaction market for secondary retail assets remains thin',
        ],
        breaks: [
          'Tenant sales recovering as Brazilian credit costs fall, relieving occupancy cost across the portfolio',
          'Disposals completing quickly at carrying value, resolving the dispersion',
        ],
        modelLink: [
          { assumption: 'Occupancy and rent per square metre', note: 'Model the dominant and secondary assets separately. A portfolio-average rent per square metre is exactly what hides this.' },
          { assumption: 'Net asset value bridge', note: 'Mark the secondary assets at a realistic transaction price rather than carrying value.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Poder360 — R$20bn in judicial recovery among large retail brands in 2026', url: 'https://www.poder360.com.br/poder-economia/grandes-marcas-do-varejo-acumulam-r-20-bilhoes-em-rjs-em-2026/' },
      { label: 'Brazil Economy — structural change in Brazilian retail', url: 'https://brazileconomy.com.br/empresas/2026/08/varejo-brasileiro-enfrenta-mudanca-estrutural-diante-do-avanco-das-plataformas-digitais/' },
      { label: 'Sindilojas SP — the crisis of large Brazilian retail', url: 'https://sindilojas-sp.org.br/a-crise-do-grande-varejo-brasileiro-em-um-ambiente-de-incertezas/' },
    ],
  },

  {
    ticker: 'PLD',
    sector: 'Real Estate',
    scope: 'UNITED_STATES',
    headline:
      'The largest industrial landlord in the world, where the value is not the rent being collected but the gap between it and the market rent the same space would command today.',
    howItEarns: [
      {
        heading: 'Logistics warehouses leased on multi-year terms with fixed escalators',
        body:
          'Distribution facilities near consumption centres, leased to retailers and logistics operators for several years with contractual annual increases. Because leases were signed at various points in the past, in-place rent lags market rent — and every expiry is an opportunity to reset to the higher number.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Development is a second business with a development margin',
        body:
          'The company builds warehouses on land it owns, leases them and either holds them or sells them. The development yield above the cap rate the completed building attracts is a margin that a pure owner does not earn, and the land bank is what makes it repeatable.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Co-investment funds and joint ventures in which the company manages third-party capital alongside its own',
        'Fee income earned from managing those vehicles, which creates an incentive to grow assets under management',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC and REIT disclosure requirements including same-store metrics and lease expiry schedules',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Managing third-party capital alongside the balance sheet',
        body:
          'Co-investment vehicles generate management fees and let the company control more space than its own equity would support. The interests are mostly aligned because it invests alongside the funds, and the fee stream nonetheless creates a reason to grow assets under management that a pure owner would not have.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'FFO flatters an asset class with real capital needs',
        body:
          'Funds from operations adds back depreciation on the argument that well-maintained property holds value. For warehouses that is largely true of the land and shell and less true of roofs, docks and systems. Maintenance capital expenditure is real here and smaller than at a technology-intensive property type, which is why the measure works better for this company than for some peers.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Infill land near consumption, which cannot be replicated',
        mechanism:
          'The value of a distribution warehouse is its distance from the customers it serves. Land close enough to major population centres is scarce, zoned and expensive, and the company assembled its positions before the current prices. A competitor can build further out and will serve a worse purpose.',
        evidence: 'Market rents in infill locations rising faster than in the broader industrial market, with in-place rents lagging them substantially.',
        erodedBy: 'Rezoning or new supply in infill submarkets, and a fall in the value of proximity if delivery economics change.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Scale in customer relationships across markets',
        mechanism:
          'A logistics operator expanding across many cities prefers a landlord that can offer space in all of them under one relationship, which shortens leasing cycles and reduces vacancy between tenants.',
        evidence: 'Leasing volumes and retention rates above the market, with a customer base concentrated in large multi-market operators.',
        erodedBy: 'Tenant consolidation increasing their negotiating power, and competitors reaching comparable multi-market scale.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Development on owned land at yields above prevailing cap rates, funded partly by third-party capital, plus disposals of stabilised assets. The model is capital-efficient and depends on land bought before the market repriced.',
      good: [
        'Assembling infill land positions ahead of the e-commerce-driven demand that made them scarce',
        'Using co-investment vehicles to control more space than the balance sheet alone would support',
      ],
      bad: [
        'Development volumes built against demand forecasts that assumed e-commerce penetration rising faster than it did, producing a period of elevated vacancy',
        'A fee-earning asset management business that introduces an incentive to grow rather than to optimise the owned portfolio',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Leasing has recovered and vacancy has stabilised above the prior trough',
        body:
          'Industrial leasing reached 145.2 million square feet in the first quarter of 2026, up 17.8% year on year, with vacancy stabilising in the 7% to 7.5% range against 6.7% in late 2024. Demand has returned and the market is no longer as tight as it was at the peak.',
        basis: 'REPORTED',
      },
      {
        heading: 'Industrial cap rates are the highest of the major property types',
        body:
          'Single-tenant net lease industrial cap rates were 7.15% in the first quarter of 2026, above retail at 6.55%. For an acquirer that is a better entry yield; for an owner it is a higher rate applied to existing income.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The mark-to-market closing without market rents rising further',
        body:
          'The embedded value is the gap between in-place and market rent. As leases roll and reset, that gap is realised and not replaced unless market rents keep rising. It is a one-time benefit spread over several years, not a growth rate.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'New supply in the submarkets that matter',
        body:
          'Vacancy has risen from its trough to 7% to 7.5%, which means supply has been arriving. Infill scarcity protects the best locations and not the portfolio average.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'pld-mark-to-market',
        title: 'The rent already contracted is well below what the space is worth',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Leases signed over the past several years are below current market rents in infill locations, and every expiry resets toward the higher number without any new capital, new building or new tenant demand. That is embedded, contractual earnings growth visible in the lease expiry schedule rather than forecast. Add a development business earning a margin above prevailing cap rates on land bought before the market repriced, and the growth does not depend on the economy accelerating.',
        requires: [
          'Market rents in core infill submarkets hold at or above current levels',
          'Lease expiries continue resetting toward market rather than being renewed at concessions',
          'Development yields stay above the cap rates completed assets attract',
        ],
        breaks: [
          'Market rents falling, which closes the gap from the wrong end',
          'New supply in infill submarkets pushing vacancy higher and forcing concessions at renewal',
          'Cap rates rising enough that development no longer earns a margin',
        ],
        modelLink: [
          { assumption: 'Revenue driver — occupied area and rent per square foot', note: 'Model the in-place versus market rent gap explicitly against the expiry schedule. A single rent growth rate cannot express a mark-to-market.' },
          { assumption: 'Capex path / development spend', note: 'Development is a margin business, not maintenance capex. Model the two separately.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'pld-one-time-benefit',
        title: 'A mark-to-market is a one-time gain being valued as a growth rate',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The gap between in-place and market rent is finite. Once the portfolio has rolled, the growth rate reverts to whatever contractual escalators and market rent growth provide — and market rent growth is a function of supply, which has been arriving: vacancy has risen from 6.7% to a 7% to 7.5% range. Applying the mark-to-market uplift as a perpetual growth rate in a terminal value overstates the business by capitalising something that happens once, and industrial cap rates at 7.15% are the highest of the major property types for a reason.',
        requires: [
          'The in-place to market gap continues closing as leases roll',
          'New supply keeps market rent growth close to inflation rather than above it',
        ],
        breaks: [
          'A renewed supply shortage in infill markets driving market rents materially higher again',
          'Demand growth from nearshoring or inventory rebuilding that absorbs the new supply',
        ],
        modelLink: [
          { assumption: 'Terminal growth', note: 'Set terminal rent growth at inflation rather than at the mark-to-market pace. The difference is the entire disagreement.' },
          { assumption: 'Revenue driver — rent per square foot', note: 'Model the uplift as a finite ramp over the expiry schedule, then flat. If the model compounds it, it is capitalising a one-time gain.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Sands Investment Group — US industrial real estate market 2026', url: 'https://sandsig.com/insights/industrial-real-estate-market/' },
      { label: 'Investment Grade — NNN cap rates 2026 by property type', url: 'https://investmentgrade.com/nnn-cap-rates-2026/' },
      { label: 'Prologis — Q4 earnings call highlights', url: 'https://finance.yahoo.com/news/prologis-q4-earnings-call-highlights-180649155.html' },
    ],
  },

  {
    ticker: 'AMT',
    sector: 'Real Estate',
    scope: 'UNITED_STATES',
    headline:
      'A tower landlord whose three tenants are the three US carriers, with escalating leases and near-zero incremental cost per additional tenant — and whose customers have finished the spending cycle that drove its growth.',
    howItEarns: [
      {
        heading: 'Ground leases to carriers, with a second tenant costing almost nothing',
        body:
          'A tower is leased to a carrier for a decade or more with annual escalators. Adding a second or third carrier to the same structure requires minimal capital and the rent is nearly all margin, so tower economics are about tenants per tower rather than towers owned.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Amendments are the real growth, not new towers',
        body:
          'When a carrier upgrades equipment on an existing tower it pays more rent under a lease amendment. That is growth with no capital and no new site, and it is why tower revenue growth tracks carrier equipment cycles rather than tower construction.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Long-term master lease agreements with a very small number of carrier customers who are also the only possible tenants',
        'Joint ventures and partial interests in international tower portfolios and data centre assets',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC and REIT disclosure including tenant concentration and lease expiry schedules',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Customer concentration is the structure, not a risk factor',
        body:
          'In any given market a tower company has two to four possible tenants. That is not diversifiable, it is what the business is, and it gives the carriers enormous negotiating leverage at every master lease renewal. Consolidation among carriers directly reduces the tenant count and therefore the rent per tower.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'International and data centre expansion took the company away from the core model',
        body:
          'Emerging market tower portfolios introduced currency and counterparty risk, and a data centre acquisition added a business with real maintenance capital and different economics. Both were responses to a maturing domestic tower market, and both diluted the purity of the original model.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Vertical real estate with zoning and siting protection',
        mechanism:
          'Building a new tower requires zoning approval, community consent and a site, and communities generally resist new towers. That makes existing structures far more valuable than replacement cost, and a carrier needing coverage in an area usually has no alternative to the tower already there.',
        evidence: 'Lease renewal rates near universal, with escalating rent and tenant counts above one on most structures.',
        erodedBy: 'Carrier consolidation removing tenants, small-cell and satellite alternatives reducing the need for macro towers.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Two decades of acquiring and building towers funded with debt against contracted cash flow, then an international and data centre diversification as the domestic market matured. The core acquisitions were excellent; the diversification has been mixed.',
      good: [
        'Building a domestic portfolio at costs far below what the contracted rent has since justified',
        'Financing long contracted cash flows with long debt, which is the correct structure for the asset',
      ],
      bad: [
        'Emerging market tower portfolios acquired at prices that assumed carrier growth and currency stability that did not hold, later impaired or exited',
        'A data centre acquisition that added a business with different capital needs and no obvious synergy with towers',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Towers are 11% of the REIT index and the carriers have finished spending',
        body:
          'Non-traditional property types now make up 67% of the REIT index, with towers at 11%. The demand driver for that allocation was the carrier equipment cycle, and with the 5G build largely complete, amendment activity — the capital-free growth — has slowed materially.',
        basis: 'REPORTED',
      },
      {
        heading: 'Carrier capital is going to fibre and fixed wireless instead',
        body:
          'Verizon is targeting 32 million fibre locations and added over 319,000 fixed wireless subscribers in a single quarter. Fixed wireless uses existing tower capacity rather than requiring new equipment, and fibre spending does not touch towers at all.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The amendment cycle ending',
        body:
          'Revenue growth without capital came from carriers upgrading equipment. With the generation build complete, that source slows until the next one, and the gap between generations is measured in years.',
        basis: 'REPORTED',
      },
      {
        heading: 'Master lease renegotiation with three customers',
        body:
          'When a master lease covering thousands of sites comes up for renewal, the negotiation is with a customer who knows it is one of only three. Consolidation makes that worse.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'amt-zero-marginal-cost',
        title: 'Adding a tenant to a tower that already exists is the best economics in real estate',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A second or third carrier on an existing structure pays rent that is almost entirely margin, because the tower, the land and the access are already there. Combined with escalating decade-long leases, near-universal renewal rates, and zoning that makes new towers hard to build, the asset produces contracted, inflation-linked cash flow at incremental margins no other property type approaches. The model does not need new construction or economic growth — only for carriers to keep needing coverage.',
        requires: [
          'Tenants per tower hold or increase',
          'Master lease renewals maintain escalators without material concessions',
          'Zoning continues to make new towers difficult, protecting existing structures',
        ],
        breaks: [
          'Carrier consolidation removing a tenant from thousands of towers at once',
          'A master lease renegotiated with reduced escalators or rent',
          'Small cells, satellite or spectrum efficiency reducing the need for macro sites',
        ],
        modelLink: [
          { assumption: 'Revenue driver — towers and revenue per tower', note: 'Model tenants per tower and rent per tenant, not just tower count. The incremental margin argument lives in the second tenant.' },
          { assumption: 'Capex path', note: 'The thesis is growth without capital. If the model needs capex to grow revenue, it is not expressing this.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'amt-amendment-drought',
        title: 'The growth came from a spending cycle that is over',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Capital-free revenue growth came from carriers amending leases to add and upgrade equipment through the 5G build. That build is largely complete, and carrier capital has moved to fibre — Verizon targeting 32 million locations — and to fixed wireless, which monetises existing tower capacity rather than requiring new equipment. The next equipment cycle is years away. Meanwhile the negotiation for every master lease renewal is with one of three customers who know they are one of three, and consolidation would reduce that further.',
        requires: [
          'Carrier equipment spending remains subdued between generations',
          'Carrier capital continues favouring fibre and fixed wireless over macro network equipment',
        ],
        breaks: [
          'An earlier-than-expected next-generation build restarting amendment activity',
          'Network densification requirements from traffic growth forcing new equipment on existing sites',
        ],
        modelLink: [
          { assumption: 'Revenue driver — revenue per tower growth', note: 'Model organic revenue growth at the escalator alone, with no amendment contribution. That is the thesis.' },
          { assumption: 'Terminal growth', note: 'A terminal growth rate that embeds amendment activity assumes a perpetual equipment cycle.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'DoorLoop — REIT statistics and sector composition 2026', url: 'https://www.doorloop.com/blog/reits-statistics' },
      { label: 'FactSet Insight — US wireless operators increase focus on fibre', url: 'https://insight.factset.com/u.s.-wireless-operators-increase-focus-on-fiber' },
      { label: 'CRE Daily — REIT market recovery in 2026', url: 'https://www.credaily.com/briefs/reit-market-recovery-gains-momentum-in-2026/' },
    ],
  },

  {
    ticker: 'SPG',
    sector: 'Real Estate',
    scope: 'UNITED_STATES',
    headline:
      'The owner of the dominant American malls, in a property type that now has the lowest vacancy of any commercial real estate sector — because everything that was going to close already did.',
    howItEarns: [
      {
        heading: 'Rent from tenants in centres that survived the shakeout',
        body:
          'Minimum rent plus percentage rent plus recoveries from tenants in premium malls and outlet centres. The portfolio is concentrated in the dominant centre in each market, which is where the retailers that survived the last decade chose to keep their stores.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Retailer equity stakes are a real and unusual part of the business',
        body:
          'The company has taken ownership positions in retail brands, sometimes acquired out of bankruptcy, partly to keep tenants in its centres and partly as investments. It is a genuine departure from being a landlord and it has both created value and concentrated risk in the tenants it depends on.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled in practice by the Simon family through an operating partnership structure and a separate class of shares, within a listed REIT with a large free float.',
      voting:
        'Multiple classes exist, with the family holding shares carrying enhanced rights alongside common stock. Economic exposure and voting influence are not proportional.',
      relatedPartyExposure: [
        'A family with enhanced voting rights within a REIT structure, deciding capital allocation including the retailer equity investments',
        'Operating partnership units held by the family and others, which carry tax and exit characteristics different from common stock',
        'Joint ventures with institutional co-owners in individual centres',
      ],
      minorityProtections: [
        'REIT distribution requirements, which force most taxable income out rather than leaving it to be reinvested',
        'SEC disclosure including asset-level occupancy and sales per square foot',
        'A large institutional register that has engaged on the retailer investments',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A landlord buying its own tenants is a real conflict of roles',
        body:
          'Taking equity in retail brands keeps stores open and rent flowing, which serves the property. It also means shareholders own operating retail risk they did not choose, in businesses whose distress was the reason they were available. The strategy has worked more often than not and it is not what a REIT investor is underwriting.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Family control inside a REIT is unusual and has been stable',
        body:
          'Enhanced voting rights held by the founding family mean control does not follow economics. The record has been one of disciplined capital allocation through the mall shakeout — buying and redeveloping rather than selling into the panic — which is the argument for the structure rather than against it.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'The dominant centre in each market',
        mechanism:
          'When a retailer rationalises its store base it keeps the location with the sales, which is the dominant mall. That concentration means the surviving centres captured tenants from the closing ones, and the land, anchors and approvals cannot be assembled again.',
        evidence: 'Retail now has the lowest vacancy rate of any commercial property type, concentrated in exactly this kind of asset.',
        erodedBy: 'E-commerce taking further share of anchor categories, and a catchment\'s demographics deteriorating.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Redevelopment of existing centres, opportunistic acquisition of assets and retailer stakes through the shakeout, and very high distributions. Buying when the format was declared dead has been the value-creating decision.',
      good: [
        'Redeveloping and re-tenanting centres through the shakeout rather than selling into the pessimism',
        'Acquiring assets and retailer positions at distressed prices that have since recovered',
      ],
      bad: [
        'Equity stakes in operating retailers, which put shareholders into businesses whose distress was the reason they were cheap',
        'A period of development and acquisition in secondary markets before the format\'s bifurcation was understood',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Retail has the lowest vacancy of any commercial property type',
        body:
          'After a decade in which the format was written off, retail enters 2026 with the tightest occupancy in commercial real estate. Almost no new mall supply has been built, weak centres have been demolished or converted, and the surviving assets absorbed the tenants.',
        basis: 'REPORTED',
      },
      {
        heading: 'Retail net lease cap rates are the lowest of the major types',
        body:
          'Single-tenant net lease retail cap rates were 6.55% in the first quarter of 2026, below industrial at 7.15% and office at 7.90%. The market is pricing retail income as more durable than industrial income, which is a striking reversal.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Tenant concentration in an industry still consolidating',
        body:
          'The surviving retailers are fewer and larger, so each one matters more. A single large tenant failure now removes more rent across more centres than it would have when the tenant base was fragmented.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Retailer equity positions marking against the company',
        body:
          'Owning stakes in retail brands means a retail downturn hits the rent roll and the investment portfolio at the same time, in the same direction.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'spg-survivor-scarcity',
        title: 'The shakeout ended and the survivors own a scarce asset',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A decade of store closures, mall demolitions and format pessimism removed the weak supply, and almost no new malls were built. What remains is the dominant centre in each market, holding the tenants that survived — and retail now has the lowest vacancy rate of any commercial property type, with net lease retail cap rates at 6.55%, below industrial. The market spent ten years pricing these assets for decline and the decline finished. That is a scarcity argument, not a growth one.',
        requires: [
          'No meaningful new mall supply, which the economics currently prevent',
          'Occupancy and sales per square foot holding in the dominant centres',
          'Retailer bankruptcies staying within the pace the centres can re-tenant',
        ],
        breaks: [
          'E-commerce taking a further step-change in anchor categories',
          'A large tenant failure removing rent across many centres at once',
          'Consumer weakness pushing occupancy cost above the store-closure threshold even in dominant assets',
        ],
        modelLink: [
          { assumption: 'Revenue driver — occupied area and rent per square foot', note: 'Model occupancy and rent separately. The scarcity argument is about occupancy holding, not rent accelerating.' },
          { assumption: 'WACC / cap rate', note: 'The re-rating case is a cap rate compression argument. Test the value across the 6.5% to 8% range rather than at one point.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'spg-tenant-and-equity-correlation',
        title: 'Owning the tenants means the rent roll and the investments fail together',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The consolidation that produced the survivor advantage also produced tenant concentration: fewer, larger retailers, each representing more rent across more centres. On top of that the company holds equity stakes in retail brands, several acquired out of distress. A retail downturn therefore arrives three times — in occupancy, in percentage rent, and in the value of the retailer investments — and the diversification a landlord normally has against any single tenant has been deliberately reduced. That correlation is not in a cap rate.',
        requires: [
          'Tenant concentration remains elevated after the consolidation',
          'Retailer equity positions remain a material part of the balance sheet',
        ],
        breaks: [
          'Divesting the retailer equity positions, restoring a pure landlord risk profile',
          'Tenant base broadening as new formats and categories take mall space',
        ],
        modelLink: [
          { assumption: 'Occupancy and tenant concentration', note: 'Model a large tenant failure scenario across the portfolio rather than a uniform occupancy decline.' },
          { assumption: 'Other assets / investments', note: 'The retailer stakes belong in the equity bridge and should be stressed alongside the rent roll, not independently.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Investment Grade — NNN cap rates 2026 by property type', url: 'https://investmentgrade.com/nnn-cap-rates-2026/' },
      { label: 'W. P. Carey — 2026 net lease outlook', url: 'https://www.wpcarey.com/blog/2026-net-lease-outlook' },
      { label: 'CRE Daily — REIT market recovery in 2026', url: 'https://www.credaily.com/briefs/reit-market-recovery-gains-momentum-in-2026/' },
    ],
  },

  {
    ticker: 'EQIX',
    sector: 'Real Estate',
    scope: 'UNITED_STATES',
    headline:
      'Not a data centre landlord but a network exchange: the value is the fifty cross-connects a tenant would have to rebuild elsewhere, which is why churn is low and interconnection carries the margin.',
    howItEarns: [
      {
        heading: 'Space and power, then interconnection at a much better margin',
        body:
          'Customers rent cabinets and the power to run them, then pay again to cross-connect to other customers in the same facility. Interconnection requires almost no incremental capital and carries a far higher margin than the cabinet does, so revenue per cabinet rather than cabinet count is where operating leverage shows up.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Network density compounds with every tenant',
        body:
          'Each new network or cloud that arrives makes the facility more valuable to everyone already there, and harder to leave. That is a genuine network effect operating on physical real estate, and it is the reason these assets are not commoditised by cheaper capacity elsewhere.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Joint ventures with institutional partners funding large hyperscale campuses, where the company holds a minority interest and earns fees',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC and REIT disclosure including cabinet utilisation and interconnection metrics',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Two business models under one roof, funded differently',
        body:
          'The interconnection-dense retail colocation business and the large hyperscale build-to-suit business have different margins, different capital intensity and different competitive dynamics. Funding the second through joint ventures keeps it off the balance sheet and makes consolidated metrics harder to read.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'FFO is the wrong measure for this property type',
        body:
          'Funds from operations adds back depreciation on the premise that property does not wear out. A data centre\'s electrical and mechanical plant genuinely does, on a fifteen to twenty year cycle. Maintenance capital expenditure here is real and large, and applying the same metric used for a net lease retail portfolio materially overstates the distributable cash.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Interconnection density that cannot be moved',
        mechanism:
          'A tenant cross-connected to dozens of counterparties inside a facility cannot leave without renegotiating and re-establishing every one of those relationships elsewhere. The switching cost is not the rent, it is the network.',
        evidence: 'Churn rates far below any comparable property type, with interconnection revenue carrying a materially higher margin than colocation.',
        erodedBy: 'Customers consolidating onto private cloud interconnects, and software-defined networking reducing the value of physical cross-connects.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Sites in supply-constrained metros with power already secured',
        mechanism:
          'The binding constraint on new data centre capacity is electrical interconnection, not land or capital. Existing facilities with power already contracted hold an asset that cannot currently be replicated in the same markets.',
        evidence: 'Data centre vacancy in primary North American markets at a record low near 2.8%, with preleasing above 90%.',
        erodedBy: 'Utilities expanding interconnection capacity, or demand growth slowing enough that power ceases to be scarce.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Continuous development funded by debt, equity and joint ventures, with the retail colocation business generating the returns and the hyperscale business generating the scale. Capital intensity is high and permanent.',
      good: [
        'Building interconnection density in the core metros first, which is the asset that actually defends pricing',
        'Using joint ventures to fund hyperscale capacity rather than putting the full capital on the balance sheet',
      ],
      bad: [
        'Acquisitions of regional operators at prices that assumed interconnection density they did not have',
        'Capital intensity that requires continuous equity issuance, so growth depends on the share price cooperating',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The tightest property market in commercial real estate',
        body:
          'Average vacancy across primary North American data centre markets hit a record low near 2.8%, with preleasing rates forecast above 90%. Demand exceeds supply and the constraint is power rather than capital, which is an unusual position for a real estate business.',
        basis: 'REPORTED',
      },
      {
        heading: 'Data centre REITs lagged despite the tightness',
        body:
          'REIT performance diverged sharply in 2025, with data centre REITs among the laggards even as fundamentals tightened. That gap between operating conditions and share performance is the thing to explain, and capital intensity is the usual candidate.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Maintenance capital that FFO does not show',
        body:
          'Electrical and mechanical plant requires replacement on a multi-decade cycle, and that spending is real cash that funds from operations adds back. Distributions set against FFO can exceed cash available after genuine maintenance.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Hyperscale capacity commoditising the market around the core',
        body:
          'Large build-to-suit capacity is a different, lower-margin business with a small number of very large customers. Growing it dilutes the interconnection-driven returns that justify the multiple.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'eqix-interconnection',
        title: 'The network, not the building, is the asset',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Cheaper capacity exists elsewhere and tenants do not move, because a customer cross-connected to dozens of networks and clouds inside a facility cannot replicate those relationships by renting a cheaper cabinet. Interconnection revenue carries a far higher margin than colocation and requires almost no capital, so revenue per cabinet compounds without new construction. On top of that, the constraint on new supply is electrical interconnection rather than money — vacancy near 2.8% and preleasing above 90% — so existing sites with secured power hold something the market cannot currently reproduce.',
        requires: [
          'Interconnection revenue per cabinet continues growing faster than cabinet count',
          'Churn stays at the low levels network density produces',
          'Power scarcity continues protecting existing sites',
        ],
        breaks: [
          'Software-defined networking or private cloud interconnects reducing the need for physical cross-connects',
          'Utilities expanding interconnection capacity enough that new supply arrives freely',
          'Growth mix shifting toward low-margin hyperscale capacity',
        ],
        modelLink: [
          { assumption: 'Revenue driver — cabinets and revenue per cabinet', note: 'Model interconnection and colocation revenue separately. Blended into one revenue per cabinet, the margin argument disappears.' },
          { assumption: 'Segment margins', note: 'Retail colocation and hyperscale have different economics. Growth in the wrong one dilutes returns while raising revenue.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'eqix-maintenance-capital',
        title: 'FFO treats a data centre like a warehouse, and it is not one',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Funds from operations adds depreciation back on the argument that property does not lose value. For land and a warehouse shell that is largely true; for chillers, switchgear, UPS systems and generators on a fifteen to twenty year replacement cycle it is not. Maintenance capital here is real, large and recurring, so distributable cash is materially below FFO — which is part of why data centre REITs lagged in 2025 despite record-low vacancy. Add a continuous development programme requiring equity issuance and the growth depends on the share price, which is the opposite of self-funding.',
        requires: [
          'Maintenance capital expenditure continues running well above what a traditional REIT requires',
          'Development continues requiring external equity',
        ],
        breaks: [
          'Disclosure and analysis shifting to a cash measure after maintenance capital, which would price the business correctly rather than change it',
          'Development funded increasingly through joint ventures and retained cash rather than equity issuance',
        ],
        modelLink: [
          { assumption: 'Capex path — maintenance versus growth', note: 'Split maintenance from development capex and value on cash after maintenance rather than on FFO. That gap is the thesis.' },
          { assumption: 'Share count', note: 'If growth requires equity issuance, model the dilution. Per-share value is what matters and FFO growth can coexist with per-share stagnation.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'DoorLoop — REIT statistics and sector composition 2026', url: 'https://www.doorloop.com/blog/reits-statistics' },
      { label: 'CRE Daily — REIT market recovery and sector divergence in 2026', url: 'https://www.credaily.com/briefs/reit-market-recovery-gains-momentum-in-2026/' },
      { label: 'Goldman Sachs — US data centre power demand', url: 'https://www.goldmansachs.com/insights/articles/us-data-center-power-demand-projected-to-double-by-2027' },
      { label: 'EPRI — data centre load growth in context', url: 'https://powering-intelligence.epri.com/load-growth.html' },
    ],
  },

  {
    ticker: 'O',
    sector: 'Real Estate',
    scope: 'UNITED_STATES',
    headline:
      'A spread business wearing a property portfolio: growth is acquiring buildings at a cap rate above the cost of capital, and at a 6.55% retail cap rate that spread is thin.',
    howItEarns: [
      {
        heading: 'Net leases that transfer every operating cost to the tenant',
        body:
          'A net lease makes the tenant responsible for tax, insurance and maintenance, so the landlord collects rent with almost no operating cost — which is why the EBITDA margin sits above eighty per cent. Leases run close to a decade with contractual escalators, so rent growth is known in advance and modest.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Growth is externally funded by construction',
        body:
          'REIT rules require distributing most taxable income, so growth cannot be retained. Every acquisition is funded with newly issued debt or equity, and value is created only when the property\'s yield exceeds the blended cost of that capital. That spread, not the rent roll, is the business.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and retail ownership with a very large free float and an unusually large individual investor base attracted by the monthly distribution.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Joint ventures and partial interests in specific portfolios, including gaming and European assets',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'REIT distribution requirements, which prevent earnings being retained and reinvested without shareholder visibility',
        'SEC disclosure including tenant concentration, lease expiry and acquisition cap rates',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A shareholder base that rewards the distribution and not the arithmetic',
        body:
          'A very large retail investor base attracted by a monthly dividend creates a constituency for growing the payout and for continuing to acquire. That is precisely the pressure a spread business should resist when the spread narrows, and it is a structural governance weakness rather than a management failing.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Issuing equity below net asset value is the way this model destroys value',
        body:
          'When the shares trade below the value of the assets, funding acquisitions with new equity transfers value from existing holders regardless of how attractive the cap rate looks. It is the single most important discipline in the sector and the hardest to maintain against a shareholder base that wants growth.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'The lowest cost of capital in the net lease sector',
        mechanism:
          'Scale and credit rating give access to debt and equity cheaper than smaller competitors bidding for the same buildings, so the same property earns a wider spread here than anywhere else. In a business whose entire return is that spread, cost of capital is the moat.',
        evidence: 'Sustained ability to acquire at scale, and aggressive acquisition guidance maintained while smaller competitors paused.',
        erodedBy: 'A rising cost of capital, or a share price below net asset value that makes equity issuance dilutive.',
        basis: 'REPORTED',
      },
      {
        label: 'Scale to execute sale-leasebacks competitors cannot fund',
        mechanism:
          'Buying an entire portfolio from a corporate seller in one transaction requires capital and execution capability few buyers have, which means less competition and a better price.',
        evidence: 'A portfolio of over fifteen thousand properties assembled largely through transactions too large for most buyers.',
        erodedBy: 'Private capital raising dedicated net lease funds at lower return requirements.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Continuous acquisition funded externally, with a distribution paid monthly and grown consistently. The discipline question is whether acquisitions stop when the spread closes, and the shareholder base makes stopping unpopular.',
      good: [
        'Building a tenant base weighted to non-discretionary retail — groceries, pharmacies, convenience — which has proved resilient through downturns',
        'Extending into industrial, gaming and European assets where the spread was wider than in domestic retail',
      ],
      bad: [
        'Acquisition guidance maintained through periods when the investment spread was very thin, which grows the portfolio without creating value per share',
        'A payout set above net income and grown consistently, which limits flexibility when the cost of capital rises',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Retail net lease cap rates at 6.55%, the lowest of the major types',
        body:
          'Single-tenant net lease cap rates were 6.80% overall in the first quarter of 2026, with retail at 6.55% against industrial at 7.15% and office at 7.90%. Buying retail at the tightest yield in the market leaves the least room between the property and the cost of funding it.',
        basis: 'REPORTED',
      },
      {
        heading: 'Institutional demand is putting a floor under pricing',
        body:
          'Institutional capital is providing support for high-quality net lease assets, which protects existing portfolio values and simultaneously makes new acquisitions more expensive. The same force helps the balance sheet and hurts the growth model.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The acquisition spread closing while acquisitions continue',
        body:
          'At a 6.55% cap rate and a blended cost of capital not far below it, new acquisitions add assets without adding value per share. The risk is that the growth continues because the shareholder base expects it.',
        basis: 'REPORTED',
      },
      {
        heading: 'Rate sensitivity in the share price before the earnings',
        body:
          'A long, contractual, escalating cash flow is a bond substitute. Real rates move the share price and the net asset value long before they touch the rent roll.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'o-cost-of-capital-moat',
        title: 'In a spread business the cost of capital is the only moat, and this is the cheapest',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Every net lease buyer sees the same buildings at the same cap rates; what differs is what they pay for money. Scale and credit rating give this company the cheapest capital in the sector, so the identical property earns a wider spread here than at any competitor — and that advantage widens when capital is scarce and smaller buyers step back. Add a tenant base weighted to non-discretionary retail that has held through downturns, and the business is a durable, if unexciting, compounder of a modest spread on a growing base.',
        requires: [
          'The cost of capital advantage over competitors persists',
          'Acquisitions continue at cap rates meaningfully above the blended cost of capital',
          'Tenant credit in the non-discretionary base holds',
        ],
        breaks: [
          'The investment spread narrowing to the point where acquisitions no longer add value per share',
          'The share price falling below net asset value, making equity-funded acquisitions dilutive',
          'Tenant failures in categories previously considered non-discretionary',
        ],
        modelLink: [
          { assumption: 'Acquisition volume and cap rate versus WACC', note: 'Model the investment spread explicitly. If acquisition cap rate minus cost of capital is near zero, growth in the model should create no value.' },
          { assumption: 'Share count', note: 'Externally funded growth dilutes. Value per share, not total FFO, is the measure that tests this.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'o-thin-spread',
        title: 'Growth that adds buildings and not value per share',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Retail net lease cap rates at 6.55% are the tightest of the major property types, and institutional demand is holding them there. With a blended cost of capital not far below that, each acquisition adds assets, revenue and FFO while adding little or nothing per share — and REIT structure means it must be funded externally, so the share count rises. The company\'s own shareholder base, drawn by a monthly dividend, creates pressure to keep acquiring exactly when the arithmetic says to stop. The tell is total FFO growing while FFO per share does not.',
        requires: [
          'Retail net lease cap rates remain compressed by institutional demand',
          'Acquisition guidance is maintained through the thin-spread period',
        ],
        breaks: [
          'Cap rates widening enough to restore a meaningful spread',
          'Management pausing acquisitions and buying back shares instead when the spread closes',
        ],
        modelLink: [
          { assumption: 'Share count and per-share metrics', note: 'Model FFO per share rather than total FFO. The whole thesis is the difference between the two.' },
          { assumption: 'Acquisition cap rate versus cost of capital', note: 'Set the spread near zero and check that the model produces no value from growth. If it still does, the model is wrong.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Investment Grade — NNN cap rates 2026 by tenant and type', url: 'https://investmentgrade.com/nnn-cap-rates-2026/' },
      { label: 'W. P. Carey — 2026 net lease outlook', url: 'https://www.wpcarey.com/blog/2026-net-lease-outlook' },
      { label: 'CRE Daily — REIT market recovery in 2026', url: 'https://www.credaily.com/briefs/reit-market-recovery-gains-momentum-in-2026/' },
      { label: 'DoorLoop — REIT statistics 2026', url: 'https://www.doorloop.com/blog/reits-statistics' },
    ],
  },
];
