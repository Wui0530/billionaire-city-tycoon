import React, { useState, useEffect } from "react";
import { 
  Rocket, 
  Smartphone, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Monitor, 
  Copy, 
  Tv, 
  Gift, 
  CheckSquare, 
  Clock, 
  Coins, 
  Flame 
} from "lucide-react";
import { PlayerStats, Company, LandPlot, Language } from "../types";

interface LaunchpadPanelProps {
  stats: PlayerStats;
  company: Company;
  plots: LandPlot[];
  language: Language;
  onUpdateStats: (updater: (prev: PlayerStats) => PlayerStats) => void;
  onUpdateCompany: (updater: (prev: Company) => Company) => void;
  appendLog: (textEn: string, textZh: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  playAudioBeep: (type: 'coin' | 'levelup' | 'achievement' | 'alert') => void;
}

export const LaunchpadPanel: React.FC<LaunchpadPanelProps> = ({
  stats,
  company,
  plots,
  language,
  onUpdateStats,
  onUpdateCompany,
  appendLog,
  playAudioBeep
}) => {
  // --- Developer Dashboard State ---
  const [isPublished, setIsPublished] = useState<boolean>(() => {
    const cached = localStorage.getItem("launchpad_is_published");
    return cached === "true";
  });
  const [installs, setInstalls] = useState<number>(() => {
    const cached = localStorage.getItem("launchpad_installs");
    return cached ? parseInt(cached, 10) : 0;
  });
  const [activeDaus, setActiveDaus] = useState<number>(() => {
    const cached = localStorage.getItem("launchpad_active_daus");
    return cached ? parseInt(cached, 10) : 0;
  });
  const [accruedAdRoyalties, setAccruedAdRoyalties] = useState<number>(0);
  const [starterPackBought, setStarterPackBought] = useState<boolean>(() => {
    return localStorage.getItem("launchpad_starter_bought") === "true";
  });

  // --- Icon Creator Config ---
  const [iconText, setIconText] = useState<string>("BC");
  const [iconTheme, setIconTheme] = useState<'emerald' | 'gradient' | 'cyberpunk' | 'classic'>('gradient');
  const [iconBadge, setIconBadge] = useState<boolean>(true);

  // --- Sub-Tab Option (Studio Dashboard vs Google Play Store vs AdMob Monetization) ---
  const [subTab, setSubTab] = useState<'console' | 'store' | 'monetize'>('console');

  // --- AdMob Placement Overlay ---
  const [adOverlayOpen, setAdOverlayOpen] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(0);
  const [adAdvertId, setAdAdvertId] = useState<number>(0);

  // --- AAB Upload compiler flow state ---
  const [releaseProgress, setReleaseProgress] = useState<number>(0);
  const [releaseState, setReleaseState] = useState<'idle' | 'building' | 'signed' | 'uploading' | 'review' | 'success'>(() => {
    const cached = localStorage.getItem("launchpad_release_state");
    return (cached as any) || 'idle';
  });
  const [stepTimerId, setStepTimerId] = useState<any>(null);

  // --- SEO Store description generator states ---
  const [seoCopySuccess, setSeoCopySuccess] = useState<boolean>(false);

  // Auto Tick Developer Install growth and daily Ad revenues once Published!
  useEffect(() => {
    if (!isPublished) return;

    const interval = setInterval(() => {
      // Natural compounding install growth
      setInstalls(prev => {
        const next = prev + Math.floor(Math.random() * 8) + 1;
        localStorage.setItem("launchpad_installs", next.toString());
        return next;
      });

      // Fluctuate Daily Active Users based on installs
      setActiveDaus(prev => {
        const newDau = Math.floor(installs * 0.12) + Math.floor(Math.random() * 15);
        localStorage.setItem("launchpad_active_daus", newDau.toString());
        return newDau;
      });

      // Earn royalty credits tick by tick
      const royaltyEarning = Math.round((activeDaus / 300) + 1);
      if (royaltyEarning > 0) {
        setAccruedAdRoyalties(prev => prev + royaltyEarning);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isPublished, installs, activeDaus]);

  // Handle saving published traits
  useEffect(() => {
    localStorage.setItem("launchpad_is_published", isPublished ? "true" : "false");
    localStorage.setItem("launchpad_release_state", releaseState);
  }, [isPublished, releaseState]);

  // Claim accrued Passive royalties
  const handleClaimAdRoyalties = () => {
    if (accruedAdRoyalties <= 0) return;
    const amount = accruedAdRoyalties;
    onUpdateStats(prev => ({ ...prev, money: prev.money + amount }));
    setAccruedAdRoyalties(0);
    playAudioBeep('coin');
    appendLog(
      `Claimed Developer Passive Royalties: Received +$${amount} from Worldwide Google Play installs.`,
      `提取开发者 passive 收益：从 Google Play 全球广告分账中成功套现 +$${amount} 大洋到个人余额中！`,
      "success"
    );
  };

  // Trigger Google AdMob reward ad simulator
  const handleWatchRewardAd = () => {
    playAudioBeep('coin');
    setAdAdvertId(Math.floor(Math.random() * 3));
    setAdCountdown(6); // 6 Sec simulated interactive ad
    setAdOverlayOpen(true);

    const timer = setInterval(() => {
      setAdCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Ad completed reward!
          setAdOverlayOpen(false);
          onUpdateStats(prevStats => ({ ...prevStats, money: prevStats.money + 12000 }));
          playAudioBeep('levelup');
          appendLog(
            "[Google AdMob] Reward Ad Completed! Dispatched +$12,000 cash grant to your personal account.",
            "【AdMob激励视频】广告成功完播！获得开发商补助 +$12,000 注入主理人对公账户。",
            "success"
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Buy starter pack
  const handleBuyStarterPack = () => {
    if (stats.money < 1500) {
      playAudioBeep('alert');
      appendLog("Insufficient cash to simulated checkout. Starter Pack requires $1,500.", "手头现金短缺。购买研发Starter Pack大亨礼包需要 $1,500 现钞。", "error");
      return;
    }

    onUpdateStats(prev => ({ 
      ...prev, 
      money: prev.money - 1500,
      skills: {
        ...prev.skills,
        business: Math.min(100, (prev.skills.business || 0) + 12),
        management: Math.min(100, (prev.skills.management || 0) + 12)
      }
    }));

    onUpdateCompany(prev => {
      if (prev.registered) {
        return {
          ...prev,
          capital: prev.capital + 50000,
          brandAwareness: Math.min(100, prev.brandAwareness + 25),
          techProgress: prev.techProgress + 35
        };
      }
      return prev;
    });

    setStarterPackBought(true);
    localStorage.setItem("launchpad_starter_bought", "true");
    playAudioBeep('levelup');
    appendLog(
      "Starter Pack Purchased! Injected $50k Capital directly into your corporate firm, +12 Business and Management skills.",
      "购买【大亨研发礼包】：扣减个人账户现金 $1,500，公司资本账套自动注入 $50,000 级战略流动资金！并获得企业管理/财商属性 +12 大幅提升！",
      "success"
    );
  };

  // App compiler & release builder
  const handleStartAABUpload = () => {
    playAudioBeep('coin');
    setReleaseState('building');
    setReleaseProgress(10);

    let progress = 10;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 8;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Transitions
        setReleaseState('signed');
        setTimeout(() => {
          setReleaseState('uploading');
          let subProgress = 0;
          const uploadInterval = setInterval(() => {
            subProgress += 15;
            if (subProgress >= 100) {
              clearInterval(uploadInterval);
              setReleaseState('review');
              
              // Simulate play console audit time (4s)
              setTimeout(() => {
                setReleaseState('success');
                setIsPublished(true);
                setInstalls(1024);
                setActiveDaus(120);
                playAudioBeep('achievement');
                appendLog(
                  "CRITICAL LAUNCH SUCCESS: 'Billionaire City: Life Tycoon' is officially LIVE on Google Play and App Store! Passive installs started growing.",
                  "【应用发行狂喜】《大亨模拟器：商业富豪人生》成功上架 Google Play 全球应用商店！全球首批极客开始争相下载，您的首批持续被动推广红利已经正式流转！",
                  "success"
                );
              }, 4000);
            }
          }, 600);
        }, 1200);
      }
      setReleaseProgress(Math.min(100, progress));
    }, 400);
  };

  // Reset Release cycle to start over
  const handleResetRelease = () => {
    setIsPublished(false);
    setInstalls(0);
    setActiveDaus(0);
    setReleaseState('idle');
    setReleaseProgress(0);
    setStarterPackBought(false);
    localStorage.removeItem("launchpad_is_published");
    localStorage.removeItem("launchpad_installs");
    localStorage.removeItem("launchpad_active_daus");
    localStorage.removeItem("launchpad_release_state");
    localStorage.removeItem("launchpad_starter_bought");
    playAudioBeep('alert');
    appendLog("Developer launch files cleared and deleted from target server simulation.", "发行数据、商店草稿及 Google Play 线上发布版已经安全回滚清除。", "info");
  };

  // Dynamic SEO description copy helper
  const dynamicSeoDescription = `
🔥 BILLIONAIRE CITY TYCOON: LIFE SIMULATOR 🔥

Play as the ultimate founder '${stats.spouseId ? "Married Tycoon" : "Young Executive"}'! Start from a modest delivery driver and compound your way to real estate dominance.

🚀 EXCITING MILESTONES ACHIEVED IN GAME:
- Personal Founder: ${stats.spouseId ? "Co-founder / spouse attached" : "Single Entrepreneur"}
- Corporate HQ: ${company.registered ? `'${company.name}' Sector Tycoon (${company.type.toUpperCase()})` : "Yet to incorporate"}
- Total Net Worth: Over $${stats.money} cash and automated assets.
- Best Real Estates: Owned land plots with custom architectural design.

Can you conquer the financial stock market and top the World Rich List? Build passive rental income, hire developers and sales professionals, automate with custom AI Autopilot controllers, and dominate!
`;

  const copySEODesc = () => {
    navigator.clipboard.writeText(dynamicSeoDescription.trim());
    setSeoCopySuccess(true);
    playAudioBeep('coin');
    setTimeout(() => setSeoCopySuccess(false), 2000);
  };

  // Mock Advertisement Data Source
  const adCampaigns = [
    {
      title_en: "Cyberpunk Tycoon 2077",
      title_zh: "赛博朋克大亨：黑客危机",
      desc_en: "Hack rival mega-corporations. Recruit neural net pilots and compound your bitcoin yield! Play Now.",
      desc_zh: "黑入竞争对手庞大主机！招募赛博佣兵，组配属于你的百亿量化收割网格。即刻开玩。"
    },
    {
      title_en: "Space Yacht Club: Mars Mining",
      title_zh: "极海太空游艇俱乐部：火星开矿",
      desc_en: "Buy hydrogen drill boats, deploy lunar bases, and lock in trillions in helium isotope dividends.",
      desc_zh: "购买高压氮气钻击船，建设在轨月球基地，套现金星氦3等价物。今日上线送特权卡。"
    },
    {
      title_en: "Lofi Cafe: Cozy Cat Tea",
      title_zh: "甜点猫咪小馆：极简佛系烹饪",
      desc_en: "Relax, blend warm chamomile milk, upgrade cozy tables and make furry cats purr. Very calming.",
      desc_zh: "听听舒缓音乐，冲冲养生花茶，购置精选木质桌椅让猫咪呼噜。解压治愈利器。"
    }
  ];

  return (
    <div id="launchpad-tab-panel" className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      
      {/* 🚀 Top Row banner displaying critical dev stats */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#070512] to-zinc-950 border border-indigo-900/30 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 h-9 w-9 rounded-xl bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
                <Rocket className="animate-bounce" size={18} />
              </span>
              <div>
                <span className="text-[10px] text-indigo-400 font-mono uppercase font-black tracking-widest">{language==='en'?'App Dev Console':'大马移动端开发者控制台'}</span>
                <h2 className="text-sm font-black text-white uppercase tracking-tight">{language==='en'?'Billionaire City: Google Play Launchpad':'应用发行中心 · 移动变现服务'}</h2>
              </div>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xl">
              {language === 'en' 
                ? "Turn your bionic corporate achievements into a playable smartphone simulator App. Compile AAB packages, build App icons, optimize SEO keywords, place AdMob revenue units, and earn massive passive royalties." 
                : "将您名下雄厚的个人伟业和不动产帝国制作成《商业富豪人生》移动端高爆手游。设计Logo、配置AD激励广告、编译AAB产品包、上架谷歌商店并获取全球源源不竭的研发提成与点币被动收益。"}
            </p>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-850 p-4 rounded-2xl flex flex-row items-center gap-4 shrink-0 shadow-lg w-full md:w-auto">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-wider block">{language==='en'?'Worldwide Installs':'累计覆盖全球用户'}</span>
              <span className="text-lg font-black font-mono text-emerald-400">{isPublished ? installs.toLocaleString() : "0"}</span>
              <span className="text-[9px] text-zinc-650 block font-mono">DAUs: {isPublished ? activeDaus.toLocaleString() : "0"} / {language==='en'?'day':'日均活跃'}</span>
            </div>
            
            <div className="h-10 w-[1px] bg-zinc-800" />
            
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono tracking-wider block">{language==='en'?'Ad Revenues Accrued':'待领纯开发者广告提成'}</span>
              <span className="text-lg font-black font-mono text-indigo-400">${accruedAdRoyalties}</span>
              {accruedAdRoyalties > 0 ? (
                <button
                  onClick={handleClaimAdRoyalties}
                  className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 underline cursor-pointer uppercase tracking-wider block font-mono"
                >
                  ➡ {language==='en'?'CLAIM NOW':'点击立即提取'}
                </button>
              ) : (
                <span className="text-[9px] text-zinc-600 block font-mono">{language==='en'?'Syncing...':'实时对账中...'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Config Dashboard vs Sub-Tabs panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Subtabs control - 3 columns */}
        <div className="lg:col-span-3 flex flex-col gap-2.5">
          {[
            { id: 'console', icon: <Monitor size={15} />, en: "1. Google Console", zh: "1. 谷歌后台打包" },
            { id: 'store', icon: <Smartphone size={15} />, en: "2. App Store SEO", zh: "2. 商店文案配图" },
            { id: 'monetize', icon: <Coins size={15} />, en: "3. AdMob Placement", zh: "3. 广告研发变现" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setSubTab(tab.id as any);
                playAudioBeep('coin');
              }}
              className={`flex items-center gap-3 px-4.5 py-4 rounded-2xl text-xs font-black border tracking-wider transition-all cursor-pointer ${
                subTab === tab.id 
                  ? 'bg-zinc-850 border-emerald-500 text-emerald-400 font-bold shadow' 
                  : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
              }`}
            >
              <span className={subTab === tab.id ? "text-emerald-400 animate-pulse" : "text-zinc-650"}>{tab.icon}</span>
              <span>{language === 'en' ? tab.en : tab.zh}</span>
            </button>
          ))}

          {/* Reset development trigger */}
          <div className="bg-zinc-950 p-4 border border-zinc-900 rounded-2xl text-center space-y-2 mt-4">
            <span className="text-[9px] uppercase font-bold text-zinc-600 font-mono tracking-wider block">⚙ Developer Sandbox</span>
            <button
              onClick={handleResetRelease}
              className="w-full text-[9px] font-bold text-rose-400/80 hover:text-rose-400 border border-red-950 hover:bg-rose-950/20 py-1.5 rounded-lg transition uppercase font-mono cursor-pointer"
            >
              ☣ Empty Play Draft
            </button>
          </div>
        </div>

        {/* Right Side Working canvas - 9 columns */}
        <div className="lg:col-span-9 bg-zinc-950 border border-zinc-900 rounded-3xl p-6 min-h-[480px] flex flex-col justify-between">
          
          {/* ==================== SCREEN 1: CONSOLE COMPILER & BUILDER ==================== */}
          {subTab === 'console' && (
            <div className="space-y-6">
              
              {/* Release progress details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-zinc-200 uppercase tracking-wide">{language==='en'?'Automated Build Pipeline':'发布包IL2CPP自动化编译流水线'}</span>
                    <p className="text-[10px] text-zinc-550">{language==='en'?'Translates player variables into signed binary code':'自动将您在沙盒中的净资产、创制公司等多项指标转译为安全应用包'}</p>
                  </div>
                  
                  <span className={`text-[9px] font-black uppercase font-mono px-2 py-1 rounded border ${
                    releaseState === 'success' 
                      ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400' 
                      : releaseState === 'idle'
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      : 'bg-indigo-950/40 border-indigo-800/40 text-indigo-400 animate-pulse'
                  }`}>
                    {releaseState === 'idle' && (language==='en'?'Ready for Draft':'尚未打包')}
                    {releaseState === 'building' && (language==='en'?'Compiling Node Asset Modules...':'商业资产核心模块编译中')}
                    {releaseState === 'signed' && (language==='en'?'Validating Security Signs':'正在加注开发者安全密钥')}
                    {releaseState === 'uploading' && (language==='en'?'Uploading to Play Console...':'包体上传谷歌主备服务器中')}
                    {releaseState === 'review' && (language==='en'?'Console Machine Auditing':'谷歌机器人安全沙盒机审中')}
                    {releaseState === 'success' && (language==='en'?'Published Successfully':'大获成功：全球已发布')}
                  </span>
                </div>

                {/* Progress bar of current state */}
                {releaseState !== 'idle' && releaseState !== 'success' && (
                  <div className="space-y-2 bg-zinc-900/40 border border-zinc-900 p-4 rounded-2xl">
                    <div className="flex justify-between items-center text-[10px] text-indigo-400 font-mono font-bold">
                      <span>{language==='en'?'TRANSCODING ARCHITECTURE...':'正交物理框架压缩编译中...'}</span>
                      <span>{releaseProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2.5 rounded-full p-0.5 overflow-hidden border border-zinc-850">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-pink-500 rounded-full animate-pulse"
                        style={{ width: `${releaseProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Release state success display */}
                {releaseState === 'success' && (
                  <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-2xl p-4 flex gap-3.5 items-start">
                    <Award className="text-emerald-400 shrink-0 mt-0.5 animate-bounce" size={20} />
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider">{language==='en'?'ONLINE & GENERATING ROYALTIES':'应用安全过审，全球公开发行中'}</h4>
                      <p className="text-[10px] text-zinc-400 leading-relaxed">
                        {language === 'en' 
                          ? "Congratulations! Your simulated life tycoon is now a famous global brand app. Installs are ticking up. Average DAUs are viewing AdMob reward ads, and you are receiving automatic Developer passive cash royalties inside this panel every second!" 
                          : "好消息！您的《大马商赛模拟人生》手游在全球143个国家的 Google Play 以及 App Store 正式斩获极力推荐！粉丝涌入，累计日活跃租户自动贡献大额分润收益，点击上面“提取”即可瞬时丰富财富总储额！"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Big compiler trigger block */}
                {releaseState === 'idle' && (
                  <div className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 bg-indigo-950/50 border border-indigo-900/40 rounded-full flex items-center justify-center text-indigo-400 mx-auto">
                      <Rocket size={24} className="hover:rotate-12 transition" />
                    </div>
                    
                    <div className="space-y-1 max-w-sm mx-auto">
                      <span className="text-xs font-black text-zinc-200 uppercase tracking-tight block">{language==='en'?'Assemble Production AAB Bundle':'启动打包一键上架'}</span>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        {language === 'en' 
                          ? "Compiles current money, high-school/PhD degrees, luxury sedan holdings, and properties into an Android App Bundle for store verification." 
                          : "自动把当前拥有的现金资产、公司运营品牌、顶格别墅以及配偶情感羁绊打包封签。一键点按，即刻执行安全验证。"}
                      </p>
                    </div>

                    <button
                      onClick={handleStartAABUpload}
                      className="bg-emerald-600 hover:bg-emerald-500 text-black py-2.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all active:translate-y-0.5 inline-block"
                    >
                      🚀 {language==='en'?'Compile & Upload AAB Bundle':'一键整合打包并投发布审核'}
                    </button>
                  </div>
                )}
              </div>

              {/* Developer Environment Checks Grid */}
              <div className="space-y-3.5">
                <span className="text-[10px] text-zinc-500 uppercase font-black font-mono tracking-wider block">🛡 Production Compliance standard checklist</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label_en: "IL2CPP ARM64 Android Target compliance", label_zh: "兼容 IL2CPP 反逆向编译及高阶 ARM64", ok: true },
                    { label_en: "HTTPS Privacy Policy Webpage Attached", label_zh: "符合用户安全规范、备案隐私政策协议", ok: true },
                    { label_en: "AdMob Mediation network validated", label_zh: "AdMob广告竞买协议对端绑定安全校验", ok: true },
                    { label_en: "Auto-Save game progress fallback module", label_zh: "配备本地持久化安全沙盒、支持零延迟秒存", ok: stats.day > 1 }
                  ].map((chk, i) => (
                    <div key={`chk-spec-${i}`} className="bg-zinc-900/30 border border-zinc-900 p-3.5 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400 select-all font-mono leading-tight">{chk.label_en}</span>
                      <span>
                        {chk.ok ? (
                          <span className="text-[9px] font-black text-emerald-400 font-mono">✓ PASS</span>
                        ) : (
                          <span className="text-[9px] font-black text-rose-400 font-mono flex items-center gap-0.5"><AlertTriangle size={8} /> NEED TICK</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== SCREEN 2: GAME ICON & SCREENSHOTS PREVIEW (SEO) ==================== */}
          {subTab === 'store' && (
            <div className="space-y-6">
              
              {/* Launcher Icon configurator widget */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5">
                
                {/* Live Launcher preview */}
                <div className="md:col-span-4 flex flex-col items-center space-y-2">
                  <span className="text-[9px] font-bold text-zinc-550 uppercase tracking-widest font-mono">Mobile Desktop Icon</span>
                  
                  {/* Cyber-Luxury Icon Display */}
                  <div className={`w-20 h-20 rounded-2xl ${
                    iconTheme === 'gradient' ? 'bg-gradient-to-br from-emerald-400 via-indigo-600 to-pink-500' :
                    iconTheme === 'emerald' ? 'bg-gradient-to-tr from-emerald-600 to-sky-400' :
                    iconTheme === 'cyberpunk' ? 'bg-gradient-to-br from-yellow-400 via-pink-600 to-indigo-600' :
                    'bg-zinc-900 border border-zinc-700'
                  } p-1 relative flex flex-col items-center justify-center shadow-xl shadow-black/80 ring-2 ring-zinc-800`}>
                    
                    {/* Golden internal mesh contour */}
                    <div className="absolute inset-0.5 border border-amber-400/20 rounded-[14px]" />
                    
                    {/* Main Character text */}
                    <span className="font-black text-zinc-100 text-2xl font-mono select-none drop-shadow-md tracking-wider">
                      {iconText}
                    </span>

                    {/* Premium ribbon badge */}
                    {iconBadge && (
                      <div className="absolute -bottom-1 inset-x-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-[7px] font-black uppercase text-center rounded py-0.5 scale-90 border border-amber-400/30 tracking-widest font-mono shadow-md">
                        RICH
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[9px] text-zinc-600 font-mono">Billionaire City v2.1</span>
                </div>

                {/* Configuration parameters */}
                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-black text-zinc-300 uppercase tracking-tight">{language==='en'?'App Launcher Icon Editor':'移动应用启动Logo实时配置板'}</span>
                    <p className="text-[10px] text-zinc-500 leading-normal">{language==='en'?'Decorate your App logo design to capture maximum App Store CTR':'自主调节图标设计细节，可以一键改变其色彩流或者主权标识，提升过审吸引力。'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-500 font-mono tracking-wider block uppercase">Founder Initial</label>
                      <input 
                        type="text" 
                        maxLength={3}
                        value={iconText}
                        onChange={(e) => setIconText(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-black text-zinc-100 focus:outline-none focus:border-indigo-600 text-center"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-zinc-500 font-mono tracking-wider block uppercase">Saturated Backing Theme</label>
                      <div className="flex gap-1.5">
                        {(['gradient', 'emerald', 'cyberpunk', 'classic'] as const).map(th => (
                          <button
                            key={th}
                            onClick={() => { setIconTheme(th); playAudioBeep('coin'); }}
                            className={`w-5 h-5 rounded-full ${
                              th === 'gradient' ? 'bg-gradient-to-r from-indigo-500 to-pink-500' :
                              th === 'emerald' ? 'bg-emerald-500' :
                              th === 'cyberpunk' ? 'bg-pink-500' : 'bg-zinc-800'
                            } border ${iconTheme === th ? 'ring-2 ring-white scale-110' : 'border-zinc-950'} cursor-pointer`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-400 font-bold">{language==='en'?'Affix Golden "RICH" Super-Badge?':'加注黄金版“RICH”超级富豪缎带角标?'}</span>
                    <button 
                      onClick={() => { setIconBadge(!iconBadge); playAudioBeep('levelup'); }}
                      className={`text-[9px] font-bold px-3 py-1 rounded-lg border cursor-pointer uppercase ${
                        iconBadge ? 'bg-amber-600/10 border-amber-500/30 text-amber-500' : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                      }`}
                    >
                      {iconBadge ? (language==='en'?'ENABLED':'加注成功') : (language==='en'?'DISABLED':'不显示')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic optimized keywords generation section */}
              <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-zinc-200 uppercase tracking-wide">{language==='en'?'Store SEO listing keywords optimizer':'自动生成 Google Play/App Store 中英双语SEO推介文案'}</span>
                    <p className="text-[10px] text-zinc-550">{language==='en'?'Guarantees high visibility search rankings using in-game achievements':'系统联动您当前的不动产数量、公司年化和主理人情感状况自动优化SEO标签'}</p>
                  </div>

                  <button
                    onClick={copySEODesc}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] font-mono uppercase tracking-wider py-1.5 px-3 rounded-lg cursor-pointer flex items-center justify-between gap-1 border border-indigo-700 active:translate-y-0.5"
                  >
                    <Copy size={11} />
                    <span>{seoCopySuccess ? (language==='en'?'Copied!':'已复制') : (language==='en'?'Copy Description':'全选复制文案')}</span>
                  </button>
                </div>

                <div className="relative bg-zinc-950 border border-zinc-850 rounded-xl p-4 max-h-36 overflow-y-auto">
                  <pre className="text-[9px] font-mono text-zinc-400 leading-normal select-all whitespace-pre-wrap font-medium">
                    {dynamicSeoDescription.trim()}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-1.5 text-[8px] font-mono uppercase text-zinc-500 tracking-wider">
                  {[
                    "#PlayStoreApproved", "#BillionaireCitySimulator2026", "#UrbanRealEstateTycoon", 
                    "#AdMobVerified", "#PassiveIncomeGame", "#AutonomousAutopilotBot"
                  ].map((tag, i) => (
                    <span key={`seo-tag-${i}`} className="bg-zinc-900 p-1 px-2 rounded border border-zinc-850">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Simulated iPhone Screenshots preview gallery */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-zinc-550 font-black font-mono uppercase tracking-wider block">📷 App Store Promotional Screenshot Deck (6 items)</span>
                
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {[
                    { label: "1. Elite Founder", color: "from-emerald-950 to-zinc-950", spec: `${stats.activeVehicleId ? 'Supercar Owner' : 'Pedestrian Rider'}` },
                    { label: "2. HQ Scraper", color: "from-indigo-950 to-zinc-950", spec: `${company.registered ? company.name : 'Venture Draft'}` },
                    { label: "3. Land Grid", color: "from-amber-950 to-zinc-950", spec: `${plots.filter(p => p.owned).length} plots certified` },
                    { label: "4. Quantum Stock", color: "from-pink-950 to-zinc-950", spec: `$${stats.savingsBalance ? stats.savingsBalance : '0'} savings` },
                    { label: "5. PhD Schooling", color: "from-cyan-950 to-zinc-950", spec: `Highest: ${stats.education.replace('_', ' ')}` },
                    { label: "6. Sim Autopilot", color: "from-purple-950 to-zinc-950", spec: "Autonomous Executive" }
                  ].map((sc, i) => (
                    <div key={`sc-mock-${i}`} className="bg-gradient-to-b from-zinc-900/60 to-zinc-950 border border-zinc-850 p-2 text-center rounded-xl relative overflow-hidden group">
                      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${sc.color}`} />
                      <div className="h-24 bg-zinc-950/80 rounded-lg p-1 text-left flex flex-col justify-between border border-zinc-900 select-none">
                        <div className="flex justify-between items-center text-[7px] text-zinc-650 uppercase font-mono">
                          <span>EB-SIM</span>
                          <span>{i+1}/6</span>
                        </div>
                        <div className="w-full space-y-1 my-auto">
                          <span className="text-[8px] font-black text-indigo-400 block tracking-tight truncate uppercase leading-none">{sc.label}</span>
                          <span className="text-[7px] text-zinc-500 font-mono block leading-wide border-t border-zinc-900 pt-1 truncate">{sc.spec}</span>
                        </div>
                        <div className="w-full flex items-center gap-0.5 justify-center bg-zinc-900 rounded py-0.5 mt-0.5">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping" />
                          <span className="text-[6px] text-zinc-500 font-mono uppercase">Render Completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==================== SCREEN 3: ADMOB MONETIZATION PLACEMENT ENGINE ==================== */}
          {subTab === 'monetize' && (
            <div className="space-y-6">
              
              <div className="bg-indigo-950/10 border border-indigo-900/30 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800/40 text-indigo-400 flex items-center justify-center">
                    <Tv size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-400 font-mono uppercase font-black tracking-widest block">Interactive Developer Monetization</span>
                    <h3 className="text-xs font-black text-zinc-200 uppercase tracking-tight">{language==='en'?'Place Simulated AdMob Placements':'配置应用激励广告与超凡超募 Starter Pack 包'}</h3>
                  </div>
                </div>
                
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {language === 'en' 
                    ? "In mobile game operations, developer revenue spans Reward Ads (rewarding players with massive in-game cash) and In-App Purchases (Starter Pack). Test your placements below and receive fast cash backing infusions!" 
                    : "在成熟的手机游戏运营模式中，点击观看激励AD以及购买大亨特权礼金是两大盈利王牌。作为开发商主理人，您可以在此亲自做模拟过审核：点击观看交互AD或者解锁研发特权！"}
                </p>
                
                {/* Visual grid of integration placements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Reward Ad Placement card */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex gap-1.5 items-center">
                        <Gift className="text-emerald-400 shrink-0" size={14} />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider font-mono">Google AdMob Placement #1</span>
                      </div>
                      <h4 className="text-xs font-black text-zinc-200 uppercase">{language==='en'?'In-Game Rewarded Video Ad':'看开发者激励视频AD'}</h4>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        {language === 'en' ? "Watches a brief 6-second simulated mobile game interactive video. Instantly rewards player +$12,000 Cash." : "亲自体验并审核视频广告分发。观看 6 秒精美小浮窗广告，立刻获得纯补研发佣金 +$12,000。"}
                      </p>
                    </div>

                    <button
                      onClick={handleWatchRewardAd}
                      className="bg-indigo-650 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider font-mono py-2 rounded-xl text-center cursor-pointer transition active:translate-y-0.5 shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Play size={10} />
                      <span>📺 {language==='en'?'Examine & Claim (+$12k)':'点击审查AD视频 (赚+$12k)'}</span>
                    </button>
                  </div>

                  {/* Starter Pack Card */}
                  <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="flex gap-1.5 items-center">
                        <Flame className="text-amber-400 shrink-0 animate-pulse" size={14} />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider font-mono">In-App Purchase Category</span>
                      </div>
                      <h4 className="text-xs font-black text-zinc-200 uppercase">{language==='en'?'Founder Premium Starter Pack':'研发Starter Pack超级特权大礼包'}</h4>
                      <p className="text-[10px] text-zinc-500 leading-normal">
                        {language === 'en' ? "Simulates a local transaction. Spreads $1,500 Cash, instantly injection +$50,000 Capital into your Company with massive skill bonuses." : "模拟手游内购。扣除个人现金 $1,500，公司立刻入账 $50,000 级对公大项资本金，并加持财智技能点！"}
                      </p>
                    </div>

                    {starterPackBought ? (
                      <span className="w-full text-center bg-zinc-900 border border-zinc-850 text-zinc-500 py-2 rounded-xl text-[10px] font-mono tracking-widest uppercase block select-none">
                        ✓ BUNDLE PURCHASED
                      </span>
                    ) : (
                      <button
                        onClick={handleBuyStarterPack}
                        className="bg-amber-600 hover:bg-amber-500 text-black font-black text-[10px] uppercase tracking-wider font-mono py-2 rounded-xl text-center cursor-pointer transition active:translate-y-0.5 shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Coins size={10} />
                        <span>🛒 {language==='en'?'Buy Developer Starter Pack (-$1.5k)':'花费少量个人现金购买大礼包'}</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>

              {/* Developer stats footnote */}
              <div className="bg-zinc-900/10 border border-zinc-900 rounded-2xl p-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wide block">💰 Operational Monetization Strategy</span>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  {language === 'en' 
                    ? "By adding AdMob banner ads or custom rewarded interstitials at correct intervals, retention multipliers and DAUs stay optimally high. Keep active gameplay flowing to maximize global developer passive index points." 
                    : "根据开发商最佳操作，不建议强加过多强制广告以免拖累退存和平均满意度。主要利用高频激励机制和极佳内购服务（如 Starter Pack），使玩家能高效扩充房地产，完成大亨人生巅峰。"}
                </p>
              </div>

            </div>
          )}

          {/* Sub-tab canvas footer - unified instruction block */}
          <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-between items-center text-[10px] font-mono text-zinc-550">
            <span>Play Store: Release Code V2.1</span>
            <span className="flex items-center gap-1 uppercase font-bold"><ShieldCheck size={11} className="text-emerald-400" /> Secure Sandbox Verified</span>
          </div>

        </div>

      </div>

      {/* ==================== INTERACTIVE REWARD AD PLACEMENT VIDEO EMBED OVERLAY ==================== */}
      {adOverlayOpen && (
        <div className="fixed inset-0 bg-black/95 z-70 flex items-center justify-center p-4 backdrop-blur-xl animate-fade-in select-none">
          <div className="w-full max-w-sm bg-zinc-950 border border-indigo-900/40 p-6 rounded-3xl space-y-6 text-center shadow-2xl relative overflow-hidden">
            
            {/* Spinning radar indicator */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            {/* Small count-down ticker in corner */}
            <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1 font-mono text-[10px] text-emerald-400 font-black animate-pulse">
              {language==='en'?'Reward in':'距离研发佣金解锁'}: {adCountdown}s
            </div>

            <div className="space-y-1 pt-6">
              <span className="text-[9px] uppercase font-mono font-bold text-zinc-500 tracking-widest block">Google AdMob Interstitial Stream</span>
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-tight">{language==='en'?'SIMULATED ADVERTISING PROMOTION':'正在推交商赛巨献广告视频...'}</h3>
            </div>

            {/* Simulated game ad illustration/graphic box */}
            <div className="w-full h-36 bg-gradient-to-br from-indigo-950 via-zinc-900 to-[#020205] rounded-2xl border border-zinc-900 flex flex-col justify-between p-4.5 text-left relative overflow-hidden ring-1 ring-zinc-850">
              <div className="flex justify-between items-start">
                <span className="bg-yellow-400 text-black text-[7px] font-black uppercase px-1 rounded font-mono">Ad / 推广</span>
                <span className="text-[7px] text-zinc-650 font-mono">EB #0{adAdvertId + 1}</span>
              </div>
              
              <div className="space-y-1 relative z-10">
                <span className="text-xs font-black text-white block uppercase tracking-tight">
                  {language === 'en' ? adCampaigns[adAdvertId].title_en : adCampaigns[adAdvertId].title_zh}
                </span>
                <p className="text-[10px] text-zinc-400 leading-snug">
                  {language === 'en' ? adCampaigns[adAdvertId].desc_en : adCampaigns[adAdvertId].desc_zh}
                </p>
              </div>

              {/* Progress bar stream mimicking video progression */}
              <div className="w-full bg-zinc-900/60 h-1 rounded-full overflow-hidden p-0.5 mt-2">
                <div 
                  className="h-full bg-indigo-400 transition-all duration-1000"
                  style={{ width: `${(6 - adCountdown) * 16.6}%` }}
                />
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
              {language==='en' 
                ? "This is an in-game simulated advertisement view supporting developer tools. Do not close or navigate away." 
                : "正在考核并审计该AD分发频次。请静待倒计时完毕后自动关闭、套现及派发研发补贴资金。"}
            </p>

            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin shrink-0 mx-auto block" />

          </div>
        </div>
      )}

    </div>
  );
};
