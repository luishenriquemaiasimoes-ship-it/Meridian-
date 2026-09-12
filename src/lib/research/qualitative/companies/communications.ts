import type { CompanyQualitative } from '../types';

export const COMMUNICATIONS: CompanyQualitative[] = [
  {
    ticker: 'GOOGL',
    sector: 'Communication Services',
    scope: 'GLOBAL',
    headline:
      'About to be overtaken in advertising revenue for the first time, ruled a monopolist in both search and ad tech, and facing an interface change that removes ad inventory while raising cost per query — with founder control that makes none of it contestable by shareholders.',
    howItEarns: [
      {
        heading: 'An auction on intent, which is the best advertising inventory ever created',
        body:
          'A search query states what someone wants, and the ad next to it is sold by auction to whoever bids most for that intent. The company does not set prices; it improves targeting so advertisers bid more for the same impression. Cloud and subscriptions add revenue that does not depend on the auction.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Distribution paid for, not won',
        body:
          'Default placement on browsers and devices is purchased through traffic acquisition payments, which is a very large cost and the thing the antitrust remedies are aimed at. Search share is partly a commercial arrangement rather than purely a product outcome.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Founder-controlled through a share class structure. Class B shares carry ten votes and are held by the founders, giving them voting control despite a much smaller economic stake; Class C shares carry no vote at all.',
      voting:
        'Three classes: A with one vote, B with ten votes held by founders, C with none. Most public shareholders own economics with no vote or a diluted one.',
      relatedPartyExposure: [
        'Founders with voting control and no requirement to agree with other shareholders on capital allocation',
        'Traffic acquisition payments to device and browser partners, which are both a cost and the subject of antitrust remedy',
        'Very large capital commitments to AI infrastructure decided without shareholder approval',
      ],
      minorityProtections: [
        'SEC reporting obligations and segment disclosure including cloud profitability',
        'Class A voting rights, which are diluted rather than absent',
        'Antitrust oversight, which is currently a more effective constraint on the company than its shareholder base is',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Dual-class control means the capital programme is not contestable',
        body:
          'Founders holding ten-vote shares can commit tens of billions to infrastructure without any realistic prospect of shareholder objection. That was an advantage when it funded long-horizon bets that worked. It is a liability when the return on the current capital programme is unmeasured, because the mechanism that would normally force disclosure does not exist here.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Two monopoly findings and the remedy is the open question',
        body:
          'Federal courts have found monopoly power in search and in ad tech. Liability is settled; the consequence is not. Conduct restrictions on default placements and unbundling of the ad tech stack change the economics materially without breaking the company, while structural separation would change them permanently. This is a live legal outcome, not a background risk factor.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Query volume feeding a ranking system that improves with use',
        mechanism:
          'Every search teaches the ranking and ad models what people actually want, and no competitor sees comparable query volume. The advantage compounds because better results attract more queries, which produce better results.',
        evidence: 'Revenue per impression and advertiser retention sustained while share of global digital advertising remained the largest.',
        erodedBy: 'Users asking questions of conversational systems instead of searching, which redirects the query volume the loop depends on.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Custom silicon and infrastructure at a cost competitors rent',
        mechanism:
          'Designing its own accelerators and operating its own data centres lowers the cost per unit of compute relative to competitors buying merchant hardware and cloud capacity.',
        evidence: 'Cloud gross margins and AI serving capability achieved alongside a very large internal compute requirement.',
        erodedBy: 'Merchant accelerator performance advancing faster than in-house designs, which would make the vertical integration a cost rather than a saving.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Enormous infrastructure spending, very large buybacks, and a recently initiated dividend. The buybacks and the cloud build have been defensible; the scale of the AI capital programme is being committed without a published return measure, and founder control means no one can insist on one.',
      good: [
        'Building cloud into a genuine third business with disclosed profitability, which diversified away from the advertising auction',
        'Sustained buybacks that have reduced the share count meaningfully, plus a dividend initiation',
      ],
      bad: [
        'Capital spending on AI infrastructure at a scale with no published return metric, in a governance structure where shareholders cannot compel one',
        'A long history of product ventures launched and abandoned, which consumed capital and management attention without a return',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Being overtaken in advertising revenue for the first time',
        body:
          'eMarketer projects Meta ad revenue at $243.5 billion in 2026 against Google\'s $239.5 billion, the first time Meta is ahead, on growth of 24.1% versus 11.9%. The gap is attributed to automated, AI-driven campaign products rather than to price.',
        basis: 'REPORTED',
      },
      {
        heading: 'Retail media is taking the budget most tied to conversion',
        body:
          'Retail media networks reached $62 billion globally growing 26.1%, and they can prove the sale in a way search cannot. That competes for exactly the performance budgets search has historically owned.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Conversational answers removing inventory while raising cost',
        body:
          'A results page monetises by placing ads beside links. A generated answer has far less ad inventory and costs materially more per query to produce. The threat operates on revenue per query and cost per query simultaneously, and it applies most to the company with the most to lose.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Antitrust remedies on default placement and the ad stack',
        body:
          'Unbundling the ad tech stack or restricting paid default placements changes the economics of the business without any product change. Both are live remedy options after findings of liability.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'googl-cloud-and-silicon',
        title: 'The second business is real, and the infrastructure that funds AI also sells it',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The advertising business is under genuine pressure from three directions, and the company has built something else: a cloud business with disclosed profitability, running on custom silicon and owned data centres that lower the cost per unit of compute below what competitors renting merchant hardware pay. The same infrastructure that makes the AI capital programme look alarming is the infrastructure that monetises AI demand for third parties. If cloud continues compounding at scale with improving margins, the enterprise is less dependent on the search auction than the sector multiple assumes.',
        requires: [
          'Cloud revenue continues growing with improving disclosed margins',
          'Custom silicon maintains a cost advantage over merchant accelerators',
          'Search revenue declines slowly enough that cloud growth offsets it',
        ],
        breaks: [
          'Merchant accelerators advancing enough that in-house silicon becomes a cost disadvantage',
          'Cloud margin compression from competition for AI workloads',
          'Search revenue declining faster than cloud can offset',
        ],
        modelLink: [
          { assumption: 'Segment revenue and margins', note: 'Model search, cloud and other separately with their own growth and margins. Blended, the diversification argument cannot be tested.' },
          { assumption: 'Capex path', note: 'The AI capital programme is enormous. Test the return on it explicitly rather than treating it as maintenance capex.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'googl-inventory-and-remedy',
        title: 'Fewer ad slots, higher cost per query, and a court deciding the rest',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Three things point the same way at once. A conversational interface has far less ad inventory than a results page and costs more per query to serve, so revenue per query falls while cost rises. Meta is projected to pass the company in advertising revenue in 2026 on twice the growth rate, and retail media at $62 billion is taking the performance budgets search owned. And courts have found monopoly power in both search and ad tech, with remedies on default placement and stack unbundling still to be decided. Founder voting control means shareholders cannot compel disclosure of the one number that would settle the argument.',
        requires: [
          'Conversational query behaviour continues displacing traditional search sessions',
          'Remedies constrain default placements or require ad stack separation',
          'Competitive share loss to social and retail media continues',
        ],
        breaks: [
          'Conversational interfaces proving to sit closer to purchase intent and monetising better than links did',
          'Remedies limited to disclosure or conduct terms that leave the economics intact',
          'Advertising share stabilising as automated campaign products close the gap to competitors',
        ],
        modelLink: [
          { assumption: 'Revenue driver — paid clicks and cost per click', note: 'Model query volume, ad inventory per query and price separately. The thesis is that the middle term falls.' },
          { assumption: 'Gross margin / cost of revenue', note: 'Inference cost lands in cost of revenue. Rising cost per query with falling inventory is a margin thesis, not only a revenue one.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'The Next Web / eMarketer — Meta set to overtake Google in ad revenue in 2026', url: 'https://thenextweb.com/news/meta-surpass-google-digital-ad-revenue-emarketer-2026' },
      { label: 'Digital Applied — Meta overtakes Google: 2026 budget readout', url: 'https://www.digitalapplied.com/blog/meta-overtakes-google-ad-revenue-2026-budget-readout' },
      { label: 'eMarketer — US ad spending 2026', url: 'https://www.emarketer.com/content/us-ad-spending-2026' },
      { label: 'The Current — marketers on AI, retail media and streaming in 2026', url: 'https://www.thecurrent.com/innovation/culture-marketers-predict-streaming-measurement-ai-retail-2026' },
    ],
  },

  {
    ticker: 'META',
    sector: 'Communication Services',
    scope: 'GLOBAL',
    headline:
      'Projected to pass Google in advertising revenue in 2026 for the first time, growing at twice the rate, because automated campaign products made advertisers bid more — and run by a founder whose voting control makes the capital programme unchallengeable.',
    howItEarns: [
      {
        heading: 'Attention aggregated, then auctioned with better prediction',
        body:
          'Billions of users across several apps generate impressions sold by auction. The company raises revenue not by charging more but by predicting better: automated campaign products take targeting, creative selection and bidding from the advertiser, improve the return on spend, and the advertiser responds by bidding more for the same inventory.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Messaging and commerce are the monetisation still ahead',
        body:
          'Business messaging and click-to-message advertising monetise conversations rather than feeds, particularly in markets where messaging is the primary interface. It is the largest untapped surface the company owns and it is early.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Founder-controlled through a dual-class structure in which Class B shares carry ten votes. The founder holds a majority of the voting power with a far smaller economic stake, so control is absolute and permanent while he holds the shares.',
      voting: 'Class A one vote, Class B ten votes held by the founder and insiders. Public shareholders own the economics and cannot outvote the founder on anything.',
      relatedPartyExposure: [
        'A founder with majority voting control committing very large capital to projects of his own choosing',
        'Reality Labs spending decided without any realistic prospect of shareholder objection',
      ],
      minorityProtections: [
        'SEC reporting obligations, including separate disclosure of Reality Labs losses',
        'Regulatory oversight, which is a more effective constraint than the shareholder base',
        'Class A economic rights and the buyback programme, which returns capital regardless of voting power',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Absolute founder control, with a metaverse bill to show what it costs',
        body:
          'Majority voting power let the founder commit tens of billions to Reality Labs against sustained shareholder objection, producing losses disclosed quarterly with no path to profitability shown. The same control let him pivot hard to AI infrastructure and to efficiency when the share price demanded it. Control is not the problem; unaccountable capital allocation is, and the company has demonstrated both the cost and the benefit.',
        basis: 'REPORTED',
      },
      {
        heading: 'Disclosing the loss-making segment separately is genuinely useful',
        body:
          'Reporting Reality Labs losses as their own segment lets shareholders value the advertising business without them, which is more transparency than most conglomerate structures offer. It also makes the scale of the bet impossible to hide, which is presumably why the market re-rated when the spending was capped.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Prediction quality on first-party behavioural data',
        mechanism:
          'Logged-in users across several apps produce behavioural data that trains ranking and ad models. Better prediction raises the advertiser\'s return, which raises what they bid, which funds more prediction. Privacy restrictions on cross-app identifiers remove competitors\' data rather than this company\'s.',
        evidence: 'Advertising revenue growing 24.1% in 2026 against Google\'s 11.9%, attributed to automated campaign products rather than price increases.',
        erodedBy: 'Regulatory limits on using first-party data across apps, and a shift of attention to platforms outside the family.',
        basis: 'REPORTED',
      },
      {
        label: 'Network effects across multiple apps at global scale',
        mechanism:
          'Several apps each with over a billion users, cross-promoting and sharing infrastructure, make the advertiser\'s reach unmatched and the user\'s exit costly because the social graph lives there.',
        evidence: 'A combined share of global digital advertising ex-China that, with two competitors, reached 54.7% and is forecast at 56.2% in 2026.',
        erodedBy: 'Attention shifting to newer platforms, and antitrust action limiting the ability to acquire or integrate them.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Very large buybacks and a dividend alongside an enormous AI infrastructure programme, after a period of metaverse spending that the market rejected and the founder eventually capped. The record is of very good core reinvestment and one extremely expensive conviction bet.',
      good: [
        'Investing in automated advertising products, which is the clearest case in the market of AI producing revenue rather than consuming capital',
        'Capping the metaverse spending trajectory and returning capital aggressively once the market revolted',
      ],
      bad: [
        'Tens of billions committed to Reality Labs with sustained losses and no demonstrated path to a return',
        'An AI capital programme now at a scale where the depreciation alone is material, again without a published return measure',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Taking the lead in advertising on automation, not price',
        body:
          'Revenue projected at $243.5 billion in 2026 against Google\'s $239.5 billion, on 24.1% growth versus 11.9%. The mechanism is automated campaign products raising advertiser return on spend, which is the cleanest example in the market of AI translating directly into revenue.',
        basis: 'REPORTED',
      },
      {
        heading: 'Concentration is increasing, which invites the response',
        body:
          'Three companies took 54.7% of global digital advertising ex-China, forecast to reach 56.2% in 2026. Concentration at that level in an industry where a court has already found monopoly power at a peer is an invitation to regulatory attention.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Capital committed to AI infrastructure with no return measure',
        body:
          'The spending is enormous, the assets depreciate over a handful of years, and no return metric is published. Founder voting control means shareholders cannot compel one, and the metaverse precedent shows how far that can run.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Regulatory limits on first-party data across apps',
        body:
          'The prediction advantage rests on combining behavioural data across several apps. A regulatory requirement to separate that data attacks the moat directly rather than the revenue.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'meta-ai-monetisation',
        title: 'The clearest case of AI producing revenue rather than consuming capital',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Most companies describe AI as a future benefit. Here the mechanism is already in the revenue line: automated campaign products take bidding and targeting from the advertiser, raise their measured return on spend, and the advertiser bids more for the same impression. That is why revenue is projected to grow 24.1% in 2026 against a direct competitor\'s 11.9% and to pass it in absolute terms for the first time. No price increase was announced and none was needed, and privacy restrictions on cross-app identifiers have removed competitors\' data rather than this company\'s.',
        requires: [
          'Automated campaign products continue improving advertiser return on spend',
          'First-party data across the app family remains available for prediction',
          'Attention across the app family holds against newer platforms',
        ],
        breaks: [
          'Regulatory separation of data between apps, which attacks the prediction advantage directly',
          'Advertiser return on spend plateauing, which ends the bid escalation',
          'Attention shifting to platforms outside the family faster than they can be matched',
        ],
        modelLink: [
          { assumption: 'Revenue driver — impressions and revenue per impression', note: 'Model impressions and price per impression separately. The thesis is entirely in the second term rising without a price increase.' },
          { assumption: 'Segment margins', note: 'Model Reality Labs separately. The advertising business is worth more than the consolidated margin suggests.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'meta-unaccountable-capital',
        title: 'A founder with absolute voting control and no published return on the capital programme',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The metaverse is the worked example: tens of billions committed against sustained shareholder objection, losses disclosed quarterly, no path to a return demonstrated, and no mechanism for shareholders to stop it because the founder holds majority voting power. The AI infrastructure programme is now larger, the assets depreciate over a handful of years, and again there is no published return measure. An advertising business generating this much cash can fund an enormous mistake for a long time, and the governance structure removes the constraint that would normally surface it. The tell is depreciation growth against revenue growth.',
        requires: [
          'The dual-class structure and founder voting control persist',
          'AI capital spending continues without a disclosed return measure',
        ],
        breaks: [
          'A published return metric on AI infrastructure that demonstrates the spending earns its cost',
          'Capital spending capped and returned as it was after the metaverse revolt',
        ],
        modelLink: [
          { assumption: 'Capex path and depreciation', note: 'Model depreciation growth against revenue growth. When the first outruns the second, the capital is not earning.' },
          { assumption: 'Cost of equity', note: 'Unaccountable capital allocation belongs in an explicit premium. The metaverse quantified what it can cost.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'The Next Web / eMarketer — Meta set to overtake Google in digital ad revenue in 2026', url: 'https://thenextweb.com/news/meta-surpass-google-digital-ad-revenue-emarketer-2026' },
      { label: 'Digital Applied — Meta overtakes Google in ad revenue: 2026 readout', url: 'https://www.digitalapplied.com/blog/meta-overtakes-google-ad-revenue-2026-budget-readout' },
      { label: 'Actuate Media — Meta versus Google: the 2026 digital advertising shift', url: 'https://www.actuatemedia.com/blog/meta-vs-google-digital-advertising-shift/' },
      { label: 'Digital Applied — digital advertising statistics 2026', url: 'https://www.digitalapplied.com/blog/digital-advertising-statistics-2026-data-points' },
    ],
  },

  {
    ticker: 'NFLX',
    sector: 'Communication Services',
    scope: 'GLOBAL',
    headline:
      'The streaming business that reached profitability first and is now adding an advertising tier — converting a subscription company into a hybrid one, in a connected TV market growing 28% a year.',
    howItEarns: [
      {
        heading: 'Subscriptions across tiers, with price as the main lever',
        body:
          'Monthly subscriptions in several price tiers across more than a hundred and ninety countries. With member growth in mature markets slowing, revenue growth comes from price increases, paid sharing enforcement and mix toward higher tiers rather than from new subscribers.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Content is capitalised and amortised, so cash and reported margin diverge',
        body:
          'Content is paid for up front and amortised over years, which means reported margin can improve while cash content spend rises. The test of whether a content library is an asset or a treadmill is whether cash spend grows more slowly than revenue.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float and a single share class.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Content production commitments with talent and studios, which fix cash obligations years ahead',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership — unusual among large technology and media companies',
        'SEC reporting including cash content spend alongside content amortisation',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Single share class in a sector full of dual-class structures',
        body:
          'Unlike most of its media and technology peers, this company has one share class and no founder control. Shareholders can replace the board, which has produced genuine responsiveness — the pivot to advertising and paid sharing followed market pressure on the growth story.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Abandoning subscriber disclosure removed the metric the thesis rested on',
        body:
          'The company stopped reporting quarterly subscriber numbers, on the argument that revenue and margin matter more. That is defensible for a maturing business and it also removes the measure investors used to judge whether price increases were costing members. Less disclosure at the moment the trade-off becomes live is a governance choice with consequences.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Scale that lets content cost be spread over the largest base',
        mechanism:
          'A show costs the same to make whether ten million or three hundred million households can watch it. The largest subscriber base amortises content over more revenue than any competitor, which means it can outspend them on content while spending less per subscriber.',
        evidence: 'Profitability reached while competitors with similar content budgets sustained streaming losses.',
        erodedBy: 'Subscriber growth stalling, which stops the denominator growing while content costs keep rising.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Recommendation and engagement data across a global base',
        mechanism:
          'Knowing what will be watched improves commissioning decisions and reduces the cost of a hit, and the data comes from a base no competitor matches.',
        evidence: 'A commissioning record with a higher hit rate and lower reliance on licensed franchise content than peers.',
        erodedBy: 'Talent and franchise costs rising faster than the data advantage can offset.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'A decade of negative free cash flow building the library, then positive cash flow used for large buybacks. The transition from growth spending to capital return has been executed cleanly, which is rare in media.',
      good: [
        'Reaching streaming profitability and free cash flow generation ahead of every competitor, then using it for buybacks',
        'Adding an advertising tier and paid sharing enforcement, which monetised existing usage rather than requiring new content',
      ],
      bad: [
        'A period of content spending growth that assumed subscriber growth would continue at the earlier rate',
        'Live events and sports rights commitments, which are the most expensive and least durable content a streamer can buy',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Connected TV advertising is growing 28% a year',
        body:
          'The US connected TV advertising market reached $33.5 billion, up 28% year on year, as cord-cutting reached critical mass and every major streamer launched an ad-supported tier. A subscription business adding advertising enters a market growing far faster than subscriptions are.',
        basis: 'REPORTED',
      },
      {
        heading: 'The ad tier competes for budget against Meta, Google and retail media',
        body:
          'Three platforms take 54.7% of global digital advertising ex-China, and retail media at $62 billion is growing 26.1%. A streaming ad business is a new entrant competing for the same budget against sellers with far better targeting and measurement.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Price increases costing members, with no subscriber disclosure to check',
        body:
          'Growth now depends on price, and the company has stopped reporting the metric that would show whether members are leaving because of it. Revenue can rise while the base erodes, and the disclosure to detect it has been withdrawn.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Sports and live rights resetting the cost base upward',
        body:
          'Live content commands attention and is bid for by everyone, with no library value after broadcast. It is the most reliable way for a streamer to raise content cost without raising the asset base.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'nflx-ad-tier',
        title: 'A subscription business entering an advertising market growing four times faster',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Subscriber growth in mature markets has slowed and the company has found a second revenue line on the same content and the same viewing hours. US connected TV advertising is a $33.5 billion market growing 28% a year, and an ad-supported tier monetises viewers who would not pay the full subscription — so it raises revenue per hour watched without new content spend. Combined with the largest subscriber base to amortise content over, and a single share class that makes management genuinely accountable, the economics improve without needing member growth to resume.',
        requires: [
          'Advertising revenue per viewer on the ad tier exceeds the subscription revenue forgone',
          'Connected TV advertising demand continues growing at a multiple of subscription growth',
          'Content cash spend grows more slowly than revenue',
        ],
        breaks: [
          'Ad-tier pricing cannibalising higher-paying subscribers rather than adding new ones',
          'Streaming advertising budgets going to better-targeted competitors instead',
          'Sports and live rights resetting content cash spend above revenue growth',
        ],
        modelLink: [
          { assumption: 'Revenue driver — members by tier and revenue per member', note: 'Model the ad tier separately from full-price subscriptions. Blended ARPU makes cannibalisation invisible.' },
          { assumption: 'Cash content spend versus content amortisation', note: 'The quality test is cash spend growing more slowly than revenue. Amortisation alone will not show it.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'nflx-price-without-disclosure',
        title: 'Growth is now price, and the metric that would test it has been withdrawn',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'With member growth slowing in mature markets, revenue growth depends on price increases, paid sharing enforcement and tier mix. All three test how much the subscriber will absorb, and the company stopped reporting quarterly subscriber numbers at the point that trade-off became the central question. Revenue can rise for several quarters while the base erodes, and the disclosure that would reveal it no longer exists. Meanwhile the new advertising business competes for budget against sellers taking 55% of the global market with far better measurement.',
        requires: [
          'Growth continues depending primarily on price and mix rather than members',
          'Subscriber disclosure remains withdrawn',
        ],
        breaks: [
          'Resumed subscriber disclosure showing the base growing alongside price',
          'Advertising revenue growing large enough that subscription price sensitivity stops being the main variable',
        ],
        modelLink: [
          { assumption: 'Revenue driver — members and revenue per member', note: 'Model a flat or declining member count with rising price, and see whether revenue growth survives. That is the untested case.' },
          { assumption: 'Churn', note: 'Price-driven growth raises churn. Model it explicitly rather than assuming retention holds.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Digital Applied — digital advertising statistics 2026, including CTV', url: 'https://www.digitalapplied.com/blog/digital-advertising-statistics-2026-data-points' },
      { label: 'The Current — marketers on streaming, measurement and retail media in 2026', url: 'https://www.thecurrent.com/innovation/culture-marketers-predict-streaming-measurement-ai-retail-2026' },
      { label: 'eMarketer — US ad spending 2026', url: 'https://www.emarketer.com/content/us-ad-spending-2026' },
    ],
  },

  {
    ticker: 'DIS',
    sector: 'Communication Services',
    scope: 'GLOBAL',
    headline:
      'Theme parks and cruise ships earn most of the operating income and get almost none of the attention, while the streaming business that dominates the narrative has only recently stopped losing money.',
    howItEarns: [
      {
        heading: 'Experiences: the part of the company that actually earns',
        body:
          'Theme parks, resorts, cruise ships and consumer products generate the large majority of operating income, at margins and returns on capital that the media businesses have never matched. Pricing power comes from intellectual property that makes the experience unsubstitutable — no competitor can build a park with these characters.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Content monetised across a chain of windows',
        body:
          'A film earns in cinemas, then streaming, then licensing, then merchandise, then a park attraction. That chain is what distinguishes this library from a streaming catalogue: the same character earns for decades across formats a pure streamer cannot access.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float and a single share class.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Joint ventures and licensing arrangements for international parks operated by partners',
        'Sports rights agreements with leagues that are also distribution counterparties',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting with separate segment disclosure for experiences and entertainment',
        'A proxy record that has included contested board campaigns, demonstrating the mechanism works',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A succession process that has been conducted twice, publicly and badly',
        body:
          'The company has changed chief executive, reversed the change, and run a further public succession process under activist pressure and proxy contests. For a business whose value rests on long-cycle creative and capital decisions — park expansions take years, franchises take decades — repeated leadership uncertainty is a genuine cost and not a governance abstraction.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Segment disclosure makes the real earnings visible, if anyone looks',
        body:
          'Reporting experiences separately shows where the operating income comes from, which is the single most useful disclosure the company makes. The persistent gap between that disclosure and the streaming-focused narrative is the mispricing this company keeps offering.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Intellectual property that makes an experience unsubstitutable',
        mechanism:
          'A family can choose between two theme parks only if both have the characters the children want. They do not, and cannot — the characters are owned. That converts a capital-intensive leisure business into one with genuine pricing power.',
        evidence: 'Sustained per-capita spending growth at the parks above inflation, with attendance held.',
        erodedBy: 'Pricing past the point where a family trip becomes unaffordable, and franchise fatigue reducing the pull of the characters.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'A library monetised across more windows than any competitor has',
        mechanism:
          'The same character earns in film, streaming, licensing, merchandise, cruise and park attractions. A pure streamer owns one window; this company owns the chain, so the return on a successful franchise is a multiple of what a streaming hit produces.',
        evidence: 'Consumer products and licensing revenue attached to franchises decades after their original release.',
        erodedBy: 'Weak creative output, which starves every window at once rather than only one.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'A very large park and cruise expansion programme alongside the streaming build, funded partly with the debt from a major studio acquisition. The parks investment earns well; the streaming spending was necessary and expensive; the acquisition price remains debatable.',
      good: [
        'Committing capital to park and cruise expansion, which earns the highest returns in the portfolio',
        'Reaching streaming profitability after a period of substantial losses, and restoring the dividend',
      ],
      bad: [
        'A major studio and content acquisition at a price and with debt that constrained the company through the streaming build',
        'Sports rights and linear television assets whose value has fallen with the pay-television base and which have been difficult to restructure',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Every streamer now has an ad tier, which commoditises the tier and grows the market',
        body:
          'US connected TV advertising reached $33.5 billion growing 28%, with ad-supported tiers now universal. That grows the advertising pool and removes any differentiation from having launched one.',
        basis: 'REPORTED',
      },
      {
        heading: 'Linear television decline is structural and the rights cost is not',
        body:
          'Sports rights costs keep rising against a declining pay-television base, which is the squeeze facing every legacy media operator. The parks business has no exposure to it, which is precisely why the segment split matters.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Pricing the parks past the family budget',
        body:
          'Per-capita spending growth has done the work in the experiences segment. There is a point at which a family trip becomes unaffordable and attendance falls, and the company has been testing where it is.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Creative output failing across all windows at once',
        body:
          'The chain of windows is a multiplier on a hit and on a miss. A weak slate starves streaming, merchandise, licensing and the park attraction pipeline simultaneously.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'dis-experiences-mispriced',
        title: 'A parks company with a media problem, valued as a media company with parks',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Segment disclosure shows that the large majority of operating income comes from theme parks, resorts, cruises and consumer products — a business with genuine pricing power, because a family cannot substitute a park that does not have the characters. Those earnings have no exposure to the linear decline, the sports rights inflation or the streaming competition that dominate the narrative and the multiple. Valuing the company on a media multiple prices the best asset at the worst asset\'s rating, and the parks and cruise expansion programme is adding capacity to exactly the segment that earns.',
        requires: [
          'Park attendance holds as per-capita spending rises',
          'The expansion programme earns returns comparable to the existing park base',
          'Creative output sustains the franchises the experiences depend on',
        ],
        breaks: [
          'Pricing reaching the point where attendance falls rather than spending rising',
          'A weak creative slate starving the franchise pipeline that feeds the parks',
          'Consumer discretionary weakness reducing destination travel',
        ],
        modelLink: [
          { assumption: 'Segment margins and capital by segment', note: 'Value experiences separately against leisure peers and entertainment against media peers. One blended multiple is the mispricing.' },
          { assumption: 'Revenue driver — attendance and per-capita spending', note: 'Model attendance and spend per visitor separately. Revenue can rise on falling attendance, and that is the thing to watch.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'dis-legacy-drag',
        title: 'Two declining businesses and a rising rights bill attached to a good one',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Linear television is in structural decline while sports rights costs rise, which is a widening squeeze with no operational answer — and the assets have proved difficult to restructure or sell. Streaming has only recently stopped losing money into a market where every competitor now has an ad tier, so the differentiation from launching one is gone. Meanwhile leadership has changed, reversed and been contested publicly, which is expensive for a company whose value depends on decade-long creative and capital commitments. The parks are excellent and they are funding all of this.',
        requires: [
          'Linear decline continues while sports rights costs rise',
          'Legacy assets remain difficult to divest or restructure',
        ],
        breaks: [
          'A restructuring or disposal that removes the linear drag from the consolidated result',
          'Streaming margins expanding enough to offset the linear decline',
          'Settled leadership with a multi-year mandate',
        ],
        modelLink: [
          { assumption: 'Segment revenue and margin — linear networks', note: 'Model the linear decline explicitly rather than blending it into entertainment. The squeeze is only visible at segment level.' },
          { assumption: 'Content and rights cash spend', note: 'Sports rights are contractual and rising. Model them as a fixed obligation against a declining subscriber base.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Digital Applied — digital advertising statistics 2026, including connected TV', url: 'https://www.digitalapplied.com/blog/digital-advertising-statistics-2026-data-points' },
      { label: 'The Current — marketers on streaming and measurement in 2026', url: 'https://www.thecurrent.com/innovation/culture-marketers-predict-streaming-measurement-ai-retail-2026' },
    ],
  },

  {
    ticker: 'VZ',
    sector: 'Communication Services',
    scope: 'UNITED_STATES',
    headline:
      'Premium pricing finally producing subscriber growth — the best postpaid quarter since 2019 — while fixed wireless monetises spare capacity and fibre reaches 32 million locations at a penetration rate above its main rival\'s.',
    howItEarns: [
      {
        heading: 'Recurring access fees on a network whose cost is sunk',
        body:
          'Subscribers pay monthly for access to a network already built. Marginal cost per subscriber is close to zero, so the contribution margin on an additional connection is very high and the whole business turns on churn and net additions rather than on price.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Fixed wireless is spare capacity sold twice',
        body:
          'Selling home broadband over mid-band spectrum already deployed for mobile monetises capacity that would otherwise sit idle, at almost no incremental network cost. It is the highest-margin growth available to a carrier and its ceiling is physical rather than commercial.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float, and an unusually large retail holder base attracted by the dividend.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Device and distribution agreements with handset manufacturers and retailers',
        'Spectrum purchases from the state at auction, which are both a cost and a regulatory relationship',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting with disclosure of net additions, churn and ARPU by segment',
        'FCC oversight of spectrum holdings and service obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A dividend that constrains the strategy rather than the reverse',
        body:
          'A very long record of dividend growth and a retail holder base that owns the shares for it means the payout is close to untouchable. In a capital-intensive business needing spectrum and fibre, that ranks the distribution above investment flexibility, and it is why leverage is where it is.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Spectrum sits on the balance sheet and never depreciates',
        body:
          'Licences bought at auction are carried as indefinite-lived intangibles exceeding annual revenue, so reported returns on capital look poor while the asset never amortises. Reading this company on return on assets misreads the structure; the balance sheet is where capital discipline is visible.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'C-band spectrum depth in dense markets',
        mechanism:
          'Mid-band spectrum acquired at auction provides the capacity to serve both mobile traffic and fixed wireless in the markets where demand is highest. Spectrum is issued by the state and cannot be manufactured, so the position is permanent within its licence.',
        evidence: 'Fixed wireless net additions above 319,000 in a single quarter, taking the base past 5.7 million, served on capacity already deployed.',
        erodedBy: 'Mobile traffic growth consuming the capacity that fixed wireless monetises, which caps the second use of the same spectrum.',
        basis: 'REPORTED',
      },
      {
        label: 'Network quality reputation supporting a price premium',
        mechanism:
          'A long-cultivated reputation for coverage and reliability lets the company charge above the market and accept slower subscriber growth. That only works while the perception holds, and it is the reason revenue per connection is the highest of the three.',
        evidence: 'Blended postpaid phone ARPU across the three carriers rose only from $53.22 to $56.37 between late 2022 and early 2026, and this company sits above that blend.',
        erodedBy: 'Competitors closing the network quality gap, which removes the justification for the premium.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'Very large spectrum purchases and a fibre build, funded with debt while the dividend grew. The strategy is right and the sequencing left leverage high at the point rates rose.',
      good: [
        'Buying C-band spectrum, which enabled both 5G capacity and the fixed wireless business that monetises it twice',
        'Targeting 32 million fibre locations, with implied penetration around 35% — above its main competitor\'s rate on a slightly smaller footprint',
      ],
      bad: [
        'Spectrum and fibre funded with debt while the dividend kept growing, which left leverage elevated into a rising rate cycle',
        'Media and content acquisitions in an earlier era that were later divested at a loss',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The premium strategy is finally producing volume',
        body:
          'Postpaid phone net additions of 616,000 in the fourth quarter of 2025 were the best since 2019. For a carrier that had accepted slower growth in exchange for higher revenue per connection, getting both at once is the outcome the strategy was supposed to deliver.',
        basis: 'REPORTED',
      },
      {
        heading: 'Connectivity has been getting cheaper in real terms',
        body:
          'Blended postpaid phone ARPU rose about 6% over more than three years, below inflation, while household income rose. The industry has not been pricing aggressively — growth has come from lines, devices and mix rather than from the headline price.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Fixed wireless capacity competing with mobile traffic',
        body:
          'The same spectrum serves both. As mobile data grows, the economics of giving capacity to a home broadband customer worsen, which puts a physical ceiling on the growth business rather than a commercial one.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'A price war in a three-player market',
        body:
          'With near-zero marginal cost, any carrier can buy share on price at any time. The industry\'s returns depend on none of them choosing to, and this company has the most premium to lose.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'vz-convergence-and-fwa',
        title: 'Selling the same spectrum twice, to a household that then does not leave',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Fixed wireless monetises mid-band capacity already deployed for mobile, at almost no incremental network cost — over 319,000 net additions in a quarter and a base past 5.7 million. A household buying both mobile and broadband churns far less than one buying either, so the same capacity produces revenue and retention together. Alongside that, fibre is reaching 32 million locations at an implied penetration around 35%, above the main competitor\'s rate. And the premium strategy has started producing volume as well as price: 616,000 postpaid phone additions, the best quarter since 2019.',
        requires: [
          'Fixed wireless net additions continue without mobile traffic consuming the capacity',
          'Converged households show materially lower churn than single-service ones',
          'Fibre penetration holds near 35% as the footprint expands',
        ],
        breaks: [
          'Mobile data growth absorbing the capacity that fixed wireless monetises',
          'A price war removing the premium the strategy depends on',
          'Cable operators\' mobile reselling matching the convergence benefit from the other direction',
        ],
        modelLink: [
          { assumption: 'Revenue driver — connections and revenue per connection', note: 'Model mobile, fixed wireless and fibre connections separately with their own ARPU. Blended, the second use of the same spectrum is invisible.' },
          { assumption: 'Churn', note: 'The convergence benefit shows up in churn and acquisition cost, not in ARPU. Model it there.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'vz-dividend-versus-capital',
        title: 'A dividend ranked above investment, in a business that needs spectrum and fibre',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The payout has a very long growth record and a retail holder base that owns the shares for it, which makes it effectively untouchable. Spectrum at auction and fibre construction both require capital now for returns years out, and both have been funded with debt while the dividend kept rising — leaving leverage elevated into a rate cycle that raised the cost of every refinancing. Meanwhile real pricing has been falling: blended ARPU rose about 6% in three years against higher inflation. A business with flat real revenue, permanent capital needs and a protected distribution has very little room.',
        requires: [
          'The dividend continues being prioritised over balance sheet flexibility',
          'Real pricing stays flat while capital requirements continue',
        ],
        breaks: [
          'Deleveraging to a level where spectrum and fibre are funded from cash flow',
          'Real ARPU growth resuming, which would fund both the payout and the capital',
        ],
        modelLink: [
          { assumption: 'Dividend payout and debt schedule', note: 'Model the payout as fixed and see what is left for capex after interest. The constraint is the interaction.' },
          { assumption: 'Revenue driver — revenue per connection', note: 'Model ARPU growth below inflation, which is what the last three years actually delivered.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'FactSet Insight — US wireless operators increase focus on fibre', url: 'https://insight.factset.com/u.s.-wireless-operators-increase-focus-on-fiber' },
      { label: 'Light Reading — connectivity pricing in real terms', url: 'https://www.lightreading.com/oss-bss-cx/the-affordability-paradox-telecom-claims-less-of-the-wallet-even-as-arpu-climbs' },
      { label: 'Verizon — Form 8-K, Q4 2025 results', url: 'https://www.sec.gov/Archives/edgar/data/732712/000073271226000003/a2025q4exhibit99.htm' },
      { label: 'Verizon — Form 10-Q, FY2026', url: 'https://www.sec.gov/Archives/edgar/data/0000732712/000073271226000046/vz-20260630.htm' },
    ],
  },

  {
    ticker: 'T',
    sector: 'Communication Services',
    scope: 'UNITED_STATES',
    headline:
      'A connectivity company again after divesting media, converging fibre with wireless in the same households — and still carrying the debt from the acquisitions it has since undone.',
    howItEarns: [
      {
        heading: 'Mobility plus fibre, sold into the same home where possible',
        body:
          'Postpaid and prepaid wireless subscriptions alongside fibre broadband in the footprint it has built. The convergence logic is the strategy: a household buying both churns materially less, so the value of a fibre passing is partly the mobile subscriber it retains.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Business wireline is a declining annuity being managed down',
        body:
          'Legacy enterprise transport and voice services are in structural decline as customers move to internet-based alternatives. The revenue falls every year and the cost base has to be reduced faster, which is a managed run-off rather than a business.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form: 'No controlling shareholder. Dispersed institutional and index ownership with a very large free float and a large retail base attracted historically by the dividend.',
      voting: 'One class of common stock, one share one vote.',
      relatedPartyExposure: [
        'Spectrum acquired from the state at auction',
        'A Mexican wireless operation and other minority-held assets',
      ],
      minorityProtections: [
        'Single voting class, fully dispersed ownership',
        'SEC reporting including net additions, churn and fibre penetration disclosure',
        'FCC oversight of spectrum and service obligations',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A decade of acquisitions undone, and the debt is what remains',
        body:
          'The company bought a satellite television business and a media conglomerate, then divested both at substantial losses, and the borrowings raised for them outlived the assets. That is the clearest capital allocation failure among large US companies of the period, and the deleveraging since has been the main strategic activity.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'The dividend was cut, which restored flexibility at a cost',
        body:
          'Reducing the payout as part of the media separation freed cash for fibre investment and debt reduction. It was the correct decision and it broke the compact with a retail holder base that owned the shares for income, which is why the rerating took years.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Low-band spectrum with nationwide reach',
        mechanism:
          'Low-frequency licences propagate far, which makes rural and in-building coverage cheaper to provide than for a competitor without them. Spectrum is issued by the state and the position is permanent within the licence.',
        evidence: 'Nationwide coverage maintained with a competitive cost per site, and a subscriber base that includes rural markets competitors serve less well.',
        erodedBy: 'Mid-band capacity becoming the binding requirement rather than coverage, which shifts the advantage to competitors with more of it.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'A fibre footprint converging with the wireless base',
        mechanism:
          'Passing a home with fibre creates the possibility of selling both services, and a converged household churns far less. The passing is a sunk cost and the retention benefit persists for as long as the customer stays.',
        evidence: 'Convergence identified across the industry as the primary driver of retention, ARPU expansion and merger rationale.',
        erodedBy: 'Fixed wireless and cable competitors reaching the same households more cheaply than fibre can be built.',
        basis: 'REPORTED',
      },
    ],
    capitalAllocation: {
      summary:
        'The record has two halves: a decade of value-destroying media acquisitions, then a disciplined reversal — divestments, a dividend cut, deleveraging and a fibre build. The second half has been executed well and is repairing the first.',
      good: [
        'Divesting the satellite and media businesses and refocusing entirely on connectivity',
        'Cutting the dividend to fund fibre and debt reduction rather than defending the payout with borrowings',
      ],
      bad: [
        'Acquiring a satellite television business and a media conglomerate, both divested at large losses, with the debt outliving the assets',
        'Spectrum and fibre commitments made while leverage was still elevated from those acquisitions',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Convergence is the industry\'s retention strategy and this company has the fibre for it',
        body:
          'The ability to sell home broadband and mobile to the same household is the primary driver of retention and revenue per household across the sector, and the reason for most of its merger activity. A carrier with both a national wireless base and a growing fibre footprint is positioned for it structurally.',
        basis: 'REPORTED',
      },
      {
        heading: 'Real pricing has been flat and the industry has not fought on price',
        body:
          'Blended postpaid phone ARPU across the three carriers rose from $53.22 to $56.37 between late 2022 and early 2026, below inflation. The rational oligopoly is holding, which is the precondition for everyone\'s returns.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Leverage from acquisitions that no longer exist',
        body:
          'The debt raised for the media businesses remains while the assets do not. Deleveraging has progressed and it still ranks ahead of shareholder returns and limits how fast fibre can be built.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Business wireline declining faster than costs can be removed',
        body:
          'A structurally shrinking enterprise segment with a fixed cost base produces negative operating leverage. Managing it down faster than it declines is a continuous execution requirement.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 't-convergence-repair',
        title: 'A repaired balance sheet and the fibre to converge with, priced as if neither happened',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The media acquisitions were a disaster and they are gone. What remains is a national wireless base, low-band spectrum that makes coverage cheap, and a growing fibre footprint — and convergence, selling both services to one household, is the retention and revenue mechanism the whole industry has identified as decisive. Real pricing is flat because the three players are not fighting, which protects everyone\'s returns. The shares still carry the discount earned by the previous decade, and the current business is a different one.',
        requires: [
          'Fibre passings continue converting to converged households with lower churn',
          'Deleveraging continues so capital can shift from debt reduction to the build',
          'The three-player pricing discipline holds',
        ],
        breaks: [
          'A price war removing the industry\'s pricing discipline',
          'Fibre penetration disappointing, which makes the passings a sunk cost without the retention benefit',
          'Business wireline declining faster than the cost base can be reduced',
        ],
        modelLink: [
          { assumption: 'Revenue driver — connections by type and revenue per connection', note: 'Model mobility, consumer wireline and business wireline separately. The business wireline decline is hidden in any blended growth rate.' },
          { assumption: 'Churn and debt schedule', note: 'The convergence benefit is a churn effect, and the deleveraging is a debt schedule. Neither shows in revenue.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 't-declining-segment-and-debt',
        title: 'A shrinking enterprise business and legacy debt, both consuming the fibre opportunity',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Two legacies weigh on the same cash flow. Business wireline is in structural decline with a fixed cost base, which produces negative operating leverage every year and requires continuous cost removal just to stand still. And the debt raised for satellite and media acquisitions that have since been divested at a loss is still being serviced, ranking ahead of both shareholder returns and the fibre build. Meanwhile real pricing is flat, so the revenue line is not going to solve it. The fibre opportunity is real and the company is funding it from a constrained position.',
        requires: [
          'Business wireline continues declining faster than costs can be removed',
          'Deleveraging continues to rank ahead of the fibre build and shareholder returns',
        ],
        breaks: [
          'Business wireline stabilising as legacy products complete their run-off',
          'Leverage reaching a level where the fibre build can be accelerated from cash flow',
        ],
        modelLink: [
          { assumption: 'Segment revenue — business wireline', note: 'Model the decline explicitly with its fixed cost base. Negative operating leverage does not appear in a blended margin.' },
          { assumption: 'Debt schedule and capex path', note: 'Model debt service and the fibre programme competing for the same cash. That competition is the thesis.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'FactSet Insight — US wireless operators increase focus on fibre', url: 'https://insight.factset.com/u.s.-wireless-operators-increase-focus-on-fiber' },
      { label: 'Light Reading — the affordability paradox in connectivity pricing', url: 'https://www.lightreading.com/oss-bss-cx/the-affordability-paradox-telecom-claims-less-of-the-wallet-even-as-arpu-climbs' },
      { label: 'AT&T — Form 8-K, Q2 2026 results', url: 'https://www.sec.gov/Archives/edgar/data/0000732717/000073271726000294/t-2q2026exhibit991.htm' },
    ],
  },

  {
    ticker: 'TMUS',
    sector: 'Communication Services',
    scope: 'UNITED_STATES',
    headline:
      'The carrier that emerged from a merger with more mid-band spectrum and a lower cost base than its competitors, and has spent the years since converting that into share — with a German parent holding the majority.',
    howItEarns: [
      {
        heading: 'Share gain on a cost base the merger left below the industry',
        body:
          'Postpaid and prepaid subscriptions on a network with more mid-band capacity per subscriber than its rivals, and a lower cost per gigabyte. That lets the company price below the market and still earn a better margin, which is the reverse of the premium strategy and equally valid.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Fixed wireless is the capacity surplus sold as broadband',
        body:
          'Having more spectrum than needed for mobile traffic means the surplus can be sold as home broadband at almost no incremental cost. The company has more of that surplus than its competitors, which is why it has taken more fixed wireless share.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled by Deutsche Telekom of Germany, which holds a majority of the shares. Strategy and capital allocation are set within the parent\'s group framework, and the free float is correspondingly smaller than the market capitalisation suggests.',
      voting: 'One class of common stock, with the parent holding a majority of the votes.',
      relatedPartyExposure: [
        'The parent sets capital allocation and distribution policy against its own European group priorities',
        'Intragroup arrangements and the parent\'s own leverage position reach the subsidiary',
        'A majority holder whose stake gives it control of every shareholder decision',
      ],
      minorityProtections: [
        'SEC reporting obligations and NASDAQ listing standards',
        'A single share class, so the parent\'s influence is proportional to its economics',
        'FCC oversight of spectrum and merger conditions',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A majority parent whose priorities are set in Europe',
        body:
          'Deutsche Telekom controls the company and decides how much capital stays and how much is returned. The interests have largely aligned because the US business has been the group\'s best asset, and alignment by circumstance is not the same as protection.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The merger synergies were real and are now in the base',
        body:
          'Combining two networks removed duplicate sites and cost, and the savings have been delivered. That means the cost advantage is now the starting point rather than a source of future improvement, and growth has to come from share and from fixed wireless rather than from further integration.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Mid-band spectrum depth per subscriber',
        mechanism:
          'The merger delivered 2.5 GHz spectrum at a scale competitors have had to buy at auction since. More capacity per subscriber means a lower cost per gigabyte and surplus capacity available to sell as fixed broadband.',
        evidence: 'The lowest cost per gigabyte among the three carriers, and the largest fixed wireless base built on surplus capacity.',
        erodedBy: 'Competitors acquiring comparable mid-band positions at auction, and traffic growth consuming the surplus.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'A brand position with price-sensitive switchers',
        mechanism:
          'Years of positioning as the challenger that removed contract and pricing friction built a base that switches toward the company rather than away from it, which lowers acquisition cost per net addition.',
        evidence: 'Sustained postpaid share gains against both larger incumbents over multiple years.',
        erodedBy: 'Becoming the incumbent, which removes the challenger positioning and invites the same treatment from newer competitors.',
        basis: 'INTERPRETATION',
      },
    ],
    capitalAllocation: {
      summary:
        'Merger integration followed by large buybacks and a recently initiated dividend, funded from a cost base the merger improved. Capital intensity is lower than peers because the spectrum arrived with the merger rather than at auction.',
      good: [
        'Delivering the merger synergies and converting them into share rather than into price cuts alone',
        'Lower capital intensity than peers because the spectrum position came with the merger, freeing cash for returns',
      ],
      bad: [
        'A cost advantage now fully in the base, so future growth requires share gains rather than further integration',
        'Fibre and wireline expansion moving the company into a business where it has no funding or cost advantage',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Fixed wireless share gain is capacity arbitrage while it lasts',
        body:
          'Cable operators lost broadband subscribers through 2025 to fixed wireless and fibre. The company with the most surplus mid-band capacity captures most of that, and the constraint is physical: as mobile traffic grows, the surplus shrinks.',
        basis: 'REPORTED',
      },
      {
        heading: 'The industry is not competing on headline price',
        body:
          'Blended postpaid phone ARPU rose from $53.22 to $56.37 between late 2022 and early 2026, below inflation. A challenger that gains share without triggering a price war is benefiting from discipline it could break at any time.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'The capacity surplus closing as traffic grows',
        body:
          'Fixed wireless runs on spectrum the company would otherwise sell to mobile users. As mobile data grows, the economics of the second use worsen, which caps the growth business physically.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Becoming the incumbent it competed against',
        body:
          'The challenger positioning and the cost advantage were both merger outcomes. With the synergies in the base and the share gained, the company now has the most to lose from a price war rather than the least.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'tmus-capacity-arbitrage',
        title: 'More spectrum per subscriber than anyone else, sold twice',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The merger delivered mid-band spectrum at a scale competitors have had to buy at auction since, which produces two advantages at once: the lowest cost per gigabyte among the three carriers, and surplus capacity that can be sold as home broadband at almost no incremental cost. Cable operators have been losing broadband subscribers to exactly that. Lower capital intensity — because the spectrum came with the merger rather than at auction — means more of the cash flow reaches shareholders. It is a cost-position argument, not a growth story.',
        requires: [
          'Mid-band capacity surplus persists ahead of mobile traffic growth',
          'Postpaid share gains continue without triggering a price response',
          'Capital intensity stays below peers',
        ],
        breaks: [
          'Mobile traffic growth consuming the surplus that fixed wireless monetises',
          'A competitor acquiring comparable mid-band spectrum and closing the cost gap',
          'A price war, which the company now has the most to lose from',
        ],
        modelLink: [
          { assumption: 'Revenue driver — connections by type and revenue per connection', note: 'Model postpaid, prepaid and fixed wireless separately. The capacity arbitrage only appears when fixed wireless has its own line.' },
          { assumption: 'Capex to revenue', note: 'The lower capital intensity is half the thesis. Model it explicitly rather than at a sector average.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'tmus-parent-and-incumbency',
        title: 'A majority German parent, and the challenger has become the incumbent',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Two structural changes have already happened. The merger synergies that produced the cost advantage are fully in the base, so the advantage is the starting point rather than a source of further improvement — and having gained the share, this company now has the most to lose from a price war rather than the least, which inverts the strategic position that made it attractive. Meanwhile Deutsche Telekom holds a majority and decides how much capital stays in the US business against its own European priorities. Alignment has held because this was the group\'s best asset, and that is circumstance rather than protection.',
        requires: [
          'Merger synergies remain fully realised with no further integration benefit available',
          'The parent retains its majority and sets capital allocation',
        ],
        breaks: [
          'A new source of cost advantage, from network technology or further consolidation',
          'The parent selling down, creating a genuine float and an independent board',
        ],
        modelLink: [
          { assumption: 'EBITDA margin path', note: 'Model margin flat rather than expanding. The synergy improvement is already in the base, and that is the thesis.' },
          { assumption: 'Dividend payout and buybacks', note: 'Distribution policy is the parent\'s decision against its group needs, not a function of local cash generation.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'FactSet Insight — US wireless operators increase focus on fibre', url: 'https://insight.factset.com/u.s.-wireless-operators-increase-focus-on-fiber' },
      { label: 'Light Reading — connectivity pricing in real terms', url: 'https://www.lightreading.com/oss-bss-cx/the-affordability-paradox-telecom-claims-less-of-the-wallet-even-as-arpu-climbs' },
      { label: 'CostQuest — broadband in America: fixed broadband competition', url: 'https://costquest.substack.com/p/broadband-in-america-report-fixed-ac4' },
    ],
  },

  {
    ticker: 'CMCSA',
    sector: 'Communication Services',
    scope: 'UNITED_STATES',
    headline:
      'A high-margin broadband annuity losing units to fixed wireless, attached to media and theme park businesses with opposite characteristics — and pursuing mobile bundling to rebuild the margin.',
    howItEarns: [
      {
        heading: 'Residential broadband is the annuity and it is losing subscribers',
        body:
          'Cable broadband over plant already passing half the country earns very high margins and is the core of the enterprise value. Subscriber losses to fixed wireless and fibre overbuild have been offset by rate increases, so revenue has held while units have fallen — which is a finite arrangement.',
        basis: 'REPORTED',
      },
      {
        heading: 'Media and parks consume and return capital in cycles',
        body:
          'Studios, networks and theme parks are cyclical, capital-hungry and structurally worse businesses than connectivity: high fixed content cost, no recurring access revenue, and a customer who can leave monthly. Parks are the better half of that half.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Controlled in practice by the Roberts family through a class of shares carrying disproportionate voting power, within a widely held company where the family\'s economic stake is very small.',
      voting:
        'A separate class of shares gives the family control of the vote with an economic interest of around one per cent. Public shareholders own essentially all the economics and cannot outvote the family.',
      relatedPartyExposure: [
        'A family with voting control and a very small economic stake, deciding capital allocation across connectivity, media and parks',
        'Joint ventures and content licensing arrangements between the media segment and third parties',
      ],
      minorityProtections: [
        'SEC reporting with segment disclosure that allows connectivity to be valued separately',
        'A large institutional register that has engaged publicly on the media strategy',
        'FCC oversight of the cable and broadband business',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'Voting control with one per cent of the economics',
        body:
          'The founding family controls the company through a share class while owning a very small fraction of it. Every strategic decision — including whether to keep funding media with broadband cash flow — is made by holders whose economic exposure is negligible relative to their authority. That is the starkest separation of control from economics in the sector.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A record of using connectivity cash flow to buy media',
        body:
          'The company has repeatedly used the stable cash flow of its cable network to acquire media assets, including a European satellite operator and a US studio and network group. The sector\'s history says this pattern usually ends in divestment at a loss, and the family has the votes to continue it.',
        basis: 'INTERPRETATION',
      },
    ],
    moat: [
      {
        label: 'Cable plant already passing half the country',
        mechanism:
          'Coaxial and fibre plant in the ground, passing tens of millions of homes, cannot be economically duplicated. Upgrading it to higher speeds costs a fraction of building new, so the incumbent can respond to competition at far lower capital cost than the entrant incurred.',
        evidence: 'Broadband margins structurally above wireless substitutes, sustained while units declined.',
        erodedBy: 'Fixed wireless and fibre overbuild reaching the same homes without needing the plant.',
        basis: 'REPORTED',
      },
      {
        label: 'Theme parks with owned intellectual property',
        mechanism:
          'Park attendance depends on characters the company owns, and a competitor cannot build the same experience. It is the one part of the media portfolio with genuine pricing power.',
        evidence: 'Park segment margins and growth materially better than the studio and network businesses.',
        erodedBy: 'Consumer discretionary weakness, and franchise strength that has to be continuously replenished.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Consistent buybacks and dividend growth funded by broadband, alongside very large media acquisitions and park investment. The connectivity business earns well and has repeatedly funded purchases in worse businesses.',
      good: [
        'Investing in park capacity, which is the highest-return part of the media portfolio',
        'Sustained buybacks that have reduced the share count meaningfully while the dividend grew',
      ],
      bad: [
        'Acquiring a European satellite operator and a US studio and network group with broadband cash flow, in a sector whose history says such deals end in divestment',
        'Sports rights commitments rising against a declining pay-television base, with no operational answer',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Broadband units are falling and convergence is the stated response',
        body:
          'Both large cable operators reported subscriber losses through 2025 as fixed wireless and fibre added subscribers. The company is pursuing convergence — bundling mobile with broadband — to rebuild margin and retention, which is the same mechanism the carriers are using from the other side.',
        basis: 'REPORTED',
      },
      {
        heading: 'Rate increases have held revenue while units fell',
        body:
          'Charter has avoided aggressive broadband promotions, preserving near-term ARPU at the risk of accelerating subscriber losses. The industry choice between price and units is live, and this company is choosing bundling instead.',
        basis: 'REPORTED',
      },
    ],
    keyRisks: [
      {
        heading: 'Broadband unit losses outrunning the rate increases',
        body:
          'Revenue has held because price rose while units fell. That works until the price increase itself accelerates the losses, and the annuity is the main source of enterprise value.',
        basis: 'REPORTED',
      },
      {
        heading: 'Another media acquisition funded by broadband',
        body:
          'The family controls the votes with one per cent of the economics and has a documented record of this pattern. A shareholder cannot stop it.',
        basis: 'INTERPRETATION',
      },
    ],
    theses: [
      {
        id: 'cmcsa-broadband-annuity',
        title: 'A broadband annuity and theme parks, valued at a media multiple',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'Residential connectivity over plant already in the ground earns margins structurally above every substitute, and theme parks with owned characters have genuine pricing power. Together they are most of the operating income and none of the narrative. The shares trade on a multiple set by declining linear networks and streaming losses, which prices the annuity and the parks at the worst business\'s rating. Convergence — bundling mobile with broadband — is a credible response to the unit losses because the mobile capacity is rented rather than built, so it costs little to try.',
        requires: [
          'Broadband revenue holds as rate increases offset unit losses',
          'Mobile bundling reduces churn enough to slow the subscriber decline',
          'Park earnings continue growing',
        ],
        breaks: [
          'Rate increases accelerating the unit losses they are meant to offset',
          'Fixed wireless and fibre taking share faster than bundling can retain',
          'Another large media acquisition funded by the broadband cash flow',
        ],
        modelLink: [
          { assumption: 'Segment revenue and margins', note: 'Value connectivity and parks against their own peers and media against media. One blended multiple is the mispricing.' },
          { assumption: 'Revenue driver — broadband relationships and revenue per relationship', note: 'Model units and ARPU separately. Revenue holding on falling units is the whole question.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'cmcsa-one-percent-control',
        title: 'A family with one per cent of the economics decides where the broadband cash goes',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'The founding family controls the vote with an economic stake of roughly one per cent, and the company has repeatedly used the stable cash flow of its cable network to acquire media assets — a European satellite operator, a US studio and network group. The sector\'s record on exactly that pattern is a sequence of divestments at a loss. Meanwhile broadband units are falling, sports rights costs are rising against a shrinking pay-television base, and the shareholders bearing all of the economics have no vote on any of it. The structure is the risk, not the current strategy.',
        requires: [
          'The dual-class structure and family voting control persist',
          'Media and content remain a destination for connectivity cash flow',
        ],
        breaks: [
          'A separation of the media assets, which would end the cross-subsidy',
          'A commitment to return connectivity cash flow rather than reinvest it in content',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Control with one per cent of the economics belongs in an explicit premium. Stating it makes it arguable.' },
          { assumption: 'Capital allocation by segment', note: 'Model media capital spending as a claim on connectivity cash flow. That transfer is the thesis.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'CostQuest — broadband in America: cable market focus', url: 'https://www.costquest.com/resources/articles/broadband-in-america/broadband-in-america-report-cable-focus-2026-05/' },
      { label: 'FactSet Insight — US wireless operators and convergence', url: 'https://insight.factset.com/u.s.-wireless-operators-increase-focus-on-fiber' },
      { label: 'CostQuest — fixed broadband competition focus, June 2026', url: 'https://costquest.substack.com/p/broadband-in-america-report-fixed-ac4' },
    ],
  },

  {
    ticker: 'VIVT3',
    sector: 'Communication Services',
    scope: 'BRAZIL',
    headline:
      'The largest Brazilian mobile operator, majority-held by a Spanish parent, in a three-player market where prices track inflation and growth comes from moving prepaid customers to postpaid.',
    howItEarns: [
      {
        heading: 'Mobile access fees in a market that reprices with inflation',
        body:
          'Postpaid and prepaid subscriptions plus fibre broadband. Since the market consolidated to three operators, prices have moved broadly with IPCA rather than being competed away — so real revenue holds and, against a cost base growing more slowly, margin expands.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'Prepaid to postpaid migration is the growth engine',
        body:
          'A postpaid subscriber pays several times a prepaid one and churns less, and because the network cost is sunk almost all of that difference reaches EBITDA. The connection base is near saturation, so mix rather than volume is where growth comes from.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Majority-held by Telefónica of Spain, which sets strategy, capital allocation and dividend policy within its own group framework, with a substantial institutional free float alongside.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the parent holding the majority.',
      relatedPartyExposure: [
        'The parent decides capital allocation and distributions against its own European group priorities and leverage position',
        'Technology, procurement and brand arrangements with the parent group',
        'A parent under its own financial pressure can extract dividends or reorganise in ways adverse to a Brazilian minority',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'ANATEL regulation of spectrum, coverage obligations and service quality',
        'A large local institutional register that has engaged on distributions',
      ],
      basis: 'STRUCTURAL',
    },
    governance: [
      {
        heading: 'A foreign parent whose own condition reaches the subsidiary',
        body:
          'Strategy and distribution are decided in Madrid against the group\'s European needs. When a parent is under financial pressure, extracting dividends from a healthy subsidiary is rational for it and not necessarily optimal for the subsidiary\'s minority holders. The alignment is circumstantial.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'The 2022 spectrum division created value for all three operators',
        body:
          'Distributing a failed fourth operator\'s mobile assets among the three incumbents was a regulatory decision that handed each of them spectrum and subscribers at well below the cost of building equivalent coverage. It is the clearest case in this market of a regulator creating shareholder value.',
        basis: 'STRUCTURAL',
      },
    ],
    moat: [
      {
        label: 'Spectrum and national coverage in a three-player market',
        mechanism:
          'Spectrum is issued by the state and national coverage is built over decades. With only three operators, the structure supports inflation-linked pricing that none of them competes away — which is a behavioural feature resting on a structural one.',
        evidence: 'Mobile prices in Brazil moving broadly with IPCA since consolidation, rather than falling in real terms as in more fragmented markets.',
        erodedBy: 'A fourth entrant, or one of the three deciding to buy share on price.',
        basis: 'INTERPRETATION',
      },
      {
        label: 'Distribution reach into low-income segments',
        mechanism:
          'Prepaid recharge is a physical retail business requiring presence in hundreds of thousands of small points of sale, which cannot be replicated digitally or quickly.',
        evidence: 'A prepaid base that provides the pipeline for postpaid migration, which is the growth mechanism.',
        erodedBy: 'Digital recharge and eSIM reducing the value of physical distribution.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Spectrum and fibre investment alongside high distributions, with the balance between them set by the parent. The 2022 spectrum acquisition was excellent value and fibre expansion into contested footprints is the debatable part.',
      good: [
        'Acquiring spectrum and subscribers in the 2022 division at a fraction of the cost of building equivalent coverage',
        'Sustaining high distributions from a mature business with limited reinvestment needs',
      ],
      bad: [
        'Fibre expansion into areas already served by regional providers, where achievable penetration is halved',
        'Capital allocation decided against a European parent\'s priorities rather than the Brazilian opportunity set',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'Inflation-linked pricing rests on three operators not competing',
        body:
          'Annual increases broadly tracking IPCA hold real revenue flat and expand margin against a slower-growing cost base. The mechanism is structural in that there are only three players and behavioural in that none has chosen to break it.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'Fibre is where the competition actually is',
        body:
          'Fixed broadband in Brazil is fragmented, with thousands of regional providers competing on price using cheap capital. For a mobile-led operator, fibre reduces mobile churn more reliably than it earns a standalone return.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'Mix reversal rather than churn in a weak consumer market',
        body:
          'With 82% of Brazilian households carrying debt, an IPCA price increase pushes customers down the plan ladder rather than out. That shows as mix reversal, which is harder to see than churn and equally damaging to revenue per user.',
        basis: 'REPORTED',
      },
      {
        heading: 'The parent\'s needs determining distributions and investment',
        body:
          'A majority holder under its own pressure decides how much cash stays in Brazil. The minority has the economics and no vote on the answer.',
        basis: 'STRUCTURAL',
      },
    ],
    theses: [
      {
        id: 'vivt3-mix-migration',
        title: 'Growth from mix on a sunk network, in a market that prices with inflation',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The connection base is saturated, which sounds like the end of growth and is not. A prepaid subscriber converted to postpaid pays several times more and churns less, and because the network cost is already sunk almost all of that increment reaches EBITDA. Add annual repricing broadly at IPCA in a three-player market that has not competed on price since consolidation, and real revenue holds while margin expands against a slower-growing cost base. The 2022 spectrum division handed the company capacity at a fraction of build cost, which funds it.',
        requires: [
          'Prepaid to postpaid migration continues at recent rates',
          'The three operators continue repricing with inflation rather than competing',
          'Fibre investment is justified by mobile churn reduction rather than standalone returns',
        ],
        breaks: [
          'Mix reversal as indebted households move down the plan ladder instead of up',
          'One of the three operators deciding to buy share on price',
          'Fibre overbuild into contested footprints at penetration too low to earn a return',
        ],
        modelLink: [
          { assumption: 'Revenue driver — accesses and ARPU by segment', note: 'Model prepaid and postpaid separately with their own ARPU. Migration is a mix effect that a blended ARPU hides completely.' },
          { assumption: 'EBITDA margin path', note: 'The thesis is margin expansion on flat volumes. Model the cost base growing below inflation against IPCA-linked revenue.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'vivt3-parent-and-consumer',
        title: 'A Spanish parent setting the payout and an indebted consumer trading down',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Two risks that do not appear in the operating metrics. The majority holder decides how much capital stays in Brazil and how much is distributed, against its own European leverage and priorities — a parent under pressure extracts, and the minority has no vote. And with a record 82% of Brazilian households carrying debt and credit costs above 25%, an annual IPCA increase does not produce churn; it produces customers moving down the plan ladder. That is mix reversal, it reduces revenue per user, and it is considerably harder to detect in the reported numbers than subscriber loss would be.',
        requires: [
          'The parent retains its majority and sets distribution policy',
          'Household financial stress continues, driving plan downgrades on repricing',
        ],
        breaks: [
          'The parent selling down, creating an independent board and a genuine float',
          'Real income improvement that lets households absorb inflation-linked increases without trading down',
        ],
        modelLink: [
          { assumption: 'Revenue driver — ARPU by segment', note: 'Model a declining postpaid mix with flat connections. That is what trading down looks like and it is not churn.' },
          { assumption: 'Dividend payout', note: 'Payout is the parent\'s decision against its group needs, not a local earnings formula.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'Light Reading — connectivity pricing in real terms', url: 'https://www.lightreading.com/oss-bss-cx/the-affordability-paradox-telecom-claims-less-of-the-wallet-even-as-arpu-climbs' },
      { label: 'Itaponews — record household indebtedness and credit costs', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
      { label: 'MercoPress — Brazil central bank cuts Selic to 14.50%', url: 'https://en.mercopress.com/2026/05/07/brazil-central-bank-cuts-selic-interest-rate-25-points-to-14.50' },
    ],
  },

  {
    ticker: 'TIMS3',
    sector: 'Communication Services',
    scope: 'BRAZIL',
    headline:
      'A Brazilian operator whose ultimate controller changed when the Italian state effectively took over its parent — and whose incoming owner has described Brazil as the jewel of the group.',
    howItEarns: [
      {
        heading: 'Mobile access with an oversized postpaid migration opportunity',
        body:
          'The 2022 division of a failed operator\'s mobile assets left this company with proportionately more spectrum and a materially larger postpaid base than before. Growth comes from continuing to move prepaid customers up the plan ladder on a network whose cost is already sunk.',
        basis: 'STRUCTURAL',
      },
      {
        heading: 'A lease-heavy cost structure that flatters EBITDA',
        body:
          'Most tower and backhaul infrastructure is leased, so under IFRS 16 reported EBITDA is high and depreciation and amortisation runs at a quarter of revenue or more. EBITDA multiples are therefore flattering here and EBITDA less capex is the number that matters.',
        basis: 'STRUCTURAL',
      },
    ],
    control: {
      form:
        'Majority-held by TIM S.p.A. of Italy. The ultimate control of that parent changed materially when Poste Italiane, a state-backed group, raised its stake to 27.3% in December 2025 to become its largest shareholder, buying from the state lender and from a French media group.',
      voting: 'Ordinary shares on the Novo Mercado, one share one vote, with the Italian parent holding the majority.',
      relatedPartyExposure: [
        'The ultimate controller is now effectively a state-backed Italian group, whose priorities are set in Rome rather than in Brazil',
        'Infrastructure sharing and network agreements with the other Brazilian operators',
        'Technology and procurement arrangements with the parent group',
      ],
      minorityProtections: [
        'Novo Mercado rules: one share one vote, tag-along at 100%, minimum free float',
        'A local board and local governance retained, with the parent stating no near-term change to structure, management or strategy',
        'ANATEL regulation of spectrum and service obligations',
      ],
      basis: 'REPORTED',
    },
    governance: [
      {
        heading: 'The ultimate owner changed and the stated intention is continuity',
        body:
          'Poste Italiane becoming the largest shareholder of the Italian parent effectively placed a state-backed group at the top of the ownership chain. The Brazilian company keeps its own board and local governance, and company statements have indicated no near-term change to structure, management or operating strategy. The incoming controller\'s chief executive characterised Brazil as a jewel of the group, which is a statement of intent rather than a commitment.',
        basis: 'REPORTED',
      },
      {
        heading: 'A long history of minority treatment at the parent level',
        body:
          'The Italian group\'s own governance history includes documented minority expropriation through pyramid structures in earlier decades, and more recent activism seeking greater minority board representation. That history sits above the Brazilian company rather than inside it, and it is the reason for scepticism about how a Brazilian minority fares when the parent needs cash.',
        basis: 'REPORTED',
      },
    ],
    moat: [
      {
        label: 'Spectrum acquired at a fraction of build cost',
        mechanism:
          'The 2022 division of a failing operator\'s mobile assets transferred spectrum and subscribers to the three incumbents at well below what equivalent coverage would cost to build. It is a permanent cost advantage within the licence term.',
        evidence: 'A postpaid base materially larger after the division, on spectrum obtained at replacement cost far below construction.',
        erodedBy: 'Licence expiry and renewal terms, and traffic growth requiring further spectrum at auction prices.',
        basis: 'STRUCTURAL',
      },
      {
        label: 'Infrastructure sharing lowering cost per site',
        mechanism:
          'Agreements to share towers and backhaul with competitors reduce the cost of coverage below what an operator building alone would pay, and the agreements are long-dated.',
        evidence: 'Capex to revenue below the level a standalone national build would require, at around 18% of revenue.',
        erodedBy: 'Renegotiation of sharing terms, and tower company pricing power as leases renew.',
        basis: 'STRUCTURAL',
      },
    ],
    capitalAllocation: {
      summary:
        'Spectrum acquired cheaply in the 2022 division, disciplined capex through infrastructure sharing, and a very high payout. For a mature business in a three-player market with limited reinvestment opportunity, distributing is the correct answer.',
      good: [
        'Acquiring spectrum and subscribers in the 2022 division at far below the cost of building equivalent coverage',
        'Using infrastructure sharing to hold capital intensity below a standalone build, and distributing the difference',
      ],
      bad: [
        'A lease-heavy structure that flatters reported EBITDA and leaves the true capital cost in depreciation and lease payments',
        'Capital allocation and distribution ultimately decided by a parent whose own ownership has just changed hands',
      ],
      basis: 'INTERPRETATION',
    },
    sectorPosition: [
      {
        heading: 'The three-player structure supports inflation-linked pricing',
        body:
          'Since consolidation, Brazilian mobile prices have moved broadly with IPCA rather than being competed away. That holds real revenue flat and expands margin against a slower-growing cost base, and it depends on none of the three choosing to compete on price.',
        basis: 'INTERPRETATION',
      },
      {
        heading: 'EBITDA multiples mislead in a lease-heavy operator',
        body:
          'With depreciation and amortisation at a quarter of revenue or more because of IFRS 16 leases, this company looks cheap on EBITDA and considerably less so on cash generation after leases and capex. The comparison to international peers requires adjusting for it.',
        basis: 'STRUCTURAL',
      },
    ],
    keyRisks: [
      {
        heading: 'A new ultimate controller with its own capital needs',
        body:
          'A state-backed Italian group now sits at the top of the chain. Stated intentions are continuity; a parent that needs cash has a healthy Brazilian subsidiary available, and the minority has the economics and no vote.',
        basis: 'REPORTED',
      },
      {
        heading: 'Mix reversal as indebted households trade down',
        body:
          'With a record 82% of Brazilian households in debt, an IPCA increase produces plan downgrades rather than churn. It reduces revenue per user and is harder to detect than subscriber loss.',
        basis: 'REPORTED',
      },
    ],
    theses: [
      {
        id: 'tims3-post-division-mix',
        title: 'Spectrum obtained cheaply, converted into postpaid mix on a sunk network',
        side: 'BULL',
        weight: 'CORE',
        rationale:
          'The 2022 division handed this company spectrum and subscribers at a fraction of what building equivalent coverage would cost, which permanently lowered its cost of capacity. On that base, moving prepaid customers to postpaid raises revenue per user several times over with almost no incremental network cost, in a three-player market that reprices with inflation rather than competing. Infrastructure sharing keeps capital intensity below a standalone build, and the difference is distributed. The growth is mix on sunk cost, which is the most profitable kind.',
        requires: [
          'Prepaid to postpaid migration continues at recent rates',
          'Inflation-linked repricing holds across the three operators',
          'Infrastructure sharing terms remain favourable as leases renew',
        ],
        breaks: [
          'Mix reversal as indebted households downgrade plans on repricing',
          'A price war among the three operators',
          'Lease and tower cost inflation as sharing agreements renew',
        ],
        modelLink: [
          { assumption: 'Revenue driver — accesses and ARPU by segment', note: 'Model prepaid and postpaid separately. A blended ARPU makes the migration thesis untestable.' },
          { assumption: 'EBITDA less leases and capex', note: 'IFRS 16 flatters EBITDA here. Model cash generation after leases and capex, not EBITDA multiples.' },
        ],
        conviction: 'MEDIUM',
      },
      {
        id: 'tims3-new-ultimate-owner',
        title: 'The controller at the top of the chain just changed, and the history above it is not reassuring',
        side: 'BEAR',
        weight: 'CORE',
        rationale:
          'Poste Italiane taking 27.3% of the Italian parent in December 2025 placed a state-backed group at the top of this company\'s ownership chain, buying out the state lender and a French media group. Stated intentions are continuity and the incoming chief executive called Brazil a jewel of the group — which is exactly what a parent says about an asset it values and may need. The Italian group\'s own governance history includes documented minority expropriation through pyramid structures and recent activism over minority board representation. A Brazilian minority holds the economics of a healthy subsidiary whose distribution policy is decided by a newly changed, state-influenced controller abroad.',
        requires: [
          'The new ownership structure at the parent persists',
          'Distribution and capital decisions for the Brazilian entity continue being made at the parent level',
        ],
        breaks: [
          'Formal governance commitments protecting the Brazilian subsidiary\'s capital and distributions',
          'A sell-down creating an independent float and board',
        ],
        modelLink: [
          { assumption: 'Cost of equity', note: 'Add an explicit premium for a newly changed, state-influenced foreign controller. Stating it makes it arguable rather than assumed.' },
          { assumption: 'Dividend payout', note: 'Model payout as the parent\'s decision under its own capital needs, not as a function of local cash generation.' },
        ],
        conviction: 'MEDIUM',
      },
    ],
    asOf: '2026-09-12',
    sources: [
      { label: 'MarketScreener — Poste raises Telecom Italia stake to 27.3%', url: 'https://www.marketscreener.com/news/poste-ups-telecom-italia-stake-to-27-3-with-vivendi-s-residual-holding-ce7d50dbda81f126' },
      { label: 'Rio Times — Italian state to control TIM Brasil, dubbed a jewel', url: 'https://www.riotimesonline.com/tim-brasil-italian-state-control-2026/' },
      { label: 'Controlling shareholders and minority protection: governance lessons from Telecom Italia', url: 'https://ideas.repec.org/p/brh/wpaper/0808.html' },
      { label: 'Itaponews — record household indebtedness in Brazil', url: 'https://www.itaponews.com.br/crise-no-varejo-reflete-combinacao-de-credito-caro-endividamento-e-transformacao-do-consumo.html' },
    ],
  },
];
