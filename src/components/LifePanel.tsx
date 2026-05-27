import React from "react";
import { Zap, Heart, Smile, BookOpen, GraduationCap, ChevronRight, Play, Car, Bike, Navigation, Trophy, Sparkles, Brain, Lock, Activity } from "lucide-react";
import { PlayerStats, Language } from "../types";
import { i18n, SKILL_COURSES, VEHICLES_LIST } from "../i18n";
import { motion } from "motion/react";
import { SIDE_GIGS } from "../data/sideGigs";

interface LifePanelProps {
  stats: PlayerStats;
  language: Language;
  onStudySeminars: (courseId: string) => void;
  onEatFood: (type: 'street' | 'cafe' | 'restaurant') => void;
  onHospitalCheckup: () => void;
  onBuyVehicle: (vehicleId: string, cost: number) => void;
  onSelectVehicle: (vehicleId: string | null) => void;
  onActiveSideGig?: (gigId: string) => void;
}

export const LifePanel: React.FC<LifePanelProps> = ({
  stats,
  language,
  onStudySeminars,
  onEatFood,
  onHospitalCheckup,
  onBuyVehicle,
  onSelectVehicle,
  onActiveSideGig
}) => {
  const t = i18n[language];

  // Helper to calculate level-up threshold: level * 100 + 150
  const currentLevel = stats.level || 1;
  const currentXP = stats.xp || 0;
  const xpNeeded = currentLevel * 100 + 150;
  const stressLevel = stats.stress || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* 0. IMMERSIVE CHARACTER DEVELOPMENT & SIDE-GIGS DASHBOARD */}
      <div id="student-side-gigs-hero" className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Head Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-xl">
              🎓
            </div>
            <div>
              <h2 className="text-md font-black text-zinc-100 tracking-tight flex items-center gap-2">
                <span>{language === 'en' ? "Active Student Side-Hustles & Gigs" : "大学生课余兼职与自由职业大本营"}</span>
                <span className="text-[10px] bg-indigo-900/40 text-indigo-400 font-mono px-2 py-0.5 rounded border border-indigo-800/50 uppercase tracking-wider">RPG PROGRESSION</span>
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {language === 'en' 
                  ? "Build skills, gain valuable XP to level up, and unlock epic high-yield startup consulting jobs!" 
                  : "积累实操经验，提升角色等级以解禁更高毛利的极客、独立AI顾问、跨国架构咨询等高阶合伙兼职！"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800 self-start md:self-auto shrink-0 font-mono">
            <span className="text-[10px] uppercase font-bold text-zinc-500 pl-1.5">{language === 'en' ? "Sim Mode" : "商业仿真"}</span>
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-lg border border-emerald-800/40 uppercase">
              {language === 'en' ? "STAMINA-DRIVEN" : "体能驱动"}
            </span>
          </div>
        </div>

        {/* RPG HUD METRIC PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-850">
          {/* LEVEL BAR */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Trophy size={12} className="text-yellow-500" />
                {language === 'en' ? "Character Title / Lvl" : "大亨等级成长"}
              </span>
              <span className="text-yellow-405 font-black uppercase text-xs font-mono">
                {language === 'en' ? `Level ${currentLevel}` : `商业等级 Lvl ${currentLevel}`}
              </span>
            </div>
            <div className="bg-zinc-950 h-2.5 rounded-full p-0.5 border border-zinc-800 overflow-hidden relative">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400"
                style={{ width: `${Math.min(100, (currentXP / xpNeeded) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9.5px] text-zinc-500 font-mono">
              <span>{language === 'en' ? "Fresh Entrepreneur" : "拼搏菜鸟"}</span>
              <span>{currentXP} / {xpNeeded} XP</span>
            </div>
          </div>

          {/* STAMINA METER */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap size={12} className="text-emerald-400 animate-pulse" />
                {language === 'en' ? "Energetic Stamina" : "体能精力储备"}
              </span>
              <span className="text-emerald-400 font-black text-xs font-mono">
                {stats.energy} / 100%
              </span>
            </div>
            <div className="bg-zinc-950 h-2.5 rounded-full p-0.5 border border-zinc-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-400"
                style={{ width: `${stats.energy}%` }}
              />
            </div>
            <div className="flex justify-between text-[9.5px] text-zinc-500 font-mono">
              <span>{language === 'en' ? "Depleted by work" : "兼职会损耗体力"}</span>
              <span>{language === 'en' ? "Refills by eating" : "通过饱餐补充"}</span>
            </div>
          </div>

          {/* STRESS ACCUMULATION */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity size={12} className={stressLevel > 70 ? "text-red-400 animate-bounce" : "text-purple-400"} />
                {language === 'en' ? "Mental Stress Meter" : "神经焦躁/心理压力"}
              </span>
              <span className={`font-black text-xs font-mono ${stressLevel > 80 ? "text-red-400" : stressLevel > 50 ? "text-yellow-400" : "text-purple-400"}`}>
                {stressLevel}%
              </span>
            </div>
            <div className="bg-zinc-950 h-2.5 rounded-full p-0.5 border border-zinc-800 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  stressLevel > 80 
                    ? "bg-gradient-to-r from-rose-600 to-red-500" 
                    : stressLevel > 50 
                      ? "bg-gradient-to-r from-yellow-500 to-orange-400" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-400"
                }`}
                style={{ width: `${stressLevel}%` }}
              />
            </div>
            <div className="flex justify-between text-[9.5px] text-zinc-500 font-mono">
              <span>{language === 'en' ? "Warning: Burnt out >85%!" : "提示: 超过85%高压将极易失败"}</span>
              <span className="font-extrabold text-[9px]">
                {stressLevel > 80 
                  ? (language === 'en' ? "🚨 SEVERE BURNOUT" : "🚨 濒临崩溃") 
                  : stressLevel > 50 
                    ? (language === 'en' ? "⚠️ High Anxiety" : "⚠️ 轻度焦虑") 
                    : (language === 'en' ? "🧘 Mind Balanced" : "🧘 自主松弛")}
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE SIDE-GIGS SELECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIDE_GIGS.map((item) => {
            // Check Level Requirement
            const levelMet = (stats.level || 1) >= item.requiredLevel;
            
            // Check Skill Requirements
            const skillsMet = Object.entries(item.requiredSkills).every(([skillKey, value]) => {
              const currentVal = stats.skills[skillKey as keyof typeof stats.skills] || 0;
              return currentVal >= (value ?? 0);
            });

            // Cooldown check
            const cooldownValue = stats.gigCooldowns?.[item.id] || 0;
            const isOnCooldown = cooldownValue > 0 && stats.day < cooldownValue;
            const daysRemaining = isOnCooldown ? cooldownValue - stats.day : 0;

            // Energy check
            const hasEnoughEnergy = stats.energy >= item.energy;

            const isLocked = !levelMet || !skillsMet;
            const isClickable = !isLocked && !isOnCooldown && hasEnoughEnergy;

            // Dynamic Success Rate based on level & skills matching
            // Success rate increases if player matches or surpasses skill criteria
            let skillAdjustment = 0;
            Object.entries(item.requiredSkills).forEach(([skillKey, value]) => {
              const currentVal = stats.skills[skillKey as keyof typeof stats.skills] || 0;
              if (currentVal > (value ?? 0)) {
                skillAdjustment += (currentVal - (value ?? 0)) * 0.005; // 0.5% success gain per excess skill point
              }
            });
            // Compensation if player level is higher
            const levelBonus = Math.max(0, ((stats.level || 1) - item.requiredLevel) * 0.02);
            // Stress penalty! If stress is high, decrease success rate drastically!
            const stressPenalty = stressLevel > 80 ? 0.30 : stressLevel > 50 ? 0.12 : 0;

            const computedSuccessRate = Math.min(1.0, Math.max(0.35, item.baseSuccessRate + skillAdjustment + levelBonus - stressPenalty));
            const successPercentage = Math.round(computedSuccessRate * 100);

            // Tier color layouts
            let tierStyles = {
              border: "border-zinc-800 bg-zinc-950/40 hover:border-emerald-500/40 hover:bg-emerald-950/5",
              badge: "bg-zinc-900 border border-zinc-800 text-zinc-400",
              btn: "bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-850",
              title: "text-zinc-100",
              accentText: "text-emerald-400"
            };

            if (item.tier === "rare") {
              tierStyles = {
                border: "border-indigo-950 bg-indigo-950/10 hover:border-indigo-500 hover:bg-indigo-950/20",
                badge: "bg-indigo-950/60 border border-indigo-850 text-indigo-350",
                btn: "bg-indigo-900/60 hover:bg-indigo-805 text-white border border-indigo-700/60",
                title: "text-indigo-100 font-extrabold",
                accentText: "text-indigo-400"
              };
            } else if (item.tier === "epic") {
              tierStyles = {
                border: "border-fuchsia-950 bg-fuchsia-950/10 hover:border-fuchsia-500 hover:bg-fuchsia-950/20",
                badge: "bg-fuchsia-950/60 border border-fuchsia-850 text-fuchsia-350",
                btn: "bg-gradient-to-r from-fuchsia-800 via-purple-800 to-indigo-800 hover:opacity-90 text-white border border-fuchsia-600",
                title: "text-zinc-50 font-black",
                accentText: "text-fuchsia-400 font-black"
              };
            } else if (item.tier === "legendary") {
              tierStyles = {
                border: "border-amber-900 bg-amber-950/15 hover:border-yellow-500 hover:shadow-yellow-950/20 shadow-inner animate-pulse",
                badge: "bg-amber-950/60 border border-amber-800 text-yellow-500 font-bold uppercase",
                btn: "bg-yellow-500 text-black font-black hover:bg-yellow-405 hover:scale-[1.01]",
                title: "text-yellow-101 font-black underline decoration-yellow-500 decoration-wavy",
                accentText: "text-yellow-403 font-black"
              };
            }

            return (
              <div
                key={item.id}
                id={`side-gig-card-${item.id}`}
                className={`rounded-2xl border p-4 flex flex-col justify-between relative transition-all duration-300 ${tierStyles.border} ${
                  isLocked ? "bg-zinc-950/90 border-zinc-900 opacity-60" : ""
                }`}
              >
                {/* Active Lock Overlay */}
                {isLocked && (
                  <div className="absolute inset-x-0 top-0 h-full rounded-2xl bg-black/60 z-10 p-4 flex flex-col justify-center items-center text-center space-y-2 select-none backdrop-blur-[1px]">
                    <Lock size={20} className="text-zinc-600 animate-pulse" />
                    <div>
                      <p className="text-[11px] text-zinc-100 font-bold">
                        {language === 'en' ? "Locked Career Hustle" : "商业兼职暂未解禁"}
                      </p>
                      <div className="flex flex-col gap-1 mt-1 font-mono text-[9.5px]">
                        {stats.level < item.requiredLevel && (
                          <span className="text-rose-400">
                            ✖ {language==='en'? `Requires Level ${item.requiredLevel}` : `需要商业等级 Lvl ${item.requiredLevel}`}
                          </span>
                        )}
                        {Object.entries(item.requiredSkills).map(([skill, reqValue]) => {
                          const playerVal = stats.skills[skill as keyof typeof stats.skills] || 0;
                          const met = playerVal >= (reqValue ?? 0);
                          return (
                            <span key={skill} className={met ? "text-emerald-400" : "text-rose-400"}>
                              {met ? "✔" : "✖"} {language === 'en' ? `${skill.toUpperCase()} Lvl ${reqValue}` : `自修${skill === 'coding' ? '编程' : skill === 'business' ? '商业' : skill === 'negotiation' ? '谈判' : '管理'} ${reqValue}`}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-1">
                    <span className={`text-[12px] leading-tight font-black ${tierStyles.title}`}>
                      {language === 'en' ? item.name_en : item.name_zh}
                    </span>
                    <span className={`text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-md self-start font-mono ${tierStyles.badge}`}>
                      {item.tier}
                    </span>
                  </div>

                  <p className="text-[10px] text-zinc-400 leading-relaxed font-sans line-clamp-3 min-h-[3rem]">
                    {language === 'en' ? item.description_en : item.description_zh}
                  </p>

                  {/* Skills rewards and probabilities parameters */}
                  <div className="bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-900/60 text-[9.5px] font-mono grid grid-cols-2 gap-2 text-zinc-400">
                    <div>
                      <span className="text-zinc-550 block text-[8px] uppercase font-bold">{language === 'en' ? "Skills Gain" : "成长增益"}</span>
                      {Object.entries(item.skillGains).map(([skill, value]) => (
                        <div key={skill} className="text-emerald-400 font-bold mt-0.5">
                          +{value} {skill.toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <div>
                      <span className="text-zinc-550 block text-[8px] uppercase font-bold">{language === 'en' ? "Sim Prob" : "执行概率"}</span>
                      <div className="flex items-center gap-1 font-bold mt-0.5">
                        <span className={computedSuccessRate > 0.85 ? "text-emerald-400" : computedSuccessRate > 0.65 ? "text-yellow-405" : "text-red-400"}>
                          {successPercentage}%
                        </span>
                        <span className="text-[8px] text-zinc-500 font-sans">{language === 'en' ? "Success" : "成功率"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Foot indicators and Click Trigger */}
                <div className="mt-4 pt-3.5 border-t border-zinc-90 w-full flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase text-zinc-500 leading-none font-bold font-sans">{language === 'en' ? "PAYMENT" : "每轮酬劳"}</span>
                      <span className="text-yellow-400 font-extrabold font-mono text-xs mt-0.5">RM {item.earnings.toLocaleString()}</span>
                    </div>

                    <div className="flex gap-1">
                      <div className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 text-[9.5px] text-zinc-500 font-mono">
                        -{item.energy}⚡
                      </div>
                      <div className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 text-[9.5px] text-purple-400 font-mono">
                        +{item.stress}🧠
                      </div>
                      <div className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900 text-[9.5px] text-indigo-400 font-mono">
                        +{item.xp} XP
                      </div>
                    </div>
                  </div>

                  {isOnCooldown ? (
                    <div className="w-full bg-zinc-900 border border-zinc-850 text-zinc-500 text-[9.5px] text-center font-bold font-mono py-2 rounded-xl">
                      🕒 {language === 'en' ? `COOLDOWN: Available on Day ${cooldownValue} (In ${daysRemaining} day)` : `🕒 处于冷却中：第 ${cooldownValue} 天就位（剩 ${daysRemaining} 天）`}
                    </div>
                  ) : (
                    <button
                      id={`giga-act-btn-${item.id}`}
                      disabled={!isClickable}
                      onClick={() => onActiveSideGig && onActiveSideGig(item.id)}
                      className={`w-full text-center py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-200 outline-none cursor-pointer flex items-center justify-center gap-1.5 ${tierStyles.btn}`}
                    >
                      <span>⚡</span>
                      <span>{language === 'en' ? "Perform Job Shift" : "执行兼职轮值"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PHYSICAL MAINTENANCE PANEL */}
        <div id="physical-care-panel" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Heart className="text-red-500" size={20} />
            <h2 className="text-lg font-bold text-zinc-100 font-sans">{t.lifeActivities}</h2>
          </div>

          {/* Eat Dining Options */}
          <div className="space-y-3 pb-3 border-b border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smile size={14} className="text-zinc-400" />
              <span>{t.eatTitle}</span>
            </h3>

            <div className="space-y-2">
              {/* Street Food */}
              <button
                id="eat-street-btn"
                onClick={() => onEatFood('street')}
                disabled={stats.money < 10}
                className="w-full text-left bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3 flex justify-between items-center transition cursor-pointer disabled:opacity-40"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{language === 'en' ? 'Street Fast Food' : '低价街头简餐'}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {language === 'en' ? 'Price: $10 | Recharges +5 Health, -2 Happiness' : '售价: $10 | 恢复健康 +5, 压抑带来幸福度 -2'}
                  </div>
                </div>
                <span className="font-mono text-sm text-yellow-400 font-semibold">$10</span>
              </button>

              {/* Cafe Lunch */}
              <button
                id="eat-cafe-btn"
                onClick={() => onEatFood('cafe')}
                disabled={stats.money < 25}
                className="w-full text-left bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3 flex justify-between items-center transition cursor-pointer disabled:opacity-40"
              >
                <div>
                  <div className="text-sm font-semibold text-emerald-400">{language === 'en' ? 'Standard Cafe Lunch' : '精品小资午餐'}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {language === 'en' ? 'Price: $25 | Recharges +10 Health, +5 Happiness' : '售价: $25 | 恢复健康 +10, 幸福度 +5'}
                  </div>
                </div>
                <span className="font-mono text-sm text-yellow-400 font-semibold">$25</span>
              </button>

              {/* Restaurant */}
              <button
                id="eat-restaurant-btn"
                onClick={() => onEatFood('restaurant')}
                disabled={stats.money < 85}
                className="w-full text-left bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3 flex justify-between items-center transition cursor-pointer disabled:opacity-40"
              >
                <div>
                  <div className="text-sm font-semibold text-pink-400">{language === 'en' ? 'Fine Dining Banquet' : '高端米其林法餐'}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {language === 'en' ? 'Price: $85 | Recharges +25 Health, +15 Happiness' : '售价: $85 | 豪华宴请恢复健康 +25, 幸福度 +15'}
                  </div>
                </div>
                <span className="font-mono text-sm text-yellow-400 font-semibold">$85</span>
              </button>
            </div>
          </div>

          {/* Hospital emergency info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-zinc-400" />
              <span>{t.hospitalTitle}</span>
            </h3>

            <button
              id="hospital-checkup-btn"
              onClick={onHospitalCheckup}
              disabled={stats.money < 200}
              className="w-full text-left bg-zinc-950 hover:bg-zinc-850 border border-red-950 hover:border-red-900 rounded-lg p-3 flex justify-between items-center transition cursor-pointer disabled:opacity-40"
            >
              <div>
                <div className="text-sm font-semibold text-red-400">{t.hospitalTitle}</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  {language === 'en' ? 'Treat exhaustion and cure chronic fatigue. Cash -$200 | +40 Health, +10 Energy.' : '全方位诊查调理。现金 -$200 | 恢复 +40 健康, +10 精力。'}
                </div>
              </div>
              <span className="font-mono text-sm text-yellow-400 font-semibold">$200</span>
            </button>
          </div>
        </div>


        {/* SEMINARS & SHORT TRAINING LIST */}
        <div id="skills-seminars-panel" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <BookOpen className="text-emerald-500" size={20} />
            <h2 className="text-lg font-bold text-zinc-100 font-sans">{t.studyTitle}</h2>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
            {SKILL_COURSES.map((course) => {
              const isAffordable = stats.money >= course.cost;
              return (
                <div
                  key={course.id}
                  id={`course-card-${course.id}`}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                >
                  <div className="space-y-1 select-none">
                    <div className="text-sm font-semibold text-zinc-100">
                      {language === 'en' ? course.name_en : course.name_zh}
                    </div>
                    <p className="text-xs text-zinc-400 max-w-sm">
                      {language === 'en' ? course.desc_en : course.desc_zh}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
                    <span className="font-mono text-sm text-yellow-400 font-semibold">
                      ${course.cost}
                    </span>
                    <button
                      id={`buy-course-${course.id}`}
                      onClick={() => onStudySeminars(course.id)}
                      disabled={!isAffordable}
                      className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-semibold text-xs py-1.5 px-3 rounded-md transition flex items-center gap-1"
                    >
                      <Play size={10} className="fill-black" />
                      <span>{t.studyBtn}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AUTOMOBILE SHOWROOM & PERSONAL GARAGE */}
      <div id="vehicle-garage-panel" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Car className="text-yellow-400" size={22} />
            <div>
              <h2 className="text-lg font-bold text-zinc-100 font-sans">
                {language === 'en' ? "Commuter Vehicles & Private Garage" : "顶级载具中心与私人车位"}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {language === 'en' 
                  ? "Purchase and activate status-defining vehicles to boost daily salary and reduce physical metabolic decay." 
                  : "添置拉风名车或海上行宫，一键免试增快通勤获利（日薪提成比例），并常态化抗疲劳。"}
              </p>
            </div>
          </div>

          {/* Active status pill */}
          <div className="bg-zinc-950 border border-zinc-800 px-3/5 py-1.5 rounded-lg text-xs">
            {stats.activeVehicleId ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Navigation size={12} className="animate-pulse" />
                <span>
                  {language === 'en' ? "Commuting Mode: Driving " : "当前通勤形式: "}{" "}
                  {VEHICLES_LIST.find(v => v.id === stats.activeVehicleId)?.[language === 'en' ? 'name_en' : 'name_zh']}
                </span>
              </span>
            ) : (
              <span className="text-zinc-500 font-medium">
                {language === 'en' ? "Commuting Mode: On Foot (🚶‍♂️ walk)" : "当前通勤形式: 步行走路上班 (🚶‍♂️)"}
              </span>
            )}
          </div>
        </div>

        {/* Catalog of Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VEHICLES_LIST.map((vehicle) => {
            const isOwned = stats.ownedVehicles.includes(vehicle.id);
            const isActive = stats.activeVehicleId === vehicle.id;
            const canAfford = stats.money >= vehicle.cost;

            return (
              <div
                key={vehicle.id}
                className={`bg-zinc-950 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                  isActive 
                    ? 'border-yellow-500/80 shadow-md shadow-yellow-950/20' 
                    : isOwned 
                      ? 'border-emerald-900/60 bg-emerald-950/5' 
                      : 'border-zinc-800'
                }`}
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase font-mono tracking-wider text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-850">
                      {vehicle.id.split('_')[1].toUpperCase()}
                    </span>
                    {isActive ? (
                      <span className="text-[9px] font-black bg-yellow-950 text-yellow-400 border border-yellow-700 px-1.5 py-0.5 rounded uppercase leading-none animate-pulse">
                        {language === 'en' ? "Driving" : "正在驾驶"}
                      </span>
                    ) : isOwned ? (
                      <span className="text-[9px] font-black bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded uppercase leading-none">
                        {language === 'en' ? "In Garage" : "已入车库"}
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-zinc-900 text-zinc-600 border border-zinc-850 px-1.5 py-0.5 rounded uppercase leading-none">
                        {language === 'en' ? "For Sale" : "在售售价"}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-100">
                      {language === 'en' ? vehicle.name_en : vehicle.name_zh}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                      {language === 'en' ? vehicle.description_en : vehicle.description_zh}
                    </p>
                  </div>

                  {/* Profit buffs status description list */}
                  <div className="text-[11px] text-zinc-500 space-y-1 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900/60 font-mono">
                    <div className="flex justify-between">
                      <span>{language === 'en' ? "Energy Saved/Day:" : "防代谢消耗体力/天:"}</span>
                      <span className="text-yellow-400 font-bold">+{vehicle.energyReductionPerDay}</span>
                    </div>
                    {vehicle.salaryBonusMultiplier > 1.0 && (
                      <div className="flex justify-between">
                        <span>{language === 'en' ? "Salary Commission:" : "工作通勤薪金加成:"}</span>
                        <span className="text-green-400 font-bold">+{Math.round((vehicle.salaryBonusMultiplier - 1.0) * 100)}%</span>
                      </div>
                    )}
                    {vehicle.happinessBonusPerDay > 0 && (
                      <div className="flex justify-between">
                        <span>{language === 'en' ? "Daily Joy Bonus:" : "每日拉风幸福感:"}</span>
                        <span className="text-pink-400 font-bold">+{vehicle.happinessBonusPerDay}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-zinc-900 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="text-[9px] text-zinc-500 uppercase font-bold">{language === 'en' ? "Zoning Price" : "名车行价格"}</div>
                    <span className="font-mono text-sm text-yellow-400 font-black">
                      ${vehicle.cost}
                    </span>
                  </div>

                  {isOwned ? (
                    isActive ? (
                      <button
                        onClick={() => onSelectVehicle(null)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-extrabold text-xs py-1.5 px-3 rounded-lg transition cursor-pointer"
                      >
                        {language === 'en' ? "Stop Driving" : "熄火走路上班"}
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectVehicle(vehicle.id)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs py-1.5 px-3 rounded-lg transition cursor-pointer"
                      >
                        {language === 'en' ? "Drive / Activate" : "启动载具通勤"}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onBuyVehicle(vehicle.id, vehicle.cost)}
                      disabled={!canAfford}
                      className="bg-indigo-600 hover:bg-indigo-505 disabled:opacity-30 text-zinc-100 font-extrabold text-xs py-1.5 px-3 rounded-lg transition cursor-pointer"
                    >
                      {language === 'en' ? "Buy Vehicle" : "出资购置名车"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
