import type { CompanyQualitative } from '../types';

export const TECH: CompanyQualitative[] = [
  {
    ticker: 'NVDA',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'Selling the accelerators that five or six capital budgets pay for, where shipments are capped not by demand or wafers but by advanced packaging capacity that is 85% committed through 2027.',
    howItEarns: [
      {
        heading: 'Accelerators and systems, sold to a handful of buyers',
        body:
          'Data centre accelerators, networking and increasingly whole systems, sold predominantly to a small number of hyperscalers and AI laboratories. The design is the company\'s; the manufacturing is contracted out, which keeps capital intensity low and the gross margin extraordinary.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The software layer is what makes the hardware hard to replace',
        body:
          'A development ecosystem built over fifteen years means the models, libraries and tooling researchers use assume this hardware. A competitor with comparable silicon still has to persuade developers to rewrite, which is a cost the buyer bears rather than the seller.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float, and a founder holding a modest stake without special voting rights.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Foundry and packaging capacity contracted from a single dominant supplier, which is also the constraint on shipments',
        'Investments in and commercial relationships with AI companies that are also customers',
      ],
      minorityProtections: [
        'Single voting class with dispersed ownership — unusual for a founder-led technology company',
        'SEC reporting including customer concentration disclosure',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Customer concentration is disclosed and extreme',
        body:
          'A small number of customers account for a very large share of revenue, and they are the same companies building competing in-house accelerators. That is disclosed and it means revenue depends on a handful of capital budgets that each buyer is internally questioning on return.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Investing in customers raises a circularity question worth asking',
        body:
          'Taking stakes in AI companies that then buy the hardware creates a structure where the seller is funding part of the demand. The amounts are small relative to revenue and the practice is worth monitoring precisely because it would be the mechanism by which reported demand outran genuine demand.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'The software ecosystem, not the silicon',
        mechanism:
          'Fifteen years of libraries, frameworks and developer familiarity mean the entire research and production stack assumes this architecture. Switching requires rewriting and revalidating work, and the cost falls on the customer.',
        evidence: 'Competing accelerators with comparable specifications that have not displaced the installed development base.',
        erodedBy: 'Abstraction layers and compilers that make model code portable across accelerators, which would make the silicon fungible.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Priority access to constrained packaging and memory',
        mechanism:
          'Advanced packaging and high-bandwidth memory are the binding constraints on accelerator supply, and long-term commitments secure allocation competitors cannot obtain at any price in the near term.',
        evidence: 'An estimated 85% or more of 2026-2027 advanced packaging capacity already committed, with lead times of 52 to 78 weeks.',
        erodedBy: 'Packaging and memory capacity expanding enough that allocation stops being scarce, which is already under way.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Very large buybacks funded by extraordinary cash generation, minimal capital intensity because manufacturing is contracted out, and prepayments to secure supply. The capital discipline is genuine and largely unavoidable given the fabless model.',
      good: [
        'Remaining fabless, which keeps capital intensity low and avoids the fixed-cost trap that has caught integrated competitors',
        'Committing to packaging and memory capacity ahead of competitors, which converted a supply constraint into a competitive advantage',
      ],
      bad: [
        'Buybacks concentrated at peak valuations, which is returning the most capital when the shares are most expensive',
        'Equity investments in customers, which is small in scale and structurally the wrong direction for a supplier',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Hyperscaler capital spending is the revenue line',
        body:
          'The largest buyers are expected to raise capital spending around 70% year on year to roughly $600 billion in 2026, with data centre semiconductor revenue forecast at $477 billion. Five or six discretionary capital budgets constitute the majority of demand.',
        basis: 'REPORTED',
      },
      {
        heading: 'Packaging, not wafers, is the physical constraint',
        body:
          'Accelerator shipments are capped by 2.5D and 3D packaging throughput and high-bandwidth memory availability rather than by logic wafer starts. Roughly 85% of 2026-2027 capacity is already committed with lead times of 52 to 78 weeks even as capacity nearly doubles.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'A capital budget revision at one of five buyers',
        body:
          'Demand is a handful of discretionary capital budgets, each being questioned internally on return. A single large buyer slowing is a material revenue event, and the assets they have bought depreciate over a few years.',
        basis: 'REPORTED',
      },
      {
        heading: 'Export controls splitting the market',
        body:
          'Restrictions on advanced accelerators by destination remove revenue in a large market and have created a subsidised domestic competitor in it. The near-term effect is lost sales; the longer-term one is a rival that would not otherwise exist.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'nvda-allocation-moat',
        title: 'The scarcity is packaging allocation, and it was secured in advance',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A competitor with an approved accelerator design still cannot ship it without advanced packaging and high-bandwidth memory, and roughly 85% of 2026-2027 capacity is already committed at lead times of 52 to 78 weeks. This company secured that allocation ahead of everyone, which converts a supply constraint into a competitive barrier that has nothing to do with silicon design. Layered on top is a fifteen-year software ecosystem that makes switching a cost the customer bears. The fabless model keeps capital intensity low, so the cash converts.',
        requires: [
          'Packaging and memory allocation remains scarce and contractually secured',
          'The software ecosystem continues making switching costly for developers',
          'Hyperscaler capital spending holds near the forecast pace',
        ],
        breaks: [
          'Packaging and memory capacity expanding enough that allocation stops being a barrier',
          'Abstraction layers making model code portable, which would make the silicon fungible',
          'A large buyer reducing its capital budget or shifting to in-house accelerators at scale',
        ],
        modelLink: [
          { assumption: 'Revenue driver — units shipped and price per unit', note: 'Model shipments against packaging capacity rather than against demand. The constraint is physical and it is the thesis.' },
          { assumption: 'Gross margin', note: 'Scarcity pricing is in the margin. Test what happens to it when allocation stops being scarce.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'nvda-five-budgets',
        title: 'The majority of revenue is five discretionary capital budgets, each auditing its own return',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Hyperscaler capital spending is forecast to rise around 70% to roughly $600 billion in 2026, and it is funded from the cash flow of a few advertising and cloud businesses whose boards are asking what it earns. The assets depreciate over a handful of years, the buyers are simultaneously building competing in-house accelerators, and no cycle financed by discretionary capital expenditure has ever avoided a downturn. Customer concentration this extreme is disclosed and the growth rate disguises it. The number that would settle the argument — revenue per deployed unit of compute — is the one the buyers do not publish.',
        requires: [
          'Demand remains concentrated in a handful of discretionary capital budgets',
          'Buyers continue developing in-house alternatives',
          'Return on deployed compute remains unpublished and unproven',
        ],
        breaks: [
          'Demand broadening to enterprise and sovereign buyers, diversifying away from the hyperscalers',
          'Published evidence that deployed compute earns its cost, which would make the spending durable',
          'In-house accelerator programmes failing to reach competitive performance',
        ],
        modelLink: [
          { assumption: 'Revenue driver — units shipped', note: 'Model a single large customer reducing orders rather than a uniform growth slowdown. Concentration means the shock is lumpy.' },
          { assumption: 'Terminal growth', note: 'A terminal value on current volumes assumes a capital cycle continues indefinitely. That is the specific claim being disputed.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IDC — semiconductor market forecast 2026: the AI supercycle', url: 'https://www.idc.com/resource-center/blog/semiconductor-market-to-surge-past-the-trillion-dollar-threshold-ai-infrastructure-drives-market-growth/' },
      { label: 'Medium / Adnan Masood — semiconductors in 2026: AI upswing meets structural bottlenecks', url: 'https://medium.com/@adnanmasood/semiconductors-in-2026-the-ai-driven-upswing-meets-structural-bottlenecks-3568b004905b' },
      { label: 'QuantFlowLab — AI semiconductor spending', url: 'https://quantflowlab.com/ai-semiconductor-spending/' },
      { label: 'McKinsey Electronics — semiconductor outlook 2026 and packaging shifts', url: 'https://www.mckinsey-electronics.com/post/strategic-semiconductor-and-electronic-component-trends-to-shape-2026-market-dynamics-technologica' },
    ],
  },

  {
    ticker: 'TSM',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'The company that manufactures nearly all leading-edge logic in the world, raising advanced node prices 3% to 10% for 2026 because there is nowhere else to go — and sitting a hundred miles from the mainland.',
    howItEarns: [
      {
        heading: 'Wafers at the leading edge, priced by node',
        body:
          'Manufacturing chips designed by others, with pricing set per wafer and rising as the node advances. Because leading-edge capacity is effectively a monopoly, the company sets price rather than accepting it — advanced node prices rose 3% to 10% for 2026 and mature nodes are following with increases up to 10%.',
        basis: 'REPORTED',
      },
      {
        heading: 'Advanced packaging is now a second scarce product',
        body:
          'The 2.5D and 3D packaging that assembles accelerators with high-bandwidth memory is the binding constraint on AI hardware shipments, and this company dominates it. That gives a second pricing lever on the same customers.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder in the ordinary sense. The Taiwanese government, through a national development fund, is the largest single holder with a stake around six per cent, and the rest is dispersed across international institutions.',
      voting: 'Ordinary shares with an American depositary receipt, one share one vote.',
      relatedPartyExposure: [
        'The Taiwanese state as the largest shareholder, in a company of existential national importance',
        'Customer relationships with companies that are also negotiating capacity allocation and price',
        'Overseas fabs built partly with host government subsidies that carry conditions',
      ],
      minorityProtections: [
        'Single voting class with a very large international institutional register',
        'NYSE depositary receipt reporting and Taiwanese disclosure requirements',
        'No controlling block, so the state\'s influence is proportional to a six per cent stake',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'National strategic importance cuts both ways',
        body:
          'The company is central to Taiwan\'s security position, which means the state has an interest in keeping the most advanced capacity domestic — and international customers and governments have the opposite interest. Capacity location is therefore partly a geopolitical negotiation rather than a cost optimisation.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Subsidised overseas fabs come with conditions and worse economics',
        body:
          'Fabs built in the United States, Japan and Europe with host government support carry higher construction and operating costs than Taiwanese equivalents, plus conditions on employment and technology. Diversifying geographic risk lowers the return on capital, and that trade is being made deliberately.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Leading-edge process technology and accumulated yield learning',
        mechanism:
          'Yield at the leading edge comes from years of accumulated process learning that cannot be bought or hired. A competitor with the same equipment produces fewer working chips per wafer, which makes it uncompetitive on cost regardless of capital spent.',
        evidence: 'Effectively all leading-edge logic manufactured here, with pricing power sufficient to raise advanced node prices 3% to 10% for 2026.',
        erodedBy: 'A competitor closing the yield gap at a comparable node, which has been attempted repeatedly and not achieved.',
        basis: 'REPORTED',
      },
      {
        label: 'Advanced packaging dominance',
        mechanism:
          'The packaging that assembles accelerators with high-bandwidth memory is the constraint on AI hardware shipments, and this company has the capacity. It is a second monopoly on the same customers at a different step.',
        evidence: 'An estimated 85% or more of 2026-2027 advanced packaging capacity committed, with lead times of 52 to 78 weeks.',
        erodedBy: 'Competing packaging capacity from other assembly and test providers reaching comparable capability.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Enormous, continuous capital spending on leading-edge capacity, funded from cash flow, with a growing dividend. The discipline is in node timing and in refusing to build capacity without customer commitments.',
      good: [
        'Building leading-edge capacity against customer prepayments and commitments rather than speculatively',
        'Raising prices to reflect the scarcity value of the capacity rather than passing the benefit to customers',
      ],
      bad: [
        'Overseas fabs with structurally worse economics than Taiwanese equivalents, accepted for geopolitical rather than financial reasons',
        'Capital intensity that permanently consumes a very large share of cash flow, which is the nature of the business rather than a choice',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The broadest repricing across the chip value chain in a decade',
        body:
          'Advanced foundry wafers, mature nodes, analog, packaging and memory are all repricing simultaneously. This company is raising advanced node prices 3% to 10% and mature nodes up to 10% by the second quarter of 2026, which is the clearest evidence of where the bargaining power sits.',
        basis: 'REPORTED',
      },
      {
        heading: 'Demand is a small number of capital budgets',
        body:
          'Hyperscaler capital spending is forecast to rise around 70% to roughly $600 billion in 2026. That concentration means the foundry\'s order book ultimately rests on a handful of discretionary budgets, one step removed.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Geopolitical concentration of the most valuable capacity',
        body:
          'The leading-edge fabs are in one place, a hundred miles from a state that claims it. No valuation method handles this well, and diversification lowers returns rather than removing the risk.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Building capacity against orders customers can walk away from',
        body:
          'Foundry destroys capital by adding capacity to a book of orders that turns out to be optional. The fixed cost base with falling prices produces losses that look nothing like the prior peak\'s profits.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'tsm-pricing-power',
        title: 'A monopoly that has started using its pricing power',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'For most of its history this company passed the benefit of its process lead to customers, competing as a service provider. It has stopped: advanced node prices rose 3% to 10% for 2026 and mature nodes up to 10%, in the broadest repricing across the chip value chain in over a decade. That is what a monopoly looks like when it decides to act like one, and it is compounded by a second monopoly in the advanced packaging that caps AI hardware shipments. The yield learning behind the process lead cannot be bought, and competitors have tried repeatedly.',
        requires: [
          'The process lead at the leading edge is maintained',
          'Pricing power continues being exercised rather than competed away',
          'Advanced packaging remains the binding constraint with this company holding the capacity',
        ],
        breaks: [
          'A competitor closing the yield gap at a comparable node',
          'Customers designing for mature nodes or alternative packaging to escape the pricing',
          'Capacity added against orders that prove optional, converting pricing power into underutilisation',
        ],
        modelLink: [
          { assumption: 'Revenue driver — wafers and price per wafer', note: 'Model wafer volumes and price per wafer separately by node. The repricing thesis lives entirely in the price term.' },
          { assumption: 'Gross margin', note: 'Price increases against a largely fixed cost base expand margin sharply. Test the margin at flat volumes with the higher price.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'tsm-concentration-risk',
        title: 'The most valuable manufacturing capacity in the world is in one place',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Nearly all leading-edge logic manufacturing sits on one island a hundred miles from a state that claims it, and the Taiwanese government is the largest shareholder partly because the concentration is a security asset. Diversifying into subsidised fabs in the United States, Japan and Europe lowers the return on capital — higher construction and operating costs, conditions attached — without removing the exposure, because the leading edge stays home. No discounted cash flow handles a binary geopolitical outcome; the honest treatment is an explicit premium in the discount rate rather than a probability nobody revisits.',
        requires: [
          'Leading-edge capacity remains concentrated in Taiwan',
          'Overseas diversification continues carrying worse economics',
        ],
        breaks: [
          'Leading-edge capacity genuinely replicated outside Taiwan at comparable cost and yield',
          'A durable change in the geopolitical position that removes the tail',
        ],
        modelLink: [
          { assumption: 'Cost of equity — country premium', note: 'Apply an explicit sovereign premium rather than a global technology discount rate. Stating it is the only honest way to carry a binary risk.' },
          { assumption: 'Capex path and returns by region', note: 'Model overseas fabs at their actual worse economics rather than at group average returns.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Silicon Analysts — chip price hikes 2026: foundry, OSAT and memory', url: 'https://siliconanalysts.com/analysis/semiconductor-repricing-wave-price-hikes-reshape-chip-supply-chain' },
      { label: 'IDC — semiconductor market forecast 2026', url: 'https://www.idc.com/resource-center/blog/semiconductor-market-to-surge-past-the-trillion-dollar-threshold-ai-infrastructure-drives-market-growth/' },
      { label: 'McKinsey Electronics — semiconductor outlook 2026 and packaging shifts', url: 'https://www.mckinsey-electronics.com/post/strategic-semiconductor-and-electronic-component-trends-to-shape-2026-market-dynamics-technologica' },
      { label: 'Sourceability — 2026 semiconductor industry market outlook', url: 'https://sourceability.com/post/whats-ahead-in-2026-for-the-semiconductor-industry' },
    ],
  },

  {
    ticker: 'ASML',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'The only company that makes the machines required to print leading-edge chips, which makes it a monopoly with a customer list of three — and an instrument of export policy rather than a participant in a market.',
    howItEarns: [
      {
        heading: 'Lithography systems, sold to three customers who have no alternative',
        body:
          'Extreme ultraviolet systems are the only way to pattern leading-edge logic and advanced memory, and this company is the sole supplier. The customer list at the leading edge is three companies, each of which must buy or exit the leading edge entirely.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Installed base service and upgrades are the annuity',
        body:
          'Each system in the field requires service, spare parts and performance upgrades for a decade or more at high margins, and only the manufacturer can provide them. That revenue follows the installed base rather than new orders, which is what steadies the earnings between capital cycles.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed international institutional ownership with a very large free float, under Dutch governance.',
      voting: 'Ordinary shares, one share one vote, with a Dutch foundation structure available as a defensive measure.',
      relatedPartyExposure: [
        'A supply chain concentrated in a small number of specialist component suppliers, one of which supplies the light source',
        'Export licensing decisions by the Dutch and allied governments that determine which customers may be served',
      ],
      minorityProtections: [
        'Single voting class with dispersed ownership and Dutch governance standards including binding remuneration votes',
        'NASDAQ and Euronext reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The company is a tool of export policy and cannot decline the role',
        body:
          'Which customers may buy the most advanced systems is decided by Dutch and allied governments, not by the company. That removes a large market from its addressable base and makes a core commercial variable a matter of diplomacy. No amount of governance quality changes it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Supply chain concentration mirrors the customer concentration',
        body:
          'Critical subsystems come from a very small number of suppliers, one of which the company had to acquire to secure. A monopoly with a monopolised input is more fragile than its market position suggests, and it is why supplier capacity is part of the delivery forecast.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Extreme ultraviolet lithography, with no second supplier',
        mechanism:
          'Decades of development, a supply chain assembled for the purpose, and physics that no competitor has replicated mean there is no alternative machine. A chipmaker wanting the leading edge buys here or does not compete.',
        evidence: 'Sole supply of the systems used for all leading-edge logic manufacturing worldwide.',
        erodedBy: 'A different patterning approach reaching production viability, which has been attempted and not achieved.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Installed base service and upgrade revenue',
        mechanism:
          'Systems in the field need service, parts and upgrades only the manufacturer can supply, for a decade or more. The revenue follows the installed base and grows with every shipment.',
        evidence: 'A service and upgrade revenue stream that has grown steadily through order cycles that swung new system sales sharply.',
        erodedBy: 'Third-party service providers, which regulatory and technical barriers currently prevent.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Heavy research spending on the next generation of patterning, capacity expansion against customer commitments, and very large buybacks funded by extraordinary cash generation. The research spending is not optional — it is the moat.',
      good: [
        'Acquiring the critical light source supplier, which removed the single greatest supply chain risk to the whole franchise',
        'Sustaining research spending through order downturns, which is what keeps the next generation coming',
      ],
      bad: [
        'Buybacks weighted toward peak order periods, which returns most capital when the shares are most expensive',
        'Capacity expansion against orders from three customers whose own demand rests on a handful of capital budgets two steps removed',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Every fab in the AI build-out needs these machines',
        body:
          'With hyperscaler capital spending forecast to rise around 70% to roughly $600 billion in 2026 and data centre semiconductor revenue at $477 billion, the fab construction behind it requires lithography that only this company supplies.',
        basis: 'REPORTED',
      },
      {
        heading: 'Export controls have created the competitor that did not exist',
        body:
          'Restrictions on advanced tool sales by destination removed a large market and prompted a subsidised domestic supply chain effort in it. The near-term cost is lost revenue; the longer-term one is a state-funded competitor at mature nodes.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Order timing from three customers, two steps from the end demand',
        body:
          'Revenue is capital equipment orders from three chipmakers whose own demand rests on a handful of hyperscaler budgets. The order book is lumpy, the lead times are long, and a deferral at either level arrives as a revenue hole.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Export licensing as a permanent constraint on the market',
        body:
          'A government decides which customers may be served. The company has no operational response, and the policy direction has been to tighten rather than loosen.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'asml-sole-supply',
        title: 'A genuine monopoly on a physical requirement, with an installed base annuity underneath',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'There is no second supplier of extreme ultraviolet lithography and no alternative patterning approach in production. A chipmaker wanting the leading edge buys here or leaves the leading edge, which is as close to an unavoidable purchase as industrial equipment gets. Underneath the lumpy system orders sits a service and upgrade annuity that grows with every machine shipped and that only the manufacturer can provide. With fab construction driven by hyperscaler spending forecast near $600 billion in 2026, the demand for the enabling tool is structural rather than cyclical.',
        requires: [
          'Sole supply of leading-edge lithography persists with no alternative patterning approach',
          'Fab construction continues at the pace the AI build-out implies',
          'The service and upgrade base keeps growing with shipments',
        ],
        breaks: [
          'An alternative patterning technology reaching production viability',
          'Fab construction deferrals from customers reassessing capacity needs',
          'Export restrictions widening to remove more of the addressable market',
        ],
        modelLink: [
          { assumption: 'Revenue driver — systems shipped and service revenue', note: 'Model system sales and installed base service separately. The first is lumpy and the second is the annuity, and blending them hides the quality.' },
          { assumption: 'Order backlog', note: 'Revenue is recognised on shipment against a long-lead backlog. Model the backlog conversion rather than a growth rate.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'asml-policy-instrument',
        title: 'A monopoly whose market is defined by governments, and whose customers number three',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Two concentrations compound. Dutch and allied export licensing decides which customers may buy the most advanced systems, which has already removed a large market and prompted a state-subsidised domestic supply chain effort inside it — so policy has cost revenue now and is creating a competitor later. And at the leading edge there are three customers, whose own demand rests on a handful of hyperscaler capital budgets two steps removed. Lead times are long and orders are lumpy, so a deferral at either level arrives as a revenue hole the company cannot offset.',
        requires: [
          'Export licensing remains restrictive and tightening',
          'The leading-edge customer base remains three companies',
        ],
        breaks: [
          'Export policy loosening, restoring the addressable market',
          'A fourth credible leading-edge customer emerging, which would diversify the order book',
        ],
        modelLink: [
          { assumption: 'Revenue by region and addressable market', note: 'Model the restricted market as removed rather than discounted. Policy outcomes are binary and should not be probability-weighted into a single line.' },
          { assumption: 'Revenue driver — systems shipped', note: 'Model a single customer deferring rather than a uniform slowdown. With three customers the shock is lumpy.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IDC — semiconductor market forecast 2026', url: 'https://www.idc.com/resource-center/blog/semiconductor-market-to-surge-past-the-trillion-dollar-threshold-ai-infrastructure-drives-market-growth/' },
      { label: 'Sourceability — 2026 semiconductor industry market outlook', url: 'https://sourceability.com/post/whats-ahead-in-2026-for-the-semiconductor-industry' },
      { label: 'McKinsey Electronics — semiconductor and component trends for 2026', url: 'https://www.mckinsey-electronics.com/post/strategic-semiconductor-and-electronic-component-trends-to-shape-2026-market-dynamics-technologica' },
    ],
  },

  {
    ticker: 'AVGO',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'Two businesses stapled together: custom accelerators and networking silicon for a handful of hyperscalers, and an infrastructure software portfolio bought cheaply and repriced hard.',
    howItEarns: [
      {
        heading: 'Custom silicon designed for one customer at a time',
        body:
          'Application-specific accelerators and networking chips designed jointly with individual hyperscalers, who want an alternative to merchant accelerators. Each programme is a multi-year relationship with switching costs measured in design cycles, which makes the revenue stickier than a merchant chip sale.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Infrastructure software acquired and repriced',
        body:
          'Mainframe, virtualisation and enterprise software portfolios bought at modest multiples, then repriced on renewal toward what the customer\'s switching cost justifies. It is a legitimate and unpopular strategy, and it generates cash that funds the silicon business.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float, and a chief executive with an unusually large personal stake and long tenure.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Custom silicon programmes with individual hyperscalers who are both customers and co-designers',
        'Very large acquisition financing arrangements',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting with segment disclosure separating semiconductors from infrastructure software',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'An acquisition strategy that works and generates hostility',
        body:
          'Buying enterprise software portfolios and raising renewal prices toward the customer\'s switching cost is a documented, repeatable playbook that has produced excellent returns and considerable customer anger. It is legitimate value extraction from an installed base, and the risk is that customers eventually migrate rather than renew.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Executive compensation and tenure have been contentious',
        body:
          'Very large equity awards to a long-tenured chief executive have drawn shareholder objection. The returns have been exceptional, which is the defence, and the concentration of strategy in one person is also a succession risk with no obvious answer.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Custom accelerator programmes with design-cycle switching costs',
        mechanism:
          'A custom chip co-designed with a hyperscaler over several years cannot be replaced without another multi-year design cycle. That locks in the relationship far more durably than selling a merchant part.',
        evidence: 'Multi-year custom silicon programmes with several of the largest hyperscalers, each representing sustained revenue.',
        erodedBy: 'Hyperscalers building internal design teams capable of taping out without a partner.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Enterprise software installed bases with prohibitive migration costs',
        mechanism:
          'Mainframe and virtualisation software runs workloads that are expensive and risky to migrate. Renewal pricing can therefore rise toward the migration cost, which is very high, and the customer generally pays.',
        evidence: 'Margin expansion on acquired software portfolios achieved through renewal repricing rather than growth.',
        erodedBy: 'Customers completing migrations to alternatives, which converts a one-time cost into permanent revenue loss.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Serial large acquisitions funded with debt and equity, then aggressive cost reduction and repricing, with the cash returned through dividends and buybacks. The record of execution on this playbook is among the best in the industry.',
      good: [
        'Acquiring infrastructure software portfolios at modest multiples and raising returns through pricing and cost discipline',
        'Building custom silicon into a position that competes with merchant accelerators on the buyers\' own initiative',
      ],
      bad: [
        'Repricing that has generated genuine customer hostility, which raises the probability of eventual migration away',
        'Leverage taken on for successive large acquisitions, which constrains flexibility if a repricing cycle fails',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Hyperscalers want an alternative to merchant accelerators, and this is it',
        body:
          'With hyperscaler capital spending forecast to rise around 70% to roughly $600 billion in 2026, the buyers have every incentive to reduce dependence on a single merchant supplier. Custom silicon co-designed with the buyer is the direct beneficiary of that motive.',
        basis: 'REPORTED',
      },
      {
        heading: 'Networking is as constrained as compute',
        body:
          'AI clusters require enormous switching bandwidth, and the networking silicon is a less discussed but equally necessary component. It is a second exposure to the same build-out with different competitive dynamics.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Software customers completing migrations',
        body:
          'Repricing toward the switching cost works until the customer decides to pay it. Each migration is permanent, and the strategy has generated enough hostility to make them more likely than a normal renewal base.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Custom silicon concentrated in very few programmes',
        body:
          'A handful of hyperscaler relationships represent a large share of the semiconductor growth. Losing one, or a customer bringing design in-house, is a material event rather than a rounding one.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'avgo-custom-silicon',
        title: 'The buyers want a second source, and custom silicon is the form it takes',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Hyperscalers spending roughly $600 billion in 2026 have an obvious strategic interest in not depending on one merchant accelerator supplier, and the cheapest route is a chip co-designed for their own workloads. This company is the partner of choice for several of them, and a custom programme developed over years cannot be replaced without another multi-year design cycle — which makes the revenue far stickier than a merchant part. Networking silicon adds a second, equally necessary exposure to the same build-out, funded by an infrastructure software business generating cash regardless.',
        requires: [
          'Custom silicon programmes continue being awarded and renewed',
          'Hyperscalers continue wanting an alternative to merchant accelerators',
          'Networking bandwidth requirements continue scaling with cluster size',
        ],
        breaks: [
          'Hyperscalers building internal design capability that removes the need for a partner',
          'A custom programme loss, which is material given how few there are',
          'AI capital spending deferrals reducing both compute and networking demand',
        ],
        modelLink: [
          { assumption: 'Segment revenue and margins', note: 'Model semiconductors and infrastructure software separately. They have different growth, margins and risks entirely.' },
          { assumption: 'Revenue driver — custom programmes', note: 'Model named programmes rather than a growth rate. With a handful of relationships, the revenue is lumpy and identifiable.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'avgo-repricing-limit',
        title: 'Repricing toward the switching cost works until the customer pays it',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The software strategy extracts value from installed bases by raising renewal prices toward what migration would cost. It has produced excellent returns and enough customer hostility to make migration a live decision rather than a theoretical one — and every migration is permanent, not cyclical. Layered on that, the semiconductor growth rests on a handful of custom programmes with buyers who are simultaneously building internal design capability. Both halves of the company depend on customers who would rather not be dependent, which is a structurally unstable position however well executed.',
        requires: [
          'Repricing continues pushing renewal prices toward migration costs',
          'Custom silicon remains concentrated in few programmes with buyers developing in-house capability',
        ],
        breaks: [
          'Software renewal rates holding at the higher prices, proving the switching cost is genuinely prohibitive',
          'Custom programme wins broadening the customer base enough to reduce concentration',
        ],
        modelLink: [
          { assumption: 'Revenue driver — software renewal rate and price', note: 'Model renewal retention and price separately. Higher price with lower retention can leave revenue flat and the base smaller.' },
          { assumption: 'Terminal growth — software segment', note: 'A terminal value on repriced software assumes the installed base stays. That is the specific claim being disputed.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IDC — semiconductor market forecast 2026 and AI infrastructure', url: 'https://www.idc.com/resource-center/blog/semiconductor-market-to-surge-past-the-trillion-dollar-threshold-ai-infrastructure-drives-market-growth/' },
      { label: 'QuantFlowLab — AI semiconductor spending', url: 'https://quantflowlab.com/ai-semiconductor-spending/' },
      { label: 'Seeking Alpha — the capex cycle and semiconductors', url: 'https://seekingalpha.com/article/4867835-the-capex-cycle-and-semiconductors' },
    ],
  },

  {
    ticker: 'AAPL',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'A hardware company whose profits increasingly come from services sold to the installed base — including a search placement payment that is the direct subject of an antitrust remedy.',
    howItEarns: [
      {
        heading: 'Devices bought by people who already own one',
        body:
          'Phones, computers, tablets and wearables sold at premium prices to an installed base of well over two billion devices. Replacement rather than new adoption drives volumes in developed markets, so the revenue depends on how often owners upgrade and at what price point.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Services are the margin, and part of it is a placement fee',
        body:
          'App store commissions, subscriptions, payments and advertising are sold to the installed base at gross margins roughly double the hardware. A significant portion of the services profit is a payment for making one search engine the default — which is revenue for doing nothing, and the specific subject of an antitrust remedy.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float and a single share class.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'A search default placement agreement that is a very large profit contributor and the subject of litigation remedy',
        'Contract manufacturing concentrated with a small number of assemblers, predominantly in one country',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting with separate disclosure of services revenue and gross margin',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A very large share of profit depends on an arrangement a court is examining',
        body:
          'The payment received for default search placement is high-margin revenue requiring no cost, and it sits inside the services line. Antitrust remedies aimed at default placements would remove or reduce it directly. That is a concentration of profit in a single contractual arrangement, and the disclosure does not isolate it.',
        basis: 'REPORTED',
      },
      {
        heading: 'App store commission rates are being set by regulators and courts',
        body:
          'Commission rates and the rules on alternative payment methods are being altered by regulation in Europe and by litigation elsewhere. Each change reduces the take rate on a business whose economics rest on it, and the direction has been consistently one way.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Switching costs built from an ecosystem rather than a device',
        mechanism:
          'Photos, messages, purchases, subscriptions, watch pairing and family sharing all live inside one account. Leaving means rebuilding them, so the device is replaced within the ecosystem rather than compared against alternatives on specification.',
        evidence: 'Replacement rates and retention within the ecosystem far above any competing platform.',
        erodedBy: 'Regulatory interoperability requirements that make messaging, payments and app distribution portable.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Silicon design integrated with the software that runs on it',
        mechanism:
          'Designing its own processors for its own operating system produces performance and battery outcomes that a competitor assembling merchant parts cannot match, and it removes dependence on a third-party roadmap.',
        evidence: 'Sustained premium pricing and margin while competitors using merchant silicon compete on price.',
        erodedBy: 'Merchant silicon closing the performance gap, which would remove the justification for the price premium.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The largest buyback programme in corporate history, funded by extraordinary cash generation, with modest capital spending because manufacturing is contracted out. The capital return has been exemplary and the acquisition record is deliberately thin.',
      good: [
        'Returning essentially all free cash flow through buybacks and dividends, which has reduced the share count dramatically',
        'Bringing silicon design in-house, which improved the product and removed dependence on a supplier roadmap',
      ],
      bad: [
        'A thin acquisition record, which is prudent and has left the company behind in areas where scale in services or AI could have been bought',
        'Manufacturing concentration in one country, accepted for cost and capability reasons and unresolved for years',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Not a beneficiary of the AI capital cycle in any direct way',
        body:
          'Hyperscaler capital spending forecast near $600 billion in 2026 flows to accelerator designers, foundries and packaging. A device company buying merchant memory and contracting manufacture is on the cost side of that build-out — memory prices at record highs raise the bill of materials.',
        basis: 'REPORTED',
      },
      {
        heading: 'The memory supercycle is an input cost here',
        body:
          'DRAM and NAND prices spiked to record highs as suppliers prioritised high-bandwidth memory for AI servers. For a company buying memory for hundreds of millions of devices, that is a direct gross margin headwind with no offsetting revenue.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The search placement payment being removed by remedy',
        body:
          'A very large, zero-cost profit contribution depends on an arrangement that courts have found part of a monopoly and are deciding how to remedy. Removal would be a step change in services profitability, not a growth rate adjustment.',
        basis: 'REPORTED',
      },
      {
        heading: 'Memory and component cost inflation with no pricing offset',
        body:
          'Record memory prices raise the cost of every device, and premium pricing is already at the top of what the market bears. The margin absorbs it.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'aapl-services-mix',
        title: 'A hardware business whose profit mix is quietly becoming software',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'An installed base well beyond two billion devices is a distribution channel for services sold at roughly double the hardware gross margin — commissions, subscriptions, payments and advertising. As that mix rises, the consolidated margin rises without any device selling for more, and the revenue becomes recurring rather than cyclical. The ecosystem switching costs that hold the base together are built from data and pairings rather than from specifications, which is why replacement happens within the platform instead of being contested on price.',
        requires: [
          'Services revenue continues growing faster than hardware',
          'Ecosystem switching costs hold against interoperability requirements',
          'The installed base continues expanding or at least holding',
        ],
        breaks: [
          'Regulatory interoperability making messaging, payments and app distribution portable',
          'App store commission rates cut materially by regulation or litigation',
          'The search placement payment removed by antitrust remedy',
        ],
        modelLink: [
          { assumption: 'Segment revenue and gross margin', note: 'Model products and services separately with their own margins. The mix shift is the thesis and a blended margin erases it.' },
          { assumption: 'Revenue driver — installed base and revenue per device', note: 'Services revenue is driven by the base, not by unit sales. Model it off installed devices.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'aapl-remedy-and-inputs',
        title: 'A court deciding a large slice of the profit, while memory costs rise',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'A substantial, zero-cost portion of services profit is a payment for default search placement — precisely what antitrust remedies target after findings of monopoly. Removing it is a step change rather than a growth adjustment, and the disclosure does not isolate it so the market cannot easily size it. At the same time app store commissions are being reduced by regulators in one jurisdiction after another, and DRAM and NAND at record highs raise the bill of materials on hundreds of millions of devices with premium pricing already at its ceiling. Three separate pressures, none of which management can address operationally.',
        requires: [
          'Remedies proceed against default placement arrangements',
          'Commission rate pressure continues across jurisdictions',
          'Memory prices stay elevated as capacity is prioritised for AI',
        ],
        breaks: [
          'Remedies limited to disclosure or conduct terms that leave the placement payment intact',
          'Memory prices normalising as high-bandwidth memory capacity is added',
          'Services growth in subscriptions and advertising large enough to replace the placement revenue',
        ],
        modelLink: [
          { assumption: 'Services revenue and margin', note: 'Model the placement payment as a separate line that can go to zero. Inside blended services revenue it is untestable.' },
          { assumption: 'Gross margin — products', note: 'Model the bill of materials against record memory prices rather than a historical margin.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Utmel — the 2026 memory super-cycle in DRAM and NAND', url: 'https://www.utmel.com/blog/news/semiconductor/the-2026-memory-super-cycle-navigating-the-500-surge-in-dram-and-nand-flash-prices' },
      { label: 'Utmel — 2026 semiconductor and electronic component price trends', url: 'https://www.utmel.com/blog/news/semiconductor/2026-semiconductor-and-electronic-components-price-trends' },
      { label: 'The Next Web / eMarketer — platform advertising and search economics in 2026', url: 'https://thenextweb.com/news/meta-surpass-google-digital-ad-revenue-emarketer-2026' },
    ],
  },

  {
    ticker: 'MSFT',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'The largest enterprise software franchise attached to the second-largest cloud, funding an AI capital programme whose depreciation is now growing faster than most software companies\' revenue.',
    howItEarns: [
      {
        heading: 'Enterprise agreements that bundle everything and renew',
        body:
          'Productivity, operating systems, security and developer tools sold as multi-year enterprise agreements to organisations that standardise on them. The bundle is the product: each additional component is cheaper inside the agreement than bought separately, which is why the share of an organisation\'s software spend keeps rising.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Cloud infrastructure, sold to the customers already under agreement',
        body:
          'Azure is sold into the same enterprise relationships, which is a distribution advantage no independent cloud has. Growth comes from workload migration, and the capital required to serve it is enormous and increasingly AI-specific.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float and a single share class.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'A very large investment and commercial relationship with an AI laboratory that is both a partner and a consumer of the company\'s cloud capacity',
        'Enterprise agreements with customers who are also cloud competitors',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting with segment disclosure of cloud growth and capital spending',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The AI partnership is a complex, material and partially disclosed structure',
        body:
          'A multi-billion investment in an AI laboratory, combined with providing its compute and reselling its models, creates an arrangement where the company funds a customer that is also a supplier and a potential competitor. The economics are only partly visible from the outside, and they are material.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Capital spending is being committed faster than the return is disclosed',
        body:
          'AI infrastructure spending has reached a scale where depreciation alone is material to margins, and no return measure on it is published. The company is better positioned than most to earn it, and the absence of the metric is the same governance gap the whole sector shares.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Enterprise standardisation and the bundle',
        mechanism:
          'An organisation that standardises on the productivity suite, the identity system and the security stack cannot remove one piece without breaking the others. Each added component raises the cost of leaving any of them, which is why the share of spend compounds.',
        evidence: 'Enterprise agreement renewal rates and expanding seat and product attach across the installed base.',
        erodedBy: 'Regulatory unbundling requirements, and cloud-native competitors displacing individual components.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Cloud distribution through existing enterprise relationships',
        mechanism:
          'Selling infrastructure to organisations already under enterprise agreement, with committed spend and existing procurement, removes the sales friction an independent cloud faces.',
        evidence: 'Cloud growth sustained at scale with a customer base concentrated in existing enterprise accounts.',
        erodedBy: 'Multi-cloud procurement norms that neutralise the bundling advantage.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Very large buybacks and dividend growth alongside an AI and cloud capital programme of unprecedented scale. The software business funds it, which is why the company can commit at this level without financial strain.',
      good: [
        'Building cloud into a business of this scale off the enterprise franchise, which is the clearest example of distribution leverage in the industry',
        'Sustaining buybacks and dividend growth while funding the capital programme from cash flow rather than debt',
      ],
      bad: [
        'Capital spending at a scale where depreciation materially affects margins, with no published return measure',
        'A large acquisition history including social and gaming assets whose returns are not separately visible',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'One of the five or six capital budgets the whole chain depends on',
        body:
          'Hyperscaler capital spending is forecast to rise around 70% to roughly $600 billion in 2026, and this company is one of the largest contributors. It is both a buyer in the AI supply chain and a seller of the capacity, which is an unusual position.',
        basis: 'REPORTED',
      },
      {
        heading: 'Generative tools are a revenue opportunity and a seat risk at once',
        body:
          'Subscription software priced per seat faces the question of whether generative tools raise output per seat or reduce the seats needed. Selling the AI add-on and the seat simultaneously means the company monetises either outcome, which is a better position than a pure software vendor has.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Depreciation from AI capacity outrunning the revenue it supports',
        body:
          'Assets depreciating over a handful of years, committed in advance of demand, produce a margin drag if utilisation disappoints. The tell is depreciation growth against cloud revenue growth.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The AI partnership becoming a competitor',
        body:
          'Funding and hosting an AI laboratory that also sells directly creates a partner whose interests diverge as it scales. The arrangement is material and only partly disclosed.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'msft-bundle-leverage',
        title: 'The enterprise bundle is the distribution channel everything else rides on',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'An organisation standardised on the productivity suite, identity and security cannot remove one component without breaking the others, so the share of its software spend compounds — and the cloud is sold into the same relationships with the same procurement. That is a distribution advantage no independent infrastructure provider has, and it is why AI features can be attached to an existing seat rather than sold as a new product. Whether generative tools raise output per seat or reduce seats needed, this company sells into both outcomes.',
        requires: [
          'Enterprise agreement renewals continue with expanding product attach',
          'Cloud workload migration continues at scale through existing relationships',
          'AI features attach to seats rather than replacing them',
        ],
        breaks: [
          'Regulatory unbundling of the enterprise suite',
          'Multi-cloud procurement norms neutralising the distribution advantage',
          'Seat counts falling as generative tools reduce headcount in customer organisations',
        ],
        modelLink: [
          { assumption: 'Revenue driver — seats and revenue per seat', note: 'Model seats and revenue per seat separately. The seat-versus-output question is the central uncertainty and a blended growth rate hides it.' },
          { assumption: 'Segment revenue and margins', note: 'Cloud and software have different margins and different capital intensity. Model them apart.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'msft-depreciation-drag',
        title: 'Depreciation is becoming the story before the return is disclosed',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'AI infrastructure spending has reached a scale where the depreciation alone is material to consolidated margins, the assets have useful lives measured in a few years, and no return measure on the programme is published. The company is among the best placed in the industry to earn that return, which is not the same as demonstrating it. Compounding the opacity, a very large investment in and hosting relationship with an AI laboratory makes the company simultaneously the funder, supplier and reseller of a partner that sells directly — an arrangement material enough to matter and disclosed only in part.',
        requires: [
          'Capital spending continues at the current scale without a published return metric',
          'Depreciation growth continues outpacing cloud revenue growth',
        ],
        breaks: [
          'A disclosed return measure on AI infrastructure showing it earns its cost',
          'Cloud revenue growth accelerating enough that depreciation becomes immaterial to the margin',
        ],
        modelLink: [
          { assumption: 'Capex path and depreciation', note: 'Model depreciation growth against cloud revenue growth. When the first outruns the second, the capital is not earning.' },
          { assumption: 'Segment margin — cloud', note: 'Test the cloud margin with full depreciation of the AI capacity rather than at current utilisation.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IDC — semiconductor market forecast 2026: AI infrastructure drives growth', url: 'https://www.idc.com/resource-center/blog/semiconductor-market-to-surge-past-the-trillion-dollar-threshold-ai-infrastructure-drives-market-growth/' },
      { label: 'QuantFlowLab — AI semiconductor spending and hyperscaler capex', url: 'https://quantflowlab.com/ai-semiconductor-spending/' },
      { label: 'Medium / Adnan Masood — semiconductors in 2026: AI upswing meets bottlenecks', url: 'https://medium.com/@adnanmasood/semiconductors-in-2026-the-ai-driven-upswing-meets-structural-bottlenecks-3568b004905b' },
    ],
  },

  {
    ticker: 'AMD',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'The credible second source for AI accelerators that every hyperscaler wants to exist — and whose software ecosystem is a decade behind the one it must displace.',
    howItEarns: [
      {
        heading: 'Server processors taking share, and accelerators trying to',
        body:
          'Data centre processors have taken substantial share from the incumbent on performance per watt, which is a genuine and continuing win. Accelerators are the larger opportunity and a harder one, because the competition there is a software ecosystem rather than a chip.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Fabless, so the manufacturing constraint is someone else\'s',
        body:
          'Designs are manufactured by the dominant foundry, which keeps capital intensity low and means capacity and advanced packaging allocation are negotiated rather than owned. The same constraint that protects the accelerator leader limits the challenger.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float and a single share class.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Foundry and advanced packaging capacity contracted from the same dominant supplier its main competitor uses',
        'Design and deployment partnerships with hyperscalers who are also evaluating in-house alternatives',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting with segment disclosure separating data centre from client and gaming',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A turnaround executed over a decade, which is the governance record',
        body:
          'The company was close to irrelevance and regained competitive position in server and client processors through consistent execution on a chiplet architecture and foundry partnership. That is the strongest available evidence that the accelerator attempt is credible, and it is evidence about capability rather than about outcome.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Competing for the same constrained capacity as the leader',
        body:
          'Both the leader and the challenger depend on the same foundry and the same advanced packaging capacity, roughly 85% of which is committed through 2027. The challenger has less leverage in that negotiation, which is a structural disadvantage independent of product quality.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Chiplet architecture and the cost curve it produces',
        mechanism:
          'Building processors from smaller dies improves yield and lets different components use different process nodes, producing a cost per performance advantage that a monolithic design cannot match.',
        evidence: 'Sustained server processor share gains against the incumbent on performance per watt and per dollar.',
        erodedBy: 'Competitors adopting comparable architectures, which removes the differentiation rather than the capability.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Research spending concentrated on data centre products, a very large acquisition in programmable logic, and buybacks. The strategic focus on the data centre has been correct and the software investment has lagged what the accelerator opportunity requires.',
      good: [
        'Concentrating research on data centre products, where the addressable profit is, rather than defending consumer segments',
        'Acquiring programmable logic capability, which added networking and adaptive computing relevant to AI infrastructure',
      ],
      bad: [
        'Underinvesting in the software ecosystem for years, which is the actual barrier in accelerators and cannot be fixed quickly',
        'Buybacks executed while the accelerator opportunity required every available dollar of software and ecosystem investment',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Every buyer wants a second source to exist',
        body:
          'Hyperscalers spending roughly $600 billion in 2026 have a direct interest in not depending on a single accelerator supplier, and will support a credible alternative on strategic grounds rather than purely on merit. That is a tailwind available to no one else.',
        basis: 'REPORTED',
      },
      {
        heading: 'The constraint is packaging allocation, and the leader holds it',
        body:
          'Advanced packaging is roughly 85% committed through 2027 with lead times of 52 to 78 weeks. A challenger competing for the residual capacity cannot ship at scale even with a competitive product.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The software ecosystem gap, which money alone does not close',
        body:
          'The barrier in accelerators is a decade of libraries, frameworks and developer familiarity. Matching it requires customers to rewrite work, and the cost falls on them — which is why a competitive chip has repeatedly not been enough.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Hyperscalers building in-house instead of buying a second source',
        body:
          'The strategic desire for an alternative can be satisfied by a custom chip designed for the buyer rather than by a merchant challenger. That route competes for the same motive and the same packaging capacity.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'amd-second-source',
        title: 'Every buyer has a strategic reason to want this company to succeed',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Hyperscalers spending roughly $600 billion in 2026 do not want a single accelerator supplier, and that gives a credible challenger commercial support it would not earn on merit alone — design wins granted partly to keep an alternative alive. The server processor share gains prove the execution capability is real rather than asserted, and the chiplet architecture produces a genuine cost per performance advantage. The company does not need to beat the leader; it needs to be good enough that buyers can credibly threaten to switch.',
        requires: [
          'Hyperscalers continue supporting a second source on strategic grounds',
          'Server processor share gains continue funding the accelerator investment',
          'Advanced packaging allocation is sufficient to ship at meaningful scale',
        ],
        breaks: [
          'Hyperscalers satisfying the second-source motive with in-house custom silicon instead',
          'Packaging allocation remaining insufficient to ship at scale',
          'The software ecosystem gap proving decisive regardless of hardware competitiveness',
        ],
        modelLink: [
          { assumption: 'Segment revenue — data centre', note: 'Model server processors and accelerators separately. One is a share gain in progress and the other is an option, and blending them prices the option as certainty.' },
          { assumption: 'Revenue driver — units and packaging allocation', note: 'Model shipments against available packaging capacity rather than against design wins. Allocation is the binding constraint.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'amd-software-gap',
        title: 'The barrier is a decade of software, and the customer pays the switching cost',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Accelerator competition is not decided by silicon specifications. The entire research and production stack assumes the leader\'s libraries and frameworks, so adopting an alternative means rewriting and revalidating work — a cost the customer bears, which is why competitive chips have repeatedly failed to displace the incumbent. Closing that gap takes years of ecosystem investment the company underfunded for a decade. And the same advanced packaging capacity that constrains everyone is roughly 85% committed through 2027, with the leader holding the allocation and the challenger competing for the remainder.',
        requires: [
          'The software ecosystem gap remains the decisive factor in accelerator adoption',
          'Packaging allocation continues favouring the incumbent',
        ],
        breaks: [
          'Abstraction layers and compilers making model code genuinely portable across accelerators',
          'Packaging capacity expanding enough that allocation stops being a barrier',
          'A large customer committing to the platform at a scale that forces ecosystem development',
        ],
        modelLink: [
          { assumption: 'Revenue driver — accelerator units', note: 'Model accelerator revenue off actual shipments rather than off announced design wins. The gap between the two is the thesis.' },
          { assumption: 'Research and development expense', note: 'Closing a software gap costs money for years before it produces revenue. Model the spend without the revenue.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Medium / Adnan Masood — semiconductors in 2026: structural bottlenecks', url: 'https://medium.com/@adnanmasood/semiconductors-in-2026-the-ai-driven-upswing-meets-structural-bottlenecks-3568b004905b' },
      { label: 'QuantFlowLab — AI semiconductor spending', url: 'https://quantflowlab.com/ai-semiconductor-spending/' },
      { label: 'IDC — semiconductor market forecast 2026', url: 'https://www.idc.com/resource-center/blog/semiconductor-market-to-surge-past-the-trillion-dollar-threshold-ai-infrastructure-drives-market-growth/' },
    ],
  },

  {
    ticker: 'INTC',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'Attempting to fund a foundry build from a product business that is losing share while it does so — capital spending at more than twice depreciation, free cash flow negative by construction, and the United States government now a shareholder.',
    howItEarns: [
      {
        heading: 'x86 processors, in a market where share is being lost',
        body:
          'Client and server processors sold into personal computers and data centres, where a competitor has taken substantial share on performance per watt. The installed base and the instruction set still carry the revenue, and the direction of share is the problem.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A foundry that does not yet have customers at scale',
        body:
          'Manufacturing chips for other companies requires process competitiveness, customer trust and capacity, and the business is currently reported at a large negative margin. It is a build, not a business, and the product side is paying for it.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No traditional controlling shareholder, but the United States government has taken an equity stake of roughly ten per cent — making the state one of the largest holders in a company whose strategy is itself a matter of industrial policy.',
      voting: 'One class of common stock, one share one vote, with the government holding a significant stake.',
      relatedPartyExposure: [
        'The United States government as both a large shareholder and the provider of subsidies and conditions on domestic capacity',
        'Tax and financing structures with investment partners that share the economics of specific fabs',
        'A majority-held autonomous driving subsidiary that is separately listed',
      ],
      minorityProtections: [
        'Single voting class, so the government\'s influence is proportional to its stake',
        'SEC reporting with separate disclosure of foundry segment losses',
        'Existing shareholders\' economic rights unchanged by the state\'s participation',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'A government shareholder changes what the company optimises for',
        body:
          'With the state holding roughly a tenth of the equity and providing subsidies for domestic capacity, decisions about where to build and how fast are partly policy outcomes. That support is what makes the foundry attempt financeable, and it also means capital may be deployed for reasons other than return.',
        basis: 'REPORTED',
      },
      {
        heading: 'Off-balance-sheet fab financing obscures the true capital position',
        body:
          'Structures in which investment partners fund fabs in exchange for a share of the output or economics keep capital off the balance sheet while committing future production. The reported leverage understates the obligations, which matters in a business already free cash flow negative.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'The x86 installed base and its software',
        mechanism:
          'Decades of enterprise and consumer software compiled for x86 means migration requires recompilation and revalidation. It is a real switching cost and it has slowed the share loss rather than prevented it.',
        evidence: 'A majority share of client computing retained despite years of a competitively superior alternative being available.',
        erodedBy: 'Alternative architectures in servers and clients, and cloud workloads where the instruction set is invisible to the customer.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Manufacturing capacity inside the United States and Europe',
        mechanism:
          'Owning fabs in jurisdictions that governments and customers want supply from is an asset no fabless competitor has, and it attracts subsidy and preferential procurement.',
        evidence: 'Government equity participation and subsidy support directed at exactly this capacity.',
        erodedBy: 'Competitors building subsidised capacity in the same jurisdictions, which removes the scarcity.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Capital spending at roughly 45% of revenue against depreciation near 20%, funded by debt, subsidy, partner structures and the dividend\'s suspension. It is the most capital-intensive turnaround attempt in the industry, and the product business funding it is shrinking.',
      good: [
        'Suspending the dividend rather than funding it with debt while free cash flow is deeply negative',
        'Securing government equity and subsidy support, which makes a capital programme of this scale financeable at all',
      ],
      bad: [
        'Years of process delays that allowed a competitor to take share and the foundry lead to become unbridgeable at the time',
        'A foundry segment reported at a large negative margin, funded by a product business losing share — the hardest possible sequencing',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Industrial policy is a revenue and equity line here',
        body:
          'Grants, loans, tax credits and now a government equity stake change the after-tax return on domestic capacity. A capital plan in this sector is partly a negotiation with governments, and this company is the clearest example.',
        basis: 'REPORTED',
      },
      {
        heading: 'Capital intensity at more than twice depreciation, for years',
        body:
          'Capital spending near 45% of revenue against depreciation near 20% means free cash flow is negative by construction and will be for as long as the build continues. The valuation depends on whether the process roadmap lands, not on the discount rate.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Process execution, on which everything depends',
        body:
          'The entire case rests on the next process nodes being competitive and on external customers trusting them enough to commit. Neither is a financial variable and neither can be accelerated with capital.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Share loss in the business funding the build',
        body:
          'Every point of processor share lost reduces the cash available to fund the foundry. The two problems are linked, and solving the second requires surviving the first.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'intc-policy-backed-option',
        title: 'A state-backed option on domestic manufacturing existing at all',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Nearly all leading-edge logic is manufactured on one island, and the governments of the countries that consume most of it have decided that is unacceptable. This is the only Western company attempting to change it, which is why the United States government took roughly a tenth of the equity and why subsidies are directed here. That support makes an otherwise unfinanceable capital programme possible, and it means the downside is cushioned by a shareholder with non-financial motives. It is an option on execution, priced at a fraction of replacement cost of the fabs.',
        requires: [
          'Process roadmap milestones are met and external foundry customers commit',
          'Government support continues through the build',
          'The product business stabilises enough to fund the remainder',
        ],
        breaks: [
          'Further process delays, which have been the company\'s defining failure for a decade',
          'External foundry customers declining to commit volume, leaving the capacity unfilled',
          'Continued processor share loss removing the cash flow funding the build',
        ],
        modelLink: [
          { assumption: 'Segment margins — products versus foundry', note: 'Model foundry losses separately from the product business. Consolidated, the funding dynamic is invisible.' },
          { assumption: 'Capex path and free cash flow', note: 'Free cash flow is negative by construction. Value on the asset base and the option rather than on discounted free cash flow, which will say the equity is worthless.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'intc-funding-mismatch',
        title: 'Funding a fab build from a shrinking product business is the hardest sequence in the industry',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Capital spending at roughly 45% of revenue against depreciation near 20% means free cash flow is negative for as long as the build runs, and the business paying for it is losing share to a competitor with a better architecture. Off-balance-sheet partner structures commit future output while keeping capital off the reported leverage, so the obligations exceed what the balance sheet shows. A discounted cash flow is close to uninformative here: the question is solvency and process execution, neither of which a discount rate addresses, and the record on process execution is a decade of missed nodes.',
        requires: [
          'Capital intensity remains at multiples of depreciation',
          'Processor share loss continues reducing the cash flow available',
          'Foundry segment losses persist without external volume commitments',
        ],
        breaks: [
          'A process node that is demonstrably competitive, which would change the customer conversation',
          'External foundry commitments large enough to fund the capacity',
          'Product share stabilising, restoring the funding base',
        ],
        modelLink: [
          { assumption: 'Capex path and debt schedule', note: 'Model the funding gap explicitly — capex less operating cash flow — and check how it is financed each year. That is the actual analysis.' },
          { assumption: 'Off-balance-sheet obligations', note: 'Partner fab structures commit future output. Include them in the equity bridge rather than reading reported leverage alone.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Sourceability — 2026 semiconductor industry market outlook', url: 'https://sourceability.com/post/whats-ahead-in-2026-for-the-semiconductor-industry' },
      { label: 'Silicon Analysts — semiconductor repricing and foundry dynamics', url: 'https://siliconanalysts.com/analysis/semiconductor-repricing-wave-price-hikes-reshape-chip-supply-chain' },
      { label: 'McKinsey Electronics — semiconductor outlook 2026', url: 'https://www.mckinsey-electronics.com/post/strategic-semiconductor-and-electronic-component-trends-to-shape-2026-market-dynamics-technologica' },
    ],
  },

  {
    ticker: 'ORCL',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'A database franchise with prohibitive switching costs funding an aggressive late entry into AI infrastructure — a contracted backlog measured in hundreds of billions, concentrated in very few counterparties.',
    howItEarns: [
      {
        heading: 'Database licences and support that customers cannot leave',
        body:
          'The relational database runs mission-critical workloads where migration means rewriting applications and revalidating data integrity. Support renewals therefore recur at high margins almost regardless of price, and that annuity funds everything else.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Cloud infrastructure sold on committed contracts',
        body:
          'A late entry into infrastructure, competing by offering capacity at aggressive terms to AI workloads. Revenue is recognised as capacity is consumed against multi-year commitments, so the reported backlog leads the revenue by years and the capital has to be spent first.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No formal controlling shareholder, but the founder holds a very large stake — enough that his position dominates the register and his strategic preferences effectively set direction.',
      voting: 'One class of common stock, one share one vote, with the founder as by far the largest holder.',
      relatedPartyExposure: [
        'A founder with a dominant economic stake and executive influence setting the capital programme',
        'Very large cloud commitments from a small number of counterparties, some of which are AI companies with their own funding requirements',
      ],
      minorityProtections: [
        'Single voting class, so the founder\'s influence is proportional to his economics',
        'SEC reporting including remaining performance obligations, which discloses the contracted backlog',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Founder-dominated strategy, executed at enormous scale',
        body:
          'The pivot to building AI infrastructure at this scale reflects one person\'s conviction, backed by a stake large enough that no one contests it. The upside of that is decisiveness — the company committed earlier and harder than peers of its size. The downside is that a bet this large rests on a single judgement with no institutional check.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The backlog is disclosed and the counterparty quality is not',
        body:
          'Remaining performance obligations are reported, which is genuinely useful. What is not disclosed with the same clarity is how concentrated those commitments are and how creditworthy the counterparties are — and some are AI companies whose own funding is not assured.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Database migration costs measured in years of application rewriting',
        mechanism:
          'Mission-critical applications written against this database cannot be moved without rewriting them and proving data integrity. The customer faces a multi-year project with operational risk, so renewal at a higher price is usually the cheaper option.',
        evidence: 'Support renewal rates and pricing sustained for decades against cheaper and technically adequate alternatives.',
        erodedBy: 'Cloud-native databases adopted for new applications, which shrinks the base gradually rather than displacing it.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Enterprise applications integrated with the database beneath them',
        mechanism:
          'Selling the applications and the database together means the customer buys a stack where the components are certified against each other, which reduces integration risk and raises the cost of replacing any piece.',
        evidence: 'Application suite renewals attached to database relationships across large enterprise accounts.',
        erodedBy: 'Cloud application vendors whose products run on any database, which unbundles the stack.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A history of debt-funded buybacks and acquisitions, now redirected into an enormous AI infrastructure build. The switch from returning capital to spending it is abrupt and the scale is unprecedented for this company.',
      good: [
        'Acquiring enterprise application franchises and integrating them with the database, which extended the switching-cost advantage upward',
        'Committing to AI infrastructure capacity earlier and more aggressively than peers of comparable size, winning contracted backlog',
      ],
      bad: [
        'Years of buybacks funded with debt, which left leverage elevated entering a capital-intensive phase',
        'Very large capacity commitments concentrated in a small number of counterparties whose own funding is not assured',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Competing for AI workloads by being cheaper and more available',
        body:
          'With hyperscaler capital spending forecast near $600 billion in 2026 and packaging capacity constrained, capacity availability is itself a competitive advantage. A late entrant willing to commit capital aggressively can win workloads on terms the incumbents will not match.',
        basis: 'REPORTED',
      },
      {
        heading: 'Capital must be spent before the contracted revenue arrives',
        body:
          'Backlog is recognised as capacity is consumed, so the fabs, buildings and accelerators are paid for first. That inverts the usual software cash flow profile and makes this company temporarily capital-intensive in a way its multiple has not historically reflected.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Counterparty concentration in the contracted backlog',
        body:
          'A backlog is only worth the customers\' ability to pay for it, and some of these customers are AI companies dependent on continued external funding. Concentration turns a customer problem into a company problem.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Capital committed against demand that may be deferred',
        body:
          'Capacity built for committed workloads becomes stranded cost if the workloads do not arrive. The company has less balance sheet flexibility than the hyperscalers competing for the same demand.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'orcl-backlog-conversion',
        title: 'A database annuity funding a capacity land grab, with the backlog already signed',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The database business produces high-margin recurring revenue from customers whose alternative is a multi-year application rewrite, which funds an infrastructure build the company could not otherwise attempt. With packaging capacity constrained and hyperscaler spending near $600 billion, capacity availability is itself a competitive advantage — and a late entrant willing to commit capital wins workloads on terms incumbents decline. The contracted backlog is disclosed, which makes the revenue path more knowable than a demand forecast.',
        requires: [
          'Contracted backlog converts to revenue as capacity is delivered',
          'Database support renewals continue funding the build',
          'Counterparties honour their commitments',
        ],
        breaks: [
          'Backlog counterparties failing to fund their commitments, which turns contracted revenue into stranded capacity',
          'Capacity delivery delays that push conversion beyond the capital already spent',
          'Database base eroding faster than expected as new applications go to cloud-native alternatives',
        ],
        modelLink: [
          { assumption: 'Revenue driver — backlog conversion schedule', note: 'Model remaining performance obligations converting on a disclosed schedule rather than a growth rate. That is what makes this testable.' },
          { assumption: 'Capex path and free cash flow', note: 'Capital is spent before revenue arrives. Model the funding gap year by year rather than a steady-state margin.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'orcl-counterparty-concentration',
        title: 'A backlog is worth the credit of whoever signed it',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The contracted backlog is the bull case and it is concentrated in very few counterparties, some of them AI companies whose ability to pay depends on continued external funding rather than on their own cash flow. Capacity must be built and paid for before the revenue is recognised, so a counterparty that cannot fund its commitment leaves stranded assets financed with debt raised by a company that spent years buying back shares with borrowings. The founder\'s dominant stake means the scale of the bet reflects a single judgement with no institutional check on it.',
        requires: [
          'Backlog remains concentrated in few counterparties with uncertain funding',
          'Capital continues being committed ahead of revenue recognition',
        ],
        breaks: [
          'Backlog broadening across many creditworthy enterprise customers',
          'Counterparties demonstrating self-funded cash flow sufficient for their commitments',
        ],
        modelLink: [
          { assumption: 'Backlog conversion and credit', note: 'Haircut the backlog for counterparty credit rather than treating it as contracted revenue. That haircut is the thesis.' },
          { assumption: 'Net debt and debt schedule', note: 'Model the capital programme against the existing leverage. The risk is the interaction, not either alone.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'IDC — semiconductor market forecast 2026 and AI infrastructure demand', url: 'https://www.idc.com/resource-center/blog/semiconductor-market-to-surge-past-the-trillion-dollar-threshold-ai-infrastructure-drives-market-growth/' },
      { label: 'QuantFlowLab — AI semiconductor spending and hyperscaler capex', url: 'https://quantflowlab.com/ai-semiconductor-spending/' },
      { label: 'Medium / Adnan Masood — semiconductors in 2026: bottlenecks and capacity', url: 'https://medium.com/@adnanmasood/semiconductors-in-2026-the-ai-driven-upswing-meets-structural-bottlenecks-3568b004905b' },
    ],
  },

  {
    ticker: 'CRM',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'A per-seat subscription business in the one sector where the central unresolved question is whether generative tools raise output per seat or reduce the seats needed.',
    howItEarns: [
      {
        heading: 'Seats, multiplied by price, renewed annually',
        body:
          'Sales, service, marketing and analytics software licensed per user per month. Revenue growth is seats times price, and the two can move in opposite directions — which is why net revenue retention rather than headline growth is the metric that describes the business.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Platform and integration lock-in beyond the applications',
        body:
          'Customers build workflows, custom objects and integrations on top of the platform, and an ecosystem of consultancies and third-party applications depends on it. Replacing the software means rebuilding that layer, which is usually more expensive than the licence.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float and a founder holding a modest stake without special rights.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'A venture investment arm holding stakes in companies that are also partners and customers',
        'Large acquisitions whose sellers became significant shareholders',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting, and a proxy record including multiple activist campaigns that produced board changes and margin commitments',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Activists forced the margin discipline the company had avoided',
        body:
          'A period of large acquisitions and weak margin performance attracted multiple activist campaigns, which produced board changes, cost reductions and public margin targets. The dispersed single-class structure is what made that possible, and the improvement followed pressure rather than initiative.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A venture portfolio inside a software company',
        body:
          'Holding equity stakes in private companies that are also partners introduces gains and losses unrelated to operations, and a conflict where commercial decisions affect investment values. It is small relative to revenue and it is not what shareholders are underwriting.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Workflow and integration layer built by the customer',
        mechanism:
          'The expensive part of the deployment is not the licence but the custom objects, workflows and integrations the customer built. Replacing the vendor means rebuilding all of it, and the cost is borne by the customer rather than the seller.',
        evidence: 'Renewal rates and net revenue retention sustained at a premium price against functionally adequate cheaper alternatives.',
        erodedBy: 'Generative tools that make rebuilding integrations dramatically cheaper, which would lower the switching cost the moat rests on.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Partner and consultancy ecosystem',
        mechanism:
          'A large ecosystem of implementation partners and third-party applications makes the platform the default choice, because the skills and add-ons exist for it and not for alternatives.',
        evidence: 'A partner ecosystem no competitor in the category has matched in scale.',
        erodedBy: 'Consultancies building equivalent practices around competing platforms as those platforms gain share.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A long history of large acquisitions funded with stock and cash, followed by activist-driven cost discipline, margin expansion and substantial buybacks. The acquisitions built the portfolio and diluted shareholders considerably.',
      good: [
        'Expanding margins substantially after the activist campaigns, demonstrating the cost base had been loose',
        'Initiating buybacks and a dividend, which changed the capital return profile of a company that had only issued stock',
      ],
      bad: [
        'A sequence of very large acquisitions at high multiples funded partly with stock, which diluted shareholders while growth slowed',
        'A venture portfolio that introduces non-operating gains and losses and conflicts with commercial relationships',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The seat question is the sector\'s central unresolved argument',
        body:
          'Subscription software is priced per seat for work that generative models increasingly do faster. The bull reading is that tools raise output per seat and justify the price; the bear reading is that fewer seats are needed. It shows up first in net revenue retention rather than in headline growth.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Inference costs land in cost of revenue',
        body:
          'Adding AI features to a subscription product means serving models, and that cost appears in gross margin. A business whose gross margin was near eighty per cent because software has no marginal cost now has one.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Seat counts falling as customers automate the work',
        body:
          'If generative tools reduce the number of sales and service staff an organisation needs, the licence count falls regardless of how good the software is. That is the structural risk and it cannot be priced around.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Generative tools lowering the switching cost',
        body:
          'The moat is the expense of rebuilding integrations and workflows. Tools that make that rebuilding cheap attack the moat rather than the product.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'crm-consumption-pricing',
        title: 'Pricing can move from seats to consumption, and the switching cost buys time to do it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The seat model is genuinely threatened and it is not the only way to charge. A customer whose workflows, custom objects and integrations are built on the platform faces a rebuilding cost that exceeds the licence, which gives the vendor time to reprice toward consumption, outcomes or agent-based units rather than headcount. Activist pressure already demonstrated the cost base could support far better margins, so the company has a demonstrated ability to protect profitability while the pricing model transitions. Net revenue retention is where this will be visible first.',
        requires: [
          'Switching costs hold long enough for pricing to transition away from seats',
          'Consumption or outcome-based pricing is adopted by customers at comparable revenue per account',
          'Margin discipline holds as inference costs enter cost of revenue',
        ],
        breaks: [
          'Seat counts falling faster than pricing can transition',
          'Generative tools making integration rebuilding cheap, which removes the switching cost that buys the time',
          'Gross margin compressing as inference costs scale with usage',
        ],
        modelLink: [
          { assumption: 'Revenue driver — seats and revenue per seat', note: 'Model seats and price separately. The transition thesis requires price per account rising while seats fall, which one growth rate cannot express.' },
          { assumption: 'Gross margin', note: 'Inference cost lands in cost of revenue. Model gross margin declining rather than holding at the historical software level.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'crm-seat-deflation',
        title: 'Priced per seat for work that is being automated',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The product is licensed per user for sales and service work, and generative tools are reducing the number of people needed to do exactly that work. If a customer\'s service team shrinks, the licence count shrinks with it regardless of product quality — and the same tools lower the cost of rebuilding the integrations that constitute the switching cost, attacking the moat from the other side. Meanwhile adding AI features means serving models, which puts a marginal cost into a business that had none. Revenue growth has already slowed, and the metric that reveals this is net revenue retention rather than headline growth.',
        requires: [
          'Generative tools continue reducing headcount in the functions this software serves',
          'Integration rebuilding costs fall as tooling improves',
        ],
        breaks: [
          'Pricing successfully transitioning to consumption or outcomes at comparable revenue per account',
          'Evidence that automation raises output per seat without reducing seat counts',
        ],
        modelLink: [
          { assumption: 'Revenue driver — seats', note: 'Model a declining seat count with flat price and see what happens. That is the case the multiple does not contemplate.' },
          { assumption: 'Net revenue retention', note: 'This is the metric that moves first. Model it below 100% rather than assuming expansion continues.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Sourceability — 2026 technology and semiconductor market outlook', url: 'https://sourceability.com/post/whats-ahead-in-2026-for-the-semiconductor-industry' },
      { label: 'AdTech predictions for 2026 — automation and agentic tooling', url: 'https://spyro-soft-adtech.com/adtech-predictions-2026/' },
    ],
  },

  {
    ticker: 'ADBE',
    sector: 'Information Technology',
    scope: 'GLOBAL',
    headline:
      'File formats that are industry standards, a subscription base of creative professionals, and a de-rating that says the market believes generative tools will collapse the price of what it sells.',
    howItEarns: [
      {
        heading: 'Creative subscriptions at roughly thirty dollars a month',
        body:
          'Design, video, photography and document software licensed monthly to individuals, agencies and enterprises. Gross margin near ninety per cent means almost all of the revenue reaches operating profit, and the only real costs are the people who build and sell it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Document and marketing clouds are separate businesses',
        body:
          'Electronic signature and document workflow, plus enterprise marketing and analytics, are sold to different buyers with different renewal dynamics. The document business in particular is a workflow standard rather than a creative tool.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float and a single share class.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Partnerships with platform and model providers whose tools also compete with the company\'s own',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting including subscription and remaining performance obligation disclosure',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A long-tenured management team that executed one hard transition already',
        body:
          'Moving from perpetual licences to subscriptions was a multi-year transition that depressed reported revenue before improving it, and it was completed successfully under the same leadership. That is the relevant precedent for whether the company can navigate a second model change, and it is precedent rather than proof.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Capital returned almost entirely through buybacks, with no dividend',
        body:
          'Essentially all free cash flow goes to repurchases rather than dividends, which suits a company whose shares have been expensive and becomes more valuable if the de-rating persists. It also means shareholders receive nothing if the buyback is suspended.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'File formats that are industry standards',
        mechanism:
          'Documents, design files and video projects are exchanged in formats this company defined, so an agency, printer or client expects them. That makes the software the interchange standard rather than one option, and switching means breaking compatibility with everyone else in the chain.',
        evidence: 'Formats used as the default interchange standard across publishing, design and document workflows for decades.',
        erodedBy: 'Open formats and generative tools that produce output directly, bypassing the file exchange entirely.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Skills base and training entrenchment',
        mechanism:
          'Creative professionals learn these tools in education and build careers on them, and employers hire for those skills. That makes the installed base a labour market rather than a software choice.',
        evidence: 'Job specifications and educational curricula built around the software across the creative industries.',
        erodedBy: 'Generative interfaces requiring no specialist skill, which makes the trained skill less valuable and the tool less necessary.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Very large buybacks funded by near-ninety-per-cent gross margins, minimal capital intensity, and a thin acquisition record after one large attempted deal was abandoned on competition grounds. Capital discipline is high and the strategic options are correspondingly limited.',
      good: [
        'Returning essentially all free cash flow through buybacks, which is correct for a business with no capital requirements',
        'Completing the perpetual-to-subscription transition, which raised the quality and predictability of the revenue permanently',
      ],
      bad: [
        'A large acquisition attempt abandoned on competition grounds, which cost a break fee and left the strategic gap it was meant to fill',
        'Goodwill at roughly sixty per cent of revenue from earlier acquisitions, whose contribution is not separately visible',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The generative threat is priced and unresolved',
        body:
          'The shares have de-rated materially on the argument that generative tools reduce the need for professional creative software. That is the same seat-versus-output question facing all subscription software, and here the market has already taken a side.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Inference costs enter a near-ninety-per-cent gross margin',
        body:
          'Adding generative features means serving models, which puts a genuine marginal cost into a business that had almost none. It is a small absolute cost against an extraordinary margin and it is a direction of travel.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Generative tools reducing the number of professional seats',
        body:
          'If a marketing team produces the same output with fewer designers, the subscription count falls. The threat is to the seat count rather than to the product quality, which is the harder version of the problem.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Output bypassing the file exchange standard',
        body:
          'The moat is that files are exchanged in these formats. A generative tool that produces finished output directly never creates the file, which routes around the standard rather than competing with it.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'adbe-standards-and-derating',
        title: 'Interchange standards and a trained labour market, priced as if both have gone',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The shares have de-rated on the argument that generative tools remove the need for professional creative software. What that argument understates is that the moat is not feature superiority — it is that files are exchanged in these formats across publishing, design and document workflows, and that an entire labour market is trained on the tools and hired for the skills. Both take a very long time to displace. The company has also already navigated one model transition, from perpetual licences to subscriptions, under the same leadership. At a de-rated multiple with near-ninety-per-cent gross margins and all cash returned through buybacks, the bar the business must clear is low.',
        requires: [
          'File format interchange standards hold across the creative and document chain',
          'Professional seat counts hold as generative features are added rather than falling',
          'Gross margin absorbs inference costs without material compression',
        ],
        breaks: [
          'Generative output bypassing the file exchange entirely, which routes around the standard',
          'Professional seat counts falling as output per person rises',
          'Open or model-native formats becoming the interchange standard',
        ],
        modelLink: [
          { assumption: 'Revenue driver — subscriptions and revenue per subscription', note: 'Model subscription count and price separately. The seat question is the whole disagreement and a blended growth rate hides it.' },
          { assumption: 'Gross margin', note: 'Model inference cost entering cost of revenue. A near-ninety-per-cent margin has room and the direction matters.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'adbe-seat-collapse',
        title: 'The tools that create the output are the ones being automated',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'This is the subscription software company most directly exposed to generative capability, because the work it charges per seat for — producing images, video and layouts — is exactly what generative models do. A marketing team producing the same output with fewer designers needs fewer subscriptions, regardless of how good the software is. And the moat is that files are exchanged in these formats: a tool that generates finished output never creates the file, so it bypasses the standard rather than competing on features. The de-rating reflects a real structural question, not a sentiment cycle.',
        requires: [
          'Generative tools continue reducing the professional headcount needed for creative output',
          'Output increasingly bypasses the file exchange workflow',
        ],
        breaks: [
          'Seat counts holding as generative features raise output per professional rather than reducing the number',
          'Generative capability being adopted through this company\'s own products, converting the threat into a price increase',
        ],
        modelLink: [
          { assumption: 'Revenue driver — subscription count', note: 'Model a declining subscription count with flat price. That is the case the historical growth rate cannot represent.' },
          { assumption: 'Terminal growth', note: 'A terminal value built on the current seat base is the specific thing this thesis disputes.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'AdTech predictions for 2026 — generative and agentic tooling', url: 'https://spyro-soft-adtech.com/adtech-predictions-2026/' },
      { label: 'The Current — marketers on AI, creative and measurement in 2026', url: 'https://www.thecurrent.com/innovation/culture-marketers-predict-streaming-measurement-ai-retail-2026' },
    ],
  },

  {
    ticker: 'TOTS3',
    sector: 'Information Technology',
    scope: 'BRAZIL',
    headline:
      'The dominant Brazilian business software vendor, whose product is mandatory because the tax code changes constantly — and whose expansion into financial services put it into competition with the banks it sells to.',
    howItEarns: [
      {
        heading: 'Management software that Brazilian tax law makes compulsory',
        body:
          'Enterprise and small business management systems sold by subscription to Brazilian companies. The product is effectively mandatory: tax and labour compliance in Brazil changes frequently enough that a company cannot maintain its own systems, and the vendor updates for every change.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Techfin and business performance are the growth attempts',
        body:
          'Lending to and processing payments for the small businesses already using the software, plus data and analytics products. The logic is that the vendor sees the customer\'s receivables and can underwrite better than a bank — which is credible and puts it into credit risk it did not previously carry.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No single controlling shareholder. Ownership is dispersed across Brazilian and foreign institutions with a large free float, and founders hold significant non-controlling stakes.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no control block.',
      relatedPartyExposure: [
        'A financial services arm lending to the software customers, where commercial and credit decisions interact',
        'A joint venture in payments with a large financial institution that is also a competitor in that market',
        'A board without an anchor shareholder deciding the diversification strategy',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'No controlling block, so board composition is contested',
        'Segment disclosure separating software from the financial services and performance businesses',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A software company taking credit risk on its own customers',
        body:
          'Lending to the small businesses that use the software means commercial and credit decisions interact: a customer who cannot repay is also a subscription that lapses. The information advantage is real and so is the correlation, and a software multiple applied to a credit book is a category error.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Diversification decided by a board with no anchor holder',
        body:
          'The moves into lending, payments and analytics are strategic bets made by a professional board accountable to a dispersed register. That makes strategy contestable, which cuts both ways: it can be redirected, and there is no long-horizon owner committed to seeing it through.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Regulatory complexity that makes the vendor unavoidable',
        mechanism:
          'Brazilian tax, labour and electronic invoicing rules change constantly, and a company running its own systems cannot keep up. The vendor absorbs that maintenance for everyone, which is a service no customer would rationally insource and no foreign competitor wants to build.',
        evidence: 'Dominant share of Brazilian business management software sustained against global vendors who have not localised to the same depth.',
        erodedBy: 'Tax reform simplifying the code, which reduces the maintenance burden that makes the product mandatory.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Installed base with migration costs and vertical depth',
        mechanism:
          'Systems configured to a company\'s processes, with industry-specific modules for agribusiness, retail, health and construction, cannot be replaced without reimplementation. The vertical depth was built over decades of acquisitions.',
        evidence: 'Renewal rates and cross-selling across a very large installed base of Brazilian companies.',
        erodedBy: 'Cloud-native competitors winning new companies, which shrinks the future base rather than the current one.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Decades of acquisitions consolidating the Brazilian software market, then diversification into financial services and analytics. The consolidation was excellent; the diversification takes the company into markets where it has an information advantage and no cost advantage.',
      good: [
        'Consolidating the fragmented Brazilian business software market, which built the installed base that is the moat',
        'Building vertical modules for specific industries, which deepened switching costs beyond generic functionality',
      ],
      bad: [
        'Entering lending and payments, which introduces credit risk and competes with the financial institutions that are also partners',
        'A payments joint venture with a large bank, which shares the economics of a market the company entered to capture',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Tax reform is a threat to the moat, not just a cost',
        body:
          'Brazil\'s consumption tax reform simplifies a code whose complexity is precisely what makes this software mandatory. In the transition it generates work and revenue; on the other side it reduces the maintenance burden that no customer wants to insource.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Lending to small businesses at Brazilian credit conditions',
        body:
          'With average corporate credit rates above 25% and a record 82% of households in debt, the small businesses this company lends to are under genuine stress. An information advantage in underwriting does not remove a credit cycle.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Credit losses in the financial services arm',
        body:
          'Lending to small businesses in a high-rate environment produces losses, and here they correlate with subscription churn because the borrower and the customer are the same entity.',
        basis: 'REPORTED',
      },
      {
        heading: 'Tax simplification reducing the need for the product',
        body:
          'The moat is complexity the customer cannot manage. Reform that simplifies the code weakens the reason the software is mandatory, on a long timescale and in one direction.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'tots3-mandatory-software',
        title: 'A product the tax code makes compulsory, in a market global vendors have not localised for',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Brazilian tax, labour and invoicing rules change often enough that no company can maintain its own systems, and no global software vendor has localised to the required depth. That makes this product effectively mandatory rather than chosen, across an installed base built by decades of consolidation and deepened by industry-specific modules. Subscription revenue from a compulsory product with high switching costs is among the most durable revenue available in the Brazilian market, and the easing cycle improves the small business customer base that pays for it.',
        requires: [
          'Regulatory complexity continues making the product effectively mandatory',
          'Global vendors continue not localising to comparable depth',
          'Small business customer health improves as rates fall',
        ],
        breaks: [
          'Tax reform simplifying the code enough that maintenance ceases to be prohibitive',
          'Cloud-native local competitors winning the new company formation cohort',
          'Credit losses in the lending arm consuming the software profits',
        ],
        modelLink: [
          { assumption: 'Segment revenue and margins', note: 'Model software, financial services and performance separately. A credit book does not belong in a software margin.' },
          { assumption: 'Revenue driver — customers and revenue per customer', note: 'Model the installed base and price per customer. The moat is the base, not the growth rate.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'tots3-credit-and-reform',
        title: 'Taking credit risk on its own customers, while reform erodes the reason they must buy',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Two structural problems point the same way. Lending to the small businesses that use the software means a default and a lapsed subscription are the same event — the risks correlate rather than diversify, and Brazilian corporate credit rates above 25% mean that book is being built into genuine stress. And the moat is regulatory complexity the customer cannot manage, which consumption tax reform is designed to reduce. The transition generates work; the destination is a simpler code that makes the product less unavoidable. A software multiple applied to a company carrying a correlated credit book into a simplifying regulatory environment is pricing neither risk.',
        requires: [
          'The lending book continues growing against small business borrowers under credit stress',
          'Tax reform proceeds toward genuine simplification',
        ],
        breaks: [
          'Credit losses staying within provisions through the cycle, proving the information advantage is real',
          'Tax reform producing a transition complex enough to sustain the maintenance requirement indefinitely',
        ],
        modelLink: [
          { assumption: 'Cost of risk / provisions — financial services', note: 'Give the lending book a cost-of-risk assumption as you would a bank. That line does not exist in a software model and it is where this thesis lives.' },
          { assumption: 'Terminal growth — software segment', note: 'Model terminal growth lower if simplification reduces the compulsory nature of the product.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Itaponews — Brazilian corporate credit rates above 25% and small business stress', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
      { label: 'Chambers — Brazilian financial services and fintech regulation trends', url: 'https://practiceguides.chambers.com/practice-guides/fintech-2026/brazil/trends-and-developments' },
    ],
  },
];
