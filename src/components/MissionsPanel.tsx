import React, { useState } from "react";
import { 
  Award, 
  Target, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  HelpCircle, 
  Calendar, 
  Zap, 
  Sparkles, 
  ArrowUpRight, 
  Lock, 
  Play, 
  Clock, 
  Heart,
  Undo2
} from "lucide-react";
import { Mission, PlayerStats, Language } from "../types";
import { i18n } from "../i18n";
import { motion, AnimatePresence } from "motion/react";

interface MissionsPanelProps {
  missions: Mission[];
  stats: PlayerStats;
  language: Language;
  playerNetWorth: number;
  onClaimDailyReward: (doubleReward: boolean) => void;
  onPrestigeRebirth: () => void;
  onTriggerRewardAd: (tag: string, callback: () => void) => void;
  playAudioBeep: (type: 'coin' | 'levelup' | 'achievement' | 'alert') => void;
}

// Daily rewards structures
const DAILY_REWARDS_LIST = [
  { dayNum: 1, label_en: "+RM 150 Cash", label_zh: "奖马币 RM150", multiplier: 1, icon: "💵" },
  { dayNum: 2, label_en: "+RM 350 Cash", label_zh: "奖马币 RM350", multiplier: 1, icon: "💰" },
  { dayNum: 3, label_en: "+RM 800 Cash & Energy", label_zh: "金创奖 RM800 + 体能", multiplier: 1.5, icon: "⚡" },
  { dayNum: 4, label_en: "+RM 1,800 Business Gift", label_zh: "奖创业金 RM1,800", multiplier: 2, icon: "🎁" },
  { dayNum: 5, label_en: "+RM 4,000 Corporate Bonus", label_zh: "管理红星 RM4,000", multiplier: 2.5, icon: "✨" },
  { dayNum: 6, label_en: "+RM 9,500 Prestige Core", label_zh: "超值红利 RM9,500", multiplier: 3, icon: "💎" },
  { dayNum: 7, label_en: "+RM 22,000 Rare Silicon Upgrade", label_zh: "硅谷智造馆 RM22,000 & 科技加满", multiplier: 5, icon: "🏆" }
];

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  stats,
  language,
  playerNetWorth,
  onClaimDailyReward,
  onPrestigeRebirth,
  onTriggerRewardAd,
  playAudioBeep
}) => {
  const t = i18n[language];
  const [activeTab, setActiveTab] = useState<'missions' | 'daily' | 'prestige'>('missions');

  const skillsList = [
    { id: "business", label_en: "Corporate Commerce", label_zh: "商业拓展/战略规划", color: "bg-amber-500", val: stats.skills.business },
    { id: "management", label_en: "Team Leadership", label_zh: "团队协作与运营管理", color: "bg-indigo-500", val: stats.skills.management },
    { id: "coding", label_en: "Full Stack Coding", label_zh: "全栈开发与工程科技", color: "bg-emerald-500", val: stats.skills.coding },
    { id: "construction", label_en: "Civil Construction", label_zh: "工民建与地产施工", color: "bg-cyan-500", val: stats.skills.construction },
    { id: "negotiation", label_en: "Tactical Rhetoric", label_zh: "博弈妥协商务谈判", color: "bg-pink-500", val: stats.skills.negotiation }
  ];

  // Daily claimed state calculation
  const todayStr = new Date().toDateString();
  const claimedToday = stats.lastDailyRewardClaimedDate === todayStr;
  const currentStreak = stats.dailyRewardStreak ?? 0; // index from 0 to 6

  const prestigeRequirement = 50000;
  const canPrestige = playerNetWorth >= prestigeRequirement;
  const currentPrestigeMultiplier = stats.prestigeMultiplier || 1.0;

  return (
    <div className="space-y-6">
      
      {/* 3 Retention Sub-Navigation Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-900 gap-1 select-none">
        <button
          onClick={() => { setActiveTab('missions'); playAudioBeep('coin'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition duration-250 cursor-pointer ${
            activeTab === 'missions' 
              ? 'bg-zinc-900 border border-zinc-800 text-yellow-400 font-black' 
              : 'text-zinc-450 hover:text-zinc-200'
          }`}
        >
          <Target size={14} />
          <span>{language === 'en' ? "Milestone Objectives" : "个人发展里程碑"}</span>
        </button>
        <button
          onClick={() => { setActiveTab('daily'); playAudioBeep('coin'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition duration-250 cursor-pointer relative ${
            activeTab === 'daily' 
              ? 'bg-zinc-900 border border-zinc-800 text-yellow-400 font-black' 
              : 'text-zinc-450 hover:text-zinc-200'
          }`}
        >
          <Calendar size={14} />
          <span>{language === 'en' ? "Daily Rewards" : "登入每日福袋"}</span>
          {!claimedToday && (
            <span className="absolute top-1.5 right-2 px-1 py-0.5 bg-red-500 text-[8px] text-white font-mono font-bold animate-pulse rounded-full font-bold">
              CLAIM
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveTab('prestige'); playAudioBeep('coin'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition duration-250 cursor-pointer ${
            activeTab === 'prestige' 
              ? 'bg-zinc-900 border border-zinc-800 text-yellow-400 font-black' 
              : 'text-zinc-450 hover:text-zinc-200'
          }`}
        >
          <Zap size={14} />
          <span>{language === 'en' ? "Prestige & Rebirth" : "企业传承与百倍涅盘"}</span>
          {(stats.prestigeCount ?? 0) > 0 && (
            <span className="px-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] rounded font-bold">
              {stats.prestigeCount}★
            </span>
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: MISSIONS & MILESTONES */}
        {activeTab === 'missions' && (
          <motion.div
            key="tab-missions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* LEFT: MISSIONS & MILESTONES */}
            <div id="missions-column" className="lg:col-span-7 bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
              <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase text-zinc-300 tracking-wider flex items-center gap-1.5">
                  <Target size={15} className="text-indigo-400" />
                  <span>{t.missionsTitle}</span>
                </h3>
                <span className="text-xs font-mono font-bold text-zinc-400">
                  {missions.filter(m => m.completed).length} / {missions.length} Done
                </span>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {missions.map((mission) => (
                  <div
                    key={mission.id}
                    id={`mission-card-${mission.id}`}
                    className={`bg-zinc-950 border p-3.5 rounded-xl flex items-start gap-3 transition-all ${
                      mission.completed 
                        ? "border-emerald-920 bg-emerald-950/5 text-zinc-350" 
                        : "border-zinc-850 hover:border-zinc-800 text-zinc-400"
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">
                      {mission.completed ? (
                        <CheckCircle2 size={17} className="text-emerald-400" />
                      ) : (
                        <Circle size={17} className="text-zinc-650" />
                      )}
                    </span>

                    <div className="space-y-1 w-full">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <h4 className={`text-sm font-bold ${mission.completed ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>
                          {language === 'en' ? mission.title_en : mission.title_zh}
                        </h4>
                        
                        <span className="text-[10px] font-mono text-yellow-400 font-bold bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-850 w-fit">
                          {language === 'en' ? 'Bonus' : '励'}: +RM {mission.rewardMoney.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-500 leading-normal max-w-xl">
                        {language === 'en' ? mission.desc_en : mission.desc_zh}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: PROFESSIONAL SKILLS SCORECARD */}
            <div id="skills-column" className="lg:col-span-5 bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-4">
              <div className="border-b border-zinc-800 pb-3">
                <h3 className="text-xs font-extrabold uppercase text-zinc-300 tracking-wider flex items-center gap-1.5">
                  <Award size={15} className="text-yellow-400" />
                  <span>{language === 'en' ? 'Professional Skills Index' : '综合职业技能指数'}</span>
                </h3>
              </div>

              <div className="space-y-4 py-1">
                {skillsList.map((skill) => (
                  <div key={skill.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-zinc-450 font-medium select-none">
                      <span className="text-zinc-300">{language === 'en' ? skill.label_en : skill.label_zh}</span>
                      <span className="font-mono text-zinc-100 font-bold">{skill.val} / 100</span>
                    </div>

                    <div className="bg-zinc-950 p-1 text-xs rounded-lg border border-zinc-900 flex items-center">
                      <div className="flex-1 bg-zinc-850 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${skill.color}`}
                          style={{ width: `${Math.min(100, skill.val)}%` }}
                        />
                      </div>
                      <TrendingUp size={11} className="text-zinc-650 shrink-0 ml-2" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-850">
                <div className="flex items-start gap-2.5">
                  <HelpCircle size={15} className="text-indigo-400 mt-0.5" />
                  <div className="space-y-1 text-xs text-zinc-500 leading-normal">
                    <span className="font-bold text-zinc-300 block">{language === 'en' ? 'How to grow these indices?' : '如何有效增长这些技能？'}</span>
                    <p>
                      {language === 'en'
                        ? "Enroll in focused professional seminars inside the Life panel or acquire hands-on experience through day-to-day employment!"
                        : "前往生活版块购买并参与各项专题短训班，或入职日常工作累积实操工作经验！"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DAILY REWARDS (SPONSOR & AD SUPPORTED) */}
        {activeTab === 'daily' && (
          <motion.div
            key="tab-daily"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-6"
          >
            <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-black text-zinc-100 flex items-center gap-1.5 uppercase">
                  <Calendar size={16} className="text-emerald-400 animate-pulse" />
                  <span>{language === 'en' ? "Continuous 7-Day High-Revenue Rewards Tracker" : "新财富领主 · 连续 7 日尊享福袋"}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-normal">
                  {language === 'en'
                    ? "Log in each day to claim essential cash bonuses. Watch a short Sponsor video to double the current payout!"
                    : "在大马吉隆坡每天拼搏奋斗，按期登入即可划拨现金包。赞助看广告更能使福袋收益翻番 200%！"}
                </p>
              </div>

              <div className="shrink-0 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-2 font-mono text-xs text-zinc-400">
                {language === 'en' ? "Active Streak:" : "当前连续天数:"} <span className="text-emerald-400 font-black text-sm">{currentStreak} / 7</span>
              </div>
            </div>

            {/* 7 Days Grid */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3.5">
              {DAILY_REWARDS_LIST.map((reward, idx) => {
                const isClaimed = idx < currentStreak;
                const isCurrent = idx === currentStreak && !claimedToday;
                const isLocked = idx > currentStreak || (idx === currentStreak && claimedToday);

                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl p-3.5 flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-300 ${
                      isClaimed 
                        ? 'bg-emerald-950/10 border-emerald-900/60 text-zinc-400' 
                        : isCurrent 
                          ? 'bg-zinc-950 border-emerald-400 shadow-lg shadow-emerald-950/30 scale-102 ring-2 ring-emerald-500/20' 
                          : 'bg-zinc-950/60 border-zinc-850 text-zinc-600'
                    }`}
                  >
                    {/* Glowing highlight for active */}
                    {isCurrent && (
                      <div className="absolute top-0 right-0 bg-red-500 text-[8px] text-white font-black px-1.5 py-0.5 rounded-bl uppercase animate-pulse">
                        Ready
                      </div>
                    )}
                    {isClaimed && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                      </div>
                    )}

                    <span className="text-3xl filter saturate-75 opacity-90 block my-1">
                      {reward.icon}
                    </span>

                    <div className="space-y-1 mt-2">
                      <div className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                        {language === 'en' ? `Day ${reward.dayNum}` : `第 ${reward.dayNum} 天`}
                      </div>
                      <div className={`text-[11px] font-black ${isCurrent ? 'text-zinc-100' : isClaimed ? 'text-zinc-500 line-through' : 'text-zinc-500'}`}>
                        {language === 'en' ? reward.label_en : reward.label_zh}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Claim Hub Action triggers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950 p-5 rounded-2xl border border-zinc-850/80">
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider block font-mono">
                  {language === 'en' ? "Today's Bonus Package Slot:" : "今日结算区状态:"}
                </span>
                
                {claimedToday ? (
                  <div className="text-zinc-500 text-xs flex items-center gap-1.5 font-sans leading-relaxed">
                    <Clock size={13} className="text-zinc-650" />
                    <span>
                      {language === 'en' 
                        ? "Bonus claimed. Next packet unlocks in 24 hours of local real-world sequence." 
                        : "您今日已领取红利包！请安心发展，明天的连续登入福袋将在24小时自然日更替后解锁。"}
                    </span>
                  </div>
                ) : (
                  <div className="text-zinc-350 text-xs font-sans leading-relaxed">
                    <Sparkles className="text-emerald-400 inline mr-1" size={12} />
                    <span>
                      {language === 'en'
                        ? `A credit of RM ${((currentStreak + 1) * 200).toLocaleString()} is ready for instantaneous transfer.`
                        : `今日第 ${currentStreak + 1} 期登入，您可直接划拨基础奖金 RM ${((currentStreak + 1) * 200).toLocaleString()}。`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-end items-center">
                {!claimedToday ? (
                  <>
                    <button
                      id="claim-normal-reward-btn"
                      onClick={() => onClaimDailyReward(false)}
                      className="w-full sm:w-auto px-5 py-3 cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-black uppercase rounded-xl transition font-sans"
                    >
                      {language === 'en' ? "Claim Base Bonus" : "普通领取现金"}
                    </button>
                    <button
                      id="claim-double-ad-reward"
                      onClick={() => {
                        onTriggerRewardAd("claim_rewards_double", () => {
                          onClaimDailyReward(true);
                        });
                      }}
                      className="w-full sm:w-auto px-5 py-3 cursor-pointer bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-black uppercase rounded-xl hover:shadow-lg hover:shadow-yellow-900/30 transition flex items-center justify-center gap-2"
                    >
                      <Play size={13} fill="currentColor" />
                      <span>{language === 'en' ? "Watch Ad to x2 CLAIM!" : "赞助推荐：看广告双倍领 RM!"}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2.5 items-center w-full justify-end">
                    <p className="text-[11px] text-zinc-500 font-sans text-right hidden sm:block">
                      {language === 'en' ? "Want more emergency capital? Watch a fast ad!" : "缺乏创业过桥资金？看条赞助领应急金！"}
                    </p>
                    <button
                      id="emergency-cash-ad-btn"
                      onClick={() => {
                        onTriggerRewardAd("emergency_cash", () => {
                          // Award emergency funds instant
                          onClaimDailyReward(false); // standard claim mechanics adds capital
                        });
                      }}
                      className="w-full sm:w-auto px-5 py-3 cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-yellow-500 border border-yellow-500/30 text-xs font-black uppercase rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Play size={12} fill="currentColor" />
                      <span>{language === 'en' ? "Watch Ad for +RM 1,500 Cash" : "赞助领应急：看广告 +RM 1,500"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: PRESTIGE & REBIRTH */}
        {activeTab === 'prestige' && (
          <motion.div
            key="tab-prestige"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-6"
          >
            <div className="border-b border-zinc-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-zinc-100 flex items-center gap-1.5 uppercase">
                  <Zap size={16} className="text-amber-400 rotate-12" />
                  <span>{language === 'en' ? "Prestige Rebirth & Permanent Multiplier Engine" : "企业百倍传承 · 永恒创收倍增器模式"}</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-normal font-sans">
                  {language === 'en'
                    ? "Reset current assets, properties, houses, and education in exchange for a permanent 1.5x stackable modifier to all work, passive, and firm profits!"
                    : "传承您的商业基业！清空流动资金并重置名下企业的初级进程，以继承永恒的 1.5 倍全剧创收永久加成（多周目可无限叠加）！"}
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-2xl flex items-center gap-3">
                <div className="text-center">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">{language === 'en' ? "Multiplier" : "当前全局增益"}</span>
                  <span className="font-mono text-xl font-black text-yellow-400">{currentPrestigeMultiplier.toFixed(1)}x</span>
                </div>
                <div className="w-px h-8 bg-zinc-800" />
                <div className="text-center">
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">{language === 'en' ? "Inherited Tier" : "累计功德代数"}</span>
                  <span className="font-mono text-xl font-black text-emerald-400">{stats.prestigeCount ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Requirements Progress Tracker */}
            <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-450 font-bold uppercase font-mono tracking-wider">{language === 'en' ? "System Legacy Verification:" : "大马商界功绩检验分："}</span>
                <span className="font-mono font-black text-zinc-200">
                  RM {Math.floor(playerNetWorth).toLocaleString()} / RM {prestigeRequirement.toLocaleString()} {language === 'en' ? "Net Worth" : "总身价"}
                </span>
              </div>

              {/* Progress bar and markers */}
              <div className="h-3.5 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (playerNetWorth / prestigeRequirement) * 100)}%` }}
                />
              </div>

              {canPrestige ? (
                <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-3.5 rounded-xl text-xs leading-relaxed font-sans">
                  🏆 <strong className="uppercase">{language === 'en' ? "Legacy Check Success!" : "大业已成 · 准许传承重组！"}</strong>
                  <p className="mt-1">
                    {language === 'en' 
                      ? `Your outstanding leadership of RM ${Math.floor(playerNetWorth).toLocaleString()} net worth qualifies you to prestige. A brand new x${(currentPrestigeMultiplier + 0.5).toFixed(1)} modifier is ready!` 
                      : `您以 RM ${Math.floor(playerNetWorth).toLocaleString()} 的辉煌身价成功登峰造极。传承不仅让您重新执掌全局，还将永久解锁 x${(currentPrestigeMultiplier + 0.5).toFixed(1)} 全局收益增幅！`}
                  </p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-850 text-zinc-450 p-3.5 rounded-xl text-xs leading-relaxed font-mono">
                  🔒 <strong className="uppercase">{language === 'en' ? "Minimum requirements not met" : "大宗资产尚且需要积累"}</strong>
                  <p className="mt-1">
                    {language === 'en' 
                      ? "You must reach RM 50,000 overall Net Worth (Cash + Bank Savings + Property Values + Own Company Equity) to trigger this." 
                      : `目前进度：${((playerNetWorth / prestigeRequirement) * 100).toFixed(1)}%。名下净资产(包含手头现金、银行存款、房产估值及自主企业估值)累计突破 RM 50,000 即可解锁传承大赏。`}
                  </p>
                </div>
              )}
            </div>

            {/* Prestige Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-zinc-950/40 p-5 border border-zinc-850/60 rounded-2xl text-xs leading-relaxed">
              <div className="space-y-1.5 text-zinc-500 font-sans">
                <span className="font-bold text-zinc-300 text-sm block">⚠️ {language === 'en' ? "Warning of safe-reset items:" : "传承重组清算警示："}</span>
                <p>
                  {language === 'en'
                    ? "WILL RESET: Hands-on cash, house blocks, corporate tier, and school degrees. WILL KEEP: Complete achievements, professional skill counts, and unlock permanent premium multipliers."
                    : "重组清算清单：清空当下现金、商铺、住宅地皮及学历阶梯；保留个人终身里程碑、个人五维职业技能值，并累计下拨 1.5 倍永久传承倍数。"}
                </p>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <button
                  id="trigger-prestige-action-btn"
                  onClick={() => {
                    if (!canPrestige) return;
                    onPrestigeRebirth();
                  }}
                  disabled={!canPrestige}
                  className="w-full sm:w-auto cursor-pointer bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 border border-yellow-300 text-black text-xs font-black uppercase tracking-wider py-4 px-8 rounded-2xl transition disabled:opacity-30 disabled:cursor-not-allowed disabled:border-zinc-850"
                >
                  {language === 'en' ? "Trigger Rebirth / Heritage 🌀" : "即刻传承 · 重启新商战 🌀"}
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
