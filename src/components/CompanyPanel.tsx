import React, { useState } from "react";
import { Building2, Users, DollarSign, TrendingUp, UserPlus, Trash2, ArrowUpRight, ArrowDownRight, Lightbulb, Volume2, Info, Star, Award, ShieldCheck, HeartHandshake } from "lucide-react";
import { Company, PlayerStats, Language, Employee, RecruitmentCandidate, Partner } from "../types";
import { i18n, CANDIDATES_POOL, PARTNERS_POOL } from "../i18n";
import { motion } from "motion/react";

interface CompanyPanelProps {
  company: Company;
  stats: PlayerStats;
  language: Language;
  onRegisterCompany: (name: string, type: Company['type'], initialCapital: number) => void;
  onHireEmployee: (candidate: RecruitmentCandidate) => void;
  onFireEmployee: (id: string) => void;
  onAdjustBudgets: (rd: number, mktg: number, priceFactor: number) => void;
  onInjectCapital: (amount: number) => void;
  onWithdrawCapital: (amount: number) => void;
  availableCandidates: RecruitmentCandidate[];
  onRecruitPartner: (partner: Partner) => void;
  onUpgradeCorporateCategory: (category: 'office' | 'equipment' | 'benefits' | 'marketing', targetTier: number, setupCost: number) => void;
}

