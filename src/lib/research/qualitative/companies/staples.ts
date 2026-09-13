import type { CompanyQualitative } from '../types';

export const CONSUMER_STAPLES: CompanyQualitative[] = [
  {
    ticker: 'ABEV3',
    sector: 'Consumer Staples',
    scope: 'BRAZIL',
    headline:
      'Brazilian beer volumes grew 1.2% in a first quarter that was expected to fall and 5% in the second, with EBITDA margin back above 33% — and a selective tax on alcoholic drinks arriving in 2027 that one broker estimates could take 17% off Brazilian beer EBITDA.',
    howItEarns: [
      {
        heading: 'Beer in Brazil, then everything else',
        body:
          'Brewing and distributing beer across Brazil, with soft drinks under licence, a Central American and Caribbean operation, Canada and the Southern Cone. The Brazilian beer division is the profit engine: volumes there grew 1.2% year on year in the March 2026 quarter — a record for a first quarter, against expectations of a 1% to 2% decline — and 5% in the June quarter. Adjusted EBITDA reached R$7.55 billion, up 1.5%, with margin expanding half a point to 33.6%, and first-quarter net income was R$3.89 billion, up 2.1%.',
        basis: 'REPORTED',
      },
      {
        heading: 'Distribution reach is the product as much as the beer is',
        body:
          'Direct delivery to a very large number of small points of sale — bars, corner shops, restaurants — means the brand is available where the purchase is decided, and the route density is what makes serving a single-fridge bar economic. A competitor with a good beer and no route is not in the same business.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Premium mix is where the price is taken',
        body:
          'Price increases in mainstream beer meet a price-sensitive consumer; trading the same drinker into a premium brand raises revenue per litre without a visible price rise. That mix shift is the mechanism behind margin expansion in a market where volume growth is close to population growth.',
        basis: 'INTERPRETATION',
      },
    ],
    control: {
      form:
        'Controlled by a global brewing group holding roughly 62% of the capital. The controller is itself a listed company with its own shareholders and its own leverage, so its dividend requirement is a live input into this company\'s capital allocation rather than an abstraction.',
      voting: 'All shares are ordinary with voting rights, so every holder votes at the general meeting; control comes from the size of the parent\'s stake. Tag-along protection is 80% of the price paid to the controller rather than 100%.',
      relatedPartyExposure: [
        'Brand licensing, technology and shared-service agreements with the controlling group, whose pricing determines how much value stays in the subsidiary',
        'Soft drink bottling under licence from a third-party brand owner, which sets terms this company does not control',
        'A controller with its own deleveraging agenda, which creates a structural preference for cash distribution over reinvestment here',
      ],
      minorityProtections: [
        'A single class of voting ordinary shares, so minority holders vote on every matter put to the meeting',
        'Tag-along at 80% of the price paid to the controlling block on a change of control',
        'Related-party transaction disclosure and approval requirements under the corporations law, and a board including independent members',
        'A fiscal council, which in Brazilian law reports to shareholders rather than to the board',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'Tag-along at 80%, not 100%, is the specific minority gap',
        body:
          'A change of control obliges an offer to minorities at 80% of the price paid to the controller, so up to a fifth of any control premium can be retained by the seller. Companies on the strictest Brazilian listing segment give 100%. This is a small-looking clause that decides who captures value in the one event that matters most.',
        basis: 'REPORTED',
      },
      {
        heading: 'The controller\'s balance sheet shapes this one',
        body:
          'The parent has spent years reducing its own leverage, and this subsidiary is one of its most reliable sources of cash. A high payout is therefore not only a reflection of low reinvestment needs; it is also a controller preference, and it constrains how much of a downturn could be absorbed by retaining earnings.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Direct distribution to a fragmented on-trade',
        mechanism:
          'Serving hundreds of thousands of small outlets directly requires a route network, a fleet and a credit relationship with each owner, all of which are fixed costs that only national volume can absorb. A challenger must either build that network unprofitably or accept a wholesaler between it and the point of sale, which costs both margin and shelf control.',
        evidence: 'Brazilian beer volume growth of 1.2% in a quarter forecast to decline 1% to 2%, attributed to commercial execution rather than to price.',
        erodedBy: 'Modern trade and delivery platforms taking share of consumption from the fragmented on-trade, which replaces the route advantage with a negotiation against a large buyer.',
        basis: 'REPORTED',
      },
      {
        label: 'Brand portfolio covering every price point in one category',
        mechanism:
          'Holding mainstream, premium and economy brands means a consumer trading up or down stays inside the portfolio, so the mix moves but the volume does not leave. Each brand took decades of advertising to establish, which is a cost a new entrant cannot compress.',
        evidence: 'Margin expansion of half a point to 33.6% driven by mix rather than by volume, in a market where beer volume growth tracks population.',
        erodedBy: 'Craft and regional brands capturing the premium consumer, which is where the incremental margin is, without needing national distribution to do it.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'A very high payout funded by consistent cash generation, minimal leverage and a net cash position. The discipline is real and the reinvestment rate is low because the Brazilian market is mature — which makes the question what the company does when the tax regime changes the economics.',
      good: [
        'Running with net cash rather than leverage in a country where corporate credit costs above 14%, which means the cycle is absorbed rather than financed',
        'Investing in returnable glass and direct distribution, which lowers cost per litre and raises the barrier to a challenger simultaneously',
        'Defending volume through commercial execution rather than price in the March 2026 quarter, producing a volume result five to seven points better than the market expected',
      ],
      bad: [
        'Distributing the large majority of earnings for years has meant the Brazilian business has had little retained capital to diversify away from a single category in a single country that is about to be taxed selectively',
        'The soft drinks operation is conducted under licence from a third-party brand owner, so a substantial share of revenue is built on terms the company does not set and cannot inherit',
        'Successive commercial pushes in Argentina and the Southern Cone have delivered volume in currencies that then devalued, repeatedly converting operating gains into translation losses',
        'The company has been a reliable cash source for a parent reducing its own leverage, which is a defensible use of cash and also the reason the balance sheet has no accumulated capacity for a strategic response',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The premium mix driver, working',
        body:
          'The Brazilian Consumer Staples dossier names premium mix in beverages as the one clear tailwind in the sector. This is the company that driver describes: margin expanded half a point to 33.6% while volume growth stayed near population growth, which is mix doing the work rather than price.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The volume-price trade resolved in favour of volume, deliberately',
        body:
          'The dossier frames food and beverage inflation as a trade between volume and price. In the first half of 2026 this company chose volume — 1.2% growth against an expected decline, then 5% — and still expanded margin. That combination is only available to a company whose cost per litre is falling, which is what returnable packaging and route density deliver.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'The selective tax on alcoholic beverages in 2027',
        body:
          'The move to a value-added structure could benefit the company, but the separate selective tax on alcoholic drinks may neutralise the gain entirely. One broker has modelled a scenario in which the company passes through only half the cost increase, with demand elasticity of 0.5 and market growth of 1%: Brazilian beer EBITDA falls 17% in 2027. That is a legislated risk, not a competitive one, and it is the single largest variable in the valuation.',
        basis: 'REPORTED',
      },
      {
        heading: 'A mature category in a single country',
        body:
          'Brazilian beer volume growth tracks population and weather. Everything above that comes from mix and from execution, both of which have limits, and neither of which offsets a step change in the tax on the product.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Currency in the non-Brazilian operations',
        body:
          'Central America, the Caribbean and the Southern Cone contribute volume in currencies that have repeatedly devalued against the real. The operating performance can be good and the translated contribution negative in the same year, which makes constant-currency disclosure essential to reading the result.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'abev3-selective-tax',
        title: 'A legislated tax change, not competition, is the threat — and it is estimated at 17% of Brazilian beer EBITDA',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The consumption tax reform moves Brazil to a value-added structure, which on its own would likely help a company with a long, tax-heavy production chain. But a separate selective tax on alcoholic beverages arrives with it, and the second can cancel the first. A published broker scenario puts numbers on it: half pass-through of the cost increase, demand elasticity of 0.5 and market growth of 1% produces a 17% decline in Brazilian beer EBITDA in 2027. The reason this deserves weight rather than dismissal is that it is not a forecast about consumer behaviour or competitive response — it is arithmetic on a rate that legislators set, applied to the division that generates most of the profit. And the company\'s defences do not reach it: route density, brand portfolio and premium mix all protect share within the category, and none of them protects the category from a tax on the product. A high payout means there is also no retained capital positioned for a response.',
        requires: [
          'The selective tax on alcoholic beverages being implemented at a material rate',
          'Pass-through being partial rather than complete, which is what price-sensitive Brazilian beer demand implies',
          'Demand elasticity of roughly the assumed magnitude, so volume falls as price rises',
        ],
        breaks: [
          'The selective rate on beer being set low enough that the value-added benefit dominates',
          'Full pass-through achieved without volume loss, which would require pricing power the mainstream segment has not previously shown',
          'A long phase-in that lets premium mix and cost reduction absorb the increase before it lands',
        ],
        modelLink: [
          { assumption: 'Effective tax rate and indirect taxes', note: 'A selective excise on the product is a cost of goods and price event, not an income tax one. Model it in the revenue and gross margin build, not in the tax line, or the effect disappears.' },
          { assumption: 'Revenue build-up: price and volume', note: 'This is the thesis in one place. Model the price increase and the elasticity response together; a price rise with unchanged volume assumes the pass-through is free.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'abev3-execution-and-mix',
        title: 'Volume beat expectations while margin expanded, which only the lowest-cost distributor can do',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Brazilian beer volume grew 1.2% in the March 2026 quarter against a consensus expecting a decline of 1% to 2%, then 5% in the June quarter, and adjusted EBITDA margin still expanded half a point to 33.6% with EBITDA of R$7.55 billion. Volume and margin moving together is the signature of falling cost per litre rather than of price increases: returnable glass, route density and premium mix all lower the cost or raise the revenue on the same delivered litre. That combination is available to the company with the deepest direct distribution into the fragmented on-trade and to no one else, because a challenger has to choose between buying volume with price and protecting margin by conceding shelf. The balance sheet supports it: net cash in a country where corporate credit costs above 14% means the cycle is absorbed rather than financed, and an 82%-indebted household base does not reach this company through its funding costs.',
        requires: [
          'Brazilian beer volumes remaining at or above population growth',
          'Premium mix continuing to rise as a share of volume',
          'The cost per litre advantage from returnable packaging and route density persisting',
        ],
        breaks: [
          'Volume growth turning negative alongside flat margin, which would mean price is being used to defend share',
          'Premium mix stalling, removing the mechanism behind margin expansion in a volume-mature market',
          'Modern trade and delivery platforms taking enough on-trade consumption to replace route density with buyer negotiation',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Margin at 33.6% and rising must be justified by mix and cost per litre, not asserted. Link it to the premium share assumption in the segment build.' },
          { assumption: 'Cost of debt and cash position', note: 'The company runs net cash. A projection that applies a Brazilian gross cost of debt without crediting the cash balance overstates financial expense and understates earnings.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'abev3-controller-cash-claim',
        title: 'The controller holds 62% and tag-along is 80%, which decides who captures value in both cash and control',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'Two structural facts govern how much of this business a minority holder actually owns. The first is that the controlling group holds roughly 62% and is itself a listed company that has spent years reducing its own leverage — so the very high payout here is a controller requirement as much as a reflection of low reinvestment needs, which is fine while the business is stable and constraining when it needs capital for a strategic response to a tax change. The second is that tag-along protection is 80% rather than 100% of the price paid to the controller, so in a change of control up to a fifth of the premium can be kept by the seller. Neither fact is hidden and neither is a scandal; both belong explicitly in a valuation. The payout assumption should be understood as a policy set upstream, and the terminal value should not assume a minority holder participates fully in a control event.',
        requires: [
          'The controlling stake remaining near 62% with the current licensing and shared-service arrangements',
          'Tag-along remaining at 80% rather than being raised to 100%',
        ],
        breaks: [
          'A migration to a listing standard requiring 100% tag-along, which would close the gap',
          'The controller reducing its stake to a non-controlling level, restoring proportional treatment',
          'A sustained reduction in payout to fund reinvestment, which would show capital allocation is set locally',
        ],
        modelLink: [
          { assumption: 'Dividend payout ratio', note: 'Payout here is a controller policy, not a residual. Treat a high payout as an input constraint and test what a capital need would do to it, rather than deriving it from free cash flow.' },
          { assumption: 'Cost of equity', note: 'An 80% tag-along and a related-party licensing structure justify an explicit governance premium. State its size rather than leaving it inside beta.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'InfoMoney — Ambev: resultado anima e ações sobem 4% com recuperação de margem', url: 'https://www.infomoney.com.br/mercados/ambev-abev3-resultado-anima-e-acoes-sobem-4-com-recuperacao-de-margem-e-numeros-de-cerveja-no-brasil/' },
      { label: 'Safra — Consumo de cerveja cresce no Brasil e Ambev supera previsões (1T26)', url: 'https://oespecialista.safra.com.br/ambev-resultados-1t26-cerveja-brasil/' },
      { label: 'XP Investimentos — Ambev 2T26: volume de Cerveja Brasil +5%', url: 'https://conteudos.xpi.com.br/acoes/relatorios/ambev-abev3-revisao-dos-resultados-do-2t26-comps-entregues-volume-de-cerveja-brasil-5-xpe/' },
      { label: 'Seu Dinheiro — Reforma tributária e o Imposto Seletivo: BofA vê risco ignorado pelo mercado', url: 'https://www.seudinheiro.com/2026/empresas/reforma-tributaria-pode-virar-dor-de-cabeca-para-a-ambev-abev3-bofa-ve-risco-ainda-ignorado-pelo-mercado-lvgb/' },
      { label: 'Ambev RI — Perguntas frequentes: estrutura societária e tag along', url: 'https://ri.ambev.com.br/perguntas-frequentes/' },
    ],
  },

  {
    ticker: 'RADL3',
    sector: 'Consumer Staples',
    scope: 'BRAZIL',
    headline:
      'Mature-store sales grew 10.9% against a regulated price increase of 2.8%, and branded medicines rose 24.3% on weight-loss drugs — a pharmacy chain growing its top line on a category with almost no gross margin.',
    howItEarns: [
      {
        heading: 'Pharmacy retail at scale, with the price of half the basket set by a regulator',
        body:
          'Prescription medicines, generics and non-medicine categories sold through a national store network. The annual price increase on regulated medicines is set by the federal price regulator — 2.8% for 2026 — so growth above that has to come from volume, from mix and from new stores. Mature-store sales grew 10.9% in the June 2026 quarter, 8.1 points above the authorised adjustment.',
        basis: 'REPORTED',
      },
      {
        heading: 'The non-medicine aisle is where the margin is',
        body:
          'Beauty, personal care and convenience categories carry far higher gross margin than regulated medicines and are not price-controlled. The store is therefore a pharmacy that funds traffic with prescriptions and earns its margin on everything else, which is why category mix matters more than revenue growth.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Store openings are the growth engine and the capital consumer',
        body:
          'The chain ended June 2026 with 3,687 pharmacies after 76 openings and three closures in the quarter, with guidance of 330 to 350 openings for the year. Each store consumes capital and inventory before it matures, so rapid expansion suppresses reported margin exactly when it is building future earnings.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'Controlled in practice by the two founding families that combined the original chains, holding a large aggregate stake without a single majority holder. Professional management runs the company and the families are represented on the board rather than in the executive.',
      voting: 'Single class of common shares on Novo Mercado, one share one vote.',
      relatedPartyExposure: [
        'Two founding family blocks whose combined holding confers control without either being individually decisive',
        'Store leases, some with landlords connected to the founding groups, which requires disclosure to be checked rather than assumed',
      ],
      minorityProtections: [
        'Novo Mercado listing: one share one vote, minimum free float, majority-independent board requirements',
        'Tag-along at 100% of the price paid to a controlling block on a change of control',
        'Related-party transaction approval and disclosure rules under the listing standard and the corporations law',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Expansion guidance is published and specific, which makes it testable',
        body:
          'The company publishes an opening plan — 330 to 350 stores for 2026 — alongside dividends and a share bonus. A published unit plan is the most falsifiable thing a retailer can disclose, because store count, maturity curve and capital consumed can all be checked against it afterwards.',
        basis: 'REPORTED',
      },
      {
        heading: 'Two family blocks rather than one controller',
        body:
          'Control rests on two founding groups acting together. That structure has produced stable professional management for over a decade, and it carries the risk visible elsewhere in this universe: when two blocks of comparable weight disagree, there is no mechanism to resolve it other than negotiation.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Store density in high-income urban catchments',
        mechanism:
          'A pharmacy purchase is usually urgent and local, so the nearest store wins it. Building density in the catchments where the non-medicine basket is largest requires years of site acquisition, and the incumbent occupies the corners before a challenger can bid for them.',
        evidence: '3,687 stores with mature-store sales growing 10.9% against a 2.8% regulated price increase — volume and mix, not price.',
        erodedBy: 'Digital pharmacy and subscription delivery models that make proximity irrelevant for chronic medication, which is the most predictable part of the basket.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Scale in buying and in inventory across a very long tail',
        mechanism:
          'A pharmacy must hold thousands of low-turn items to be credible on the urgent purchase, and the working capital that requires only earns its keep across a large store base. National scale also improves terms with manufacturers on a regulated-price product where every point of purchase discount is margin.',
        evidence: 'Adjusted EBITDA margin stable at 8% of gross revenue while opening 76 stores in a single quarter.',
        erodedBy: 'Manufacturers selling direct or through a single digital channel, which removes the retailer\'s negotiating position on the highest-value products.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Almost all cash reinvested into store openings, with a modest dividend and a share bonus. The expansion record has been genuinely good — store count and share have risen for a decade — and the discipline question is whether the incremental store still earns above the cost of capital.',
      good: [
        'Consistent organic expansion rather than acquisition, which avoided paying for other chains\' worst locations and kept the maturity curve under management control',
        'Building the non-medicine and beauty categories, which is where the gross margin is and which regulated medicine pricing cannot reach',
        'Publishing an explicit opening plan of 330 to 350 stores, which subjects the capital programme to external scrutiny rather than describing it after the fact',
      ],
      bad: [
        'Adjusted net margin fell 0.3 points to 3.4% of gross revenue even as revenue rose 9.8% to R$11 billion, so the expansion is currently consuming more margin than the maturing base is restoring',
        'Growth is increasingly coming from branded medicines, up 24.3% and driven mainly by weight-loss drugs — a high-ticket, low-gross-margin category that inflates revenue growth while diluting the mix the store economics depend on',
        'Opening 330 to 350 stores a year into a market where density is already high raises the cannibalisation question that store-count disclosure alone cannot answer',
        'Sell-side views are unusually split — one house sees a 39% upside and another expects a decline — which is a fair reflection that the incremental return on the expansion programme is not yet demonstrable from the disclosure',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Structurally defensive, and that is why the growth is scrutinised',
        body:
          'Medicine demand does not follow the discretionary cycle, which is why this company grew mature-store sales 10.9% while broad Brazilian retail contracted. The Brazilian staples dossier frames the sector\'s question as volume versus price; here the regulator sets the price, so the entire argument is about volume, mix and store count.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Weight-loss drugs are a sector driver arriving as a revenue line',
        body:
          'The global staples dossier names GLP-1 medication as a headwind to food and beverage demand. For a pharmacy it is the opposite sign and a different problem: branded medicines grew 24.3% driven by that class, which lifts revenue and dilutes gross margin, because the product is expensive and the retail spread on it is thin.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Revenue growth that dilutes margin',
        body:
          'Branded medicines up 24.3% on weight-loss drugs means the fastest-growing part of the basket is also among the least profitable per real of revenue. Adjusted net margin already fell 0.3 points to 3.4%. Growth of this composition makes the top line look strong and the return on the store worse.',
        basis: 'REPORTED',
      },
      {
        heading: 'The regulator sets the price on the traffic-driving half of the store',
        body:
          'An annual adjustment of 2.8% below actual cost inflation transfers margin from the chain to the consumer by decision. The chain cannot price its way out of a cost increase on regulated products, only sell more of them or sell more of something else.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Cannibalisation inside its own network',
        body:
          'At 3,687 stores and 330 to 350 openings a year, new units increasingly open near existing ones. Consolidated revenue still grows while average sales per store fall and the incremental store earns below the cost of capital — the failure mode the sector dossier names as opening units into saturation.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'radl3-volume-over-regulated-price',
        title: 'Growing 8.1 points above the regulated price increase is share taken, not inflation passed on',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The federal regulator authorised a 2.8% increase on controlled medicines for 2026. Mature-store sales grew 10.9%. The 8.1 point gap cannot be price, because on half the basket price is not this company\'s decision — it is volume, category mix and share taken from independents and smaller chains in a fragmented market. Revenue reached R$11 billion in the June quarter, up 9.8%, with adjusted EBITDA margin stable at 8% of gross revenue despite 76 store openings in the quarter, and adjusted net income of R$432 million, up 7.4%. Holding margin flat while carrying that many immature stores is the operating evidence: the maturing base is funding the expansion. In a sector where the regulated price caps the easy route to growth, a chain that can still take share is compounding on the only axis available.',
        requires: [
          'Mature-store sales continuing to grow well above the regulated price adjustment',
          'EBITDA margin holding near 8% of gross revenue while the opening programme runs',
          'The fragmented independent pharmacy base continuing to cede share',
        ],
        breaks: [
          'Mature-store growth converging on the regulated adjustment, which would mean share gains have stopped',
          'EBITDA margin falling below 8% of gross revenue, indicating the expansion is no longer self-funding',
          'Average sales per store declining as the network densifies, the signature of cannibalisation',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and price', note: 'Price is externally set at the regulated adjustment for controlled medicines. Model price at that ceiling and put all growth above it into volume, mix and store count, or the build-up is not describing this business.' },
          { assumption: 'Store count and capex', note: 'Model the 330 to 350 annual openings with a maturity curve. A revenue path without a maturity assumption implies new stores produce mature sales immediately.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'radl3-glp1-dilution',
        title: 'The fastest-growing category is the one that earns the least',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Branded medicines grew 24.3% in the June 2026 quarter, driven mainly by weight-loss drugs. That is a high-ticket product with a thin retail spread: it adds revenue, consumes working capital and shelf attention, and contributes far less gross margin per real than the beauty and personal care categories the store economics actually depend on. The evidence is already in the result — adjusted net margin fell 0.3 points to 3.4% of gross revenue while revenue grew 9.8%. The structural concern is that this category is also the most exposed to disintermediation: an expensive chronic medication with predictable refills is exactly what a direct-to-patient or digital pharmacy channel takes first, and it is the category where manufacturers have the most incentive to control distribution. So the growth that currently flatters the top line may be both the least profitable and the least defensible part of it.',
        requires: [
          'Weight-loss and branded medicine growth continuing to outpace the higher-margin categories',
          'Retail spread on those products remaining thin',
        ],
        breaks: [
          'Gross margin mix improving as beauty and personal care outgrow branded medicines',
          'Net margin recovering above 3.5% of gross revenue while branded medicine growth stays high, which would show the category is not dilutive after all',
          'Negotiated terms on high-ticket branded products improving materially with scale',
        ],
        modelLink: [
          { assumption: 'Gross margin', note: 'This thesis is a mix argument. Model gross margin as a weighted result of the category mix rather than as a single input, or a 24.3% branded-medicine growth rate looks like good news.' },
          { assumption: 'Working capital days', note: 'High-ticket medicines raise inventory value per unit. Inventory days and the funding cost on them are where this category shows up in cash flow, not in the margin line.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'radl3-regulated-price-structure',
        title: 'Half the basket has its price set by a regulator, and the model must say so',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'The annual adjustment on controlled medicines is set by a federal price chamber — 2.8% for 2026 — and it is below general cost inflation. This is not a market where a retailer decides its own pass-through: on a large share of revenue the ceiling is administrative, so cost inflation in wages, rent and freight has to be recovered from volume, from the unregulated categories, or not at all. Two consequences follow for a valuation. First, a revenue build-up that applies a general inflation assumption to price is wrong by construction; the regulated portion must be modelled at the authorised rate. Second, the company\'s real pricing power lives entirely in the beauty, personal care and convenience aisle, which means the mix assumption is doing more work than the growth assumption. Recognising this is what separates a pharmacy model from a generic retail model, and it applies in both directions — it caps the upside from inflation and it removes the pricing risk of a deflationary period.',
        requires: [
          'The regulated price mechanism remaining in place with annual adjustments below cost inflation',
          'Regulated medicines remaining a large share of revenue',
        ],
        breaks: [
          'Deregulation of medicine pricing, which would restore normal pass-through',
          'Authorised adjustments moving to or above general cost inflation, which would remove the structural squeeze',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: price growth', note: 'Split the price assumption: regulated medicines at the authorised adjustment, unregulated categories at market. A single blended price growth rate misstates both.' },
          { assumption: 'Segment shares and margins', note: 'The regulated and unregulated halves have different margins and different pricing freedom. Model them separately or the mix shift that determines profitability is invisible.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Money Times — Raia Drogasil tem lucro ajustado de R$432 milhões no 2T26', url: 'https://www.moneytimes.com.br/raia-drogasil-radl3-tem-lucro-liquido-ajustado-de-r-432-milhoes-no-2o-trimestre-alta-de-74-fets/' },
      { label: 'Análise de Ações — Raia Drogasil aumenta lucro ajustado no 2T26', url: 'https://www.analisedeacoes.com/noticias/raia-drogasil-radl3-aumenta-lucro-ajustado-para-432-milhoes-no-2-trimestre-de-2026/' },
      { label: 'Money Times — Raia Drogasil anuncia proventos, bonificação e plano de expansão para 2026', url: 'https://www.moneytimes.com.br/raia-drogasil-radl3-anuncia-r-275-milhoes-em-proventos-bonificacao-de-acoes-e-plano-de-expansao-para-2026-igdl/' },
      { label: 'Money Times — Safra aposta em alta de 39% enquanto o Citi vê queda', url: 'https://www.moneytimes.com.br/raia-drogasil-radl3-por-que-o-safra-aposta-em-alta-de-39-enquanto-o-citi-ve-queda-no-horizonte-ceci/' },
    ],
  },
  {
    ticker: 'JBSS3',
    sector: 'Consumer Staples',
    scope: 'BRAZIL',
    headline:
      'The world\'s largest protein processor, earning a spread between the live animal and the cut that moves with herd cycles on three continents — and reorganised into a Dutch holding company with a dual-class structure in which the unlisted shares carry ten votes each.',
    howItEarns: [
      {
        heading: 'The spread, not the price',
        body:
          'Slaughtering and processing beef, poultry and pork and selling the cuts to retail, food service and export markets. Revenue follows protein prices but margin is the spread between the live animal and the finished cut, which is set by cattle and grain supply rather than by the company. In one recent quarter revenue reached roughly $23.9 billion against an expectation of $23.0 billion while earnings per share came in at $0.20 against $0.31 expected — the exact shape of a business whose volume is predictable and whose margin is not.',
        basis: 'REPORTED',
      },
      {
        heading: 'Diversification across species and continents is the only real hedge',
        body:
          'North American beef is loss-making or thin when the United States herd is in contraction, at the same time that chicken and pork benefit from cheap grain and from consumers substituting away from expensive beef. Holding all three across the Americas, Europe and Australia is what converts a violently cyclical spread into a manageable one — it is the business model, not a diversification slogan.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Branded prepared foods are the attempt to escape the spread',
        body:
          'The Brazilian branded operation and the prepared-foods portfolio sell a processed product at a price set by brand rather than by commodity, which is why they carry roughly double the margin of North American beef. Growing that share is the strategic answer to cyclicality, and it is slow because brands take years.',
        basis: 'INTERPRETATION',
      },
    ],
    control: {
      form:
        'Controlled by the founding family through a holding company. Following the corporate reorganisation the group is a Netherlands-incorporated company with a dual-class structure: Class A shares carry one vote and are listed in New York with depositary receipts in Brazil, while Class B shares carry ten votes each and are not exchange-traded. The controller\'s voting power therefore substantially exceeds its economic stake.',
      voting: 'Two classes. Class A, one vote, publicly traded; Class B, ten votes, not traded. A Brazilian development bank holding is also among the largest shareholders.',
      relatedPartyExposure: [
        'A family holding company that also controls other businesses, with a documented history of legal and compliance proceedings in Brazil',
        'A state development bank as a large shareholder alongside the controlling family, which has historically made the ownership register a political question as well as a financial one',
        'Intra-group transactions across seventeen countries, where transfer pricing between divisions determines where margin is reported',
      ],
      minorityProtections: [
        'SEC reporting and New York Stock Exchange listing standards, including audit committee independence requirements',
        'Segment disclosure by species and geography, which is what allows the spread cycle to be analysed rather than inferred',
        'Dutch corporate law provisions on related-party transactions and the rights of holders of listed shares',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'The reorganisation traded Brazilian listing protections for a dual-class structure',
        body:
          'The group moved from a Brazilian listed company with a single class of voting shares to a Dutch holding company whose publicly traded Class A shares carry one vote against ten for the unlisted Class B. Access to a deeper capital market was the stated benefit; the cost is that a public holder\'s vote is now worth a tenth of the controller\'s, which was not the case before.',
        basis: 'REPORTED',
      },
      {
        heading: 'The compliance history is part of the investment case, not a footnote',
        body:
          'The controlling group has a documented history of investigations, leniency agreements and penalties in Brazil. That history does not predict future conduct, but it does mean the governance discount here is based on record rather than on structure alone, and it is the reason the controlling structure deserves more scrutiny than a comparable family holding elsewhere.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The platform\'s blueprint describes the pre-reorganisation entity',
        body:
          'The quantitative model in this platform is built on a Brazilian listed company with a single share class. The real group is now a Dutch holding with dual-class shares listed in New York. The operating segments and the spread economics are unchanged; the share count, the voting structure and the listing are not, and a reader should treat the governance section here as the current fact and the blueprint as the legacy structure.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Slaughter capacity positioned against the herd',
        mechanism:
          'A processing plant must be near the animals, and permitted, financed and staffed capacity in the right cattle regions is scarce and slow to build. When the herd expands, whoever holds capacity captures the widening spread; a competitor cannot add a plant inside a cycle.',
        evidence: 'Operations across seventeen countries with capacity in the major cattle, poultry and pork producing regions of the Americas and Australia.',
        erodedBy: 'Overcapacity when the herd contracts, which turns the same fixed asset from a scarcity advantage into a fixed cost absorbing a negative spread.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Sanitary and market access built country by country',
        mechanism:
          'Selling beef into a given importing country requires that country to have approved the exporting plant, and approvals take years and can be suspended without notice. A processor holding approvals across many plants and many destinations can redirect volume when one market closes; one with a narrow set cannot.',
        evidence: 'Export exposure spread across the United States, Brazil, Australia and Europe, with the ability to shift destination mix when a market restricts access.',
        erodedBy: 'A disease event or a political embargo affecting a whole country of origin at once, which no plant-level diversification inside that country can offset.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Decades of debt-funded acquisition built the largest protein platform in the world, and it worked in scale terms while repeatedly testing the balance sheet. The more recent record is better: leverage brought toward the middle of the range, prepared foods grown, and a listing reorganisation intended to lower the cost of capital.',
      good: [
        'Assembling species and geographic diversification so that North American beef weakness is offset by poultry and pork strength within the same reporting period — the single decision that makes the business financeable',
        'Growing the Brazilian branded and prepared-foods operation, which earns roughly double the North American beef margin and is not exposed to the cattle spread in the same way',
        'Reducing leverage toward the middle of the stated range after previous cycles in which acquisition debt left almost no covenant headroom',
      ],
      bad: [
        'The reorganisation into a Dutch holding company introduced a dual-class structure in which publicly traded shares carry one vote against ten for the unlisted class, so a governance right that public shareholders previously held was given up in exchange for market access',
        'The controlling group\'s documented history of investigations and settlements in Brazil has repeatedly imposed a cost on this company in the form of financing spreads, restricted access to public procurement and a persistent valuation discount that operating performance has had to work against',
        'A long history of acquiring at the top of protein cycles with debt, which produced scale and also produced periods with almost no covenant headroom in a business whose margin can halve in two quarters',
        'The quarter in which revenue beat expectations at roughly $23.9 billion while earnings per share missed at $0.20 against $0.31 is the recurring pattern: volume is manageable and the spread is not, and acquisitions have added volume rather than reducing spread exposure',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Sanitary access and destination mix, exactly as the dossier frames it',
        body:
          'The Brazilian Consumer Staples dossier names sanitary access and export destination mix as a core sector driver. This company is the clearest expression of it: plant-level approvals across many countries are what let it redirect volume when a destination closes, and the same mechanism is the risk when an origin country is restricted wholesale.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Grain and currency work on opposite sides of the same company',
        body:
          'The dossier pairs grain costs with the currency. Cheap grain lowers the cost of chicken and pork and is a tailwind to those divisions; a weaker real raises the translated value of dollar exports and the cost of dollar-denominated feed and debt. Because this company sits on every side of that trade, the net effect has to be built from segments rather than assumed at the consolidated level.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'The North American cattle cycle',
        body:
          'When the United States herd contracts, cattle prices rise faster than beef prices and the largest division by revenue earns a thin or negative spread on unchanged volume. It is the single biggest driver of consolidated earnings variance and the company has no influence over it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A sanitary event or market closure',
        body:
          'A disease outbreak or a political embargo can remove an export destination, or an origin country\'s access to one, without notice. Volume then has to be sold domestically at a discount, which compresses margin across the whole division rather than the affected plants.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Leverage against a spread that can halve',
        body:
          'Debt sized against mid-cycle EBITDA becomes uncomfortable quickly when the spread compresses, and this company has been in that position before. The relevant test is net debt to EBITDA at a trough spread, not at the reported level.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'jbss3-diversification-is-the-asset',
        title: 'The diversification is the asset, and it is why the spread cycle is survivable',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The recurring mistake with this company is to model it as a beef processor with other divisions attached. It is better understood as a portfolio of spreads that are negatively correlated by construction: when the North American herd contracts and cattle prices rise, beef margin compresses at the same moment that consumers substitute toward chicken and pork and that cheap grain lowers the cost of producing them. Holding roughly a third of revenue in North American beef, a quarter in the Brazilian branded operation, a fifth in United States poultry and the remainder in pork and Australia means the consolidated margin varies far less than any single division. Layered on that is the sanitary access advantage — plant approvals across many destinations let volume be redirected when a market closes — and the Brazilian branded business, which earns roughly double the beef margin on a price set by brand rather than by commodity. A mid-cycle multiple applied to a portfolio of offsetting spreads is a different, and better, proposition than a trough multiple applied to beef.',
        requires: [
          'Species spreads remaining imperfectly correlated, so poultry and pork strength offsets beef weakness',
          'Plant-level sanitary approvals across destinations remaining intact',
          'The branded and prepared-foods share of revenue holding or growing',
        ],
        breaks: [
          'All species compressing simultaneously, which happens when grain and cattle both rise — the one scenario the diversification does not cover',
          'A country-level sanitary or political event removing an origin\'s export access wholesale',
          'Branded and prepared foods declining as a share of revenue, which would leave the group more exposed to the raw spread',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'The thesis is that the segment margins are negatively correlated. A single consolidated EBITDA margin path cannot express it — model each species division with its own margin and its own cycle.' },
          { assumption: 'EBITDA margin path', note: 'The blueprint path falls to 5% and recovers to 9%. That is a spread cycle assumption; state which species is driving the trough and which the recovery.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'jbss3-dual-class-and-record',
        title: 'The reorganisation gave public shareholders one vote against ten, on top of a controller with a record',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Before the reorganisation, this was a Brazilian listed company with a single class of voting ordinary shares, where a public holder\'s vote counted the same as the controller\'s. After it, the group is a Netherlands holding company whose publicly traded Class A shares carry one vote and whose unlisted Class B shares carry ten — so the controlling family\'s voting power now substantially exceeds its economic stake, permanently and by design. The stated benefit was access to a deeper capital market and a lower cost of capital. The cost is a governance right that has been given up, and it lands on a controller with a documented history of investigations, leniency agreements and penalties in Brazil. That history is precisely why the structure matters more here than it would elsewhere: the protections a minority holder retains are disclosure, audit committee independence and Dutch related-party rules, none of which is a vote. This belongs in the cost of equity as an explicit, permanent premium — not as a temporary discount that good results will remove.',
        requires: [
          'The dual-class structure remaining in place with Class B carrying ten votes and remaining unlisted',
          'The controlling family retaining the Class B block',
        ],
        breaks: [
          'Collapse of the dual-class structure into a single class, restoring proportional voting',
          'A sunset provision or conversion event materially reducing Class B voting power',
          'A sustained period in which the valuation discount closes despite the structure, which would indicate the market has stopped charging for it',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'A ten-to-one voting structure plus a documented compliance history justifies an explicit governance premium. Carry it as a stated number rather than inside beta, and note it does not decay with good results.' },
          { assumption: 'Shares outstanding and share class', note: 'The blueprint carries a single Brazilian share class. Value per share requires the Class A and Class B split and the depositary receipt ratio; state which the projection is using.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'jbss3-spread-not-price',
        title: 'Revenue is protein prices and profit is the spread, so the two must be modelled separately',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'A recent quarter delivered revenue of roughly $23.9 billion against an expected $23.0 billion and earnings per share of $0.20 against an expected $0.31. Both numbers are informative and they point in opposite directions, which is the defining feature of this business: volume and revenue are reasonably forecastable because slaughter capacity and protein demand are stable, while margin is a spread between an input price the company does not set and an output price it only partly sets. The modelling consequence is concrete. A revenue build-up from tonnage and price per tonne is the right structure, but the margin cannot be a function of revenue — it has to be driven by the cattle and grain spread in each geography, which is why the blueprint\'s margin path moves from 11% to 5% and back to 9% while volume growth stays near 2.5%. Any projection that ties margin to revenue growth will produce the wrong answer at both the top and the bottom of the cycle, and will read a revenue beat as good news when it can accompany an earnings miss.',
        requires: [
          'Segment disclosure by species and geography continuing at current granularity',
          'Cattle, grain and protein price series remaining the primary determinants of divisional margin',
        ],
        breaks: [
          'Branded and prepared foods growing large enough that brand pricing rather than the commodity spread sets consolidated margin',
          'Vertical integration into animal production at a scale that internalises the spread',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and price per tonne', note: 'Tonnage and price per tonne are the right drivers for revenue, and they are close to independent of the margin. Keep them separate from the margin path rather than deriving one from the other.' },
          { assumption: 'Gross margin', note: 'Gross margin of about 15% is a spread outcome, not a pricing decision. Drive it from a cattle and grain assumption per division, and run the valuation at a trough spread as well as mid-cycle.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'MarketScreener — JBS N.V. company and listing profile', url: 'https://www.marketscreener.com/quote/stock/JBS-N-V-182654041/' },
      { label: 'SEC EDGAR — JBS N.V. press release (results)', url: 'https://www.sec.gov/Archives/edgar/data/1791942/000121390025057746/ea024695802ex99-1_jbsnv.htm' },
      { label: 'Genial Investimentos — JBS: resultado e a dupla listagem', url: 'https://analisa.genialinvestimentos.com.br/acoes/jbs/jbs-jbss3-i-resultado-1t25-sem-sal-mas-de-olho-na-dupla-listagem/' },
      { label: 'TradingView — JBS (NYSE) listing', url: 'https://br.tradingview.com/symbols/NYSE-JBS/' },
    ],
  },

  {
    ticker: 'ASAI3',
    sector: 'Consumer Staples',
    scope: 'BRAZIL',
    headline:
      'A cash-and-carry chain that stopped expanding and started deleveraging: net debt to EBITDA fell from 3.17 times to 2.37 times in a year, and recurring net profit rose 93.6% to R$344 million in the June 2026 quarter — on an EBITDA margin of 5.6%.',
    howItEarns: [
      {
        heading: 'Wholesale prices, retail customers, minimal service',
        body:
          'Large-format stores selling groceries in bulk at low margin to small businesses — bars, restaurants, corner shops — and to households buying in volume. There is no service layer, little in-store labour and no delivery promise, which is what allows a gross margin of 16.7% to support a viable business where a supermarket needs far more.',
        basis: 'REPORTED',
      },
      {
        heading: 'The margin is thin by design, so the leverage is the whole story',
        body:
          'Adjusted EBITDA margin was 5.6% in the June 2026 quarter, with gross margin up 0.3 points to 16.7% on commercial discipline but operating deleverage offsetting the gain. At that margin, net debt of the scale this company carries makes the financial expense line as important as the operating one — which is why deleveraging from 3.17 times to 2.37 times nearly doubled recurring profit.',
        basis: 'REPORTED',
      },
      {
        heading: 'The small business customer is a different demand curve',
        body:
          'A restaurant buying supplies is not making a discretionary decision; it is buying inputs. That makes the format more defensive than food retail generally, and it also ties the company to the health of Brazilian small business, which is funded at corporate credit rates above 25% a year.',
        basis: 'INTERPRETATION',
      },
    ],
    control: {
      form:
        'No single controlling shareholder following the separation from its former French retail parent. Ownership is dispersed among local and foreign institutions with a large free float, which makes this one of the few large Brazilian retailers whose strategy is set by a board rather than by a controller.',
      voting: 'Single class of common shares on Novo Mercado, one share one vote.',
      relatedPartyExposure: [
        'Transitional agreements and store conversion arrangements inherited from the former parent group',
        'Property leases on converted hypermarket sites, where the terms were set during the separation rather than negotiated at arm\'s length afterwards',
      ],
      minorityProtections: [
        'Novo Mercado listing: one share one vote, minimum free float, majority-independent board requirements',
        'No controlling block, so a change of control requires an offer to all shareholders on equal terms',
        'Related-party disclosure covering the legacy arrangements with the former parent',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Deleveraging was chosen over growth, and disclosed as such',
        body:
          'The company has reported leverage each quarter as the headline metric — 2.52 times in March 2026, the lowest since late 2021, then 2.37 times in June against 3.17 times a year earlier — alongside cash generation and market share. Making the balance sheet the reported priority is a credible way to signal that the expansion phase is over.',
        basis: 'REPORTED',
      },
      {
        heading: 'Dispersed ownership after a controlled history',
        body:
          'The company spent its formative years inside a controlled group and now has no controller. That removes the related-party risk that dominated the earlier structure and introduces the other one: a dispersed register with thin margins is a company where a strategic mistake is corrected slowly.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Store footprint in catchments that support only one such format',
        mechanism:
          'A cash-and-carry store needs a large site, cheap land and a catchment of small businesses, and once one operates there a second cannot earn an adequate return on the same demand. Occupying the viable sites first is therefore a durable exclusion rather than a temporary lead.',
        evidence: 'Market share gains reported alongside the deleveraging, in a period when revenue was pressured by the macroeconomic environment.',
        erodedBy: 'Competing formats converting existing hypermarket sites into cash-and-carry, which supplies new capacity into the same catchments without needing new land.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Cost per unit sold that a serviced format cannot match',
        mechanism:
          'Selling from a pallet in a warehouse with minimal staff, no delivery and bulk pack sizes produces an operating cost per unit far below a supermarket\'s. That is what makes a 16.7% gross margin sufficient, and a competitor cannot match the price without first removing the service its own customers expect.',
        evidence: 'Gross margin of 16.7% supporting a 5.6% EBITDA margin — a cost structure that a full-service grocer operating at twice the gross margin does not achieve.',
        erodedBy: 'Wage and energy inflation raising the fixed cost of the warehouse faster than volume grows, which is the operating deleverage visible in the June 2026 quarter.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'An aggressive debt-funded store conversion programme, followed by a deliberate stop and a two-year deleveraging. The first phase built the footprint and nearly broke the balance sheet; the second is repairing it, and the sequence is the whole capital allocation record.',
      good: [
        'Halting the expansion programme and prioritising cash generation, which took leverage from 3.17 times to 2.37 times in a year and nearly doubled recurring net profit to R$344 million',
        'Holding commercial discipline through a weak macroeconomic period, which raised gross margin 0.3 points to 16.7% rather than buying volume with price',
        'Controlling selling, general and administrative expenses tightly while revenue was pressured, which is what kept EBITDA margin from falling further under operating deleverage',
      ],
      bad: [
        'The debt-funded conversion of hypermarket sites left net debt of around R$12 billion against a business earning a 5.6% EBITDA margin, and leverage above 3 times in a country where corporate credit costs more than 14% — the exact working-capital-and-leverage sequence the sector dossier names as the Brazilian retail failure mode',
        'Adjusted net profit in the March 2026 quarter was R$86 million, down 47% year on year, because financial expense on that debt consumed most of a thin operating margin — the cost of the previous expansion arriving in the income statement',
        'Converting stores faster than the catchments matured meant new units competed with existing ones and with a competitor converting sites on the same logic, so a share gain was partly bought with capital rather than earned with cost',
        'Expansion and deleveraging cannot run at the same time at this margin, so the company has had to stop growing to fix the balance sheet — an admission that the original programme was sized against the wrong cost of debt',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The cash-and-carry driver the dossier names, at its most exposed',
        body:
          'The Brazilian Consumer Staples dossier identifies cash-and-carry format share and its small-business customer as a core driver with a mixed sign. This company is the pure expression: it benefits when households trade down into bulk buying and it suffers when its small-business customers cannot fund inventory at above 25% a year.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Food inflation is the volume-price trade in its simplest form',
        body:
          'The dossier frames sector growth as a trade between food inflation and volume. At a 16.7% gross margin the company needs some inflation to cover fixed cost growth and cannot tolerate the volume loss that too much of it causes. Revenue pressured by the macro environment while gross margin rose 0.3 points is that trade resolving in favour of margin.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Operating deleverage at a 5.6% margin',
        body:
          'Fixed warehouse cost, wages and energy do not fall with volume. When revenue growth slows below cost inflation, the EBITDA margin compresses immediately — which is exactly what offset the gross margin gain in the June 2026 quarter. There is very little room between 5.6% and a level at which financial expense consumes operating profit.',
        basis: 'REPORTED',
      },
      {
        heading: 'Small-business customers funded above 25% a year',
        body:
          'The core customer is a bar, restaurant or corner shop financing its own inventory at Brazilian corporate credit rates. Their working capital constraint becomes this company\'s volume constraint, and it does not show up in consumer confidence data.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Competitor conversions supplying new capacity into the same catchments',
        body:
          'The format\'s advantage rests on a catchment supporting only one such store. Competitors converting their own existing large-format sites add capacity without buying land, which is the cheapest possible way to attack this moat.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'asai3-deleveraging-is-the-earnings',
        title: 'At a 5.6% margin the balance sheet is the income statement, and the deleveraging is working',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Leverage fell from 3.17 times net debt to EBITDA a year earlier to 2.52 times in March 2026 — the lowest since late 2021 — and then to 2.37 times in June, and recurring net profit rose 93.6% to R$344 million. Operating performance barely changed: gross margin improved 0.3 points to 16.7% and EBITDA margin was 5.6%. Almost the entire earnings improvement came from paying down debt in a country where that debt costs well over 14%. That is the correct reading of a thin-margin, capital-intensive retailer: each turn of leverage removed is worth more to earnings than a point of gross margin, and the process is largely mechanical once expansion stops. The company has chosen to report leverage as its headline metric, which is the right signal, and the remaining path from 2.37 times toward the low twos is the most predictable earnings growth available anywhere in this part of the universe — it requires no share gain, no inflation and no consumer recovery.',
        requires: [
          'Free cash generation continuing at a level that reduces net debt each quarter',
          'The expansion programme remaining paused or minimal',
          'Gross margin holding near 16.7% so operating cash generation is not eroded while debt is repaid',
        ],
        breaks: [
          'Leverage stabilising or rising, which would mean cash generation is no longer covering the programme',
          'A resumption of debt-funded store conversions, which would restart the sequence that created the problem',
          'EBITDA margin falling below the mid-fives, at which point financial expense reclaims the operating profit',
        ],
        modelLink: [
          { assumption: 'Net debt to EBITDA', note: 'The deleveraging path is the thesis. Model the debt schedule explicitly from 2.37 times and let the interest saving flow to net income rather than assuming a flat financial expense.' },
          { assumption: 'Capex as a share of revenue', note: 'Deleveraging at this margin requires capital expenditure to stay near maintenance levels. A projection with an expansion capex assumption has assumed the thesis away.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'asai3-margin-has-no-room',
        title: 'A 5.6% EBITDA margin leaves no absorption capacity for anything',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Gross margin rose 0.3 points to 16.7% on genuine commercial discipline, and the EBITDA margin still came in at 5.6% because operating deleverage consumed the gain. That is the structural problem: warehouse rent, wages and energy grow with inflation while volume growth depends on a small-business customer funding inventory above 25% a year and a household base with record indebtedness. The March 2026 quarter showed what the arithmetic does at the bottom — adjusted net profit of R$86 million, down 47%, because financial expense on roughly R$12 billion of net debt absorbed most of a thin operating margin. The deleveraging is real, but it is repairing damage rather than creating capacity, and it works only while revenue grows at least in line with cost inflation. If it does not, operating deleverage compresses a 5.6% margin faster than debt repayment can add back, and a competitor converting existing sites into the same catchments is the most likely reason it would not.',
        requires: [
          'Revenue growth remaining at or below cost inflation, so operating deleverage persists',
          'Wage and energy costs continuing to rise in the fixed cost base',
          'Competitor site conversions continuing to supply capacity into existing catchments',
        ],
        breaks: [
          'EBITDA margin expanding above 6% with volume growth, which would show operating leverage rather than deleverage',
          'Same-store sales growing clearly above food inflation, indicating share gain rather than price',
          'Small-business customer credit conditions easing materially with Selic',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'This thesis lives here. Test the valuation at a margin of 5.5% or below as well as at a recovery, because the distance between the two outcomes is most of the equity value at this leverage.' },
          { assumption: 'SG&A as a share of revenue', note: 'Operating deleverage is an SG&A-to-revenue phenomenon. Model SG&A growing with cost inflation rather than as a fixed percentage of revenue, or the risk cannot appear.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'asai3-no-controller-thin-margin',
        title: 'No controlling shareholder, a converted footprint and a thin margin — a structure with no shock absorber',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'Three structural features define what this company can and cannot do. It has no controlling shareholder, which removes the related-party exposure that came with its former parent and also removes anyone with a large economic stake watching daily. Its footprint was largely created by converting hypermarket sites, so the store estate and its leases were assembled during a separation rather than selected store by store at arm\'s length. And it operates at a 5.6% EBITDA margin, which means neither the balance sheet nor the income statement has slack. Taken together, these say that strategy here is set by a board without a controller, executed on an inherited estate, with no capacity to absorb a mistake from either equity or margin. That is not a bull or bear conclusion — it is the reason the leverage metric deserves to be the headline, and the reason any model of this company should test the trough rather than the trend.',
        requires: [
          'Ownership remaining dispersed with no controlling block emerging',
          'The inherited store estate and lease terms remaining as structured in the separation',
        ],
        breaks: [
          'A controlling block forming, which would change both the governance profile and the strategic horizon',
          'EBITDA margin rising into the high single digits, which would restore genuine operating slack',
        ],
        modelLink: [
          { assumption: 'Lease liabilities and rent expense', note: 'The estate came from conversions, so lease terms are inherited rather than market-negotiated. Carry rent and lease liabilities explicitly instead of inside a blended SG&A line.' },
          { assumption: 'Cost of equity', note: 'A dispersed register with a tender-offer trigger lowers the governance premium relative to a controlled peer; a thin margin at moderate leverage raises the business risk premium. State both rather than netting them silently.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'ADVFN — Assaí registra lucro de R$344 milhões no 2T26 e reduz alavancagem', url: 'https://br.advfn.com/jornal/2026/08/assai-registra-lucro-de-r-344-milhoes-no-2t26-alta-de-93-6-e-reduz-alavancagem' },
      { label: 'Safra — Assaí: lucro cai e dívida recua (1T26)', url: 'https://oespecialista.safra.com.br/analise/assai-asai3-resultados-1t26/' },
      { label: 'Assaí — Release: forte geração de caixa, redução da alavancagem e ganho de market share', url: 'https://www.assai.com.br/imprensa/assai-encerra-1o-tri-com-forte-geracao-de-caixa-reducao-da-alavancagem-e-ganho-de-market' },
      { label: 'XP Investimentos — Assaí 2T26: resultados em linha', url: 'https://conteudos.xpi.com.br/acoes/relatorios/assai-asai3-2t-com-resultados-em-linha/' },
    ],
  },

  {
    ticker: 'SLCE3',
    sector: 'Consumer Staples',
    scope: 'BRAZIL',
    headline:
      'A farming operation and a land portfolio in one company: 830,300 hectares planted for 2025/26 with record soybean productivity of 4,146 kilos a hectare, and a land bank independently appraised at R$13.4 billion after a 7.1% revaluation.',
    howItEarns: [
      {
        heading: 'Two returns from the same asset',
        body:
          'Growing soybeans, cotton and corn on owned and leased land. The operating return is yield multiplied by price minus cost per hectare; the second return is the appreciation of the owned land itself, independently appraised at R$13.396 billion after rising 7.1%, at an average of R$58,960 per agricultural hectare. Those are different assets with different drivers reported inside one company.',
        basis: 'REPORTED',
      },
      {
        heading: 'Scale in area, with the crop mix reset every season',
        body:
          'Planted area reached 830,300 hectares for 2025/26, up 12.8% on the previous cycle: soybeans at 424,600 hectares, or 51.1% of the total, cotton rising 7.0% to 191,333 hectares and second-crop corn up 26.9% to 155,707 hectares. The mix is a capital allocation decision made annually against expected prices and rotation agronomy.',
        basis: 'REPORTED',
      },
      {
        heading: 'Productivity is the only lever the company controls',
        body:
          'Prices are set in Chicago and the currency is set elsewhere. What management decides is yield per hectare — soybeans at 4,146 kilos, 4.7% above the prior season, first-crop cotton at 2,079 kilos against 1,841, up 12.9%. In a price-taking business, productivity gains are the entire operating alpha.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'Controlled by the founding family through a holding company, with professional management running the farms. The controller\'s interest is aligned with the land value as well as with the crop, which is worth noting because the two can point in different directions.',
      voting: 'Single class of common shares on Novo Mercado, one share one vote.',
      relatedPartyExposure: [
        'Land held in joint ventures and partnership structures with third parties, where the allocation of appreciation and operating return between partners requires disclosure to be read',
        'Leased area alongside owned area, so part of the operation is conducted on land whose appreciation accrues to someone else',
      ],
      minorityProtections: [
        'Novo Mercado listing: one share one vote, minimum free float, majority-independent board requirements',
        'Tag-along at 100% of the price paid to the controlling block on a change of control',
        'Independent third-party appraisal of the land portfolio, published, which is what makes the second return checkable rather than asserted',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The land appraisal is independent and published, which is the key disclosure',
        body:
          'The land portfolio is valued by an external firm and the result is published — R$13.396 billion, up 7.1%, at R$58,960 per agricultural hectare on average. A self-assessed land value would be unusable in a valuation; a published independent appraisal makes the asset half of this company analysable rather than a matter of faith.',
        basis: 'REPORTED',
      },
      {
        heading: 'Guidance is issued by crop and by yield, before the season',
        body:
          'The company publishes planted area and expected productivity by crop ahead of the harvest, including a projected 26.9% expansion in second-crop corn and a slight 0.7% decline in second-crop cotton yield. Publishing a yield forecast that can be wrong in either direction is an unusually falsifiable disclosure for a commodity producer.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Owned land in established production regions',
        mechanism:
          'Cleared, titled, productive farmland with logistics access is a finite asset whose supply cannot be increased by capital in the short run. Owning it rather than leasing it captures both the crop return and the appreciation, and it removes the annual rent negotiation that constrains a leasing operator\'s cost base.',
        evidence: 'An independently appraised portfolio of R$13.396 billion, up 7.1%, at an average R$58,960 per agricultural hectare.',
        erodedBy: 'A sustained fall in grain prices, which reduces farm income and with it the land value — the two returns are correlated, so the land is not a hedge against the crop.',
        basis: 'REPORTED',
      },
      {
        label: 'Agronomic scale: rotation, timing and machinery utilisation',
        mechanism:
          'Operating hundreds of thousands of hectares allows a rotation that maintains soil productivity, spreads planting and harvest windows to reduce weather risk, and keeps expensive machinery utilised across a long season. A smaller operator faces the same input prices with worse machine utilisation and a narrower weather window.',
        evidence: 'Record soybean productivity of 4,146 kilos per hectare, 4.7% above the prior season, and first-crop cotton up 12.9% to 2,079 kilos.',
        erodedBy: 'Weather events that affect a whole region at once, against which geographic spread inside Brazil provides only partial protection.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Land acquired and developed over decades, area expanded when returns justified it, and irrigation and productivity investment funded from operating cash. The capital allocation is genuinely long-horizon, and the recurring question is whether area growth or yield growth is the better use of the next real.',
      good: [
        'Expanding planted area 12.8% to 830,300 hectares while simultaneously raising soybean yield 4.7% to a record 4,146 kilos per hectare — growth that did not come at the expense of productivity',
        'Owning rather than only leasing land, which has captured a 7.1% appreciation on a R$13.4 billion portfolio in addition to the crop return',
        'Investing in irrigation and in second-crop intensification, including a 26.9% expansion in second-crop corn, which raises output per hectare owned rather than requiring new land',
      ],
      bad: [
        'Reported revenue fell in a period when productivity rose almost 5%, because prices and currency moved against the company — a reminder that the operating lever management controls is the smaller of the two forces acting on the result',
        'Expanding area 12.8% in one cycle into a soft price environment increases exposure to the input cost and the price at the same time, and cannot be reversed quickly once the seed is in the ground',
        'Second-crop cotton yield is projected to decline 0.7% while area expands, so part of the growth is being taken on the less productive rotation',
        'The land appreciation that flows through the accounts is not distributable cash: it improves the balance sheet and the appraisal while the dividend still has to come from a crop margin that prices can halve',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Grain costs and the currency, from the producer\'s side',
        body:
          'The Brazilian Consumer Staples dossier pairs grain costs with the currency as a sector driver. Every other staples company in this universe is a grain buyer; this one is the seller. A weaker real and higher grain prices, which compress a protein processor\'s spread, raise this company\'s revenue directly — which makes it the natural hedge within the sector rather than a correlated holding.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Farm income sets the price of the asset as well as the crop',
        body:
          'Land value in production regions follows expected farm income, which is why the portfolio appreciated 7.1% alongside record productivity. The corollary is that the two returns are correlated: a sustained price decline reduces the crop margin and the appraisal together, so the land is not the diversifier it appears to be.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Prices and currency dominate the result',
        body:
          'Revenue fell in a period when yield rose nearly 5%, because soybean and cotton prices and the exchange rate are set outside the company. No amount of agronomic excellence offsets a price cycle, and a model that gives productivity gains the same weight as price will be wrong most years.',
        basis: 'REPORTED',
      },
      {
        heading: 'Weather, concentrated in a season',
        body:
          'A single adverse rainfall pattern in the planting or harvest window can remove a large share of one crop\'s yield across a whole region. Geographic spread within Brazil helps and does not eliminate it, and the loss is not recoverable within the year.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The land value is an appraisal, not a price',
        body:
          'R$13.396 billion is an independent valuation of an illiquid asset. Selling a material share of it would take time and would likely clear below appraisal, so the land supports the balance sheet and the borrowing capacity more reliably than it supports a realisable value per share.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'slce3-two-assets-one-ticker',
        title: 'A farm and a land bank should be valued separately, because only one of them produces cash',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'This company holds two economically distinct assets. The first is a farming operation: 830,300 hectares planted for 2025/26 at record soybean productivity of 4,146 kilos per hectare, generating a crop margin that prices and currency largely determine. The second is a land portfolio independently appraised at R$13.396 billion, up 7.1%, at R$58,960 per agricultural hectare. They have different return drivers, different liquidity and different risk, and a single discounted cash flow on the farming operation values one of them while ignoring the other — while a sum that simply adds the appraisal to a going-concern valuation double-counts, because the appraisal already reflects expected farm income. The correct treatment is explicit: value the operating business on its crop margin, carry the owned land at appraisal less a liquidity discount, and state that the two are correlated rather than additive. A model that does not choose one of those framings is producing a number without a definition.',
        requires: [
          'The independent land appraisal continuing to be published and prepared externally',
          'Owned and leased area remaining separately disclosed, since appreciation accrues only on the owned part',
        ],
        breaks: [
          'The land portfolio being sold or spun into a separate vehicle, which would resolve the ambiguity by separating the assets in fact',
          'A shift to predominantly leased area, which would remove the second return and make a pure operating valuation correct',
        ],
        modelLink: [
          { assumption: 'PP&E and land on the balance sheet', note: 'Owned land is carried at cost or appraisal depending on policy, and the difference is material at R$13.4 billion. State which the projection uses and whether revaluation flows through income.' },
          { assumption: 'Terminal value', note: 'A going-concern terminal value on the crop margin already capitalises expected farm income, which is what the land appraisal reflects. Adding the appraisal on top double-counts; say explicitly which approach the valuation takes.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'slce3-productivity-alpha',
        title: 'Yield is the only lever the company controls, and it is being pulled',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'In a price-taking business the entire operating alpha is output per hectare, and the disclosed record is strong: soybean productivity at 4,146 kilos per hectare, 4.7% above the prior season and a company record; first-crop cotton at 2,079 kilos against 1,841, up 12.9%; second-crop corn area expanded 26.9% to intensify output on land already owned. Planted area grew 12.8% to 830,300 hectares in the same cycle, so the yield gain was not achieved by farming only the best fields. That combination — more area and higher yield at once — is what agronomic scale is supposed to deliver and what a smaller operator cannot: rotation that preserves soil, spread planting windows that dilute weather risk, and machinery utilised across a longer season. Prices will do what prices do; a producer compounding output per hectare at these rates lowers its cost per tonne every year, which is the only durable position available to a commodity grower.',
        requires: [
          'Yield gains persisting rather than reflecting one favourable season',
          'Cost per hectare rising more slowly than output per hectare, so cost per tonne falls',
          'Irrigation and intensification investment continuing to earn a return on owned land',
        ],
        breaks: [
          'Soybean yield falling back toward the prior-season level, indicating the record was weather rather than agronomy',
          'Cost per tonne rising despite yield gains, which would mean input inflation is consuming the productivity',
          'Second-crop yields declining as area expands, a sign the growth is moving onto marginal rotation',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and price', note: 'Volume is hectares multiplied by yield per hectare, and both are disclosed by crop. Build revenue from those two rather than from a growth rate, which is what makes the thesis testable.' },
          { assumption: 'Cost per hectare in the cost build-up', note: 'The thesis is falling cost per tonne. Model cost per hectare and divide by yield; a cost-as-percentage-of-revenue assumption hides the entire argument behind the price.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'slce3-price-dominates',
        title: 'Revenue fell while productivity rose, which is the honest summary of this business',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The company delivered close to a 5% productivity increase and reported lower revenue, because soybean and cotton prices and the exchange rate are set in markets it does not participate in as a price-setter. That is the structural truth a productivity narrative can obscure: the controllable lever is real but it is second-order against the uncontrollable ones. Meanwhile area was expanded 12.8% into that price environment, which raises exposure to both input cost and output price and cannot be unwound once planted, and second-crop cotton yield is projected to decline 0.7% as its area grows — so part of the expansion is onto the weaker rotation. The land appreciation of 7.1% does not offset any of this in cash terms: it improves the appraisal and the borrowing capacity while dividends still have to come from a crop margin, and it is correlated with farm income anyway, so it falls in the same scenario. A valuation built on yield improvement without a price scenario is describing the smaller half of the company.',
        requires: [
          'Soybean, cotton and corn prices remaining soft in dollar terms',
          'The currency not weakening enough to offset dollar price declines',
          'Expanded area carrying its full share of input cost regardless of the price received',
        ],
        breaks: [
          'A sustained rise in grain and fibre prices, which would make the expanded area highly profitable',
          'A materially weaker real, which raises revenue per tonne in local currency without changing yields',
          'Cost per tonne falling fast enough that the margin expands at unchanged prices',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: price growth and currency', note: 'Crop prices are dollar-denominated and the reporting currency is not. Model price and the exchange rate as separate explicit assumptions and run the valuation across a price range, not at a single point.' },
          { assumption: 'Working capital days', note: 'Area expansion is funded with inventory and receivables through the season at Brazilian rates. Inventory days multiplied by the funding cost is where a soft-price expansion actually hurts.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Money Times — SLC Agrícola: terras valorizam 7,1% para R$13,396 bilhões', url: 'https://www.moneytimes.com.br/slc-agricola-slce3-terras-valorizam-71-para-r-13396-bilhoes-produtividade-do-milho-e-algodao-2a-safra-deve-crescer-pads/' },
      { label: 'Money Times — SLC Agrícola divulga guidance da safra 2025/2026', url: 'https://www.moneytimes.com.br/slc-agricola-slce3-divulga-guidance-da-safra-2025-2026-com-forte-expansao-para-soja-milho-e-algodao-pads/' },
      { label: 'Visno Invest — SLC Agrícola anuncia área plantada de 830 mil ha para 2025/26', url: 'https://visnoinvest.com.br/news/13285/slc-agricola-slce3-anuncia-area-plantada-de-830-mil-ha-para-2025-26' },
      { label: 'Canal Rural — SLC registra aumento de quase 5% na produtividade, mas tem queda no faturamento', url: 'https://www.canalrural.com.br/agricultura/slc-registra-aumento-de-quase-5-na-produtividade-mas-tem-queda-no-faturamento' },
      { label: 'AgFeed — Com produtividade recorde, SLC impulsiona lucro e projeta 2026/2027 ainda melhor', url: 'https://agfeed.com.br/negocios/com-produtividade-recorde-slc-impulsiona-lucro-e-projeta-2026-2027-ainda-melhor/' },
    ],
  },
  {
    ticker: 'PG',
    sector: 'Consumer Staples',
    scope: 'UNITED_STATES',
    headline:
      'Organic sales up 3% in the March 2026 quarter with volume contributing 2 points and price only 1 — the first time in years the growth has been real rather than priced — while a restructuring removes up to 7,000 overhead roles and tariffs cost about $400 million after tax.',
    howItEarns: [
      {
        heading: 'Category leadership in daily-use products, defended with advertising',
        body:
          'Household and personal care products sold through retailers worldwide, concentrated in categories where the company holds the leading or second brand. The product is bought habitually and cheaply, so the purchase decision is made by memory rather than by comparison — which is what the advertising budget is actually buying.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Growth is now volume rather than price, which is the important change',
        body:
          'Organic sales rose 3% in the third fiscal quarter of 2026 with a 2% lift in volume and 1% from pricing, against 2% organic growth in the first quarter. After a multi-year period in which staples growth was almost entirely price, volume-led growth is a different and better signal: it means consumers are buying the products rather than paying more for the same ones.',
        basis: 'REPORTED',
      },
      {
        heading: 'The retailer is the customer and the competitor at once',
        body:
          'Products reach the consumer through a small number of very large retailers who also sell private label in the same aisle. Shelf position, promotional support and the private-label spread are negotiated with a buyer who is simultaneously a rival, which is the defining commercial relationship in the sector.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions, index funds and a very large retail base built over decades of dividend reinvestment. Management is professional and internally developed, with no founder or family block.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Concentration of sales through a small number of very large retail customers who also compete through private label',
        'A retirement plan that has historically been a significant holder of the company\'s own shares',
      ],
      minorityProtections: [
        'Single voting class with a fully dispersed register and annual director elections',
        'SEC disclosure separating organic growth into volume, price and mix, which is what makes the quality of growth checkable rather than a management characterisation',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The disclosure separates price from volume, and that is the whole argument',
        body:
          'Reporting organic growth as 3% with 2 points of volume and 1 of price is a more demanding disclosure than a single organic number. It lets an outsider distinguish a brand exercising pricing power from one harvesting it — the exact test the sector dossier says separates the two — without relying on management commentary.',
        basis: 'REPORTED',
      },
      {
        heading: 'A restructuring announced with a cost, a headcount and a deadline',
        body:
          'The portfolio and productivity plan announced in June 2025 carries approximately $1.5 to $2.0 billion of before-tax restructuring costs over two years and a reduction of up to 7,000 non-manufacturing overhead roles by the end of fiscal 2027, alongside brand and market exits. Publishing the cost and the deadline together is what makes a restructuring measurable rather than perpetual.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Brand memory in habitual, low-ticket purchases',
        mechanism:
          'A product bought weekly for a few dollars does not justify comparison shopping, so the purchase is made from memory and the brand that occupies that memory wins by default. Decades of advertising built the position, and the annual spend required to defend it is a fixed cost only a category leader can carry per unit.',
        evidence: 'Volume contributing 2 points of a 3% organic increase — consumers buying more units, not simply paying more for the same ones.',
        erodedBy: 'Retailer private label narrowing the quality gap while holding a structural price advantage, which turns a memory purchase into a comparison at the shelf.',
        basis: 'REPORTED',
      },
      {
        label: 'Scale in research, manufacturing and media buying',
        mechanism:
          'Formulation research, plant utilisation and national media are all fixed costs spread across category-leading volume, so cost per unit and cost per impression are lower than any challenger\'s at the same quality. That gap funds the advertising that maintains the brand memory, which is what makes the advantage self-reinforcing.',
        evidence: 'Ability to absorb roughly $400 million of after-tax tariff cost in fiscal 2026 while still growing organic sales and maintaining guidance.',
        erodedBy: 'Digitally native brands reaching consumers without national media, which removes the scale advantage in the one cost line that mattered most.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'One of the most consistent dividend and buyback records among large listed companies, funded by stable cash generation, with periodic portfolio pruning. The discipline is genuine; the criticism is that the portfolio has been narrowed repeatedly without the growth rate changing much.',
      good: [
        'Exiting dozens of smaller brands in earlier programmes to concentrate on categories where the company holds the leading position, which raised margin and simplified the manufacturing footprint',
        'Delivering volume-led growth — 2 points of volume in a 3% organic increase — after a period when the whole sector grew on price alone',
        'Announcing the current restructuring with a specific cost range of $1.5 to $2.0 billion, a headcount reduction of up to 7,000 and a fiscal 2027 deadline, rather than an open-ended efficiency programme',
      ],
      bad: [
        'The company is again removing brands and markets and cutting up to 7,000 overhead roles, which is the third such programme in roughly a decade — repeated restructuring in a stable-demand business suggests the cost base regrows between programmes rather than that each one solved the problem',
        'Roughly $1.5 to $2.0 billion of before-tax restructuring cost is real cash spent to reach a structure the company has twice been at before',
        'Tariffs are costing about $400 million after tax in fiscal 2026 and contributed 50 basis points of gross margin headwind in the third quarter, and the sourcing footprint that creates that exposure was built when trade policy was assumed stable',
        'Very large sustained buybacks at consistently high multiples mean capital is returned at a price the company itself would not describe as cheap, which is defensible for a stable business and is still the most expensive way to return cash',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'On the right side of the dossier\'s volume-versus-price test',
        body:
          'The global Consumer Staples dossier makes the split between volume and price in organic growth its first driver, because a company growing on price alone is consuming brand equity. Here volume contributed 2 of 3 points in the March 2026 quarter, which places this company on the favourable side of the sector\'s central diagnostic.',
        basis: 'REPORTED',
      },
      {
        heading: 'Private label is the structural pressure, and it is permanent',
        body:
          'The dossier names private label as both competitor and customer. That is the enduring tension here: the retailers who provide access to the consumer earn a higher margin on their own products in the same aisle, so shelf negotiations are conducted with a counterparty whose interest is to shrink the branded share.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Private label trading up in quality',
        body:
          'A retailer\'s own brand at a structural discount, with quality close enough that the difference stops being obvious, converts a habit purchase into a price comparison. That is the single mechanism most likely to reduce this company\'s volume permanently rather than cyclically.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Tariffs on a global sourcing footprint',
        body:
          'About $400 million of after-tax cost in fiscal 2026 and 50 basis points of gross margin headwind in a single quarter, arising from a manufacturing and sourcing map optimised for a different trade regime. Reconfiguring it takes years while the cost is in every quarter.',
        basis: 'REPORTED',
      },
      {
        heading: 'Restructuring that has to be repeated',
        body:
          'Removing up to 7,000 overhead roles at a cost of $1.5 to $2.0 billion is the latest in a series. If the cost base regrows, the programme is a recurring charge rather than a step change, and the margin improvement it buys should be treated as temporary in the model.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'pg-volume-led-growth',
        title: 'Volume contributed two of three points, which is the difference between exercising a brand and harvesting it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The global staples dossier states the test plainly: a brand raising price with flat units is exercising power, and one raising price with falling units is harvesting it, and the two look identical in the revenue line for about two years. In the third fiscal quarter of 2026 organic sales rose 3% with volume contributing 2 points and price 1. That is the favourable answer to the sector\'s central question, and it arrives after several years in which staples growth across the industry was almost entirely price. It matters more than the headline number because volume growth means consumers are still choosing these products at the shelf against a private-label alternative that is structurally cheaper — the specific pressure the dossier names as the sector\'s permanent competitor. Layered on it, the restructuring is scoped with a cost, a headcount and a deadline, and the tariff burden of roughly $400 million after tax is being absorbed without a guidance cut.',
        requires: [
          'Volume continuing to contribute more of organic growth than price does',
          'Private label share in the core categories remaining stable rather than advancing',
          'The restructuring delivering the cost reduction within the stated fiscal 2027 timeframe',
        ],
        breaks: [
          'Organic growth reverting to price-only with volume flat or negative, the harvesting signature',
          'Private label gaining share in the leading categories, which would mean the brand memory advantage is narrowing',
          'A further restructuring announced before this one completes, indicating the cost base regrows faster than the programme removes it',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and price growth', note: 'Model volume and price as separate drivers at roughly the disclosed 2-and-1 split. A single organic growth rate cannot express the thesis, which is entirely about the composition.' },
          { assumption: 'EBITDA margin path', note: 'The restructuring should show as a step improvement with a defined cost in the intervening years. Do not fold a $1.5-2.0bn charge into a smooth margin path.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'pg-serial-restructuring',
        title: 'The third overhead reduction in a decade is a recurring charge, not a step change',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The current programme carries $1.5 to $2.0 billion of before-tax cost over two years, removes up to 7,000 non-manufacturing roles by the end of fiscal 2027, and exits brands and markets. Each element is sensible. The difficulty is that the company has been here before: successive programmes over the past decade have pruned brands, simplified the organisation and reduced overhead, and the cost base has required pruning again. In a business with stable demand and category leadership, a cost structure that needs periodic removal is telling you the underlying rate of overhead growth exceeds the underlying rate of revenue growth — which makes the restructuring a recurring charge that a valuation should capitalise rather than a one-off it should add back. Meanwhile tariffs are costing about $400 million after tax and 50 basis points of gross margin in a quarter, from a sourcing footprint built for a trade regime that no longer exists and that will take years to reconfigure. The margin improvement from the programme and the margin erosion from trade policy may simply cancel.',
        requires: [
          'Overhead cost growth continuing to outpace organic revenue growth between programmes',
          'The tariff regime persisting at roughly the current cost',
        ],
        breaks: [
          'Operating margin sustaining above the pre-programme level for several years after fiscal 2027 with no new restructuring announced',
          'Tariff exposure materially reduced through sourcing relocation or policy change',
          'Organic growth accelerating enough that revenue outgrows the cost base without intervention',
        ],
        modelLink: [
          { assumption: 'SG&A as a share of revenue', note: 'If restructuring recurs, SG&A should be modelled as reverting toward its pre-programme ratio rather than holding at the post-programme level. Test both.' },
          { assumption: 'Non-recurring charges', note: 'A charge that appears every few years is not non-recurring. State whether the projection treats the $1.5-2.0bn as an add-back or as a normalised annual cost, because the choice moves the valuation.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'pg-retailer-is-the-competitor',
        title: 'The customer that provides shelf access earns more on the product beside it',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'A small number of very large retailers control access to the consumer, and in every one of these categories they also sell a private-label product at a structural discount and a higher retail margin. That makes the commercial relationship permanently adversarial in a way that is invisible in the financial statements: shelf position, promotional depth and the price gap to private label are negotiated annually with a counterparty whose economic interest is to shrink the branded share. The company\'s defence is brand memory funded by advertising scale, and it works while the quality difference remains obvious enough to justify the gap. For a model the consequence is that gross margin and advertising spend are not independent assumptions — cutting advertising to protect margin narrows the perceived quality gap and invites private label, which is the sector\'s slowest and most permanent form of damage. Any projection that improves margin by reducing brand investment is describing a different company two years out.',
        requires: [
          'Retail concentration persisting, so a few buyers control shelf access',
          'Private label remaining a higher-margin product for those retailers',
        ],
        breaks: [
          'Direct-to-consumer or digitally native channels reaching enough scale to bypass the shelf negotiation',
          'Retail fragmentation reducing individual buyer power',
        ],
        modelLink: [
          { assumption: 'SG&A and advertising as a share of revenue', note: 'Advertising is the maintenance capital of the brand. Link it to the gross margin assumption rather than treating the two as independent levers.' },
          { assumption: 'Gross margin', note: 'Margin is negotiated against a customer who competes in the same aisle. A margin path that rises without a stated mix or cost mechanism is assuming away the counterparty.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'P&G Investor Relations — Fiscal year 2026 third quarter results', url: 'https://www.pginvestor.com/news/news-details/2026/PG-Announces-Fiscal-Year-2026-Third-Quarter-Results/default.aspx' },
      { label: 'P&G Investor Relations — Fiscal year 2026 first quarter results', url: 'https://www.pginvestor.com/news/news-details/2025/PG-Announces-Fiscal-Year-2026-First-Quarter-Results/default.aspx' },
      { label: 'SEC EDGAR — Procter & Gamble Form 10-K FY2026', url: 'https://www.sec.gov/Archives/edgar/data/0000080424/000008042426000103/pg-20260630.htm' },
      { label: 'SEC EDGAR — Procter & Gamble Form 10-Q FY2026 Q3', url: 'https://www.sec.gov/Archives/edgar/data/0000080424/000008042426000060/pg-20260331.htm' },
      { label: 'Quartz — P&G Q3 2026 earnings beat, tariffs weigh', url: 'https://qz.com/procter-gamble-q3-2026-earnings-tariffs-042426' },
    ],
  },

  {
    ticker: 'KO',
    sector: 'Consumer Staples',
    scope: 'UNITED_STATES',
    headline:
      'A concentrate business that has spent a decade selling its bottlers to someone else — second quarter 2026 operating income grew 55%, including the effect of refranchising, on revenue growth of 7%.',
    howItEarns: [
      {
        heading: 'Concentrate, not bottles',
        body:
          'The company sells concentrate and syrup to independent bottlers who add water, package, distribute and sell. The bottler carries the plants, the trucks and the working capital; the company carries the brand and the marketing. That is why the reported margin is a multiple of any beverage manufacturer\'s and why the revenue line is far smaller than the volume implies.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Price, mix and concentrate timing move independently of volume',
        body:
          'In the March 2026 quarter price and mix grew 2% driven mainly by pricing, and concentrate sales ran 5 points ahead of unit case volume largely on six extra days and shipment timing. In June, revenue grew 7% with concentrate sales up 4% and price and mix up 2%, with concentrate sales 1 point behind unit case volume on timing. Concentrate shipments and consumer consumption are related but not the same number, and confusing them is the most common error in reading this company.',
        basis: 'REPORTED',
      },
      {
        heading: 'Owned brands outside carbonated soft drinks are where the growth is',
        body:
          'Dairy, water and other still beverages have grown faster than the core, and some of them are operated closer to a finished-product model rather than a concentrate one. That raises revenue and lowers the blended margin, so the mix shift is visible in both directions.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, with one very large long-term holder whose stake confers influence and no formal control rights.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Bottling partners in which the company holds equity stakes while also being their concentrate supplier, so the transfer price between the two sits inside a related-party relationship',
        'Refranchised operations sold to partners with continuing supply and territory agreements that outlast the sale',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register and annual director elections',
        'SEC disclosure separating concentrate sales from unit case volume and price/mix, which is what allows the timing effects to be identified rather than assumed',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Refranchising makes reported growth harder to read, and the disclosure says so',
        body:
          'Second quarter 2026 operating income grew 55% "including the impact of refranchising bottling operations", and unit case volume in one region grew 1% partly offset by refranchising. Selling lower-margin bottling revenue mechanically raises the margin percentage without any operating improvement, and the company discloses when that is what happened.',
        basis: 'REPORTED',
      },
      {
        heading: 'An operational failure at a subsidiary, disclosed rather than absorbed quietly',
        body:
          'A majority-owned dairy business suspended production at four United States facilities after a ransomware event involving unauthorised third-party access, then resumed majority production. Disclosing an operational interruption of that kind, with its effect on the segment, is the disclosure behaving correctly in a year when the same segment was a growth driver.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'The brand as the reason a bottler exists',
        mechanism:
          'A bottler\'s entire business is the right to produce and distribute these brands in a defined territory, so the bottler invests in plants and trucks that have no alternative use. That asymmetry is what allows the concentrate price to be set by the brand owner rather than negotiated as a commodity input.',
        evidence: 'Operating income growth of 55% in the June 2026 quarter on revenue growth of 7%, with the bottling assets largely on someone else\'s balance sheet.',
        erodedBy: 'Regulatory or antitrust intervention in territory exclusivity, or a decline in category demand severe enough that a bottler\'s assets are worth more repurposed than renewed.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Distribution reach measured in points of sale, not stores',
        mechanism:
          'The product is available almost everywhere a person might be thirsty — a reach built over a century through the bottler network and impossible to replicate by a challenger who would have to fund the cold chain and the route economics before earning the first sale.',
        evidence: 'Unit case volume growth sustained across regions including developing markets, on a distribution footprint no competing beverage brand matches.',
        erodedBy: 'Consumption shifting to categories and channels where the legacy cold-drink route has no advantage, such as at-home delivery of still beverages.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'A decade-long programme of selling bottling operations to partners, redeploying the proceeds into brands and returning cash through a dividend with a very long unbroken record. The strategy has structurally raised the margin and reduced the capital base; the criticism is that it has also made reported growth difficult to interpret.',
      good: [
        'Refranchising bottling operations to partners, which moved the capital-intensive, low-margin half of the system off the balance sheet and left the brand and concentrate economics behind',
        'Building owned positions in dairy, water and other still categories, which added growth in the parts of the beverage market that are expanding rather than defending the part that is not',
        'Raising full-year guidance in the June 2026 quarter after updating it in March, on revenue growth of 7% with concentrate sales up 4% — operating momentum, not only portfolio effects',
      ],
      bad: [
        'Reported operating income growth of 55% in a quarter "including the impact of refranchising" is a number that cannot be compared to a prior year without adjustment, and the pattern has repeated for years — the portfolio programme has made the headline growth rate of this company genuinely hard to read',
        'Selling the finished-product operations in Nigeria in late 2025 removed revenue that then offset growth in the dairy and other owned brands, so the reported segment picture reflects disposals as much as demand',
        'A majority-owned dairy subsidiary had to suspend production at four United States facilities after a ransomware event, an operational control failure at exactly the business that was supposed to be the growth engine',
        'Selling bottling operations raises the margin percentage without improving the economics of the system as a whole, and a decade of doing it means the margin trend flatters the underlying business',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The volume-versus-price test, complicated by concentrate timing',
        body:
          'The global staples dossier makes the split between volume and price its first driver. Here it requires care: price and mix contributed 2 points in both reported quarters, and concentrate sales ran 5 points ahead of unit case volume in one quarter and 1 point behind in the next, on shipment timing and calendar days. The underlying consumer signal is unit case volume; concentrate sales are the company\'s revenue.',
        basis: 'REPORTED',
      },
      {
        heading: 'Weight-loss medication is a category question rather than a company one',
        body:
          'The dossier names GLP-1 medication as a headwind to the composition of the plate. For sugared carbonated drinks the mechanism is direct, and the company\'s defence is a portfolio spanning zero-sugar, water and dairy — which is why the owned still-beverage brands matter more strategically than their current revenue share suggests.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Reported growth obscured by portfolio changes',
        body:
          'Refranchising, disposals and shipment timing each move the reported numbers independently of consumption. The risk is not that the company misleads — it discloses these effects — but that a model built on headline growth rates will extrapolate a portfolio effect as if it were demand.',
        basis: 'REPORTED',
      },
      {
        heading: 'Sugar taxation and regulation of the core category',
        body:
          'Levies on sugared beverages, marketing restrictions and labelling rules are legislated market by market and reduce the volume of the highest-margin part of the portfolio. This is the same class of risk as an excise on alcohol: it cannot be competed away.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Currency, because most of the volume is not American',
        body:
          'A majority of unit case volume is outside the United States, so a dollar strengthening reduces translated revenue and earnings from operations that are performing well locally. Constant-currency disclosure is essential to reading the result.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'ko-concentrate-model',
        title: 'The capital-intensive half of the system belongs to someone else, by design',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'This is not a beverage manufacturer. It sells concentrate to bottlers who own the plants, the trucks and the working capital, and who have invested in assets whose only use is producing these brands in a defined territory. That asymmetry is the entire economic structure: it is why the margin is a multiple of any drinks manufacturer\'s, why the capital base is small relative to the volume sold, and why a decade of refranchising raised the reported margin without improving the economics of the system as a whole. For a model the consequences are specific and easy to get wrong. Revenue is concentrate sales, not retail beverage sales, and the two grow at different rates — 5 points apart in one quarter and 1 point the other way in the next, on shipment timing and calendar days. Capital intensity should be modelled at the concentrate level, not at a beverage producer\'s. And margin improvements driven by refranchising are portfolio arithmetic, which the company itself discloses as such.',
        requires: [
          'The concentrate model and bottler territory structure remaining intact',
          'Disclosure continuing to separate concentrate sales, unit case volume and price/mix',
        ],
        breaks: [
          'Reacquisition of bottling operations, which would reintroduce the capital intensity and lower the margin',
          'Regulatory intervention in territory exclusivity, which would change the bottler relationship from captive to commercial',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and price', note: 'Volume here is concentrate sales, not unit cases. State which the build uses and reconcile the two, because they differed by 5 points in one quarter and 1 point in the next.' },
          { assumption: 'Capex as a share of revenue', note: 'A concentrate business has far lower capital intensity than a bottler. Model it at the concentrate level, and note that refranchising has been lowering it further.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'ko-pricing-with-volume',
        title: 'Price and mix contributed 2 points with volume still growing, in the category most exposed to the sector headwind',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The sector\'s two great worries are private label and the effect of weight-loss medication on the composition of the plate, and sugared carbonated drinks look like the most exposed category in the staples universe on both counts. The reported numbers do not show that yet. Revenue grew 7% in the June 2026 quarter with concentrate sales up 4% and price and mix up 2%, unit case volume grew in the regions disclosed, and full-year guidance was raised after having been updated a quarter earlier. Price and mix contributing while volume still grows is the favourable answer to the dossier\'s central test, and it is happening in a category where a challenger cannot use the usual private-label attack: a retailer\'s own cola is a commodity against a brand the consumer asks for by name, which is a harder position to undermine than a paper towel. The owned still-beverage and dairy brands give the portfolio somewhere to grow if the core category does contract.',
        requires: [
          'Unit case volume continuing to grow, particularly in developing markets',
          'Price and mix contributing without volume declining in the core category',
          'Still beverages and dairy continuing to grow faster than carbonated soft drinks',
        ],
        breaks: [
          'Unit case volume declining while price and mix carry revenue growth, the harvesting signature',
          'Sugar taxation or marketing restrictions reducing core category volume in several large markets at once',
          'Still beverage and dairy growth stalling, removing the portfolio\'s escape route from the core category',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: price growth', note: 'Price and mix at roughly 2 points is the disclosed base. A higher price assumption needs a volume consequence, because the category is the sector\'s most exposed to demand substitution.' },
          { assumption: 'Segment shares and margins', note: 'Concentrate and finished-product operations carry very different margins. Model the still-beverage and dairy mix separately, or the blended margin will drift without an explanation.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'ko-portfolio-obscures-growth',
        title: 'A 55% operating income increase that includes refranchising is not an operating result',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'In the June 2026 quarter operating income grew 55%, and the company\'s own disclosure notes this included the impact of refranchising bottling operations. Elsewhere, growth in owned dairy and other brands was more than offset by the sale of finished-product operations in Nigeria in late 2025, and regional unit case volume growth was partly offset by refranchising. None of this is concealment — it is disclosed carefully — but it means that headline growth rates for this company reflect portfolio construction at least as much as consumption, and a decade of continuous refranchising has made the margin trend flatter the underlying system. Selling the low-margin half of your own value chain raises your margin percentage and changes nothing about how many drinks are sold. There is an operational dimension too: the majority-owned dairy business, one of the genuine growth engines, had to suspend production at four United States facilities after a ransomware event. The company that looks steadiest in the sector is the one whose reported numbers require the most adjustment before they can be compared.',
        requires: [
          'Portfolio activity — refranchising and disposals — continuing at a pace that affects reported growth',
          'A meaningful gap persisting between concentrate sales and unit case volume',
        ],
        breaks: [
          'The refranchising programme completing, after which reported growth would reflect operations',
          'Several consecutive periods in which reported and organic growth converge',
          'Concentrate sales and unit case volume tracking each other closely, removing the timing distortion',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Margin has risen partly because low-margin bottling revenue was sold. Do not extrapolate the trend; state how much of the historical improvement was portfolio and how much was operating.' },
          { assumption: 'Revenue growth path', note: 'Reported growth includes disposals and refranchising in both directions. Build the path from organic growth and treat portfolio effects as explicit separate items.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'The Coca-Cola Company — Second quarter 2026 results and raised full year guidance', url: 'https://investors.coca-colacompany.com/news-events/press-releases/detail/1168/coca-cola-reports-second-quarter-2026-results-and-raises-full-year-guidance' },
      { label: 'The Coca-Cola Company — First quarter 2026 results and updated guidance', url: 'https://investors.coca-colacompany.com/news-events/press-releases/detail/1158/coca-cola-reports-first-quarter-2026-results-and-updates-full-year-guidance' },
      { label: 'Business Wire — Coca-Cola reports second quarter 2026 results', url: 'https://www.businesswire.com/news/home/20260728919215/en/Coca-Cola-Reports-Second-Quarter-2026-Results-and-Raises-Full-Year-Guidance' },
      { label: 'The Coca-Cola Company — Q1 2026 earnings release (PDF)', url: 'https://investors.coca-colacompany.com/_assets/_7558b9e229c4944bef38147230779b0f/cocacolacompany/db/880/11107/earnings_release/Coca-Cola+2026+Q1+Earnings+Release_Full+Release_4.28.26.pdf' },
    ],
  },
  {
    ticker: 'WMT',
    sector: 'Consumer Staples',
    scope: 'UNITED_STATES',
    headline:
      'Advertising grew 46% to $6.4 billion and membership fees 15.5% to $4.4 billion in fiscal 2026 — together roughly a third of operating profit — which is why operating income rose 6.6% on revenue growth of 4.7%.',
    howItEarns: [
      {
        heading: 'Grocery at scale, priced to hold traffic',
        body:
          'Supercentres and clubs selling food and general merchandise at the lowest sustainable price. Grocery is the traffic engine and carries a thin margin by design; general merchandise carries the retail margin. Revenue rose 4.7% in fiscal 2026 while operating income rose 6.6% to $29.82 billion, so profit grew faster than sales for the first time in several years.',
        basis: 'REPORTED',
      },
      {
        heading: 'E-commerce reached scale and became economic',
        body:
          'Global e-commerce sales totalled $150.4 billion, with the United States business at $99.6 billion against $79.3 billion the year before, contributing approximately 4.3 percentage points to United States comparable sales. Management attributed the operating income growth partly to improved e-commerce economics — the point at which an online grocery operation stops subsidising itself.',
        basis: 'REPORTED',
      },
      {
        heading: 'Advertising and membership are the profit story',
        body:
          'The retail media business generated $6.4 billion in fiscal 2026, up 46%, with the United States operation growing 41%. Worldwide membership fee income rose 15.5% to $4.4 billion on double-digit growth in the subscription programme and club memberships. Together, advertising and membership now account for roughly a third of operating profit on a small fraction of revenue.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'Controlled by the founding family through a holding structure owning close to half the shares outstanding. Family members sit on the board and the holding has continued to accumulate stock through the company\'s own repurchase programme, which mechanically increases its proportional stake.',
      voting: 'Single class of common stock, one share one vote; control comes from the size of the family holding rather than from a voting structure.',
      relatedPartyExposure: [
        'A founding family holding close to half the shares with board representation, whose proportional ownership rises passively as the company repurchases stock',
        'Supplier relationships in which the company is large enough that its terms determine a supplier\'s economics, and in which it also sells competing private-label products',
      ],
      minorityProtections: [
        'Single voting class, so the family\'s votes are proportional to its economic stake rather than multiplied',
        'SEC disclosure separating advertising, membership and e-commerce performance, which is what makes the profit mix visible',
        'Independent directors and audit committee under New York Stock Exchange listing standards',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The buyback quietly concentrates family control',
        body:
          'A company repurchasing its own stock raises the proportional stake of any holder who does not sell. With the founding family near half the register, continued repurchase moves the structure toward outright majority control without a purchase being made or a premium being paid. This is disclosed, lawful, and a fact a minority holder should hold consciously rather than discover.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The high-margin lines are disclosed separately, which is what makes the thesis testable',
        body:
          'Advertising revenue at $6.4 billion and its 46% growth, membership fee income at $4.4 billion and its 15.5% growth, and e-commerce at $150.4 billion are reported as distinct figures. Without that separation, a reader could not tell that a third of operating profit now comes from businesses that are not retail.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Purchasing scale converted into price, not margin',
        mechanism:
          'Buying more of nearly every category than anyone else produces a cost per unit no competitor matches, and passing it to the consumer as price rather than keeping it as margin generates the traffic that sustains the scale. The loop is self-reinforcing and a challenger cannot enter it partway — it must match the price before it has the volume that makes the price possible.',
        evidence: 'Operating income growing 6.6% against revenue growth of 4.7% while still leading on price, with gross margin improving on inventory management.',
        erodedBy: 'A competitor achieving comparable scale in a specific category, or a cost structure — such as membership-funded warehouse retail — that supports lower prices on a narrower assortment.',
        basis: 'REPORTED',
      },
      {
        label: 'Store proximity turned into a delivery network',
        mechanism:
          'Existing stores within a short drive of most of the population function as fulfilment nodes for online orders, so the last mile is served from an asset already paid for by the retail business. A pure e-commerce competitor must fund a separate network to reach the same delivery promise on perishable goods.',
        evidence: 'United States e-commerce sales of $99.6 billion against $79.3 billion a year earlier, contributing about 4.3 points to comparable sales, with improved e-commerce economics cited in the operating income bridge.',
        erodedBy: 'Third-party delivery networks offering comparable density to competitors as a rented service, which removes the need to own the nodes.',
        basis: 'REPORTED',
      },
      {
        label: 'First-party purchase data sold as advertising',
        mechanism:
          'Knowing what a household actually bought, rather than inferring interest from browsing, makes advertising inventory materially more valuable and requires no third-party tracking. Only a retailer with this transaction volume owns a dataset of that quality, and the revenue carries almost no incremental cost.',
        evidence: 'Advertising revenue of $6.4 billion in fiscal 2026, up 46%, with the United States business up 41%.',
        erodedBy: 'Retail media networks at competing grocers and marketplaces commoditising the format, and privacy regulation limiting the use of transaction data for targeting.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Very heavy investment in supply chain, automation and e-commerce fulfilment funded from operating cash, with a long-standing dividend and consistent buybacks. The current allocation has produced the first sustained period of operating income growing faster than sales in years.',
      good: [
        'Building retail media on top of existing transaction data, which added $6.4 billion of near-costless revenue growing 46% without a corresponding capital requirement',
        'Persisting with e-commerce through years of dilution until it reached the scale at which the economics improved — $99.6 billion in the United States and a positive contribution to the operating income bridge',
        'Using stores as fulfilment nodes rather than building a separate online network, which is why the delivery promise was achievable without duplicating the asset base',
      ],
      bad: [
        'A large share of the international expansion of the past two decades was written down or exited — entries into several major markets were sold at a loss after years of capital and management attention',
        'The e-commerce build consumed a decade of margin before the economics turned, and the return on that cumulative investment is only now becoming arguable rather than demonstrable',
        'Continued buybacks passively raise the founding family\'s proportional stake toward majority control, so capital returned to shareholders generally has a governance consequence that benefits one shareholder specifically',
        'Automation and supply chain capital expenditure is running at a level that assumes the current growth rate persists; if comparable sales revert toward historical levels, the depreciation arrives regardless',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The private-label competitor the dossier describes, from the other side',
        body:
          'The global staples dossier names private label as both competitor and customer for brand owners. This is the company on the other side of that relationship: it is the customer providing shelf access and the competitor selling the own-brand alternative, and the profit from both accrues here.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Food inflation is a traffic driver as much as a cost',
        body:
          'When food inflation is high, consumers consolidate their shopping into the lowest-price destination, which raises this company\'s share of an expanding basket. The sector\'s headwind for a branded manufacturer is closer to a tailwind here, which is why staples exposure through a retailer and through a brand owner are not the same exposure.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Tariffs on general merchandise',
        body:
          'Grocery is largely domestic; general merchandise, which carries the retail margin, is substantially imported. Tariffs raise landed cost on the profitable half of the assortment and must be absorbed or passed to a consumer who is at this retailer precisely because of price.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Retail media growth decelerating from a high base',
        body:
          'Advertising grew 46% and is roughly a third of operating profit alongside membership. Growth of that magnitude does not persist, and because the revenue is near-costless, a deceleration flows almost entirely into operating income growth rather than being cushioned by a cost reduction.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Capital intensity assuming the current growth rate',
        body:
          'Automation and fulfilment capital expenditure converts into depreciation over several years whether or not comparable sales stay at the recent level. The programme is what produced the e-commerce economics; it is also a fixed charge if the volume that justified it normalises.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'wmt-margin-comes-from-outside-retail',
        title: 'A third of operating profit now comes from selling advertising and memberships, not groceries',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Advertising revenue reached $6.4 billion in fiscal 2026, up 46%, with the United States business up 41%, and worldwide membership fee income rose 15.5% to $4.4 billion. Together those lines are roughly a third of operating profit on a very small fraction of revenue, and both carry close to no incremental cost — advertising is sold against transaction data the retail business generates anyway, and a membership fee is pure margin once the programme exists. That is why operating income grew 6.6% against revenue growth of 4.7%: the mix, not the retail margin, is doing the work. The mechanism is also self-reinforcing, because the e-commerce business that reached $99.6 billion in the United States is what generates the data and the subscription relationship in the first place. For a retailer historically valued on a thin and hard-won grocery margin, a structural shift of a third of the profit into near-costless revenue changes what the multiple should be attached to.',
        requires: [
          'Advertising continuing to grow well ahead of retail revenue, even if below 46%',
          'Membership fee income sustaining double-digit growth as the subscription programme scales',
          'Retail gross margin at least stable, so the mix benefit is not offset by price investment',
        ],
        breaks: [
          'Advertising growth decelerating to retail-like rates, which would stop the mix shift',
          'Membership growth stalling, indicating the subscription programme has saturated its addressable base',
          'Retail margin compressing to fund price competition, absorbing the mix gain before it reaches operating income',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'Advertising and membership must be modelled as separate lines with near-100% incremental margin. A blended retail EBITDA margin cannot express a third of profit coming from non-retail revenue.' },
          { assumption: 'EBITDA margin path', note: 'The rising margin should be a consequence of the advertising and membership mix assumptions, not an independent input. If the margin rises without the mix moving, the model is asserting the conclusion.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'wmt-capex-and-deceleration',
        title: 'A near-costless profit line growing 46% and a capital programme sized against it',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The two facts that make this company attractive also define its risk. Advertising at 46% growth and membership at 15.5% are roughly a third of operating profit, and because that revenue carries almost no cost, any deceleration flows straight into operating income with nothing to cushion it — there is no cost line to cut on revenue that never had one. Meanwhile the automation, supply chain and fulfilment capital programme that produced the improved e-commerce economics is sized against the current growth rate, and it converts into depreciation over several years regardless of whether comparable sales stay where they are. Add tariffs, which fall on general merchandise — the imported, higher-margin half of the assortment — at a retailer whose entire proposition is that it will not raise the price. The combination is a profit mix with high operating leverage in both directions, a fixed charge arriving on schedule, and a cost increase that cannot be passed on without contradicting the brand.',
        requires: [
          'Retail media growth decelerating from the current base, as very high growth rates historically do',
          'Capital expenditure remaining elevated through the automation programme',
          'Tariff exposure persisting on imported general merchandise',
        ],
        breaks: [
          'Advertising sustaining growth above thirty percent for several more years, which would outrun the depreciation',
          'Capital intensity falling as a share of revenue once the automation programme completes',
          'General merchandise tariff exposure materially reduced through sourcing changes or policy',
        ],
        modelLink: [
          { assumption: 'Capex as a share of revenue', note: 'The automation programme is above maintenance capital. Model the elevated level explicitly and let the vintage depreciation schedule carry it into the margin.' },
          { assumption: 'Gross margin', note: 'Tariffs on imported general merchandise land in cost of goods at a retailer that competes on price. A margin path that holds must say whether the cost is passed on and what happens to volume if it is.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'wmt-buyback-concentrates-control',
        title: 'Every buyback moves the founding family closer to outright majority control',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'The founding family holds close to half the shares outstanding through a holding structure, with board representation, and the shares are a single class so the votes are proportional rather than multiplied. That is a better structure than a dual-class arrangement. But the company repurchases stock consistently, and a repurchase raises the proportional stake of every holder who does not sell — so a capital return that is neutral between shareholders in cash terms is not neutral in control terms. Over enough years the family crosses from effective control to outright majority without buying a share or paying a premium, and at that point the change-of-control protections that matter to a minority holder become academic. None of this is hidden or improper, and the company has been well run under that influence. The point for a model is that the governance profile is not static: it is drifting in one direction as a mechanical consequence of the capital allocation policy, and a terminal value that assumes a contestable company is assuming something the buyback is steadily removing.',
        requires: [
          'Continued share repurchases without corresponding family sales',
          'The single-class share structure remaining in place',
        ],
        breaks: [
          'The family reducing its stake in line with the repurchase pace, holding the proportion stable',
          'The buyback being replaced by dividends, which do not change proportional ownership',
        ],
        modelLink: [
          { assumption: 'Buyback as a share of net income', note: 'The repurchase rate determines how fast the ownership proportion drifts. It is a governance assumption as well as a per-share one; state both effects.' },
          { assumption: 'Cost of equity', note: 'A company approaching majority family control has no realistic takeover floor. Carry a governance premium that reflects the trajectory, not only the current stake.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Walmart — Q4 FY26 earnings release', url: 'https://corporate.walmart.com/news/2026/02/19/walmart-releases-q4-fy26-earnings' },
      { label: 'Walmart — Earnings release FY26 Q4 (PDF)', url: 'https://stock.walmart.com/_assets/_461d6b46a29d437b51015f942ff9bb4e/walmart/db/938/9972/earnings_release/Earnings+Release+(FY26+Q4).pdf' },
      { label: 'SEC EDGAR — Walmart Inc. FY2026 annual report', url: 'https://www.sec.gov/Archives/edgar/data/0000104169/000010416926000091/wmtfy26annualreport-final.pdf' },
      { label: 'Yahoo Finance — Walmart revenue rises 4.7% in fiscal 2026', url: 'https://finance.yahoo.com/markets/stocks/articles/walmart-revenue-rises-4-7-094100979.html' },
    ],
  },

  {
    ticker: 'PEP',
    sector: 'Consumer Staples',
    scope: 'UNITED_STATES',
    headline:
      'Cut snack prices by up to 15%, removed a fifth of the United States product range and began closing plants under pressure from an activist — and North American snack volume came back to +2% in the first quarter of 2026 and then went flat in the second.',
    howItEarns: [
      {
        heading: 'Snacks and beverages, with the snack business carrying the margin',
        body:
          'A salty snack business and a beverage business under one roof. The snack operation has historically earned roughly double the beverage margin because it is a manufactured branded food with a direct store delivery system, while beverages compete against a stronger brand in the core category. Net revenue rose 6.4% to about $24.2 billion in the June 2026 quarter, with core earnings of $2.20 per share narrowly below consensus.',
        basis: 'REPORTED',
      },
      {
        heading: 'Direct store delivery is the structural asset',
        body:
          'Salty snacks are delivered by the company\'s own route system directly to the store shelf rather than through a retailer\'s distribution centre, which gives control of shelf placement, restocking frequency and promotional execution. It is expensive, it is the reason the snack margin is what it is, and it is the asset the plant closures touch.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'International is now the growth engine',
        body:
          'The international business has been approaching $40 billion in revenue and growing while North America struggles, which inverts the historical shape of the company. Q1 2026 revenue rose 8.5% to $19.44 billion with organic growth of 2.6% — the gap between the two numbers being largely international and acquisition effects.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, and an activist investor has taken a position large enough to negotiate specific operating commitments with the board — which is the accountability mechanism a dispersed register provides.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Bottling and distribution arrangements in beverages with third parties, including territory agreements',
        'An activist investor whose agreed programme now shapes pricing, assortment and manufacturing footprint decisions',
      ],
      minorityProtections: [
        'Single voting class with a fully dispersed register, which is what made the activist campaign possible',
        'SEC segment disclosure separating North American snacks, North American beverages and international, which is what allows the turnaround to be tested by segment',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'An activist agreement is now the strategy, and it is specific',
        body:
          'The company agreed with an activist investor to cut the United States product lineup by 20% and reduce prices on core brands, implementing price cuts of up to 15% and beginning to close snack plants. Specificity is the useful feature: a programme with a percentage range cut and a named product reduction can be verified, unlike a commitment to improve competitiveness.',
        basis: 'REPORTED',
      },
      {
        heading: 'The dispersed register is what produced the intervention',
        body:
          'This is the same structural fact as elsewhere in this universe, seen from the other side: with no controller, a large outside holder could force a strategy change. A minority holder in a controlled company has no equivalent route, which is precisely the governance premium that controlled structures carry.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Direct store delivery on salty snacks',
        mechanism:
          'Owning the route to the shelf means the company decides placement, facing and restocking rather than a retailer\'s distribution centre deciding it. On a high-turn impulse category that is worth real volume, and a competitor without the route system depends on the retailer\'s warehouse and its priorities.',
        evidence: 'A snack business historically earning roughly double the beverage margin on comparable branded products, an advantage attributable to route control rather than to formulation.',
        erodedBy: 'Retailers restricting direct delivery in favour of centralised distribution, and plant closures thinning the route density that makes the system economic.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Category leadership in salty snacks with no branded rival at scale',
        mechanism:
          'Unlike carbonated drinks, the salty snack aisle has no second national branded competitor of comparable size, so the main pressure is private label rather than a branded rival. That structure allows price leadership within the branded segment and makes the relevant competitive question the size of the gap to own-brand.',
        evidence: 'Volume returning to +2% in the March 2026 quarter after price cuts of up to 15%, demonstrating the volume is price-elastic and recoverable rather than lost to a branded competitor.',
        erodedBy: 'Private label narrowing the quality gap while holding a structural price advantage, which is what the 15% price cuts were an attempt to answer.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Decades of acquisition-built scale in snacks and beverages, a long dividend record, and now a forced reversal: prices cut, assortment reduced by a fifth and plants closing. The current programme is an admission that the previous pricing strategy overreached.',
      good: [
        'Building and retaining the direct store delivery system in snacks, which is the structural source of the margin advantage and would have been the easy cost to cut',
        'Growing the international business toward $40 billion, which is now the growth engine and offsets a North American market in difficulty',
        'Accepting the activist programme and implementing it visibly — 20% assortment reduction, price cuts of up to 15%, plant closures — rather than defending a strategy the volume data had already rejected',
      ],
      bad: [
        'Years of above-inflation pricing in North American snacks pushed the gap to private label far enough that volume left, and reversing it has required cutting prices by up to 15% and closing plants — the price increases were taken against future volume and the company is now paying that back',
        'North American beverage volumes fell 3% and beverage margins fell about 90 basis points in the June 2026 quarter, so the smaller and weaker of the two businesses is deteriorating while the larger one is being repaired',
        'The 15% price cuts returned Frito-Lay North America volume to +2% in the March quarter and then it went flat in the June quarter, so the discounts did not lift sales the way the company wanted — a costly intervention with an ambiguous result',
        'It took an activist investor to force a change that the segment volume data had been indicating for several years, which is a capital allocation failure of governance as much as of strategy',
      ],
      basis: 'REPORTED',
    },
    sectorPosition: [
      {
        heading: 'The harvesting case, and the attempt to undo it',
        body:
          'The global staples dossier warns that a brand raising price with falling units is harvesting rather than exercising its power, and that the two look identical for about two years. This company is the worked example: the price increases held revenue while units fell, and the correction — up to 15% off, a fifth of the range removed — is what undoing it costs.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Weight-loss medication is a direct threat to the core category',
        body:
          'The dossier names GLP-1 medication as a headwind to the composition of the plate. Salty snacks are among the most directly exposed categories in the entire staples universe, because the medication reduces exactly this kind of between-meal consumption. Distinguishing that effect from the price-gap effect is the central analytical difficulty here.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'The price cuts may not be the answer because the problem may not be price',
        body:
          'Volume returned to +2% after the cuts and then went flat. If the underlying issue is a structural change in snacking behaviour rather than the gap to private label, the company has permanently given up margin and bought a temporary volume response.',
        basis: 'REPORTED',
      },
      {
        heading: 'Beverages deteriorating while snacks are being fixed',
        body:
          'North American beverage volumes fell 3% with margins down about 90 basis points. Fixing two businesses at once in the same market, with one of them facing a stronger branded competitor, is a materially harder task than the snack turnaround alone.',
        basis: 'REPORTED',
      },
      {
        heading: 'Plant closures thinning the route economics',
        body:
          'Closing snack plants reduces fixed cost and also reduces the manufacturing and distribution density that makes direct store delivery affordable. The cost saving is immediate and measurable; the effect on the route advantage is slow and hard to see until it has happened.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'pep-price-reset-working',
        title: 'The price gap was the problem and closing it brought the volume back',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'After years in which North American snack revenue was held up by price while units fell, the company cut prices on core brands by up to 15%, removed a fifth of the United States assortment and began closing plants. Frito-Lay North America volume returned to +2% in the March 2026 quarter. That response is the evidence that matters: it says the consumer had not stopped eating the category, they had stopped paying that particular premium over private label, and the demand is recoverable by closing the gap. A narrower assortment also improves the economics that were degraded by proliferation — fewer stock-keeping units means longer manufacturing runs, simpler route loads and better shelf productivity per facing, which is why the range cut and the plant closures belong together. Meanwhile international revenue approaching $40 billion is growing and funding the repair, and total revenue still rose 6.4% to about $24.2 billion in the June quarter. The direct store delivery system that produces the structural margin advantage remains intact.',
        requires: [
          'Snack volume sustaining positive growth at the new price points rather than only responding initially',
          'Gross margin stabilising as assortment reduction and longer production runs offset the price cuts',
          'International growth continuing to fund the North American reset',
        ],
        breaks: [
          'Volume returning to decline at the reduced prices, which would mean the problem was never the price gap',
          'Margin failing to recover as the assortment reduction completes, indicating the price cuts were not self-funding',
          'Private label continuing to gain share despite the narrowed gap',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and price', note: 'This is a deliberate trade of price for volume. Model a negative price assumption with a positive volume response and check whether the product is above or below the prior revenue line.' },
          { assumption: 'Gross margin', note: 'Assortment reduction and plant closures should offset part of the price cut through longer runs. If the model assumes margin holds, that is the mechanism it needs to name.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'pep-glp1-and-flat-volume',
        title: 'Volume went flat again after the discounts, which points at the plate rather than the price',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The reset produced +2% volume in the March 2026 quarter and then flat volume in the June quarter, with the reporting explicitly noting the discounts did not lift sales the way the company wanted. Two readings are possible and they have very different consequences. If the issue is the gap to private label, the price cuts were the right medicine and need time. If the issue is that weight-loss medication and a broader shift in snacking behaviour are reducing category consumption — the headwind the sector dossier names, and salty snacks are among the most directly exposed categories in staples — then the company has given up up to 15% of price permanently and bought one quarter of volume. The second reading is supported by the beverage business deteriorating at the same time, with North American volumes down 3% and margins down about 90 basis points: two different categories weakening simultaneously in the same market is more consistent with a demand change than with two separate pricing errors. And plant closures, while sensible against lower volume, thin the manufacturing and route density that produces the structural margin advantage in the first place.',
        requires: [
          'Snack volume remaining flat or negative at the reduced price points',
          'The category-level consumption effect persisting rather than being a transition',
          'North American beverage weakness continuing alongside the snack reset',
        ],
        breaks: [
          'Volume growth resuming and sustaining at the new prices over several quarters',
          'Category-level snack consumption data stabilising, which would isolate the problem to the price gap',
          'North American beverage volumes recovering, indicating the weakness was category-specific rather than consumer-wide',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume growth', note: 'A permanent category-demand decline is a different assumption from a temporary price-gap problem. State which the volume path assumes, because the price assumption is already permanently lower either way.' },
          { assumption: 'Segment shares and margins', note: 'Model North American snacks, North American beverages and international separately. Two of the three are deteriorating and one is growing; a blended margin hides the entire question.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'pep-activist-as-governance',
        title: 'A dispersed register let an outside holder rewrite the operating plan, which is the accountability mechanism working',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'The company agreed with an activist investor to cut the United States lineup by 20%, reduce prices on core brands and close plants. Whatever one thinks of the programme, the fact that an outside shareholder could compel it is a structural feature worth pricing. It was possible because there is a single class of stock and no controlling block — the same condition that, elsewhere in this universe, allows a change of control to be contested and a strategy to be corrected by someone other than management. A minority holder in a dual-class or family-controlled staples company facing the same volume decline would have had no equivalent route and would have waited for the board to reach its own conclusion. The cost of the arrangement is that strategy is now partly set by a negotiated commitment with specific percentage targets, which constrains management\'s ability to adapt if the diagnosis proves wrong — and the flat June volume raises exactly that possibility. Governance here is not a score; it is the reason the correction happened at all, and the reason it may now be harder to reverse.',
        requires: [
          'The single-class, dispersed ownership structure persisting',
          'The agreed programme remaining the operating plan',
        ],
        breaks: [
          'The activist exiting and the board reverting to the prior pricing strategy',
          'A controlling block emerging, which would remove the mechanism',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'A contestable register with a demonstrated correction mechanism justifies a lower governance premium than a controlled peer. Make the difference explicit rather than implicit.' },
          { assumption: 'SG&A and restructuring costs', note: 'Plant closures and a 20% assortment reduction carry defined costs over a defined period. Model them as stated commitments rather than as a smooth efficiency assumption.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Quartz — PepsiCo Q2 2026 earnings: revenue beat, EPS miss, US slump', url: 'https://qz.com/pepsico-q2-2026-earnings-revenue-beat-eps-miss-us-demand-070926' },
      { label: 'Food Ingredients First — PepsiCo Q1 2026 results: price cuts and healthier snacks', url: 'https://www.foodingredientsfirst.com/news/pepsico-q1-2026-results-price-cuts.html' },
      { label: 'BNN Bloomberg — PepsiCo lowers snack prices to reaccelerate demand', url: 'https://www.bnnbloomberg.ca/investing/investor-outlook/2026/02/03/investor-outlook-pepsico-lowers-snack-prices-to-reaccelerate-demand/' },
      { label: 'Zenith Market Intel — PepsiCo international crosses $40bn while the home market is the problem', url: 'https://zenithmarketintel.com/intelligence/pepsico-q2-2026-international-40-billion-north-america-elliott-turnaround' },
    ],
  },

  {
    ticker: 'COST',
    sector: 'Consumer Staples',
    scope: 'UNITED_STATES',
    headline:
      'Membership fee income of $1.37 billion in a quarter, up 10.7%, at a 92.2% renewal rate in the United States and Canada — the profit is the subscription, and the merchandise is sold at an 11.04% gross margin to justify renewing it.',
    howItEarns: [
      {
        heading: 'The fee is the profit and the goods are the reason to pay it',
        body:
          'Members pay an annual fee for the right to shop, and the merchandise is sold at a gross margin — 11.04% in the third fiscal quarter of 2026, down 21 basis points, and up 1 basis point excluding fuel — that would not support a conventional retailer. Membership fee income of $1.37 billion, up 10.7%, is close to pure profit and approximates the company\'s operating income.',
        basis: 'REPORTED',
      },
      {
        heading: 'A deliberately narrow assortment, bought in enormous volume',
        body:
          'Carrying a few thousand items rather than tens of thousands concentrates purchasing into very large orders per item, which produces supplier terms no broad-assortment retailer can obtain. The narrow range is the cost advantage, not a limitation of the format.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The comparable sales figure needs adjusting before it means anything',
        body:
          'Comparable sales rose 9.8% in the third fiscal quarter of 2026 and 6.6% adjusting for fuel inflation and foreign exchange, with digitally enabled comparable sales up 21.5%. Fuel price movements and currency swing the headline number by percentage points in either direction, so the adjusted figure is the one that describes the business.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, with a management culture that has been unusually stable and internally promoted across several chief executive transitions.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Private-label manufacturing partnerships in which suppliers produce the own-brand line alongside the branded products they also sell to the company',
        'A co-branded credit card arrangement with a financial partner, which contributes to the membership proposition',
      ],
      minorityProtections: [
        'Single voting class with a fully dispersed register and annual director elections',
        'SEC disclosure separating membership fee income and renewal rates from merchandise sales, which is what makes the subscription economics visible',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The renewal rate is published and it is the honest scorecard',
        body:
          'A United States and Canada renewal rate of 92.2%, up 10 basis points sequentially, with a worldwide rate of 89.7%, is the single most informative disclosure this company makes. It measures whether members believe the fee is worth paying, which is the entire business, and it would deteriorate before any financial metric did.',
        basis: 'REPORTED',
      },
      {
        heading: 'Margin restraint is a stated policy rather than an outcome',
        body:
          'The company caps its markup on merchandise as a matter of policy, and gross margin at 11.04% with core-on-core margins down 9 basis points is what that looks like in practice. Deliberately declining to take available margin is an unusual governance commitment and it is the mechanism that protects the renewal rate.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'The subscription that makes low prices affordable to offer',
        mechanism:
          'Because the fee covers the profit, merchandise can be priced at a markup a conventional retailer could not survive on, which makes the prices genuinely lower and the membership genuinely worth renewing. A competitor without a subscription must earn its profit from the goods, so it cannot match the price; one that copies the subscription must first build a member base willing to pay before it has the volume that justifies the price.',
        evidence: 'Gross margin of 11.04% supporting the business because membership fee income of $1.37 billion, growing 10.7%, provides the profit — and a 92.2% renewal rate confirming members find the trade worthwhile.',
        erodedBy: 'A sustained deterioration in the renewal rate, which would remove the fee income that makes the low markup possible and force the margin up, which would remove the reason to renew.',
        basis: 'REPORTED',
      },
      {
        label: 'Purchasing concentration from a deliberately narrow range',
        mechanism:
          'Buying one or two options per category in very large quantities gives a supplier a volume no broad-assortment retailer offers on a single item, which converts into a unit cost competitors cannot reach. The narrow assortment is what creates the concentration, so the format and the cost advantage are inseparable.',
        evidence: 'Core-on-core margins moving only 9 basis points while comparable sales grew 6.6% adjusted — pricing discipline maintained through volume growth rather than through markup.',
        erodedBy: 'Consumers valuing choice over price enough that the narrow assortment becomes the reason not to shop, and online retail making comparison across a wide range effortless.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Warehouse openings funded from operating cash, a modest ordinary dividend supplemented by occasional large special dividends, and buybacks used sparingly. The allocation is conservative and consistent, and the main criticism is the size of the special distributions relative to reinvestment.',
      good: [
        'Refusing to take available gross margin as a matter of policy — 11.04% with core-on-core down 9 basis points — which protects the 92.2% renewal rate that the entire profit model depends on',
        'Raising the membership fee only occasionally and after long intervals, so roughly a quarter of the 10.7% fee income growth still comes from a prior increase while renewal rates continue to improve',
        'Funding warehouse expansion and the digital build from operating cash without leverage, in a format where each new location requires substantial land and construction',
      ],
      bad: [
        'Large special dividends have periodically returned several years of retained cash at once, sometimes funded with debt, which is a blunt instrument compared with steady reinvestment or a higher ordinary dividend',
        'Digitally enabled comparable sales growing 21.5% shows the online proposition working now, and the company was slow to build it — for years the format was defended as inherently physical while competitors established online grocery habits',
        'Gross margin at 11.04% was down 21 basis points with lower margins in fresh and food and sundries, so the margin restraint that protects renewal is currently being tested by cost inflation in the categories members shop most',
        'International expansion has been deliberate to the point of slowness, which has preserved returns and also left the format absent from markets where the subscription proposition would travel well',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Private label from the position of strength',
        body:
          'The global staples dossier names private label as the sector\'s structural pressure on brand owners. Here the own-brand line is a deliberate strategic asset rather than a defensive one: it is sold alongside the branded product at a visible saving, and members treat it as a reason to renew rather than as a compromise.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Food inflation drives members toward the format',
        body:
          'When food prices rise, bulk buying at a capped markup becomes more attractive, which raises renewal and traffic. The sector\'s volume-versus-price problem for a branded manufacturer runs the other way for this format, which is why staples exposure through a subscription retailer is not the same exposure as through a brand.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Renewal rate deterioration, which would unwind the whole model',
        body:
          'The fee income is the profit, and it depends on members renewing at 92.2%. A sustained decline would reduce the profit, force the merchandise margin up to compensate, and reduce the reason to renew — a loop that runs in one direction and is very hard to reverse once started.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Cost inflation in fresh and food categories',
        body:
          'Gross margin fell 21 basis points with core-on-core down 9 basis points, driven by lower margins in fresh and in food and sundries. Because the markup is capped by policy, input cost inflation in the categories members shop most is absorbed rather than passed on, which is the format working as designed and also where it hurts.',
        basis: 'REPORTED',
      },
      {
        heading: 'A valuation that requires the model to keep working',
        body:
          'This company has consistently traded at a multiple far above other retailers, which is defensible given a 92.2% renewal rate and near-pure-profit fee income. It also means the shares carry no allowance for the renewal rate slipping, and the first sign of that appearing in the disclosure would be repriced sharply.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'cost-subscription-is-the-business',
        title: 'The profit is a subscription, and the merchandise is the marketing expense that renews it',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'Membership fee income of $1.37 billion in a quarter, growing 10.7%, is close to pure profit and approximates the company\'s operating income. Merchandise is sold at an 11.04% gross margin — a markup capped by policy rather than by competition — which is well below what a conventional retailer needs to survive. Read in the usual order, this is a retailer with an inexplicably thin margin. Read correctly, it is a subscription business whose members are retained by being sold goods at close to cost, and the 92.2% United States and Canada renewal rate is the metric that says whether the arrangement is working. The modelling consequences are concrete: fee income should be built from member count, fee level and renewal rate, not as a percentage of sales; merchandise gross margin should be treated as a policy variable capped near 11%, not as a lever that expands with scale; and the terminal value depends on the renewal rate rather than on comparable sales growth. Any model that treats the fee as incidental revenue has valued the wrong half of the company.',
        requires: [
          'Membership fee disclosure and renewal rates continuing to be published separately',
          'The capped-markup policy remaining in force',
          'Member count and fee level being the primary drivers of profit rather than merchandise margin',
        ],
        breaks: [
          'A structural shift toward earning profit from merchandise margin rather than fees',
          'Renewal rates ceasing to be disclosed, which would remove the ability to test the model',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and price', note: 'Build fee income from members multiplied by fee, with the renewal rate governing attrition — separately from merchandise revenue. They are two businesses with different drivers.' },
          { assumption: 'Gross margin', note: 'At 11.04% this is a policy ceiling, not a competitive outcome. A model that expands merchandise margin over the projection has assumed away the mechanism that protects renewal.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'cost-renewal-compounding',
        title: 'A 92.2% renewal rate that is still rising is the most durable revenue in the sector',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The United States and Canada renewal rate reached 92.2%, up 10 basis points sequentially, with the worldwide rate at 89.7%, while membership fee income grew 10.7% to $1.37 billion — roughly a quarter of that growth still coming from a fee increase taken in 2024. Comparable sales rose 9.8%, or 6.6% adjusting for fuel and currency, and digitally enabled comparable sales grew 21.5%. Each of those numbers supports the same conclusion: members are renewing at a rate that is improving, paying more for the privilege, and shopping more often including online. Renewal rates above ninety percent describe revenue that is more predictable than almost anything else in consumer staples, and because fee income is close to pure profit, growth in it flows to operating income almost entirely. The company protects the rate by declining to take available merchandise margin — core-on-core margins moved only 9 basis points — which is why the model is self-sustaining rather than a promotional period that has to end.',
        requires: [
          'Renewal rates holding at or above ninety percent in the core markets',
          'Member count continuing to grow alongside the fee level',
          'The merchandise markup remaining capped, so the value proposition is maintained',
        ],
        breaks: [
          'Renewal rate declining over consecutive quarters, the leading indicator that would precede every other deterioration',
          'Fee income growth falling toward merchandise growth, indicating member additions have slowed',
          'Merchandise gross margin rising materially, which would signal the cap is being relaxed to defend earnings',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume growth', note: 'Member growth and renewal rate are the drivers of the profitable line. Model them explicitly rather than growing fee income with sales.' },
          { assumption: 'Terminal growth', note: 'A subscription at a 92.2% renewal rate justifies a different terminal assumption from a retailer\'s comparable sales growth. State which one the terminal value is describing.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'cost-margin-cap-under-cost-pressure',
        title: 'Capped markup plus fresh-food cost inflation means the format absorbs what others pass on',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Gross margin was 11.04% in the third fiscal quarter of 2026, down 21 basis points, with core-on-core margins down 9 basis points driven by lower margins in fresh and in food and sundries. That is the format working exactly as designed — the markup is capped by policy, so input cost inflation in the categories members shop most is absorbed rather than passed on. It is also the specific way this company gets hurt, and the mechanism is not visible in comparable sales, which grew 9.8% and were flattered by fuel and currency before adjusting to 6.6%. The structural tension is that the two halves of the model pull against each other under cost pressure: relaxing the markup cap to protect earnings reduces the price advantage that justifies the fee, and holding it absorbs the inflation into operating income. Neither is catastrophic at current levels, but the shares carry a multiple far above any other retailer, which allows no room for the renewal rate to slip or the margin cap to be tested for several years rather than one or two quarters.',
        requires: [
          'Cost inflation persisting in fresh and food categories',
          'The markup cap being maintained as policy through that inflation',
          'Comparable sales growth relying partly on fuel and currency effects that can reverse',
        ],
        breaks: [
          'Core-on-core gross margin recovering while the markup cap is maintained, which would show the cost pressure was transitory',
          'Membership fee growth accelerating enough to absorb the merchandise margin pressure entirely',
          'Adjusted comparable sales sustaining mid-single-digit growth independent of fuel and currency',
        ],
        modelLink: [
          { assumption: 'Gross margin', note: 'Model the merchandise margin near 11% with cost inflation flowing through rather than being passed on. That is the policy, and it is the difference between this and a conventional retail margin assumption.' },
          { assumption: 'Revenue growth path', note: 'Headline comparable sales of 9.8% adjust to 6.6% for fuel and currency. Build the growth path from the adjusted figure or the projection inherits a fuel price forecast it never intended to make.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Costco Investor Relations — Third quarter and year-to-date fiscal 2026 results', url: 'https://investor.costco.com/news/news-details/2026/Costco-Wholesale-Corporation-Reports-Third-Quarter-and-Year-To-Date-Operating-Results-For-Fiscal-2026/default.aspx' },
      { label: 'Motley Fool — Costco Q3 2026 earnings transcript', url: 'https://www.fool.com/earnings/call-transcripts/2026/05/28/costco-cost-q3-2026-earnings-transcript/' },
      { label: 'SEC EDGAR — Costco Wholesale Form 8-K FY2026', url: 'https://www.sec.gov/Archives/edgar/data/0000909832/000090983226000046/costex9928-k52826.htm' },
      { label: 'Longyield — Costco: the $70bn quarter, 92.2% renewal rate and the membership model', url: 'https://longyield.substack.com/p/costco-the-70b-quarter-922-renewal' },
    ],
  },
];
