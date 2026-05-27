import React, { useState, useEffect } from "react";
import { GameEngine } from "./core/engine";
import { 
  LifePanel 
} from "./components/LifePanel";
import { 
  AutopilotPanel 
} from "./components/AutopilotPanel";
import { 
  CareerPanel 
} from "./components/CareerPanel";
import { 
  CompanyPanel 
} from "./components/CompanyPanel";
import { 
  RealEstatePanel 
} from "./components/RealEstatePanel";
import { 
  MissionsPanel 
} from "./components/MissionsPanel";
import { 
  StatsBar 
} from "./components/StatsBar";
import { 
  EventsModal 
} from "./components/EventsModal";
import {
  FinancePanel
} from "./components/FinancePanel";
import {
  SchoolPanel
} from "./components/SchoolPanel";
import { SettingsAndFeedbackModal } from "./components/SettingsAndFeedbackModal";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { LaunchpadPanel } from "./components/LaunchpadPanel";
import { AdPlayerModal } from "./components/AdPlayerModal";
import { 
  PlayerStats, 
  Company, 
  LandPlot, 
  Mission, 
  LogEntry, 
  Language, 
  GameEvent, 
  Employee, 
  RecruitmentCandidate, 
  Furniture,
  RivalPlayer,
  Vehicle,
  Partner,
  FriendVenture
} from "./types";
import { 
  i18n, 
  INITIAL_LAND_PLOTS, 
  MISSIONS_LIST, 
  CANDIDATES_POOL, 
  CANDIDATE_NAMES_POOL, 
  SKILL_COURSES, 
  EDUCATION_PROGRAMS, 
  JOBS_LIST, 
  BLUEPRINTS, 
  FURNITURE_STORE,
  INITIAL_RIVALS,
  VEHICLES_LIST,
  PARTNERS_POOL,
  INITIAL_FRIEND_VENTURES
} from "./i18n";
import { 
  RANDOM_EVENTS 
} from "./events";
import { SIDE_GIGS } from "./data/sideGigs";
import { 
  Briefcase, 
  Building2, 
  Home, 
  Award, 
  Heart, 
  FileText, 
  Trash2, 
  Info,
  GraduationCap,
  Car,
  TrendingUp,
  Cpu,
  Bot,
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { lofiBgm } from "./utils/audio";

// LocalStorage Keys
const STORE_PREFIX = "ecobiz_sim_v1_";

const generateRandomCandidate = (lang: Language): RecruitmentCandidate => {
  const roles: ('developer' | 'sales' | 'manager')[] = ['developer', 'sales', 'manager'];
  const role = roles[Math.floor(Math.random() * roles.length)];
  const skill = Math.floor(Math.random() * 8) + 2; // level 2 to 9
  const salaryPerDay = skill * (role === 'manager' ? 22 : role === 'developer' ? 16 : 14);

  const firstPool = lang === 'en' ? CANDIDATE_NAMES_POOL.en_first : CANDIDATE_NAMES_POOL.zh_first;
  const lastPool = lang === 'en' ? CANDIDATE_NAMES_POOL.en_last : CANDIDATE_NAMES_POOL.zh_last;
  const fName = firstPool[Math.floor(Math.random() * firstPool.length)];
  const lName = lastPool[Math.floor(Math.random() * lastPool.length)];
  const name_en = lang === 'en' ? `${fName} ${lName}` : `${fName}${lName}`;
  const name_zh = lang === 'zh' ? `${fName}${lName}` : `${fName} ${lName}`;

  return {
    id: "cand_" + Math.random().toString(36).substring(2, 9),
    name_en,
    name_zh,
    role,
    skill,
    salaryPerDay
  };
};

export default function App() {
  // 0. Game State & Main Menu & Audio Manager state vars
  const [gameState, setGameState] = useState<'menu' | 'loading' | 'intro' | 'playing'>('menu');
  const [hasSaveFile, setHasSaveFile] = useState<boolean>(false);
  const [bgmPlaying, setBgmPlaying] = useState<boolean>(false);
  const [playerNameInput, setPlayerNameInput] = useState<string>("");
  const [dreamPath, setDreamPath] = useState<'tech' | 'retail' | 'estate' | 'none'>('none');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // 1. Language Toggle State
  const [language, setLanguage] = useState<Language>("en");

  // 2. Core Game States
  const [stats, setStats] = useState<PlayerStats>({
    money: 1000, // Starts standard with limited savings
    energy: 100,
    health: 100,
    happiness: 80,
    skills: {
      business: 5,
      management: 3,
      coding: 0,
      construction: 0,
      negotiation: 5
    },
    education: "high_school",
    day: 1,
    week: 1,
    year: 1,
    activeJobId: "delivery_driver", // standard entry job automatically hired
    experienceDays: {},
    ownedVehicles: [],
    activeVehicleId: null,
    savingsBalance: 0,
    loanBalance: 0,
    creditScore: 650,
    tutorialStep: 0,
    spouseId: null,
    childrenCount: 0,
    partnerAffection: 0,
    fundedDreams: [],
    employeesMoods: {},
    level: 1,
    xp: 0,
    stress: 0,
    gigCooldowns: {}
  });

  const [company, setCompany] = useState<Company>({
    registered: false,
    name: "",
    type: "none",
    capital: 0,
    employees: [],
    priceFactor: 1.0,
    rdBudget: 0,
    marketingBudget: 0,
    brandAwareness: 10,
    techProgress: 0,
    salesHistory: [],
    partners: []
  });

  const [plots, setPlots] = useState<LandPlot[]>(INITIAL_LAND_PLOTS());
  const [missions, setMissions] = useState<Mission[]>(MISSIONS_LIST());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [rivals, setRivals] = useState<RivalPlayer[]>(INITIAL_RIVALS());
  const [ownCompanySharesPercentage, setOwnCompanySharesPercentage] = useState<number>(100);

  // Custom Autopilot & Personal Friends Venture systems
  const [autopilotEnabled, setAutopilotEnabled] = useState<boolean>(false);
  const [autopilotSettings, setAutopilotSettings] = useState({
    autoEat: true,
    autoHospital: true,
    autoStudy: false,
    autoTradingGrid: false,
  });
  const [friendVentures, setFriendVentures] = useState<FriendVenture[]>(INITIAL_FRIEND_VENTURES());
  
  // 3. UI Helpers
  const [activeTab, setActiveTab] = useState<string>("life");
  const [studyingProg, setStudyingProg] = useState<{ degreeId: string; daysRemaining: number } | null>(null);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [logFilter, setLogFilter] = useState<'all' | 'event' | 'info' | 'success'>('all');

  // Interactive feedback states (Tutorial progress modals, offline income, levels-up and coin showers)
  const [goldFloatCoins, setGoldFloatCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const [activeLevelUpModal, setActiveLevelUpModal] = useState<{ show: boolean; title_en: string; title_zh: string; desc_en: string; desc_zh: string } | null>(null);
  const [offlineIncomeModal, setOfflineIncomeModal] = useState<{ show: boolean; hours: number; mins: number; earnings: number } | null>(null);

  // Advertising Monetization Systems State Orchestration Tracker
  const [adModalState, setAdModalState] = useState<{
    show: boolean;
    adType: 'reward' | 'interstitial';
    adTag: string;
    callback: () => void;
  }>({
    show: false,
    adType: 'reward',
    adTag: '',
    callback: () => {}
  });

  const triggerRewardAd = (tag: string, callback: () => void) => {
    playAudioBeep('coin');
    setAdModalState({
      show: true,
      adType: 'reward',
      adTag: tag,
      callback
    });
  };

  // Translations shortcut t
  const t = i18n[language];

  // 4. Initial Bootstrap Candidate replenishment
  useEffect(() => {
    // Generate 4 initial candidates
    const initialPool = CANDIDATES_POOL();
    setCandidates(initialPool);

    // Initial system greeting log
    appendLog(
      "Welcome to EcoBiz Simulator! Buy land, complete milestones, read degrees, build houses, and manage high-value corporations.",
      "欢迎来到生态商赛人生与商业模拟器！购买黄金地皮、盖楼、求学备考、招聘员工以及管理自主企业。",
      "info"
    );
  }, []);

  // 5. Save on changes (Debounced saving structure)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORE_PREFIX + "language", JSON.stringify(language));
        localStorage.setItem(STORE_PREFIX + "stats", JSON.stringify(stats));
        localStorage.setItem(STORE_PREFIX + "company", JSON.stringify(company));
        localStorage.setItem(STORE_PREFIX + "plots", JSON.stringify(plots));
        localStorage.setItem(STORE_PREFIX + "missions", JSON.stringify(missions));
        localStorage.setItem(STORE_PREFIX + "logs", JSON.stringify(logs));
        localStorage.setItem(STORE_PREFIX + "candidates", JSON.stringify(candidates));
        localStorage.setItem(STORE_PREFIX + "rivals", JSON.stringify(rivals));
        localStorage.setItem(STORE_PREFIX + "ownShares", JSON.stringify(ownCompanySharesPercentage));
        localStorage.setItem(STORE_PREFIX + "autopilotEnabled", JSON.stringify(autopilotEnabled));
        localStorage.setItem(STORE_PREFIX + "autopilotSettings", JSON.stringify(autopilotSettings));
        localStorage.setItem(STORE_PREFIX + "friendVentures", JSON.stringify(friendVentures));
        localStorage.setItem(STORE_PREFIX + "lastSavedTime", Date.now().toString());
        if (studyingProg) {
          localStorage.setItem(STORE_PREFIX + "studyingProg", JSON.stringify(studyingProg));
        } else {
          localStorage.removeItem(STORE_PREFIX + "studyingProg");
        }
      } catch (err) {
        console.error("Local storage sync error", err);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [stats, company, plots, missions, logs, language, candidates, studyingProg, rivals, ownCompanySharesPercentage, autopilotEnabled, autopilotSettings, friendVentures]);

  // Load Saved State on Mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORE_PREFIX + "language");
      const savedStats = localStorage.getItem(STORE_PREFIX + "stats");
      const savedCompany = localStorage.getItem(STORE_PREFIX + "company");
      const savedPlots = localStorage.getItem(STORE_PREFIX + "plots");
      const savedMissions = localStorage.getItem(STORE_PREFIX + "missions");
      const savedLogs = localStorage.getItem(STORE_PREFIX + "logs");
      const savedCandidates = localStorage.getItem(STORE_PREFIX + "candidates");
      const savedStudying = localStorage.getItem(STORE_PREFIX + "studyingProg");
      const savedRivals = localStorage.getItem(STORE_PREFIX + "rivals");
      const savedOwnShares = localStorage.getItem(STORE_PREFIX + "ownShares");
      const savedAutopilotEnabled = localStorage.getItem(STORE_PREFIX + "autopilotEnabled");
      const savedAutopilotSettings = localStorage.getItem(STORE_PREFIX + "autopilotSettings");
      const savedFriendVentures = localStorage.getItem(STORE_PREFIX + "friendVentures");

      if (savedLang) setLanguage(JSON.parse(savedLang));
      
      if (savedStats) {
        setHasSaveFile(true);
        const parsed = JSON.parse(savedStats);

        const sanitizeNumber = (val: any, fallback: number): number => {
          if (typeof val === "number" && !isNaN(val)) return val;
          if (typeof val === "object" || val === null || val === undefined) return fallback;
          const cleanStr = String(val).replace(/[^\d.-]/g, '');
          const parsedNum = parseFloat(cleanStr);
          if (isNaN(parsedNum) || String(val).includes("[object")) {
            return fallback;
          }
          return parsedNum;
        };

        setStats({
          ...parsed,
          money: sanitizeNumber(parsed.money, 1000),
          energy: sanitizeNumber(parsed.energy, 100),
          health: sanitizeNumber(parsed.health, 100),
          happiness: sanitizeNumber(parsed.happiness, 80),
          savingsBalance: sanitizeNumber(parsed.savingsBalance, 0),
          loanBalance: sanitizeNumber(parsed.loanBalance, 0),
          creditScore: sanitizeNumber(parsed.creditScore, 650),
          ownedVehicles: parsed.ownedVehicles || [],
          activeVehicleId: parsed.activeVehicleId || null,
          tutorialStep: parsed.tutorialStep !== undefined ? parsed.tutorialStep : 0,
          spouseId: parsed.spouseId || null,
          childrenCount: parsed.childrenCount || 0,
          partnerAffection: parsed.partnerAffection || 0,
          fundedDreams: parsed.fundedDreams || [],
          employeesMoods: parsed.employeesMoods || {},
          level: sanitizeNumber(parsed.level, 1),
          xp: sanitizeNumber(parsed.xp, 0),
          stress: sanitizeNumber(parsed.stress, 0),
          gigCooldowns: parsed.gigCooldowns || {}
        });
      }
      
      if (savedCompany) setCompany(JSON.parse(savedCompany));
      if (savedPlots) setPlots(JSON.parse(savedPlots));
      if (savedMissions) setMissions(JSON.parse(savedMissions));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedCandidates) setCandidates(JSON.parse(savedCandidates));
      if (savedStudying) setStudyingProg(JSON.parse(savedStudying));
      if (savedRivals) setRivals(JSON.parse(savedRivals));
      if (savedOwnShares) setOwnCompanySharesPercentage(JSON.parse(savedOwnShares));
      if (savedAutopilotEnabled) setAutopilotEnabled(JSON.parse(savedAutopilotEnabled));
      if (savedAutopilotSettings) setAutopilotSettings(JSON.parse(savedAutopilotSettings));
      if (savedFriendVentures) setFriendVentures(JSON.parse(savedFriendVentures));

      // Offline idle system calculation
      const lastSaved = localStorage.getItem(STORE_PREFIX + "lastSavedTime");
      if (lastSaved) {
        const parsedTime = parseInt(lastSaved);
        if (!isNaN(parsedTime)) {
          const deltaHours = (Date.now() - parsedTime) / (1000 * 60 * 60);
          if (deltaHours >= 0.05) { // at least 3 mins offline
            let hourlyRate = 22; // default RM22/hr student freelancer rate
            if (savedCompany) {
              const companyData = JSON.parse(savedCompany);
              if (companyData.registered) {
                const eCount = companyData.employees ? companyData.employees.length : 0;
                const oTier = companyData.officeTier || 0;
                hourlyRate = 100 + (eCount * 120) + (oTier * 220);
              }
            }
            const hoursCapped = Math.min(8, deltaHours); // maximum of 8 hours offline earnings
            const calculatedEarnings = Math.round(hoursCapped * hourlyRate);
            if (calculatedEarnings > 10) {
              const h = Math.floor(deltaHours);
              const m = Math.floor((deltaHours - h) * 60);
              setOfflineIncomeModal({
                show: true,
                hours: h,
                mins: m,
                earnings: calculatedEarnings
              });
            }
          }
        }
      }
    } catch (err) {
      console.warn("Could not reload previous session save games", err);
    }
  }, []);

  // Loading Progression Loop
  useEffect(() => {
    if (gameState !== 'loading') return;

    setLoadingProgress(0);
    const messages = language === 'en' ? [
      "Securing venture backing in Kuala Lumpur...",
      "Leasing co-working shared desks...",
      "Gathering code snippets from dusty repositories...",
      "Brewing premium roasted coffee...",
      "Synchronizing offline real estate market curves...",
      "Booting up AI autopilot core brain..."
    ] : [
      "吉隆坡商业风投资本入局中...",
      "正在签订联合联合办公场地契约...",
      "从老旧回收站还原代码碎片...",
      "给研发高管冲泡手磨意式浓缩咖啡...",
      "同步大马房地产与离线经济波动率...",
      "智脑AI自动驾驶模块校准并启动..."
    ];

    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + Math.floor(Math.random() * 15) + 8;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            if (dreamPath !== 'none' || hasSaveFile) {
              setGameState('playing');
            } else {
              setGameState('intro');
            }
          }, 450);
          return 100;
        }
        
        const idx = Math.min(messages.length - 1, Math.floor((next / 100) * messages.length));
        setLoadingMessage(messages[idx]);
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [gameState, language, dreamPath, hasSaveFile]);

  // 5.8 TUTORIAL COMPLIANCE CHECKS & PROGRESSION EFFECTS
  useEffect(() => {
    const step = stats.tutorialStep || 0;
    if (step === 0 && stats.money >= 1100) {
      setStats(prev => ({ ...prev, tutorialStep: 1, money: prev.money + 150 }));
      playAudioBeep('levelup');
      setActiveLevelUpModal({
        show: true,
        title_en: "Tutorial Milestone Met! (Grade 1)",
        title_zh: "开局任务 1 达成：赚到第一桶金！",
        desc_en: "You successfully earned over RM1100! Reward: +RM150 standard subsidy. Next task: study a corporate business/money seminar to gain academic qualifications.",
        desc_zh: "您成功通过汗水赚取了个人首笔马币！额外获得大马津贴 +RM150 助学基金！下一项开局任务：参加一期“学堂求学”培训以提升底蕴学分（即让经历发生任何累计）。"
      });
      appendLog("Tutorial: 'Earn RM100' achieved! Subsidy +RM150 loaded.", "引导任务：‘赚取首笔100马币’达成！特优注入 +150 启动资金。", "success");
    } else if (step === 1 && (stats.experienceDays && Object.keys(stats.experienceDays).length > 0)) {
      setStats(prev => ({ ...prev, tutorialStep: 2, money: prev.money + 300 }));
      playAudioBeep('levelup');
      setActiveLevelUpModal({
        show: true,
        title_en: "Tutorial Milestone Met! (Grade 2)",
        title_zh: "开局任务 2 达成：学识渊博通过！",
        desc_en: "You completed academic training days! Reward: +RM300 subsidy. Next task: acquire an active commuter vehicle in Garage, or registers your own Private Business.",
        desc_zh: "您顺利开启了商业技能累计！财政特别发放对公安置费 +RM300 现金！下一项开拓经营：前去添置通勤载具，或前去创立并工商注册你专属的自主公司。"
      });
      appendLog("Tutorial: 'Gain Academic Credit' achieved! Subsidy +RM300 loaded.", "引导任务：‘获取学识或从业经历’达成！奖励 +300 置换金。", "success");
    } else if (step === 2 && (company.registered || stats.ownedVehicles.length > 0)) {
      setStats(prev => ({ ...prev, tutorialStep: 3, money: prev.money + 500 }));
      playAudioBeep('levelup');
      setActiveLevelUpModal({
        show: true,
        title_en: "Tutorial Milestone Met! (Grade 3)",
        title_zh: "开局任务 3 达成：置办名车资产！",
        desc_en: "You bought a transit vehicle or set up corporate logs! Reward: +RM500 subsidy. Next task: complete corporate brand registration, and hires at least 1 professional team member.",
        desc_zh: "您已配齐跑车或注册公司！奖励扶持款 +RM500 马币！下一项高屋建瓴：注册自主公司，招揽第1位高管精英员工，全自动解放双手创收。"
      });
      appendLog("Tutorial: 'Bicycle/Automobile Assets' achieved! Subsidy +RM500 loaded.", "引导任务：‘配置首辆载具/出资创立公司’达成！注入增量 +500 资金。", "success");
    } else if (step === 3 && company.registered) {
      setStats(prev => ({ ...prev, tutorialStep: 4, money: prev.money + 800 }));
      playAudioBeep('levelup');
      setActiveLevelUpModal({
        show: true,
        title_en: "Tutorial Milestone Met! (Grade 4)",
        title_zh: "开局任务 4 达成：工商局正规立户！",
        desc_en: "Your enterprise has valid licensing! Reward: +RM800 capital. Next task: hire first employee.",
        desc_zh: "大马官方审核通过！正式拥有独资经营主体！特供流动授信补贴 +RM800！下一任务：前往人才大厅，招聘名下第 1 名在职员工分流负荷。"
      });
      appendLog("Tutorial: 'Incorporate Brand' achieved! Subsidy +RM800 loaded.", "引导任务：‘公司注册合规立纲’达成！政府一次性奖励金 +800 兑付完毕。", "success");
    } else if (step === 4 && company.employees.length >= 1) {
      setStats(prev => ({ ...prev, tutorialStep: 5, money: prev.money + 1200 }));
      playAudioBeep('levelup');
      setActiveLevelUpModal({
        show: true,
        title_en: "Tutorial Milestone Met! (Grade 5)",
        title_zh: "开局任务 5 达成：团队队伍建立！",
        desc_en: "You hired a staff member! Reward: +RM1200. Next task: secure personal assets (e.g. acquire Central Land Plots, or complete a House Construction frame).",
        desc_zh: "有了高管分忧，生产力倍受鼓舞！获得团队创造奖金 +RM1,200 马币！终极目标指引：前往‘置地’房产大厅，置备第一块地皮或完成新房首层改造。"
      });
      appendLog("Tutorial: 'Appoint Employees' achieved! Subsidy +RM1200 loaded.", "引导任务：‘名下招聘首位员工’圆满达成！就业基金 +1,200 实名划扣入账。", "success");
    } else if (step === 5 && (plots.some(p => p.isPurchased))) {
      setStats(prev => ({ ...prev, tutorialStep: 6, money: prev.money + 2000 }));
      playAudioBeep('levelup');
      setActiveLevelUpModal({
        show: true,
        title_en: "All Onboarding Tutorial Completed! (Elite Legend Title)",
        title_zh: "🎉 恭喜！新手商业指导全线通关！",
        desc_en: "You have completed all tutorials and unlocked all core systems. Claimed final RM2000! Play, trade, marry and pass your legacy down generation to generation! Build space rockets or AI Cities!",
        desc_zh: "祝贺！您成功解封了本赛会所有底层商业模块，完美毕业！颁发特级商业领英奖金 +RM2,000 马币！现在，尽情在吉隆坡进行土地爆改、结婚延续香火、并踏破福布斯百亿富豪榜！"
      });
      appendLog("All Tutorials Completed! Got RM2000 elite reward.", "恭喜您顺利通关商战新手训练营！RM2,000 特别大奖即刻拨结！", "success");
    }
  }, [stats.money, stats.experienceDays, stats.ownedVehicles, company.registered, company.employees.length, plots]);

  // 6. Autopilot background automation tick interval
  useEffect(() => {
    if (!autopilotEnabled) return;

    const tickInterval = setInterval(() => {
      // Avoid ticking if an interactive random event modal is currently blocking
      if (!isProcessing && !activeEvent) {
        handleAdvanceDay(1);
      }
    }, 1800);

    return () => clearInterval(tickInterval);
  }, [autopilotEnabled, isProcessing, activeEvent, stats, company, plots, rivals, friendVentures]);

  const handleExecuteStartFresh = (name: string, path: 'tech' | 'retail' | 'estate' | 'none') => {
    localStorage.clear();
    
    // Custom paths
    let initialMoney = 1000;
    const initialSkills = { business: 5, management: 3, coding: 0, construction: 0, negotiation: 5 };
    const initialVehicles: string[] = [];

    if (path === 'tech') {
      initialSkills.coding = 10;
      initialVehicles.push("laptop_standard");
    } else if (path === 'retail') {
      initialMoney = 1500;
      initialSkills.negotiation = 10;
    } else if (path === 'estate') {
      initialSkills.construction = 10;
    }

    setStats({
      playerName: name || (language === 'en' ? "Haris" : "拼搏先锋"),
      money: initialMoney,
      energy: 100,
      health: 100,
      happiness: 80,
      skills: initialSkills,
      education: "high_school",
      day: 1,
      week: 1,
      year: 1,
      activeJobId: "delivery_driver",
      experienceDays: {},
      ownedVehicles: initialVehicles,
      activeVehicleId: initialVehicles.length > 0 ? "laptop_standard" : null,
      savingsBalance: 0,
      loanBalance: 0,
      creditScore: 650,
      tutorialStep: 0,
      spouseId: null,
      childrenCount: 0,
      partnerAffection: 0,
      fundedDreams: [],
      employeesMoods: {},
      level: 1,
      xp: 0,
      stress: 0,
      gigCooldowns: {}
    });

    setCompany({
      registered: false,
      name: "",
      type: "none",
      capital: 0,
      employees: [],
      priceFactor: 1.0,
      rdBudget: 0,
      marketingBudget: 0,
      brandAwareness: 10,
      techProgress: 0,
      salesHistory: [],
      partners: []
    });

    setPlots(INITIAL_LAND_PLOTS());
    setMissions(MISSIONS_LIST());
    setLogs([]);
    setCandidates(CANDIDATES_POOL());
    setStudyingProg(null);
    setRivals(INITIAL_RIVALS());
    setOwnCompanySharesPercentage(100);
    setFriendVentures(INITIAL_FRIEND_VENTURES());
    setAutopilotEnabled(false);
    setAutopilotSettings({
      autoEat: true,
      autoHospital: true,
      autoStudy: false,
      autoTradingGrid: false,
    });

    appendLog(
      `Starting a fresh adventure as ${name || "Haris"} with the ${path} path!`,
      `以姓名【${name || "拼搏先锋"}】和【${path === 'tech' ? '黑科技AI领域' : path === 'retail' ? '新零售巨头' : '地产置地商'}】梦幻理想，踏上大马商业大亨之旅！`,
      "success"
    );
  };

  // Wipe / reset save action
  const handleResetGameData = () => {
    if (window.confirm(language === 'en' ? "Wipe entire session data and restart from Day 1?" : "确认要清空过往游戏存储，从头开启模拟吗？")) {
      localStorage.clear();
      setStats({
        money: 1000,
        energy: 100,
        health: 100,
        happiness: 80,
        skills: { business: 5, management: 3, coding: 0, construction: 0, negotiation: 5 },
        education: "high_school",
        day: 1,
        week: 1,
        year: 1,
        activeJobId: "delivery_driver",
        experienceDays: {},
        ownedVehicles: [],
        activeVehicleId: null,
        savingsBalance: 0,
        loanBalance: 0,
        creditScore: 650
      });
      setCompany({
        registered: false,
        name: "",
        type: "none",
        capital: 0,
        employees: [],
        priceFactor: 1.0,
        rdBudget: 0,
        marketingBudget: 0,
        brandAwareness: 10,
        techProgress: 0,
        salesHistory: [],
        partners: []
      });
      setPlots(INITIAL_LAND_PLOTS());
      setMissions(MISSIONS_LIST());
      setLogs([]);
      setCandidates(CANDIDATES_POOL());
      setStudyingProg(null);
      setRivals(INITIAL_RIVALS());
      setOwnCompanySharesPercentage(100);
      setFriendVentures(INITIAL_FRIEND_VENTURES());
      setAutopilotEnabled(false);
      setAutopilotSettings({
        autoEat: true,
        autoHospital: true,
        autoStudy: false,
        autoTradingGrid: false,
      });
      appendLog("Simulation Reset Successful.", "游戏数据重置成功，全新的一天开启。", "info");
    }
  };

  // Log Append Helper
  const appendLog = (textEn: string, textZh: string, type: LogEntry['type']) => {
    const entry: LogEntry = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      day: stats?.day || 1,
      text_en: textEn,
      text_zh: textZh,
      type
    };
    setLogs((prev) => [entry, ...prev].slice(0, 80)); // caps at last 80 logs
  };

  // Toggle Language Handler
  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleManualSave = () => {
    try {
      localStorage.setItem(STORE_PREFIX + "language", JSON.stringify(language));
      localStorage.setItem(STORE_PREFIX + "stats", JSON.stringify(stats));
      localStorage.setItem(STORE_PREFIX + "company", JSON.stringify(company));
      localStorage.setItem(STORE_PREFIX + "plots", JSON.stringify(plots));
      localStorage.setItem(STORE_PREFIX + "missions", JSON.stringify(missions));
      localStorage.setItem(STORE_PREFIX + "logs", JSON.stringify(logs));
      localStorage.setItem(STORE_PREFIX + "candidates", JSON.stringify(candidates));
      localStorage.setItem(STORE_PREFIX + "rivals", JSON.stringify(rivals));
      localStorage.setItem(STORE_PREFIX + "ownShares", JSON.stringify(ownCompanySharesPercentage));
      localStorage.setItem(STORE_PREFIX + "autopilotEnabled", JSON.stringify(autopilotEnabled));
      localStorage.setItem(STORE_PREFIX + "autopilotSettings", JSON.stringify(autopilotSettings));
      localStorage.setItem(STORE_PREFIX + "friendVentures", JSON.stringify(friendVentures));
      localStorage.setItem(STORE_PREFIX + "lastSavedTime", Date.now().toString());
      if (studyingProg) {
        localStorage.setItem(STORE_PREFIX + "studyingProg", JSON.stringify(studyingProg));
      }
      playAudioBeep('levelup');
      appendLog(
        "State Saved: Game safely written to local secure sandbox storage.",
        "自动存档同步：大亨当前的商业状态与全部不动产红利已安全写入本地浏览器安全沙盒。",
        "success"
      );
    } catch (err) {
      console.error("Save error", err);
    }
  };

  const handleClearSaveGame = () => {
    try {
      const keys = [
        "language", "stats", "company", "plots", "missions", "logs", 
        "candidates", "studyingProg", "rivals", "ownShares", 
        "autopilotEnabled", "autopilotSettings", "friendVentures", "lastSavedTime"
      ];
      keys.forEach(k => localStorage.removeItem(STORE_PREFIX + k));
      
      setStats({
        money: 1000,
        energy: 100,
        health: 100,
        happiness: 80,
        skills: { business: 5, management: 3, coding: 0, construction: 0, negotiation: 5 },
        education: "high_school",
        day: 1, week: 1, year: 1,
        activeJobId: "delivery_driver",
        experienceDays: {}, ownedVehicles: [], activeVehicleId: null,
        savingsBalance: 0, loanBalance: 0, creditScore: 650,
        tutorialStep: 0, level: 1, xp: 0, stress: 0, gigCooldowns: {}
      });
      setCompany({
        registered: false, name: "", type: "none", capital: 0, employees: [], priceFactor: 1.0,
        rdBudget: 0, marketingBudget: 0, brandAwareness: 10, techProgress: 0, salesHistory: [], partners: []
      });
      setPlots(INITIAL_LAND_PLOTS());
      setMissions(MISSIONS_LIST());
      setLogs([]);
      setCandidates(CANDIDATES_POOL());
      setRivals(INITIAL_RIVALS());
      setOwnCompanySharesPercentage(100);
      setAutopilotEnabled(false);
      setAutopilotSettings({ autoEat: true, autoHospital: true, autoStudy: false, autoTradingGrid: false });
      setFriendVentures(INITIAL_FRIEND_VENTURES());
      setHasSaveFile(false);
      setShowSettings(false);
      setGameState('menu');
      playAudioBeep('alert');
    } catch (e) {
      console.error("Clear error", e);
    }
  };

  const handleImportSave = (jsonStr: string): boolean => {
    try {
      const rawDecoded = decodeURIComponent(escape(atob(jsonStr)));
      const payload = JSON.parse(rawDecoded);
      if (!payload || !payload.stats || !payload.company) {
        return false;
      }
      
      if (payload.stats) localStorage.setItem(STORE_PREFIX + "stats", JSON.stringify(payload.stats));
      if (payload.company) localStorage.setItem(STORE_PREFIX + "company", JSON.stringify(payload.company));
      if (payload.plots) localStorage.setItem(STORE_PREFIX + "plots", JSON.stringify(payload.plots));
      if (payload.missions) localStorage.setItem(STORE_PREFIX + "missions", JSON.stringify(payload.missions));
      
      playAudioBeep('levelup');
      setTimeout(() => {
        window.location.reload();
      }, 800);
      return true;
    } catch (e) {
      console.error("Import error", e);
      return false;
    }
  };

  // 5.5 AUDIO & VISUAL JUICE
  const playAudioBeep = (type: 'coin' | 'levelup' | 'achievement' | 'alert') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;

      if (type === 'coin') {
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'levelup') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'achievement') {
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(783.99, now + 0.06);
        osc.frequency.setValueAtTime(987.77, now + 0.12);
        osc.frequency.setValueAtTime(1318.51, now + 0.18);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(120, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (_) {}
  };

  const triggerCoinShower = () => {
    playAudioBeep('coin');
    const newCoins = Array.from({ length: 8 }).map((_, i) => ({
      id: Math.random() + i,
      x: 30 + Math.random() * 40, // percentage x coord from mid-screen
      y: 80 - Math.random() * 40  // height offset
    }));
    setGoldFloatCoins(newCoins);
    setTimeout(() => {
      setGoldFloatCoins([]);
    }, 1200);
  };

  const handleDateNPC = () => {
    if (stats.money < 150) {
      playAudioBeep('alert');
      return;
    }
    setStats(prev => ({
      ...prev,
      money: Math.max(0, prev.money - 150),
      partnerAffection: Math.min(100, (prev.partnerAffection || 0) + 20),
      happiness: Math.min(100, prev.happiness + 15)
    }));
    triggerCoinShower();
    appendLog(
      "Dating: Had a beautiful date at KLCC fine cafe. Affection +20, Happiness +15.",
      "约会：在KLCC双子塔高档英式茶餐厅共享下午茶。好感度 +20，幸福感 +15。",
      "success"
    );
  };

  const handleProposeMarriage = () => {
    if (stats.money < 5000) {
      appendLog("Propose: Marriage costs $5,000 for ceremony!", "提亲：在中式豪华宴会厅办婚礼筹备金不足 $5,000 马币！", "info");
      return;
    }
    if ((stats.partnerAffection || 0) < 80) {
      appendLog("Propose: Need at least 80 affection!", "求婚：对方对你好感度未满 80 点（难以成婚）！", "info");
      return;
    }
    setStats(prev => ({
      ...prev,
      money: prev.money - 5000,
      spouseId: "partner_malay_chinese",
      happiness: 100
    }));
    playAudioBeep('achievement');
    appendLog(
      "Marriage: Proposed successfully! Married your loving partner Mei Ling! Happiness is fully maxed!",
      "喜结良缘：求婚成功！在亲友见证下迎娶心上人，建立幸福家庭！心情指数全满！",
      "success"
    );
  };

  const handleHaveChild = () => {
    if (!stats.spouseId) {
      appendLog("Family: You need a spouse to have children first!", "家庭：非婚配阶段不能申领生育二代许可！", "info");
      return;
    }
    if (stats.money < 3000) {
      appendLog("Family: RM3,000 requested for hospital infant care!", "家庭：备药孕检妇产开支不足 $3,000 马币！", "info");
      return;
    }
    setStats(prev => ({
      ...prev,
      money: prev.money - 3000,
      childrenCount: (prev.childrenCount || 0) + 1,
      happiness: Math.min(100, prev.happiness + 20)
    }));
    playAudioBeep('achievement');
    appendLog(
      "Family: A healthy baby baby born! Successor inherit sequence is now active.",
      "新添人丁：喜得贵子！二代香火延续，将对您的商业帝国常态保障继承准备。",
      "success"
    );
  };

  const handleFundDream = (dreamId: string, cost: number) => {
    if (stats.money < cost) {
      playAudioBeep('alert');
      appendLog("Capital Dreams: Insufficient funds to back this megaproject!", "资本宏图：您没有足够的流动现钞参与该项战略投资！", "info");
      return;
    }
    if (stats.fundedDreams?.includes(dreamId)) return;

    setStats(prev => ({
      ...prev,
      money: prev.money - cost,
      fundedDreams: [...(prev.fundedDreams || []), dreamId],
      happiness: Math.min(100, prev.happiness + 30)
    }));
    playAudioBeep('achievement');
    triggerCoinShower();
    appendLog(
      `Milestone! Funded Big Dream: [${dreamId.toUpperCase()}] for $${cost}! Brand value surged!`,
      `惊世伟业！成功出资 $${cost} 斩获大字伟业：【${dreamId === 'island' ? '购买个人专属热带海岛' : dreamId === 'ai_city' ? '打造科技AI智慧城市' : dreamId === 'space' ? '主导太空载人航天探索' : '登顶福布斯巨奖富豪榜'}】！品牌声量在全国一炮打响！`,
      `success`
    );
  };

  // 6. LIFE SELF-CARE RESOLVES
  const handleEatFood = (type: 'street' | 'cafe' | 'restaurant') => {
    let cost = 0;
    let addHealth = 0;
    let addHap = 0;
    let nameEn = "";
    let nameZh = "";

    if (type === 'street') {
      cost = 10; addHealth = 5; addHap = -2; nameEn = "Street fast food"; nameZh = "路边摊盒饭";
    } else if (type === 'cafe') {
      cost = 25; addHealth = 10; addHap = 5; nameEn = "Cafe lunch deal"; nameZh = "精品咖啡三明治";
    } else if (type === 'restaurant') {
      cost = 85; addHealth = 25; addHap = 15; nameEn = "Michelin star dining"; nameZh = "高档餐厅料理";
    }

    if (stats.money < cost) return;

    setStats(prev => ({
      ...prev,
      money: Math.max(0, prev.money - cost),
      health: Math.min(100, prev.health + addHealth),
      happiness: Math.min(100, prev.happiness + addHap)
    }));

    appendLog(
      `Purchased ${nameEn} for $${cost}. Health +${addHealth}, Happiness ${addHap >= 0 ? '+' : ''}${addHap}.`,
      `购买 ${nameZh} 消费 $${cost}。健康值 +${addHealth}, 幸福感 ${addHap >= 0 ? '+' : ''}${addHap}。`,
      "success"
    );
  };

  const handleHospitalCheckup = () => {
    if (stats.money < 200) return;
    setStats(prev => ({
      ...prev,
      money: Math.max(0, prev.money - 200),
      health: Math.min(100, prev.health + 40),
      energy: Math.min(100, prev.energy + 10)
    }));
    appendLog(
      "Completed complete outpatient clinical checkup (-$200). Recovered +40 Health & +10 Energy.",
      "在三甲大医院完成了深度体检和排毒针灸治疗 (-$200)。健康恢复 +40，精力 +10。",
      "success"
    );
  };

  // Seminars brief skill trainings
  const handleStudySeminars = (courseId: string) => {
    const course = SKILL_COURSES.find(c => c.id === courseId);
    if (!course || stats.money < course.cost) return;

    setStats(prev => {
      const copySkills = { ...prev.skills };
      const currentVal = copySkills[course.stat as keyof typeof prev.skills] || 0;
      copySkills[course.stat as keyof typeof prev.skills] = Math.min(100, currentVal + course.gain);
      
      const updStats = {
        ...prev,
        money: prev.money - course.cost,
        skills: copySkills
      };
      
      return updStats;
    });

    appendLog(
      `Attended ${course.name_en} (-$${course.cost}). Gained +${course.gain} to ${course.stat.toUpperCase()}.`,
      `花费 $${course.cost} 参与了【${course.name_zh}】短训。你的 ${course.stat === 'business' ? '商业' : course.stat === 'management' ? '管理' : course.stat === 'coding' ? '编程' : course.stat === 'construction' ? '建造' : '谈判'} 熟练度增加了 +${course.gain} 点。`,
      "success"
    );
  };

  // Higher Degrees Enrollment
  const handleEnrollDegree = (degreeId: string) => {
    const program = EDUCATION_PROGRAMS.find(p => p.id === degreeId);
    if (!program || stats.money < program.cost || studyingProg !== null) return;
    if (stats.education !== program.requires) return; // strict pre-req chain

    setStats(prev => ({ ...prev, money: prev.money - program.cost }));
    setStudyingProg({
      degreeId: program.id,
      daysRemaining: program.daysNeeded
    });

    appendLog(
      `Enrolled and matriculated in ${program.name_en}. Paid tuition fee of $${program.cost}.`,
      `成功报名入读并注册【${program.name_zh}】资格。已支付阶段学费 $${program.cost}。请前进天数推进结业项目。`,
      "info"
    );
  };

  // ==========================================
  // NEW SYSTEM CALLS (School, Vehicles, Bank, Stocks)
  // ==========================================
  
  // School Handlers
  const handleBuyTextbook = (field: string, cost: number, titleEn: string, titleZh: string) => {
    if (stats.money < cost) return;
    setStats(prev => {
      const copySkills = { ...prev.skills };
      const currentVal = copySkills[field as keyof typeof prev.skills] || 0;
      copySkills[field as keyof typeof prev.skills] = Math.min(100, currentVal + 12);
      return {
        ...prev,
        money: prev.money - cost,
        skills: copySkills
      };
    });
    appendLog(
      `Purchased technical review textbook '${titleEn}' for $${cost}. Skill +12.`,
      `购买名校必修教材《${titleZh}》支出 $${cost}，特训相关专业属性 +12 点。`,
      "success"
    );
  };

  const handleApplyScholarship = (amount: number, isPatent: boolean) => {
    const validAmount = (typeof amount === "number" && !isNaN(amount)) ? amount : 5000;
    const validIsPatent = typeof isPatent === "boolean" ? isPatent : false;
    setStats(prev => ({
      ...prev,
      money: prev.money + validAmount,
      happiness: Math.min(100, prev.happiness + 10)
    }));
    if (validIsPatent) {
      appendLog(
        `Your tech patent has been accepted! Received industrial commercialization award of $${validAmount}.`,
        `您撰写的校企共建发明专利成功通过国家审查并付诸民用，荣获商业化基金 $${validAmount}。`,
        "success"
      );
    } else {
      appendLog(
        `Your research scholarship has been approved! Received academic stipend of $${validAmount}.`,
        `学业精英奖状审核通过！发放学术名誉资助奖金 $${validAmount}，健康及荣誉指数提振。`,
        "success"
      );
    }
  };

  // Vehicles Garage Handlers
  const handleBuyVehicle = (vehicleId: string, cost: number) => {
    const veh = VEHICLES_LIST.find(v => v.id === vehicleId);
    if (!veh || stats.money < cost) return;
    setStats(prev => {
      const owned = prev.ownedVehicles || [];
      return {
        ...prev,
        money: prev.money - cost,
        ownedVehicles: [...owned, vehicleId],
        activeVehicleId: vehicleId
      };
    });
    appendLog(
      `Successfully purchased elite commuting asset: ${veh.name_en} (-$${cost})! It has been set as your active ride.`,
      `恭喜您出资 $${cost} 举家购置精品载具【${veh.name_zh}】！已一键点火停入私人车库，开始日常通勤。`,
      "success"
    );
  };

  const handleSelectVehicle = (vehicleId: string | null) => {
    setStats(prev => ({
      ...prev,
      activeVehicleId: vehicleId
    }));
    if (vehicleId) {
      const veh = VEHICLES_LIST.find(v => v.id === vehicleId);
      if (veh) {
        appendLog(
          `Primary commuting active transit set to ${veh.name_en}. Enjoy your commute!`,
          `当前车库主出行座驾一键换置为：【${veh.name_zh}】，省力降压与通勤收益加成生效中。`,
          "info"
        );
      }
    } else {
      appendLog(
        `De-activated vehicle. Commuting set to walking/running mode.`,
        `解绑了名下主代步车辆。回到原始公交通勤步履状态。`,
        "info"
      );
    }
  };

  // Banking System Handlers
  const handleBankDeposit = (amount: number) => {
    if (stats.money < amount) return;
    setStats(prev => ({
      ...prev,
      money: prev.money - amount,
      savingsBalance: (prev.savingsBalance || 0) + amount
    }));
    appendLog(
      `Deposited $${amount} into high-yield commercial savings vault.`,
      `向华尔街对公金库缴存对私账户现金 $${amount}。安全锁死，每日复利复滚。`,
      "success"
    );
  };

  const handleBankWithdraw = (amount: number) => {
    const safeAmount = Math.min(amount, stats.savingsBalance || 0);
    if (safeAmount <= 0) return;
    setStats(prev => ({
      ...prev,
      money: prev.money + safeAmount,
      savingsBalance: Math.max(0, (prev.savingsBalance || 0) - safeAmount)
    }));
    appendLog(
      `Withdrew $${safeAmount} from your commercial savings vault.`,
      `从华尔街定期储蓄金库提取活期资金 $${safeAmount} 并转存入私人随时调用包中。`,
      "success"
    );
  };

  const handleBankBorrow = (amount: number) => {
    setStats(prev => ({
      ...prev,
      money: prev.money + amount,
      loanBalance: (prev.loanBalance || 0) + amount,
      creditScore: Math.max(300, (prev.creditScore || 650) - 10) // Small leverage credit impact
    }));
    appendLog(
      `Approved commercial credit loan of $${amount}. Monthly credit rating adjusted.`,
      `商业征信极速过审！您的对私现金注入抵押/无抵押信用借款 $${amount}，征信分受信用杠杆微幅调整。`,
      "success"
    );
  };

  const handleBankRepay = (amount: number) => {
    const repayAmount = Math.min(amount, stats.loanBalance || 0, stats.money);
    if (repayAmount <= 0) return;
    setStats(prev => ({
      ...prev,
      money: prev.money - repayAmount,
      loanBalance: Math.max(0, (prev.loanBalance || 0) - repayAmount),
      creditScore: Math.min(850, (prev.creditScore || 650) + 12) // Repaying loans bumps credit score!
    }));
    appendLog(
      `Repaid bank financial loan debt amount of $${repayAmount}. Credit score restored.`,
      `向华尔街总行清偿偿还贷款负债本金 $${repayAmount}。债务压迫感降低，您的金融征信等级获奖励提升。`,
      "success"
    );
  };

  // Stock Market Handlers
  const handleBuyStock = (rivalId: string) => {
    const r = rivals.find(item => item.id === rivalId);
    if (!r) return;
    const batchShares = 10;
    const cost = batchShares * r.sharePrice;
    if (stats.money < cost) return;

    setStats(prev => ({ ...prev, money: prev.money - cost }));
    setRivals(prev => prev.map(item => {
      if (item.id === rivalId) {
        return {
          ...item,
          playerSharesOwned: item.playerSharesOwned + batchShares,
          sharesOwnedByRival: Math.max(0, item.sharesOwnedByRival - batchShares)
        };
      }
      return item;
    }));
    appendLog(
      `Purchased 10 stock shares of '${r.companyName}' at $${r.sharePrice}/share.`,
      `买入增持竞争对手企业【${r.companyName}】10股股票，成交单价每股 $${r.sharePrice}。`,
      "success"
    );
  };

  const handleSellStock = (rivalId: string) => {
    const r = rivals.find(item => item.id === rivalId);
    if (!r || r.playerSharesOwned < 10) return;
    const batchShares = 10;
    const revenue = batchShares * r.sharePrice;

    setStats(prev => ({ ...prev, money: prev.money + revenue }));
    setRivals(prev => prev.map(item => {
      if (item.id === rivalId) {
        return {
          ...item,
          playerSharesOwned: Math.max(0, item.playerSharesOwned - batchShares),
          sharesOwnedByRival: item.sharesOwnedByRival + batchShares
        };
      }
      return item;
    }));
    appendLog(
      `Sold 10 stock shares of '${r.companyName}' at $${r.sharePrice}/share.`,
      `抛售退出【${r.companyName}】10股有价证券票据账户，变现得现金 $${revenue}。`,
      "success"
    );
  };

  const handleTradeOwnCompanyShares = (type: 'sell_out' | 'buy_back') => {
    if (!company.registered) return;
    const ownValuation = Math.floor(company.capital + (company.techProgress * 250) + (company.brandAwareness * 180));
    const factionCost = Math.floor(ownValuation * 0.05);

    if (type === 'sell_out') {
      if (ownCompanySharesPercentage <= 10) {
        appendLog("Cannot liquidate further corporate shares. Risk of hostile takeover!", "股权过于微弱（不可低于10%）！为防止竞争股东强行发起杠杆恶意收购，拒绝此次套现。", "error");
        return;
      }
      setOwnCompanySharesPercentage(prev => Math.max(5, prev - 5));
      setStats(prev => ({ ...prev, money: prev.money + factionCost }));
      appendLog(
        `Sold 5% equity of your own company to Wall Street angel syndicates for $${factionCost}.`,
        `将自建企业 5% 的法定股权转让质押至天使风投资本，回笼得对私高额理财金 +$${factionCost}。`,
        "success"
      );
    } else {
      // buy back
      if (stats.money < factionCost) {
        appendLog("Insufficient private personal funds for corporate equity repurchase.", "个人手上现款不足以出资回购这 5% 的股份。", "error");
        return;
      }
      if (ownCompanySharesPercentage >= 100) {
        appendLog("Your personal equity is already fully back-filled to 100%.", "持股比例已高达 100%，无其余散户股份可借资回赎。", "info");
        return;
      }
      setOwnCompanySharesPercentage(prev => Math.min(100, prev + 5));
      setStats(prev => ({ ...prev, money: prev.money - factionCost }));
      appendLog(
        `Successfully bought back 5% corporate equity of your company for $${factionCost}.`,
        `划拨自有私款 $${factionCost} 强力回购 5% 的创始股份！控制力回赎至 ${ownCompanySharesPercentage + 5}%。`,
        "success"
      );
    }
  };

  // 6.5 MULTIPLAYER / FRIEND CONNECTIVITY HANDLERS
  const handleConnectFriendCode = (friendObj: any) => {
    const baseCap = friendObj.netWorth || friendObj.valuation || 30000;
    const basePrice = Math.max(5, Math.round(baseCap / 1000));
    
    const newRivalFriend: RivalPlayer = {
      id: "friend_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name_en: friendObj.name + " (Friend)",
      name_zh: friendObj.name + " (联机死党)",
      companyName: friendObj.compName || (friendObj.name + " Corp"),
      companySector: (friendObj.sector as any) || "tech",
      companyCapital: baseCap,
      outstandingShares: 1000,
      playerSharesOwned: 0,
      sharePrice: basePrice,
      sharesOwnedByRival: 1000,
      prevSharePrices: [Math.round(basePrice * 0.94), Math.round(basePrice * 0.98), basePrice],
      isBankrupt: false,
      countryCode: "CN",
      isFriend: true
    };

    setRivals(prev => {
      // replace any friend with the same name if exists, else append
      const filtered = prev.filter(r => r.name_en !== newRivalFriend.name_en && r.name_zh !== newRivalFriend.name_zh);
      return [...filtered, newRivalFriend];
    });

    appendLog(
      `Successfully matched with friend ${friendObj.name}'s business! Installed them onto global indices.`,
      `成功引入好友【${friendObj.name}】的实业信息！已经将其企业【${newRivalFriend.companyName}】成功注入本地股市与商会大盘！`,
      "success"
    );
  };

  const handleAddCustomFriend = (name: string, companyName: string, sector: 'tech'|'retail'|'real_estate'|'finance', initialVal: number) => {
    const basePrice = Math.max(5, Math.round(initialVal / 1000));
    const newRivalFriend: RivalPlayer = {
      id: "friend_custom_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      name_en: name + " (Custom Friend)",
      name_zh: name + " (快捷死党)",
      companyName: companyName || (name + " Starup"),
      companySector: sector,
      companyCapital: initialVal,
      outstandingShares: 1000,
      playerSharesOwned: 0,
      sharePrice: basePrice,
      sharesOwnedByRival: 1000,
      prevSharePrices: [Math.round(basePrice * 0.95), basePrice],
      isBankrupt: false,
      countryCode: "CN",
      isFriend: true
    };

    setRivals(prev => [...prev, newRivalFriend]);

    appendLog(
      `Manually drafted custom competitor friend '${name}' and their firm '${companyName}' to the active market.`,
      `成功在沙盒中手动录入极客死党【${name}】！新创设企业【${companyName}】已经挂牌进入实时对冲大盘！`,
      "success"
    );
  };

  const handleWireCashToFriend = (rivalId: string, amount: number) => {
    // If amount is negative, it means the player won a duel and rival pays player!
    if (amount < 0) {
      const positiveReward = Math.abs(amount);
      setStats(prev => ({ ...prev, money: prev.money + positiveReward }));
      setRivals(prev => prev.map(r => {
        if (r.id === rivalId) {
          const nextCap = Math.max(2000, r.companyCapital - positiveReward);
          return {
            ...r,
            companyCapital: nextCap,
            sharePrice: Math.max(5, Math.round(nextCap / 1000))
          };
        }
        return r;
      }));
      return;
    }

    if (stats.money < amount) {
      appendLog("Insufficient funds to wire cash support to friend.", "手头现金流动性赤字，无法向该死党转移公款！", "error");
      return;
    }

    setStats(prev => ({ ...prev, money: prev.money - amount }));
    setRivals(prev => prev.map(r => {
      if (r.id === rivalId) {
        const nextCap = r.companyCapital + amount;
        return {
          ...r,
          companyCapital: nextCap,
          sharePrice: Math.max(5, Math.round(nextCap / 1000))
        };
      }
      return r;
    }));

    const target = rivals.find(r => r.id === rivalId);
    const targetName = target ? (language === 'zh' ? target.name_zh : target.name_en) : "friend";
    appendLog(
      `Wired support capital sum of $${amount.toLocaleString()} to assist friend '${targetName}'.`,
      `成功划转一笔紧急援助资金！向您的联机死党【${targetName}】汇缴 $${amount.toLocaleString()} 精准扶持公款！`,
      "success"
    );
  };

  // 7. CAREER PATHWAYS
  const handleApplyJob = (jobId: string) => {
    const offer = JOBS_LIST.find(j => j.id === jobId);
    if (!offer) return;
    
    const meetsUnlocks = offer.checkUnlocks(stats.skills, stats.education);
    if (!meetsUnlocks) {
      appendLog("Failed job application: required competencies not met.", "入职失败：您的学术资质或专业技能不达标。", "error");
      return;
    }

    setStats(prev => ({ ...prev, activeJobId: jobId }));
    appendLog(
      `Congratulations! Successfully hired as ${offer.title_en}. Baseline salary is $${offer.salaryPerDay}/day.`,
      `大吉大利！您通过面试成功入职【${offer.title_zh}】岗位。协议日薪 $${offer.salaryPerDay}。自明日前进而生效。`,
      "success"
    );
  };

  const handleResign = () => {
    setStats(prev => ({ ...prev, activeJobId: null }));
    appendLog(
      "Resigned from your current job. You are now freelancing/running your startup full-time.",
      "您办理了辞职离职交接手续！转归待业自由职业，或将作为全职CEO倾力打理名下企业。",
      "info"
    );
  };

  // 8. ENTERPRISE OPERATIVE ACTIONS
  const handleRegisterCompany = (name: string, type: Company['type'], initialCapital: number) => {
    if (stats.money < initialCapital || initialCapital < 2000) return;

    setStats(prev => ({ ...prev, money: prev.money - initialCapital }));
    setCompany({
      registered: true,
      name,
      type,
      capital: initialCapital,
      employees: [],
      priceFactor: 1.0,
      rdBudget: 20,
      marketingBudget: 20,
      brandAwareness: 15,
      techProgress: 10,
      salesHistory: []
    });

    appendLog(
      `Incorporated Enterprise '${name}' focused on ${type.toUpperCase()}. Capital stock injected: $${initialCapital}.`,
      `成功注册工商！创立【${name}】有限责任公司。核心业务在 ${type.toUpperCase()} 赛道开展。已注资 $${initialCapital} 作为启动资金。`,
      "success"
    );
  };

  const handleHireEmployee = (cand: RecruitmentCandidate) => {
    const officeTier = company.officeTier || 0;
    const maxEmployees = officeTier === 1 ? 6 : officeTier === 2 ? 8 : officeTier === 3 ? 11 : officeTier === 4 ? 15 : 5;
    if (company.employees.length >= maxEmployees) return;
    if (company.capital < cand.salaryPerDay * 3) {
      appendLog("Insufficient corporate funds to pay basic contract deposits.", "企业对公备用金过低，无力与高端人才签订雇佣劳务合同。", "error");
      return;
    }

    // Move candidate to employees
    const newEmp: Employee = {
      id: cand.id,
      name_en: cand.name_en,
      name_zh: cand.name_zh,
      role: cand.role,
      skill: cand.skill,
      salaryPerDay: cand.salaryPerDay
    };

    setCompany(prev => ({
      ...prev,
      employees: [...prev.employees, newEmp]
    }));

    // Remove candidate from candidates list
    setCandidates(prev => prev.filter(c => c.id !== cand.id));

    // Replenish candidates list after hiring
    setTimeout(() => {
      const generated = generateRandomCandidate(language);
      setCandidates(prev => [...prev, generated]);
    }, 200);

    appendLog(
      `Recruited ${cand.name_en} (${cand.role.toUpperCase()} Lvl ${cand.skill}) for $${cand.salaryPerDay}/day wages.`,
      `签约录用 ${cand.name_zh}（${cand.role === 'developer' ? '技术开发' : cand.role === 'sales' ? '产品行销' : '主企划运营'}，能力等级 Lvl ${cand.skill}），薪酬 $${cand.salaryPerDay}/日。`,
      "success"
    );
  };

  const handleFireEmployee = (empId: string) => {
    const fired = company.employees.find(e => e.id === empId);
    if (!fired) return;

    setCompany(prev => ({
      ...prev,
      employees: prev.employees.filter(e => e.id !== empId)
    }));

    appendLog(
      `Terminated contractual relationship with ${fired.name_en}.`,
      `解雇员工 ${fired.name_zh}。劳务结算完毕，关系解除。`,
      "info"
    );
  };

  const handleAdjustBudgets = (rd: number, mktg: number, pf: number) => {
    setCompany(prev => ({
      ...prev,
      rdBudget: rd,
      marketingBudget: mktg,
      priceFactor: pf
    }));
    
    appendLog(
      `Budgets configured: R&D=$${rd}/day, Marketing=$${mktg}/day, Price=${pf}x.`,
      `企业预算微调成功：每日自主研发投入 $${rd}，每日品牌推广投入 $${mktg}，价格倍率调整为 ${pf}x。`,
      "info"
    );
  };

  const handleInjectCompanyCapital = (amount: number) => {
    if (stats.money < amount) return;
    setStats(prev => ({ ...prev, money: prev.money - amount }));
    setCompany(prev => ({ ...prev, capital: prev.capital + amount }));
    appendLog(
      `Injected $${amount} personal savings into Corporate Core liquid assets.`,
      `向对公企业资本金注入个人存款 $${amount}。企业御敌防险能力增强。`,
      "success"
    );
  };

  const handleWithdrawCompanyCapital = (amount: number) => {
    if (company.capital < amount) return;
    setCompany(prev => ({ ...prev, capital: prev.capital - amount }));
    setStats(prev => ({ ...prev, money: prev.money + amount }));
    appendLog(
      `Extracted $${amount} capital profits into personal private wallet.`,
      `实施企业合理减资抽回 $${amount} 至个人私库钱包中，规避理财风险。`,
      "success"
    );
  };

  const handleUpgradeCorporateCategory = (category: 'office' | 'equipment' | 'benefits' | 'marketing', targetTier: number, setupCost: number) => {
    if (company.capital < setupCost) {
      appendLog("Insufficient corporate capital to finance this capital expenditure (CapEx) upgrade.", "公司对公可用资金匮乏，不足以支持本项扩张资本支出(CapEx)首付款！", "error");
      return;
    }

    setCompany(prev => {
      const updated = { ...prev };
      if (category === 'office') updated.officeTier = targetTier;
      if (category === 'equipment') updated.equipmentTier = targetTier;
      if (category === 'benefits') updated.benefitsTier = targetTier;
      if (category === 'marketing') updated.marketingTier = targetTier;
      updated.capital -= setupCost;
      return updated;
    });

    const categories_en = { office: 'HQ Workspace', equipment: 'IT & Cloud Equipment', benefits: 'Employee Welfare perk', marketing: 'PR Campaign Grid' };
    const categories_zh = { office: '总部办公空间及大楼级别', equipment: 'IT设备与云服务器基础设施', benefits: '雇员关怀福利保障计划', marketing: '常态化市场化活动投放投放网' };

    appendLog(
      `Authorized corporate CapEx upgrade of $${setupCost.toLocaleString()}. Set '${categories_en[category]}' to Lvl ${targetTier}.`,
      `公司董事会通过专项决议！划拨对公固定资产投资 $${setupCost.toLocaleString()}，成功将 【${categories_zh[category]}】 升级扩展至 Lvl ${targetTier}。`,
      "success"
    );
  };

  const handleRecruitPartner = (partner: Partner) => {
    if (!company.registered) {
      appendLog("Must register a company first in order to take in co-founders/partners.", "您必须先创立注册一家公司，才能邀请或签约联合创始人/合伙人！", "error");
      return;
    }
    const currentPartners = company.partners || [];
    if (currentPartners.includes(partner.id)) {
      appendLog("This partner is already a key stakeholder of your company.", "此人已经是您公司的联合合伙人或股东，不可重复加盟。", "warning");
      return;
    }
    if (stats.skills.negotiation < partner.reqNegotiationSkill) {
      appendLog(`Insufficient negotiation skill (Required Lvl ${partner.reqNegotiationSkill}). Partner rejected.`, `商海博弈资质浅薄（对方要求玩家谈判技巧达到 Lvl ${partner.reqNegotiationSkill}），合伙邀约遭拒。`, "error");
      return;
    }
    if (stats.money < partner.signingCost) {
      appendLog(`Insufficient personal savings to pay the $${partner.signingCost} contract signing cost.`, `钱包私款不足，无法自掏腰包支付 $${partner.signingCost} 的高管加盟保证金与猎头服务费。`, "error");
      return;
    }
    if (ownCompanySharesPercentage <= partner.equityRequired + 10) {
      appendLog("Not enough corporate equity left to offer! You must maintain at least 10% company stake to avoid hostile takeover to recruit.", "您的股权过大比例被稀释（不能降到10%以下）！合伙人拒绝此项邀约，请先回购股份再行邀约。", "warning");
      return;
    }

    // Success recruiter sequence
    setStats(prev => ({ ...prev, money: prev.money - partner.signingCost }));
    setOwnCompanySharesPercentage(prev => Math.max(1, prev - partner.equityRequired));
    setCompany(prev => ({
      ...prev,
      capital: prev.capital + partner.investmentCapital,
      partners: [...(prev.partners || []), partner.id]
    }));

    appendLog(
      `Successfully partnered with co-founder ${partner.name_en}. Injected $${partner.investmentCapital} company capital! Equity diluted by ${partner.equityRequired}%.`,
      `成功签约合伙人【${partner.name_zh}】加盟公司，担任【${partner.role_zh}】！对方注资对公本金个人 +$${partner.investmentCapital.toLocaleString()} 增资扩股，您的创始特许持股比例相应扣减稀释了 ${partner.equityRequired}%。`,
      "success"
    );
  };

  // 9. REAL ESTATE DEVELOPMENT
  const handleBuyLand = (plotId: string) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || stats.money < plot.price) return;

    setStats(prev => ({ ...prev, money: prev.money - plot.price }));
    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return { ...p, owned: true };
      }
      return p;
    }));

    appendLog(
      `Bought real-estate zoning land '${plot.name_en}' for $${plot.price}. Ready to erect houses!`,
      `签署地产买卖协议！出资 $${plot.price} 置地受让【${plot.name_zh}】产权。地基空旷，等待开工图纸！`,
      "success"
    );
  };

  const handleBuildBlueprint = (plotId: string, bpId: string) => {
    const bp = BLUEPRINTS.find(b => b.id === bpId);
    const plot = plots.find(p => p.id === plotId);
    if (!bp || !plot || !plot.owned || plot.house.built) return;

    if (stats.skills.construction < bp.reqConstruction) {
      appendLog("Incompetence construction skill level. Blueprint rejected.", "工程设计图纸遭城建阻拦：您的“建造能力”不足以理解和实施该规格住宅。", "error");
      return;
    }
    if (stats.money < bp.cost) return;

    setStats(prev => ({ ...prev, money: prev.money - bp.cost }));
    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          house: {
            built: true,
            type: bpId as any,
            renovationLevel: 10,
            furnituresOwned: []
          }
        };
      }
      return p;
    }));

    appendLog(
      `Erected house blueprint '${bp.name_en}' on location! Construction cost: -$${bp.cost}.`,
      `重锤开工奠基！消耗 $${bp.cost} 成功在所属地块崛起落成建构【${bp.name_zh}】。`,
      "success"
    );
  };

  const handleRenovateHouse = (plotId: string) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.owned || !plot.house.built || plot.house.renovationLevel >= 100 || stats.money < 400) return;

    setStats(prev => ({ 
      ...prev, 
      money: prev.money - 400,
      happiness: Math.min(100, prev.happiness + 5)
    }));

    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          house: {
            ...p.house,
            renovationLevel: Math.min(100, p.house.renovationLevel + 15)
          }
        };
      }
      return p;
    }));

    appendLog(
      "Completed visual hard renovation decoration details (-$400). Renovation level +15%, Happiness +5.",
      "雇佣专业装修施工队开展室内墙纸、地板硬装精细改良 (-$400)。精美装配度 +15%, 幸福值 +5。",
      "success"
    );
  };

  const handleBuyFurniture = (plotId: string, fur: Furniture) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.owned || !plot.house.built || stats.money < fur.cost) return;
    if (plot.house.furnituresOwned.includes(fur.id)) return;

    setStats(prev => ({
      ...prev,
      money: prev.money - fur.cost,
      happiness: Math.min(100, prev.happiness + fur.happinessBonus),
      energy: Math.min(100, prev.energy + fur.energyBonus)
    }));

    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          house: {
            ...p.house,
            furnituresOwned: [...p.house.furnituresOwned, fur.id]
          }
        };
      }
      return p;
    }));

    appendLog(
      `Purchased and equipped furniture '${fur.name_en}' (-$${fur.cost}). Gain +${fur.happinessBonus} Happiness & +${fur.energyBonus} Energy.`,
      `商场选购添置高档软装【${fur.name_zh}】(-$${fur.cost}) 交付入室安装。获得永久属性加成：幸福度 +${fur.happinessBonus}，睡觉精力回复率 +${fur.energyBonus}。`,
      "success"
    );
  };

  const handleToggleRent = (plotId: string, termDays?: number, rateMult?: number) => {
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.owned || !plot.house.built) return;

    const currentlyRented = !!plot.isRented;
    const nextRented = !currentlyRented;

    // Set Tenant Profile on Rent
    let tenantEn = "";
    let tenantZh = "";
    let baseSatisfaction = 85;
    let baseVacancyRisk = 0.03;

    if (nextRented) {
      const termSelected = termDays ?? -1;
      if (termSelected === 3) {
        tenantEn = "🌴 Kuala Lumpur Backpacker Tourists";
        tenantZh = "🌴 隆双子塔背包客外籍家庭";
        baseSatisfaction = 78 + Math.floor(Math.random() * 10);
        baseVacancyRisk = 0.12;
      } else if (termSelected === 7) {
        tenantEn = "🎓 Sunway University Digital Society";
        tenantZh = "🎓 双威本科学术精英自治公寓群";
        baseSatisfaction = 85 + Math.floor(Math.random() * 12);
        baseVacancyRisk = 0.05;
      } else if (termSelected === 30) {
        tenantEn = "🤵 Senior Corporate Blockchain Engineers";
        tenantZh = "🤵 区块链中心高级全栈研发骨干";
        baseSatisfaction = 92;
        baseVacancyRisk = 0.01;
      } else {
        tenantEn = "🏢 Gov Tech Research Center Syndicate";
        tenantZh = "🏢 联邦科技孵化器直属工作室";
        baseSatisfaction = 95;
        baseVacancyRisk = 0.02;
      }
    }

    setPlots(prev => prev.map(p => {
      if (p.id === plotId) {
        return {
          ...p,
          isRented: nextRented,
          rentTermTotal: nextRented ? (termDays ?? -1) : undefined,
          rentTermRemaining: nextRented ? (termDays ?? -1) : undefined,
          rentRateMultiplier: nextRented ? (rateMult ?? 1.0) : undefined,
          tenantType_en: nextRented ? tenantEn : undefined,
          tenantType_zh: nextRented ? tenantZh : undefined,
          tenantSatisfaction: nextRented ? baseSatisfaction : undefined,
          vacancyRisk: nextRented ? baseVacancyRisk : undefined,
          districtDemand: nextRented ? (p.districtDemand ?? 1.05) : undefined
        };
      }
      return p;
    }));

    if (nextRented) {
      const durationStrEn = termDays === -1 ? "continuous autopilot" : `${termDays} days`;
      const durationStrZh = termDays === -1 ? "自动托管无限期" : `${termDays} 天租期`;
      
      appendLog(
        `Property listed! Tenant '${tenantEn}' signed lease contract for ${durationStrEn}. Daily deposits active!`,
        `资产出租挂牌！优质租客“${tenantZh}”已签约承租，商议租期为：【${durationStrZh}】！每日结付营业红利。`,
        "success"
      );
    } else {
      appendLog(
        "Property reclaimed. House returned to personal usage status. Yields passive sleep buffs again.",
        "房产成功办妥退租交接。资产已收回为自持自住状态，日常结算起恢复睡觉精力和幸福度增益。",
        "info"
      );
    }
  };

  const handleActiveSideGig = (gigId: string) => {
    const gig = SIDE_GIGS.find(g => g.id === gigId);
    if (!gig) return;

    if (stats.energy < gig.energy) {
      playAudioBeep('alert');
      appendLog(
        "Stamina Depleted: Not enough physical energy left and your vision is blurry! Go to a coffee stall, sleep, or take checkups to restore health.",
        "身体极度疲劳：物理精力指标太低，看人都快重影了！快前往大马茶摊饱餐一顿或在个人自住房中安心睡觉休息。",
        "warning"
      );
      return;
    }

    const currentLevel = stats.level || 1;
    const stressLevel = stats.stress || 0;

    // Check Requirements
    const levelMet = currentLevel >= gig.requiredLevel;
    const skillsMet = Object.entries(gig.requiredSkills).every(([skillKey, value]) => {
      const currentVal = stats.skills[skillKey as keyof typeof stats.skills] || 0;
      return currentVal >= (value ?? 0);
    });

    if (!levelMet || !skillsMet) {
      playAudioBeep('alert');
      appendLog(
        "Unauthorized: Your professional qualifications or character levels do not meet this gig's strict criteria!",
        "无法承接：您的商业大亨等级或局部学科熟练度未达到该高级兼职的严苛要求！",
        "warning"
      );
      return;
    }

    // Check Cooldown
    const cooldownValue = stats.gigCooldowns?.[gigId] || 0;
    if (cooldownValue > 0 && stats.day < cooldownValue) {
      playAudioBeep('alert');
      appendLog(
        `On Cooldown: This exclusive high-yield contract is currently resting. Returns on Day ${cooldownValue}.`,
        `合约冷却：此项高毛利合同条款有排他期，目前尚需打理，将在第 ${cooldownValue} 天就位重新挂网。`,
        "warning"
      );
      return;
    }

    // Burnout Check
    if (stressLevel >= 95) {
      playAudioBeep('alert');
      appendLog(
        "Severe Burnout! Your hands are shaking too much to operate properly. Rest or consume high-class restaurant dishes first!",
        "🚨 精神高度焦虑崩溃：您的焦躁压力值已突破95%极限阀值，大脑根本无法集中，请速去自住床垫或奢华餐厅松弛疗愈！",
        "error"
      );
      return;
    }

    // Calculate dynamic success rate
    let skillAdjustment = 0;
    Object.entries(gig.requiredSkills).forEach(([skillKey, value]) => {
      const currentVal = stats.skills[skillKey as keyof typeof stats.skills] || 0;
      if (currentVal > (value ?? 0)) {
        skillAdjustment += (currentVal - (value ?? 0)) * 0.005; // 0.5% success chance boost per extra level
      }
    });
    const levelBonus = Math.max(0, (currentLevel - gig.requiredLevel) * 0.02);
    const stressPenalty = stressLevel > 80 ? 0.30 : stressLevel > 50 ? 0.12 : 0;
    const finalRate = Math.min(1.0, Math.max(0.35, gig.baseSuccessRate + skillAdjustment + levelBonus - stressPenalty));

    const isSuccess = Math.random() < finalRate;

    if (isSuccess) {
      // Multiply earnings for tech coding gigs if holding modern workstations/laptops
      const isCodingGig = gig.skillGains.coding !== undefined || gig.requiredSkills.coding !== undefined;
      const hasLaptopDev = stats.ownedVehicles.includes("laptop_developer");
      const hasLaptopStd = stats.ownedVehicles.includes("laptop_standard");
      const laptopBonus = hasLaptopDev ? 1.6 : hasLaptopStd ? 1.25 : 1.0;
      const finalEarnings = Math.round(gig.earnings * (isCodingGig ? laptopBonus : 1.0));

      setStats(prev => {
        // Handle leveling XP additions
        let newXp = (prev.xp || 0) + gig.xp;
        let newLevel = prev.level || 1;
        let leveledUp = false;
        let needed = newLevel * 100 + 150;

        while (newXp >= needed) {
          newXp -= needed;
          newLevel += 1;
          needed = newLevel * 100 + 150;
          leveledUp = true;
        }

        // Apply skill increases
        const newSkills = { ...prev.skills };
        Object.entries(gig.skillGains).forEach(([sk, sVal]) => {
          const key = sk as keyof typeof prev.skills;
          newSkills[key] = Math.min(100, (newSkills[key] || 0) + (sVal ?? 0));
        });

        // Add cooldown if applicable
        const newCooldowns = { ...prev.gigCooldowns };
        if (gig.cooldownDays > 0) {
          newCooldowns[gigId] = prev.day + gig.cooldownDays;
        }

        const newStress = Math.min(100, (prev.stress || 0) + gig.stress);

        if (leveledUp) {
          // Play level up modal
          setTimeout(() => {
            playAudioBeep('levelup');
            setActiveLevelUpModal({
              show: true,
              title_en: `👑 CLASS LEVEL ADVANCED! Level ${newLevel}`,
              title_zh: `👑 商业智囊头衔晋升！Level ${newLevel}`,
              desc_en: `Fantastic experience gathered! You have reached Career Level ${newLevel}! High-tier task success rates improved & stipend RM ${newLevel * 500} payout settled!`,
              desc_zh: `祝贺突破！您的商业路演功底日益精进，当前等级晋升至 Level ${newLevel}！高阶兼职成功率提高，政府青年孵化奖金 +RM ${newLevel * 500} 马币已划扣到账！`
            });
          }, 100);
        }

        return {
          ...prev,
          money: prev.money + finalEarnings + (leveledUp ? newLevel * 500 : 0),
          energy: Math.max(0, prev.energy - gig.energy),
          xp: newXp,
          level: newLevel,
          skills: newSkills,
          stress: newStress,
          gigCooldowns: newCooldowns
        };
      });

      playAudioBeep('coin');
      triggerCoinShower();

      const logEn = `[SUCCESS] Clear: "${gig.name_en}"! Handled all client requests beautifully. Earned RM ${finalEarnings}, +${gig.xp} XP, +${gig.stress}% Stress.`;
      const logZh = `【兼职合规大捷】完满执行：“${gig.name_zh}”！客户极度满意给予五星好评。斩获红利 +RM ${finalEarnings}，成长经验 +${gig.xp} XP，压力阀值 +${gig.stress}%。`;
      appendLog(logEn, logZh, "success");

    } else {
      // FAILURE SIMULATOR
      let consolationMoney = Math.round(gig.earnings * 0.15);
      let failEn = `[FAILURE] Mistake on "${gig.name_en}". Disappointed team paid partial RM ${consolationMoney} consolatory reward.`;
      let failZh = `【突发事故】“${gig.name_zh}”在交接测试时突然崩盘。对方大发雷霆仅扣付辛苦补偿金 RM ${consolationMoney}。`;

      if (gigId === "gig_delivery") {
        consolationMoney = 3;
        failEn = "[FAILURE] KL Delivery Run: Slipped on wet banana skins in Bukit Bintang, splashing laksa boxes! Earned RM 3.";
        failZh = "【外卖事故】武吉免登大路不慎滑倒，热汤泼洒在马路上，被客户臭骂！仅拿到基本跑腿费 RM 3。";
      } else if (gigId === "gig_website_builder") {
        consolationMoney = 25;
        failEn = "[FAILURE] Freelance Code: Client continuous design modifications drove you nuts, terminating early. Kill-fee paid: RM 25.";
        failZh = "【开发事故】自由建站：客户提出各种奇奇怪怪的排版修改，无法达成共识而合约早夭。仅赔付辛苦费 RM 25。";
      } else if (gigId === "gig_smart_contracts") {
        consolationMoney = 0;
        failEn = "[FAILURE] Ethereum Audit: Missed a fatal re-entrancy loophole on DeFi vaults! Hackers drained tests. Zero reward, +30% Stress.";
        failZh = "【安全事故】智能合约：漏掉了核心递归重入逻辑，开发网络测试池被瞬间洗劫！审计酬金降为0，神经高度暴躁。";
      } else if (gigId === "gig_cloud_migration") {
        consolationMoney = 100;
        failEn = "[FAILURE] Server Porting: IAM permissions crashed the client database for 4 hours. Slit-pay compensations: RM 100.";
        failZh = "【运维事故】云迁移：由于IAM权限设置违规导致客户主库报废4小时。被克扣大部分酬金，结付 RM 100 赔偿金。";
      } else if (gigId === "gig_ai_agent_consultant") {
        consolationMoney = 200;
        failEn = "[FAILURE] AI Consultant: ChatGPT client hallucinated severe swearing slops during presentation! Compensated: RM 200.";
        failZh = "【路演重大事故】AI智能体：在董事多方连线路演时，GPT接口突然抽风无限胡乱爆粗！合作当场泡汤，仅拿车马费 RM 200。";
      }

      setStats(prev => {
        const newCooldowns = { ...prev.gigCooldowns };
        if (gig.cooldownDays > 0) {
          newCooldowns[gigId] = prev.day + gig.cooldownDays;
        }
        return {
          ...prev,
          money: prev.money + consolationMoney,
          energy: Math.max(0, prev.energy - gig.energy),
          stress: Math.min(100, (prev.stress || 0) + Math.round(gig.stress * 1.35)), // Failures create 35% extra anxiety
          xp: (prev.xp || 0) + Math.round(gig.xp * 0.3), // fail gives minor partial offset XP
          gigCooldowns: newCooldowns
        };
      });

      playAudioBeep('alert');

      appendLog(failEn, failZh, "error");
    }
  };

  // 10. TRIGGER EVENTS DECISION EFFECTS
  const handleResolveEvent = (effectFn: (stats: PlayerStats, company: Company, plots: LandPlot[]) => {
    stats: PlayerStats;
    company: Company;
    plots: LandPlot[];
    log_en: string;
    log_zh: string;
  }) => {
    if (!activeEvent) return;

    const res = effectFn(stats, company, plots);
    setStats(res.stats);
    setCompany(res.company);
    setPlots(res.plots);
    appendLog(res.log_en, res.log_zh, "event");
    setActiveEvent(null);
  };

  // 11. ADVANCE SIMULATION CLOCK ENGINE (Main Core Loop)
  const handleAdvanceDay = async (batchDays: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = GameEngine.tickDay({
        language,
        stats,
        company,
        plots,
        studyingProg,
        rivals,
        friendVentures,
        missions,
        autopilotEnabled,
        autopilotSettings,
        batchDays,
        appendLog
      });

      setStats(res.stats);
      setCompany(res.company);
      setPlots(res.plots);
      setStudyingProg(res.studyingProg);
      setRivals(res.rivals);
      setFriendVentures(res.friendVentures);
      setMissions(res.missions);

      if (res.triggeredEvent) {
        setActiveEvent(res.triggeredEvent);
      }
    } catch (err) {
      console.error("Simulation core exception: ", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredLogs = logs.filter(lg => {
    if (logFilter === 'all') return true;
    return lg.type === logFilter;
  });

  const ownCompanyValuation = company.registered ? Math.floor(company.capital + (company.techProgress * 250) + (company.brandAwareness * 180)) : 0;
  const rivalSharesValue = rivals.reduce((acc, r) => acc + (r.playerSharesOwned * r.sharePrice), 0);
  const playerNetWorth = stats.money + (stats.savingsBalance || 0) - (stats.loanBalance || 0) + Math.floor(ownCompanyValuation * (ownCompanySharesPercentage / 100)) + rivalSharesValue;

  // 11.2 Monetization Reward Handlers
  const handleClaimDailyReward = (doubleReward: boolean) => {
    const currentStreak = stats.dailyRewardStreak ?? 0;
    const baseReward = (currentStreak + 1) * 200;
    const rewardAmount = doubleReward ? baseReward * 2 : baseReward;
    
    playAudioBeep('coin');
    triggerCoinShower();
    
    setStats(prev => ({
      ...prev,
      money: prev.money + rewardAmount,
      dailyRewardStreak: (currentStreak + 1) % 7,
      lastDailyRewardClaimedDate: new Date().toDateString()
    }));

    appendLog(
      `[Daily Gift] Claimed RM ${rewardAmount.toLocaleString()} cash from your streak day ${currentStreak + 1}!`,
      `【每日登入福袋】成功领取 RM ${rewardAmount.toLocaleString()} 马币战术备用金（第 ${currentStreak + 1} 日）！`,
      "success"
    );
  };

  const handlePrestigeRebirth = () => {
    const nextPrestigeCount = (stats.prestigeCount || 0) + 1;
    const nextPrestigeMultiplier = (stats.prestigeMultiplier || 1.0) + 0.5;

    playAudioBeep('achievement');
    triggerCoinShower();

    setStats(prev => ({
      ...prev,
      money: 1000,
      energy: 100,
      health: 100,
      happiness: 80,
      education: 'high_school',
      activeJobId: "delivery_driver",
      ownedVehicles: [],
      activeVehicleId: null,
      savingsBalance: 0,
      loanBalance: 0,
      prestigeCount: nextPrestigeCount,
      prestigeMultiplier: nextPrestigeMultiplier,
      level: 1,
      xp: 0,
      stress: 0,
    }));

    setCompany({
      registered: false,
      name: "",
      type: "none",
      capital: 0,
      employees: [],
      priceFactor: 1.0,
      rdBudget: 0,
      marketingBudget: 0,
      brandAwareness: 10,
      techProgress: 0,
      salesHistory: [],
      partners: []
    });

    setStudyingProg(null);
    setPlots(INITIAL_LAND_PLOTS());
    setOwnCompanySharesPercentage(100);

    appendLog(
      `🌐 [Heritage Prestige Rebirth] Congratulations! Reborn into Chapter ${nextPrestigeCount + 1}! Permanent multipliers raised to ${nextPrestigeMultiplier.toFixed(1)}x!`,
      `🌐 【企业百倍传承涅槃】恭喜！您已成功重启新章，开启第 ${nextPrestigeCount + 1} 周目征途！全局收益及工资永久加成狂飙至 ${nextPrestigeMultiplier.toFixed(1)}x 倍！`,
      "success"
    );
  };

  const handleSkipStudyDay = () => {
    if (!studyingProg) return;
    const nextDays = studyingProg.daysRemaining - 1;
    playAudioBeep('levelup');
    if (nextDays <= 0) {
      const finishedId = studyingProg.degreeId;
      setStats(prev => {
        const skills = { ...prev.skills };
        if (finishedId === 'bachelor') {
          skills.business = Math.min(100, (skills.business || 0) + 15);
          skills.coding = Math.min(100, (skills.coding || 0) + 15);
        } else if (finishedId === 'master') {
          skills.business = Math.min(100, (skills.business || 0) + 30);
          skills.management = Math.min(100, (skills.management || 0) + 30);
        } else if (finishedId === 'phd') {
          skills.business = Math.min(100, (skills.business || 0) + 40);
          skills.coding = Math.min(100, (skills.coding || 0) + 40);
        }
        return {
          ...prev,
          education: finishedId as any,
          skills
        };
      });
      setStudyingProg(null);
      appendLog(
        `[Sponsor Ad] Accelerated studying! You successfully graduated from your ${finishedId} placement & collected huge skill bonuses!`,
        `【赞助加速】成功看广告加速结业！您已光速修满课程，从【${finishedId}】学位顺利结业并获得巨额技能收益！`,
        "success"
      );
    } else {
      setStudyingProg({
        ...studyingProg,
        daysRemaining: nextDays
      });
      appendLog(
        `[Sponsor Ad] Study accelerated. Time decreased by 1 Day.`,
        `【赞助加速】成功看广告加速结业！攻读学位在读时间缩短 1 日。`,
        "success"
      );
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div
            id="game-menu-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 select-none font-sans antialiased relative overflow-hidden"
          >
            {/* Inject Custom Keyframes for Parallax elements & Cyber Skyline */}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes floatUpAndAway {
                0% { transform: translateY(120%) scale(0.95); opacity: 0; }
                10% { opacity: 0.6; }
                90% { opacity: 0.4; }
                100% { transform: translateY(-100px) scale(1.05); opacity: 0; }
              }
              @keyframes starTwinkle {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.85; }
              }
              @keyframes trafficStream {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100vw); }
              }
              @keyframes horizonFloat {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
              }
            `}} />

            {/* HIGH FIDELITY CYBER NIGHT SKYLINE BACKDROP */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#020205] via-[#05060f] to-[#010103] z-0" />
            
            {/* Twinkling Stars Matrix */}
            <div className="absolute inset-0 z-0 opacity-40">
              {[
                { top: '12%', left: '15%', delay: '0s', size: 1.5 },
                { top: '25%', left: '42%', delay: '1s', size: 2 },
                { top: '18%', left: '78%', delay: '2.5s', size: 1 },
                { top: '35%', left: '88%', delay: '1.2s', size: 2.5 },
                { top: '8%', left: '60%', delay: '0.4s', size: 2 },
                { top: '42%', left: '23%', delay: '3.1s', size: 1.5 },
                { top: '48%', left: '66%', delay: '1.8s', size: 1 },
                { top: '15%', left: '5%', delay: '2.2s', size: 2 }
              ].map((star, i) => (
                <div 
                  key={`star-${i}`} 
                  className="absolute bg-white rounded-full" 
                  style={{ 
                    top: star.top, 
                    left: star.left, 
                    width: `${star.size}px`, 
                    height: `${star.size}px`, 
                    animation: `starTwinkle 3s ease-in-out infinite`,
                    animationDelay: star.delay
                  }} 
                />
              ))}
            </div>

            {/* Slowly Floating Micro Market Tickers Upward */}
            <div className="absolute inset-x-0 bottom-40 top-10 pointer-events-none z-0 overflow-hidden">
              {[
                { text: `+RM 4.15M`, left: '8%', delay: '0s', speed: '14s', color: 'text-emerald-500/35' },
                { text: `+8.2% BRAND`, left: '28%', delay: '4s', speed: '19s', color: 'text-indigo-400/25' },
                { text: `ESTATE DEMAND: 1.15x`, left: '52%', delay: '2s', speed: '16s', color: 'text-yellow-500/30' },
                { text: `LOAN RATE: 3.5%`, left: '75%', delay: '7s', speed: '21s', color: 'text-pink-500/20' },
                { text: `REVC: +RM 120/s`, left: '88%', delay: '5s', speed: '13s', color: 'text-emerald-400/35' }
              ].map((ticker, index) => (
                <div
                  key={`ticker-${index}`}
                  className={`absolute font-mono text-[9px] font-black uppercase tracking-widest ${ticker.color}`}
                  style={{
                    left: ticker.left,
                    bottom: '0px',
                    animation: `floatUpAndAway ${ticker.speed} linear infinite`,
                    animationDelay: ticker.delay
                  }}
                >
                  {ticker.text}
                </div>
              ))}
            </div>

            {/* Kuala Lumpur Building Blocks (Sleek CSS Silhouette overlay) */}
            <div 
              className="absolute inset-x-0 bottom-0 h-44 pointer-events-none z-0 opacity-15 flex items-end justify-between px-6"
              style={{ animation: 'horizonFloat 12s ease-in-out infinite' }}
            >
              <div className="w-10 h-28 bg-gradient-to-t from-zinc-950 to-zinc-900 border-t border-x border-zinc-800 rounded-t-sm" />
              <div className="w-14 h-36 bg-gradient-to-t from-zinc-950 to-zinc-900 border-t border-x border-zinc-800 rounded-t-sm relative">
                <div className="absolute top-4 left-3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" />
              </div>

              {/* KL Twin Towers representation */}
              <div className="flex items-end gap-1.5 mx-auto">
                <div className="w-8 h-40 bg-zinc-900 border-t border-x border-zinc-800 rounded-t-sm relative flex flex-col justify-between p-0.5">
                  <div className="w-full h-1 bg-indigo-500/30" />
                  <div className="w-full h-1 bg-indigo-500/30" />
                  <div className="w-full h-1 bg-indigo-500/30" />
                </div>
                {/* Sky Bridge */}
                <div className="w-6 h-1.5 bg-zinc-800 border border-zinc-700 -mb-28 z-10" />
                <div className="w-8 h-40 bg-zinc-900 border-t border-x border-zinc-800 rounded-t-sm relative flex flex-col justify-between p-0.5">
                  <div className="w-full h-1 bg-indigo-500/30" />
                  <div className="w-full h-1 bg-indigo-500/30" />
                  <div className="w-full h-1 bg-indigo-500/30" />
                </div>
              </div>

              <div className="w-12 h-32 bg-gradient-to-t from-zinc-950 to-zinc-900 border-t border-x border-zinc-800 rounded-t-sm" />
              <div className="w-9 h-24 bg-gradient-to-t from-zinc-950 to-zinc-900 border-t border-x border-zinc-800 rounded-t-sm" />
            </div>

            {/* High speed neon traffic strip */}
            <div className="absolute bottom-6 inset-x-0 h-0.5 pointer-events-none z-0 overflow-hidden opacity-30">
              <div 
                className="w-48 h-full bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500"
                style={{ animation: 'trafficStream 4s linear infinite' }}
              />
              <div 
                className="w-36 h-full bg-gradient-to-r from-transparent via-rose-500 to-amber-500"
                style={{ animation: 'trafficStream 6s linear infinite', animationDelay: '2s' }}
              />
            </div>

            {/* Top Row Header controls */}
            <div className="z-10 flex justify-between max-w-5xl mx-auto w-full items-center">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="uppercase font-bold tracking-wider">{language === 'en' ? "Sim Grid Central" : "商赛仿真网络"}</span>
              </div>
              
              <button
                onClick={handleLanguageToggle}
                className="cursor-pointer flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-850 hover:scale-105 border border-zinc-800/80 px-4 py-2 rounded-xl font-black text-xs transition duration-150 text-emerald-400"
              >
                <span>🌐</span>
                <span>{language === 'en' ? "简体中文" : "English"}</span>
              </button>
            </div>

            {/* Core Brand & Form Container */}
            <div className="z-10 max-w-md w-full mx-auto my-auto space-y-7 flex flex-col items-center">
              
              {/* Brand Header */}
              <div className="text-center space-y-3.5">
                {/* Logo with pulsing shadow */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-indigo-600 border border-emerald-400/40 flex items-center justify-center font-black text-2xl text-black shadow-2xl shadow-emerald-500/25 mx-auto">
                  EB
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-black tracking-tight text-white uppercase sm:text-4xl">
                    {language === 'en' ? "EcoBiz Simulator" : "大马商赛人生大亨"}
                  </h1>
                  <p className="text-[10px] text-emerald-400 tracking-widest uppercase font-mono font-black">
                    {language === 'en' ? "Urban Real-Estate & Corporate Empire" : "地产营造 · 主业晋升 · 企业智脑托管系统"}
                  </p>
                </div>
              </div>

              {/* Character custom name config */}
              <div className="w-full bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/85 rounded-2xl p-4.5 space-y-3 shadow-inner">
                <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block font-mono">
                  👤 {language === 'en' ? "Establish Character Identity" : "注册主角工商执照（可留空随机）"}
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={playerNameInput}
                  onChange={(e) => setPlayerNameInput(e.target.value)}
                  placeholder={language === 'en' ? "Enter corporate founder name..." : "输入主理人中文或外语姓名 (例: Haris)"}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-150"
                  onClick={() => playAudioBeep('coin')}
                />
              </div>

              {/* Main Action Blueprints Column */}
              <div className="w-full flex flex-col gap-2.5">
                
                {/* 1. Resume playing (If save detected) */}
                {hasSaveFile && (
                  <button
                    id="continue-adventure-btn"
                    onClick={() => {
                      playAudioBeep('levelup');
                      setGameState('playing');
                    }}
                    className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-500 active:translate-y-0.5 text-black hover:scale-[1.02] py-3.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
                  >
                    <span>🏡</span>
                    <span>{language === 'en' ? "Resume Commercial Empire" : "载入云端商业存档 (继续征途)"}</span>
                  </button>
                )}

                {/* 2. Start game */}
                <button
                  id="start-fresh-adventure-btn"
                  onClick={() => {
                    playAudioBeep('coin');
                    setGameState('loading');
                  }}
                  className={`w-full cursor-pointer hover:scale-[1.02] active:translate-y-0.5 py-3.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    hasSaveFile
                      ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-200'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-lg shadow-emerald-950/20'
                  }`}
                >
                  <span>🚀</span>
                  <span>{language === 'en' ? "Incorporate New Dynasty" : "创设崭新公司 (白手起家)"}</span>
                </button>

                {/* 3. Horizontal Grid of submenus (Settings, Leaderboard, Feedback) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  
                  {/* Settings modal trigger */}
                  <button
                    onClick={() => {
                      playAudioBeep('coin');
                      setShowSettings(true);
                    }}
                    className="cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-850 py-2.5 rounded-xl font-bold font-mono tracking-wider text-[10px] text-zinc-400 hover:text-zinc-200 uppercase transition flex items-center justify-center gap-1.5"
                  >
                    <span>⚙️</span>
                    <span>{language === 'en' ? "Settings" : "齿轮设置"}</span>
                  </button>

                  {/* Leaderboard trigger */}
                  <button
                    onClick={() => {
                      playAudioBeep('coin');
                      setShowLeaderboard(true);
                    }}
                    className="cursor-pointer bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-850 py-2.5 rounded-xl font-bold font-mono tracking-wider text-[10px] text-zinc-400 hover:text-yellow-500 uppercase transition flex items-center justify-center gap-1.5"
                  >
                    <span>🏆</span>
                    <span>{language === 'en' ? "Rich List" : "财富榜"}</span>
                  </button>
                </div>

                {/* Direct quick feedback link */}
                <button
                  onClick={() => {
                    playAudioBeep('coin');
                    setShowSettings(true);
                  }}
                  className="mx-auto text-[9px] font-bold text-indigo-400/80 hover:text-indigo-400 hover:underline transition-all flex items-center gap-1 uppercase font-mono tracking-wide"
                >
                  <span>💡</span>
                  <span>{language === 'en' ? "Send Bug Report or Suggesion" : "提交创意点子与机型BUG"}</span>
                </button>
              </div>

            </div>

            {/* Bottom Brand signature */}
            <div className="z-10 text-center text-[9px] text-zinc-650 font-mono tracking-widest uppercase">
              © {new Date().getFullYear()} ECOBIZ SIMULATION · {language === 'en' ? "Kuala Lumpur Tech Incubator v2.1" : "吉隆坡科技港孵化计划 · 仿真2.1特供版"}
            </div>
          </motion.div>
        )}

        {gameState === 'loading' && (
          <motion.div
            id="loading-sim-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 select-none font-sans relative overflow-hidden"
          >
            {/* Background cyber radial grid */}
            <div className="absolute inset-0 bg-[#020205] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-zinc-950 to-black opacity-90 z-0" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#090d16_1px,transparent_1px),linear-gradient(to_bottom,#090d16_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 z-0" />

            <div className="max-w-md w-full space-y-7 flex flex-col items-center z-10">
              
              {/* Spinner & Brand Icon Combo */}
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-900 border-t-emerald-400 border-r-indigo-500 animate-spin" style={{ animationDuration: '0.8s' }} />
                <span className="font-mono text-xs font-black text-zinc-550">KL-SYS</span>
              </div>
              
              <div className="text-center space-y-1.5">
                <div className="text-[10px] text-emerald-400 font-mono uppercase font-black tracking-widest leading-none">
                  {language === 'en' ? "CALIBRATING URBAN SPATIAL CORE" : "大马城市级商业仿真栅格校准..."}
                </div>
                <div className="text-2xl font-black text-zinc-100 font-mono tracking-tight leading-none mt-1">
                  {loadingProgress}%
                </div>
              </div>

              {/* High precision Progress Bar */}
              <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full transition-all duration-100"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>

              {/* Current Active Step text */}
              <p className="text-[11px] text-zinc-400 text-center font-black font-mono min-h-[2.5rem] tracking-wide animate-pulse">
                &gt;&nbsp;{loadingMessage}
              </p>

              {/* DETAILED HIGH-FIDELITY ALLOCATION CHECKLIST */}
              <div className="w-full bg-zinc-900/50 border border-zinc-850 rounded-2xl p-4 space-y-2.5 text-[10px] font-mono text-zinc-500">
                <span className="text-[9px] uppercase font-bold text-zinc-650 block tracking-wider">💾 Bootstrap Pipelines Status / 系统引导指标</span>
                
                <div className="space-y-1.5">
                  {[
                    { threshold: 18, label_en: "Venture Financing backing reserves", label_zh: "吉隆坡风投资本储备整合" },
                    { threshold: 38, label_en: "Kuala Lumpur real-estate registries", label_zh: "大马核心地契、不动产生态链" },
                    { threshold: 58, label_en: "Multiplayer neural-rival vectors", label_zh: "世界百亿富豪智能体竞争向量" },
                    { threshold: 78, label_en: "Corporate automation localizers", label_zh: "AI智能自动驾驶托管策略装配" },
                    { threshold: 92, label_en: "Bionic dual-channel audio player", label_zh: "正弦交互音频、多语言自校正" }
                  ].map((item, idx) => {
                    const loaded = loadingProgress >= item.threshold;
                    return (
                      <div key={`boot-step-${idx}`} className="flex justify-between items-center bg-zinc-950/40 p-1.5 px-2.5 rounded-lg border border-zinc-900/60">
                        <span className={`font-bold ${loaded ? 'text-zinc-300' : 'text-zinc-650'}`}>
                          {language === 'en' ? item.label_en : item.label_zh}
                        </span>
                        <span>
                          {loaded ? (
                            <span className="text-emerald-400 font-bold tracking-wider uppercase bg-emerald-950/40 border border-emerald-900/30 text-[8px] px-1.5 py-0.5 rounded">ONLINE</span>
                          ) : (
                            <span className="text-zinc-650 font-bold uppercase text-[8px]">WAIT</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {gameState === 'intro' && (
          <motion.div
            id="intro-character-dream-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 select-none font-sans antialiased relative overflow-hidden"
          >
            {/* Radial Ambient Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-950/40 via-zinc-950 to-black z-0" />
            
            {/* Top Spacer */}
            <div className="z-10 max-w-5xl mx-auto w-full flex justify-between items-center pb-4 border-b border-zinc-900">
              <span className="text-xs font-bold text-zinc-500 font-mono uppercase">
                {language === 'en' ? "CHARACTER STARTUP ORIGIN" : "大亨创业理想前置选择"}
              </span>
              <span className="text-xs text-yellow-500 font-black">
                {playerNameInput || (language === 'en' ? "Haris" : "拼搏先锋")}
              </span>
            </div>

            {/* Narrative & Card grid */}
            <div className="z-10 max-w-4xl w-full mx-auto my-auto space-y-8 py-6">
              <div className="text-center space-y-3.5 max-w-xl mx-auto">
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl uppercase">
                  {language === 'en' ? "Select Your Venture Path" : "选择属于你的商业帝国宿命"}
                </h2>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  {language === 'en' 
                    ? "Saddled with RM 10,000 student tuition lease outlays, you sit inside a small micro room and open a dusty scrap computer. It's time to choose which startup domain to conquer!" 
                    : "背负着庞大的学费债务，你缩在吉隆坡廉价隔断单间，缓缓翻开了布满尘埃的组装笔记本电脑。改变命运的商业杠杆已经成熟，请确定你最擅长的商战方向："}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "tech",
                    icon: "📡",
                    title_en: "Tech & SaaS Prodigy",
                    title_zh: "黑科技AI独角兽",
                    desc_en: "Launch software servers, artificial intelligence frameworks, and corporate SaaS. High margins and rapid technology leaps.",
                    desc_zh: "设计前沿AI逻辑，创办人工智能软件公司。通过高毛利的软件和云服务席卷大马，科技沉淀速度飙升！",
                    perks_en: ["🔑 Code Standard Laptop", "🔥 Start Coding Skill: Lvl 10", "⭐ Technology R&D rate +20%"],
                    perks_zh: ["🔑 免费获赠：标准办公电脑 1 台", "🔥 初始编程技能直接升级：Lvl 10", "⭐ 永久加成：科技研发进展速率乘数 +20%"],
                    color: "hover:border-indigo-500 hover:shadow-indigo-950/20 border-zinc-800 bg-zinc-900/60"
                  },
                  {
                    id: "retail",
                    icon: "🏬",
                    title_en: "Digital Franchise Mogul",
                    title_zh: "连锁数码新零售巨鳄",
                    desc_en: "Build physical retail centers, organic dining hubs, and global supply chains. High customer demands and brand leverage.",
                    desc_zh: "打通零售供货，开展全渠道大马百货。利用微博和社交社群裂变吸粉，极速做大出货容量与交易红利！",
                    perks_en: ["💰 Ready Capital: $1,500 cash", "🔥 Negotiation Skill: Lvl 10", "⭐ Daily Brand Awareness gains +15%"],
                    perks_zh: ["💰 初始现金补贴：$1,500 马币", "🔥 初始谈判技能直接升级：Lvl 10", "⭐ 永久加成：品牌传播心智占领乘数 +15%"],
                    color: "hover:border-yellow-500 hover:shadow-yellow-950/20 border-zinc-800 bg-zinc-900/60"
                  },
                  {
                    id: "estate",
                    icon: "🏢",
                    title_en: "Real Estate Zoning Lord",
                    title_zh: "城市建筑地皮租约大亨",
                    desc_en: "Acquire downtown regional grid zones, develop grand villas / skyscrapers, and claim rental deposits.",
                    desc_zh: "极速置办低息地皮，对土地物权进行超级爆改开发！通过短周期 lease 租契租金，建立稳健的巨额被动现金流！",
                    perks_en: ["🔥 Construction Skill: Lvl 10", "🔑 Unlock Housing Foundation free", "⭐ Build time discount -20%"],
                    perks_zh: ["🔥 初始理城建筑技能直接升级：Lvl 10", "🔑 获得置业税费一次性豁免", "⭐ 永久加成：营造建造耗时缩短 20%且租契期更稳健"],
                    color: "hover:border-emerald-500 hover:shadow-emerald-950/20 border-zinc-800 bg-zinc-900/60"
                  }
                ].map((path) => {
                  const active = dreamPath === path.id;
                  return (
                    <button
                      key={path.id}
                      id={`dream-path-btn-${path.id}`}
                      onClick={() => setDreamPath(path.id as any)}
                      className={`text-left p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 cursor-pointer active:translate-y-0.5 outline-none relative overflow-hidden ${path.color} ${
                        active ? 'ring-2 ring-emerald-500 border-zinc-800 bg-zinc-900 shadow-xl' : ''
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-3xl">{path.icon}</span>
                          {active && (
                            <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded uppercase leading-none block">
                              {language === 'en' ? "Selected" : "已选定这一理想"}
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-md font-extrabold text-white">
                            {language === 'en' ? path.title_en : path.title_zh}
                          </h3>
                          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                            {language === 'en' ? path.desc_en : path.desc_zh}
                          </p>
                        </div>

                        {/* Skill perks panel */}
                        <div className="space-y-1 bg-zinc-950/80 p-3 rounded-xl border border-zinc-900 text-[10px] text-zinc-400 font-mono">
                          {(language === 'en' ? path.perks_en : path.perks_zh).map((perk, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-black">✔</span>
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Game Action */}
            <div className="z-10 max-w-lg w-full mx-auto flex flex-col gap-3 items-center">
              <button
                id="confirm-dream-confirm-btn"
                disabled={dreamPath === 'none'}
                onClick={() => {
                  if (dreamPath !== 'none') {
                    handleExecuteStartFresh(playerNameInput, dreamPath);
                    setGameState('playing');
                  }
                }}
                className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none active:translate-y-0.5 text-black py-4 rounded-xl text-xs font-black shadow-xl tracking-widest uppercase transition-all flex items-center justify-center gap-2 animate-bounce"
              >
                <span>✨</span>
                <span>{language === 'en' ? "Claim Dream & Start Simulating" : "激活这一理想规划 · 开启逆袭人生"}</span>
              </button>
              
              <button
                onClick={() => setGameState('menu')}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase transition block cursor-pointer"
              >
                {language === 'en' ? "← Return to Main Title Screen" : "← 返回主选单重新起名"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {gameState === 'playing' && (
        <div id="active-playing-viewport" className="contents">
          {/* 1. Global top HUD banner stats bar */}
          <StatsBar
            stats={stats}
            language={language}
            onLanguageToggle={handleLanguageToggle}
            onAdvanceDay={handleAdvanceDay}
            isProcessing={isProcessing}
          />

          <div className="max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
            {/* LEFT COLUMN: PRIMARY INTERACTIVE SCREENS CONTROL TABS (8 columns or full wide) */}
            <div id="game-operations-stage" className="lg:col-span-8 space-y-6">
          
          {/* TUTORIAL ONBOARDING HUD GUIDE */}
          {stats.tutorialStep !== undefined && stats.tutorialStep < 6 && (
            <div id="tutorial-hud-guide" className="bg-gradient-to-r from-yellow-950/40 via-zinc-900 to-yellow-950/40 border-2 border-yellow-850/60 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-400 text-black font-black rounded-lg text-lg animate-bounce shrink-0 shadow-lg select-none">
                  ➜ 
                </div>
                <div>
                  <div className="text-[10px] uppercase font-black tracking-wider text-yellow-500 font-mono">
                    {language === 'en' ? "ACTIVE TUTORIAL GOAL" : "当前拓展任务"}
                  </div>
                  <h4 className="text-sm font-extrabold text-zinc-100 mt-0.5">
                    {stats.tutorialStep === 0 && (language === 'en' ? "Earn first RM100 (Total Cash >= RM1,100)" : "🎯 新手 1：打工兼职或跑腿，积累总资金至 RM1,100")}
                    {stats.tutorialStep === 1 && (language === 'en' ? "前去‘求学’就读短期班，积累第一个技能学分" : "🎯 新手 2：前往“学堂求学”或打工，拥有任意自修学识经历")}
                    {stats.tutorialStep === 2 && (language === 'en' ? "购置首辆通勤载具 或 注册你的自主公司" : "🎯 新手 3：配置 1 辆代步载具（车房购置）或出资注册成立公司")}
                    {stats.tutorialStep === 3 && (language === 'en' ? "前往‘企业’正式工商申请公司执照" : "🎯 新手 4：前去‘私人企业’，申请合规公司工商注册")}
                    {stats.tutorialStep === 4 && (language === 'en' ? "在企业面板雇佣第一位精英骨干员工" : "🎯 新手 5：招聘至少 1 位在职员工骨干，让财富自动化")}
                    {stats.tutorialStep === 5 && (language === 'en' ? "拍得首块核心黄金地产地皮，开启帝国版图" : "🎯 新手 6：前往房产投资，购得名下第一块大马土地地皮")}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    {stats.tutorialStep === 0 && (language === 'en' ? "Current Cash: " + stats.money + " / RM1100" : "目前进度：手头当前马币资金为 RM " + stats.money.toLocaleString() + " / 达成线 1,100")}
                    {stats.tutorialStep === 1 && (language === 'en' ? "Degree experience logged" : "目前进度：点击主屏顶部‘精英校区’就读短期商业夜校课")}
                    {stats.tutorialStep === 2 && (language === 'en' ? "Commuter asset check: " + stats.ownedVehicles.length : "目前进度：在‘生活车库’中买辆单车或汽车，或注册开立公司")}
                    {stats.tutorialStep === 3 && (language === 'en' ? "Corporate licensing review" : "目前进度：点击‘私人企业’，注入资金并起草您的首家合规大马大牌")}
                    {stats.tutorialStep === 4 && (language === 'en' ? "Hired Employees: " + (company.employees || []).length : "目前进度：点击私人企业 -> 在中间‘招募团队’雇佣第一人代管运营")}
                    {stats.tutorialStep === 5 && (language === 'en' ? "Purchased Land plots: " + plots.filter(p => p.isPurchased).length : "目前进度：前往‘房产投资’大厅，拥有吉隆坡第一块升值土地物权")}
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex text-right shrink-0 flex-col items-end gap-1">
                <span className="text-[10px] bg-yellow-400/10 text-yellow-500 border border-yellow-700/60 px-2 py-0.5 rounded-full font-bold">
                  {language === 'en' ? "REWARD SUBSIDY" : "通关补助"}
                </span>
                <span className="font-mono text-sm text-yellow-400 font-extrabold">
                  {stats.tutorialStep === 0 && "+RM150"}
                  {stats.tutorialStep === 1 && "+RM300"}
                  {stats.tutorialStep === 2 && "+RM500"}
                  {stats.tutorialStep === 3 && "+RM800"}
                  {stats.tutorialStep === 4 && "+RM1,200"}
                  {stats.tutorialStep === 5 && "+RM2,000"}
                </span>
              </div>
            </div>
          )}

          {/* Main Visual tab labels block */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-2 shrink-0">
            <div id="navigation-tabs-strip" className="flex overflow-x-auto gap-2 scrollbar-none shrink-0 bg-transparent flex-1 select-none">
              {[
                { id: "life", icon: <Heart size={16} />, en: "Life & Garage", zh: "生活车库" },
                { id: "school", icon: <GraduationCap size={16} />, en: "Elite School", zh: "精英校区" },
                { id: "career", icon: <Briefcase size={16} />, en: "Career Market", zh: "求职深造" },
                { id: "company", icon: <Building2 size={16} />, en: "Company Panel", zh: "私人企业" },
                { id: "finance", icon: <TrendingUp size={16} />, en: "Finance & Rivals", zh: "金融理财" },
                { id: "estate", icon: <Home size={16} />, en: "Land & Houses", zh: "房产投资" },
                { id: "missions", icon: <Award size={16} />, en: "Achievements", zh: "个人里程" },
                { id: "autopilot", icon: <Cpu size={16} />, en: "AI Autopilot", zh: "智脑AI托管" },
                { id: "launchpad", icon: <Rocket size={16} />, en: "App Store Launchpad", zh: "应用上架发行" }
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-semibold text-xs transition-all cursor-pointer whitespace-nowrap active:translate-y-0.5 ${
                      active 
                        ? 'bg-emerald-600 text-black border-emerald-600 shadow-md shadow-emerald-950/10' 
                        : 'bg-zinc-900 border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab.icon}
                    <span>{language === 'en' ? tab.en : tab.zh}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Access Action triggers for settings & global highscores */}
            <div className="flex items-center gap-2 shrink-0 font-mono select-none self-end md:self-auto">
              {/* Rich List */}
              <button
                onClick={() => {
                  playAudioBeep('coin');
                  setShowLeaderboard(true);
                }}
                className="bg-zinc-900 border border-zinc-800 hover:border-yellow-650 hover:bg-zinc-850 text-yellow-500 px-3.5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 cursor-pointer uppercase transition-all duration-150 active:translate-y-0.5"
              >
                <span>🏆</span>
                <span>{language === 'en' ? "Leaderboard" : "世界财富榜"}</span>
              </button>

              {/* Settings and controls */}
              <button
                onClick={() => {
                  playAudioBeep('coin');
                  setShowSettings(true);
                }}
                className="bg-zinc-900 border border-zinc-800 hover:border-zinc-750 hover:bg-zinc-850 text-zinc-300 px-3.5 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 cursor-pointer uppercase transition-all duration-150 active:translate-y-0.5"
              >
                <span>⚙️</span>
                <span>{language === 'en' ? "Settings" : "控制面板"}</span>
              </button>
            </div>
          </div>

          {/* ACTIVE CONTENT VIEW PANEL RENDERS */}
          <div id="interactive-content-stage">
            {activeTab === "life" && (
              <LifePanel
                stats={stats}
                language={language}
                studyingProg={studyingProg}
                onStudySeminars={handleStudySeminars}
                onEnrollDegree={handleEnrollDegree}
                onEatFood={handleEatFood}
                onHospitalCheckup={handleHospitalCheckup}
                onBuyVehicle={handleBuyVehicle}
                onSelectVehicle={handleSelectVehicle}
                onActiveSideGig={handleActiveSideGig}
              />
            )}

            {activeTab === "school" && (
              <SchoolPanel
                stats={stats}
                language={language}
                studyingProg={studyingProg}
                onEnrollDegree={handleEnrollDegree}
                onBuyTextbook={handleBuyTextbook}
                onApplyScholarship={handleApplyScholarship}
                onTriggerRewardAd={triggerRewardAd}
                onSkipStudyDay={handleSkipStudyDay}
              />
            )}

            {activeTab === "career" && (
              <CareerPanel
                stats={stats}
                language={language}
                onApplyJob={handleApplyJob}
                onResign={handleResign}
              />
            )}

            {activeTab === "company" && (
              <CompanyPanel
                company={company}
                stats={stats}
                language={language}
                onRegisterCompany={handleRegisterCompany}
                onHireEmployee={handleHireEmployee}
                onFireEmployee={handleFireEmployee}
                onAdjustBudgets={handleAdjustBudgets}
                onInjectCapital={handleInjectCompanyCapital}
                onWithdrawCapital={handleWithdrawCompanyCapital}
                availableCandidates={candidates}
                onRecruitPartner={handleRecruitPartner}
                onUpgradeCorporateCategory={handleUpgradeCorporateCategory}
              />
            )}

            {activeTab === "finance" && (
              <FinancePanel
                stats={stats}
                language={language}
                rivals={rivals}
                playerNetWorth={playerNetWorth}
                ownCompanyValuation={ownCompanyValuation}
                ownCompanySharesPercentage={ownCompanySharesPercentage}
                ownCompanyName={company.name}
                ownCompanySector={company.type}
                onBuyStock={handleBuyStock}
                onSellStock={handleSellStock}
                onTradeOwnCompanyShares={handleTradeOwnCompanyShares}
                onBankDeposit={handleBankDeposit}
                onBankWithdraw={handleBankWithdraw}
                onBankBorrow={handleBankBorrow}
                onBankRepay={handleBankRepay}
                onConnectFriendCode={handleConnectFriendCode}
                onAddCustomFriend={handleAddCustomFriend}
                onWireCashToFriend={handleWireCashToFriend}
                onFundDream={handleFundDream}
              />
            )}

            {activeTab === "estate" && (
              <RealEstatePanel
                plots={plots}
                stats={stats}
                language={language}
                onBuyLand={handleBuyLand}
                onBuildBlueprint={handleBuildBlueprint}
                onRenovateHouse={handleRenovateHouse}
                onBuyFurniture={handleBuyFurniture}
                onToggleRent={handleToggleRent}
              />
            )}

            {activeTab === "missions" && (
              <MissionsPanel
                missions={missions}
                stats={stats}
                language={language}
                playerNetWorth={playerNetWorth}
                onClaimDailyReward={handleClaimDailyReward}
                onPrestigeRebirth={handlePrestigeRebirth}
                onTriggerRewardAd={triggerRewardAd}
                playAudioBeep={playAudioBeep}
              />
            )}

            {activeTab === "autopilot" && (
              <AutopilotPanel
                stats={stats}
                language={language}
                autopilotEnabled={autopilotEnabled}
                autopilotSettings={autopilotSettings}
                friendVentures={friendVentures}
                onToggleAutopilot={(enabled) => setAutopilotEnabled(enabled)}
                onUpdateSettings={(newSettings) => setAutopilotSettings(newSettings)}
                onInvestInFriend={() => {}}
                onCashOutFriend={() => {}}
                appendLog={appendLog}
                setStats={setStats}
                setFriendVentures={setFriendVentures}
              />
            )}

            {activeTab === "launchpad" && (
              <LaunchpadPanel
                stats={stats}
                company={company}
                plots={plots}
                language={language}
                onUpdateStats={setStats}
                onUpdateCompany={setCompany}
                appendLog={appendLog}
                playAudioBeep={playAudioBeep}
              />
            )}
          </div>
        </div>


        {/* RIGHT COLUMN: CORE RUNTIME SYSTEM CONSOLE LOGS & DIAGNOSTICS (4 columns) */}
        <div id="game-terminal-sidebar" className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4 self-stretch flex flex-col justify-between">
          <div className="space-y-4">
            {/* Console Header */}
            <div className="border-b border-zinc-800 pb-3 flex justify-between items-center select-none">
              <h3 className="text-sm font-black text-zinc-100 uppercase tracking-tight flex items-center gap-1.5">
                <FileText size={16} className="text-emerald-400 shrink-0" />
                <span>{t.logHistory}</span>
              </h3>
              
              <button
                id="reset-whole-game-btn"
                onClick={handleResetGameData}
                title={language === 'en' ? 'Wipe Saved Game' : '重组并重置游戏存储数据'}
                className="cursor-pointer bg-zinc-950 hover:bg-red-950 hover:text-red-300 p-1 rounded border border-zinc-850 hover:border-red-900 text-zinc-500 transition"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Filter tags tabs */}
            <div className="flex gap-1.5 overflow-x-auto select-none sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label_en: 'All', label_zh: '全部' },
                { id: 'info', label_en: 'Info', label_zh: '系统' },
                { id: 'event', label_en: 'Events', label_zh: '决策' },
                { id: 'success', label_en: 'Wins', label_zh: '喜讯' }
              ].map((flt) => (
                <button
                  key={flt.id}
                  id={`log-filter-${flt.id}`}
                  onClick={() => setLogFilter(flt.id as any)}
                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold cursor-pointer border transition ${
                    logFilter === flt.id 
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-100' 
                      : 'bg-zinc-950 text-zinc-500 border-zinc-850 hover:border-zinc-700'
                  }`}
                >
                  {language === 'en' ? flt.label_en : flt.label_zh}
                </button>
              ))}
            </div>

            {/* Logs render viewport list */}
            <div id="terminal-screen-wrapper" className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 h-[340px] overflow-y-auto space-y-3 font-mono text-xs shadow-inner">
              {filteredLogs.length === 0 ? (
                <div className="text-zinc-600 text-center py-10 font-sans">{t.noHistory}</div>
              ) : (
                filteredLogs.map((log) => {
                  let textCol = "text-zinc-400";
                  let tagBadge = "SYS";
                  let bgBadge = "bg-zinc-900 text-zinc-400";

                  if (log.type === 'success') {
                    textCol = "text-emerald-400";
                    tagBadge = "WIN";
                    bgBadge = "bg-emerald-950/50 text-emerald-300 border border-emerald-900/40";
                  } else if (log.type === 'event') {
                    textCol = "text-yellow-300 font-semibold";
                    tagBadge = "EVT";
                    bgBadge = "bg-yellow-950/40 text-yellow-300 border border-yellow-900/30";
                  } else if (log.type === 'error') {
                    textCol = "text-red-400";
                    tagBadge = "ERR";
                    bgBadge = "bg-red-950/50 text-red-300 border border-red-900/30";
                  }

                  return (
                    <div key={log.id} id={`log-item-${log.id}`} className="space-y-1 py-1.5 border-b border-zinc-900/60 leading-relaxed">
                      <div className="flex items-center justify-between select-none">
                        <span className="text-[10px] text-zinc-500">Day {log.day}</span>
                        <span className={`text-[9px] font-extrabold px-1 py-0.2 rounded font-sans uppercase leading-none ${bgBadge}`}>
                          {tagBadge}
                        </span>
                      </div>
                      <p className={`text-xs ${textCol}`}>
                        {language === 'en' ? log.text_en : log.text_zh}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Help Guide Bottom block */}
          <div id="quick-help-sheet" className="p-3 bg-zinc-950/50 border border-zinc-850 rounded-xl mt-4 select-none">
            <div className="flex items-start gap-2">
              <Info className="text-emerald-500 shrink-0 mt-0.5" size={14} />
              <div className="space-y-0.5 text-[10.5px] leading-relaxed text-zinc-400 select-none">
                <span className="font-bold text-zinc-300 block">{t.helpTips}</span>
                <p>{t.helpDesc}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. Interactive Choice-Driven Decision Event Modal popup overlay */}
      <EventsModal
        event={activeEvent}
        language={language}
        stats={stats}
        company={company}
        plots={plots}
        onResolve={handleResolveEvent}
      />

      {/* 3. Level-up & Tutorial Accomplishment Overlay Modal */}
      {activeLevelUpModal && activeLevelUpModal.show && (
        <div id="tutorial-levelup-dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-zinc-950 border-4 border-yellow-500 rounded-3xl p-6 max-w-md w-full text-center relative shadow-2xl shadow-yellow-950/40 space-y-6"
          >
            {/* Ambient exploding visual elements */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              {[...Array(10)].map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 220, x: 0, opacity: 1, scale: 0.5 }}
                  animate={{ 
                    y: -100 - Math.random() * 200, 
                    x: -150 + Math.random() * 300, 
                    opacity: 0,
                    scale: 1 + Math.random() * 2
                  }}
                  transition={{ 
                    duration: 1.8 + Math.random() * 1.5, 
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                  className="absolute bottom-0 left-1/2 text-2xl"
                >
                  {['🪙', '✨', '💰', '👑', '🎉'][idx % 5]}
                </motion.div>
              ))}
            </div>

            <div className="space-y-2">
              <span className="block animate-bounce text-5xl">🏆</span>
              <h2 className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent">
                {language === 'en' ? "GOAL REACHED" : "开局任务 · 达标升级"}
              </h2>
              <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-zinc-100">
                {language === 'en' ? activeLevelUpModal.title_en : activeLevelUpModal.title_zh}
              </h3>
              <p className="max-h-40 overflow-y-auto text-xs leading-relaxed text-zinc-455 text-zinc-400">
                {language === 'en' ? activeLevelUpModal.desc_en : activeLevelUpModal.desc_zh}
              </p>
            </div>

            <div className="pt-2">
              <button
                id="close-levelup-modal-btn"
                onClick={() => {
                  playAudioBeep('coin');
                  setActiveLevelUpModal(null);
                }}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 py-3 text-sm font-black tracking-widest text-black uppercase shadow-lg shadow-yellow-950/20 transition active:translate-y-0.5 hover:from-yellow-400 hover:to-amber-500"
              >
                {language === 'en' ? "Claim Subsidy / 领补贴款" : "领取授信补贴 / Claim Rewards"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. Offline Income Idle Earnings Overlay Modal */}
      {offlineIncomeModal && offlineIncomeModal.show && (
        <div id="offline-income-dialog" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-zinc-950 border-4 border-emerald-500 rounded-3xl p-6 max-w-md w-full text-center relative shadow-2xl shadow-emerald-950/40 space-y-6"
          >
            <div className="space-y-2">
              <span className="block animate-pulse text-5xl">⏰</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-emerald-400">
                {language === 'en' ? "OFFLINE REVENUES" : "挂机代管 · 离线结算"}
              </h2>
              <p className="font-mono text-xs text-zinc-500">
                {language === 'en' 
                  ? `Offline duration: ${offlineIncomeModal.hours}h ${offlineIncomeModal.mins}m` 
                  : `离线打工时长：${offlineIncomeModal.hours} 小时 ${offlineIncomeModal.mins} 分钟`}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-850 bg-zinc-900 p-4">
              <span className="block text-xs text-zinc-400">{language === 'en' ? "Offline Profit Gathered:" : "累积托管创汇总利润:"}</span>
              <span className="mt-1 block font-mono text-3xl font-black text-emerald-400">
                RM {offlineIncomeModal.earnings.toLocaleString()}
              </span>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400">
              {language === 'en' 
                ? "Your offline businesses, automatic managers, or personal student work successfully gathered dividends." 
                : "在您暂时离开吉隆坡期间，名下的离线代管骨干、副业以及自动化团队运转开满负荷，创收了上述马币红利！"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                id="close-offline-modal-btn"
                onClick={() => {
                  playAudioBeep('coin');
                  triggerCoinShower();
                  setStats(prev => ({ ...prev, money: prev.money + offlineIncomeModal.earnings }));
                  setOfflineIncomeModal(null);
                  appendLog(
                    `[Offline Idle] Claimed base income of RM ${offlineIncomeModal.earnings.toLocaleString()} cash.`,
                    `【挂机代管】成功领取基础马币收益 RM ${offlineIncomeModal.earnings.toLocaleString()} 现款。`,
                    "success"
                  );
                }}
                className="w-full cursor-pointer rounded-2xl bg-zinc-800 border border-zinc-700 py-3 text-xs font-black tracking-wider text-zinc-300 uppercase hover:bg-zinc-700 transition"
              >
                {language === 'en' ? "Claim Base / 普通收取" : "普通领取现钞"}
              </button>
              <button
                id="claim-offline-double-btn"
                onClick={() => {
                  triggerRewardAd("x2_offline", () => {
                    playAudioBeep('achievement');
                    triggerCoinShower();
                    const doubled = offlineIncomeModal.earnings * 2;
                    setStats(prev => ({ ...prev, money: prev.money + doubled }));
                    setOfflineIncomeModal(null);
                    appendLog(
                      `[Offline Idle] Watch Ad Doubled! Claimed RM ${doubled.toLocaleString()} cash!`,
                      `【挂机代管】看广告喜获 200% 暴击！成功划拨双倍马币收益 RM ${doubled.toLocaleString()} 全额到账！`,
                      "success"
                    );
                  });
                }}
                className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 py-3 text-xs font-black tracking-wider text-black uppercase hover:shadow-lg hover:shadow-yellow-900/20 transition"
              >
                RM Double x2! 📺
              </button>
            </div>
          </motion.div>
        </div>
      )}
        </div>
      )}

      {showSettings && (
        <SettingsAndFeedbackModal
          stats={stats}
          company={company}
          plots={plots}
          language={language}
          onClose={() => setShowSettings(false)}
          onSaveGame={handleManualSave}
          onClearSaveGame={handleClearSaveGame}
          onImportSave={handleImportSave}
          onToggleLanguage={handleLanguageToggle}
          playAudioBeep={playAudioBeep}
          adPublisherId={stats.adPublisherId || ""}
          onUpdateAdPublisherId={(pubId) => setStats(prev => ({ ...prev, adPublisherId: pubId }))}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          language={language}
          playerNetWorth={playerNetWorth}
          playerName={stats.playerName || ""}
          rivals={rivals}
          onClose={() => setShowLeaderboard(false)}
          playAudioBeep={playAudioBeep}
        />
      )}

      {/* 12. Sponsor Simulated Reward Ad Player Overlay Dialog */}
      <AdPlayerModal
        show={adModalState.show}
        adType={adModalState.adType}
        adTag={adModalState.adTag}
        language={language}
        onAdCompleted={() => {
          setAdModalState(prev => ({ ...prev, show: false }));
          adModalState.callback();
        }}
        onClose={() => setAdModalState(prev => ({ ...prev, show: false }))}
        adPublisherId={stats.adPublisherId}
        onSimulateEarnings={(usd) => {
          setStats(prev => ({
            ...prev,
            totalRealAdRevenueSimulated: (prev.totalRealAdRevenueSimulated || 0) + usd
          }));
        }}
      />
    </>
  );
}
