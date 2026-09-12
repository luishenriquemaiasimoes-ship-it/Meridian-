import type { CompanyQualitative } from '../types';

export const ENERGY: CompanyQualitative[] = [
  {
    ticker: 'PETR4',
    sector: 'Energy',
    scope: 'BRAZIL',
    headline:
      'One of the lowest-cost deepwater producers in the world, controlled by a government facing an election — where roughly a fifth to a third of the dividend is a political decision rather than a financial one.',
    howItEarns: [
      {
        heading: 'Pre-salt barrels at a lifting cost few producers can match',
        body:
          'Production is concentrated in the Brazilian pre-salt, where reservoir quality delivers very high flow rates per well and a lifting cost among the lowest globally. Those barrels are monetised through owned refining, logistics and distribution, so the company captures margin at several points along the chain.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Refining is where policy reaches the P&L',
        body:
          'Domestic fuel prices are set by the company under a pricing policy the controlling shareholder influences. When pump prices are held below import parity, the refining segment absorbs the difference — a subsidy funded by shareholders that appears in no government budget.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Brazilian federal government, which holds a majority of the ordinary shares. Preferred shares (PETR4) carry the market liquidity and no vote, so the controller and the typical minority investor hold different instruments.',
      voting: 'Preferred shares have no vote; control rests entirely with the ordinary shares the state holds.',
      relatedPartyExposure: [
        'The controller sets fuel pricing policy, which is simultaneously an inflation instrument and a determinant of refining margin',
        'Capital allocation between upstream, refining and energy transition reflects policy priorities as well as returns',
        'Senior management and board appointments follow political cycles, and 2026 is an election year',
        'Dividend policy: analysts estimate 70% to 80% of ordinary dividend flow responds to production, investment and oil prices, and the remaining 20% to 30% to political guidance on payout',
      ],
      minorityProtections: [
        'Preferred dividend priority under Brazilian corporate law',
        'The state-owned enterprises law, which imposes qualification requirements on appointees and restricts political nominations',
        'NYSE listing and its disclosure obligations',
        'A published dividend policy formula, which makes departures from it visible',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'The dividend is part formula and part politics, and the split is measurable',
        body:
          'The company publishes a distribution formula tied to operating cash flow less investment, which is why most of the payout is predictable. The residual — estimated at a fifth to a third of the flow — reflects the controller\'s preference in a given year. That is not a vague governance concern; it is a quantifiable share of the return that depends on an election.',
        basis: 'REPORTED',
      },
      {
        heading: 'This election cycle is being entered from a stronger position',
        body:
          'Analysts have noted the company enters the 2026 electoral period with above-target production, profitable refining and healthy results — materially better than in previous cycles. A stronger starting point means the same political pressure does less damage, which is a real distinction from the last two elections.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Pre-salt reservoir quality and the operating expertise to develop it',
        mechanism:
          'Ultra-deepwater carbonate reservoirs require specific drilling, completion and subsea capability built over two decades. The barrels break even far below the marginal shale barrel, and the acreage is not available to anyone else on comparable terms.',
        evidence: 'Lifting costs and project breakevens among the lowest of any large producer, sustained through the price collapse of 2020.',
        erodedBy: 'Reservoir decline requiring more wells per barrel, and fiscal terms that raise government take on the same geology.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Integrated domestic logistics and refining',
        mechanism:
          'Owning refineries, pipelines and terminals in a market that would otherwise import means the company captures the import parity spread rather than paying it.',
        evidence: 'A refining segment that has earned well whenever pricing policy has permitted import parity.',
        erodedBy: 'Pricing policy that suspends import parity, which converts the advantage into a subsidy.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The last cycle was one of the better capital allocation records in the industry: divestment of non-core refining and distribution assets, concentration on pre-salt, and very large distributions. The forward question is whether that discipline survives a political preference for refining investment and domestic content.',
      good: [
        'Divesting non-core assets and concentrating capital on the lowest-breakeven barrels in the portfolio',
        'Very large distributions funded by genuine free cash flow rather than by leverage',
        'Deleveraging substantially from the post-2014 peak',
      ],
      bad: [
        'Historical refinery projects approved for policy reasons at costs that never earned a return',
        'Periods of fuel price suppression that transferred value from shareholders to consumers with no accounting recognition',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Oversupplied market, empty buffer, and a bearish base case',
        body:
          'Oversupply of roughly 2.3 million barrels a day carries into 2026 while OPEC+ spare capacity sits near 320 thousand barrels a day, the lowest on record. Credible 2026 Brent forecasts range from about $55 to $86 as a result. A low-breakeven producer survives the low end and is not the one that has to hedge.',
        basis: 'REPORTED',
      },
      {
        heading: 'Long-cycle Brazilian offshore is one of the sources of the oversupply',
        body:
          'Brazilian and Guyanese projects sanctioned years ago came online through 2025 and 2026, adding supply into a market that did not need it. The company benefits from the barrels and contributes to the price weakness they create.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Fuel pricing policy after the election',
        body:
          'The mechanism by which shareholders lose money here is not the oil price — it is a decision to hold pump prices below import parity. It has happened repeatedly and it has no accounting line.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Capital redirected into refining or domestic content',
        body:
          'A controller with employment and industrial policy objectives can direct capital to projects with returns below the pre-salt alternative. That is the second recurring channel of value transfer.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'petr4-breakeven',
        title: 'A producer that does not need the oil price to cooperate',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'With Brent forecasts for 2026 spanning $55 to $86, the honest position is that nobody knows the price. What is knowable is the breakeven, and pre-salt barrels are profitable and dividend-covering well below the bottom of that range. The company enters the election cycle with above-target production and profitable refining, which is a materially better starting point than the last two cycles. This is an asset-quality argument rather than a commodity call, and the distribution formula makes most of the return mechanical.',
        requires: [
          'Lifting costs and project breakevens hold at current levels',
          'The published distribution formula continues to govern most of the payout',
          'Pricing policy permits import parity in refining',
        ],
        breaks: [
          'Pump prices held below import parity, transferring refining margin to consumers',
          'Capital redirected to projects with returns below the pre-salt alternative',
          'Fiscal terms raised on existing production, which changes the breakeven without changing the geology',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per barrel', note: 'Test the model at the bottom of the forecast range, not the middle. The thesis is that it still works there.' },
          { assumption: 'Dividend payout', note: 'Model the formula-driven portion separately from the discretionary portion. They have different reliability.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'petr4-political-residual',
        title: 'A fifth to a third of the dividend is an election result',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The distribution formula governs most of the payout and analysts put the politically determined residual at 20% to 30% of the flow. That residual is not a tail risk; it is a recurring share of the return decided by a controller whose objectives include fuel price stability, employment and industrial policy. Add the fact that refining margin can be suppressed with no accounting entry, and the correct treatment is an explicit governance premium in the cost of equity rather than a probability-weighted scenario nobody revisits after the election.',
        requires: [
          'The state retains control',
          'Fuel pricing remains a policy instrument available to the controller',
          'Preferred shares remain the instrument minority investors hold',
        ],
        breaks: [
          'A binding, statutory pricing mechanism removing discretion over pump prices',
          'A material reduction in the state\'s stake or a change to the voting structure',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Add a stated governance premium. Stating it makes it arguable; hiding it in terminal growth does not.' },
          { assumption: 'EBITDA margin path — refining segment', note: 'Model the refining margin under suppressed pricing separately. That is where the transfer happens.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Seu Dinheiro — what Petrobras dividends have to do with analyst caution on the state company', url: 'https://www.seudinheiro.com/2026/empresas/petrobras-petr4-a-cautela-de-gestores-e-analistas-com-a-estatal-apesar-do-fluxo-estrangeiro-lvgb/' },
      { label: 'Seu Dinheiro — BTG on Petrobras entering this election cycle stronger', url: 'https://www.seudinheiro.com/2026/bolsa-dolar/petrobras-petr4-esta-mais-forte-nessas-eleicoes-e-pode-saltar-32-diz-btg-mas-4-gatilhos-podem-levar-a-acao-alem-giov/' },
      { label: 'InfoMoney — state companies in an election year', url: 'https://www.infomoney.com.br/mercados/o-que-esperar-das-acoes-das-estatais-petrobras-petr4-bbas3-e-eletrobras-elet6-em-mais-um-ano-de-eleicoes/' },
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
    ],
  },

  {
    ticker: 'PRIO3',
    sector: 'Energy',
    scope: 'BRAZIL',
    headline:
      'A redevelopment specialist that buys mature offshore fields the majors no longer want and raises their production — a genuinely differentiated model whose runway depends on the majors continuing to sell.',
    howItEarns: [
      {
        heading: 'Buying declining fields and reversing the decline',
        body:
          'The company acquires producing offshore assets late in life, then invests in well interventions, new drilling and infrastructure to raise recovery. Value is created between the purchase price — set by the seller\'s view of a declining asset — and the production the buyer can actually achieve. It is an operational skill applied to a financial mispricing.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Lifting cost per barrel is the scoreboard',
        body:
          'A mature field carries fixed platform and vessel costs spread over falling volumes, so lifting cost per barrel rises as production declines. Raising volumes on the same infrastructure drives the unit cost down sharply, which is why production growth and cost reduction are the same achievement here.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across domestic and foreign institutions with a very large free float, and the founding management team holds a meaningful but non-controlling stake.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'Founder and management shareholdings align incentives and concentrate the franchise in a small group',
        'A board without an anchor shareholder makes strategy contestable and less predictable',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'No controlling block, so board composition is contested rather than allocated',
        'ANP regulation of field development plans and decommissioning obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Management ownership is the alignment, and the concentration',
        body:
          'The redevelopment capability is identified with a specific team that also owns a substantial stake. That aligns them with outside holders better than a salaried management would be, and it means the competitive advantage would leave with them. A company whose moat is an operating team carries a succession risk that appears nowhere in the accounts.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Decommissioning is the liability the model accumulates',
        body:
          'Every mature field bought comes with an eventual obligation to plug wells and remove infrastructure. The provision is an estimate discounted over decades, and it grows with each acquisition. A buyer of late-life assets is also a buyer of abandonment liabilities, and that side of the trade is easy to underweight.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'A repeatable offshore redevelopment capability',
        mechanism:
          'Reversing decline in a mature field requires subsurface reinterpretation, intervention engineering and the willingness to drill where a major concluded there was nothing left. The skill is organisational and has been demonstrated across several acquisitions, which is why the company keeps being the buyer rather than the underbidder.',
        evidence: 'Production increases delivered on fields the previous operators were managing into decline, with lifting cost per barrel falling as volumes rose.',
        erodedBy: 'Exhaustion of available mature assets, or seller expectations rising to include the redevelopment upside.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Acquisition and redevelopment funded with reserve-based debt and cash flow, with a deliberate absence of dividends while the growth programme runs. The prices paid have generally been disciplined and the production promises generally delivered.',
      good: [
        'Acquiring mature fields at prices reflecting decline, then raising production on the existing infrastructure',
        'Retaining cash to fund redevelopment rather than distributing while the return on reinvestment exceeds the cost of capital',
      ],
      bad: [
        'A growing decommissioning liability stack that accumulates with every acquisition and is discounted over a very long horizon',
        'Concentration in a small number of fields, so a single operational problem is material to the whole company',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'A price taker with low breakevens in an oversupplied market',
        body:
          'With oversupply around 2.3 million barrels a day and Brent forecasts spanning $55 to $86 for 2026, a redeveloped mature field with falling unit costs is on the right side of the cost curve. The company cannot influence the price and does not need a high one.',
        basis: 'REPORTED',
      },
      {
        heading: 'The majors\' portfolio discipline is this company\'s supply of assets',
        body:
          'Large producers concentrating capital on their best barrels is exactly what puts mature fields on the market. The same capital discipline that supports the sector\'s returns creates the opportunity set here — and it is finite.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Operational concentration in few assets',
        body:
          'A small number of fields means a single subsea failure, vessel problem or disappointing well programme is material to consolidated production and to the debt covenants behind it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Decommissioning provisions revised upward',
        body:
          'Abandonment cost estimates for offshore infrastructure have generally risen over time. A revision is a direct transfer from equity value and is uncorrelated with the oil price.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'prio3-redevelopment',
        title: 'Production growth that comes from engineering, not from the price',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Almost every oil producer\'s earnings growth is a price forecast in disguise. This one grows by raising volumes on infrastructure already paid for, which simultaneously drives lifting cost per barrel down — so the same activity improves the numerator and the denominator. In an oversupplied market where credible Brent forecasts span thirty dollars, owning a producer whose growth does not require the price to rise is a genuinely different exposure from owning a major.',
        requires: [
          'Redevelopment programmes continue to deliver the production increases underwritten at acquisition',
          'Mature assets remain available at prices that do not include the redevelopment upside',
          'Lifting cost per barrel continues falling as volumes rise',
        ],
        breaks: [
          'A well or intervention programme that fails to deliver, on a small asset base where one failure is material',
          'Seller expectations rising to price in the achievable redevelopment',
          'Decommissioning revisions consuming the value created by the production growth',
        ],
        modelLink: [
          { assumption: 'Revenue driver — barrels produced', note: 'Model volume growth from named redevelopment programmes rather than as a growth rate. The thesis is field-specific.' },
          { assumption: 'Operating cost per barrel', note: 'Unit cost should fall as volumes rise on fixed infrastructure. If the model holds cost per barrel flat, it is missing half the thesis.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'prio3-runway-and-abandonment',
        title: 'A finite pipeline with a growing abandonment bill',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The model requires a continuing supply of mature offshore fields sold by owners who undervalue them, and the company\'s own record has made that undervaluation harder to find. Meanwhile every acquisition adds a decommissioning obligation discounted over decades, and offshore abandonment estimates have generally been revised upward across the industry. The bear case is not that the redevelopments fail — it is that the growth stops being available while the accumulated liability keeps compounding, and a model extrapolating historical production growth is extrapolating an acquisition pipeline.',
        requires: [
          'The pipeline of available mature assets continues to narrow',
          'Decommissioning cost estimates continue their upward trend',
        ],
        breaks: [
          'A new wave of divestments from majors concentrating their portfolios further',
          'Demonstrated organic reserve additions in existing fields that extend growth without acquisitions',
          'Decommissioning estimates stabilising or being partly transferred to sellers in acquisition terms',
        ],
        modelLink: [
          { assumption: 'Terminal growth and reserve life', note: 'Model production declining after the identified programmes rather than growing in perpetuity. Reserve life caps the terminal value here.' },
          { assumption: 'Provisions / decommissioning', note: 'Stress the abandonment provision. It is a real claim on equity value that moves independently of the oil price.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
      { label: 'ABN AMRO — energy market outlook 2026: oil oversupply', url: 'https://www.abnamro.com/research/en/our-research/energy-market-outlook-2026-oil-oversupply-and-european-gas-price' },
    ],
  },

  {
    ticker: 'VBBR3',
    sector: 'Energy',
    scope: 'BRAZIL',
    headline:
      'A logistics margin of a few hundred reais per cubic metre, with no controlling shareholder and a competitor that does not pay tax — which is the whole investment case in one sentence.',
    howItEarns: [
      {
        heading: 'A spread per cubic metre, not a commodity bet',
        body:
          'Vibra buys refined product and sells it through a branded station network, earning a distribution margin measured in a few hundred reais per cubic metre. The fuel price passes through; what the company controls is volume, the margin per unit and the cost of the logistics between terminal and pump.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Aviation and large customers earn better margins than the forecourt',
        body:
          'Jet fuel supply at major airports and direct supply to large industrial and transport customers carry higher margins per cubic metre than the station network and are less exposed to the informal market. They are the quality end of the volume.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder since the former state parent sold down. Ownership is dispersed across domestic and foreign institutions and a pension fund, with a very large free float.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'A brand licence relationship with the former state parent, which is also the main supplier of refined product',
        'A board without an anchor shareholder makes strategy contestable, and the company has been subject to activist attention',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'No controlling block, so board seats are contested and management is replaceable',
        'ANP regulation of fuel distribution and quality standards',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A true corporation, with the volatility that brings',
        body:
          'Full privatisation left a genuinely dispersed register, which removed the state-controlled discount and replaced it with contestability: management has changed, strategy has been debated publicly, and shareholder groups have pushed in different directions. The governance risk is unpredictability of strategy rather than extraction.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Diversification into energy trading has stretched the story',
        body:
          'Moves into electricity trading and adjacent energy businesses take the company away from the logistics margin it understands into markets where it has no structural advantage. It is the classic response to a low-growth core, and it consumes management attention and capital.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'The largest branded station network and the terminals behind it',
        mechanism:
          'Distribution economics are about the cost of moving product from port to pump. Owning terminal capacity near every major port and having the largest branded network gives a cost per litre and a volume base no new entrant can assemble.',
        evidence: 'A leading share of Brazilian fuel distribution sustained through the loss of state parentage and multiple competitive cycles.',
        erodedBy: 'The informal market, which evades tax and undercuts the entire regulated chain regardless of logistics efficiency.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Low capital intensity by nature — the stations are franchised and the terminals are built. Capital has gone into the network, into acquisitions in adjacent energy businesses, and into distributions. The adjacent moves are the questionable part.',
      good: [
        'Maintaining terminal and logistics infrastructure that constitutes the actual cost advantage',
        'Distributing cash from a business that needs little reinvestment',
      ],
      bad: [
        'Acquisitions in electricity and adjacent energy trading where the company has no cost or scale advantage',
        'Periods of margin sacrificed for volume share against competitors who were not bearing the same tax cost',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The informal market is the competitive problem, not the other distributors',
        body:
          'Irregular competitors who evade fuel taxes can undercut the entire regulated chain on price, and no logistics efficiency closes a gap created by unpaid tax. This is a regulatory and enforcement question that determines the sector\'s margin, and it sits outside every company\'s control.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Fuel volumes follow economic activity, not the oil price',
        body:
          'Diesel volumes track freight and agriculture, gasoline tracks light vehicle use and ethanol\'s relative price. The oil price passes through to the pump and does not determine the distributor\'s margin, which is why this is not an oil exposure despite the sector label.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Tax evasion by irregular competitors',
        body:
          'The single largest determinant of the sector margin is how effectively fuel taxes are enforced. When they are not, compliant distributors lose volume or margin and have no operational response.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Capital deployed outside the core competence',
        body:
          'A low-growth logistics business with cash is under permanent temptation to diversify. Each move away from the margin per cubic metre is a move into a market where the company is an average participant.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'vbbr3-logistics-margin',
        title: 'A logistics business misread as an oil exposure',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The fuel price passes through entirely; what the company earns is a spread per cubic metre set by the cost of moving product from terminal to pump. That makes it a volume and efficiency business with almost no capital intensity and no commodity risk, which should trade at a stable multiple of a stable margin. Sitting inside the Energy sector it is repeatedly rated against Brent, and its actual drivers — freight and agricultural volumes, network share, terminal cost — have nothing to do with it.',
        requires: [
          'Margin per cubic metre holds rather than being competed away',
          'Volumes track economic activity as fuel demand normally does',
          'Capital stays in logistics rather than adjacent energy ventures',
        ],
        breaks: [
          'Informal market share growing enough to force compliant distributors to cut margin',
          'Further acquisitions in businesses without a cost advantage',
          'A structural decline in fuel volumes from vehicle electrification faster than modelled',
        ],
        modelLink: [
          { assumption: 'Revenue driver — cubic metres sold and margin per cubic metre', note: 'Model volume and unit margin separately. Revenue growth from fuel price pass-through is not earnings growth and should not be treated as such.' },
          { assumption: 'EBITDA margin path', note: 'The margin is a few per cent by construction. Small absolute changes in unit margin move earnings enormously — test it in reais per cubic metre, not in percentage points.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'vbbr3-informal-market',
        title: 'A compliant company competing with one that does not pay tax',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Fuel taxes are a large share of the pump price, and a competitor who evades them can price below a compliant distributor\'s total cost. No amount of terminal efficiency or network scale closes that gap, and enforcement is a political and administrative question the company cannot influence. In a business whose entire margin is a few per cent of revenue, a share shift to irregular competitors is not a competitive setback — it is a direct subtraction from a very thin spread.',
        requires: [
          'Tax enforcement in fuel distribution remains incomplete',
          'The price gap created by evasion continues to shift volume',
        ],
        breaks: [
          'Effective enforcement measures — monophasic taxation, better tracking — that remove the evasion advantage',
          'Tax reform that makes evasion structurally harder in the fuel chain',
        ],
        modelLink: [
          { assumption: 'Revenue driver — volumes and margin per cubic metre', note: 'Express the informal market as either volume loss or unit margin compression, and see which the valuation can survive.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
      { label: 'Gabelli — 2026 energy sector outlook', url: 'https://gabelli.com/research/2026-outlook-energy-sector/' },
    ],
  },

  {
    ticker: 'UGPA3',
    sector: 'Energy',
    scope: 'BRAZIL',
    headline:
      'A holding company over three businesses with completely different returns — fuel distribution, bottled gas and liquid bulk terminals — where the terminals are the best asset and the smallest, and a single multiple hides all of it.',
    howItEarns: [
      {
        heading: 'Ipiranga is the volume and the thin margin',
        body:
          'Fuel distribution through the second-largest branded network earns a spread per cubic metre, about the same economics as any distributor: high revenue, very low margin, low capital intensity. It is roughly nine-tenths of revenue and a much smaller share of the value.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Ultragaz and Ultracargo are the margin',
        body:
          'Bottled and bulk LPG is a household staple with pricing that follows the refinery gate and a distribution network into low-income homes. Ultracargo rents liquid bulk tank capacity at constrained ports under take-or-pay contracts, earning a margin several times the group average on a fraction of the revenue. It is the highest-return asset in the group.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Igel family through Ultra S.A., a holding vehicle, with a substantial institutional free float. The controlling stake is well below a majority of the economics but sufficient for practical control.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the family holding the largest block.',
      relatedPartyExposure: [
        'A controlling family decides capital allocation between three businesses with very different returns',
        'The holding structure means capital can be moved between subsidiaries in ways a pure-play shareholder would not choose',
        'Brand and supply relationships with the former state refiner on the fuel side',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'Segment reporting that makes the differing returns observable',
        'A controlling stake below a majority, which makes board decisions contestable at the margin',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Capital has flowed toward the low-return business for a long time',
        body:
          'Ipiranga is the largest business by revenue and has absorbed capital and management attention accordingly, while Ultracargo — the highest-return asset — is small. A holding structure allows the controller to allocate between them, and the historical allocation has favoured size over return. That is the central governance observation here.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Attempted acquisitions outside the core have not worked',
        body:
          'The group has repeatedly tried to add a fourth business — pharmacy retail among them — and has exited or written down the attempts. The pattern suggests a holding company looking for growth rather than a portfolio being optimised for return.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Ultracargo terminal capacity at constrained ports',
        mechanism:
          'Liquid bulk storage requires port land, environmental licences and pipeline connections that are effectively unobtainable at the main Brazilian ports. Existing capacity is contracted on take-or-pay terms, so revenue does not depend on throughput.',
        evidence: 'Segment margins several times the group average, sustained through fuel and economic cycles.',
        erodedBy: 'New port capacity being licensed, or the loss of an anchor customer at contract renewal.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Ultragaz distribution into low-income households',
        mechanism:
          'Bottled gas reaches homes without piped gas through a network of resellers and delivery routes built over decades. The product is non-discretionary and the distribution is physical, which is why the position is durable.',
        evidence: 'Stable volumes and margins through Brazilian recessions that cut discretionary consumption sharply.',
        erodedBy: 'Piped natural gas extension into served areas, and regulatory changes to bottle ownership and exchange rules.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A long record of allocating toward the largest business rather than the best one, plus several attempts to diversify outside the group\'s competence that were subsequently unwound. Recent direction has been more disciplined, including divesting non-core assets.',
      good: [
        'Divesting non-core businesses acquired in earlier diversification attempts',
        'Expanding Ultracargo terminal capacity, which earns the highest return in the group',
      ],
      bad: [
        'Acquiring a pharmacy retail chain, a business with no relationship to the group\'s logistics competence, later exited',
        'Sustained capital and attention directed at the lowest-return business because it is the largest',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The same informal market problem as any fuel distributor',
        body:
          'Ipiranga competes against irregular operators who evade fuel taxes and can price below a compliant distributor\'s cost. It is the sector\'s defining margin constraint and it applies here in full.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Terminals benefit from exactly the trade flows that pressure fuel margins',
        body:
          'Rising import and export volumes of fuels, chemicals and vegetable oils fill tanks under take-or-pay contracts. The same commodity flow that intensifies distribution competition raises terminal utilisation, so the parts partly hedge each other.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Capital continuing to favour the largest business over the best',
        body:
          'The value case rests on the small high-return assets being worth more than the multiple implies. If capital keeps going to the thin-margin distributor, the blended return stays low regardless of the sum of the parts.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Fuel tax evasion compressing Ipiranga\'s margin',
        body:
          'Nine-tenths of revenue sits in the business most exposed to irregular competition, and a few reais per cubic metre is the whole spread.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'ugpa3-sotp',
        title: 'Three businesses, one multiple, and the best one is invisible',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Ultracargo earns margins several times the group average on take-or-pay contracts at ports where new capacity cannot be licensed — infrastructure economics, not distribution economics. Ultragaz sells a non-discretionary household staple through a physical network. Ipiranga is a thin-margin logistics business that dominates the revenue line and therefore dominates any consolidated multiple. Valuing the parts against their own comparables — terminals against infrastructure, LPG against staples, distribution against distributors — produces a materially different number, and segment reporting makes the arithmetic testable.',
        requires: [
          'Segment disclosure remains sufficient to value the parts separately',
          'Ultracargo contracts renew on take-or-pay terms and capacity expansion continues',
          'Capital allocation begins favouring the higher-return businesses',
        ],
        breaks: [
          'Capital continuing to flow to the lowest-return business, holding the blended return down',
          'New port capacity licensed, eroding Ultracargo\'s scarcity',
          'A further diversification attempt outside the group\'s competence',
        ],
        modelLink: [
          { assumption: 'Segment margins', note: 'This is a sum of the parts. Value each business against its own peer set rather than applying one consolidated EBITDA multiple — the disagreement is entirely in that step.' },
          { assumption: 'Capex path by segment', note: 'Where the capital goes determines the blended return. Model segment capex separately from consolidated capex intensity.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'ugpa3-holding-drag',
        title: 'A holding company that allocates to size rather than to return',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The sum of the parts is only realisable if the controller realises it or allocates toward it, and the record points the other way: capital and attention have followed the largest business rather than the best one, and several attempts to add a fourth business outside the group\'s competence were later unwound. A holding structure with a controlling family and no pressure to simplify can carry a discount indefinitely. This is not an argument that the assets are bad — it is an argument that the gap between parts and whole is a feature of the structure rather than a mispricing waiting to close.',
        requires: [
          'The holding structure and controlling stake persist',
          'Capital allocation continues to favour revenue scale over segment return',
        ],
        breaks: [
          'A separate listing or sale of Ultracargo, which would crystallise the value the multiple is not giving',
          'A published capital allocation framework prioritising return on capital by segment',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'A structural holding discount belongs in the discount rate explicitly rather than being assumed to close.' },
          { assumption: 'Reinvestment rate and return on new capital', note: 'Model the blended return on incremental capital. If it stays at the distribution business\'s level, the sum of the parts never arrives.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
      { label: 'Gabelli — 2026 energy sector outlook', url: 'https://gabelli.com/research/2026-outlook-energy-sector/' },
    ],
  },

  {
    ticker: 'XOM',
    sector: 'Energy',
    scope: 'GLOBAL',
    headline:
      'The major that never apologised for being an oil company, and now owns the best new oil province in the world plus the Permian scale to fund it.',
    howItEarns: [
      {
        heading: 'Guyana and the Permian: two of the lowest-cost growth positions in oil',
        body:
          'The Stabroek block offshore Guyana produces at breakevens well below the marginal barrel, and the Permian position — enlarged by the Pioneer acquisition — gives short-cycle volumes that can be dialled up or down. Together they give the company both low-cost growth and flexibility, which very few producers have at once.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Chemicals and refining are a genuine counter-cycle, not decoration',
        body:
          'Product solutions and chemicals earn better when crude is cheap and feedstock costs fall, which partly offsets upstream weakness. That integration is why the earnings range through a cycle is narrower than a pure producer\'s, and it is the structural reason integrated majors carry higher multiples.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Ownership is dispersed across index and institutional managers with a very large free float, typical of the largest US listed companies.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Joint venture and production sharing partners in Guyana and the Middle East, where terms are negotiated with sovereign counterparties',
      ],
      minorityProtections: [
        'Single voting class with fully dispersed ownership',
        'SEC reporting and a long history of contested shareholder proposals reaching votes',
        'A board that has been changed by shareholder action, which demonstrates the mechanism works',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A strategy that was unpopular and has been vindicated by results',
        body:
          'The company declined to pivot away from hydrocarbons when peers did, absorbed an activist campaign that placed directors on its board, and kept investing through the 2020 trough. Production, cost per barrel and returns since then have justified the decision. Whether that is conviction or luck matters less than that the capital was deployed counter-cyclically, which is when it earns most.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Sovereign counterparties hold the best asset\'s terms',
        body:
          'Guyana is developed under a production sharing agreement with a government whose national income is being transformed by it. Pressure to revisit fiscal terms grows with the value at stake, and that is a political process rather than a contractual certainty.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'The Stabroek block',
        mechanism:
          'A very large, high-quality offshore discovery developed in sequential phases, each cheaper than the last because the infrastructure and knowledge are already there. Breakevens are below almost any new oil development anywhere.',
        evidence: 'Successive development phases sanctioned at declining unit costs, producing barrels profitable far below the marginal global barrel.',
        erodedBy: 'Fiscal renegotiation by the Guyanese government, and eventual reservoir decline requiring more capital per barrel.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Scale in project execution and integration',
        mechanism:
          'Delivering multi-billion-dollar offshore and chemical projects near budget is a capability few operators retain, and it is what allows the company to sanction developments competitors would not attempt.',
        evidence: 'A record of major project delivery that has generally held to cost and schedule where peers have overrun.',
        erodedBy: 'A large project failure, which resets both the capital and the reputation the next sanction depends on.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Counter-cyclical and consistent: invested through the trough when peers cut, bought Permian scale at a reasonable multiple, and maintained the dividend for decades without funding it from the balance sheet for long. The chemicals and low-carbon spending is the debatable part.',
      good: [
        'Investing through the 2020 collapse and into Guyana while competitors were cutting capital',
        'Acquiring Permian scale in shares rather than cash, at a multiple the acquired production justified',
        'An unbroken dividend record maintained without sustained balance-sheet funding',
      ],
      bad: [
        'A long history of chemicals and refining investments at returns below the upstream alternative',
        'Low-carbon ventures — carbon capture, hydrogen, lithium — whose returns depend on policy support rather than on the company\'s own advantage',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Oversupplied market, and this is the producer that does not need the price',
        body:
          'Oversupply near 2.3 million barrels a day carries into 2026 with credible Brent forecasts spanning $55 to $86. Guyanese and Permian barrels are profitable and dividend-covering at the low end, so the company is one of the few majors for whom the bearish case is survivable rather than painful.',
        basis: 'REPORTED',
      },
      {
        heading: 'Long-cycle offshore is part of what created the oversupply',
        body:
          'Projects sanctioned years ago in Guyana and Brazil came online through 2025 and 2026, adding supply the market did not need. The company gains the barrels and contributes to the price weakness that discounts them.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Guyanese fiscal renegotiation',
        body:
          'The most valuable growth asset operates under terms agreed when the resource was unproven. Governments revisit such terms as the value becomes apparent, and there is no operational response.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Capital into low-carbon ventures without a cost advantage',
        body:
          'Carbon capture, hydrogen and lithium depend on subsidy regimes and offer no obvious advantage from the company\'s existing skills. It is the channel through which excellent upstream cash flow could earn a poor return.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'xom-low-breakeven-growth',
        title: 'Growth in oil that does not need the oil price to rise',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Most oil investment cases are price forecasts. This one is a breakeven argument: Guyanese phases sanctioned at declining unit cost, plus short-cycle Permian volumes that can be modulated, produce growing output profitable well below the bottom of the 2026 forecast range. Integration with refining and chemicals narrows the earnings range through the cycle. The company is structurally positioned so that a bearish oil market removes competitors\' supply rather than its own profitability.',
        requires: [
          'Guyanese development phases continue to be delivered near their cost estimates',
          'Permian volumes remain short-cycle and flexible rather than requiring sustained capital',
          'Fiscal terms in Guyana are not materially revised',
        ],
        breaks: [
          'A Guyanese fiscal renegotiation that changes the project economics',
          'A major project overrun that resets both cost and sanctioning credibility',
          'Capital diverted into low-carbon ventures at returns below the upstream alternative',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per barrel', note: 'Run the model at the bottom of the forecast range. The thesis is that production growth and the dividend both survive there.' },
          { assumption: 'Segment margins', note: 'Model upstream and product solutions separately. The counter-cyclical offset only appears if they are not blended.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'xom-terminal-demand',
        title: 'A terminal value that assumes oil demand still exists in thirty years',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Every long-cycle project sanctioned today produces into the 2040s and 2050s, and a discounted cash flow with a perpetual terminal value is implicitly asserting that demand and price hold there. The company has chosen long-cycle offshore over a faster-payback portfolio precisely because it believes that. It is a defensible view and it is a view, and it accounts for most of the valuation rather than the forecast period. A model that does not state its terminal demand assumption is hiding the largest single judgement in the case.',
        requires: [
          'Long-cycle capital continues to dominate the investment programme',
          'Terminal value continues to represent the majority of the discounted value',
        ],
        breaks: [
          'A demonstrated shift toward short-payback capital that reduces exposure to distant decades',
          'Demand evidence that settles the question in either direction, which would convert a judgement into a forecast',
        ],
        modelLink: [
          { assumption: 'Terminal growth', note: 'Set terminal growth to zero or negative and see how much of the value survives. Whatever is left is the part not resting on a demand assumption.' },
          { assumption: 'Capex path', note: 'Long-cycle capital committed now is only recovered in distant years. Test the value if those years are worth less.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
      { label: 'ABN AMRO — energy market outlook 2026: oil oversupply', url: 'https://www.abnamro.com/research/en/our-research/energy-market-outlook-2026-oil-oversupply-and-european-gas-price' },
      { label: 'J.P. Morgan Global Research — oil price forecasts', url: 'https://www.jpmorgan.com/insights/global-research/commodities/oil-prices' },
    ],
  },

  {
    ticker: 'CVX',
    sector: 'Energy',
    scope: 'GLOBAL',
    headline:
      'A more concentrated and more conservative major than its peer, with Permian and Kazakh volumes as the engine and a balance sheet held deliberately light for the moments when assets get cheap.',
    howItEarns: [
      {
        heading: 'Permian shale plus a small number of large international projects',
        body:
          'Short-cycle Permian volumes with decades of drilling inventory, alongside large long-life positions in Kazakhstan, Australian liquefied natural gas and the Gulf of Mexico. Fewer, larger positions than a diversified peer, which means individual project performance matters more.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A balance sheet run as optionality',
        body:
          'The company has consistently carried lower leverage than peers, which looks inefficient in a strong market and becomes the competitive advantage in a weak one: it allows acquiring assets and sustaining distributions when others are forced sellers. The under-gearing is a strategy, not an oversight.',
        basis: 'INTERPRETATION',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Production sharing and joint venture partners including sovereign entities in Kazakhstan and the Middle East',
        'Consortium partners in large liquefied natural gas projects where decisions require agreement',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting obligations and an active proxy record',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Conservatism as a stated policy, consistently applied',
        body:
          'Lower leverage, a long unbroken dividend growth record, and reluctance to make large acquisitions except at prices it judges attractive. The approach costs upside in a rising market and has repeatedly protected the distribution through downturns, which for an income-oriented holder is the point.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Concentration means partner and sovereign risk is not diversified away',
        body:
          'With fewer, larger positions, a dispute with a consortium partner or a host government is material to the company rather than absorbed. Kazakhstan in particular ties a significant share of production to a jurisdiction with limited export routes and periodic fiscal friction.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Permian acreage depth with contiguous, royalty-advantaged positions',
        mechanism:
          'A very large, contiguous Permian position with favourable legacy royalty terms lowers the cost per barrel relative to acreage assembled in the land rush, and provides drilling inventory measured in decades rather than years.',
        evidence: 'Permian unit costs and capital efficiency among the best reported by the major operators.',
        erodedBy: 'Inventory depletion in the best zones, and service cost inflation that narrows the advantage.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Distribution-first: a very long dividend growth record, buybacks sized to be sustainable through a downturn rather than maximised at the peak, and a balance sheet held in reserve. Acquisitions have been opportunistic rather than transformational, with mixed results.',
      good: [
        'Maintaining and growing the dividend through multiple price collapses without sustained balance-sheet funding',
        'Holding leverage below peers, which converted into buying power when assets were cheap',
      ],
      bad: [
        'Cost overruns on large liquefied natural gas projects that consumed years of capital for delayed returns',
        'Acquisition attempts that turned into protracted disputes, absorbing management attention for limited gain',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Built for the low end of a wide forecast range',
        body:
          'With 2026 Brent forecasts spanning roughly $55 to $86 and oversupply around 2.3 million barrels a day, a company with low leverage, short-cycle volumes and a covered dividend is designed for the bearish half of that distribution.',
        basis: 'REPORTED',
      },
      {
        heading: 'Liquefied natural gas exposure meets the new supply wave',
        body:
          'Australian liquefied natural gas volumes sell into a market being loosened by new US, Canadian and Qatari capacity. The contracted portion is protected; the spot and optionality value compresses as the wave lands.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Concentration in a few large positions',
        body:
          'Fewer assets means a single operational, partner or sovereign problem is material. Kazakhstan alone represents a share of production large enough that an export or fiscal disruption matters to the whole company.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Permian inventory quality declining over time',
        body:
          'Shale operators drill their best rock first. The advantage is real now and narrows with each year of development, which is a slow structural erosion rather than an event.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'cvx-balance-sheet-optionality',
        title: 'Under-gearing is the strategy, and it pays in exactly this market',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'In an oversupplied market with the widest Brent forecast dispersion in years, the most valuable thing a producer can own is the ability to act when others cannot. Low leverage, short-cycle Permian volumes that can be reduced without destroying value, and a dividend covered at the bottom of the forecast range mean this company buys rather than sells in a downturn. That optionality is invisible in a strong market, which is why it tends to be underpriced going into a weak one.',
        requires: [
          'Leverage stays below peers rather than being deployed into a large acquisition at a high price',
          'Permian capital efficiency holds as the best inventory is consumed',
          'The dividend remains covered at the low end of the price range',
        ],
        breaks: [
          'A large debt-funded acquisition that removes the balance sheet optionality',
          'Permian unit costs rising as inventory quality declines',
          'A sovereign or partner disruption in a concentrated international position',
        ],
        modelLink: [
          { assumption: 'Revenue driver — price per barrel', note: 'Test dividend coverage at the bottom of the range. That is the specific claim.' },
          { assumption: 'Debt schedule / net debt', note: 'The thesis is about balance sheet capacity. Model leverage through a trough rather than at mid-cycle.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'cvx-concentration',
        title: 'Fewer, bigger bets means the sovereign risk is not diversified',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Concentration is the flip side of focus. A significant share of production sits in Kazakhstan, a landlocked jurisdiction dependent on export routes through third countries and subject to periodic fiscal friction, and large liquefied natural gas positions are held in consortia where decisions require agreement. A diversified peer absorbs a single host-government dispute; this company does not. The exposure is structural and it is not compensated in the multiple, which is set by the oil price rather than by where the barrels come from.',
        requires: [
          'Production remains concentrated in a small number of large international positions',
          'Export routes and fiscal terms in those jurisdictions remain subject to renegotiation',
        ],
        breaks: [
          'Portfolio diversification that reduces single-jurisdiction exposure materially',
          'Long-dated fiscal and transit agreements that remove the renegotiation risk',
        ],
        modelLink: [
          { assumption: 'Cost of equity — country premium', note: 'Apply a sovereign premium to the concentrated international production rather than a single blended company rate.' },
          { assumption: 'Revenue driver — volumes', note: 'Model a disruption case where a single large position is interrupted, rather than a uniform volume decline.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
      { label: 'ABN AMRO — oil oversupply and European gas price stabilisation', url: 'https://www.abnamro.com/research/en/our-research/energy-market-outlook-2026-oil-oversupply-and-european-gas-price' },
    ],
  },

  {
    ticker: 'SHEL',
    sector: 'Energy',
    scope: 'GLOBAL',
    headline:
      'The largest liquefied natural gas trader in the world, which spent years being valued as a reluctant oil company and has since narrowed its ambitions to the things it is actually best at.',
    howItEarns: [
      {
        heading: 'Liquefied natural gas: contracted volumes plus a trading book',
        body:
          'The integrated gas business combines equity production, long-term supply contracts and a global trading operation that arbitrages regional price differences. The trading optionality is the distinguishing asset — it earns from volatility and from the spread between basins, not only from the gas price.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Marketing is a consumer business inside an oil company',
        body:
          'Fuel retail and lubricants sold through a global station network earn a stable, branded margin per litre with almost no commodity exposure. It is the highest-quality earnings stream in the group and the one least discussed.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional ownership following the simplification of the former dual-nationality structure into a single UK-incorporated entity.',
      voting: 'A single class of ordinary shares, one share one vote.',
      relatedPartyExposure: [
        'Joint venture and production sharing partners including sovereign entities across the liquefied natural gas portfolio',
        'Consortium decision-making in large gas projects where the company is not always operator',
      ],
      minorityProtections: [
        'Single share class after simplification, removing the prior dual-line structure',
        'UK governance and disclosure regime, including binding remuneration votes',
        'A record of shareholder resolutions on strategy reaching votes',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Simplification removed a structure that cost the company money',
        body:
          'Collapsing the dual-nationality, dual-share-class arrangement into one UK entity ended the arbitrage between two lines, simplified taxation of distributions and made buybacks cleaner. It was a genuine improvement and it also removed a constraint on returning capital.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Strategy has narrowed, and litigation has followed it',
        body:
          'The company retreated from parts of its earlier low-carbon ambition toward gas, marketing and higher-return upstream. That improved returns and attracted climate litigation and shareholder resolutions, so the strategy now carries a legal and reputational cost that is real but has not changed the direction.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'The largest liquefied natural gas portfolio and trading book',
        mechanism:
          'Scale across liquefaction, shipping and regasification lets the company move cargoes to whichever basin pays most, and a trading organisation with that optionality earns from price dispersion rather than from price level. No competitor has an equivalent portfolio to arbitrage.',
        evidence: 'Trading contributions that have materially exceeded peers\' during periods of regional gas price dislocation.',
        erodedBy: 'A loosening global gas market that compresses inter-basin spreads, which is precisely what the new supply wave does.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Global fuel retail and lubricants brand',
        mechanism:
          'A branded station network and lubricants position earn a margin per litre that is set locally and is not competed away by commodity price moves.',
        evidence: 'Stable marketing segment earnings through crude price collapses that halved upstream results.',
        erodedBy: 'Vehicle electrification reducing forecourt fuel volumes over decades.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Since the strategic reset: fewer projects, higher return thresholds, large and consistent buybacks, and reduced low-carbon spending. The discipline has been real and it followed a period where the opposite approach destroyed value.',
      good: [
        'Raising return hurdles and cutting the project count, concentrating on gas, marketing and advantaged upstream',
        'Sustained buybacks that have reduced the share count materially while the dividend grew',
        'Structural simplification that made capital returns cheaper to execute',
      ],
      bad: [
        'Earlier low-carbon and renewable power investments made at returns well below the cost of capital, since curtailed',
        'A prolonged period of complexity — dual share classes, an over-broad project portfolio — that carried a persistent valuation discount',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The gas supply wave cuts both ways for this company',
        body:
          'New US, Canadian and Qatari liquefaction capacity loosens a market that was structurally short after 2022. That lowers the spot price and compresses the inter-basin spreads the trading book earns from — but it also gives the world\'s largest trader more cargoes to move and more counterparties to serve.',
        basis: 'REPORTED',
      },
      {
        heading: 'Oil oversupply matters less here than to a crude-weighted major',
        body:
          'With upstream a smaller share of the mix than at the crude-focused majors, the 2.3 million barrel a day surplus and the $55 to $86 forecast range have a proportionately smaller effect on earnings.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Inter-basin gas spreads compressing as supply loosens',
        body:
          'Trading earnings depend on price dispersion. A well-supplied global gas market has less dispersion, and the earnings that most distinguished this company in recent years are the ones most exposed.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Climate litigation and shareholder pressure on the narrowed strategy',
        body:
          'Court proceedings and repeated resolutions impose cost and constrain flexibility. They have not changed the strategy and they are not costless.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'shel-lng-optionality',
        title: 'A trading business with a producer attached, and the market prices the producer',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The distinguishing asset is not the gas in the ground but the ability to move any cargo to whichever basin pays most, across the largest liquefaction, shipping and regasification portfolio in the industry. That earns from price dispersion rather than price level, which is a fundamentally different and better exposure than a producer\'s. Add a branded marketing business with stable per-litre margins and the earnings base is far less crude-dependent than the sector multiple implies.',
        requires: [
          'Trading continues to earn from regional dispersion as new supply reshapes flows',
          'Marketing margins hold as forecourt volumes gradually decline',
          'Capital discipline and buybacks continue under the narrowed strategy',
        ],
        breaks: [
          'A well-supplied global gas market that compresses inter-basin spreads durably',
          'A return to broad low-carbon spending at sub-hurdle returns',
          'Marketing volumes falling faster than margin per litre can offset',
        ],
        modelLink: [
          { assumption: 'Segment margins', note: 'Model integrated gas, marketing and upstream separately. The thesis disappears the moment they are blended into one commodity-driven margin.' },
          { assumption: 'Revenue driver — realised gas price and trading contribution', note: 'Trading earns from dispersion, so model it as a contribution that does not track the gas price level.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'shel-spread-compression',
        title: 'The supply wave takes away the thing that made the earnings special',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The trading contribution that justified a re-rating came from an exceptionally dislocated gas market after 2022. New liquefaction capacity from the United States, Canada and Qatar is explicitly loosening that market and reducing price volatility, which removes the dispersion the trading book monetises. A model carrying recent trading contributions into the forecast is extrapolating a market condition that policy and construction schedules are actively ending.',
        requires: [
          'New liquefaction capacity commissions broadly on schedule',
          'Regional gas price volatility and inter-basin spreads narrow as a result',
        ],
        breaks: [
          'Supply disruption or demand growth that keeps the market tight despite new capacity',
          'Trading demonstrating a comparable contribution in a well-supplied market, which would prove the skill rather than the conditions',
        ],
        modelLink: [
          { assumption: 'Trading contribution within integrated gas', note: 'Fade the trading contribution toward a normalised level rather than holding recent results. The difference is the whole thesis.' },
          { assumption: 'Terminal growth', note: 'A terminal value built on dislocation-era trading earnings overstates the durable business.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ABN AMRO — energy market outlook 2026: oil oversupply and gas prices', url: 'https://www.abnamro.com/research/en/our-research/energy-market-outlook-2026-oil-oversupply-and-european-gas-price' },
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
    ],
  },

  {
    ticker: 'COP',
    sector: 'Energy',
    scope: 'GLOBAL',
    headline:
      'A pure exploration and production company with no refining to hide behind, competing on cost of supply and a distribution framework it publishes and sticks to.',
    howItEarns: [
      {
        heading: 'Short-cycle US unconventional plus long-life international gas',
        body:
          'Permian, Eagle Ford and Bakken volumes give short payback and capital flexibility; Alaskan and Middle Eastern positions plus liquefied natural gas interests add long-life production. Without downstream, every dollar of earnings is a function of realised price less cost of supply.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Cost of supply is the published organising metric',
        body:
          'The company frames its portfolio around the price at which each barrel earns an acceptable return, and allocates capital by that ranking. For an investor that discipline is unusually legible: the portfolio breakeven is disclosed rather than inferred.',
        basis: 'INTERPRETATION',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Joint venture and consortium partners in international gas and liquefied natural gas projects',
        'Sovereign counterparties in Middle Eastern and Alaskan positions',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting, plus a published distribution framework that makes departures visible',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A published framework is a governance device',
        body:
          'Committing publicly to return a stated share of cash flow, and to rank projects by cost of supply, constrains management\'s own discretion. That is a deliberate limitation on the thing that most often destroys value in this industry, and holding to it through both strong and weak years is the evidence that matters.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'No downstream means no cushion and no cross-subsidy',
        body:
          'Pure upstream earnings swing more than an integrated peer\'s, which is a real cost. It also means no refining project can absorb capital that should have gone to barrels or shareholders, which is a real benefit. The structure enforces the discipline the framework describes.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Deep low-cost-of-supply inventory across multiple US basins',
        mechanism:
          'A large, diversified unconventional position allows drilling the best rock available across basins rather than the best rock in one, which sustains capital efficiency for longer than a single-basin operator can.',
        evidence: 'A disclosed portfolio cost of supply that has remained among the lowest reported by large independents.',
        erodedBy: 'Inventory depletion in the highest-return zones and service cost inflation.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Among the most disciplined in the sector: a stated share of cash flow returned to shareholders, capital allocated by cost of supply, and acquisitions made in shares at prices the acquired inventory justified. The liquefied natural gas commitments are the main open question.',
      good: [
        'Consolidating adjacent Permian and Eagle Ford acreage in share-funded deals rather than cash at premium multiples',
        'Returning a published share of cash flow through cycles instead of a fixed dividend defended with debt',
      ],
      bad: [
        'Large multi-year liquefied natural gas commitments that lock capital into a market being loosened by new supply',
        'An earlier era of exploration spending with poor returns, which the current framework was designed to prevent repeating',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Undiluted exposure to the widest price range in years',
        body:
          'With 2026 Brent forecasts from about $55 to $86 and oversupply near 2.3 million barrels a day, a pure producer has no downstream offset. Low cost of supply is the only protection, and it is the one the company organises around.',
        basis: 'REPORTED',
      },
      {
        heading: 'Liquefied natural gas commitments land into the supply wave',
        body:
          'New US, Canadian and Qatari capacity is loosening the global gas market at the same time as the company\'s own liquefied natural gas positions come to bear. The volumes are secured; the price they realise is the question.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Full-beta exposure with no integration',
        body:
          'Without refining or marketing, a weak crude price reaches earnings undiluted. That is the design and it is also the risk.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Liquefied natural gas capital locked into a loosening market',
        body:
          'Long-dated commitments made when gas was tight are realised into a market that new supply is unbalancing, and the capital cannot be redirected.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'cop-framework-discipline',
        title: 'The framework is the investment case',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Oil and gas companies destroy capital by spending it at the top of the cycle, and almost every governance mechanism intended to prevent that has failed. This company has instead published a framework — a stated share of cash flow returned, projects ranked by cost of supply — and held to it through both strong and weak years, with no downstream segment available to absorb capital that should have gone elsewhere. That is a structural constraint on the industry\'s characteristic error, and it is worth more than an integration cushion.',
        requires: [
          'The distribution framework continues to be honoured through a weak price year',
          'Cost of supply stays among the lowest as the best inventory is consumed',
          'No large cash acquisition at a premium that breaks the framework',
        ],
        breaks: [
          'Distributions reduced below the framework while capital rises',
          'Cost of supply deteriorating as inventory quality declines',
          'A large debt-funded acquisition that resets the balance sheet',
        ],
        modelLink: [
          { assumption: 'Dividend and buyback payout', note: 'Model distributions as a share of cash flow rather than a fixed amount. That is how the company actually operates, and it changes the equity value in a low-price case.' },
          { assumption: 'Revenue driver — price per barrel', note: 'Run the bottom of the forecast range. A pure producer has no offset, so the thesis has to survive there on cost of supply alone.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'cop-lng-timing',
        title: 'Gas capital committed when the market was tight, realised when it is not',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Liquefied natural gas commitments were made against a structurally short market and are coming to bear as US, Canadian and Qatari capacity loosens it. Long-dated liquefaction and offtake obligations cannot be redirected, so the company will be moving volumes into a market with lower prices and narrower spreads than the investment assumed. For a pure producer with no downstream cushion, a misjudged commitment in the one diversifying business is more consequential than it would be at an integrated peer.',
        requires: [
          'New liquefaction capacity commissions and loosens the global market',
          'Gas commitments remain contractual and not redirectable',
        ],
        breaks: [
          'Demand growth or supply disruption keeping the gas market tight',
          'Contract structures that pass the price risk to offtakers rather than retaining it',
        ],
        modelLink: [
          { assumption: 'Revenue driver — realised gas price', note: 'Model gas realisations below the level assumed at sanction, and check what the committed capital then earns.' },
          { assumption: 'Capex path', note: 'Committed liquefaction capital is not discretionary. Model it as fixed rather than fading with the rest.' },
        ],
        conviction: 'LOW',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
      { label: 'ABN AMRO — oil oversupply and gas price stabilisation', url: 'https://www.abnamro.com/research/en/our-research/energy-market-outlook-2026-oil-oversupply-and-european-gas-price' },
      { label: 'Gabelli — 2026 energy sector outlook', url: 'https://gabelli.com/research/2026-outlook-energy-sector/' },
    ],
  },

  {
    ticker: 'TTE',
    sector: 'Energy',
    scope: 'GLOBAL',
    headline:
      'The major that actually built an electricity business rather than announcing one, funded by the second-largest liquefied natural gas portfolio in the industry — and the one whose transition capital is large enough to matter to returns.',
    howItEarns: [
      {
        heading: 'Upstream and liquefied natural gas fund everything else',
        body:
          'Low-cost Middle Eastern and West African production plus a very large liquefied natural gas portfolio with contracted volumes and trading optionality generate the cash. Refining, chemicals and marketing monetise it downstream, particularly across Europe and Africa.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Integrated Power is a real segment with real contracts',
        body:
          'Renewable generation and electricity trading are reported as a segment with its own capital and returns, and the generation is largely contracted or regulated for twenty years. It consumes capital today against returns that are lower and far more predictable than upstream.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed ownership across institutional investors, with a substantial employee shareholding — an unusual feature that gives staff a direct stake.',
      voting: 'Ordinary shares with a French double-voting-rights regime for long-held registered shares, which concentrates voting power among long-term holders including employees.',
      relatedPartyExposure: [
        'Production sharing and consortium partners including sovereign entities across the Middle East and Africa',
        'Double voting rights give long-term registered holders, including the employee shareholding, influence beyond their economic stake',
      ],
      minorityProtections: [
        'French governance and disclosure regime, including binding remuneration votes',
        'No controlling block; double voting rights are available to any holder who registers and holds',
        'A large and active institutional register that has voted on strategy resolutions',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Double voting rights reward patience and dilute a short-term holder',
        body:
          'Shares held in registered form for a qualifying period carry two votes. That is a deliberate structural bias toward long-term shareholders, including the employee base, and it means a newly arrived activist has less voting power than its economic stake implies. Whether that is protection or entrenchment depends on whether the long-term holders are right.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The transition strategy is genuine, which makes it a genuine capital risk',
        body:
          'Unlike peers whose low-carbon ambition was largely rhetorical and quietly reduced, this company has committed real capital to electricity at scale. The returns are contracted, lower than upstream, and long-dated. That is a defensible strategy and it is a material allocation of shareholder capital into a business earning less than the one funding it.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'A liquefied natural gas portfolio with contracted volumes and trading reach',
        mechanism:
          'Scale across liquefaction, shipping and regasification allows cargoes to be directed to the highest-paying basin, earning from dispersion as well as from price. Only one competitor has a comparable portfolio.',
        evidence: 'Trading and integrated gas contributions that have materially exceeded segment expectations during regional gas dislocations.',
        erodedBy: 'The new supply wave compressing inter-basin spreads and spot prices.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Low-cost upstream positions in the Middle East and West Africa',
        mechanism:
          'Long-standing access to low-lifting-cost reserves under production sharing terms that new entrants cannot obtain, in jurisdictions where relationships are measured in decades.',
        evidence: 'Portfolio breakevens among the lowest of the European majors.',
        erodedBy: 'Fiscal renegotiation by host governments, and political instability in the producing regions.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The most transition-weighted of the majors, with a stated split between hydrocarbons and electricity, plus consistent distributions and buybacks. The direction is coherent; whether the electricity capital earns its cost is the open question and it is large enough to matter.',
      good: [
        'Building a contracted, regulated electricity business rather than a portfolio of merchant renewable projects',
        'Maintaining distributions and buybacks through the transition spending rather than funding one by cutting the other',
        'Concentrating upstream capital on the lowest-breakeven barrels in the portfolio',
      ],
      bad: [
        'Electricity returns structurally below the upstream alternative, which lowers the blended return on capital for as long as the reallocation continues',
        'Exposure to jurisdictions where political disruption has repeatedly interrupted production and required asset write-downs',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Least exposed of the majors to the oil surplus, most exposed to the gas one',
        body:
          'Upstream is a smaller share of earnings than at the crude-weighted majors, so the 2.3 million barrel a day surplus matters less. But the liquefied natural gas portfolio that replaces it faces the new US, Canadian and Qatari capacity directly.',
        basis: 'REPORTED',
      },
      {
        heading: 'European refining is structurally shrinking',
        body:
          'Refining margin is a regional supply outcome, and European capacity is closing under energy cost and competitive pressure. That supports margins for the units that remain and reduces the asset base earning them.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Electricity capital earning below the cost of capital',
        body:
          'Contracted renewable returns are lower than upstream by design. If the returns achieved fall below the cost of capital, the transition reallocation destroys value regardless of how strategically sound it is.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Political disruption in concentrated producing regions',
        body:
          'Low-cost barrels come from jurisdictions where production has been interrupted before. The cost advantage and the political exposure are the same asset.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'tte-integrated-power',
        title: 'The only major whose transition is contracted rather than announced',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Most majors announced a low-carbon pivot and quietly reduced it when returns disappointed. This one built a reported segment with its own capital, largely contracted or regulated for twenty years, funded by one of the two largest liquefied natural gas portfolios in the industry. That produces an earnings base with a growing share of predictable, long-dated cash flow inside a company still rated on the oil price — and a double-voting structure that gives long-term holders the influence to keep the strategy on course.',
        requires: [
          'Integrated Power returns clear the cost of capital as the segment scales',
          'Liquefied natural gas cash flow continues funding the reallocation without external capital',
          'Contracted and regulated offtake continues to dominate the electricity portfolio',
        ],
        breaks: [
          'Electricity returns settling below the cost of capital, making the reallocation value-destroying',
          'Gas spreads compressing enough that the funding source weakens before the destination matures',
          'A shift toward merchant rather than contracted generation',
        ],
        modelLink: [
          { assumption: 'Segment margins and capital by segment', note: 'Model Integrated Power separately with its own return on capital. Blended into a consolidated margin the entire thesis is invisible.' },
          { assumption: 'WACC', note: 'A growing share of contracted, regulated cash flow should lower the blended discount rate. Test whether it does enough to offset the lower returns.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'tte-dilutive-reallocation',
        title: 'Moving capital from a high-return business to a lower-return one',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Contracted renewable generation earns predictable single-digit to low-double-digit returns; low-cost upstream barrels earn multiples of that. Reallocating capital from the second to the first lowers the blended return on capital for as long as the shift continues, however sound the long-run logic. The bull case requires the discount rate to fall by more than the return does, and that is an arbitrage on the cost of capital rather than an operating improvement. Meanwhile the funding business faces spread compression from the gas supply wave.',
        requires: [
          'Capital continues shifting toward lower-return electricity',
          'Electricity returns remain structurally below upstream returns',
        ],
        breaks: [
          'Electricity returns rising toward upstream levels, which would remove the dilution',
          'A slower reallocation that preserves the blended return while the transition proceeds',
        ],
        modelLink: [
          { assumption: 'Return on invested capital', note: 'Model the blended return on incremental capital rather than segment margins. The dilution only appears at the capital level.' },
          { assumption: 'Capex path by segment', note: 'The pace of reallocation is the variable. Test the equity value at a faster and a slower shift.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ABN AMRO — energy market outlook 2026', url: 'https://www.abnamro.com/research/en/our-research/energy-market-outlook-2026-oil-oversupply-and-european-gas-price' },
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
    ],
  },

  {
    ticker: 'SLB',
    sector: 'Energy',
    scope: 'GLOBAL',
    headline:
      'One derivative away from the oil price: revenue follows customer capital budgets with a year\'s lag, weighted to international and offshore work that is contracted rather than spot.',
    howItEarns: [
      {
        heading: 'Selling the capability to develop a barrel, not the barrel',
        body:
          'Reservoir characterisation, drilling, well construction and production technology are sold to national and international oil companies. Revenue is a share of their capital spending, so it tracks the oil price with a lag of roughly a year rather than moving with it day to day.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'International and offshore contracts are longer than North American land work',
        body:
          'Middle Eastern and offshore programmes run on multi-year terms with national oil companies whose spending is driven by depletion and policy rather than by the spot price. That makes the revenue base materially less volatile than a North American land-weighted competitor\'s.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Long-term service agreements and joint ventures with national oil companies that are also the principal customers',
        'Technology partnerships and joint ventures with competitors in specific product lines',
      ],
      minorityProtections: [
        'Single voting class with dispersed ownership',
        'SEC reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Customer concentration among state oil companies is the structural relationship',
        body:
          'A significant share of revenue comes from a small number of national oil companies whose spending is set by government policy. Those relationships are durable and they concentrate both revenue and negotiating leverage on the customer\'s side.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Cost discipline has been the management achievement of this cycle',
        body:
          'The company emerged from the last downturn with a materially lower cost base and has held margin through a period of modest revenue growth. For a service company, holding pricing and cost discipline in a recovery is the harder half — the temptation is to buy share.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Measurement and reservoir technology with an installed base',
        mechanism:
          'Proprietary downhole measurement and interpretation technology, plus the installed base of equipment and the data from it, make the company the default for complex reservoirs. A competitor can offer a cheaper service and not the same interpretation.',
        evidence: 'Sustained share and pricing in reservoir characterisation and well construction where competitors compete mainly on price.',
        erodedBy: 'Customers building in-house capability, and technology diffusion that commoditises measurement.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'International footprint and national oil company relationships',
        mechanism:
          'Operating across dozens of jurisdictions with local content, logistics and regulatory capability is a barrier that takes decades to build and cannot be assembled for a single contract.',
        evidence: 'A revenue mix weighted to international and offshore markets where multi-year contracts dominate.',
        erodedBy: 'National oil companies developing domestic service industries under local content mandates.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Post-downturn discipline: lower capital intensity, a lighter asset base, divestment of commoditised product lines, and distributions restored gradually rather than restored early. The digital and low-carbon ventures are the speculative portion.',
      good: [
        'Exiting and divesting commoditised, capital-heavy product lines to concentrate on technology-differentiated services',
        'Restoring distributions gradually after the downturn rather than committing to them before the recovery was established',
      ],
      bad: [
        'A pre-2015 era of acquisitions and capital intensity that produced large write-downs when activity collapsed',
        'Digital and new-energy ventures whose revenue contribution remains small relative to the attention and capital they absorb',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Customer capital budgets are the driver, and they follow the price with a lag',
        body:
          'Oversupply near 2.3 million barrels a day and a $55 to $86 Brent forecast range point to constrained customer spending ahead. The lag means revenue weakness arrives after the price weakness, which is why the shares often fall before the results do.',
        basis: 'REPORTED',
      },
      {
        heading: 'National oil company spending is the offset',
        body:
          'Middle Eastern capacity programmes are driven by policy and depletion rather than by the spot price, so a meaningful share of the revenue base does not follow the cycle that determines the rest of the sector.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Customer capital discipline reducing the addressable spend',
        body:
          'A decade of majors prioritising distributions over volume growth shrinks the pool of capital this company earns a share of. It is the structural version of the cyclical risk.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Local content mandates displacing international service providers',
        body:
          'National oil companies increasingly require domestic service capability. Over time that substitutes local providers for international ones in exactly the markets the company is most weighted to.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'slb-international-mix',
        title: 'The revenue base is contracted and international, not spot and American',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Oilfield services are priced as a levered bet on the oil price, and for a North American land-weighted operator that is accurate. This company\'s revenue is weighted to international and offshore programmes with national oil companies on multi-year terms, where spending follows depletion and government policy rather than the spot price. That produces a materially less volatile revenue base than the sector multiple assumes, and a cost base already reset in the last downturn means the margin holds at lower activity than it used to.',
        requires: [
          'National oil company programmes continue on policy-driven rather than price-driven schedules',
          'Cost discipline holds rather than being traded for share in a recovery',
          'Technology differentiation sustains pricing in the core service lines',
        ],
        breaks: [
          'National oil companies cutting capacity programmes in response to sustained low prices',
          'Pricing competed away as competitors buy share in a soft market',
          'Local content mandates displacing the company in its strongest markets',
        ],
        modelLink: [
          { assumption: 'Revenue growth by geography', note: 'Model international and North American revenue separately. Blended, the international stability is invisible.' },
          { assumption: 'EBITDA margin path', note: 'The claim is that margin holds at lower activity than historically. Test the margin at a trough revenue level rather than scaling it with revenue.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'slb-shrinking-pool',
        title: 'The customers have permanently decided to spend less',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Service revenue is a share of the industry\'s capital budget, and that budget has been structurally reset. A decade of investor pressure taught producers to prioritise distributions over volume growth, and they have complied — which is part of why supply responds slowly. That discipline is good for the producers and permanently shrinks the pool this company earns from. Add local content mandates substituting domestic providers in the international markets where the mix advantage lives, and the structural growth rate is lower than the cyclical recovery suggests.',
        requires: [
          'Producer capital discipline persists rather than reverting in a higher price environment',
          'Local content requirements continue expanding in key international markets',
        ],
        breaks: [
          'A sustained high price environment that restores growth-oriented capital budgets',
          'Technology intensity rising enough that the service share of each capital dollar increases even as budgets stay flat',
        ],
        modelLink: [
          { assumption: 'Revenue growth / terminal growth', note: 'Model terminal revenue growth below nominal GDP rather than at it. The thesis is a structurally smaller addressable pool.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IEA — Oil Market Report, July 2026', url: 'https://www.iea.org/reports/oil-market-report-july-2026' },
      { label: 'Gabelli — 2026 energy sector outlook', url: 'https://gabelli.com/research/2026-outlook-energy-sector/' },
      { label: 'J.P. Morgan Global Research — oil price forecasts', url: 'https://www.jpmorgan.com/insights/global-research/commodities/oil-prices' },
    ],
  },
];
