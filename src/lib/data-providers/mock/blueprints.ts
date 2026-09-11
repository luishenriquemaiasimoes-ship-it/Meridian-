import type { CompanyProfile } from '../types';

/**
 * Blueprints for the demo universe. Every figure below is a *simulated*
 * operating profile used to generate an internally consistent set of financial
 * statements; the platform labels all of it as MockMarketDataProvider data and
 * never presents it as a market quotation.
 */

export interface CompanyAnchors {
  /** Latest full fiscal year revenue, in the company's reporting unit. */
  revenue: number;
  /** Annual revenue growth for FY-5 .. FY (six entries, oldest first). */
  growthPath: number[];
  /** EBITDA margin for FY-5 .. FY (six entries, oldest first). */
  ebitdaMarginPath: number[];
  grossMargin: number;
  daPctRevenue: number;
  rndPctRevenue: number;
  taxRate: number;
  capexPctRevenue: number;
  ppePctRevenue: number;
  intangiblesPctRevenue: number;
  goodwillPctRevenue: number;
  cashPctRevenue: number;
  /** Non-operating / financial assets as a share of revenue. Defaults to 0.05. */
  otherAssetsPctRevenue?: number;
  netDebtToEbitda: number;
  /**
   * Pre-tax cost of debt in the company's own reporting currency. It sits
   * above the nominal sovereign yield for that currency in every case: a
   * corporate borrowing below its own government is either subsidised or a
   * data error, and none of these is modelled as subsidised.
   */
  costOfDebt: number;
  arDays: number;
  invDays: number;
  apDays: number;
  dividendPayout: number;
  buybackPctNetIncome: number;
  minorityPctNetIncome: number;
  /** Shares outstanding in the same unit as the statements (millions). */
  shares: number;
  price: number;
  beta: number;
  annualVolatility: number;
  priceDrift: number;
  averageVolume: number;
  freeFloat: number;
}

/**
 * The unit a business actually sells, and what it charges for it.
 *
 * A revenue line built as "grows 8% a year" hides the two decisions that
 * matter: how much is sold and at what price. Stating them separately is what
 * lets an analyst disagree with one without touching the other — traffic can
 * be flat while the tariff follows inflation, and a model that cannot express
 * that is not a model of the business.
 *
 * Volumes are absolute, never in thousands or millions. Revenue is carried in
 * millions, so revenue divided by an absolute volume gives a price that reads
 * back as currency per unit once scaled — and a volume stated in thousands
 * would silently shift that by three orders of magnitude.
 *
 * Optional because not every business has one natural unit: a conglomerate or
 * a bank is better read through its segments.
 */
export interface RevenueDriver {
  /** What is counted, in the words the company itself uses. */
  unit: string;
  /** Volume in the latest full year, absolute. */
  volume: number;
  /** Annual volume growth. Separate from price on purpose. */
  volumeGrowth: number;
  /**
   * Revenue per unit, as an order-of-magnitude anchor only: the model
   * recomputes it from the reported top line so the build-up always
   * reconciles to the revenue rather than to this number.
   */
  price: number;
  /** Annual price growth. */
  priceGrowth: number;
  /** The index the price follows, where it follows one. */
  priceIndex?: string;
  /** Which part of revenue the driver explains; the rest is other lines. */
  shareOfRevenue?: number;
}

export interface CompanyBlueprint {
  profile: CompanyProfile;
  anchors: CompanyAnchors;
  /** The volume-and-price driver behind the top line, where the business has one. */
  driver?: RevenueDriver;
  segments: { name: string; share: number; margin: number; growth: number; marketShare?: number }[];
  geographies: { name: string; share: number }[];
  management: { name: string; role: string; since: number; background: string }[];
  ownership: { holder: string; kind: 'CONTROLLING' | 'INSTITUTIONAL' | 'RETAIL' | 'TREASURY' | 'INSIDER'; stake: number }[];
  peers: string[];
}

const IFRS = 'IFRS' as const;
const GAAP = 'US_GAAP' as const;

function bp(
  profile: Omit<CompanyProfile, 'accountingStandard' | 'fiscalYearEnd' | 'reportingUnit'> & {
    accountingStandard?: typeof IFRS | typeof GAAP;
  },
  anchors: CompanyAnchors,
  rest: Omit<CompanyBlueprint, 'profile' | 'anchors'>,
): CompanyBlueprint {
  return {
    profile: {
      ...profile,
      accountingStandard: profile.accountingStandard ?? IFRS,
      fiscalYearEnd: '12-31',
      reportingUnit: 'MILLIONS',
    },
    anchors,
    ...rest,
  };
}

