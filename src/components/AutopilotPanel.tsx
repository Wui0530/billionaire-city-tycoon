import React, { useState } from "react";
import { 
  Bot, 
  Play, 
  Pause, 
  TrendingUp, 
  Coins, 
  GraduationCap, 
  Activity, 
  Handshake, 
  Plus, 
  ArrowRightLeft, 
  DollarSign, 
  Sparkles, 
  ShieldAlert, 
  Users,
  LineChart
} from "lucide-react";
import { PlayerStats, FriendVenture, Language } from "../types";

interface AutopilotSettings {
  autoEat: boolean;
  autoHospital: boolean;
  autoStudy: boolean;
  autoTradingGrid: boolean;
}

interface AutopilotPanelProps {
  stats: PlayerStats;
  language: Language;
  autopilotEnabled: boolean;
  autopilotSettings: AutopilotSettings;
  friendVentures: FriendVenture[];
  onToggleAutopilot: (enabled: boolean) => void;
  onUpdateSettings: (settings: AutopilotSettings) => void;
  onInvestInFriend: (friendId: string, amount: number) => void;
  onCashOutFriend: (friendId: string, percentage: number) => void;
  appendLog: (en: string, zh: string, type: 'info' | 'success' | 'warning' | 'error' | 'event') => void;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  setFriendVentures: React.Dispatch<React.SetStateAction<FriendVenture[]>>;
}

