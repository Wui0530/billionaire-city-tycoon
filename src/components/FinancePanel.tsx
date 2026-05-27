import React, { useState } from "react";
import { 
  Building2, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  Percent, 
  CircleDollarSign,
  Briefcase,
  Share2,
  UserPlus,
  Send,
  Zap,
  Copy,
  Plus
} from "lucide-react";
import { PlayerStats, Language, RivalPlayer } from "../types";
import { motion } from "motion/react";

interface FinancePanelProps {
  stats: PlayerStats;
  language: Language;
  rivals: RivalPlayer[];
  playerNetWorth: number;
  ownCompanyValuation: number;
  ownCompanySharesPercentage: number;
  ownCompanyName: string;
  ownCompanySector: string;
  onBuyStock: (rivalId: string) => void;
  onSellStock: (rivalId: string) => void;
  onTradeOwnCompanyShares: (type: 'sell_out' | 'buy_back') => void;
  onBankDeposit: (amount: number) => void;
  onBankWithdraw: (amount: number) => void;
  onBankBorrow: (amount: number) => void;
  onBankRepay: (amount: number) => void;
  onConnectFriendCode: (friendObj: any) => void;
  onAddCustomFriend: (name: string, companyName: string, sector: 'tech'|'retail'|'real_estate'|'finance', initialVal: number) => void;
  onWireCashToFriend: (rivalId: string, amount: number) => void;
  onFundDream?: (dreamId: string, cost: number) => void;
}