export const BLUEPRINTS: CompanyBlueprint[] = [
  /* ------------------------------ BRAZIL ------------------------------ */
  bp(
    {
      ticker: 'VALE3', name: 'Vale', legalName: 'Vale S.A.', exchange: 'B3', country: 'Brazil',
      sector: 'Materials', industry: 'Metals & Mining', currency: 'BRL',
      description:
        'Vale is one of the largest producers of iron ore and pellets globally, with complementary operations in nickel, copper and logistics. The company operates integrated mine-to-port systems in Brazil and ships predominantly to Asian steelmakers.',
      businessModel:
        'Vertically integrated extraction and logistics. Value is captured through low cash costs per tonne, ownership of railways and ports, and a premium ore grade that earns a quality differential over the benchmark 62% Fe index.',
      competitiveAdvantages: ['Tier-1 ore body quality', 'Owned rail and port logistics', 'Cost position in the first quartile', 'Scale in seaborne iron ore'],
      website: 'https://vale.com', employees: 65000, foundedYear: 1942,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Rio de Janeiro, Brazil',
      themes: ['commodities', 'energy-transition'],
    },
    {
      revenue: 205000, growthPath: [0.32, -0.14, -0.05, 0.03, 0.06, 0.02],
      ebitdaMarginPath: [0.60, 0.50, 0.44, 0.42, 0.43, 0.41],
      grossMargin: 0.48, daPctRevenue: 0.09, rndPctRevenue: 0.004, taxRate: 0.28,
      capexPctRevenue: 0.13, ppePctRevenue: 1.05, intangiblesPctRevenue: 0.05,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.14, netDebtToEbitda: 0.6,
      costOfDebt: 0.126, arDays: 22, invDays: 62, apDays: 48,
      dividendPayout: 0.6, buybackPctNetIncome: 0.15, minorityPctNetIncome: 0.02,
      shares: 4270, price: 61.4, beta: 1.22, annualVolatility: 0.34, priceDrift: 0.03,
      averageVolume: 42_000_000, freeFloat: 0.86,
    },
    {
      driver: {
        unit: 'toneladas de minério', volume: 320_000_000, volumeGrowth: 0.01,
        price: 0.000474, priceGrowth: 0.02, shareOfRevenue: 0.74,
      },
      segments: [
        { name: 'Iron Ore Solutions', share: 0.74, margin: 0.47, growth: 0.01, marketShare: 0.19 },
        { name: 'Energy Transition Metals', share: 0.19, margin: 0.24, growth: 0.08, marketShare: 0.05 },
        { name: 'Logistics & Other', share: 0.07, margin: 0.22, growth: 0.04 },
      ],
      geographies: [{ name: 'China', share: 0.56 }, { name: 'Brazil', share: 0.16 }, { name: 'Europe', share: 0.12 }, { name: 'Rest of Asia', share: 0.10 }, { name: 'Americas', share: 0.06 }],
      management: [
        { name: 'G. Almeida', role: 'Chief Executive Officer', since: 2024, background: 'Two decades in mining operations and logistics.' },
        { name: 'M. Rocha', role: 'Chief Financial Officer', since: 2022, background: 'Prior CFO of a listed infrastructure group.' },
        { name: 'C. Duarte', role: 'EVP Iron Ore', since: 2021, background: 'Career operator across northern-system mines.' },
      ],
      ownership: [
        { holder: 'Previ (pension fund)', kind: 'INSTITUTIONAL', stake: 0.086 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.061 },
        { holder: 'Mitsui & Co.', kind: 'INSTITUTIONAL', stake: 0.055 },
        { holder: 'Treasury', kind: 'TREASURY', stake: 0.031 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.767 },
      ],
      peers: ['RIO', 'BHP', 'FCX', 'SUZB3'],
    },
  ),

  bp(
    {
      ticker: 'PETR4', name: 'Petrobras', legalName: 'Petróleo Brasileiro S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Energy', industry: 'Oil, Gas & Consumable Fuels', currency: 'BRL',
      description:
        'Petrobras is an integrated energy company concentrated in deepwater exploration and production in the Brazilian pre-salt, with refining, logistics and gas operations that serve the domestic market.',
      businessModel:
        'Upstream barrels from low-lifting-cost pre-salt fields are monetised through owned refining and distribution infrastructure. Returns depend on Brent, the BRL/USD rate and the pace of capital deployment.',
      competitiveAdvantages: ['Pre-salt lifting costs among the lowest globally', 'Integrated refining footprint', 'Deepwater operating expertise', 'Domestic logistics network'],
      website: 'https://petrobras.com.br', employees: 45000, foundedYear: 1953,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Rio de Janeiro, Brazil',
      themes: ['commodities', 'energy-transition'],
    },
    {
      revenue: 495000, growthPath: [0.55, -0.09, -0.04, 0.02, 0.03, -0.01],
      ebitdaMarginPath: [0.52, 0.47, 0.44, 0.43, 0.42, 0.41],
      grossMargin: 0.45, daPctRevenue: 0.11, rndPctRevenue: 0.006, taxRate: 0.32,
      capexPctRevenue: 0.14, ppePctRevenue: 1.35, intangiblesPctRevenue: 0.03,
      goodwillPctRevenue: 0.0, cashPctRevenue: 0.10, netDebtToEbitda: 0.9,
      costOfDebt: 0.129, arDays: 20, invDays: 45, apDays: 40,
      dividendPayout: 0.55, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.03,
      shares: 13040, price: 38.6, beta: 1.18, annualVolatility: 0.32, priceDrift: 0.08,
      averageVolume: 58_000_000, freeFloat: 0.63,
    },
    {
      driver: {
        unit: 'barris de óleo equivalente', volume: 1_020_000_000, volumeGrowth: 0.015,
        price: 0.000353, priceGrowth: 0.015, shareOfRevenue: 0.64,
      },
      segments: [
        { name: 'Exploration & Production', share: 0.58, margin: 0.58, growth: 0.02, marketShare: 0.72 },
        { name: 'Refining, Transport & Marketing', share: 0.36, margin: 0.18, growth: 0.01 },
        { name: 'Gas & Low Carbon Energy', share: 0.06, margin: 0.21, growth: 0.05 },
      ],
      geographies: [{ name: 'Brazil', share: 0.71 }, { name: 'Asia', share: 0.18 }, { name: 'Americas', share: 0.08 }, { name: 'Europe', share: 0.03 }],
      management: [
        { name: 'R. Menezes', role: 'Chief Executive Officer', since: 2023, background: 'Career upstream engineer.' },
        { name: 'A. Prado', role: 'Chief Financial Officer', since: 2023, background: 'Prior treasurer of a state-controlled utility.' },
      ],
      ownership: [
        { holder: 'Federal Government (Union)', kind: 'CONTROLLING', stake: 0.365 },
        { holder: 'BNDESPar', kind: 'INSTITUTIONAL', stake: 0.052 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.281 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.302 },
      ],
      peers: ['PRIO3', 'XOM', 'VALE3'],
    },
  ),

  bp(
    {
      ticker: 'ITUB4', name: 'Itaú Unibanco', legalName: 'Itaú Unibanco Holding S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Financials', industry: 'Banks', currency: 'BRL',
      description:
        'Itaú Unibanco is the largest private-sector bank in Brazil, operating retail and wholesale banking, credit cards, insurance broking, asset management and an investment bank across Latin America.',
      businessModel:
        'Earnings are built from net interest income on a diversified loan book plus fee revenue from cards, asset management and insurance. Operating leverage comes from a digitised cost base and a low cost of funding.',
      competitiveAdvantages: ['Deposit franchise and funding cost', 'Distribution scale', 'Credit underwriting data', 'Fee-income diversification'],
      website: 'https://itau.com.br', employees: 96000, foundedYear: 1945,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['brazilian-banks'],
    },
    {
      revenue: 178000, growthPath: [0.08, 0.14, 0.11, 0.09, 0.08, 0.07],
      ebitdaMarginPath: [0.36, 0.38, 0.40, 0.42, 0.43, 0.44],
      grossMargin: 0.62, daPctRevenue: 0.035, rndPctRevenue: 0.0, taxRate: 0.30,
      capexPctRevenue: 0.035, ppePctRevenue: 0.11, intangiblesPctRevenue: 0.09,
      goodwillPctRevenue: 0.03, cashPctRevenue: 0.55, netDebtToEbitda: -0.4,
      costOfDebt: 0.124, arDays: 40, invDays: 0, apDays: 30,
      dividendPayout: 0.62, buybackPctNetIncome: 0.06, minorityPctNetIncome: 0.02,
      shares: 9800, price: 35.2, beta: 0.94, annualVolatility: 0.26, priceDrift: 0.11,
      averageVolume: 36_000_000, freeFloat: 0.52,
    },
    {
      segments: [
        { name: 'Retail Banking', share: 0.46, margin: 0.38, growth: 0.06, marketShare: 0.21 },
        { name: 'Wholesale Banking', share: 0.33, margin: 0.52, growth: 0.08 },
        { name: 'Activities with the Market + Corporation', share: 0.21, margin: 0.44, growth: 0.09 },
      ],
      geographies: [{ name: 'Brazil', share: 0.88 }, { name: 'Latin America ex-Brazil', share: 0.12 }],
      management: [
        { name: 'M. Setubal', role: 'Chief Executive Officer', since: 2021, background: 'Two decades inside the group across retail and wholesale.' },
        { name: 'P. Lisboa', role: 'Chief Financial Officer', since: 2022, background: 'Former head of investor relations.' },
      ],
      ownership: [
        { holder: 'Itaúsa', kind: 'CONTROLLING', stake: 0.375 },
        { holder: 'Cia. E. Johnston', kind: 'CONTROLLING', stake: 0.088 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.312 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.225 },
      ],
      peers: ['BBAS3', 'BPAC11', 'B3SA3'],
    },
  ),

  bp(
    {
      ticker: 'BBAS3', name: 'Banco do Brasil', legalName: 'Banco do Brasil S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Financials', industry: 'Banks', currency: 'BRL',
      description:
        'Banco do Brasil is a state-controlled universal bank with a dominant position in agricultural credit, a large retail deposit base and government payroll relationships.',
      businessModel:
        'Agribusiness lending anchors the loan book at attractive spreads and low loss rates, complemented by payroll lending, insurance and asset management fees.',
      competitiveAdvantages: ['Agribusiness credit franchise', 'Payroll and government relationships', 'Low-cost deposit base', 'National branch reach'],
      website: 'https://bb.com.br', employees: 86000, foundedYear: 1808,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Brasília, Brazil',
      themes: ['brazilian-banks'],
    },
    {
      revenue: 152000, growthPath: [0.06, 0.16, 0.13, 0.07, 0.05, 0.03],
      ebitdaMarginPath: [0.30, 0.34, 0.37, 0.38, 0.36, 0.34],
      grossMargin: 0.58, daPctRevenue: 0.03, rndPctRevenue: 0.0, taxRate: 0.26,
      capexPctRevenue: 0.03, ppePctRevenue: 0.08, intangiblesPctRevenue: 0.07,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.60, netDebtToEbitda: -0.5,
      costOfDebt: 0.1235, arDays: 38, invDays: 0, apDays: 28,
      dividendPayout: 0.45, buybackPctNetIncome: 0.02, minorityPctNetIncome: 0.01,
      shares: 5720, price: 25.9, beta: 1.05, annualVolatility: 0.30, priceDrift: 0.01,
      averageVolume: 28_000_000, freeFloat: 0.49,
    },
    {
      segments: [
        { name: 'Agribusiness', share: 0.31, margin: 0.42, growth: 0.02, marketShare: 0.52 },
        { name: 'Retail & Payroll', share: 0.42, margin: 0.30, growth: 0.03 },
        { name: 'Wholesale & Government', share: 0.27, margin: 0.36, growth: 0.05 },
      ],
      geographies: [{ name: 'Brazil', share: 0.96 }, { name: 'International', share: 0.04 }],
      management: [
        { name: 'T. Barbosa', role: 'Chief Executive Officer', since: 2025, background: 'Career banker inside the institution.' },
        { name: 'F. Guimarães', role: 'Chief Financial Officer', since: 2023, background: 'Former head of credit risk.' },
      ],
      ownership: [
        { holder: 'Federal Government (Union)', kind: 'CONTROLLING', stake: 0.501 },
        { holder: 'Previ', kind: 'INSTITUTIONAL', stake: 0.093 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.406 },
      ],
      peers: ['ITUB4', 'BPAC11'],
    },
  ),

  bp(
    {
      ticker: 'WEGE3', name: 'WEG', legalName: 'WEG S.A.', exchange: 'B3', country: 'Brazil',
      sector: 'Industrials', industry: 'Electrical Equipment', currency: 'BRL',
      description:
        'WEG manufactures electric motors, drives, transformers and automation systems, with a growing renewable-generation equipment business and manufacturing footprint across the Americas, Europe and Asia.',
      businessModel:
        'A vertically integrated manufacturer that competes on engineering, delivery time and a global service network rather than price. Growth comes from electrification capex and share gains in transmission & distribution equipment.',
      competitiveAdvantages: ['Vertical integration in components', 'Global service network', 'Engineering depth in custom motors', 'Disciplined capital allocation'],
      website: 'https://weg.net', employees: 43000, foundedYear: 1961,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Jaraguá do Sul, Brazil',
      themes: ['energy-transition', 'infrastructure'],
    },
    {
      revenue: 41500, growthPath: [0.28, 0.24, 0.12, 0.08, 0.13, 0.11],
      ebitdaMarginPath: [0.19, 0.21, 0.22, 0.23, 0.225, 0.222],
      grossMargin: 0.34, daPctRevenue: 0.028, rndPctRevenue: 0.028, taxRate: 0.22,
      capexPctRevenue: 0.045, ppePctRevenue: 0.30, intangiblesPctRevenue: 0.05,
      goodwillPctRevenue: 0.06, cashPctRevenue: 0.20, netDebtToEbitda: -0.7,
      costOfDebt: 0.125, arDays: 62, invDays: 105, apDays: 55,
      dividendPayout: 0.42, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.005,
      shares: 4200, price: 41.8, beta: 0.86, annualVolatility: 0.29, priceDrift: 0.1,
      averageVolume: 18_000_000, freeFloat: 0.42,
    },
    {
      driver: {
        unit: 'unidades produzidas', volume: 22_500_000, volumeGrowth: 0.07,
        price: 0.00000164, priceGrowth: 0.04,
      },
      segments: [
        { name: 'Industrial Electro-Electronic Equipment', share: 0.53, margin: 0.23, growth: 0.09, marketShare: 0.11 },
        { name: 'Generation, Transmission & Distribution', share: 0.30, margin: 0.24, growth: 0.16 },
        { name: 'Commercial Motors & Appliances', share: 0.12, margin: 0.17, growth: 0.06 },
        { name: 'Paints & Varnishes', share: 0.05, margin: 0.16, growth: 0.04 },
      ],
      geographies: [{ name: 'Brazil', share: 0.44 }, { name: 'North America', share: 0.27 }, { name: 'Europe', share: 0.15 }, { name: 'Rest of world', share: 0.14 }],
      management: [
        { name: 'A. Bartelle', role: 'Chief Executive Officer', since: 2020, background: 'Career inside the group, formerly head of the motors division.' },
        { name: 'L. Kirchner', role: 'Chief Financial Officer', since: 2019, background: 'Long-tenured finance director.' },
      ],
      ownership: [
        { holder: 'WEG Participações (founding families)', kind: 'CONTROLLING', stake: 0.505 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.042 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.453 },
      ],
      peers: ['TOTS3', 'RENT3', 'EQTL3'],
    },
  ),

  bp(
    {
      ticker: 'RENT3', name: 'Localiza', legalName: 'Localiza Rent a Car S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Industrials', industry: 'Ground Transportation', currency: 'BRL',
      description:
        'Localiza operates car rental, fleet management and used-car retail in Brazil and neighbouring markets, running one of the largest light-vehicle fleets in Latin America.',
      businessModel:
        'Vehicles are purchased at fleet discounts, rented for two to three years, then sold through an owned retail network. Returns depend on the spread between rental yield, depreciation and the cost of funding the fleet.',
      competitiveAdvantages: ['Purchase scale with automakers', 'Owned used-car retail channel', 'Branch density', 'Access to long-tenor local debt'],
      website: 'https://localiza.com', employees: 22000, foundedYear: 1973,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Belo Horizonte, Brazil',
      themes: ['consumer', 'infrastructure'],
    },
    {
      revenue: 39800, growthPath: [0.35, 0.52, 0.18, 0.06, 0.04, 0.05],
      ebitdaMarginPath: [0.34, 0.31, 0.29, 0.30, 0.31, 0.32],
      grossMargin: 0.40, daPctRevenue: 0.13, rndPctRevenue: 0.0, taxRate: 0.30,
      // Capex here is net of fleet disposals, because the proceeds already
      // arrive through the used-car revenue line. Carrying gross fleet
      // purchases alongside that revenue would count the same cycle twice and
      // leave the business burning cash forever, which is not what it does.
      // Net of disposals it sits just above depreciation, which is what a
      // fleet holding its size relative to revenue actually spends.
      capexPctRevenue: 0.14, ppePctRevenue: 1.55, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.22, cashPctRevenue: 0.15, netDebtToEbitda: 2.6,
      costOfDebt: 0.145, arDays: 34, invDays: 40, apDays: 46,
      dividendPayout: 0.25, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.0,
      shares: 1060, price: 33.4, beta: 1.31, annualVolatility: 0.38, priceDrift: -0.04,
      averageVolume: 21_000_000, freeFloat: 0.71,
    },
    {
      driver: {
        unit: 'diárias de locação', volume: 128_000_000, volumeGrowth: 0.06,
        price: 0.000000323, priceGrowth: 0.045, priceIndex: 'IPCA', shareOfRevenue: 0.78,
      },
      segments: [
        { name: 'Car Rental (RAC)', share: 0.38, margin: 0.44, growth: 0.06, marketShare: 0.35 },
        { name: 'Fleet Management', share: 0.27, margin: 0.58, growth: 0.09 },
        { name: 'Used Car Sales (Seminovos)', share: 0.35, margin: 0.05, growth: 0.02 },
      ],
      geographies: [{ name: 'Brazil', share: 0.94 }, { name: 'South America ex-Brazil', share: 0.06 }],
      management: [
        { name: 'B. Nunes', role: 'Chief Executive Officer', since: 2022, background: 'Long career in mobility services.' },
        { name: 'R. Peixoto', role: 'Chief Financial Officer', since: 2021, background: 'Capital markets background.' },
      ],
      ownership: [
        { holder: 'Founding families', kind: 'CONTROLLING', stake: 0.204 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.398 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.398 },
      ],
      peers: ['WEGE3', 'LREN3', 'RADL3'],
    },
  ),

  bp(
    {
      ticker: 'ABEV3', name: 'Ambev', legalName: 'Ambev S.A.', exchange: 'B3', country: 'Brazil',
      sector: 'Consumer Staples', industry: 'Beverages', currency: 'BRL',
      description:
        'Ambev produces and distributes beer, soft drinks and non-alcoholic beverages across Brazil, Central America, the Caribbean, Canada and the southern cone of Latin America.',
      businessModel:
        'Brand portfolio plus direct distribution creates pricing power per hectolitre. Margin depends on packaging and barley costs, FX on dollar-linked inputs, and premium mix.',
      competitiveAdvantages: ['Brand portfolio', 'Direct distribution reach', 'Procurement scale', 'Route-to-market density'],
      website: 'https://ambev.com.br', employees: 50000, foundedYear: 1999,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['consumer'],
    },
    {
      revenue: 93500, growthPath: [0.25, 0.16, 0.08, 0.04, 0.05, 0.04],
      ebitdaMarginPath: [0.31, 0.29, 0.30, 0.315, 0.32, 0.325],
      grossMargin: 0.51, daPctRevenue: 0.06, rndPctRevenue: 0.002, taxRate: 0.19,
      capexPctRevenue: 0.06, ppePctRevenue: 0.44, intangiblesPctRevenue: 0.12,
      goodwillPctRevenue: 0.35, cashPctRevenue: 0.19, netDebtToEbitda: -0.9,
      costOfDebt: 0.1245, arDays: 28, invDays: 48, apDays: 92,
      dividendPayout: 0.72, buybackPctNetIncome: 0.04, minorityPctNetIncome: 0.04,
      shares: 15700, price: 12.6, beta: 0.72, annualVolatility: 0.24, priceDrift: 0.06,
      averageVolume: 26_000_000, freeFloat: 0.28,
    },
    {
      driver: {
        unit: 'hectolitros', volume: 180_000_000, volumeGrowth: 0.02,
        price: 0.00000047, priceGrowth: 0.055, priceIndex: 'IPCA', shareOfRevenue: 0.96,
      },
      segments: [
        { name: 'Brazil Beer', share: 0.47, margin: 0.34, growth: 0.04, marketShare: 0.60 },
        { name: 'Brazil NAB', share: 0.13, margin: 0.28, growth: 0.05 },
        { name: 'Central America & Caribbean', share: 0.16, margin: 0.36, growth: 0.06 },
        { name: 'Latin America South', share: 0.16, margin: 0.28, growth: 0.03 },
        { name: 'Canada', share: 0.08, margin: 0.30, growth: 0.01 },
      ],
      geographies: [{ name: 'Brazil', share: 0.60 }, { name: 'Central America', share: 0.16 }, { name: 'LatAm South', share: 0.16 }, { name: 'Canada', share: 0.08 }],
      management: [
        { name: 'J. Lemos', role: 'Chief Executive Officer', since: 2023, background: 'Career in consumer goods commercial roles.' },
        { name: 'L. Amaral', role: 'Chief Financial Officer', since: 2020, background: 'Group finance leadership.' },
      ],
      ownership: [
        { holder: 'Anheuser-Busch InBev group', kind: 'CONTROLLING', stake: 0.617 },
        { holder: 'Fundação Zerrenner', kind: 'CONTROLLING', stake: 0.101 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.282 },
      ],
      peers: ['RADL3', 'LREN3'],
    },
  ),

  bp(
    {
      ticker: 'B3SA3', name: 'B3', legalName: 'B3 S.A. - Brasil, Bolsa, Balcão', exchange: 'B3',
      country: 'Brazil', sector: 'Financials', industry: 'Capital Markets', currency: 'BRL',
      description:
        'B3 operates the Brazilian exchange and central counterparty, covering equities, listed derivatives, fixed income registration, OTC registration and post-trade infrastructure.',
      businessModel:
        'Fees are charged per traded and registered contract on a fixed cost base, so incremental volume converts to profit at very high marginal margins.',
      competitiveAdvantages: ['Vertical exchange and clearing monopoly economics', 'Network effects in liquidity', 'Registration mandate for OTC instruments', 'Operating leverage'],
      website: 'https://b3.com.br', employees: 2100, foundedYear: 2017,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['brazilian-banks'],
    },
    {
      revenue: 10400, growthPath: [0.22, 0.05, 0.02, 0.05, 0.07, 0.06],
      ebitdaMarginPath: [0.74, 0.71, 0.69, 0.70, 0.705, 0.71],
      grossMargin: 0.82, daPctRevenue: 0.13, rndPctRevenue: 0.0, taxRate: 0.24,
      capexPctRevenue: 0.05, ppePctRevenue: 0.14, intangiblesPctRevenue: 0.35,
      goodwillPctRevenue: 1.55, cashPctRevenue: 0.42, netDebtToEbitda: 0.8,
      costOfDebt: 0.126, arDays: 18, invDays: 0, apDays: 22,
      dividendPayout: 0.75, buybackPctNetIncome: 0.15, minorityPctNetIncome: 0.0,
      shares: 5450, price: 11.9, beta: 1.02, annualVolatility: 0.31, priceDrift: 0.02,
      averageVolume: 33_000_000, freeFloat: 0.98,
    },
    {
      segments: [
        { name: 'Listed - Equities', share: 0.44, margin: 0.74, growth: 0.05, marketShare: 0.98 },
        { name: 'Listed - Interest Rates & FX', share: 0.29, margin: 0.76, growth: 0.08 },
        { name: 'OTC & Infrastructure for Financing', share: 0.19, margin: 0.66, growth: 0.07 },
        { name: 'Technology & Data', share: 0.08, margin: 0.55, growth: 0.09 },
      ],
      geographies: [{ name: 'Brazil', share: 1.0 }],
      management: [
        { name: 'G. Finkelsztain', role: 'Chief Executive Officer', since: 2017, background: 'Capital markets executive.' },
        { name: 'A. Fonseca', role: 'Chief Financial Officer', since: 2021, background: 'Exchange finance leadership.' },
      ],
      ownership: [
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.548 },
        { holder: 'Local institutional funds', kind: 'INSTITUTIONAL', stake: 0.281 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.171 },
      ],
      peers: ['ITUB4', 'BPAC11', 'TOTS3'],
    },
  ),

  bp(
    {
      ticker: 'SUZB3', name: 'Suzano', legalName: 'Suzano S.A.', exchange: 'B3', country: 'Brazil',
      sector: 'Materials', industry: 'Paper & Forest Products', currency: 'BRL',
      description:
        'Suzano is the largest producer of market hardwood pulp globally, with integrated forestry, pulp mills and a paper and packaging division serving domestic and export markets.',
      businessModel:
        'Short eucalyptus rotation cycles in Brazil give a structural cash-cost advantage. Earnings track the hardwood pulp price in USD and the BRL exchange rate.',
      competitiveAdvantages: ['Lowest-quartile cash cost per tonne', 'Owned forest base and short rotation', 'Scale in seaborne hardwood pulp', 'Integrated logistics'],
      website: 'https://suzano.com.br', employees: 40000, foundedYear: 1924,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['commodities', 'energy-transition'],
    },
    {
      revenue: 47600, growthPath: [0.42, 0.20, -0.15, 0.09, 0.11, 0.04],
      ebitdaMarginPath: [0.55, 0.53, 0.42, 0.45, 0.47, 0.45],
      grossMargin: 0.44, daPctRevenue: 0.15, rndPctRevenue: 0.004, taxRate: 0.25,
      capexPctRevenue: 0.22, ppePctRevenue: 1.60, intangiblesPctRevenue: 0.06,
      goodwillPctRevenue: 0.09, cashPctRevenue: 0.24, netDebtToEbitda: 2.9,
      costOfDebt: 0.127, arDays: 44, invDays: 80, apDays: 52,
      dividendPayout: 0.18, buybackPctNetIncome: 0.12, minorityPctNetIncome: 0.0,
      shares: 1290, price: 54.2, beta: 1.09, annualVolatility: 0.33, priceDrift: 0.07,
      averageVolume: 14_000_000, freeFloat: 0.55,
    },
    {
      driver: {
        unit: 'toneladas de celulose', volume: 10_800_000, volumeGrowth: 0.025,
        price: 0.0000032, priceGrowth: 0.025, shareOfRevenue: 0.79,
      },
      segments: [
        { name: 'Pulp', share: 0.78, margin: 0.50, growth: 0.04, marketShare: 0.28 },
        { name: 'Paper & Packaging', share: 0.22, margin: 0.28, growth: 0.05 },
      ],
      geographies: [{ name: 'Asia', share: 0.44 }, { name: 'Europe', share: 0.24 }, { name: 'Brazil', share: 0.20 }, { name: 'North America', share: 0.12 }],
      management: [
        { name: 'B. Schalka', role: 'Chief Executive Officer', since: 2013, background: 'Long-tenured industrial executive.' },
        { name: 'M. Cabral', role: 'Chief Financial Officer', since: 2019, background: 'Treasury and capital markets.' },
      ],
      ownership: [
        { holder: 'Suzano Holding (Feffer family)', kind: 'CONTROLLING', stake: 0.428 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.311 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.261 },
      ],
      peers: ['VALE3', 'RIO', 'BHP'],
    },
  ),

  bp(
    {
      ticker: 'PRIO3', name: 'PRIO', legalName: 'PRIO S.A.', exchange: 'B3', country: 'Brazil',
      sector: 'Energy', industry: 'Oil, Gas & Consumable Fuels', currency: 'BRL',
      description:
        'PRIO acquires mature offshore oil fields in the Campos Basin and revitalises them through redevelopment drilling and lower operating cost structures.',
      businessModel:
        'Buy late-life assets at a discount, cut lifting cost per barrel, add wells, and extend field life. Value creation is measured in the gap between acquisition cost per barrel and post-revitalisation cash margin.',
      competitiveAdvantages: ['Lifting cost discipline', 'Redevelopment execution track record', 'Owned FPSO capacity', 'Focused asset portfolio'],
      website: 'https://prio3.com.br', employees: 1200, foundedYear: 2015,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Rio de Janeiro, Brazil',
      themes: ['commodities'],
    },
    {
      revenue: 13800, growthPath: [1.10, 0.56, 0.18, 0.24, 0.19, 0.11],
      ebitdaMarginPath: [0.68, 0.71, 0.70, 0.72, 0.71, 0.70],
      grossMargin: 0.66, daPctRevenue: 0.19, rndPctRevenue: 0.0, taxRate: 0.28,
      capexPctRevenue: 0.30, ppePctRevenue: 1.85, intangiblesPctRevenue: 0.02,
      goodwillPctRevenue: 0.0, cashPctRevenue: 0.22, netDebtToEbitda: 0.7,
      costOfDebt: 0.136, arDays: 18, invDays: 30, apDays: 34,
      dividendPayout: 0.0, buybackPctNetIncome: 0.18, minorityPctNetIncome: 0.0,
      shares: 810, price: 41.7, beta: 1.24, annualVolatility: 0.41, priceDrift: 0.09,
      averageVolume: 12_000_000, freeFloat: 0.88,
    },
    {
      driver: {
        unit: 'barris produzidos', volume: 36_500_000, volumeGrowth: 0.09,
        price: 0.00031, priceGrowth: 0.015, shareOfRevenue: 0.97,
      },
      segments: [
        { name: 'Frade & Polvo', share: 0.34, margin: 0.66, growth: 0.03 },
        { name: 'Albacora Leste', share: 0.41, margin: 0.72, growth: 0.16 },
        { name: 'Wahoo & Development', share: 0.25, margin: 0.71, growth: 0.22 },
      ],
      geographies: [{ name: 'Brazil (Campos Basin)', share: 1.0 }],
      management: [
        { name: 'R. Rocha', role: 'Chief Executive Officer', since: 2015, background: 'Founder-operator background in offshore E&P.' },
        { name: 'M. Bassalo', role: 'Chief Financial Officer', since: 2020, background: 'Energy finance.' },
      ],
      ownership: [
        { holder: 'Founders and management', kind: 'INSIDER', stake: 0.121 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.472 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.407 },
      ],
      peers: ['PETR4', 'XOM'],
    },
  ),

  bp(
    {
      ticker: 'EQTL3', name: 'Equatorial Energia', legalName: 'Equatorial Energia S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Utilities', industry: 'Electric Utilities', currency: 'BRL',
      description:
        'Equatorial operates regulated electricity distribution concessions across northern and north-eastern Brazil, with transmission lines, sanitation and renewable generation assets.',
      businessModel:
        'Acquire underperforming distribution concessions, cut losses and outage indicators, and earn the regulated return on an expanding rate base. Growth comes from tariff-base capex and new concession auctions.',
      competitiveAdvantages: ['Turnaround playbook for distressed concessions', 'Regulatory relationships', 'Rate-base growth pipeline', 'Cost discipline in operations'],
      website: 'https://equatorialenergia.com.br', employees: 15000, foundedYear: 1999,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Luís, Brazil',
      themes: ['infrastructure', 'energy-transition'],
    },
    {
      revenue: 38200, growthPath: [0.30, 0.28, 0.22, 0.16, 0.12, 0.09],
      ebitdaMarginPath: [0.27, 0.28, 0.29, 0.30, 0.305, 0.31],
      grossMargin: 0.36, daPctRevenue: 0.075, rndPctRevenue: 0.001, taxRate: 0.24,
      capexPctRevenue: 0.19, ppePctRevenue: 1.25, intangiblesPctRevenue: 0.55,
      goodwillPctRevenue: 0.08, cashPctRevenue: 0.18, netDebtToEbitda: 3.4,
      costOfDebt: 0.1285, arDays: 52, invDays: 22, apDays: 62,
      dividendPayout: 0.28, buybackPctNetIncome: 0.02, minorityPctNetIncome: 0.06,
      shares: 1230, price: 31.5, beta: 0.78, annualVolatility: 0.27, priceDrift: 0.08,
      averageVolume: 16_000_000, freeFloat: 0.93,
    },
    {
      driver: {
        unit: 'MWh distribuídos', volume: 96_000_000, volumeGrowth: 0.032,
        price: 0.00000039, priceGrowth: 0.05, priceIndex: 'IPCA', shareOfRevenue: 0.87,
      },
      segments: [
        { name: 'Distribution', share: 0.72, margin: 0.27, growth: 0.08, marketShare: 0.14 },
        { name: 'Transmission', share: 0.13, margin: 0.72, growth: 0.10 },
        { name: 'Renewables & Sanitation', share: 0.15, margin: 0.38, growth: 0.18 },
      ],
      geographies: [{ name: 'Brazil - North/Northeast', share: 0.78 }, { name: 'Brazil - Other regions', share: 0.22 }],
      management: [
        { name: 'A. Müller', role: 'Chief Executive Officer', since: 2021, background: 'Utility operations leadership.' },
        { name: 'L. Fernandes', role: 'Chief Financial Officer', since: 2022, background: 'Infrastructure project finance.' },
      ],
      ownership: [
        { holder: 'Squadra and local funds', kind: 'INSTITUTIONAL', stake: 0.152 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.421 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.427 },
      ],
      peers: ['WEGE3', 'SUZB3'],
    },
  ),

  bp(
    {
      ticker: 'LREN3', name: 'Lojas Renner', legalName: 'Lojas Renner S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Consumer Discretionary', industry: 'Specialty Retail', currency: 'BRL',
      description:
        'Lojas Renner is a fashion retailer operating department stores across Brazil alongside a digital channel and a captive financial-services arm offering private-label credit.',
      businessModel:
        'Fast-fashion assortment turned quickly through owned stores and e-commerce, with a credit operation that lifts basket size and contributes financial margin.',
      competitiveAdvantages: ['Assortment and supply-chain speed', 'Store footprint in prime malls', 'Captive credit book', 'Loyalty data'],
      website: 'https://lojasrenner.com.br', employees: 24000, foundedYear: 1965,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Porto Alegre, Brazil',
      themes: ['consumer'],
    },
    {
      revenue: 13100, growthPath: [0.38, 0.20, 0.06, 0.03, 0.06, 0.05],
      ebitdaMarginPath: [0.20, 0.18, 0.16, 0.175, 0.19, 0.195],
      grossMargin: 0.53, daPctRevenue: 0.075, rndPctRevenue: 0.0, taxRate: 0.28,
      capexPctRevenue: 0.06, ppePctRevenue: 0.42, intangiblesPctRevenue: 0.14,
      goodwillPctRevenue: 0.05, cashPctRevenue: 0.19, netDebtToEbitda: 0.3,
      costOfDebt: 0.134, arDays: 78, invDays: 105, apDays: 88,
      dividendPayout: 0.35, buybackPctNetIncome: 0.08, minorityPctNetIncome: 0.0,
      shares: 960, price: 16.4, beta: 1.16, annualVolatility: 0.34, priceDrift: 0.05,
      averageVolume: 19_000_000, freeFloat: 0.97,
    },
    {
      driver: {
        unit: 'lojas em operação', volume: 740, volumeGrowth: 0.03,
        price: 0.0189, priceGrowth: 0.055, priceIndex: 'IPCA', shareOfRevenue: 0.72,
      },
      segments: [
        { name: 'Retail Operation', share: 0.87, margin: 0.17, growth: 0.05, marketShare: 0.08 },
        { name: 'Financial Products (Realize)', share: 0.13, margin: 0.36, growth: 0.07 },
      ],
      geographies: [{ name: 'Brazil', share: 0.97 }, { name: 'Uruguay & Argentina', share: 0.03 }],
      management: [
        { name: 'F. Chaves', role: 'Chief Executive Officer', since: 2023, background: 'Retail operations leadership.' },
        { name: 'D. Santos', role: 'Chief Financial Officer', since: 2022, background: 'Retail finance.' },
      ],
      ownership: [
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.512 },
        { holder: 'Local institutional funds', kind: 'INSTITUTIONAL', stake: 0.284 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.204 },
      ],
      peers: ['RADL3', 'ABEV3', 'RENT3'],
    },
  ),

  bp(
    {
      ticker: 'TOTS3', name: 'TOTVS', legalName: 'TOTVS S.A.', exchange: 'B3', country: 'Brazil',
      sector: 'Information Technology', industry: 'Software', currency: 'BRL',
      description:
        'TOTVS supplies enterprise management software to Brazilian small and mid-sized businesses, plus a business-performance segment and an embedded credit and payments arm.',
      businessModel:
        'Recurring subscription revenue from vertical ERP software with very low churn, extended into adjacent techfin and business-performance revenue streams sold into the same installed base.',
      competitiveAdvantages: ['Installed base and switching costs', 'Vertical depth in Brazilian tax and labour rules', 'Distribution through franchises', 'Cross-sell into techfin'],
      website: 'https://totvs.com', employees: 12000, foundedYear: 1983,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['technology', 'ai'],
    },
    {
      revenue: 6350, growthPath: [0.24, 0.28, 0.20, 0.16, 0.15, 0.14],
      ebitdaMarginPath: [0.21, 0.23, 0.245, 0.26, 0.27, 0.28],
      grossMargin: 0.70, daPctRevenue: 0.075, rndPctRevenue: 0.17, taxRate: 0.22,
      capexPctRevenue: 0.05, ppePctRevenue: 0.16, intangiblesPctRevenue: 0.42,
      goodwillPctRevenue: 0.55, cashPctRevenue: 0.24, netDebtToEbitda: 0.2,
      costOfDebt: 0.1295, arDays: 68, invDays: 0, apDays: 40,
      dividendPayout: 0.30, buybackPctNetIncome: 0.10, minorityPctNetIncome: 0.0,
      shares: 610, price: 34.8, beta: 0.92, annualVolatility: 0.32, priceDrift: 0.12,
      averageVolume: 9_000_000, freeFloat: 0.95,
    },
    {
      driver: {
        unit: 'clientes ativos', volume: 780_000, volumeGrowth: 0.06,
        price: 0.0000068, priceGrowth: 0.06, priceIndex: 'IPCA', shareOfRevenue: 0.92,
      },
      segments: [
        { name: 'Management (ERP)', share: 0.74, margin: 0.32, growth: 0.13, marketShare: 0.38 },
        { name: 'Business Performance', share: 0.14, margin: 0.20, growth: 0.19 },
        { name: 'Techfin', share: 0.12, margin: 0.24, growth: 0.26 },
      ],
      geographies: [{ name: 'Brazil', share: 0.94 }, { name: 'Latin America ex-Brazil', share: 0.06 }],
      management: [
        { name: 'D. Kim', role: 'Chief Executive Officer', since: 2022, background: 'Software product and engineering leadership.' },
        { name: 'G. Santana', role: 'Chief Financial Officer', since: 2020, background: 'Technology finance.' },
      ],
      ownership: [
        { holder: 'Founders and management', kind: 'INSIDER', stake: 0.082 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.463 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.455 },
      ],
      peers: ['MSFT', 'B3SA3', 'WEGE3'],
    },
  ),

  bp(
    {
      ticker: 'RADL3', name: 'Raia Drogasil', legalName: 'Raia Drogasil S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Consumer Staples', industry: 'Consumer Staples Distribution', currency: 'BRL',
      description:
        'Raia Drogasil is the largest pharmacy chain in Brazil, operating more than three thousand stores with a growing digital and health-services offering.',
      businessModel:
        'Store density drives footfall and negotiating power with laboratories; the mix shift toward higher-margin generics and non-pharma categories lifts gross margin per square metre.',
      competitiveAdvantages: ['Store density in high-income catchments', 'Purchasing scale with laboratories', 'Maturation curve of new stores', 'Loyalty programme data'],
      website: 'https://rd.com.br', employees: 55000, foundedYear: 2011,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['consumer', 'healthcare'],
    },
    {
      revenue: 42800, growthPath: [0.20, 0.23, 0.19, 0.14, 0.11, 0.09],
      ebitdaMarginPath: [0.085, 0.088, 0.086, 0.09, 0.092, 0.094],
      grossMargin: 0.28, daPctRevenue: 0.035, rndPctRevenue: 0.0, taxRate: 0.26,
      capexPctRevenue: 0.035, ppePctRevenue: 0.22, intangiblesPctRevenue: 0.05,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.07, netDebtToEbitda: 0.9,
      costOfDebt: 0.13, arDays: 22, invDays: 92, apDays: 78,
      dividendPayout: 0.30, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.0,
      shares: 1690, price: 17.8, beta: 0.81, annualVolatility: 0.28, priceDrift: 0.0,
      averageVolume: 15_000_000, freeFloat: 0.90,
    },
    {
      driver: {
        unit: 'lojas em operação', volume: 3100, volumeGrowth: 0.06,
        price: 0.0119, priceGrowth: 0.05, priceIndex: 'IPCA', shareOfRevenue: 0.94,
      },
      segments: [
        { name: 'Retail Pharmacy', share: 0.92, margin: 0.09, growth: 0.09, marketShare: 0.16 },
        { name: 'Digital & Health Services', share: 0.08, margin: 0.13, growth: 0.21 },
      ],
      geographies: [{ name: 'Brazil - Southeast', share: 0.62 }, { name: 'Brazil - Other regions', share: 0.38 }],
      management: [
        { name: 'M. Ferreira', role: 'Chief Executive Officer', since: 2021, background: 'Retail expansion leadership.' },
        { name: 'J. Barreto', role: 'Chief Financial Officer', since: 2019, background: 'Retail finance and IR.' },
      ],
      ownership: [
        { holder: 'Founding families', kind: 'CONTROLLING', stake: 0.221 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.402 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.377 },
      ],
      peers: ['LREN3', 'ABEV3', 'HAPV3'],
    },
  ),

  bp(
    {
      ticker: 'BPAC11', name: 'BTG Pactual', legalName: 'Banco BTG Pactual S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Financials', industry: 'Banks', currency: 'BRL',
      description:
        'BTG Pactual is an investment bank and asset manager with corporate lending, sales and trading, wealth management and a fast-growing digital retail platform.',
      businessModel:
        'Fee streams from investment banking, asset and wealth management are layered on a corporate credit book, with proprietary trading revenue adding cyclicality.',
      competitiveAdvantages: ['Partnership culture and talent retention', 'Wealth-management asset gathering', 'Corporate credit origination', 'Digital retail distribution'],
      website: 'https://btgpactual.com', employees: 7000, foundedYear: 1983,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['brazilian-banks'],
    },
    {
      revenue: 32500, growthPath: [0.28, 0.24, 0.21, 0.18, 0.15, 0.12],
      ebitdaMarginPath: [0.47, 0.48, 0.49, 0.50, 0.50, 0.49],
      grossMargin: 0.66, daPctRevenue: 0.025, rndPctRevenue: 0.0, taxRate: 0.20,
      capexPctRevenue: 0.02, ppePctRevenue: 0.06, intangiblesPctRevenue: 0.08,
      goodwillPctRevenue: 0.05, cashPctRevenue: 0.65, netDebtToEbitda: -0.6,
      costOfDebt: 0.127, arDays: 32, invDays: 0, apDays: 24,
      dividendPayout: 0.42, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.01,
      shares: 4180, price: 39.7, beta: 1.12, annualVolatility: 0.30, priceDrift: 0.13,
      averageVolume: 17_000_000, freeFloat: 0.35,
    },
    {
      segments: [
        { name: 'Investment Banking', share: 0.13, margin: 0.52, growth: 0.14 },
        { name: 'Corporate & SME Lending', share: 0.27, margin: 0.55, growth: 0.16 },
        { name: 'Asset & Wealth Management', share: 0.34, margin: 0.51, growth: 0.18 },
        { name: 'Sales & Trading and Principal Investments', share: 0.26, margin: 0.42, growth: 0.06 },
      ],
      geographies: [{ name: 'Brazil', share: 0.82 }, { name: 'Latin America ex-Brazil', share: 0.13 }, { name: 'Other', share: 0.05 }],
      management: [
        { name: 'R. Huw', role: 'Chief Executive Officer', since: 2019, background: 'Partner since the early years of the firm.' },
        { name: 'J. Marcondes', role: 'Chief Financial Officer', since: 2021, background: 'Bank finance and treasury.' },
      ],
      ownership: [
        { holder: 'Partnership (partners and founders)', kind: 'CONTROLLING', stake: 0.652 },
        { holder: 'Foreign institutional funds', kind: 'INSTITUTIONAL', stake: 0.201 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.147 },
      ],
      peers: ['ITUB4', 'BBAS3', 'B3SA3'],
    },
  ),

  bp(
    {
      ticker: 'HAPV3', name: 'Hapvida', legalName: 'Hapvida Participações e Investimentos S.A.',
      exchange: 'B3', country: 'Brazil', sector: 'Health Care', industry: 'Health Care Providers', currency: 'BRL',
      description:
        'Hapvida is a vertically integrated health-care operator combining health plans with owned hospitals, clinics and diagnostic laboratories, concentrated in the north and north-east of Brazil.',
      businessModel:
        'Owning the care network lets the insurer control the medical loss ratio directly. Profitability turns on the gap between premium repricing and medical cost inflation.',
      competitiveAdvantages: ['Vertical integration of network and plan', 'Cost per member in owned facilities', 'Regional density', 'Scale after consolidation'],
      website: 'https://hapvida.com.br', employees: 88000, foundedYear: 1979,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Fortaleza, Brazil',
      themes: ['healthcare', 'consumer'],
    },
    {
      revenue: 32200, growthPath: [0.42, 0.68, 0.11, 0.08, 0.09, 0.08],
      ebitdaMarginPath: [0.16, 0.09, 0.10, 0.125, 0.14, 0.15],
      grossMargin: 0.26, daPctRevenue: 0.055, rndPctRevenue: 0.0, taxRate: 0.20,
      capexPctRevenue: 0.045, ppePctRevenue: 0.36, intangiblesPctRevenue: 0.30,
      goodwillPctRevenue: 0.95, cashPctRevenue: 0.09, netDebtToEbitda: 1.9,
      costOfDebt: 0.142, arDays: 26, invDays: 18, apDays: 44,
      dividendPayout: 0.15, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.01,
      shares: 7450, price: 3.42, beta: 1.28, annualVolatility: 0.42, priceDrift: 0.06,
      averageVolume: 40_000_000, freeFloat: 0.31,
    },
    {
      driver: {
        unit: 'beneficiários', volume: 16_200_000, volumeGrowth: 0.03,
        price: 0.00000175, priceGrowth: 0.075, priceIndex: 'IPCA', shareOfRevenue: 0.88,
      },
      segments: [
        { name: 'Health Plans', share: 0.86, margin: 0.14, growth: 0.08, marketShare: 0.17 },
        { name: 'Dental Plans', share: 0.06, margin: 0.30, growth: 0.11 },
        { name: 'Hospitals & Diagnostics (third-party)', share: 0.08, margin: 0.17, growth: 0.06 },
      ],
      geographies: [{ name: 'Brazil - North/Northeast', share: 0.54 }, { name: 'Brazil - Southeast', share: 0.34 }, { name: 'Brazil - Other', share: 0.12 }],
      management: [
        { name: 'J. Pinheiro', role: 'Chief Executive Officer', since: 2018, background: 'Founding-family operator.' },
        { name: 'M. Ávila', role: 'Chief Financial Officer', since: 2022, background: 'Healthcare finance.' },
      ],
      ownership: [
        { holder: 'Pinheiro family', kind: 'CONTROLLING', stake: 0.417 },
        { holder: 'Former NotreDame shareholders', kind: 'INSTITUTIONAL', stake: 0.192 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.391 },
      ],
      peers: ['RADL3', 'LREN3'],
    },
  ),

  /* ------------------------------- GLOBAL ------------------------------- */
  bp(
    {
      ticker: 'AAPL', name: 'Apple', legalName: 'Apple Inc.', exchange: 'NASDAQ', country: 'United States',
      sector: 'Information Technology', industry: 'Technology Hardware', currency: 'USD',
      accountingStandard: GAAP,
      description:
        'Apple designs and sells smartphones, personal computers, tablets, wearables and an expanding portfolio of software services delivered to its installed base.',
      businessModel:
        'Hardware sold at premium prices creates an installed base that is monetised again through high-margin services. Silicon design and supply-chain control protect gross margin.',
      competitiveAdvantages: ['Installed base and switching costs', 'In-house silicon', 'Brand pricing power', 'Services attach rate'],
      website: 'https://apple.com', employees: 164000, foundedYear: 1976,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Cupertino, United States',
      themes: ['technology', 'ai', 'consumer'],
    },
    {
      revenue: 416000, growthPath: [0.33, 0.08, -0.03, 0.02, 0.06, 0.05],
      ebitdaMarginPath: [0.325, 0.335, 0.345, 0.35, 0.355, 0.36],
      grossMargin: 0.465, daPctRevenue: 0.028, rndPctRevenue: 0.085, taxRate: 0.16,
      capexPctRevenue: 0.028, ppePctRevenue: 0.11, intangiblesPctRevenue: 0.0,
      goodwillPctRevenue: 0.0, cashPctRevenue: 0.14, otherAssetsPctRevenue: 0.30, netDebtToEbitda: 0.1,
      costOfDebt: 0.045, arDays: 58, invDays: 11, apDays: 106,
      dividendPayout: 0.16, buybackPctNetIncome: 0.75, minorityPctNetIncome: 0.0,
      shares: 14800, price: 246.3, beta: 1.12, annualVolatility: 0.25, priceDrift: 0.09,
      averageVolume: 52_000_000, freeFloat: 0.99,
    },
    {
      driver: {
        unit: 'dispositivos vendidos', volume: 248_000_000, volumeGrowth: 0.02,
        price: 0.00000107, priceGrowth: 0.03, shareOfRevenue: 0.76,
      },
      segments: [
        { name: 'iPhone', share: 0.51, margin: 0.38, growth: 0.03, marketShare: 0.19 },
        { name: 'Services', share: 0.26, margin: 0.55, growth: 0.12 },
        { name: 'Mac', share: 0.08, margin: 0.32, growth: 0.02 },
        { name: 'iPad', share: 0.07, margin: 0.30, growth: 0.01 },
        { name: 'Wearables, Home & Accessories', share: 0.08, margin: 0.31, growth: 0.02 },
      ],
      geographies: [{ name: 'Americas', share: 0.43 }, { name: 'Europe', share: 0.26 }, { name: 'Greater China', share: 0.17 }, { name: 'Japan', share: 0.07 }, { name: 'Rest of Asia Pacific', share: 0.07 }],
      management: [
        { name: 'T. Nakamura', role: 'Chief Executive Officer', since: 2011, background: 'Operations and supply-chain leadership.' },
        { name: 'K. Parekh', role: 'Chief Financial Officer', since: 2025, background: 'Long-tenured corporate controller.' },
      ],
      ownership: [
        { holder: 'Vanguard funds', kind: 'INSTITUTIONAL', stake: 0.088 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.071 },
        { holder: 'Berkshire Hathaway', kind: 'INSTITUTIONAL', stake: 0.024 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.817 },
      ],
      peers: ['MSFT', 'GOOGL', 'NVDA', 'AMZN'],
    },
  ),

  bp(
    {
      ticker: 'MSFT', name: 'Microsoft', legalName: 'Microsoft Corporation', exchange: 'NASDAQ',
      country: 'United States', sector: 'Information Technology', industry: 'Software', currency: 'USD',
      accountingStandard: GAAP,
      description:
        'Microsoft sells cloud infrastructure and platform services, productivity software, developer tools, security products, gaming and advertising to enterprises and consumers worldwide.',
      businessModel:
        'Enterprise agreements bundle productivity, security and cloud consumption into multi-year recurring commitments, with AI services layered onto the same contracts.',
      competitiveAdvantages: ['Enterprise distribution and bundling', 'Switching costs in productivity and identity', 'Hyperscale cloud footprint', 'Developer ecosystem'],
      website: 'https://microsoft.com', employees: 228000, foundedYear: 1975,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Redmond, United States',
      themes: ['technology', 'ai'],
    },
    {
      revenue: 298000, growthPath: [0.18, 0.18, 0.07, 0.16, 0.15, 0.14],
      ebitdaMarginPath: [0.50, 0.50, 0.49, 0.51, 0.525, 0.53],
      grossMargin: 0.695, daPctRevenue: 0.085, rndPctRevenue: 0.125, taxRate: 0.18,
      capexPctRevenue: 0.22, ppePctRevenue: 0.62, intangiblesPctRevenue: 0.09,
      goodwillPctRevenue: 0.40, cashPctRevenue: 0.25, otherAssetsPctRevenue: 0.32, netDebtToEbitda: -0.1,
      costOfDebt: 0.0445, arDays: 78, invDays: 6, apDays: 92,
      dividendPayout: 0.25, buybackPctNetIncome: 0.28, minorityPctNetIncome: 0.0,
      shares: 7430, price: 512.4, beta: 0.98, annualVolatility: 0.24, priceDrift: 0.11,
      averageVolume: 21_000_000, freeFloat: 0.99,
    },
    {
      segments: [
        { name: 'Intelligent Cloud', share: 0.44, margin: 0.48, growth: 0.20, marketShare: 0.24 },
        { name: 'Productivity & Business Processes', share: 0.33, margin: 0.55, growth: 0.12 },
        { name: 'More Personal Computing', share: 0.23, margin: 0.32, growth: 0.04 },
      ],
      geographies: [{ name: 'United States', share: 0.51 }, { name: 'Europe', share: 0.22 }, { name: 'Asia Pacific', share: 0.17 }, { name: 'Other', share: 0.10 }],
      management: [
        { name: 'S. Rao', role: 'Chief Executive Officer', since: 2014, background: 'Cloud and enterprise leadership.' },
        { name: 'A. Hood', role: 'Chief Financial Officer', since: 2013, background: 'Capital markets and corporate finance.' },
      ],
      ownership: [
        { holder: 'Vanguard funds', kind: 'INSTITUTIONAL', stake: 0.091 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.074 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.835 },
      ],
      peers: ['AAPL', 'GOOGL', 'NVDA', 'AMZN'],
    },
  ),

  bp(
    {
      ticker: 'NVDA', name: 'NVIDIA', legalName: 'NVIDIA Corporation', exchange: 'NASDAQ',
      country: 'United States', sector: 'Information Technology', industry: 'Semiconductors', currency: 'USD',
      accountingStandard: GAAP,
      description:
        'NVIDIA designs accelerated-computing platforms — GPUs, networking and the software stack around them — used for artificial-intelligence training and inference, graphics and scientific computing.',
      businessModel:
        'Full-stack platform sales: silicon paired with a proprietary software layer that keeps developers on the platform. Pricing power reflects a supply-constrained market for accelerators.',
      competitiveAdvantages: ['CUDA software moat', 'Systems-level integration with networking', 'Foundry allocation and packaging capacity', 'Developer ecosystem'],
      website: 'https://nvidia.com', employees: 36000, foundedYear: 1993,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Santa Clara, United States',
      themes: ['ai', 'technology'],
    },
    {
      revenue: 214000, growthPath: [0.61, 0.00, 1.26, 1.14, 0.55, 0.31],
      ebitdaMarginPath: [0.42, 0.28, 0.58, 0.64, 0.655, 0.645],
      grossMargin: 0.745, daPctRevenue: 0.022, rndPctRevenue: 0.098, taxRate: 0.17,
      capexPctRevenue: 0.05, ppePctRevenue: 0.11, intangiblesPctRevenue: 0.02,
      goodwillPctRevenue: 0.05, cashPctRevenue: 0.22, otherAssetsPctRevenue: 0.28, netDebtToEbitda: -0.3,
      costOfDebt: 0.046, arDays: 52, invDays: 82, apDays: 46,
      dividendPayout: 0.01, buybackPctNetIncome: 0.35, minorityPctNetIncome: 0.0,
      shares: 24400, price: 178.9, beta: 1.72, annualVolatility: 0.47, priceDrift: 0.18,
      averageVolume: 220_000_000, freeFloat: 0.96,
    },
    {
      driver: {
        unit: 'GPUs de data center', volume: 4_100_000, volumeGrowth: 0.35,
        price: 0.0000288, priceGrowth: 0.02, shareOfRevenue: 0.87,
      },
      segments: [
        { name: 'Data Center', share: 0.88, margin: 0.68, growth: 0.34, marketShare: 0.82 },
        { name: 'Gaming', share: 0.08, margin: 0.42, growth: 0.05 },
        { name: 'Professional Visualization & Automotive', share: 0.04, margin: 0.38, growth: 0.12 },
      ],
      geographies: [{ name: 'United States', share: 0.46 }, { name: 'Singapore & Taiwan', share: 0.28 }, { name: 'China', share: 0.11 }, { name: 'Other', share: 0.15 }],
      management: [
        { name: 'J. Huang', role: 'Chief Executive Officer', since: 1993, background: 'Co-founder, semiconductor engineer.' },
        { name: 'C. Kress', role: 'Chief Financial Officer', since: 2013, background: 'Technology finance leadership.' },
      ],
      ownership: [
        { holder: 'Vanguard funds', kind: 'INSTITUTIONAL', stake: 0.083 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.069 },
        { holder: 'Founder and insiders', kind: 'INSIDER', stake: 0.038 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.810 },
      ],
      peers: ['MSFT', 'AAPL', 'GOOGL'],
    },
  ),

  bp(
    {
      ticker: 'GOOGL', name: 'Alphabet', legalName: 'Alphabet Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Communication Services', industry: 'Interactive Media', currency: 'USD',
      accountingStandard: GAAP,
      description:
        'Alphabet operates search and advertising, YouTube, an enterprise cloud business, the Android and Chrome platforms, and a portfolio of longer-horizon technology bets.',
      businessModel:
        'Search intent is monetised through auction-priced advertising at very high incremental margin, funding cloud infrastructure and research investment.',
      competitiveAdvantages: ['Search query share and data feedback loop', 'Distribution through Android and Chrome', 'Advertising auction depth', 'AI research capability'],
      website: 'https://abc.xyz', employees: 187000, foundedYear: 1998,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Mountain View, United States',
      themes: ['ai', 'technology'],
    },
    {
      revenue: 412000, growthPath: [0.41, 0.10, 0.09, 0.14, 0.13, 0.12],
      ebitdaMarginPath: [0.365, 0.34, 0.355, 0.38, 0.395, 0.40],
      grossMargin: 0.585, daPctRevenue: 0.075, rndPctRevenue: 0.145, taxRate: 0.17,
      capexPctRevenue: 0.19, ppePctRevenue: 0.52, intangiblesPctRevenue: 0.01,
      goodwillPctRevenue: 0.08, cashPctRevenue: 0.24, otherAssetsPctRevenue: 0.28, netDebtToEbitda: -0.4,
      costOfDebt: 0.0445, arDays: 62, invDays: 4, apDays: 38,
      dividendPayout: 0.08, buybackPctNetIncome: 0.55, minorityPctNetIncome: 0.0,
      shares: 12100, price: 254.8, beta: 1.05, annualVolatility: 0.28, priceDrift: 0.12,
      averageVolume: 29_000_000, freeFloat: 0.94,
    },
    {
      segments: [
        { name: 'Google Search & Other', share: 0.56, margin: 0.48, growth: 0.11, marketShare: 0.89 },
        { name: 'YouTube Ads', share: 0.10, margin: 0.32, growth: 0.13 },
        { name: 'Google Network', share: 0.06, margin: 0.28, growth: -0.02 },
        { name: 'Google Cloud', share: 0.16, margin: 0.22, growth: 0.29 },
        { name: 'Subscriptions, Platforms & Devices', share: 0.12, margin: 0.24, growth: 0.16 },
      ],
      geographies: [{ name: 'United States', share: 0.48 }, { name: 'EMEA', share: 0.29 }, { name: 'APAC', share: 0.17 }, { name: 'Other Americas', share: 0.06 }],
      management: [
        { name: 'S. Pillai', role: 'Chief Executive Officer', since: 2015, background: 'Product leadership across search and platforms.' },
        { name: 'A. Ashkenazi', role: 'Chief Financial Officer', since: 2021, background: 'Technology and biotech finance.' },
      ],
      ownership: [
        { holder: 'Founders (super-voting)', kind: 'INSIDER', stake: 0.118 },
        { holder: 'Vanguard funds', kind: 'INSTITUTIONAL', stake: 0.076 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.062 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.744 },
      ],
      peers: ['MSFT', 'META', 'AMZN', 'AAPL'],
    },
  ),

  bp(
    {
      ticker: 'AMZN', name: 'Amazon', legalName: 'Amazon.com, Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Consumer Discretionary', industry: 'Broadline Retail', currency: 'USD',
      accountingStandard: GAAP,
      description:
        'Amazon operates online and physical retail, a third-party seller marketplace with logistics services, advertising, subscription services and Amazon Web Services.',
      businessModel:
        'Retail scale funds a logistics network that third-party sellers rent, while advertising and AWS provide the profit pool. Free cash flow follows the capex cycle in fulfilment and cloud.',
      competitiveAdvantages: ['Fulfilment network density', 'Marketplace flywheel', 'AWS scale and switching costs', 'Prime subscription retention'],
      website: 'https://amazon.com', employees: 1_550_000, foundedYear: 1994,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Seattle, United States',
      themes: ['technology', 'consumer', 'ai'],
    },
    {
      revenue: 712000, growthPath: [0.22, 0.09, 0.12, 0.11, 0.10, 0.09],
      ebitdaMarginPath: [0.135, 0.115, 0.155, 0.185, 0.20, 0.205],
      grossMargin: 0.485, daPctRevenue: 0.077, rndPctRevenue: 0.125, taxRate: 0.20,
      capexPctRevenue: 0.115, ppePctRevenue: 0.48, intangiblesPctRevenue: 0.01,
      goodwillPctRevenue: 0.035, cashPctRevenue: 0.12, otherAssetsPctRevenue: 0.10, netDebtToEbitda: 0.2,
      costOfDebt: 0.047, arDays: 32, invDays: 38, apDays: 78,
      dividendPayout: 0.0, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.0,
      shares: 10700, price: 231.6, beta: 1.24, annualVolatility: 0.30, priceDrift: 0.10,
      averageVolume: 42_000_000, freeFloat: 0.89,
    },
    {
      segments: [
        { name: 'North America Retail', share: 0.60, margin: 0.11, growth: 0.08, marketShare: 0.38 },
        { name: 'International Retail', share: 0.22, margin: 0.05, growth: 0.09 },
        { name: 'AWS', share: 0.18, margin: 0.38, growth: 0.19 },
      ],
      geographies: [{ name: 'United States', share: 0.69 }, { name: 'Germany & UK', share: 0.14 }, { name: 'Japan', share: 0.05 }, { name: 'Other', share: 0.12 }],
      management: [
        { name: 'A. Jassy', role: 'Chief Executive Officer', since: 2021, background: 'Founded and led the cloud business.' },
        { name: 'B. Olsavsky', role: 'Chief Financial Officer', since: 2015, background: 'Operations finance.' },
      ],
      ownership: [
        { holder: 'Founder and insiders', kind: 'INSIDER', stake: 0.091 },
        { holder: 'Vanguard funds', kind: 'INSTITUTIONAL', stake: 0.073 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.836 },
      ],
      peers: ['GOOGL', 'MSFT', 'META'],
    },
  ),

  bp(
    {
      ticker: 'META', name: 'Meta Platforms', legalName: 'Meta Platforms, Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Communication Services', industry: 'Interactive Media', currency: 'USD',
      accountingStandard: GAAP,
      description:
        'Meta operates Facebook, Instagram, WhatsApp and Messenger, monetised primarily through advertising, alongside a reality-labs hardware and platform segment.',
      businessModel:
        'Engagement across four billion users is sold to advertisers through a ranking system that improves with data and compute. Reality Labs is a long-duration investment funded by the advertising business.',
      competitiveAdvantages: ['User network effects', 'Ad ranking and measurement stack', 'Capital scale in AI infrastructure', 'Creator and messaging ecosystems'],
      website: 'https://meta.com', employees: 76000, foundedYear: 2004,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Menlo Park, United States',
      themes: ['ai', 'technology'],
    },
    {
      revenue: 205000, growthPath: [0.37, -0.01, 0.16, 0.21, 0.17, 0.14],
      ebitdaMarginPath: [0.50, 0.40, 0.47, 0.52, 0.535, 0.53],
      grossMargin: 0.81, daPctRevenue: 0.115, rndPctRevenue: 0.245, taxRate: 0.15,
      capexPctRevenue: 0.28, ppePctRevenue: 0.72, intangiblesPctRevenue: 0.01,
      goodwillPctRevenue: 0.10, cashPctRevenue: 0.22, otherAssetsPctRevenue: 0.22, netDebtToEbitda: -0.1,
      costOfDebt: 0.0475, arDays: 58, invDays: 0, apDays: 32,
      dividendPayout: 0.06, buybackPctNetIncome: 0.48, minorityPctNetIncome: 0.0,
      shares: 2520, price: 684.5, beta: 1.30, annualVolatility: 0.34, priceDrift: 0.13,
      averageVolume: 14_000_000, freeFloat: 0.87,
    },
    {
      segments: [
        { name: 'Family of Apps', share: 0.99, margin: 0.56, growth: 0.14, marketShare: 0.21 },
        { name: 'Reality Labs', share: 0.01, margin: -3.2, growth: 0.09 },
      ],
      geographies: [{ name: 'United States & Canada', share: 0.42 }, { name: 'Europe', share: 0.23 }, { name: 'Asia-Pacific', share: 0.24 }, { name: 'Rest of world', share: 0.11 }],
      management: [
        { name: 'M. Zuckerberg', role: 'Chief Executive Officer', since: 2004, background: 'Founder.' },
        { name: 'S. Li', role: 'Chief Financial Officer', since: 2022, background: 'Technology finance leadership.' },
      ],
      ownership: [
        { holder: 'Founder (super-voting)', kind: 'INSIDER', stake: 0.134 },
        { holder: 'Vanguard funds', kind: 'INSTITUTIONAL', stake: 0.078 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.788 },
      ],
      peers: ['GOOGL', 'MSFT', 'AMZN'],
    },
  ),

  bp(
    {
      ticker: 'RIO', name: 'Rio Tinto', legalName: 'Rio Tinto plc', exchange: 'LSE', country: 'United Kingdom',
      sector: 'Materials', industry: 'Metals & Mining', currency: 'USD',
      description:
        'Rio Tinto produces iron ore, aluminium, copper and minerals, with the Pilbara iron ore system in Western Australia as its principal cash generator.',
      businessModel:
        'Low-cost, long-life ore bodies with integrated rail and port infrastructure. Earnings track the iron ore benchmark and the aluminium price relative to energy costs.',
      competitiveAdvantages: ['Pilbara cost position', 'Integrated infrastructure', 'Portfolio diversification into copper', 'Balance-sheet capacity'],
      website: 'https://riotinto.com', employees: 58000, foundedYear: 1873,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'London, United Kingdom',
      themes: ['commodities', 'energy-transition'],
    },
    {
      revenue: 53800, growthPath: [0.42, -0.13, -0.03, 0.02, 0.03, 0.01],
      ebitdaMarginPath: [0.55, 0.44, 0.42, 0.41, 0.40, 0.39],
      grossMargin: 0.46, daPctRevenue: 0.095, rndPctRevenue: 0.003, taxRate: 0.30,
      capexPctRevenue: 0.19, ppePctRevenue: 1.20, intangiblesPctRevenue: 0.02,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.11, netDebtToEbitda: 0.5,
      costOfDebt: 0.049, arDays: 26, invDays: 58, apDays: 44,
      dividendPayout: 0.60, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.05,
      shares: 1620, price: 63.8, beta: 1.08, annualVolatility: 0.28, priceDrift: 0.0,
      averageVolume: 6_000_000, freeFloat: 0.97,
    },
    {
      driver: {
        unit: 'toneladas de minério', volume: 330_000_000, volumeGrowth: 0.008,
        price: 0.000166, priceGrowth: 0.018, shareOfRevenue: 0.66,
      },
      segments: [
        { name: 'Iron Ore', share: 0.58, margin: 0.53, growth: 0.0, marketShare: 0.21 },
        { name: 'Aluminium', share: 0.23, margin: 0.24, growth: 0.04 },
        { name: 'Copper', share: 0.13, margin: 0.38, growth: 0.11 },
        { name: 'Minerals', share: 0.06, margin: 0.22, growth: 0.02 },
      ],
      geographies: [{ name: 'China', share: 0.55 }, { name: 'Other Asia', share: 0.16 }, { name: 'Europe', share: 0.14 }, { name: 'Americas', share: 0.15 }],
      management: [
        { name: 'J. Stausholm', role: 'Chief Executive Officer', since: 2021, background: 'Former group CFO.' },
        { name: 'P. Cunningham', role: 'Chief Financial Officer', since: 2021, background: 'Mining finance.' },
      ],
      ownership: [
        { holder: 'Chinalco', kind: 'INSTITUTIONAL', stake: 0.145 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.081 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.774 },
      ],
      peers: ['VALE3', 'BHP', 'FCX'],
    },
  ),

  bp(
    {
      ticker: 'BHP', name: 'BHP Group', legalName: 'BHP Group Limited', exchange: 'ASX', country: 'Australia',
      sector: 'Materials', industry: 'Metals & Mining', currency: 'USD',
      description:
        'BHP is a diversified resources company producing iron ore, copper, metallurgical coal and potash, with assets concentrated in Australia, Chile and Canada.',
      businessModel:
        'Large, long-life, low-cost ore bodies operated for volume and cost per tonne. Capital is allocated between shareholder returns and copper and potash growth.',
      competitiveAdvantages: ['Western Australia iron ore cost position', 'Copper resource base in Chile', 'Operating discipline', 'Balance-sheet strength'],
      website: 'https://bhp.com', employees: 49000, foundedYear: 1885,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Melbourne, Australia',
      themes: ['commodities', 'energy-transition'],
    },
    {
      revenue: 55200, growthPath: [0.42, -0.16, -0.01, 0.03, 0.02, 0.02],
      ebitdaMarginPath: [0.58, 0.50, 0.48, 0.485, 0.47, 0.46],
      grossMargin: 0.50, daPctRevenue: 0.10, rndPctRevenue: 0.002, taxRate: 0.31,
      capexPctRevenue: 0.20, ppePctRevenue: 1.28, intangiblesPctRevenue: 0.01,
      goodwillPctRevenue: 0.0, cashPctRevenue: 0.13, netDebtToEbitda: 0.4,
      costOfDebt: 0.0485, arDays: 24, invDays: 52, apDays: 46,
      dividendPayout: 0.62, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.06,
      shares: 5070, price: 26.4, beta: 1.02, annualVolatility: 0.27, priceDrift: 0.01,
      averageVolume: 9_000_000, freeFloat: 0.98,
    },
    {
      driver: {
        unit: 'toneladas de minério', volume: 295_000_000, volumeGrowth: 0.01,
        price: 0.00019, priceGrowth: 0.018, shareOfRevenue: 0.63,
      },
      segments: [
        { name: 'Iron Ore', share: 0.51, margin: 0.60, growth: 0.01, marketShare: 0.18 },
        { name: 'Copper', share: 0.32, margin: 0.42, growth: 0.08 },
        { name: 'Coal', share: 0.12, margin: 0.30, growth: -0.04 },
        { name: 'Potash & Other', share: 0.05, margin: 0.18, growth: 0.15 },
      ],
      geographies: [{ name: 'China', share: 0.60 }, { name: 'Japan & Korea', share: 0.14 }, { name: 'Europe', share: 0.10 }, { name: 'Other', share: 0.16 }],
      management: [
        { name: 'M. Henry', role: 'Chief Executive Officer', since: 2020, background: 'Career operator across minerals.' },
        { name: 'V. Pant', role: 'Chief Financial Officer', since: 2021, background: 'Group finance.' },
      ],
      ownership: [
        { holder: 'Australian superannuation funds', kind: 'INSTITUTIONAL', stake: 0.192 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.072 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.736 },
      ],
      peers: ['VALE3', 'RIO', 'FCX'],
    },
  ),

  bp(
    {
      ticker: 'FCX', name: 'Freeport-McMoRan', legalName: 'Freeport-McMoRan Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Materials', industry: 'Metals & Mining', currency: 'USD',
      accountingStandard: GAAP,
      description:
        'Freeport-McMoRan mines copper, gold and molybdenum, with the Grasberg district in Indonesia and a portfolio of North and South American copper operations.',
      businessModel:
        'Copper volumes leveraged to the LME price with a high fixed-cost base, so cash margin expands sharply when the copper price rises above the cost curve.',
      competitiveAdvantages: ['Grasberg ore grade', 'Leaching technology on existing stockpiles', 'Copper exposure without diversification drag', 'US-based smelting relationships'],
      website: 'https://fcx.com', employees: 27000, foundedYear: 1912,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Phoenix, United States',
      themes: ['commodities', 'energy-transition'],
    },
    {
      revenue: 27400, growthPath: [0.61, 0.0, -0.02, 0.11, 0.09, 0.06],
      ebitdaMarginPath: [0.42, 0.35, 0.33, 0.36, 0.38, 0.375],
      grossMargin: 0.38, daPctRevenue: 0.085, rndPctRevenue: 0.0, taxRate: 0.35,
      capexPctRevenue: 0.17, ppePctRevenue: 1.10, intangiblesPctRevenue: 0.0,
      goodwillPctRevenue: 0.0, cashPctRevenue: 0.17, netDebtToEbitda: 0.3,
      costOfDebt: 0.058, arDays: 22, invDays: 96, apDays: 40,
      dividendPayout: 0.28, buybackPctNetIncome: 0.06, minorityPctNetIncome: 0.22,
      shares: 1440, price: 47.2, beta: 1.61, annualVolatility: 0.40, priceDrift: 0.06,
      averageVolume: 18_000_000, freeFloat: 0.99,
    },
    {
      driver: {
        unit: 'libras de cobre', volume: 4_200_000_000, volumeGrowth: 0.02,
        price: 0.0000000055, priceGrowth: 0.022, shareOfRevenue: 0.72,
      },
      segments: [
        { name: 'North America Copper', share: 0.31, margin: 0.28, growth: 0.04, marketShare: 0.06 },
        { name: 'South America Copper', share: 0.24, margin: 0.34, growth: 0.03 },
        { name: 'Indonesia (Grasberg)', share: 0.38, margin: 0.52, growth: 0.09 },
        { name: 'Molybdenum & Other', share: 0.07, margin: 0.22, growth: 0.02 },
      ],
      geographies: [{ name: 'Asia', share: 0.44 }, { name: 'United States', share: 0.33 }, { name: 'Europe', share: 0.13 }, { name: 'Other', share: 0.10 }],
      management: [
        { name: 'K. Quirk', role: 'Chief Executive Officer', since: 2022, background: 'Former group CFO.' },
        { name: 'M. Arnold', role: 'Chief Financial Officer', since: 2022, background: 'Mining finance.' },
      ],
      ownership: [
        { holder: 'Vanguard funds', kind: 'INSTITUTIONAL', stake: 0.094 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.077 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.829 },
      ],
      peers: ['VALE3', 'RIO', 'BHP'],
    },
  ),

  bp(
    {
      ticker: 'XOM', name: 'Exxon Mobil', legalName: 'Exxon Mobil Corporation', exchange: 'NYSE',
      country: 'United States', sector: 'Energy', industry: 'Oil, Gas & Consumable Fuels', currency: 'USD',
      accountingStandard: GAAP,
      description:
        'Exxon Mobil explores for and produces crude oil and natural gas, refines petroleum products and manufactures chemicals, with growth concentrated in Guyana and the Permian basin.',
      businessModel:
        'Integrated upstream, product-solutions and chemical operations smooth commodity cycles. Returns hinge on the cost of supply of new barrels and refining crack spreads.',
      competitiveAdvantages: ['Guyana and Permian cost of supply', 'Integration across refining and chemicals', 'Project execution capability', 'Balance-sheet capacity through the cycle'],
      website: 'https://corporate.exxonmobil.com', employees: 62000, foundedYear: 1870,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Spring, United States',
      themes: ['commodities'],
    },
    {
      revenue: 342000, growthPath: [0.45, -0.17, -0.02, 0.04, 0.02, -0.01],
      ebitdaMarginPath: [0.235, 0.20, 0.19, 0.195, 0.192, 0.19],
      grossMargin: 0.30, daPctRevenue: 0.055, rndPctRevenue: 0.003, taxRate: 0.34,
      capexPctRevenue: 0.075, ppePctRevenue: 0.75, intangiblesPctRevenue: 0.0,
      goodwillPctRevenue: 0.0, cashPctRevenue: 0.07, otherAssetsPctRevenue: 0.15, netDebtToEbitda: 0.4,
      costOfDebt: 0.048, arDays: 34, invDays: 30, apDays: 58,
      dividendPayout: 0.45, buybackPctNetIncome: 0.35, minorityPctNetIncome: 0.03,
      shares: 4290, price: 118.4, beta: 0.88, annualVolatility: 0.24, priceDrift: 0.04,
      averageVolume: 16_000_000, freeFloat: 0.99,
    },
    {
      driver: {
        unit: 'barris de óleo equivalente', volume: 1_420_000_000, volumeGrowth: 0.012,
        price: 0.00013, priceGrowth: 0.015, shareOfRevenue: 0.61,
      },
      segments: [
        { name: 'Upstream', share: 0.28, margin: 0.38, growth: 0.03, marketShare: 0.03 },
        { name: 'Product Solutions', share: 0.61, margin: 0.07, growth: -0.02 },
        { name: 'Chemical Products', share: 0.11, margin: 0.10, growth: 0.02 },
      ],
      geographies: [{ name: 'United States', share: 0.41 }, { name: 'Europe', share: 0.19 }, { name: 'Asia Pacific', share: 0.22 }, { name: 'Other', share: 0.18 }],
      management: [
        { name: 'D. Woods', role: 'Chief Executive Officer', since: 2017, background: 'Refining and chemicals leadership.' },
        { name: 'K. Mikells', role: 'Chief Financial Officer', since: 2021, background: 'Consumer and energy finance.' },
      ],
      ownership: [
        { holder: 'Vanguard funds', kind: 'INSTITUTIONAL', stake: 0.092 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.068 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.840 },
      ],
      peers: ['PETR4', 'PRIO3'],
    },
  ),

  bp(
    {
      ticker: 'ECOR3', name: 'Ecorodovias', legalName: 'Ecorodovias Infraestrutura e Logística S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Industrials', industry: 'Transportation Infrastructure', currency: 'BRL',
      description:
        'Ecorodovias operates toll road concessions across Brazil, collecting tariffs on federal and state highways under long-dated contracts with defined investment obligations.',
      businessModel:
        'Tariffs are set by contract and indexed to inflation; returns depend on traffic growth, the capital programme each concession commits to, and the cost of the debt that funds it.',
      competitiveAdvantages: ['Long-dated indexed concession contracts', 'Traffic density on core corridors', 'Track record in auction bidding', 'Operating scale across a road portfolio'],
      website: 'https://ecorodovias.com', employees: 6200, foundedYear: 1997,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['infrastructure'],
    },
    {
      revenue: 5480, growthPath: [0.11, 0.18, 0.09, 0.13, 0.07, 0.06],
      ebitdaMarginPath: [0.58, 0.6, 0.61, 0.62, 0.61, 0.6],
      grossMargin: 0.44, daPctRevenue: 0.2, rndPctRevenue: 0, taxRate: 0.34,
      capexPctRevenue: 0.3, ppePctRevenue: 2.1, intangiblesPctRevenue: 0.3,
      goodwillPctRevenue: 0.04, cashPctRevenue: 0.12, netDebtToEbitda: 3.4,
      costOfDebt: 0.139, arDays: 19, invDays: 0, apDays: 24,
      dividendPayout: 0.2, buybackPctNetIncome: 0, minorityPctNetIncome: 0.03,
      shares: 1113, price: 7.58, beta: 0.92, annualVolatility: 0.32, priceDrift: -0.02,
      averageVolume: 12_000_000, freeFloat: 0.36,
    },
    {
      driver: {
        unit: 'veículos equivalentes', volume: 900_000_000, volumeGrowth: 0.025,
        price: 0.0000061, priceGrowth: 0.045, priceIndex: 'IPCA', shareOfRevenue: 0.88,
      },
      segments: [
        { name: 'Ecovias Imigrantes', share: 0.24, margin: 0.72, growth: 0.05 },
        { name: 'Eco050 e Eco135', share: 0.21, margin: 0.58, growth: 0.08 },
        { name: 'Ecovia e Ecocataratas', share: 0.19, margin: 0.56, growth: 0.04 },
        { name: 'Ecoponte e Ecoporto', share: 0.18, margin: 0.49, growth: 0.03 },
        { name: 'Demais concessões', share: 0.18, margin: 0.52, growth: 0.09 },
      ],
      geographies: [{ name: 'São Paulo', share: 0.38 }, { name: 'Minas Gerais', share: 0.24 }, { name: 'Paraná', share: 0.19 }, { name: 'Rio de Janeiro', share: 0.12 }, { name: 'Outros', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Primav Infraestrutura', kind: 'CONTROLLING', stake: 0.64 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.121 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.093 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.146 },
      ],
      peers: ['CCRO3', 'RAIL3', 'EQTL3', 'TAEE11'],
    },
  ),
  bp(
    {
      ticker: 'CCRO3', name: 'CCR', legalName: 'CCR S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Industrials', industry: 'Transportation Infrastructure', currency: 'BRL',
      description:
        'CCR holds a portfolio of toll road, urban mobility and airport concessions in Brazil and abroad, operating the largest private road network in the country.',
      businessModel:
        'A diversified concession portfolio smooths the bidding cycle: mature roads fund the capital programmes of newer contracts, and airports and metro lines add non-correlated traffic.',
      competitiveAdvantages: ['Largest private road network in Brazil', 'Diversification across roads, airports and mobility', 'Access to long-tenor infrastructure debt', 'Auction execution record'],
      website: 'https://ccr.com', employees: 14500, foundedYear: 1998,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['infrastructure'],
    },
    {
      revenue: 15800, growthPath: [0.14, 0.16, 0.1, 0.09, 0.08, 0.07],
      ebitdaMarginPath: [0.56, 0.57, 0.58, 0.58, 0.57, 0.57],
      grossMargin: 0.42, daPctRevenue: 0.19, rndPctRevenue: 0, taxRate: 0.34,
      capexPctRevenue: 0.26, ppePctRevenue: 1.95, intangiblesPctRevenue: 0.35,
      goodwillPctRevenue: 0.06, cashPctRevenue: 0.13, netDebtToEbitda: 2.9,
      costOfDebt: 0.133, arDays: 17, invDays: 0, apDays: 26,
      dividendPayout: 0.35, buybackPctNetIncome: 0, minorityPctNetIncome: 0.05,
      shares: 2020, price: 13.9, beta: 0.88, annualVolatility: 0.29, priceDrift: 0.02,
      averageVolume: 38_000_000, freeFloat: 0.45,
    },
    {
      driver: {
        unit: 'veículos equivalentes', volume: 1_150_000_000, volumeGrowth: 0.03,
        price: 0.0000106, priceGrowth: 0.045, priceIndex: 'IPCA', shareOfRevenue: 0.62,
      },
      segments: [
        { name: 'Rodovias', share: 0.62, margin: 0.6, growth: 0.06 },
        { name: 'Aeroportos', share: 0.21, margin: 0.51, growth: 0.11 },
        { name: 'Mobilidade urbana', share: 0.13, margin: 0.44, growth: 0.05 },
        { name: 'Serviços', share: 0.04, margin: 0.38, growth: 0.07 },
      ],
      geographies: [{ name: 'São Paulo', share: 0.44 }, { name: 'Sul', share: 0.21 }, { name: 'Sudeste ex-SP', share: 0.18 }, { name: 'Internacional', share: 0.11 }, { name: 'Outros', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Grupo Andrade Gutierrez', kind: 'CONTROLLING', stake: 0.148 },
        { holder: 'Grupo Soares Penido', kind: 'CONTROLLING', stake: 0.147 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.214 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.132 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.359 },
      ],
      peers: ['ECOR3', 'RAIL3', 'EQTL3', 'SBSP3'],
    },
  ),
  bp(
    {
      ticker: 'RAIL3', name: 'Rumo', legalName: 'Rumo S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Industrials', industry: 'Ground Transportation', currency: 'BRL',
      description:
        'Rumo is the largest independent rail logistics operator in Brazil, moving grain, sugar and fuel between the agricultural interior and the ports of Santos and Paranaguá.',
      businessModel:
        'Rail earns a tariff per tonne-kilometre that competes against trucking. Volume follows the harvest; margin follows the spread between the rail tariff and the road alternative.',
      competitiveAdvantages: ['Rail concession into Brazil largest grain ports', 'Cost per tonne-kilometre below trucking', 'Terminal ownership at origin and destination', 'Long-dated renewed concessions'],
      website: 'https://rumo.com', employees: 9800, foundedYear: 1997,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Curitiba, Brazil',
      themes: ['infrastructure', 'commodities'],
    },
    {
      revenue: 11200, growthPath: [0.17, 0.22, 0.14, 0.12, 0.09, 0.08],
      ebitdaMarginPath: [0.44, 0.46, 0.48, 0.49, 0.48, 0.47],
      grossMargin: 0.38, daPctRevenue: 0.17, rndPctRevenue: 0, taxRate: 0.34,
      capexPctRevenue: 0.24, ppePctRevenue: 2.3, intangiblesPctRevenue: 0.22,
      goodwillPctRevenue: 0.03, cashPctRevenue: 0.15, netDebtToEbitda: 2.4,
      costOfDebt: 0.137, arDays: 21, invDays: 8, apDays: 28,
      dividendPayout: 0.15, buybackPctNetIncome: 0, minorityPctNetIncome: 0.02,
      shares: 1855, price: 19.2, beta: 1.05, annualVolatility: 0.33, priceDrift: 0.01,
      averageVolume: 44_000_000, freeFloat: 0.68,
    },
    {
      driver: {
        unit: 'TKU', volume: 78_000_000_000, volumeGrowth: 0.045,
        price: 0.000000000121, priceGrowth: 0.04, priceIndex: 'IPCA', shareOfRevenue: 0.92,
      },
      segments: [
        { name: 'Operação Norte', share: 0.58, margin: 0.52, growth: 0.09 },
        { name: 'Operação Sul', share: 0.27, margin: 0.41, growth: 0.05 },
        { name: 'Operação Central', share: 0.11, margin: 0.38, growth: 0.12 },
        { name: 'Contêiner e outros', share: 0.04, margin: 0.3, growth: 0.06 },
      ],
      geographies: [{ name: 'Mato Grosso', share: 0.34 }, { name: 'São Paulo', share: 0.26 }, { name: 'Paraná', share: 0.18 }, { name: 'Goiás', share: 0.13 }, { name: 'Outros', share: 0.09 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Cosan', kind: 'CONTROLLING', stake: 0.3 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.268 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.171 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.261 },
      ],
      peers: ['ECOR3', 'CCRO3', 'VALE3', 'SUZB3'],
    },
  ),
  bp(
    {
      ticker: 'SBSP3', name: 'Sabesp', legalName: 'Companhia de Saneamento Básico do Estado de São Paulo', exchange: 'B3',
      country: 'Brazil', sector: 'Utilities', industry: 'Water Utilities', currency: 'BRL',
      description:
        'Sabesp provides water and sewage services to most municipalities in the state of São Paulo under regulated tariffs and a universalisation mandate.',
      businessModel:
        'A regulated asset base earns a permitted return; growth comes from connecting unserved households and from tariff reviews that recognise invested capital.',
      competitiveAdvantages: ['Regulated monopoly in its concession area', 'Regulatory asset base earning a permitted return', 'Scale in treatment and distribution', 'Long-dated municipal contracts'],
      website: 'https://sabesp.com', employees: 12600, foundedYear: 1973,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['infrastructure'],
    },
    {
      revenue: 25400, growthPath: [0.13, 0.16, 0.11, 0.09, 0.1, 0.08],
      ebitdaMarginPath: [0.44, 0.46, 0.47, 0.48, 0.49, 0.5],
      grossMargin: 0.41, daPctRevenue: 0.13, rndPctRevenue: 0, taxRate: 0.34,
      capexPctRevenue: 0.21, ppePctRevenue: 2.6, intangiblesPctRevenue: 0.12,
      goodwillPctRevenue: 0, cashPctRevenue: 0.1, netDebtToEbitda: 2.1,
      costOfDebt: 0.128, arDays: 44, invDays: 2, apDays: 32,
      dividendPayout: 0.35, buybackPctNetIncome: 0, minorityPctNetIncome: 0,
      shares: 683, price: 96.4, beta: 0.79, annualVolatility: 0.28, priceDrift: 0.06,
      averageVolume: 31_000_000, freeFloat: 0.82,
    },
    {
      driver: {
        unit: 'm³ faturados', volume: 3_450_000_000, volumeGrowth: 0.018,
        price: 0.0000062, priceGrowth: 0.055, priceIndex: 'IPCA', shareOfRevenue: 0.95,
      },
      segments: [
        { name: 'Água', share: 0.55, margin: 0.52, growth: 0.07 },
        { name: 'Esgoto', share: 0.4, margin: 0.49, growth: 0.1 },
        { name: 'Serviços e outros', share: 0.05, margin: 0.31, growth: 0.06 },
      ],
      geographies: [{ name: 'Região Metropolitana de SP', share: 0.71 }, { name: 'Interior', share: 0.22 }, { name: 'Litoral', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2013, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Governo do Estado de SP', kind: 'CONTROLLING', stake: 0.182 },
        { holder: 'Equatorial', kind: 'INSTITUTIONAL', stake: 0.15 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.281 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.146 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.241 },
      ],
      peers: ['EQTL3', 'CPLE6', 'TAEE11', 'CCRO3'],
    },
  ),
  bp(
    {
      ticker: 'TAEE11', name: 'Taesa', legalName: 'Transmissora Aliança de Energia Elétrica S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Utilities', industry: 'Electric Utilities', currency: 'BRL',
      description:
        'Taesa owns and operates electricity transmission lines across Brazil under concession contracts that pay an annual permitted revenue independent of the volume transmitted.',
      businessModel:
        'Revenue is contracted and inflation-indexed, not volume-linked: once a line is energised it earns its permitted revenue whether power flows or not. The business is a bond with an operating overlay.',
      competitiveAdvantages: ['Revenue independent of transmitted volume', 'Inflation-indexed contracted receipts', 'Very high operating margins from low headcount', 'Auction discipline in a competitive bidding market'],
      website: 'https://taesa.com', employees: 850, foundedYear: 2000,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Rio de Janeiro, Brazil',
      themes: ['infrastructure', 'energy-transition'],
    },
    {
      revenue: 5400, growthPath: [0.09, 0.12, 0.07, 0.06, 0.05, 0.04],
      ebitdaMarginPath: [0.85, 0.86, 0.87, 0.87, 0.86, 0.86],
      grossMargin: 0.78, daPctRevenue: 0.09, rndPctRevenue: 0, taxRate: 0.28,
      capexPctRevenue: 0.12, ppePctRevenue: 0.55, intangiblesPctRevenue: 2.9,
      goodwillPctRevenue: 0, cashPctRevenue: 0.16, netDebtToEbitda: 2.8,
      costOfDebt: 0.13, arDays: 26, invDays: 0, apDays: 18,
      dividendPayout: 0.85, buybackPctNetIncome: 0, minorityPctNetIncome: 0.01,
      shares: 1034, price: 35.6, beta: 0.62, annualVolatility: 0.22, priceDrift: 0.03,
      averageVolume: 14_000_000, freeFloat: 0.49,
    },
    {
      driver: {
        unit: 'RAP contratada (R$ mi)', volume: 5400, volumeGrowth: 0.03,
        price: 1, priceGrowth: 0.045, priceIndex: 'IPCA',
      },
      segments: [
        { name: 'Concessões próprias', share: 0.71, margin: 0.88, growth: 0.04 },
        { name: 'Participações em coligadas', share: 0.23, margin: 0.83, growth: 0.05 },
        { name: 'Novos projetos', share: 0.06, margin: 0.74, growth: 0.14 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.38 }, { name: 'Nordeste', share: 0.27 }, { name: 'Sul', share: 0.19 }, { name: 'Centro-Oeste', share: 0.16 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Cemig', kind: 'CONTROLLING', stake: 0.217 },
        { holder: 'ISA Investimentos', kind: 'CONTROLLING', stake: 0.147 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.186 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.203 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.247 },
      ],
      peers: ['EQTL3', 'CPLE6', 'SBSP3', 'ENGI11'],
    },
  ),
  bp(
    {
      ticker: 'CPLE6', name: 'Copel', legalName: 'Companhia Paranaense de Energia', exchange: 'B3',
      country: 'Brazil', sector: 'Utilities', industry: 'Electric Utilities', currency: 'BRL',
      description:
        'Copel generates, transmits and distributes electricity in Paraná, combining a regulated distribution concession with a hydro and wind generation portfolio sold into the free market.',
      businessModel:
        'Distribution earns a regulated return on its asset base; generation sells contracted and spot energy. The mix means part of the result is set by the regulator and part by the power price.',
      competitiveAdvantages: ['Integrated generation, transmission and distribution', 'Hydro base with low marginal cost', 'Regulated distribution concession in an industrial state', 'Wind portfolio with long-dated PPAs'],
      website: 'https://copel.com', employees: 6400, foundedYear: 1954,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Curitiba, Brazil',
      themes: ['infrastructure', 'energy-transition'],
    },
    {
      revenue: 21600, growthPath: [0.18, 0.14, 0.09, 0.07, 0.06, 0.05],
      ebitdaMarginPath: [0.31, 0.33, 0.35, 0.37, 0.38, 0.38],
      grossMargin: 0.3, daPctRevenue: 0.08, rndPctRevenue: 0.001, taxRate: 0.3,
      capexPctRevenue: 0.13, ppePctRevenue: 1.45, intangiblesPctRevenue: 0.28,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.13, netDebtToEbitda: 1.9,
      costOfDebt: 0.129, arDays: 38, invDays: 3, apDays: 41,
      dividendPayout: 0.45, buybackPctNetIncome: 0.02, minorityPctNetIncome: 0.02,
      shares: 2960, price: 10.8, beta: 0.74, annualVolatility: 0.26, priceDrift: 0.05,
      averageVolume: 27_000_000, freeFloat: 0.88,
    },
    {
      driver: {
        unit: 'MWh distribuídos', volume: 29_500_000, volumeGrowth: 0.02,
        price: 0.000000617, priceGrowth: 0.05, priceIndex: 'IPCA', shareOfRevenue: 0.88,
      },
      segments: [
        { name: 'Distribuição', share: 0.52, margin: 0.24, growth: 0.04 },
        { name: 'Geração e transmissão', share: 0.36, margin: 0.58, growth: 0.07 },
        { name: 'Comercialização', share: 0.12, margin: 0.09, growth: 0.09 },
      ],
      geographies: [{ name: 'Paraná', share: 0.83 }, { name: 'Santa Catarina', share: 0.09 }, { name: 'Demais estados', share: 0.08 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1994, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Governo do Paraná', kind: 'CONTROLLING', stake: 0.109 },
        { holder: 'BNDESPar', kind: 'INSTITUTIONAL', stake: 0.085 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.312 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.198 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.296 },
      ],
      peers: ['EQTL3', 'TAEE11', 'ENGI11', 'SBSP3'],
    },
  ),
  bp(
    {
      ticker: 'ENGI11', name: 'Energisa', legalName: 'Energisa S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Utilities', industry: 'Electric Utilities', currency: 'BRL',
      description:
        'Energisa distributes electricity across eleven Brazilian states, concentrated in the North and Centre-West, with complementary transmission and energy services.',
      businessModel:
        'A distribution concession earns a regulated return on the asset base and passes energy costs through; value is created by connecting new customers and beating the regulatory efficiency benchmark on losses and cost to serve.',
      competitiveAdvantages: ['Concessions in fast-growing frontier states', 'Consistent record of beating regulatory efficiency targets', 'Scale across eleven distribution areas', 'Low technical loss rates'],
      website: 'https://energisa.com', employees: 18900, foundedYear: 1905,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Cataguases, Brazil',
      themes: ['infrastructure', 'energy-transition'],
    },
    {
      revenue: 27800, growthPath: [0.21, 0.17, 0.12, 0.1, 0.09, 0.08],
      ebitdaMarginPath: [0.26, 0.28, 0.29, 0.3, 0.31, 0.31],
      grossMargin: 0.27, daPctRevenue: 0.07, rndPctRevenue: 0.001, taxRate: 0.3,
      capexPctRevenue: 0.14, ppePctRevenue: 1.3, intangiblesPctRevenue: 0.34,
      goodwillPctRevenue: 0.05, cashPctRevenue: 0.11, netDebtToEbitda: 2.7,
      costOfDebt: 0.134, arDays: 41, invDays: 4, apDays: 44,
      dividendPayout: 0.3, buybackPctNetIncome: 0, minorityPctNetIncome: 0.04,
      shares: 1420, price: 48.7, beta: 0.71, annualVolatility: 0.25, priceDrift: 0.04,
      averageVolume: 19_000_000, freeFloat: 0.52,
    },
    {
      driver: {
        unit: 'MWh distribuídos', volume: 41_000_000, volumeGrowth: 0.035,
        price: 0.00000057, priceGrowth: 0.052, priceIndex: 'IPCA', shareOfRevenue: 0.9,
      },
      segments: [
        { name: 'Distribuição', share: 0.84, margin: 0.28, growth: 0.08 },
        { name: 'Transmissão', share: 0.09, margin: 0.72, growth: 0.11 },
        { name: 'Serviços e comercialização', share: 0.07, margin: 0.17, growth: 0.13 },
      ],
      geographies: [{ name: 'Centro-Oeste', share: 0.31 }, { name: 'Norte', share: 0.28 }, { name: 'Nordeste', share: 0.24 }, { name: 'Sudeste', share: 0.17 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1945, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Botelho', kind: 'CONTROLLING', stake: 0.479 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.196 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.163 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.162 },
      ],
      peers: ['EQTL3', 'CPLE6', 'TAEE11', 'SBSP3'],
    },
  ),
  bp(
    {
      ticker: 'GGBR4', name: 'Gerdau', legalName: 'Gerdau S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Materials', industry: 'Metals & Mining', currency: 'BRL',
      description:
        'Gerdau produces long and special steel through mini-mills in Brazil and North America, serving construction, industry and agriculture.',
      businessModel:
        'Mini-mills convert scrap into long steel close to where it is consumed, which makes the freight advantage and the scrap spread the two drivers of margin.',
      competitiveAdvantages: ['Mini-mill cost structure on scrap', 'Proximity to demand in both core markets', 'Vertical integration into scrap collection', 'Special steel niche with higher margins'],
      website: 'https://gerdau.com', employees: 30000, foundedYear: 1901,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['commodities'],
    },
    {
      revenue: 68500, growthPath: [0.42, -0.12, -0.08, 0.03, 0.04, 0.02],
      ebitdaMarginPath: [0.28, 0.19, 0.14, 0.13, 0.14, 0.13],
      grossMargin: 0.19, daPctRevenue: 0.055, rndPctRevenue: 0.002, taxRate: 0.26,
      capexPctRevenue: 0.075, ppePctRevenue: 0.72, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.03, cashPctRevenue: 0.12, netDebtToEbitda: 0.8,
      costOfDebt: 0.127, arDays: 34, invDays: 96, apDays: 38,
      dividendPayout: 0.4, buybackPctNetIncome: 0.12, minorityPctNetIncome: 0.02,
      shares: 2050, price: 17.4, beta: 1.18, annualVolatility: 0.33, priceDrift: -0.01,
      averageVolume: 35_000_000, freeFloat: 0.62,
    },
    {
      driver: {
        unit: 'toneladas de aço', volume: 11_800_000, volumeGrowth: 0.02,
        price: 0.0000049, priceGrowth: 0.025, shareOfRevenue: 0.91,
      },
      segments: [
        { name: 'Brasil', share: 0.4, margin: 0.13, growth: 0.02 },
        { name: 'América do Norte', share: 0.34, margin: 0.16, growth: 0.03 },
        { name: 'Aços Especiais', share: 0.17, margin: 0.11, growth: 0.04 },
        { name: 'América do Sul', share: 0.09, margin: 0.09, growth: 0.05 },
      ],
      geographies: [{ name: 'Brasil', share: 0.44 }, { name: 'Estados Unidos', share: 0.33 }, { name: 'Canadá', share: 0.1 }, { name: 'América do Sul', share: 0.13 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1941, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Metalúrgica Gerdau', kind: 'CONTROLLING', stake: 0.371 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.243 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.152 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.234 },
      ],
      peers: ['CSNA3', 'VALE3', 'SUZB3', 'RIO'],
    },
  ),
  bp(
    {
      ticker: 'CSNA3', name: 'CSN', legalName: 'Companhia Siderúrgica Nacional', exchange: 'B3',
      country: 'Brazil', sector: 'Materials', industry: 'Metals & Mining', currency: 'BRL',
      description:
        'CSN is an integrated steelmaker with its own iron ore mine, cement plants, railways and port terminals, making it a commodity conglomerate rather than a pure steel producer.',
      businessModel:
        'Integration from ore to flat steel and cement means the result is a blend of three cycles. Leverage is high, so the equity is a geared claim on all three at once.',
      competitiveAdvantages: ['Captive iron ore supply', 'Owned logistics from mine to port', 'Integrated flat steel and cement', 'Scale in the domestic flat steel market'],
      website: 'https://csn.com', employees: 23000, foundedYear: 1941,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['commodities'],
    },
    {
      revenue: 46200, growthPath: [0.38, -0.15, -0.06, 0.04, 0.05, 0.01],
      ebitdaMarginPath: [0.34, 0.22, 0.18, 0.19, 0.2, 0.19],
      grossMargin: 0.24, daPctRevenue: 0.075, rndPctRevenue: 0.001, taxRate: 0.28,
      capexPctRevenue: 0.11, ppePctRevenue: 1.15, intangiblesPctRevenue: 0.08,
      goodwillPctRevenue: 0.05, cashPctRevenue: 0.18, netDebtToEbitda: 3.1,
      costOfDebt: 0.141, arDays: 29, invDays: 88, apDays: 42,
      dividendPayout: 0.15, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.09,
      shares: 1330, price: 10.9, beta: 1.42, annualVolatility: 0.42, priceDrift: -0.05,
      averageVolume: 40_000_000, freeFloat: 0.41,
    },
    {
      driver: {
        unit: 'toneladas de aço e minério', volume: 14_500_000, volumeGrowth: 0.018,
        price: 0.0000026, priceGrowth: 0.025, shareOfRevenue: 0.79,
      },
      segments: [
        { name: 'Siderurgia', share: 0.51, margin: 0.12, growth: 0.01 },
        { name: 'Mineração', share: 0.28, margin: 0.38, growth: 0.04 },
        { name: 'Cimento', share: 0.13, margin: 0.24, growth: 0.09 },
        { name: 'Logística e energia', share: 0.08, margin: 0.31, growth: 0.03 },
      ],
      geographies: [{ name: 'Brasil', share: 0.71 }, { name: 'Ásia', share: 0.14 }, { name: 'Europa', share: 0.09 }, { name: 'Outros', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1981, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vicunha Siderurgia', kind: 'CONTROLLING', stake: 0.489 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.187 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.121 },
        { holder: 'Tesouraria', kind: 'TREASURY', stake: 0.024 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.179 },
      ],
      peers: ['GGBR4', 'VALE3', 'SUZB3', 'RIO'],
    },
  ),
  bp(
    {
      ticker: 'KLBN11', name: 'Klabin', legalName: 'Klabin S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Materials', industry: 'Paper & Forest Products', currency: 'BRL',
      description:
        'Klabin is an integrated producer of packaging paper, corrugated boxes and market pulp, with its own planted forests in Paraná and Santa Catarina.',
      businessModel:
        'Owning the forest caps the single largest input cost and converts a commodity pulp position into a partly contracted packaging business selling to food and agriculture.',
      competitiveAdvantages: ['Self-sufficiency in planted fibre', 'Integration from forest to box', 'Packaging demand less cyclical than pulp', 'Low delivered cash cost per tonne'],
      website: 'https://klabin.com', employees: 16500, foundedYear: 1899,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['commodities'],
    },
    {
      revenue: 21400, growthPath: [0.28, 0.09, 0.04, 0.07, 0.06, 0.05],
      ebitdaMarginPath: [0.38, 0.36, 0.35, 0.36, 0.37, 0.37],
      grossMargin: 0.31, daPctRevenue: 0.13, rndPctRevenue: 0.002, taxRate: 0.28,
      capexPctRevenue: 0.19, ppePctRevenue: 1.85, intangiblesPctRevenue: 0.06,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.22, netDebtToEbitda: 3.3,
      costOfDebt: 0.126, arDays: 42, invDays: 71, apDays: 46,
      dividendPayout: 0.35, buybackPctNetIncome: 0.04, minorityPctNetIncome: 0.01,
      shares: 5440, price: 4.32, beta: 0.86, annualVolatility: 0.27, priceDrift: 0.01,
      averageVolume: 29_000_000, freeFloat: 0.55,
    },
    {
      driver: {
        unit: 'toneladas de papel e celulose', volume: 4_100_000, volumeGrowth: 0.03,
        price: 0.0000041, priceGrowth: 0.035, shareOfRevenue: 0.89,
      },
      segments: [
        { name: 'Papéis e embalagens', share: 0.58, margin: 0.33, growth: 0.06 },
        { name: 'Celulose', share: 0.31, margin: 0.45, growth: 0.03 },
        { name: 'Florestal', share: 0.11, margin: 0.39, growth: 0.04 },
      ],
      geographies: [{ name: 'Brasil', share: 0.62 }, { name: 'Ásia', share: 0.16 }, { name: 'Europa', share: 0.12 }, { name: 'Américas', share: 0.1 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1939, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Klabin (Monteiro Aranha)', kind: 'CONTROLLING', stake: 0.323 },
        { holder: 'BNDESPar', kind: 'INSTITUTIONAL', stake: 0.098 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.216 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.147 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.216 },
      ],
      peers: ['SUZB3', 'GGBR4', 'VALE3', 'ABEV3'],
    },
  ),
  bp(
    {
      ticker: 'JBSS3', name: 'JBS', legalName: 'JBS S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Consumer Staples', industry: 'Food Products', currency: 'BRL',
      description:
        'JBS is the largest protein processor in the world, slaughtering and processing beef, poultry and pork across the Americas, Europe and Australia.',
      businessModel:
        'Margin is the spread between the live animal and the cut, which moves with herd cycles in each geography. Diversifying across species and continents is what turns a volatile spread into a manageable one.',
      competitiveAdvantages: ['Scale in beef processing worldwide', 'Diversification across species and geographies', 'Branded portfolio in prepared foods', 'Distribution reach into food service'],
      website: 'https://jbs.com', employees: 270000, foundedYear: 1953,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['consumer', 'commodities'],
    },
    {
      revenue: 412000, growthPath: [0.26, 0.05, -0.02, 0.09, 0.11, 0.07],
      ebitdaMarginPath: [0.11, 0.07, 0.05, 0.08, 0.09, 0.09],
      grossMargin: 0.15, daPctRevenue: 0.024, rndPctRevenue: 0.001, taxRate: 0.27,
      capexPctRevenue: 0.032, ppePctRevenue: 0.34, intangiblesPctRevenue: 0.06,
      goodwillPctRevenue: 0.09, cashPctRevenue: 0.06, netDebtToEbitda: 2.3,
      costOfDebt: 0.131, arDays: 23, invDays: 41, apDays: 29,
      dividendPayout: 0.25, buybackPctNetIncome: 0.06, minorityPctNetIncome: 0.03,
      shares: 2220, price: 34.8, beta: 0.94, annualVolatility: 0.31, priceDrift: 0.09,
      averageVolume: 52_000_000, freeFloat: 0.5,
    },
    {
      driver: {
        unit: 'toneladas de proteína', volume: 32_500_000, volumeGrowth: 0.025,
        price: 0.000012, priceGrowth: 0.04,
      },
      segments: [
        { name: 'Beef North America', share: 0.31, margin: 0.05, growth: 0.03 },
        { name: 'Seara e Brasil', share: 0.24, margin: 0.12, growth: 0.08 },
        { name: 'PPC (aves EUA)', share: 0.22, margin: 0.11, growth: 0.06 },
        { name: 'Pork USA', share: 0.13, margin: 0.08, growth: 0.04 },
        { name: 'Austrália e outros', share: 0.1, margin: 0.07, growth: 0.05 },
      ],
      geographies: [{ name: 'Estados Unidos', share: 0.48 }, { name: 'Brasil', share: 0.26 }, { name: 'Austrália', share: 0.09 }, { name: 'Europa', share: 0.09 }, { name: 'Outros', share: 0.08 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1993, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'J&F Investimentos', kind: 'CONTROLLING', stake: 0.484 },
        { holder: 'BNDESPar', kind: 'INSTITUTIONAL', stake: 0.208 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.142 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.166 },
      ],
      peers: ['ABEV3', 'RADL3', 'ASAI3', 'PG'],
    },
  ),
  bp(
    {
      ticker: 'ASAI3', name: 'Assaí', legalName: 'Sendas Distribuidora S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Consumer Staples', industry: 'Consumer Staples Distribution & Retail', currency: 'BRL',
      description:
        'Assaí operates cash-and-carry food wholesale stores across Brazil, selling to small retailers, restaurants and price-sensitive households.',
      businessModel:
        'Cash-and-carry runs on low gross margin and high inventory turnover, funded largely by supplier credit. The model converts working capital into a source of cash rather than a use of it.',
      competitiveAdvantages: ['Negative working capital funded by supplier terms', 'Lowest price position in food retail', 'Store conversion pipeline from hypermarkets', 'Scale purchasing against fragmented competition'],
      website: 'https://assai.com', employees: 78000, foundedYear: 1974,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['consumer'],
    },
    {
      revenue: 78600, growthPath: [0.31, 0.24, 0.18, 0.11, 0.08, 0.07],
      ebitdaMarginPath: [0.075, 0.072, 0.07, 0.071, 0.073, 0.074],
      grossMargin: 0.165, daPctRevenue: 0.028, rndPctRevenue: 0, taxRate: 0.3,
      capexPctRevenue: 0.035, ppePctRevenue: 0.42, intangiblesPctRevenue: 0.05,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.07, netDebtToEbitda: 2.6,
      costOfDebt: 0.138, arDays: 6, invDays: 44, apDays: 72,
      dividendPayout: 0.2, buybackPctNetIncome: 0, minorityPctNetIncome: 0,
      shares: 1350, price: 8.15, beta: 1.06, annualVolatility: 0.36, priceDrift: -0.03,
      averageVolume: 33_000_000, freeFloat: 0.69,
    },
    {
      driver: {
        unit: 'lojas em operação', volume: 300, volumeGrowth: 0.055,
        price: 0.262, priceGrowth: 0.05, priceIndex: 'IPCA', shareOfRevenue: 0.93,
      },
      segments: [
        { name: 'Lojas maduras', share: 0.72, margin: 0.078, growth: 0.04 },
        { name: 'Lojas em maturação', share: 0.21, margin: 0.061, growth: 0.19 },
        { name: 'Serviços financeiros e outros', share: 0.07, margin: 0.088, growth: 0.11 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.46 }, { name: 'Nordeste', share: 0.24 }, { name: 'Sul', share: 0.13 }, { name: 'Centro-Oeste', share: 0.1 }, { name: 'Norte', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2014, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.318 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.229 },
        { holder: 'Casino / remanescente', kind: 'INSTITUTIONAL', stake: 0.112 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.341 },
      ],
      peers: ['LREN3', 'RADL3', 'JBSS3', 'ABEV3'],
    },
  ),
  bp(
    {
      ticker: 'VIVT3', name: 'Vivo', legalName: 'Telefônica Brasil S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Communication Services', industry: 'Diversified Telecommunication Services', currency: 'BRL',
      description:
        'Vivo is the largest telecommunications operator in Brazil, providing mobile, fixed broadband and enterprise connectivity over its own network.',
      businessModel:
        'A network is a fixed cost; every incremental subscriber on it carries a very high contribution margin. Growth comes from moving prepaid customers onto postpaid plans and fibre into more homes.',
      competitiveAdvantages: ['Largest mobile subscriber base in Brazil', 'Fibre footprint reaching most urban households', 'Spectrum position after the 5G auction', 'Postpaid mix above the market average'],
      website: 'https://vivo.com', employees: 32000, foundedYear: 1998,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['infrastructure'],
    },
    {
      revenue: 54800, growthPath: [0.06, 0.08, 0.07, 0.06, 0.07, 0.06],
      ebitdaMarginPath: [0.38, 0.39, 0.4, 0.41, 0.41, 0.42],
      grossMargin: 0.52, daPctRevenue: 0.21, rndPctRevenue: 0.003, taxRate: 0.28,
      capexPctRevenue: 0.17, ppePctRevenue: 1.05, intangiblesPctRevenue: 0.62,
      goodwillPctRevenue: 0.14, cashPctRevenue: 0.08, netDebtToEbitda: 0.7,
      costOfDebt: 0.125, arDays: 37, invDays: 6, apDays: 48,
      dividendPayout: 0.9, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0,
      shares: 1650, price: 52.4, beta: 0.58, annualVolatility: 0.21, priceDrift: 0.07,
      averageVolume: 24_000_000, freeFloat: 0.26,
    },
    {
      driver: {
        unit: 'acessos', volume: 116_000_000, volumeGrowth: 0.02,
        price: 0.0000004, priceGrowth: 0.05, priceIndex: 'IPCA', shareOfRevenue: 0.92,
      },
      segments: [
        { name: 'Móvel pós-pago', share: 0.44, margin: 0.46, growth: 0.08 },
        { name: 'Móvel pré-pago', share: 0.14, margin: 0.38, growth: -0.02 },
        { name: 'Fibra e banda larga', share: 0.27, margin: 0.44, growth: 0.11 },
        { name: 'Corporativo e outros', share: 0.15, margin: 0.31, growth: 0.04 },
      ],
      geographies: [{ name: 'São Paulo', share: 0.39 }, { name: 'Sudeste ex-SP', share: 0.24 }, { name: 'Nordeste', share: 0.18 }, { name: 'Sul', share: 0.12 }, { name: 'Outros', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Telefónica S.A.', kind: 'CONTROLLING', stake: 0.744 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.091 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.067 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.098 },
      ],
      peers: ['TOTS3', 'META', 'GOOGL', 'EQTL3'],
    },
  ),
  bp(
    {
      ticker: 'ITSA4', name: 'Itaúsa', legalName: 'Itaúsa S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Financials', industry: 'Financial Services', currency: 'BRL',
      description:
        'Itaúsa is a holding company whose principal asset is a controlling stake in Itaú Unibanco, alongside industrial holdings in sanitation, chemicals and building materials.',
      businessModel:
        'A holding earns its return from the dividends of what it owns, and trades at a discount to the sum of those stakes. The discount closing, or not, is as much of the thesis as the underlying assets.',
      competitiveAdvantages: ['Control of the largest private bank in Brazil', 'Portfolio diversification beyond banking', 'Long record of dividend distribution', 'Tax efficiency at the holding level'],
      website: 'https://itaúsa.com', employees: 280, foundedYear: 1966,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['brazilian-banks'],
    },
    {
      revenue: 14200, growthPath: [0.14, 0.11, 0.09, 0.08, 0.07, 0.06],
      ebitdaMarginPath: [0.92, 0.93, 0.93, 0.94, 0.94, 0.94],
      grossMargin: 0.95, daPctRevenue: 0.004, rndPctRevenue: 0, taxRate: 0.05,
      capexPctRevenue: 0.006, ppePctRevenue: 0.06, intangiblesPctRevenue: 0.03,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.35, netDebtToEbitda: 0.4,
      costOfDebt: 0.126, arDays: 12, invDays: 0, apDays: 14,
      dividendPayout: 0.95, buybackPctNetIncome: 0.02, minorityPctNetIncome: 0,
      shares: 10450, price: 9.84, beta: 0.83, annualVolatility: 0.24, priceDrift: 0.05,
      averageVolume: 47_000_000, freeFloat: 0.61,
    },
    {
      segments: [
        { name: 'Itaú Unibanco', share: 0.88, margin: 0.96, growth: 0.06 },
        { name: 'Alpargatas e Dexco', share: 0.07, margin: 0.71, growth: 0.03 },
        { name: 'Aegea e Copa Energia', share: 0.05, margin: 0.82, growth: 0.12 },
      ],
      geographies: [{ name: 'Brasil', share: 0.94 }, { name: 'América Latina', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2006, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Egydio Setubal e Villela', kind: 'CONTROLLING', stake: 0.386 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.158 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.194 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.262 },
      ],
      peers: ['ITUB4', 'BBAS3', 'BPAC11', 'B3SA3'],
    },
  ),
  bp(
    {
      ticker: 'SANB11', name: 'Santander Brasil', legalName: 'Banco Santander (Brasil) S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Financials', industry: 'Banks', currency: 'BRL',
      description:
        'Santander Brasil is the largest foreign-owned retail and commercial bank in Brazil, serving individuals, SMEs and corporates.',
      businessModel:
        'A bank earns the spread between what it pays for funding and what it charges for credit, plus fees. The cycle that matters is the provision cycle: growth booked today becomes losses two years out.',
      competitiveAdvantages: ['Nationwide branch and digital distribution', 'Parent funding access in hard currency', 'Payroll and auto lending scale', 'Consumer finance franchise'],
      website: 'https://santanderbrasil.com', employees: 54000, foundedYear: 1982,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['brazilian-banks'],
    },
    {
      revenue: 72400, growthPath: [0.11, 0.07, 0.04, 0.06, 0.08, 0.07],
      ebitdaMarginPath: [0.44, 0.39, 0.36, 0.38, 0.4, 0.41],
      grossMargin: 0.58, daPctRevenue: 0.035, rndPctRevenue: 0.002, taxRate: 0.31,
      capexPctRevenue: 0.035, ppePctRevenue: 0.11, intangiblesPctRevenue: 0.18,
      goodwillPctRevenue: 0.12, cashPctRevenue: 0.41, netDebtToEbitda: 0,
      costOfDebt: 0.1245, arDays: 0, invDays: 0, apDays: 0,
      dividendPayout: 0.55, buybackPctNetIncome: 0.01, minorityPctNetIncome: 0.02,
      shares: 7480, price: 27.3, beta: 1.09, annualVolatility: 0.29, priceDrift: 0.02,
      averageVolume: 21_000_000, freeFloat: 0.1,
    },
    {
      segments: [
        { name: 'Banco de varejo', share: 0.54, margin: 0.36, growth: 0.06 },
        { name: 'Atacado e corporate', share: 0.27, margin: 0.48, growth: 0.08 },
        { name: 'Cartões e adquirência', share: 0.12, margin: 0.41, growth: 0.09 },
        { name: 'Seguros e gestão', share: 0.07, margin: 0.62, growth: 0.11 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.58 }, { name: 'Sul', share: 0.16 }, { name: 'Nordeste', share: 0.14 }, { name: 'Centro-Oeste e Norte', share: 0.12 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Banco Santander S.A.', kind: 'CONTROLLING', stake: 0.896 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.041 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.028 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.035 },
      ],
      peers: ['ITUB4', 'BBAS3', 'BPAC11', 'ITSA4'],
    },
  ),
  bp(
    {
      ticker: 'JPM', name: 'JPMorgan Chase', legalName: 'JPMorgan Chase & Co.', exchange: 'NYSE',
      country: 'United States', sector: 'Financials', industry: 'Banks', currency: 'USD', accountingStandard: GAAP,
      description:
        'JPMorgan Chase is a diversified financial institution combining consumer banking, corporate and investment banking, commercial banking and asset management.',
      businessModel:
        'Diversification across four businesses means a weak quarter in trading is usually offset by net interest income, and the other way round. Scale in deposits is the funding advantage everything else rests on.',
      competitiveAdvantages: ['Deposit franchise funding the balance sheet cheaply', 'Leading investment banking and markets share', 'Fortress capital position', 'Technology spend the smaller banks cannot match'],
      website: 'https://jpmorganchase.com', employees: 310000, foundedYear: 1799,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'New York, United States',
      themes: [],
    },
    {
      revenue: 178000, growthPath: [0.13, 0.22, 0.09, 0.05, 0.06, 0.04],
      ebitdaMarginPath: [0.42, 0.46, 0.48, 0.47, 0.46, 0.45],
      grossMargin: 0.61, daPctRevenue: 0.028, rndPctRevenue: 0.004, taxRate: 0.23,
      capexPctRevenue: 0.03, ppePctRevenue: 0.18, intangiblesPctRevenue: 0.09,
      goodwillPctRevenue: 0.3, cashPctRevenue: 0.52, netDebtToEbitda: 0,
      costOfDebt: 0.0475, arDays: 0, invDays: 0, apDays: 0,
      dividendPayout: 0.3, buybackPctNetIncome: 0.35, minorityPctNetIncome: 0.01,
      shares: 2790, price: 268.4, beta: 1.06, annualVolatility: 0.24, priceDrift: 0.11,
      averageVolume: 9_500_000, freeFloat: 0.94,
    },
    {
      segments: [
        { name: 'Consumer & Community Banking', share: 0.39, margin: 0.42, growth: 0.04 },
        { name: 'Corporate & Investment Bank', share: 0.34, margin: 0.48, growth: 0.06 },
        { name: 'Commercial Banking', share: 0.15, margin: 0.51, growth: 0.05 },
        { name: 'Asset & Wealth Management', share: 0.12, margin: 0.39, growth: 0.08 },
      ],
      geographies: [{ name: 'North America', share: 0.76 }, { name: 'Europe', share: 0.13 }, { name: 'Asia Pacific', share: 0.08 }, { name: 'Other', share: 0.03 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1839, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.093 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.074 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.051 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.782 },
      ],
      peers: ['ITUB4', 'BBAS3', 'V', 'MA'],
    },
  ),
  bp(
    {
      ticker: 'V', name: 'Visa', legalName: 'Visa Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Financials', industry: 'Financial Services', currency: 'USD', accountingStandard: GAAP,
      description:
        'Visa operates the largest electronic payments network in the world, connecting issuers, acquirers and merchants and earning a fee on the volume that crosses it.',
      businessModel:
        'A toll on consumption. Visa takes neither credit risk nor funding risk; it earns a few basis points on every transaction, and the fixed cost of the network means each additional one is nearly all margin.',
      competitiveAdvantages: ['Two-sided network with extreme switching costs', 'No credit risk on the balance sheet', 'Incremental transactions at near-zero marginal cost', 'Cross-border volumes at premium pricing'],
      website: 'https://visa.com', employees: 31600, foundedYear: 1958,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'San Francisco, United States',
      themes: ['technology'],
    },
    {
      revenue: 38900, growthPath: [0.22, 0.11, 0.1, 0.09, 0.1, 0.09],
      ebitdaMarginPath: [0.67, 0.68, 0.68, 0.69, 0.69, 0.7],
      grossMargin: 0.8, daPctRevenue: 0.024, rndPctRevenue: 0, taxRate: 0.19,
      capexPctRevenue: 0.025, ppePctRevenue: 0.09, intangiblesPctRevenue: 0.71,
      goodwillPctRevenue: 0.45, cashPctRevenue: 0.42, netDebtToEbitda: 0.1,
      costOfDebt: 0.046, arDays: 31, invDays: 0, apDays: 26,
      dividendPayout: 0.22, buybackPctNetIncome: 0.55, minorityPctNetIncome: 0,
      shares: 1950, price: 352.6, beta: 0.95, annualVolatility: 0.22, priceDrift: 0.1,
      averageVolume: 6_200_000, freeFloat: 0.97,
    },
    {
      driver: {
        unit: 'transações', volume: 234_000_000_000, volumeGrowth: 0.09,
        price: 0.000000000166, priceGrowth: 0.02,
      },
      segments: [
        { name: 'Service revenues', share: 0.36, margin: 0.71, growth: 0.09 },
        { name: 'Data processing', share: 0.34, margin: 0.73, growth: 0.1 },
        { name: 'International transactions', share: 0.24, margin: 0.76, growth: 0.12 },
        { name: 'Other', share: 0.06, margin: 0.48, growth: 0.07 },
      ],
      geographies: [{ name: 'United States', share: 0.44 }, { name: 'Europe', share: 0.21 }, { name: 'Asia Pacific', share: 0.19 }, { name: 'Latin America', share: 0.09 }, { name: 'Other', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1998, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.083 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.071 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.044 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.802 },
      ],
      peers: ['MA', 'JPM', 'B3SA3', 'MSFT'],
    },
  ),
  bp(
    {
      ticker: 'MA', name: 'Mastercard', legalName: 'Mastercard Incorporated', exchange: 'NYSE',
      country: 'United States', sector: 'Financials', industry: 'Financial Services', currency: 'USD', accountingStandard: GAAP,
      description:
        'Mastercard runs a global payments network alongside a growing set of value-added services in fraud, data analytics and open banking.',
      businessModel:
        'The same network toll as its larger peer, with a higher share of revenue coming from services sold on top of the rails — which is the part that grows faster than volume.',
      competitiveAdvantages: ['Global acceptance network', 'Value-added services growing above payment volume', 'Asset-light model with high incremental margin', 'Cross-border recovery leverage'],
      website: 'https://mastercard.com', employees: 33400, foundedYear: 1966,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Purchase, United States',
      themes: ['technology'],
    },
    {
      revenue: 29800, growthPath: [0.23, 0.12, 0.11, 0.1, 0.11, 0.1],
      ebitdaMarginPath: [0.59, 0.6, 0.61, 0.61, 0.62, 0.62],
      grossMargin: 0.76, daPctRevenue: 0.026, rndPctRevenue: 0, taxRate: 0.18,
      capexPctRevenue: 0.028, ppePctRevenue: 0.12, intangiblesPctRevenue: 0.34,
      goodwillPctRevenue: 0.28, cashPctRevenue: 0.31, netDebtToEbitda: 0.3,
      costOfDebt: 0.047, arDays: 34, invDays: 0, apDays: 24,
      dividendPayout: 0.2, buybackPctNetIncome: 0.58, minorityPctNetIncome: 0,
      shares: 915, price: 582.1, beta: 1.02, annualVolatility: 0.23, priceDrift: 0.09,
      averageVolume: 2_900_000, freeFloat: 0.88,
    },
    {
      driver: {
        unit: 'transações', volume: 159_000_000_000, volumeGrowth: 0.095,
        price: 0.000000000187, priceGrowth: 0.02,
      },
      segments: [
        { name: 'Payment network', share: 0.63, margin: 0.64, growth: 0.09 },
        { name: 'Value-added services', share: 0.37, margin: 0.58, growth: 0.15 },
      ],
      geographies: [{ name: 'United States', share: 0.32 }, { name: 'Europe', share: 0.27 }, { name: 'Asia Pacific', share: 0.21 }, { name: 'Latin America', share: 0.11 }, { name: 'Other', share: 0.09 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2006, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Mastercard Foundation', kind: 'INSTITUTIONAL', stake: 0.101 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.079 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.068 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.752 },
      ],
      peers: ['V', 'JPM', 'MSFT', 'B3SA3'],
    },
  ),
  bp(
    {
      ticker: 'UNH', name: 'UnitedHealth', legalName: 'UnitedHealth Group Incorporated', exchange: 'NYSE',
      country: 'United States', sector: 'Health Care', industry: 'Health Care Providers & Services', currency: 'USD', accountingStandard: GAAP,
      description:
        'UnitedHealth combines the largest health insurer in the United States with Optum, a care delivery, pharmacy benefit and health analytics business.',
      businessModel:
        'Insurance earns the spread between premiums and medical costs; Optum earns a margin on services sold partly to that insurer. Owning both sides is what lets the group manage the medical loss ratio rather than just report it.',
      competitiveAdvantages: ['Scale in risk pooling across membership', 'Vertical integration through Optum', 'Data on cost and outcomes at population scale', 'Medicare Advantage distribution'],
      website: 'https://unitedhealth.com', employees: 400000, foundedYear: 1977,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Minnetonka, United States',
      themes: ['healthcare'],
    },
    {
      revenue: 412000, growthPath: [0.13, 0.14, 0.12, 0.09, 0.08, 0.07],
      ebitdaMarginPath: [0.089, 0.091, 0.088, 0.083, 0.079, 0.076],
      grossMargin: 0.24, daPctRevenue: 0.013, rndPctRevenue: 0, taxRate: 0.23,
      capexPctRevenue: 0.016, ppePctRevenue: 0.09, intangiblesPctRevenue: 0.13,
      goodwillPctRevenue: 0.24, cashPctRevenue: 0.1, netDebtToEbitda: 0.9,
      costOfDebt: 0.049, arDays: 19, invDays: 11, apDays: 37,
      dividendPayout: 0.3, buybackPctNetIncome: 0.25, minorityPctNetIncome: 0.02,
      shares: 920, price: 486.3, beta: 0.68, annualVolatility: 0.27, priceDrift: -0.08,
      averageVolume: 3_700_000, freeFloat: 0.96,
    },
    {
      driver: {
        unit: 'vidas cobertas', volume: 50_800_000, volumeGrowth: 0.02,
        price: 0.00000454, priceGrowth: 0.055, shareOfRevenue: 0.56,
      },
      segments: [
        { name: 'UnitedHealthcare', share: 0.56, margin: 0.056, growth: 0.06 },
        { name: 'Optum Health', share: 0.21, margin: 0.081, growth: 0.11 },
        { name: 'Optum Rx', share: 0.19, margin: 0.048, growth: 0.08 },
        { name: 'Optum Insight', share: 0.04, margin: 0.24, growth: 0.09 },
      ],
      geographies: [{ name: 'United States', share: 0.93 }, { name: 'Brazil', share: 0.04 }, { name: 'Other', share: 0.03 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2017, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.089 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.078 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.043 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.79 },
      ],
      peers: ['HAPV3', 'JNJ', 'PG', 'RADL3'],
    },
  ),
  bp(
    {
      ticker: 'JNJ', name: 'Johnson & Johnson', legalName: 'Johnson & Johnson', exchange: 'NYSE',
      country: 'United States', sector: 'Health Care', industry: 'Pharmaceuticals', currency: 'USD', accountingStandard: GAAP,
      description:
        'Johnson & Johnson develops and sells prescription pharmaceuticals and medical devices, following the separation of its consumer health business.',
      businessModel:
        'A pharmaceutical earns monopoly economics for the life of a patent and commodity economics the day after. The pipeline is therefore not a growth option but a replacement requirement.',
      competitiveAdvantages: ['Deep oncology and immunology pipeline', 'Medical device franchises with surgeon switching costs', 'Balance sheet capable of funding large acquisitions', 'Global regulatory and distribution reach'],
      website: 'https://johnson&johnson.com', employees: 138000, foundedYear: 1886,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'New Brunswick, United States',
      themes: ['healthcare'],
    },
    {
      revenue: 89200, growthPath: [0.06, 0.05, 0.04, 0.05, 0.06, 0.04],
      ebitdaMarginPath: [0.33, 0.34, 0.35, 0.35, 0.34, 0.34],
      grossMargin: 0.69, daPctRevenue: 0.088, rndPctRevenue: 0.155, taxRate: 0.17,
      capexPctRevenue: 0.045, ppePctRevenue: 0.24, intangiblesPctRevenue: 0.58,
      goodwillPctRevenue: 0.42, cashPctRevenue: 0.24, netDebtToEbitda: 0.5,
      costOfDebt: 0.046, arDays: 61, invDays: 126, apDays: 78,
      dividendPayout: 0.45, buybackPctNetIncome: 0.18, minorityPctNetIncome: 0,
      shares: 2410, price: 172.8, beta: 0.54, annualVolatility: 0.18, priceDrift: 0.04,
      averageVolume: 7_100_000, freeFloat: 0.98,
    },
    {
      segments: [
        { name: 'Innovative Medicine', share: 0.64, margin: 0.39, growth: 0.05 },
        { name: 'MedTech', share: 0.36, margin: 0.26, growth: 0.06 },
      ],
      geographies: [{ name: 'United States', share: 0.56 }, { name: 'Europe', share: 0.22 }, { name: 'Asia Pacific', share: 0.15 }, { name: 'Other', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1926, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.095 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.081 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.058 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.766 },
      ],
      peers: ['UNH', 'PG', 'HAPV3', 'RADL3'],
    },
  ),
  bp(
    {
      ticker: 'PG', name: 'Procter & Gamble', legalName: 'The Procter & Gamble Company', exchange: 'NYSE',
      country: 'United States', sector: 'Consumer Staples', industry: 'Household Products', currency: 'USD', accountingStandard: GAAP,
      description:
        'Procter & Gamble sells branded household and personal care products across fabric care, baby care, grooming, health and beauty in almost every market in the world.',
      businessModel:
        'Brand equity earns a price premium over private label; scale in media and distribution is what defends it. Volume barely grows, so the result is made by price, mix and cost.',
      competitiveAdvantages: ['Brand portfolio with pricing power over private label', 'Shelf position with global retailers', 'Scale in advertising spend', 'Productivity programme delivering recurring savings'],
      website: 'https://procter&gamble.com', employees: 108000, foundedYear: 1837,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Cincinnati, United States',
      themes: ['consumer'],
    },
    {
      revenue: 84600, growthPath: [0.07, 0.05, 0.02, 0.03, 0.04, 0.03],
      ebitdaMarginPath: [0.25, 0.26, 0.26, 0.27, 0.27, 0.28],
      grossMargin: 0.51, daPctRevenue: 0.034, rndPctRevenue: 0.023, taxRate: 0.21,
      capexPctRevenue: 0.038, ppePctRevenue: 0.26, intangiblesPctRevenue: 0.3,
      goodwillPctRevenue: 0.47, cashPctRevenue: 0.09, netDebtToEbitda: 1.1,
      costOfDebt: 0.045, arDays: 26, invDays: 54, apDays: 96,
      dividendPayout: 0.6, buybackPctNetIncome: 0.28, minorityPctNetIncome: 0.01,
      shares: 2350, price: 161.4, beta: 0.44, annualVolatility: 0.16, priceDrift: 0.03,
      averageVolume: 6_400_000, freeFloat: 0.97,
    },
    {
      segments: [
        { name: 'Fabric & Home Care', share: 0.35, margin: 0.26, growth: 0.03 },
        { name: 'Baby, Feminine & Family', share: 0.24, margin: 0.25, growth: 0.02 },
        { name: 'Beauty', share: 0.18, margin: 0.32, growth: 0.04 },
        { name: 'Health Care', share: 0.14, margin: 0.31, growth: 0.05 },
        { name: 'Grooming', share: 0.09, margin: 0.33, growth: 0.02 },
      ],
      geographies: [{ name: 'North America', share: 0.49 }, { name: 'Europe', share: 0.23 }, { name: 'Asia Pacific', share: 0.17 }, { name: 'Latin America', share: 0.07 }, { name: 'Other', share: 0.04 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1877, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.091 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.073 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.047 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.789 },
      ],
      peers: ['ABEV3', 'KO', 'JNJ', 'WMT'],
    },
  ),
  bp(
    {
      ticker: 'KO', name: 'Coca-Cola', legalName: 'The Coca-Cola Company', exchange: 'NYSE',
      country: 'United States', sector: 'Consumer Staples', industry: 'Beverages', currency: 'USD', accountingStandard: GAAP,
      description:
        'Coca-Cola sells concentrate and finished beverages through a global network of independent bottlers, covering sparkling soft drinks, water, juice and coffee.',
      businessModel:
        'Selling concentrate rather than bottles keeps the capital in the bottler and the margin at the brand. The company owns the demand; the partners own the trucks.',
      competitiveAdvantages: ['Most recognised beverage brand globally', 'Concentrate model with very high returns on capital', 'Bottler network providing distribution without the capital', 'Pricing power in developed and emerging markets'],
      website: 'https://coca-cola.com', employees: 79000, foundedYear: 1892,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Atlanta, United States',
      themes: ['consumer'],
    },
    {
      revenue: 47800, growthPath: [0.17, 0.11, 0.06, 0.05, 0.05, 0.04],
      ebitdaMarginPath: [0.31, 0.32, 0.33, 0.33, 0.34, 0.34],
      grossMargin: 0.6, daPctRevenue: 0.025, rndPctRevenue: 0, taxRate: 0.2,
      capexPctRevenue: 0.028, ppePctRevenue: 0.21, intangiblesPctRevenue: 0.35,
      goodwillPctRevenue: 0.4, cashPctRevenue: 0.3, netDebtToEbitda: 1.9,
      costOfDebt: 0.046, arDays: 38, invDays: 62, apDays: 104,
      dividendPayout: 0.7, buybackPctNetIncome: 0.12, minorityPctNetIncome: 0.02,
      shares: 4310, price: 71.2, beta: 0.51, annualVolatility: 0.17, priceDrift: 0.05,
      averageVolume: 13_800_000, freeFloat: 0.94,
    },
    {
      driver: {
        unit: 'caixas unitárias', volume: 34_000_000_000, volumeGrowth: 0.02,
        price: 0.00000000135, priceGrowth: 0.035,
      },
      segments: [
        { name: 'Europe, Middle East & Africa', share: 0.29, margin: 0.42, growth: 0.04 },
        { name: 'North America', share: 0.33, margin: 0.27, growth: 0.03 },
        { name: 'Latin America', share: 0.14, margin: 0.48, growth: 0.06 },
        { name: 'Asia Pacific', share: 0.15, margin: 0.44, growth: 0.05 },
        { name: 'Bottling Investments', share: 0.09, margin: 0.09, growth: 0.02 },
      ],
      geographies: [{ name: 'North America', share: 0.36 }, { name: 'Europe & Africa', share: 0.27 }, { name: 'Asia Pacific', share: 0.19 }, { name: 'Latin America', share: 0.18 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1932, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Berkshire Hathaway', kind: 'INSTITUTIONAL', stake: 0.093 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.081 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.069 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.757 },
      ],
      peers: ['ABEV3', 'PG', 'WMT', 'JBSS3'],
    },
  ),
  bp(
    {
      ticker: 'WMT', name: 'Walmart', legalName: 'Walmart Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Consumer Staples', industry: 'Consumer Staples Distribution & Retail', currency: 'USD', accountingStandard: GAAP,
      description:
        'Walmart is the largest retailer in the world by revenue, operating supercentres, warehouse clubs and a growing e-commerce and advertising business.',
      businessModel:
        'Buy for less, sell for less, make it on turnover. Supplier terms fund the inventory, so growth releases cash instead of consuming it — and the store network doubles as fulfilment for online orders.',
      competitiveAdvantages: ['Purchasing scale unmatched in retail', 'Store network within reach of most of the population', 'Negative working capital cycle', 'Advertising and marketplace attached to the store base'],
      website: 'https://walmart.com', employees: 2100000, foundedYear: 1962,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Bentonville, United States',
      themes: ['consumer'],
    },
    {
      revenue: 684000, growthPath: [0.07, 0.06, 0.06, 0.05, 0.05, 0.04],
      ebitdaMarginPath: [0.061, 0.06, 0.061, 0.063, 0.064, 0.065],
      grossMargin: 0.245, daPctRevenue: 0.018, rndPctRevenue: 0, taxRate: 0.25,
      capexPctRevenue: 0.026, ppePctRevenue: 0.22, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.05, cashPctRevenue: 0.02, netDebtToEbitda: 1.3,
      costOfDebt: 0.046, arDays: 5, invDays: 41, apDays: 48,
      dividendPayout: 0.35, buybackPctNetIncome: 0.22, minorityPctNetIncome: 0.02,
      shares: 8050, price: 98.7, beta: 0.61, annualVolatility: 0.2, priceDrift: 0.13,
      averageVolume: 17_400_000, freeFloat: 0.53,
    },
    {
      driver: {
        unit: 'lojas em operação', volume: 10_600, volumeGrowth: 0.01,
        price: 0.0491, priceGrowth: 0.03, shareOfRevenue: 0.87,
      },
      segments: [
        { name: 'Walmart U.S.', share: 0.69, margin: 0.068, growth: 0.04 },
        { name: 'Walmart International', share: 0.18, margin: 0.052, growth: 0.07 },
        { name: 'Sam\'s Club', share: 0.13, margin: 0.045, growth: 0.05 },
      ],
      geographies: [{ name: 'United States', share: 0.76 }, { name: 'Mexico & Central America', share: 0.08 }, { name: 'China', share: 0.05 }, { name: 'Canada', share: 0.05 }, { name: 'Other', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2002, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Walton family', kind: 'CONTROLLING', stake: 0.457 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.052 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.041 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.45 },
      ],
      peers: ['ASAI3', 'LREN3', 'KO', 'PG'],
    },
  ),
  bp(
    {
      ticker: 'TSLA', name: 'Tesla', legalName: 'Tesla, Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Consumer Discretionary', industry: 'Automobiles', currency: 'USD', accountingStandard: GAAP,
      description:
        'Tesla designs and manufactures electric vehicles, battery energy storage systems and solar products, selling direct to consumers without a dealer network.',
      businessModel:
        'Vertical integration from cell to software, sold direct. The automotive gross margin funds an energy storage business growing faster than the cars, and the software attach rate is the option nobody can price.',
      competitiveAdvantages: ['Cost per kilowatt-hour below the industry', 'Direct sales without dealer margin', 'Charging network as a switching cost', 'Energy storage growing faster than automotive'],
      website: 'https://tesla.com', employees: 141000, foundedYear: 2003,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Austin, United States',
      themes: ['energy-transition', 'technology'],
    },
    {
      revenue: 102000, growthPath: [0.51, 0.19, 0.03, 0.01, 0.08, 0.11],
      ebitdaMarginPath: [0.22, 0.17, 0.14, 0.13, 0.15, 0.16],
      grossMargin: 0.19, daPctRevenue: 0.048, rndPctRevenue: 0.043, taxRate: 0.16,
      capexPctRevenue: 0.098, ppePctRevenue: 0.42, intangiblesPctRevenue: 0.02,
      goodwillPctRevenue: 0.003, cashPctRevenue: 0.36, netDebtToEbitda: -0.8,
      costOfDebt: 0.051, arDays: 17, invDays: 64, apDays: 82,
      dividendPayout: 0, buybackPctNetIncome: 0, minorityPctNetIncome: 0.01,
      shares: 3220, price: 344.9, beta: 1.94, annualVolatility: 0.56, priceDrift: 0.06,
      averageVolume: 88_000_000, freeFloat: 0.79,
    },
    {
      driver: {
        unit: 'veículos entregues', volume: 1_840_000, volumeGrowth: 0.12,
        price: 0.0000432, priceGrowth: 0.005, shareOfRevenue: 0.78,
      },
      segments: [
        { name: 'Automotive', share: 0.78, margin: 0.16, growth: 0.06 },
        { name: 'Energy generation & storage', share: 0.16, margin: 0.22, growth: 0.38 },
        { name: 'Services & other', share: 0.06, margin: 0.06, growth: 0.21 },
      ],
      geographies: [{ name: 'United States', share: 0.48 }, { name: 'China', share: 0.22 }, { name: 'Europe', share: 0.21 }, { name: 'Other', share: 0.09 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Elon Musk', kind: 'INSIDER', stake: 0.129 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.072 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.058 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.741 },
      ],
      peers: ['NVDA', 'AAPL', 'WEGE3', 'AMZN'],
    },
  ),
  bp(
    {
      ticker: 'ORCL', name: 'Oracle', legalName: 'Oracle Corporation', exchange: 'NYSE',
      country: 'United States', sector: 'Information Technology', industry: 'Software', currency: 'USD', accountingStandard: GAAP,
      description:
        'Oracle sells database software, enterprise applications and cloud infrastructure, with a large installed base migrating from licences to subscriptions.',
      businessModel:
        'A database is the hardest thing in an enterprise to replace, which is why the licence base persists. The wager is that the same customers will run their AI workloads on Oracle infrastructure rather than a hyperscaler.',
      competitiveAdvantages: ['Database installed base with extreme switching costs', 'Applications suite cross-selling into it', 'Cloud infrastructure priced below the hyperscalers', 'Long-dated contracted backlog'],
      website: 'https://oracle.com', employees: 162000, foundedYear: 1977,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Austin, United States',
      themes: ['technology', 'ai'],
    },
    {
      revenue: 57200, growthPath: [0.04, 0.18, 0.07, 0.06, 0.09, 0.11],
      ebitdaMarginPath: [0.42, 0.41, 0.43, 0.44, 0.44, 0.45],
      grossMargin: 0.71, daPctRevenue: 0.082, rndPctRevenue: 0.155, taxRate: 0.18,
      capexPctRevenue: 0.215, ppePctRevenue: 0.68, intangiblesPctRevenue: 0.44,
      goodwillPctRevenue: 0.75, cashPctRevenue: 0.16, netDebtToEbitda: 2.6,
      costOfDebt: 0.05, arDays: 48, invDays: 3, apDays: 21,
      dividendPayout: 0.25, buybackPctNetIncome: 0.2, minorityPctNetIncome: 0.01,
      shares: 2810, price: 178.3, beta: 1.12, annualVolatility: 0.31, priceDrift: 0.16,
      averageVolume: 11_200_000, freeFloat: 0.58,
    },
    {
      segments: [
        { name: 'Cloud services & licence support', share: 0.74, margin: 0.51, growth: 0.12 },
        { name: 'Cloud licence & on-premise', share: 0.09, margin: 0.62, growth: 0.03 },
        { name: 'Hardware', share: 0.08, margin: 0.34, growth: -0.02 },
        { name: 'Services', share: 0.09, margin: 0.11, growth: 0.04 },
      ],
      geographies: [{ name: 'Americas', share: 0.61 }, { name: 'Europe, Middle East & Africa', share: 0.24 }, { name: 'Asia Pacific', share: 0.15 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2017, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Larry Ellison', kind: 'INSIDER', stake: 0.421 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.062 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.051 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.466 },
      ],
      peers: ['MSFT', 'CRM', 'TOTS3', 'GOOGL'],
    },
  ),
  bp(
    {
      ticker: 'CRM', name: 'Salesforce', legalName: 'Salesforce, Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Information Technology', industry: 'Software', currency: 'USD', accountingStandard: GAAP,
      description:
        'Salesforce sells customer relationship management software and an expanding platform of analytics, integration and automation products delivered as subscriptions.',
      businessModel:
        'Subscription software with negative churn: existing customers spend more each year without a new sale. The cost of acquiring them is paid up front, which is why growth and margin trade off against each other.',
      competitiveAdvantages: ['Category leadership in CRM', 'Negative net revenue churn in the enterprise base', 'Platform extensibility through the app ecosystem', 'Data estate positioning for AI workloads'],
      website: 'https://salesforce.com', employees: 76000, foundedYear: 1999,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'San Francisco, United States',
      themes: ['technology', 'ai'],
    },
    {
      revenue: 39800, growthPath: [0.25, 0.18, 0.11, 0.1, 0.09, 0.08],
      ebitdaMarginPath: [0.21, 0.25, 0.29, 0.32, 0.33, 0.34],
      grossMargin: 0.77, daPctRevenue: 0.072, rndPctRevenue: 0.145, taxRate: 0.2,
      capexPctRevenue: 0.021, ppePctRevenue: 0.14, intangiblesPctRevenue: 0.52,
      goodwillPctRevenue: 1.15, cashPctRevenue: 0.3, netDebtToEbitda: -0.2,
      costOfDebt: 0.048, arDays: 88, invDays: 0, apDays: 19,
      dividendPayout: 0.05, buybackPctNetIncome: 0.32, minorityPctNetIncome: 0,
      shares: 965, price: 291.5, beta: 1.24, annualVolatility: 0.33, priceDrift: -0.04,
      averageVolume: 6_800_000, freeFloat: 0.95,
    },
    {
      segments: [
        { name: 'Sales & Service Cloud', share: 0.47, margin: 0.36, growth: 0.07 },
        { name: 'Platform & Other', share: 0.23, margin: 0.31, growth: 0.09 },
        { name: 'Marketing & Commerce', share: 0.16, margin: 0.29, growth: 0.06 },
        { name: 'Data Cloud & Analytics', share: 0.14, margin: 0.38, growth: 0.16 },
      ],
      geographies: [{ name: 'Americas', share: 0.67 }, { name: 'Europe', share: 0.22 }, { name: 'Asia Pacific', share: 0.11 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.089 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.074 },
        { holder: 'Marc Benioff', kind: 'INSIDER', stake: 0.029 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.808 },
      ],
      peers: ['MSFT', 'ORCL', 'TOTS3', 'AAPL'],
    },
  ),
  bp(
    {
      ticker: 'AMD', name: 'AMD', legalName: 'Advanced Micro Devices, Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Information Technology', industry: 'Semiconductors', currency: 'USD', accountingStandard: GAAP,
      description:
        'AMD designs central and graphics processors for data centres, personal computers, gaming consoles and embedded systems, manufactured by third-party foundries.',
      businessModel:
        'Fabless design means the capital sits with the foundry and the risk sits in the design cycle. Winning a socket in a hyperscaler data centre is worth years of volume; losing one is worth the same in reverse.',
      competitiveAdvantages: ['Chiplet architecture ahead of the incumbent on cost', 'Foundry partnership at the leading node', 'Share gains in server CPUs', 'Embedded franchise from the Xilinx acquisition'],
      website: 'https://amd.com', employees: 28000, foundedYear: 1969,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Santa Clara, United States',
      themes: ['ai', 'technology'],
    },
    {
      revenue: 29400, growthPath: [0.68, 0.44, -0.04, 0.09, 0.24, 0.31],
      ebitdaMarginPath: [0.24, 0.22, 0.14, 0.18, 0.24, 0.27],
      grossMargin: 0.52, daPctRevenue: 0.098, rndPctRevenue: 0.235, taxRate: 0.13,
      capexPctRevenue: 0.024, ppePctRevenue: 0.11, intangiblesPctRevenue: 0.72,
      goodwillPctRevenue: 1.62, cashPctRevenue: 0.22, netDebtToEbitda: -0.5,
      costOfDebt: 0.049, arDays: 74, invDays: 118, apDays: 52,
      dividendPayout: 0, buybackPctNetIncome: 0.14, minorityPctNetIncome: 0,
      shares: 1620, price: 162.8, beta: 1.78, annualVolatility: 0.48, priceDrift: 0.08,
      averageVolume: 41_000_000, freeFloat: 0.96,
    },
    {
      driver: {
        unit: 'unidades vendidas', volume: 62_000_000, volumeGrowth: 0.15,
        price: 0.000000474, priceGrowth: 0.03,
      },
      segments: [
        { name: 'Data Center', share: 0.49, margin: 0.31, growth: 0.42 },
        { name: 'Client', share: 0.26, margin: 0.22, growth: 0.18 },
        { name: 'Gaming', share: 0.13, margin: 0.14, growth: -0.21 },
        { name: 'Embedded', share: 0.12, margin: 0.38, growth: -0.08 },
      ],
      geographies: [{ name: 'United States', share: 0.31 }, { name: 'Taiwan & China', share: 0.38 }, { name: 'Japan', share: 0.08 }, { name: 'Europe', share: 0.14 }, { name: 'Other', share: 0.09 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2009, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.088 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.071 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.042 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.799 },
      ],
      peers: ['NVDA', 'MSFT', 'AAPL', 'ORCL'],
    },
  ),
  bp(
    {
      ticker: 'CVX', name: 'Chevron', legalName: 'Chevron Corporation', exchange: 'NYSE',
      country: 'United States', sector: 'Energy', industry: 'Oil, Gas & Consumable Fuels', currency: 'USD', accountingStandard: GAAP,
      description:
        'Chevron is an integrated energy company with upstream production concentrated in the Permian basin, Kazakhstan and Australia, plus refining and chemicals.',
      businessModel:
        'Upstream barrels set the result; downstream smooths it. Capital discipline is the whole argument: the industry destroyed value for a decade by drilling through the cycle.',
      competitiveAdvantages: ['Permian acreage with short-cycle flexibility', 'Breakeven below the mid-cycle oil price', 'Integrated refining and chemicals', 'Balance sheet capacity through the cycle'],
      website: 'https://chevron.com', employees: 46000, foundedYear: 1879,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Houston, United States',
      themes: ['commodities'],
    },
    {
      revenue: 196000, growthPath: [0.51, -0.18, -0.06, 0.02, 0.04, -0.02],
      ebitdaMarginPath: [0.26, 0.21, 0.19, 0.18, 0.19, 0.18],
      grossMargin: 0.31, daPctRevenue: 0.081, rndPctRevenue: 0.003, taxRate: 0.31,
      capexPctRevenue: 0.098, ppePctRevenue: 0.94, intangiblesPctRevenue: 0.02,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.04, netDebtToEbitda: 0.4,
      costOfDebt: 0.047, arDays: 42, invDays: 27, apDays: 54,
      dividendPayout: 0.55, buybackPctNetIncome: 0.24, minorityPctNetIncome: 0.02,
      shares: 1790, price: 158.2, beta: 0.89, annualVolatility: 0.26, priceDrift: 0.02,
      averageVolume: 8_900_000, freeFloat: 0.97,
    },
    {
      driver: {
        unit: 'barris de óleo equivalente', volume: 1_180_000_000, volumeGrowth: 0.015,
        price: 0.000106, priceGrowth: 0.015, shareOfRevenue: 0.64,
      },
      segments: [
        { name: 'Upstream', share: 0.64, margin: 0.27, growth: 0.03 },
        { name: 'Downstream', share: 0.33, margin: 0.06, growth: 0.01 },
        { name: 'All other', share: 0.03, margin: 0.02, growth: 0.04 },
      ],
      geographies: [{ name: 'United States', share: 0.54 }, { name: 'Asia Pacific', share: 0.17 }, { name: 'Africa & Middle East', share: 0.14 }, { name: 'Other Americas', share: 0.09 }, { name: 'Europe', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1919, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.086 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.07 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.061 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.783 },
      ],
      peers: ['XOM', 'PETR4', 'PRIO3', 'SHEL'],
    },
  ),
  bp(
    {
      ticker: 'SHEL', name: 'Shell', legalName: 'Shell plc', exchange: 'LSE',
      country: 'United Kingdom', sector: 'Energy', industry: 'Oil, Gas & Consumable Fuels', currency: 'USD', accountingStandard: GAAP,
      description:
        'Shell is an integrated energy company with the largest liquefied natural gas portfolio among the majors, alongside upstream oil, chemicals and a retail fuel network.',
      businessModel:
        'LNG is the differentiator: long-dated contracts indexed to oil provide a base, and the trading operation monetises the volatility around it in a way a pure producer cannot.',
      competitiveAdvantages: ['Largest LNG portfolio among the majors', 'Trading operation monetising volatility', 'Global retail fuel network', 'Integrated gas value chain'],
      website: 'https://shell.com', employees: 96000, foundedYear: 1907,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'London, United Kingdom',
      themes: ['commodities', 'energy-transition'],
    },
    {
      revenue: 284000, growthPath: [0.46, -0.15, -0.08, 0.01, 0.03, -0.03],
      ebitdaMarginPath: [0.19, 0.16, 0.15, 0.15, 0.16, 0.15],
      grossMargin: 0.22, daPctRevenue: 0.068, rndPctRevenue: 0.004, taxRate: 0.34,
      capexPctRevenue: 0.078, ppePctRevenue: 0.71, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.03, cashPctRevenue: 0.14, netDebtToEbitda: 0.8,
      costOfDebt: 0.047, arDays: 47, invDays: 39, apDays: 61,
      dividendPayout: 0.4, buybackPctNetIncome: 0.3, minorityPctNetIncome: 0.03,
      shares: 3040, price: 71.8, beta: 0.83, annualVolatility: 0.25, priceDrift: 0.04,
      averageVolume: 12_600_000, freeFloat: 0.98,
    },
    {
      driver: {
        unit: 'barris de óleo equivalente', volume: 1_030_000_000, volumeGrowth: 0.005,
        price: 0.000066, priceGrowth: 0.015, shareOfRevenue: 0.45,
      },
      segments: [
        { name: 'Integrated Gas', share: 0.24, margin: 0.32, growth: 0.05 },
        { name: 'Upstream', share: 0.21, margin: 0.38, growth: 0.02 },
        { name: 'Chemicals & Products', share: 0.38, margin: 0.05, growth: -0.01 },
        { name: 'Marketing', share: 0.14, margin: 0.12, growth: 0.06 },
        { name: 'Renewables & Energy Solutions', share: 0.03, margin: 0.04, growth: 0.18 },
      ],
      geographies: [{ name: 'Europe', share: 0.33 }, { name: 'Asia Oceania & Middle East', share: 0.31 }, { name: 'United States', share: 0.24 }, { name: 'Other', share: 0.12 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 1947, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.081 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.043 },
        { holder: 'Norges Bank', kind: 'INSTITUTIONAL', stake: 0.031 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.845 },
      ],
      peers: ['XOM', 'CVX', 'PETR4', 'PRIO3'],
    },
  ),

  bp(
    {
      ticker: 'MULT3', name: 'Multiplan', legalName: 'Multiplan Empreendimentos Imobiliários S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Real Estate', industry: 'Real Estate Management & Development', currency: 'BRL',
      description:
        'Multiplan owns and operates a portfolio of dominant shopping centres in Brazilian state capitals, earning rent from retail tenants plus parking and media revenue.',
      businessModel:
        'A mall is a landlord with operating leverage: rent is contracted and inflation-indexed, costs are largely fixed, and the overage clause means a good year for the tenant is a good year for the owner too.',
      competitiveAdvantages: ['Dominant malls in their catchment areas', 'Inflation-indexed leases with overage clauses', 'Low occupancy cost for tenants', 'Land bank adjacent to existing assets'],
      website: 'https://multiplan.com', employees: 1100, foundedYear: 1974,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Rio de Janeiro, Brazil',
      themes: ['consumer'],
    },
    {
      revenue: 2180, growthPath: [0.29, 0.18, 0.11, 0.09, 0.08, 0.07],
      ebitdaMarginPath: [0.7, 0.72, 0.73, 0.74, 0.74, 0.75],
      grossMargin: 0.66, daPctRevenue: 0.09, rndPctRevenue: 0, taxRate: 0.22,
      capexPctRevenue: 0.11, ppePctRevenue: 4.9, intangiblesPctRevenue: 0.06,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.14, netDebtToEbitda: 1.9,
      costOfDebt: 0.129, arDays: 32, invDays: 0, apDays: 21,
      dividendPayout: 0.55, buybackPctNetIncome: 0.08, minorityPctNetIncome: 0.01,
      shares: 530, price: 25.4, beta: 0.81, annualVolatility: 0.26, priceDrift: 0.04,
      averageVolume: 16_000_000, freeFloat: 0.68,
    },
    {
      driver: {
        unit: 'm² de ABL própria', volume: 878_000, volumeGrowth: 0.025,
        price: 0.00248, priceGrowth: 0.055, priceIndex: 'IPCA', shareOfRevenue: 0.86,
      },
      segments: [
        { name: 'Aluguel mínimo', share: 0.58, margin: 0.82, growth: 0.06 },
        { name: 'Aluguel percentual e mall', share: 0.18, margin: 0.78, growth: 0.09 },
        { name: 'Estacionamento', share: 0.14, margin: 0.61, growth: 0.07 },
        { name: 'Vendas imobiliárias e outros', share: 0.1, margin: 0.44, growth: 0.05 },
      ],
      geographies: [{ name: 'São Paulo', share: 0.34 }, { name: 'Rio de Janeiro', share: 0.25 }, { name: 'Sul', share: 0.19 }, { name: 'Nordeste', share: 0.13 }, { name: 'Outros', share: 0.09 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Peres', kind: 'CONTROLLING', stake: 0.279 },
        { holder: 'Ontario Teachers', kind: 'INSTITUTIONAL', stake: 0.121 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.214 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.163 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.223 },
      ],
      peers: ['ALOS3', 'CYRE3', 'LREN3', 'ASAI3'],
    },
  ),
  bp(
    {
      ticker: 'ALOS3', name: 'Allos', legalName: 'Allos S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Real Estate', industry: 'Real Estate Management & Development', currency: 'BRL',
      description:
        'Allos operates the largest shopping centre portfolio in Brazil by number of assets, following the combination of Aliansce Sonae and BR Malls.',
      businessModel:
        'Scale in malls buys negotiating power with national retail chains and lets a single management platform run assets that would each need their own. The thesis is whether the merger synergies are real.',
      competitiveAdvantages: ['Largest mall portfolio in Brazil by asset count', 'Merger synergies in overhead and tenant negotiation', 'National footprint across income brackets', 'Digital and media revenue on top of rent'],
      website: 'https://allos.com', employees: 1600, foundedYear: 2006,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Rio de Janeiro, Brazil',
      themes: ['consumer'],
    },
    {
      revenue: 2640, growthPath: [0.34, 0.22, 0.14, 0.08, 0.07, 0.06],
      ebitdaMarginPath: [0.64, 0.66, 0.68, 0.69, 0.7, 0.7],
      grossMargin: 0.61, daPctRevenue: 0.11, rndPctRevenue: 0, taxRate: 0.24,
      capexPctRevenue: 0.09, ppePctRevenue: 4.2, intangiblesPctRevenue: 0.28,
      goodwillPctRevenue: 0.19, cashPctRevenue: 0.16, netDebtToEbitda: 2.2,
      costOfDebt: 0.132, arDays: 36, invDays: 0, apDays: 24,
      dividendPayout: 0.45, buybackPctNetIncome: 0.1, minorityPctNetIncome: 0.03,
      shares: 530, price: 22.1, beta: 0.87, annualVolatility: 0.29, priceDrift: -0.01,
      averageVolume: 21_000_000, freeFloat: 0.91,
    },
    {
      driver: {
        unit: 'm² de ABL própria', volume: 1_420_000, volumeGrowth: 0.02,
        price: 0.00186, priceGrowth: 0.055, priceIndex: 'IPCA', shareOfRevenue: 0.84,
      },
      segments: [
        { name: 'Aluguel', share: 0.66, margin: 0.79, growth: 0.05 },
        { name: 'Serviços e estacionamento', share: 0.21, margin: 0.58, growth: 0.08 },
        { name: 'Mídia e digital', share: 0.13, margin: 0.51, growth: 0.14 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.44 }, { name: 'Nordeste', share: 0.24 }, { name: 'Sul', share: 0.18 }, { name: 'Centro-Oeste e Norte', share: 0.14 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.361 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.247 },
        { holder: 'Tesouraria', kind: 'TREASURY', stake: 0.031 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.361 },
      ],
      peers: ['MULT3', 'CYRE3', 'LREN3', 'ASAI3'],
    },
  ),
  bp(
    {
      ticker: 'CYRE3', name: 'Cyrela', legalName: 'Cyrela Brazil Realty S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Real Estate', industry: 'Household Durables', currency: 'BRL',
      description:
        'Cyrela develops and sells residential real estate in Brazil, concentrated in the medium and high-income segments of São Paulo and Rio de Janeiro.',
      businessModel:
        'A developer buys land, builds and sells, recognising revenue as construction progresses. The cycle turns on funding cost and household confidence, and the land bank bought at the bottom is where the margin is made.',
      competitiveAdvantages: ['Land bank in prime São Paulo locations', 'Brand recognition in the high-income segment', 'Execution record across cycles', 'Joint ventures spreading land risk'],
      website: 'https://cyrela.com', employees: 5400, foundedYear: 1962,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['consumer'],
    },
    {
      revenue: 8900, growthPath: [0.31, 0.24, 0.16, 0.11, 0.09, 0.07],
      ebitdaMarginPath: [0.19, 0.21, 0.23, 0.24, 0.24, 0.25],
      grossMargin: 0.32, daPctRevenue: 0.012, rndPctRevenue: 0, taxRate: 0.09,
      capexPctRevenue: 0.015, ppePctRevenue: 0.09, intangiblesPctRevenue: 0.03,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.19, netDebtToEbitda: 0.3,
      costOfDebt: 0.135, arDays: 118, invDays: 214, apDays: 41,
      dividendPayout: 0.4, buybackPctNetIncome: 0.09, minorityPctNetIncome: 0.07,
      shares: 372, price: 24.8, beta: 1.19, annualVolatility: 0.35, priceDrift: 0.06,
      averageVolume: 23_000_000, freeFloat: 0.79,
    },
    {
      driver: {
        unit: 'unidades lançadas', volume: 11_800, volumeGrowth: 0.05,
        price: 0.000646, priceGrowth: 0.055, priceIndex: 'INCC', shareOfRevenue: 0.86,
      },
      segments: [
        { name: 'Alto padrão', share: 0.46, margin: 0.27, growth: 0.06 },
        { name: 'Médio padrão', share: 0.34, margin: 0.23, growth: 0.09 },
        { name: 'Acessível (Vivaz e Cury)', share: 0.2, margin: 0.19, growth: 0.14 },
      ],
      geographies: [{ name: 'São Paulo', share: 0.68 }, { name: 'Rio de Janeiro', share: 0.17 }, { name: 'Sul', share: 0.09 }, { name: 'Outros', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Horn (Elie Horn)', kind: 'CONTROLLING', stake: 0.207 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.284 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.219 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.29 },
      ],
      peers: ['MRVE3', 'MULT3', 'ALOS3', 'SPG'],
    },
  ),
  bp(
    {
      ticker: 'MRVE3', name: 'MRV', legalName: 'MRV Engenharia e Participações S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Real Estate', industry: 'Household Durables', currency: 'BRL',
      description:
        'MRV builds affordable housing across Brazil under the federal housing programme, plus a United States rental development arm.',
      businessModel:
        'Affordable housing is a volume business with subsidised buyer financing: the margin per unit is thin and the return comes from turning the land and construction capital quickly.',
      competitiveAdvantages: ['Scale in the subsidised housing programme', 'Standardised construction lowering unit cost', 'National land bank at affordable price points', 'Buyer financing channelled through the federal bank'],
      website: 'https://mrv.com', employees: 23000, foundedYear: 1979,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Belo Horizonte, Brazil',
      themes: ['consumer'],
    },
    {
      revenue: 9400, growthPath: [0.18, 0.12, 0.06, 0.09, 0.11, 0.08],
      ebitdaMarginPath: [0.14, 0.11, 0.08, 0.11, 0.13, 0.14],
      grossMargin: 0.24, daPctRevenue: 0.014, rndPctRevenue: 0, taxRate: 0.07,
      capexPctRevenue: 0.018, ppePctRevenue: 0.11, intangiblesPctRevenue: 0.05,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.15, netDebtToEbitda: 3.6,
      costOfDebt: 0.142, arDays: 96, invDays: 246, apDays: 38,
      dividendPayout: 0.1, buybackPctNetIncome: 0, minorityPctNetIncome: 0.04,
      shares: 560, price: 7.12, beta: 1.41, annualVolatility: 0.44, priceDrift: -0.09,
      averageVolume: 27_000_000, freeFloat: 0.84,
    },
    {
      driver: {
        unit: 'unidades vendidas', volume: 41_500, volumeGrowth: 0.045,
        price: 0.000195, priceGrowth: 0.05, priceIndex: 'INCC', shareOfRevenue: 0.92,
      },
      segments: [
        { name: 'MRV incorporação', share: 0.74, margin: 0.15, growth: 0.07 },
        { name: 'Resia (EUA)', share: 0.14, margin: 0.09, growth: 0.12 },
        { name: 'Urba e Sensia', share: 0.12, margin: 0.11, growth: 0.16 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.51 }, { name: 'Sul', share: 0.17 }, { name: 'Nordeste', share: 0.14 }, { name: 'Estados Unidos', share: 0.13 }, { name: 'Outros', share: 0.05 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Menin', kind: 'CONTROLLING', stake: 0.287 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.241 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.196 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.276 },
      ],
      peers: ['CYRE3', 'MULT3', 'ALOS3', 'SPG'],
    },
  ),
  bp(
    {
      ticker: 'PLD', name: 'Prologis', legalName: 'Prologis, Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Real Estate', industry: 'Industrial REITs', currency: 'USD', accountingStandard: GAAP,
      description:
        'Prologis owns and develops logistics real estate near major consumption centres worldwide, leasing warehouse space to retailers and third-party logistics operators.',
      businessModel:
        'Warehouse rent near a city is a scarce good: the land is constrained and e-commerce keeps raising the space needed per dollar of sales. Leases signed years ago roll up to market, which is where the growth is.',
      competitiveAdvantages: ['Irreplaceable infill locations near consumption', 'Mark-to-market on expiring leases', 'Development pipeline on owned land', 'Scale relationships with global logistics tenants'],
      website: 'https://prologis.com', employees: 2600, foundedYear: 1983,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'San Francisco, United States',
      themes: ['infrastructure'],
    },
    {
      revenue: 8400, growthPath: [0.16, 0.14, 0.11, 0.09, 0.08, 0.07],
      ebitdaMarginPath: [0.72, 0.73, 0.74, 0.74, 0.75, 0.75],
      grossMargin: 0.71, daPctRevenue: 0.28, rndPctRevenue: 0, taxRate: 0.02,
      capexPctRevenue: 0.32, ppePctRevenue: 7.4, intangiblesPctRevenue: 0.09,
      goodwillPctRevenue: 0.07, cashPctRevenue: 0.06, netDebtToEbitda: 5.1,
      costOfDebt: 0.048, arDays: 14, invDays: 0, apDays: 19,
      dividendPayout: 0.7, buybackPctNetIncome: 0, minorityPctNetIncome: 0.04,
      shares: 928, price: 112.4, beta: 1.07, annualVolatility: 0.26, priceDrift: -0.02,
      averageVolume: 4_100_000, freeFloat: 0.97,
    },
    {
      driver: {
        unit: 'pés quadrados locáveis', volume: 1_240_000_000, volumeGrowth: 0.03,
        price: 0.0000058, priceGrowth: 0.04, shareOfRevenue: 0.94,
      },
      segments: [
        { name: 'Rental', share: 0.88, margin: 0.79, growth: 0.07 },
        { name: 'Strategic capital', share: 0.07, margin: 0.58, growth: 0.09 },
        { name: 'Development management', share: 0.05, margin: 0.31, growth: 0.11 },
      ],
      geographies: [{ name: 'United States', share: 0.83 }, { name: 'Europe', share: 0.09 }, { name: 'Asia', share: 0.05 }, { name: 'Other Americas', share: 0.03 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.148 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.096 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.071 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.685 },
      ],
      peers: ['AMT', 'MULT3', 'ALOS3', 'SPG'],
    },
  ),
  bp(
    {
      ticker: 'AMT', name: 'American Tower', legalName: 'American Tower Corporation', exchange: 'NYSE',
      country: 'United States', sector: 'Real Estate', industry: 'Specialized REITs', currency: 'USD', accountingStandard: GAAP,
      description:
        'American Tower owns communications towers leased to wireless carriers worldwide, plus a growing data centre business in the United States.',
      businessModel:
        'A tower is a fixed asset leased to two or three carriers at once, and each additional tenant is almost pure margin because the steel is already there. Leases are long, escalating and very hard to leave.',
      competitiveAdvantages: ['Multi-tenant towers with near-zero incremental cost', 'Long leases with contractual escalators', 'Very high tenant switching costs', 'Global footprint across mobile data growth markets'],
      website: 'https://americantower.com', employees: 4700, foundedYear: 1995,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Boston, United States',
      themes: ['infrastructure'],
    },
    {
      revenue: 11_600, growthPath: [0.14, 0.09, 0.04, 0.03, 0.04, 0.03],
      ebitdaMarginPath: [0.62, 0.63, 0.64, 0.64, 0.65, 0.65],
      grossMargin: 0.71, daPctRevenue: 0.24, rndPctRevenue: 0, taxRate: 0.09,
      capexPctRevenue: 0.14, ppePctRevenue: 1.05, intangiblesPctRevenue: 1.32,
      goodwillPctRevenue: 1.06, cashPctRevenue: 0.18, netDebtToEbitda: 5.6,
      costOfDebt: 0.05, arDays: 41, invDays: 0, apDays: 16,
      dividendPayout: 0.65, buybackPctNetIncome: 0.02, minorityPctNetIncome: 0.03,
      shares: 468, price: 198.7, beta: 0.84, annualVolatility: 0.27, priceDrift: -0.04,
      averageVolume: 3_400_000, freeFloat: 0.98,
    },
    {
      driver: {
        unit: 'torres em operação', volume: 224_000, volumeGrowth: 0.02,
        price: 0.0000463, priceGrowth: 0.032, shareOfRevenue: 0.91,
      },
      segments: [
        { name: 'U.S. & Canada towers', share: 0.53, margin: 0.71, growth: 0.02 },
        { name: 'International towers', share: 0.34, margin: 0.58, growth: 0.05 },
        { name: 'Data centers (CoreSite)', share: 0.09, margin: 0.49, growth: 0.11 },
        { name: 'Services', share: 0.04, margin: 0.32, growth: 0.06 },
      ],
      geographies: [{ name: 'United States', share: 0.57 }, { name: 'India & Asia', share: 0.14 }, { name: 'Latin America', share: 0.13 }, { name: 'Africa', share: 0.11 }, { name: 'Europe', share: 0.05 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.131 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.089 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.061 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.719 },
      ],
      peers: ['PLD', 'VIVT3', 'SPG', 'MULT3'],
    },
  ),
  bp(
    {
      ticker: 'SPG', name: 'Simon Property', legalName: 'Simon Property Group, Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Real Estate', industry: 'Retail REITs', currency: 'USD', accountingStandard: GAAP,
      description:
        'Simon Property Group owns premium malls and outlet centres across the United States and holds stakes in retail brands and international properties.',
      businessModel:
        'The best malls kept their pricing power while the weak ones died: occupancy cost is low enough that tenants renew, and the closures of the last decade removed the competition rather than the demand.',
      competitiveAdvantages: ['Class A malls that survived the retail shakeout', 'Low occupancy cost keeping tenants profitable', 'Outlet format with its own demand driver', 'Redevelopment of surplus anchor space'],
      website: 'https://simonproperty.com', employees: 3000, foundedYear: 1960,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Indianapolis, United States',
      themes: ['consumer'],
    },
    {
      revenue: 5900, growthPath: [0.12, 0.08, 0.05, 0.04, 0.04, 0.03],
      ebitdaMarginPath: [0.66, 0.67, 0.68, 0.68, 0.69, 0.69],
      grossMargin: 0.64, daPctRevenue: 0.21, rndPctRevenue: 0, taxRate: 0.03,
      capexPctRevenue: 0.16, ppePctRevenue: 5.2, intangiblesPctRevenue: 0.11,
      goodwillPctRevenue: 0.06, cashPctRevenue: 0.24, netDebtToEbitda: 5.4,
      costOfDebt: 0.049, arDays: 28, invDays: 0, apDays: 22,
      dividendPayout: 0.68, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.08,
      shares: 326, price: 176.8, beta: 1.24, annualVolatility: 0.29, priceDrift: 0.06,
      averageVolume: 2_100_000, freeFloat: 0.86,
    },
    {
      driver: {
        unit: 'pés quadrados de ABL', volume: 241_000_000, volumeGrowth: 0.005,
        price: 0.0000221, priceGrowth: 0.035, shareOfRevenue: 0.88,
      },
      segments: [
        { name: 'Malls e Premium Outlets', share: 0.79, margin: 0.72, growth: 0.03 },
        { name: 'The Mills', share: 0.11, margin: 0.64, growth: 0.02 },
        { name: 'Participações em varejo e internacional', share: 0.1, margin: 0.41, growth: 0.05 },
      ],
      geographies: [{ name: 'United States', share: 0.91 }, { name: 'Europe & Asia', share: 0.09 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Simon family', kind: 'CONTROLLING', stake: 0.087 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.142 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.094 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.677 },
      ],
      peers: ['MULT3', 'ALOS3', 'PLD', 'AMT'],
    },
  ),
  bp(
    {
      ticker: 'RDOR3', name: 'Rede D\'Or', legalName: 'Rede D\'Or São Luiz S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Health Care', industry: 'Health Care Providers & Services', currency: 'BRL',
      description:
        'Rede D\'Or operates the largest private hospital network in Brazil and, through SulAmérica, a health insurance business.',
      businessModel:
        'A hospital earns on occupancy and on the mix of procedures; owning the insurer on the other side aligns the incentive that usually pulls the two apart.',
      competitiveAdvantages: ['Largest private hospital network in Brazil', 'Vertical integration with the acquired insurer', 'Bargaining power with payors', 'Brand attracting the leading medical staff'],
      website: 'https://rededor.com', employees: 78000, foundedYear: 1977,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Rio de Janeiro, Brazil',
      themes: ['healthcare'],
    },
    {
      revenue: 31_200, growthPath: [0.24, 0.19, 0.14, 0.11, 0.1, 0.09],
      ebitdaMarginPath: [0.21, 0.22, 0.23, 0.23, 0.24, 0.24],
      grossMargin: 0.29, daPctRevenue: 0.062, rndPctRevenue: 0.001, taxRate: 0.24,
      capexPctRevenue: 0.085, ppePctRevenue: 0.95, intangiblesPctRevenue: 0.21,
      goodwillPctRevenue: 0.42, cashPctRevenue: 0.19, netDebtToEbitda: 2.8,
      costOfDebt: 0.133, arDays: 68, invDays: 14, apDays: 52,
      dividendPayout: 0.25, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.02,
      shares: 2180, price: 29.4, beta: 0.88, annualVolatility: 0.3, priceDrift: 0.03,
      averageVolume: 34_000_000, freeFloat: 0.42,
    },
    {
      driver: {
        unit: 'leitos operacionais', volume: 12_400, volumeGrowth: 0.045,
        price: 1.9355, priceGrowth: 0.055, priceIndex: 'IPCA', shareOfRevenue: 0.77,
      },
      segments: [
        { name: 'Hospitais', share: 0.71, margin: 0.27, growth: 0.08 },
        { name: 'Oncologia e serviços', share: 0.12, margin: 0.24, growth: 0.13 },
        { name: 'SulAmérica (seguros)', share: 0.17, margin: 0.14, growth: 0.07 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.68 }, { name: 'Nordeste', share: 0.16 }, { name: 'Centro-Oeste', share: 0.09 }, { name: 'Sul', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Moll', kind: 'CONTROLLING', stake: 0.435 },
        { holder: 'GIC', kind: 'INSTITUTIONAL', stake: 0.081 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.203 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.281 },
      ],
      peers: ['HAPV3', 'FLRY3', 'UNH', 'JNJ'],
    },
  ),
  bp(
    {
      ticker: 'FLRY3', name: 'Fleury', legalName: 'Fleury S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Health Care', industry: 'Health Care Providers & Services', currency: 'BRL',
      description:
        'Fleury runs clinical diagnostics and imaging across Brazil under several brands spanning premium and mass-market price points.',
      businessModel:
        'Diagnostics is a fixed-cost network: the equipment and the lab are paid for whether a sample arrives or not, so volume per unit decides the margin. Payor concentration is the constant pressure on price.',
      competitiveAdvantages: ['Premium brand commanding a price differential', 'Density of collection points in core cities', 'Scale in laboratory processing', 'Portfolio spanning several price tiers'],
      website: 'https://fleury.com', employees: 13500, foundedYear: 1926,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['healthcare'],
    },
    {
      revenue: 7900, growthPath: [0.19, 0.22, 0.13, 0.09, 0.07, 0.06],
      ebitdaMarginPath: [0.25, 0.26, 0.27, 0.27, 0.28, 0.28],
      grossMargin: 0.31, daPctRevenue: 0.098, rndPctRevenue: 0.002, taxRate: 0.26,
      capexPctRevenue: 0.075, ppePctRevenue: 0.72, intangiblesPctRevenue: 0.34,
      goodwillPctRevenue: 0.51, cashPctRevenue: 0.12, netDebtToEbitda: 2.4,
      costOfDebt: 0.134, arDays: 62, invDays: 9, apDays: 48,
      dividendPayout: 0.45, buybackPctNetIncome: 0.04, minorityPctNetIncome: 0.01,
      shares: 740, price: 14.6, beta: 0.76, annualVolatility: 0.28, priceDrift: 0.01,
      averageVolume: 13_000_000, freeFloat: 0.51,
    },
    {
      driver: {
        unit: 'exames realizados', volume: 96_000_000, volumeGrowth: 0.055,
        price: 0.0000823, priceGrowth: 0.05, priceIndex: 'IPCA',
      },
      segments: [
        { name: 'Unidades de atendimento', share: 0.62, margin: 0.29, growth: 0.05 },
        { name: 'Laboratório de referência (B2B)', share: 0.24, margin: 0.26, growth: 0.08 },
        { name: 'Novos elos e hospitais', share: 0.14, margin: 0.22, growth: 0.12 },
      ],
      geographies: [{ name: 'São Paulo', share: 0.54 }, { name: 'Rio de Janeiro', share: 0.18 }, { name: 'Nordeste', share: 0.15 }, { name: 'Outros', share: 0.13 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Bradesco Seguros', kind: 'CONTROLLING', stake: 0.242 },
        { holder: 'Família Bueno', kind: 'CONTROLLING', stake: 0.129 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.198 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.174 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.257 },
      ],
      peers: ['RDOR3', 'HAPV3', 'RADL3', 'UNH'],
    },
  ),
  bp(
    {
      ticker: 'LLY', name: 'Eli Lilly', legalName: 'Eli Lilly and Company', exchange: 'NYSE',
      country: 'United States', sector: 'Health Care', industry: 'Pharmaceuticals', currency: 'USD', accountingStandard: GAAP,
      description:
        'Eli Lilly develops and sells prescription medicines, with franchises in diabetes, obesity, oncology, immunology and neuroscience.',
      businessModel:
        'One class of drug is rewriting the company: incretins turned a mid-size pharmaceutical into the largest by market value. The question is manufacturing capacity and how long the exclusivity holds.',
      competitiveAdvantages: ['Leading incretin franchise in diabetes and obesity', 'Manufacturing capacity ahead of demand', 'Pipeline depth in neuroscience', 'Pricing power while exclusivity holds'],
      website: 'https://elililly.com', employees: 47000, foundedYear: 1876,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Indianapolis, United States',
      themes: ['healthcare'],
    },
    {
      revenue: 59_800, growthPath: [0.02, 0.07, 0.2, 0.32, 0.36, 0.28],
      ebitdaMarginPath: [0.29, 0.31, 0.34, 0.38, 0.42, 0.44],
      grossMargin: 0.81, daPctRevenue: 0.052, rndPctRevenue: 0.195, taxRate: 0.15,
      capexPctRevenue: 0.145, ppePctRevenue: 0.58, intangiblesPctRevenue: 0.24,
      goodwillPctRevenue: 0.19, cashPctRevenue: 0.06, netDebtToEbitda: 1.1,
      costOfDebt: 0.048, arDays: 78, invDays: 141, apDays: 54,
      dividendPayout: 0.35, buybackPctNetIncome: 0.1, minorityPctNetIncome: 0,
      shares: 900, price: 812.4, beta: 0.51, annualVolatility: 0.32, priceDrift: 0.24,
      averageVolume: 3_600_000, freeFloat: 0.87,
    },
    {
      driver: {
        unit: 'prescrições dispensadas', volume: 412_000_000, volumeGrowth: 0.11,
        price: 0.000145, priceGrowth: 0.04, shareOfRevenue: 0.95,
      },
      segments: [
        { name: 'Cardiometabólico (incretinas)', share: 0.58, margin: 0.52, growth: 0.42 },
        { name: 'Oncologia', share: 0.17, margin: 0.44, growth: 0.09 },
        { name: 'Imunologia', share: 0.13, margin: 0.41, growth: 0.16 },
        { name: 'Neurociência e outros', share: 0.12, margin: 0.36, growth: 0.11 },
      ],
      geographies: [{ name: 'United States', share: 0.69 }, { name: 'Europe', share: 0.15 }, { name: 'Japan & Asia', share: 0.1 }, { name: 'Other', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Lilly Endowment', kind: 'CONTROLLING', stake: 0.104 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.081 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.069 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.746 },
      ],
      peers: ['JNJ', 'UNH', 'ABBV', 'PG'],
    },
  ),
  bp(
    {
      ticker: 'ABBV', name: 'AbbVie', legalName: 'AbbVie Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Health Care', industry: 'Biotechnology', currency: 'USD', accountingStandard: GAAP,
      description:
        'AbbVie develops and sells immunology, oncology, neuroscience and aesthetics medicines, following the loss of exclusivity on its former lead product.',
      businessModel:
        'The whole company is a case study in patent cliffs: the successor immunology drugs had to replace a product that was once the best-selling medicine in the world, and whether they did is the thesis.',
      competitiveAdvantages: ['Two successor immunology drugs replacing the lost franchise', 'Aesthetics portfolio with consumer-like economics', 'Neuroscience pipeline depth', 'Cash generation funding acquisitions'],
      website: 'https://abbvie.com', employees: 50000, foundedYear: 2013,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'North Chicago, United States',
      themes: ['healthcare'],
    },
    {
      revenue: 57_400, growthPath: [0.23, 0.03, -0.06, 0.01, 0.04, 0.06],
      ebitdaMarginPath: [0.5, 0.47, 0.44, 0.45, 0.46, 0.47],
      grossMargin: 0.7, daPctRevenue: 0.128, rndPctRevenue: 0.135, taxRate: 0.13,
      capexPctRevenue: 0.016, ppePctRevenue: 0.14, intangiblesPctRevenue: 0.62,
      goodwillPctRevenue: 1.19, cashPctRevenue: 0.13, netDebtToEbitda: 2.3,
      costOfDebt: 0.049, arDays: 71, invDays: 116, apDays: 62,
      dividendPayout: 0.55, buybackPctNetIncome: 0.08, minorityPctNetIncome: 0,
      shares: 1770, price: 214.6, beta: 0.58, annualVolatility: 0.23, priceDrift: 0.08,
      averageVolume: 5_400_000, freeFloat: 0.98,
    },
    {
      segments: [
        { name: 'Imunologia', share: 0.47, margin: 0.52, growth: 0.06 },
        { name: 'Oncologia', share: 0.11, margin: 0.44, growth: 0.04 },
        { name: 'Neurociência', share: 0.16, margin: 0.48, growth: 0.14 },
        { name: 'Estética', share: 0.09, margin: 0.39, growth: -0.03 },
        { name: 'Outros', share: 0.17, margin: 0.41, growth: 0.02 },
      ],
      geographies: [{ name: 'United States', share: 0.76 }, { name: 'Europe', share: 0.14 }, { name: 'Japan & Asia', share: 0.06 }, { name: 'Other', share: 0.04 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.089 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.074 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.048 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.789 },
      ],
      peers: ['JNJ', 'LLY', 'UNH', 'PG'],
    },
  ),
  bp(
    {
      ticker: 'MGLU3', name: 'Magazine Luiza', legalName: 'Magazine Luiza S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Consumer Discretionary', industry: 'Broadline Retail', currency: 'BRL',
      description:
        'Magazine Luiza sells electronics, appliances and general merchandise through physical stores, its own e-commerce and a third-party marketplace.',
      businessModel:
        'An omnichannel retailer funds itself on supplier terms and earns on the spread between gross margin and the cost of serving. The marketplace take rate is the higher-margin layer bolted onto the store base.',
      competitiveAdvantages: ['Store network doubling as fulfilment', 'Marketplace take rate on third-party volume', 'Own logistics reaching most of the country', 'Credit and financial services attached to the customer base'],
      website: 'https://magazineluiza.com', employees: 39000, foundedYear: 1957,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Franca, Brazil',
      themes: ['consumer'],
    },
    {
      revenue: 38_400, growthPath: [0.42, 0.18, 0.02, 0.06, 0.08, 0.07],
      ebitdaMarginPath: [0.055, 0.048, 0.039, 0.052, 0.061, 0.066],
      grossMargin: 0.285, daPctRevenue: 0.041, rndPctRevenue: 0.008, taxRate: 0.22,
      capexPctRevenue: 0.024, ppePctRevenue: 0.28, intangiblesPctRevenue: 0.19,
      goodwillPctRevenue: 0.14, cashPctRevenue: 0.16, netDebtToEbitda: 2,
      costOfDebt: 0.144, arDays: 38, invDays: 76, apDays: 94,
      dividendPayout: 0.05, buybackPctNetIncome: 0, minorityPctNetIncome: 0.01,
      shares: 675, price: 8.94, beta: 1.62, annualVolatility: 0.52, priceDrift: -0.06,
      averageVolume: 61_000_000, freeFloat: 0.32,
    },
    {
      driver: {
        unit: 'pedidos entregues', volume: 168_000_000, volumeGrowth: 0.065,
        price: 0.00021, priceGrowth: 0.045, priceIndex: 'IPCA', shareOfRevenue: 0.92,
      },
      segments: [
        { name: 'Lojas físicas', share: 0.38, margin: 0.071, growth: 0.03 },
        { name: 'E-commerce próprio (1P)', share: 0.41, margin: 0.048, growth: 0.08 },
        { name: 'Marketplace (3P)', share: 0.13, margin: 0.118, growth: 0.14 },
        { name: 'Serviços financeiros', share: 0.08, margin: 0.146, growth: 0.11 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.52 }, { name: 'Nordeste', share: 0.21 }, { name: 'Sul', share: 0.14 }, { name: 'Centro-Oeste e Norte', share: 0.13 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Trajano', kind: 'CONTROLLING', stake: 0.601 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.151 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.098 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.15 },
      ],
      peers: ['LREN3', 'ASAI3', 'AMZN', 'WMT'],
    },
  ),
  bp(
    {
      ticker: 'HD', name: 'Home Depot', legalName: 'The Home Depot, Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Consumer Discretionary', industry: 'Specialty Retail', currency: 'USD', accountingStandard: GAAP,
      description:
        'Home Depot sells building materials, tools and home improvement products to consumers and to professional contractors across North America.',
      businessModel:
        'The professional contractor is the customer that matters: bigger baskets, more frequent visits and far less price shopping than the weekend homeowner. Store density is what wins that customer.',
      competitiveAdvantages: ['Professional contractor relationships and credit', 'Store density enabling same-day availability', 'Scale purchasing against fragmented suppliers', 'Supply chain built for bulky goods'],
      website: 'https://homedepot.com', employees: 470000, foundedYear: 1978,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Atlanta, United States',
      themes: ['consumer'],
    },
    {
      revenue: 162_000, growthPath: [0.14, 0.04, -0.03, 0.01, 0.03, 0.04],
      ebitdaMarginPath: [0.168, 0.159, 0.152, 0.148, 0.15, 0.152],
      grossMargin: 0.335, daPctRevenue: 0.021, rndPctRevenue: 0, taxRate: 0.24,
      capexPctRevenue: 0.024, ppePctRevenue: 0.32, intangiblesPctRevenue: 0.05,
      goodwillPctRevenue: 0.14, cashPctRevenue: 0.02, netDebtToEbitda: 1.6,
      costOfDebt: 0.047, arDays: 9, invDays: 73, apDays: 44,
      dividendPayout: 0.55, buybackPctNetIncome: 0.3, minorityPctNetIncome: 0,
      shares: 994, price: 378.2, beta: 1.01, annualVolatility: 0.24, priceDrift: 0.05,
      averageVolume: 3_800_000, freeFloat: 0.98,
    },
    {
      driver: {
        unit: 'transações', volume: 1_710_000_000, volumeGrowth: 0.015,
        price: 0.0000947, priceGrowth: 0.025,
      },
      segments: [
        { name: 'Building materials & décor', share: 0.44, margin: 0.155, growth: 0.03 },
        { name: 'Hardlines', share: 0.31, margin: 0.148, growth: 0.04 },
        { name: 'Pro & installation services', share: 0.25, margin: 0.161, growth: 0.06 },
      ],
      geographies: [{ name: 'United States', share: 0.92 }, { name: 'Canada', share: 0.05 }, { name: 'Mexico', share: 0.03 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.094 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.078 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.051 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.777 },
      ],
      peers: ['WMT', 'LREN3', 'MGLU3', 'MCD'],
    },
  ),
  bp(
    {
      ticker: 'MCD', name: 'McDonald\'s', legalName: 'McDonald\'s Corporation', exchange: 'NYSE',
      country: 'United States', sector: 'Consumer Discretionary', industry: 'Hotels, Restaurants & Leisure', currency: 'USD', accountingStandard: GAAP,
      description:
        'McDonald\'s operates and franchises quick-service restaurants worldwide, owning much of the real estate its franchisees occupy.',
      businessModel:
        'Mostly a landlord and a brand licensor rather than a restaurant operator: royalties and rent from franchisees carry very high margins and almost no operating risk, which is why the margin looks nothing like a restaurant.',
      competitiveAdvantages: ['Franchise model with royalty and rent economics', 'Real estate under the restaurants', 'Brand recognition in almost every market', 'Scale in advertising and supply chain'],
      website: 'https://mcdonalds.com', employees: 150000, foundedYear: 1940,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Chicago, United States',
      themes: ['consumer'],
    },
    {
      revenue: 26_400, growthPath: [0.14, 0.06, 0.08, 0.05, 0.03, 0.03],
      ebitdaMarginPath: [0.52, 0.53, 0.54, 0.55, 0.55, 0.56],
      grossMargin: 0.57, daPctRevenue: 0.084, rndPctRevenue: 0, taxRate: 0.2,
      capexPctRevenue: 0.093, ppePctRevenue: 1.02, intangiblesPctRevenue: 0.09,
      goodwillPctRevenue: 0.11, cashPctRevenue: 0.04, netDebtToEbitda: 3.2,
      costOfDebt: 0.048, arDays: 31, invDays: 2, apDays: 38,
      dividendPayout: 0.6, buybackPctNetIncome: 0.35, minorityPctNetIncome: 0,
      shares: 715, price: 308.6, beta: 0.62, annualVolatility: 0.19, priceDrift: 0.04,
      averageVolume: 3_100_000, freeFloat: 0.99,
    },
    {
      driver: {
        unit: 'restaurantes em operação', volume: 43_400, volumeGrowth: 0.02,
        price: 0.608, priceGrowth: 0.03,
      },
      segments: [
        { name: 'U.S.', share: 0.39, margin: 0.58, growth: 0.03 },
        { name: 'International operated markets', share: 0.47, margin: 0.55, growth: 0.04 },
        { name: 'International developmental & licensed', share: 0.14, margin: 0.78, growth: 0.05 },
      ],
      geographies: [{ name: 'United States', share: 0.39 }, { name: 'Europe', share: 0.32 }, { name: 'Asia Pacific', share: 0.17 }, { name: 'Other', share: 0.12 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.091 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.073 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.052 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.784 },
      ],
      peers: ['HD', 'KO', 'WMT', 'ABEV3'],
    },
  ),
  bp(
    {
      ticker: 'EMBR3', name: 'Embraer', legalName: 'Embraer S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Industrials', industry: 'Aerospace & Defense', currency: 'BRL',
      description:
        'Embraer designs and builds commercial, executive and defence aircraft, and provides services and support for the fleet in operation.',
      businessModel:
        'An aircraft programme costs a decade of development before the first delivery and then earns for thirty years on parts and support. The backlog is the revenue; the services annuity is the margin.',
      competitiveAdvantages: ['Duopoly position in the regional jet segment', 'Services annuity on an installed fleet', 'Executive aviation franchise', 'Defence programmes with the domestic government'],
      website: 'https://embraer.com', employees: 20000, foundedYear: 1969,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São José dos Campos, Brazil',
      themes: ['infrastructure'],
    },
    {
      revenue: 32_800, growthPath: [0.21, 0.18, 0.14, 0.16, 0.13, 0.11],
      ebitdaMarginPath: [0.09, 0.11, 0.13, 0.14, 0.15, 0.15],
      grossMargin: 0.2, daPctRevenue: 0.038, rndPctRevenue: 0.052, taxRate: 0.21,
      capexPctRevenue: 0.041, ppePctRevenue: 0.38, intangiblesPctRevenue: 0.24,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.29, netDebtToEbitda: 1.2,
      costOfDebt: 0.13, arDays: 54, invDays: 186, apDays: 71,
      dividendPayout: 0.15, buybackPctNetIncome: 0, minorityPctNetIncome: 0.02,
      shares: 735, price: 68.4, beta: 1.34, annualVolatility: 0.41, priceDrift: 0.19,
      averageVolume: 38_000_000, freeFloat: 0.94,
    },
    {
      driver: {
        unit: 'aeronaves entregues', volume: 215, volumeGrowth: 0.08,
        price: 122, priceGrowth: 0.035, shareOfRevenue: 0.72,
      },
      segments: [
        { name: 'Aviação comercial', share: 0.38, margin: 0.09, growth: 0.14 },
        { name: 'Aviação executiva', share: 0.29, margin: 0.14, growth: 0.11 },
        { name: 'Defesa e segurança', share: 0.13, margin: 0.11, growth: 0.09 },
        { name: 'Serviços e suporte', share: 0.2, margin: 0.26, growth: 0.1 },
      ],
      geographies: [{ name: 'América do Norte', share: 0.51 }, { name: 'Europa', share: 0.18 }, { name: 'Brasil', share: 0.14 }, { name: 'Ásia-Pacífico', share: 0.11 }, { name: 'Outros', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'União (golden share) e BNDESPar', kind: 'CONTROLLING', stake: 0.058 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.421 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.183 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.338 },
      ],
      peers: ['WEGE3', 'CAT', 'HON', 'POMO4'],
    },
  ),
  bp(
    {
      ticker: 'POMO4', name: 'Marcopolo', legalName: 'Marcopolo S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Industrials', industry: 'Machinery', currency: 'BRL',
      description:
        'Marcopolo manufactures bus bodies and coaches in Brazil and abroad, and holds a financing arm serving its own customers.',
      businessModel:
        'Bus bodies are built to order on chassis supplied by others, so the working capital cycle and the order book decide the year. Renewal programmes for urban fleets are the demand that matters.',
      competitiveAdvantages: ['Leading share in Brazilian bus bodies', 'International plants near the demand', 'Financing arm supporting fleet buyers', 'Product range across urban, road and micro'],
      website: 'https://marcopolo.com', employees: 17000, foundedYear: 1949,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Caxias do Sul, Brazil',
      themes: [],
    },
    {
      revenue: 7600, growthPath: [0.44, 0.31, 0.18, 0.09, 0.07, 0.06],
      ebitdaMarginPath: [0.13, 0.16, 0.18, 0.19, 0.19, 0.19],
      grossMargin: 0.22, daPctRevenue: 0.021, rndPctRevenue: 0.011, taxRate: 0.23,
      capexPctRevenue: 0.026, ppePctRevenue: 0.29, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.24, netDebtToEbitda: 0.3,
      costOfDebt: 0.131, arDays: 64, invDays: 98, apDays: 58,
      dividendPayout: 0.5, buybackPctNetIncome: 0.06, minorityPctNetIncome: 0.03,
      shares: 950, price: 9.42, beta: 1.12, annualVolatility: 0.34, priceDrift: 0.11,
      averageVolume: 17_000_000, freeFloat: 0.72,
    },
    {
      driver: {
        unit: 'carrocerias produzidas', volume: 24_800, volumeGrowth: 0.04,
        price: 0.2903, priceGrowth: 0.04, priceIndex: 'IPCA', shareOfRevenue: 0.95,
      },
      segments: [
        { name: 'Brasil', share: 0.64, margin: 0.21, growth: 0.05 },
        { name: 'Internacional', share: 0.27, margin: 0.14, growth: 0.09 },
        { name: 'Banco Moneo (financiamento)', share: 0.09, margin: 0.38, growth: 0.07 },
      ],
      geographies: [{ name: 'Brasil', share: 0.63 }, { name: 'África e Oriente Médio', share: 0.14 }, { name: 'América do Sul', share: 0.12 }, { name: 'Outros', share: 0.11 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Bellini e controladores', kind: 'CONTROLLING', stake: 0.281 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.216 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.234 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.269 },
      ],
      peers: ['EMBR3', 'WEGE3', 'RENT3', 'CAT'],
    },
  ),
  bp(
    {
      ticker: 'CAT', name: 'Caterpillar', legalName: 'Caterpillar Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Industrials', industry: 'Machinery', currency: 'USD', accountingStandard: GAAP,
      description:
        'Caterpillar builds construction and mining equipment, engines and turbines, and runs a captive finance arm for its dealers and customers.',
      businessModel:
        'Equipment sales are cyclical; parts and service are not. The dealer network is the moat, because a machine that cannot be serviced within a day is worthless on a mine site.',
      competitiveAdvantages: ['Dealer network with unmatched service reach', 'Aftermarket parts annuity', 'Brand in mining and heavy construction', 'Captive finance supporting dealer inventory'],
      website: 'https://caterpillar.com', employees: 113000, foundedYear: 1925,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Irving, United States',
      themes: ['commodities'],
    },
    {
      revenue: 64_800, growthPath: [0.17, 0.12, 0.13, 0.01, -0.03, 0.02],
      ebitdaMarginPath: [0.18, 0.21, 0.24, 0.25, 0.24, 0.24],
      grossMargin: 0.34, daPctRevenue: 0.037, rndPctRevenue: 0.032, taxRate: 0.24,
      capexPctRevenue: 0.041, ppePctRevenue: 0.42, intangiblesPctRevenue: 0.06,
      goodwillPctRevenue: 0.1, cashPctRevenue: 0.11, netDebtToEbitda: 1.4,
      costOfDebt: 0.048, arDays: 61, invDays: 128, apDays: 64,
      dividendPayout: 0.3, buybackPctNetIncome: 0.4, minorityPctNetIncome: 0,
      shares: 478, price: 394.8, beta: 1.16, annualVolatility: 0.28, priceDrift: 0.14,
      averageVolume: 3_200_000, freeFloat: 0.97,
    },
    {
      driver: {
        unit: 'máquinas vendidas', volume: 218_000, volumeGrowth: 0.02,
        price: 0.2312, priceGrowth: 0.03, shareOfRevenue: 0.78,
      },
      segments: [
        { name: 'Construction Industries', share: 0.42, margin: 0.26, growth: 0.01 },
        { name: 'Resource Industries', share: 0.19, margin: 0.22, growth: 0.03 },
        { name: 'Energy & Transportation', share: 0.32, margin: 0.23, growth: 0.06 },
        { name: 'Financial Products', share: 0.07, margin: 0.31, growth: 0.04 },
      ],
      geographies: [{ name: 'North America', share: 0.52 }, { name: 'Asia Pacific', share: 0.19 }, { name: 'EAME', share: 0.19 }, { name: 'Latin America', share: 0.1 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.092 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.076 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.067 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.765 },
      ],
      peers: ['EMBR3', 'HON', 'WEGE3', 'POMO4'],
    },
  ),
  bp(
    {
      ticker: 'HON', name: 'Honeywell', legalName: 'Honeywell International Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Industrials', industry: 'Industrial Conglomerates', currency: 'USD', accountingStandard: GAAP,
      description:
        'Honeywell operates across aerospace, building automation, energy and sustainability solutions, and industrial productivity technologies.',
      businessModel:
        'A conglomerate that works: each business sells into a long replacement cycle where the installed base and the certification are the barriers. Aerospace aftermarket is the crown.',
      competitiveAdvantages: ['Aerospace aftermarket with certified positions', 'Installed base in building controls', 'Process technology licensing', 'Portfolio discipline through divestment'],
      website: 'https://honeywell.com', employees: 95000, foundedYear: 1906,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Charlotte, United States',
      themes: ['technology'],
    },
    {
      revenue: 39_400, growthPath: [0.06, 0.04, 0.03, 0.04, 0.05, 0.04],
      ebitdaMarginPath: [0.23, 0.24, 0.25, 0.25, 0.26, 0.26],
      grossMargin: 0.38, daPctRevenue: 0.032, rndPctRevenue: 0.049, taxRate: 0.21,
      capexPctRevenue: 0.024, ppePctRevenue: 0.28, intangiblesPctRevenue: 0.13,
      goodwillPctRevenue: 0.45, cashPctRevenue: 0.26, netDebtToEbitda: 1.9,
      costOfDebt: 0.047, arDays: 72, invDays: 94, apDays: 61,
      dividendPayout: 0.45, buybackPctNetIncome: 0.22, minorityPctNetIncome: 0.01,
      shares: 641, price: 212.4, beta: 0.98, annualVolatility: 0.22, priceDrift: 0.03,
      averageVolume: 3_500_000, freeFloat: 0.98,
    },
    {
      segments: [
        { name: 'Aerospace Technologies', share: 0.4, margin: 0.31, growth: 0.09 },
        { name: 'Industrial Automation', share: 0.25, margin: 0.22, growth: 0.01 },
        { name: 'Building Automation', share: 0.18, margin: 0.26, growth: 0.05 },
        { name: 'Energy & Sustainability', share: 0.17, margin: 0.23, growth: 0.03 },
      ],
      geographies: [{ name: 'United States', share: 0.58 }, { name: 'Europe', share: 0.2 }, { name: 'Asia Pacific', share: 0.15 }, { name: 'Other', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.095 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.079 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.056 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.77 },
      ],
      peers: ['CAT', 'EMBR3', 'WEGE3', 'UPS'],
    },
  ),
  bp(
    {
      ticker: 'ELET3', name: 'Eletrobras', legalName: 'Centrais Elétricas Brasileiras S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Utilities', industry: 'Electric Utilities', currency: 'BRL',
      description:
        'Eletrobras is the largest power generation and transmission company in Latin America, holding a hydro-dominated generation fleet and an extensive transmission grid.',
      businessModel:
        'Privatisation converted contracted generation into merchant exposure: the hydro fleet now sells into the free market, so the power price does what a regulated tariff used to do. The transmission grid is the ballast.',
      competitiveAdvantages: ['Largest hydro fleet in the region with low marginal cost', 'Extensive transmission grid earning permitted revenue', 'Decontracting of energy into the free market', 'Scale in generation auctions'],
      website: 'https://eletrobras.com', employees: 11000, foundedYear: 1962,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Rio de Janeiro, Brazil',
      themes: ['energy-transition', 'infrastructure'],
    },
    {
      revenue: 38_200, growthPath: [0.16, 0.21, 0.09, 0.06, 0.05, 0.04],
      ebitdaMarginPath: [0.42, 0.45, 0.48, 0.5, 0.51, 0.52],
      grossMargin: 0.46, daPctRevenue: 0.095, rndPctRevenue: 0.002, taxRate: 0.26,
      capexPctRevenue: 0.115, ppePctRevenue: 1.95, intangiblesPctRevenue: 0.42,
      goodwillPctRevenue: 0.03, cashPctRevenue: 0.17, netDebtToEbitda: 2.6,
      costOfDebt: 0.128, arDays: 44, invDays: 3, apDays: 38,
      dividendPayout: 0.35, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.06,
      shares: 2280, price: 44.6, beta: 0.92, annualVolatility: 0.29, priceDrift: 0.08,
      averageVolume: 52_000_000, freeFloat: 0.89,
    },
    {
      driver: {
        unit: 'MWh gerados', volume: 182_000_000, volumeGrowth: 0.015,
        price: 0.000198, priceGrowth: 0.045, priceIndex: 'IPCA', shareOfRevenue: 0.72,
      },
      segments: [
        { name: 'Geração', share: 0.58, margin: 0.56, growth: 0.04 },
        { name: 'Transmissão', share: 0.31, margin: 0.71, growth: 0.06 },
        { name: 'Comercialização e outros', share: 0.11, margin: 0.14, growth: 0.09 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.41 }, { name: 'Norte', share: 0.24 }, { name: 'Nordeste', share: 0.19 }, { name: 'Sul', share: 0.16 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'União Federal', kind: 'CONTROLLING', stake: 0.437 },
        { holder: 'BNDESPar', kind: 'INSTITUTIONAL', stake: 0.091 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.218 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.254 },
      ],
      peers: ['CPLE6', 'TAEE11', 'ENGI11', 'EGIE3'],
    },
  ),
  bp(
    {
      ticker: 'EGIE3', name: 'Engie Brasil', legalName: 'Engie Brasil Energia S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Utilities', industry: 'Independent Power Producers', currency: 'BRL',
      description:
        'Engie Brasil Energia generates power from hydro, wind and solar assets and sells it under long-term contracts, with a transmission and gas pipeline arm.',
      businessModel:
        'A generator with a fully contracted book is a bond with an operating risk: the price is fixed years ahead, so the result turns on hydrology and on the discipline of not selling energy it cannot produce.',
      competitiveAdvantages: ['Contracted portfolio insulating from the spot price', 'Renewable fleet with low marginal cost', 'Transmission and pipeline diversification', 'Disciplined contracting policy'],
      website: 'https://engiebrasil.com', employees: 1500, foundedYear: 1998,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Florianópolis, Brazil',
      themes: ['energy-transition', 'infrastructure'],
    },
    {
      revenue: 13_400, growthPath: [0.19, 0.14, 0.08, 0.06, 0.05, 0.05],
      ebitdaMarginPath: [0.52, 0.54, 0.55, 0.56, 0.56, 0.57],
      grossMargin: 0.49, daPctRevenue: 0.098, rndPctRevenue: 0.001, taxRate: 0.27,
      capexPctRevenue: 0.135, ppePctRevenue: 2.05, intangiblesPctRevenue: 0.51,
      goodwillPctRevenue: 0.02, cashPctRevenue: 0.14, netDebtToEbitda: 2.5,
      costOfDebt: 0.127, arDays: 36, invDays: 2, apDays: 31,
      dividendPayout: 0.75, buybackPctNetIncome: 0.02, minorityPctNetIncome: 0.02,
      shares: 816, price: 41.8, beta: 0.64, annualVolatility: 0.22, priceDrift: 0.05,
      averageVolume: 18_000_000, freeFloat: 0.31,
    },
    {
      driver: {
        unit: 'MWh vendidos', volume: 46_500_000, volumeGrowth: 0.025,
        price: 0.000255, priceGrowth: 0.045, priceIndex: 'IPCA', shareOfRevenue: 0.88,
      },
      segments: [
        { name: 'Geração hídrica', share: 0.44, margin: 0.61, growth: 0.02 },
        { name: 'Geração complementar (eólica e solar)', share: 0.28, margin: 0.58, growth: 0.09 },
        { name: 'Transmissão', share: 0.16, margin: 0.74, growth: 0.07 },
        { name: 'Gás e comercialização', share: 0.12, margin: 0.24, growth: 0.06 },
      ],
      geographies: [{ name: 'Sul', share: 0.34 }, { name: 'Sudeste', share: 0.29 }, { name: 'Nordeste', share: 0.24 }, { name: 'Centro-Oeste e Norte', share: 0.13 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Engie S.A.', kind: 'CONTROLLING', stake: 0.686 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.118 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.096 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.1 },
      ],
      peers: ['ELET3', 'CPLE6', 'TAEE11', 'ENGI11'],
    },
  ),
  bp(
    {
      ticker: 'NFLX', name: 'Netflix', legalName: 'Netflix, Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Communication Services', industry: 'Entertainment', currency: 'USD', accountingStandard: GAAP,
      description:
        'Netflix operates a subscription streaming service worldwide and has added an advertising-supported tier and live programming.',
      businessModel:
        'Content is a fixed cost amortised across every subscriber, so each additional member in an existing market is nearly pure margin. The advertising tier monetises the price-sensitive part of the market without cannibalising the rest.',
      competitiveAdvantages: ['Scale in content spend amortised globally', 'Recommendation data on viewing behaviour', 'Advertising tier reaching price-sensitive households', 'Password-sharing enforcement converting viewers to payers'],
      website: 'https://netflix.com', employees: 14000, foundedYear: 1997,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Los Gatos, United States',
      themes: ['technology'],
    },
    {
      revenue: 41_800, growthPath: [0.25, 0.06, 0.07, 0.15, 0.14, 0.12],
      ebitdaMarginPath: [0.5, 0.51, 0.54, 0.56, 0.57, 0.58],
      grossMargin: 0.47, daPctRevenue: 0.32, rndPctRevenue: 0.068, taxRate: 0.14,
      capexPctRevenue: 0.008, ppePctRevenue: 0.09, intangiblesPctRevenue: 0.78,
      goodwillPctRevenue: 0.1, cashPctRevenue: 0.2, netDebtToEbitda: 0.6,
      costOfDebt: 0.048, arDays: 8, invDays: 0, apDays: 17,
      dividendPayout: 0, buybackPctNetIncome: 0.35, minorityPctNetIncome: 0,
      shares: 425, price: 968.4, beta: 1.31, annualVolatility: 0.36, priceDrift: 0.19,
      averageVolume: 3_900_000, freeFloat: 0.96,
    },
    {
      driver: {
        unit: 'assinantes pagantes', volume: 302_000_000, volumeGrowth: 0.08,
        price: 0.0001384, priceGrowth: 0.04, shareOfRevenue: 0.97,
      },
      segments: [
        { name: 'United States & Canada', share: 0.44, margin: 0.38, growth: 0.09 },
        { name: 'Europe, Middle East & Africa', share: 0.32, margin: 0.31, growth: 0.14 },
        { name: 'Latin America', share: 0.13, margin: 0.29, growth: 0.1 },
        { name: 'Asia Pacific', share: 0.11, margin: 0.26, growth: 0.19 },
      ],
      geographies: [{ name: 'United States & Canada', share: 0.44 }, { name: 'Europe, Middle East & Africa', share: 0.32 }, { name: 'Latin America', share: 0.13 }, { name: 'Asia Pacific', share: 0.11 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.085 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.069 },
        { holder: 'Capital Group', kind: 'INSTITUTIONAL', stake: 0.052 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.794 },
      ],
      peers: ['META', 'GOOGL', 'DIS', 'VIVT3'],
    },
  ),
  bp(
    {
      ticker: 'DIS', name: 'Disney', legalName: 'The Walt Disney Company', exchange: 'NYSE',
      country: 'United States', sector: 'Communication Services', industry: 'Entertainment', currency: 'USD', accountingStandard: GAAP,
      description:
        'Disney operates theme parks and cruise lines, film and television studios, and streaming and linear entertainment networks.',
      businessModel:
        'Intellectual property monetised in every channel at once: a character earns in a film, a park, a cruise and a toy. Parks are the reliable cash engine while streaming works through its losses.',
      competitiveAdvantages: ['Intellectual property monetised across many channels', 'Theme parks with pricing power and high barriers', 'Studio output feeding the streaming service', 'Sports rights anchoring the linear business'],
      website: 'https://disney.com', employees: 225000, foundedYear: 1923,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Burbank, United States',
      themes: ['consumer'],
    },
    {
      revenue: 94_200, growthPath: [0.23, 0.07, 0.03, 0.04, 0.05, 0.04],
      ebitdaMarginPath: [0.16, 0.18, 0.2, 0.22, 0.23, 0.24],
      grossMargin: 0.36, daPctRevenue: 0.058, rndPctRevenue: 0, taxRate: 0.23,
      capexPctRevenue: 0.056, ppePctRevenue: 0.42, intangiblesPctRevenue: 0.18,
      goodwillPctRevenue: 0.82, cashPctRevenue: 0.06, netDebtToEbitda: 2.1,
      costOfDebt: 0.048, arDays: 76, invDays: 9, apDays: 68,
      dividendPayout: 0.2, buybackPctNetIncome: 0.14, minorityPctNetIncome: 0.04,
      shares: 1810, price: 118.6, beta: 1.12, annualVolatility: 0.27, priceDrift: 0.06,
      averageVolume: 9_200_000, freeFloat: 0.98,
    },
    {
      segments: [
        { name: 'Experiences (parques e cruzeiros)', share: 0.38, margin: 0.31, growth: 0.05 },
        { name: 'Entertainment (estúdios e streaming)', share: 0.44, margin: 0.14, growth: 0.04 },
        { name: 'Sports (ESPN)', share: 0.18, margin: 0.16, growth: 0.02 },
      ],
      geographies: [{ name: 'United States & Canada', share: 0.74 }, { name: 'Europe', share: 0.13 }, { name: 'Asia Pacific', share: 0.1 }, { name: 'Latin America', share: 0.03 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.084 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.067 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.045 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.804 },
      ],
      peers: ['NFLX', 'META', 'GOOGL', 'MCD'],
    },
  ),
  bp(
    {
      ticker: 'BBSE3', name: 'BB Seguridade', legalName: 'BB Seguridade Participações S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Financials', industry: 'Insurance', currency: 'BRL',
      description:
        'BB Seguridade holds the insurance, pension and premium bond businesses distributed through the branch network of Banco do Brasil.',
      businessModel:
        'A distribution agreement dressed as a company: the products are underwritten in joint ventures and sold through a branch network it does not own or pay for, which is why the return on equity is extraordinary and the capital need is nearly nil.',
      competitiveAdvantages: ['Exclusive distribution through a nationwide branch network', 'Almost no capital employed at the holding', 'Rural insurance franchise tied to agricultural credit', 'Fee income uncorrelated with the credit cycle'],
      website: 'https://bbseguridade.com', employees: 200, foundedYear: 2012,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Brasília, Brazil',
      themes: ['brazilian-banks'],
    },
    {
      revenue: 9600, growthPath: [0.17, 0.21, 0.14, 0.09, 0.07, 0.06],
      ebitdaMarginPath: [0.86, 0.87, 0.88, 0.88, 0.89, 0.89],
      grossMargin: 0.91, daPctRevenue: 0.003, rndPctRevenue: 0, taxRate: 0.14,
      capexPctRevenue: 0.004, ppePctRevenue: 0.02, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.28, netDebtToEbitda: 0,
      costOfDebt: 0.1235, arDays: 21, invDays: 0, apDays: 12,
      dividendPayout: 0.9, buybackPctNetIncome: 0, minorityPctNetIncome: 0,
      shares: 2000, price: 38.4, beta: 0.58, annualVolatility: 0.21, priceDrift: 0.06,
      averageVolume: 22_000_000, freeFloat: 0.33,
    },
    {
      segments: [
        { name: 'Seguros (Brasilseg)', share: 0.44, margin: 0.91, growth: 0.07 },
        { name: 'Previdência (Brasilprev)', share: 0.33, margin: 0.88, growth: 0.05 },
        { name: 'Capitalização e corretagem', share: 0.23, margin: 0.86, growth: 0.06 },
      ],
      geographies: [{ name: 'Brasil', share: 1 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Banco do Brasil', kind: 'CONTROLLING', stake: 0.665 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.142 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.101 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.092 },
      ],
      peers: ['PSSA3', 'ITSA4', 'BBAS3', 'ITUB4'],
    },
  ),
  bp(
    {
      ticker: 'PSSA3', name: 'Porto Seguro', legalName: 'Porto Seguro S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Financials', industry: 'Insurance', currency: 'BRL',
      description:
        'Porto Seguro underwrites auto, property and health insurance in Brazil and runs consumer credit, financial and automotive services alongside it.',
      businessModel:
        'Insurance earns on the gap between premiums and claims plus the float invested in the meantime; when rates are high, the float can earn more than the underwriting. The adjacent services keep the customer for longer.',
      competitiveAdvantages: ['Scale in Brazilian auto insurance', 'Float earning at the domestic policy rate', 'Network of repair shops and service partners', 'Cross-sell into credit and health'],
      website: 'https://portoseguro.com', employees: 14000, foundedYear: 1945,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'São Paulo, Brazil',
      themes: ['brazilian-banks'],
    },
    {
      revenue: 32_400, growthPath: [0.16, 0.19, 0.13, 0.11, 0.09, 0.08],
      ebitdaMarginPath: [0.16, 0.18, 0.2, 0.21, 0.22, 0.22],
      grossMargin: 0.25, daPctRevenue: 0.012, rndPctRevenue: 0.004, taxRate: 0.28,
      capexPctRevenue: 0.015, ppePctRevenue: 0.09, intangiblesPctRevenue: 0.11,
      goodwillPctRevenue: 0.06, cashPctRevenue: 0.44, netDebtToEbitda: 0,
      costOfDebt: 0.126, arDays: 34, invDays: 0, apDays: 28,
      dividendPayout: 0.6, buybackPctNetIncome: 0.04, minorityPctNetIncome: 0.01,
      shares: 648, price: 49.2, beta: 0.79, annualVolatility: 0.24, priceDrift: 0.09,
      averageVolume: 14_000_000, freeFloat: 0.42,
    },
    {
      driver: {
        unit: 'apólices em vigor', volume: 18_600_000, volumeGrowth: 0.035,
        price: 0.001742, priceGrowth: 0.055, priceIndex: 'IPCA', shareOfRevenue: 0.84,
      },
      segments: [
        { name: 'Seguro auto', share: 0.46, margin: 0.19, growth: 0.06 },
        { name: 'Saúde e odonto', share: 0.22, margin: 0.16, growth: 0.11 },
        { name: 'Patrimonial e vida', share: 0.14, margin: 0.24, growth: 0.08 },
        { name: 'Porto Bank e serviços', share: 0.18, margin: 0.31, growth: 0.13 },
      ],
      geographies: [{ name: 'Sudeste', share: 0.67 }, { name: 'Sul', share: 0.15 }, { name: 'Nordeste', share: 0.11 }, { name: 'Outros', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Família Garfinkel', kind: 'CONTROLLING', stake: 0.481 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.194 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.163 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.162 },
      ],
      peers: ['BBSE3', 'ITSA4', 'SANB11', 'ITUB4'],
    },
  ),
  bp(
    {
      ticker: 'GS', name: 'Goldman Sachs', legalName: 'The Goldman Sachs Group, Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Financials', industry: 'Capital Markets', currency: 'USD', accountingStandard: GAAP,
      description:
        'Goldman Sachs provides investment banking, markets, asset management and wealth management services to institutions, corporations and individuals.',
      businessModel:
        'Two businesses with different rhythms: advisory and underwriting swing with the deal cycle, while asset and wealth management fees recur. The strategy of the last decade has been to grow the second so the first matters less.',
      competitiveAdvantages: ['Leading advisory franchise on large transactions', 'Markets business benefiting from volatility', 'Growing fee-based asset and wealth management', 'Talent and client relationships at the top of the market'],
      website: 'https://goldmansachs.com', employees: 46000, foundedYear: 1869,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'New York, United States',
      themes: [],
    },
    {
      revenue: 53_600, growthPath: [0.33, -0.2, -0.04, 0.09, 0.16, 0.11],
      ebitdaMarginPath: [0.41, 0.33, 0.31, 0.36, 0.39, 0.4],
      grossMargin: 0.58, daPctRevenue: 0.041, rndPctRevenue: 0, taxRate: 0.22,
      capexPctRevenue: 0.032, ppePctRevenue: 0.29, intangiblesPctRevenue: 0.06,
      goodwillPctRevenue: 0.16, cashPctRevenue: 0.68, netDebtToEbitda: 0,
      costOfDebt: 0.052, arDays: 0, invDays: 0, apDays: 0,
      dividendPayout: 0.25, buybackPctNetIncome: 0.4, minorityPctNetIncome: 0.02,
      shares: 308, price: 612.8, beta: 1.34, annualVolatility: 0.28, priceDrift: 0.18,
      averageVolume: 2_400_000, freeFloat: 0.96,
    },
    {
      segments: [
        { name: 'Global Banking & Markets', share: 0.66, margin: 0.42, growth: 0.12 },
        { name: 'Asset & Wealth Management', share: 0.29, margin: 0.34, growth: 0.09 },
        { name: 'Platform Solutions', share: 0.05, margin: 0.11, growth: 0.04 },
      ],
      geographies: [{ name: 'Americas', share: 0.62 }, { name: 'EMEA', share: 0.26 }, { name: 'Asia', share: 0.12 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.086 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.061 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.048 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.805 },
      ],
      peers: ['JPM', 'BPAC11', 'BLK', 'B3SA3'],
    },
  ),
  bp(
    {
      ticker: 'BLK', name: 'BlackRock', legalName: 'BlackRock, Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Financials', industry: 'Capital Markets', currency: 'USD', accountingStandard: GAAP,
      description:
        'BlackRock is the largest asset manager in the world, running index and active strategies and licensing its Aladdin risk platform to other institutions.',
      businessModel:
        'A fee on assets that compound whether or not anyone does anything: index products gather flows at low basis points but enormous scale, and Aladdin sells the plumbing to competitors.',
      competitiveAdvantages: ['Largest asset base in the industry', 'iShares franchise capturing index flows', 'Aladdin licensed to competing institutions', 'Private markets platform with higher fee rates'],
      website: 'https://blackrock.com', employees: 21000, foundedYear: 1988,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'New York, United States',
      themes: ['technology'],
    },
    {
      revenue: 21_400, growthPath: [0.11, -0.08, 0.05, 0.09, 0.12, 0.1],
      ebitdaMarginPath: [0.4, 0.38, 0.39, 0.4, 0.41, 0.42],
      grossMargin: 0.51, daPctRevenue: 0.028, rndPctRevenue: 0, taxRate: 0.23,
      capexPctRevenue: 0.019, ppePctRevenue: 0.16, intangiblesPctRevenue: 0.34,
      goodwillPctRevenue: 1.02, cashPctRevenue: 0.42, netDebtToEbitda: 0.8,
      costOfDebt: 0.048, arDays: 84, invDays: 0, apDays: 22,
      dividendPayout: 0.45, buybackPctNetIncome: 0.25, minorityPctNetIncome: 0.03,
      shares: 155, price: 1042.6, beta: 1.29, annualVolatility: 0.26, priceDrift: 0.13,
      averageVolume: 680_000, freeFloat: 0.95,
    },
    {
      driver: {
        unit: 'US$ mi sob gestão', volume: 11_600_000, volumeGrowth: 0.08,
        price: 0.001845, priceGrowth: 0.005, shareOfRevenue: 0.87,
      },
      segments: [
        { name: 'ETFs e index (iShares)', share: 0.41, margin: 0.44, growth: 0.11 },
        { name: 'Ativa e multiativos', share: 0.29, margin: 0.39, growth: 0.05 },
        { name: 'Mercados privados', share: 0.14, margin: 0.48, growth: 0.19 },
        { name: 'Technology (Aladdin)', share: 0.16, margin: 0.36, growth: 0.14 },
      ],
      geographies: [{ name: 'Americas', share: 0.64 }, { name: 'EMEA', share: 0.28 }, { name: 'Asia Pacific', share: 0.08 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.089 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.041 },
        { holder: 'Temasek', kind: 'INSTITUTIONAL', stake: 0.032 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.838 },
      ],
      peers: ['GS', 'JPM', 'B3SA3', 'BPAC11'],
    },
  ),
  bp(
    {
      ticker: 'TSM', name: 'TSMC', legalName: 'Taiwan Semiconductor Manufacturing Company Limited', exchange: 'NYSE',
      country: 'Taiwan', sector: 'Information Technology', industry: 'Semiconductors', currency: 'USD', accountingStandard: GAAP,
      description:
        'TSMC manufactures semiconductors for fabless designers, holding the leading position at the most advanced process nodes.',
      businessModel:
        'Everyone who designs a leading-edge chip has to buy from the same foundry, which is the strongest position in the supply chain and the reason pricing holds. The capital intensity is the price of keeping it.',
      competitiveAdvantages: ['Leading-edge process technology ahead of rivals', 'Customer concentration among the largest fabless designers', 'Scale amortising enormous capital spend', 'Ecosystem of design tools built around its nodes'],
      website: 'https://tsmc.com', employees: 77000, foundedYear: 1987,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Hsinchu, Taiwan',
      themes: ['ai', 'technology'],
    },
    {
      revenue: 118_000, growthPath: [0.43, -0.09, 0.12, 0.31, 0.24, 0.18],
      ebitdaMarginPath: [0.62, 0.58, 0.61, 0.66, 0.68, 0.69],
      grossMargin: 0.57, daPctRevenue: 0.185, rndPctRevenue: 0.078, taxRate: 0.16,
      capexPctRevenue: 0.345, ppePctRevenue: 1.42, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.55, netDebtToEbitda: -0.9,
      costOfDebt: 0.046, arDays: 41, invDays: 86, apDays: 34,
      dividendPayout: 0.45, buybackPctNetIncome: 0, minorityPctNetIncome: 0.01,
      shares: 5190, price: 248.6, beta: 1.41, annualVolatility: 0.34, priceDrift: 0.22,
      averageVolume: 16_000_000, freeFloat: 0.94,
    },
    {
      driver: {
        unit: 'wafers equivalentes de 12 polegadas', volume: 16_200_000, volumeGrowth: 0.07,
        price: 0.006296, priceGrowth: 0.045,
      },
      segments: [
        { name: 'Alto desempenho (HPC e IA)', share: 0.54, margin: 0.72, growth: 0.34 },
        { name: 'Smartphone', share: 0.29, margin: 0.66, growth: 0.04 },
        { name: 'IoT e automotivo', share: 0.12, margin: 0.61, growth: 0.08 },
        { name: 'Outros', share: 0.05, margin: 0.54, growth: 0.03 },
      ],
      geographies: [{ name: 'North America', share: 0.69 }, { name: 'Asia Pacific', share: 0.18 }, { name: 'China', share: 0.09 }, { name: 'Other', share: 0.04 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'National Development Fund (Taiwan)', kind: 'CONTROLLING', stake: 0.064 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.031 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.024 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.881 },
      ],
      peers: ['NVDA', 'AMD', 'AAPL', 'ASML'],
    },
  ),
  bp(
    {
      ticker: 'ASML', name: 'ASML', legalName: 'ASML Holding N.V.', exchange: 'NASDAQ',
      country: 'Netherlands', sector: 'Information Technology', industry: 'Semiconductors', currency: 'USD', accountingStandard: GAAP,
      description:
        'ASML builds the lithography systems used to pattern semiconductor wafers and is the only supplier of extreme ultraviolet machines.',
      businessModel:
        'A monopoly on the machine every advanced chip needs. The backlog is the revenue, the installed base is an annuity in service and upgrades, and export controls are the only thing that moves the demand curve.',
      competitiveAdvantages: ['Sole supplier of extreme ultraviolet lithography', 'Installed base annuity in service and upgrades', 'Decades of accumulated process knowledge', 'Customer co-investment in development'],
      website: 'https://asml.com', employees: 44000, foundedYear: 1984,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Veldhoven, Netherlands',
      themes: ['ai', 'technology'],
    },
    {
      revenue: 31_800, growthPath: [0.34, 0.14, -0.03, 0.16, 0.21, 0.15],
      ebitdaMarginPath: [0.36, 0.34, 0.31, 0.34, 0.36, 0.37],
      grossMargin: 0.52, daPctRevenue: 0.038, rndPctRevenue: 0.145, taxRate: 0.17,
      capexPctRevenue: 0.041, ppePctRevenue: 0.36, intangiblesPctRevenue: 0.09,
      goodwillPctRevenue: 0.15, cashPctRevenue: 0.29, netDebtToEbitda: -0.6,
      costOfDebt: 0.045, arDays: 64, invDays: 192, apDays: 41,
      dividendPayout: 0.4, buybackPctNetIncome: 0.25, minorityPctNetIncome: 0,
      shares: 393, price: 812.4, beta: 1.46, annualVolatility: 0.35, priceDrift: 0.11,
      averageVolume: 1_900_000, freeFloat: 0.97,
    },
    {
      driver: {
        unit: 'sistemas de litografia entregues', volume: 486, volumeGrowth: 0.06,
        price: 58.02, priceGrowth: 0.03, shareOfRevenue: 0.79,
      },
      segments: [
        { name: 'EUV', share: 0.44, margin: 0.42, growth: 0.18 },
        { name: 'DUV', share: 0.35, margin: 0.34, growth: 0.02 },
        { name: 'Aplicações e metrologia', share: 0.06, margin: 0.31, growth: 0.09 },
        { name: 'Serviços e upgrades', share: 0.15, margin: 0.38, growth: 0.12 },
      ],
      geographies: [{ name: 'Taiwan', share: 0.32 }, { name: 'South Korea', share: 0.24 }, { name: 'China', share: 0.21 }, { name: 'United States', share: 0.14 }, { name: 'Other', share: 0.09 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.041 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.036 },
        { holder: 'Capital Group', kind: 'INSTITUTIONAL', stake: 0.029 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.894 },
      ],
      peers: ['TSM', 'NVDA', 'AMD', 'ORCL'],
    },
  ),
  bp(
    {
      ticker: 'AVGO', name: 'Broadcom', legalName: 'Broadcom Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Information Technology', industry: 'Semiconductors', currency: 'USD', accountingStandard: GAAP,
      description:
        'Broadcom designs semiconductors for networking, storage and wireless, and owns a large infrastructure software portfolio built through acquisition.',
      businessModel:
        'Buy an entrenched franchise, raise the price, cut everything that is not the franchise. It works because the products sit in sockets that are expensive to change, and the custom AI accelerator business is the same logic applied to hyperscalers.',
      competitiveAdvantages: ['Custom accelerator design for hyperscalers', 'Networking silicon with entrenched positions', 'Software franchises with very high renewal rates', 'Disciplined cost structure after acquisitions'],
      website: 'https://broadcom.com', employees: 37000, foundedYear: 1961,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Palo Alto, United States',
      themes: ['ai', 'technology'],
    },
    {
      revenue: 58_200, growthPath: [0.21, 0.08, 0.44, 0.31, 0.24, 0.19],
      ebitdaMarginPath: [0.58, 0.59, 0.56, 0.61, 0.64, 0.65],
      grossMargin: 0.68, daPctRevenue: 0.155, rndPctRevenue: 0.165, taxRate: 0.11,
      capexPctRevenue: 0.012, ppePctRevenue: 0.09, intangiblesPctRevenue: 1.02,
      goodwillPctRevenue: 1.48, cashPctRevenue: 0.16, netDebtToEbitda: 1.9,
      costOfDebt: 0.05, arDays: 38, invDays: 58, apDays: 31,
      dividendPayout: 0.45, buybackPctNetIncome: 0.18, minorityPctNetIncome: 0,
      shares: 4700, price: 270, beta: 1.21, annualVolatility: 0.37, priceDrift: 0.28,
      averageVolume: 22_000_000, freeFloat: 0.98,
    },
    {
      segments: [
        { name: 'Semiconductor solutions', share: 0.59, margin: 0.62, growth: 0.24 },
        { name: 'Infrastructure software', share: 0.41, margin: 0.71, growth: 0.14 },
      ],
      geographies: [{ name: 'China', share: 0.32 }, { name: 'United States', share: 0.27 }, { name: 'Singapore & Taiwan', share: 0.24 }, { name: 'Europe', share: 0.1 }, { name: 'Other', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.087 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.072 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.043 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.798 },
      ],
      peers: ['NVDA', 'AMD', 'TSM', 'ORCL'],
    },
  ),
  bp(
    {
      ticker: 'COP', name: 'ConocoPhillips', legalName: 'ConocoPhillips', exchange: 'NYSE',
      country: 'United States', sector: 'Energy', industry: 'Oil, Gas & Consumable Fuels', currency: 'USD', accountingStandard: GAAP,
      description:
        'ConocoPhillips is an independent exploration and production company with assets in the Lower 48, Alaska, Canada, Norway and Qatar liquefied natural gas.',
      businessModel:
        'A pure producer with no refining to smooth the cycle: the result is the oil price times the barrels, less a cost of supply the company has spent a decade lowering. Capital discipline is the entire management proposition.',
      competitiveAdvantages: ['Cost of supply below the mid-cycle price', 'Unconventional acreage with short-cycle flexibility', 'Liquefied natural gas position in Qatar and Alaska', 'Balance sheet able to buy assets in downturns'],
      website: 'https://conocophillips.com', employees: 11800, foundedYear: 1875,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Houston, United States',
      themes: ['commodities'],
    },
    {
      revenue: 58_400, growthPath: [0.72, -0.22, -0.09, 0.02, 0.06, -0.01],
      ebitdaMarginPath: [0.52, 0.44, 0.41, 0.4, 0.41, 0.4],
      grossMargin: 0.44, daPctRevenue: 0.155, rndPctRevenue: 0.002, taxRate: 0.33,
      capexPctRevenue: 0.195, ppePctRevenue: 1.28, intangiblesPctRevenue: 0.02,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.11, netDebtToEbitda: 0.3,
      costOfDebt: 0.047, arDays: 38, invDays: 14, apDays: 42,
      dividendPayout: 0.45, buybackPctNetIncome: 0.3, minorityPctNetIncome: 0.01,
      shares: 1210, price: 104.8, beta: 1.06, annualVolatility: 0.3, priceDrift: -0.03,
      averageVolume: 6_800_000, freeFloat: 0.98,
    },
    {
      driver: {
        unit: 'barris de óleo equivalente', volume: 712_000_000, volumeGrowth: 0.025,
        price: 0.000082, priceGrowth: 0.015,
      },
      segments: [
        { name: 'Lower 48', share: 0.54, margin: 0.39, growth: 0.04 },
        { name: 'Alaska', share: 0.14, margin: 0.44, growth: 0.02 },
        { name: 'Canada', share: 0.11, margin: 0.36, growth: 0.03 },
        { name: 'Europe, Middle East & North Africa', share: 0.13, margin: 0.48, growth: 0.01 },
        { name: 'Asia Pacific', share: 0.08, margin: 0.46, growth: 0.02 },
      ],
      geographies: [{ name: 'United States', share: 0.71 }, { name: 'Europe', share: 0.12 }, { name: 'Canada', share: 0.1 }, { name: 'Asia Pacific', share: 0.07 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.091 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.074 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.058 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.777 },
      ],
      peers: ['CVX', 'XOM', 'SHEL', 'PRIO3'],
    },
  ),
  bp(
    {
      ticker: 'LIN', name: 'Linde', legalName: 'Linde plc', exchange: 'NASDAQ',
      country: 'United Kingdom', sector: 'Materials', industry: 'Chemicals', currency: 'USD', accountingStandard: GAAP,
      description:
        'Linde produces and distributes industrial gases — oxygen, nitrogen, argon, hydrogen — to industry, healthcare and electronics under long-term contracts.',
      businessModel:
        'An air separation plant built next to a customer, under a fifteen-year take-or-pay contract with inflation pass-through, is closer to infrastructure than to chemicals. Density of the pipeline network is what keeps competitors out.',
      competitiveAdvantages: ['On-site plants under long take-or-pay contracts', 'Pipeline density creating regional monopolies', 'Inflation and energy cost pass-through', 'Hydrogen position ahead of the transition'],
      website: 'https://linde.com', employees: 66000, foundedYear: 1879,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Woking, United Kingdom',
      themes: ['energy-transition'],
    },
    {
      revenue: 33_600, growthPath: [0.09, 0.03, 0.01, 0.02, 0.03, 0.03],
      ebitdaMarginPath: [0.28, 0.3, 0.32, 0.33, 0.34, 0.34],
      grossMargin: 0.46, daPctRevenue: 0.105, rndPctRevenue: 0.005, taxRate: 0.23,
      capexPctRevenue: 0.125, ppePctRevenue: 0.76, intangiblesPctRevenue: 0.31,
      goodwillPctRevenue: 0.79, cashPctRevenue: 0.13, netDebtToEbitda: 1.7,
      costOfDebt: 0.046, arDays: 52, invDays: 32, apDays: 48,
      dividendPayout: 0.4, buybackPctNetIncome: 0.3, minorityPctNetIncome: 0.02,
      shares: 472, price: 462.4, beta: 0.86, annualVolatility: 0.2, priceDrift: 0.07,
      averageVolume: 1_700_000, freeFloat: 0.98,
    },
    {
      driver: {
        unit: 'metros cúbicos de gás entregues', volume: 168_000_000_000, volumeGrowth: 0.03,
        price: 0.0000002, priceGrowth: 0.035, shareOfRevenue: 0.88,
      },
      segments: [
        { name: 'Americas', share: 0.42, margin: 0.36, growth: 0.03 },
        { name: 'EMEA', share: 0.27, margin: 0.33, growth: 0.02 },
        { name: 'APAC', share: 0.22, margin: 0.32, growth: 0.04 },
        { name: 'Engineering', share: 0.09, margin: 0.21, growth: 0.06 },
      ],
      geographies: [{ name: 'Americas', share: 0.45 }, { name: 'EMEA', share: 0.28 }, { name: 'Asia Pacific', share: 0.27 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.086 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.071 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.049 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.794 },
      ],
      peers: ['SUZB3', 'KLBN11', 'HON', 'CAT'],
    },
  ),
  bp(
    {
      ticker: 'USIM5', name: 'Usiminas', legalName: 'Usinas Siderúrgicas de Minas Gerais S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Materials', industry: 'Metals & Mining', currency: 'BRL',
      description:
        'Usiminas produces flat steel for the Brazilian automotive and industrial markets and operates its own iron ore mine and steel distribution network.',
      businessModel:
        'Flat steel for the domestic car industry, competing against imports priced off the Chinese export market. The mine provides a partial hedge; the blast furnace is a fixed cost that punishes any volume shortfall.',
      competitiveAdvantages: ['Captive iron ore supply', 'Position in automotive-grade flat steel', 'Distribution network reaching processors', 'Proximity to the domestic industrial base'],
      website: 'https://usiminas.com', employees: 14000, foundedYear: 1956,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Belo Horizonte, Brazil',
      themes: ['commodities'],
    },
    {
      revenue: 27_600, growthPath: [0.51, -0.19, -0.11, 0.04, 0.03, 0.02],
      ebitdaMarginPath: [0.24, 0.11, 0.06, 0.09, 0.11, 0.11],
      grossMargin: 0.14, daPctRevenue: 0.048, rndPctRevenue: 0.001, taxRate: 0.24,
      capexPctRevenue: 0.062, ppePctRevenue: 0.86, intangiblesPctRevenue: 0.03,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.19, netDebtToEbitda: 1.4,
      costOfDebt: 0.138, arDays: 31, invDays: 112, apDays: 44,
      dividendPayout: 0.25, buybackPctNetIncome: 0, minorityPctNetIncome: 0.04,
      shares: 1250, price: 6.12, beta: 1.53, annualVolatility: 0.45, priceDrift: -0.07,
      averageVolume: 31_000_000, freeFloat: 0.44,
    },
    {
      driver: {
        unit: 'toneladas de aço vendidas', volume: 4_150_000, volumeGrowth: 0.02,
        price: 0.005325, priceGrowth: 0.025, shareOfRevenue: 0.8,
      },
      segments: [
        { name: 'Siderurgia', share: 0.72, margin: 0.07, growth: 0.02 },
        { name: 'Mineração (Musa)', share: 0.14, margin: 0.31, growth: 0.05 },
        { name: 'Transformação e distribuição', share: 0.14, margin: 0.09, growth: 0.03 },
      ],
      geographies: [{ name: 'Brasil', share: 0.86 }, { name: 'América Latina', share: 0.08 }, { name: 'Outros', share: 0.06 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Nippon Steel e Ternium', kind: 'CONTROLLING', stake: 0.478 },
        { holder: 'Previdência e fundos locais', kind: 'INSTITUTIONAL', stake: 0.147 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.128 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.247 },
      ],
      peers: ['GGBR4', 'CSNA3', 'VALE3', 'LIN'],
    },
  ),
  bp(
    {
      ticker: 'PEP', name: 'PepsiCo', legalName: 'PepsiCo, Inc.', exchange: 'NASDAQ',
      country: 'United States', sector: 'Consumer Staples', industry: 'Beverages', currency: 'USD', accountingStandard: GAAP,
      description:
        'PepsiCo sells beverages and convenient foods worldwide, with a snacks business that is larger and more profitable than the drinks it is named for.',
      businessModel:
        'Snacks are the better business: higher margin, less price competition and a direct-store-delivery system competitors cannot replicate. Beverages give the distribution scale that makes it work.',
      competitiveAdvantages: ['Direct-store-delivery network for snacks', 'Snack brands with shelf dominance', 'Portfolio spanning drinks and food', 'Pricing power through inflation'],
      website: 'https://pepsico.com', employees: 319000, foundedYear: 1898,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Purchase, United States',
      themes: ['consumer'],
    },
    {
      revenue: 93_800, growthPath: [0.13, 0.06, 0.04, 0.03, 0.03, 0.03],
      ebitdaMarginPath: [0.17, 0.18, 0.18, 0.19, 0.19, 0.2],
      grossMargin: 0.545, daPctRevenue: 0.031, rndPctRevenue: 0.008, taxRate: 0.21,
      capexPctRevenue: 0.052, ppePctRevenue: 0.34, intangiblesPctRevenue: 0.21,
      goodwillPctRevenue: 0.19, cashPctRevenue: 0.09, netDebtToEbitda: 2.4,
      costOfDebt: 0.047, arDays: 39, invDays: 42, apDays: 76,
      dividendPayout: 0.65, buybackPctNetIncome: 0.1, minorityPctNetIncome: 0.01,
      shares: 1372, price: 148.6, beta: 0.52, annualVolatility: 0.17, priceDrift: 0.02,
      averageVolume: 6_100_000, freeFloat: 0.97,
    },
    {
      segments: [
        { name: 'Frito-Lay North America', share: 0.26, margin: 0.29, growth: 0.02 },
        { name: 'PepsiCo Beverages North America', share: 0.29, margin: 0.13, growth: 0.03 },
        { name: 'Quaker Foods North America', share: 0.03, margin: 0.22, growth: 0.01 },
        { name: 'International', share: 0.42, margin: 0.17, growth: 0.05 },
      ],
      geographies: [{ name: 'United States', share: 0.58 }, { name: 'Europe', share: 0.15 }, { name: 'Latin America', share: 0.12 }, { name: 'Asia & Africa', share: 0.15 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.093 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.076 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.048 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.783 },
      ],
      peers: ['KO', 'PG', 'ABEV3', 'WMT'],
    },
  ),
  bp(
    {
      ticker: 'COST', name: 'Costco', legalName: 'Costco Wholesale Corporation', exchange: 'NASDAQ',
      country: 'United States', sector: 'Consumer Staples', industry: 'Consumer Staples Distribution & Retail', currency: 'USD', accountingStandard: GAAP,
      description:
        'Costco operates membership warehouse clubs selling a deliberately limited assortment at very low gross margins, earning most of its profit from membership fees.',
      businessModel:
        'The membership fee is the profit; the merchandise is sold close to cost to justify renewing it. Limiting the assortment to a few thousand items is what gives the buying power that makes the low price possible.',
      competitiveAdvantages: ['Membership fee renewal rates above ninety percent', 'Limited assortment concentrating buying power', 'Lowest gross margin in retail as a barrier', 'Kirkland private label with genuine quality position'],
      website: 'https://costco.com', employees: 333000, foundedYear: 1983,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Issaquah, United States',
      themes: ['consumer'],
    },
    {
      revenue: 268_000, growthPath: [0.16, 0.07, 0.06, 0.05, 0.06, 0.06],
      ebitdaMarginPath: [0.042, 0.043, 0.044, 0.045, 0.046, 0.047],
      grossMargin: 0.125, daPctRevenue: 0.009, rndPctRevenue: 0, taxRate: 0.25,
      capexPctRevenue: 0.019, ppePctRevenue: 0.12, intangiblesPctRevenue: 0.01,
      goodwillPctRevenue: 0, cashPctRevenue: 0.05, netDebtToEbitda: -0.6,
      costOfDebt: 0.046, arDays: 4, invDays: 31, apDays: 44,
      dividendPayout: 0.28, buybackPctNetIncome: 0.06, minorityPctNetIncome: 0,
      shares: 444, price: 938.4, beta: 0.79, annualVolatility: 0.21, priceDrift: 0.1,
      averageVolume: 2_100_000, freeFloat: 0.99,
    },
    {
      driver: {
        unit: 'membros pagantes', volume: 81_000_000, volumeGrowth: 0.07,
        price: 0.003309, priceGrowth: 0.02, shareOfRevenue: 0.98,
      },
      segments: [
        { name: 'Foods & sundries', share: 0.42, margin: 0.041, growth: 0.05 },
        { name: 'Non-foods', share: 0.26, margin: 0.048, growth: 0.06 },
        { name: 'Fresh foods', share: 0.14, margin: 0.039, growth: 0.07 },
        { name: 'Warehouse ancillary', share: 0.16, margin: 0.056, growth: 0.08 },
        { name: 'Membership fees', share: 0.02, margin: 0.98, growth: 0.09 },
      ],
      geographies: [{ name: 'United States', share: 0.73 }, { name: 'Canada', share: 0.14 }, { name: 'Other International', share: 0.13 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.091 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.073 },
        { holder: 'State Street', kind: 'INSTITUTIONAL', stake: 0.042 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.794 },
      ],
      peers: ['WMT', 'ASAI3', 'PEP', 'KO'],
    },
  ),
  bp(
    {
      ticker: 'UPS', name: 'UPS', legalName: 'United Parcel Service, Inc.', exchange: 'NYSE',
      country: 'United States', sector: 'Industrials', industry: 'Air Freight & Logistics', currency: 'USD', accountingStandard: GAAP,
      description:
        'UPS moves packages and freight worldwide through an integrated air and ground network, with a healthcare logistics business built on top of it.',
      businessModel:
        'A network business where density decides everything: the cost of the next stop on a route already being driven is almost nothing, so volume per route is the whole margin equation. Losing volume hurts more than it looks.',
      competitiveAdvantages: ['Integrated air and ground network', 'Route density lowering cost per stop', 'Healthcare logistics with regulated handling', 'Contractual relationships with large shippers'],
      website: 'https://ups.com', employees: 490000, foundedYear: 1907,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Atlanta, United States',
      themes: ['infrastructure'],
    },
    {
      revenue: 91_200, growthPath: [0.15, -0.03, -0.09, 0.01, 0.03, 0.02],
      ebitdaMarginPath: [0.16, 0.13, 0.11, 0.11, 0.12, 0.12],
      grossMargin: 0.22, daPctRevenue: 0.049, rndPctRevenue: 0, taxRate: 0.24,
      capexPctRevenue: 0.053, ppePctRevenue: 0.51, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.06, cashPctRevenue: 0.07, netDebtToEbitda: 1.9,
      costOfDebt: 0.048, arDays: 49, invDays: 3, apDays: 41,
      dividendPayout: 0.6, buybackPctNetIncome: 0.12, minorityPctNetIncome: 0,
      shares: 848, price: 96.4, beta: 1.08, annualVolatility: 0.26, priceDrift: -0.09,
      averageVolume: 6_300_000, freeFloat: 0.88,
    },
    {
      driver: {
        unit: 'pacotes entregues', volume: 5_380_000_000, volumeGrowth: 0.015,
        price: 0.0000145, priceGrowth: 0.03, shareOfRevenue: 0.86,
      },
      segments: [
        { name: 'U.S. Domestic', share: 0.66, margin: 0.1, growth: 0.02 },
        { name: 'International', share: 0.19, margin: 0.18, growth: 0.03 },
        { name: 'Supply Chain Solutions', share: 0.15, margin: 0.09, growth: 0.05 },
      ],
      geographies: [{ name: 'United States', share: 0.79 }, { name: 'Europe', share: 0.11 }, { name: 'Asia Pacific', share: 0.07 }, { name: 'Other', share: 0.03 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Annie Casey Foundation e família', kind: 'CONTROLLING', stake: 0.111 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.082 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.063 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.744 },
      ],
      peers: ['RAIL3', 'CAT', 'HON', 'AMZN'],
    },
  ),
  bp(
    {
      ticker: 'BAC', name: 'Bank of America', legalName: 'Bank of America Corporation', exchange: 'NYSE',
      country: 'United States', sector: 'Financials', industry: 'Banks', currency: 'USD', accountingStandard: GAAP,
      description:
        'Bank of America provides consumer banking, wealth management, corporate banking and markets services across the United States and internationally.',
      businessModel:
        'The most rate-sensitive of the large banks: an enormous low-cost deposit base means net interest income moves sharply with the policy rate in both directions. Wealth management is the ballast.',
      competitiveAdvantages: ['Very large low-cost consumer deposit base', 'Wealth management franchise from the Merrill acquisition', 'Digital adoption lowering cost to serve', 'Scale in domestic consumer lending'],
      website: 'https://bankofamerica.com', employees: 213000, foundedYear: 1904,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Charlotte, United States',
      themes: [],
    },
    {
      revenue: 102_000, growthPath: [0.09, 0.14, 0.06, 0.03, 0.05, 0.04],
      ebitdaMarginPath: [0.38, 0.42, 0.39, 0.38, 0.4, 0.41],
      grossMargin: 0.56, daPctRevenue: 0.026, rndPctRevenue: 0.003, taxRate: 0.19,
      capexPctRevenue: 0.028, ppePctRevenue: 0.14, intangiblesPctRevenue: 0.07,
      goodwillPctRevenue: 0.68, cashPctRevenue: 0.58, netDebtToEbitda: 0,
      costOfDebt: 0.0465, arDays: 0, invDays: 0, apDays: 0,
      dividendPayout: 0.3, buybackPctNetIncome: 0.28, minorityPctNetIncome: 0.01,
      shares: 7580, price: 51.2, beta: 1.14, annualVolatility: 0.26, priceDrift: 0.09,
      averageVolume: 38_000_000, freeFloat: 0.88,
    },
    {
      segments: [
        { name: 'Consumer Banking', share: 0.39, margin: 0.42, growth: 0.03 },
        { name: 'Global Wealth & Investment Management', share: 0.21, margin: 0.36, growth: 0.06 },
        { name: 'Global Banking', share: 0.22, margin: 0.44, growth: 0.04 },
        { name: 'Global Markets', share: 0.18, margin: 0.38, growth: 0.07 },
      ],
      geographies: [{ name: 'United States', share: 0.85 }, { name: 'Europe', share: 0.08 }, { name: 'Asia', share: 0.05 }, { name: 'Other', share: 0.02 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Berkshire Hathaway', kind: 'INSTITUTIONAL', stake: 0.089 },
        { holder: 'Vanguard Group', kind: 'INSTITUTIONAL', stake: 0.081 },
        { holder: 'BlackRock funds', kind: 'INSTITUTIONAL', stake: 0.066 },
        { holder: 'Free float / retail', kind: 'RETAIL', stake: 0.764 },
      ],
      peers: ['JPM', 'GS', 'ITUB4', 'SANB11'],
    },
  ),
  bp(
    {
      ticker: 'SLCE3', name: 'SLC Agrícola', legalName: 'SLC Agrícola S.A.', exchange: 'B3',
      country: 'Brazil', sector: 'Consumer Staples', industry: 'Food Products', currency: 'BRL',
      description:
        'SLC Agrícola farms soybean, corn and cotton across owned and leased land in the Brazilian cerrado.',
      businessModel:
        'A farmer is long the commodity and long the land. Yield per hectare and the cost of inputs decide the operating result; the appreciation of the land decides the return over a decade.',
      competitiveAdvantages: ['Scale in cerrado row-crop farming', 'Yield above the regional average', 'Land bank appreciating alongside production', 'Cotton exposure diversifying the grain cycle'],
      website: 'https://slcagrcola.com', employees: 6800, foundedYear: 1977,
      ceo: 'Chief Executive Officer (simulated profile)', headquarters: 'Porto Alegre, Brazil',
      themes: ['commodities', 'consumer'],
    },
    {
      revenue: 6900, growthPath: [0.38, 0.21, -0.08, 0.04, 0.06, 0.05],
      ebitdaMarginPath: [0.34, 0.31, 0.24, 0.26, 0.28, 0.28],
      grossMargin: 0.29, daPctRevenue: 0.072, rndPctRevenue: 0.003, taxRate: 0.18,
      capexPctRevenue: 0.095, ppePctRevenue: 0.94, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.01, cashPctRevenue: 0.13, netDebtToEbitda: 1.8,
      costOfDebt: 0.132, arDays: 28, invDays: 164, apDays: 52,
      dividendPayout: 0.35, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.01,
      shares: 440, price: 17.8, beta: 0.94, annualVolatility: 0.31, priceDrift: -0.02,
      averageVolume: 11_000_000, freeFloat: 0.51,
    },
    {
      driver: {
        unit: 'hectares plantados', volume: 720_000, volumeGrowth: 0.03,
        price: 0.009583, priceGrowth: 0.035,
      },
      segments: [
        { name: 'Soja', share: 0.44, margin: 0.27, growth: 0.04 },
        { name: 'Algodão', share: 0.38, margin: 0.31, growth: 0.06 },
        { name: 'Milho e outros', share: 0.18, margin: 0.22, growth: 0.03 },
      ],
      geographies: [{ name: 'Centro-Oeste', share: 0.58 }, { name: 'Nordeste (MATOPIBA)', share: 0.31 }, { name: 'Sul', share: 0.11 }],
      management: [
        { name: 'Chief Executive Officer', role: 'Chief Executive Officer', since: 2022, background: 'Simulated profile; the platform holds no biography for this person.' },
        { name: 'Chief Financial Officer', role: 'Chief Financial Officer', since: 2023, background: 'Simulated profile; the platform holds no biography for this person.' },
      ],
      ownership: [
        { holder: 'Grupo SLC', kind: 'CONTROLLING', stake: 0.489 },
        { holder: 'Fundos estrangeiros', kind: 'INSTITUTIONAL', stake: 0.184 },
        { holder: 'Gestoras locais', kind: 'INSTITUTIONAL', stake: 0.148 },
        { holder: 'Free float / varejo', kind: 'RETAIL', stake: 0.179 },
      ],
      peers: ['JBSS3', 'ABEV3', 'SUZB3', 'KLBN11'],
    },
  ),
];

export const TICKERS = BLUEPRINTS.map((b) => b.profile.ticker);

export function findBlueprint(ticker: string): CompanyBlueprint | undefined {
  return BLUEPRINTS.find((b) => b.profile.ticker === ticker.toUpperCase());
}

/**
 * Banks are presented with equity multiples (P/E, P/B) rather than EV multiples,
 * and ROIC is not a meaningful measure for them. Exchanges and asset managers
 * inside the Financials sector are *not* bank-like and keep the standard
 * enterprise-value presentation.
 */
export function isBankLike(industry: string): boolean {
  return industry === 'Banks';
}
