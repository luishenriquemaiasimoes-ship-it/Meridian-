/* ==================================================================
   Qualitative research: the sector a company competes in, and the
   company itself.

   The rest of the platform models what a business earns. None of that
   says why the business gets to keep earning it, who decides how the
   cash is spent, or what the industry does to a company that gets the
   next cycle wrong. That is what lives here.

   One rule governs the whole layer, and it is the same rule the AI
   guardrails impose: a reader must always be able to tell what kind of
   claim they are reading. A concession term is a fact. A tariff reset
   mechanism is a fact. "The market is under-pricing the reset" is an
   argument. Presenting the third as if it were the first two is the
   failure mode this schema exists to prevent, so basis is a required
   field on every claim and the UI renders it.
   ================================================================== */

/**
 * Where a claim comes from, so a reader can weigh it.
 *
 * STRUCTURAL and REPORTED are checkable: a concession expires when the
 * contract says it expires, and a controlling stake is whatever the filing
 * says. INTERPRETATION is an argument built on those — it can be wrong
 * without anything being false, and it is the only kind a reader is entitled
 * to disagree with on judgement alone.
 */
export type ClaimBasis = 'STRUCTURAL' | 'REPORTED' | 'INTERPRETATION';

/** A source a reader can go and check. */
export interface ResearchSource {
  label: string;
  url: string;
}

/** One paragraph of research, carrying its own basis. */
export interface ResearchNote {
  heading: string;
  body: string;
  basis: ClaimBasis;
}

/**
 * A force that moves the economics of an entire industry.
 *
 * Direction is separate from magnitude on purpose. Whether a driver helps or
 * hurts is usually uncontroversial; how much it matters is where analysts
 * disagree, and collapsing the two into a single score hides the argument.
 */
export interface SectorDriver {
  key: string;
  label: string;
  /** What it is and how it transmits into revenue, cost or capital. */
  mechanism: string;
  /** Which way it currently points for the sector as a whole. */
  direction: 'TAILWIND' | 'HEADWIND' | 'MIXED';
  /** The measure that tracks it, in the words the industry uses. */
  watch: string;
  basis: ClaimBasis;
}

/** How an industry is put together, which is what decides who earns what. */
export interface SectorStructure {
  /** Concentrated, fragmented, regulated duopoly — say which and why. */
  shape: string;
  /** What stops a new entrant, where anything does. */
  entryBarriers: string[];
  /** Who sets price: the producer, the customer, a regulator, an index. */
  pricingPower: string;
  /** Where the sector sits in its own cycle, and against what history. */
  cyclePosition: string;
  basis: ClaimBasis;
}

export interface SectorDossier {
  /** GICS sector name, matching the company profiles. */
  sector: string;
  /** Where the research applies. Sector economics are not global by default. */
  scope: 'GLOBAL' | 'BRAZIL' | 'UNITED_STATES';
  /**
   * The GICS industries this dossier actually describes, where the sector is
   * too broad to describe at all.
   *
   * "Communication Services" contains both a wireless carrier and an
   * advertising platform; handing an advertising platform a dossier about
   * spectrum and fixed wireless would be worse than handing it nothing.
   * Omitted means the dossier covers the whole sector for its scope.
   */
  industries?: string[];
  headline: string;
  structure: SectorStructure;
  drivers: SectorDriver[];
  /** The rules that decide outcomes, and who writes them. */
  regulation: ResearchNote[];
  /** What an analyst covering this sector actually argues about. */
  debates: ResearchNote[];
  /** How the sector destroys capital. Every industry has its own way. */
  failureModes: ResearchNote[];
  asOf: string;
  sources: ResearchSource[];
}

/**
 * Who controls the company, and what that means for a minority holder.
 *
 * This is the part of governance that changes a valuation rather than a
 * score. A controlled company can be run superbly; the point is that the
 * minority holder's protection comes from the structure, not from goodwill,
 * so the structure is what gets described.
 */
export interface ControlStructure {
  /** Dispersed, family, state, strategic parent — and the stake. */
  form: string;
  /** One share one vote, or something else. */
  voting: string;
  /** Where the controller's interest can diverge from a minority holder's. */
  relatedPartyExposure: string[];
  /** What actually protects the minority: listing segment, statute, covenant. */
  minorityProtections: string[];
  basis: ClaimBasis;
}

/** What the company has done with its cash, which is the only capital-allocation evidence that counts. */
export interface CapitalAllocationRecord {
  summary: string;
  /** Decisions that went well, named. */
  good: string[];
  /** Decisions that did not, named. Omitting these makes the rest worthless. */
  bad: string[];
  basis: ClaimBasis;
}

/**
 * A durable advantage, stated so it can be checked rather than admired.
 *
 * "Strong brand" is not a moat claim, it is a compliment. A moat claim names
 * the mechanism, says what it lets the company charge or avoid paying, and
 * says what would erode it.
 */
export interface MoatClaim {
  label: string;
  /** Why a competitor cannot simply copy it. */
  mechanism: string;
  /** What it is worth: the price premium, the cost advantage, the retained customer. */
  evidence: string;
  /** What would take it away. */
  erodedBy: string;
  basis: ClaimBasis;
}

/**
 * A thesis, in the shape the deck already uses: an argument with conditions
 * and a way to be wrong.
 *
 * requires and breaks are not decoration. A thesis that cannot be falsified
 * is a preference, and the field is mandatory so that writing one down forces
 * the author to say what would change their mind.
 */
export interface ResearchThesis {
  id: string;
  title: string;
  /** Which way it points. A research layer that only produces bull cases is marketing. */
  side: 'BULL' | 'BEAR' | 'STRUCTURAL';
  weight: 'CORE' | 'SUPPORTING';
  /** The argument itself. */
  rationale: string;
  /** What has to be true. */
  requires: string[];
  /** What would prove it wrong. */
  breaks: string[];
  /**
   * The line of the model this thesis actually moves. A qualitative view that
   * touches no assumption cannot be tested against the numbers, and this
   * field is what connects the two halves of the product.
   */
  modelLink: { assumption: string; note: string }[];
  conviction: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface CompanyQualitative {
  ticker: string;
  /** Which sector dossier to read alongside this. */
  sector: string;
  scope: 'GLOBAL' | 'BRAZIL' | 'UNITED_STATES';
  /** The company in one honest sentence, including what is wrong with it. */
  headline: string;
  /** How it actually makes money, past the marketing. */
  howItEarns: ResearchNote[];
  control: ControlStructure;
  governance: ResearchNote[];
  moat: MoatClaim[];
  capitalAllocation: CapitalAllocationRecord;
  /** Where this company sits inside the sector's drivers, specifically. */
  sectorPosition: ResearchNote[];
  /** The things that would genuinely hurt, ranked by how much. */
  keyRisks: ResearchNote[];
  theses: ResearchThesis[];
  asOf: string;
  sources: ResearchSource[];
}