const UPGRADES_DATA = {
  office: [
    { lvl: 0, name_en: "Garage Startup / Shared Desks", name_zh: "车库初创 / 联合办公工位", cost: 0, rent: 0, perks_en: ["Max headcount: 5 employees", "No administrative rent costs"], perks_zh: ["雇员容量：最多 5 人", "无行政场地租金开销"] },
    { lvl: 1, name_en: "High-Tech Spark Incubator", name_zh: "高新技术开发区孵化器", cost: 1200, rent: 60, perks_en: ["Max headcount: 6 employees", "Brand Growth multiplier +10%"], perks_zh: ["雇员容量：增加至 6 人", "品牌发展速率乘数 +10%"] },
    { lvl: 2, name_en: "Silicon Valley Tech Loft", name_zh: "中关村现代科技 Lofty 跃层", cost: 5000, rent: 180, perks_en: ["Max headcount: 8 employees", "Brand Growth +25%", "Tech Progress multiplier +10%"], perks_zh: ["雇员容量：增加至 8 人", "品牌发展速率乘数 +25%", "技术研发速率乘数 +10%"] },
    { lvl: 3, name_en: "Landmark High-Rise Prime Suite", name_zh: "市中心地标超甲级写字楼整层", cost: 22000, rent: 650, perks_en: ["Max headcount: 11 employees", "Brand Growth +60%", "Tech Progress +35%", "Price Demands Cushion +15%"], perks_zh: ["雇员容量：增加至 11 人", "品牌发展速率乘数 +60%", "技术研发速率乘数 +35%", "高客单价流失率缓冲 +15%"] },
    { lvl: 4, name_en: "Global HQ Megastructure Apex", name_zh: "全球总部超级生态大厦群落", cost: 100000, rent: 2400, perks_en: ["Max headcount: 15 employees", "Brand Growth +150%", "Tech Progress +90%", "Price Demands Cushion +40%"], perks_zh: ["雇员容量：极境扩容 15 人", "品牌发展速率乘数 +150%", "技术研发速率乘数 +90%", "高客单价流失率缓冲 +40%"] }
  ],
  equipment: [
    { lvl: 0, name_en: "Standard Consumer Laptops", name_zh: "标准办公家用笔记本", cost: 0, rent: 0, perks_en: ["Basic computing limits", "No server lease outlays"], perks_zh: ["基础算力，开箱运行", "无服务器设备租赁开销"] },
    { lvl: 1, name_en: "Optimized SSD Workstations", name_zh: "高能极压固态开发工作站", cost: 800, rent: 35, perks_en: ["Employees tech-skill contribution +15%"], perks_zh: ["雇员研发技术产出效能 +15%"] },
    { lvl: 2, name_en: "Enterprise Elastic Cloud Servers", name_zh: "弹性高可用高内存云服务器矩阵", cost: 3500, rent: 110, perks_en: ["Employees tech-skill contribution +40%", "Daily flat Tech Progress +2 CP"], perks_zh: ["雇员研发技术产出效能 +40%", "每日稳定技术沉淀 +2 CP"] },
    { lvl: 3, name_en: "Deep Learning Supercomputing Cluster", name_zh: "万卡深蓝AI算力超級集群", cost: 18000, rent: 480, perks_en: ["Employees tech-skill contribution +90%", "Daily flat Tech Progress +6 CP", "Base consumer demand +20%"], perks_zh: ["雇员研发技术产出效能 +90%", "每日稳定技术沉淀 +6 CP", "产品基础全球市场需求 +20%"] },
    { lvl: 4, name_en: "Quantum Optics Superconduct Grid", name_zh: "超导液氦极温光量子相干计算格点", cost: 85000, rent: 1800, perks_en: ["Employees tech-skill contribution +220%", "Daily flat Tech Progress +20 CP", "Base consumer demand +50%"], perks_zh: ["雇员研发技术产出效能极化 +220%", "每日稳定技术沉淀 +20 CP", "产品基础全球市场需求 +50%"] }
  ],
  benefits: [
    { lvl: 0, name_en: "Basic Sweatshop Work Atmosphere", name_zh: "极简纯汗水传统苦干制", cost: 0, rent: 0, perks_en: ["Basic wage structures", "No company perk benefits"], perks_zh: ["基本薪酬，保底劳作", "无额外行政福利支持"] },
    { lvl: 1, name_en: "Premium Roasted Coffee & Dining", name_zh: "精品烘焙咖啡与丰富轻食餐区", cost: 500, rent: 20, perks_en: ["Employee effective skill lvl +0.5", "Daily player Happiness +1"], perks_zh: ["全体员工效能技能指数 +0.5", "每日个人幸福度额外 +1"] },
    { lvl: 2, name_en: "Comprehensive Health Support Suite", name_zh: "全额商业医疗与重疾双重保障险", cost: 2000, rent: 90, perks_en: ["Employee effective skill lvl +1.2", "Daily player Happiness +2", "Saves wages cost by 10%"], perks_zh: ["全体员工效能技能指数 +1.2", "每日个人幸福度额外 +2", "雇员劳务开销节省 10%"] },
    { lvl: 3, name_en: "Corporate Vacation & Stock Option Matching", name_zh: "带薪全球旅度假与核心高管股权配售", cost: 8000, rent: 340, perks_en: ["Employee effective skill lvl +2.5", "Daily player Happiness +5", "Player Health +1", "Saves wages cost by 25%"], perks_zh: ["全体员工效能技能指数 +2.5", "每日个人幸福度额外 +5", "每日个人健康度回温 +1", "雇员劳务开销节省 25%"] },
    { lvl: 4, name_en: "Executive Retirement Sanctuary", name_zh: "硅谷绿洲级终身看持与家庭全免关怀", cost: 35000, rent: 1250, perks_en: ["Employee effective skill lvl +5.0", "Daily player Happiness +12", "Player Health +3", "Saves wages cost by 40%"], perks_zh: ["全体员工生命效率能级 +5.0", "每日个人幸福度暴增 +12", "每日个人健康度额外回满 +3", "雇员劳务开销节省 40%"] }
  ],
  marketing: [
    { lvl: 0, name_en: "Organic Consumer Word of Mouth", name_zh: "无宣传纯粹消费者自留推荐", cost: 0, rent: 0, perks_en: ["Zero publicity expenses", "No baseline brand accelerations"], perks_zh: ["零营销预算开支", "无品牌传播额外杠杆"] },
    { lvl: 1, name_en: "Micro-Influencer Marketing Loop", name_zh: "社交达人与垂直社群精准带货", cost: 1000, rent: 40, perks_en: ["Brand Gain multiplier +20%", "Daily flat brand awareness +1%"], perks_zh: ["品牌推广效率乘数 +20%", "每日稳定心智占领 +1%"] },
    { lvl: 2, name_en: "National Metro & High-Speed Media Screen", name_zh: "一线核心高铁与全市数字地标LED轮播", cost: 4500, rent: 165, perks_en: ["Brand Gain multiplier +55%", "Daily flat brand awareness +2.5%"], perks_zh: ["品牌推广效率乘数 +55%", "每日稳定心智占领 +2.5%"] },
    { lvl: 3, name_en: "Global Sports & World Cups Sponsorship", name_zh: "全球黄金体育赛事与世界杯联合总冠名", cost: 25000, rent: 620, perks_en: ["Brand Gain multiplier +140%", "Daily flat brand +6.5%", "Base demand +25%", "Sales volume +20%"], perks_zh: ["品牌推广效率乘数 +140%", "每日稳定心智占领 +6.5%", "市场基准总需求 +25%", "营销出货购买容量额外 +20%"] },
    { lvl: 4, name_en: "Space Orbit Neural-Link Direct Feed", name_zh: "卫星群组天基脑机直连元宇宙流常态矩阵", cost: 120000, rent: 2500, perks_en: ["Brand Gain multiplier +350%", "Daily flat brand +16%", "Base demand +70%", "Sales volume +50%"], perks_zh: ["产品心智指数狂飙 +350%", "每日稳定心智占领极境 +16%", "市场基准总需求暴增 +70%", "营销出货购买容量额外充沛 +50%"] }
  ]
};

const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'office': return <Building2 className="text-blue-400" size={20} />;
    case 'equipment': return <Lightbulb className="text-indigo-400" size={20} />;
    case 'benefits': return <HeartHandshake className="text-pink-400" size={20} />;
    case 'marketing': return <Volume2 className="text-teal-400" size={20} />;
    default: return <Award className="text-yellow-400" size={20} />;
  }
};

