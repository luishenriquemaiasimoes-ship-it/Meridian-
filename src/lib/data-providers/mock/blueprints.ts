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

export interface CompanyBlueprint {
  profile: CompanyProfile;
  anchors: CompanyAnchors;
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
      costOfDebt: 0.078, arDays: 22, invDays: 62, apDays: 48,
      dividendPayout: 0.6, buybackPctNetIncome: 0.15, minorityPctNetIncome: 0.02,
      shares: 4270, price: 61.4, beta: 1.22, annualVolatility: 0.34, priceDrift: 0.03,
      averageVolume: 42_000_000, freeFloat: 0.86,
    },
    {
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
      costOfDebt: 0.082, arDays: 20, invDays: 45, apDays: 40,
      dividendPayout: 0.55, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.03,
      shares: 13040, price: 38.6, beta: 1.18, annualVolatility: 0.32, priceDrift: 0.08,
      averageVolume: 58_000_000, freeFloat: 0.63,
    },
    {
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
      costOfDebt: 0.105, arDays: 40, invDays: 0, apDays: 30,
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
      costOfDebt: 0.104, arDays: 38, invDays: 0, apDays: 28,
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
      costOfDebt: 0.09, arDays: 62, invDays: 105, apDays: 55,
      dividendPayout: 0.42, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.005,
      shares: 4200, price: 41.8, beta: 0.86, annualVolatility: 0.29, priceDrift: 0.1,
      averageVolume: 18_000_000, freeFloat: 0.42,
    },
    {
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
      capexPctRevenue: 0.26, ppePctRevenue: 1.55, intangiblesPctRevenue: 0.04,
      goodwillPctRevenue: 0.22, cashPctRevenue: 0.15, netDebtToEbitda: 2.6,
      costOfDebt: 0.118, arDays: 34, invDays: 40, apDays: 46,
      dividendPayout: 0.25, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.0,
      shares: 1060, price: 33.4, beta: 1.31, annualVolatility: 0.38, priceDrift: -0.04,
      averageVolume: 21_000_000, freeFloat: 0.71,
    },
    {
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
      costOfDebt: 0.08, arDays: 28, invDays: 48, apDays: 92,
      dividendPayout: 0.72, buybackPctNetIncome: 0.04, minorityPctNetIncome: 0.04,
      shares: 15700, price: 12.6, beta: 0.72, annualVolatility: 0.24, priceDrift: 0.06,
      averageVolume: 26_000_000, freeFloat: 0.28,
    },
    {
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
      costOfDebt: 0.107, arDays: 18, invDays: 0, apDays: 22,
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
      costOfDebt: 0.075, arDays: 44, invDays: 80, apDays: 52,
      dividendPayout: 0.18, buybackPctNetIncome: 0.12, minorityPctNetIncome: 0.0,
      shares: 1290, price: 54.2, beta: 1.09, annualVolatility: 0.33, priceDrift: 0.07,
      averageVolume: 14_000_000, freeFloat: 0.55,
    },
    {
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
      costOfDebt: 0.086, arDays: 18, invDays: 30, apDays: 34,
      dividendPayout: 0.0, buybackPctNetIncome: 0.18, minorityPctNetIncome: 0.0,
      shares: 810, price: 41.7, beta: 1.24, annualVolatility: 0.41, priceDrift: 0.09,
      averageVolume: 12_000_000, freeFloat: 0.88,
    },
    {
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
      costOfDebt: 0.112, arDays: 52, invDays: 22, apDays: 62,
      dividendPayout: 0.28, buybackPctNetIncome: 0.02, minorityPctNetIncome: 0.06,
      shares: 1230, price: 31.5, beta: 0.78, annualVolatility: 0.27, priceDrift: 0.08,
      averageVolume: 16_000_000, freeFloat: 0.93,
    },
    {
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
      costOfDebt: 0.116, arDays: 78, invDays: 105, apDays: 88,
      dividendPayout: 0.35, buybackPctNetIncome: 0.08, minorityPctNetIncome: 0.0,
      shares: 960, price: 16.4, beta: 1.16, annualVolatility: 0.34, priceDrift: 0.05,
      averageVolume: 19_000_000, freeFloat: 0.97,
    },
    {
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
      costOfDebt: 0.113, arDays: 68, invDays: 0, apDays: 40,
      dividendPayout: 0.30, buybackPctNetIncome: 0.10, minorityPctNetIncome: 0.0,
      shares: 610, price: 34.8, beta: 0.92, annualVolatility: 0.32, priceDrift: 0.12,
      averageVolume: 9_000_000, freeFloat: 0.95,
    },
    {
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
      costOfDebt: 0.115, arDays: 22, invDays: 92, apDays: 78,
      dividendPayout: 0.30, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.0,
      shares: 1690, price: 17.8, beta: 0.81, annualVolatility: 0.28, priceDrift: 0.0,
      averageVolume: 15_000_000, freeFloat: 0.90,
    },
    {
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
      costOfDebt: 0.108, arDays: 32, invDays: 0, apDays: 24,
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
      costOfDebt: 0.114, arDays: 26, invDays: 18, apDays: 44,
      dividendPayout: 0.15, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.01,
      shares: 7450, price: 3.42, beta: 1.28, annualVolatility: 0.42, priceDrift: 0.06,
      averageVolume: 40_000_000, freeFloat: 0.31,
    },
    {
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
      costOfDebt: 0.042, arDays: 58, invDays: 11, apDays: 106,
      dividendPayout: 0.16, buybackPctNetIncome: 0.75, minorityPctNetIncome: 0.0,
      shares: 14800, price: 246.3, beta: 1.12, annualVolatility: 0.25, priceDrift: 0.09,
      averageVolume: 52_000_000, freeFloat: 0.99,
    },
    {
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
      costOfDebt: 0.041, arDays: 78, invDays: 6, apDays: 92,
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
      costOfDebt: 0.045, arDays: 52, invDays: 82, apDays: 46,
      dividendPayout: 0.01, buybackPctNetIncome: 0.35, minorityPctNetIncome: 0.0,
      shares: 24400, price: 178.9, beta: 1.72, annualVolatility: 0.47, priceDrift: 0.18,
      averageVolume: 220_000_000, freeFloat: 0.96,
    },
    {
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
      costOfDebt: 0.041, arDays: 62, invDays: 4, apDays: 38,
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
      costOfDebt: 0.045, arDays: 32, invDays: 38, apDays: 78,
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
      costOfDebt: 0.046, arDays: 58, invDays: 0, apDays: 32,
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
      costOfDebt: 0.047, arDays: 26, invDays: 58, apDays: 44,
      dividendPayout: 0.60, buybackPctNetIncome: 0.05, minorityPctNetIncome: 0.05,
      shares: 1620, price: 63.8, beta: 1.08, annualVolatility: 0.28, priceDrift: 0.0,
      averageVolume: 6_000_000, freeFloat: 0.97,
    },
    {
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
      costOfDebt: 0.046, arDays: 24, invDays: 52, apDays: 46,
      dividendPayout: 0.62, buybackPctNetIncome: 0.03, minorityPctNetIncome: 0.06,
      shares: 5070, price: 26.4, beta: 1.02, annualVolatility: 0.27, priceDrift: 0.01,
      averageVolume: 9_000_000, freeFloat: 0.98,
    },
    {
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