export const FinancePanel: React.FC<FinancePanelProps> = ({
  stats,
  language,
  rivals,
  playerNetWorth,
  ownCompanyValuation,
  ownCompanySharesPercentage,
  ownCompanyName,
  ownCompanySector,
  onBuyStock,
  onSellStock,
  onTradeOwnCompanyShares,
  onBankDeposit,
  onBankWithdraw,
  onBankBorrow,
  onBankRepay,
  onConnectFriendCode,
  onAddCustomFriend,
  onWireCashToFriend,
  onFundDream
}) => {
  const [bankInputAmount, setBankInputAmount] = useState<string>("500");
  const [activeSubTab, setActiveSubTab] = useState<'bank' | 'stocks' | 'rivals' | 'multiplayer' | 'dreams'>('rivals');

  // Selected Stock for Line Chart & Market filtering
  const [selectedRivalId, setSelectedRivalId] = useState<string | null>("rival_my_maybank");
  const [marketFilter, setMarketFilter] = useState<'all' | 'my' | 'global'>('my');

  const renderStockChart = (rival: RivalPlayer) => {
    const prices = rival.prevSharePrices && rival.prevSharePrices.length > 0 
      ? rival.prevSharePrices 
      : [rival.sharePrice];
    
    const minVal = Math.min(...prices);
    const maxVal = Math.max(...prices);
    const valRange = maxVal - minVal;
    
    // Add vertical breathing room
    const padding = valRange === 0 ? 10 : valRange * 0.15;
    const chartMin = Math.max(0, minVal - padding);
    const chartMax = maxVal + padding;
    const chartRange = chartMax - chartMin;
    
    // SVG Dimensions: width 500, height 180
    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 30;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    const points = prices.map((price, idx) => {
      const x = paddingLeft + (idx / Math.max(1, prices.length - 1)) * chartWidth;
      const y = chartRange !== 0
        ? paddingTop + chartHeight - ((price - chartMin) / chartRange) * chartHeight
        : paddingTop + chartHeight / 2;
      return { x, y, price };
    });
    
    // Create the line path command
    const linePath = points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
      : '';
      
    // Create the enclosed area path for gradient fills
    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : '';
      
    const isPriceUp = prices[prices.length - 1] >= (prices[prices.length - 2] || prices[0]);
    const themeColor = isPriceUp ? '#10b981' : '#ef4444'; // emerald-500 or red-500
    
    return (
      <div key={`chart-${rival.id}`} className="bg-zinc-950 border border-zinc-850 rounded-xl p-5 space-y-3.5">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl shrink-0">{getCountryFlag(rival.countryCode)}</span>
              <h3 className="text-sm font-black text-zinc-100 flex flex-wrap items-center gap-1.5">
                <span>{rival.companyName}</span>
                <span className="text-xs text-zinc-400 font-semibold">({language === 'en' ? rival.name_en : rival.name_zh})</span>
              </h3>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {language === 'en' 
                ? "Bursa Malaysia (KLSE) Stock Trend & Micro-fluctuations" 
                : "吉隆坡股市交易走势及起伏曲线图 (最近 15 期波动线)"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-bold">{language === 'en' ? "Market Price" : "最新股价行情"}</div>
            <div className="text-lg font-black font-mono text-yellow-400 mt-0.5">
              {formattedMoney(rival.sharePrice)}
            </div>
          </div>
        </div>
        
        {/* SVG Drawing Area */}
        <div className="relative w-full overflow-hidden bg-zinc-950/60 rounded-xl border border-zinc-900 pt-2 px-1 pb-3">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
              <linearGradient id="chart-area-grad-panel" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={themeColor} stopOpacity="0.22" />
                <stop offset="100%" stopColor={themeColor} stopOpacity="0.00" />
              </linearGradient>
            </defs>
            
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, gridIdx) => {
              const yVal = paddingTop + gridIdx * (chartHeight / 4);
              const priceLabel = chartMax - ratio * chartRange;
              return (
                <g key={gridIdx} className="opacity-30">
                  <line 
                    x1={paddingLeft} 
                    y1={yVal} 
                    x2={width - paddingRight} 
                    y2={yVal} 
                    stroke="#27272a" 
                    strokeWidth="1" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={paddingLeft - 8} 
                    y={yVal + 3.5} 
                    fill="#71717a" 
                    fontSize="9.5" 
                    fontFamily="monospace" 
                    textAnchor="end"
                  >
                    ${priceLabel.toFixed(1)}
                  </text>
                </g>
              );
            })}
            
            {/* Area Path */}
            {areaPath && (
              <path d={areaPath} fill="url(#chart-area-grad-panel)" />
            )}
            
            {/* Line Path */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke={themeColor} 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Scatter Circles & Tooltips */}
            {points.map((p, idx) => {
              const isLast = idx === points.length - 1;
              return (
                <g key={idx} className="group cursor-pointer">
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={isLast ? "5.5" : "3.5"} 
                    fill={isLast ? "#eab308" : themeColor} 
                    stroke="#09090b" 
                    strokeWidth="1.5" 
                    className="transition-all duration-150 hover:r-7"
                  />
                  {/* Tooltip text */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <rect 
                      x={p.x - 22} 
                      y={p.y - 25} 
                      width="44" 
                      height="16" 
                      rx="4" 
                      fill="#18181b" 
                      stroke="#3f3f46" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={p.x} 
                      y={p.y - 14} 
                      fill="#f4f4f5" 
                      fontSize="9" 
                      fontWeight="bold" 
                      fontFamily="monospace" 
                      textAnchor="middle"
                    >
                      ${p.price.toFixed(1)}
                    </text>
                  </g>
                </g>
              );
            })}
            
            {/* X-axis indicators */}
            <g className="opacity-40">
              <line 
                x1={paddingLeft} 
                y1={height - paddingBottom} 
                x2={width - paddingRight} 
                y2={height - paddingBottom} 
                stroke="#27272a" 
                strokeWidth="1.5" 
              />
              <text x={paddingLeft} y={height - 11} fill="#71717a" fontSize="9" textAnchor="start">
                T-15 {language === 'en' ? "Ticks" : "交易期"}
              </text>
              <text x={paddingLeft + chartWidth / 2} y={height - 11} fill="#71717a" fontSize="9" textAnchor="middle">
                {language === 'en' ? "Volatility Index" : "波段阻力均线"}
              </text>
              <text x={width - paddingRight} y={height - 11} fill="#eab308" fontSize="9" fontWeight="bold" textAnchor="end">
                {language === 'en' ? "Now (Live)" : "实时 (最新)"}
              </text>
            </g>
          </svg>
        </div>
        
        {/* Market Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
          <div className="bg-zinc-900 border border-zinc-850 p-2 rounded-xl text-center">
            <span className="text-zinc-500 block text-[10px]">{language === 'en' ? "Highest Price" : "波段最高价"}</span>
            <span className="font-mono font-bold text-green-400 mt-1 block">${maxVal.toFixed(1)}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-850 p-2 rounded-xl text-center">
            <span className="text-zinc-500 block text-[10px]">{language === 'en' ? "Lowest Price" : "波段最低价"}</span>
            <span className="font-mono font-bold text-red-400 mt-1 block">${minVal.toFixed(1)}</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-850 p-2 rounded-xl text-center">
            <span className="text-zinc-500 block text-[10px]">{language === 'en' ? "Shares Capital" : "流通股本"}</span>
            <span className="font-mono font-bold text-zinc-300 mt-1 block">{rival.outstandingShares.toLocaleString()} Shares</span>
          </div>
          <div className="bg-zinc-900 border border-zinc-850 p-2 rounded-xl text-center">
            <span className="text-zinc-500 block text-[10px]">{language === 'en' ? "Trading Sig" : "交易决策评级"}</span>
            <span className={`font-bold mt-1 block uppercase ${isPriceUp ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPriceUp 
                ? (language === 'en' ? "★ OUTPERFORM" : "★ 建议持股增持")
                : (language === 'en' ? "▼ WEAK ACCUM" : "▼ 阻力整理筑底")
              }
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Friends Connect Input States
  const [friendCodeInput, setFriendCodeInput] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [customFriendName, setCustomFriendName] = useState<string>("");
  const [customFriendCompName, setCustomFriendCompName] = useState<string>("");
  const [customFriendSector, setCustomFriendSector] = useState<'tech'|'retail'|'real_estate'|'finance'>("tech");
  const [customFriendVal, setCustomFriendVal] = useState<number>(30000);
  const [sendingWireAmount, setSendingWireAmount] = useState<Record<string, number>>({});

  const parsedVal = parseFloat(bankInputAmount);
  const bankAmt = !isNaN(parsedVal) ? Math.floor(parsedVal) : 0;
  const isBankAmtValid = bankAmt > 0;

  const formattedMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const getCountryFlag = (code?: string) => {
    switch (code) {
      case 'US': return '🇺🇸';
      case 'FR': return '🇫🇷';
      case 'HK': return '🇭🇰';
      case 'JP': return '🇯🇵';
      case 'DE': return '🇩🇪';
      case 'SG': return '🇸🇬';
      case 'AE': return '🇦🇪';
      case 'BR': return '🇧🇷';
      case 'IN': return '🇮🇳';
      case 'AU': return '🇦🇺';
      case 'CN': return '🇨🇳';
      case 'GB': return '🇬🇧';
      case 'MY': return '🇲🇾';
      default: return '🌐';
    }
  };

  // Generate My Share Code
  const handleGenerateShareCode = () => {
    const payload = {
      name: language === 'en' ? "CEO Player" : "华夏星闪高管",
      valuation: ownCompanyValuation || stats.money,
      compName: ownCompanyName || (language === 'en' ? "Galaxy Corp" : "星耀帝国集团"),
      sector: ownCompanySector !== 'none' ? ownCompanySector : 'tech',
      netWorth: playerNetWorth,
      stats: {
        energy: stats.energy,
        health: stats.health,
        happiness: stats.happiness
      }
    };
    try {
      // safe unicode-encoding method to prevent btoa errors with Chinese characters
      const jsonStr = JSON.stringify(payload);
      const enc = btoa(encodeURIComponent(jsonStr));
      return "biz_" + enc;
    } catch (e) {
      return "Error generating code";
    }
  };

  const myConnectionCode = handleGenerateShareCode();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(myConnectionCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      // Fallback copy
      const el = document.createElement('textarea');
      el.value = myConnectionCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Submit friend code
  const handleConnectFriend = () => {
    if (!friendCodeInput.startsWith("biz_")) {
      alert(language === 'en' ? "Invalid connection code! Please check again." : "错误的联机校验密钥！请重新核对好友代码。");
      return;
    }
    try {
      const cleanB64 = friendCodeInput.substring(4);
      const decodedJson = decodeURIComponent(atob(cleanB64));
      const friendObj = JSON.parse(decodedJson);
      if (friendObj?.name) {
        onConnectFriendCode(friendObj);
        setFriendCodeInput("");
        alert(language === 'en' ? `Friend ${friendObj.name} connected successfully!` : `成功连接！好友【${friendObj.name}】已成功引入您的本地商战星空！`);
      } else {
        throw new Error();
      }
    } catch (err) {
      alert(language === 'en' ? "Malformed friend code data!" : "解析好友代码时遇到故障，请确保复制了完整的密钥代码！");
    }
  };

  // Submit manual custom friend
  const handleSubmitCustomFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFriendName.trim()) return;
    onAddCustomFriend(
      customFriendName.trim(),
      customFriendCompName.trim() || `${customFriendName.trim()} Ventures`,
      customFriendSector,
      customFriendVal
    );
    // clear
    setCustomFriendName("");
    setCustomFriendCompName("");
    alert(language === 'en' ? "Custom Friend Added!" : "死党极速录入成功！");
  };

  // Trigger high quality business duel/co-operation mini game!
  const handleBusinessDuel = (rival: RivalPlayer) => {
    const playerSkill = stats.skills.negotiation + stats.skills.business;
    const opponentSkill = Math.floor(Math.random() * 45) + 30; // standard rival estimation
    const isPlayerWin = playerSkill >= opponentSkill || Math.random() < 0.45;

    if (isPlayerWin) {
      const winWinnings = 20000 + stats.skills.negotiation * 200;
      onWireCashToFriend(rival.id, -winWinnings); // subtract capital from rival, add winnings as bonus (handled locally)
      alert(
        language === 'en' 
          ? `VICTORY! You outperformed ${rival.name_en} in the Global Innovation Summit. Earned +$${winWinnings.toLocaleString()} and massive market influence!`
          : `商战交锋凯旋！您在“全球首脑商业沙龙演讲中”凭傲视大盘的商贸口才与谈判经验，成功击败【${rival.name_zh}】，为公司攫取战略投资红利 +$${winWinnings.toLocaleString()}！`
      );
    } else {
      const compromisePenalty = 10000;
      onWireCashToFriend(rival.id, compromisePenalty); // give penalty money to rival
      alert(
        language === 'en'
          ? `Defeat! ${rival.name_en} drafted a better logistics alliance. Committed a friendly concession fine of $${compromisePenalty.toLocaleString()}.`
          : `谈判交锋惜败！【${rival.name_zh}】提供的智慧物流方案更受商会评委青睐。您按约赔偿友好对赌违约金 $${compromisePenalty.toLocaleString()}。再接再厉！`
      );
    }
  };

  // Calculate Borrowing Capacity
  const getBorrowingLimit = () => {
    let limit = 2000; // standard base limit
    if (stats.education === 'bachelor') limit = 15000;
    else if (stats.education === 'master') limit = 45000;
    else if (stats.education === 'phd') limit = 120000;
    
    // extra assets multiplier
    const bonus = Math.floor(playerNetWorth * 0.3);
    return limit + bonus;
  };

  const borrowingLimit = getBorrowingLimit();
  const maxCanBorrow = Math.max(0, borrowingLimit - stats.loanBalance);

  // Leaderboard sorting
  const leaderboard = [
    {
      id: "player_you",
      isPlayer: true,
      name_en: "You (CEO)",
      name_zh: "您 (星耀创始人)",
      companyName: stats.activeJobId ? "Freelance / Owner" : (ownCompanyName || "Your Corporation"),
      netWorth: playerNetWorth,
      isBankrupt: stats.health <= 0,
      countryCode: "CN",
      isFriend: false
    },
    ...rivals.map(r => ({
      id: r.id,
      isPlayer: false,
      name_en: r.name_en,
      name_zh: r.name_zh,
      companyName: r.companyName,
      netWorth: r.companyCapital + (r.playerSharesOwned * r.sharePrice), // adjusted assets
      isBankrupt: r.isBankrupt,
      countryCode: r.countryCode,
      isFriend: r.isFriend
    }))
  ].sort((a, b) => b.netWorth - a.netWorth);

  const playerRank = leaderboard.findIndex(x => x.isPlayer) + 1;

  // Connected friends subset
  const activeLinkedFriends = rivals.filter(r => r.isFriend);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Big Color-Coded Mobile-First Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 shrink-0 bg-transparent">
        {[
          { id: 'rivals', icon: <Users size={18} />, label_en: "Forbes Rivals", label_zh: "福布斯强豪", color: 'border-yellow-800/80 hover:border-yellow-600 text-yellow-500' },
          { id: 'dreams', icon: <Coins size={18} />, label_en: "Forbes Dreams", label_zh: "福布斯大梦想", color: 'border-pink-850 hover:border-pink-600 text-pink-500' },
          { id: 'stocks', icon: <TrendingUp size={18} />, label_en: "KLSE Share Index", label_zh: "吉隆坡股市", color: 'border-teal-850 hover:border-teal-650 text-teal-500' },
          { id: 'bank', icon: <Building2 size={18} />, label_en: "BNM Central Bank", label_zh: "国家中央银行", color: 'border-indigo-850 hover:border-indigo-650 text-indigo-500' },
          { id: 'multiplayer', icon: <Share2 size={18} />, label_en: "Friends Network", label_zh: "华人商业圈", color: 'border-cyan-850 hover:border-cyan-650 text-cyan-500' }
        ].map((subTab) => {
          const active = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              id={`subtab-${subTab.id}`}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer active:translate-y-0.5 shadow-md ${
                active 
                  ? 'bg-zinc-100 text-zinc-950 border-white font-extrabold scale-[1.02]' 
                  : `bg-zinc-900/90 hover:bg-zinc-850 ${subTab.color}`
              }`}
            >
              <div className="mb-1.5">{subTab.icon}</div>
              <span className="text-[11px] font-bold tracking-tight select-none">
                {language === 'en' ? subTab.label_en : subTab.label_zh}
              </span>
            </button>
          );
        })}
      </div>

      {/* RIVALS LEADERBOARD VIEW */}
      {activeSubTab === 'rivals' && (
        <div id="rivals-board" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Users size={18} className="text-emerald-500" />
                <span>{language === 'en' ? "Global Rivals Interactive Leaderboard" : "全球玩家高管排名竞技榜"}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {language === 'en' 
                  ? "Real-time net worth ranking of global players, CEOs, and linked friends." 
                  : "依据企业固定资产持股、现金储蓄负债等指标实时生成的全球总裁竞技榜。"}
              </p>
            </div>
            <div className="bg-emerald-950/50 border border-emerald-900 text-emerald-400 text-xs font-black p-2 rounded-lg text-center">
              {language === 'en' ? `Rank # ${playerRank} / ${leaderboard.length}` : `您的全球排名：第 ${playerRank} / ${leaderboard.length} 名`}
            </div>
          </div>

          <div className="space-y-2.5">
            {leaderboard.map((comp, idx) => {
              const rankColor = idx === 0 
                ? 'bg-yellow-500 text-black' 
                : idx === 1 
                  ? 'bg-zinc-300 text-black' 
                  : idx === 2 
                    ? 'bg-amber-700 text-zinc-100' 
                    : 'bg-zinc-800 text-zinc-400';

              return (
                <div 
                  key={comp.id}
                  className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3.5 rounded-xl border transition ${
                    comp.isPlayer 
                      ? 'bg-emerald-950/20 border-emerald-500/50 shadow-md shadow-emerald-950/10' 
                      : comp.isFriend
                        ? 'bg-purple-950/10 border-purple-500/30'
                        : 'bg-zinc-950 border-zinc-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${rankColor}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                          <span>{getCountryFlag(comp.countryCode)}</span>
                          <span>{language === 'en' ? comp.name_en : comp.name_zh}</span>
                        </span>
                        {comp.isPlayer && (
                          <span className="text-[10px] font-extrabold bg-emerald-600 text-black px-1.5 rounded uppercase font-sans">
                            {language === 'en' ? "You" : "玩家"}
                          </span>
                        )}
                        {comp.isFriend && (
                          <span className="text-[10px] font-extrabold bg-purple-600 text-white px-1.5 rounded uppercase font-sans">
                            {language === 'en' ? "Linked Friend" : "联机好友"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {language === 'en' ? `Active Biz: ${comp.companyName}` : `名下主营实业: ${comp.companyName}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900 flex justify-between sm:block">
                    <span className="text-xs text-zinc-500 sm:hidden">{language === 'en' ? 'Net Worth:' : '综合身家:'}</span>
                    <span className="font-mono text-sm font-extrabold text-yellow-400">
                      {formattedMoney(comp.netWorth)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MULTIPLAYER FRIEND HUB TAB */}
      {activeSubTab === 'multiplayer' && (
        <div id="multiplayer-hub" className="space-y-6 animate-fade-in">
          
          {/* 1. Generate & Share My Code */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Share2 size={18} className="text-emerald-400" />
              <div>
                <h3 className="text-sm font-black text-white uppercase">{language === 'en' ? "My Enterprise Connection Link" : "我的专属好友联机同步代码"}</h3>
                <p className="text-xs text-zinc-400">{language === 'en' ? "Copy this code to let your friends link up and co-invest with you!" : "复制下文生成的段位代码并分享给身边的朋友，支持共同注入天使资本及对赌套利！"}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                readOnly
                value={myConnectionCode}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 font-mono text-xs text-zinc-400 focus:outline-none"
              />
              <button
                onClick={handleCopyCode}
                className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 transition active:translate-y-0.5 cursor-pointer"
              >
                {isCopied ? <CheckCircle size={14} /> : <Copy size={14} />}
                <span>{isCopied ? (language === 'en' ? "Copied!" : "复制成功") : (language === 'en' ? "Copy Code" : "复制联机码")}</span>
              </button>
            </div>
          </div>

          {/* 2. Connect Friend Code or Create Custom Friend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Sync Hub Paste */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <UserPlus size={16} className="text-indigo-400" />
                <h4 className="text-xs font-black text-zinc-200 uppercase">{language === 'en' ? "Connect Friend's Code" : "接收并连接好友的代码"}</h4>
              </div>

              <textarea
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
                placeholder={language === 'en' ? "Paste your friend's sync code start with 'biz_...' here:" : "在这里粘贴您好友发送的专属联机代码 biz_...：“"}
                className="w-full h-24 bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 font-mono text-xs text-zinc-200 focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={handleConnectFriend}
                disabled={!friendCodeInput}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-lg transition active:translate-y-0.5 cursor-pointer disabled:opacity-30"
              >
                {language === 'en' ? "Connect Real Friend Player" : "立即对接互联真实的死党玩家"}
              </button>
            </div>

            {/* Offline Sandbox Friend Creator */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2">
                <Plus size={16} className="text-emerald-400" />
                <h4 className="text-xs font-black text-zinc-200 uppercase">{language === 'en' ? "Create Simulated Partner Companion" : "自建专属死党竞争实体"}</h4>
              </div>

              <form onSubmit={handleSubmitCustomFriend} className="space-y-3">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">{language === 'en' ? "Friend Nickname" : "死党昵称"}</label>
                  <input
                    type="text"
                    required
                    value={customFriendName}
                    onChange={(e) => setCustomFriendName(e.target.value)}
                    placeholder={language === 'en' ? "e.g., Kevin" : "比如：极客老张"}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">{language === 'en' ? "Company Name" : "新设企业名称"}</label>
                  <input
                    type="text"
                    value={customFriendCompName}
                    onChange={(e) => setCustomFriendCompName(e.target.value)}
                    placeholder={language === 'en' ? "e.g., Kevin AI Matrix" : "比如：老张多模态AI"}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">{language === 'en' ? "Sector" : "主营赛道"}</label>
                    <select
                      value={customFriendSector}
                      onChange={(e) => setCustomFriendSector(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-zinc-200"
                    >
                      <option value="tech">Tech / 科技</option>
                      <option value="retail">Retail / 零售</option>
                      <option value="real_estate">Real Estate / 地产</option>
                      <option value="finance">Finance / 金融</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1 uppercase font-bold">{language === 'en' ? "Starting Valuation" : "初始注册估值"}</label>
                    <select
                      value={customFriendVal}
                      onChange={(e) => setCustomFriendVal(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-zinc-200"
                    >
                      <option value={15000}>$15,000</option>
                      <option value={50000}>$50,000</option>
                      <option value={150000}>$150,000</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-emerald-400 font-bold text-xs py-2 px-3 rounded-lg transition active:translate-y-0.5 cursor-pointer"
                >
                  {language === 'en' ? "Inject custom friend" : "快捷载入我的专属死党公司"}
                </button>
              </form>
            </div>

          </div>

          {/* 3. Link Friends Controls Grid */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
              {language === 'en' ? "Connected Friends Interactive Portal" : "互联死党圈一键融投控制台"}
            </h3>

            {activeLinkedFriends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeLinkedFriends.map((f) => {
                  const hasShares = f.playerSharesOwned > 0;
                  const customWireAmt = sendingWireAmount[f.id] || 5000;

                  return (
                    <div key={f.id} className="bg-zinc-950 border border-zinc-850 hover:border-zinc-700 transition rounded-xl p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-black text-white flex items-center gap-1">
                            <span>🤝</span>
                            <span>{language === 'en' ? f.name_en : f.name_zh}</span>
                          </h4>
                          <span className="text-[10px] text-zinc-400 uppercase font-mono bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 mt-1 inline-block">
                            {f.companySector.toUpperCase()} • {f.companyName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 block">{language === 'en' ? "Company Assets" : "公司总额"}</span>
                          <span className="text-xs font-bold font-mono text-emerald-400">${f.companyCapital.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Interactive Stocks Control inside Friend context */}
                      <div className="grid grid-cols-2 gap-2 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900 font-mono text-xs">
                        <div>
                          <span className="text-[10px] text-zinc-500 block mb-0.5">{language === 'en' ? "Stock Price" : "当下股标"}</span>
                          <span className="text-yellow-400 font-black">${f.sharePrice}/share</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-500 block mb-0.5">{language === 'en' ? "Holdings" : "我持股数"}</span>
                          <span className="text-white font-bold">{f.playerSharesOwned} Shares</span>
                        </div>
                      </div>

                      {/* Cash wire and competitive duels */}
                      <div className="space-y-2 pt-2 border-t border-zinc-900">
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <div className="flex items-center gap-1 w-full bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-850">
                            <span className="text-[10px] text-zinc-400 font-bold uppercase pl-1">{language === 'en' ? "Wire" : "调拨"}:</span>
                            <select
                              value={customWireAmt}
                              onChange={(e) => setSendingWireAmount(prev => ({ ...prev, [f.id]: Number(e.target.value) }))}
                              className="bg-zinc-950 text-zinc-200 text-xs rounded border border-zinc-800 py-0.5 px-2 select-none cursor-pointer focus:ring-0 ml-auto"
                            >
                              <option value={1000}>$1,000</option>
                              <option value={5000}>$5,000</option>
                              <option value={20000}>$20,000</option>
                            </select>
                          </div>

                          <button
                            onClick={() => onWireCashToFriend(f.id, customWireAmt)}
                            disabled={stats.money < customWireAmt}
                            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-950/65 hover:bg-emerald-900 border border-emerald-900 font-bold text-[11px] text-emerald-300 rounded-lg flex items-center justify-center gap-1 transition active:translate-y-0.5 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
                          >
                            <Send size={11} />
                            <span>{language === 'en' ? "Wire Support" : "汇算援资"}</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Standard stock helper */}
                          <button
                            onClick={() => onBuyStock(f.id)}
                            disabled={stats.money < f.sharePrice * 10}
                            className="bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold border border-zinc-800 text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition active:translate-y-0.5 cursor-pointer"
                          >
                            <Coins size={11} className="text-yellow-400" />
                            <span>{language === 'en' ? "Invest +10 Shares" : "认购十股"}</span>
                          </button>

                          {/* Business duel */}
                          <button
                            onClick={() => handleBusinessDuel(f)}
                            className="bg-zinc-900 hover:bg-purple-950 hover:text-purple-300 border border-zinc-800 hover:border-purple-900 text-zinc-300 font-bold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition active:translate-y-0.5 cursor-pointer"
                          >
                            <Zap size={11} className="text-purple-400" />
                            <span>{language === 'en' ? "Biz Summit Duel" : "商战高峰会PK"}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-zinc-950/50 rounded-xl border border-zinc-850 text-zinc-500 text-xs space-y-2">
                <Users size={20} className="mx-auto text-zinc-700" />
                <p>
                  {language === 'en' 
                    ? "No synced friends joined yet. Copy your Link Code above to invite your partner or add custom friend companion profiles." 
                    : "暂未接入互联好友。可复制上方的专属代码发往好友，或点击“联机好友创投”快捷自建，共同在挂机与商战里对冲股指！"
                  }
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* STOCK & SHARES EXCHANGE */}
      {activeSubTab === 'stocks' && (
        <div id="stock-market" className="space-y-6">
          
          {/* OWN COMPANY SHARES HUB */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Coins size={16} className="text-amber-500" />
              <span>{language === 'en' ? "Equity Financing & Own Company Shares" : "企业自主股权质押与流转"}</span>
            </h2>

            {ownCompanyValuation > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">{language === 'en' ? "Consolidated Company Value" : "企业整体估值"}</div>
                  <div className="font-mono text-lg font-bold text-emerald-400 mt-1">{formattedMoney(ownCompanyValuation)}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{language === 'en' ? "Based on Technology and Brand Asset values" : "基于企业核心账面价值与品牌熟练度综合计算"}</div>
                </div>

                <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-3">
                  <div className="text-xs text-zinc-500">{language === 'en' ? "Your Shared Holdings Percentage" : "您当前持有股权比率"}</div>
                  <div className="font-mono text-lg font-bold text-amber-400 mt-1">{ownCompanySharesPercentage}%</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{language === 'en' ? "Valued at:" : "持股账面股权财富:"} <span className="text-yellow-400 font-bold">{formattedMoney(ownCompanyValuation * (ownCompanySharesPercentage / 100))}</span></div>
                </div>

                <div className="bg-zinc-950 border border-zinc-850 p-3 flex flex-col justify-between gap-2">
                  <button
                    id="sell-equity-shares-btn"
                    onClick={() => onTradeOwnCompanyShares('sell_out')}
                    disabled={ownCompanySharesPercentage <= 10}
                    className="w-full bg-red-950 hover:bg-red-900 hover:text-red-100 text-red-300 font-bold border border-red-900 text-xs py-1.5 px-3 rounded transition cursor-pointer disabled:opacity-30"
                  >
                    {language === 'en' ? "Liquidate 5% Equity Shares" : "高管套现：转让 5% 股权 (+现金)"}
                  </button>
                  <button
                    id="buyback-equity-shares-btn"
                    onClick={() => onTradeOwnCompanyShares('buy_back')}
                    disabled={ownCompanySharesPercentage >= 100 || stats.money < ownCompanyValuation * 0.05}
                    className="w-full bg-indigo-950 hover:bg-indigo-900 hover:text-indigo-100 text-indigo-300 font-bold border border-indigo-900 text-xs py-1.5 px-3 rounded transition cursor-pointer disabled:opacity-30"
                  >
                    {language === 'en' ? "Buy Back 5% Equity" : "回购股权：吸纳 5% 股份 (-现金)"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-zinc-950 text-center rounded-lg border border-zinc-850 text-xs text-zinc-500 space-y-2">
                <ShieldAlert size={20} className="text-zinc-600 mx-auto" />
                <p>{language === 'en' ? "You must register a company first before issuing stock or managing equity shares." : "必须先在“企业经营”板块注册正式公司，才能生成并划转高管股权。"}</p>
              </div>
            )}
          </div>

          {/* RIVAL COMPANIES STOCK EXCHANGE GRAPH/TABLE */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-zinc-800 pb-3 space-y-2">
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" />
                <span>{language === 'en' ? "Kuala Lumpur & Global Stock Exchange Indexes" : "联合交割证券交易所 (吉隆坡及全球大盘指数)"}</span>
              </h2>
              <p className="text-xs text-zinc-400">
                {language === 'en'
                  ? "Toggle filters to view Bursa Malaysia (KLSE) indexes or Wall Street giants. Click any stock to project its 15-day live fluctuation trend."
                  : "可切换版位以查看吉隆坡证券交易所(KLSE 🇲🇾)蓝筹企业或国际强豪。点击任意行即可投射15期股市起伏详情表。"}
              </p>
            </div>

            {/* Quick Filter tabs for KLSE / Global Indexes */}
            <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 gap-1.5 select-none">
              {[
                { id: 'my', label_en: "Malaysia KLSE 🇲🇾", label_zh: "吉隆坡股市主板 🇲🇾" },
                { id: 'global', label_en: "Global Blue Chips 🌐", label_zh: "国际大蓝筹股 🌐" },
                { id: 'all', label_en: "All Indexes", label_zh: "全部股市标的" }
              ].map(f => (
                <button
                  key={f.id}
                  id={`filter-${f.id}`}
                  onClick={() => {
                    setMarketFilter(f.id as any);
                    // Automatically focus first company of the filtered set
                    const nextSet = rivals.filter(r => f.id === 'all' || (f.id === 'my' && r.countryCode === 'MY') || (f.id === 'global' && r.countryCode !== 'MY'));
                    if (nextSet.length > 0) {
                      setSelectedRivalId(nextSet[0].id);
                    }
                  }}
                  className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-bold transition active:translate-y-0.5 cursor-pointer ${
                    marketFilter === f.id 
                      ? 'bg-zinc-800 text-yellow-400 font-black shadow-inner shadow-zinc-950/50' 
                      : 'text-zinc-450 hover:text-zinc-200'
                  }`}
                >
                  {language === 'en' ? f.label_en : f.label_zh}
                </button>
              ))}
            </div>

            {/* Display SVG Stock Fluctuation Table/Chart */}
            {selectedRivalId && (() => {
              const activeRival = rivals.find(r => r.id === selectedRivalId);
              return activeRival ? renderStockChart(activeRival) : null;
            })()}

            <div className="text-[11px] text-zinc-500 text-center py-1 flex items-center justify-center gap-1.5 bg-zinc-950/40 rounded-lg border border-zinc-950">
              <span>💡</span>
              <span>
                {language === 'en'
                  ? "Tip: Click any ticker in the board below to project its fully detailed price trend graphs."
                  : "操盘秘诀：点击下方企业行，即可在上方渲染该股实时15阶段起伏波段K线图。"}
              </span>
            </div>

            {/* Filtered Stocks Listing */}
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {(() => {
                const filteredRivals = rivals.filter(rival => {
                  if (marketFilter === 'my') return rival.countryCode === 'MY';
                  if (marketFilter === 'global') return rival.countryCode !== 'MY';
                  return true;
                });

                if (filteredRivals.length === 0) {
                  return (
                    <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-850 text-xs text-zinc-500">
                      {language === 'en' ? "No stock listings found in this category." : "此分类下暂无股票指数挂标。"}
                    </div>
                  );
                }

                return filteredRivals.map((rival) => {
                  const totalInvestmentsVal = rival.playerSharesOwned * rival.sharePrice;
                  const canBuy = stats.money >= rival.sharePrice * 10;
                  const canSell = rival.playerSharesOwned >= 10;
                  const isSelected = rival.id === selectedRivalId;

                  const prevPrice = rival.prevSharePrices[rival.prevSharePrices.length - 2] || rival.sharePrice;
                  const isPriceUp = rival.sharePrice >= prevPrice;

                  return (
                    <div 
                      key={rival.id} 
                      onClick={() => setSelectedRivalId(rival.id)}
                      className={`cursor-pointer transition-all duration-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border ${
                        isSelected 
                          ? 'bg-zinc-900 border-yellow-500/50 shadow-md shadow-yellow-950/20' 
                          : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/60 hover:border-zinc-800'
                      }`}
                    >
                      <div className="space-y-1 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-base shrink-0">{getCountryFlag(rival.countryCode)}</span>
                          <span className="text-[10px] uppercase font-extrabold bg-indigo-950 text-indigo-300 border border-indigo-900/60 px-1.5 py-0.5 rounded leading-none">
                            {rival.companySector.toUpperCase()}
                          </span>
                          <div className="text-sm font-extrabold text-zinc-100 flex items-center gap-1.5 flex-wrap">
                            <span>{rival.companyName}</span>
                            <span className="text-xs text-zinc-400 font-semibold font-sans">({language === 'en' ? rival.name_en : rival.name_zh})</span>
                            {rival.isFriend && (
                              <span className="text-[9px] bg-purple-900/60 text-purple-300 border border-purple-800 px-1 rounded uppercase font-bold">
                                Friend
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-4 text-xs text-zinc-500 pt-1">
                          <div>
                            {language === 'en' ? "Market Cap:" : "企业市值:"}{" "}
                            <span className="text-zinc-300 font-semibold font-mono">{formattedMoney(rival.companyCapital)}</span>
                          </div>
                          <div>
                            {language === 'en' ? "Owned Shares:" : "持仓数:"}{" "}
                            <span className={rival.playerSharesOwned > 0 ? "text-emerald-400 font-bold font-mono" : "text-zinc-400 font-semibold font-mono"}>
                              {rival.playerSharesOwned} / {rival.outstandingShares}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Price Display */}
                      <div className="flex items-center gap-4 shrink-0 justify-between w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-zinc-900">
                        <div className="text-right">
                          <div className="text-[11px] text-zinc-500 font-medium">{language === 'en' ? "Stock Value" : "当前行情"}</div>
                          <div className="flex items-center gap-1.5 justify-end mt-1 font-mono">
                            <span className={`text-sm font-black ${isPriceUp ? 'text-green-400' : 'text-red-400'}`}>
                              {formattedMoney(rival.sharePrice)}
                            </span>
                            {isPriceUp ? (
                              <ArrowUpRight size={14} className="text-green-400 bg-green-950/40 rounded p-0.5" />
                            ) : (
                              <ArrowDownRight size={14} className="text-red-400 bg-red-950/40 rounded p-0.5" />
                            )}
                          </div>
                          
                          {rival.playerSharesOwned > 0 && (
                            <div className="text-[10px] text-zinc-400 mt-1">
                              {language === 'en' ? "Equity Assets:" : "账户总值:"}{" "}
                              <span className="text-amber-400 font-bold font-mono">{formattedMoney(totalInvestmentsVal)}</span>
                            </div>
                          )}
                        </div>

                        {/* Buy / Sell buttons */}
                        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation() /* Prevent double trigger from row click */}>
                          <button
                            id={`sell-${rival.id}-btn`}
                            onClick={() => onSellStock(rival.id)}
                            disabled={!canSell}
                            className="bg-red-950/80 hover:bg-red-900 border border-red-900 cursor-pointer text-red-300 text-xs font-bold py-1.5 px-3 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {language === 'en' ? "Sell 10 Shares" : "卖出10股"}
                          </button>
                          <button
                            id={`buy-${rival.id}-btn`}
                            onClick={() => onBuyStock(rival.id)}
                            disabled={!canBuy}
                            className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-900 cursor-pointer text-emerald-300 text-xs font-bold py-1.5 px-3 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {language === 'en' ? "Buy 10 Shares" : "买入10股"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* BANK BALANCES, DEPOSITS, LOANS */}
      {activeSubTab === 'bank' && (
        <div id="bank-terminal" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-400" />
                <span>{language === 'en' ? "Wall Street Central Bank" : "华尔街金融中心储蓄借贷总行"}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {language === 'en' 
                  ? "Earn safely via daily interest compound, or leverage operations using business loans." 
                  : "高安全存款每日结算复利利息，或合理利用银行商业贷款筹备买地建楼、公司注册资金。"}
              </p>
            </div>
          </div>

          {/* Quick HUD Accounts cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Savings Balance */}
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
              <div className="flex justify-between items-center select-none">
                <span className="text-xs text-zinc-500">{language === 'en' ? "Savings Deposit Account" : "定活期备用储蓄存单"}</span>
                <Percent size={14} className="text-emerald-400" />
              </div>
              <div className="font-mono text-xl font-black text-emerald-400 mt-2">{formattedMoney(stats.savingsBalance)}</div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                {language === 'en' ? "Daily yield compounding interest: +0.05% (~3.5% weekly equivalent)" : "享无风险高息福利。每日复利利息: +0.05%。存款绝无亏损。"}
              </p>
            </div>

            {/* Loan Balance */}
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
              <div className="flex justify-between items-center select-none">
                <span className="text-xs text-zinc-500">{language === 'en' ? "Commercial Loan Account" : "商业信用借贷负债"}</span>
                <ShieldAlert size={14} className="text-red-400" />
              </div>
              <div className="font-mono text-xl font-black text-red-400 mt-2">{formattedMoney(stats.loanBalance)}</div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                {language === 'en' ? "Daily interest fee: 0.15%. Non-payment reduces happiness and credit status." : "信贷风险警示。每日利息扣算: 0.15%。如遇流动性危机请尽快偿还。"}
              </p>
            </div>

            {/* Credit Score & Limits */}
            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
              <div className="flex justify-between items-center select-none">
                <span className="text-xs text-zinc-500">{language === 'en' ? "Corporate Credit Rating" : "大陆信用资质评级"}</span>
                <CheckCircle size={14} className="text-indigo-400" />
              </div>
              <div className="font-mono text-xl font-black text-indigo-400 mt-2">{stats.creditScore} {language === 'en' ? "PTS" : "分"}</div>
              <p className="text-[10px] text-zinc-500 mt-2 leading-tight">
                {language === 'en' ? `Borrowing Limit: Up to ${formattedMoney(borrowingLimit)} based on Academic background & net assets.` : `额度上限: ${formattedMoney(borrowingLimit)}（学士/硕士/博士学位和资产能使额度剧增并降低借款人风控评级）。`}
              </p>
            </div>
          </div>

          {/* Interactive input bar */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-850 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <span className="text-xs font-bold text-zinc-400">{language === 'en' ? "Execute Financial Settlement" : "快捷存取理财与还贷面额"}</span>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setBankInputAmount("500")}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] text-zinc-300"
                >
                  $500
                </button>
                <button 
                  onClick={() => setBankInputAmount("2000")}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] text-zinc-300"
                >
                  $2,000
                </button>
                <button 
                  onClick={() => setBankInputAmount("10000")}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-[11px] text-zinc-300"
                >
                  $10,000
                </button>
                <button 
                  onClick={() => setBankInputAmount(stats.money.toString())}
                  className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border-indigo-900 rounded text-[11px] text-indigo-300"
                >
                  {language === 'en' ? "Max Cash" : "全部现金"}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <span className="absolute left-3.5 top-2.5 text-zinc-500 text-xs font-mono">$</span>
                <input
                  type="number"
                  value={bankInputAmount}
                  onChange={(e) => setBankInputAmount(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-7 pr-3 text-sm text-zinc-100 font-mono focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter custom deposit quantity..."
                />
              </div>

              {/* Action buttons grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full shrink-0 lg:w-auto">
                <button
                  id="bank-deposit-btn"
                  onClick={() => {
                    if (isBankAmtValid) {
                      onBankDeposit(bankAmt);
                    }
                  }}
                  disabled={!isBankAmtValid || stats.money < bankAmt}
                  className="bg-zinc-900 hover:bg-indigo-950 hover:text-indigo-200 border border-zinc-800 hover:border-indigo-900 cursor-pointer text-zinc-300 text-xs font-bold py-2 px-3 rounded-lg transition disabled:opacity-30 whitespace-nowrap"
                >
                  {language === 'en' ? "Deposit Savings" : "现金存入储蓄"}
                </button>

                <button
                  id="bank-withdraw-btn"
                  onClick={() => {
                    if (isBankAmtValid) {
                      onBankWithdraw(bankAmt);
                    }
                  }}
                  disabled={!isBankAmtValid || stats.savingsBalance < bankAmt}
                  className="bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-200 border border-zinc-800 hover:border-emerald-900 cursor-pointer text-zinc-300 text-xs font-bold py-2 px-3 rounded-lg transition disabled:opacity-30 whitespace-nowrap"
                >
                  {language === 'en' ? "Withdraw Savings" : "储蓄提取现金"}
                </button>

                <button
                  id="bank-borrow-btn"
                  onClick={() => {
                    if (isBankAmtValid) {
                      onBankBorrow(bankAmt);
                    }
                  }}
                  disabled={!isBankAmtValid || maxCanBorrow < bankAmt}
                  className="bg-zinc-900 hover:bg-red-950 hover:text-red-300 border border-zinc-800 hover:border-red-900 cursor-pointer text-zinc-300 text-xs font-bold py-2 px-3 rounded-lg transition disabled:opacity-30 whitespace-nowrap"
                >
                  {language === 'en' ? "Take Credit Loan" : "申请信用借款"}
                </button>

                <button
                  id="bank-repay-btn"
                  onClick={() => {
                    if (isBankAmtValid) {
                      onBankRepay(bankAmt);
                    }
                  }}
                  disabled={!isBankAmtValid || stats.loanBalance < bankAmt || stats.money < bankAmt}
                  className="bg-zinc-900 hover:bg-zinc-100 hover:text-zinc-950 border border-zinc-850 cursor-pointer text-zinc-300 text-xs font-bold py-2 px-3 rounded-lg transition disabled:opacity-30 whitespace-nowrap"
                >
                  {language === 'en' ? "Repay Debt" : "还清抵消债务"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRAND CAPITAL DREAMS SUBTAB */}
      {activeSubTab === 'dreams' && (
        <div id="grand-capital-dreams" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Coins size={18} className="text-pink-400" />
                <span>{language === 'en' ? "Forbes Billionaire Capital Dreams" : "福布斯百亿大梦想与主权投资计划"}</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                {language === 'en' 
                  ? "Deploy your extreme cash piles to fund country-defining megaprojects. Boost brand prestige to legendary status!" 
                  : "投放您富裕的现金大仓，参与主笔国家级、乃至星际航天级的惊奇霸业规划。将商业声名永久载入福布斯神坛！"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: 'island',
                title_en: "Purchase Private Tropical Island",
                title_zh: "购置大马奢华热带私人整岛",
                cost: 150000,
                desc_en: "Acquire full sovereignty of a beautiful coral island in Semporna, Sabah. Unlocks extreme permanent passive +8 Happiness per day.",
                desc_zh: "在沙巴仙本那近海购置一座专属个人热带私人整岛。每天常态化永久恢复 +8 点幸福度！",
                icon: "🏝️"
              },
              {
                id: 'forbes',
                title_en: "Enlist on Forbes Wealth Leaderboard",
                title_zh: "冠名登顶福布斯新锐首富金榜",
                cost: 350000,
                desc_en: "Complete official verification of assets. Elevate your brand awareness permanently to 100%! All employees work +15% more effectively.",
                desc_zh: "聘请专业国际审计核算资产，一举跻身全球前十大首富行列。企业知名度永久强制锚定 100% 满值，全体员工研发效率额外 +15%！",
                icon: "📰"
              },
              {
                id: 'ai_city',
                title_en: "Build Malaysian Generative AI City",
                title_zh: "出资打造吉隆坡 Generative AI 科技新城",
                cost: 850000,
                desc_en: "Construct a state-of-the-art server farm and robotic tech hub. Boosts tech research multiplier by 200%. Grants +15 to your Coding with zero energy cost.",
                desc_zh: "联合大马产业园区及科技圈地，打造世界级大型GPU机房与智能新都。公司研发、技术提升速度暴增 200%！",
                icon: "🤖"
              },
              {
                id: 'space',
                title_en: "Cosmic Space Rocket Colonization",
                title_zh: "主导火星载人太空探索火箭发射项目",
                cost: 2500000,
                desc_en: "Launch the first Southeast Asian aerospace rocket to setup a self-sustaining biosphere. Gain the ultimate 'Master of the Cosmos' title and infinite status.",
                desc_zh: "发射自主命名的超重型载人航天深层火星探索火箭，搭建人类首个地外第二城市 biosphere 生态圈。立地证道全宇宙至臻商业传奇！",
                icon: "🚀"
              }
            ].map(dream => {
              const IsFunded = stats.fundedDreams?.includes(dream.id) || false;
              const canFund = stats.money >= dream.cost;
              return (
                <div 
                  key={dream.id} 
                  className={`bg-zinc-950 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    IsFunded 
                      ? 'border-pink-500 bg-pink-950/5 shadow-md shadow-pink-950/30' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-3xl select-none">{dream.icon}</span>
                      {IsFunded ? (
                        <span className="text-[10px] bg-pink-950 text-pink-400 border border-pink-700 px-2.5 py-1 rounded-full font-black animate-pulse">
                          {language === 'en' ? "ACCOMPLISHED" : "伟业达成"}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-2.5 py-1 rounded">
                          {language === 'en' ? "CAPITAL VENTURE" : "战略项目规划"}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-md font-extrabold text-zinc-100">
                        {language === 'en' ? dream.title_en : dream.title_zh}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                        {language === 'en' ? dream.desc_en : dream.desc_zh}
                      </p>
                    </div>

                    <div className="font-mono text-xs font-bold text-yellow-500 flex justify-between bg-zinc-900/40 p-2.5 rounded border border-zinc-900">
                      <span>{language === 'en' ? "Funding Goal Budget:" : "规划项目折算开支:"}</span>
                      <span className="text-yellow-400 font-extrabold">RM {dream.cost.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    {IsFunded ? (
                      <button
                        className="w-full bg-pink-950/40 text-pink-500 border border-pink-900 text-xs font-extrabold py-2.5 rounded-xl cursor-default"
                      >
                        {language === 'en' ? "Megaproject Fully Operational" : "地磁项目战略高调运行中"}
                      </button>
                    ) : (
                      <button
                        onClick={() => onFundDream && onFundDream(dream.id, dream.cost)}
                        disabled={!canFund}
                        className="cursor-pointer w-full bg-pink-600 hover:bg-pink-500 disabled:bg-zinc-850 disabled:text-zinc-600 border-none text-black disabled:opacity-30 text-xs font-black py-2.5 rounded-xl transition active:translate-y-0.5 shadow-md"
                      >
                        {language === 'en' ? "Fund Dream Project" : "出资赞助此伟业"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