export const AutopilotPanel: React.FC<AutopilotPanelProps> = ({
  stats,
  language,
  autopilotEnabled,
  autopilotSettings,
  friendVentures,
  onToggleAutopilot,
  onUpdateSettings,
  onInvestInFriend,
  onCashOutFriend,
  appendLog,
  setStats,
  setFriendVentures
}) => {
  const [investAmounts, setInvestAmounts] = useState<Record<string, number>>({
    fv_shian: 10000,
    fv_abe: 10000,
    fv_chen: 10000
  });

  const getSectorBadge = (sec: string) => {
    switch (sec) {
      case 'tech': return language === 'en' ? 'DeepTech AI' : '硬核高科技';
      case 'retail': return language === 'en' ? 'Smart Logistics' : '智慧物流仓配';
      case 'finance': return language === 'en' ? 'Quant Quant Fund' : '高频量化私募';
      default: return sec;
    }
  };

  const handleUpdateToggle = (key: keyof AutopilotSettings) => {
    onUpdateSettings({
      ...autopilotSettings,
      [key]: !autopilotSettings[key]
    });
  };

  const executeInvest = (friend: FriendVenture) => {
    const amt = investAmounts[friend.id] || 10000;
    if (stats.money < amt) {
      alert(language === 'en' ? "Insufficient dynamic funds for this investment!" : "手头流动现金不足，无法注入跟投资金！");
      return;
    }

    // Gained ownership percentage = (investment / current company valuation) * 100
    const ownershipGained = Number(((amt / friend.currentValuation) * 100).toFixed(2));
    
    setStats(prev => ({ ...prev, money: prev.money - amt }));
    setFriendVentures(prev => prev.map(fv => {
      if (fv.id === friend.id) {
        return {
          ...fv,
          amountInvested: fv.amountInvested + amt,
          playerOwnershipPercent: Number((fv.playerOwnershipPercent + ownershipGained).toFixed(2))
        };
      }
      return fv;
    }));

    appendLog(
      `Injected seed capital of $${amt.toLocaleString()} in '${friend.companyName}'. Gained +${ownershipGained}% equity.`,
      `成功向好友企业【${friend.companyName}】跟投资金 $${amt.toLocaleString()}！占股比例额外高增 +${ownershipGained}%。`,
      "success"
    );
  };

  const executeCashoutFraction = (friend: FriendVenture, percentToSell: number) => {
    if (friend.playerOwnershipPercent <= 0) return;
    
    // clamp percent to what's owned
    const actualPercentToSell = Math.min(friend.playerOwnershipPercent, percentToSell);
    const sharesValueToExtract = Math.floor(friend.currentValuation * (actualPercentToSell / 100));

    if (sharesValueToExtract <= 0) return;

    setStats(prev => ({ ...prev, money: prev.money + sharesValueToExtract }));
    setFriendVentures(prev => prev.map(fv => {
      if (fv.id === friend.id) {
        const remainingOwnership = Number((fv.playerOwnershipPercent - actualPercentToSell).toFixed(2));
        return {
          ...fv,
          playerOwnershipPercent: remainingOwnership,
          amountInvested: remainingOwnership === 0 ? 0 : Math.max(0, fv.amountInvested - sharesValueToExtract)
        };
      }
      return fv;
    }));

    appendLog(
      `Cashed out ${actualPercentToSell}% startup equity of '${friend.companyName}', receiving $${sharesValueToExtract.toLocaleString()} dynamic liquidity cash.`,
      `完成了结清盘！转让好友企业【${friend.companyName}】的 ${actualPercentToSell}% 股份，顺利套取商业流动资金 +$${sharesValueToExtract.toLocaleString()}！`,
      "success"
    );
  };

  return (
    <div id="autopilot-tab-panel" className="space-y-6 animate-fade-in text-sans">
      
      {/* SECTION 1: MASTER AUTOPILOT TOGGLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm relative overflow-hidden">
        {/* Decorative background glow */}
        <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 transition-colors duration-500 ${autopilotEnabled ? "bg-emerald-500" : "bg-zinc-600"}`} />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bot size={20} className={autopilotEnabled ? "text-emerald-400 animate-pulse" : "text-zinc-500"} />
              <h2 className="text-md font-bold tracking-tight text-white uppercase">
                {language === 'en' ? "Simulated CEO Autopilot & AI Assistant" : "智脑 AI 挂机托管 & 辅助系统"}
              </h2>
            </div>
            <p className="text-xs text-zinc-400">
              {language === 'en' 
                ? "Turn on Autopilot and watch your career progress safely in real-time. The AI will make optimal survival, and micro-investment decisions on every transition."
                : "开启AI挂机托管。系统将在每日度过中自适应执行合理饮食、就诊理疗、自动MBA精进以及竞争股网格抄底套利，解放双手！"
              }
            </p>
          </div>

          <button
            id="toggle-autopilot-master-btn"
            onClick={() => onToggleAutopilot(!autopilotEnabled)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer active:translate-y-0.5 ${
              autopilotEnabled 
                ? "bg-red-650 hover:bg-red-650 text-white border-red-700 shadow-lg shadow-red-950/20" 
                : "bg-emerald-600 hover:bg-emerald-500 text-black border-emerald-600 shadow-lg shadow-emerald-950/40"
            }`}
          >
            {autopilotEnabled ? (
              <>
                <Pause size={14} className="fill-white" />
                <span>{language === 'en' ? "PAUSE AUTOPILOT" : "暂停 AI 挂机"}</span>
              </>
            ) : (
              <>
                <Play size={14} className="fill-black" />
                <span>{language === 'en' ? "ENGAGE AUTOPILOT" : "开启 AI 自动挂机"}</span>
              </>
            )}
          </button>
        </div>

        {autopilotEnabled && (
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 flex items-start gap-2.5">
            <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed text-emerald-300">
              <strong>{language === 'en' ? "Auto-Ticking Active" : "自动前进中 — AI智脑核心正常"}</strong>: 
              {language === 'en' 
                ? " Simulated 1 Day passes every 1.8 seconds. Dynamic events are bypassed or resolved automatically based on your customized rules below."
                : " 模拟系统正在在后台以每 1.8 秒一天的极速频率运转。如遇到拦截重组或体能预警，AI会自动进行生存决策防御。"
              }
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: AUTOPILOT DECISION CHANNELS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Survival bots box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
            <Activity size={14} className="text-emerald-400" />
            <span>{language === 'en' ? "Survival Metabolism Guards" : "生存指标自动防护"}</span>
          </h3>

          <div className="space-y-3">
            {/* Auto Eat */}
            <div className="flex items-start justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-850 transition">
              <div className="space-y-0.5 max-w-[80%]">
                <label className="text-xs font-bold text-zinc-200 block select-none cursor-pointer" htmlFor="auto-eat-toggle">
                  {language === 'en' ? "Auto-Eat Food" : "自适应外卖餐饮"}
                </label>
                <span className="text-[10px] text-zinc-500 block leading-tight">
                  {language === 'en' 
                    ? "If Energy <= 30, buy Michelin dinner ($45) or quick snacks ($22) depending on wallet cash." 
                    : "精力低于30时，自动采购商务正餐($45)或咖啡甜品($22)瞬间充能。"
                  }
                </span>
              </div>
              <input
                id="auto-eat-toggle"
                type="checkbox"
                checked={autopilotSettings.autoEat}
                onChange={() => handleUpdateToggle("autoEat")}
                className="w-4 h-4 rounded text-emerald-600 bg-zinc-800 border-zinc-700 accent-emerald-500 cursor-pointer focus:ring-0 focus:ring-offset-0 mt-1"
              />
            </div>

            {/* Auto hospital checkup */}
            <div className="flex items-start justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-850 transition">
              <div className="space-y-0.5 max-w-[80%]">
                <label className="text-xs font-bold text-zinc-200 block select-none cursor-pointer" htmlFor="auto-hospital-toggle">
                  {language === 'en' ? "Defensive Hospitalization Check" : "自适应诊所极速体检"}
                </label>
                <span className="text-[10px] text-zinc-500 block leading-tight">
                  {language === 'en' 
                    ? "If Health <= 46, trigger Hospital diagnosis ($200) to keep career from ICU bedridden dismissal." 
                    : "健康值跌至46以下时，自动求医理疗($200)，绝对规避ICU昏迷、罚款及职业解聘任。"
                  }
                </span>
              </div>
              <input
                id="auto-hospital-toggle"
                type="checkbox"
                checked={autopilotSettings.autoHospital}
                onChange={() => handleUpdateToggle("autoHospital")}
                className="w-4 h-4 rounded text-emerald-600 bg-zinc-800 border-zinc-700 accent-emerald-500 cursor-pointer focus:ring-0 focus:ring-offset-0 mt-1"
              />
            </div>
          </div>
        </div>

        {/* Commercial and Micro-trading bots */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-black text-zinc-300 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
            <TrendingUp size={14} className="text-emerald-400" />
            <span>{language === 'en' ? "Wealth & Career Automation" : "商业理财与自我精进自动运作"}</span>
          </h3>

          <div className="space-y-3">
            {/* Auto skill build seminars */}
            <div className="flex items-start justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-850 transition">
              <div className="space-y-0.5 max-w-[80%]">
                <label className="text-xs font-bold text-zinc-200 block select-none cursor-pointer" htmlFor="auto-study-toggle">
                  {language === 'en' ? "Auto MBA Seminar Education" : "晚间MBA峰会沙龙研学"}
                </label>
                <span className="text-[10px] text-zinc-500 block leading-tight">
                  {language === 'en' 
                    ? "If cash >= $260, spend $75 daily to gain +1 randomly in Business, Management, or Negotiation." 
                    : "闲置资金超 $260 时，每日抽资 $75 进行商会研学，自动叠叠商业硬手段属性。"
                  }
                </span>
              </div>
              <input
                id="auto-study-toggle"
                type="checkbox"
                checked={autopilotSettings.autoStudy}
                onChange={() => handleUpdateToggle("autoStudy")}
                className="w-4 h-4 rounded text-emerald-600 bg-zinc-800 border-zinc-700 accent-emerald-500 cursor-pointer focus:ring-0 focus:ring-offset-0 mt-1"
              />
            </div>

            {/* Auto Trading Grid */}
            <div className="flex items-start justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-900 hover:border-zinc-850 transition">
              <div className="space-y-0.5 max-w-[80%]">
                <label className="text-xs font-bold text-zinc-200 block select-none cursor-pointer" htmlFor="auto-trading-toggle">
                  {language === 'en' ? "Micro-Trading Stock Grid Bot" : "高频股票对冲套利网格手"}
                </label>
                <span className="text-[10px] text-zinc-500 block leading-tight">
                  {language === 'en' 
                    ? "Quant grid buying competitor stocks at floor dips (budget $350) and auto-selling at peak prices." 
                    : "高能对冲网格：自动在标的超跌时吸入低筹股票，在短线上涨高位时全仓收割获利变现！"
                  }
                </span>
              </div>
              <input
                id="auto-trading-toggle"
                type="checkbox"
                checked={autopilotSettings.autoTradingGrid}
                onChange={() => handleUpdateToggle("autoTradingGrid")}
                className="w-4 h-4 rounded text-emerald-600 bg-zinc-800 border-zinc-700 accent-emerald-500 cursor-pointer focus:ring-0 focus:ring-offset-0 mt-1"
              />
            </div>
          </div>
        </div>

      </div>

      {/* SECTION 3: FRIEND VENTURE CLUB */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-zinc-800 pb-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={16} className="text-emerald-400" />
              <span>{language === 'en' ? "VC Friends Angel Investment Club" : "友谊创投朋友圈 & 独角兽跟投天使汇"}</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {language === 'en' 
                ? "Your top entrepreneur friends have founded global ventures. Buy secondary round shares or cash out to exit their equity anytime!"
                : "您的死党创客们（极客施安、阿贝、老陈）已在各大黄金赛道立项。支持向他们的初创独角兽注入天使轮款并在升值后高溢价套套现！"
              }
            </p>
          </div>

          <div className="bg-zinc-950 px-3 py-1.5 border border-zinc-850 rounded-lg flex items-center gap-2 font-mono text-xs">
            <Coins size={14} className="text-yellow-400" />
            <span className="text-zinc-400 uppercase text-[9px] font-bold">{language === 'en' ? "My Balance" : "可用流动现汇"}:</span>
            <span className="text-yellow-300 font-bold">${stats.money.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {friendVentures.map((friend) => {
            const hasShares = friend.playerOwnershipPercent > 0;
            const absoluteExitValue = Math.floor(friend.currentValuation * (friend.playerOwnershipPercent / 100));
            const specInvestAmt = investAmounts[friend.friendName_en] || investAmounts[friend.id] || 10000;
            
            return (
              <div 
                key={friend.id} 
                id={`friend-card-${friend.id}`}
                className="bg-zinc-950 border border-zinc-850 rounded-xl p-4.5 space-y-4 hover:border-zinc-700 transition-all flex flex-col justify-between"
              >
                {/* Header Information */}
                <div>
                  <div className="flex items-start justify-between min-h-[46px] gap-2">
                    <div>
                      <h4 className="text-xs font-black text-white leading-tight">
                        {language === 'en' ? friend.friendName_en : friend.friendName_zh}
                      </h4>
                      <p className="text-[10px] text-emerald-400 font-medium font-sans mt-0.5">{getSectorBadge(friend.sector)}</p>
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase shrink-0">
                      {friend.sector.toUpperCase()}
                    </div>
                  </div>

                  <div className="border-t border-zinc-900/80 pt-3 my-2 text-[10.5px] leading-tight text-zinc-400">
                    <span className="text-zinc-500 font-bold uppercase text-[9px] block mb-1">{language === 'en' ? "Current Status" : "商业动态"}:</span>
                    <span className="italic">"{language === 'en' ? friend.status_en : friend.status_zh}"</span>
                  </div>

                  {/* Financial status detail rows */}
                  <div className="space-y-1.5 pt-2 font-mono text-xs select-none">
                    <div className="flex justify-between items-center bg-zinc-900/30 p-1 rounded">
                      <span className="text-zinc-500 text-[10px]">{language === 'en' ? "Total Valuation" : "企业总估值"}:</span>
                      <span className="text-white font-bold">${friend.currentValuation.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between items-center bg-zinc-900/30 p-1 rounded">
                      <span className="text-zinc-500 text-[10px]">{language === 'en' ? "My Equity Owned" : "持有天使股比"}:</span>
                      <span className={`font-black ${hasShares ? "text-emerald-400" : "text-zinc-500"}`}>
                        {friend.playerOwnershipPercent}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-zinc-900/30 p-1 rounded">
                      <span className="text-zinc-500 text-[10px]">{language === 'en' ? "Current Value" : "我持股公允价值"}:</span>
                      <span className={`font-bold ${hasShares ? "text-yellow-300" : "text-zinc-500"}`}>
                        ${absoluteExitValue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* High Quality visual representation chart of valuations */}
                  <div className="pt-3">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                      {language === 'en' ? "Growth Trend" : "估值走势波幅"}
                    </span>
                    <div className="h-10 bg-zinc-900/80 rounded-lg flex items-end gap-1 px-2.5 py-1.5 border border-zinc-900">
                      {friend.growthHistory && friend.growthHistory.map((val, idx) => {
                        const maxVal = Math.max(...friend.growthHistory, 1);
                        const minVal = Math.min(...friend.growthHistory, 0);
                        const range = maxVal - minVal || 1;
                        const heightPct = Math.max(10, Math.min(100, Math.round(((val - minVal) / range) * 100)));
                        
                        return (
                          <div 
                            key={idx}
                            title={`$${val.toLocaleString()}`}
                            className="bg-emerald-600/75 hover:bg-emerald-500 flex-1 hover:brightness-125 transition-all text-[1px] select-none rounded-t-sm"
                            style={{ height: `${heightPct}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Operations buttons bar */}
                <div className="pt-3 space-y-3.5 border-t border-zinc-900">
                  {/* Select investment amount dropdown */}
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-black">{language === 'en' ? "Venture Amount" : "注入跟股金额"}:</span>
                    <select
                      value={specInvestAmt}
                      onChange={(e) => {
                        const nextVal = parseInt(e.target.value, 10);
                        setInvestAmounts(prev => ({ ...prev, [friend.id]: nextVal }));
                      }}
                      className="bg-zinc-900 text-zinc-300 text-xs border border-zinc-800 rounded px-1.5 py-1 focus:ring-0 cursor-pointer"
                    >
                      <option value={2000}>$2,000</option>
                      <option value={10000}>$10,000</option>
                      <option value={50000}>$50,000</option>
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => executeInvest(friend)}
                      className="flex-1 bg-zinc-900 hover:bg-emerald-950 hover:text-emerald-300 py-1.5 rounded-lg text-[11px] font-bold border border-zinc-800 hover:border-emerald-900 transition flex items-center justify-center gap-1 active:translate-y-0.5 cursor-pointer text-zinc-300"
                    >
                      <Plus size={12} className="text-emerald-400" />
                      <span>{language === 'en' ? "Inject seed" : "天使注入"}</span>
                    </button>

                    <button
                      disabled={!hasShares}
                      onClick={() => executeCashoutFraction(friend, friend.playerOwnershipPercent)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1 active:translate-y-0.5 cursor-pointer ${
                        hasShares 
                          ? "bg-amber-600 hover:bg-amber-500 text-black border-amber-600" 
                          : "bg-zinc-900 text-zinc-650 border-zinc-900 opacity-30 cursor-not-allowed"
                      }`}
                    >
                      <ArrowRightLeft size={11} />
                      <span>{language === 'en' ? "Exit Shares" : "高位套现"}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
