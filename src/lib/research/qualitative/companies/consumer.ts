import type { CompanyQualitative } from '../types';

export const CONSUMER_DISCRETIONARY: CompanyQualitative[] = [
  {
    ticker: 'LREN3',
    sector: 'Consumer Discretionary',
    scope: 'BRAZIL',
    headline:
      'The best-run apparel retailer in Brazil and one of the very few large listed companies with no controlling shareholder — currently earning less because the credit book attached to the shop is deteriorating faster than the shop is improving.',
    howItEarns: [
      {
        heading: 'Apparel retail, where the margin is made in the buying',
        body:
          'Own-brand fashion sold through a national store network and online, with design and sourcing controlled centrally. The retail gross margin comes from private label — there is no third-party brand taking a cut — and from getting the season right, which is why inventory age and markdown rate matter more than same-store sales in any single quarter.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Realize: a consumer finance business inside a retailer',
        body:
          'The private-label card and personal credit operation lends to the same customer who is shopping, which historically subsidised the retail by funding the instalment. In the quarter to June 2026 it contributed R$53.5 million against R$118.5 million a year earlier, so the subsidy has become a drag. The credit portfolio stood at R$6.4 billion, down 1%, with net credit losses of R$298.6 million — 4.5% of the average portfolio, up 0.4 percentage points — and a delinquency index of 29%, up 0.6 points.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder and no shareholders\' agreement. Ownership is dispersed among local and foreign institutions with a very large free float — a genuine corporation in a market where almost every large consumer company has a family or a state behind it.',
      voting: 'Single class of common shares, one share one vote, listed on Novo Mercado.',
      relatedPartyExposure: [
        'The financial services operation lends to the retailer\'s own customers, so credit standards and sales targets sit inside the same company',
        'Store leases with shopping-centre landlords who are also listed peers of other names in this universe',
      ],
      minorityProtections: [
        'Novo Mercado listing: one share one vote, minimum free float, majority-independent board requirements',
        'No controlling block, so a change of control requires a tender offer to all shareholders on equal terms',
        'Statutory poison pill in the by-laws triggering a mandatory offer above a defined ownership threshold',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Dispersed ownership is the governance asset and the governance risk',
        body:
          'With no controller, management answers to the board and the board to a dispersed base — which removes the related-party problem that dominates Brazilian retail and replaces it with a different one: nobody with a large economic stake is watching every day, and a poorly performing management can persist longer than it would under a controlling owner.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Guidance was cut, which is the disclosure working',
        body:
          'After a second quarter of 2026 below expectation, the company reduced its revenue growth projection for the year and the shares fell around 8% on the day. A company that revises guidance downward promptly is easier to underwrite than one that defends a number it no longer believes.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Private-label design and sourcing at national scale',
        mechanism:
          'Controlling design, sourcing and the shelf means the full margin between landed cost and retail price stays inside the company, and the volume across hundreds of stores gives supplier terms a smaller chain cannot match. A competitor buying third-party brands is structurally one margin worse off on the same garment.',
        evidence: 'Retail gross margin sustained in the low-to-mid fifties through a cycle in which competitors filed for judicial recovery.',
        erodedBy: 'Cross-border platforms selling comparable basics at landed costs no domestic sourcing operation can match, which is already happening in accessories and basics.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Prime mall locations under long leases',
        mechanism:
          'Anchor positions in the highest-traffic Brazilian shopping centres are contractually held and genuinely scarce; a new entrant cannot buy the space because it is not for sale, and the landlord prefers a proven anchor at a lower rent to an unproven one at a higher one.',
        evidence: 'Anchor presence across the top malls with long-dated leases, a footprint that took three decades to assemble.',
        erodedBy: 'Consumption moving decisively online in apparel, which turns the prime lease from an asset into a fixed cost that cannot be exited quickly.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Organic store growth and logistics investment funded from operating cash, with one large equity raise and a small number of acquisitions outside core apparel. Retail capital discipline has been good; the diversification attempts have not paid.',
      good: [
        'Building the private-label sourcing and distribution platform organically rather than buying share',
        'Tightening credit granting into the 2026 deterioration rather than defending portfolio growth, which cost reported profit and protected the balance sheet',
      ],
      bad: [
        'Camicado, the home-goods chain acquired in 2011, has never earned a return comparable to the core apparel business and has absorbed management attention for over a decade',
        'The Repassa resale venture was launched and then shut down, a small loss but a clear signal that adjacent-category expansion has not worked',
        'The 2021 equity follow-on of roughly R$4 billion was raised into a digital and logistics programme whose incremental return remains difficult to identify in the reported numbers',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'On the right side of the sector\'s differentiation test, and the wrong side of its credit driver',
        body:
          'The sector dossier separates categories where the product is a price comparison from those carrying brand, fit and service. Own-brand fashion with fitting rooms sits in the second group, which is why this company is gaining relative position while broad retail contracted 2.2% year on year in February 2026. But the credit-cost driver hits it twice, because it is also the lender.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Asian platform pressure is real in basics and accessories',
        body:
          'Shein and the marketplaces compete directly in the lower-ticket end of apparel and accessories. The defence has been to move the assortment up in design content rather than to match price, which the reported gross margin suggests is working, at the cost of volume.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'The credit book deteriorating faster than provisions',
        body:
          'A 29% delinquency index and net losses at 4.5% of the average portfolio mean the financial services result can go from a contribution to a loss with a modest further deterioration. The portfolio is R$6.4 billion against a company earning roughly R$1.5 billion a year, so the sensitivity is material.',
        basis: 'REPORTED',
      },
      {
        heading: 'Weak volumes with a fixed store cost base',
        body:
          'Revenue grew 1% in the June 2026 quarter while the reported margin fell 1.5 points to 22.9%. Store rent and labour do not scale down with traffic, so a second year of flat volumes converts an operating-leverage story into a de-leverage one.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'lren3-credit-not-retail',
        title: 'The earnings problem is the credit book, not the retail franchise',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Consolidated profit was flat at R$405 million in the June 2026 quarter, and the entire shortfall against prior year sits in financial services: R$53.5 million against R$118.5 million. The retail operation still holds a private-label gross margin that its recovering-and-filing competitors cannot, and it is gaining relative position in a sector contracting 2.2%. If the deterioration is the credit cycle — Selic-driven, with a record 82% of households in debt — then it reverses with rates, and what is left is an apparel retailer with no controlling shareholder trading on depressed group earnings. The tell is that management tightened granting rather than chasing portfolio growth, which is what an operator protecting the franchise does.',
        requires: [
          'Retail gross margin holds in the low-to-mid fifties as volumes stay soft',
          'Delinquency peaks rather than continuing past 29% of the portfolio',
          'A falling Selic restores instalment affordability with the usual two-to-three-quarter lag',
        ],
        breaks: [
          'Net credit losses passing 6% of the average portfolio, which would make financial services loss-making',
          'Retail gross margin compressing below 50%, indicating the platform share loss is in the core assortment and not only in basics',
          'A third consecutive guidance reduction, which would move the diagnosis from cycle to franchise',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Separate the retail margin from the financial services contribution; the thesis is that the first holds while the second troughs, and a single blended margin hides the test.' },
          { assumption: 'Cost of debt and working capital days', note: 'The credit book funds at Selic plus a spread; model receivable days and funding cost together rather than as independent lines.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'lren3-lender-in-a-shop',
        title: 'A retailer that lends to its own customers cannot diversify the risk it is taking',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The same household that stops buying is the one that stops paying, so the retail and credit exposures are the same exposure counted twice. At a 29% delinquency index, net losses of 4.5% of the average portfolio and a record 82% of Brazilian households carrying debt, the credit operation is no longer subsidising the sale — it is absorbing the margin the sale generates. The structural point is that this cannot be hedged away: a bank can diversify its book across sectors, a retailer\'s captive book is one consumer segment in one country in one income band. The 2026 guidance cut and the 1.5 point margin decline are what that looks like before the cycle turns, not after.',
        requires: [
          'Household debt service remaining near record levels, keeping delinquency elevated',
          'Credit granting staying tight, which suppresses the instalment sales the retail depends on',
        ],
        breaks: [
          'Delinquency falling back toward the low twenties with the portfolio growing again',
          'Retail volumes recovering without a credit-driven instalment, proving the two are separable',
        ],
        modelLink: [
          { assumption: 'Bad debt as a share of the credit portfolio', note: 'Model provision expense against the portfolio rather than against revenue; a revenue-linked assumption cannot express this risk.' },
          { assumption: 'Revenue growth path', note: 'Tight granting and weak volumes are the same constraint; do not assume volume recovery while also assuming conservative credit.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'lren3-no-controller',
        title: 'No controlling shareholder is a structural feature, not a footnote',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'Almost every comparable large Brazilian consumer company has a family or the state at the top of the register, with the related-party exposures and the succession risk that come with it. This one does not, and that changes two things a model should reflect: a change of control is genuinely possible and would require an offer to every shareholder on equal terms, and there is no controller extracting value through supply agreements or asset transfers. The offsetting cost is real — dispersed ownership means slower correction when management underperforms, and the guidance cuts of 2026 are the case study either way. Governance here is a valuation input, not a score.',
        requires: [
          'Ownership remaining dispersed with the poison pill intact',
          'Novo Mercado listing standards maintained',
        ],
        breaks: [
          'A shareholders\' agreement forming among large holders, which would create a controlling block without a tender offer',
          'A by-law change removing the mandatory offer threshold',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'A dispersed register with a tender-offer trigger justifies a lower governance premium than a controlled peer; make the difference explicit rather than implicit in beta.' },
          { assumption: 'Terminal value', note: 'A company that can be acquired has a floor a controlled company does not; state whether the terminal value assumes independence or optionality.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'InfoMoney — Renner: lucro estável a R$405 mi no 2T26 e projeção de receita reduzida', url: 'https://www.infomoney.com.br/mercados/lojas-renner-lren3-resultados-segundo-trimestre-2026-projecoes/' },
      { label: 'InfoMoney — Renner corta guidance após 2T fraco', url: 'https://www.infomoney.com.br/mercados/renner-lren3-corta-guidance-apos-2t-fraco-preocupa-com-vendas-e-acoes-desabam/' },
      { label: 'Forbes Brasil — Renner reduz projeção de vendas após trimestre abaixo do esperado', url: 'https://forbes.com.br/forbes-money/2026/08/renner-reduz-projecao-vendas-resultados-segundo-trimestre-2026/' },
      { label: 'Investing.com — Lojas Renner 1T26: margens recordes, receita abaixo do esperado', url: 'https://br.investing.com/news/company-news/lojas-renner-1o-tri-2026-margens-recordes-compensam-receita-abaixo-do-esperado-93CH-1930930' },
      { label: 'Poder360 — Grandes marcas do varejo acumulam R$20 bi em RJs em 2026', url: 'https://www.poder360.com.br/poder-economia/grandes-marcas-do-varejo-acumulam-r-20-bilhoes-em-rjs-em-2026/' },
    ],
  },
  {
    ticker: 'MGLU3',
    sector: 'Consumer Discretionary',
    scope: 'BRAZIL',
    headline:
      'A store and logistics network with a bank bolted on, losing e-commerce volume in both first-party and marketplace channels because it has chosen not to fight the price war — a defensible decision that is indistinguishable from share loss in the numbers.',
    howItEarns: [
      {
        heading: 'Three revenue lines with three different economics',
        body:
          'Own-inventory retail (1P) in physical stores and online, a third-party marketplace (3P) earning commission and advertising, and financial services. Retail carries the inventory and the working capital; the marketplace carries almost none and is therefore where incremental margin should come from, which is why the 3P volume decline matters more than the headline.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The financial services stack is a joint venture, not a subsidiary',
        body:
          'Luizacred (cards), Luizaseg (insurance) and Consórcio Luiza sit alongside the retail. Luizacred is a joint arrangement with a large bank, which means the economics are shared and the consolidated presentation does not show the full credit exposure or the full contribution on the same line as the retail.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the founding family through a holding company with a majority of the voting capital. Management and the board chair have come from inside that block, so strategy is set by the controller rather than negotiated with the market.',
      voting: 'Single class of common shares on Novo Mercado, one share one vote — the control comes from the size of the family holding, not from a voting structure.',
      relatedPartyExposure: [
        'The card and insurance joint ventures with a large financial partner, where the retailer is both distributor and shareholder',
        'Credit granted to the retailer\'s own customers through an arrangement it half owns, so sales incentives and credit standards interact',
      ],
      minorityProtections: [
        'Novo Mercado listing: one share one vote, minimum free float, independent board representation',
        'Mandatory tender offer on a change of control at the same price paid to the controller (tag-along at 100%)',
        'Related-party transaction approval requirements under the listing rules and the corporations law',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A controller with a long horizon, which cuts both ways',
        body:
          'Family control has allowed the company to absorb several years of losses in pursuit of a digital platform without a proxy fight. The same structure means a decision the market disagrees with — declining to compete on price while volumes fall — will not be reversed by shareholder pressure.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The strategy is stated plainly, which is worth something',
        body:
          'Management has said explicitly that it will focus the marketplace on higher-quality products without negative contribution margin rather than match low-ticket competitors. That is a falsifiable commitment: it predicts falling volumes and rising contribution margin, and the reported numbers can be checked against it.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Store and logistics density for last-mile delivery',
        mechanism:
          'Hundreds of physical stores double as distribution and collection points, which shortens delivery distance and lowers cost per parcel in a country where freight is the binding constraint on e-commerce economics. A pure online entrant must build or rent that network before it can match the delivery promise.',
        evidence: 'Store network used for fulfilment and pickup across the country, supporting delivery times a centralised warehouse model cannot reach at the same cost.',
        erodedBy: 'Competitors renting equivalent density from third-party logistics networks, which has been happening and narrows the advantage every year.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'A consumer credit relationship the platforms do not have',
        mechanism:
          'Owning half of the card operation means the instalment plan that makes a large-ticket purchase affordable is originated in-house, capturing the finance margin as well as the retail one and creating a repeat relationship that a marketplace transaction does not.',
        evidence: 'Card, insurance and consórcio products distributed through the store base to a customer segment with limited access to bank credit.',
        erodedBy: 'Payment platforms and digital banks offering the same instalment at lower cost, which removes the reason to hold the retailer\'s card.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A decade of acquisitions and capital raises to build a digital platform, followed by a period of balance-sheet repair. The physical and logistics investment has created something real; the technology acquisitions have not returned their cost.',
      good: [
        'Liability management and deleveraging through 2024-2025, which removed the funding risk that killed weaker retailers in the 2026 judicial recovery wave',
        'Agreeing to distribute through a competitor\'s marketplace rather than treating the channel as an enemy, which monetises assortment without the traffic cost',
      ],
      bad: [
        'KaBuM!, acquired in 2021 for roughly R$3.5 billion at the top of the e-commerce multiple cycle, in a category — consumer electronics — that has since been the most price-competed in Brazil',
        'Netshoes, acquired in 2019, which has not produced a distinguishable contribution in the reported segments',
        'Funding e-commerce growth with inventory and receivables while the cost of working capital rose above 14%, the exact sequence the sector dossier names as the Brazilian retail failure mode',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Exposed to every one of the sector\'s headwinds at once',
        body:
          'Consumer electronics and home goods are the categories where price is the only differentiator, sold on instalments to a customer base carrying record debt, against cross-border platforms with a lower cost structure. Total sales fell 5.6% to R$15.1 billion in the March 2026 quarter and e-commerce volume fell 11%, split between 1P at −8.8% and 3P at −14.3%.',
        basis: 'REPORTED',
      },
      {
        heading: 'The physical store is now the better half',
        body:
          'Physical store volumes grew and gained share of the mix in both the first and second quarters of 2026 while e-commerce fell 11% and then 12%. That inverts the thesis the company was built on for a decade, and it is the single most important fact in the reported numbers.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Marketplace volume decline compounding into supply loss',
        body:
          'A marketplace is a two-sided network: falling buyer volume makes the channel less attractive to sellers, whose departure reduces assortment and falling assortment reduces buyer volume. With 3P volume down 14.3% and then 12.6% year on year, the question is whether the decline is a chosen mix shift or the start of that loop.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Working capital at a 14% funding cost',
        body:
          'Inventory and receivables on a low-margin electronics mix are financed at Brazilian corporate rates above 14%. The company can report positive EBITDA and still consume cash, which is how the sector\'s 2026 recovery filings happened, and it is why the cash conversion cycle deserves more attention than the margin.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'mglu3-discipline-or-share-loss',
        title: 'Refusing the price war is share loss until the contribution margin proves otherwise',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Management has been explicit: it will not sell low-ticket items at negative contribution margin to match competitors. Taken at face value that is the right decision. But e-commerce volume fell 11% in the March 2026 quarter and 12% in June, and the decline is in both channels — 1P down 8.8% then 11.5%, 3P down 14.3% then 12.6%. A deliberate mix shift out of unprofitable volume should show falling revenue and rising contribution margin. If the margin does not rise, the company is not choosing discipline, it is losing to a lower cost structure and describing the loss as a strategy. Two quarters of adjusted losses, including a R$33.9 million loss in the first quarter against a small profit a year earlier, suggest the second reading.',
        requires: [
          'Continued price competition from Asian platforms and the regional marketplace leader in low-ticket categories',
          'Household debt service staying near record levels, suppressing the instalment that sells electronics',
        ],
        breaks: [
          'Contribution margin per order rising materially while volumes fall, which would confirm the mix shift is deliberate and working',
          'E-commerce volume returning to growth without a discount programme',
          'A sustained return to adjusted profitability with the credit joint venture contributing rather than detracting',
        ],
        modelLink: [
          { assumption: 'Revenue growth path', note: 'The declines are running at roughly 11-12% in e-commerce volume; a growth path that assumes recovery must name what changes, not just when.' },
          { assumption: 'Gross margin', note: 'This is the thesis test. Model gross margin rising as volume falls; if the model assumes both fall, it has already conceded the bear case.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'mglu3-physical-inversion',
        title: 'The physical network became the asset and the e-commerce platform became the cost',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'For a decade this was an e-commerce story told with stores attached. In 2026 the stores grew volume and gained share of the mix while online fell in both channels — a complete inversion of the investment case, and one with real consequences for how the business should be valued. A store network that fulfils, collects returns and originates credit is a logistics and distribution asset with a defensible cost per parcel; a marketplace losing 12% of volume a year against platforms with structurally lower costs is a business that needs either scale it cannot buy or a niche it has not yet defined. The reported segment behaviour, not the strategy deck, is what should set the projection: the durable margin is in delivery density and financial services distribution, and the model should be built from there.',
        requires: [
          'Physical store volumes continuing to outgrow e-commerce volumes',
          'The logistics network remaining cheaper per parcel than rented third-party alternatives',
        ],
        breaks: [
          'E-commerce returning to double-digit volume growth at positive contribution, restoring the original case',
          'Third-party logistics pricing falling far enough that owned density stops being a cost advantage',
        ],
        modelLink: [
          { assumption: 'Capex as a share of revenue', note: 'A store-and-logistics business has a different capital intensity than a marketplace; the capex line should follow whichever the projection actually assumes is the future.' },
          { assumption: 'Segment mix and margins', note: 'Split 1P, 3P and financial services explicitly. A single blended retail margin cannot express an inversion between channels.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'mglu3-rate-cut-option',
        title: 'The instalment is the product, so the rate cycle is the earnings cycle',
        side: 'BULL',
        weight: 'SUPPORTING',
        rationale:
          'Large-ticket electronics and appliances in Brazil are bought in instalments, which means the effective price to the consumer includes the cost of credit. With average rates on free credit above 25% a year and a record 82% of households in debt, the instalment that used to sell the television has priced it out — and that is a rate variable, not a competitive one. This company is more levered to it than any other name in the universe, because it sells the most rate-sensitive basket and originates the credit. A Selic decline restores affordability, reduces its own working-capital funding cost, and improves the joint-venture credit result, all at once. The Mercado Livre distribution agreement adds a second lever: assortment monetised through someone else\'s traffic, without the customer-acquisition cost.',
        requires: [
          'A meaningful decline in Selic and in free consumer credit rates',
          'Household debt service falling from record levels so incremental income reaches discretionary spending',
          'The distribution agreement generating volume at positive contribution rather than cannibalising the owned channel',
        ],
        breaks: [
          'Rates falling without a volume response, which would prove the loss is share rather than affordability',
          'Cross-border platforms taking further share in electronics regardless of the domestic credit cost',
        ],
        modelLink: [
          { assumption: 'Cost of debt', note: 'Both the working-capital funding cost and the consumer instalment price move with Selic; one assumption drives two lines and should be linked.' },
          { assumption: 'Volume growth in the revenue build-up', note: 'Model volume as a function of credit affordability rather than as an independent growth rate, which is what makes the thesis testable.' },
        ],
        conviction: 'LOW',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'InfoMoney — Magalu reverte lucro e tem prejuízo ajustado de R$33,9 mi no 1T26', url: 'https://www.infomoney.com.br/mercados/magalu-mglu3-resultados-primeiro-trimestre-2026/' },
      { label: 'Investalk/BB — Magazine Luiza 2T26: volume nas lojas físicas cresce, trimestre fecha com prejuízo', url: 'https://investalk.bb.com.br/noticias/mercado/magazine-luiza-mglu3-resultado-2t26' },
      { label: 'Investalk/BB — Magazine Luiza 1T26', url: 'https://investalk.bb.com.br/noticias/mercado/magazine-luiza-mglu3-resultado-1t26' },
      { label: 'Money Times — Magazine Luiza fecha parceria para vender no marketplace do Mercado Livre', url: 'https://www.moneytimes.com.br/magazine-luiza-mglu3-fecha-parceria-com-o-mercado-livre-lmrs/' },
      { label: 'Seu Dinheiro — Magalu inicia novo ciclo e recusa a guerra de preços de Shopee e Mercado Livre', url: 'https://www.seudinheiro.com/2026/empresas/magazine-luiza-mglu3-inicia-novo-ciclo-e-quer-acelerar-o-e-commerce-mas-deixa-a-guerra-de-precos-para-shopee-e-mercado-livre-bdap/' },
    ],
  },
  {
    ticker: 'VIVA3',
    sector: 'Consumer Discretionary',
    scope: 'BRAZIL',
    headline:
      'A 70%-gross-margin jewellery business that owns its own factory in a tax-advantaged free-trade zone, run by a family that changed chief executive three times in under two years.',
    howItEarns: [
      {
        heading: 'Vertical manufacturing, then retail, on the same piece',
        body:
          'Jewellery and watches designed and largely manufactured in the company\'s own plant in the Manaus free-trade zone, then sold through owned stores and franchises. Earning the industrial margin and the retail margin on the same item is what produces a gross margin near 70% — 69.8% in the March 2026 quarter, up two percentage points, and 71.7% in June — against the 50-55% typical of a retailer buying finished goods.',
        basis: 'REPORTED',
      },
      {
        heading: 'Two brands at two price points',
        body:
          'The core jewellery brand sits at the premium end and Life addresses a younger, lower-ticket customer, which extends the addressable market without discounting the main brand. Expansion is running at 40 to 50 new units in 2026, weighted toward the second brand.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'Controlled by the founding family, which holds a majority of the capital and has occupied the chief executive role, the board chair and board seats. Control is direct and has been exercised directly, including reversing management decisions in public.',
      voting: 'Single class of common shares on Novo Mercado, one share one vote; control comes from the size of the family stake.',
      relatedPartyExposure: [
        'Family members simultaneously holding executive and board positions, so the body supervising management has included the people running it',
        'Franchise agreements with operators whose relationship with the controller is not always visible from the filings',
      ],
      minorityProtections: [
        'Novo Mercado listing standards: one share one vote, minimum free float, independent directors',
        'Tag-along at 100% of the price paid to the controlling block on a change of control',
        'Related-party transaction rules and the requirement to disclose material facts, which is how the 2024 leadership change reached the market',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The March 2024 episode is the governance disclosure that matters',
        body:
          'The founder and largest shareholder announced a return as chief executive, replacing his nephew. The shares fell about 9% in a day, roughly R$1.5 billion of market value, and he withdrew shortly afterwards in favour of an external executive. That sequence establishes two facts: the controller can act unilaterally, and the market can price the action fast enough to make him reconsider.',
        basis: 'REPORTED',
      },
      {
        heading: 'Three chief executives in under two years',
        body:
          'The externally appointed chief executive left by mutual agreement in November 2024 and was replaced by an internal operations director. In 2025 the founder stepped down as board chair for health reasons and was succeeded by his daughter, while the nephew who had been removed as chief executive returned to the board. The shares rose roughly 33% in 2025 against about 11% for the index, so the market has partially rerated the governance — but the structure that produced the churn has not changed.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Own manufacturing inside the Manaus free-trade zone',
        mechanism:
          'Producing the jewellery rather than buying it captures the industrial margin, and doing so inside the free-trade zone attaches a tax incentive that materially lowers the effective rate. A competitor importing finished pieces pays full duties and a supplier\'s margin, so it faces a structurally higher landed cost on a comparable item.',
        evidence: 'Gross margin near 70% sustained across quarters, roughly fifteen to twenty points above non-integrated Brazilian specialty retailers.',
        erodedBy: 'Changes to free-trade-zone incentives or to their treatment under the consumption tax reform, which would remove part of the advantage by legislation rather than by competition.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Category leadership where the purchase is not a price comparison',
        mechanism:
          'Jewellery is bought for an occasion, with the brand acting as the guarantee of the stone and the setting. That removes the product from the online price comparison that has destroyed margin in apparel and electronics, and it is why the sector dossier separates this category from the contested ones.',
        evidence: 'Gross margin expanded two points year on year in the March 2026 quarter while broad Brazilian retail contracted 2.2%.',
        erodedBy: 'A shift in gifting behaviour toward experiences or toward lab-grown stones sold direct, which would reintroduce price comparison to the category.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Cash generated at a high gross margin reinvested into store expansion and the manufacturing plant, with dividends and a modest payout. The operating capital allocation is sound; the human-capital allocation has been the problem.',
      good: [
        'Retaining and expanding own manufacturing rather than outsourcing, which is the source of the margin advantage and would have been the easy thing to give up',
        'Launching a distinct lower-ticket brand instead of discounting the main one, which extended the market without damaging the price architecture',
      ],
      bad: [
        'Three chief executives in under two years, including a founder announcing his own return and then withdrawing after the shares fell 9% — a sequence that cost roughly R$1.5 billion of market value in a single day and imposed a governance discount that the operating results have had to work against',
        'Profit in the March 2026 quarter fell year on year despite gross margin expanding, because operating expenses and financial expenses grew faster than the store base could absorb — expansion outrunning the cost structure',
        'Reported earnings have relied in part on subsidy revenue tied to the Manaus operation, and the decline in that line was a stated cause of the first-quarter profit fall: a policy variable was being treated as an operating one',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'On the protected side of every driver the sector dossier names',
        body:
          'The dossier separates categories where a product is a price comparison from those carrying brand, design or service, and it names vertical manufacturing with fiscal incentives as one of the few durable margin advantages in Brazilian retail. This company sits on the favourable side of both, which is why its gross margin expanded in a period when broad retail contracted and large peers filed for judicial recovery.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Still exposed to the credit driver, through the ticket',
        body:
          'A jewellery purchase is frequently financed in instalments, so credit cost reaches this company through affordability even though it does not run a credit book of its own scale. That is the mechanism by which a 25% corporate credit rate and record household indebtedness show up in a business with 70% gross margins.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Tax reform reaching the free-trade zone incentive',
        body:
          'The consumption tax reform changes effective rates by category and location and removes accumulated state-level benefits. The Manaus incentive is federal rather than state, but the transition is long and the treatment of the zone is a live legislative question — and a large part of this company\'s margin advantage is legislated rather than earned.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Governance recurrence',
        body:
          'The 2024 episode was reversed within days, but nothing structural prevents its repetition: the controller holds a majority, family members sit on both sides of the supervisory line, and the chief executive role has changed three times in under two years. The cost is a permanent discount to the multiple rather than a one-off loss.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'viva3-vertical-margin',
        title: 'The margin is manufactured, not merchandised, and that is why it holds',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A gross margin of 69.8% rising to 71.7% across the first half of 2026, in a market where broad retail contracted 2.2% year on year and roughly R$20 billion of large retail brands entered judicial recovery, is not a pricing accident. It comes from owning the factory, and from owning it inside a free-trade zone with a tax incentive attached — the single durable margin advantage the sector dossier identifies in Brazilian retail. A competitor cannot replicate it by buying better; it would have to build a plant and obtain the same fiscal treatment. Management guides to a stable gross margin for the full year, which is the right thing to defend, and the expansion into 40 to 50 new units is being funded from that margin rather than from debt. The category helps too: jewellery is bought for an occasion, which is exactly the purchase that cross-border platforms have not taken.',
        requires: [
          'Free-trade-zone incentives surviving the consumption tax transition in substantially their current form',
          'Gross margin holding near 70% as the lower-ticket brand grows as a share of the mix',
          'New stores reaching maturity without permanently raising the operating expense ratio',
        ],
        breaks: [
          'Gross margin falling below the mid-sixties, which would mean the mix shift is diluting the advantage rather than extending the market',
          'Legislation removing or materially reducing the Manaus fiscal treatment',
          'Subsidy revenue tied to Manaus continuing to fall without an operating offset, as it did in the March 2026 quarter',
        ],
        modelLink: [
          { assumption: 'Effective tax rate', note: 'The free-trade-zone incentive is the reason the effective rate sits below the statutory one. Model the gap explicitly and state whether the projection assumes it survives the tax reform transition.' },
          { assumption: 'Gross margin', note: 'Hold near 70% only while the vertical manufacturing share and the incentive both hold; a model that assumes the margin without assuming its cause is unfalsifiable.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'viva3-governance-discount',
        title: 'The controller can override the board in public, and that is the discount',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'In March 2024 the founder and largest shareholder announced his own return as chief executive in place of his nephew, and the market removed roughly R$1.5 billion of value in a day, with the shares down about 9%. He withdrew — but the fact established is that he could act, not that he was restrained. What followed confirms it: an external chief executive removed by mutual agreement within eight months, an internal successor, the founder leaving the board chair for health reasons in favour of his daughter, and the displaced nephew returning to the board. Three chief executives in under two years is not turbulence at the margin, it is the principal risk to an otherwise excellent business, and it sits in the cost of equity rather than in the operating lines. The shares recovering 33% in 2025 does not remove it; it only means the market is charging less for it than it did.',
        requires: [
          'Family control remaining concentrated with executive and board roles overlapping',
          'No formal mechanism added to separate the controller\'s executive influence from board supervision',
        ],
        breaks: [
          'A sustained tenure for a professional chief executive with a clearly independent board majority',
          'A formal governance change — an independent chair, a clear succession framework — that would make a repeat of March 2024 procedurally difficult',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'This thesis lives entirely in the discount rate. Carry an explicit governance premium and state its size rather than burying it in beta.' },
          { assumption: 'SG&A as a share of revenue', note: 'Leadership churn has a cost in execution; the March 2026 quarter showed profit falling while gross margin rose because expenses outgrew the base.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'viva3-subsidy-is-policy',
        title: 'Part of reported earnings is a policy decision, and it should be modelled as one',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'The company itself attributed the fall in first-quarter 2026 profit partly to lower subsidy revenue linked to the Manaus operation, alongside higher financial expenses and a lower income tax contribution. That is an honest disclosure and it carries a modelling instruction: a component of historical earnings is granted by legislation, can be reduced by legislation, and is being renegotiated inside a consumption tax reform with a long transition. It does not make the earnings fake — the factory is real and the margin advantage is real — but it does mean a valuation that extrapolates the reported effective tax rate into perpetuity is making a political forecast without saying so. The discipline is to separate the industrial margin from the fiscal margin and to show what the business is worth on each.',
        requires: [
          'Continued disclosure of the subsidy and incentive components of the result',
          'The tax reform transition proceeding on its legislated timetable',
        ],
        breaks: [
          'The incentive being made permanent and unconditional, which would justify treating it as an operating advantage',
          'The incentive being removed outright, which would make the separation moot and reset the valuation',
        ],
        modelLink: [
          { assumption: 'Effective tax rate path', note: 'Run the projection twice: once at the incentivised rate and once at the statutory rate, and report the difference as the value of the fiscal regime.' },
          { assumption: 'Other operating income', note: 'Subsidy revenue should be an identified line with its own path, not blended into the margin where it becomes invisible.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'InfoMoney — Vivara tem queda de 30% no lucro do 1º tri', url: 'https://www.infomoney.com.br/mercados/vivara-viva3-resultados-primeiro-trimestre-2026/' },
      { label: 'Investing.com/Reuters — Vivara espera margem bruta estável em 2026', url: 'https://br.investing.com/news/stock-market-news/vivara-espera-margem-bruta-estavel-em-2026-acoes-recuam-1931026' },
      { label: 'Visno Invest — Vivara registra lucro de R$156,7 mi no 2T26', url: 'https://visnoinvest.com.br/news/14565/vivara-viva3-registra-lucro-de-r-1567-mi-no-2t26' },
      { label: 'Forbes Brasil — Nelson Kaufman renuncia como CEO e ocupará a presidência do conselho', url: 'https://forbes.com.br/forbes-money/2024/03/nelson-kaufman-renuncia-como-ceo-da-vivara-e-ocupara-presidencia-do-conselho/' },
      { label: 'IstoÉ Dinheiro — Após crise de governança, Vivara vê papéis valorizarem 33% em 2025', url: 'https://istoedinheiro.com.br/governanca-vivara-2025' },
      { label: 'InvestNews — Na Vivara, novas mudanças no conselho', url: 'https://investnews.com.br/negocios/na-vivara-novas-mudancas-no-conselho-sai-kauffman-e-volta-kruglensky/' },
    ],
  },
  {
    ticker: 'AZZA3',
    sector: 'Consumer Discretionary',
    scope: 'BRAZIL',
    headline:
      'A two-year-old merger that is being taken apart: on 2 September 2026 the group formalised its separation back into a footwear company and an apparel company, after the synergies never arrived and the two controlling blocks stopped agreeing.',
    howItEarns: [
      {
        heading: 'A house of brands across three price architectures',
        body:
          'Footwear and handbags at the premium end, premium apparel, and mass-market apparel, each with its own consumer and its own price ladder. Distribution is a mix of owned stores, franchises and wholesale, which is what makes the group asset-light relative to its revenue: the franchise network carries the store capital and the group earns the product margin.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The synergy case was back office and supply chain, and it did not materialise',
        body:
          'The 2024 combination was justified on shared factories, distribution, customers and administrative structures rather than on cross-selling. In practice the integration of a footwear cluster with an apparel platform proved more complex than expected and shared governance became a point of tension. Recurrent net income fell 62.5% year on year in the June 2026 quarter.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'Two controlling blocks of comparable size rather than one — the footwear founding family and the apparel group founders — each with roughly a fifth to a quarter of the capital and neither able to impose a decision on the other. That symmetry is the governance structure and it is what the September 2026 separation resolves.',
      voting: 'Single class of common shares on Novo Mercado, one share one vote; control is shared between two blocks by size, not by a voting structure.',
      relatedPartyExposure: [
        'Two controlling blocks whose underlying businesses compete for the same shared sourcing, logistics and administrative capacity',
        'The separation itself: the terms on which brands and the shared structures are allocated between blocks are a related-party transaction of the first order',
        'FARM Rio to be held in a jointly owned holding after the split, which leaves one significant asset under continuing shared control',
      ],
      minorityProtections: [
        'Novo Mercado listing standards: one share one vote, minimum free float, independent board representation',
        'Tag-along at 100% of the price paid to a controlling block on a change of control',
        'Related-party and conflict-of-interest rules under the corporations law, which govern how the separation terms must be approved and disclosed',
        'Minority shareholders vote on a corporate reorganisation of this kind and interested parties are restricted from voting on matters in which they have a conflict',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Shared control between two founders was the design flaw',
        body:
          'The merger created a company with two controllers of similar size, each with a distinct operating heritage and neither with the votes to decide alone. Months of disagreement over governance, management and strategy followed, and the reorganisation was ultimately arranged by the two blocks themselves. This is the clearest available demonstration that governance structure is an operating variable, not a scoring exercise.',
        basis: 'REPORTED',
      },
      {
        heading: 'The separation is being done through the formal channel, which protects minorities',
        body:
          'A corporate split of this kind requires shareholder approval, appraisal of the assets being separated, and disclosure of the exchange terms; interested parties are constrained from voting where they are conflicted. Minorities therefore get a vote and a valuation — not a veto, but more than they would get from a negotiated asset sale between the blocks.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Brand portfolio spanning price points with distinct consumers',
        mechanism:
          'Each brand occupies a defined position with its own customer, so the group can capture trade-down inside its own portfolio rather than losing it to a competitor. Building an equivalent set would take a decade of marketing spend per brand, which is a cost a new entrant cannot compress.',
        evidence: 'Gross margin sustained in the mid-fifties across a portfolio whose price points range from mass-market apparel to premium footwear.',
        erodedBy: 'The separation itself, which divides the portfolio between two owners and ends the internal trade-down capture that justified holding it together.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Franchise network as asset-light distribution',
        mechanism:
          'Franchisees fund the store, the working capital and the local labour, while the group earns the wholesale margin on product and controls the brand presentation. Capital employed per point of sale is a fraction of an owned-store model, which is why return on capital can exceed that of a comparable owned-store retailer at the same margin.',
        evidence: 'A national network of franchised points of sale supporting group revenue with capital expenditure around 3.5% of revenue.',
        erodedBy: 'Franchisee financial distress in a market where corporate credit costs above 25% a year, which transfers the working-capital problem back to the franchisor.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'One very large transaction defines the record: the 2024 combination, and its unwinding two years later. Everything else is secondary to whether that round trip created or destroyed value, and the disclosed evidence points to the second.',
      good: [
        'Recognising the failure and separating rather than spending further years defending an integration that was not delivering — an unusual and costly admission for two controlling founders to make in public',
        'Keeping the franchise-based distribution model through the period, which meant the strategic error did not come with a heavy owned-store capital commitment on top',
      ],
      bad: [
        'The 2024 merger itself: the shared factories, distribution and administrative synergies that justified it never materialised at the expected intensity, and the group is being separated in September 2026 having spent two years on the attempt',
        'The transaction left a large goodwill balance on the balance sheet — on the order of a third of annual revenue — whose recoverability now has to be reassessed against a separation rather than an integration',
        'The split will require the creation of independent structures for each company, so the duplicated corporate cost the merger was meant to remove is being reinstated, and part of whatever synergies did exist will be lost',
        'Recurrent net income fell 62.5% year on year in the June 2026 quarter, while management attention was absorbed by a governance dispute between the two controlling blocks',
      ],
      basis: 'REPORTED',
    },
    sectorPosition: [
      {
        heading: 'Design content is the defence, and the group has it',
        body:
          'The sector dossier separates apparel categories where price is the only differentiator — where Asian platforms have taken share — from those carrying brand and design. This portfolio sits mostly in the second group, which is why gross margin has held while unbranded apparel retail has not. The mass-market apparel brand is the exception and the most exposed part of the portfolio.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Franchisee credit is the sector\'s headwind reaching the group indirectly',
        body:
          'The franchise model transfers store working capital to operators who fund it at Brazilian corporate rates above 25% a year. When those operators come under stress the franchisor absorbs it through extended terms, returns and closures — which is how record household indebtedness and expensive credit reach a company that does not itself run a credit book.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'The model in this platform describes an entity being dissolved',
        body:
          'The projection, the consolidated segments and the goodwill balance all describe the combined group. The separation was formalised on 2 September 2026 and will produce two independent companies with a jointly held holding for one brand. Any valuation of the current consolidated entity is a valuation of a transitional structure, and that should be stated rather than assumed away.',
        basis: 'REPORTED',
      },
      {
        heading: 'Goodwill impairment on a failed combination',
        body:
          'Goodwill recognised in a merger is tested against the cash flows of the units it was allocated to. A separation that reverses the combination, executed after a 62.5% decline in recurrent earnings, is exactly the circumstance in which that test becomes difficult to pass. An impairment would be non-cash but it would establish the size of the value destroyed.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Duplicated corporate structures on a weaker earnings base',
        body:
          'Two independent companies need two finance functions, two boards, two listings and two sets of systems, rebuilt at a moment when recurrent profit has fallen by nearly two thirds. The separation solves a governance problem by adding a cost problem.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'azza3-model-describes-a-dissolving-entity',
        title: 'The consolidated model is a snapshot of a structure that is being dismantled',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'On 2 September 2026 the group formalised the separation of its businesses into two independent companies, ending the union created by the 2024 merger, with one brand to sit in a jointly owned holding. Every consolidated figure in this platform — the segment mix, the goodwill balance, the synergy assumption embedded in the margin path — describes the combined entity, and the combined entity is being taken apart. That is not a reason to discard the model; it is a reason to read it as the opening balance of a sum-of-the-parts rather than as a going concern. The honest treatment is to value the footwear cluster and the apparel platform separately, on their own margins and their own capital, and to treat the goodwill and the duplicated corporate cost as the explicit cost of the round trip. Any single consolidated terminal value is answering a question that will not exist.',
        requires: [
          'The separation proceeding on the announced terms, with shareholder and regulatory approval',
          'Segment-level disclosure remaining sufficient to build the two halves separately',
        ],
        breaks: [
          'The separation being abandoned and the combined structure retained, which would restore the consolidated model as the right frame',
          'Terms materially different from those announced — a sale of one cluster to a third party rather than a split, for instance',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'The three segments are the building blocks of the sum-of-the-parts. Value footwear and apparel on their own margins rather than blending them into one EBITDA path.' },
          { assumption: 'Goodwill on the balance sheet', note: 'Goodwill of roughly a third of revenue was created by the merger being unwound. State whether the projection carries it, impairs it, or allocates it between the two successor entities.' },
          { assumption: 'SG&A as a share of revenue', note: 'Two independent structures cost more than one. The separation raises corporate overhead, and the margin path should show it rather than assume continuity.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'azza3-merger-round-trip',
        title: 'Two years and a 62.5% earnings decline to arrive back where it started',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The combination was sold on shared factories, distribution, customers and administrative structures. Those synergies never materialised at the expected intensity, the integration of footwear manufacturing with an apparel platform proved more complex than anticipated, and shared governance between two founders of comparable weight became the point of tension rather than the source of the value. Recurrent net income fell 62.5% year on year in the June 2026 quarter. The separation now reinstates the duplicated corporate cost the merger was meant to eliminate, requires independent structures for each company, and may eliminate whatever synergies did exist. The strategic error is already sunk; what is not yet in the numbers is the cost of undoing it, and the goodwill test that a reversed combination invites.',
        requires: [
          'Separation and restructuring costs being incurred over the next several reporting periods',
          'The earnings decline reflecting operating reality rather than one-off items that reverse',
        ],
        breaks: [
          'Recurrent earnings recovering toward the pre-merger run rate before the separation completes, which would suggest the decline was cyclical rather than structural',
          'The separation delivering a demonstrable cost saving — each company operating at a lower overhead ratio than the combined group did',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'The blueprint margin path rises across the projection. That embeds a synergy assumption the September 2026 separation contradicts; the path is the assumption this thesis disputes.' },
          { assumption: 'Effective tax rate and non-recurring items', note: 'Separation costs and any goodwill impairment are non-operating but not free. Model them explicitly rather than letting a recurring margin absorb them.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'azza3-separated-focus',
        title: 'Separated, each half is run by the person who built it, on an asset-light network',
        side: 'BULL',
        weight: 'SUPPORTING',
        rationale:
          'The reason this combination failed is also the reason the separation could work: two operators with genuine records in different businesses were forced to share a governance structure. Split, each returns to running the portfolio they built, with decision rights that match their economic interest and no need to negotiate sourcing or brand investment with a counterpart. The underlying assets are not damaged — the brands hold gross margin in the mid-fifties, the franchise network keeps capital expenditure near 3.5% of revenue, and the design content places most of the portfolio on the protected side of the platform competition that has destroyed unbranded apparel retail in Brazil. A focused footwear company and a focused apparel company, each with a clear controller, is a structure the market can underwrite; a two-headed group in dispute is not.',
        requires: [
          'Each successor company retaining the brand and design capability that produces the gross margin',
          'Franchise networks remaining financially viable through a period of expensive corporate credit',
          'The jointly held brand holding not becoming a new source of dispute between the two blocks',
        ],
        breaks: [
          'Gross margin compressing below the low fifties at either successor, indicating the brands rather than the structure were the problem',
          'Standalone overhead leaving each company with a lower operating margin than the combined group achieved',
          'Renewed conflict over the jointly owned holding, which would reproduce the flaw the separation is meant to remove',
        ],
        modelLink: [
          { assumption: 'Capex as a share of revenue', note: 'The franchise model is why capital expenditure is near 3.5% of revenue. That is the part of the asset-light case that survives the split, and it should be held rather than raised.' },
          { assumption: 'Gross margin', note: 'Mid-fifties gross margin is the evidence for the brands being intact. If the model assumes the margin holds, this thesis is what justifies it; if it assumes compression, the bear case is being priced.' },
        ],
        conviction: 'LOW',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Suno — Azzas 2154: separação entre Arezzo e Soma', url: 'https://www.suno.com.br/noticias/azzas-2154-azza3-separacao-arezzo-soma-birman-jatahy-mt/' },
      { label: 'Renova Invest — Azzas 2154 anuncia cisão em Arezzo&Co e SOMA; FARM Rio em holding conjunta', url: 'https://renovainvest.com.br/blog/cisao-azzas-2154/' },
      { label: 'Seu Dinheiro — Azzas 2154 será dividida entre Arezzo&Co e Soma', url: 'https://www.seudinheiro.com/2026/empresas/o-divorcio-saiu-azzas-2154-azza3-sera-dividida-entre-arezzoco-e-soma-e-farm-fica-no-meio-da-separacao-bdap/' },
      { label: 'Investidor10 — Azzas: fusão entre Arezzo e Soma pode estar com os dias contados', url: 'https://investidor10.com.br/noticias/azzas-azza3-fusao-entre-arezzo-e-soma-pode-estar-com-os-dias-contados-111636/' },
      { label: 'BPMoney — Azzas 2154 será dividida em Arezzo&Co e SOMA', url: 'https://bpmoney.com.br/mercado/azzas-2154-azza3-sera-dividida-em-arezzoco-e-soma/' },
    ],
  },
  {
    ticker: 'AMZN',
    sector: 'Consumer Discretionary',
    scope: 'UNITED_STATES',
    headline:
      'Classified as a retailer, but in the June 2026 quarter the cloud division produced 60.5% of consolidated operating income on 21.1% of revenue — and the company is now spending roughly $220 billion a year of capital to defend that.',
    howItEarns: [
      {
        heading: 'Retail is the revenue and cloud is the profit',
        body:
          'Retail-related revenue is roughly 74% of the total, cloud about 17% and advertising about 9%. The profit distribution is the opposite: in the June 2026 quarter the cloud segment earned 60.5% of consolidated operating income on 21.1% of revenue, with its margin expanding from 32.9% to 39.4% and operating income up 64%. North America retail earned a 7.9% margin, up from 7.5%.',
        basis: 'REPORTED',
      },
      {
        heading: 'Advertising is the third business and the least discussed',
        body:
          'Advertising revenue reached $19.8 billion in the June 2026 quarter, up 26% year on year, after four quarters around 22%. It is sold against purchase intent rather than attention, carries almost no incremental cost, and is therefore the highest-margin revenue in the company after cloud.',
        basis: 'REPORTED',
      },
      {
        heading: 'Subscription and third-party seller services monetise the network twice',
        body:
          'A marketplace seller pays commission, fulfilment and advertising on the same unit, and the subscription programme converts delivery economics into recurring revenue. The consequence is that the retail segment margin understates the profitability of the retail network, because part of it is collected in other lines.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, with the founder retaining a high-single-digit percentage stake and the executive chair role rather than the chief executive role.',
      voting: 'Single class of common stock, one share one vote — unusual among large founder-associated technology companies.',
      relatedPartyExposure: [
        'Equity investments in artificial intelligence companies that are also cloud customers, one of which produced a very large non-operating gain in the June 2026 quarter',
        'Operating as both the marketplace owner and a first-party seller competing with the sellers on it',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register, so economic and voting interests are aligned',
        'SEC segment reporting that discloses cloud, advertising and retail separately — which is what makes the profit concentration visible at all',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Segment disclosure is the governance feature that matters most here',
        body:
          'A conglomerate whose profit is concentrated in one segment can be assessed only if that segment is reported separately. This one is, and the disclosure is what allows a reader to see that 60.5% of operating income comes from 21.1% of revenue. Companies with similar internal cross-subsidies that do not disclose them cannot be analysed the same way.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A large investment gain inflated a reported quarter',
        body:
          'The June 2026 quarter included a very large non-operating gain on an equity stake in an artificial intelligence company that is also a cloud customer. It is a real mark and it is disclosed, but it is not operating income, and a reader using headline net income for that quarter is measuring a revaluation rather than a business.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Cloud switching costs built out of data gravity and commitments',
        mechanism:
          'Once applications, data and operational tooling are built against one cloud platform, moving them requires rewriting integrations and re-validating compliance, and egress and reserved-capacity commitments make the migration expensive before it is technically difficult. The cost of leaving falls on the customer, which is why the margin can expand while the market is competitive.',
        evidence: 'Segment operating margin expanding from 32.9% to 39.4% year on year with revenue growing 37% — pricing power and volume at the same time.',
        erodedBy: 'Workload portability through containers and open model-serving standards, plus large customers building their own silicon and capacity, which reduces the cost of running multi-cloud.',
        basis: 'REPORTED',
      },
      {
        label: 'Fulfilment density that a competitor must fund before it can use',
        mechanism:
          'Warehouses and delivery stations close enough to the population to support next-day delivery are a fixed-cost network: it is unprofitable until volume fills it and very hard to displace once filled, because a challenger must fund the whole network to match the delivery promise on any single order.',
        evidence: 'North America retail margin at 7.9%, up from 7.5%, on a network built through years of loss-making expansion.',
        erodedBy: 'Third-party logistics networks renting equivalent density to competitors, and regulatory or labour changes that raise the cost of the delivery workforce.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Advertising sold against purchase intent rather than attention',
        mechanism:
          'A search on a shopping site reveals an intent to buy a specific product, which is worth more to an advertiser than a demographic inference and requires no third-party tracking to target. Competing ad platforms must infer what this platform directly observes.',
        evidence: 'Advertising revenue of $19.8 billion in a quarter, growing 26% year on year and accelerating from roughly 22%.',
        erodedBy: 'Retail media networks at other large retailers replicating the format, and any decline in the platform\'s share of product search.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'No dividend and minimal buybacks; essentially all cash flow is reinvested. The reinvestment record is genuinely excellent in cloud and advertising and genuinely poor in devices and entertainment, and the current capital programme is the largest bet in the company\'s history.',
      good: [
        'Building the cloud business from internal infrastructure and letting it run at scale before harvesting margin — a segment now producing 60.5% of consolidated operating income',
        'Building advertising on top of existing retail traffic, which added a high-margin revenue line growing 26% with almost no incremental capital',
        'Early equity positions in artificial intelligence companies that are also cloud customers, which have appreciated substantially',
      ],
      bad: [
        'The 2020-2021 fulfilment and headcount overbuild, which doubled the network into a demand forecast that did not hold and required a multi-billion-dollar reversal and workforce reductions',
        'The devices and voice-assistant programme, which has absorbed a decade of investment and has never been shown to earn its cost of capital',
        'Raising 2026 cash capital expenditure guidance from roughly $200 billion to roughly $220 billion because memory prices rose — an increase driven by input cost rather than by additional capacity, which is the worst kind of capital escalation',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The sector label is doing no work here',
        body:
          'This is classified in Consumer Discretionary, and the global dossier for that sector describes brand owners and operators whose margin is decided by channel mix. Almost none of that applies. The relevant sector economics are those of cloud infrastructure and digital advertising, and the consumer dossier should be read only for the retail two-thirds of revenue that produces a minority of the profit.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Where the consumer dossier does apply: trade policy',
        body:
          'The suspension of the United States de minimis exemption cut sub-$800 parcel volume into the country by roughly 54%, which reshaped the position of every cross-border seller. For a marketplace whose third-party sellers include a large cross-border cohort, that is a direct effect on assortment and on the price of the competing offer.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Depreciation arriving before the revenue it was meant to serve',
        body:
          'Roughly $220 billion of annual capital expenditure converts into depreciation over a few years whether or not the demand materialises on schedule. The useful-life assumption on artificial-intelligence infrastructure is doing a great deal of work in reported margin, and shortening it would reduce earnings without any change in the business.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Cloud growth is now the whole equity story',
        body:
          'With 60.5% of operating income from one segment, a deceleration there cannot be offset by retail. The segment is growing 37% and expanding margin, which is precisely why a return to twenty-something growth would matter more to the valuation than anything happening in the stores.',
        basis: 'REPORTED',
      },
      {
        heading: 'Being the marketplace and a seller on it',
        body:
          'Competing with the sellers who pay commission, fulfilment and advertising fees is a recurring subject of competition enforcement in both the United States and Europe. The risk is not a fine; it is a remedy that separates the roles and removes one of the three profit pools.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'amzn-mix-shift',
        title: 'The mix is the margin: cloud and advertising are a quarter of revenue and most of the profit',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'In the June 2026 quarter the cloud segment delivered 60.5% of consolidated operating income on 21.1% of revenue, with margin expanding from 32.9% to 39.4% and operating income up 64%, while advertising grew 26% to $19.8 billion. Together those two lines are roughly a quarter of revenue and the large majority of the profit, and both carry structurally higher margins than retail. The consequence for a model is arithmetic rather than heroic: consolidated operating margin rises as long as the high-margin segments grow faster than retail, even if the retail margin does nothing at all. And retail is not doing nothing — North America improved from 7.5% to 7.9%. The thesis does not require a new product or a market that does not yet exist; it requires the existing mix shift to continue at a decelerating but positive rate.',
        requires: [
          'Cloud revenue growth staying well ahead of retail growth, and segment margin holding near the high thirties',
          'Advertising continuing to grow in the mid-twenties, which depends on retaining share of product search',
          'Retail margin at least stable, so the mix shift is not offset by deterioration in the largest revenue line',
        ],
        breaks: [
          'Cloud segment margin falling back toward the low thirties, which would mean the capital programme is being funded out of pricing',
          'Advertising decelerating below the mid-teens, indicating retail media competition is taking share of the format',
          'Retail margin compressing materially, which would absorb the mix benefit before it reaches consolidated earnings',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'This thesis is entirely a segment-mix argument. A single blended EBITDA margin cannot express it; the model needs cloud, advertising and retail with separate margins and separate growth rates.' },
          { assumption: 'EBITDA margin path', note: 'The margin path should rise as a consequence of the mix assumptions, not as an independent input. If it rises without the mix moving, the model is asserting the conclusion.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'amzn-capex-depreciation',
        title: 'A $220 billion capital programme is a depreciation forecast before it is a revenue forecast',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Cash capital expenditure guidance for 2026 was raised from roughly $200 billion to roughly $220 billion, and management attributed the increase to higher memory prices rather than to additional capacity. That is capital escalation without volume: the same infrastructure costs more, so the depreciation charge per unit of future revenue rises. Spending on this scale converts into a fixed charge over the following few years regardless of whether the demand arrives on the assumed schedule, and the useful life applied to artificial-intelligence infrastructure is an accounting estimate doing significant work in the reported cloud margin of 39.4%. The company has made this mistake once already at smaller scale: the 2020-2021 fulfilment overbuild was a demand forecast that did not hold, and unwinding it took years. The difference now is that the amounts are an order of magnitude larger and the assets depreciate faster.',
        requires: [
          'Capital expenditure remaining near the guided level or rising further',
          'Useful-life assumptions on accelerated-computing infrastructure staying at their current length',
        ],
        breaks: [
          'Cloud revenue growth sustaining above thirty percent for several years, which would fill the capacity before the depreciation peaks',
          'Capital intensity falling as a share of cloud revenue, showing the programme was a step change rather than a new run rate',
          'Memory and component costs reversing, which would remove the part of the increase that buys no capacity',
        ],
        modelLink: [
          { assumption: 'Capex as a share of revenue', note: 'This is the thesis. The blueprint capex ratio determines the depreciation schedule and therefore the margin; test the valuation at the guided level rather than at a historical average.' },
          { assumption: 'Depreciation and amortisation as a share of revenue', note: 'The vintage D&A schedule is where a shortened useful life shows up. Run a sensitivity on asset life, because that single estimate moves reported cloud margin by several points.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'amzn-three-companies',
        title: 'Three businesses with three cost of capitals inside one ticker',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'A capital-intensive cloud utility, a thin-margin logistics and retail network, and an advertising platform with almost no incremental cost do not share a risk profile, a reinvestment rate or a competitive dynamic — and valuing them with one discount rate and one terminal growth rate assumes they do. The disclosure is good enough to avoid this: segments are reported separately, which is how the 60.5%-of-profit-on-21.1%-of-revenue fact is even visible. The structural instruction is to build the valuation as a sum of the parts, with a capital-intensive segment carrying its own capital expenditure and depreciation, an advertising segment carrying almost none, and a retail segment whose true profitability is partly collected in the other two lines through commission, fulfilment and advertising fees. Any single-entity model of this company is producing a weighted average of three answers without stating the weights.',
        requires: [
          'Segment-level disclosure continuing at its current granularity',
          'The segments remaining operationally separable rather than being reorganised into a single reporting line',
        ],
        breaks: [
          'A reorganisation that merges the reported segments, which would remove the information the sum-of-the-parts depends on',
          'A regulatory remedy separating the marketplace from first-party retail, which would change the parts themselves',
        ],
        modelLink: [
          { assumption: 'WACC', note: 'A cloud utility, a retail network and an ad platform do not share a cost of capital. State whether the single WACC is a deliberate simplification and what the sum-of-the-parts would imply instead.' },
          { assumption: 'Terminal growth', note: 'Terminal growth for advertising, cloud and retail differ materially. A single terminal rate is an average that should be shown as one.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'CNBC — Amazon hikes 2026 capex to $220 billion due to higher memory costs', url: 'https://www.cnbc.com/2026/07/30/amazon-amzn-q2-earnings-report-2026.html' },
      { label: 'Beancount.io — Amazon Q2 2026: AWS accelerates 37%, segment profit concentration', url: 'https://beancount.io/blog/2026/07/31/amazon-fy2026-q2-earnings-analysis' },
      { label: 'Webull — Amazon Q2 2026 earnings recap', url: 'https://www.webull.com/blog/242-Amazon-AMZN-Q2-2026-Earnings-Recap' },
      { label: 'Investing.com — AWS growth must justify the $200 billion AI spending plan', url: 'https://www.investing.com/analysis/amazons-aws-growth-must-justify-its-200-billion-ai-spending-plan-200684076' },
      { label: 'Carra Globe — US de minimis exemption suspended 2026', url: 'https://carraglobe.com/us-de-minimis-exemption-suspended-2026/' },
    ],
  },
  {
    ticker: 'TSLA',
    sector: 'Consumer Discretionary',
    scope: 'UNITED_STATES',
    headline:
      'Record deliveries and record revenue in the June 2026 quarter produced a 1.4% operating margin — the car business now earns almost nothing, and the value rests on autonomy and on a storage division that is the best business in the company.',
    howItEarns: [
      {
        heading: 'Automotive: record volume, minimal profit',
        body:
          'Deliveries of 480,126 in the June 2026 quarter were the highest ever, up roughly 25% year on year, on record revenue of $28.2 billion. Operating margin was 1.4% and operating profit fell 57% year on year. Automotive gross margin excluding regulatory credits was 16.3%. Volume and profit have decoupled.',
        basis: 'REPORTED',
      },
      {
        heading: 'Energy storage is the highest-margin segment',
        body:
          'Storage deployments reached 13.5 GWh in the June 2026 quarter, up strongly both sequentially and year on year, and the energy generation and storage segment earned a 39.5% gross margin in the March 2026 quarter against 28.8% a year earlier. It is a grid-infrastructure business sold to utilities and developers, with a completely different customer and cycle from the cars.',
        basis: 'REPORTED',
      },
      {
        heading: 'Regulatory credits have essentially gone',
        body:
          'Credit revenue fell to $146 million in the June 2026 quarter, from $380 million in March 2026 and $439 million a year earlier — down 67% year on year. This was close to pure margin, so its disappearance removes profit without removing any cost, and it is why the operating margin fell while volume rose.',
        basis: 'REPORTED',
      },
      {
        heading: 'Software and autonomy: revenue recognised, service not yet proven at scale',
        body:
          'Driver-assistance software is sold as a one-off licence and a subscription, and a paid robotaxi service is operating in Austin, Dallas, Houston and Miami, with paid miles nearly doubling sequentially and, in Miami from early July, without a safety monitor on board. This is the line the equity value rests on, and it is the line with the least operating history.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder by stake, but effective control concentrated in a chief executive holding a low-to-mid-teens percentage and, after the November 2025 vote, an equity award that would take him materially higher. The board includes long-tenured directors and a family member of the chief executive.',
      voting: 'Single class of common stock, one share one vote. Reincorporated in Texas in June 2024, ahead of the state statute that privileges managerial autonomy and treats shareholder oversight as discretionary.',
      relatedPartyExposure: [
        'A chief executive who simultaneously leads several other large private companies, one of which supplies connectivity and another of which competes for artificial-intelligence talent and compute',
        'A board including a sibling of the chief executive and several directors of very long tenure',
        'Commercial and talent arrangements between the company and other entities controlled by the same individual',
      ],
      minorityProtections: [
        'One share one vote with no dual-class structure, so economic and voting interests are proportional',
        'SEC reporting and the annual shareholder vote on compensation, which in November 2025 was actually used',
        'Delaware litigation history establishing that a compensation award can be challenged in court, although the Delaware Supreme Court ultimately reversed the rescission of the 2018 package and the company has since left that jurisdiction',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'The November 2025 award and what it makes the incentive',
        body:
          'Shareholders approved a package potentially worth up to roughly $1 trillion with over 75% of votes cast in favour, with milestones running from $50 billion to $400 billion of annual adjusted profit and operational targets of 20 million vehicle deliveries, 10 million driver-assistance subscriptions, 1 million robots delivered and 1 million robotaxis in commercial operation. Whatever one thinks of the size, the effect on incentives is knowable: the chief executive is paid for volume and for autonomy milestones, not for margin or for return on capital.',
        basis: 'REPORTED',
      },
      {
        heading: 'The jurisdiction was changed and the oversight rules changed with it',
        body:
          'The company reincorporated in Texas in June 2024, months before that state overhauled its corporate statute in a direction that privileges managerial autonomy. At the 2025 meeting all environmental, social and governance proposals failed or were excluded, several ruled out of order under tightened procedural rules. A minority holder\'s protection here is proportional voting, not statutory challenge.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Manufacturing cost per vehicle at scale',
        mechanism:
          'Large castings, a simplified architecture, in-house battery and drive-unit production and very high plant utilisation produce a cost per vehicle that legacy manufacturers with lower volumes and outsourced components have not matched. The advantage is in the fixed-cost absorption, so it strengthens with volume and weakens sharply without it.',
        evidence: 'Automotive gross margin of 16.3% excluding regulatory credits while several competing electric programmes operate at negative gross margin.',
        erodedBy: 'Chinese manufacturers operating at comparable or lower cost with equal scale, and price competition that transfers the cost advantage to the consumer rather than to the shareholder.',
        basis: 'REPORTED',
      },
      {
        label: 'A fleet generating driving data the competition cannot buy',
        mechanism:
          'Millions of customer-owned vehicles with the sensor suite installed return real-world driving data continuously, which is the input to the autonomy system and cannot be replicated by a competitor without first selling a comparable fleet. The customer funds the data collection.',
        evidence: 'Paid robotaxi operations in four United States cities with paid miles nearly doubling sequentially, including operation without an onboard safety monitor in one market.',
        erodedBy: 'Autonomy proving to be solvable with simulation and smaller sensor-rich fleets, or a competitor reaching regulatory approval first in the markets that matter.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Storage manufacturing capacity contracted ahead of grid demand',
        mechanism:
          'Grid-scale storage is sold against multi-year utility procurement cycles, and the manufacturing capacity to serve them has to exist before the contract is signed. Committed cell supply and installed assembly capacity are what allow the segment to earn a 39.5% gross margin in a market where demand exceeds supply.',
        evidence: 'Energy segment gross margin of 39.5% in the March 2026 quarter, up from 28.8% a year earlier, with 13.5 GWh deployed in the June quarter.',
        erodedBy: 'Cell supply expanding faster than grid demand, which would turn a seller\'s market into a commodity one and compress the margin toward manufacturing norms.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'All cash reinvested, no dividend, no meaningful buyback. The manufacturing and storage investments have produced real returns; the vehicle programmes outside the core two models and the humanoid robot programme have not yet produced any, and the compensation structure is itself a capital allocation decision of unusual size.',
      good: [
        'Building the energy storage business into the highest-margin segment in the company, at 39.5% gross margin — a genuine second business created from internal battery capability',
        'Vertical integration of cells, drive units and software, which is the source of the automotive cost advantage and was expensive and unfashionable when it was undertaken',
        'Locating volume manufacturing close to the largest markets, which lowered both cost and tariff exposure ahead of trade policy turning',
      ],
      bad: [
        'The stainless-steel pickup programme required dedicated tooling, a bespoke material and a separate assembly process for volumes that have not justified any of it — the clearest example of engineering ambition allocated ahead of demand',
        'Committing capital and engineering to a humanoid robot programme with a compensation milestone attached to it before any revenue line exists, which inverts the normal order of evidence and spending',
        'The November 2025 equity award is dilution of roughly a tenth of the company contingent on milestones tied to volume and autonomy rather than to margin or return on capital, granted in the same year the operating margin fell to 1.4%',
        'Regulatory credits worth several hundred million dollars a quarter were treated as recurring for years; their 67% year-on-year decline exposed a cost base sized against income that was never going to persist',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The consumer dossier\'s pricing-power premise does not hold here',
        body:
          'The global Consumer Discretionary dossier describes brands that can raise price ahead of inflation without losing volume. This company has done the opposite: it has taken price down repeatedly to hold volume, which is why record deliveries coincide with a 1.4% operating margin. The relevant sector economics are those of automotive manufacturing, where fixed-cost absorption decides everything.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Tariffs and the sourcing map cut both ways',
        body:
          'The dossier names tariffs as a headwind arriving as a cost of goods increase. Localised manufacturing in the major markets reduces the exposure on finished vehicles, but cell and component sourcing remains concentrated, and the energy storage business depends on cell supply whose landed cost trade policy can change in a quarter.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'An operating margin of 1.4% has no absorption capacity',
        body:
          'At that level a single quarter of price competition, tariff cost or warranty provision moves the company to an operating loss on record volume. The margin is not a valuation input here, it is a solvency-of-the-thesis input: everything depends on autonomy and storage earning what the cars no longer do.',
        basis: 'REPORTED',
      },
      {
        heading: 'Autonomy is a regulatory outcome, not only a technical one',
        body:
          'Paid driverless operation exists in four cities. Scaling it requires per-jurisdiction approval, an insurance framework and a liability regime, none of which the company controls, and a single serious incident can reset the timeline in every market at once regardless of the underlying safety record.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Key-person concentration with an incentive pointed elsewhere',
        body:
          'The chief executive runs several other large companies and now holds an award whose milestones are volume and autonomy. The concentration risk is not only departure; it is attention, and a pay structure that does not reward the margin recovery the June 2026 quarter shows is needed.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'tsla-storage-underpriced',
        title: 'The storage business is the best asset in the company and not the reason anyone owns it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The energy generation and storage segment earned a 39.5% gross margin in the March 2026 quarter, up from 28.8% a year earlier, with 13.5 GWh deployed in the June quarter and growth both sequentially and year on year. That is more than twice the automotive gross margin excluding credits, on a product sold to utilities and developers against multi-year grid procurement rather than to consumers against a monthly payment. It is also a market where demand exceeds cell and assembly supply, which is why the margin is expanding rather than compressing. None of the equity narrative is about this segment, and none of the milestone structure in the November 2025 award rewards it. A sum-of-the-parts that values the storage business on its own margin and growth, against grid-infrastructure comparables rather than automotive ones, produces a materially different answer from a consolidated automotive model — and it requires no assumption about autonomy at all.',
        requires: [
          'Grid storage demand continuing to exceed available cell and assembly supply',
          'Energy segment gross margin holding above the mid-thirties',
          'Cell supply remaining contracted at costs that support that margin',
        ],
        breaks: [
          'Energy segment gross margin falling toward the twenties, which would indicate cell supply has caught up with grid demand',
          'Deployment growth stalling, which would mean the utility procurement cycle rather than manufacturing capacity is the constraint',
          'Cell costs rising faster than storage prices, compressing the segment toward manufacturing norms',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'The storage segment must be modelled separately with its own margin near 39% and its own growth; blending it into an automotive EBITDA margin destroys the entire thesis.' },
          { assumption: 'Terminal growth', note: 'Grid infrastructure and consumer automotive do not share a terminal growth rate. Say which one the single terminal rate is describing.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'tsla-car-business-earns-nothing',
        title: 'Record volume at a 1.4% operating margin means the car business is no longer the investment case',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The June 2026 quarter delivered 480,126 vehicles — an all-time record, up roughly 25% — on record revenue of $28.2 billion, and produced an operating margin of 1.4% with operating profit down 57% year on year. Automotive gross margin excluding regulatory credits was 16.3%, and the credits themselves fell to $146 million from $439 million a year earlier, a 67% decline in what was close to pure profit. This is the definition of volume without pricing power: the company held share by taking price, and the sector\'s fixed-cost absorption arithmetic did the rest. At a 1.4% operating margin there is no buffer for tariffs, a warranty provision or another round of price competition. Every dollar of the valuation above the storage business and the balance sheet is therefore a claim on autonomy revenue that does not yet exist at scale, and the compensation milestones confirm that is where management intends to look — volume and autonomy, not margin.',
        requires: [
          'Continued price competition in electric vehicles, particularly from manufacturers at comparable cost',
          'Regulatory credit revenue staying near the reduced level rather than recovering',
          'Autonomy revenue remaining immaterial to consolidated earnings in the near term',
        ],
        breaks: [
          'Automotive gross margin excluding credits recovering above the low twenties with volume growing',
          'Consolidated operating margin returning to high single digits without a one-off item',
          'Paid autonomy revenue becoming a disclosed, material segment with its own margin',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'This is the thesis. A margin path that recovers must name the mechanism — price, mix, credits or autonomy — because volume growth alone has demonstrably not produced margin.' },
          { assumption: 'Other operating income', note: 'Regulatory credits fell 67% year on year. Any projection carrying them at historical levels is modelling a policy subsidy as recurring revenue.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'tsla-incentive-and-jurisdiction',
        title: 'The governance structure tells you what will be optimised, and it is not margin',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'Three facts sit together. The company reincorporated in Texas in June 2024, months before that state adopted a statute privileging managerial autonomy and treating shareholder oversight as discretionary. At the 2025 meeting shareholders approved, with over 75% of votes cast, an award potentially worth up to roughly $1 trillion whose milestones are 20 million deliveries, 10 million driver-assistance subscriptions, 1 million robots and 1 million robotaxis alongside adjusted profit steps from $50 billion to $400 billion. And at that meeting all environmental, social and governance proposals failed or were excluded, several ruled out of order under tightened procedural rules. Read together they say that the chief executive is paid for volume and for autonomy deployment, that the forum for challenging a compensation decision has moved to a more deferential jurisdiction, and that procedural avenues for minority initiative have narrowed. This is not a claim that the company will be run badly — it is a claim about what a model should expect to be maximised, and a 1.4% operating margin in the same period is the evidence that margin is not on the list.',
        requires: [
          'The Texas incorporation and the approved award structure remaining in place',
          'Board composition continuing to include long-tenured and related directors',
        ],
        breaks: [
          'Milestone revision or board refreshment that ties compensation to return on capital or margin rather than to volume and deployment',
          'A demonstrated period of capital discipline — margin recovery prioritised over volume or over new programme launches',
        ],
        modelLink: [
          { assumption: 'Shares outstanding', note: 'The approved award is dilution of roughly a tenth of the company if fully earned. A per-share valuation that uses the current count is omitting a known, approved claim on equity.' },
          { assumption: 'Capex as a share of revenue', note: 'Milestones for robots and robotaxis imply capital committed before revenue. Expect capital intensity to follow the milestones rather than the returns.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'InsideEVs — Tesla Q2 2026 earnings: sales rise 25% as operating profit falls 57%', url: 'https://insideevs.com/news/802523/tesla-q2-2026-earnings-report/' },
      { label: 'TradingKey — Tesla Q2 2026: record $28.2bn revenue, operating margin 1.4%', url: 'https://www.tradingkey.com/analysis/stocks/us-stocks/262092507-tesla-tsla-q2-2026-earnings-margins-negative-fcf-recovery-test-tradingkey' },
      { label: 'Carbon Credits — Tesla Q1 2026 revenue and falling regulatory credits', url: 'https://carboncredits.com/tesla-q1-2026-hits-22-38b-revenue-but-do-weak-deliveries-and-falling-credits-expose-a-fragile-growth/' },
      { label: 'CNBC — Tesla shareholders approve Musk pay plan with over 75% in favour', url: 'https://www.cnbc.com/2025/11/06/tesla-shareholders-musk-pay.html' },
      { label: 'Bloomberg Law — Tesla shareholders show how far law will go to protect the board', url: 'https://news.bloomberglaw.com/legal-exchange-insights-and-commentary/tesla-shareholders-show-how-far-law-will-go-to-protect-the-board' },
      { label: 'Harvard Law Forum on Corporate Governance — What the Tesla decision means for executive compensation', url: 'https://corpgov.law.harvard.edu/2026/02/02/what-the-tesla-decision-means-for-executive-compensation-and-other-corporate-issues/' },
    ],
  },
  {
    ticker: 'HD',
    sector: 'Consumer Discretionary',
    scope: 'UNITED_STATES',
    headline:
      'A home improvement retailer that has spent roughly $24 billion buying its way into professional building-products distribution while housing turnover sits at historic lows — and stopped buying back its own shares to pay for it.',
    howItEarns: [
      {
        heading: 'Big-box retail to two customers with different economics',
        body:
          'Warehouse stores selling to do-it-yourself consumers and to professional contractors. The professional customer spends more per visit, buys more predictably, and is less sensitive to the discretionary cycle; the consumer customer carries the higher gross margin. Comparable sales turned positive 1.7% in the July 2026 quarter with 13 of 16 merchandising departments positive and online up 11% for a fifth consecutive quarter, and professional outperformed do-it-yourself.',
        basis: 'REPORTED',
      },
      {
        heading: 'A distribution business bolted on the side',
        body:
          'The acquired specialty trade distribution operation sells roofing, building products and drywall to contractors through branches and a delivery fleet — a different model with lower gross margin, higher asset turnover and a relationship rather than a store visit. It comped above the company average, 90% of stores closed a sale for it in the preceding twelve months, and management targets $400 million of system-wide cross-selling this year.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds; the founders have had no ownership role for decades and management holds a small percentage.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Supplier concentration in building products, where the company is large enough that its terms shape a supplier\'s economics',
        'The acquired distribution subsidiary selling to contractors who are also retail customers, so the channels compete for the same wallet',
      ],
      minorityProtections: [
        'Single voting class with a fully dispersed register',
        'Annual director elections and SEC segment and acquisition disclosure',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Guidance has been maintained rather than revised, which is a claim to test',
        body:
          'Fiscal 2026 guidance of roughly 2.5% to 4.5% total sales growth and flat to 2% comparable sales was maintained through the year. With comparable sales at 1.7% in the July quarter, the guidance is being met from the lower half of the range and from acquired revenue, which is worth separating.',
        basis: 'REPORTED',
      },
      {
        heading: 'Negative book equity makes the usual ratios uninformative',
        body:
          'Years of buybacks in excess of retained earnings left shareholders\' equity around or below zero. Return on equity is therefore meaningless here and leverage measured against equity is undefined. The right measures are return on invested capital and net debt to EBITDA, and any screen that uses equity-based ratios will misread this company entirely.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Store density that doubles as contractor distribution',
        mechanism:
          'A store within a short drive of most of the population serves both a consumer errand and a contractor resupply, and the same fixed asset is used for both. A competitor must fund the whole network before it can match the immediacy on any single order, and the land for large-format stores near population centres is largely built out.',
        evidence: 'Online sales up 11% for a fifth consecutive quarter, fulfilled substantially through the store base rather than through a separate network.',
        erodedBy: 'Specialist distributors serving the contractor with scheduled jobsite delivery, which removes the reason to visit a store at all — the very business the company has been buying.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Scale in purchasing on a narrow, repeatable assortment',
        mechanism:
          'Home improvement demand concentrates in a limited number of high-volume categories, so buying scale translates directly into cost per unit on items sold identically across thousands of stores. A regional competitor buys the same lumber and the same appliances at worse terms with no offsetting advantage.',
        evidence: 'Thirteen of sixteen merchandising departments posting positive comparable sales in a quarter when housing turnover was at historic lows.',
        erodedBy: 'Supplier consolidation shifting bargaining power, and tariff regimes that raise landed cost equally for everyone, which converts a relative advantage into an absolute cost.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Two decades of very heavy buybacks — enough to take book equity negative — followed by an abrupt pivot to acquisitions. The company has spent roughly $24 billion on professional distribution since March 2024 and paused the buyback to do it, which is the largest capital allocation decision in its history and is not yet proven.',
      good: [
        'Decades of disciplined store productivity investment rather than store count growth, which produced sector-leading sales per square foot and return on invested capital',
        'Cross-selling the acquired distribution business through the store base is showing early traction: it comped above the company average, 90% of stores closed a sale for it in twelve months, and there is a stated $400 million system-wide target',
        'Maintaining guidance through a period of frozen housing turnover rather than chasing comparable sales with promotional activity',
      ],
      bad: [
        'The $18.25 billion acquisition of the specialty trade distributor in March 2024 was the largest in company history and was funded by pausing share repurchases that had run $6 to $8 billion a year — buybacks fell to $649 million in the following fiscal year and the pause has continued, so shares were retired heavily at high prices and not at lower ones',
        'A further roughly $5.5 billion enterprise value spent on a drywall and building products distributor, completed in September 2025, takes the total committed to professional distribution to roughly $24 billion in eighteen months into a housing market at trough turnover',
        'The company has done this before: a professional distribution business assembled in the mid-2000s was sold at a substantial loss during the housing downturn, which is the direct precedent for the current strategy and is rarely mentioned alongside it',
        'Buying back stock until book equity went negative removed the balance-sheet capacity that would have made the acquisition programme comfortable rather than a choice between the two',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Housing turnover, not consumer confidence, is the cycle here',
        body:
          'Large discretionary renovation follows a house changing hands. With thirty-year mortgage rates near 6.4%, homeowner mobility is frozen and existing-home turnover is at historically low levels — management has said recent rate moves have not caused major new volatility, which is another way of saying the market has settled at a low level rather than deteriorating further.',
        basis: 'REPORTED',
      },
      {
        heading: 'The professional customer is the defence against the trough',
        body:
          'Repair and maintenance work continues regardless of whether houses are being sold, and the professional customer buys it. That is why professional demand outperformed do-it-yourself and why the acquired distribution business comped above the company average — the acquisitions are, among other things, a hedge against the turnover cycle the retail business is exposed to.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'A $24 billion acquisition programme into a trough',
        body:
          'Professional building-products distribution is a cyclical, thin-margin business whose volumes follow construction activity. Buying $24 billion of it at a housing trough can be countercyclical brilliance or the previous cycle\'s mistake repeated; the evidence will be return on invested capital three years out, not cross-sell announcements.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Leverage without an equity cushion',
        body:
          'With book equity around or below zero and roughly $24 billion of recent acquisition spending, the balance sheet depends entirely on cash generation. That cash generation is strong and stable, which is why it works — but it removes the option of absorbing a bad cycle with retained equity, and it is why the buyback has not resumed.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Tariffs on building products',
        body:
          'A meaningful share of the assortment is imported or contains imported inputs. Tariff changes arrive as landed cost and must be passed on into a market where the customer is already deferring discretionary projects, which is a demand problem rather than a margin problem.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'hd-pro-distribution-at-the-trough',
        title: 'Buying the professional channel at trough housing turnover is the right asset at the right point',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Repair and maintenance work does not wait for houses to change hands, and it is bought by contractors through distributors rather than by consumers in a store. The company has spent roughly $24 billion assembling that channel — $18.25 billion in March 2024 and roughly $5.5 billion more completed in September 2025 — at a moment when thirty-year mortgage rates near 6.4% have frozen homeowner mobility and existing-home turnover sits at historic lows. Acquiring cyclical distribution assets at the bottom of their cycle is how the return is made, and the integration evidence is early but real: the distribution business comped above the company average, 90% of stores closed a sale for it within twelve months, and there is a $400 million system-wide cross-selling target. Meanwhile the retail base is not broken — comparable sales turned positive 1.7% with 13 of 16 departments positive and online up 11% for a fifth consecutive quarter. When turnover normalises, both halves lever at once.',
        requires: [
          'Housing turnover eventually normalising from historic lows rather than settling permanently',
          'The distribution business sustaining above-company comparable growth and delivering the cross-sell target',
          'Retail comparable sales staying positive, so the acquisitions are additive rather than compensating',
        ],
        breaks: [
          'Return on invested capital declining through the integration period, indicating the acquisitions are diluting rather than adding',
          'The distribution business comping below the company average, which would remove the cross-sell rationale',
          'Mortgage rates staying above six percent long enough that low turnover becomes the structural level rather than a trough',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'Distribution is lower gross margin and higher asset turnover than retail. Model it separately or the consolidated margin decline will read as deterioration rather than mix.' },
          { assumption: 'Revenue growth path', note: 'Separate acquired revenue from comparable growth. Total sales growth of 2.5-4.5% against comps of flat to 2% is mostly acquisition, and a projection that blends them overstates organic momentum.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'hd-hd-supply-again',
        title: 'The company has already tried building professional distribution once, and sold it at a loss',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'A professional distribution arm was assembled in the mid-2000s and divested at a substantial loss during the housing downturn that followed. The current programme is larger — roughly $24 billion committed in eighteen months — and is being funded by stopping a share repurchase that had been running $6 to $8 billion a year, with buybacks falling to $649 million and staying suppressed. That sequencing is the uncomfortable part: shares were retired heavily when they were expensive and the programme stopped when they were cheaper, and the capital went instead into cyclical distribution assets whose volumes follow construction activity. Book equity is around or below zero, so there is no cushion if the cycle is unkind; the strategy depends on operating cash flow continuing to cover both the debt and the integration. None of this is disqualifying, but the burden of proof sits with management, and the precedent is theirs.',
        requires: [
          'Continued acquisition and integration spending in professional distribution',
          'The buyback remaining paused or suppressed relative to historical levels',
          'Housing and construction activity staying at or below current levels through the integration period',
        ],
        breaks: [
          'Return on invested capital rising through the integration, demonstrating the acquisitions earn above the cost of capital',
          'A resumed buyback alongside continued deleveraging, which would show the acquisition programme was funded from surplus rather than from the repurchase',
          'The distribution business proving countercyclical in a downturn rather than amplifying it',
        ],
        modelLink: [
          { assumption: 'Net debt to EBITDA', note: 'With negative book equity this is the only meaningful leverage measure. Model the acquisition debt explicitly and test the covenant headroom at a construction downturn, not at trend.' },
          { assumption: 'Buyback as a share of net income', note: 'The pause is a stated policy, not an oversight. A projection that assumes the historical repurchase rate is assuming the acquisition programme away.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'hd-negative-equity-measurement',
        title: 'Negative book equity makes the standard ratios meaningless, and that changes how it must be valued',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'Two decades of repurchases in excess of retained earnings left shareholders\' equity at or below zero. Return on equity is undefined or absurd, debt-to-equity is meaningless, and any screen built on book value will either exclude this company or rank it as distressed. Neither is right: the business earns high returns on the capital actually employed and generates cash reliably enough to service the roughly $24 billion of recent acquisition debt. The structural consequence for a model is specific — value it on return on invested capital and on net debt to EBITDA, not on equity ratios; treat the cost of equity as a function of cash flow stability rather than of balance-sheet gearing; and recognise that the equity has been deliberately hollowed out, so the downside protection that book value normally provides simply is not there. This is not a bull or bear point. It is the measurement framework, and getting it wrong produces a wrong answer in either direction.',
        requires: [
          'Book equity remaining at or below zero, which it will while buybacks exceed retained earnings cumulatively',
          'Operating cash flow remaining stable enough to service acquisition debt without an equity cushion',
        ],
        breaks: [
          'Sustained retained earnings rebuilding positive book equity, which would restore the conventional ratios',
          'An equity issuance, which would recapitalise the balance sheet and change the framework',
        ],
        modelLink: [
          { assumption: 'Opening balance sheet equity', note: 'The projection inherits negative or near-zero equity. Check that the balance-sheet roll-forward and any equity-based covenant test tolerate it rather than treating it as a data error.' },
          { assumption: 'WACC', note: 'A conventional debt-to-equity weighting is undefined at zero equity. State whether the WACC uses market capitalisation weights, and say so, because the book-value calculation cannot be done here.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Investing.com — Home Depot Q2 2026 earnings call transcript', url: 'https://www.investing.com/news/transcripts/earnings-call-transcript-home-depot-beats-q2-2026-estimates-shares-rise-93CH-4865627' },
      { label: 'BigGo Finance — HD Q2 2026: 1.7% comp growth, online up 11%', url: 'https://finance.biggo.com/news/US_HD_2026-08-18' },
      { label: 'Home Depot IR — Agreement for SRS Distribution to acquire GMS', url: 'https://ir.homedepot.com/news-releases/2025/06-30-2025-130354727' },
      { label: 'Modern Distribution Management — Home Depot, SRS complete $5.5bn GMS acquisition', url: 'https://www.mdm.com/news/top-distributor-sectors/building-materials-construction/home-depot-srs-complete-5-5b-gms-acquisition/' },
      { label: 'Hudson Labs — Home Depot: Pro ecosystem expansion, SRS integration and the path to margin recovery', url: 'https://www.hudson-labs.com/research/home-depot-inc-hd-equity-initiation-report-pro-ecosystem-expansion-srs-integration-and-the-path-to-margin-recovery' },
      { label: 'FXEmpire — Home Depot earnings preview: can Pro demand offset a weak housing market?', url: 'https://www.fxempire.com/forecasts/article/home-depot-earnings-preview-can-pro-demand-offset-a-weak-housing-market-1617130' },
    ],
  },
  {
    ticker: 'MCD',
    sector: 'Consumer Discretionary',
    scope: 'UNITED_STATES',
    headline:
      'A property and royalty company with a restaurant brand attached: about 95% of the restaurants are franchised, rent scales from 8.5% of sales on legacy sites to over 15.75% on expensive builds, and the value strategy depends on franchisees who have only partly adopted it.',
    howItEarns: [
      {
        heading: 'Royalty and rent, not hamburgers',
        body:
          'Roughly 95% of restaurants are operated by franchisees. The company collects a royalty plus advertising fund contribution of around 8% of sales and, where it owns or controls the site, rent scaling from about 8.5% on legacy locations to 15.75% or more on expensive new builds. Systemwide sales exceeded $34 billion in the March 2026 quarter and grew 11% as reported, 6% in constant currency, while company revenue is a fraction of that — the difference is the whole business model.',
        basis: 'REPORTED',
      },
      {
        heading: 'The real estate is the durable half',
        body:
          'Rent is contracted, percentage-based and senior to the franchisee\'s own profit, so it varies with sales but not with the franchisee\'s cost inflation. That makes the rent line more stable than a restaurant margin and gives the company a claim on the location\'s productivity independent of who operates it.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds. The most consequential constituency is not a shareholder at all: the franchisee base, whose cooperation is required for any system-wide strategy.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Franchise and lease agreements with thousands of operators, where the company is simultaneously licensor, landlord and supplier of the marketing programme',
        'Advertising fund contributions collected from franchisees and spent by the company on their behalf',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register and annual director elections',
        'SEC disclosure including systemwide sales, which is what allows the royalty-and-rent structure to be analysed separately from company revenue',
        'Franchise disclosure documents, which publish the royalty and rent economics that shareholders would otherwise have to infer',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The franchisee is a governance constituency with a veto in practice',
        body:
          'Only 60% to 65% of the United States system had consistently implemented the company\'s new sub-$3 value menu. A licensor can require a great deal contractually and still cannot force an owner-operator to price below the level at which their own restaurant makes money. Any strategy that depends on franchisee margin sacrifice arrives partially, and the reported comparable sales reflect the partial version.',
        basis: 'REPORTED',
      },
      {
        heading: 'Negative book equity by design',
        body:
          'Decades of refranchising and buybacks funded with debt left shareholders\' equity below zero. The structure is deliberate — a royalty and rent stream supports more leverage than an operating restaurant business — but it means equity-based ratios are uninformative and the downside protection normally provided by book value does not exist.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Site control on locations selected over seventy years',
        mechanism:
          'Owning or holding long leases on the corner sites with the best traffic means the rent is collected from the location\'s productivity rather than negotiated against a competitor for it. A new entrant cannot acquire an equivalent portfolio because the sites are not available, and the incumbent\'s cost basis on them is decades old.',
        evidence: 'Percentage rent scaling from around 8.5% of sales on legacy sites to over 15.75% on new builds — a spread that only a very long-held portfolio produces.',
        erodedBy: 'A durable shift of the occasion to delivery, where the site\'s traffic advantage stops mattering and the aggregator captures the margin instead.',
        basis: 'REPORTED',
      },
      {
        label: 'Advertising scale funded by the system, not the company',
        mechanism:
          'An advertising fund contribution collected as a percentage of every franchisee\'s sales buys national media at a cost per impression no independent operator or regional chain can approach, and the company directs the spend without funding it from its own margin.',
        evidence: 'Global comparable sales up 3.8% in the March 2026 quarter with menu innovation cited as the driver — a national campaign effect.',
        erodedBy: 'Media fragmentation raising the cost of reaching a national audience, and the same aggregator apps giving smaller competitors equivalent demand access.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Refranchising converted an operating business into a royalty and rent stream, and the released capital was returned through buybacks and dividends funded with debt. The model works and the capital discipline is real; the failures have been in adjacent concepts and in strategies that depend on franchisee cooperation.',
      good: [
        'Refranchising to roughly 95% of the system, which removed restaurant operating risk and labour cost inflation from the company\'s own margin while retaining a claim on sales through royalty and rent',
        'Owning or controlling the underlying real estate rather than licensing a brand alone, which is the difference between this company and every other large franchisor',
        'Investing in digital ordering, loyalty and delivery integration through the system, which raised average ticket without company-funded restaurant capital',
      ],
      bad: [
        'A separate small-format beverage concept was piloted and shut down in 2025 after the capital and management attention had been committed, a reminder that new formats in this system have a poor record',
        'A personalisation technology business was acquired and subsequently divested, which returned the capability to a third party after the company had paid to own it',
        'The refranchising and buyback programme was funded with debt to the point of negative book equity, which leaves no balance-sheet absorption if the royalty stream is disrupted rather than merely slowed',
        'The value strategy was launched system-wide when only 60% to 65% of United States restaurants would consistently implement it — a plan that required franchisee margin sacrifice without first securing it',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The franchise economics the sector dossier describes, in their purest form',
        body:
          'The dossier notes that a franchised unit contributes a royalty with almost no capital, so a company that is half franchised has two businesses inside one revenue line. This one is 95% franchised, which resolves the ambiguity: the revenue line is a royalty and a lease book, and unit growth translates into margin almost without capital.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Trade-down beneficiary in theory, casualty in practice this cycle',
        body:
          'A consumer trading down from casual dining should arrive here. But United States same-store sales grew just 0.8% in the June 2026 quarter after 3.8% globally in March, and management pointed to lower-income consumers pulling back. When the trade-down customer is the one who has run out of money, the trade-down hedge does not work.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The low-income consumer is the customer and the customer has stopped',
        body:
          'United States same-store sales slowed to 0.8% in the June 2026 quarter, and lower-income consumers pulling back was the stated cause. This segment has no trade-down destination left, so the volume does not reappear elsewhere in the system — it leaves the category.',
        basis: 'REPORTED',
      },
      {
        heading: 'A value strategy the system will not fully execute',
        body:
          'With only 60% to 65% of United States restaurants consistently implementing the sub-$3 menu, the national advertising promises a price that a third of locations do not honour. That damages the brand claim as well as the traffic, and it cannot be fixed by the company alone.',
        basis: 'REPORTED',
      },
      {
        heading: 'Delivery aggregators standing between brand and customer',
        body:
          'Where the occasion moves to delivery, the aggregator owns the customer relationship, takes a commission from the franchisee and weakens the site advantage that underpins the rent. The company\'s response has been its own app and loyalty programme, which is the right response and an admission of the risk.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'mcd-royalty-and-rent',
        title: 'This is a lease book and a royalty stream, and it should be valued as one',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'About 95% of restaurants are franchised. The company collects roughly 8% of sales as royalty and advertising contribution and, on sites it controls, percentage rent running from around 8.5% on legacy locations to over 15.75% on expensive builds. Systemwide sales exceeded $34 billion in the March 2026 quarter; company revenue is a fraction of that, and the gap is the point. What a model should be projecting is systemwide sales multiplied by a contractual take rate, minus a corporate overhead that barely scales, not a restaurant margin on a restaurant revenue line. The consequences are specific: incremental units require almost no company capital, so growth is unusually cash-generative; the rent is senior to the franchisee\'s profit, so it is more stable than a restaurant margin through a downturn; and the negative book equity is a deliberate consequence of a royalty stream supporting more leverage than an operating business could. Getting this frame wrong produces a valuation of a restaurant chain that does not exist.',
        requires: [
          'The franchised share remaining near 95% with royalty and rent terms substantially unchanged',
          'Systemwide sales disclosure continuing, since company revenue alone cannot support the analysis',
          'Franchisee financial health sufficient to pay both royalty and percentage rent',
        ],
        breaks: [
          'A material return to company-operated restaurants, which would reintroduce restaurant operating risk to the margin',
          'Franchisee distress forcing royalty or rent concessions, which would make the contractual take rate a negotiated one',
          'Regulatory intervention in franchise agreements changing the permitted royalty or rent structure',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and price', note: 'Model systemwide sales as the volume driver and the royalty plus rent take rate as the price. A revenue line built from company revenue alone cannot express unit growth economics.' },
          { assumption: 'Capex as a share of revenue', note: 'A 95%-franchised system needs very little company capital for unit growth. Capital intensity should reflect the real estate and technology programme, not restaurant construction.' },
          { assumption: 'Opening balance sheet equity', note: 'Negative equity is structural here. Verify the balance-sheet roll-forward and any equity-based covenant handles it rather than flagging it as a data failure.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'mcd-value-not-implemented',
        title: 'A value strategy that a third of the system will not run is not a strategy',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Only 60% to 65% of United States restaurants had consistently implemented the new sub-$3 value menu, while national advertising promoted it to everyone. That gap is the whole problem: the customer is told a price, a third of locations do not offer it, and the brand pays for the disappointment in traffic it cannot reacquire cheaply. United States same-store sales grew 0.8% in the June 2026 quarter, sharply decelerating, with lower-income consumers pulling back as the stated cause. The structural difficulty is that the company cannot fix this unilaterally — a franchisee at 8% royalty plus 8.5% to 15.75% rent has a thin enough margin that a sub-$3 price point can be genuinely unprofitable for them, so the refusal is rational rather than obstinate. Either the company subsidises the price, which moves the cost into its own margin, or it accepts partial implementation and the traffic it produces. Both outcomes are worse than the strategy as presented.',
        requires: [
          'Franchisee margins staying tight enough that the value price point is unprofitable at store level',
          'The lower-income consumer remaining under pressure, so value is the required proposition',
        ],
        breaks: [
          'Implementation reaching the high nineties across the United States system, which would remove the promise-versus-delivery gap',
          'United States comparable sales reaccelerating to the mid single digits with traffic growth rather than ticket',
          'A restructured value programme funded by the company or by suppliers rather than by franchisee margin',
        ],
        modelLink: [
          { assumption: 'Revenue growth path', note: 'United States comparable sales at 0.8% is the relevant base rate, not the 3.8% global figure. A growth path above that must name the mechanism.' },
          { assumption: 'EBITDA margin path', note: 'If the company funds the value price point rather than the franchisee, the cost lands in its own margin. Say which of the two the projection assumes.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'mcd-capital-light-compounding',
        title: 'Unit growth on someone else\'s balance sheet compounds without capital',
        side: 'BULL',
        weight: 'SUPPORTING',
        rationale:
          'A franchised restaurant is built with the franchisee\'s capital, staffed with the franchisee\'s labour and exposed to the franchisee\'s food cost inflation, and it remits roughly 8% of sales as royalty and advertising fund plus percentage rent on the site. The company\'s incremental cost of that unit is close to zero. Systemwide sales exceeding $34 billion and growing 11% as reported, 6% in constant currency, therefore translate into company earnings with almost no reinvestment requirement — which is why this business can return essentially all of its cash flow and still grow. Average unit volumes around $4.1 million mean each new site is a meaningful annuity. The sector dossier names franchise unit economics as one of the structural drivers, and this is the cleanest expression of it available: growth that does not consume capital, in a category where the brand has national advertising scale funded by the system rather than by the shareholder.',
        requires: [
          'Continued net unit growth, predominantly franchised, in markets with acceptable average unit volumes',
          'Franchisees able to obtain construction financing at rates that make a new unit viable',
          'Royalty and rent take rate holding on new builds at the upper end of the range',
        ],
        breaks: [
          'Net unit growth stalling, which removes the compounding mechanism entirely',
          'New-build economics deteriorating so that franchisees stop opening, which shows first as a falling development pipeline',
          'Average unit volumes declining, which would make each new site a smaller annuity and cannibalisation a real cost',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume growth', note: 'Unit count and average unit volume are the two drivers. Model them separately so cannibalisation — more units at lower volumes — is visible rather than hidden in a single growth rate.' },
          { assumption: 'Dividend payout and buyback', note: 'A capital-light model can return nearly all cash flow. The payout assumption should follow from the low reinvestment requirement, not be set independently of it.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'McDonald\'s — First quarter 2026 results', url: 'https://mcdonalds.mediaroom.com/2026-05-07-McDONALDS-REPORTS-FIRST-QUARTER-2026-RESULTS' },
      { label: 'McDonald\'s — Second quarter 2026 results', url: 'https://corporate.mcdonalds.com/corpmcd/our-stories/article/Q2-2026-results.html' },
      { label: 'Restaurant Dive — Value and menu innovation drive positive Q1 comparable sales', url: 'https://www.restaurantdive.com/news/mcdonalds-q1-2026-positive-comp-sales-value-menu-innovation/819554/' },
      { label: 'Franchise Investor Data — McDonald\'s franchise AUV and 2026 FDD royalty and rent structure', url: 'https://franchiseinvestordata.com/franchise/mcdonalds' },
      { label: 'Investing.com — McDonald\'s navigates 2026 between stability and selective growth', url: 'https://www.investing.com/analysis/mcdonalds-navigates-2026-between-stability-and-selective-growth-200675224' },
    ],
  },
  {
    ticker: 'NKE',
    sector: 'Consumer Discretionary',
    scope: 'UNITED_STATES',
    headline:
      'Flat revenue of $46.4 billion in fiscal 2026 with gross margin down 320 basis points, working through the consequences of abandoning wholesale and then needing it back — while a dual-class structure means the holders of the listed shares cannot elect a majority of the board.',
    howItEarns: [
      {
        heading: 'Design and marketing, with manufacturing contracted out',
        body:
          'Footwear and apparel designed in-house, manufactured by contract suppliers in Asia, and sold through wholesale accounts and direct channels. The company owns no factories, so the gross margin is the spread between a contracted landed cost and the price the brand supports — which is why sourcing cost and tariffs move the margin directly.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Channel mix decides the reported margin more than demand does',
        body:
          'The same shoe sold direct earns roughly twice the revenue and a higher gross margin than one sold to a wholesaler, but carries the store, the marketing and the returns. Fiscal 2026 revenue was $46.4 billion, flat as reported and down 2% currency-neutral, with wholesale returning to growth — up 11% in North America in the first quarter and, in the fourth, $6.6 billion up 4% reported and 1% currency-neutral, with North America growth partly offset by declines in Greater China.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'A dual-class structure in which the founder\'s family interests hold Class A shares that elect a majority of the board, while the publicly traded Class B shares elect a minority. Economic ownership and control are therefore separated, and a Class B holder cannot change the board composition regardless of the size of their position.',
      voting: 'Two classes. Class A, not publicly traded, elects the majority of directors; publicly traded Class B elects the remainder. This is the single most important governance fact about the company.',
      relatedPartyExposure: [
        'A founding-family holding structure that controls board composition without a proportional economic stake',
        'Contract manufacturing concentrated in a small number of suppliers in a small number of countries, where the company is large enough to shape supplier economics',
      ],
      minorityProtections: [
        'SEC reporting including channel, geographic and gross margin disclosure sufficient to analyse the wholesale reset independently of management commentary',
        'Class B shareholders elect a minority of the board, which is a voice rather than a control right',
        'Delaware fiduciary duties apply to the controlling holder in related-party dealings',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Control is structural and permanent absent a family decision',
        body:
          'The Class A share class elects a majority of directors and is not publicly traded. A minority holder dissatisfied with strategy — including the direct-to-consumer pivot that caused the margin damage now being repaired — has no mechanism to change management. That is not a criticism of the current board; it is a description of where the accountability sits, and it belongs in the cost of equity.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The fourth-quarter margin was flattered by a one-off recovery',
        body:
          'In the fourth quarter of fiscal 2026 the expected recovery of $986 million of tariffs raised gross margin by approximately 900 basis points. That is a genuine cash item and it is disclosed, but it is not operating improvement, and a reader taking the fourth-quarter gross margin as the new run rate is off by roughly nine percentage points.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Brand equity built by decades of marketing at a scale competitors cannot fund',
        mechanism:
          'Sustained global marketing spend and athlete association over decades create a willingness to pay that a newcomer cannot compress into a few seasons, because the association itself requires time to accumulate. The brand is what lets a contracted landed cost support a multiple of itself at retail.',
        evidence: 'Gross margin sustained in the low-to-mid forties even through a 320 basis point contraction driven by discounting and tariffs.',
        erodedBy: 'Performance-led challengers taking the credibility in specific sports, which is where brand authority is actually earned and where running and training share has been contested.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Sourcing scale across a contracted supplier base',
        mechanism:
          'Volume across a small number of large contract manufacturers buys unit costs and capacity priority that a smaller brand cannot obtain, and it funds the development capability at those factories. The supplier\'s investment in tooling for this company\'s products is itself a switching cost in both directions.',
        evidence: 'A contracted manufacturing base able to absorb a roughly $1.5 billion annualised tariff cost partly through sourcing reallocation rather than price alone.',
        erodedBy: 'Tariffs applied by country of origin, which raise landed cost equally for everyone and turn a relative scale advantage into an absolute cost the brand must absorb or pass on.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Consistent dividends and large buybacks funded from a historically high-margin business, with the capital of the last cycle directed into a direct-to-consumer build-out that has had to be partially reversed. The strategic capital allocation, not the financial kind, is where the damage was done.',
      good: [
        'Remaining asset-light in manufacturing, which kept capital intensity low and made the sourcing footprint reconfigurable when tariffs arrived',
        'Reorganising the product and merchandising teams by sport under the current programme, which has produced more than 20% growth in running — the category where brand authority is actually earned',
        'Restoring wholesale distribution, with North America up 11% in the first quarter of fiscal 2026, rather than defending the direct-only strategy for another cycle',
      ],
      bad: [
        'Cutting wholesale accounts to force consumers into owned channels surrendered shelf space that competitors took immediately, and returning to those accounts has meant returning on worse terms — the exact failure mode the sector dossier names, executed at the largest possible scale',
        'The resulting inventory had to be cleared through wholesale and factory-store discounting, which is a primary cause of the 320 basis point gross margin contraction in fiscal 2026',
        'Buybacks were executed heavily through the period when the direct-to-consumer strategy was inflating reported revenue per unit, so capital was returned at valuations that assumed the strategy was working',
        'Greater China declined while North America recovered, and the region was managed through the same direct-channel playbook that failed in the larger market',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The textbook case of the dossier\'s channel-mix mechanic',
        body:
          'The global Consumer Discretionary dossier states that most reported margin movement in this sector is the direct-versus-wholesale mechanic rather than underlying demand, and names abandoning wholesale and needing it back as a specific failure mode. Fiscal 2026 is that in the numbers: flat revenue, gross margin down 320 basis points on wholesale and factory-store discounting, and wholesale returning to growth at lower margin.',
        basis: 'REPORTED',
      },
      {
        heading: 'Tariffs as a cost that arrives in a quarter and takes years to engineer around',
        body:
          'New reciprocal tariffs represent an annualised cost headwind of roughly $1.5 billion, which management expects to remain material and to limit near-term margin recovery. A brand that owns no factories still owns a sourcing footprint, and moving it takes years while the cost lands immediately.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'A $1.5 billion annualised tariff cost against flat revenue',
        body:
          'On revenue of $46.4 billion, roughly $1.5 billion of annualised tariff cost is more than three points of margin that must be absorbed, passed on or sourced around. Passing it on into a consumer already trading down risks the volume; absorbing it is the 320 basis points already visible.',
        basis: 'REPORTED',
      },
      {
        heading: 'Greater China declining while the brand repairs North America',
        body:
          'Fourth-quarter wholesale growth in North America was partly offset by declines in Greater China. A market where local performance brands have gained genuine credibility is harder to recover than one where the issue was distribution, because the problem is brand authority rather than shelf space.',
        basis: 'REPORTED',
      },
      {
        heading: 'Price increases consuming the brand rather than exercising it',
        body:
          'The dossier\'s distinguishing test is unit volume: a brand raising price with flat units is exercising power, one raising price with falling units is harvesting it. With revenue flat and currency-neutral revenue down 2%, the company is at the point where that distinction matters most and is hardest to read.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'nke-wholesale-reset-complete',
        title: 'The reset is a distribution repair, and the distribution is being repaired',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The damage of the last three years was self-inflicted and channel-shaped: cutting wholesale accounts surrendered shelf space, the recovered inventory had to be discounted, and the 320 basis point gross margin contraction in fiscal 2026 followed from discounting and product cost rather than from the brand losing its consumer. The repair is visible in the same disclosures. Wholesale returned to growth — up 11% in North America in the first quarter, and $6.6 billion up 4% reported in the fourth — and running, the category where performance credibility is actually established, delivered more than 20% growth under a product organisation now structured by sport. A distribution problem is a two-to-three-year problem with a known end; a brand problem is not. If this is the first kind, revenue growth resumes from a base with the discounting already in the comparison, and gross margin recovers as the inventory clears — with tariffs as the offset rather than the obstacle.',
        requires: [
          'Wholesale revenue continuing to grow currency-neutral, not only as reported',
          'Inventory and markdown rates normalising so gross margin recovers from the fiscal 2026 base',
          'Running and other performance categories sustaining double-digit growth as evidence the brand authority is intact',
        ],
        breaks: [
          'Currency-neutral revenue declining for a further year, which would place the problem in demand rather than distribution',
          'Gross margin failing to recover once the excess inventory has cleared, indicating the wholesale return is on permanently worse terms',
          'Performance category growth stalling, which would mean the brand rather than the channel is the issue',
        ],
        modelLink: [
          { assumption: 'Gross margin', note: 'This thesis is a gross margin recovery from the fiscal 2026 base. Exclude the fourth-quarter one-off tariff recovery of roughly 900 basis points from the starting point, or the recovery is already double-counted.' },
          { assumption: 'Segment shares and margins', note: 'Model wholesale and direct separately with their own margins. A blended margin cannot express a channel-mix repair, which is the entire argument.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'nke-tariff-and-one-off',
        title: 'The tariff cost is permanent and the margin that looked recovered was a refund',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Two facts sit uncomfortably together. New reciprocal tariffs represent an annualised cost headwind of roughly $1.5 billion — more than three points of margin on $46.4 billion of revenue — and management expects them to remain material, limiting near-term margin recovery. And the fourth-quarter gross margin, which read as the turn, was raised approximately 900 basis points by the expected recovery of $986 million of previously paid tariffs. Strip the refund and the underlying margin is still where the 320 basis point contraction left it, with the recurring tariff cost still to be absorbed. Revenue was flat as reported and down 2% currency-neutral, so there is no volume growth to dilute a fixed cost against, and the consumer being asked to absorb a price increase is the same one who has been trading down. Sourcing reallocation is the structural answer and it takes years, during which the cost is in every quarter.',
        requires: [
          'The tariff regime remaining in place at approximately the current annualised cost',
          'Revenue staying flat to slightly down currency-neutral, so there is no operating leverage to offset',
          'The one-off refund not recurring at similar scale',
        ],
        breaks: [
          'Tariff rates being reduced or the sourcing footprint relocated faster than expected, removing the recurring cost',
          'Price increases sticking with unit volumes flat, which would prove the brand can pass the cost through',
          'Currency-neutral revenue returning to mid single-digit growth, which would dilute the fixed cost',
        ],
        modelLink: [
          { assumption: 'Gross margin', note: 'Carry the roughly $1.5 billion annualised tariff cost as a recurring charge in cost of goods, and do not use the fourth-quarter reported margin as the base — it includes a $986 million refund worth about 900 basis points.' },
          { assumption: 'Revenue build-up: price growth', note: 'Passing tariffs on is a price assumption with a volume consequence. A model that raises price without reducing volume has assumed the pass-through is free.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'nke-dual-class',
        title: 'Class B holders fund the company and elect a minority of the board',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'The publicly traded shares elect a minority of the directors; the Class A shares, held by founding-family interests and not publicly traded, elect the majority. This is not a technicality in a company that has just spent three years reversing a strategy the market questioned throughout: a Class B holder who was right about the direct-to-consumer pivot had no mechanism to act on being right. The structural consequence for a valuation is a governance premium in the cost of equity that does not go away with better results, and the absence of two things a dispersed company has — a credible activist threat and a takeover floor. It cuts the other way too, and honestly so: permanent control allows a multi-year brand investment that a quarterly-accountable board might not fund, which is arguably what the current product reorganisation requires. The point is that the protection a minority holder has here is disclosure and fiduciary duty, not votes, and the model should say so rather than assume the usual accountability mechanisms are available.',
        requires: [
          'The dual-class structure remaining in place with Class A electing a board majority',
          'Class A shares remaining outside public trading',
        ],
        breaks: [
          'Collapse of the dual-class structure into a single class, which would restore proportional accountability and a takeover floor',
          'A sunset provision or conversion event materially reducing Class A control',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Carry an explicit governance premium for a structure in which the listed shares cannot elect the board majority, and state its size rather than folding it into beta.' },
          { assumption: 'Terminal value', note: 'A controlled company has no takeover floor. State whether the terminal value assumes perpetual independence, because here that is not an option the market can override.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'NIKE, Inc. — Fiscal 2026 fourth quarter and full year results', url: 'https://investors.nike.com/investors/news-events-and-reports/investor-news/investor-news-details/2026/NIKE-Inc--Reports-Fiscal-2026-Fourth-Quarter-and-Full-Year-Results/default.aspx' },
      { label: 'Business Wire — NIKE, Inc. reports fiscal 2026 fourth quarter and full year results', url: 'https://www.businesswire.com/news/home/20260630156660/en/NIKE-Inc.-Reports-Fiscal-2026-Fourth-Quarter-and-Full-Year-Results' },
      { label: 'NIKE, Inc. — Fiscal 2026 first quarter results', url: 'https://investors.nike.com/investors/news-events-and-reports/investor-news/investor-news-details/2025/NIKE-Inc--Reports-Fiscal-2026-First-Quarter-Results/default.aspx' },
      { label: 'NIKE, Inc. — Fiscal 2026 third quarter results', url: 'https://about.nike.com/en/newsroom/releases/nike-inc-reports-fiscal-2026-third-quarter-results' },
      { label: 'Yahoo Finance — Margins under fire: can NIKE\'s Win Now actions bring long-term gains?', url: 'https://finance.yahoo.com/news/margins-under-fire-nikes-win-162300109.html' },
    ],
  },
  {
    ticker: 'SBUX',
    sector: 'Consumer Discretionary',
    scope: 'UNITED_STATES',
    headline:
      'An operating turnaround that is working — comparable sales up 7.9% globally and margin up 430 basis points — achieved by removing discounts rather than adding them, while the second-largest market was sold to a private equity partner instead of fixed.',
    howItEarns: [
      {
        heading: 'Company-operated cafés, which means the labour and the rent are its own',
        body:
          'Unlike a franchised restaurant system, the majority of revenue comes from stores the company operates, so wages, rent and hours sit in its own margin. That makes the model far more sensitive to labour cost and to throughput than a royalty business, and it is why an operating improvement shows up as 430 basis points of margin rather than as a royalty line.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Ticket and traffic, with the mix decided in the store',
        body:
          'Revenue rose 9% to $9.5 billion in the second fiscal quarter of 2026 with net earnings up 33% to $510.8 million; by the third quarter global comparable sales were up 7.9%, North America 8.1%, and operating margin expanded 430 basis points to 14.4%. Full-year guidance for global and United States comparable sales was raised to at least 5% from 3%.',
        basis: 'REPORTED',
      },
      {
        heading: 'China is now a stake and a licence rather than an operation',
        body:
          'A majority stake in the China business was transferred to a private equity partner, with a stated joint ambition to expand from roughly 8,000 stores toward as many as 20,000. The economics therefore change from consolidated store revenue to an equity interest plus licensing, which is a materially different exposure.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, and the founder holds no control position. Effective direction currently rests with an externally recruited chief executive whose mandate is explicit and public.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'A private equity partner now holding the majority of the China business, which creates a continuing commercial relationship with a co-investor rather than a subsidiary',
        'Licensed store operators in international markets who pay royalties and buy product from the company',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register and annual director elections',
        'SEC disclosure including comparable sales by region, which is what allows the turnaround claim to be tested independently',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The turnaround is being measured in public against stated targets',
        body:
          'Guidance was raised from 3% to at least 5% comparable sales growth, and the company has reported two consecutive quarters of United States traffic growth, then 8.1% North America comparable sales. Raising guidance mid-year is a falsifiable commitment, and it is the correct way to run a turnaround in public.',
        basis: 'REPORTED',
      },
      {
        heading: 'Negative book equity constrains the response to a setback',
        body:
          'Years of buybacks funded with debt left shareholders\' equity below zero. The turnaround requires capital — café renovations have been announced — and it is being funded from cash flow and debt rather than from retained equity, which means an operating setback and a balance-sheet constraint would arrive together.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Location density that makes the visit a habit rather than a decision',
        mechanism:
          'Stores close enough together that the customer never considers an alternative convert a discretionary purchase into a routine. Density is self-reinforcing because each store lowers the effort of the next visit, and a challenger must build the whole cluster before it can compete for the habit on a single morning.',
        evidence: 'Two consecutive quarters of United States traffic growth followed by 8.1% North America comparable sales, achieved with fewer discounts rather than more.',
        erodedBy: 'Local independents and convenience formats matching quality at lower price, and remote work permanently thinning the commuter density that the store cluster was built against.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'A loyalty programme that holds prepaid balances',
        mechanism:
          'Customers load money onto the programme before they spend it, which funds working capital at no cost, creates a switching cost measured in unspent balance, and produces first-party purchase data that shortens the product development cycle. No competitor of comparable scale holds the same balance.',
        evidence: 'Ticket and traffic improvement delivered through operations and menu rather than through discounting, which is what a loyalty relationship rather than a price relationship allows.',
        erodedBy: 'Loyalty fatigue and mobile payment platforms that remove the reason to hold a balance with a single merchant.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'A decade of very large buybacks funded with debt to the point of negative equity, followed by a pivot toward reinvesting in the store base and toward selling rather than fixing the second-largest market. The current allocation is more coherent than the last cycle\'s; the balance sheet it inherits is not.',
      good: [
        'Cutting discounts and investing in café operations, seating and menu rather than buying traffic, which produced 430 basis points of operating margin expansion alongside comparable sales growth of 7.9%',
        'Recruiting an external chief executive with a public mandate and an explicit operating programme, then raising guidance against it rather than lowering expectations',
        'Transferring the majority of the China business to a partner with local capability and a store expansion ambition, which converts a persistent operating problem into an equity interest',
      ],
      bad: [
        'The preceding strategy — app-led promotional ordering, throughput over experience, seating removed — damaged the product the brand actually sells and is precisely what the current programme is spending money to reverse',
        'Buybacks funded with debt until book equity went negative, which removed the cushion now that the turnaround requires renovation capital',
        'A prior multi-year reinvention plan was announced and effectively abandoned, so the capital and management attention it consumed produced a strategy change rather than a return',
        'China was not fixed: same-store sales grew 0.5% with traffic up 2.1% and average spend down 1.6%, meaning growth was bought with discounting, and the majority stake was then sold rather than the model repaired',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Operator unit economics, not brand pricing power, is the relevant driver',
        body:
          'The global Consumer Discretionary dossier distinguishes brand owners from operators whose returns come from unit economics and throughput. This is the second kind: value is created by raising throughput in existing cafés and by opening units that earn above the cost of capital, which is exactly what 430 basis points of margin on 7.9% comparable sales describes.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Removing the discount was the opposite of the sector\'s usual response',
        body:
          'The dossier names defending share on price as a failure mode. The turnaround did the reverse — cut discounts, invested in operations and menu, and accepted the near-term traffic risk. The reported result is that traffic came back anyway, which is the strongest available evidence that the brand retained pricing power through the previous cycle.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The turnaround is being funded on a balance sheet with no equity',
        body:
          'Café renovations, added labour hours and menu investment all cost cash, and book equity is below zero after years of debt-funded buybacks. The programme works while cash flow grows; an operating setback would arrive at the same time as a leverage constraint, which is the specific way this turnaround could fail rather than merely slow.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Labour cost and hours are in its own margin, not a franchisee\'s',
        body:
          'Because the majority of stores are company-operated, wage inflation, scheduling rules and any collective bargaining outcome land directly in the operating margin. The improvement to 14.4% was achieved with added labour hours, so the margin depends on throughput continuing to rise faster than the hours do.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'China exposure is now a minority stake in someone else\'s plan',
        body:
          'Expanding from roughly 8,000 stores toward 20,000 is an ambitious plan executed by a partner who holds the majority. The upside is real and so is the loss of control: brand standards, pricing and pace are no longer the company\'s decisions, and the downside is a stake rather than an operation it can turn around.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'sbux-operating-turnaround',
        title: 'Traffic returned without discounts, which is the hardest kind of recovery to fake',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The programme did the counterintuitive thing: it cut discounting, reinstated seating, slowed the app-led throughput push and invested in café operations and menu. The reported result is two consecutive quarters of United States traffic growth, then global comparable sales up 7.9% with North America at 8.1%, revenue up 9% to $9.5 billion in the second fiscal quarter with net earnings up 33% to $510.8 million, and operating margin up 430 basis points to 14.4%. Guidance was raised from 3% to at least 5%. The reason this is credible rather than promotional is the mechanism: discount-driven traffic shows up as volume with falling ticket, and this shows up as traffic with margin expansion, which only happens when the customer is choosing to come back. The renovation capital is still ahead, so the operating leverage is not yet complete.',
        requires: [
          'Comparable sales sustaining at or above the raised 5% guidance with traffic contributing, not only ticket',
          'Operating margin holding near or above 14.4% as renovation capital and labour hours are added',
          'Discount intensity staying low, so the growth is not quietly rebought',
        ],
        breaks: [
          'Traffic turning negative while ticket carries comparable sales, the signature of a price-led rather than demand-led recovery',
          'Operating margin falling back toward the low double digits as renovation and labour costs land',
          'Comparable sales decelerating below the prior 3% guidance, which would mean the improvement was a comparison effect',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'The 430 basis point expansion to 14.4% is the base. A path that continues upward must fund the announced renovation programme and the added labour hours at the same time.' },
          { assumption: 'Revenue build-up: volume and price', note: 'Split comparable sales into traffic and ticket. The thesis is specifically that traffic is contributing; a model built on ticket alone tests nothing.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'sbux-funded-on-no-equity',
        title: 'A capital-hungry turnaround on a balance sheet with negative book equity',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Years of debt-funded repurchases left shareholders\' equity below zero, and the current programme is capital-hungry in a way the previous one was not: café renovations have been announced, seating restored, labour hours added and menu investment made. Each of those is an operating cost or a capital expenditure funded from cash flow and debt, with no retained equity to absorb a shortfall. The margin improvement to 14.4% is real but it was achieved while adding hours, which means it depends on throughput continuing to rise faster than the labour cost does — and because the majority of stores are company-operated, every wage increase and scheduling rule lands in this margin rather than a franchisee\'s. The specific failure path is not a bad quarter; it is a bad quarter arriving alongside a leverage constraint that forces the renovation programme to be cut, which would remove the thing generating the traffic.',
        requires: [
          'Book equity remaining at or below zero with the renovation programme funded from cash flow and debt',
          'Continued wage and hours investment in company-operated stores',
        ],
        breaks: [
          'Free cash flow comfortably covering the renovation programme with leverage falling, which would show the turnaround is self-funding',
          'Book equity rebuilding through retained earnings',
          'A shift toward licensed or franchised formats that would move the store capital off the balance sheet',
        ],
        modelLink: [
          { assumption: 'Net debt to EBITDA', note: 'With negative equity this is the binding constraint. Test the renovation capital programme against covenant headroom at a flat comparable-sales scenario, not at guidance.' },
          { assumption: 'Capex as a share of revenue', note: 'The announced renovation programme raises capital intensity above the maintenance level. A projection at historical capex has assumed the turnaround investment away.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'sbux-china-is-a-stake-now',
        title: 'China has become an equity interest and a royalty, and must be modelled as one',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'Before the transaction, China was a consolidated operating business with a visible problem: same-store sales up 0.5%, traffic up 2.1% and average spend down 1.6% — growth bought with discounting, in a market where local competitors price far below. After transferring the majority stake to a private equity partner, the exposure changes shape entirely: consolidated store revenue is replaced by an equity interest in a business someone else controls, plus licensing and product supply, against a stated ambition to grow from roughly 8,000 stores toward as many as 20,000. That is not a smaller version of the same line item, it is a different asset with a different risk. The modelling instruction follows directly: remove the consolidated China revenue and cost from the projection, carry the retained interest as an equity stake with its own value, and treat the licensing and product margin as the recurring exposure. A model that keeps China consolidated is projecting a business the company no longer runs.',
        requires: [
          'The transaction completing and the majority interest remaining with the partner',
          'Licensing and product supply arrangements continuing on disclosed terms',
        ],
        breaks: [
          'A reacquisition of control, which would restore consolidation',
          'The partner\'s expansion plan failing early enough that the retained stake requires a writedown rather than a valuation',
        ],
        modelLink: [
          { assumption: 'Geographic revenue shares', note: 'China should leave the consolidated revenue build and reappear as an equity interest plus a royalty. Leaving it in the geography mix double-counts a business now controlled by someone else.' },
          { assumption: 'Minority interest share of net income', note: 'The deconsolidation changes who owns what. State explicitly whether the retained China interest is equity-accounted or carried at fair value, because the two produce different earnings.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Starbucks — Q2 fiscal 2026 results', url: 'https://about.starbucks.com/press/2026/starbucks-reports-q2-fiscal-year-2026-results/' },
      { label: 'CNBC — Starbucks raises full-year outlook as turnaround takes hold', url: 'https://www.cnbc.com/2026/04/28/starbucks-sbux-q2-2026-earnings.html' },
      { label: '24/7 Wall St. — Starbucks Q3 2026: EPS beat and raised full-year guidance', url: 'https://247wallst.com/cards/starbucks-q3-2026-earnings-sbux-01kyqr220xncpqwz8s4fhdyfq9' },
      { label: 'CNBC — Starbucks CEO on what he is focused on next', url: 'https://www.cnbc.com/2026/09/10/starbucks-is-back-ceo-brian-niccol-says-here-is-what-hes-focused-on-next.html' },
      { label: 'Reuters via Investing.com — Niccol brought back customers, investors want margins next', url: 'https://www.investing.com/news/stock-market-news/analysisstarbucks-ceo-niccol-brought-back-customers-investors-want-margins-next-4893061' },
    ],
  },

  {
    ticker: 'BKNG',
    sector: 'Consumer Discretionary',
    scope: 'UNITED_STATES',
    headline:
      'A travel marketplace compounding through a buyback that has removed over 40% of the share count since 2014 — funded to the point of negative book equity, while the platform that supplies part of its demand has started inserting a booking step of its own.',
    howItEarns: [
      {
        heading: 'Commission on accommodation, taken at the point of booking',
        body:
          'Hotels, apartments and homes listed by suppliers who pay a commission when a booking is made. Room nights grew 5% year on year in the June 2026 quarter and 6% to 338 million in the March quarter, with net income in one quarter rising 118% to $2 billion. The company owns no inventory, so incremental bookings carry almost no incremental cost.',
        basis: 'REPORTED',
      },
      {
        heading: 'Alternative accommodation is now more than a third of the mix',
        body:
          'Apartments and homes reached about 38% of accommodation room nights in the March 2026 quarter, growing 4% in the June quarter. That matters structurally: it puts the company in direct competition with dedicated home-sharing platforms while giving hotel-focused competitors a supply gap they cannot close quickly.',
        basis: 'REPORTED',
      },
      {
        heading: 'The connected trip is an attempt to own more than the room',
        body:
          'Transactions in which a customer books more than one travel vertical grew in the low double digits and account for a low double-digit percentage of the main brand\'s transactions, growing meaningfully faster than overall transactions. Each additional vertical raises revenue per trip and reduces the need to reacquire the customer through paid search.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, with a very large free float and no founder or family block. Capital allocation is therefore board policy rather than a controller\'s preference, which is why an activist can argue with it publicly.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Very large paid-search spending with a single dominant search platform that is simultaneously a supplier of demand and an emerging competitor in booking',
        'Multiple owned brands — accommodation, flights, restaurants and metasearch — that compete with each other for the same traveller',
      ],
      minorityProtections: [
        'Single voting class with a fully dispersed register, so an activist can and does campaign on capital allocation',
        'SEC disclosure including room nights, mix and the share of bookings from conversational agents, which is what allows the disintermediation question to be tested rather than argued',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'An activist is publicly challenging the buyback, and the argument is legitimate',
        body:
          'An investor has urged the company to suspend repurchases and use cash flow to reduce debt, arguing the programme has increased financial risk. With book equity negative and a debt-to-equity ratio that cannot be meaningfully expressed, that is not a frivolous position — it is a disagreement about the right level of leverage for a cyclical business, and it is being had in the open.',
        basis: 'REPORTED',
      },
      {
        heading: 'Management discloses the metric that would show disintermediation first',
        body:
          'The company reports that bookings from conversational agents, free or paid, account for less than 1% of room nights with no significant recent change, and that direct traffic remains stable in the mid-60% range. Publishing the number that would embarrass the narrative if it moved is the disclosure behaving correctly.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'A two-sided network with supply breadth no new entrant can assemble',
        mechanism:
          'Travellers come for the breadth of available properties and properties list because the travellers are there, so each side reinforces the other and a new entrant must solve both simultaneously with no inventory of its own. Assembling millions of independent accommodation listings takes years of direct supplier acquisition.',
        evidence: 'Alternative accommodation at roughly 38% of room nights alongside hotel supply, a combination that dedicated competitors on either side do not match.',
        erodedBy: 'Suppliers listing everywhere at once, which turns breadth into a commodity, and any channel that reaches the traveller before the marketplace does.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Direct traffic in the mid-sixties as a percentage of demand',
        mechanism:
          'A traveller who opens the app or types the brand name arrives at no acquisition cost, which both protects the margin and removes the leverage that a search platform would otherwise have over the business. Building that habit requires years of brand spending and a booking experience good enough to be repeated.',
        evidence: 'Direct traffic stable in the mid-60% range, with conversational-agent bookings under 1% of room nights and not materially changing.',
        erodedBy: 'A shift of trip planning into assistant interfaces where the brand is never typed, which would reintroduce an acquisition cost on demand that is currently free.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'One of the most aggressive buyback programmes among large listed companies: over 40% of the share count removed since 2014, net of stock compensation dilution, with $3.6 billion repurchased in the March 2026 quarter and $4.1 billion returned in June — the largest quarterly return in the company\'s history. It has compounded per-share value and it has taken book equity below zero.',
      good: [
        'Reducing the share count by more than 40% since 2014 net of dilution, including a 6% year-on-year reduction in the weighted average diluted count in the June 2026 quarter — the primary driver of per-share compounding',
        'Running an asset-light marketplace that requires almost no capital expenditure, which is what makes returning essentially all free cash flow possible in the first place',
        'Building the connected trip to raise revenue per transaction rather than buying growth through paid search, which attacks the one cost line a competitor controls',
      ],
      bad: [
        'The repurchase programme has been funded partly with debt to the point where book equity is negative and the debt-to-equity ratio is meaningless — an activist investor is publicly urging suspension of the buyback to reduce debt, arguing it has increased financial risk in a cyclical business',
        'Returning $4.1 billion in a single quarter while travel demand was decelerating on geopolitical disruption is pro-cyclical capital allocation: the cash is returned fastest when the cycle is best',
        'The metasearch and restaurant-reservation businesses acquired in earlier years have not scaled with the core accommodation platform and remain small relative to the capital and attention they have absorbed',
        'A $18.2 billion remaining authorisation as of March 2026 commits the company to a policy direction that removes the optionality to fund an acquisition or absorb a demand shock from equity',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'An operator in the dossier\'s terms, but the unit is a transaction not a store',
        body:
          'The global Consumer Discretionary dossier describes operators whose returns come from unit economics. Here the unit is a booking and the capital per unit is close to zero, which is why the margin is structurally higher than any physical operator in the sector and why the whole capital allocation question becomes what to do with the cash rather than where to invest it.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Real income and the trade-down point apply, in the mix rather than the volume',
        body:
          'The dossier notes consumers trade down within a category before leaving it. In travel that shows up as shorter trips, cheaper properties and a higher alternative-accommodation share rather than as cancelled holidays — which is one reason room nights grew 5% while the mix moved, and why room-night growth alone understates the sensitivity.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'The demand supplier becoming the booking destination',
        body:
          'The dominant search platform has begun testing agent-led hotel booking and has made booking available inside its assistant interface. Today that is under 1% of room nights. The risk is not the current share but the structure: a business that buys a large share of its demand from a platform is exposed to that platform deciding to keep the transaction.',
        basis: 'REPORTED',
      },
      {
        heading: 'Negative book equity in a cyclical business',
        body:
          'Travel demand falls sharply and quickly in a shock, as the geopolitical disruption of 2026 showed by decelerating growth. A balance sheet with no equity cushion means a demand shock is absorbed entirely by cash flow and debt capacity, and the activist argument is precisely that the buyback has consumed the cushion that the cycle requires.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Search economics are set by someone else',
        body:
          'Paid search is one of the largest cost lines and its price is set at auction by a platform that is also a potential competitor. Organic visibility is being compressed by AI-generated summaries, which management has acknowledged. The defence is direct traffic in the mid-sixties, and it is the number that matters most in the whole disclosure.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'bkng-disintermediation-not-in-data',
        title: 'The AI disintermediation fear is real as a structure and absent from the data',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The company discloses the number that would settle the argument: bookings originating from conversational agents, free or paid, are under 1% of room nights with no significant recent change, while direct traffic remains stable in the mid-60% range. Management has acknowledged that AI-generated search summaries are compressing organic results, and has pointed out that search engine optimisation is a small part of the business relative to paid search — which is bought at auction and still works. Meanwhile the business itself is compounding: room nights up 5%, alternative accommodation at roughly 38% of the mix, connected-trip transactions growing in the low double digits and faster than overall transactions, and net income in a quarter up 118% to $2 billion. Add a buyback that removed 6% of the diluted share count year on year and over 40% since 2014, and per-share earnings compound even at modest room-night growth. The disintermediation risk deserves monitoring through the disclosed metric, not pricing as though it had already happened.',
        requires: [
          'Agent-originated bookings staying at a low single-digit share of room nights',
          'Direct traffic holding in the mid-sixties as a percentage of demand',
          'Room-night growth remaining positive and connected-trip penetration continuing to rise',
        ],
        breaks: [
          'Agent-originated bookings moving to a mid single-digit share or higher, or the company ceasing to disclose the metric',
          'Direct traffic falling below the low sixties, which would mean acquisition cost is being reintroduced on demand that is currently free',
          'Paid search cost per booking rising faster than revenue per booking',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume growth', note: 'Room nights are the volume driver and the connected trip is the revenue-per-transaction driver. Model them separately so a mix-led improvement is not mistaken for volume growth.' },
          { assumption: 'SG&A as a share of revenue', note: 'Marketing is the line where disintermediation would appear first, as rising cost per booking. Hold it flat only while direct traffic holds.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'bkng-buyback-consumed-the-cushion',
        title: 'The buyback has been funded to negative equity in a business that can lose demand overnight',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Capital returns reached $4.1 billion in the June 2026 quarter — $3.7 billion of repurchases and $300 million of dividends, the largest quarterly return in company history — after $3.6 billion in the March quarter, with $18.2 billion of authorisation still remaining. The result is book equity below zero and a debt-to-equity ratio that cannot be meaningfully stated, in a business whose demand can fall by half in a quarter when travel stops. An activist investor is publicly urging suspension of the programme in favour of debt reduction, arguing it has increased financial risk, and the 2026 experience of Middle East conflict decelerating growth is a live illustration of how fast the revenue line moves. The programme is also pro-cyclical by construction: cash is returned fastest when the cycle is strongest, which is when the shares are most expensive and the cushion least needed. The per-share compounding is real; so is the absence of any capacity to absorb a shock from equity rather than from borrowing.',
        requires: [
          'The repurchase programme continuing near the current pace against the remaining authorisation',
          'Book equity remaining negative with net debt rising or flat',
        ],
        breaks: [
          'The buyback being moderated in favour of deleveraging, which would rebuild the cushion',
          'Free cash flow growing fast enough that leverage falls while the programme continues at full pace',
          'A demand shock absorbed without a covenant or rating consequence, which would show the leverage is appropriate for the volatility',
        ],
        modelLink: [
          { assumption: 'Buyback as a share of net income', note: 'This is the thesis. Run the projection at the current pace and again at a suspended programme, and report the difference in per-share value and in leverage.' },
          { assumption: 'Net debt to EBITDA', note: 'With negative equity, leverage against EBITDA is the only usable measure. Stress it against a travel demand shock, not against trend growth.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'bkng-negative-equity-frame',
        title: 'Negative book equity is deliberate here, and it changes the measurement framework',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'More than 40% of the share count has been retired since 2014, net of stock-compensation dilution, and the cumulative repurchase has exceeded retained earnings — so shareholders\' equity is negative and the reported debt-to-equity figure is an artefact rather than a measurement. A screen built on book value will either exclude this company or mark it as distressed, and both readings are wrong: it is an asset-light marketplace with almost no capital expenditure requirement and very high cash conversion, which is exactly the profile that can support this structure. The instruction for a model is concrete. Use return on invested capital and net debt to EBITDA, not equity ratios. Weight the cost of capital on market values, because the book calculation is undefined. And recognise that the book-value floor that normally limits downside does not exist here, so the entire valuation rests on the durability of the cash flow — which is precisely why the disintermediation metric and the demand cycle matter more than they would for a company with assets behind it.',
        requires: [
          'Cumulative repurchases continuing to exceed retained earnings, keeping book equity negative',
          'The asset-light model persisting, with capital expenditure remaining immaterial',
        ],
        breaks: [
          'Retained earnings rebuilding positive book equity, which would restore the conventional ratios',
          'A large asset-heavy acquisition, which would change both the capital intensity and the measurement frame',
        ],
        modelLink: [
          { assumption: 'Opening balance sheet equity', note: 'Negative equity is structural. Confirm the balance-sheet roll-forward and any equity-based covenant test handle it rather than reporting a data-integrity failure.' },
          { assumption: 'WACC', note: 'Book-value weights are undefined at negative equity. State that the capital structure weights are market-based, because the alternative calculation is not available here.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Booking Holdings — Q1 2026 earnings release', url: 'https://s201.q4cdn.com/865305287/files/doc_financials/2026/q1/Q1-2026-BKNG-Earnings-Release.pdf' },
      { label: 'PhocusWire — Booking Holdings Q2 2026: AI visibility up, referrals stay under 1% of room nights', url: 'https://www.phocuswire.com/news/finance/booking-holdings-q2-2026-earnings' },
      { label: 'Skift — Booking Holdings saw pressure from Google\'s AI Overviews', url: 'https://skift.com/2026/08/04/booking-holdings-saw-pressure-from-googles-ai-overviews/' },
      { label: 'RentalScaleUp — Booking.com Q1 2026 results: alternative accommodation growth', url: 'https://www.rentalscaleup.com/booking-com-q1-2026-results/' },
      { label: 'PhocusWire — Investor challenges Booking Holdings\' balance sheet and buyback strategy', url: 'https://www.phocuswire.com/news/finance/investor-challenges-booking-holdings-balance-sheet-buyback-strategy' },
      { label: 'Investing.com — Booking Q2 2026 slides: record buyback, earnings beat', url: 'https://www.investing.com/news/company-news/booking-q2-2026-slides-record-buyback-earnings-beat-expectations-93CH-4836149' },
    ],
  },
];
