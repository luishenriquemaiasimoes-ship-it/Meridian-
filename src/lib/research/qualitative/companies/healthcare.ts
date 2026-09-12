import type { CompanyQualitative } from '../types';

export const HEALTH_CARE: CompanyQualitative[] = [
  {
    ticker: 'HAPV3',
    sector: 'Health Care',
    scope: 'BRAZIL',
    headline:
      'The most verticalised health operator in Brazil, which built hospital capacity ahead of the beneficiaries to fill it and then had to reprice a book at above twenty per cent to survive the claims ratio.',
    howItEarns: [
      {
        heading: 'A premium collected, and care delivered by assets it owns',
        body:
          'The company insures beneficiaries and then treats them in its own hospitals, clinics and laboratories, so a cost it would otherwise pay a third party becomes internal revenue at a margin. That is the entire logic of verticalisation and it works while the owned beds are full.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The claims ratio is the whole profit and loss account',
        body:
          'A two-point move in the share of premium paid out as medical cost swings the margin more than any commercial initiative. Premiums reset annually and costs accrue continuously, so a bad year is absorbed in full before it can be repriced.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Founder-influenced with a dispersed register following successive equity issuances and acquisitions. No holder has a clear majority, and the company has been through board and management change under shareholder pressure.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no controlling block.',
      relatedPartyExposure: [
        'Acquisitions were repeatedly paid for partly in shares issued to selling physicians and hospital owners, creating a register of former counterparties',
        'A board without an anchor holder makes strategy contestable and has produced management turnover',
        'Related-party arrangements with clinics and providers brought in through the acquisition programme',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'ANS supervision of technical provisions and solvency, which constrains how much business can be written',
        'No controlling block, so board composition is contested',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'An acquisition programme that outran the integration',
        body:
          'Dozens of hospitals and operators were bought in a few years, largely with issued equity, before the systems, clinical protocols and claims management were in place to run them as one business. The result was a claims ratio the company could not see accurately until it was already too high, and the correction required repricing, disposals and management change.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Dispersed ownership has meant real accountability, late',
        body:
          'With no controller, shareholders were eventually able to force changes in board, management and strategy. That is the mechanism working — and it worked after the capital had been spent, which is the limit of dispersed governance as a protection.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Owned care capacity in the regions it insures',
        mechanism:
          'Treating your own beneficiaries in your own hospitals captures the provider margin and allows clinical protocols to control utilisation, which a pure insurer negotiating with independent hospitals cannot do.',
        evidence: 'A high share of claims directed to owned facilities, which converts purchased cost into internal revenue.',
        erodedBy: 'Losing beneficiaries, which turns owned capacity from a margin capture into a fixed-cost trap.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'One of the clearest cases of capital destruction in the recent Brazilian market: an acquisition programme funded largely with equity, at prices reflecting a growth assumption that the claims experience did not support, followed by writedowns, disposals and repricing.',
      good: [
        'Repricing the book decisively once the claims ratio was understood, rather than defending beneficiary count',
        'Divesting non-core hospitals and assets to reduce the fixed-cost base and leverage',
      ],
      bad: [
        'Acquiring dozens of operators and hospitals faster than they could be integrated or their utilisation understood',
        'Building and buying bed capacity ahead of the beneficiary growth required to fill it',
        'Equity issued at prices that assumed a margin the underlying book was not producing',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The repricing worked and the volume consequence has not fully arrived',
        body:
          'Collective plans have no ANS cap and were expected to reprice above 20%, against an individual cap of 5.11% — the lowest ever set — for anniversaries from May 2026. Margin has been restored by making the product materially more expensive, and the beneficiary response shows up in net additions with a lag.',
        basis: 'REPORTED',
      },
      {
        heading: 'Verticalisation is a fixed-cost bet on the beneficiary count',
        body:
          'The sector\'s claims ratio approached 90% in 2023, producing negative margins and ANS interventions. An operator that owns hospitals deteriorates twice as fast as one that only insures when the book shrinks, because the beds stay and the premium leaves.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Beneficiary attrition after a twenty per cent repricing',
        body:
          'A product repriced that hard in a market with stagnant real wages and a record 82% of households in debt loses members with a lag. Owned hospital capacity makes that loss more damaging than it would be for a pure insurer.',
        basis: 'REPORTED',
      },
      {
        heading: 'Judicialisation adding cost that cannot be underwritten',
        body:
          'Courts order treatments outside the mandatory list and increasingly intervene in the reasonableness of price increases. That part of the cost base follows judicial outcomes rather than claims experience, so no actuarial process prices it.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'hapv3-repriced-book',
        title: 'The margin has been repaired; the question is what it was repaired on',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A repricing cycle above twenty per cent on uncapped collective contracts, combined with disposals of loss-making assets and clinical management of utilisation through owned facilities, has restored a claims ratio that had reached crisis levels. If the beneficiary base holds, the operating leverage is substantial — the fixed hospital cost is already in place, so incremental members arrive at a very high contribution margin. The turnaround is real; it is a bet that the volume consequence of the repricing is smaller than the margin gain.',
        requires: [
          'Net beneficiary additions stabilise rather than continuing to fall after the repricing',
          'Owned facility occupancy holds, so verticalisation captures margin rather than carrying empty beds',
          'Claims ratio stays at the repaired level rather than drifting back up',
        ],
        breaks: [
          'Beneficiary attrition accelerating, which reverses operating leverage on an owned hospital base',
          'Claims ratio deteriorating again as utilisation returns after the price shock',
          'Judicial intervention in collective repricing, which would remove the mechanism that repaired the margin',
        ],
        modelLink: [
          { assumption: 'Revenue driver — beneficiaries and average ticket', note: 'Model members and price per member separately. Revenue can rise on a shrinking book, and that is the trap this thesis has to clear.' },
          { assumption: 'Claims ratio / cost of services', note: 'The entire thesis is the claims ratio holding. Model it explicitly rather than as a margin percentage.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'hapv3-fixed-cost-trap',
        title: 'Owned beds are a fixed-cost trap when the book shrinks',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Verticalisation captures the provider margin while the hospitals are full and becomes a fixed-cost liability when they are not. The company repriced above twenty per cent into a market where real wages are stagnant, household debt is at a record, and the ANS cap protects only the shrinking individual segment. Margin recovery measured on a book that is about to contract is not margin recovery. The number that settles this is net beneficiary additions, not the claims ratio, and it is the one an operating turnaround narrative tends to leave out.',
        requires: [
          'Beneficiary count continues declining after the repricing',
          'Owned facility utilisation falls with the book',
          'Formal employment growth stays weak, since most beneficiaries are covered through employers',
        ],
        breaks: [
          'Net beneficiary additions turning positive at the new price level',
          'Occupancy maintained by selling capacity to third-party payers rather than only to own members',
          'Formal employment growth restoring corporate book volumes',
        ],
        modelLink: [
          { assumption: 'Revenue driver — beneficiaries', note: 'Model a declining member count with the fixed hospital cost base held. That combination is the thesis.' },
          { assumption: 'Operating leverage / fixed cost share', note: 'Owned capacity means cost does not scale down with revenue. If the model flexes costs with volume, it is not testing this.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Migalhas — ANS individual plan adjustment of 5.11% for 2026', url: 'https://www.migalhas.com.br/depeso/457761/reajuste-de-5-11-dos-planos-individuais-em-2026' },
      { label: 'Saúde Business — the challenge of health plan repricing', url: 'https://www.saudebusiness.com/operadoras/o-desafio-dos-reajustes-dos-planos-de-saude/' },
      { label: 'Conjur — courts intervening in health plan repricing', url: 'https://conjur.com.br/2026-jun-21/reajuste-planos-de-saude/' },
      { label: 'Itaponews — household indebtedness at a record', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
    ],
  },

  {
    ticker: 'RDOR3',
    sector: 'Health Care',
    scope: 'BRAZIL',
    headline:
      'The premium hospital network in Brazil, family-controlled, which bought an insurer to stop being a price taker to the operators that fill its beds.',
    howItEarns: [
      {
        heading: 'High-complexity hospital care, priced per procedure',
        body:
          'Revenue comes from treating patients referred by health plans, with pricing negotiated per procedure and per operator. High-complexity work — oncology, cardiology, surgery — carries better margins and is where the brand and the physician relationships matter, because operators cannot direct a complex case to a facility that cannot handle it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Owning an insurer changes the negotiation',
        body:
          'Acquiring a large insurance operation gave the group its own beneficiary base to direct into its own hospitals, converting part of the revenue from a negotiated price into an internal transfer. It is verticalisation approached from the provider side rather than the insurer side.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Moll family, founders of the hospital group, through a holding structure, with a substantial institutional free float and shares issued to the sellers of the acquired insurer.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the family holding a controlling block.',
      relatedPartyExposure: [
        'The controlling family decides transfer pricing between the owned insurer and the owned hospitals, which allocates profit between segments',
        'Physician partnerships and clinic arrangements brought in through acquisitions',
        'Shares issued to the sellers of the acquired insurer created a second influential holder group',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'ANS supervision of the insurance entity, separate from the hospital business',
        'Segment reporting that makes the internal economics partly observable',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A large acquisition that changed what the company is',
        body:
          'Buying a major insurer transformed a hospital group into an integrated payer-provider with a very different risk profile: underwriting risk, regulatory capital and a claims ratio, none of which a hospital operator previously carried. The strategic logic is sound and the execution risk was substantial, and the integration is the governance question that matters.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Internal transfer pricing is where two economics meet',
        body:
          'When the insurer pays the hospital, the price allocates profit between the segments and determines which one looks good. Minority shareholders own both, so the allocation is neutral to them in aggregate — but it makes segment analysis unreliable and it obscures whether either business is genuinely competitive on its own.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Premium hospital brands in dense urban markets',
        mechanism:
          'Reputation for complex care, combined with physician affiliation and locations in wealthy metropolitan areas, means operators must include these hospitals in their networks to sell a premium plan at all.',
        evidence: 'Pricing and occupancy in high-complexity procedures sustained above the general hospital market.',
        erodedBy: 'Operators building or buying their own premium capacity, and narrow-network plans that exclude expensive hospitals.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Physician relationships and complex-case capability',
        mechanism:
          'High-complexity medicine depends on specific clinical teams and equipment. Assembling them takes years and they cannot be replicated by building a building.',
        evidence: 'Concentration of complex procedures and referrals relative to the broader hospital sector.',
        erodedBy: 'Physician mobility, and the verticalised operators building their own specialist capability.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Aggressive consolidation of hospitals followed by a transformational insurer acquisition, funded with a mix of equity and debt. The hospital acquisitions have generally been sound; the insurer changed the company\'s risk profile and its success is not yet settled.',
      good: [
        'Building a premium hospital network in the densest and wealthiest markets, where the negotiating position is strongest',
        'Acquiring an insurer to stop being a price taker to the operators that control patient flow',
      ],
      bad: [
        'Taking on underwriting risk, regulatory capital and a claims ratio that a hospital operator had no prior capability in managing',
        'Leverage raised to fund consolidation at a point when Brazilian interest rates were heading toward 15%',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Now on both sides of the sector\'s central asymmetry',
        body:
          'The individual plan cap of 5.11% against uncapped collective repricing above 20% is the mechanism restoring operator margins. Owning an insurer means the group benefits from that as a payer while its hospitals face the same operators\' cost containment as a provider.',
        basis: 'REPORTED',
      },
      {
        heading: 'Verticalised competitors are building capacity to avoid these hospitals',
        body:
          'The operators\' response to premium hospital pricing is to own their own beds and direct patients there. Every bed a verticalised competitor builds is a case that does not arrive at a third-party premium hospital.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Underwriting a claims ratio the group has no long history managing',
        body:
          'The insurer brings a cost line that moves with utilisation and can only be repriced annually. It is a different business from running hospitals and the learning curve is expensive.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Leverage against Brazilian rates',
        body:
          'Consolidation debt raised into a rate cycle that peaked above 15% means financial expense consumes a large share of operating profit until rates fall materially.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'rdor3-vertical-from-provider',
        title: 'Verticalisation from the provider side is the stronger direction',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'An insurer that builds hospitals is buying fixed costs it must fill. A premium hospital group that buys an insurer is acquiring patient flow for beds it already has and already fills, which is the less risky direction of the same integration. It also removes the group\'s dependence on negotiating price with operators who were consolidating against it. With the sector repricing collective contracts above twenty per cent, owning the payer captures that where previously it was extracted by the counterparty.',
        requires: [
          'Hospital occupancy and case mix hold as the insurer directs patients internally',
          'Claims ratio at the acquired insurer is managed to sector norms',
          'Leverage reduces as Brazilian rates fall',
        ],
        breaks: [
          'Claims experience at the insurer deteriorating beyond what hospital margins can absorb',
          'Third-party operators excluding the group\'s hospitals from networks in retaliation',
          'Financial expense consuming the operating gains for longer than the rate cycle allows',
        ],
        modelLink: [
          { assumption: 'Segment margins', note: 'Hospital and insurance economics are different businesses. Model them separately, and treat internal transfer pricing as an allocation rather than as performance.' },
          { assumption: 'Net debt and cost of debt', note: 'The equity value here is highly sensitive to the rate path. Model the debt schedule explicitly against the Selic trajectory.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'rdor3-narrow-networks',
        title: 'The customers are building their own hospitals to stop paying these prices',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Premium hospital pricing is only collectable while operators must include those hospitals to sell a plan. The operators\' strategic response across the Brazilian market has been verticalisation — owning beds and directing patients into them — plus narrow-network products that exclude expensive providers. Every bed a competing operator builds removes cases from third-party premium hospitals permanently. The group\'s own insurer acquisition is a partial hedge and covers only its own beneficiaries; the rest of the case flow still depends on counterparties actively working to need it less.',
        requires: [
          'Verticalised operators continue building or acquiring their own premium capacity',
          'Narrow-network products continue gaining share in the corporate market',
        ],
        breaks: [
          'Complexity of care proving genuinely non-replicable, so operators must keep referring out',
          'The owned insurer growing fast enough to fill the beds regardless of third-party referrals',
        ],
        modelLink: [
          { assumption: 'Revenue driver — procedures and price per procedure', note: 'Model third-party referral volumes separately from internal ones. The thesis is a volume loss in the first.' },
          { assumption: 'Occupancy / fixed cost absorption', note: 'Hospital economics are occupancy-driven. Test the margin at lower occupancy rather than lower price.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Migalhas — ANS individual plan adjustment of 5.11% for 2026', url: 'https://www.migalhas.com.br/depeso/457761/reajuste-de-5-11-dos-planos-individuais-em-2026' },
      { label: 'Saúde Business — the challenge of health plan repricing', url: 'https://www.saudebusiness.com/operadoras/o-desafio-dos-reajustes-dos-planos-de-saude/' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
    ],
  },

  {
    ticker: 'FLRY3',
    sector: 'Health Care',
    scope: 'BRAZIL',
    headline:
      'A diagnostics business whose price is set by the health operators it serves — and those operators are spending the decade trying to pay less for exactly what it sells.',
    howItEarns: [
      {
        heading: 'Volume times price per exam, with the price negotiated by the payer',
        body:
          'Laboratory tests and imaging are performed for patients referred by health plans, at prices negotiated per operator. The business is a volume and mix story: imaging and specialised tests carry far better margins than routine blood work, so the case mix matters more than the exam count.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Fixed-cost units where utilisation is everything',
        body:
          'A patient service centre and an imaging machine cost the same whether they run at half capacity or full. Incremental exams therefore carry very high contribution margins, and a volume decline hits disproportionately. Operating leverage runs hard in both directions.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No single controlling shareholder. A physician partnership holds a significant influential stake alongside institutional investors, following the merger with another diagnostics group that broadened the register.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with no majority holder.',
      relatedPartyExposure: [
        'A physician shareholder group with both an ownership interest and a clinical relationship with the company',
        'A board without a majority holder makes strategy contestable',
        'Merger partners retain influence over integration decisions',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'No controlling block, so board composition is contested',
        'ANS and health regulator oversight of service standards',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A physician partnership as an influential shareholder is unusual and mostly useful',
        body:
          'Doctors with an ownership stake and a clinical role align quality and commercial interest, which in diagnostics is a genuine asset because the product is a medical opinion. It also means a shareholder group with interests that are not purely financial, and strategy that has to satisfy both.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Consolidation has been the strategy, and integration the recurring challenge',
        body:
          'Growth has come from merging with and acquiring regional laboratory and imaging groups. The synergies are real — shared processing, shared equipment, shared brand — and each integration has taken longer than planned, which is the pattern in this industry rather than a company-specific failure.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Brand trust in a product the patient cannot evaluate',
        mechanism:
          'A patient cannot judge whether a laboratory result is correct, so the brand is the quality signal, and physicians refer to brands they trust. That makes reputation a genuine pricing asset in a way it is not for most services.',
        evidence: 'Price premiums sustained against regional competitors for the same tests.',
        erodedBy: 'Operators directing patients to cheaper providers regardless of brand, and narrow-network products that exclude premium diagnostics.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Scale in processing and equipment utilisation',
        mechanism:
          'Consolidating samples into central laboratories and running imaging equipment at high utilisation lowers cost per exam below what a regional competitor can achieve.',
        evidence: 'Cost per exam advantages that have funded the acquisition of subscale regional operators.',
        erodedBy: 'Payer-driven price compression that removes the margin the scale advantage produces.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A consolidator: merging with and acquiring regional diagnostics groups to build density and processing scale. The deals have generally been sensible in direction, and the returns have been eroded by the payers capturing part of the synergy through price.',
      good: [
        'Building processing scale and imaging density that genuinely lowers cost per exam',
        'Expanding into higher-margin imaging and specialised testing rather than defending routine volume',
      ],
      bad: [
        'Integration timetables that have repeatedly slipped, deferring the synergies that justified the prices paid',
        'Acquisition multiples paid in a period when payer price pressure was already visible',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The operators\' margin recovery is this company\'s price problem',
        body:
          'The sector repaired its claims ratio by repricing collective plans above 20% and by containing cost. Diagnostics is one of the most visible and most negotiable cost lines an operator has, so the same mechanism that restored operator margins compresses the price paid per exam here.',
        basis: 'REPORTED',
      },
      {
        heading: 'Verticalised operators own their own laboratories',
        body:
          'An operator that owns diagnostics capacity sends its beneficiaries there. Verticalisation across the Brazilian sector therefore removes referral volume from independent providers structurally rather than cyclically.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Price compression by payers with growing bargaining power',
        body:
          'Consolidated operators negotiating with an independent provider set the price. Operating leverage means a small price cut removes a large share of the margin, and there is no offsetting lever.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Referral volume lost to verticalised competitors',
        body:
          'Every laboratory an operator builds is volume that never arrives. Unlike price pressure, this does not reverse when the cycle turns.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'flry3-mix-and-brand',
        title: 'Mix and brand are the defence, and they are not a price defence',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Routine blood work is a commodity an operator will always shop on price. Complex imaging, genomics and specialised testing are not, because the equipment, the interpretation and the brand a physician will refer to cannot be substituted cheaply. Shifting mix toward that end raises revenue per exam and moves the business away from the negotiation it cannot win. Scale in central processing funds it. The thesis is a mix shift, not a pricing argument, and it is measurable in revenue per exam rather than in volumes.',
        requires: [
          'Mix continues shifting toward imaging and specialised testing',
          'Brand premium holds with referring physicians rather than being overridden by payer direction',
          'Processing scale keeps cost per exam below regional competitors',
        ],
        breaks: [
          'Payers directing complex work to cheaper providers or their own facilities',
          'Price compression reaching the specialised end of the mix as well as routine testing',
          'Integration failures preventing the processing scale from being realised',
        ],
        modelLink: [
          { assumption: 'Revenue driver — exams and revenue per exam', note: 'Model volume and price per exam separately. The thesis is entirely in the second, and a single revenue growth rate hides it.' },
          { assumption: 'EBITDA margin path', note: 'Operating leverage is high. Test the margin at flat volumes with a lower price per exam — that is the bear case in the same model.' },
        ],
        conviction: 'LOW',
      },
      {
        id: 'flry3-payer-squeeze',
        title: 'A fixed-cost business whose price is set by consolidating customers',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Diagnostics is a large, visible and highly negotiable line in a health operator\'s cost base, and the operators have spent this cycle repairing margins by containing exactly such costs and by building their own laboratory capacity. An independent provider with high fixed costs and no pricing power against consolidated payers is on the wrong side of both mechanisms: price compression removes margin through operating leverage, and verticalisation removes volume permanently. Brand and mix mitigate this and do not reverse it.',
        requires: [
          'Payer consolidation and cost containment continue',
          'Verticalised operators keep expanding owned diagnostics capacity',
        ],
        breaks: [
          'Payers concluding that owned laboratory capacity is uneconomic at their scale and reverting to outsourcing',
          'Regulatory intervention in payer network practices',
          'A mix shift large enough that the negotiable portion of revenue becomes immaterial',
        ],
        modelLink: [
          { assumption: 'Revenue per exam', note: 'Model a declining price per exam with volumes flat, and watch operating leverage do the damage. That is the mechanism.' },
          { assumption: 'Fixed versus variable cost split', note: 'If the model flexes costs with revenue, it is not capturing why price compression is so damaging here.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Saúde Business — the challenge of health plan repricing', url: 'https://www.saudebusiness.com/operadoras/o-desafio-dos-reajustes-dos-planos-de-saude/' },
      { label: 'Migalhas — ANS individual plan adjustment of 5.11% for 2026', url: 'https://www.migalhas.com.br/depeso/457761/reajuste-de-5-11-dos-planos-individuais-em-2026' },
      { label: 'Gazeta do Povo — what repricing to expect in 2026', url: 'https://www.gazetadopovo.com.br/economia/planos-de-saude-que-reajustes-o-consumidor-pode-esperar-para-2026/' },
    ],
  },

  {
    ticker: 'HYPE3',
    sector: 'Health Care',
    scope: 'BRAZIL',
    headline:
      'A company that buys brands rather than molecules — shelf recall in a market where consumers ask for a name at the counter, financed by a balance sheet heavy in intangibles and a receivables cycle stretched to 145 days.',
    howItEarns: [
      {
        heading: 'Brand recall at the pharmacy counter, not patents',
        body:
          'Consumer health products in Brazil are bought by name: a shopper asks for a specific analgesic or antacid. The asset being acquired when this company buys a portfolio is that recall, and unlike a patent it does not expire. Prescription and generic lines add volume at lower margins.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The distribution chain is financed by the manufacturer',
        body:
          'Reaching tens of thousands of pharmacy points requires long credit terms to distributors and retailers — receivables around 145 days against payables near 80. That gap is working capital the company funds at Brazilian rates, which is why the cash conversion cycle matters as much as the margin.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by the Bonfim family interests through the Igarapava holding vehicle, with a substantial institutional and foreign free float alongside.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the controlling block holding the largest position.',
      relatedPartyExposure: [
        'A controlling family decides the brand acquisition programme that minority capital funds',
        'Acquisitions of portfolios from related or adjacent parties require arm\'s-length scrutiny',
        'The company has been the subject of governance episodes involving related-party dealings in its earlier history',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'CMED price regulation on prescription products, which caps what can be charged',
        'A concentrated institutional base that has engaged on capital allocation',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A history that earned a discount, and a structure that has been cleaned up',
        body:
          'The company\'s earlier years included accounting and related-party episodes that cost it credibility with investors. Governance has since been rebuilt — Novo Mercado listing, board independence, clearer disclosure — but the discount has been slow to go, and a controlled acquirer of intangible assets is the profile where investors are least willing to extend the benefit of the doubt.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Acquiring brands puts the value in intangibles and the test in impairment',
        body:
          'Intangibles and goodwill are close to a year and a half of revenue. Whether the prices paid were sound is answered by impairment testing rather than by operating results, and an acquisition-led model in a high-rate environment is exactly where that question bites.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Brand recall in categories bought by name',
        mechanism:
          'Over-the-counter medicine purchases are habitual and brand-led, and the habit was built over decades of advertising. A generic equivalent at half the price does not capture the buyer who asks for the name, which is why these brands hold share against cheaper substitutes.',
        evidence: 'Sustained share and price premiums in consumer health categories against generic alternatives.',
        erodedBy: 'Pharmacy chains promoting their own labels at the counter, and a consumer squeezed enough to accept the substitute.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Distribution reach into the pharmacy long tail',
        mechanism:
          'Servicing tens of thousands of independent pharmacies, not just the chains, requires a salesforce, logistics and credit terms that a smaller competitor cannot fund.',
        evidence: 'Presence across the fragmented Brazilian pharmacy base, which is where a large share of volume still sits.',
        erodedBy: 'Pharmacy chain consolidation, which concentrates buying power and reduces the value of long-tail reach.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Serial acquisition of brand portfolios, funded with debt and cash flow. The strategy is coherent — buy recall, put it through existing distribution — and the prices paid in the most recent cycle were made against a cost of debt approaching 14%.',
      good: [
        'Acquiring brands that fit existing distribution, where the incremental cost to serve is close to zero',
        'Manufacturing scale in a fiscally incentivised location, which lowers the effective tax rate materially',
      ],
      bad: [
        'Leverage taken on to fund portfolio acquisitions into a rate cycle that peaked above 15%, so financial expense consumes a large share of operating profit',
        'An intangible and goodwill balance around 1.3 times revenue, whose justification depends on prices paid rather than on current performance',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'CMED caps prescription prices, so mix toward consumer health is the margin strategy',
        body:
          'Prescription medicine prices in Brazil are regulated with an annual adjustment formula, which limits pricing power on that part of the portfolio. Consumer health is not capped the same way, which is why the mix shift toward it is both a margin story and a regulatory arbitrage.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A stretched receivables cycle meets Brazilian rates',
        body:
          'With average corporate credit rates above 25% and the company funding 145 days of receivables plus 190 days of inventory, working capital is genuinely expensive. The cash conversion cycle multiplied by the funding rate is the cost of the distribution model.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Financial expense consuming operating profit',
        body:
          'Acquisition debt plus a long working capital cycle at Brazilian rates means a large share of EBIT goes to interest. The equity value is more sensitive to the Selic path than to any commercial variable.',
        basis: 'REPORTED',
      },
      {
        heading: 'Impairment of acquired brand portfolios',
        body:
          'With intangibles above a year of revenue, a portfolio that underperforms the acquisition case produces a writedown. It is a balance sheet risk created by past decisions and unrelated to current trading.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'hype3-brands-dont-expire',
        title: 'Buying recall rather than patents, in a market that asks for the name',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Global pharma faces a patent cliff of roughly $200 to $236 billion of annual sales facing biosimilar and generic entry by the end of the decade, because a patent is a clock. Brand recall in over-the-counter categories has no expiry: a consumer who asks for a name keeps asking. This company buys that recall and pushes it through distribution that already reaches the pharmacy long tail, so the incremental cost to serve an acquired brand is close to zero. Add a manufacturing base with a genuine fiscal incentive and the unit economics are better than the sector multiple implies.',
        requires: [
          'Brand recall holds against pharmacy own-label promotion at the counter',
          'The mix continues shifting toward unregulated consumer health rather than CMED-capped prescription',
          'Financial expense falls as Selic declines, releasing operating profit to equity',
        ],
        breaks: [
          'Pharmacy chains successfully substituting own-label at the point of sale',
          'A consumer squeezed enough to accept generics, breaking the habit the brands rest on',
          'Further leveraged acquisitions before the existing debt is worked down',
        ],
        modelLink: [
          { assumption: 'Revenue driver — units and price per unit', note: 'Model consumer health and prescription volumes separately. CMED caps the price on one and not the other, so a blended price growth rate is wrong.' },
          { assumption: 'Net debt and cost of debt', note: 'The equity value turns on the rate path. Model the debt schedule against the Selic trajectory rather than a constant cost of debt.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'hype3-working-capital-cost',
        title: 'A distribution model funded at 25% while the counter is being taken by own-label',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The company funds 145 days of receivables and 190 days of inventory at Brazilian corporate rates that passed 25% in 2026, on top of acquisition debt raised into the same cycle. That is a cash cost the margin has to clear before anything reaches equity. Meanwhile the moat — a consumer asking for a name — is precisely what pharmacy chains attack with own-label promotion at the counter, and chain consolidation is increasing their power to do it. An acquisition-led model with 1.3 times revenue in intangibles has little room for the brands to underperform.',
        requires: [
          'Working capital cycle remains long and funded at high rates',
          'Pharmacy chain consolidation continues increasing own-label pressure at the point of sale',
        ],
        breaks: [
          'A material shortening of the receivables cycle, which would reduce the funding cost directly',
          'Demonstrated brand resilience against own-label in the categories that matter most',
          'Rapid Selic decline that removes the financial expense burden',
        ],
        modelLink: [
          { assumption: 'Working capital terms', note: 'Model receivable and inventory days explicitly against the funding rate. The cash conversion cycle times the cost of debt is the real hurdle.' },
          { assumption: 'Intangibles and impairment', note: 'Test what the equity is worth if part of the acquired brand portfolio is impaired. That is the balance sheet expression of the thesis.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Labiotech — the next pharma patent cliff, 2026-2032', url: 'https://www.labiotech.eu/best-biotech/pharma-patent-cliff/' },
      { label: 'Itaponews — Brazilian corporate credit rates above 25%', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
    ],
  },

  {
    ticker: 'UNH',
    sector: 'Health Care',
    scope: 'UNITED_STATES',
    headline:
      'The largest health insurer in the United States, deliberately shedding 1.3 to 1.4 million Medicare Advantage members in 2026 to repair a loss ratio that went from 86.7% to 88.9% — a decision an investor will misread as competitive failure.',
    howItEarns: [
      {
        heading: 'Premiums from government programmes, paid administratively rather than negotiated',
        body:
          'Medicare Advantage and Medicaid managed care are the growth engines and both are funded by the state, so revenue per member is set by CMS rate notices and state agencies rather than by commercial negotiation. What the company chooses is plan design — benefits, networks, premiums — decided a year before the cost of serving them is known.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The health services arm earns on the claim it would otherwise pay',
        body:
          'Owning clinics, pharmacy benefit management and analytics turns a dollar of medical cost into a dollar of internal revenue at a margin. That segment is the single largest source of earnings above what an insurance book alone would produce, and it is why consolidated returns exceed a pure insurer\'s.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Intersegment transactions between the insurance business and the owned care delivery and pharmacy operations, which allocate margin between them',
        'The owned pharmacy benefit manager negotiates drug prices for the company\'s own health plans and for third parties',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'CMS and state regulator oversight of rates, risk adjustment and plan marketing',
        'Statutory medical loss ratio floors requiring rebates when too little premium is spent on care',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Vertical integration is where the margin is and where the scrutiny is',
        body:
          'Common ownership of the insurer, the pharmacy benefit manager and the provider is the source of earnings above a pure insurance return. It is also the arrangement critics call a conflict, and proposals to separate pharmacy benefit management from insurance recur. A separation would remove earnings no operational improvement could replace, and it is a legislative risk rather than a commercial one.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Complexity makes the reported numbers hard to check',
        body:
          'Intersegment revenue, risk-adjustment accruals and prior-period development mean reported earnings depend on estimates that are revised later. Days in claims payable and prior-period development are the lines that reveal whether reserves were conservative, and they get far less attention than the loss ratio.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Scale in provider contracting and claims data',
        mechanism:
          'The largest membership base negotiates the lowest provider rates, and decades of claims data across tens of millions of lives improve risk adjustment and utilisation management in ways a smaller insurer cannot replicate.',
        evidence: 'Administrative cost ratios and provider rate positions better than smaller competitors at comparable membership growth.',
        erodedBy: 'Provider consolidation creating systems large enough to negotiate back, and regulatory limits on risk-adjustment coding practices.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Owned care delivery and pharmacy services',
        mechanism:
          'Directing members into owned clinics and pharmacies captures the provider and dispensing margin rather than paying it away, and allows clinical management of utilisation.',
        evidence: 'Health services segment earnings that materially exceed what the insurance book alone generates.',
        erodedBy: 'Legislated separation of pharmacy benefit management from insurance, or limits on steering members to affiliated providers.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Consistent buybacks and dividend growth funded by genuine cash flow, plus a long programme of acquiring physician groups and care assets. The current decision — shrinking membership to restore margin — is the correct one and the least popular.',
      good: [
        'Pricing for margin rather than growth in 2026, accepting a membership decline of 1.3 to 1.4 million rather than writing unprofitable plans',
        'Building the health services arm, which produces the earnings above a pure insurance return',
      ],
      bad: [
        'Plan design in the preceding years that priced for growth into a rising cost trend, which is what produced the loss ratio deterioration in the first place',
        'Physician group acquisitions made to serve membership the company is now deliberately shedding',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Two years of claims outrunning premiums, and a rate that barely helps',
        body:
          'The average 2026 Medicare Advantage rate increase was 5.06% — relief after difficult years — but claims were still outpacing premiums through 2025, and this company\'s loss ratio rose 2.2 points to 88.9%, the largest increase among the big carriers. The rate notice was judged by management not to align with actual utilisation and cost trends.',
        basis: 'REPORTED',
      },
      {
        heading: 'Medicaid is stabilising after the redetermination wave',
        body:
          'Roughly two years of state-led redeterminations removed members and left a book with higher average acuity, which raised cost per remaining member. That process is stabilising, which removes one source of negative surprise.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'A third consecutive year of utilisation exceeding pricing',
        body:
          'Premiums are fixed for a plan year while costs accrue continuously, so an unexpected rise cannot be repriced until the next cycle. Two consecutive years of this is evidence that the pricing models understate the cost trend rather than that the trend was transitory.',
        basis: 'REPORTED',
      },
      {
        heading: 'Legislated separation of pharmacy benefit management',
        body:
          'The integration that produces earnings above an insurance return is the standing political target. A separation is not an operational setback; it removes a segment.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'unh-margin-over-membership',
        title: 'Shrinking on purpose is the right call, and it will look like losing',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'When rates do not cover the cost trend, the rational response is to raise premiums, cut benefits and exit unprofitable counties — which sheds members deliberately. Revenue falls, headlines read as competitive failure, and margin recovers. This company is doing exactly that at scale, giving up 1.3 to 1.4 million Medicare Advantage members after a 2.2 point loss ratio deterioration. The test is whether operating margin actually returns in the following year, and an investor reading membership decline as market share loss is misreading a pricing decision.',
        requires: [
          'Operating margin recovers in the year following the repricing',
          'The members retained are the profitable ones rather than an adverse selection of the sickest',
          'Health services earnings hold while the insurance book shrinks',
        ],
        breaks: [
          'Margin failing to recover despite the membership reduction, which would mean the cost trend is worse than the repricing assumed',
          'Adverse selection leaving a sicker retained book, so the loss ratio does not improve',
          'Owned clinic capacity built for the shed membership becoming underutilised fixed cost',
        ],
        modelLink: [
          { assumption: 'Revenue driver — members and premium per member', note: 'Model membership declining and premium per member rising. A single revenue growth rate makes this thesis impossible to express.' },
          { assumption: 'Medical loss ratio', note: 'The whole claim is that the loss ratio improves. Model it directly rather than as a margin percentage.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'unh-cost-trend-reset',
        title: 'The cost trend is a reset, not a catch-up',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The transitory reading is that deferred care worked through the system and utilisation normalises. Two consecutive years of claims outrunning premiums, a loss ratio rising 2.2 points to 88.9%, and management stating that the rate notice did not align with observed cost trends all point the other way: the senior population is sicker and better diagnosed than the pricing models assume. If that is right, each repricing is followed by another cost surprise, and shedding members buys a year rather than fixing the problem.',
        requires: [
          'Utilisation continues running above pricing assumptions',
          'CMS rate notices continue lagging the observed cost trend',
        ],
        breaks: [
          'A year where the loss ratio improves by more than the repricing alone explains, indicating the trend has normalised',
          'Rate notices that catch up to the cost trend',
        ],
        modelLink: [
          { assumption: 'Medical loss ratio', note: 'Hold the loss ratio near current levels rather than reverting to the historical mean, and see what the equity is worth.' },
          { assumption: 'Revenue driver — premium per member', note: 'Repricing raises premium per member. Test whether that is enough when the cost per member rises with it.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Managed Healthcare Executive — UnitedHealthcare updates Medicare Advantage options for 2026', url: 'https://www.managedhealthcareexecutive.com/view/unitedhealthcare-updates-medicare-advantage-options-for-2026' },
      { label: 'Medicare Market Insights — Medicare Advantage loss ratios market review', url: 'https://www.medicaremarketinsights.com/p/medicare-advantage-loss-ratios-2025-market-review' },
      { label: 'KFF — Medicaid managed care loss ratios and risk corridors', url: 'https://www.kff.org/medicaid/strategies-to-manage-unwinding-uncertainty-for-medicaid-managed-care-plans-medical-loss-ratios-risk-corridors-and-rate-amendments/' },
      { label: 'UNC — What are Medicare Advantage rates and why do they matter', url: 'https://cboh.unc.edu/publication/what-are-medicare-advantage-rates-and-why-do-they-matter/' },
    ],
  },

  {
    ticker: 'MRK',
    sector: 'Health Care',
    scope: 'GLOBAL',
    headline:
      'Half the revenue comes from one drug that loses exclusivity in 2028, and the entire investment case is whether a subcutaneous reformulation and an acquired pipeline can replace $25 billion in three to four years.',
    howItEarns: [
      {
        heading: 'Keytruda, and then everything else',
        body:
          'The oncology franchise led by Keytruda is close to half of revenue, sold across dozens of approved indications. Vaccines, hospital and specialty products and an animal health division make up the rest. The concentration is the single most important fact about the company\'s economics.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Animal health is uncorrelated with the drug cycle',
        body:
          'Companion animal and livestock products face no patent cliff, no payer negotiation of the same kind, and demand that follows pet ownership and protein consumption. It is a genuinely different business inside the same reporting entity.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Collaboration and profit-sharing agreements with partners on specific oncology assets',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting obligations and an active proxy record',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A chief executive promoted from the finance seat, facing a capital allocation problem',
        body:
          'The central task is deploying cash into external innovation before the cliff arrives, at prices set by a seller\'s market. A management team whose background is capital allocation rather than research is arguably the right profile for that, and it also means the scientific judgement behind each acquisition is being made by people who buy rather than discover.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Reformulation as a defence is a legal strategy as much as a scientific one',
        body:
          'Transitioning Keytruda to a subcutaneous version protected by its own patents, potentially with a fresh biologic exclusivity window, extends the franchise by changing the product rather than the molecule. It is legitimate and it depends on patent outcomes and on physicians and payers actually switching.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Label breadth in oncology',
        mechanism:
          'Dozens of approved indications built over a decade of trials mean the drug is embedded in treatment protocols across many cancers. A competitor with a similar mechanism must run its own trials in each indication to displace it.',
        evidence: 'The best-selling drug in the world at over $25 billion, across a label no competitor has matched in breadth.',
        erodedBy: 'Loss of exclusivity in 2028 and biosimilar entry, which label breadth does not prevent.',
        basis: 'REPORTED',
      },
      {
        label: 'Vaccine manufacturing capacity',
        mechanism:
          'Biologic vaccine manufacturing is process-dependent and licensed plant by plant, so capacity cannot be added quickly even by a well-funded entrant.',
        evidence: 'A vaccines franchise sustained against competitors who have struggled to enter at scale.',
        erodedBy: 'Demand shifts, recommendation changes, and competitor products reaching approval.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'The company is spending its Keytruda cash flow buying the pipeline meant to replace it, in a market where sellers know exactly what they are selling. That is the right direction and the worst possible pricing environment for it.',
      good: [
        'Pursuing a subcutaneous reformulation with its own patent protection, which extends the franchise at a fraction of the cost of replacing it',
        'Maintaining research spending at a high share of revenue rather than harvesting the franchise',
      ],
      bad: [
        'Acquiring clinical-stage assets at premiums set by a seller\'s market, which converts a revenue problem into an intangible and goodwill problem',
        'Dependence on a single product that was allowed to reach half of revenue without a replacement ready',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The 2028 cliff is dated, quantified and unavoidable',
        body:
          'Keytruda loses exclusivity in 2028 and over $25 billion of annual revenue is at risk, within an industry facing roughly $200 to $236 billion of sales exposed to generic or biosimilar entry by the end of the decade. This is not a scenario; it is a calendar entry.',
        basis: 'REPORTED',
      },
      {
        heading: 'Medicare negotiation reached it and then did not',
        body:
          'Keytruda and Opdivo were expected to be selected for negotiation based on Medicare spending, and were delayed by changes to orphan drug exclusion rules. That is a reprieve created by a statutory technicality rather than by anything the company did, and it can be reversed by legislation.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The subcutaneous conversion not being adopted fast enough',
        body:
          'The reformulation defence only works if physicians and payers switch patients before biosimilars arrive. Conversion rate is the measurable variable and it is the one the whole defence rests on.',
        basis: 'REPORTED',
      },
      {
        heading: 'Acquired pipeline failing after the price is paid',
        body:
          'Clinical-stage assets bought at seller\'s-market premiums either work or become impairments. The debt raised to buy them does not depend on the readout.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'mrk-cliff-is-priced',
        title: 'The cliff is dated and visible, which is why the multiple already assumes it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'A company trading at a mid-single-digit EV/EBITDA multiple and low double-digit earnings multiple with the best-selling drug in the world is priced for the revenue disappearing. The bull case does not require the cliff to be avoided — it requires the slope to be gentler than a cliff: biologics decline more slowly than small molecules, the subcutaneous conversion with fresh patent protection retains part of the franchise, and animal health plus vaccines carry cash flow that has no expiry. When the downside is in the price, partial success is enough.',
        requires: [
          'Subcutaneous conversion achieves meaningful patient switching before 2028',
          'Biosimilar erosion follows the slower biologic pattern rather than a small-molecule cliff',
          'Animal health and vaccines hold their contribution',
        ],
        breaks: [
          'Patent challenges defeating the subcutaneous protection',
          'Biosimilars taking share faster than biologic precedent suggests',
          'Legislation reversing the orphan exclusion reprieve and bringing the product into Medicare negotiation before 2028',
        ],
        modelLink: [
          { assumption: 'Revenue driver — product-level revenue and decline path', note: 'Model the oncology franchise separately with an explicit post-2028 decline curve. A blended revenue growth rate cannot express this.' },
          { assumption: 'Terminal growth', note: 'The terminal state is a company without Keytruda. Set terminal revenue on the non-Keytruda base rather than on today\'s total.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'mrk-replacement-arithmetic',
        title: 'Replacing $25 billion in three years has no precedent',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'No pharmaceutical company has organically replaced a franchise of this size in the time available. The alternative is acquisition, and the industry is bidding against a $170 billion collective patent cliff — every buyer needs assets at once, which is the worst possible negotiating position. What gets bought at those prices lands on the balance sheet as intangibles that amortise for years, and the debt is real whether or not the science is. A model that assumes the pipeline replaces the revenue is assuming an outcome the industry\'s own record does not support.',
        requires: [
          'The replacement must come from acquisition rather than organic pipeline',
          'Acquisition prices remain elevated by industry-wide cliff pressure',
        ],
        breaks: [
          'An organic asset reaching blockbuster scale before 2028',
          'A large acquisition at a price that proves reasonable against delivered revenue',
          'Subcutaneous conversion retaining substantially more of the franchise than expected',
        ],
        modelLink: [
          { assumption: 'Revenue driver — replacement revenue', note: 'Do not model replacement revenue that is not attached to a named asset with a phase and a date. Unattributed growth is the error this thesis targets.' },
          { assumption: 'Intangibles, amortisation and net debt', note: 'Acquired pipeline arrives as intangibles and debt. Model both, and test the equity value if an acquired asset fails.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Drug Discovery News — blockbuster drugs face a massive patent cliff', url: 'https://www.drugdiscoverynews.com/blockbuster-drugs-face-a-massive-patent-cliff-in-2026-17019' },
      { label: 'CNBC — big pharma races for biotech assets as $170bn patent cliff looms', url: 'https://www.cnbc.com/2026/01/07/big-pharma-race-to-snap-up-biotech-assets-as-170-billion-patent-cliff-looms.html' },
      { label: 'KFF — Medicare drug price negotiation and orphan drug exclusion', url: 'https://www.kff.org/medicare/key-facts-about-medicare-drug-price-negotiation/' },
      { label: 'Labiotech — the next pharma patent cliff', url: 'https://www.labiotech.eu/best-biotech/pharma-patent-cliff/' },
    ],
  },

  {
    ticker: 'PFE',
    sector: 'Health Care',
    scope: 'GLOBAL',
    headline:
      'A company that spent a pandemic windfall buying oncology pipeline, leaving intangibles and goodwill at more than one and a half times revenue — so reported earnings understate cash earnings, and the debt is real whether the assets work or not.',
    howItEarns: [
      {
        heading: 'A broad portfolio with no single dominant product',
        body:
          'Oncology, internal medicine, inflammation and immunology, vaccines and hospital products, spread so that no one asset dominates the way a single blockbuster does at some peers. That reduces cliff concentration and also means no product carries the growth.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Amortisation makes GAAP earnings a poor guide',
        body:
          'Intangibles from the oncology acquisition amortise through cost of sales for years, so reported earnings are materially below cash earnings. Reading the price-to-earnings ratio without adjusting for that overstates how expensive the company is — and reading only the adjusted number ignores that the cash to buy those assets is gone.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Collaboration and profit-sharing arrangements with partners on specific products, including vaccine programmes',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting obligations and an active proxy record including activist engagement',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A windfall spent at the top of a seller\'s market',
        body:
          'Pandemic revenue was always temporary, and the decision to convert it into acquired pipeline rather than distributions was defensible. The execution question is price: buying oncology assets while the whole industry faced a collective cliff meant bidding in the worst environment, and the resulting balance sheet is the evidence.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A payout above earnings is a policy choice with a shelf life',
        body:
          'Distributing close to all of reported earnings while carrying acquisition debt and heavy amortisation works while cash earnings exceed reported ones. It constrains flexibility, and it is the kind of commitment that gets defended for several years and then revisited.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Commercial reach in primary care',
        mechanism:
          'A salesforce and distribution footprint able to launch a product to general practitioners worldwide is an asset few competitors retain, and it is why partners bring assets to this company to commercialise.',
        evidence: 'A record of taking in-licensed and acquired products to scale faster than the originator could alone.',
        erodedBy: 'A shift toward specialist-administered and hospital-dispensed products, where primary care reach matters less.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Global manufacturing and regulatory infrastructure',
        mechanism:
          'Licensed biologic and vaccine manufacturing across multiple jurisdictions, with the regulatory relationships to support it, cannot be assembled quickly at any price.',
        evidence: 'Demonstrated ability to scale a novel vaccine to billions of doses within a year.',
        erodedBy: 'Contract manufacturing maturing enough that scale is rentable rather than owned.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'The defining decision of the decade was how to spend the pandemic cash, and it went into acquisitions at elevated prices plus a dividend held above reported earnings. The direction was right and the timing was the worst available.',
      good: [
        'Converting temporary revenue into durable assets rather than distributing a windfall that would not repeat',
        'Cutting costs substantially as pandemic revenue rolled off, rather than defending a cost base built for it',
      ],
      bad: [
        'Acquiring a large oncology platform at a seller\'s-market price, leaving intangibles and goodwill above 1.7 times revenue',
        'A payout ratio near reported earnings alongside the acquisition debt, which leaves little room if an asset disappoints',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Medicare negotiation is live and expanding',
        body:
          'Negotiated prices for the first ten Part D drugs took effect on 1 January 2026 and the second set of fifteen follows in 2027. Selection is by Medicare spend, so commercial success is the qualifying criterion — the better a product sells, the sooner its price is set rather than offered.',
        basis: 'REPORTED',
      },
      {
        heading: 'Diversification means no single cliff and no single engine',
        body:
          'Against an industry facing $200 to $236 billion of sales exposed to biosimilar entry by the end of the decade, a portfolio with no dominant product has less concentrated exposure — and correspondingly no asset large enough to carry growth on its own.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Impairment of the acquired oncology platform',
        body:
          'With intangibles and goodwill above 1.7 times revenue, the balance sheet depends on those programmes delivering. A failure is a writedown plus the debt raised to buy it.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A dividend defended past the point of coverage',
        body:
          'Paying out close to reported earnings while amortisation is heavy works until cash earnings converge downward. The correction would be a cut in the year the shares are already weakest.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'pfe-cash-vs-gaap',
        title: 'Reported earnings understate cash earnings, and the market is pricing the reported ones',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Acquisition amortisation runs through cost of sales for years, so GAAP earnings are materially below the cash the business generates. A single-digit multiple on cash earnings, a diversified portfolio with no dominant cliff, and a global manufacturing and primary-care commercial base that competitors rent rather than own is a different proposition from what the headline price-to-earnings ratio suggests. The thesis is an accounting one: the gap between reported and cash earnings closes as amortisation rolls off, without anything operational having to improve.',
        requires: [
          'Acquired programmes deliver enough revenue to avoid impairment',
          'Cash earnings hold as pandemic-era revenue finishes rolling off',
          'The dividend remains covered by cash flow rather than by the balance sheet',
        ],
        breaks: [
          'An impairment that confirms the acquisition prices were wrong, which converts the accounting gap into a real loss',
          'Medicare negotiation reaching the largest products faster than modelled',
          'Cash earnings converging down to reported earnings rather than reported converging up',
        ],
        modelLink: [
          { assumption: 'Amortisation within cost of sales', note: 'Separate acquisition amortisation from operating cost. The thesis is entirely about that line rolling off.' },
          { assumption: 'FCFF versus net income', note: 'Value on cash flow rather than earnings, and check that the dividend is covered in the cash measure.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'pfe-acquisition-price',
        title: 'The windfall bought assets at the worst prices the industry has offered',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Pandemic cash was deployed into oncology pipeline while every large pharma company faced a collective $170 billion patent cliff and needed the same assets at the same time. That is the definition of a seller\'s market, and the balance sheet records the result: intangibles and goodwill above 1.7 times revenue. If those programmes deliver, the accounting gap closes; if they do not, the company has swapped a temporary revenue stream for a permanent debt obligation and a writedown. Meanwhile the dividend is held near reported earnings, leaving almost no room to absorb a disappointment.',
        requires: [
          'Acquired programmes remain unproven relative to the prices paid',
          'The dividend continues being held near reported earnings',
        ],
        breaks: [
          'An acquired asset reaching commercial scale that justifies the price',
          'A dividend reset that restores flexibility before it is forced',
        ],
        modelLink: [
          { assumption: 'Intangibles and impairment', note: 'Test the equity value with a partial impairment of the acquired platform. That is the specific downside.' },
          { assumption: 'Dividend payout and net debt', note: 'Model the payout against cash flow and the debt schedule together. The risk is the interaction, not either alone.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'KFF — key facts about Medicare drug price negotiation', url: 'https://www.kff.org/medicare/key-facts-about-medicare-drug-price-negotiation/' },
      { label: 'CNBC — big pharma and the $170bn patent cliff', url: 'https://www.cnbc.com/2026/01/07/big-pharma-race-to-snap-up-biotech-assets-as-170-billion-patent-cliff-looms.html' },
      { label: 'PharmExec — the new era of US pharmaceutical pricing', url: 'https://www.pharmexec.com/view/pharmaceutical-pricing-policy-strategic-adaptation' },
    ],
  },

  {
    ticker: 'LLY',
    sector: 'Health Care',
    scope: 'GLOBAL',
    headline:
      'The company that got the largest commercial opportunity in pharmaceutical history right, now facing 120 competing metabolic programmes and a Medicare negotiation that reaches its franchise in 2027.',
    howItEarns: [
      {
        heading: 'Incretins: the same molecule class sold into diabetes and obesity',
        body:
          'GLP-1 and dual-agonist products treat type 2 diabetes and obesity, two vast populations, with the obesity indication expanding access every year. Revenue is prescriptions times net price after rebates, and the gap between list and net price is very large and negotiated channel by channel.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Manufacturing capacity is the constraint and the moat',
        body:
          'Injectable peptide production at this scale required years of capital spending before the demand could be served. Capacity has been the binding limit on revenue, which means the capital programme is not optional growth spending — it is the product.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder in the ordinary sense, but the Lilly Endowment holds a very large stake — a charitable foundation whose interests are long-term and whose position is not for sale.',
      voting: 'One class of common stock, one share one vote, with the endowment as the dominant single holder.',
      relatedPartyExposure: [
        'A charitable endowment as the largest shareholder, with a permanent horizon and no pressure for near-term returns',
        'Collaboration agreements on specific assets and manufacturing partnerships',
      ],
      minorityProtections: [
        'Single voting class, so the endowment\'s influence is proportional to its economics',
        'SEC reporting obligations',
        'A dispersed institutional register alongside the endowment',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A permanent anchor shareholder that wanted the capital programme',
        body:
          'An endowment holding a very large stake with no exit horizon is the shareholder base most likely to support spending billions on manufacturing years before the revenue arrives. That is a genuine structural advantage in a business where capacity had to precede demand, and it is the opposite of the pressure a dispersed register applies.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Concentration risk is now the governance question',
        body:
          'The metabolic franchise has become so large relative to the rest of the company that portfolio decisions elsewhere barely matter to the valuation. A board overseeing a business this concentrated is effectively overseeing one product family, and the succession and competitive response questions all run through it.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Installed manufacturing capacity for injectable peptides',
        mechanism:
          'Building and licensing sterile injectable capacity at this scale takes years and billions. A competitor with an approved molecule and no capacity cannot supply the market, so capacity is a commercial barrier independent of the science.',
        evidence: 'Revenue growth that has been limited by supply rather than demand, with capacity expansions converting directly into sales.',
        erodedBy: 'Competitors completing their own capacity, and oral formulations that do not require injectable manufacturing at all.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Clinical data breadth in cardiometabolic outcomes',
        mechanism:
          'Outcome trials showing cardiovascular, renal and sleep-apnoea benefits expand the label and give payers a reason to cover the product beyond weight loss. Each trial takes years and a competitor must run its own.',
        evidence: 'Label expansion into indications that convert an aesthetic purchase into a reimbursed medical one.',
        erodedBy: 'Competitors generating comparable outcome data, and payers restricting coverage regardless of evidence.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'An enormous, correctly-timed manufacturing programme funded from cash flow and debt, plus acquisitions to broaden the metabolic and adjacent pipeline. The capital intensity is the reason the franchise exists at this scale.',
      good: [
        'Committing to manufacturing capacity years ahead of the demand, which is why supply rather than approval became the constraint for competitors',
        'Running outcome trials that expanded the label from weight loss into reimbursed cardiometabolic indications',
      ],
      bad: [
        'Concentration allowed to reach a level where one product family dominates the enterprise value, with the associated single-point risk',
        'Acquisitions in adjacent areas at prices reflecting the company\'s own elevated valuation rather than the assets\' standalone worth',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The most crowded pipeline in the industry is aimed at this franchise',
        body:
          'More than 120 metabolic assets are in development across around 60 companies. Some will fail and enough will not. The competitive question is not whether alternatives arrive but how much net price survives their arrival.',
        basis: 'REPORTED',
      },
      {
        heading: 'Access is broadening and price is being set administratively',
        body:
          'A Medicare bridge programme runs from 1 July 2026 giving beneficiaries access to discounted obesity medicines, and the second set of fifteen negotiated Part D drugs — including GLP-1 products — takes effect in 2027. Volume rises and net price falls at the same time, by design.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Net price erosion as competition and negotiation arrive together',
        body:
          'List price growth is irrelevant; net price after rebates is what is collected. Competitors plus Medicare negotiation plus broader access all push net price down while volume rises, and the two do not necessarily offset.',
        basis: 'REPORTED',
      },
      {
        heading: 'Oral formulations removing the manufacturing moat',
        body:
          'An effective oral product does not need injectable capacity, which is the company\'s principal commercial barrier. That is the specific technical development that would most change the competitive position.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'lly-capacity-moat',
        title: 'The barrier is capacity, not chemistry, and capacity was built first',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'An approved competing molecule is worth nothing without sterile injectable capacity to make it, and that capacity takes years and billions. This company committed the capital before the demand was proven — something an endowment-anchored shareholder base made possible — and has been supply-constrained rather than demand-constrained ever since. Add outcome data that converted a lifestyle purchase into a reimbursed medical one, and the position is defended by two things a competitor cannot shortcut: a factory and a completed trial.',
        requires: [
          'Injectable capacity remains the binding constraint on competitors',
          'Outcome-based label breadth continues to support payer coverage',
          'Net price erosion is slower than volume growth',
        ],
        breaks: [
          'An effective oral formulation from a competitor, which bypasses the manufacturing barrier entirely',
          'Competitors completing their own injectable capacity at scale',
          'Net price falling faster than volumes rise, so revenue declines despite more prescriptions',
        ],
        modelLink: [
          { assumption: 'Revenue driver — prescriptions and net price per prescription', note: 'Model volume and net price separately. The entire competitive question is whether one outruns the other, and a single growth rate hides it.' },
          { assumption: 'Capex path', note: 'Capacity spending is the product here, not optional growth capex. Do not fade it to maintenance while modelling volume growth.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'lly-net-price',
        title: 'Volume up, price administratively down, and 120 programmes arriving',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Three forces compress net price at once: more than 120 competing metabolic assets across around 60 companies, a Medicare bridge programme broadening access at a discount from July 2026, and negotiated Part D prices covering GLP-1 products from 2027. Each of them raises volume and lowers what is collected per prescription. A valuation extrapolating recent revenue growth is extrapolating a period when the company had pricing power because it was the only supplier — and the terminal value, which is most of the number, sits well after that period ends.',
        requires: [
          'Competing programmes continue reaching approval and capacity',
          'Medicare negotiation and access programmes continue broadening volume at lower net prices',
        ],
        breaks: [
          'Competitor failures leaving the market effectively uncontested for longer',
          'Volume growth in newly accessible populations large enough to more than offset net price decline',
          'Differentiated efficacy that sustains a price premium against the entrants',
        ],
        modelLink: [
          { assumption: 'Revenue driver — net price per prescription', note: 'Decline net price explicitly from 2027 while growing volumes, and see what happens to revenue. That is the thesis in one line.' },
          { assumption: 'Terminal growth and terminal margin', note: 'The terminal state is a competitive market with administered prices, not today\'s monopoly economics.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'KFF — Medicare drug price negotiation, including GLP-1 products from 2027', url: 'https://www.kff.org/medicare/key-facts-about-medicare-drug-price-negotiation/' },
      { label: 'Eli Lilly — Form 10-Q, FY2026', url: 'https://www.sec.gov/Archives/edgar/data/0000059478/000005947826000045/lly-20260331.htm' },
      { label: 'PharmExec — the new era of US pharmaceutical pricing', url: 'https://www.pharmexec.com/view/pharmaceutical-pricing-policy-strategic-adaptation' },
    ],
  },

  {
    ticker: 'ABBV',
    sector: 'Health Care',
    scope: 'GLOBAL',
    headline:
      'The company that already went through the largest patent cliff in industry history and replaced the revenue — which is the only worked example of the thing every large pharma company is now attempting.',
    howItEarns: [
      {
        heading: 'Two successor immunology drugs that replaced one',
        body:
          'Humira was the best-selling drug in the world and lost exclusivity. Skyrizi and Rinvoq, developed internally and launched before the cliff, now carry the immunology franchise between them. The replacement was planned and executed rather than improvised, which is the distinguishing fact about this company.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Aesthetics and neuroscience are genuinely different businesses',
        body:
          'Botox and adjacent aesthetic products are cash-pay consumer purchases rather than reimbursed medicines, so they face no payer negotiation and follow discretionary spending instead. Neuroscience adds a reimbursed portfolio with its own cycle.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float, following the spin-off from its former parent.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Collaboration and royalty arrangements on specific assets, including from the aesthetics acquisition',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The succession planning worked, which is the whole governance record',
        body:
          'Developing and launching two replacement products before the cliff, rather than buying pipeline after it, is the decision that defines this company. It required accepting cannibalisation of a highly profitable product while it was still protected — precisely the kind of choice management teams avoid, and the reason the cliff was survivable.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Leverage from the aesthetics acquisition is still being worked down',
        body:
          'The large acquisition that added aesthetics and neuroscience was funded with substantial debt. Deleveraging has progressed and the balance sheet remains more levered than peers, which constrains how much pipeline the company can buy in the current seller\'s market.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Immunology franchise with sequential product generations',
        mechanism:
          'Two mechanistically distinct successor products, each with its own patent life and expanding indications, means the franchise renews rather than expires. Competitors must displace two products across many indications, not one.',
        evidence: 'Combined successor revenue that exceeded the predecessor\'s peak, achieved through the cliff rather than after it.',
        erodedBy: 'Eventual exclusivity loss on the successors, and competing mechanisms reaching the same indications.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Aesthetics brand in a cash-pay market',
        mechanism:
          'The leading injectable aesthetic brand is chosen by practitioners and requested by consumers by name, in a market where the patient pays directly so no payer sets the price.',
        evidence: 'Sustained price and share leadership in facial injectables against lower-priced alternatives.',
        erodedBy: 'Discretionary spending weakness, and competing products that practitioners adopt on price.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Internal development of the replacement franchise, a large debt-funded diversification into aesthetics and neuroscience, and a dividend maintained throughout. The first decision was excellent; the second added a genuinely different business at a price that required years of deleveraging.',
      good: [
        'Developing and launching the successor products before the cliff, accepting cannibalisation of a protected franchise',
        'Adding a cash-pay aesthetics business whose demand drivers are unrelated to payer negotiation',
      ],
      bad: [
        'Leverage taken on for the aesthetics acquisition that constrained flexibility for years afterwards',
        'A dividend policy maintained through the deleveraging, which limited how much pipeline could be acquired while assets were available',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The industry is attempting what this company has already done',
        body:
          'With roughly $200 to $236 billion of annual sales facing biosimilar entry by the end of the decade and a collective $170 billion cliff driving an acquisition race, the relevant comparison is a company that replaced its own largest franchise organically. That is the only available evidence that it can be done.',
        basis: 'REPORTED',
      },
      {
        heading: 'Medicare negotiation reaches successful products by design',
        body:
          'Selection is by Medicare spending, so the successor immunology products become candidates precisely because they succeeded. The franchise renewal buys patent life and not protection from administered pricing.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The successors facing Medicare negotiation as they scale',
        body:
          'Commercial success is the selection criterion. The better the replacement franchise performs, the sooner its price is set rather than offered.',
        basis: 'REPORTED',
      },
      {
        heading: 'Aesthetics demand following discretionary spending',
        body:
          'A cash-pay product is insulated from payers and exposed to consumers. In a weak discretionary environment, the business that diversifies away from payer risk introduces consumer cycle risk instead.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'abbv-proven-replacement',
        title: 'The only company with a completed worked example of surviving a cliff',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Every large pharma company is currently claiming it can replace an expiring franchise, and none of them has done it. This one has: two internally developed successors, launched before the cliff, now generating more than the predecessor at its peak. That is an organisational capability rather than a lucky molecule, and it is the relevant evidence when assessing whether the sector\'s replacement claims are credible. Add a cash-pay aesthetics business with no payer exposure and the earnings base is more diversified than a pure prescription portfolio.',
        requires: [
          'The successor franchise continues growing into its expanding indications',
          'Deleveraging continues, restoring flexibility to acquire pipeline for the next generation',
          'Aesthetics demand holds through the consumer cycle',
        ],
        breaks: [
          'Successor products reaching Medicare negotiation earlier or at steeper discounts than modelled',
          'Competing immunology mechanisms taking share across the key indications',
          'Aesthetics weakness as discretionary spending contracts',
        ],
        modelLink: [
          { assumption: 'Revenue driver — product-level revenue', note: 'Model the successor products individually with their own exclusivity dates. The franchise renewal only shows up at product level.' },
          { assumption: 'Segment margins', note: 'Aesthetics is cash-pay and behaves like consumer discretionary. Model it separately from the reimbursed portfolio.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'abbv-next-cliff',
        title: 'Renewal bought patent life, not immunity, and the next cliff is already dated',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The successors have their own exclusivity dates, and Medicare negotiation selects products by spending — so the more successfully they replace the predecessor, the sooner their prices are administered rather than set. Meanwhile leverage from the aesthetics acquisition limited how much pipeline could be bought during the window when assets were available, which is the capital the next generation requires. The company solved one cliff and the structural position is a sequence of them, each requiring the same anticipatory development while the balance sheet is less flexible than it was.',
        requires: [
          'Successor exclusivity dates remain within the valuation horizon',
          'Medicare negotiation continues selecting high-spend products',
          'Leverage continues constraining pipeline acquisition',
        ],
        breaks: [
          'A third-generation internal asset reaching late-stage development with blockbuster potential',
          'Deleveraging completing fast enough to fund pipeline acquisition at reasonable prices',
        ],
        modelLink: [
          { assumption: 'Revenue driver — product exclusivity dates', note: 'Model each successor declining from its own loss-of-exclusivity date. A blended decline hides the sequencing.' },
          { assumption: 'Terminal growth', note: 'The terminal state has to be a company past the successors\' exclusivity. Set it on the base that survives them.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Labiotech — the next pharma patent cliff, 2026-2032', url: 'https://www.labiotech.eu/best-biotech/pharma-patent-cliff/' },
      { label: 'KFF — key facts about Medicare drug price negotiation', url: 'https://www.kff.org/medicare/key-facts-about-medicare-drug-price-negotiation/' },
      { label: 'CNBC — big pharma and the $170bn patent cliff', url: 'https://www.cnbc.com/2026/01/07/big-pharma-race-to-snap-up-biotech-assets-as-170-billion-patent-cliff-looms.html' },
    ],
  },

  {
    ticker: 'JNJ',
    sector: 'Health Care',
    scope: 'GLOBAL',
    headline:
      'A pharmaceutical and medical device company after separating consumer health, where the litigation overhang has become a larger determinant of equity value than any product decision.',
    howItEarns: [
      {
        heading: 'Innovative medicine plus medical technology, in roughly equal weight',
        body:
          'Oncology, immunology and neuroscience products on the pharmaceutical side; surgical instruments, orthopaedics, cardiovascular devices and vision on the technology side. Devices sell on procedure volumes and surgeon preference rather than on payer formularies, which is a genuinely different revenue driver.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Devices earn on the installed base and the disposables',
        body:
          'A surgical platform placed in a hospital generates recurring consumable and instrument revenue for years, and switching means retraining surgeons. That produces annuity-like revenue with no patent cliff, which is the structural counterweight to the pharmaceutical portfolio.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Collaboration and licensing arrangements on specific pharmaceutical assets',
        'Subsidiary structures created in the course of managing mass-tort liabilities',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting obligations and an active proxy record',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The litigation strategy is the central governance question',
        body:
          'Efforts to resolve mass-tort claims through subsidiary restructuring and bankruptcy processes have been challenged repeatedly in court. Whatever the merits, the consequence for a shareholder is that a material portion of equity value depends on litigation outcomes and judicial attitudes to the structures used, not on operations.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The consumer separation simplified the company and removed a defence',
        body:
          'Spinning off consumer health sharpened the portfolio toward higher-growth pharmaceuticals and devices. It also removed the steady, low-cyclicality earnings that had cushioned the group, and allocated some litigation exposure in ways that have themselves been litigated.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Surgeon-embedded device platforms',
        mechanism:
          'Once a surgical platform is installed and a surgical team trained, switching requires retraining and revalidating procedures. Revenue follows the installed base through consumables for years, independent of any patent.',
        evidence: 'Recurring consumable revenue across surgical and orthopaedic franchises sustained across product generations.',
        erodedBy: 'A competing platform with enough advantage to justify retraining, and hospital purchasing consortia negotiating on price.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Scale in clinical development and global regulatory reach',
        mechanism:
          'Running large trials across many jurisdictions and navigating approval in all of them is a capability that allows in-licensing and rapid global launch, which smaller originators cannot do alone.',
        evidence: 'A record of taking partnered and acquired assets to global scale faster than the originator could.',
        erodedBy: 'Contract research and regulatory consultancy maturing enough that scale becomes rentable.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A long record of dividend growth, disciplined mid-size acquisitions rather than transformational ones, and the consumer separation. The litigation reserves and settlements are the largest single use of capital and were not chosen.',
      good: [
        'Separating consumer health to concentrate on higher-growth pharmaceuticals and devices',
        'Consistent mid-size acquisitions in oncology and devices rather than a single transformational bet at a premium',
      ],
      bad: [
        'Mass-tort liabilities arising from products sold for decades, whose eventual cost has repeatedly exceeded provisions',
        'Litigation resolution attempts that have been rejected in court, extending the uncertainty rather than ending it',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Devices are the part of health care with no patent cliff',
        body:
          'Against an industry facing $200 to $236 billion of pharmaceutical sales exposed to biosimilar entry by the end of the decade, roughly half of this company\'s revenue comes from products whose durability rests on surgeon training and installed base rather than on exclusivity.',
        basis: 'REPORTED',
      },
      {
        heading: 'The pharmaceutical half faces the same negotiation as everyone',
        body:
          'Medicare negotiation selects by spending, so the company\'s largest reimbursed products are candidates by virtue of their success. The device half is untouched by that mechanism entirely.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Litigation outcomes exceeding provisions',
        body:
          'Mass-tort exposure has repeatedly cost more than reserved, and resolution attempts have been rejected. This is the largest uncertainty in the equity value and it is uncorrelated with anything operational.',
        basis: 'REPORTED',
      },
      {
        heading: 'Procedure volume sensitivity in devices',
        body:
          'Device revenue follows elective and surgical procedure volumes, which fall in health system disruptions and staffing shortages. It is a different cyclicality from pharmaceuticals, not an absence of one.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'jnj-devices-no-cliff',
        title: 'Half the company has no patent cliff, and the sector multiple does not distinguish',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Health care is being rated on an industry-wide patent cliff of $200 to $236 billion and a Medicare negotiation regime that selects products by commercial success. Roughly half of this company\'s revenue comes from surgical and orthopaedic platforms where durability rests on surgeon training and an installed base generating consumables — a mechanism with no expiry date and no formulary. Valuing the whole company on a pharmaceutical multiple prices the device half as if it had a cliff it does not have.',
        requires: [
          'Device installed base and consumable revenue continue growing with procedure volumes',
          'Surgeon switching costs continue to protect the platforms',
          'Pharmaceutical decline from negotiation and exclusivity loss stays within the modelled range',
        ],
        breaks: [
          'A competing surgical platform with enough advantage to justify retraining at scale',
          'Procedure volume disruption from health system capacity or staffing',
          'Pharmaceutical negotiation biting harder or sooner than modelled',
        ],
        modelLink: [
          { assumption: 'Segment margins and growth', note: 'Model medical technology and innovative medicine as separate businesses with separate drivers. Blended, the thesis cannot be expressed.' },
          { assumption: 'Terminal growth', note: 'The device half supports a different terminal growth rate from the pharmaceutical half. One blended rate is the error.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'jnj-litigation-overhang',
        title: 'A material share of equity value is a court\'s decision, not a business outcome',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Mass-tort liabilities arising from products sold over decades have repeatedly cost more than provided, and the attempts to cap them through subsidiary restructuring have been rejected in court. That means a large, uncertain claim on equity value depends on judicial attitudes rather than on operations, arrives without warning, and is uncorrelated with the cycle that otherwise moves the shares. Any valuation treating the current provision as a fixed number is understating the range, and the correct treatment is an explicit range rather than a point estimate.',
        requires: [
          'Litigation remains unresolved with resolution structures under challenge',
          'Claim volumes and settlement values continue exceeding provisions',
        ],
        breaks: [
          'A court-approved global resolution that caps the liability at a known amount',
          'Settlement outcomes consistently landing within provisions',
        ],
        modelLink: [
          { assumption: 'Provisions and contingent liabilities', note: 'Model the litigation provision as a range in the equity bridge rather than a single number. The point estimate is the thing this thesis disputes.' },
          { assumption: 'Cost of equity', note: 'An unquantifiable legal overhang belongs in an explicit premium where it can be argued with.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Labiotech — the next pharma patent cliff', url: 'https://www.labiotech.eu/best-biotech/pharma-patent-cliff/' },
      { label: 'KFF — key facts about Medicare drug price negotiation', url: 'https://www.kff.org/medicare/key-facts-about-medicare-drug-price-negotiation/' },
      { label: 'PharmExec — US pharmaceutical pricing policy', url: 'https://www.pharmexec.com/view/pharmaceutical-pricing-policy-strategic-adaptation' },
    ],
  },
];
