import React, { useState } from "react";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  BookMarked, 
  CheckCircle, 
  Play, 
  Activity, 
  Coins, 
  Briefcase 
} from "lucide-react";
import { PlayerStats, Language } from "../types";
import { SKILL_COURSES, EDUCATION_PROGRAMS } from "../i18n";
import { motion } from "motion/react";

interface SchoolPanelProps {
  stats: PlayerStats;
  language: Language;
  studyingProg: { degreeId: string; daysRemaining: number } | null;
  onEnrollDegree: (degreeId: string) => void;
  onBuyTextbook: (field: 'business' | 'management' | 'coding' | 'construction' | 'negotiation', cost: number, titleEn: string, titleZh: string) => void;
  onApplyScholarship: (amount: number, isPatent: boolean) => void;
  onTriggerRewardAd?: (tag: string, callback: () => void) => void;
  onSkipStudyDay?: () => void;
}

export const SchoolPanel: React.FC<SchoolPanelProps> = ({
  stats,
  language,
  studyingProg,
  onEnrollDegree,
  onBuyTextbook,
  onApplyScholarship,
  onTriggerRewardAd,
  onSkipStudyDay
}) => {
  const [activeSegment, setActiveSegment] = useState<'degrees' | 'bookstore' | 'scholarship'>('degrees');

  const getDegreeLabel = (degId: string) => {
    switch (degId) {
      case "high_school": return language === 'en' ? "High School Diploma" : "高中毕业证书";
      case "bachelor": return language === 'en' ? "Bachelor Degree" : "普通大学本科";
      case "master": return language === 'en' ? "Master of Business (MBA)" : "精英工商管理硕士";
      case "phd": return language === 'en' ? "Doctor of Philosophy (PhD)" : "终身学术博士学位";
      default: return degId;
    }
  };

  const isCompleted = (degId: string) => {
    const list = ["high_school", "bachelor", "master", "phd"];
    return list.indexOf(stats.education) >= list.indexOf(degId);
  };

  const isEligible = (reqLabel: string) => {
    return stats.education === reqLabel;
  };

  // Textbooks list data
  const textbooks = [
    { id: "b_biz", field: "business" as const, cost: 400, title_en: "Venture Capital Playbook", title_zh: "《风险投资实战奥秘》", bonus: 12 },
    { id: "b_mgt", field: "management" as const, cost: 400, title_en: "Psychology of Executive Incentives", title_zh: "《高管薪酬与管理激励心理学》", bonus: 12 },
    { id: "b_code", field: "coding" as const, cost: 400, title_en: "Enterprise Quantum Cloud Architectures", title_zh: "《企业级分布式算力与云架构》", bonus: 12 },
    { id: "b_cons", field: "construction" as const, cost: 400, title_en: "Skyscrapers structural mechanics", title_zh: "《超高层摩天大楼地基及重力抗震学》", bonus: 12 },
    { id: "b_nego", field: "negotiation" as const, cost: 400, title_en: "Getting to YES in Hostile Buyouts", title_zh: "《关于恶意并购、双赢谈判的哈佛艺术》", bonus: 12 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Sub menu tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-1 bg-transparent">
        {[
          { id: 'degrees', icon: <GraduationCap size={14} />, en: "Degrees & Academies", zh: "大学学位深造与门栏" },
          { id: 'bookstore', icon: <BookMarked size={14} />, en: "Elite Bookstore", zh: "常春藤专卖图书" },
          { id: 'scholarship', icon: <Award size={14} />, en: "Scholarships & Patents", zh: "学术研究与专利基金" }
        ].map((sub) => (
          <button
            key={sub.id}
            id={`school-sub-${sub.id}`}
            onClick={() => setActiveSegment(sub.id as any)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-all cursor-pointer whitespace-nowrap active:translate-y-0.5 ${
              activeSegment === sub.id 
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100' 
                : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-200'
            }`}
          >
            {sub.icon}
            <span>{language === 'en' ? sub.en : sub.zh}</span>
          </button>
        ))}
      </div>

      {/* 1. DEGREES AND ENROLLMENT */}
      {activeSegment === 'degrees' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
              <div className="p-2 bg-indigo-950/55 rounded-lg border border-indigo-900 text-indigo-400">
                <GraduationCap size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-zinc-100">{language === 'en' ? "Higher Degree Graduation Pathways" : "高等全日制本硕博研习中心"}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">{language === 'en' ? "Matriculate to get high-prestige diplomas and trigger large permanent skill unlocks." : "缴纳学费注册学籍，度过日常通勤。修完学分撰写并答辩论文能直接获得极具分量的学历背书及永久技能大加成。"}</p>
              </div>
            </div>

            {/* If studying */}
            {studyingProg && (
              <div className="bg-indigo-950/25 border border-indigo-805/40 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-indigo-400 font-extrabold flex items-center gap-1.5">
                    <Activity size={12} className="animate-pulse" />
                    <span>{language === 'en' ? "ACTIVE MATRICULATION" : "在读学籍状态：正常运作中"}</span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100">
                    {language === 'en' ? "Studying Program for:" : "攻读目标学位："}{" "}
                    <span className="text-indigo-300">{getDegreeLabel(studyingProg.degreeId)}</span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {language === 'en' 
                      ? `${studyingProg.daysRemaining} days left. Advance the simulation days to attend courses & lectures.`
                      : `距离毕业学术评语评定还剩 ${studyingProg.daysRemaining} 天。只需正常在主页点击或选择【前进几天】即可完成。`}
                  </p>
                </div>
                
                {/* Visual study helper skip options with rewarded sponsorship */}
                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  {onTriggerRewardAd && onSkipStudyDay && (
                    <button
                      onClick={() => {
                        onTriggerRewardAd("skip_study", () => {
                          onSkipStudyDay();
                        });
                      }}
                      className="px-3.5 py-1.5 cursor-pointer bg-zinc-900 border border-yellow-500/30 text-yellow-400 hover:text-white hover:bg-zinc-805 text-[10px] font-black uppercase rounded-lg transition-all flex items-center gap-1.5 select-none"
                    >
                      <span>📺 {language === 'en' ? "Skip Study 1 Day" : "看广告秒减 1 天CD"}</span>
                    </button>
                  )}
                  <span className="text-[11px] bg-indigo-900 text-indigo-100 border border-indigo-700 font-bold font-mono px-3 py-1 rounded-lg">
                    {studyingProg.daysRemaining} {language === 'en' ? "Days Remaining" : "天后结业"}
                  </span>
                </div>
              </div>
            )}

            {/* Degrees map */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
              {EDUCATION_PROGRAMS.map((program) => {
                const completed = isCompleted(program.id);
                const active = studyingProg?.degreeId === program.id;
                const eligible = isEligible(program.requires);
                const canAfford = stats.money >= program.cost;

                return (
                  <div
                    key={program.id}
                    className={`bg-zinc-950 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                      completed 
                        ? 'border-emerald-900/50 bg-emerald-950/5' 
                        : active 
                          ? 'border-indigo-500 shadow-md shadow-indigo-950/20' 
                          : 'border-zinc-800'
                    }`}
                  >
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold uppercase font-mono tracking-wider text-zinc-500">
                          {program.id}
                        </span>
                        {completed ? (
                          <span className="text-[9px] font-black bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.5 rounded uppercase">
                            {language === 'en' ? "Acquired" : "已毕业已获取"}
                          </span>
                        ) : active ? (
                          <span className="text-[9px] font-black bg-indigo-950 text-indigo-400 border border-indigo-700 px-1.5 py-0.5 rounded animate-pulse uppercase">
                            {language === 'en' ? "Studying" : "在修中"}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase">
                            {language === 'en' ? "Not Enrolled" : "待报名"}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-zinc-100">
                          {language === 'en' ? program.name_en : program.name_zh}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1 pb-3 leading-relaxed border-b border-zinc-900">
                          {language === 'en' ? program.bonuses_en : program.bonuses_zh}
                        </p>
                      </div>

                      <div className="text-xs text-zinc-500 space-y-1.5 font-mono">
                        <div className="flex justify-between">
                          <span>{language === 'en' ? "Academic Days:" : "学术周期周期:"}</span>
                          <span className="text-zinc-300 font-bold">{program.daysNeeded} {language === 'en' ? "days" : "天"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{language === 'en' ? "Prerequisites:" : "报考底气资格:"}</span>
                          <span className="text-zinc-300">{getDegreeLabel(program.requires)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-900 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="text-[9px] text-zinc-500 uppercase font-bold">{language === 'en' ? "Tuition Cost" : "一次性学费"}</div>
                        <span className="font-mono text-sm text-yellow-400 font-black">
                          ${program.cost}
                        </span>
                      </div>

                      {completed ? (
                        <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1">
                          <CheckCircle size={12} />
                          <span>{language === 'en' ? "Diploma Held" : "学成归宿"}</span>
                        </span>
                      ) : active ? (
                        <span className="text-[11px] text-indigo-400 font-bold">{language === 'en' ? "In Progress..." : "学籍在读..."}</span>
                      ) : (
                        <button
                          onClick={() => onEnrollDegree(program.id)}
                          disabled={!eligible || !canAfford || studyingProg !== null}
                          className="bg-indigo-600 hover:bg-indigo-500 hover:translate-y-[-1px] active:translate-y-[1px] disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-indigo-600 transition text-zinc-100 font-black text-xs py-1.5 px-3 rounded-lg cursor-pointer"
                        >
                          {language === 'en' ? "Pay & Enroll" : "缴费入学"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. THE BOOKSTORE */}
      {activeSegment === 'bookstore' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
            <div className="p-2 bg-indigo-950/55 rounded-lg border border-indigo-900 text-indigo-400">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">{language === 'en' ? "University Campus Bookstore" : "名牌常春藤图书专卖店"}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{language === 'en' ? "Purchase premium paper textbooks to immediately absorption of wisdom coordinates (+12 points)." : "选购高级专业学术期刊原著。无需天数损耗，立刻通过纸上得来获取对应的行业熟练度 +12 点。"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textbooks.map((book) => {
              const canAfford = stats.money >= book.cost;
              return (
                <div key={book.id} className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl flex justify-between items-start gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[9px] uppercase font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-900 px-1.5 py-0.5 rounded leading-none">
                      {book.field.toUpperCase()}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">
                      {language === 'en' ? book.title_en : book.title_zh}
                    </h4>
                    <p className="text-xs text-zinc-400">
                      {language === 'en' 
                        ? `Immediately gains +${book.bonus} to ${book.field.toUpperCase()} expert skill.`
                        : `研读此书籍后，立即在日常核算中让【${book.field === 'business' ? '商业' : book.field === 'management' ? '管理' : book.field === 'coding' ? '编程' : book.field === 'construction' ? '建造' : '谈判'}】专业基础极速上升 +${book.bonus} 点。`}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3 justify-between h-full shrink-0">
                    <span className="font-mono text-xs text-yellow-400 font-extrabold">${book.cost}</span>
                    <button
                      onClick={() => onBuyTextbook(book.field, book.cost, book.title_en, book.title_zh)}
                      disabled={!canAfford}
                      className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-700 disabled:opacity-30 disabled:hover:bg-emerald-600 text-black font-extrabold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition"
                    >
                      <span>{language === 'en' ? "Buy & Read" : "买书研习"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. SCHOLARSHIPS AND PATENTS */}
      {activeSegment === 'scholarship' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-3">
            <div className="p-2 bg-indigo-950/55 rounded-lg border border-indigo-900 text-indigo-400">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">{language === 'en' ? "Academic Foundations & Corporate Sponsorships" : "校企合作学术基金与国际研究奖励"}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{language === 'en' ? "Leverage your education credentials. Apply for high-value research grants or patent values." : "凭借您的卓越学术造诣及高等学位，向大学学术委员会申报研发专项赞助或发明国家专利（永久获取科研资助）。"}</p>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-900 pb-4">
              <div>
                <h4 className="text-sm font-bold text-zinc-100">
                  {language === 'en' ? "Ivy League Academic Grant Program" : "名牌大学研发专利发明专利奖金"}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {language === 'en' 
                    ? "Requires Master/PhD degree. Grantees are awarded a $5,000 cash balance support."
                    : "对极具学术价值的硕士或博士发起科学专项资金认定。一次性提供高达 $5,000 的科研支持金！"}
                </p>
              </div>
              <button
                onClick={() => onApplyScholarship(5000, false)}
                disabled={stats.education !== 'master' && stats.education !== 'phd'}
                className="bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-30 border border-zinc-800 cursor-pointer font-bold text-xs py-2 px-4 rounded-lg text-indigo-400 transition"
              >
                {language === 'en' ? "Apply Grant" : "申报科研项目利益"}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1">
              <div>
                <h4 className="text-sm font-bold text-zinc-100">
                  {language === 'en' ? "University Campus Part-time Assistant" : "常春藤校内兼职助研与助教"}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {language === 'en' 
                    ? "Unlocked by default. Attend career section to view high-competence campus jobs."
                    : "所有学生均可担任。可前往【求职谋生】大厅挑选并入职“大学助理研究员”岗位，畅享极具弹性的日薪。"}
                </p>
              </div>
              <span className="text-[11px] text-zinc-500 font-bold uppercase font-mono">{language === 'en' ? "Check Job Market" : "校内免试直达"}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
