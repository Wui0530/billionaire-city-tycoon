export type Language = 'en' | 'zh';

export interface PlayerStats {
  money: number;
  energy: number; // 0 to 100
  health: number; // 0 to 100
  happiness: number; // 0 to 100
  skills: {
    business: number;      // max 100
    management: number;    // max 100
    coding: number;        // max 100
    construction: number;  // max 100
    negotiation: number;   // max 100
  };
  education: 'high_school' | 'bachelor' | 'master' | 'phd';
  day: number;
  week: number;
  year: number;
  activeJobId: string | null;
  experienceDays: Record<string, number>; // records how many days of work in each activity
  ownedVehicles: string[]; // ids of purchased transport
  activeVehicleId: string | null; // active vehicle
  savingsBalance: number; // Bank savings account
  loanBalance: number; // Bank loan account
  creditScore: number; // Bank credit rating (300 to 850)
  tutorialStep?: number; // 0 to 6
  spouseId?: string | null;
  childrenCount?: number;
  partnerAffection?: number;
  fundedDreams?: string[]; // IDs of completed grand dreams
  employeesMoods?: Record<string, number>;
  playerName?: string;
  level?: number;
  xp?: number;
  stress?: number; // 0 to 100
  gigCooldowns?: Record<string, number>; // gig ID mapped to day limit
  dailyRewardStreak?: number; // 0 to 7
  lastDailyRewardClaimedDate?: string; // string or null
  prestigeCount?: number; // default 0 or 1
  prestigeMultiplier?: number; // multiplier for rewards e.g. 1.5x, 2.0x
  adPublisherId?: string; // Google AdSense publisher / client ID
  totalRealAdRevenueSimulated?: number; // simulated tracker for actual ads
}

export interface Employee {
  id: string;
  name_en: string;
  name_zh: string;
  role: 'developer' | 'sales' | 'manager';
  skill: number; // 1 to 10
  salaryPerDay: number;
}

export interface Company {
  registered: boolean;
  name: string;
  type: 'tech' | 'retail' | 'real_estate' | 'finance' | 'none';
  capital: number;
  employees: Employee[];
  priceFactor: number; // 0.1 to 3.0 (multiplier for product price)
  rdBudget: number;       // $/day
  marketingBudget: number; // $/day
  brandAwareness: number;  // 0 to 100%
  techProgress: number;    // 0 to 100% (or infinite)
  salesHistory: { day: number; sales: number; profit: number }[];
  partners?: string[]; // IDs of partnered stakeholders/co-founders
  officeTier?: number; // 0: Shared Desks, 1: Incubator, 2: Silicon Loft, 3: High-Rise Prime, 4: Ecology HQ
  equipmentTier?: number; // 0: Laptop, 1: Solid Workstation, 2: Cloud Enterprise, 3: Supercomputer, 4: Quantum Computing
  benefitsTier?: number; // 0: Sweatshop, 1: Premium Coffee, 2: Full Medical Insurance, 3: Holiday & Matching, 4: Family Luxury
  marketingTier?: number; // 0: Word of mouth, 1: Social influencers, 2: Metro screens, 3: Global Specials, 4: Spatial Coverage
}

export interface Partner {
  id: string;
  name_en: string;
  name_zh: string;
  role_en: string;
  role_zh: string;
  specialty: 'tech' | 'sales' | 'finance' | 'management';
  companyType: 'tech' | 'retail' | 'real_estate' | 'finance' | 'all'; // preferred sector or all
  investmentCapital: number; // Cash they inject up-front when partnered
  equityRequired: number; // Co-founder shares percentage they demand (e.g. 10%)
  signingCost: number; // Signing/negotiation fee paid out from personal pocket to recruit them
  reqNegotiationSkill: number; // Minimum player Negotiation skill to hire
  benefit_en: string;
  benefit_zh: string;
}

export interface Furniture {
  id: string;
  name_en: string;
  name_zh: string;
  cost: number;
  happinessBonus: number;
  energyBonus: number;
  icon: string;
}

export interface House {
  built: boolean;
  type: 'cabin' | 'apartment' | 'villa' | 'mansion' | 'bunker' | 'skyscraper' | 'moonbase' | 'none' | 'hotel';
  renovationLevel: number; // 0 to 100
  furnituresOwned: string[]; // furniture IDs
}

export interface LandPlot {
  id: string;
  name_en: string;
  name_zh: string;
  zone: 'suburbs' | 'downtown' | 'beachfront' | 'industrial';
  size: number; // sqm
  price: number;
  owned: boolean;
  house: House;
  isRented?: boolean;
  rentTermRemaining?: number; // days count left (-1 for continuous lease)
  rentTermTotal?: number;      // total days set (3, 7, 30, or -1 for continuous)
  rentRateMultiplier?: number; // scale rate based on duration option e.g. 1.2x for 3-day Airbnb, 0.8x for 30-day lease
  tenantType_en?: string;
  tenantType_zh?: string;
  tenantSatisfaction?: number; // 0 to 100
  vacancyRisk?: number; // 0 to 1 scaling
  districtDemand?: number; // 0.8 to 1.5 fluctuation
}

export interface Mission {
  id: string;
  title_en: string;
  title_zh: string;
  desc_en: string;
  desc_zh: string;
  type: 'money' | 'company' | 'land' | 'house' | 'skill' | 'education';
  targetValue: number | string;
  rewardMoney: number;
  rewardHappiness: number;
  completed: boolean;
}

export interface LogEntry {
  id: string;
  day: number;
  text_en: string;
  text_zh: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'event';
}

export interface RecruitmentCandidate {
  id: string;
  name_en: string;
  name_zh: string;
  role: 'developer' | 'sales' | 'manager';
  skill: number;
  salaryPerDay: number;
}

export interface GameEvent {
  id: string;
  title_en: string;
  title_zh: string;
  desc_en: string;
  desc_zh: string;
  options: {
    text_en: string;
    text_zh: string;
    effect: (stats: PlayerStats, company: Company, plots: LandPlot[]) => {
      stats: PlayerStats;
      company: Company;
      plots: LandPlot[];
      log_en: string;
      log_zh: string;
    };
  }[];
}

export interface RivalPlayer {
  id: string;
  name_en: string;
  name_zh: string;
  companyName: string;
  companySector: 'tech' | 'retail' | 'real_estate' | 'finance';
  companyCapital: number;
  outstandingShares: number;
  playerSharesOwned: number; // number of shares player owns
  sharePrice: number;
  sharesOwnedByRival: number; // what percentage or number they own (usually remainder)
  prevSharePrices: number[]; // for a sparkline chart!
  isBankrupt: boolean;
  countryCode?: string; // e.g., "US", "CN", "JP", "DE", "SG", etc.
  isFriend?: boolean; // True if this competitor was generated via friend sync code or connected manually
}

export interface Vehicle {
  id: string;
  name_en: string;
  name_zh: string;
  cost: number;
  energyReductionPerDay: number; // energy saved upon day transition
  salaryBonusMultiplier: number; // e.g. 1.10 for +10%
  happinessBonusPerDay: number; // daily gain while active
  description_en: string;
  description_zh: string;
  icon: string;
}

export interface FriendVenture {
  id: string;
  friendName_en: string;
  friendName_zh: string;
  companyName: string;
  sector: 'tech' | 'retail' | 'real_estate' | 'finance';
  baseValuation: number;
  currentValuation: number;
  growthHistory: number[]; // track recent 10 trends for beautiful visual mini charts
  playerOwnershipPercent: number; // 0 to 100%
  amountInvested: number;
  status_en: string;
  status_zh: string;
}


