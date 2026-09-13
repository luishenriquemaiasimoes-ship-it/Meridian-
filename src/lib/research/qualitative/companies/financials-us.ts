import type { CompanyQualitative } from '../types';

export const FINANCIALS_US: CompanyQualitative[] = [
  {
    ticker: 'JPM',
    sector: 'Financials',
    scope: 'UNITED_STATES',
    headline:
      'Guiding to roughly $105.5 billion of net interest income for 2026 while holding a 14.1% common equity tier one ratio — carrying capital far above requirement precisely because the requirement is a political variable, and publicly arguing the new one is miscalibrated.',
    howItEarns: [
      {
        heading: 'Net interest income is the largest line and it is rate-dependent',
        body:
          'Net interest income was $25.5 billion in the March 2026 quarter and $25.6 billion in June, with management guiding to approximately $105.5 billion for the year and about $96.5 billion excluding Markets, market dependent. That is the spread between what the bank pays for deposits and earns on loans and securities, and it moves with the level and slope of the curve rather than with anything management decides.',
        basis: 'REPORTED',
      },
      {
        heading: 'Four businesses with different cycles under one balance sheet',
        body:
          'Consumer and community banking, commercial and investment banking, markets, and asset and wealth management. Trading and investment banking peak when lending is difficult and vice versa, which is the internal hedge that makes the consolidated earnings far steadier than any division — and the reason a single-segment model of this company is wrong.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Credit cost is the variable that decides whether a good year is a good year',
        body:
          'Credit costs were $2.5 billion in the June 2026 quarter. Provisions are a forward-looking estimate under the expected-loss standard, so they move on economic forecasts before any borrower misses a payment — which makes the provision line partly a judgement about the future rather than a record of the past.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds. The binding constraint on this company is not a shareholder but a regulator: capital requirements, stress test results and the systemically important bank surcharge determine how much can be lent and returned.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Acting as lender, adviser, market maker and asset manager to the same clients, which creates conflicts managed by disclosure and internal separation rather than eliminated',
        'A deposit base that is effectively a public utility, guaranteed in part, funding a private balance sheet',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register and annual director elections',
        'Extensive regulatory disclosure: capital ratios, stress test results, liquidity coverage and risk-weighted asset composition, which is far more than any non-financial company discloses',
        'A regulator whose objective — solvency — is aligned with a long-term shareholder\'s more often than not',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The capital ratio is the disclosure that matters, and it is well above requirement',
        body:
          'Common equity tier one stood at 14.3% standardised and 14.1% advanced in the March 2026 quarter, and 14.1% standardised with 14.2% advanced in June. Holding capital materially above requirement is a governance choice: it costs return on equity and it buys the ability to keep lending and buying back stock through a downturn rather than raising equity at the bottom.',
        basis: 'REPORTED',
      },
      {
        heading: 'Management argues with its own regulator in public, with numbers',
        body:
          'Regulators unveiled a revised capital proposal on 19 March 2026, recalibrating a 2023 framework that had failed to reach consensus. The bank has estimated the effect against roughly $2.1 trillion of risk-weighted assets, with about a 6% increase attributable to the proposal, and has publicly described the calibration as wrong. Publishing the estimate is what makes the argument checkable rather than lobbying.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'A deposit base that is cheap because it is transactional',
        mechanism:
          'Operating accounts for households and businesses move with the relationship rather than with the rate offered, so the cost of funds rises more slowly than market rates when they climb. Replicating it requires branches, payroll relationships and payment infrastructure built over decades, not a higher savings rate.',
        evidence: 'Net interest income guidance of roughly $105.5 billion for 2026 on a deposit base whose cost has repriced more slowly than market rates through the cycle.',
        erodedBy: 'Instant payment rails and digital banks making deposits genuinely portable, which converts a relationship balance into a rate-shopping one.',
        basis: 'REPORTED',
      },
      {
        label: 'Balance sheet scale that lets it underwrite what others cannot',
        mechanism:
          'Committing to a very large financing, warehousing a position or making a market in size requires capital that only a handful of institutions hold. That capacity wins the mandate, and the mandate brings the advisory and the deposit relationship with it, so the capital is a commercial asset rather than only a buffer.',
        evidence: 'A 14.1% common equity tier one ratio and roughly $2.1 trillion of risk-weighted assets, with $8.1 billion and $6.2 billion of net share repurchases in consecutive quarters alongside it.',
        erodedBy: 'A capital regime that raises the cost of holding risk-weighted assets enough to make the balance-sheet-led model uneconomic relative to private credit funds that face no such requirement.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Capital returned through dividends and very large buybacks, subject entirely to what the regulator permits, with capital held above requirement as deliberate optionality. The record through the last two crises is the strongest evidence available: it acquired rather than being rescued.',
      good: [
        'Holding common equity tier one at 14.1% to 14.3%, comfortably above requirement, which preserved the ability to lend and repurchase through periods when weaker banks were raising equity',
        'Repurchasing $8.1 billion and then $6.2 billion of stock in consecutive quarters while still building capital, which is the definition of a business generating more capital than it consumes',
        'Acquiring distressed institutions at moments when capital was scarce, rather than needing rescue — the acquisitions were made at prices only an over-capitalised buyer could offer',
      ],
      bad: [
        'Very large buybacks executed at high multiples of tangible book value return capital at the most expensive point, and the same programme would be far more valuable deployed in a dislocation — which is when the regulator is most likely to restrict it',
        'The bank has repeatedly incurred multi-billion-dollar legal and regulatory settlements across trading, mortgage and compliance matters, costs that are real capital and that recur often enough to be treated as a cost of operating at this scale rather than as exceptional items',
        'Holding capital above requirement is prudent and it also permanently suppresses return on equity; the bank is choosing a lower return in exchange for optionality, and shareholders should price that trade rather than assume the excess is free',
        'Expected-loss provisioning gives management genuine discretion over the timing of credit costs, and a $2.5 billion quarterly provision is a forecast as much as a measurement — the reserve build and release cycle has flattered and depressed reported earnings in different years',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The balance-sheet lender the dossier separates from the toll-takers',
        body:
          'The United States Financials dossier splits the sector into balance-sheet lenders whose earnings follow the rate cycle and credit losses, and toll-takers on payments and asset flows whose earnings barely touch either. This is the largest example of the first kind, and it is why its earnings correlate with the curve in a way a card network\'s do not.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Capital as a political variable, stated by the dossier and demonstrated here',
        body:
          'The dossier notes that capital is the binding constraint on bank returns and that it is political. The revised proposal of 19 March 2026, the bank\'s published estimate of roughly a 6% risk-weighted asset increase, and its public objection to the calibration are that observation playing out in real time.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'A capital rule that raises the requirement on the same business',
        body:
          'An increase in required capital reduces return on equity mechanically, without any change in lending, credit or rates, and it can also restrict buybacks. This is the single largest exogenous variable for a large bank and it is decided by a process no shareholder participates in.',
        basis: 'REPORTED',
      },
      {
        heading: 'Credit normalisation in consumer and commercial real estate',
        body:
          'The dossier names consumer credit and commercial real estate as the sector\'s current headwind. Provisions are forward-looking, so a deterioration in the economic outlook raises the charge before any loss is realised — and the $2.5 billion quarterly credit cost is the number that would move first.',
        basis: 'REPORTED',
      },
      {
        heading: 'Deposit flight at digital speed',
        body:
          'The cheap, sticky deposit base is the foundation of the net interest income, and recent experience elsewhere in the industry showed that deposits can now leave faster than any liquidity framework was designed for. Scale and perceived safety make this institution the beneficiary of such an episode rather than the victim, which is itself part of the moat.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'jpm-capital-is-the-variable',
        title: 'The binding constraint is a capital rule, not a market — and it is being rewritten now',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'Regulators unveiled a revised capital proposal on 19 March 2026, recalibrating a 2023 framework that had failed to reach consensus among the agencies and drawn objections from Congress and industry. The bank has published its own estimate — roughly a 6% increase in risk-weighted assets against a base of about $2.1 trillion — and has described the calibration as wrong. Whatever the merits, the structural point for a valuation is that the most important input to this company\'s return on equity is set administratively. Required capital determines how much of a given balance sheet has to be funded with equity, and therefore what return that balance sheet can produce; it also gates the buyback. Common equity tier one at 14.1% to 14.3% is well above requirement, which is the bank buying optionality against exactly this uncertainty. A model of a large bank that treats the capital ratio as an output of the projection rather than as a constraint imposed on it has the causality backwards.',
        requires: [
          'The revised capital framework proceeding through the rulemaking process',
          'Risk-weighted asset calculations remaining the basis for required capital',
          'Buyback capacity continuing to be gated by capital ratios and stress test outcomes',
        ],
        breaks: [
          'The proposal being withdrawn or calibrated to a capital-neutral outcome',
          'A shift to a simpler leverage-based regime that removes risk-weighting as the binding measure',
        ],
        modelLink: [
          { assumption: 'Capital ratio and risk-weighted assets', note: 'Model common equity tier one as a constraint that caps distributions, not as a residual. A 6% risk-weighted asset increase requires proportionally more equity for the same balance sheet.' },
          { assumption: 'Buyback as a share of net income', note: 'Repurchases of $8.1bn and $6.2bn in consecutive quarters are permitted, not chosen freely. Tie the buyback assumption to capital headroom above requirement.' },
        ],
        conviction: 'HIGH',
      },
      {
        id: 'jpm-diversification-and-capital-buffer',
        title: 'Excess capital plus offsetting divisions is what lets it act when everyone else is raising equity',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Two features compound. The first is divisional offset: trading and investment banking earn most when lending conditions are difficult, and lending earns most when markets are calm, so consolidated earnings are materially steadier than any single segment — net interest income of $25.5 billion and $25.6 billion in consecutive quarters, with markets and banking moving on their own cycles around it. The second is the capital position: common equity tier one at 14.1% to 14.3% against requirement, while still repurchasing $8.1 billion and then $6.2 billion of stock. Held together, these mean the bank generates capital faster than it consumes it and enters a dislocation able to lend, underwrite and acquire while competitors are issuing equity at the bottom. That is not a theoretical advantage; it is how the institution acquired distressed franchises in the last two crises at prices only an over-capitalised buyer could offer. The cost is a permanently lower return on equity than a thinner balance sheet would produce, which is the trade being made deliberately.',
        requires: [
          'The capital ratio remaining well above requirement through the rule change',
          'Divisional earnings continuing to offset rather than correlate in a downturn',
          'Credit costs remaining manageable relative to pre-provision earnings',
        ],
        breaks: [
          'A downturn in which credit losses and trading losses arrive together, removing the internal hedge',
          'A capital rule that consumes the entire excess, eliminating the optionality that justifies holding it',
          'Provisions rising far enough that pre-provision profit no longer covers them with room to spare',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'Model the four segments with their own revenue drivers. The thesis is that they offset; a single consolidated revenue growth rate assumes the correlation away.' },
          { assumption: 'Provision for credit losses', note: 'Model provisions against loan balances and an economic scenario rather than as a percentage of revenue, and test pre-provision profit against a stressed provision level.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'jpm-nii-is-the-curve',
        title: 'Roughly $105.5 billion of guided net interest income is a forecast about rates, not about the bank',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Management guides to approximately $105.5 billion of net interest income for 2026, about $96.5 billion excluding Markets, and explicitly labels it market dependent. That caveat is the whole point. Net interest income is the spread between deposit costs and asset yields, and both ends are set by the curve rather than by management: a falling front end compresses the asset yield faster than the deposit cost falls, because the deposit cost is already low and has limited room to decline, while a flat or inverted curve removes the term premium that funds the spread. The bank\'s deposit franchise makes the liability side unusually resilient, which is precisely why the asset side dominates the outcome. So a large share of the earnings of the largest business line is an interest rate forecast wearing a corporate name, and a projection that grows net interest income at a steady rate through a five-year horizon has quietly embedded a view on the curve it never stated. Add the forward-looking provision — $2.5 billion in a quarter, moving on economic forecasts before any borrower defaults — and a material part of reported earnings is a judgement about the macro path.',
        requires: [
          'Net interest income remaining the dominant earnings line',
          'Rate policy continuing to be set independently of bank profitability',
          'Deposit costs having limited room to fall further as asset yields reprice down',
        ],
        breaks: [
          'Fee and markets revenue growing enough that net interest income falls below a majority of revenue',
          'A steepening curve that expands the spread irrespective of the level of rates',
          'Deposit repricing proving more flexible on the way down than the current cost level suggests',
        ],
        modelLink: [
          { assumption: 'Net interest margin and the rate path', note: 'This is the thesis. State the curve assumption explicitly and run net interest income across a range of rate paths rather than growing it at a single rate.' },
          { assumption: 'Revenue growth path', note: 'Separate net interest income from fee and markets revenue. They have different drivers, and blending them hides that most of the line is a macro forecast.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'SEC EDGAR — JPMorgan Chase 2Q26 earnings presentation (Form 8-K)', url: 'https://www.sec.gov/Archives/edgar/data/0000019617/000162828026048086/a2q26_earningsxpresentat.htm' },
      { label: 'SEC EDGAR — JPMorgan Chase 1Q26 earnings presentation (Form 8-K)', url: 'https://www.sec.gov/Archives/edgar/data/19617/000162828026025013/a1q26_earningsxpresentat.htm' },
      { label: 'JPMorgan Chase — 1Q26 financial results (PDF)', url: 'https://www.jpmorganchase.com/content/dam/jpmc/jpmorgan-chase-and-co/investor-relations/documents/quarterly-earnings/2026/1st-quarter/ba305358-f754-4f76-a59d-5278b3bcf99a.pdf' },
      { label: 'SEC EDGAR — JPMorgan Chase Form 10-Q, June 2026', url: 'https://www.sec.gov/Archives/edgar/data/0000019617/000162828026054343/jpm-20260630.htm' },
      { label: 'Freshfields — Basel III Endgame take two: key takeaways from the capital re-proposals', url: 'https://www.freshfields.com/en/our-thinking/blogs/a-fresh-take/basel-iii-endgame-take-two-8-key-takeaways-from-the-federal-banking-agencies-c-102mnm3' },
    ],
  },

  {
    ticker: 'BAC',
    sector: 'Financials',
    scope: 'UNITED_STATES',
    headline:
      'Net interest income up 9% to $16.2 billion in the June 2026 quarter with the total deposit rate paid falling to 146 basis points from 176 — the deposit franchise repricing downward faster than the asset yields, which is the mirror image of the problem this bank had two years ago.',
    howItEarns: [
      {
        heading: 'A very large, very cheap deposit base lent out',
        body:
          'Average deposits of $2.02 trillion, up $59 billion or 3%, funding average loans and leases of $1.19 trillion, up $96 billion or 9%. Net interest income reached $15.7 billion in the March 2026 quarter, up $1.3 billion or 9%, and $16.2 billion on a fully taxable-equivalent basis in June, also up 9%. The gap between the deposit cost and the loan yield is the business.',
        basis: 'REPORTED',
      },
      {
        heading: 'Consumer banking is the franchise and the funding',
        body:
          'Consumer banking produced $3.3 billion of net income on revenue of $11.3 billion, up 5%, with average deposits of $957 billion and average loans of $321 billion. Consumer deposits vastly exceed consumer loans, so the division is a funding source for the rest of the bank as much as a lending business in its own right.',
        basis: 'REPORTED',
      },
      {
        heading: 'Markets and wealth management provide the fee offset',
        body:
          'Trading and wealth management earn fees that do not depend on the spread, which is what allowed second-quarter net income to rise 27% to $9.1 billion on broad-based growth. The mix matters: a bank that is only a spread business has no offset when the curve moves against it.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, with one very large long-term holder whose position confers influence without control rights. As with any large bank, the effective constraint is the capital and stress test regime rather than the register.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Serving the same clients as lender, market maker and wealth manager, with conflicts managed by separation rather than removed',
        'A deposit base that is partly government-guaranteed funding a private balance sheet',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register and annual director elections',
        'Regulatory disclosure of capital, liquidity, stress test results and securities portfolio marks well beyond ordinary corporate reporting',
        'Supervisory oversight whose solvency objective broadly aligns with a long-term shareholder\'s',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The deposit rate paid is disclosed, and it is the cleanest measure of franchise quality',
        body:
          'A total deposit rate of 146 basis points, down from 176 a year earlier, quantifies how much the bank has to pay to keep its funding. It is a better measure of deposit franchise strength than balance growth, because balances can be bought with rate and the rate paid cannot be disguised.',
        basis: 'REPORTED',
      },
      {
        heading: 'The securities portfolio is the lesson this bank learned expensively',
        body:
          'A large long-duration securities portfolio accumulated when rates were near zero produced very large unrealised losses when rates rose, constraining flexibility for years even though the securities were held to maturity and the losses never crystallised. The episode is the reason the duration of the portfolio deserves more attention here than at most peers.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'The largest consumer deposit franchise in the country',
        mechanism:
          'Primary current accounts for a very large share of American households are held through direct deposit, bill payment and card relationships that do not move for a better rate. That produces funding cheaper than wholesale money and stickier than a savings account, and it cannot be replicated without the branch network and payment relationships behind it.',
        evidence: 'Average deposits of $2.02 trillion with a total deposit rate paid of 146 basis points, down 30 basis points year on year even as balances grew 3%.',
        erodedBy: 'Instant payment rails and digital banks making current-account balances genuinely portable, which turns a relationship deposit into a rate-shopped one.',
        basis: 'REPORTED',
      },
      {
        label: 'A wealth management business attached to the bank',
        mechanism:
          'Advisory relationships generate fee revenue that does not depend on the spread and deposits that fund the balance sheet, and clients rarely move an advisory relationship for pricing. Building an equivalent adviser base takes decades of recruitment and client tenure.',
        evidence: 'Second-quarter net income rising 27% to $9.1 billion on broad-based growth across lending, markets and wealth rather than on the spread alone.',
        erodedBy: 'Fee compression in advice and the migration of assets to low-cost platforms, which the sector dossier names as passive fee deflation.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Dividends and buybacks within what the capital regime permits, alongside a very large securities portfolio whose duration decision defines the last decade of this company\'s capital allocation record — for worse and then, as it runs off, for better.',
      good: [
        'Building and defending the consumer deposit franchise, which produced a total deposit rate of 146 basis points and is the reason net interest income grew 9% while rates were falling',
        'Growing average loans 9% to $1.19 trillion while deposits grew 3%, which redeploys excess liquidity into higher-yielding assets rather than leaving it in securities',
        'Diversifying into markets and wealth management sufficiently that second-quarter net income rose 27% on broad-based growth rather than on the spread alone',
      ],
      bad: [
        'Deploying an enormous deposit inflow into long-duration securities when rates were near zero locked in low yields for years and produced very large unrealised losses when rates rose — a capital allocation decision that constrained the bank\'s flexibility for longer than any credit loss in the same period',
        'Because those securities are held rather than sold, the cost appears as foregone income rather than a realised loss, which makes it easy to underweight in an earnings-based analysis and is precisely why it should be modelled explicitly',
        'The bank has paid repeated multi-billion-dollar legal and regulatory settlements stemming from acquisitions made during the financial crisis, costs that arrived over more than a decade and were not visible in the prices paid at the time',
        'Buybacks executed at prices above tangible book value return capital at the least advantageous point in the cycle, and capacity to repurchase is withdrawn by the regulator exactly when the shares are cheapest',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The purest expression of the dossier\'s curve driver',
        body:
          'The United States Financials dossier names the level and slope of the yield curve as its first driver. With $2.02 trillion of deposits funding $1.19 trillion of loans plus a large securities book, this bank is more exposed to that variable than any peer of comparable size, which is why a 30 basis point fall in the deposit rate paid translated into 9% net interest income growth.',
        basis: 'REPORTED',
      },
      {
        heading: 'And of its named failure mode',
        body:
          'The dossier lists reaching for duration or for yield at the top of the cycle as a sector failure mode. This company is the case study: deposits received at the bottom were invested long, and the consequence has shaped its earnings power and its optionality ever since.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Asset yields repricing down faster than deposit costs can follow',
        body:
          'The deposit rate paid has fallen to 146 basis points, which leaves less room to fall further. If asset yields continue to reprice downward, the spread compresses from the asset side with the liability side near its floor — the exact reverse of the dynamic that produced the 9% growth.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The securities portfolio and its duration',
        body:
          'A large held portfolio acquired at low yields continues to earn below current market rates until it matures. It is a drag on net interest income that does not appear as a loss, and its run-off schedule is one of the most important and least discussed inputs to this company\'s forward earnings.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Consumer credit normalisation',
        body:
          'With $321 billion of average consumer loans and a household base carrying record balances, a deterioration in consumer credit raises provisions before it raises charge-offs. The dossier names consumer credit as a current sector headwind and this is the largest consumer bank in the country.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'bac-deposit-franchise-repricing',
        title: 'The deposit rate fell 30 basis points while balances grew, which is franchise quality measured directly',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The total deposit rate paid fell to 146 basis points from 176 a year earlier, average deposits still grew 3% to $2.02 trillion, and net interest income rose 9% in both the March and June 2026 quarters — $15.7 billion and then $16.2 billion on a fully taxable-equivalent basis. That combination is the specific evidence of a relationship deposit franchise rather than a rate-bought one: balances that stay while the rate paid on them falls. Average loans grew 9% to $1.19 trillion against deposit growth of 3%, so excess liquidity is being redeployed into higher-yielding assets rather than sitting in securities — which is the right correction to the mistake of the last cycle. And the earnings improvement was broad: second-quarter net income rose 27% to $9.1 billion across lending, markets and wealth, so the spread is not carrying the result alone. A deposit base of this size repricing down is worth more than any efficiency programme this bank could run.',
        requires: [
          'Deposit balances remaining stable as the rate paid declines',
          'Loan growth continuing to outpace deposit growth, redeploying liquidity into higher yields',
          'Fee income from markets and wealth continuing to contribute alongside the spread',
        ],
        breaks: [
          'Deposit balances declining as the rate paid falls, which would mean the balances were rate-bought after all',
          'Net interest income growth stalling as asset yields reprice down with the deposit rate near its floor',
          'Consumer credit deterioration consuming the net interest income gain through provisions',
        ],
        modelLink: [
          { assumption: 'Cost of deposits and net interest margin', note: 'Model the deposit rate paid explicitly — 146 basis points and falling — against asset yields. The thesis is the gap between the two repricing speeds, which a single margin assumption cannot express.' },
          { assumption: 'Loan and deposit balance growth', note: 'Loans grew 9% against deposits at 3%. Model them separately; the redeployment of excess liquidity is a distinct driver from balance growth.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'bac-duration-drag',
        title: 'A securities book bought at the bottom is still earning bottom-of-cycle yields',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'When deposits flooded in during the zero-rate period, this bank invested a very large share of them in long-dated securities. When rates rose, that portfolio generated enormous unrealised losses; because the securities are held rather than sold, the loss has never been realised and appears nowhere in earnings. That is exactly what makes it easy to underweight. The real cost is ongoing and quiet: those assets continue to earn yields set years ago while the bank\'s competitors reinvest at current rates, so every year the portfolio remains outstanding is a year of foregone net interest income. The run-off schedule of that book, not the rate cycle, is therefore one of the largest determinants of this company\'s forward earnings power — and it is the sector dossier\'s named failure mode, reaching for duration at the top of the cycle, still working through the income statement. Meanwhile the deposit rate paid at 146 basis points has limited room to fall further, so the offsetting tailwind that produced 9% growth is closer to exhausted than it appears.',
        requires: [
          'A material share of the securities portfolio remaining at below-market yields',
          'The deposit rate paid approaching a floor, limiting further liability-side relief',
          'Asset yields continuing to reprice downward as rates fall',
        ],
        breaks: [
          'The low-yield portfolio running off faster than expected and being reinvested at current rates',
          'A steepening curve that widens the spread on new assets enough to outrun the legacy drag',
          'Loan growth at current yields becoming large enough that the securities book stops mattering to the margin',
        ],
        modelLink: [
          { assumption: 'Securities portfolio yield and run-off schedule', note: 'Model the legacy portfolio as a separate asset class with its own yield and maturity profile. Blending it into an average earning-asset yield hides the entire drag and its expiry date.' },
          { assumption: 'Net interest margin path', note: 'A margin that expands must specify whether the improvement comes from deposit repricing — near its floor at 146 basis points — or from legacy securities rolling into current yields.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'bac-consumer-bank-is-a-funding-vehicle',
        title: 'The consumer bank holds $957 billion of deposits against $321 billion of loans, so it funds the company rather than lending',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'Consumer banking reports average deposits of $957 billion and average loans and leases of $321 billion — roughly three dollars of deposits for every dollar lent to the same customers. That ratio says the segment is not primarily a lending business at all. It is a funding utility whose product is cheap, sticky liabilities, and whose $636 billion of surplus is deployed by the rest of the bank into commercial loans, markets inventory and securities. Two modelling consequences follow, and both are easy to get wrong. First, consumer segment profitability is largely a transfer-pricing outcome: what the segment earns depends on the internal rate credited for the deposits it supplies, which is an allocation rather than a market price. Second, the segment\'s value to the company rises when rates are high and the surplus earns more — so consumer banking revenue of $11.3 billion, up 5%, is as much a rate signal as a consumer one. Analysing it as a retail lender, by loan growth and credit quality, measures the smaller half.',
        requires: [
          'Consumer deposits continuing to exceed consumer loans by a large multiple',
          'Segment reporting continuing to disclose deposits and loans separately',
        ],
        breaks: [
          'Consumer lending growing fast enough that the segment becomes loan-funded rather than deposit-surplus',
          'A large deposit outflow that removes the surplus and turns the segment into a user of funding',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'Consumer segment earnings depend on the internal funds transfer price, not only on loan spreads. State the assumption rather than modelling the segment as a standalone lender.' },
          { assumption: 'Net interest income by source', note: 'Attribute part of net interest income to deploying the consumer deposit surplus. That is where a rate change actually reaches the consumer segment result.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'SEC EDGAR — Bank of America Q1 2026 supplemental information (Form 8-K)', url: 'https://www.sec.gov/Archives/edgar/data/0000070858/000007085826000222/bac-03312026ex993.htm' },
      { label: 'SEC EDGAR — Bank of America Q2 2026 supplemental information (Form 8-K)', url: 'https://www.sec.gov/Archives/edgar/data/0000070858/000007085826000353/bac-06302026ex993.htm' },
      { label: 'Investing.com — Bank of America Q2 2026 slides: broad-based growth drives 27% profit surge', url: 'https://www.investing.com/news/company-news/bank-of-america-q2-2026-slides-broadbased-growth-drives-27-profit-surge-93CH-4791129' },
      { label: 'Quartz — Bank of America Q1 2026 earnings beat on trading and interest income', url: 'https://qz.com/bank-of-america-q1-2026-earnings-profit-trading-041526' },
    ],
  },
  {
    ticker: 'V',
    sector: 'Financials',
    scope: 'UNITED_STATES',
    headline:
      'Net revenue up 17% in the March 2026 quarter on cross-border and payments volume, while $894 million of fresh accruals were added in the half to the interchange litigation that has been running for two decades — a toll road whose toll is permanently contested.',
    howItEarns: [
      {
        heading: 'A fee on payment volume, not a balance sheet',
        body:
          'The network authorises, clears and settles transactions between the cardholder\'s bank and the merchant\'s bank, and charges a small fee on the value and the count. It does not lend, so it carries no credit risk and almost no capital requirement — which is why the margin is extraordinary and why a rate cycle affects it only through nominal spending.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Cross-border is the highest-value volume',
        body:
          'Net revenue grew 17% in the three months and 16% in the six months to 31 March 2026, primarily on growth in nominal cross-border volume, nominal payments volume and processed transactions. A transaction crossing a currency border earns materially more than a domestic one, which is why travel recovery and cross-border mix matter more to revenue than total volume does.',
        basis: 'REPORTED',
      },
      {
        heading: 'Value-added services are the growth on top of the toll',
        body:
          'Fraud scoring, tokenisation, authentication, dispute handling and consulting are sold to the same issuers and merchants already connected to the network. They grow faster than volume and deepen the integration, which is what makes the connection harder to replace than the switching itself.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, following a transition from bank ownership at listing. Residual share classes convertible to common remain associated with the litigation arrangements inherited from that structure.',
      voting: 'A publicly traded class of common stock with one vote per share, alongside limited classes arising from the original bank-owned structure and the litigation escrow.',
      relatedPartyExposure: [
        'Issuing banks are simultaneously the network\'s customers, its former owners and the recipients of the interchange the network sets',
        'A litigation escrow funded by a share class whose conversion rate adjusts with settlement costs, which transfers part of the litigation risk to a defined pool rather than to common shareholders directly',
      ],
      minorityProtections: [
        'SEC disclosure of volume, cross-border growth, processed transactions and litigation accruals, which makes both the growth and the contingency measurable',
        'The litigation escrow structure, which absorbs a defined portion of interchange settlement cost before it reaches common equity',
        'Independent board and audit committee under New York Stock Exchange listing standards',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The litigation accrual is disclosed as it accumulates',
        body:
          'Additional accruals of $894 million were recorded in the six months to 31 March 2026 to address claims associated with the interchange multidistrict litigation. Reporting the accrual as it is taken, rather than describing the litigation qualitatively, is what allows an outsider to track the running cost of the sector\'s central legal dispute.',
        basis: 'REPORTED',
      },
      {
        heading: 'The escrow structure is a governance feature, not an accounting one',
        body:
          'A dedicated share class funds the interchange litigation escrow, so settlement costs are absorbed partly through an adjustment to that class rather than entirely by common shareholders. It is an unusual arrangement and it materially changes who bears the risk of the single largest legal exposure in the business.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'A two-sided network with acceptance already built',
        mechanism:
          'Cardholders carry the card because merchants accept it and merchants accept it because cardholders carry it. A new network must solve both sides simultaneously in every geography, and the acceptance infrastructure — terminals, certifications, bank integrations — already exists for the incumbents and would have to be funded from scratch by a challenger.',
        evidence: 'Net revenue growth of 17% in a quarter driven by nominal payments volume and processed transactions across a global acceptance base.',
        erodedBy: 'Account-to-account rails mandated or subsidised by governments, which bypass the network entirely by connecting bank accounts directly, as has happened in several large markets.',
        basis: 'REPORTED',
      },
      {
        label: 'Settlement certainty as the product being sold',
        mechanism:
          'What a merchant actually buys is the guarantee that an authorised payment settles, with fraud liability, dispute rules and chargeback procedures defined in advance. Building that rulebook and the trust in it took decades, and a payment method without it transfers risk back to the merchant.',
        evidence: 'Value-added services in security, authentication and dispute handling sold on top of the switching fee to the same connected parties.',
        erodedBy: 'Stablecoin and instant-payment settlement maturing to the point where finality is achieved without the network\'s rulebook — and the network\'s own move to settle in stablecoins, at a $7 billion annualised run rate across nine blockchains by April 2026, shows which direction it expects that to go.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Almost all free cash flow returned through buybacks and dividends, because the business requires very little capital. The allocation question is not where to invest but how much litigation and regulation will ultimately cost, and that is answered in accruals rather than in decisions.',
      good: [
        'Building value-added services on top of the existing network connection, which grows faster than volume and requires almost no incremental capital',
        'Moving early on stablecoin settlement — growing from a 2021 pilot to a roughly $7 billion annualised run rate across nine blockchains by April 2026 — which positions the network on the rail that could otherwise disintermediate it',
        'Establishing a position in agent-initiated payments through an intelligent commerce framework, which attempts to make the network the authentication and tokenisation layer for a transaction type that did not previously exist',
      ],
      bad: [
        'The interchange multidistrict litigation has run for roughly two decades and required a further $894 million of accruals in the six months to March 2026 alone — a cost that recurs, has never been finally resolved, and is best modelled as an ongoing expense rather than an exceptional item',
        'Interchange is a regulated price in most of the world and a contested one in the United States, so the network\'s central pricing decision is subject to authorities and courts rather than to the market, and successive regulatory caps abroad have already reset it downward',
        'Very large buybacks conducted consistently at high multiples return capital at the most expensive point, which is the standard criticism of a business with nothing else to do with its cash and is no less true for being unavoidable',
        'The company is investing in the rails that could disintermediate it — stablecoin settlement and agentic payments — which is the correct strategic response and is also an acknowledgement that the toll position is not permanent',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The toll-taker the dossier separates from the lenders',
        body:
          'The United States Financials dossier divides the sector into balance-sheet lenders whose earnings follow rates and credit, and toll-takers on payments and asset flows whose earnings barely touch either. This is the cleanest example of the second kind: no credit risk, no capital requirement, and revenue that follows nominal spending rather than the curve.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Nominal payment volume and cross-border mix, working',
        body:
          'The dossier names nominal payment volume and cross-border mix as a sector tailwind. Net revenue growth of 17% driven primarily by nominal cross-border volume, nominal payments volume and processed transactions is precisely that driver, and it means inflation is a revenue tailwind here rather than a cost problem.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Interchange is a price set by courts and regulators',
        body:
          'The fee at the centre of the system is capped by regulation in Europe and several other markets and litigated continuously in the United States, with $894 million of further accruals in a single half-year. This is the one price in the business the network does not ultimately control.',
        basis: 'REPORTED',
      },
      {
        heading: 'Account-to-account rails sponsored by the state',
        body:
          'Where a central bank or government builds an instant payment system, transactions move directly between bank accounts and the network is simply absent from them. This has already happened at scale in several large economies and it is the disintermediation risk that does not require a competitor to win commercially.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Agentic commerce changing who initiates the payment',
        body:
          'If software agents rather than people initiate purchases, the authentication and trust model the network sells has to be rebuilt for a different actor. The company is building for it directly, which is the right response and confirms that the incumbent position does not transfer automatically to the new transaction type.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'v-nominal-volume-toll',
        title: 'Revenue is a percentage of what the world spends, which makes inflation a tailwind and credit irrelevant',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Net revenue grew 17% in the three months and 16% in the six months to 31 March 2026, driven primarily by nominal cross-border volume, nominal payments volume and processed transactions. Every element of that sentence matters. Nominal means the fee base rises with prices, so inflation — which raises costs for every other company in this universe — raises revenue here with no corresponding cost. Cross-border volume carries a materially higher fee than domestic, so mix compounds the growth. And processed transactions grow with the shift from cash to electronic payment, which is a decades-long structural migration rather than a cycle. There is no credit risk, no meaningful capital requirement and no rate sensitivity beyond nominal spending, so the earnings do not behave like a financial company\'s at all. Layered on top, value-added services in fraud, tokenisation and authentication grow faster than volume and deepen the integration that makes the connection hard to replace.',
        requires: [
          'Nominal payment volume continuing to grow with prices and with the cash-to-card migration',
          'Cross-border volume growing at least in line with total volume, preserving the mix benefit',
          'Value-added services continuing to outgrow the core switching fee',
        ],
        breaks: [
          'Cross-border growth decelerating below domestic, which would remove the mix uplift',
          'Volume growth converging on nominal GDP, indicating the cash migration is complete in the major markets',
          'Take rate compression from regulation outrunning volume growth',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume and take rate', note: 'Model payment volume, cross-border share and take rate as three separate drivers. Cross-border mix is a distinct lever from volume growth and carries a different fee.' },
          { assumption: 'Capex as a share of revenue and capital requirements', note: 'This is not a balance-sheet financial. Capital intensity is near zero and there is no credit provision line; a bank template applied here produces a wrong answer structurally.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'v-interchange-is-a-regulated-price',
        title: 'The central price in the business is set by courts and regulators, and the bill keeps arriving',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Additional accruals of $894 million were recorded in the six months to 31 March 2026 for the interchange multidistrict litigation, a dispute that has been running for roughly two decades and has repeatedly failed to reach a durable settlement with merchant groups. That is not an unusual legal contingency; it is the running cost of the network\'s core pricing decision being permanently contested. Beyond the United States, interchange is a capped regulated price in Europe and several other large markets, and each cap reset has lowered the fee by administrative decision rather than competition. The sector dossier states it plainly: interchange is a regulated price in most of the world and a contested one here. For a valuation the implications are that the take rate is not a management variable, that the litigation accrual should be modelled as a recurring expense rather than an exceptional item, and that a terminal value assuming the current fee structure persists indefinitely is assuming an outcome that two decades of litigation and regulation have so far declined to grant.',
        requires: [
          'Interchange litigation continuing without a final, durable resolution',
          'Regulatory caps remaining in force in Europe and other capped markets',
          'Merchant groups retaining the ability and incentive to litigate',
        ],
        breaks: [
          'A comprehensive settlement that ends the multidistrict litigation on defined terms',
          'A regulatory framework that fixes interchange at a stable level for a long period',
          'Value-added services growing large enough that switching fees stop being the majority of revenue',
        ],
        modelLink: [
          { assumption: 'Take rate', note: 'The fee is set by regulation and litigation, not by the company. Model take rate compression explicitly over the projection rather than holding it flat.' },
          { assumption: 'Litigation provision', note: 'At $894 million in a half-year and two decades of history, treat this as a recurring operating cost with its own line, not as an add-back to adjusted earnings.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'v-rails-are-changing',
        title: 'The company is building on the rails that could replace it, which tells you what it expects',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'Two facts belong together. The network has grown stablecoin settlement from a 2021 pilot to roughly a $7 billion annualised run rate across nine blockchains by April 2026, and it has launched an intelligent commerce framework to authenticate, authorise and tokenise payments initiated by software agents. Both are sensible strategic moves, and both are admissions. Stablecoin settlement matters because settlement finality without a card network is precisely the capability that would make the network optional; building on it is how an incumbent stays present on a rail it does not own. Agentic commerce matters because if a software agent rather than a person initiates a purchase, the identity, trust and dispute model the network sells was designed for a different actor and has to be rebuilt. The sector dossier poses the question directly — are card networks infrastructure or are they disruptable — and the company\'s own capital allocation is the most informative answer available: it is spending to remain relevant on rails where its historical position confers no automatic advantage. A model should therefore treat the current take rate and volume share as a position to be defended rather than as a structural constant, and should watch the share of volume settling outside the traditional rails as the metric that would show the transition happening.',
        requires: [
          'Alternative settlement rails continuing to develop, including stablecoin and instant account-to-account systems',
          'Agent-initiated commerce growing as a transaction category',
          'The network continuing to invest to be present on those rails',
        ],
        breaks: [
          'Alternative rails failing to achieve merchant acceptance or consumer trust at scale',
          'The network capturing agentic and stablecoin transactions at take rates comparable to card transactions, which would make the transition value-neutral',
          'Regulation that entrenches the existing rails for consumer protection reasons',
        ],
        modelLink: [
          { assumption: 'Terminal growth and terminal take rate', note: 'The terminal value assumes the toll persists. State explicitly whether it assumes the current rails, and what take rate an agent-initiated or stablecoin-settled transaction would carry.' },
          { assumption: 'Segment shares: core switching versus value-added services', note: 'Value-added services are the part of revenue least exposed to rail substitution. Model the two separately, because their durability differs.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'SEC EDGAR — Visa Inc. Form 10-Q, March 2026', url: 'https://www.sec.gov/Archives/edgar/data/0001403161/000140316126000079/v-20260331.htm' },
      { label: 'SEC EDGAR — Visa Inc. Form 10-K FY2025', url: 'https://www.sec.gov/Archives/edgar/data/1403161/000140316125000089/v-20250930.htm' },
      { label: 'Transak — Visa and Mastercard stablecoin settlement: what it means for payments', url: 'https://transak.com/blog/visa-mastercard-stablecoin-settlement' },
      { label: 'Payments Dive — Visa, Mastercard, ACI and Wex: 2026 predictions', url: 'https://www.paymentsdive.com/news/visa-mastercard-aci-and-wex-2026-predictions/808971/' },
    ],
  },

  {
    ticker: 'MA',
    sector: 'Financials',
    scope: 'UNITED_STATES',
    headline:
      'Value-added services grew 20% to $3.8 billion in the June 2026 quarter, faster than the 12% cross-border volume growth beneath it — the network is becoming a software business attached to a toll road, which is the only durable answer to a contested interchange.',
    howItEarns: [
      {
        heading: 'Switching fees on gross dollar volume',
        body:
          'A fee on the value and the count of transactions routed between issuing and acquiring banks. Gross dollar volume increased roughly 9% to 10%, with cross-border volume growing 13% in local currency in the March 2026 quarter and 12% globally in June — cross-border outpacing domestic, which raises the blended fee because a border-crossing transaction earns more.',
        basis: 'REPORTED',
      },
      {
        heading: 'Value-added services are now the growth engine',
        body:
          'Services and solutions net revenue reached $3.5 billion in the March 2026 quarter, up 22%, and $3.8 billion in June, up 20%, aided by pricing and by security, digital and authentication solutions alongside customer acquisition and engagement services. That is growing at roughly twice the rate of the volume beneath it.',
        basis: 'REPORTED',
      },
      {
        heading: 'Travel is the highest-value sub-mix within cross-border',
        body:
          'Travel-related cross-border volume grew 8% while other cross-border categories grew 12% and intra-Europe grew 10%. The composition matters because different cross-border corridors carry different fees, so the headline cross-border growth rate is not a single economic quantity.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, with a foundation established at the time of listing holding a significant long-term position that does not confer operating control.',
      voting: 'Single class of publicly traded common stock, one share one vote.',
      relatedPartyExposure: [
        'Issuing banks are customers, counterparties and the recipients of the interchange the network sets',
        'A founding foundation holding a large long-term stake, whose distribution requirements make it a structural seller over time',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register and annual director elections',
        'SEC disclosure separating gross dollar volume, cross-border growth and value-added services revenue, which makes the mix shift measurable rather than asserted',
        'Independent board and audit committee under New York Stock Exchange listing standards',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'The services line is disclosed separately, which is what makes the strategy checkable',
        body:
          'Reporting value-added services net revenue as a distinct figure — $3.5 billion then $3.8 billion, up 22% and 20% — lets an outsider verify that the diversification away from pure switching is happening, rather than relying on a management characterisation of the mix.',
        basis: 'REPORTED',
      },
      {
        heading: 'Growth is attributed partly to pricing, which is a disclosure worth noting',
        body:
          'The company attributes services growth partly to pricing alongside volume and new solutions. Saying so is more informative than reporting a single growth rate, because a services business growing on price has a different durability from one growing on adoption — and it invites the question of how much pricing headroom remains.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Network acceptance that a challenger must fund on both sides at once',
        mechanism:
          'Cardholders hold the card because merchants accept it and merchants accept it because cardholders hold it, with terminal certifications and bank integrations already in place for the incumbent. A new entrant must build acceptance and issuance simultaneously in every market before earning a single fee.',
        evidence: 'Gross dollar volume growth of roughly 9% to 10% with cross-border volume up 12% to 13%, across a global acceptance footprint.',
        erodedBy: 'State-sponsored instant payment systems connecting bank accounts directly, which bypass the network rather than competing with it.',
        basis: 'REPORTED',
      },
      {
        label: 'Services sold into a connection the customer already has',
        mechanism:
          'Fraud scoring, tokenisation, identity and engagement products are sold to issuers and merchants already integrated with the network, so the distribution cost is near zero and the data advantage comes from seeing the transaction flow. A standalone software vendor must win the integration before it can sell anything.',
        evidence: 'Value-added services net revenue of $3.8 billion growing 20%, against underlying volume growth of roughly 9% to 10%.',
        erodedBy: 'Specialist fraud and identity vendors with better products winning the same buyers, and the network\'s own customers building these capabilities internally at scale.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'A capital-light business returning most free cash flow through buybacks and dividends, with acquisitions concentrated in data, identity and fraud capabilities that feed the services line. The services strategy is the capital allocation story and it is currently working.',
      good: [
        'Building value-added services to $3.8 billion growing 20%, roughly twice the rate of underlying volume — the single most important strategic answer to an interchange fee that is regulated or litigated nearly everywhere',
        'Acquiring identity, fraud and data capabilities that are sold through an existing network connection, so the acquired product reaches distribution immediately rather than needing a sales channel built',
        'Launching an agent-initiated payment framework combining tokenisation with agent-aware identity and checkout, and supporting settlement in multiple stablecoins with intraday and weekend cycles announced in June 2026 — presence on the rails that could otherwise route around the network',
      ],
      bad: [
        'Services growth is attributed partly to pricing rather than only to adoption, and a services business growing on price has the same problem as any other: the increases are finite and the customers being repriced are the same banks whose interchange the network sets',
        'The company remains in continuing litigation with merchant groups over interchange, a dispute running for roughly two decades across multiple jurisdictions, whose cost recurs and has never been finally resolved',
        'Sustained buybacks at high multiples return capital at the most expensive point in the cycle — unavoidable for a business with almost no reinvestment requirement, and still the least efficient way to deploy it',
        'Investing in stablecoin settlement and agentic payments is a correct strategic response and simultaneously an acknowledgement that the existing rails are not permanent, which is a capital commitment made from a defensive position rather than an offensive one',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'A toll-taker whose growth is now software rather than volume',
        body:
          'The United States Financials dossier separates balance-sheet lenders from toll-takers on payments and asset flows. This company is the second kind and is actively changing what kind of toll it takes: services growing 20% against volume at 9% to 10% means the revenue mix is shifting away from the fee that regulators cap.',
        basis: 'REPORTED',
      },
      {
        heading: 'Cross-border mix is the sector tailwind in its most direct form',
        body:
          'The dossier names nominal payment volume and cross-border mix as a tailwind. Cross-border volume growing 12% to 13% against gross dollar volume at 9% to 10% is the mix improving — with the composition varying by corridor, travel at 8% and other categories at 12%.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Interchange regulation and continuing merchant litigation',
        body:
          'The core fee is capped by regulation in Europe and other markets and remains in litigation with merchant groups in the United States. It is the one price the network cannot ultimately set, and each reset has moved in the same direction.',
        basis: 'REPORTED',
      },
      {
        heading: 'Account-to-account systems bypassing the rails entirely',
        body:
          'Where a state builds an instant payment system, transactions move between bank accounts with no network in the path. This is disintermediation by construction rather than by competition, and it has already occurred at scale in several large economies.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Services growth decelerating from pricing exhaustion',
        body:
          'Services revenue is the thesis, and part of its growth comes from pricing. Price increases are finite, so a deceleration from 20% toward volume-like growth rates would remove the mix shift that currently justifies the multiple — and it would be visible in the disclosed line before anywhere else.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'ma-services-outgrowing-the-toll',
        title: 'Services growing at twice the rate of volume is the network changing what it sells',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Value-added services net revenue reached $3.5 billion in the March 2026 quarter, up 22%, and $3.8 billion in June, up 20%, while gross dollar volume grew roughly 9% to 10%. Services are therefore growing at about twice the rate of the transaction volume beneath them, and the mix shift is the most important thing happening at this company. It matters for a specific reason: the switching fee is a regulated price in Europe, a litigated one in the United States and a capped one across much of the world, while fraud scoring, tokenisation, authentication and engagement products are sold at prices the network sets. Every point of revenue mix that moves from the first to the second reduces exposure to the sector\'s one structural pricing risk. The distribution advantage is what makes it work — these products are sold into issuer and merchant connections that already exist, so the cost of sale is near zero and the data advantage comes from seeing the flow. Meanwhile cross-border volume growing 12% to 13% against gross dollar volume at 9% to 10% means the underlying toll is also improving in mix.',
        requires: [
          'Services revenue continuing to grow materially faster than gross dollar volume',
          'Cross-border volume continuing to outpace domestic, sustaining the blended fee',
          'Services growth coming increasingly from adoption rather than only from pricing',
        ],
        breaks: [
          'Services growth decelerating toward volume-like rates, which would end the mix shift',
          'Cross-border growth converging on domestic, removing the fee mix benefit',
          'Specialist vendors or large customers building competing fraud and identity capabilities in-house',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'Model switching revenue and value-added services as separate lines with different growth rates and different regulatory exposure. A blended revenue growth rate cannot express the thesis.' },
          { assumption: 'Revenue build-up: volume and take rate', note: 'Gross dollar volume and cross-border share are separate drivers, with cross-border carrying a higher fee. Model the mix rather than a single blended take rate.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'ma-pricing-not-adoption',
        title: 'Part of the services growth is price, and price increases run out',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The company attributes value-added services growth partly to pricing alongside the performance of security, digital and authentication solutions. That is an honest disclosure and it complicates the bull case. A services business growing 20% on adoption is compounding; one growing 20% partly on repricing existing customers is borrowing from future growth, and the customers being repriced are the same issuing banks whose interchange this network sets and who have their own margin pressure. The concentration risk is real: these are not diversified software customers, they are a small number of large financial institutions with the scale to build fraud and identity capabilities internally if the price rises far enough. Meanwhile the core switching business remains in continuing litigation with merchant groups and capped by regulation in Europe and elsewhere, so the part of the business the services growth is meant to offset is still being reset downward. If services growth decelerates toward the 9% to 10% of underlying volume while the switching take rate continues to compress, the mix shift that currently justifies the valuation stops.',
        requires: [
          'A meaningful share of services growth continuing to come from price rather than volume',
          'Customer concentration among large issuers persisting',
          'Interchange regulation and litigation continuing to compress the core take rate',
        ],
        breaks: [
          'Services growth sustaining above fifteen percent for several years with disclosed adoption rather than pricing as the driver',
          'A durable interchange settlement that stabilises the core take rate',
          'Services customer base broadening beyond the large issuing banks',
        ],
        modelLink: [
          { assumption: 'Services revenue growth: price versus volume', note: 'Split the services growth assumption into price and adoption. A model growing services at 20% indefinitely without saying which component it assumes cannot be falsified.' },
          { assumption: 'Take rate on switching revenue', note: 'Model core take rate compression from regulation and litigation explicitly, so the services mix shift is tested against a declining base rather than a flat one.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'ma-agentic-and-stablecoin-rails',
        title: 'The network is rebuilding itself for machine-initiated payments, which is a new business rather than an extension',
        side: 'STRUCTURAL',
        weight: 'SUPPORTING',
        rationale:
          'The company launched an agent payment framework in June 2026 combining agentic tokens with agent-aware identity and checkout, and supports settlement in several stablecoins with intraday and weekend cycles. These are not incremental product launches; they address a transaction whose initiating party is software rather than a person, settling on a rail the network does not own. Almost everything that makes the existing position durable — cardholder habit, merchant acceptance, a dispute and chargeback rulebook written for human error and human fraud — was designed for a different actor and does not transfer automatically. The sector dossier asks whether card networks are infrastructure or disruptable, and the honest reading of this capital allocation is that the company itself is not certain: it is buying a position on the new rails rather than assuming its incumbency extends to them. For a model this means the terminal value should state which rails it assumes, and that the metric to watch is not volume growth but the share of transactions initiated and settled outside the traditional four-party flow.',
        requires: [
          'Agent-initiated commerce developing as a genuine transaction category',
          'Stablecoin and instant settlement continuing to mature as alternatives to card settlement',
          'The network continuing to invest in presence on those rails',
        ],
        breaks: [
          'Agentic commerce remaining a small share of transactions over several years',
          'The network capturing machine-initiated transactions at fees comparable to card transactions, making the shift value-neutral',
          'Regulatory requirements that entrench the existing rails for consumer protection',
        ],
        modelLink: [
          { assumption: 'Terminal growth and terminal take rate', note: 'A terminal value on today\'s rails is an assumption, not a default. State the take rate assumed for agent-initiated and alternatively settled transactions.' },
          { assumption: 'Capex and acquisition spending', note: 'Building for new rails is an investment made from a defensive position. Model it as ongoing rather than as a one-off product cost.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Mastercard — Q1 2026 earnings release (PDF)', url: 'https://s25.q4cdn.com/479285134/files/doc_financials/2026/q1/1Q26-Mastercard-Earnings-Release.pdf' },
      { label: 'SEC EDGAR — Mastercard Q2 2026 earnings release (Form 8-K exhibit)', url: 'https://www.sec.gov/Archives/edgar/data/1141391/000114139126000081/ma06302026-exx991xearnings.htm' },
      { label: 'Investing.com — Mastercard Q2 2026 slides: value-added services drive revenue beat', url: 'https://www.investing.com/news/company-news/mastercard-q2-2026-slides-valueadded-services-drive-revenue-beat-93CH-4825542' },
      { label: 'Mastercard — Agent Pay for Machines launch', url: 'https://www.mastercard.com/us/en/news-and-trends/press/2026/june/mastercard-launches-agent-pay-for-machines.html' },
    ],
  },
  {
    ticker: 'GS',
    sector: 'Financials',
    scope: 'UNITED_STATES',
    headline:
      'Return on tangible equity of 21.3% in the March 2026 quarter on record banking and markets revenue of $12.7 billion — the cyclical half firing at once, while the asset and wealth business quietly reached a 33rd consecutive quarter of net inflows.',
    howItEarns: [
      {
        heading: 'Advising, underwriting and making markets',
        body:
          'Global banking and markets produced record revenues of $12.7 billion in the March 2026 quarter at a segment return on equity above 22%. Advisory revenues reached $1.5 billion, up 89% year on year on higher completed volumes, with the firm holding first place in merger league tables by a $150 billion lead in announced volumes. Equity underwriting was $535 million, up 45%, and debt underwriting $811 million, up 8%.',
        basis: 'REPORTED',
      },
      {
        heading: 'Markets, where financing has become the steadier half',
        body:
          'Equities revenues reached a record $5.3 billion, with equities financing at $2.6 billion, up 59%. Financing — lending against securities to institutional clients — is balance-sheet intensive and far more recurring than trading revenue, so a shift in the mix toward it makes the segment less episodic than its history suggests.',
        basis: 'REPORTED',
      },
      {
        heading: 'Asset and wealth management is the annuity being built',
        body:
          'Revenues of $4.08 billion in the March 2026 quarter, up 10%, on record management and other fees of $3.08 billion, up 14%, with assets under supervision at $3.65 trillion, up 15%, and a 33rd consecutive quarter of net inflows. Management fees recur; trading revenue does not, which is why the fee line matters more to the multiple than to the earnings.',
        basis: 'REPORTED',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds, with a partnership culture that concentrates influence among senior employees through compensation rather than through equity control. The binding external constraint is the bank capital and stress test regime.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Investing the firm\'s own capital alongside client funds in the same strategies, where allocation between the two requires governance rather than judgement alone',
        'Acting as adviser, underwriter, market maker and lender to the same clients in the same transactions',
        'Very large employee compensation claims on the revenue pool ahead of shareholders',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register and annual director elections',
        'Segment disclosure separating banking and markets from asset and wealth management, with return on equity reported by segment',
        'Bank holding company regulation including capital, liquidity and stress testing, which constrains balance sheet risk taken with shareholder capital',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Segment return on equity is disclosed, which is unusually honest',
        body:
          'Reporting a segment return on equity above 22% for banking and markets alongside a firmwide return on tangible equity of 21.3% lets an outsider see which capital is earning what. Most diversified financials disclose a firmwide return and leave the allocation opaque.',
        basis: 'REPORTED',
      },
      {
        heading: 'Compensation is a prior claim on the revenue pool',
        body:
          'In this business a very large share of revenue is paid to employees before shareholders see anything, and the ratio is a management decision taken annually. A record revenue quarter is only a record shareholder outcome if the compensation ratio holds — which makes that ratio one of the most important governance disclosures the firm makes.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'League table position that compounds into mandates',
        mechanism:
          'A board choosing an adviser for a transformational transaction selects on precedent and relationships, so leading the league tables is both the result of winning mandates and the reason for winning the next one. The position is built over decades of completed transactions and cannot be bought with price.',
        evidence: 'Advisory revenues of $1.5 billion, up 89% year on year, with first place in merger league tables by a $150 billion lead in announced volumes.',
        erodedBy: 'Independent advisory boutiques taking senior bankers and the relationships with them, which has steadily transferred share in advisory over two decades.',
        basis: 'REPORTED',
      },
      {
        label: 'Balance sheet committed to institutional financing',
        mechanism:
          'Prime brokerage and securities financing require capital, risk systems and operational infrastructure that only a few firms hold, and once a hedge fund\'s positions and financing sit with a provider, moving them is operationally costly. The relationship is stickier than trading flow and the revenue is closer to interest income than to a trading result.',
        evidence: 'Equities financing revenues of $2.6 billion, up 59% year on year, inside record equities revenues of $5.3 billion.',
        erodedBy: 'Capital requirements making balance-sheet-intensive financing uneconomic relative to providers outside the bank regime, which is the same pressure pushing lending into private credit.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Capital returned through buybacks and dividends within the regulatory regime, with the strategic capital of the past decade directed first into consumer banking and then, after that failed, into asset and wealth management. The current direction is right; the previous one was expensive.',
      good: [
        'Building asset and wealth management into a genuine annuity — record management and other fees of $3.08 billion, up 14%, on $3.65 trillion of assets under supervision and a 33rd consecutive quarter of net inflows',
        'Growing equities financing revenue 59% to $2.6 billion, shifting the markets mix toward recurring balance-sheet income and away from episodic trading',
        'Retaining the advisory franchise through a period when independent boutiques were taking share, and converting it into $1.5 billion of revenue up 89% when volumes returned',
      ],
      bad: [
        'The consumer banking venture consumed several years of capital, management attention and credit losses before being substantially wound down and sold in pieces — the clearest capital allocation failure in the firm\'s recent history, and one made from a position of strength rather than necessity',
        'Balance sheet investments alongside clients in the firm\'s own funds tied up capital at low returns and produced earnings volatility that the market discounted, which is why the firm has been reducing them',
        'Compensation takes a very large share of revenue before shareholders, so a record revenue quarter converts to shareholder value only at management\'s discretion over the compensation ratio',
        'Buybacks are executed most freely when earnings are at a cyclical peak and the shares are expensive, and are restricted by the regulator when they are cheap — a structural mistiming that every large bank shares and that a high-beta earnings stream makes worse here',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Both halves of the sector inside one firm',
        body:
          'The United States Financials dossier separates balance-sheet lenders from toll-takers on flows. This firm is unusual in being both: banking and markets is a capital-intensive cyclical business, while asset and wealth management is a fee annuity on $3.65 trillion. The valuation question is how much of each the market is paying for.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Private-market mix, from the manager\'s side',
        body:
          'The dossier names passive fee deflation and private-market mix as a mixed driver. Management fees growing 14% to a record $3.08 billion while assets grew 15% means the blended fee rate held roughly flat — which in a sector experiencing fee deflation implies the mix is shifting toward higher-fee alternatives.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Advisory and underwriting revenue is a transaction cycle',
        body:
          'Advisory revenue up 89% and equity underwriting up 45% reflect a strong completion environment. Those lines can halve in two quarters if boards stop transacting, and the cost base — principally people — does not fall as quickly as the revenue does.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Capital rules that penalise balance-sheet-intensive financing',
        body:
          'Equities financing at $2.6 billion is the steadier half of markets revenue and it consumes capital. A capital regime that raises the cost of holding those assets makes the business less economic relative to providers outside the bank perimeter, which is the same force moving lending into private credit.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A 21.3% return on tangible equity is a cyclical peak, not a run rate',
        body:
          'Both halves of banking and markets performing at once — record equities, record segment revenue, advisory up 89% — is what a good year looks like. Extrapolating a peak return on tangible equity through a projection horizon is the single most common error in valuing this firm.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'gs-annuity-inside-the-cycle',
        title: 'The fee annuity is being built while the cyclical half is paying for it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Asset and wealth management produced record management and other fees of $3.08 billion, up 14%, within segment revenues of $4.08 billion, on assets under supervision of $3.65 trillion, up 15%, and a 33rd consecutive quarter of net inflows. Eight years of uninterrupted inflows is not a cycle; it is a franchise. And the fee rate held roughly flat while assets grew, which in a sector the dossier describes as experiencing passive fee deflation means the mix is moving toward higher-fee alternatives. Alongside it, the markets business is becoming steadier in a way its history does not suggest: equities financing revenue of $2.6 billion grew 59%, and financing is balance-sheet income against institutional positions rather than episodic trading. So the two most durable revenue lines in the firm are both compounding, funded by a cyclical banking and markets business earning a segment return on equity above 22%. As the recurring share rises, the earnings deserve a different multiple than a pure transaction house — and that revaluation happens slowly, which is what makes it available.',
        requires: [
          'Net inflows into asset and wealth management continuing, extending the eight-year sequence',
          'Management fee rate holding as assets grow, implying continued mix shift toward alternatives',
          'Equities financing revenue remaining a growing share of markets revenue',
        ],
        breaks: [
          'Net outflows in asset and wealth management, ending the sequence that makes it an annuity',
          'Management fees growing materially slower than assets, indicating fee deflation has reached the mix',
          'Financing revenue shrinking as capital rules make the balance sheet use uneconomic',
        ],
        modelLink: [
          { assumption: 'Segment shares and margins', note: 'Model asset and wealth management on fee rate multiplied by assets, and banking and markets on a transaction cycle. They deserve different growth rates and arguably different discount rates.' },
          { assumption: 'Terminal growth', note: 'A fee annuity on $3.65 trillion supports a different terminal assumption from advisory revenue. State which segment the terminal value is describing.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'gs-peak-is-not-a-run-rate',
        title: 'A 21.3% return on tangible equity is what both halves firing at once looks like',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The March 2026 quarter delivered return on equity of 19.8%, return on tangible equity of 21.3%, record global banking and markets revenue of $12.7 billion at a segment return above 22%, record equities revenue of $5.3 billion, advisory revenue up 89% on higher completed volumes, and equity underwriting up 45%. Every one of those is a good number and several are records, which is precisely the problem with using them as a base. Advisory revenue rises 89% because boards decided to transact, and boards stop deciding to transact with very little notice; equity underwriting follows the same switch. Meanwhile the largest cost — compensation — is set as a share of revenue and falls more slowly than revenue does, so the operating leverage that makes a peak so good works in reverse. There is also a capital dimension: buybacks are permitted most freely at the peak, when the shares are expensive, and restricted by the regulator in a downturn, when they are cheap. A projection that carries a 21% return on tangible equity through a five-year horizon has assumed that the transaction cycle does not exist.',
        requires: [
          'Advisory and underwriting revenue remaining cyclical rather than becoming recurring',
          'Compensation remaining a large, slow-adjusting share of revenue',
          'The current completion environment reflecting unusually favourable conditions',
        ],
        breaks: [
          'Return on tangible equity sustaining above the high teens through a weak transaction year',
          'The recurring share of revenue — management fees plus financing — growing large enough to carry the return through a downturn',
          'Compensation ratio proving genuinely variable, falling proportionally with revenue',
        ],
        modelLink: [
          { assumption: 'Revenue growth path', note: 'Advisory at +89% and equity underwriting at +45% are cyclical highs. Build the path from a mid-cycle transaction environment and show the peak and trough as a range.' },
          { assumption: 'Compensation as a share of revenue', note: 'This is the largest cost and it is set annually as a ratio. Model it explicitly, and test what a 30% revenue decline does when compensation falls by less.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'gs-two-businesses-one-capital-base',
        title: 'A transaction house and a fee annuity share one capital base and one discount rate, which cannot both be right',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'The firm reports a segment return on equity above 22% for global banking and markets and separately an asset and wealth management business earning management fees of $3.08 billion on $3.65 trillion of assets under supervision. These are not variations of one business. Banking and markets is capital-intensive, cyclical, regulated for solvency, and its revenue depends on client transaction decisions; asset and wealth management is capital-light, recurring, and its revenue depends on asset levels and flows. Applying a single cost of equity to both understates the risk of the first and overstates it for the second, and applying a single terminal growth rate assumes the transaction cycle and the flow annuity converge, which they do not. The firm helps by disclosing segment return on equity, which most diversified financials do not. The modelling instruction is to build a sum of the parts: capital-weighted returns for banking and markets against a cyclical revenue path, and a fee-rate-times-assets model for asset and wealth management at a lower discount rate — then check what the market is paying for each half rather than for a blended firm.',
        requires: [
          'Segment disclosure continuing to separate the two businesses with their own returns',
          'The businesses remaining operationally and economically distinct',
        ],
        breaks: [
          'A reorganisation merging the reported segments, removing the basis for a sum of the parts',
          'The asset management business becoming materially balance-sheet intensive, converging with banking and markets',
        ],
        modelLink: [
          { assumption: 'WACC and cost of equity', note: 'A cyclical capital-intensive segment and a fee annuity do not share a cost of equity. State whether the single rate is a simplification and what the two-part version implies.' },
          { assumption: 'Capital allocated by segment', note: 'Segment return on equity above 22% is disclosed. Use the allocated capital to build the parts, rather than applying a firmwide return to a firmwide equity base.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'SEC EDGAR — Goldman Sachs 1Q26 earnings results (Form 8-K)', url: 'https://www.sec.gov/Archives/edgar/data/886982/000088698226000096/a1q26gsearningsresultspr.htm' },
      { label: 'SEC EDGAR — Goldman Sachs 2Q26 earnings results (Form 8-K)', url: 'https://www.sec.gov/Archives/edgar/data/0000886982/000088698226000294/a2q26gsearningsresults.htm' },
      { label: 'Goldman Sachs — First quarter 2026 earnings results presentation (PDF)', url: 'https://www.goldmansachs.com/pressroom/press-releases/current/pdfs/2026-q1-earnings-results-presentation.pdf' },
      { label: 'CNBC — Goldman Sachs tops estimates on record equities trading', url: 'https://www.cnbc.com/2026/04/13/goldman-sachs-gs-earnings-1q-2026.html' },
      { label: 'Motley Fool — Goldman Sachs Q1 2026 earnings transcript', url: 'https://www.fool.com/earnings/call-transcripts/2026/04/13/goldman-sachs-gs-q1-2026-earnings-transcript/' },
    ],
  },

  {
    ticker: 'BLK',
    sector: 'Financials',
    scope: 'UNITED_STATES',
    headline:
      '$13.89 trillion under management with $135.9 billion of long-term net inflows in a quarter — and roughly $30 billion spent buying private markets businesses because the index business that built the firm cannot charge enough.',
    howItEarns: [
      {
        heading: 'A basis-point fee on other people\'s assets',
        body:
          'Assets under management reached a record $13.89 trillion by the end of the March 2026 quarter, up from $11.6 trillion a year earlier, with $135.9 billion of long-term net inflows in the quarter. Revenue is a fee rate applied to those assets, so it grows with markets, with flows, and with mix — and the mix is the part management can influence.',
        basis: 'REPORTED',
      },
      {
        heading: 'The index business is enormous and cheap',
        body:
          'The exchange-traded and index franchise is the largest in the world and charges single-digit to low double-digit basis points. It compounds reliably and it is subject to continuous fee compression, which is why asset growth and revenue growth diverge and why the private-markets acquisitions were made.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Private markets and data are the acquired higher-fee businesses',
        body:
          'An infrastructure manager closed in late 2024, a data and analytics business in March 2025 and a private credit manager in January 2026 — the latter two contributing approximately $230 million and $65 million to first-quarter revenue respectively. Private credit assets are now roughly $220 billion, placing the firm among the three largest platforms in the world.',
        basis: 'REPORTED',
      },
      {
        heading: 'Technology is sold to the rest of the industry',
        body:
          'A risk and portfolio management platform is licensed to other asset owners and managers as subscription software. It is a different revenue stream from asset management fees — recurring, not market-linked — and it embeds the firm inside competitors\' operations.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'No controlling shareholder. Ownership is dispersed across institutions and index funds following the exit of the bank and insurer stakes that were held after earlier transactions. The firm\'s influence over the companies it invests in on clients\' behalf is a governance subject in its own right, distinct from its own ownership.',
      voting: 'Single class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Voting shares in thousands of companies on behalf of clients, including companies that are also clients of the firm\'s technology or advisory businesses',
        'Selling a risk platform to competitors who are also counterparties and, in some cases, distribution partners',
        'Managing both index funds and high-fee private strategies for the same institutional clients, where allocation advice touches the firm\'s own product economics',
      ],
      minorityProtections: [
        'Single voting class with a dispersed register and annual director elections',
        'Disclosure of assets under management, flows and base fee rates by product category, which is what makes the fee mix shift measurable',
        'Investment stewardship reporting and, increasingly, client-directed voting arrangements that separate the firm\'s influence from its clients\' economic ownership',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Flows and fee rates are disclosed separately, which is the honest scorecard',
        body:
          'Reporting $135.9 billion of long-term net inflows alongside total assets of $13.89 trillion, and naming the revenue contribution of individual acquisitions — approximately $230 million and $65 million in a quarter — lets an outsider separate market appreciation from flows from acquired revenue. Those three drivers look identical in an asset total and are completely different in quality.',
        basis: 'REPORTED',
      },
      {
        heading: 'The stewardship question is a governance issue for the whole market',
        body:
          'A manager voting shares in most large listed companies on behalf of clients holds influence that its own shareholders did not pay for and that its clients did not necessarily delegate. The firm\'s move toward client-directed voting is a response to that, and it is the rare governance topic where the company is the subject rather than the object.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Scale in index products that lowers cost per dollar managed',
        mechanism:
          'Running an index fund has largely fixed costs, so the largest manager has the lowest cost per dollar and can price below competitors while earning more. Liquidity in the largest exchange-traded funds is itself self-reinforcing, because institutional traders choose the most liquid vehicle regardless of a marginal fee difference.',
        evidence: 'Assets reaching $13.89 trillion, up from $11.6 trillion a year earlier, with $135.9 billion of long-term net inflows in a single quarter.',
        erodedBy: 'Fee compression toward zero on core index exposure, which removes the revenue even as the assets stay — the scale advantage protects the share and not the economics.',
        basis: 'REPORTED',
      },
      {
        label: 'A risk platform embedded in clients\' and competitors\' operations',
        mechanism:
          'Once an institution runs its portfolio construction, risk reporting and operations on a platform, replacing it means re-implementing the workflow of the whole investment organisation. That cost falls on the customer and is measured in years, which is why the revenue is subscription-like rather than market-linked.',
        evidence: 'A technology platform licensed to asset owners and managers across the industry, producing recurring revenue independent of the firm\'s own asset levels.',
        erodedBy: 'Cloud-native competitors unbundling portfolio, risk and operations into components that can be replaced one at a time rather than all at once.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Distribution reach that makes an acquired strategy immediately sellable',
        mechanism:
          'A private credit or infrastructure strategy acquired by this firm reaches a global institutional and wealth distribution network on day one, so the same fund raises more capital under this roof than it could independently. That is a genuine synergy rather than a cost saving, and it is what the acquisition premiums were paid for.',
        evidence: 'Acquired businesses contributing approximately $230 million and $65 million of revenue in the first quarter after closing, with private credit assets of roughly $220 billion.',
        erodedBy: 'Wealth platforms and consultants disintermediating manager distribution, and private-market performance disappointing enough that the distribution advantage has nothing worth distributing.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Roughly $30 billion of acquisitions in about eighteen months to buy into private markets and private data, funded with stock and cash, alongside a consistent dividend and buyback. It is the largest strategic bet in the firm\'s history and the returns are not yet demonstrable.',
      good: [
        'Recognising that index fee compression caps the revenue of the world\'s largest asset gatherer, and acting on it at scale rather than defending the existing mix',
        'Acquiring a data and analytics business alongside the managers, which supplies the private-market pricing and benchmarking information the strategies need — a genuinely complementary purchase rather than another pool of assets',
        'Building to roughly $220 billion of private debt and one of the three largest private credit platforms in the world, in the part of the market taking share from bank balance-sheet lending',
      ],
      bad: [
        'Roughly $30 billion spent on private markets businesses in about eighteen months, at a point when private credit and infrastructure valuations reflected several years of exceptional fundraising — the sector dossier names buying growth at the top for an asset manager as a specific failure mode, and this is the largest current example of it',
        'The acquired businesses contributed approximately $230 million and $65 million to a single quarter\'s revenue, which against the purchase prices is a return that will take years to establish and which no disclosed figure yet confirms',
        'Private credit is the asset class most exposed to a credit cycle that has not yet been tested at this size, and the firm has concentrated its largest strategic bet in it while also holding the largest index franchise — so a simultaneous equity drawdown and credit deterioration would hit both halves',
        'Paying partly in stock to acquire higher-fee assets transfers ownership of the low-fee compounding franchise to the sellers of the high-fee businesses, which is the right trade only if the private-market fee rates persist',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The dossier\'s fee-deflation driver, and the response to it',
        body:
          'The United States Financials dossier names passive fee deflation and private-market mix as a mixed driver. This firm is where both sides of that driver meet: it owns the largest passive franchise, whose fees compress, and it has spent roughly $30 billion buying the private-market businesses whose fees do not.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A toll-taker on flows rather than a balance-sheet lender',
        body:
          'The dossier separates lenders from toll-takers on payments and asset flows whose earnings barely touch rates and credit. This is the largest toll-taker on asset flows — with the qualification that a $220 billion private credit book reintroduces exactly the credit exposure the category was supposed to avoid, albeit on clients\' capital rather than its own.',
        basis: 'INTERPRETATION',
      },
    ],
    keyRisks: [
      {
        heading: 'Fee compression outrunning asset growth',
        body:
          'Assets grew from $11.6 trillion to $13.89 trillion, but revenue grows only with the fee rate applied to them. Continued compression in core index products means the firm must keep shifting mix toward alternatives simply to hold revenue growth level — which is why the acquisitions were necessary rather than opportunistic.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A private credit cycle that has not been tested at this scale',
        body:
          'Roughly $220 billion of private debt in a market that has grown enormously without a full default cycle. Losses would fall on clients rather than on the firm\'s balance sheet, but they would stop the flows, compress the fee rate and impair the goodwill paid for the platform.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Market level is the largest single driver of revenue',
        body:
          'A fee on $13.89 trillion means a market decline reduces revenue immediately and proportionally, with no offset. An asset manager\'s earnings are a levered claim on market levels, and a model that grows assets at a steady rate has embedded an equity market forecast without stating it.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'blk-mix-shift-was-necessary',
        title: 'The $30 billion of acquisitions was not opportunism, it was the only answer to fee compression',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Assets under management reached $13.89 trillion, up from $11.6 trillion a year earlier, with $135.9 billion of long-term net inflows in a single quarter. That growth is real and it is also the problem: the bulk of it sits in index products charging single-digit basis points, where the fee rate compresses every year. A manager at this scale cannot grow revenue by gathering more low-fee assets — the arithmetic has run out. The acquisitions answer that directly: an infrastructure manager, a private credit manager and a private-markets data business, closing between late 2024 and January 2026, with the latter two contributing approximately $230 million and $65 million of revenue in the first quarter after closing and private credit assets reaching roughly $220 billion. The distribution advantage is what makes them worth more here than standalone: a strategy acquired by this firm reaches global institutional and wealth channels immediately. And the data acquisition supplies the pricing and benchmarking that private markets have always lacked, which is a capability rather than another pool of assets.',
        requires: [
          'Private-market fee rates holding well above index fee rates',
          'Acquired strategies raising materially more capital through the firm\'s distribution than they would independently',
          'Long-term net inflows continuing across both the index and alternative franchises',
        ],
        breaks: [
          'Private-market fee rates compressing toward traditional active levels as capital floods in',
          'Acquired revenue failing to scale beyond the initial contribution, indicating the distribution synergy is not materialising',
          'Net outflows in alternatives, which would remove the mix shift the acquisitions were bought to produce',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: assets and fee rate', note: 'Model assets and blended fee rate separately, and split the fee rate by product category. Revenue growth in this business is a mix question, not an asset growth question.' },
          { assumption: 'Segment shares and margins', note: 'Index, active, alternatives and technology have very different fee rates and margins. A single blended fee applied to $13.89 trillion cannot express the entire strategy.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'blk-bought-growth-at-the-top',
        title: 'Roughly $30 billion spent on private markets after the best fundraising years in their history',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The sector dossier names buying growth at the top for an asset manager as a specific failure mode, and this is the largest live example. Three acquisitions closed between late 2024 and January 2026 for roughly $30 billion in aggregate, into private credit and infrastructure — asset classes whose valuations at the time reflected several years of exceptional fundraising and no completed default cycle. The disclosed return so far is approximately $230 million and $65 million of quarterly revenue from two of them, which against those prices is a figure that establishes nothing yet in either direction. The concentration is the concern: roughly $220 billion of private debt makes this one of the three largest platforms in the world in the asset class most exposed to a credit cycle that has not been tested at current size. Losses would fall on clients rather than the firm, but the consequence for the firm is worse than a mark: flows stop, the fee rate compresses and the goodwill paid for the platform is impaired. And because part of the consideration was stock, the low-fee compounding franchise was partly handed to the sellers of the high-fee businesses — a trade that only works if private-market fee rates persist.',
        requires: [
          'Private credit and infrastructure valuations having been at or near a cyclical high when acquired',
          'The credit cycle in private lending remaining untested at current scale',
          'Acquired revenue contribution remaining modest relative to the consideration paid',
        ],
        breaks: [
          'Acquired revenue and margin scaling to a demonstrable return on the roughly $30 billion within a few years',
          'Private credit passing through a full default cycle with losses in line with underwriting assumptions',
          'Private-market fee rates holding as capital continues to flow in',
        ],
        modelLink: [
          { assumption: 'Goodwill and intangibles on the balance sheet', note: 'Roughly $30 billion of acquisitions created a large goodwill balance allocated to private-market units. State whether the projection carries it, and test an impairment scenario against a credit downturn.' },
          { assumption: 'Shares outstanding', note: 'Part of the consideration was stock. A per-share valuation must reflect the dilution as well as the acquired revenue, and the two do not arrive on the same schedule.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'blk-revenue-is-a-market-forecast',
        title: 'A fee on $13.89 trillion means the revenue line is an equity market forecast',
        side: 'STRUCTURAL',
        weight: 'CORE',
        rationale:
          'Three different things move assets under management, and they look identical in the total: market appreciation, net flows and acquisitions. In the March 2026 quarter the firm disclosed all three separately — assets at $13.89 trillion against $11.6 trillion a year earlier, $135.9 billion of long-term net inflows in the quarter, and approximately $230 million and $65 million of revenue from two acquired businesses. Only the flows are evidence of franchise strength; market appreciation is a claim on the level of global equity and credit markets, and acquired assets were purchased. For a valuation the consequence is that growing assets at a steady rate through a projection embeds an equity market forecast that the model never states and cannot defend, and that the fee rate — which compresses in index products and is higher in alternatives — has to be modelled separately from the asset level or the revenue will be wrong in both directions. The right structure is assets built from flows, market return and acquisitions as three explicit assumptions, multiplied by a fee rate built from product mix. Anything simpler is a market call wearing a company\'s name.',
        requires: [
          'Disclosure continuing to separate flows, market movement and acquired assets',
          'Revenue remaining predominantly a fee on asset levels rather than performance fees or subscriptions',
        ],
        breaks: [
          'Technology subscription revenue growing large enough that a material share of revenue is independent of market levels',
          'A shift toward performance-based fees that would change the relationship between assets and revenue',
        ],
        modelLink: [
          { assumption: 'Revenue build-up: volume growth', note: 'Build assets from three separate drivers — net flows, market return and acquisitions. A single asset growth rate silently contains an equity market forecast.' },
          { assumption: 'Fee rate by product', note: 'Index fees compress and alternative fees do not. Model the blended rate as an output of the product mix, not as an input, or the mix-shift strategy is invisible.' },
        ],
        conviction: 'HIGH',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'BlackRock — First quarter 2026 earnings release (PDF)', url: 'https://s24.q4cdn.com/856567660/files/doc_financials/2026/Q1/BLK-1Q26-Earnings-Release.pdf' },
      { label: 'StockTitan — BlackRock Q1 2026 profit with higher fees and $13.9T AUM (Form 8-K)', url: 'https://www.stocktitan.net/sec-filings/BLK/8-k-black-rock-inc-reports-material-event-6cb2a32ffcb4.html' },
      { label: 'Yahoo Finance — BlackRock Q1 2026 earnings call summary', url: 'https://finance.yahoo.com/markets/stocks/articles/blackrock-inc-q1-2026-earnings-204639703.html' },
      { label: 'CT Acquisitions — BlackRock private credit: 2026 overview of GIP and HPS', url: 'https://ctacquisitions.com/blackrock-private-credit/' },
    ],
  },
];