export const CompanyPanel: React.FC<CompanyPanelProps> = ({
  company,
  stats,
  language,
  onRegisterCompany,
  onHireEmployee,
  onFireEmployee,
  onAdjustBudgets,
  onInjectCapital,
  onWithdrawCapital,
  availableCandidates,
  onRecruitPartner,
  onUpgradeCorporateCategory
}) => {
  const t = i18n[language];
  
  const maxEmployees = (company.officeTier || 0) === 1 ? 6 : (company.officeTier || 0) === 2 ? 8 : (company.officeTier || 0) === 3 ? 11 : (company.officeTier || 0) === 4 ? 15 : 5;
  
  // Registration States
  const [regName, setRegName] = useState("");
  const [regType, setRegType] = useState<Company['type']>("tech");
  const [regCapital, setRegCapital] = useState<number>(2500);

  // Capital Adjustment form states
  const [injectAmount, setInjectAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

  // Budget Adjust states
  const [tmpRd, setTmpRd] = useState(company.rdBudget);
  const [tmpMktg, setTmpMktg] = useState(company.marketingBudget);
  const [tmpPrice, setTmpPrice] = useState(company.priceFactor);

  // Apply Changes locally then push
  const handleApplyBudgets = () => {
    onAdjustBudgets(tmpRd, tmpMktg, tmpPrice);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || regCapital < 2000 || stats.money < regCapital) return;
    onRegisterCompany(regName.trim(), regType, regCapital);
  };

  // Helper values for Company Sector Labels
  const getSectorLabel = (tType: string) => {
    switch (tType) {
      case 'tech': return language === 'en' ? 'Tech Startup' : '科技研发与人工智能';
      case 'retail': return language === 'en' ? 'Digital Retail Store' : '全渠道连锁零售零售百货';
      case 'real_estate': return language === 'en' ? 'Real Estate Development' : '城市住宅建设与地产商';
      case 'finance': return language === 'en' ? 'Hedge Fund Investments' : '量化对冲及信托主投资';
      default: return tType;
    }
  };

  const currentCapitalInputError = regCapital < 2000;
  const cannotAffordCapitalInput = stats.money < regCapital;

  // Let's get the financial summary
  const lastDaySales = company.salesHistory.length > 0 ? company.salesHistory[company.salesHistory.length - 1] : { sales: 0, profit: 0, day: 0 };
  const totalEmployeesSalary = company.employees.reduce((acc, emp) => acc + emp.salaryPerDay, 0);
  const dailyRunningExpenses = totalEmployeesSalary + company.rdBudget + company.marketingBudget;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 1. ENTERPRISE INCORPORATION HUB (If unregistered) */}
      {!company.registered ? (
        <div id="company-unregistered-hub" className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="p-3 bg-indigo-950/40 border border-indigo-800 text-indigo-400 rounded-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-100 font-sans tracking-tight">
                {t.companyUnregistered}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {t.companyUnregDesc}
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Sector Type Selection Card buttons */}
            <div className="space-y-2">
              <label id="lbl-co-type" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{t.coType}</label>
              <div className="grid grid-cols-2 gap-3">
                {(['tech', 'retail', 'real_estate', 'finance'] as Company['type'][]).map((st) => (
                  <button
                    key={st}
                    id={`reg-type-select-${st}`}
                    type="button"
                    onClick={() => setRegType(st)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                      regType === st 
                        ? 'bg-indigo-950/20 border-indigo-500 shadow-md' 
                        : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <span className="text-xs uppercase font-mono font-bold text-indigo-400">{st}</span>
                    <span className="text-sm font-bold mt-1 text-zinc-100">{getSectorLabel(st)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-1">
              <label id="lbl-co-name" className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {language === 'en' ? 'Incorporate Name' : '公司名称'}
              </label>
              <input
                id="input-company-name"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder={t.coNamePlaceholder}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition"
              />
            </div>

            {/* Starting capital input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <label id="lbl-co-capital">{t.startingCapital}</label>
                <span className="text-zinc-500 font-mono">
                  {language === 'en' ? 'Personal Balance:' : '个人资金剩余:'} ${stats.money.toLocaleString()}
                </span>
              </div>
              <input
                id="input-company-capital"
                type="number"
                value={regCapital}
                onChange={(e) => setRegCapital(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-indigo-500 rounded-lg p-3 text-sm text-zinc-100 font-mono outline-none transition"
              />
              <div className="flex flex-col gap-1 mt-1 text-[11px]">
                {currentCapitalInputError && (
                  <span className="text-red-400 font-semibold">{t.minCapitalWarn}</span>
                )}
                {cannotAffordCapitalInput && (
                  <span className="text-red-400 font-semibold">{t.cantAffordCapital}</span>
                )}
              </div>
            </div>

            <button
              id="confirm-corporate-btn"
              type="submit"
              disabled={!regName.trim() || currentCapitalInputError || cannotAffordCapitalInput}
              className="cursor-pointer w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-black py-3 px-4 rounded-lg text-sm font-extrabold shadow-lg shadow-indigo-950/30 transition flex items-center justify-center gap-1.5"
            >
              <Building2 size={16} />
              <span>{t.registerBtn}</span>
            </button>
          </form>
        </div>
      ) : (
        /* 2. CORPORATE CORE MANAGEMENT GRAPH BOARD */
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-900/40 border border-indigo-800 text-indigo-400 rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <span className="text-[10px] text-indigo-400 uppercase font-mono font-bold tracking-wider">
                  {getSectorLabel(company.type)}
                </span>
                <h2 className="text-2xl font-extrabold text-zinc-100 font-sans tracking-tight">
                  {company.name}
                </h2>
              </div>
            </div>

            {/* Corporate ledger cash balance */}
            <div className="p-4 bg-zinc-950 border border-zinc-850/80 rounded-xl min-w-[200px] flex justify-between items-center shrink-0">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">{t.companyCash}</span>
                <span className="text-lg font-mono font-extrabold text-yellow-400 block">${company.capital.toLocaleString()}</span>
              </div>
              <DollarSign size={24} className="text-zinc-600" />
            </div>
          </div>

          {/* TWO GRAPH CHUNKS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* A. STRATEGIC CONTROLS: SLIDERS */}
            <div id="company-ops-sliders" className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-5">
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">{t.marketPricing}</h3>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-900">
                  {language === 'en' ? 'Operations' : '运营设置'}
                </span>
              </div>

              {/* Price factor control */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
                  <span>{t.priceMultiplier}</span>
                  <span className="font-mono text-zinc-200 font-bold">{tmpPrice}x</span>
                </div>
                <input
                  id="slider-price-factor"
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={tmpPrice}
                  onChange={(e) => setTmpPrice(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10.5px] text-zinc-400 leading-relaxed block border-l-2 border-zinc-700 pl-2 mt-2">
                  {tmpPrice <= 0.9 ? t.mPriceLow : tmpPrice <= 1.4 ? t.mPriceMed : t.mPriceHigh}
                </span>
              </div>

              {/* R&D strategic budget */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb size={13} className="text-yellow-400" />
                    <span>{t.budgetRd}</span>
                  </span>
                  <span className="font-mono text-zinc-200 font-bold">${tmpRd}/day</span>
                </div>
                <input
                  id="slider-rd-budget"
                  type="range"
                  min="0"
                  max="400"
                  step="20"
                  value={tmpRd}
                  onChange={(e) => setTmpRd(parseInt(e.target.value) || 0)}
                  className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Marketing strategic budget */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-center text-xs text-zinc-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Volume2 size={13} className="text-teal-400" />
                    <span>{t.budgetMktg}</span>
                  </span>
                  <span className="font-mono text-zinc-200 font-bold">${tmpMktg}/day</span>
                </div>
                <input
                  id="slider-mktg-budget"
                  type="range"
                  min="0"
                  max="400"
                  step="20"
                  value={tmpMktg}
                  onChange={(e) => setTmpMktg(parseInt(e.target.value) || 0)}
                  className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                id="apply-financial-budgets-btn"
                onClick={handleApplyBudgets}
                disabled={company.rdBudget === tmpRd && company.marketingBudget === tmpMktg && company.priceFactor === tmpPrice}
                className="cursor-pointer w-full bg-zinc-800 hover:bg-indigo-600 hover:text-black hover:border-indigo-600 disabled:opacity-40 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 text-zinc-100 border border-zinc-700 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>{language === 'en' ? 'Apply Operations Budgets' : '应用新的运营预算'}</span>
              </button>
            </div>

            {/* B. HISTORICAL LEDGER SUMMARY */}
            <div id="company-ledger-summary" className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col justify-between space-y-4">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">{t.financeSummary}</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Product Technology level state */}
                <div className="flex justify-between items-center border-b border-zinc-950 pb-2">
                  <span className="text-zinc-500">{t.techProgress}:</span>
                  <span className="text-teal-400 font-extrabold">{company.techProgress.toFixed(0)} CP</span>
                </div>

                {/* Brand global perception */}
                <div className="flex justify-between items-center border-b border-zinc-950 pb-2">
                  <span className="text-zinc-500">{t.brandAwareness}:</span>
                  <span className="text-purple-400 font-bold">{company.brandAwareness}%</span>
                </div>

                {/* Sales volume units */}
                <div className="flex justify-between items-center border-b border-zinc-950 pb-2">
                  <span className="text-zinc-400 font-medium">{t.finSales}:</span>
                  <span className="text-zinc-200">{lastDaySales.sales} items</span>
                </div>

                {/* Revenue yesterday */}
                <div className="flex justify-between items-center border-b border-zinc-950 pb-2">
                  <span className="text-zinc-400 font-medium">{t.finRev}:</span>
                  <span className="text-yellow-400 font-bold">+${lastDaySales.profit >= 0 ? lastDaySales.profit.toLocaleString() : "0"}</span>
                </div>

                {/* Costs running today */}
                <div className="flex justify-between items-center border-b border-zinc-950 pb-2 text-zinc-400">
                  <span>{t.finExp}:</span>
                  <span className="text-red-400">-${dailyRunningExpenses} ({language === 'en' ? 'Wages + R&D + Adv' : '雇员 + 研发 + 广告'})</span>
                </div>

                {/* Calculated profit */}
                <div className="flex justify-between items-center pt-1 font-sans text-sm">
                  <span className="font-bold text-zinc-300">{t.finProfit}:</span>
                  {lastDaySales.profit - dailyRunningExpenses >= 0 ? (
                    <span className="text-emerald-400 font-extrabold font-mono flex items-center">
                      <ArrowUpRight size={14} />
                      <span>+${(lastDaySales.profit - dailyRunningExpenses).toLocaleString()}</span>
                    </span>
                  ) : (
                    <span className="text-red-400 font-extrabold font-mono flex items-center">
                      <ArrowDownRight size={14} />
                      <span>-${Math.abs(lastDaySales.profit - dailyRunningExpenses).toLocaleString()}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Informational warning */}
              <div className="bg-zinc-950 p-2.5 rounded border border-zinc-850 flex items-start gap-2">
                <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-zinc-500 leading-normal">
                  {language === 'en' 
                    ? "Wages and advertising run daily! If corporate cash falls below zero, employees will strike and technological progress stops."
                    : "对公扣费每日结算！若企业流动资金透支至 0 元以下，研发受阻且员工拒绝上班。"}
                </p>
              </div>
            </div>

            {/* C. INJECT & WITHDRAW CAPITAL TOOL */}
            <div id="company-capital-adjustment" className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight">
                  {language === 'en' ? 'Capital Transfer Hub' : '公私资金调度站'}
                </h3>
              </div>

              {/* Personal Deposit Inject */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t.investCapital}</span>
                <div className="flex gap-2">
                  <input
                    id="input-inject-capital"
                    type="number"
                    value={injectAmount}
                    onChange={(e) => setInjectAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded p-2 text-xs font-mono text-zinc-200 outline-none"
                  />
                  <button
                    id="btn-inject-capital"
                    onClick={() => {
                      const val = parseInt(injectAmount) || 0;
                      if (val > 0 && stats.money >= val) {
                        onInjectCapital(val);
                        setInjectAmount("");
                      }
                    }}
                    disabled={!injectAmount || stats.money < (parseInt(injectAmount) || 0)}
                    className="cursor-pointer bg-indigo-600 disabled:opacity-40 hover:bg-indigo-500 text-black font-extrabold text-xs px-3 rounded shadow transition"
                  >
                    {t.actionConfirm}
                  </button>
                </div>
              </div>

              {/* Corporate withdraw */}
              <div className="space-y-1 pt-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">{t.withdrawCapital}</span>
                <div className="flex gap-2">
                  <input
                    id="input-withdraw-capital"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-indigo-500 rounded p-2 text-xs font-mono text-zinc-200 outline-none"
                  />
                  <button
                    id="btn-withdraw-capital"
                    onClick={() => {
                      const val = parseInt(withdrawAmount) || 0;
                      if (val > 0 && company.capital >= val) {
                        onWithdrawCapital(val);
                        setWithdrawAmount("");
                      }
                    }}
                    disabled={!withdrawAmount || company.capital < (parseInt(withdrawAmount) || 0)}
                    className="cursor-pointer bg-zinc-800 disabled:opacity-40 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-extrabold text-xs px-3 rounded shadow transition"
                  >
                    {t.actionConfirm}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* NEW: CAPEX & STRATEGIC OPERATIONS EXPANSIONS SECTION */}
          <div id="company-capex-container" className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                <Star className="text-emerald-400 animate-pulse" size={18} />
                <span>{language === 'en' ? 'Capital Expenditures (CapEx) & Strategic Assets Upgrade' : '企业固定资产基建与战略资本投资 (CapEx)'}</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1">
                {language === 'en'
                  ? 'Allocate corporate liquid funds to finance long-term operating assets. These increase daily expenditures but permanently amplify company growth, employee scale and brand velocity.'
                  : '拨付对公专项资本！向固定资产与技术基建实施大额长期投资。这会加重企业每日刚性行政支出(Expenses)，但会全方位放大日后研发速度、员工最大雇员额及基础市场份额。'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['office', 'equipment', 'benefits', 'marketing'] as const).map((cat) => {
                const currentLvl = (cat === 'office' ? company.officeTier : cat === 'equipment' ? company.equipmentTier : cat === 'benefits' ? company.benefitsTier : company.marketingTier) || 0;
                const db = UPGRADES_DATA[cat];
                const currentItem = db[currentLvl];
                const nextItem = currentLvl < 4 ? db[currentLvl + 1] : null;

                const categoryNames_en = { office: "HQ Workspace Environment", equipment: "IT Computing Power & Hardware Systems", benefits: "Welfare benefits & Premium Health Perks", marketing: "Continuous Marketing Public Relations" };
                const categoryNames_zh = { office: "总部物理场地与办公大楼升级", equipment: "IT高性能全套算力与核心设备服务", benefits: "雇员高规格健康福利保障方案", marketing: "常态化市场化公关与舆论扩散网络" };

                return (
                  <div key={cat} id={`capex-card-${cat}`} className="bg-zinc-950/80 border border-zinc-850 p-4 rounded-xl flex flex-col justify-between gap-4 hover:border-zinc-850 transition">
                    <div className="space-y-3">
                      {/* Header: Title and Level Pill */}
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-850">
                            {getCategoryIcon(cat)}
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{language === 'en' ? categoryNames_en[cat] : categoryNames_zh[cat]}</h4>
                            <span className="text-xs font-extrabold text-zinc-200 mt-0.5 block">{language === 'en' ? currentItem.name_en : currentItem.name_zh}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded border border-indigo-900 shrink-0">
                          Lvl {currentLvl}/4
                        </span>
                      </div>

                      {/* Current perks display */}
                      <div className="bg-zinc-900/40 border border-zinc-900 p-2.5 rounded-lg text-xs space-y-1">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">{language === 'en' ? 'Current operational status:' : '当前运行收益与行政成本 :'}</span>
                        <div className="flex justify-between items-center text-zinc-400">
                          <span>{language === 'en' ? 'Upkeep cost' : '日常维护费(Expenses)'}:</span>
                          <span className="font-mono font-semibold text-red-400">${currentItem.rent}/day</span>
                        </div>
                        <div className="pt-1.5 border-t border-zinc-900/60 font-medium text-emerald-400 space-y-0.5 text-[11px]">
                          {(language === 'en' ? currentItem.perks_en : currentItem.perks_zh).map((pk, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <span>•</span>
                              <span>{pk}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next tier preview if available */}
                      {nextItem && (
                        <div className="bg-indigo-950/5 border border-indigo-950/40 p-2.5 rounded-lg text-xs space-y-1">
                          <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider block mb-1">
                            {language === 'en' ? 'Next Expansion Level Perks:' : '下一级资产投资预期效果 :'}
                          </span>
                          <span className="text-zinc-200 font-bold block mb-1.5">{language === 'en' ? nextItem.name_en : nextItem.name_zh}</span>
                          
                          <div className="flex justify-between text-zinc-400 text-[11px]">
                            <span>{language === 'en' ? 'Upfront CapEx Investment' : '筹建自选固定资产投资额'}:</span>
                            <span className="font-mono text-yellow-400 font-bold">${nextItem.cost.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-zinc-400 text-[11px]">
                            <span>{language === 'en' ? 'Expected Upkeep Change' : '日常扣减运营维护租金'}:</span>
                            <span className="font-mono text-red-400 font-semibold">${nextItem.rent}/day</span>
                          </div>

                          <div className="pt-1.5 border-t border-indigo-950/25 font-semibold text-indigo-300 space-y-0.5 text-[11px]">
                            {(language === 'en' ? nextItem.perks_en : nextItem.perks_zh).map((pk, idx) => (
                              <div key={idx} className="flex items-start gap-1">
                                <span>🚀</span>
                                <span>{pk}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action trigger button */}
                    {nextItem ? (
                      <button
                        id={`upgrade-capex-${cat}`}
                        onClick={() => onUpgradeCorporateCategory(cat, currentLvl + 1, nextItem.cost)}
                        disabled={company.capital < nextItem.cost}
                        className="cursor-pointer w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:bg-zinc-900 disabled:text-zinc-500 text-black font-extrabold text-xs py-2 rounded-lg shadow-md hover:shadow-emerald-950/20 active:translate-y-0.5 transition"
                      >
                        {company.capital >= nextItem.cost 
                          ? (language === 'en' ? `Invest $${nextItem.cost.toLocaleString()} Corporate Funds` : `划拨对公资金升级筹建`)
                          : (language === 'en' ? `Need $${(nextItem.cost - company.capital).toLocaleString()} more Cash` : `资金余缺差额 $${(nextItem.cost - company.capital).toLocaleString()}`)}
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 border border-emerald-950/50 bg-emerald-950/15 rounded-lg">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span>{language === 'en' ? 'MAX EXPANSION TIER LEVEL REACHED' : '已臻达该级公司固定资产顶峰'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>


          {/* DIRECTORY OF EMPLOYEES AND RECRUITING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* IN HOUSE EMPLOYEES */}
            <div id="company-employees-ledger" className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
                  <Users size={16} className="text-indigo-400" />
                  <span>{t.employeesTitle}</span>
                </h3>
                <span className="text-xs text-zinc-400 font-mono">
                  {company.employees.length}/{maxEmployees} max
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {company.employees.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-500 font-sans">{t.noEmployees}</div>
                ) : (
                  company.employees.map((emp) => (
                    <div
                      key={emp.id}
                      id={`emp-card-${emp.id}`}
                      className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                          <span>{language === 'en' ? emp.name_en : emp.name_zh}</span>
                          <span className="text-[9px] uppercase font-mono font-extrabold bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 rounded">
                            {emp.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 space-y-0.5">
                          <div>
                            {language === 'en' ? 'Employee Index level' : '人才技能指数'}: <span className="text-teal-400 font-mono font-bold">Lvl {emp.skill}/10</span>
                          </div>
                          <div>
                            {language === 'en' ? 'Salary expense' : '协议日薪'}: <span className="text-yellow-500/90 font-mono font-semibold">${emp.salaryPerDay}/day</span>
                          </div>
                        </div>
                      </div>

                      <button
                        id={`terminate-employee-${emp.id}`}
                        onClick={() => onFireEmployee(emp.id)}
                        className="cursor-pointer bg-red-950/20 text-red-400 hover:bg-red-900 hover:text-white p-1.5 rounded-lg border border-red-950/40 hover:border-red-850 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CANDIDATES BOARD RECRUITMENT */}
            <div id="company-hiring-pool" className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
                  <UserPlus size={16} className="text-emerald-400" />
                  <span>{t.hireMarket}</span>
                </h3>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {availableCandidates.length === 0 ? (
                  <div className="text-center py-6 text-xs text-zinc-500 font-sans">
                    {language === 'en' ? 'Recruiting database is currently loading...' : '人才数据库加载中...'}
                  </div>
                ) : (
                  availableCandidates.map((candidate) => {
                    const alreadyHaveTopHeadcount = company.employees.length >= maxEmployees;
                    const tooExpensiveAndCrashed = company.capital < (candidate.salaryPerDay * 3); // suggested capital check

                    return (
                      <div
                        key={candidate.id}
                        id={`candidate-${candidate.id}`}
                        className="bg-zinc-950 border border-zinc-850/80 hover:border-zinc-800 p-3 rounded-lg flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                            <span>{language === 'en' ? candidate.name_en : candidate.name_zh}</span>
                            <span className="text-[9px] uppercase font-mono font-bold bg-zinc-900 mt-0.5 text-indigo-400 px-1 rounded-sm border border-zinc-850">
                              {candidate.role}
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500">
                            {language === 'en' ? 'Professional Grade:' : '雇员能效:'} <span className="font-bold text-emerald-400 font-mono">Lvl {candidate.skill}</span>
                            {" "}|{" "}
                            {language === 'en' ? 'Day Wages:' : '薪酬条件:'} <span className="font-semibold text-yellow-500 font-mono">${candidate.salaryPerDay}</span>
                          </div>
                        </div>

                        <button
                          id={`recruit-candidate-${candidate.id}`}
                          disabled={alreadyHaveTopHeadcount || tooExpensiveAndCrashed}
                          onClick={() => onHireEmployee(candidate)}
                          className="cursor-pointer bg-emerald-600 disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500 hover:bg-emerald-500 text-black font-extrabold text-[10px] py-1.5 px-2.5 rounded transition"
                        >
                          {alreadyHaveTopHeadcount ? (language==='en'?'Max':'上限') : t.hireBtn}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* 3. BUSINESS CO-FOUNDERS & PARTNERS CORE HUB */}
          <div id="company-partners-board" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  <HeartHandshake className="text-pink-500 animate-pulse" size={18} />
                  <span>{language === 'en' ? 'Boardroom Partners & Co-Founders' : '创业联席合伙人及核心智囊团'}</span>
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {language === 'en'
                    ? 'Forge executive alliances. Co-founders dilute your equity, but inject huge capital and permanently boost business metrics.'
                    : '招纳声名赫赫的商界合伙人！他们会要求分走一定比例股权并收取签约金，但会带来大量免息对公现金并永久大幅振幅公司经营效率。'}
                </p>
              </div>
              <span className="text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-850 text-indigo-400 font-mono font-bold">
                {language === 'en' ? 'Core Partners Pool' : '特聘高管池'}
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {PARTNERS_POOL().map((partner) => {
                const isPartnered = !!company.partners?.includes(partner.id);
                const hasNegoSkill = stats.skills.negotiation >= partner.reqNegotiationSkill;
                const hasCash = stats.money >= partner.signingCost;

                // Color accent according to specialty
                let accentBorder = 'border-zinc-800 hover:border-zinc-700 bg-zinc-950';
                let accentText = 'text-zinc-300';
                let iconColor = 'text-zinc-500';

                if (isPartnered) {
                  accentBorder = 'border-emerald-500 bg-emerald-950/15 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
                  accentText = 'text-emerald-400';
                  iconColor = 'text-emerald-400';
                } else if (partner.specialty === 'tech') {
                  accentBorder = 'border-zinc-850 hover:border-indigo-900 bg-zinc-950';
                  accentText = 'text-indigo-400';
                  iconColor = 'text-indigo-400';
                } else if (partner.specialty === 'sales') {
                  accentBorder = 'border-zinc-850 hover:border-teal-900 bg-zinc-950';
                  accentText = 'text-teal-400';
                  iconColor = 'text-teal-400';
                } else if (partner.specialty === 'finance') {
                  accentBorder = 'border-zinc-850 hover:border-yellow-900 bg-zinc-950';
                  accentText = 'text-yellow-400';
                  iconColor = 'text-yellow-400';
                } else {
                  accentBorder = 'border-zinc-850 hover:border-pink-900 bg-zinc-950';
                  accentText = 'text-pink-400';
                  iconColor = 'text-pink-400';
                }

                return (
                  <div
                    key={partner.id}
                    id={`partner-card-${partner.id}`}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-4 transition duration-300 ${accentBorder}`}
                  >
                    <div>
                      {/* Name & Role */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-extrabold text-zinc-100 flex items-center gap-1.5">
                            {language === 'en' ? partner.name_en : partner.name_zh}
                            {isPartnered && (
                              <span className="text-[9px] bg-emerald-500 text-black px-1.5 py-0.5 rounded-full font-black animate-pulse flex items-center gap-0.5">
                                <ShieldCheck size={9} />
                                {language === 'en' ? 'ACTIVE' : '已加盟'}
                              </span>
                            )}
                          </h4>
                          <p className={`text-xs font-semibold ${accentText}`}>
                            {language === 'en' ? partner.role_en : partner.role_zh}
                          </p>
                        </div>
                        <Award size={18} className={iconColor} />
                      </div>

                      {/* Benefits & Perks */}
                      <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-900 mt-3 font-medium">
                        <span className="font-bold text-zinc-300 block mb-1">
                          {language === 'en' ? '✨ Multiplier Buffs:' : '✨ 盟友专属特权:'}
                        </span>
                        {language === 'en' ? partner.benefit_en : partner.benefit_zh}
                      </p>

                      {/* Info metrics table */}
                      <div className="grid grid-cols-2 gap-2 mt-3 font-mono text-[11px] text-zinc-500">
                        <div className="bg-zinc-900/40 p-1.5 rounded flex flex-col justify-between border border-zinc-900/70">
                          <span>{language === 'en' ? 'Capital Infusion' : '引注对公资本'}</span>
                          <span className="font-bold text-emerald-400 text-xs mt-0.5">+${partner.investmentCapital.toLocaleString()}</span>
                        </div>
                        <div className="bg-zinc-900/40 p-1.5 rounded flex flex-col justify-between border border-zinc-900/70">
                          <span>{language === 'en' ? 'Equity Required' : '稀释创始股权'}</span>
                          <span className="font-bold text-red-400 text-xs mt-0.5">-{partner.equityRequired}% Own Shares</span>
                        </div>
                      </div>
                    </div>

                    {/* Action recruit CTA */}
                    {!isPartnered ? (
                      <div className="border-t border-zinc-900 pt-3 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <div className="space-y-0.5 text-xs">
                          {/* Requirements Indicators */}
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <span>{language === 'en' ? 'Negotiation Skill:' : '谈判等级:'}</span>
                            <span className={`font-mono font-bold ${hasNegoSkill ? 'text-emerald-400' : 'text-red-400'}`}>
                              Lvl {stats.skills.negotiation}/{partner.reqNegotiationSkill}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <span>{language === 'en' ? 'Signing Fee:' : '对私签约金:'}</span>
                            <span className={`font-mono font-bold ${hasCash ? 'text-yellow-400' : 'text-red-400'}`}>
                              ${partner.signingCost.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          id={`recruit-partner-btn-${partner.id}`}
                          onClick={() => onRecruitPartner(partner)}
                          disabled={!hasNegoSkill || !hasCash}
                          className="cursor-pointer w-full sm:w-auto bg-pink-600 hover:bg-pink-500 disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-extrabold text-xs py-2 px-3.5 rounded-lg shadow-md hover:shadow-pink-900/20 active:translate-y-0.5 transition"
                        >
                          {language === 'en' ? 'Sign Partner Deal' : '签约联席合伙人'}
                        </button>
                      </div>
                    ) : (
                      <div className="border-t border-zinc-900 pt-3 text-center text-xs text-emerald-500/80 font-bold flex items-center justify-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span>{language === 'en' ? 'Partnered Strategic Alliance Established.' : '联席创始同盟已缔结，特权生效中。'}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
};
