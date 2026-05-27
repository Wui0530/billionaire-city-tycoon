import React from "react";
import { Briefcase, Zap, UserCheck, ShieldClose, Lock, Unlock } from "lucide-react";
import { PlayerStats, Language } from "../types";
import { i18n, JOBS_LIST } from "../i18n";
import { motion } from "motion/react";

interface CareerPanelProps {
  stats: PlayerStats;
  language: Language;
  onApplyJob: (jobId: string) => void;
  onResign: () => void;
}

export const CareerPanel: React.FC<CareerPanelProps> = ({
  stats,
  language,
  onApplyJob,
  onResign
}) => {
  const t = i18n[language];
  const activeJob = JOBS_LIST.find((j) => j.id === stats.activeJobId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* CURRENT ACTIVE JOB DISPLAY */}
      <div id="current-active-job-banner" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-900/30 border border-emerald-800 text-emerald-400 rounded-xl">
              <Briefcase size={24} />
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider font-mono">
                {t.activeJob}
              </span>
              <h2 className="text-xl font-extrabold text-zinc-100 font-sans tracking-tight">
                {activeJob ? (language === 'en' ? activeJob.title_en : activeJob.title_zh) : t.noJob}
              </h2>
              {activeJob && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 mt-1">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-zinc-300">{t.salaryRate}:</span>
                    <span className="font-mono text-yellow-500 font-bold">${activeJob.salaryPerDay}/day</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap size={11} className="text-teal-400" />
                    <span className="font-semibold text-zinc-300">{t.energyCost}:</span>
                    <span className="font-mono text-teal-400">-{activeJob.energyCost}/day</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span>{t.expPoints}:</span>
                    <span className="font-mono text-zinc-300">{stats.experienceDays[activeJob.id] || 0} days</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {activeJob && (
            <button
              id="resign-job-btn"
              onClick={onResign}
              className="cursor-pointer bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 text-xs font-bold py-2 px-4 rounded-lg transition-all flex items-center gap-1.5 shadow"
            >
              <ShieldClose size={13} />
              <span>{t.resignBtn}</span>
            </button>
          )}
        </div>
      </div>


      {/* JOBS SELECTION BOARD */}
      <div id="job-board-wrapper" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-zinc-100 font-sans flex items-center gap-2">
          <span>{t.careerTitle}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {JOBS_LIST.map((job) => {
            const isCurrentlyEmploying = stats.activeJobId === job.id;
            const unlocked = job.checkUnlocks(stats.skills, stats.education);
            
            return (
              <div
                key={job.id}
                id={`job-offer-${job.id}`}
                className={`bg-zinc-950 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                  isCurrentlyEmploying
                    ? "border-emerald-600 bg-emerald-950/5 shadow-inner"
                    : unlocked
                      ? "border-zinc-800 hover:border-zinc-700"
                      : "border-zinc-900 opacity-60"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-md font-bold text-zinc-100">
                      {language === 'en' ? job.title_en : job.title_zh}
                    </h4>
                    {isCurrentlyEmploying ? (
                      <span className="text-[9px] font-bold bg-emerald-900 text-emerald-100 px-2 py-0.5 rounded border border-emerald-700 animate-pulse">
                        {language === 'en' ? 'Active' : '正在供职'}
                      </span>
                    ) : unlocked ? (
                      <span className="text-[9px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 flex items-center gap-1">
                        <Unlock size={10} className="text-zinc-500" />
                        <span>{language === 'en' ? 'Eligible' : '条件符合'}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-zinc-900 text-red-400 px-2 py-0.5 rounded border border-red-950 flex items-center gap-1">
                        <Lock size={10} className="text-red-500" />
                        <span>{language === 'en' ? 'Locked' : '资格不足'}</span>
                      </span>
                    )}
                  </div>

                  {/* Requirements display */}
                  <div className="text-xs text-zinc-500 mt-2">
                    <span className="text-zinc-400 font-semibold">{language === 'en' ? 'Requirements' : '基本资质'}:</span>{" "}
                    <span className={unlocked ? "text-zinc-300" : "text-red-400"}>
                      {language === 'en' ? job.req_en : job.req_zh}
                    </span>
                  </div>

                  {/* Operational factors */}
                  <div className="flex items-center gap-4 text-xs mt-3 text-zinc-400">
                    <span className="flex items-center gap-1 font-mono text-yellow-500/95 font-semibold">
                      ${job.salaryPerDay}/{language === 'en' ? 'day' : '天'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Zap size={11} className="text-teal-400" />
                      <span>{job.energyCost} {language === 'en' ? 'energy' : '精力'}/{language === 'en' ? 'day' : '天'}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-900/60 flex justify-end">
                  {isCurrentlyEmploying ? (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <UserCheck size={13} />
                      <span>{language === "en" ? "Employed" : "正在供职于此"}</span>
                    </span>
                  ) : (
                    <button
                      id={`apply-job-${job.id}`}
                      disabled={!unlocked || stats.activeJobId === job.id}
                      onClick={() => onApplyJob(job.id)}
                      className="cursor-pointer w-full text-center bg-zinc-900 border border-zinc-800 hover:bg-emerald-600 hover:text-black hover:border-emerald-600 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 text-zinc-300 font-bold text-xs py-1.5 px-3 rounded-lg transition-all"
                    >
                      {unlocked ? t.resubscribe : t.lockedSkill}
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
